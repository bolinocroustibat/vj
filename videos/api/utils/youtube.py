import json

import requests
from django.db import IntegrityError
from django.http import Http404

from videos.models import Theme, Video
from vj_api.helpers import convert_youtube_duration_to_seconds
from vj_api.settings import YOUTUBE_API_KEY, logger

from .dictionary import get_random_word

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_DOCS_URL = "https://www.googleapis.com/youtube/v3/videos"


def get_videos_from_youtube(
    theme: Theme | None = None,
    channel: str | None = None,
    language: str | None = None,
    published_after: str | None = None,
    published_before: str | None = None,
    order: str = "relevance",
) -> list[Video] | None:
    search_string: str = get_random_word() if not channel else ""
    if theme:
        search_string = f"{theme.name} {search_string}"

    params = {
        "key": YOUTUBE_API_KEY,
        "part": "snippet",
        "type": "video",
        "q": search_string,
        "order": order,
        "maxResults": 50,
    }

    if channel:
        params["channelId"] = get_channel_id(channel)
    if language:
        params["relevanceLanguage"] = language
    if published_after:
        params["publishedAfter"] = published_after
    if published_before:
        params["publishedBefore"] = published_before

    response_content = requests.get(
        YOUTUBE_SEARCH_URL,
        params=params,
    ).content

    content: dict = json.loads(response_content)
    if content.get("error", None):
        if content["error"].get("code", None) == 403:
            logger.error('Forbidden by YouTube: "{}"'.format(content["error"]["message"]))
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
                    channel_name=v["snippet"]["channelTitle"],
                    language_code=language,
                )
                if theme:
                    video.theme = theme
                videos.append(video)
                logger.info(f'Got a new video ID "{video.title}" from YouTube')
            except Exception as e:
                logger.error(str(e))
        return videos


def update_videos_view_count_from_youtube(videos: list[Video]) -> list[Video]:
    youtube_ids: list = [v.youtube_id for v in videos if not v.view_count][:49]
    response_content = requests.get(
        YOUTUBE_DOCS_URL,
        params={
            "key": YOUTUBE_API_KEY,
            "part": "statistics",
            "id": ",".join(youtube_ids),
        },
    ).content

    content: dict = json.loads(response_content)
    if content.get("error", None):
        if content["error"].get("code", None) == 403:
            logger.error('Forbidden by YouTube: "{}"'.format(content["error"]["message"]))
        else:
            logger.error('Error: "{}"'.format(content["error"]))
    else:
        for item in content["items"]:
            try:
                for idx, video in enumerate(videos):
                    if video.youtube_id == item["id"]:
                        video.view_count = int(item["statistics"]["viewCount"])
                        try:
                            video.save()
                        except IntegrityError as e:
                            logger.error(
                                f"Video \"{video.youtube_id}\" couldn't be updated because of a duplicate: {str(e)}'. This error should not happen."
                            )
                        except Exception as e:
                            logger.error(
                                f'Error updating video "{video.youtube_id}" in DB: {str(e)}'
                            )
                        else:
                            videos[idx] = video
            except Exception as e:
                logger.error(str(e))
    return videos


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
            logger.error('Forbidden by YouTube: "{}"'.format(content["error"]["message"]))
        else:
            logger.error('Error: "{}"'.format(content["error"]))
    else:
        for item in content["items"]:
            try:
                for idx, video in enumerate(videos):
                    if video.youtube_id == item["id"]:
                        duration_yt: str = item["contentDetails"]["duration"]
                        video.duration = convert_youtube_duration_to_seconds(duration_yt)
                        try:
                            video.save()
                        except IntegrityError as e:
                            logger.error(
                                f"Video \"{video.youtube_id}\" couldn't be updated because of a duplicate: {str(e)}'. This error should not happen."
                            )
                        except Exception as e:
                            logger.error(
                                f'Error updating video "{video.youtube_id}" in DB: {str(e)}'
                            )
                        else:
                            videos[idx] = video
            except Exception as e:
                logger.error(str(e))
    return videos


def get_channel_id(channel_name: str) -> str:
    """
    Get YouTube channel ID from channel name/handle using YouTube API
    """
    response_content = requests.get(
        "https://www.googleapis.com/youtube/v3/search",
        params={
            "key": YOUTUBE_API_KEY,
            "part": "snippet",
            "type": "channel",
            "q": channel_name,
            "maxResults": 1,
        },
    ).content

    content: dict = json.loads(response_content)
    if content.get("error", None):
        logger.error(f"Error getting channel ID: {content.get('error')}")
        raise Http404("Channel not found")

    if not content.get("items"):
        raise Http404("Channel not found")

    return content["items"][0]["id"]["channelId"]
