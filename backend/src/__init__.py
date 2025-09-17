from fastapi import FastAPI, Request
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
from contextlib import asynccontextmanager

from src.ai.main import build_chains
from src.ai.components import ai_components
from src.db.main import init_db

load_dotenv()

VERSION = 'v1'

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("Started loading ML model")
    embedding_model = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
    print("Loaded ML model")
    
    llm = ChatGroq(model='openai/gpt-oss-20b', temperature=1.2, max_tokens=1000)
    # llama-3.1-8b-instant
    # meta-llama/llama-4-scout-17b-16e-instruct
    # openai/gpt-oss-20b
    # openai/gpt-oss-120b

    ai_components.llm = llm
    ai_components.embedding_model = embedding_model

    from langchain_community.vectorstores import FAISS

    ai_components.vector_store = FAISS.from_texts(
        texts=["Initial text for initializing database"],
        embedding=embedding_model
    )

    ai_components.retriever = ai_components.vector_store.as_retriever(
        search_type='similarity',
        k=2,
    )

    ai_components.chains = build_chains(ai_components)

    yield



app = FastAPI(
    title="ChatTube",
    version=VERSION,
    lifespan=lifespan
    # The lifespan event expects a context manager
)


# Define allowed origins
origins = [
    "http://localhost:5173"
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # allows requests from this origin
    allow_credentials=True,     # allows cookies, authorization headers, etc.
    allow_methods=["*"],        # allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],        # allows all headers
)


from src.chats.routes import chats_router
from src.auth.routes import auth_routes

app.include_router(chats_router, tags=['Chats'])
app.include_router(auth_routes, tags=['Authentication'])