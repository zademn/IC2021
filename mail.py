from fastapi import (
    FastAPI, 
    BackgroundTasks, 
    UploadFile, File, 
    Form, 
    Query,
    Body,
    Depends
)
from starlette.responses import JSONResponse
from starlette.requests import Request
from fastapi_mail import FastMail, MessageSchema,ConnectionConfig
from pydantic import EmailStr, BaseModel
from typing import List
from fastapi_mail.email_utils import DefaultChecker
import mail_settings;




conf = ConnectionConfig(
    MAIL_USERNAME = mail_settings.MAIL_USERNAME,
    MAIL_PASSWORD = mail_settings.MAIL_PASSWORD,
    MAIL_FROM = mail_settings.MAIL_FROM,
    MAIL_PORT = mail_settings.MAIL_PORT,
    MAIL_SERVER = mail_settings.MAIL_SERVER,
    MAIL_FROM_NAME= mail_settings.MAIL_FROM_NAME
    MAIL_TLS = True,
    MAIL_SSL = False,
    USER_CREDENTIALS = True
)



html = """
<p>Hi this test mail, thanks for using Fastapi-mail</p> 
"""


@app.post("/email")
async def simple_send(
    email: EmailSchema
    ) -> JSONResponse:

    message = MessageSchema(
        subject="Fastapi-Mail module",
        recipients=email.dict().get("email"),  # List of recipients, as many as you can pass 
        body=html,
        subtype="html"
        )

    fm = FastMail(conf)
    await fm.send_message(message)
    return JSONResponse(status_code=200, content={"message": "email has been sent"})
