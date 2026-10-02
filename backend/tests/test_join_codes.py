import re

from backend.app.sessions.code_generator import generate_session_code

def test_session_codes_match_the_join_form():
    for _ in range(20):
        assert re.fullmatch(r"[A-Z0-9]{4}", generate_session_code())
