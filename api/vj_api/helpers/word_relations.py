from langdetect import detect
from nltk.corpus import wordnet


def get_related_words(theme: str) -> list[str]:
    """
    Get related words for a theme using WordNet.
    Returns empty list if the word is not in English or not found in WordNet.
    """
    try:
        # Detect if the theme is in English
        lang = detect(theme)
        if lang != "en":
            return []

        # Get synsets for the theme
        synsets = wordnet.synsets(theme)
        if not synsets:
            return []

        related_words = []
        for synset in synsets[:2]:  # Take first 2 synsets
            # Get synonyms
            related_words.extend([lemma.name() for lemma in synset.lemmas()])
            # Get hypernyms (more general terms)
            for hypernym in synset.hypernyms():
                related_words.extend([lemma.name() for lemma in hypernym.lemmas()])
            # Get hyponyms (more specific terms)
            for hyponym in synset.hyponyms()[:2]:  # Limit hyponyms to avoid too many results
                related_words.extend([lemma.name() for lemma in hyponym.lemmas()])

        # Remove duplicates and the original theme word, limit to 5
        related_words = list(set(related_words))
        related_words = [word for word in related_words if word.lower() != theme.lower()]
        return related_words[:5]

    except Exception:
        # Silently return empty list on any error
        return []
