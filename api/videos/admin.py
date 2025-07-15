from django.contrib import admin
from django.contrib.auth.models import Group
from django.utils.html import format_html

from .models import Theme, Video

admin.site.unregister(Group)


@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
    list_display = ("pk", "name", "active", "created")
    list_filter = ("active",)
    search_fields = ("name",)


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = (
        "pk",
        "title",
        "get_link_tag",
        "get_theme_name",
        "duration",
        "get_image_tag",
        "search_string",
        "created",
    )
    # list_display_links = ('get_link_tag',)
    list_filter = ("theme",)
    search_fields = (
        "title",
        "theme__name",
        "youtube_id",
        "search_string",
    )

    def get_theme_name(self, obj: Video) -> str | None:
        if obj.theme:
            return obj.theme.name
        return None

    get_theme_name.short_description = "theme"  # type: ignore[attr-defined]
    get_theme_name.admin_order_field = "theme__name"  # type: ignore[attr-defined]

    def get_url(self, obj: Video) -> str:
        return f"https://www.youtube.com/watch?v={obj.youtube_id}"

    get_url.short_description = "url"  # type: ignore[attr-defined]

    def get_link_tag(self, obj: Video) -> str:
        return format_html(
            f"<a href='https://www.youtube.com/watch?v={obj.youtube_id}' target='_blank' />{obj.youtube_id}</a>"
        )

    get_link_tag.short_description = "link"  # type: ignore[attr-defined]

    def get_image_tag(self, obj: Video) -> str | None:
        if obj.thumbnail:
            return format_html(f"<img src='{obj.thumbnail}' width='25%' />")
        return None

    get_image_tag.short_description = "thumbnail"  # type: ignore[attr-defined]
