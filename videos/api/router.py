from ninja import Router

from .channel import get_video_from_channel
from .theme import get_video_from_theme
from .video import get_video

router = Router(tags=["videos"])

router.add_api_operation("/", ["GET"], get_video)
router.add_api_operation("/theme/{theme_name}", ["GET"], get_video_from_theme)
router.add_api_operation("/channel/{channel_name}", ["GET"], get_video_from_channel)
