from typing import List, Optional

from fastapi import (
    BackgroundTasks,
    UploadFile, File,
    Form,
    Query,
    Body,
    Depends
)
from fastapi.middleware.cors import CORSMiddleware
from mail import simple_send, conf

from starlette.responses import JSONResponse
from starlette.requests import Request
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr, BaseModel
from typing import List
from fastapi_mail.email_utils import DefaultChecker

from fastapi import FastAPI, HTTPException, Response, status, Depends, Header
from fastapi.security import OAuth2PasswordRequestForm
from models import User_Pydantic, User, Status, UserIn, Token, EmailSchema, HealthCheck, HealthCheckConfig, HealthCheckStatus
from crypto import valid_password, hash_password, verify_password
from crypto import create_access_token, get_current_active_user
from uuid import UUID
import time

from datetime import datetime, timedelta


from tortoise.contrib.fastapi import HTTPNotFoundError, register_tortoise

app = FastAPI(title="Tortoise ORM FastAPI example")

origins = [
    "http://localhost",
    "https://localhost",
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/register")
async def register_user(user: UserIn):
    """ 
    Registers a user,
    takes a user_in model which is just {"email": ..., "password": ...}
    """
    if not valid_password(user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must have uppercase and lowercase letter,be at least 8 characters long and contain at least a symbol",
        )

    user = user.dict()

    # hash the user's password
    user["password_hash"] = hash_password(user["password"])
    # remove the normal password, os only password_hash remains
    user.pop("password")

    # Create the user in the database
    user_obj = await User.create(**user)

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
    user = await User.get(email=form_data.username).values_list("email", "password_hash")
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
    return await User_Pydantic.from_queryset(User.all())

# get current time


@app.get("/unixtime")
async def get_unix_time():
    return {"time": int(time.time())}


@app.post("/app/{app_id}")
async def create_app(health_check_config: HealthCheckConfig, app_id: UUID, current_user: User_Pydantic = Depends(get_current_active_user)):
    user_obj = await User.get(id=current_user.id)

    health_check = await HealthCheck.create(name=health_check_config.app_name,
                                            user=user_obj,
                                            uuid=app_id,
                                            period=health_check_config.period,
                                            grace=health_check_config.grace)

    current_time = datetime.now()
    next_receive = current_time + \
        timedelta(minutes=health_check_config.period+health_check_config.grace)

    health_check_status = await HealthCheckStatus.create(
        last_received=current_time,
        next_receive=next_receive,
        health_check=health_check
    )

    raise HTTPException(
        status_code=status.HTTP_201_CREATED,
        detail="App created",
    )
    return health_check_config


@app.get("/")
async def root():
    return Response(content="OK", media_type="text/plain")


html = """
<p>merge?</p> 
"""


@app.post("/email")
async def send_email(
    email: EmailSchema
) -> JSONResponse:

    await simple_send(email.dict().get('email'), email.dict().get('content'))
    return JSONResponse(status_code=200, content={"message": "email has been sent"})

# Register the ORM
register_tortoise(
    app,
    db_url="sqlite://.db.sqlite3",
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)
