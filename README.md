# Automatic Video Jockey API

Provides a random YouTube video ID according to an optional given theme, and store cached YouTube IDs in a DB for later usage without depleting the YouTube API quota.
This branch is using FastAPI. There is another branch using Django and Django Ninja.


## Main dependencies

Python API with a SQLite database, using FastAPI framework, and deployed to Heroku.

- Python 3.9 (also tested successfully with 3.7)
- Poetry
- FastAPI
- Ormar ORM
- SQLite 3 database
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

Launch the web server:
```sh
uvicorn main:app --reload
```
