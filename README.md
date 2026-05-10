# AI Learning Hub 🤖📚

A premium, AI-powered learning platform featuring semantic search, RAG-based chat assistants, hybrid recommendations, and a gamified student dashboard.

![AI Hub Preview](https://via.placeholder.com/1200x600/1a1a1a/ffffff?text=AI+Learning+Hub+Interface)

## 🌟 Key Features

- **🧠 RAG-Based Chat Assistant**: An intelligent tutor powered by `Zephyr-7b` that answers questions based on actual course PDFs.
- **🎯 Hybrid Recommendations**: Personalized course suggestions using a fusion of Collaborative Filtering and Content-Based models.
- **🔍 Semantic Search**: Find courses based on conceptual meaning rather than just keyword matches.
- **📊 Gamified Dashboard**: Track your XP, earn badges, and climb the leaderboard as you complete AI modules.
- **🗺️ Learning Paths**: Interactive roadmaps for Specializations (e.g., ML Engineer, NLP Specialist).
- **🏷️ Auto-Tagging**: Zero-shot classification automatically categorizes new courses into domains.

---


## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **MongoDB** (Local or Atlas)
- **Hugging Face API Token** (For Chat & Auto-tagging)

### 2. Backend Setup
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

**Configure Environment:**
Create a `.env` file in `backend/`:
```env
MONGODB_URL="mongodb://localhost:27017/"
DATABASE_NAME="ai_learning_hub"
HF_API_TOKEN="your_huggingface_token_here"
```

**Initialize Data:**
```powershell
python scripts/generate_synthetic_data.py
python scripts/populate_embeddings.py
python scripts/index_pdfs.py
```

**Run Server:**
```powershell
uvicorn main:app --reload
```

### 3. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` to start learning!

---

## 🛠️ Technology Stack
- **Backend**: FastAPI, MongoDB, HuggingFace Inference API.
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Recharts.
- **ML Services**: Sentence-Transformers, PyPDF2, BART Zero-Shot.

## 📄 License
This project is part of the AI Specialization Final Delivery.
