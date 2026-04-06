"""
pdf_service.py - PDF processing service using PyMuPDF (fitz)

Handles all PDF manipulation operations:
- Opening and validating PDFs
- Locating text in specific regions
- Replacing text while preserving layout
- Saving modified PDFs
"""

import fitz  # PyMuPDF
import os


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

    def edit_text(self, page_num, old_text, new_text, x=None, y=None):
        """
        Replace text in the PDF.
        
        Strategy:
        1. Search for the old text on the specified page
        2. If found, redact (cover) the old text
        3. Insert new text at the same position
        
        Args:
            page_num: 1-based page number
            old_text: Text to find and replace
            new_text: Replacement text
            x: Optional x coordinate hint (PDF points)
            y: Optional y coordinate hint (PDF points)
            
        Returns:
            dict: Result with status and details
            
        Raises:
            FileNotFoundError: If no PDF is loaded
            ValueError: If text not found or page out of range
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

            # Search for the old text on the page
            text_instances = page.search_for(old_text)

            if not text_instances:
                raise ValueError(f"Text '{old_text}' not found on page {page_num}")

            # If coordinates are provided, find the closest match
            target_rect = text_instances[0]
            if x is not None and y is not None:
                min_dist = float('inf')
                for rect in text_instances:
                    # Calculate distance from the hint coordinates
                    # Note: PDF y-axis is bottom-up, but fitz uses top-down
                    dist = ((rect.x0 - x) ** 2 + (rect.y0 - y) ** 2) ** 0.5
                    if dist < min_dist:
                        min_dist = dist
                        target_rect = rect

            # Step 1: Apply redaction to cover old text
            # Create a redaction annotation over the found text area
            annot = page.add_redact_annot(
                target_rect,
                text="",       # Empty replacement for redaction
                fill=(1, 1, 1) # White fill to cover old text
            )
            page.apply_redactions()

            # Step 2: Insert new text at the same position
            # Determine font size based on the height of the original text area
            font_size = target_rect.height * 0.85  # Slightly smaller for padding
            if font_size < 6:
                font_size = 10  # Minimum readable font size

            # Insert text at the top-left corner of the original text area
            text_point = fitz.Point(target_rect.x0, target_rect.y1 - 2)

            page.insert_text(
                text_point,
                new_text,
                fontsize=font_size,
                fontname="helv",  # Helvetica - widely available
                color=(0, 0, 0),   # Black text
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
            
            import base64
            img_b64 = base64.b64encode(img_data).decode('utf-8')

            # 2. Extract text blocks with coordinates
            # "dict" format gives layout info: blocks -> lines -> spans -> bbox
            raw_dict = page.get_text("dict")
            
            text_blocks = []
            for block in raw_dict.get("blocks", []):
                if block.get("type") == 0:  # Text block
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            # Scale coordinates to match the image scale if necessary
                            # But usually bboxes are in points, and we want to keep them consistent
                            text_blocks.append({
                                "text": span["text"],
                                "bbox": span["bbox"],  # [x0, y0, x1, y1]
                                "size": span["size"],
                                "font": span["font"],
                                "color": span["color"]
                            })

            return {
                "image": f"data:image/png;base64,{img_b64}",
                "blocks": text_blocks,
                "width": page.rect.width,
                "height": page.rect.height,
                "image_width": pix.width,
                "image_height": pix.height,
                "page_count": doc.page_count
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
