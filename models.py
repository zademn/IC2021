from tortoise import fields, models
from tortoise.contrib.pydantic import pydantic_model_creator
from pydantic import BaseModel, EmailStr
from typing import Optional, List
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


class Cron(models.Model):
    """
    Cron model
    """
    # Id stuff
    id = fields.IntField(pk=True)
    uuid = fields.UUIDField()
    name = fields.CharField(max_length=128, unique=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    modified_at = fields.DatetimeField(auto_now=True)
    # Cron stuff
    data = fields.CharField(max_length=256)
    schedule = fields.CharField(max_length=100, default="* */5 * * *")

    # Relations
    user: fields.ForeignKeyRelation[User] = fields.ForeignKeyField(
        "models.User")


Cron_Pydantic = pydantic_model_creator(
    Cron, name="Cron", exclude=('created_at', 'modified_at'))


class MonitoringService(str, Enum):
    cpu = 'cpu'
    memory = 'memory'
    disk = 'disk'


class Monitoring(models.Model):
    """
    Monitoring model
    """
    id = fields.IntField(pk=True)
    uuid = fields.UUIDField()
    name = fields.CharField(max_length=128, unique=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    modified_at = fields.DatetimeField(auto_now=True)
    service = fields.CharEnumField(MonitoringService)
    user: fields.ForeignKeyRelation[User] = fields.ForeignKeyField(
        "models.User")


Monitoring_Pydantic = pydantic_model_creator(
    Monitoring, name="Monitoring", exclude=('created_at', 'modified_at'))


class Logger(models.Model):
    id = fields.IntField(pk=True)
    monitoring: fields.OneToOneRelation[Monitoring] = fields.OneToOneField(
        "models.Monitoring")
    data = fields.CharField(max_length=1024)


Logger_Pydantic = pydantic_model_creator(
    Logger, name="Logger", exclude=('created_at', 'modified_at', 'uuid'))


class EmailSchema(BaseModel):
    email: List[EmailStr]
    content: str
