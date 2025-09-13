from sqlmodel import SQLModel, Field, Column, text
import sqlalchemy.dialects.postgresql as pg
from uuid import UUID
from typing import Optional

from src.auth.models import Users

# Before creating a relationship, both the tables should have primary keys

class Chats(SQLModel, table=True):
    __tablename__ = "chats"

    uuid: UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    )
    title: str
    youtube_video: str

    user_uid: UUID = Field(default=None, foreign_key="users.uuid")



class QuestionsAnswers(SQLModel, table=True):
    __tablename__ = "questionsandanswers"

    uuid: UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True, server_default=text("gen_random_uuid()"))
    )
    query: str
    answer: str

    chat_uid: Optional[UUID] = Field(foreign_key="chats.uuid")

