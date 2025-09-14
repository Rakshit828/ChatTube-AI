# errors.py
from fastapi import HTTPException, status


# Authentication and Token Errors
class ExpiredAccessTokenError(HTTPException):
    def __init__(
        self,
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Access token has expired.",
        headers=None
    ):
        super().__init__(status_code, detail, headers)


class ExpiredRefreshTokenError(HTTPException):
    def __init__(
        self,
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token has expired.",
        headers=None
    ):
        super().__init__(status_code, detail, headers)


class InvalidAccessTokenError(HTTPException):
    def __init__(
        self,
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid access token.",
        headers=None
    ):
        super().__init__(status_code, detail, headers)


class InvalidRefreshTokenError(HTTPException):
    def __init__(
        self,
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token.",
        headers=None
    ):
        super().__init__(status_code, detail, headers)


class MissingAuthorizationHeaderError(HTTPException):
    def __init__(
        self,
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Authorization header missing.",
        headers=None
    ):
        super().__init__(status_code, detail, headers)


# User-related Errors
class InvalidEmailError(HTTPException):
    def __init__(
        self,
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Email not found.",
        headers=None
    ):
        super().__init__(status_code, detail, headers)


class EmailAlreadyExistsError(HTTPException):
    def __init__(
        self,
        status_code=status.HTTP_409_CONFLICT,
        detail="Email already exists.",
        headers=None
    ):
        super().__init__(status_code, detail, headers)


class InvalidPasswordError(HTTPException):
    def __init__(
        self,
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid password.",
        headers=None
    ):
        super().__init__(status_code, detail, headers)


class UserNotActiveError(HTTPException):
    def __init__(
        self,
        status_code=status.HTTP_403_FORBIDDEN,
        detail="User account is not active.",
        headers=None
    ):
        super().__init__(status_code, detail, headers)


class AccountLockedError(HTTPException):
    def __init__(
        self,
        status_code=status.HTTP_423_LOCKED,
        detail="Account is locked.",
        headers=None
    ):
        super().__init__(status_code, detail, headers)


# Access Control Errors
class PermissionDeniedError(HTTPException):
    def __init__(
        self,
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to perform this action.",
        headers=None
    ):
        super().__init__(status_code, detail, headers)


class TooManyRequestsError(HTTPException):
    def __init__(
        self,
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail="Too many requests. Please try again later.",
        headers=None
    ):
        super().__init__(status_code, detail, headers)
