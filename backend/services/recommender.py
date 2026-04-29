from sentence_transformers import SentenceTransformer
import numpy as np
import pandas as pd
from typing import List, Dict, Any
from sklearn.metrics.pairwise import cosine_similarity

class RecommenderService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.interaction_weights = {
            "video_view": 1,
            "quiz_attempt": 2,
            "ai_chat": 1,
            "course_completion": 5
        }

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
        if norm_v1 == 0 or norm_v2 == 0:
            return 0.0
        return dot_product / (norm_v1 * norm_v2)

    def build_interaction_matrix(self, interactions: List[Dict[str, Any]]) -> pd.DataFrame:
        """Builds a user-item interaction matrix from raw interactions."""
        if not interactions:
            return pd.DataFrame()

        df = pd.DataFrame(interactions)
        
        # Map interaction types to weights
        df['weight'] = df['interaction_type'].map(lambda x: self.interaction_weights.get(x, 1))
        
        # Aggregate weights per user-course pair
        interaction_matrix = df.groupby(['user_id', 'course_id'])['weight'].sum().unstack(fill_value=0)
        
        return interaction_matrix

    def get_collaborative_recommendations(self, target_user_id: str, interaction_matrix: pd.DataFrame, limit: int = 5) -> List[str]:
        """Generates recommendations using User-Based Collaborative Filtering."""
        if interaction_matrix.empty or target_user_id not in interaction_matrix.index:
            return []

        # Calculate User Similarity Matrix
        user_sim = cosine_similarity(interaction_matrix)
        user_sim_df = pd.DataFrame(user_sim, index=interaction_matrix.index, columns=interaction_matrix.index)

        # Get similar users for the target user (excluding themselves)
        similar_users = user_sim_df[target_user_id].sort_values(ascending=False)[1:]

        # Get courses the target user has already interacted with
        interacted_courses = interaction_matrix.loc[target_user_id]
        interacted_courses = interacted_courses[interacted_courses > 0].index.tolist()

        # Weighted sum of interactions from similar users
        recommendations = pd.Series(dtype=float)
        
        for sim_user, similarity in similar_users.items():
            if similarity <= 0:
                continue
                
            # Get courses this similar user has interacted with
            user_interactions = interaction_matrix.loc[sim_user]
            # Exclude courses the target user already knows
            new_courses = user_interactions.drop(interacted_courses, errors='ignore')
            
            # Add weighted interactions to recommendations
            recommendations = recommendations.add(new_courses * similarity, fill_value=0)

        # Sort and return top course IDs
        return recommendations.sort_values(ascending=False).head(limit).index.tolist()

recommender_service = RecommenderService()
