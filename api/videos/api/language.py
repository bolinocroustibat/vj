import random

from django.http import Http404

from videos.models import Video

from .utils.db import populate_db
from .utils.youtube import get_videos_from_youtube, update_videos_duration_from_youtube


def get_random_video_by_language(request, language_code: str) -> dict:
    """
    Get a random video in a specific language
    Uses YouTube's relevanceLanguage parameter
    WARNING:
    As explained in the official documentation https://developers.google.com/youtube/v3/docs/search/list#relevanceLanguage:
    The relevanceLanguage parameter instructs the API to return search results that are most relevant to the specified language. (...) Please note that results in other languages will still be returned if they are highly relevant to the search query term.
    So endpoint is not required to return videos that are only in the specified language.
    """
    videos: list[Video] | None = get_videos_from_youtube(language=language_code)
    if videos and len(videos):
        populate_db(videos)
        videos = update_videos_duration_from_youtube(videos=videos)
        video: Video = random.choice(videos)
    else:
        try:
            videos = list(Video.objects.filter(language_code=language_code))
            if not videos:
                raise Http404("No videos found in this language")
            video: Video = random.choice(videos)
        except Exception:
            raise Http404("No videos found in this language")

    return {
        "theme": None,
        "youtubeId": video.youtube_id,
        "url": f"https://www.youtube.com/watch?v={video.youtube_id}",
        "videoDuration": video.duration,
        "bestStart": video.best_start,
        "languageCode": video.language_code,
    }
