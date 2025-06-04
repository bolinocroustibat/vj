#!/bin/sh

# Wait for database to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
    sleep 0.1
done
echo "PostgreSQL started"

# Run migrations
echo "Running migrations..."
uv run python manage.py migrate

# Collect static files
echo "Collecting static files..."
uv run python manage.py collectstatic --noinput

# Start server
echo "Starting server..."
exec uv run gunicorn vj_api.asgi:application -w 4 -k uvicorn.workers.UvicornWorker --bind "0.0.0.0:${PORT:-8000}"
