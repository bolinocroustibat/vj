def convert_youtube_duration_to_seconds(duration_yt: str) -> int:
    day_time: list[str] = duration_yt.split("T")
    day_duration: str = day_time[0].replace("P", "")
    day_list: list[str] = day_duration.split("D")
    if len(day_list) == 2:
        day: int = int(day_list[0]) * 60 * 60 * 24
        day_list_str: str = day_list[1]
    else:
        day = 0
        day_list_str: str = day_list[0]
    hour_list: list[str] = day_list_str.split("H")
    if len(hour_list) == 2:
        hour = int(hour_list[0]) * 60 * 60
        hour_list_str: str = hour_list[1]
    else:
        hour = 0
        hour_list_str: str = hour_list[0]
    minute_list: list[str] = hour_list_str.split("M")
    if len(minute_list) == 2:
        minute = int(minute_list[0]) * 60
        minute_list_str: str = minute_list[1]
    else:
        minute = 0
        minute_list_str: str = minute_list[0]
    second_list: list[str] = minute_list_str.split("S")
    if len(second_list) == 2:
        second = int(second_list[0])
    else:
        second = 0
    return day + hour + minute + second
