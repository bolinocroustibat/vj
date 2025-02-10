from ninja import Router

from .channel import get_random_video_from_channel
from .language import get_random_video_by_language
from .theme import get_random_video_from_theme
from .video import get_random_video

router = Router(tags=["videos"])

router.add_api_operation("/", ["GET"], get_random_video)
router.add_api_operation("/theme/{theme_name}", ["GET"], get_random_video_from_theme)
router.add_api_operation("/channel/{channel_name}", ["GET"], get_random_video_from_channel)
router.add_api_operation("/language/{language_code}", ["GET"], get_random_video_by_language)
