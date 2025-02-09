import random

from django.http import Http404

from videos.models import Video

from .utils.db import populate_db
from .utils.youtube import get_videos_from_youtube, update_videos_duration_from_youtube


def get_video(request) -> dict:
    """
    Get a random YouTube video ID with no specific theme.
    """
    return return_random_video_info(theme=None)


def return_random_video_info(theme=None) -> dict:
    videos = get_videos_from_youtube(theme=theme)
    if videos and len(videos):
        populate_db(videos)
        videos = update_videos_duration_from_youtube(videos=videos)
        video = random.choice(videos)
    else:
        try:
            videos = Video.objects.all()
            video = random.choice(videos)
        except Exception:
            raise Http404
    return {
        "theme": theme.name if theme else None,
        "youtubeId": video.youtube_id,
        "url": f"https://www.youtube.com/watch?v={video.youtube_id}",
        "videoDuration": video.duration,
        "bestStart": video.best_start,
    }
