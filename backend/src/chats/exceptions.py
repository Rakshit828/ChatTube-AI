from fastapi import HTTPException, status


class InvalidYoutubeURLError(HTTPException):
    def __init__(
        self, 
        status_code = status.HTTP_400_BAD_REQUEST, 
        detail = "Invalid youtube video URL.", 
        headers = None
    ):
        super().__init__(status_code, detail, headers)
