from fastapi import (
    FastAPI,
    BackgroundTasks,
    UploadFile, File,
    Form,
    Query,
    Body,
    Depends
)

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr, BaseModel
from fastapi_mail.email_utils import DefaultChecker
from dotenv import load_dotenv

import os

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT") or 587),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME"),
    MAIL_TLS=True if os.getenv("MAIL_TLS") == "True" else False,
    MAIL_SSL=True if os.getenv("MAIL_SSL") == "False" else False,
)


async def simple_send(emails, content):

    message = MessageSchema(
        subject="yes",
        recipients=emails,
        body=content,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
