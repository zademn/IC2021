from typing import List, Optional

from fastapi import (
    BackgroundTasks,
    UploadFile, File,
    Form,
    Query,
    Body,
    Depends,
    WebSocket
)
from fastapi.middleware.cors import CORSMiddleware
from mail import simple_send, conf

from starlette.responses import JSONResponse
from starlette.requests import Request
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr, BaseModel
from typing import List
from fastapi_mail.email_utils import DefaultChecker

from fastapi import FastAPI, HTTPException, Response, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from models import (MonitoringConfig, MonitoringStatus, MonitoringStatusConfig, User_Pydantic, User, UserIn, Token, EmailSchema,
                    HealthCheck, HealthCheckConfig, HealthCheckStatus, Monitoring, MonitoringStatus, MonitoringConfig, MonitoringStatusConfig, Logger, LoggerStatusConfig, LoggerStatus, LoggerConfig)
from crypto import valid_password, hash_password, verify_password
from crypto import create_access_token, get_current_active_user
from uuid import UUID
import time
import asyncio

from datetime import datetime, timedelta
from tortoise.contrib.fastapi import HTTPNotFoundError, register_tortoise
from db_check import check_db_every_x_seconds, clean_late_entries
import datetime
import time

COLORS = ["hsl(58, 70%, 50%)",
          "hsl(114, 70%, 50%)",
          "hsl(66, 70%, 50%)"]
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


@ app.on_event("startup")
def initial_task():
    task = asyncio.create_task(check_db_every_x_seconds(5, clean_late_entries))


@ app.post("/register")
async def register_user(user: UserIn):
    """
    Registers a user,
    takes a user_in model which is just {"email": ..., "password": ...}
    """
    if not valid_password(user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must have uppercase and lowercase letter,be at least 8 characters long and contain at least a number and an uppercase character",
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

# Health check stuff


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


@app.get("/app/{app_id}")
async def ping_app(app_id: UUID):
    health_check = await HealthCheck.get_or_none(uuid=app_id)

    if health_check is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="App does not exist",
        )

    hc_status = await HealthCheckStatus.filter(health_check_id=health_check.id)
    last_entry = hc_status[len(hc_status)-1]

    curr_time = datetime.now()
    if curr_time < last_entry.next_receive.replace(tzinfo=None):
        last_entry.done = True
        await last_entry.save()

    next_receive = curr_time + \
        timedelta(minutes=health_check.period+health_check.grace)

    health_check_status = await HealthCheckStatus.create(
        last_received=curr_time,
        next_receive=next_receive,
        health_check=health_check
    )

    raise HTTPException(
        status_code=status.HTTP_200_OK,
    )


@app.get("/apps-hc")
async def list_healtchecks(current_user: User_Pydantic = Depends(get_current_active_user)):
    user_obj = await User.get(id=current_user.id)
    healthchecks = await HealthCheck.all().filter(user=user_obj)
    if healthchecks == []:
        return []
    return healthchecks


@app.get("/apps-hc-status/{app_id}")
async def list_healthcheck_status(app_id: UUID, current_user: User_Pydantic = Depends(get_current_active_user)):
    user_obj = await User.get(id=current_user.id)
    healthcheck = await HealthCheck.get(uuid=app_id).filter(user=user_obj)
    healthcheck_statuses = await HealthCheckStatus.all().filter(health_check=healthcheck)
    if healthcheck_statuses == []:
        return []
    return healthcheck_statuses

# Logger stuff

# http://127.0.0.1:8000/app-logging/18ff372e-8eb9-49ff-a835-2c602309f0bd?app_name=test


@app.post("/app-logging/{app_id}")
async def create_logger(logger_config: LoggerConfig, app_id: UUID, current_user: User_Pydantic = Depends(get_current_active_user)):
    user_obj = await User.get(id=current_user.id)
    logger_app = await Logger.create(name=logger_config.app_name,
                                     user=user_obj,
                                     uuid=app_id)

    raise HTTPException(
        status_code=status.HTTP_201_CREATED,
        detail="Logger app created",
    )


@app.post("/app-logging-status/{app_id}")
async def create_logger_status(logger_config: LoggerStatusConfig, app_id: UUID):
    '''
    logger_config: {
        device_id: str,
        severity_level: int,
        message: str}
    '''

    logger_app = await Logger.get(uuid=app_id)
    if logger_app is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logger doesn't exist",
        )
    logger_status = await LoggerStatus.create(device_id=logger_config.device_id,
                                              severity_level=logger_config.severity_level,
                                              message=logger_config.message,
                                              logger=logger_app)

    raise HTTPException(
        status_code=status.HTTP_201_CREATED,
        detail="Logger status added",
    )


@app.get("/app-logging/{app_id}")
async def list_logger_statuses(app_id: UUID, current_user: User_Pydantic = Depends(get_current_active_user)):
    user_obj = await User.get(id=current_user.id)

    logger_app = await Logger.get(uuid=app_id).filter(user=user_obj)
    if logger_app is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logger doesn't exist",
        )
    logger_statuses = await LoggerStatus.all().filter(logger=logger_app)
    if logger_statuses == []:
        return []
    return logger_statuses


@app.get("/apps-log")
async def list_loggers(current_user: User_Pydantic = Depends(get_current_active_user)):
    user_obj = await User.get(id=current_user.id)
    loggers = await Logger.all().filter(user=user_obj)
    if loggers == []:
        return []
    return loggers

# Monitoring stuff


@app.post("/app-mon/{app_id}")
async def create_monitoring(monitoring_config: MonitoringConfig, app_id: UUID, current_user: User_Pydantic = Depends(get_current_active_user)):
    user_obj = await User.get(id=current_user.id)
    monitoring_app = await Monitoring.create(name=monitoring_config.app_name,
                                             user=user_obj,
                                             uuid=app_id)

    raise HTTPException(
        status_code=status.HTTP_201_CREATED,
        detail="Monitoring app created",
    )


@app.get("/apps-mon")
async def list_monitoring(current_user: User_Pydantic = Depends(get_current_active_user)):
    user_obj = await User.get(id=current_user.id)
    monitoring_apps = await Monitoring.all().filter(user=user_obj)
    if monitoring_apps == []:
        return {}
    return monitoring_apps


@app.post("/app-mon-status/{app_id}")
async def create_monitoring_status(monitoring_config: MonitoringStatusConfig, app_id: UUID, current_user: User_Pydantic = Depends(get_current_active_user)):
    monitoring_app = await Monitoring.get(uuid=app_id)
    if monitoring_app is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logger doesn't exist",
        )
    monitoring_statuses = await MonitoringStatus.all().filter(monitoring=monitoring_app).order_by("timestamp")
    if (len(monitoring_statuses) > 10):
        await monitoring_statuses[0].delete()
    monitoring_status = await MonitoringStatus.create(cpu=monitoring_config.cpu,
                                                      monitoring=monitoring_app)

    raise HTTPException(
        status_code=status.HTTP_201_CREATED,
        detail="Monitoring status added",
    )


@app.get("/app-mon-status/{app_id}")
async def list_monitoring_statuses(app_id: UUID, current_user: User_Pydantic = Depends(get_current_active_user)):
    monitoring_app = await Monitoring.get(uuid=app_id)
    if monitoring_app is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Monitoring app doesn't exist",
        )
    monitoring_statuses = await MonitoringStatus.all().filter(monitoring=monitoring_app).order_by("timestamp")
    if len(monitoring_statuses) == 0:
        return {}
    times = [x.timestamp.strftime("%H:%M:%S")
             for x in list(monitoring_statuses)]
    cpus = [x.cpu for x in list(monitoring_statuses)]
    data = [{"id": "cpu", "color": COLORS[0], "data": [{"x": x, "y": y} for x, y in zip(times, cpus)]}]
    return data


@ app.get("/")
async def root():
    return Response(content="OK", media_type="text/plain")


html = """
<p>merge?</p>
"""


@ app.post("/email")
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
