import json
import os
import random
from typing import Optional

import requests
from django.shortcuts import render
from django.http import Http404
from ninja import NinjaAPI

from videos.models import Theme, Video


api = NinjaAPI()

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


@api.get("/{theme_name}")
def get_video_from_theme(request, theme_name: str):
	theme, created = Theme.objects.get_or_create(name=theme_name)
	populate_db_from_youtube(theme=theme)
	try:
		videos = Video.objects.filter(theme=theme)
		video = random.choice(videos)
	except:
		raise Http404
	return {
			"theme": theme.name,
			"youtubeId": video.youtube_id,
			"videoDuration": video.duration,
			"bestStart": video.best_start,
		}


@api.get("/")
def get_video(request):
	try:
		videos = Video.objects.all()
		video = random.choice(videos)
	except:
		raise Http404
	return {
			"theme": None,
			"youtubeId": video.youtube_id,
			"videoDuration": video.duration,
			"bestStart": video.best_start,
		}


def populate_db_from_youtube(theme: Optional[Theme] = None):
	search_string: str = get_random_word()
	if theme:
		search_string = f"{search_string} {theme.name}"
	response_content = requests.get(
		YOUTUBE_SEARCH_URL,
		params={"key": YOUTUBE_API_KEY,
				"part": "snippet",
				"type": "video",
				"q": search_string
		}).content
	try:
		content: dict = json.loads(response_content)
		if len(content["items"]):
			for v in content["items"]:
				if theme:
					video = Video(youtube_id=v["id"]["videoId"], theme=theme)
				else:
					video = Video(youtube_id=v["id"]["videoId"])
				video.save()
	except Exception as e:
		print(f"Error when getting YouTube response. YouTube API quota might be depleted. {str(e)}")


def get_random_word():
	lines = open('vj-api/dict_EN.txt').read().splitlines()
	return random.choice(lines)
