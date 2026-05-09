import logging
import asyncio
from huggingface_hub import InferenceClient
from core.config import settings
from services.rag_service import rag_service
from core.database import get_database

logger = logging.getLogger(__name__)


class ChatbotService:
    """
    AI Chatbot service powered by Hugging Face Inference API with RAG.
    Uses a powerful instruction-tuned model with streaming support
    for real-time, token-by-token responses grounded in course materials.
    """

    def __init__(self):
        self.model_id = "HuggingFaceH4/zephyr-7b-beta"
        self.client = InferenceClient(
            model=self.model_id,
            token=settings.HF_API_TOKEN,
        )
        # Per-user conversation histories
        self.histories: dict[str, list[dict]] = {}
        # Base system prompt
        self.system_prompt = (
            "You are an expert AI Learning Assistant for an online education platform "
            "called AI Learning Hub. You help students understand artificial intelligence, "
            "machine learning, deep learning, NLP, computer vision, and related topics.\n\n"
            "Use the provided context from course materials to answer the user's question. "
            "If the answer isn't in the context, use your general knowledge but mention "
            "it's not from the course PDFs.\n\n"
            "Explain concepts clearly, recommend learning resources, and provide "
            "code examples when helpful. Keep responses concise but thorough. "
            "Use markdown formatting for code blocks and lists when appropriate."
        )
        logger.info(f"ChatbotService initialized with model: {self.model_id}")

    async def _get_messages(self, user_id: str, user_input: str) -> list[dict]:
        """Build the messages list for the chat completion API with RAG context."""
        if user_id not in self.histories:
            self.histories[user_id] = []

        # 1. Retrieve relevant context using RAG
        db = get_database()
        context = await rag_service.retrieve_context(user_input, db)
        
        # 2. Build the augmented system prompt
        augmented_system_prompt = self.system_prompt
        if context:
            augmented_system_prompt += f"\n\nRELEVANT COURSE CONTEXT:\n{context}"

        # Add the new user message to history
        self.histories[user_id].append({"role": "user", "content": user_input})

        # Keep only the last 10 messages to avoid token limits (RAG context takes space)
        if len(self.histories[user_id]) > 10:
            self.histories[user_id] = self.histories[user_id][-10:]

        # Build full messages list with augmented system prompt
        messages = [{"role": "system", "content": augmented_system_prompt}]
        messages.extend(self.histories[user_id])
        return messages

    async def get_response(self, user_input: str, user_id: str) -> str:
        """Get a complete (non-streaming) response from the model."""
        try:
            messages = await self._get_messages(user_id, user_input)
            response = self.client.chat_completion(
                messages=messages,
                max_tokens=1024,
                temperature=0.7,
                top_p=0.9,
                stream=False,
            )
            assistant_message = response.choices[0].message.content

            # Store assistant reply in history
            self.histories[user_id].append(
                {"role": "assistant", "content": assistant_message}
            )
            return assistant_message

        except Exception as e:
            logger.error(f"Error generating response for user {user_id}: {e}")
            return "I'm sorry, I'm having trouble connecting right now. Please try again."

    async def stream_response(self, user_input: str, user_id: str):
        """
        Async generator that yields tokens one-by-one from the model.
        Uses RAG context to ground the response.
        """
        try:
            messages = await self._get_messages(user_id, user_input)
            
            # The InferenceClient.chat_completion returns a generator when stream=True
            # We wrap it in an async-friendly way
            stream = self.client.chat_completion(
                messages=messages,
                max_tokens=1024,
                temperature=0.7,
                top_p=0.9,
                stream=True,
            )

            full_response = ""
            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    token = chunk.choices[0].delta.content
                    full_response += token
                    yield token

            # Store the complete assistant reply in history
            self.histories[user_id].append(
                {"role": "assistant", "content": full_response}
            )

        except Exception as e:
            logger.error(f"Streaming error for user {user_id}: {e}")
            yield "I'm sorry, I'm having trouble connecting right now. Please try again."

    def reset_chat(self, user_id: str):
        """Clear conversation history for a user."""
        if user_id in self.histories:
            del self.histories[user_id]


# Global instance
chatbot_service = ChatbotService()
