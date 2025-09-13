from langchain_core.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.output_parsers import StrOutputParser
from langchain_community.vectorstores import FAISS
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda
from typing import List
from .components import Components

from .components import ai_components
from .youtube import load_video_transcript

# Initializing the splitter
splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100
)


def split_transcript_into_texts(transcript_text: str) -> List[str]:
    splitted_transcript = splitter.split_text(text=transcript_text)
    return splitted_transcript


def add_into_vector_store(splitted_transcript: List[str]):
    ai_components.vector_store.add_texts(texts=splitted_transcript)
    return


def format_docs(retrieved_docs):
  context_text = "\n\n".join(doc.page_content for doc in retrieved_docs)
  return context_text


prompt = PromptTemplate(
    template= """
        Below is the context from the transcript of the youtube
        video. You have to solve my query from the give context only. That's it. Just the given context. No
        extra information.

        CONTEXT : \n
        {context}

        \n\n\n

        MY QUERY : \n
        {user_query}
    """,
    input_variables=['context', 'user_query']
)
parser = StrOutputParser()


def build_chains(ai_components: Components):
    general_chain = RunnableLambda(load_video_transcript) | RunnableLambda(split_transcript_into_texts) | RunnableLambda(add_into_vector_store)
    parallel_chain = RunnableParallel({
        "context": ai_components.retriever | RunnableLambda(format_docs),
        "user_query": RunnablePassthrough()
    })
    main_processing_chain = parallel_chain | prompt | ai_components.llm | parser
    return {"general_chain": general_chain, "main_processing_chain": main_processing_chain}
