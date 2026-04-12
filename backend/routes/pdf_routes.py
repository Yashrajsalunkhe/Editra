"""
pdf_routes.py - API route handlers for PDF operations

Endpoints:
- POST /upload   - Upload a PDF file
- POST /edit     - Edit text in the PDF
- POST /undo     - Undo the last edit
- POST /redo     - Redo an undone edit
- GET  /history  - Get undo/redo state
- GET  /download - Download the modified PDF
"""

from flask import Blueprint, request, jsonify, send_file, current_app
from services.pdf_service import PDFService

# Create blueprint for PDF routes
pdf_bp = Blueprint('pdf', __name__)

# ── Lazy-init PDF service (needs app context for cache) ──────────
_pdf_service = None


def _get_service() -> PDFService:
    """
    Get or create the PDFService singleton,
    injecting the shared CacheService from the app config.
    """
    global _pdf_service
    if _pdf_service is None:
        cache = current_app.config.get('CACHE_SERVICE')
        _pdf_service = PDFService(upload_dir='uploads', cache=cache)
    return _pdf_service


@pdf_bp.route('/upload', methods=['POST'])
def upload_pdf():
    """
    Upload a PDF file for editing.
    
    Expects: multipart/form-data with 'file' field containing a PDF
    
    Returns:
        201: { message, filename }
        400: { error } if validation fails
    """
    # Check if file is in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    # Check if a file was actually selected
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Validate file extension
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are accepted'}), 400

    try:
        pdf_service = _get_service()
        filename = pdf_service.save_upload(file)
        return jsonify({
            'message': 'PDF uploaded successfully',
            'filename': filename,
        }), 201

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500


@pdf_bp.route('/edit', methods=['POST'])
def edit_pdf():
    """
    Edit text in the uploaded PDF.
    
    Expects JSON body:
    {
        "page": int,       - 1-based page number
        "old_text": str,   - Text to find and replace
        "new_text": str,   - Replacement text
        "x": float,        - Optional x coordinate
        "y": float         - Optional y coordinate
    }
    
    Returns:
        200: { status, details }
        400: { error } if validation fails
        404: { error } if no PDF loaded
    """
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body must be JSON'}), 400

    # Validate required fields
    required = ['page', 'old_text', 'new_text']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    page = data['page']
    old_text = data['old_text']
    new_text = data['new_text']
    x = data.get('x')
    y = data.get('y')

    # Optional formatting hints from the frontend
    hint_font = data.get('hint_font')
    hint_size = data.get('hint_size')
    hint_color = data.get('hint_color')

    # Basic validation
    if not isinstance(page, int) or page < 1:
        return jsonify({'error': 'Page must be a positive integer'}), 400

    if not old_text.strip():
        return jsonify({'error': 'old_text cannot be empty'}), 400

    if not new_text.strip():
        return jsonify({'error': 'new_text cannot be empty'}), 400

    try:
        pdf_service = _get_service()
        result = pdf_service.edit_text(
            page, old_text, new_text, x, y,
            hint_font=hint_font,
            hint_size=hint_size,
            hint_color=hint_color,
        )
        # Include undo/redo state in the response
        result.update(pdf_service.get_history_status())
        return jsonify(result), 200

    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Edit failed: {str(e)}'}), 500


@pdf_bp.route('/undo', methods=['POST'])
def undo():
    """
    Undo the last edit.

    Returns:
        200: { status, can_undo, can_redo }
        400: { error } if nothing to undo
        404: { error } if no PDF loaded
    """
    try:
        pdf_service = _get_service()
        result = pdf_service.undo()
        return jsonify(result), 200
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Undo failed: {str(e)}'}), 500


@pdf_bp.route('/redo', methods=['POST'])
def redo():
    """
    Redo a previously undone edit.

    Returns:
        200: { status, can_undo, can_redo }
        400: { error } if nothing to redo
        404: { error } if no PDF loaded
    """
    try:
        pdf_service = _get_service()
        result = pdf_service.redo()
        return jsonify(result), 200
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Redo failed: {str(e)}'}), 500


@pdf_bp.route('/history', methods=['GET'])
def history_status():
    """
    Get the current undo/redo state.

    Returns:
        200: { can_undo, can_redo, history_position, history_size }
    """
    try:
        pdf_service = _get_service()
        result = pdf_service.get_history_status()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@pdf_bp.route('/page_data/<int:page_num>', methods=['GET'])
def get_page_data(page_num):
    """
    Get image and text block data for a specific page.
    Cache headers are set for browser-side caching.
    """
    try:
        pdf_service = _get_service()
        result = pdf_service.get_page_data(page_num)

        response = jsonify(result)
        # Allow browser to cache for 60s (page will be
        # re-fetched via timestamp query param after edits)
        response.headers['Cache-Control'] = 'private, max-age=60'
        return response, 200

    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to load page data: {str(e)}'}), 500


@pdf_bp.route('/download', methods=['GET'])
def download_pdf():
    """
    Download the current (possibly modified) PDF.
    
    Returns:
        200: PDF file attachment
        404: { error } if no PDF available
    """
    try:
        pdf_service = _get_service()
        filepath = pdf_service.get_download_path()
        return send_file(
            filepath,
            mimetype='application/pdf',
            as_attachment=False,  # Allow inline display for re-rendering
            download_name='edited.pdf',
        )

    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': f'Download failed: {str(e)}'}), 500
