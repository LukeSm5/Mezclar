from unittest.mock import patch

import pytest

from backend.app.sessions.codes import generate_join_code


@pytest.mark.parametrize(
    ("random_value", "expected_code"),
    [(0, "100000"), (899_999, "999999")],
)
def test_join_code_range(random_value, expected_code):
    with patch(
        "backend.app.sessions.codes.randbelow",
        return_value=random_value,
    ):
        assert generate_join_code() == expected_code
