"""
app.py - Flask Application Entry Point

Configures and runs the Flask server for the PDF Editor backend.
Provides REST API endpoints for:
- PDF file upload
- Text editing via PyMuPDF
- Modified PDF download
- Page rendering with caching

CORS is enabled for development with the React frontend.
Redis caching is used when REDIS_URL is set (falls back to in-memory).
"""

from flask import Flask, jsonify
from flask_cors import CORS
from routes.pdf_routes import pdf_bp
from services.cache_service import CacheService
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── Shared cache instance ────────────────────────────────────────
# Created once at module level so all workers share the same
# connection to Redis (or the same in-memory dict for single-worker).
_cache = CacheService(redis_url=os.environ.get("REDIS_URL"))


def create_app():
    """
    Application factory function.
    Creates and configures the Flask application.
    """
    app = Flask(__name__)

    # Configuration
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max upload
    app.config['UPLOAD_FOLDER'] = 'uploads'

    # ── CORS ──────────────────────────────────────────────────
    # Allow all origins for deployment flexibility
    allowed_origins = os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    CORS(app, origins=allowed_origins)

    # ── Response compression ──────────────────────────────────
    # gzip JSON and image responses (huge win for base64 payloads)
    try:
        from flask_compress import Compress
        Compress(app)
        logger.info("✅ Response compression enabled")
    except ImportError:
        logger.info("ℹ️  flask-compress not installed, skipping compression")

    # ── Inject cache into blueprint ──────────────────────────
    app.config['CACHE_SERVICE'] = _cache

    # Register route blueprints
    app.register_blueprint(pdf_bp)

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Health check endpoint (includes cache status)
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'ok',
            'service': 'Editra PDF Editor API',
            'cache': _cache.health(),
        })

    return app


if __name__ == '__main__':
    app = create_app()
    print("\n🚀 Editra PDF Editor Backend")
    print(f"   Cache: {_cache.health()}")
    print("   Running on: http://localhost:5000")
    print("   Endpoints:")
    print("     POST /upload   - Upload PDF")
    print("     POST /edit     - Edit text")
    print("     GET  /download - Download PDF")
    print("     GET  /health   - Health check\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
