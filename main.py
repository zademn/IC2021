from typing import List, Optional

from fastapi import FastAPI, HTTPException, Response, status, Depends, Header
from fastapi.security import OAuth2PasswordRequestForm
from models import User_Pydantic, Users, Status, UserIn, Token
from crypto import valid_password, hash_password, verify_password
from crypto import create_access_token, get_current_active_user


from tortoise.contrib.fastapi import HTTPNotFoundError, register_tortoise

app = FastAPI(title="Tortoise ORM FastAPI example")


@app.post("/register")
async def register_user(user: UserIn):
    """ 
    Registers a user,
    takes a user_in model which is just {"email": ..., "password": ...}
    """
    if not valid_password(user.password):
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must have uppercase and lowercase letter,be at least 8 characters long and contain at least a symbol",
        )

    user = user.dict()

    # hash the user's password
    user["password_hash"] = hash_password(user["password"])
    # remove the normal password, os only password_hash remains
    user.pop("password")

    # Create the user in the database
    user_obj = await Users.create(**user)

    return {"detail": "User created"}


@app.post("/token", response_model=Token)
async def get_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """ 
    Used for getting the jwt token,
    takes a form data with {"username": ... , "password": ...}
    but username is email in our case
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # checks if the username is in the db
    user = await Users.get(email=form_data.username).values_list("email", "password_hash")
    if not user:
        raise credentials_exception
    # list of tuples
    user_email = user[0][0]
    user_hash = user[0][1]

    # checks if password matches
    if not verify_password(user_hash, form_data.password):
        raise credentials_exception

    access_token = create_access_token(data={"sub": user_email})

    return Token(access_token=access_token, token_type="bearer")


# only as an example for jwt auth
# if you want to make a route "protected"
# add this function's signature in your route (Depends(...))
@app.get("/users/me", response_model=User_Pydantic)
async def read_users_mode(current_user: User_Pydantic = Depends(get_current_active_user)):
    return current_user


# only for testing purposes, to see all the users
@app.get("/users", response_model=List[User_Pydantic])
async def get_users():
    return await User_Pydantic.from_queryset(Users.all())


@app.get("/")
async def root():
    return Response(content="OK", media_type="text/plain")

# Register the ORM
register_tortoise(
    app,
    db_url="sqlite://.db.sqlite3",
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)
