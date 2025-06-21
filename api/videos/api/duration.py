import random

from django.http import Http404

from videos.models import Video


def get_random_video_by_duration(request, min_minutes: int, max_minutes: int) -> dict:
    """
    Get a random video with duration between min and max minutes
    """
    min_duration = min_minutes * 60
    max_duration = max_minutes * 60

    videos = Video.objects.filter(duration__gte=min_duration, duration__lte=max_duration)
    if not videos:
        raise Http404("No videos found in this duration range")

    video = random.choice(videos)
    return {
        "theme": None,
        "youtubeId": video.youtube_id,
        "url": f"https://www.youtube.com/watch?v={video.youtube_id}",
        "videoDuration": video.duration,
        "bestStart": video.best_start,
    }
