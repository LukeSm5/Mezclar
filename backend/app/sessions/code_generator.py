import random
import string

def generate_session_code(length: int = 4) -> str:
    characters = string.ascii_uppercase + string.digits

    return "".join(random.choices(characters, k=length))