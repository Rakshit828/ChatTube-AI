from sqlmodel import SQLModel, Field, Column, text
import sqlalchemy.dialects.postgresql as pg

from datetime import datetime
from uuid import UUID, uuid4
from pydantic import EmailStr


class Users(SQLModel, table=True):
    __tablename__="users"
    
    uuid: UUID = Field(sa_column=(Column(pg.UUID, server_default=text('gen_random_uuid()'), primary_key=True)))
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    hashed_password: str
    is_verified: bool = False
    role: str = "user"
    created_at: datetime = Field(sa_column=Column(pg.TIMESTAMP, default=datetime.now))


    def __repr__(self):
        return f"<class Users {self.email}>"
