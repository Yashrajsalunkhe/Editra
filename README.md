# Editra

Editra is a full-stack PDF editing web app that allows users to upload PDFs, edit text in-place, preview page rendering, use undo/redo history, and download the modified file.

## Project Overview

Editra is designed for practical PDF text editing with a simple browser UI and a backend optimized for real-world workloads.
It combines a React + Vite frontend with a Flask + PyMuPDF backend and supports Redis-backed caching for faster page rendering.

The repository is production-ready with:

- Docker and Docker Compose support
- Render image-based deployment flow
- Kubernetes manifests for cluster deployment

## Features

- Upload PDF files (up to 50MB)
- Replace text on a specific page
- Maintain original formatting hints during edits
- Interactive page previews and text block extraction
- Undo and redo edit history
- Download edited PDF
- API response compression via Flask-Compress
- Page render caching via Redis (with memory fallback)

## Tech Stack

- Frontend: React, Vite, Nginx
- Backend: Flask, Gunicorn, PyMuPDF
- Cache: Redis (optional, recommended)
- Containers: Docker, Docker Compose
- Orchestration: Kubernetes
- Deployment: Render

## Repository Structure

- backend: Flask API, PDF service, cache service
- frontend: React app, Nginx reverse proxy template
- k8s: Kubernetes deployments and services
- docker-compose.yml: local multi-service environment

## Architecture

1. User uploads a PDF from the frontend.
2. Frontend sends requests to /api/*.
3. Nginx proxies /api/* to the backend service URL.
4. Flask routes handle upload/edit/history/download.
5. PyMuPDF performs text and page operations.
6. Redis (or in-memory fallback) caches page render payloads.

## Local Development

### Prerequisites

- Docker
- Docker Compose

### Run Locally

```bash
docker compose up --build
```

### Local URLs

- Frontend: http://localhost:8080
- Backend: http://localhost:5000
- Redis: redis://localhost:6379

## Environment Variables

### Backend

- REDIS_URL: Redis connection string
- CORS_ORIGINS: Comma-separated allowed origins

### Frontend

- BACKEND_URL: Backend base URL used by Nginx template

Notes:

- In Docker Compose, BACKEND_URL is set to http://backend:5000.
- In image-only deployments (for example Render), frontend image defaults to https://editra-backend.onrender.com.

## API Endpoints

- POST /upload: Upload PDF (multipart field: file)
- POST /edit: Edit text in PDF
- POST /undo: Undo last edit
- POST /redo: Redo last undone edit
- GET /history: Undo/redo state
- GET /page_data/<page_num>: Page image + text data
- GET /download: Download current edited PDF
- GET /health: Service and cache health

## Deployment

### Docker Hub + Render (Image-Based)

Example flow per service:

```bash
docker build -t <dockerhub-user>/<image>:latest <context>
docker push <dockerhub-user>/<image>:latest
render deploys create <render-service-id> --wait --confirm -o text
```

### Kubernetes

Manifests are available under k8s including:

- namespace
- backend deployment, service, pvc
- frontend deployment, service, nginx config map

For full cluster setup steps, see k8s/README.md.

## Performance Notes

- Gunicorn is configured for multi-worker and threaded execution.
- Nginx is configured with timeouts and proxy buffering for larger payloads.
- Redis cache reduces repeated page rendering cost.

## Troubleshooting

- 502 from frontend /api routes:
	Ensure BACKEND_URL is correct in frontend environment and redeploy frontend image.
- Upload issues:
	Verify file is a valid PDF and under MAX_CONTENT_LENGTH (50MB).
- Cache connection issues:
	If REDIS_URL is unavailable, backend automatically falls back to in-memory cache.

## License

No license file is currently defined in this repository.
