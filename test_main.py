from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


def test_register_bad_password():
    response = client.post(
        "/register", json={"email": "test@example.com", "password": "Somepotatoes1!"})

    assert response.json() == {
        "detail": "Password must have uppercase and lowercase letter,be at least 8 characters long and contain at least a number and an uppercase character"}


def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.content == b"OK"


def test_register_not_allowed():
    response = client.get("/register")
    assert response.status_code == 405


def test_token_not_allowed():
    response = client.get("/token")
    assert response.status_code == 405


def test_apps_hc():
    response = client.get("/apps-hc")
    assert response.status_code == 401


def test_apps_log():
    response = client.get("/apps-log")
    assert response.status_code == 401
