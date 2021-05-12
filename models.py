from typing import Optional

import databases
import ormar
import sqlalchemy


database = databases.Database("sqlite:///videos.sqlite3")
metadata = sqlalchemy.MetaData()


class Theme(ormar.Model):
	id: int = ormar.Integer(primary_key=True)
	name: str = ormar.String(max_length=100)

	class Meta:
		database = database
		metadata = metadata


class Video(ormar.Model):
	id: int = ormar.Integer(primary_key=True)
	youtube_id: str = ormar.String(max_length=100)
	theme: Optional[Theme] = ormar.ForeignKey(Theme, name="theme_id", nullable=True)
	length: int = ormar.Integer(nullable=True)
	best_start: int = ormar.Integer(nullable=True)

	class Meta:
		database = database
		metadata = metadata
