from django.db import models


class Theme(models.Model):
	name = models.CharField(max_length=64)
	active = models.BooleanField(default=True)
	created = models.DateTimeField(auto_now_add=True, null=True)

	class Meta:
		db_table = "themes"
		
	def __str__(self) -> str:
		return f"{self.pk} - {self.name}"


class Video(models.Model):
	theme = models.ForeignKey(Theme, on_delete=models.CASCADE, null=True)
	search_string = models.CharField(max_length=255, null=True, editable=False)
	youtube_id = models.CharField(max_length=32, unique=True, editable=False)
	title = models.CharField(max_length=200, null=True, editable=False)
	thumbnail = models.URLField(null=True, editable=False)
	duration = models.IntegerField(null=True)
	best_start = models.IntegerField(null=True)
	created = models.DateTimeField(auto_now_add=True, null=True)

	class Meta:
		db_table = "videos"

	def __str__(self) -> str:
		return f"{self.pk} - {self.youtube_id}"
