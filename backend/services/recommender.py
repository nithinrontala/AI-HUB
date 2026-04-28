from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Any

class RecommenderService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def generate_embedding(self, text: str) -> List[float]:
        """Generates an embedding for a given text."""
        embedding = self.model.encode(text)
        return embedding.tolist()

    def prepare_course_text(self, course: Dict[str, Any]) -> str:
        """Combines course metadata into a single string for embedding."""
        title = course.get("title", "")
        description = course.get("description", "")
        tags = " ".join(course.get("tags", []))
        return f"{title} {description} {tags}"

    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculates cosine similarity between two embeddings."""
        v1 = np.array(embedding1)
        v2 = np.array(embedding2)
        dot_product = np.dot(v1, v2)
        norm_v1 = np.linalg.norm(v1)
        norm_v2 = np.linalg.norm(v2)
        return dot_product / (norm_v1 * norm_v2)

recommender_service = RecommenderService()
