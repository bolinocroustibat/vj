from django.db import IntegrityError

from videos.models import Video
from vj_api.settings import logger


def populate_db(videos: list[Video]) -> None:
    for v in videos:
        try:
            v.save()
            logger.info(f'Saved a new video ID "{v.pk}" in DB')
        except IntegrityError as e:
            logger.warning(f'Video "{v.youtube_id}" already in DB: {str(e)}')
        except Exception as e:
            logger.error(f'Error saving video "{v.youtube_id}" in DB: {str(e)}')
