import re
import hashlib
import os
import binascii

from dotenv import load_dotenv
from jose import JWTError, jwt
from typing import Optional
from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, HTTPException, status
from models import Token, TokenData, User_Pydantic, User_Pydantic, User
from fastapi.security import OAuth2PasswordBearer

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ---------------- JWT STUFF ------------------------


def create_access_token(data: dict):
    to_encode = data.copy()
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.utcnow() + expires_delta

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    user = await User_Pydantic.from_queryset_single(User.get(email=email))
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: User_Pydantic = Depends(get_current_user)):
    return current_user

# -------------- PASSWORD HASHING -------------------


def valid_password(password: str) -> bool:
    # https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
    # at least 8 chars, uppercase, lowercase, number
    if re.fullmatch(r'^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$', password):
        return True
    else:
        return False


def hash_password(password: str):
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
    pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'),
                                  salt, 100000)  # 100k iterations
    pwdhash = binascii.hexlify(pwdhash)
    return (salt + pwdhash).decode('ascii')


def verify_password(password_hash: str, provided_password: str):
    salt = password_hash[:64]
    password_hash = password_hash[64:]
    passwordHash = hashlib.pbkdf2_hmac('sha512',
                                       provided_password.encode('utf-8'),
                                       salt.encode('ascii'),
                                       100000)
    passwordHash = binascii.hexlify(passwordHash).decode('ascii')

    return passwordHash == password_hash
