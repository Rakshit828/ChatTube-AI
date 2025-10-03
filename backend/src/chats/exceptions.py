from fastapi import HTTPException, status
from src.auth.exceptions import make_error_detail  # adjust the import based on your file structure


class InvalidYoutubeURLError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=make_error_detail("invalid_youtube_url_error", "Invalid YouTube video URL."),
            headers=headers
        )


class TranscriptDoesNotExistError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=make_error_detail("transcript_does_not_exist_error", "Load the video first."),
            headers=headers
        )


class TranscriptAlreadyExistError(HTTPException):
    def __init__(self, headers=None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=make_error_detail("transcript_already_exists_error", "Video already loaded."),
            headers=headers
        )
