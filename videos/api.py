import json
import random
from typing import Optional

import requests
from django.db import IntegrityError
from django.http import Http404
from ninja import Router

from videos.models import Theme, Video
from vj_api.helpers import convert_youtube_duration_to_seconds
from vj_api.settings import YOUTUBE_API_KEY, logger

router = Router(tags=["videos"])

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_DOCS_URL = "https://www.googleapis.com/youtube/v3/videos"
DICTIONNARIES: dict = {
    "en": "vj_api/dictionaries/dict_EN.txt",
    "fr": "vj_api/dictionaries/dictionary_FR.txt",
    "jp": "vj_api/dictionaries/44492-japanese-words-latin-lines-removed.txt",
}


@router.get("/")
def get_video(request) -> dict:
    """
    Get a random YouTube video ID with no specific theme.
    """
    return return_random_video_info(theme=None)


@router.get("/{theme_name}")
def get_video_from_theme(request, theme_name: str) -> dict:
    """
    Get a random YouTube video ID a given theme.
    """
    theme, created = Theme.objects.get_or_create(name=theme_name)
    return return_random_video_info(theme=theme)


def return_random_video_info(theme: Optional[Theme] = None) -> dict:
    videos: Optional[list[Video]] = get_videos_from_youtube(theme=theme)
    if videos and len(videos):
        populate_db(videos)
        videos = update_videos_duration_from_youtube(videos=videos)
        video = random.choice(videos)
    else:
        try:
            videos = Video.objects.all()
            video = random.choice(videos)
        except:
            raise Http404
    return {
        "theme": theme.name if theme else None,
        "youtubeId": video.youtube_id,
        "url": f"https://www.youtube.com/watch?v={video.youtube_id}",
        "videoDuration": video.duration,
        "bestStart": video.best_start,
    }


def update_videos_duration_from_youtube(videos: list[Video]) -> list[Video]:
    youtube_ids: list = [v.youtube_id for v in videos if not v.duration][:49]
    response_content = requests.get(
        YOUTUBE_DOCS_URL,
        params={
            "key": YOUTUBE_API_KEY,
            "part": "contentDetails",
            "type": "video",
            "id": ",".join(youtube_ids),
        },
    ).content

    content: dict = json.loads(response_content)
    if content.get("error", None):
        if content["error"].get("code", None) == 403:
            logger.error(
                'Forbidden by YouTube: "{}"'.format(content["error"]["message"])
            )
        else:
            logger.error('Error: "{}"'.format(content["error"]))
    else:
        for item in content["items"]:
            try:
                for idx, video in enumerate(videos):
                    # to be sure (in case the response is not ordered correctly), we look in the list for the video with the corresponding youtube_id and only update it on that criteria
                    if video.youtube_id == item["id"]:
                        duration_yt: str = item["contentDetails"]["duration"]
                        video.duration: int = convert_youtube_duration_to_seconds(
                            duration_yt
                        )
                        try:
                            video.save()
                        except IntegrityError as e:
                            logger.error(f"Video \"{video.youtube_id}\" couldn't be updated because of a duplicate: {str(e)}'. This error should not happen.")
                        except Exception as e:
                            logger.error(f'Error updating video "{video.youtube_id}" in DB: {str(e)}')
                        else:
                            videos[idx] = video  # update the element in the response list
            except Exception as e:
                logger.error(str(e))
    return videos


def get_videos_from_youtube(theme: Optional[Theme] = None) -> Optional[list[Video]]:
    search_string: str = get_random_word()
    if theme:
        search_string = f"{theme.name} {search_string}"
    response_content = requests.get(
        YOUTUBE_SEARCH_URL,
        params={
            "key": YOUTUBE_API_KEY,
            "part": "snippet",
            "type": "video",
            "q": search_string,
        },
    ).content
    content: dict = json.loads(response_content)
    if content.get("error", None):
        if content["error"].get("code", None) == 403:
            logger.error(
                'Forbidden by YouTube: "{}"'.format(content["error"]["message"])
            )
        else:
            logger.error('Error: "{}"'.format(content["error"]))
    else:
        videos: list = []
        for v in content["items"]:
            try:
                video = Video(
                    youtube_id=v["id"]["videoId"],
                    title=v["snippet"]["title"],
                    thumbnail=v["snippet"]["thumbnails"]["high"]["url"],
                    search_string=search_string,
                )
                if theme:
                    video.theme = theme
                videos.append(video)
                logger.info(f'Got a new video ID "{video.title}" from YouTube')
            except Exception as e:
                logger.error(str(e))
        return videos


def populate_db(videos: list[Video]) -> None:
    for v in videos:
        try:
            v.save()
            logger.info(f'Saved a new video ID "{v.id}" in DB')
        except IntegrityError as e:
            logger.warning(f'Video "{v.youtube_id}" already in DB: {str(e)}')
        except Exception as e:
            logger.error(f'Error saving video "{v.youtube_id}" in DB: {str(e)}')


def get_random_word(lang: Optional[str] = None) -> str:
    if not lang:
        lang: str = random.choice(list(DICTIONNARIES.keys()))
    lines = open(DICTIONNARIES[lang]).read().splitlines()
    return random.choice(lines)
