from backend.app.naming.generator import generate_name, is_unique_name, generate_unique_name

def test_generate_name_returns_nonempty_string():
    name = generate_name()
    assert isinstance(name, str)
    assert len(name) > 0

def test_is_unique_true_when_not_in_set():
    used_names = {"example"}
    name = "unique"
    assert is_unique_name(name, used_names) == True

def test_is_unique_false_when_in_set():
    used_names = {"example"}
    name = "example"
    assert is_unique_name(name, used_names) == False

def test_generate_unique_name_avoids_collisions():
    used_names = {"example"}
    name = generate_unique_name(used_names)
    assert is_unique_name(name, used_names) == True

def test_generate_unique_name_raises_after_max_attempts():
    used_names = {"example"}
    try:
        generate_unique_name(used_names, max_attempts=1)
        assert False, "Expected ValueError"
    except ValueError:
        pass