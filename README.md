# Automatic Video Jockey API

A Video Jockey (VJ) system consisting of a backend API that provides random YouTube videos by theme, and a frontend webapp that creates an automatic video mixing experience with beat detection and smooth transitions.

[**Backend API**](#api): Provides a random YouTube video ID according to an optional given theme, and stores cached YouTube IDs in a database for later usage without depleting the YouTube API quota.

[**Frontend**](#frontend): A stylized random Video Jockey webapp playing randomly selected YouTube video clips with automatic smooth transitions between them. Features microphone-based beat detection for enhanced video switching control.

This branch is using Django, Django Ninja and PostgreSQL. There is also a deprecated [branch using FastAPI and SQlite](https://github.com/bolinocroustibat/vj-api/tree/fastapi).

## API

### Run with Docker (recommended)

#### Requirements

- Docker Engine >= 24.0
- Docker Compose >= 2.0
- A YouTube API v3 key

#### Setup

The project includes Docker and Docker Compose configurations. To run with Docker:

1. Create a `.env` file in the root directory with the following variables:
```env
# Application settings
ENVIRONMENT=local
API_PORT=8000 # Optional: defaults to 8000 if not set
DB_PORT=5432 # Optional: external port for PostgreSQL, defaults to 5432
FRONTEND_PORT=4173 # Optional: defaults to 4173 if not set
YOUTUBE_API_KEY=your_youtube_api_key_here

DJANGO_SECRET_KEY=your_django_secret_key_here

# Database settings
POSTGRES_DB=vj-api_django

# Allowed hosts and CORS
ALLOWED_HOSTS=127.0.0.1,localhost
# CORS settings:
# - For development: CORS_ORIGIN_ALLOW_ALL can be True
# - For production: CORS_ORIGIN_ALLOW_ALL should be False and CORS_ALLOWED_ORIGINS must list all allowed domains
CORS_ORIGIN_ALLOW_ALL=False  # Set to True only for development
# CORS_ALLOWED_ORIGINS: Add your frontend URLs here
# - http://localhost:4173 for local frontend development
CORS_ALLOWED_ORIGINS=http://localhost:4173

# Frontend application settings
FRONTEND_NEW_VIDEO_REQUEST_DELAY=8 # How often to request new videos (seconds)
FRONTEND_VIDEO_SWITCH_DELAY=2 # Delay after video loads before switching (seconds)
FRONTEND_YOUTUBE_THEMES="saucisson,showa era" # Comma-separated list of video themes
# DEBUG is shared between backend and frontend (see Django core settings above)

# Frontend visual effects settings
FRONTEND_VHS_EFFECT=true # Enable VHS visual effects overlay

# Frontend beat detection settings
FRONTEND_BEAT_DETECTION_ENERGY_THRESHOLD=1000 # Minimum audio energy for beat detection
FRONTEND_BEAT_DETECTION_BASS_THRESHOLD=300 # Minimum bass frequency energy
FRONTEND_BEAT_DETECTION_BEAT_COOLDOWN=300 # Minimum time between beats (ms)
FRONTEND_BEAT_DETECTION_CONFIDENCE_THRESHOLD=0.99 # Minimum confidence for beat detection
```

2. Build and start the containers:
```bash
docker compose up --build
```

The application will be available at:
- Backend API: http://localhost:8000 (default port)
- Frontend: http://localhost:4173 (default port)
- Database: localhost:5432 (default port)

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
- Python >= 3.10
- PostgreSQL >= 17
- A modern Python package manager like [uv](https://docs.astral.sh/uv/)

#### Setup

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
# Application settings
ENVIRONMENT=local
API_PORT=8000 # Optional: defaults to 8000 if not set
DB_PORT=5432 # Optional: external port for PostgreSQL, defaults to 5432
YOUTUBE_API_KEY=your_youtube_api_key_here

DJANGO_SECRET_KEY=your_django_secret_key_here

# DEBUG should be set to False for production
DEBUG=False

# Database settings
POSTGRES_DB=vj-api_django

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

Copy `config.example.json` to `config.json` and modify the settings as needed.

#### Configuration Options

- `apiHost`: _string_ (URL). The full URL of the API providing an unlimited amount of YouTube IDs. Prefer one that doesn't deplete the YouTube API quota.

- `newVideoRequestDelay`: _integer_ (seconds), how often to request new videos from the API. The actual video switching happens automatically when videos finish loading.

- `videoSwitchDelay`: _integer_ (seconds), delay after a video finishes loading before switching to it. This allows YouTube's title overlay to disappear for a smoother experience.

- `youtubeThemes`: _list_ of _string_. Themes of the requested videos. Also accepts `null` as element of list if you want a completely randomly selected video.

- `debug`: _boolean_ (optional), enables debug overlay and additional console logging.

- `beatDetection`: _object_ (optional), configuration for microphone-based beat detection:
  - `energyThreshold`: _integer_, minimum audio energy level to consider a beat (default: 200)
  - `bassThreshold`: _integer_, minimum bass frequency energy to consider a beat (default: 150)
  - `beatCooldown`: _integer_ (milliseconds), minimum time between detected beats (default: 200)


### Development

To lint and format the codebase (excluding vendor files):

```bash
bun run check
```

This will run `biome check --write .` which formats and lints only your source code, ignoring the `vhs/` vendor folder.

### Run

```bash
bun run dev
```
