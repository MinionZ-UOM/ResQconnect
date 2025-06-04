from pathlib import Path
from langchain.vectorstores import FAISS
from langchain.document_loaders import PyPDFLoader
from langchain.embeddings import HuggingFaceEmbeddings  # or any other embedding model
from langchain.schema import Document
from typing import List

from app.utils.logger import get_logger
logger = get_logger(__name__)

def build_vectorstores_from_pdfs(source_dir: str = 'app/agent/rag/docs', target_dir: str = 'app/agent/rag/vectorstore'):
    source_path = Path(source_dir)
    target_path = Path(target_dir)
    
    # Ensure target directory exists
    target_path.mkdir(parents=True, exist_ok=True)

    # Embeddings model
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    # Process each PDF in the source directory
    for pdf_file in source_path.glob("*.pdf"):
        collection_name = pdf_file.stem
        collection_path = target_path / collection_name

        # Skip if vectorstore already exists
        if collection_path.exists():
            logger.info(f"Collection '{collection_name}' already exists. Skipping...")
            continue

        logger.info(f"Processing {pdf_file.name} -> collection '{collection_name}'")

        # Load and split the PDF
        loader = PyPDFLoader(str(pdf_file))
        documents = loader.load_and_split()

        # Create vectorstore
        vectorstore = FAISS.from_documents(documents, embeddings)

        # Save to disk
        vectorstore.save_local(str(collection_path))
        logger.info(f"Collection '{collection_name}' saved at '{collection_path}'")

def retrieve_from_collection(
    collection_name: str,
    query: str,
    k: int = 3,
    target_dir: str = 'app/agent/rag/vectorstore'
) -> List[Document]:
    """
    Load a vectorstore collection and retrieve top-k documents for a given query.
    """
    collection_path = Path(target_dir) / collection_name

    if not collection_path.exists():
        raise FileNotFoundError(f"Collection '{collection_name}' not found in '{target_dir}'")

    # Load embedding model
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    # Load vectorstore
    vectorstore = FAISS.load_local(str(collection_path), embeddings, allow_dangerous_deserialization=True)

    # Retrieve relevant documents
    docs = vectorstore.similarity_search(query, k=k)

    return docs

def parse_documents_to_text(docs: List[Document]) -> str:
    return "\n\n".join([doc.page_content for doc in docs])