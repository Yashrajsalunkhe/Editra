"""
cache_service.py - Redis caching layer for PDF page rendering

Caches rendered page images and extracted text blocks to avoid
expensive re-renders on every page view. Falls back gracefully
to no-cache when Redis is unavailable.
"""

import redis
import json
import hashlib
import os
import logging

logger = logging.getLogger(__name__)


class CacheService:
    """
    Redis-backed cache for PDF page data.

    Keys:
        page_img:{file_hash}:{page}    → base64 image string
        page_blocks:{file_hash}:{page} → JSON text blocks
        page_meta:{file_hash}:{page}   → JSON metadata (width, height, etc.)

    Falls back to an in-memory LRU dict when Redis is not available.
    """

    DEFAULT_TTL = 1800  # 30 minutes

    def __init__(self, redis_url=None):
        self._redis = None
        self._memory_cache = {}  # fallback LRU-ish dict
        self._max_memory_items = 20  # keep at most 20 pages in memory

        redis_url = redis_url or os.environ.get("REDIS_URL")
        if redis_url:
            try:
                self._redis = redis.from_url(
                    redis_url,
                    decode_responses=True,
                    socket_connect_timeout=3,
                    socket_timeout=3,
                    retry_on_timeout=True,
                )
                # Test connection
                self._redis.ping()
                logger.info("✅ Redis connected: %s", redis_url)
            except Exception as e:
                logger.warning("⚠️  Redis unavailable (%s), using in-memory cache", e)
                self._redis = None
        else:
            logger.info("ℹ️  No REDIS_URL set, using in-memory cache")

    @property
    def is_redis(self):
        return self._redis is not None

    # ── File hashing ──────────────────────────────────────────────

    @staticmethod
    def file_hash(filepath: str) -> str:
        """
        Fast hash of a file using size + mtime + first 4KB.
        Much faster than hashing the whole file.
        """
        stat = os.stat(filepath)
        hasher = hashlib.md5()
        hasher.update(f"{stat.st_size}:{stat.st_mtime_ns}".encode())
        with open(filepath, "rb") as f:
            hasher.update(f.read(4096))
        return hasher.hexdigest()[:12]

    # ── Key builders ──────────────────────────────────────────────

    @staticmethod
    def _key(prefix: str, file_hash: str, page: int) -> str:
        return f"{prefix}:{file_hash}:{page}"

    # ── GET / SET ─────────────────────────────────────────────────

    def get_page_cache(self, file_hash: str, page: int):
        """
        Retrieve cached page data.
        Returns (image_b64, blocks_list, meta_dict) or (None, None, None).
        """
        img_key = self._key("page_img", file_hash, page)
        blk_key = self._key("page_blocks", file_hash, page)
        meta_key = self._key("page_meta", file_hash, page)

        if self._redis:
            try:
                pipe = self._redis.pipeline()
                pipe.get(img_key)
                pipe.get(blk_key)
                pipe.get(meta_key)
                img, blk, meta = pipe.execute()

                if img and blk and meta:
                    return img, json.loads(blk), json.loads(meta)
            except Exception as e:
                logger.warning("Redis GET failed: %s", e)
        else:
            # In-memory fallback
            cache_key = f"{file_hash}:{page}"
            cached = self._memory_cache.get(cache_key)
            if cached:
                return cached["img"], cached["blocks"], cached["meta"]

        return None, None, None

    def set_page_cache(self, file_hash: str, page: int,
                       image_b64: str, blocks: list, meta: dict,
                       ttl: int = None):
        """Store page data in cache."""
        ttl = ttl or self.DEFAULT_TTL
        img_key = self._key("page_img", file_hash, page)
        blk_key = self._key("page_blocks", file_hash, page)
        meta_key = self._key("page_meta", file_hash, page)

        if self._redis:
            try:
                pipe = self._redis.pipeline()
                pipe.setex(img_key, ttl, image_b64)
                pipe.setex(blk_key, ttl, json.dumps(blocks))
                pipe.setex(meta_key, ttl, json.dumps(meta))
                pipe.execute()
            except Exception as e:
                logger.warning("Redis SET failed: %s", e)
        else:
            # In-memory fallback
            cache_key = f"{file_hash}:{page}"
            # Evict oldest if full
            if len(self._memory_cache) >= self._max_memory_items:
                oldest_key = next(iter(self._memory_cache))
                del self._memory_cache[oldest_key]
            self._memory_cache[cache_key] = {
                "img": image_b64, "blocks": blocks, "meta": meta,
            }

    # ── Invalidation ──────────────────────────────────────────────

    def invalidate_page(self, file_hash: str, page: int):
        """Invalidate cache for a specific page (after edit/undo/redo)."""
        if self._redis:
            try:
                keys = [
                    self._key("page_img", file_hash, page),
                    self._key("page_blocks", file_hash, page),
                    self._key("page_meta", file_hash, page),
                ]
                self._redis.delete(*keys)
            except Exception as e:
                logger.warning("Redis DEL failed: %s", e)
        else:
            cache_key = f"{file_hash}:{page}"
            self._memory_cache.pop(cache_key, None)

    def invalidate_all(self, file_hash: str = None):
        """
        Invalidate all cached pages.
        If file_hash is provided, only that file's pages are cleared.
        """
        if self._redis:
            try:
                if file_hash:
                    # Scan for matching keys
                    for prefix in ("page_img", "page_blocks", "page_meta"):
                        pattern = f"{prefix}:{file_hash}:*"
                        cursor = 0
                        while True:
                            cursor, keys = self._redis.scan(
                                cursor, match=pattern, count=100
                            )
                            if keys:
                                self._redis.delete(*keys)
                            if cursor == 0:
                                break
                else:
                    # Nuclear option: flush all page keys
                    for prefix in ("page_img", "page_blocks", "page_meta"):
                        pattern = f"{prefix}:*"
                        cursor = 0
                        while True:
                            cursor, keys = self._redis.scan(
                                cursor, match=pattern, count=100
                            )
                            if keys:
                                self._redis.delete(*keys)
                            if cursor == 0:
                                break
            except Exception as e:
                logger.warning("Redis invalidate_all failed: %s", e)
        else:
            if file_hash:
                keys_to_del = [k for k in self._memory_cache if k.startswith(file_hash)]
                for k in keys_to_del:
                    del self._memory_cache[k]
            else:
                self._memory_cache.clear()

    def health(self) -> dict:
        """Return cache health info."""
        if self._redis:
            try:
                info = self._redis.info("memory")
                return {
                    "type": "redis",
                    "status": "connected",
                    "memory_used": info.get("used_memory_human", "unknown"),
                }
            except Exception:
                return {"type": "redis", "status": "disconnected"}
        else:
            return {
                "type": "memory",
                "status": "active",
                "items": len(self._memory_cache),
            }
