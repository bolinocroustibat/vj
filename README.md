# Automatic Video Jockey API

Provides a random YouTube video ID according to an optional given theme, and store cached YouTube IDs in a DB for later usage without depleting the YouTube API quota.

This branch is using Django, Django Ninja and PostgreSQL. There is also a deprecated [branch using FastAPI and SQlite](https://github.com/bolinocroustibat/vj-api/tree/fastapi).

## Requirements

### For Docker Setup (Recommended)
- Docker Engine >= 24.0
- Docker Compose >= 2.0
- A YouTube API v3 key

### For Manual Development
If you prefer to develop without Docker, you'll need:
- Python >= 3.10
- PostgreSQL >= 17
- A modern Python package manager like [uv](https://docs.astral.sh/uv/)

## Docker Setup (Recommended)

The project includes Docker and Docker Compose configurations. To run with Docker:

1. Create a `.env` file in the root directory with the following variables:
```env
ENVIRONMENT=local

PORT=8000 # Optional: defaults to 8000 if not set

DJANGO_SECRET_KEY=your_django_secret_key_here

YOUTUBE_API_KEY=your_youtube_api_key_here

# Database settings
POSTGRES_DB=vj-api_django
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Allowed hosts and CORS
ALLOWED_HOSTS=127.0.0.1,localhost
# CORS settings:
# - For development: CORS_ORIGIN_ALLOW_ALL can be True
# - For production: CORS_ORIGIN_ALLOW_ALL should be False and CORS_ALLOWED_ORIGINS must list all allowed domains
CORS_ORIGIN_ALLOW_ALL=False  # Set to True only for development
# CORS_ALLOWED_ORIGINS: Add your frontend URLs here
# - http://localhost:8080 for local Vue.js development
CORS_ALLOWED_ORIGINS=http://localhost:8080
```

2. Build and start the containers:
```bash
docker compose up --build
```

The application will be available at:
- http://localhost:8000 (default port)
- http://localhost:8002 (if you set PORT=8002 in .env)

This will start both the Django application and PostgreSQL database. The setup includes:
- Persistent database storage using Docker volumes (`postgres_data`)
- Persistent static files storage (`static_volume`)
- Automatic database initialization and migrations
- PostgreSQL database accessible at `localhost:5433` with:
  - Username: postgres (or value of POSTGRES_USER in .env)
  - Password: postgres (or value of POSTGRES_PASSWORD in .env)
  - Database: vj-api_django (or value of POSTGRES_DB in .env)

To connect to the database:
```bash
# Using psql command line:
PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d vj-api_django

# Or using connection URL:
postgresql://postgres:postgres@localhost:5433/vj-api_django
```

To completely reset the database (WARNING: this will delete all data):
```bash
docker compose down -v  # The -v flag removes the volumes
```

## Manual Install

If you prefer to run the application without Docker:

1. Create a virtual environment and install the dependencies with [uv](https://docs.astral.sh/uv/):
```bash
uv sync
```

2. Run a PostgreSQL database instance:
```sh
docker run --name vj-api-db -e POSTGRES_USER=postgres -e POSTGRES_DB=vj-api_django -p 5432:5432 -d postgres
```

3. Create a `.env` file in the root directory with your configuration:
```env
ENVIRONMENT=local

PORT=8000 # Optional: defaults to 8000 if not set

DJANGO_SECRET_KEY=your_django_secret_key_here

YOUTUBE_API_KEY=your_youtube_api_key_here

# DEBUG should be set to False for production
DEBUG=False
LOGGING_LEVEL=INFO

# Database settings
POSTGRES_DB=vj-api_django
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Allowed hosts and CORS
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ORIGIN_ALLOW_ALL=False  # Set to True only for development
# CORS_ALLOWED_ORIGINS: Add your frontend URLs here
# - http://localhost:8080 for local Vue.js development
CORS_ALLOWED_ORIGINS=http://localhost:8080
```

4. Migrate the database:
```bash
uv run ./manage.py migrate
```

5. Create a superuser:
```bash
uv run ./manage.py createsuperuser
```

6. Collect the static files:
```bash
uv run ./manage.py collectstatic
```

7. Launch the Django web server:
```bash
uv run ./manage.py runserver
```

## Lint and format the code

Lint and format code with:
```bash
uv run ruff check --fix && ruff format
```

## Endpoints

- `/api/videos/`: Returns a random YouTube video
- `/api/videos/channel/{channelName}`: Returns a random video from the given channel
- `/api/videos/theme/{themeName}`: Returns a random video for the given theme
- `/api/videos/language/{languageCode}`: Returns a random video in the specified language
- `/api/videos/popular`: Returns a random video filtered by view count (optional min_views and max_views parameters)
- `/api/docs`: OpenAPI documentation and API info


## Admin

Access all the cached YouTube videos, themes and their previews on:
- `/api/admin/`


## Production Deployment with ASGI/Uvicorn

To run in production with ASGI using Uvicorn workers:

```sh
# Using default port 8000
gunicorn vj_api.asgi:application -k uvicorn.workers.UvicornWorker
```

For production, adjust the number of workers based on CPU cores. For example, with 20 cores:
```sh
# Using custom port 8002
PORT=8002 gunicorn vj_api.asgi:application -w 40 -k uvicorn.workers.UvicornWorker --bind "0.0.0.0:${PORT:-8000}"
```

To debug:
```sh
PORT=8002 gunicorn vj_api.asgi:application -k uvicorn.workers.UvicornWorker --bind "0.0.0.0:${PORT:-8000}" --log-level debug
```
