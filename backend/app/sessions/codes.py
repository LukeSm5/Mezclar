from secrets import randbelow


def generate_join_code() -> str:
    return str(100_000 + randbelow(900_000))
