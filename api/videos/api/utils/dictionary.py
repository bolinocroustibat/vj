import random

DICTIONNARIES: dict = {
    "en": "vj_api/dictionaries/dict_EN.txt",
    "fr": "vj_api/dictionaries/dictionary_FR.txt",
    "jp": "vj_api/dictionaries/44492-japanese-words-latin-lines-removed.txt",
}


def get_random_word(lang: str | None = None) -> str:
    """
    Get a random word from dictionary files.
    If lang is not specified, picks a random language from available dictionaries.
    """
    if not lang:
        lang = random.choice(list(DICTIONNARIES.keys()))
    lines = open(DICTIONNARIES[lang]).read().splitlines()
    return random.choice(lines)
