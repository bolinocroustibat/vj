from django.contrib import admin
from django.utils.html import format_html
from django.contrib.auth.models import Group

from .models import Theme, Video


admin.site.unregister(Group)


@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
	list_display = ('pk', 'name', 'active')
	list_filter = ('active',)
	search_fields = ('name',)


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
	list_display = ('pk', 'title', 'get_link_tag', 'get_theme_name', 'duration', 'get_image_tag')
	# list_display_links = ('get_link_tag',)
	list_filter = ('theme',)
	search_fields = ('title', 'get_theme_name',)

	def get_theme_name(self, obj):
		if obj.theme:
			return obj.theme.name
		return None
	get_theme_name.short_description = 'theme'
	get_theme_name.admin_order_field = 'theme__name'

	def get_url(self, obj):
		return f"https://www.youtube.com/watch?v={obj.youtube_id}"
	get_url.short_description = 'url'

	def get_link_tag(self, obj):
		return format_html(f"<a href='https://www.youtube.com/watch?v={obj.youtube_id}' target='_blank' />{obj.youtube_id}</a>")
	get_link_tag.short_description = 'link'

	def get_image_tag(self, obj):
		if obj.thumbnail:
			return format_html(f"<img src='{obj.thumbnail}' width='20%' />")
		return None
	get_image_tag.short_description = 'thumbnail'
