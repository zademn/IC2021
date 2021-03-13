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
import mail_settings


conf = ConnectionConfig(
    MAIL_USERNAME=mail_settings.MAIL_USERNAME,
    MAIL_PASSWORD=mail_settings.MAIL_PASSWORD,
    MAIL_FROM=mail_settings.MAIL_FROM,
    MAIL_PORT=mail_settings.MAIL_PORT,
    MAIL_SERVER=mail_settings.MAIL_SERVER,
    MAIL_FROM_NAME=mail_settings.MAIL_FROM_NAME,
    MAIL_TLS=True,
    MAIL_SSL=False,
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
