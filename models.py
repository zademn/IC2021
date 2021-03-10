from tortoise import fields, models
from tortoise.contrib.pydantic import pydantic_model_creator
from pydantic import BaseModel, EmailStr


class Status(BaseModel):
    message: str


class UserIn(BaseModel):
    email: EmailStr
    password: str


class Users(models.Model):
    """
    The User model
    """

    id = fields.IntField(pk=True)
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
        exclude = ["password_hash"]


User_Pydantic = pydantic_model_creator(
    Users, name="User", exclude=('created_at', 'modified_at'))
