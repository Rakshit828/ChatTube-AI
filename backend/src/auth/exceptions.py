# errors.py
from fastapi import HTTPException, status

def make_error_detail(error_name: str, message: str):
    return {
        "error": error_name,
        "message": message
    }

# Authentication and Token Errors
class ExpiredJWTTokenError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=make_error_detail("expired_jwt_token_error", "JWT token has expired."),
            headers=headers
        )

class ExpiredAccessTokenError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=make_error_detail("expired_access_token_error", "Access token has expired."),
            headers=headers
        )

class ExpiredRefreshTokenError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=make_error_detail("expired_refresh_token_error", "Refresh token has expired."),
            headers=headers
        )

class InvalidAccessTokenError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=make_error_detail("invalid_access_token_error", "Invalid access token."),
            headers=headers
        )

class InvalidRefreshTokenError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=make_error_detail("invalid_refresh_token_error", "Invalid refresh token."),
            headers=headers
        )

class MissingAuthorizationHeaderError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=make_error_detail("missing_authorization_header_error", "Authorization header missing."),
            headers=headers
        )

# User-related Errors
class InvalidEmailError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=make_error_detail("invalid_email_error", "Email not found."),
            headers=headers
        )

class EmailAlreadyExistsError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=make_error_detail("email_already_exists_error", "Email already exists."),
            headers=headers
        )

class InvalidPasswordError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=make_error_detail("invalid_password_error", "Invalid password."),
            headers=headers
        )

class UserNotActiveError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=make_error_detail("user_not_active_error", "User account is not active."),
            headers=headers
        )

class AccountLockedError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_423_LOCKED,
            detail=make_error_detail("account_locked_error", "Account is locked."),
            headers=headers
        )

# Access Control Errors
class PermissionDeniedError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=make_error_detail("permission_denied_error", "You do not have permission to perform this action."),
            headers=headers
        )

class TooManyRequestsError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=make_error_detail("too_many_requests_error", "Too many requests. Please try again later."),
            headers=headers
        )
