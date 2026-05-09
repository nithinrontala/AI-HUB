"""
Generate educational PDF documents for each course in the database.
Each PDF contains real, detailed educational content specific to the course topic.
"""
import asyncio
import os
import sys

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(backend_path)

from fpdf import FPDF
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

# ── Detailed course content mapped by title ──────────────────────────────────
COURSE_CONTENT = {
    "Introduction to Machine Learning": {
        "chapters": [
            ("What is Machine Learning?",
             "Machine Learning (ML) is a subset of artificial intelligence that gives systems "
             "the ability to learn and improve from experience without being explicitly programmed. "
             "ML focuses on developing algorithms that can access data, learn from it, and make "
             "predictions or decisions. There are three main types of ML: supervised learning, "
             "unsupervised learning, and reinforcement learning.\n\n"
             "Supervised learning uses labeled datasets to train algorithms to classify data or "
             "predict outcomes. Common algorithms include Linear Regression, Logistic Regression, "
             "Decision Trees, Random Forests, and Support Vector Machines (SVM).\n\n"
             "Unsupervised learning works with unlabeled data, discovering hidden patterns. "
             "Key algorithms include K-Means Clustering, DBSCAN, Principal Component Analysis "
             "(PCA), and Hierarchical Clustering."),
            ("Feature Engineering and Data Preprocessing",
             "Feature engineering is the process of using domain knowledge to create features "
             "that make machine learning algorithms work better. This includes:\n\n"
             "1. Handling Missing Values: Imputation strategies like mean, median, mode, or "
             "KNN-based imputation.\n"
             "2. Feature Scaling: StandardScaler (z-score normalization) and MinMaxScaler.\n"
             "3. Encoding Categorical Variables: One-hot encoding, label encoding, target encoding.\n"
             "4. Feature Selection: Filter methods (correlation), wrapper methods (RFE), "
             "embedded methods (Lasso regularization).\n"
             "5. Dimensionality Reduction: PCA, t-SNE, UMAP for reducing feature space."),
            ("Model Evaluation and Metrics",
             "Evaluating ML models requires proper metrics:\n\n"
             "Classification Metrics: Accuracy, Precision, Recall, F1-Score, AUC-ROC curve, "
             "Confusion Matrix. Precision measures the proportion of true positives among "
             "predicted positives. Recall measures the proportion of true positives among "
             "actual positives.\n\n"
             "Regression Metrics: Mean Squared Error (MSE), Root Mean Squared Error (RMSE), "
             "Mean Absolute Error (MAE), R-squared (R2) score.\n\n"
             "Cross-validation: K-fold cross-validation splits data into k subsets, training "
             "on k-1 and validating on the remaining fold. This reduces overfitting and gives "
             "a more reliable estimate of model performance."),
        ]
    },
    "Deep Learning Fundamentals": {
        "chapters": [
            ("Neural Network Architecture",
             "A neural network consists of layers of interconnected nodes (neurons). "
             "Each connection has a weight that is adjusted during training.\n\n"
             "The basic architecture includes:\n"
             "- Input Layer: Receives the raw data features.\n"
             "- Hidden Layers: Process information through weighted connections and activation "
             "functions. Deep networks have multiple hidden layers.\n"
             "- Output Layer: Produces the final prediction.\n\n"
             "Key concepts:\n"
             "- Activation Functions: ReLU (max(0,x)), Sigmoid (1/(1+e^-x)), Tanh, Leaky ReLU, "
             "Softmax (for multi-class classification).\n"
             "- Weights and Biases: Parameters learned during training.\n"
             "- Forward Propagation: Data flows from input to output through the network."),
            ("Backpropagation and Optimization",
             "Backpropagation is the algorithm used to train neural networks by computing "
             "gradients of the loss function with respect to each weight using the chain rule.\n\n"
             "The process:\n"
             "1. Forward pass: compute predictions.\n"
             "2. Compute loss using a loss function (MSE, Cross-Entropy).\n"
             "3. Backward pass: compute gradients via chain rule.\n"
             "4. Update weights: w = w - learning_rate * gradient.\n\n"
             "Optimizers:\n"
             "- SGD (Stochastic Gradient Descent): Updates weights after each sample.\n"
             "- Adam (Adaptive Moment Estimation): Combines momentum and RMSprop. Uses running "
             "averages of gradients and their squares.\n"
             "- Learning Rate Scheduling: Reduce LR on plateau, cosine annealing, warm restarts."),
            ("CNNs and RNNs",
             "Convolutional Neural Networks (CNNs) are designed for spatial data like images.\n"
             "- Convolutional layers apply learnable filters to detect features (edges, textures).\n"
             "- Pooling layers reduce spatial dimensions (MaxPooling, AveragePooling).\n"
             "- Architectures: LeNet, AlexNet, VGG, ResNet, Inception.\n\n"
             "Recurrent Neural Networks (RNNs) handle sequential data.\n"
             "- Standard RNNs suffer from vanishing gradients.\n"
             "- LSTM (Long Short-Term Memory) uses gates (forget, input, output) to control "
             "information flow and capture long-range dependencies.\n"
             "- GRU (Gated Recurrent Unit) is a simplified version of LSTM with two gates."),
        ]
    },
    "Natural Language Processing with Transformers": {
        "chapters": [
            ("NLP Fundamentals",
             "Natural Language Processing enables computers to understand human language.\n\n"
             "Text Preprocessing Pipeline:\n"
             "1. Tokenization: Splitting text into words or subwords.\n"
             "2. Stop Word Removal: Removing common words (the, is, at).\n"
             "3. Stemming and Lemmatization: Reducing words to root forms.\n"
             "4. Vectorization: Bag of Words, TF-IDF, Word2Vec, GloVe.\n\n"
             "Word Embeddings map words to dense vectors where semantically similar words "
             "are close in vector space. Word2Vec uses Skip-gram or CBOW architectures. "
             "GloVe uses co-occurrence statistics from a corpus."),
            ("The Transformer Architecture",
             "Transformers, introduced in 'Attention Is All You Need' (2017), revolutionized NLP.\n\n"
             "Key Components:\n"
             "- Self-Attention Mechanism: Computes attention scores between all positions in a "
             "sequence. Q (Query), K (Key), V (Value) matrices. Attention(Q,K,V) = softmax(QK^T/sqrt(d_k))V\n"
             "- Multi-Head Attention: Runs multiple attention operations in parallel.\n"
             "- Positional Encoding: Adds position information since transformers lack recurrence.\n"
             "- Feed-Forward Networks: Applied independently to each position.\n"
             "- Layer Normalization and Residual Connections for training stability.\n\n"
             "The encoder processes input, the decoder generates output autoregressively."),
            ("BERT, GPT, and Modern LLMs",
             "BERT (Bidirectional Encoder Representations from Transformers):\n"
             "- Pre-trained on Masked Language Modeling and Next Sentence Prediction.\n"
             "- Bidirectional context understanding.\n"
             "- Fine-tuned for classification, NER, question answering.\n\n"
             "GPT (Generative Pre-trained Transformer):\n"
             "- Autoregressive model trained to predict next token.\n"
             "- GPT-2, GPT-3, GPT-4 show scaling laws: larger models perform better.\n"
             "- In-context learning: few-shot, zero-shot capabilities.\n\n"
             "Modern trends: instruction tuning, RLHF (Reinforcement Learning from Human "
             "Feedback), mixture of experts, retrieval-augmented generation (RAG)."),
        ]
    },
    "Computer Vision Basics": {
        "chapters": [
            ("Image Processing Fundamentals",
             "Digital images are represented as matrices of pixel values.\n\n"
             "Key Operations:\n"
             "- Color Spaces: RGB, HSV, Grayscale conversion.\n"
             "- Filtering: Gaussian blur, median filter for noise reduction.\n"
             "- Edge Detection: Sobel operator, Canny edge detector.\n"
             "- Morphological Operations: Erosion, dilation, opening, closing.\n"
             "- Histogram Equalization: Enhancing image contrast.\n\n"
             "Libraries: OpenCV provides comprehensive tools for image manipulation. "
             "Images are loaded as NumPy arrays, enabling fast mathematical operations."),
            ("Object Detection and Segmentation",
             "Object Detection identifies and localizes objects in images.\n\n"
             "Evolution of architectures:\n"
             "- R-CNN family: R-CNN, Fast R-CNN, Faster R-CNN with Region Proposal Networks.\n"
             "- Single-shot detectors: YOLO (You Only Look Once), SSD.\n"
             "- YOLO divides image into grid, predicts bounding boxes and class probabilities.\n\n"
             "Image Segmentation:\n"
             "- Semantic Segmentation: Classify each pixel (FCN, U-Net, DeepLab).\n"
             "- Instance Segmentation: Detect and segment each object instance (Mask R-CNN).\n"
             "- Panoptic Segmentation: Combines semantic and instance segmentation."),
            ("Transfer Learning for Vision",
             "Transfer learning uses pre-trained models as starting points.\n\n"
             "Common pre-trained models (trained on ImageNet):\n"
             "- ResNet: Skip connections solve vanishing gradient problem.\n"
             "- EfficientNet: Compound scaling of depth, width, resolution.\n"
             "- Vision Transformer (ViT): Applies transformer architecture to image patches.\n\n"
             "Fine-tuning strategies:\n"
             "1. Feature Extraction: Freeze all layers, train only new classifier head.\n"
             "2. Fine-tuning: Unfreeze some or all layers, train with small learning rate.\n"
             "3. Progressive unfreezing: Gradually unfreeze layers from top to bottom.\n\n"
             "Data Augmentation: Random crops, flips, rotations, color jitter, Mixup, CutMix."),
        ]
    },
    "Reinforcement Learning Explained": {
        "chapters": [
            ("RL Foundations",
             "Reinforcement Learning trains agents to make sequential decisions by maximizing "
             "cumulative rewards through interaction with an environment.\n\n"
             "Core Components:\n"
             "- Agent: The learner and decision maker.\n"
             "- Environment: The world the agent interacts with.\n"
             "- State (s): Current situation of the agent.\n"
             "- Action (a): Choices available to the agent.\n"
             "- Reward (r): Feedback signal from the environment.\n"
             "- Policy (pi): Strategy mapping states to actions.\n"
             "- Value Function V(s): Expected cumulative reward from state s.\n"
             "- Q-Function Q(s,a): Expected cumulative reward from state s taking action a.\n\n"
             "The Bellman Equation: V(s) = max_a [R(s,a) + gamma * V(s')]"),
            ("Q-Learning and Deep Q-Networks",
             "Q-Learning is a model-free algorithm that learns action-value function Q(s,a).\n\n"
             "Update rule: Q(s,a) = Q(s,a) + alpha * [r + gamma * max_a' Q(s',a') - Q(s,a)]\n\n"
             "Deep Q-Networks (DQN) use neural networks to approximate Q-values.\n"
             "Key innovations:\n"
             "- Experience Replay: Store transitions in buffer, sample randomly to break "
             "correlation between consecutive samples.\n"
             "- Target Network: Separate network for computing target values, updated "
             "periodically to stabilize training.\n"
             "- Double DQN: Addresses overestimation by using online network for action "
             "selection and target network for evaluation."),
            ("Policy Gradient and Actor-Critic Methods",
             "Policy Gradient methods directly optimize the policy.\n\n"
             "REINFORCE algorithm: Update policy parameters in direction of gradient of "
             "expected reward. High variance but unbiased.\n\n"
             "Actor-Critic Methods combine value-based and policy-based approaches:\n"
             "- Actor: Learns the policy (which action to take).\n"
             "- Critic: Learns the value function (how good the state is).\n"
             "- A2C (Advantage Actor-Critic): Uses advantage function A(s,a) = Q(s,a) - V(s).\n"
             "- PPO (Proximal Policy Optimization): Clips policy updates for stability.\n\n"
             "Applications: Game playing (AlphaGo, Atari), robotics, autonomous driving."),
        ]
    },
    "Generative AI and LLMs": {
        "chapters": [
            ("Generative Models Overview",
             "Generative AI creates new content: text, images, audio, code.\n\n"
             "Types of Generative Models:\n"
             "- Autoencoders: Encode input to latent space, decode to reconstruct.\n"
             "- VAEs (Variational Autoencoders): Learn probabilistic latent space.\n"
             "- GANs (Generative Adversarial Networks): Generator vs Discriminator.\n"
             "- Diffusion Models: Gradually add noise, learn to reverse the process.\n"
             "  Stable Diffusion, DALL-E use this approach for image generation.\n"
             "- Autoregressive Models: Generate output token by token (GPT family).\n\n"
             "Key applications: text generation, image synthesis, code completion, "
             "music generation, drug discovery, synthetic data generation."),
            ("Large Language Models",
             "LLMs are transformer-based models trained on massive text corpora.\n\n"
             "Training Pipeline:\n"
             "1. Pre-training: Next token prediction on internet-scale data.\n"
             "2. Supervised Fine-Tuning (SFT): Train on instruction-response pairs.\n"
             "3. RLHF: Reinforcement Learning from Human Feedback.\n"
             "   - Train reward model from human preferences.\n"
             "   - Optimize policy using PPO against reward model.\n\n"
             "Scaling Laws: Performance improves predictably with model size, data size, "
             "and compute. Emergent abilities appear at certain scales.\n\n"
             "Inference Optimization: Quantization (INT8, INT4), KV-cache, speculative "
             "decoding, Flash Attention for efficient self-attention computation."),
            ("Prompt Engineering and RAG",
             "Prompt Engineering techniques for better LLM outputs:\n"
             "- Zero-shot: Direct instruction without examples.\n"
             "- Few-shot: Provide examples in the prompt.\n"
             "- Chain-of-Thought (CoT): 'Let's think step by step'.\n"
             "- ReAct: Reasoning + Acting framework.\n\n"
             "Retrieval-Augmented Generation (RAG):\n"
             "1. Index documents: chunk text, create embeddings, store in vector DB.\n"
             "2. Retrieve: Find relevant chunks using semantic similarity.\n"
             "3. Generate: Feed retrieved context + query to LLM.\n"
             "Benefits: Reduces hallucination, provides up-to-date knowledge, "
             "enables domain-specific responses without fine-tuning.\n\n"
             "Vector Databases: FAISS, Pinecone, Weaviate, ChromaDB, Milvus."),
        ]
    },
    "Data Science for Beginners": {
        "chapters": [
            ("Data Science Workflow",
             "Data Science follows a structured workflow:\n\n"
             "1. Problem Definition: Clearly define the business question.\n"
             "2. Data Collection: APIs, databases, web scraping, surveys.\n"
             "3. Data Cleaning: Handle missing values, outliers, duplicates.\n"
             "4. Exploratory Data Analysis (EDA): Visualize distributions, correlations.\n"
             "5. Feature Engineering: Create meaningful features from raw data.\n"
             "6. Modeling: Select and train appropriate algorithms.\n"
             "7. Evaluation: Assess model performance on test data.\n"
             "8. Deployment: Serve model via APIs (Flask, FastAPI).\n\n"
             "Tools: Python, Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn, Jupyter."),
            ("Statistics for Data Science",
             "Essential statistics concepts:\n\n"
             "Descriptive Statistics: Mean, Median, Mode, Standard Deviation, Variance, "
             "Percentiles, IQR (Interquartile Range).\n\n"
             "Probability Distributions: Normal (Gaussian), Binomial, Poisson, Uniform.\n"
             "Central Limit Theorem: Sample means approach normal distribution.\n\n"
             "Hypothesis Testing:\n"
             "- Null Hypothesis (H0) vs Alternative Hypothesis (H1).\n"
             "- p-value: probability of observing data given H0 is true.\n"
             "- Significance level (alpha): typically 0.05.\n"
             "- Type I Error (false positive), Type II Error (false negative).\n"
             "- t-test, chi-squared test, ANOVA for different scenarios."),
            ("Data Visualization",
             "Effective visualization communicates insights clearly.\n\n"
             "Chart Types and When to Use Them:\n"
             "- Bar Charts: Comparing categories.\n"
             "- Line Charts: Trends over time.\n"
             "- Scatter Plots: Relationship between two variables.\n"
             "- Histograms: Distribution of a single variable.\n"
             "- Box Plots: Distribution summary with outliers.\n"
             "- Heatmaps: Correlation matrices, confusion matrices.\n"
             "- Pair Plots: All pairwise relationships in a dataset.\n\n"
             "Libraries: Matplotlib (low-level control), Seaborn (statistical plots), "
             "Plotly (interactive), Altair (declarative). Best practices: label axes, "
             "use appropriate scales, avoid chartjunk, tell a story with data."),
        ]
    },
    "Python for AI Engineering": {
        "chapters": [
            ("Python Fundamentals for AI",
             "Python is the dominant language for AI development.\n\n"
             "Key Data Structures:\n"
             "- Lists: Ordered, mutable sequences. List comprehensions for concise code.\n"
             "- Dictionaries: Key-value pairs with O(1) average lookup.\n"
             "- NumPy Arrays: Fixed-type, contiguous memory for fast numerical computation.\n"
             "- Pandas DataFrames: Tabular data with labeled axes.\n\n"
             "NumPy Essentials:\n"
             "- Broadcasting: Operations on arrays of different shapes.\n"
             "- Vectorization: Replace loops with array operations for speed.\n"
             "- Linear algebra: np.dot, np.matmul, np.linalg for matrix operations.\n"
             "- Random: np.random for reproducible random number generation."),
            ("PyTorch and TensorFlow",
             "PyTorch (by Meta) and TensorFlow (by Google) are the two major deep learning "
             "frameworks.\n\n"
             "PyTorch Basics:\n"
             "- Tensors: Multi-dimensional arrays with GPU support.\n"
             "- Autograd: Automatic differentiation for gradient computation.\n"
             "- nn.Module: Base class for all neural network modules.\n"
             "- DataLoader: Efficient batched data loading with multiprocessing.\n"
             "- Training loop: forward pass, loss computation, backward pass, optimizer step.\n\n"
             "TensorFlow/Keras:\n"
             "- tf.keras.Sequential: Stack layers linearly.\n"
             "- model.compile(): Set optimizer, loss, metrics.\n"
             "- model.fit(): Train with callbacks (EarlyStopping, ModelCheckpoint).\n"
             "- TensorBoard: Visualization of training metrics."),
            ("MLOps and Deployment",
             "MLOps bridges the gap between ML development and production.\n\n"
             "Key Practices:\n"
             "- Version Control: Git for code, DVC for data and model versioning.\n"
             "- Experiment Tracking: MLflow, Weights & Biases for logging metrics.\n"
             "- Model Serving: FastAPI, Flask, TensorFlow Serving, TorchServe.\n"
             "- Containerization: Docker for consistent environments.\n"
             "- CI/CD: Automated testing and deployment pipelines.\n\n"
             "Model Deployment Options:\n"
             "- REST APIs: FastAPI endpoint wrapping model.predict().\n"
             "- Batch Processing: Apache Spark, AWS Batch for large-scale inference.\n"
             "- Edge Deployment: ONNX Runtime, TensorFlow Lite for mobile/IoT.\n"
             "- Serverless: AWS Lambda, Google Cloud Functions for auto-scaling."),
        ]
    },
}


class CoursePDF(FPDF):
    """Custom PDF class with consistent styling for course materials."""

    def header(self):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, "AI Learning Hub - Course Material", align="C")
        self.ln(5)
        self.set_draw_color(70, 130, 250)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def chapter_title(self, title):
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(30, 60, 150)
        self.cell(0, 12, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(4)

    def chapter_body(self, body):
        self.set_font("Helvetica", "", 11)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 6, body)
        self.ln(8)


def generate_pdf(course_title: str, output_dir: str) -> str:
    """Generate a PDF file for a given course title."""
    content = COURSE_CONTENT.get(course_title)
    if not content:
        return ""

    pdf = CoursePDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)

    # Title page
    pdf.add_page()
    pdf.ln(40)
    pdf.set_font("Helvetica", "B", 28)
    pdf.set_text_color(30, 60, 150)
    pdf.multi_cell(0, 14, course_title, align="C")
    pdf.ln(10)
    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, "AI Learning Hub - Comprehensive Course Guide", align="C")
    pdf.ln(20)
    pdf.set_font("Helvetica", "I", 11)
    pdf.cell(0, 10, "Generated for educational purposes", align="C")

    # Content chapters
    for chapter_title, chapter_body in content["chapters"]:
        pdf.add_page()
        pdf.chapter_title(chapter_title)
        pdf.chapter_body(chapter_body)

    # Save
    safe_name = course_title.lower().replace(" ", "_").replace("/", "_")
    filename = f"{safe_name}.pdf"
    filepath = os.path.join(output_dir, filename)
    pdf.output(filepath)
    return filepath


async def main():
    """Generate PDFs for all courses in the database."""
    output_dir = os.path.join(backend_path, "course_pdfs")
    os.makedirs(output_dir, exist_ok=True)

    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    courses = await db["courses"].find({}).to_list(length=100)
    print(f"Found {len(courses)} courses in database.\n")

    generated = 0
    for course in courses:
        title = course["title"]
        filepath = generate_pdf(title, output_dir)
        if filepath:
            # Store the PDF path in the course document
            await db["courses"].update_one(
                {"_id": course["_id"]},
                {"$set": {"pdf_path": filepath}}
            )
            print(f"  [OK] {title} -> {filepath}")
            generated += 1
        else:
            print(f"  [SKIP] {title} (no content template)")

    client.close()
    print(f"\nGenerated {generated} PDFs in {output_dir}")


if __name__ == "__main__":
    asyncio.run(main())
