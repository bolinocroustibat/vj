from django.contrib import admin

from .models import Theme, Video

@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
	pass

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
	pass
