from django.db import models


class Theme(models.Model):
	name = models.CharField(max_length=64)
	active = models.BooleanField(default=True)

	class Meta:
		db_table = "themes"
		
	def __str__(self) -> str:
		return f"{self.pk} - {self.name}"


class Video(models.Model):
	theme = models.ForeignKey(Theme, on_delete=models.CASCADE, null=True)
	youtube_id = models.CharField(max_length=32, unique=True, editable=False)
	title = models.CharField(max_length=200, null=True, editable=False)
	thumbnail = models.URLField(null=True, editable=False)
	duration = models.IntegerField(null=True)
	best_start = models.IntegerField(null=True)

	class Meta:
		db_table = "videos"

	def __str__(self) -> str:
		return f"{self.pk} - {self.youtube_id}"
