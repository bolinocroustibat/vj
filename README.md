# Automatic Video Jockey

A Video Jockey (VJ) system consisting of a backend API that provides random YouTube videos by theme without depleting the YouTube API quota, and a frontend webapp that automatically mix videos on beat detection, with some style effects.

[**Backend API**](#api): Provides a random YouTube video ID according to an optional given theme, and stores cached YouTube IDs in a database for later usage without depleting the YouTube API quota.

[**Frontend**](#frontend): A stylized random Video Jockey webapp playing randomly selected YouTube video clips with automatic smooth transitions between them. Features microphone-based beat detection for enhanced video switching control.

This branch is using Django, Django Ninja and PostgreSQL. There is also a deprecated [branch using FastAPI and SQlite](https://github.com/bolinocroustibat/vj-api/tree/fastapi).

## API

### Run with Docker (recommended)

#### Requirements

- A YouTube API v3 key
- Docker Engine >= 24.0
- Docker Compose >= 2.0

#### Setup

The project includes Docker and Docker Compose configurations. To run with Docker:

1. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your configuration values, especially `YOUTUBE_API_KEY`

**Note**: CORS and host settings have sensible defaults for Docker environments. You only need to configure them if you have specific requirements.

3. Build and start the containers:
```bash
docker compose up --build
```

The application will be available at:
- Backend API: http://localhost:8000 (default Django port)
- Frontend: http://localhost:4173 (default Vite port)
- Database: localhost:5432 (default PostgreSQL port)

This will start both the Django application, PostgreSQL database, and the frontend application. The setup includes:
- Persistent database storage using Docker volumes (`postgres_data`)
- Persistent static files storage (`static_volume`)
- Automatic database initialization and migrations
- Frontend automatically configured to communicate with the backend API via Docker internal networking
- PostgreSQL database accessible at `localhost:${DB_PORT}` (defaults to 5432) with:
  - Username: postgres (or value of POSTGRES_USER in .env)
  - Password: postgres (or value of POSTGRES_PASSWORD in .env)
  - Database: vj-api_django (or value of POSTGRES_DB in .env)

To connect to the database:
```bash
# Using psql command line:
PGPASSWORD=postgres psql -h localhost -p ${DB_PORT:-5432} -U postgres -d vj-api_django

# Or using connection URL:
postgresql://postgres:postgres@localhost:${DB_PORT:-5432}/vj-api_django
```

To completely reset the database (WARNING: this will delete all data):
```bash
docker compose down -v  # The -v flag removes the volumes
```

### Run without Docker

#### Requirements

If you prefer to develop without Docker, you'll also need:
- [uv](https://docs.astral.sh/uv/) Python package manager
- Python >= 3.10
- PostgreSQL >= 17

#### Setup

If you prefer to run the application without Docker:

1. Create a virtual environment and install the dependencies with [uv](https://docs.astral.sh/uv/):
```bash
uv sync
```

2. Install and start PostgreSQL locally, or use a cloud database service

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration values, especially `YOUTUBE_API_KEY`

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

### Lint and format the code

Lint and format code with:
```bash
uv run ruff check --fix && ruff format
```

### Endpoints

- `/api/videos/`: Returns a random YouTube video
- `/api/videos/channel/{channelName}`: Returns a random video from the given channel
- `/api/videos/theme/{themeName}`: Returns a random video for the given theme
- `/api/videos/language/{languageCode}`: Returns a random video in the specified language
- `/api/videos/popular`: Returns a random video filtered by view count (optional min_views and max_views parameters)
- `/api/docs`: OpenAPI documentation and API info


### Admin

Access all the cached YouTube videos, themes and their previews on:
- `/api/admin/`


### Production Deployment with ASGI/Uvicorn

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

## Frontend

A stylized random Video Jockey webapp playing randomly selected YouTube video clips with automatic smooth transitions between them. Features microphone-based beat detection for enhanced video switching control.

### Configuration

The frontend is configured through environment variables that are passed to the Docker container. These can be set in your `.env` file or directly in the `docker-compose.yml` file.

#### Configuration Options

- `FRONTEND_NEW_VIDEO_REQUEST_DELAY`: _integer_ (seconds), how often to request new videos from the API. The actual video switching happens automatically when videos finish loading. Default: 8

- `FRONTEND_VIDEO_SWITCH_DELAY`: _integer_ (seconds), delay after a video finishes loading before switching to it. This allows YouTube's title overlay to disappear for a smoother experience. Default: 2

- `FRONTEND_YOUTUBE_THEMES`: _string_ (comma-separated), themes of the requested videos. Leave empty for completely randomly selected videos. Default: ""

- `FRONTEND_DEBUG`: _boolean_, enables debug overlay and additional console logging. Default: false

- `FRONTEND_VHS_EFFECT`: _boolean_, enables VHS visual effects overlay. Default: true

- `FRONTEND_GRAYSCALE`: _boolean_, enables grayscale filter on videos. Default: true

- `FRONTEND_YOUTUBE_PLAYBACK_RATE`: _number_, playback rate for YouTube videos. Default: 1

- `FRONTEND_BEAT_DETECTION_ENERGY_THRESHOLD`: _integer_, minimum audio energy level to consider a beat. Default: 1000

- `FRONTEND_BEAT_DETECTION_BASS_THRESHOLD`: _integer_, minimum bass frequency energy to consider a beat. Default: 300

- `FRONTEND_BEAT_DETECTION_BEAT_COOLDOWN`: _integer_ (milliseconds), minimum time between detected beats. Default: 300

- `FRONTEND_BEAT_DETECTION_CONFIDENCE_THRESHOLD`: _number_ (0.0 to 1.0), minimum confidence level to trigger a beat. Default: 0.99

### Development

To lint and format the codebase (excluding vendor files):

```bash
cd frontend
bun run check
```

This will run `biome check --write .` which formats and lints only your source code, ignoring the `public/` folder.

### Run

```bash
cd frontend
bun run dev
```
