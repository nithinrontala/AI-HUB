import os
from typing import List, Dict, Any
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer
import numpy as np
import logging

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.chunk_size = 500  # characters
        self.chunk_overlap = 50

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extracts all text from a PDF file."""
        if not os.path.exists(pdf_path):
            logger.error(f"PDF file not found: {pdf_path}")
            return ""
        
        try:
            reader = PdfReader(pdf_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF {pdf_path}: {e}")
            return ""

    def chunk_text(self, text: str) -> List[str]:
        """Splits text into smaller chunks for indexing."""
        chunks = []
        for i in range(0, len(text), self.chunk_size - self.chunk_overlap):
            chunks.append(text[i:i + self.chunk_size])
        return chunks

    def generate_embedding(self, text: str) -> List[float]:
        """Generates an embedding for a given text chunk."""
        embedding = self.model.encode(text)
        return embedding.tolist()

    async def index_course_pdfs(self, db):
        """Indexes all course PDFs into the database as chunks with embeddings."""
        courses = await db["courses"].find({"pdf_path": {"$exists": True}}).to_list(length=100)
        
        # Clear existing chunks to avoid duplicates
        await db["pdf_chunks"].delete_many({})
        
        indexed_count = 0
        for course in courses:
            pdf_path = course["pdf_path"]
            course_id = str(course["_id"])
            course_title = course["title"]
            
            logger.info(f"Indexing PDF for course: {course_title}")
            text = self.extract_text_from_pdf(pdf_path)
            if not text:
                continue
                
            chunks = self.chunk_text(text)
            chunk_docs = []
            for i, chunk in enumerate(chunks):
                embedding = self.generate_embedding(chunk)
                chunk_docs.append({
                    "course_id": course_id,
                    "course_title": course_title,
                    "chunk_index": i,
                    "text": chunk,
                    "embedding": embedding
                })
            
            if chunk_docs:
                await db["pdf_chunks"].insert_many(chunk_docs)
                indexed_count += len(chunk_docs)
        
        # Create a vector search index if supported by the MongoDB version
        # For local dev we'll just do manual cosine similarity in retrieve
        logger.info(f"Indexed {indexed_count} chunks from {len(courses)} courses.")
        return indexed_count

    async def retrieve_context(self, query: str, db, limit: int = 3) -> str:
        """Retrieves the most relevant text chunks for a given query."""
        query_embedding = self.generate_embedding(query)
        
        # In a real production app, you'd use MongoDB Atlas Vector Search ($vectorSearch)
        # For local MongoDB, we'll fetch all chunks and calculate similarity in memory
        # Note: This is fine for a small number of chunks (like our 8 PDFs)
        all_chunks = await db["pdf_chunks"].find({}).to_list(length=1000)
        
        scored_chunks = []
        for chunk in all_chunks:
            chunk_embedding = chunk.get("embedding")
            if chunk_embedding:
                similarity = self.calculate_similarity(query_embedding, chunk_embedding)
                scored_chunks.append({
                    "text": chunk["text"],
                    "course_title": chunk["course_title"],
                    "similarity": similarity
                })
        
        # Sort by similarity descending
        scored_chunks.sort(key=lambda x: x["similarity"], reverse=True)
        
        # Combine top results into context string
        top_chunks = scored_chunks[:limit]
        context = "\n\n".join([f"[Source: {c['course_title']}]\n{c['text']}" for c in top_chunks])
        return context

    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculates cosine similarity between two embeddings."""
        v1 = np.array(embedding1)
        v2 = np.array(embedding2)
        dot_product = np.dot(v1, v2)
        norm_v1 = np.linalg.norm(v1)
        norm_v2 = np.linalg.norm(v2)
        if norm_v1 == 0 or norm_v2 == 0:
            return 0.0
        return dot_product / (norm_v1 * norm_v2)

rag_service = RAGService()
