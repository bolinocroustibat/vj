import json
import os
import random
from typing import List, Optional

import requests
from django.shortcuts import render
from django.http import Http404
from ninja import NinjaAPI

from videos.models import Theme, Video
from vj_api .settings import logger

api = NinjaAPI()

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_DOCS_URL = "https://www.googleapis.com/youtube/v3/videos"
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
	update_video_duration_from_youtube(videos=videos)
	return {
			"theme": theme.name,
			"youtubeId": video.youtube_id,
			"videoDuration": video.duration,
			"bestStart": video.best_start,
		}


@api.get("/")
def get_video(request):
	populate_db_from_youtube()
	try:
		videos = Video.objects.all()
		video = random.choice(videos)
	except:
		raise Http404
	update_video_duration_from_youtube(videos=videos)
	return {
			"theme": None,
			"youtubeId": video.youtube_id,
			"videoDuration": video.duration,
			"bestStart": video.best_start,
		}


def update_video_duration_from_youtube(videos: List[Video]) -> None:
	youtube_ids: list = [v.youtube_id for v in videos if not v.duration][:49]
	response_content = requests.get(
		YOUTUBE_DOCS_URL,
		params={"key": YOUTUBE_API_KEY,
				"part": "contentDetails",
				"type": "video",
				"id": ",".join(youtube_ids)
		}).content

	content: dict = json.loads(response_content)
	if content.get("error", None):
		if content["error"].get("code", None) == 403:
			logger.error('Forbidden by YouTube: "{}"'.format(content["error"]["message"]))
		else:
			logger.error('Error: "{}"'.format(content["error"]))
	else:
		for v in content["items"]:
			try:
				duration_yt: str = v["contentDetails"]["duration"][2:]
				hours = 0
				if "H" in duration_yt:
					hours = int(duration_yt.split('H')[0])
					duration_yt = duration_yt.split('H')[1]
				minutes = 0
				if "M" in duration_yt:
					minutes = int(duration_yt.split('M')[0])
					duration_yt = duration_yt.split('M')[1]
				seconds = 0
				if "S" in duration_yt:
					seconds = int(duration_yt.split('S')[0])
				duration: int = hours*3600 + minutes*60 + seconds
				video = Video.objects.get(youtube_id=v["id"])
				video.duration=duration
				video.save()
			except Exception as e:
				logger.error(str(e))


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
	content: dict = json.loads(response_content)
	if content.get("error", None):
		if content["error"].get("code", None) == 403:
			logger.error('Forbidden by YouTube: "{}"'.format(content["error"]["message"]))
		else:
			logger.error('Error: "{}"'.format(content["error"]))
	else:
		try:
			for v in content["items"]:
				if theme:
					video = Video(youtube_id=v["id"]["videoId"], title=v["snippet"]["title"], thumbnail=v["snippet"]["thumbnails"]["high"]["url"], theme=theme)
				else:
					video = Video(youtube_id=v["id"]["videoId"], title=v["snippet"]["title"], thumbnail=v["snippet"]["thumbnails"]["high"]["url"])
				video.save()
				logger.info(f'Saved a new video ID "{video.title}" in DB')
		except Exception as e:
			logger.error(str(e))



def get_random_word():
	lines = open('vj_api/dict_EN.txt').read().splitlines()
	return random.choice(lines)
