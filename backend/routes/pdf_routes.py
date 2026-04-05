"""
pdf_routes.py - API route handlers for PDF operations

Endpoints:
- POST /upload  - Upload a PDF file
- POST /edit    - Edit text in the PDF
- GET  /download - Download the modified PDF
"""

from flask import Blueprint, request, jsonify, send_file
from services.pdf_service import PDFService

# Create blueprint for PDF routes
pdf_bp = Blueprint('pdf', __name__)

# Initialize PDF service (shared instance)
pdf_service = PDFService(upload_dir='uploads')


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

    # Basic validation
    if not isinstance(page, int) or page < 1:
        return jsonify({'error': 'Page must be a positive integer'}), 400

    if not old_text.strip():
        return jsonify({'error': 'old_text cannot be empty'}), 400

    if not new_text.strip():
        return jsonify({'error': 'new_text cannot be empty'}), 400

    try:
        result = pdf_service.edit_text(page, old_text, new_text, x, y)
        return jsonify(result), 200

    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Edit failed: {str(e)}'}), 500


@pdf_bp.route('/page_data/<int:page_num>', methods=['GET'])
def get_page_data(page_num):
    """
    Get image and text block data for a specific page.
    """
    try:
        result = pdf_service.get_page_data(page_num)
        return jsonify(result), 200
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
