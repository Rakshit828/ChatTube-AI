from langchain_core.prompts import PromptTemplate
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.output_parsers import StrOutputParser
from langchain_chroma import Chroma
from typing import List


prompt = PromptTemplate(
    template= """
        Below is the context from the transcript of the youtube
        video. You have to solve my query from the given context only. That's it. Just the given context. No
        extra information.

        CONTEXT : \n
        {context}

        \n\n\n

        MY QUERY : \n
        {user_query}


        \n
        Answer as humanly as possible.
    """,
    input_variables=['context', 'user_query']
)


class Utilities:
    def __init__(self, retriever, vector_db):
      self.retriever = retriever
      self.vector_db = vector_db

      self.splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100
      )

      self.parser = StrOutputParser()


    def split_transcript_into_texts(self, video_data: dict[str, str]):
        # The video data has keys : user_id, video_id, transcript_text
        transcript_text = video_data.get("transcript_text")
        splitted_transcript = self.splitter.split_text(text=transcript_text)
        
        del video_data['transcript_text']

        video_data.update({"splitted_transcript": splitted_transcript})

        return video_data



    def add_into_vector_store(self, video_data: dict[str, str]):
        # The video data has keys: user_id, video_id and splitted_transcript
        splitted_transcript = video_data['splitted_transcript']
        del video_data['splitted_transcript']
        metadata = video_data
        splitted_transcript_documents = [
            Document(
                page_content=individual_split, 
                metadata=metadata
            ) for individual_split in splitted_transcript
        ]
        self.vector_db.add_documents(splitted_transcript_documents)
        return


    def format_docs(self, retrieved_docs):
        context_text = "\n\n".join(doc.page_content for doc in retrieved_docs)
        return context_text
    


