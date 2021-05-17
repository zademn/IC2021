from fastapi.testclient import TestClient
import tortoise
from typing import Generator
from tortoise.contrib.fastapi import HTTPNotFoundError, register_tortoise
from tortoise.contrib import test
from tortoise.contrib.test import initializer, finalizer
import pytest
import asyncio
from main import app

register_tortoise(
    app,
    db_url="sqlite://test.db.sqlite3",
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)
#client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def initialize_tests(request):
    db_url = "sqlite://test.db.sqlite3"
    initializer(["models"], db_url=db_url, app_label="models")
    request.addfinalizer(finalizer)


@pytest.fixture(scope="module")
def client() -> Generator:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def event_loop(client: TestClient) -> Generator:
    yield client.task.get_loop()


def test_register_bad_password(client: TestClient, event_loop: asyncio.AbstractEventLoop):
    """
    Checks if password is not ok
    """
    response = client.post(
        "/register", json={"email": "test@example.com", "password": "Somepotatoes"})
    assert response.json() == {
        "detail": "Password must have uppercase and lowercase letter,be at least 8 characters long and contain at least a number and an uppercase character"}


def test_register_good(client: TestClient, event_loop: asyncio.AbstractEventLoop):
    """
    Checks if you can register a user
    """
    response = client.post(
        "/register", json={"email": "register_good@example.com", "password": "Somepotatoes1@"})
    assert response.json() == {"detail": "User created"}


def test_register_twice(client: TestClient, event_loop: asyncio.AbstractEventLoop):
    """
    Checks if you can register a user twice
    """
    response = client.post(
        "/register", json={"email": "register_twice@example.com", "password": "Somepotatoes1@"})
    assert response.json() == {"detail": "User created"}

    response = client.post(
        "/register", json={"email": "register_twice@example.com", "password": "Somepotatoes1@"})
    assert response.json() == {"detail": [
        {'loc': [], 'msg': 'UNIQUE constraint failed: user.email', 'type': 'IntegrityError'}]}


def test_get_users(client: TestClient, event_loop: asyncio.AbstractEventLoop):
    """
    Checks the get all users. The register_good and register_twice must pass for this to pass
    """
    response = client.get("/users")
    data = response.json()
    user1, user2 = data

    assert user1.get("email", None) == "register_good@example.com"
    assert user2.get("email", None) == "register_twice@example.com"


def test_read_main(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.content == b"OK"


def test_register_not_allowed(client: TestClient):
    response = client.get("/register")
    assert response.status_code == 405


def test_token_not_allowed(client: TestClient):
    response = client.get("/token")
    assert response.status_code == 405


def test_apps_hc(client: TestClient):
    response = client.get("/apps-hc")
    assert response.status_code == 401


def test_apps_log(client: TestClient):
    response = client.get("/apps-log")
    assert response.status_code == 401
