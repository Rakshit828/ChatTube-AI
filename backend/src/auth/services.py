from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from fastapi import HTTPException, status

from .models import Users
from .schemas import UserCreateSchema, UserLogInSchema
from .utils import generate_password_hash, verify_user, create_jwt_tokens


class AuthService:

    async def get_user_by_uuid(self, user_uid: str, session: AsyncSession):
        """Returns the user with the respective email"""

        statement = select(Users).where(Users.uuid == user_uid)
        result = await session.exec(statement)
        result = result.first() 
        return result
    

    async def get_user_by_email(self, email: str, session: AsyncSession):
        """Returns the user with the respective email"""

        statement = select(Users).where(Users.email == email)
        result = await session.exec(statement)
        result = result.first() # We cannot do .first() two times in the same code
        return result
    

    async def delete_user(self, email: str, session: AsyncSession):
        user = await self.get_user_by_email(email, session)
        if not user:
            raise HTTPException(
                detail={"msg": "Email doesnot exist / Invalid Email"},
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        await session.delete(user)
        await session.commit()
        return 


    async def log_in_user(self, user_data: UserLogInSchema, session: AsyncSession):
        """Verifies the user and issues both the Access and Refresh Tokens"""

        user_data_dict = user_data.model_dump()
        email = user_data_dict.get('email')
        user = await self.get_user_by_email(email, session)

        if not user:
            raise HTTPException(
                detail={"msg": "Email doesnot exist / Invalid Email"},
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        password = user_data_dict.get('password')
        hashed_password = user.hashed_password
        is_verified = verify_user(password, hashed_password)

        if not is_verified:
            raise HTTPException(detail={"error": "Invalid password"}, status_code=status.HTTP_401_UNAUTHORIZED)

        uuid = user.uuid
        username = user.username
        role = user.role

        tokens = await create_jwt_tokens(user_uuid=uuid, role=role)
        return tokens
    


    async def make_account(self, user_data: UserCreateSchema, session: AsyncSession):
        """Creates the user account on the database"""
        user_data_dict = user_data.model_dump()
     
        email = user_data_dict.get('email')
        user_exists = await self.get_user_by_email(email, session)

        if user_exists:
            raise HTTPException(
                detail={"msg": "Email already exists"},
                status_code=status.HTTP_409_CONFLICT
            )
        
        password = user_data_dict.get('password')
        hashed_password = generate_password_hash(password)
        user_data_dict['hashed_password'] = hashed_password
        user_data_dict.pop('password')
    
        new_user = Users(**user_data_dict)
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)

        return new_user
    
