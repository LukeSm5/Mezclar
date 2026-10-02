ADJECTIVE_LIST = ["Happy", "Jolly", "Cheerful", "Studious", "Diabolical", "Mysterious", "Brave", "Clever", "Fierce"]
NOUN_LIST = ["Person", "Chinchilla", "Giraffe", "Officer", "Count", "Wizard", "Witch", "Warlock", "Dragon"]
BLOCK_LIST = []

def get_adjectives() -> list[str]:
    return ADJECTIVE_LIST

def get_nouns() -> list[str]:
    return NOUN_LIST

def contains_blocklisted_word(name: str) -> bool:
    pass