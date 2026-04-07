"""
pdf_service.py - PDF processing service using PyMuPDF (fitz)

Handles all PDF manipulation operations:
- Opening and validating PDFs
- Locating text in specific regions
- Replacing text while preserving original formatting (font, size, color, flags)
- Saving modified PDFs
"""

import fitz  # PyMuPDF
import os
import base64

# ────────────────────────────────────────────────────────────────────
# Font Mapping — maps common PDF fonts to PyMuPDF base14 equivalents
# ────────────────────────────────────────────────────────────────────
_FONT_MAP = {
    # Helvetica family
    "helvetica":        "helv",
    "arial":            "helv",
    "arialmt":          "helv",
    "arial-boldmt":     "hebo",
    "arial-italicmt":   "heit",
    "arial-bolditalicmt": "hebi",
    "helvetica-bold":   "hebo",
    "helvetica-oblique": "heit",
    "helvetica-boldoblique": "hebi",
    # Times family
    "times":            "tiro",
    "timesnewroman":    "tiro",
    "timesnewromanpsmt":"tiro",
    "timesnewromanps-boldmt": "tibo",
    "timesnewromanps-italicmt": "tiit",
    "timesnewromanps-bolditalicmt": "tibi",
    "times-roman":      "tiro",
    "times-bold":       "tibo",
    "times-italic":     "tiit",
    "times-bolditalic": "tibi",
    # Courier family
    "courier":          "cour",
    "couriernew":       "cour",
    "couriernewpsmt":   "cour",
    "courier-bold":     "cobo",
    "courier-oblique":  "coit",
    "courier-boldoblique": "cobi",
    # Symbol / ZapfDingbats
    "symbol":           "symb",
    "zapfdingbats":     "zadb",
}

# Base14 font names recognised by PyMuPDF
_BASE14 = {
    "helv", "hebo", "heit", "hebi",
    "tiro", "tibo", "tiit", "tibi",
    "cour", "cobo", "coit", "cobi",
    "symb", "zadb",
}


def _resolve_fontname(pdf_font_name: str, is_bold: bool = False, is_italic: bool = False) -> str:
    """
    Map an arbitrary PDF font name to the closest PyMuPDF base14 font.
    Falls back to Helvetica variants if nothing better is found.
    """
    if not pdf_font_name:
        return "helv"

    # Normalise: lowercase, strip spaces, remove common prefixes
    key = pdf_font_name.lower().replace(" ", "").replace("-", "")
    # Strip common subset prefixes like "ABCDEF+"
    if "+" in key:
        key = key.split("+", 1)[1]

    # Direct lookup
    if key in _FONT_MAP:
        return _FONT_MAP[key]

    # Already a base14 identifier?
    if key in _BASE14:
        return key

    # Heuristic: detect family from the name
    base = "helv"  # default fallback
    if any(s in key for s in ("times", "tiro", "serif", "roman", "garamond", "georgia", "cambria")):
        base = "tiro"
    elif any(s in key for s in ("courier", "cour", "mono", "consol", "menlo", "fira")):
        base = "cour"

    # Apply bold/italic variant
    if base == "helv":
        if is_bold and is_italic:
            return "hebi"
        if is_bold:
            return "hebo"
        if is_italic:
            return "heit"
        return "helv"
    elif base == "tiro":
        if is_bold and is_italic:
            return "tibi"
        if is_bold:
            return "tibo"
        if is_italic:
            return "tiit"
        return "tiro"
    elif base == "cour":
        if is_bold and is_italic:
            return "cobi"
        if is_bold:
            return "cobo"
        if is_italic:
            return "coit"
        return "cour"

    return "helv"


def _int_color_to_rgb(color_int: int) -> tuple:
    """
    Convert a PyMuPDF integer colour (0xRRGGBB) to an (r, g, b) tuple
    with values in [0, 1] suitable for insert_text().
    """
    if color_int is None or color_int == 0:
        return (0, 0, 0)

    r = ((color_int >> 16) & 0xFF) / 255.0
    g = ((color_int >> 8) & 0xFF) / 255.0
    b = (color_int & 0xFF) / 255.0
    return (r, g, b)


class PDFService:
    """Service class for PDF text editing operations."""

    def __init__(self, upload_dir='uploads'):
        """
        Initialize the PDF service.

        Args:
            upload_dir: Directory to store uploaded and modified PDFs
        """
        self.upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)
        self._current_file = None

    @property
    def current_file_path(self):
        """Get the path to the currently loaded PDF."""
        if self._current_file:
            return os.path.join(self.upload_dir, self._current_file)
        return None

    def save_upload(self, file_storage):
        """
        Save an uploaded PDF file.

        Args:
            file_storage: Flask FileStorage object

        Returns:
            str: Filename of saved file

        Raises:
            ValueError: If file is not a valid PDF
        """
        filename = 'current.pdf'
        filepath = os.path.join(self.upload_dir, filename)

        # Save the file
        file_storage.save(filepath)

        # Validate it's a valid PDF
        try:
            doc = fitz.open(filepath)
            page_count = doc.page_count
            doc.close()

            if page_count == 0:
                os.remove(filepath)
                raise ValueError("PDF has no pages")

        except fitz.FileDataError:
            os.remove(filepath)
            raise ValueError("Invalid PDF file")

        self._current_file = filename
        return filename

    # ── helpers ────────────────────────────────────────────────────

    @staticmethod
    def _detect_background_color(page, target_rect):
        """
        Detect the background color behind a text area by rendering the page
        and sampling pixels at several points around the text rect edges.

        Returns an (r, g, b) tuple with values in [0, 1].
        """
        try:
            # Render at 1x scale (points == pixels)
            pix = page.get_pixmap(matrix=fitz.Identity)

            # Collect sample points around the edges of the rect
            # We sample just outside and at the corners to avoid sampling the text itself
            samples = []
            rect = target_rect

            # Sample points: corners, midpoints of edges, and a few pixels
            # OUTSIDE the text area to catch the true background
            offsets = [
                # Just outside the rect edges (1-2 px away from text)
                (rect.x0 - 2, rect.y0 + rect.height / 2),  # left edge outside
                (rect.x1 + 2, rect.y0 + rect.height / 2),  # right edge outside
                (rect.x0 + rect.width / 2, rect.y0 - 2),   # top edge outside
                (rect.x0 + rect.width / 2, rect.y1 + 2),   # bottom edge outside
                # Corners just outside
                (rect.x0 - 1, rect.y0 - 1),
                (rect.x1 + 1, rect.y0 - 1),
                (rect.x0 - 1, rect.y1 + 1),
                (rect.x1 + 1, rect.y1 + 1),
                # Inside rect but at very edges (often background visible)
                (rect.x0 + 1, rect.y0 + 1),
                (rect.x1 - 1, rect.y0 + 1),
                (rect.x0 + 1, rect.y1 - 1),
                (rect.x1 - 1, rect.y1 - 1),
            ]

            for px, py in offsets:
                # Clamp to pixmap bounds
                ix = max(0, min(int(px), pix.width - 1))
                iy = max(0, min(int(py), pix.height - 1))
                pixel = pix.pixel(ix, iy)  # returns (r, g, b) or (r, g, b, a)
                samples.append(pixel[:3])  # take only RGB

            if not samples:
                return (1, 1, 1)  # fallback to white

            # Find the most common color among samples
            # (this filters out text pixels that might have been sampled)
            from collections import Counter
            color_counts = Counter(samples)
            most_common_rgb = color_counts.most_common(1)[0][0]

            # Convert 0-255 to 0-1 range
            return (
                most_common_rgb[0] / 255.0,
                most_common_rgb[1] / 255.0,
                most_common_rgb[2] / 255.0,
            )

        except Exception:
            # If anything fails, fall back to white
            return (1, 1, 1)

    @staticmethod
    def _extract_span_properties(page, target_rect, old_text):
        """
        Walk through the page's text dict and find the span(s)
        that match `old_text` inside `target_rect`.

        Returns a dict of formatting properties:
            { font, size, color, flags, ascender, descender }
        or sensible defaults when a match cannot be found.
        """
        defaults = {
            "font": "helv",
            "size": 12,
            "color": (0, 0, 0),
            "flags": 0,
        }

        raw = page.get_text("dict")
        best_match = None
        best_overlap = 0

        for block in raw.get("blocks", []):
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    span_rect = fitz.Rect(span["bbox"])
                    overlap = abs(span_rect & target_rect)  # intersection area
                    # Also check text content overlap
                    text_match = (
                        span["text"].strip() == old_text.strip()
                        or old_text.strip() in span["text"].strip()
                        or span["text"].strip() in old_text.strip()
                    )
                    score = overlap + (1000 if text_match else 0)
                    if score > best_overlap:
                        best_overlap = score
                        best_match = span

        if best_match is None:
            return defaults

        flags = best_match.get("flags", 0)
        is_bold = bool(flags & (1 << 4))     # bit 4 = bold
        is_italic = bool(flags & (1 << 1))   # bit 1 = italic

        return {
            "font": _resolve_fontname(best_match.get("font", ""), is_bold, is_italic),
            "size": best_match.get("size", 12),
            "color": _int_color_to_rgb(best_match.get("color", 0)),
            "flags": flags,
        }

    # ── main edit method ──────────────────────────────────────────

    def edit_text(self, page_num, old_text, new_text,
                  x=None, y=None,
                  hint_font=None, hint_size=None, hint_color=None):
        """
        Replace text in the PDF **while preserving original formatting**.

        Strategy:
        1. Extract original text properties (font, size, colour) from the
           page's internal text dictionary *before* any modification.
        2. Redact (white-fill) the area occupied by the old text.
        3. Insert new text at the same position using the original properties.

        Args:
            page_num:   1-based page number
            old_text:   Text to find and replace
            new_text:   Replacement text
            x, y:       Optional coordinate hints (PDF points)
            hint_font:  Optional font name hint from frontend
            hint_size:  Optional font size hint from frontend
            hint_color: Optional colour int hint from frontend

        Returns:
            dict: Result with status and details

        Raises:
            FileNotFoundError: If no PDF is loaded
            ValueError:        If text not found or page out of range
        """
        filepath = self.current_file_path
        if not filepath or not os.path.exists(filepath):
            raise FileNotFoundError("No PDF file loaded")

        doc = fitz.open(filepath)

        try:
            # Validate page number (convert to 0-based)
            page_index = page_num - 1
            if page_index < 0 or page_index >= doc.page_count:
                raise ValueError(f"Page {page_num} out of range (1-{doc.page_count})")

            page = doc[page_index]

            # ── Search for the old text ──────────────────────────
            text_instances = page.search_for(old_text)

            if not text_instances:
                raise ValueError(f"Text '{old_text}' not found on page {page_num}")

            # If coordinates provided, pick the closest match
            target_rect = text_instances[0]
            if x is not None and y is not None:
                min_dist = float('inf')
                for rect in text_instances:
                    dist = ((rect.x0 - x) ** 2 + (rect.y0 - y) ** 2) ** 0.5
                    if dist < min_dist:
                        min_dist = dist
                        target_rect = rect

            # ── Step 1: Extract original formatting BEFORE redacting ─
            props = self._extract_span_properties(page, target_rect, old_text)

            # Allow frontend hints to override if provided
            if hint_size is not None:
                props["size"] = float(hint_size)
            if hint_color is not None:
                props["color"] = _int_color_to_rgb(int(hint_color))
            if hint_font is not None:
                is_bold = bool(props["flags"] & (1 << 4))
                is_italic = bool(props["flags"] & (1 << 1))
                props["font"] = _resolve_fontname(hint_font, is_bold, is_italic)

            # ── Step 2: Detect background color & redact ─────────
            bg_color = self._detect_background_color(page, target_rect)

            page.add_redact_annot(
                target_rect,
                text="",
                fill=bg_color,  # Match actual background color
            )
            page.apply_redactions()

            # ── Step 3: Insert new text with original properties ─
            font_size = props["size"]
            fontname = props["font"]
            color = props["color"]

            # Insertion point: left-aligned, baseline at bottom of rect
            # (fitz.Point y = baseline, so we nudge up slightly from y1)
            text_point = fitz.Point(
                target_rect.x0,
                target_rect.y1 - (target_rect.height - font_size) / 2 - 1
            )

            page.insert_text(
                text_point,
                new_text,
                fontsize=font_size,
                fontname=fontname,
                color=color,
            )

            # Save the modified PDF
            doc.save(filepath, incremental=True, encryption=fitz.PDF_ENCRYPT_KEEP)

            return {
                'status': 'success',
                'page': page_num,
                'old_text': old_text,
                'new_text': new_text,
                'position': {
                    'x': target_rect.x0,
                    'y': target_rect.y0,
                    'width': target_rect.width,
                    'height': target_rect.height,
                },
                'applied_formatting': {
                    'font': fontname,
                    'size': font_size,
                    'color': list(color),
                },
            }

        finally:
            doc.close()

    def get_page_data(self, page_num):
        """
        Get image and text data for a specific page.

        Args:
            page_num: 1-based page number

        Returns:
            dict: { image_base64, text_blocks, width, height }
        """
        filepath = self.current_file_path
        if not filepath or not os.path.exists(filepath):
            raise FileNotFoundError("No PDF file loaded")

        doc = fitz.open(filepath)
        try:
            page_index = page_num - 1
            if page_index < 0 or page_index >= doc.page_count:
                raise ValueError(f"Page {page_num} out of range")

            page = doc[page_index]

            # 1. Render page to image (high quality for clarity)
            zoom = 1.5  # Scale up for better resolution
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")

            img_b64 = base64.b64encode(img_data).decode('utf-8')

            # 2. Extract text blocks with full formatting metadata
            raw_dict = page.get_text("dict")

            text_blocks = []
            for block in raw_dict.get("blocks", []):
                if block.get("type") == 0:  # Text block
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            text_blocks.append({
                                "text": span["text"],
                                "bbox": span["bbox"],    # [x0, y0, x1, y1]
                                "size": span["size"],
                                "font": span["font"],
                                "color": span["color"],
                                "flags": span.get("flags", 0),
                            })

            return {
                "image": f"data:image/png;base64,{img_b64}",
                "blocks": text_blocks,
                "width": page.rect.width,
                "height": page.rect.height,
                "image_width": pix.width,
                "image_height": pix.height,
                "page_count": doc.page_count,
            }

        finally:
            doc.close()

    def get_download_path(self):
        """
        Get the path to the current (possibly modified) PDF.

        Returns:
            str: Absolute path to the PDF file

        Raises:
            FileNotFoundError: If no PDF is loaded
        """
        filepath = self.current_file_path
        if not filepath or not os.path.exists(filepath):
            raise FileNotFoundError("No PDF file available for download")
        return os.path.abspath(filepath)
