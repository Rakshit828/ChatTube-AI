from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_chroma import Chroma
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda, RunnableSequence
from .youtube import load_video_transcript
from .utils import prompt, Utilities


class AiComponents:
    def __init__(self, 
        ai_model,
        embedding_model
    ):
        print("Loading AI components")
        self.llm = ChatGroq(model=ai_model, temperature=1, max_tokens=1500)

        self.embedding_model = HuggingFaceEmbeddings(model_name=embedding_model)

        self.vector_db = self.initialize_vector_db()

        self.retriever = self.vector_db.as_retriever()

        print("Loaded all AI components")

        self.utilities = Utilities(vector_db=self.vector_db, retriever=self.retriever)

        self.chains = self.build_chains()


    def initialize_vector_db(self):
        vector_db = Chroma(
            collection_name="youtube_videos",
            persist_directory="chroma_db",
            embedding_function=self.embedding_model
        )
        return vector_db
    

    def retrieve_relevant_context(self, data):
        self.retriever.search_type = data['search_type']
        self.retriever.search_kwargs = data['search_kwargs']
 
        context = self.retriever.invoke(input=data['query'])
        return context
    

    def build_chains(self):
        general_chain = RunnableSequence(
            RunnableLambda(load_video_transcript),
            RunnableLambda(self.utilities.split_transcript_into_texts),
            RunnableLambda(self.utilities.add_into_vector_store)
        )

        parallel_chain = RunnableParallel({
            "context": RunnableLambda(self.retrieve_relevant_context) | RunnableLambda(self.utilities.format_docs),
            "user_query": RunnablePassthrough()
        })
        
        main_processing_chain = parallel_chain | prompt | self.llm | self.utilities.parser
        return {"general_chain": general_chain, "main_processing_chain": main_processing_chain}



def initialize_ai_components(
    ai_model='meta-llama/llama-4-scout-17b-16e-instruct',
    embedding_model='sentence-transformers/all-MiniLM-L6-v2'
):
    return AiComponents(ai_model, embedding_model)
