import json
import os
import random
from typing import Optional

import requests
from fastapi import FastAPI, HTTPException

from models import Theme, Video


app = FastAPI()


YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


@app.get("/")
async def get_youtube_ids():
	return await execute_endpoint()


@app.get("/{theme_name}")
async def get_youtube_ids_from_theme(theme_name: str = None):
	theme = await Theme.objects.get_or_create(name=theme_name)
	return await execute_endpoint(theme=theme)


async def execute_endpoint(theme: Optional[Theme] = None) -> dict:
	await populate_db_from_youtube(theme=theme)
	try:
		videos = await Video.objects.all(theme=theme)
	except:
		raise HTTPException(status_code=404, detail="No videos found")
	if len(videos) > 10:
		selected_videos = random.sample(videos, 10)
	else:
		selected_videos = videos
	response: list = []
	for v in selected_videos:
		response.append(
			{
			"id": v.id,
			"theme": theme.name if theme else None,
			"youtube_id": v.youtube_id,
			"length": v.length,
			"best_start": v.best_start
			}
		)
	return response


async def populate_db_from_youtube(theme: Optional[Theme] = None):
	search_string: str = await get_random_word()
	if theme:
		search_string = f"{search_string} {theme}"
	response_content = requests.get(YOUTUBE_SEARCH_URL, params={"key": YOUTUBE_API_KEY, "part": "snippet", "type": "video", "q": search_string}).content
	content: dict = json.loads(response_content)
	if len(content["items"]):
		for v in content["items"]:
			if theme:
				video = Video(youtube_id=v["id"]["videoId"], theme=theme)
			else:
				video = Video(youtube_id=v["id"]["videoId"])
			await video.save()


async def get_random_word():
	lines = open('dict_EN.txt').read().splitlines()
	return random.choice(lines)
