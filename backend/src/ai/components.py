class Components:
    def __init__(self, llm = None, embedding_model = None):
        self.llm = llm
        self.embedding_model = embedding_model
        self.vector_store = None
        self.retriever = None
        self.chains = None

ai_components = Components()
