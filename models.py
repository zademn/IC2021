from tortoise import fields, models
from tortoise.contrib.pydantic import pydantic_model_creator
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from enum import Enum, IntEnum
from uuid import uuid4

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from fastapi_mail.email_utils import DefaultChecker

# the jwt token


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class Status(BaseModel):
    message: str


class UserIn(BaseModel):
    email: EmailStr
    password: str


class User(models.Model):
    """
    The User model
    """

    id = fields.IntField(pk=True)
    uuid = fields.UUIDField(default=uuid4)
    email = fields.CharField(max_length=128, unique=True)
    password_hash = fields.CharField(max_length=192, null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    modified_at = fields.DatetimeField(auto_now=True)

    # def last_modified(self) -> str:
    #     """
    #     Returns the best name
    #     """
    #     if self.name or self.family_name:
    #         return f"{self.name or ''} {self.family_name or ''}".strip()
    #     return self.username

    class PydanticMeta:
        # computed = ["full_name"]
        exclude = ["password_hash", "uuid"]


User_Pydantic = pydantic_model_creator(
    User, name="User", exclude=('created_at', 'modified_at', 'uuid'))


class HealthCheck(models.Model):
    """
    HealthCheck model
    """
    # Id stuff
    id = fields.IntField(pk=True)
    uuid = fields.UUIDField()
    name = fields.CharField(max_length=128, unique=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    modified_at = fields.DatetimeField(auto_now=True)
    period = fields.IntField(default=5)
    grace = fields.IntField(default=5)

    # Relations
    user: fields.ForeignKeyRelation[User] = fields.ForeignKeyField(
        "models.User")


HealthCheck_Pydantic = pydantic_model_creator(
    HealthCheck, name="HealthCheck", exclude=('created_at', 'modified_at'))


class HealthCheckStatus(models.Model):
    """
    Status for the health check for an app
    """
    # Id stuff
    id = fields.IntField(pk=True)
    last_received = fields.DatetimeField()
    next_receive = fields.DatetimeField()
    done = fields.BooleanField(default=False)

    # Relations
    health_check: fields.ForeignKeyRelation[HealthCheck] = fields.ForeignKeyField(
        "models.HealthCheck")


HealthCheckStatus_Pydantic = pydantic_model_creator(
    HealthCheckStatus, name="HealthCheckStatus")


class Monitoring(models.Model):
    """
    Monitoring model
    """
    id = fields.IntField(pk=True)
    uuid = fields.UUIDField()
    name = fields.CharField(max_length=128, unique=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    modified_at = fields.DatetimeField(auto_now=True)
    user: fields.ForeignKeyRelation[User] = fields.ForeignKeyField(
        "models.User")


Monitoring_Pydantic = pydantic_model_creator(
    Monitoring, name="Monitoring", exclude=('created_at', 'modified_at'))


class Logger(models.Model):
    '''
    Logger class
    '''
    id = fields.IntField(pk=True)
    uuid = fields.UUIDField()
    name = fields.CharField(max_length=128, unique=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    modified_at = fields.DatetimeField(auto_now=True)

    # Relations
    user: fields.ForeignKeyRelation[User] = fields.ForeignKeyField(
        "models.User")


Logger_Pydantic = pydantic_model_creator(
    Logger, name="Logger", exclude=('created_at', 'modified_at', 'uuid'))


class LoggerStatus(models.Model):
    '''
    Logger status for Logger app
    '''
    # Id stuff
    id = fields.IntField(pk=True)
    timestamp = fields.DatetimeField(auto_now_add=True)
    device_id = fields.CharField(max_length=128)
    severity_level = fields.IntField()
    message = fields.CharField(max_length=1024)

    # Relations
    logger: fields.ForeignKeyRelation[Logger] = fields.ForeignKeyField(
        "models.Logger")


LoggerStatus_Pydantic = pydantic_model_creator(
    LoggerStatus, name="LoggerStatus")


class EmailSchema(BaseModel):
    email: List[EmailStr]
    content: str


class LoggerStatusConfig(BaseModel):
    #data: Dict[str, str]
    device_id: str
    severity_level: int
    message: str


class LoggerConfig(BaseModel):
    app_name: str


class HealthCheckConfig(BaseModel):
    app_name: str
    period: int
    grace: int
