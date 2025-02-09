from videos.models import Theme

from .video import return_random_video_info


def get_video_from_theme(request, theme_name: str) -> dict:
    """
    Get a random YouTube video ID a given theme.
    """
    theme, created = Theme.objects.get_or_create(name=theme_name)
    return return_random_video_info(theme=theme)
