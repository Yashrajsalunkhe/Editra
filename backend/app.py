"""
app.py - Flask Application Entry Point

Configures and runs the Flask server for the PDF Editor backend.
Provides REST API endpoints for:
- PDF file upload
- Text editing via PyMuPDF
- Modified PDF download

CORS is enabled for development with the React frontend.
"""

from flask import Flask
from flask_cors import CORS
from routes.pdf_routes import pdf_bp
import os


def create_app():
    """
    Application factory function.
    Creates and configures the Flask application.
    """
    app = Flask(__name__)

    # Configuration
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max upload
    app.config['UPLOAD_FOLDER'] = 'uploads'

    # Enable CORS for frontend dev server
    CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])

    # Register route blueprints
    app.register_blueprint(pdf_bp)

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return {'status': 'ok', 'service': 'Editra PDF Editor API'}

    return app


if __name__ == '__main__':
    app = create_app()
    print("\n🚀 Editra PDF Editor Backend")
    print("   Running on: http://localhost:5000")
    print("   Endpoints:")
    print("     POST /upload   - Upload PDF")
    print("     POST /edit     - Edit text")
    print("     GET  /download - Download PDF\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
