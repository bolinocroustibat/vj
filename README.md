# Automatic Video Jockey API

Provides a random YouTube video ID according to an optional given theme, and store cached YouTube IDs in a DB for later usage without depleting the YouTube API quota.

This branch is using Django, Django Ninja and PostgreSQL. There is also a deprecated [branch using FastAPI and SQlite](https://github.com/bolinocroustibat/vj-api/tree/fastapi).


## Main dependencies

Python API with a PostgreSQL database using Django framework.

- Python >= 3.10
- A PostgreSQL 15 database (not tested with other PostgreSQL versions)
- A YouTube API v3 key
- A modern Python package manager like [uv](https://docs.astral.sh/uv/)
- [Django](https://www.djangoproject.com/)
- [Django-Ninja](https://django-ninja.rest-framework.com/)

## Install

Create a virtual environnement and install the dependencies in it with [uv](https://docs.astral.sh/uv/) single command:
```bash
uv sync
```


## Run

Run a PostgreSQL database instance with a `vj-api` database and a user.
For example, with Docker:
```sh
docker run --name vj-api-db -e POSTGRES_USER=postgres -e POSTGRES_DB=vj-api -p 5432:5432 -d postgres
```

Create a `local_settings.py` Python settings file in the `vj_api` folder, and add the database settings and your your YouTube API v3 key in it:
```python
DATABASES = {
	"default": {
		"ENGINE": "django.db.backends.postgresql",
		"NAME": "vj-api",
		"USER": "postgres",
		"PASSWORD": "",
		"HOST": "localhost",  # Or an IP Address that your DB is hosted on. DO NOT USE "127.0.0.1" but "localhost"
		"PORT": "5432",
	}
}

YOUTUBE_API_KEY="MY_API_KEY"
```

Migrate the database:
```bash
uv run ./manage.py migrate
```

Create a superuser:
```bash
uv run ./manage.py createsuperuser
```

Collect the static files:
```bash
uv run ./manage.py collectstatic
```

Finally, launch the Django web server:
```bash
uv run ./manage.py runserver
```

## Lint and format the code

Lintand format code with:
```bash
uv run ruff check --fix && ruff format
```

## Endpoints

- `/api/videos/`: Returns a random YouTube ID
- `/api/videos/{theme_name}`: Returns a random YouTube ID for the given theme
- `/api/docs`: OpenAPI documentation and API info


## Admin

Access all the cached YouTube videos, themes and their previews on:
- `/api/admin/`


## To run as async with ASGI with Uvicorn

```sh
gunicorn vj_api.asgi:application -k uvicorn.workers.UvicornWorker
```

For production, the number of workers `-w` should be adjusted based on the number of CPU cores.
For example, here with 20 cores, on port 8002 and adding a log file:
```sh
gunicorn vj_api.asgi:application -w 40 -k uvicorn.workers.UvicornWorker --bind "0.0.0.0:8002"
```

To debug:
```sh
gunicorn vj_api.asgi:application -k uvicorn.workers.UvicornWorker --bind "0.0.0.0:8002" --log-level debug
```
