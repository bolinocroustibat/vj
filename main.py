import json
import os
import random
from typing import Optional

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import Theme, Video


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "https://adriencarpentier.com"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


@app.get("/")
async def get_youtube_id():
	return await execute_endpoint()


@app.get("/{theme_name}")
async def get_youtube_id_from_theme(theme_name: str = None):
	theme = await Theme.objects.get_or_create(name=theme_name)
	return await execute_endpoint(theme=theme)


async def execute_endpoint(theme: Optional[Theme] = None) -> dict:
	await populate_db_from_youtube(theme=theme)
	try:
		videos = await Video.objects.all(theme=theme)
	except:
		raise HTTPException(status_code=404, detail="No videos found")
	video = random.choice(videos)
	print(video)
	return {
				"id": video.id,
				"theme": theme.name if theme else None,
				"youtubeId": video.youtube_id,
				"length": video.length,
				"bestStart": video.best_start
			}


async def populate_db_from_youtube(theme: Optional[Theme] = None):
	search_string: str = await get_random_word()
	if theme:
		search_string = f"{search_string} {theme}"
	response_content = requests.get(YOUTUBE_SEARCH_URL, params={"key": YOUTUBE_API_KEY, "part": "snippet", "type": "video", "q": search_string}).content
	try:
		content: dict = json.loads(response_content)
		if len(content["items"]):
			for v in content["items"]:
				if theme:
					video = Video(youtube_id=v["id"]["videoId"], theme=theme)
				else:
					video = Video(youtube_id=v["id"]["videoId"])
				await video.save()
	except Exception as e:
		print(f"Error when getting YouTube response. YouTube API quota might be depleted. {str(e)}")


async def get_random_word():
	lines = open('dict_EN.txt').read().splitlines()
	return random.choice(lines)
