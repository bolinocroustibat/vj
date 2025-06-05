# Use Python 3.13-alpine as base image
FROM python:3.13-alpine
# Copy latest uv binary from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Python environment variables:
# PYTHONDONTWRITEBYTECODE=1: Prevents Python from writing .pyc files (speeds up development and reduces container size)
# PYTHONUNBUFFERED=1: Prevents Python from buffering stdout/stderr (ensures log messages are output immediately)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy the project into the image
ADD . /app

# Set work directory and install dependencies in a new environment
WORKDIR /app
# Sync the project, asserting the lockfile is up to date
RUN uv sync --locked

# Document that the container listens on internal port 8000
EXPOSE 8000

# Run migrations, collect static files, and start the server
CMD uv run python manage.py migrate && \
    uv run python manage.py collectstatic --noinput && \
    exec uv run gunicorn vj_api.asgi:application -w 4 -k uvicorn.workers.UvicornWorker --bind "0.0.0.0:8000"
