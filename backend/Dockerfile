FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

# Optimised gunicorn config for Render (single container):
#   --workers 2       : 2 sync workers (Render free tier has limited CPU)
#   --threads 4       : 4 threads per worker for I/O parallelism
#   --timeout 120     : generous timeout for large PDF operations
#   --keep-alive 5    : keep connections alive for faster subsequent requests
#   --preload         : load app once → shared memory, faster worker startup
CMD ["gunicorn", \
     "--bind", "0.0.0.0:5000", \
     "--workers", "2", \
     "--threads", "4", \
     "--timeout", "120", \
     "--keep-alive", "5", \
     "--preload", \
     "app:create_app()"]
