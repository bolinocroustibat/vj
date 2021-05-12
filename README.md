# Automatic Video Jockey API

Provides random YouTube video IDs according to an optional given theme, and store them in a DB for later usage without depleting the YouTube API quota.

## Dependencies

- Python 3.9
- Poetry
- FastAPI
- Ormar ORM
- SQlite 3 database
- A YouTube API v3 key

## Install

Create a virtual environnement and install the dependencies in it with Poetry single command:
```sh
poetry install
```

## Run 

Activate the virtual environement:
```sh
poetry shell
```

Load your YouTube API v3 key in your environnement:
```sh
export YOUTUBE_API_KEY="MY_API_KEY"
```

Maunch the web server:
```sh
uvicorn main:app --reload
```
