import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import logging

logger = logging.getLogger(__name__)

class ChatbotService:
    def __init__(self, model_name="microsoft/DialoGPT-medium"):
        logger.info(f"Loading chatbot model: {model_name}")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
        self.histories = {} # Dict to store history per user
        logger.info("Chatbot model loaded successfully")

    def get_response(self, user_input: str, user_id: str):
        try:
            # Get or initialize history for this user
            chat_history_ids = self.histories.get(user_id)

            # Encode the new user input, add the eos_token and return a tensor in Pytorch
            new_user_input_ids = self.tokenizer.encode(user_input + self.tokenizer.eos_token, return_tensors='pt')

            # Append the new user input tokens to the chat history
            bot_input_ids = torch.cat([chat_history_ids, new_user_input_ids], dim=-1) if chat_history_ids is not None else new_user_input_ids

            # Generate a response
            updated_history_ids = self.model.generate(
                bot_input_ids, 
                max_length=1000, 
                pad_token_id=self.tokenizer.eos_token_id,
                no_repeat_ngram_size=3,       
                do_sample=True, 
                top_k=100, 
                top_p=0.7,
                temperature=0.8
            )

            # Store the updated history
            self.histories[user_id] = updated_history_ids

            # Get the generated response tokens
            response_ids = updated_history_ids[:, bot_input_ids.shape[-1]:]
            
            # Decode the response
            response_text = self.tokenizer.decode(response_ids[0], skip_special_tokens=True)
            
            return response_text
        except Exception as e:
            logger.error(f"Error generating chatbot response for user {user_id}: {e}")
            return "I'm sorry, I'm having trouble thinking right now. Can we try again?"

    def reset_chat(self, user_id: str):
        if user_id in self.histories:
            del self.histories[user_id]

# Global instance
chatbot_service = ChatbotService()
