# AI Learning Hub

A modern, AI-powered learning platform featuring content-based course recommendations, intelligent learning paths, and a sleek user interface.

## 🚀 Getting Started

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **MongoDB** (Local instance or Atlas)

---

## 🛠️ Backend Setup (FastAPI)

1. **Navigate to the backend directory:**
   ```powershell
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables:**
   Create a `.env` file in the `backend` directory (see `.env.example` if available, or use the following):
   ```env
   MONGODB_URL="mongodb://localhost:27017/"
   DATABASE_NAME="ai_learning_hub"
   ```

5. **Initialize Data & Embeddings:**
   If starting fresh, generate synthetic data and then populate course embeddings:
   ```powershell
   python scripts/generate_synthetic_data.py
   python scripts/populate_embeddings.py
   ```

6. **Run the server:**
   ```powershell
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

---

## 💻 Frontend Setup (React + Vite)

1. **Navigate to the frontend directory:**
   ```powershell
   cd frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Run the development server:**
   ```powershell
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

---

## 🤖 Features implemented
- **User Authentication**: Secure login and signup flow.
- **AI Recommendations**: Content-based filtering using HuggingFace `sentence-transformers`.
- **Dynamic Learning Path**: Visualize your progress through AI specializations.
- **Modern UI**: Dark-themed, responsive design built with Tailwind CSS and Lucide icons.

## 📄 License
This project is for educational purposes as part of the AI Specialization.