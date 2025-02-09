import random

from django.http import Http404

from videos.models import Video

from .utils.db import populate_db
from .utils.youtube import get_videos_from_youtube, update_videos_duration_from_youtube


def get_video_from_channel(request, channel_name: str) -> dict:
    """
    Get a random YouTube video ID from a given channel.
    """
    videos = get_videos_from_youtube(channel=channel_name)
    if videos and len(videos):
        populate_db(videos)
        videos = update_videos_duration_from_youtube(videos=videos)
        video = random.choice(videos)
    else:
        try:
            videos = list(Video.objects.filter(channel_name=channel_name))
            if not videos:
                raise Http404("No videos found for this channel")
            video = random.choice(videos)
        except Exception:
            raise Http404

    return {
        "theme": None,
        "youtubeId": video.youtube_id,
        "url": f"https://www.youtube.com/watch?v={video.youtube_id}",
        "videoDuration": video.duration,
        "bestStart": video.best_start,
        "channelName": video.channel_name,
    }
