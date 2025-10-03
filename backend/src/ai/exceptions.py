from fastapi import HTTPException, status
from src.auth.exceptions import make_error_detail


class VectorDatabaseError(HTTPException):
    def __init__(
        self, 
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR, 
        detail = make_error_detail(error_name="vector_database_error", message="An unexpected server error during video related task was occurred"),
        headers = None
    ):
        super().__init__(status_code, detail, headers)


class RetrieverError(HTTPException):
    def __init__(
        self, 
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR, 
        detail = make_error_detail(error_name="retriever_error", message="An unexpected server error during video related task was occurred"),
        headers = None
    ):
        super().__init__(status_code, detail, headers)