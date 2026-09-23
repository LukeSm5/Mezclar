ADJECTIVE_LIST = ["happy"]
NOUN_LIST = ["person"]
BLOCK_LIST = []

def get_adjectives() -> list[str]:
    return ADJECTIVE_LIST

def get_nouns() -> list[str]:
    return NOUN_LIST

def is_blocklisted(word: str) -> bool:
    return word in BLOCK_LIST