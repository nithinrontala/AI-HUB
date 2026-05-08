from sentence_transformers import SentenceTransformer
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from sklearn.metrics.pairwise import cosine_similarity

class RecommenderService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.classifier = None # Lazy load to save memory if not used
        self.interaction_weights = {
            "video_view": 1,
            "quiz_attempt": 2,
            "ai_chat": 1,
            "course_completion": 5
        }

    def _get_classifier(self):
        if self.classifier is None:
            from transformers import pipeline
            # Using a smaller model for zero-shot classification
            self.classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
        return self.classifier

    def generate_embedding(self, text: str) -> List[float]:
        """Generates an embedding for a given text."""
        embedding = self.model.encode(text)
        return embedding.tolist()

    def semantic_search(self, query: str, all_courses: List[Dict[str, Any]], limit: int = 5) -> List[Dict[str, Any]]:
        """Performs semantic search on courses using the query embedding."""
        query_embedding = self.generate_embedding(query)
        results = []
        
        for course in all_courses:
            embedding = course.get("embedding")
            if embedding:
                similarity = self.calculate_similarity(query_embedding, embedding)
                course_copy = course.copy()
                course_copy["similarity"] = float(similarity)
                course_copy["id"] = str(course.get("_id", course.get("id")))
                results.append(course_copy)
        
        # Sort by similarity descending
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:limit]

    def zero_shot_classify(self, text: str, candidate_labels: List[str]) -> Dict[str, Any]:
        """Classifies text into candidate labels without training."""
        classifier = self._get_classifier()
        result = classifier(text, candidate_labels, multi_label=True)
        return result

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
        
        # Ensure IDs are strings
        df['user_id'] = df['user_id'].apply(str)
        df['course_id'] = df['course_id'].apply(str)
        
        # Map interaction types to weights
        df['weight'] = df['interaction_type'].map(lambda x: self.interaction_weights.get(x, 1))
        
        # Aggregate weights per user-course pair
        interaction_matrix = df.groupby(['user_id', 'course_id'])['weight'].sum().unstack(fill_value=0)
        
        return interaction_matrix

    def get_collaborative_recommendations(self, target_user_id: str, interaction_matrix: pd.DataFrame) -> Dict[str, float]:
        """Generates recommendations using User-Based Collaborative Filtering. Returns dict of {course_id: score}."""
        if interaction_matrix.empty or target_user_id not in interaction_matrix.index:
            return {}

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
                
            user_interactions = interaction_matrix.loc[sim_user]
            new_courses = user_interactions.drop(interacted_courses, errors='ignore')
            recommendations = recommendations.add(new_courses * similarity, fill_value=0)

        if recommendations.empty:
            return {}

        # Normalize scores to 0-1 range
        max_score = recommendations.max()
        if max_score > 0:
            recommendations = recommendations / max_score

        return recommendations.to_dict()

    def get_content_based_recommendations(self, target_user_id: str, interaction_matrix: pd.DataFrame, all_courses: List[Dict[str, Any]]) -> Dict[str, float]:
        """Generates recommendations based on course content similarity to user's history."""
        if interaction_matrix.empty or target_user_id not in interaction_matrix.index:
            return {}

        # Get target user's interaction history
        user_history = interaction_matrix.loc[target_user_id]
        interacted_course_ids = user_history[user_history > 0].index.tolist()
        
        if not interacted_course_ids:
            return {}

        # Build user profile by averaging embeddings of interacted courses (weighted by interaction strength)
        course_embeddings = {str(c["_id"]): c.get("embedding") for c in all_courses if c.get("embedding")}
        
        user_profile_vec = np.zeros(384) # Dim for all-MiniLM-L6-v2
        total_weight = 0
        
        for course_id in interacted_course_ids:
            if course_id in course_embeddings:
                weight = user_history[course_id]
                user_profile_vec += np.array(course_embeddings[course_id]) * weight
                total_weight += weight
        
        if total_weight == 0:
            return {}
            
        user_profile_vec /= total_weight

        # Calculate similarity of all courses to user profile
        recommendations = {}
        for course in all_courses:
            course_id = str(course["_id"])
            if course_id in interacted_course_ids:
                continue # Skip already interacted courses
                
            embedding = course.get("embedding")
            if embedding:
                similarity = self.calculate_similarity(user_profile_vec.tolist(), embedding)
                recommendations[course_id] = float(similarity)

        return recommendations

    def get_hybrid_recommendations(
        self, 
        target_user_id: str, 
        interactions: List[Dict[str, Any]], 
        all_courses: List[Dict[str, Any]], 
        cf_weight: float = 0.5, 
        cb_weight: float = 0.5,
        limit: int = 5
    ) -> List[Tuple[str, float]]:
        """Combines Collaborative and Content-Based recommendations with specified weights."""
        
        interaction_matrix = self.build_interaction_matrix(interactions)
        
        cf_scores = self.get_collaborative_recommendations(target_user_id, interaction_matrix)
        cb_scores = self.get_content_based_recommendations(target_user_id, interaction_matrix, all_courses)
        
        # Combine scores
        all_course_ids = set(cf_scores.keys()).union(set(cb_scores.keys()))
        hybrid_scores = []
        
        for course_id in all_course_ids:
            cf_score = cf_scores.get(course_id, 0)
            cb_score = cb_scores.get(course_id, 0)
            
            # Weighted average
            final_score = (cf_score * cf_weight) + (cb_score * cb_weight)
            hybrid_scores.append((course_id, final_score))
            
        # 4. Fallback if no hybrid recommendations found
        if not hybrid_scores:
            # Simple popularity score (number of interactions)
            interaction_counts = interaction_matrix.sum(axis=0).sort_values(ascending=False)
            # Exclude already interacted courses
            if target_user_id in interaction_matrix.index:
                user_history = interaction_matrix.loc[target_user_id]
                interacted_ids = user_history[user_history > 0].index.tolist()
                interaction_counts = interaction_counts.drop(interacted_ids, errors='ignore')
            
            hybrid_scores = [(str(cid), float(score)) for cid, score in interaction_counts.head(limit).items()]

        # Rank by score
        hybrid_scores.sort(key=lambda x: x[1], reverse=True)
        
        return hybrid_scores[:limit]

recommender_service = RecommenderService()

