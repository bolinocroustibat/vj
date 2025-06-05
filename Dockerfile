# Use Python 3.13-alpine as base image
FROM python:3.13-alpine

# Copy latest uv binary from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Python environment variables:
# PYTHONDONTWRITEBYTECODE=1: Prevents Python from writing .pyc files (speeds up development and reduces container size)
# PYTHONUNBUFFERED=1: Prevents Python from buffering stdout/stderr (ensures log messages are output immediately)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    musl-locales \
    musl-locales-lang \
    && rm -rf /var/cache/apk/*

# Copy the project into the image
ADD . /app

# Set work directory and install dependencies in a new environment
WORKDIR /app
# Sync the project, asserting the lockfile is up to date
RUN uv sync --locked

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Document that the container listens on internal port 8000
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["./entrypoint.sh"]
