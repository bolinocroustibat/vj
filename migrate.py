import sqlalchemy

from models import metadata, database


# get your database url in sqlalchemy format - same as used with databases instance used in Model definition
engine = sqlalchemy.create_engine("sqlite:///videos.sqlite3")
# note that this has to be the same metadata that is used in ormar Models definition
metadata.create_all(engine)
