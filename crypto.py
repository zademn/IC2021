import re
import hashlib
import os
import binascii


def valid_password(password: str) -> bool:
    # at least 8 chars, uppercase, lowercase, symbol
    if re.fullmatch(r'[A-Za-z0-9@#$%^&!+=\?]{8,}', password):
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
