def test_start_requires_enough_players(client):
    code = client.post("/session").json()["session_id"]
    response = client.post("/session/" + code + "/start", json={
        "game_id": "test-game", "minimum_players": 2, "maximum_players": 4,
    })
    assert response.status_code == 400
    assert client.get("/session/" + code).json()["game_started"] is False


def test_start_game_status_survives_lobby_polling(client):
    code = client.post("/session").json()["session_id"]
    for player_id in ["first", "second"]:
        client.post("/session/" + code + "/join", json={"player_id": player_id, "name": player_id})
    payload = {"game_id": "test-game", "minimum_players": 2, "maximum_players": 4}
    response = client.post("/session/" + code + "/start", json=payload)
    assert response.status_code == 200
    assert response.json()["game_started"] is True
    session = client.get("/session/" + code).json()
    assert session["game_started"] is True
    assert session["game_id"] == "test-game"
    assert session["minimum_players"] == 2
    assert client.post("/session/" + code + "/start", json=payload).status_code == 409


def test_start_rejects_invalid_player_limits(client):
    code = client.post("/session").json()["session_id"]
    response = client.post("/session/" + code + "/start", json={
        "game_id": "test-game", "minimum_players": 4, "maximum_players": 2,
    })
    assert response.status_code == 400
    assert client.get("/session/" + code).json()["game_started"] is False
