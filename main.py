from typing import List

from fastapi import FastAPI, HTTPException, Response
from models import User_Pydantic, Users, Status, UserIn
from crypto import valid_password, hash_password, verify_password


from tortoise.contrib.fastapi import HTTPNotFoundError, register_tortoise

app = FastAPI(title="Tortoise ORM FastAPI example")


@app.get("/users", response_model=List[User_Pydantic])
async def get_users():
    return await User_Pydantic.from_queryset(Users.all())


@app.post("/register")
async def register_user(user: UserIn):
    if not valid_password(user.password):
        return {"error": "Password must have uppercase and lowercase letter,be at least 8 characters long and contain at least a symbol"}

    user = user.dict()

    # hash the user's password
    user["password_hash"] = hash_password(user["password"])
    # remove the normal password, os only password_hash remains
    user.pop("password")

    user_obj = await Users.create(**user)

    return await User_Pydantic.from_tortoise_orm(user_obj)


@app.get(
    "/user/{user_id}", response_model=User_Pydantic, responses={404: {"model": HTTPNotFoundError}}
)
async def get_user(user_id: int):
    return await User_Pydantic.from_queryset_single(Users.get(id=user_id))


@app.delete("/user/{user_id}", response_model=Status, responses={404: {"model": HTTPNotFoundError}})
async def delete_user(user_id: int):
    deleted_count = await Users.filter(id=user_id).delete()
    if not deleted_count:
        raise HTTPException(
            status_code=404, detail=f"User {user_id} not found")
    return Status(message=f"Deleted user {user_id}")


@app.get("/")
async def root():
    return Response(content="OK", media_type="text/plain")

register_tortoise(
    app,
    db_url="sqlite://.db.sqlite3",
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)
