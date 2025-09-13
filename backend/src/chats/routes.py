from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from src.ai.components import ai_components
from .schemas import ChatSchema, CreateQASchema, ResponseQASchema
from .services import chat_service
from src.db.main import get_session
from src.auth.dependencies import AccessTokenBearer
from typing import Dict, List

chats_router = APIRouter()


@chats_router.post(
    "/newchat", 
    response_model=ChatSchema
)
async def create_new_chat(
    chat_data: ChatSchema,
    session: AsyncSession = Depends(get_session),
    decoded_token_data: Dict = Depends(AccessTokenBearer())
):
    user_uid = decoded_token_data['sub']
    chat_data_dict = chat_data.model_dump()
    new_chat = await chat_service.create_chat(user_uid=user_uid, chat_data=chat_data_dict, session=session)
    return new_chat



@chats_router.post(
    "/newqa", 
    response_model=ResponseQASchema
)
async def create_new_qa(
    qa_data: CreateQASchema,
    session: AsyncSession = Depends(get_session),
    decoded_token_data: Dict = Depends(AccessTokenBearer())
):
    qa_data_dict = qa_data.model_dump()
    new_qa = await chat_service.create_qa(qa_data=qa_data_dict, session=session)
    return new_qa



@chats_router.get(
        "/qa/{chat_uid}",
        response_model=List[ResponseQASchema]
)
async def get_all_qa(
    chat_uid: str,
    session: AsyncSession = Depends(get_session),
    decoded_token_data: Dict = Depends(AccessTokenBearer())
):
    result = await chat_service.get_all_qa(chat_uid, session)
    return result




@chats_router.get("/video/{video_id}")
async def generate_tanscript(
    video_id: str,
    decoded_token_data: Dict = Depends(AccessTokenBearer())
):
    try:
        ai_components.chains['general_chain'].invoke(video_id)
        return True
    except Exception as e:
        return JSONResponse(
            content={"error": f"{e}"}
        )

  

@chats_router.get("/response/{query}")
async def get_response_from_llm(
    query: str,
    decoded_token_data: Dict = Depends(AccessTokenBearer())
):
    response = ai_components.chains['main_processing_chain'].invoke(query)
    return response

