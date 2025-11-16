#!/bin/bash

echo "🚀 Setting up Farmer Advisory System Backend..."
echo ""

# Create backend directory
mkdir -p backend
cd backend

echo "📁 Creating directory structure..."
mkdir -p models/farmer_call_query_model
mkdir -p models/faq_model
mkdir -p models/pesticide_solution
mkdir -p models/flan_t5_finetuned

echo "📝 Creating configuration files..."

# Create .env.example
cat > .env.example << 'EOF'
MONGODB_URL=mongodb://localhost:27017
ESCALATION_WEBHOOK_URL=https://example.com/webhook/escalation
API_HOST=0.0.0.0
API_PORT=8000
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
MODEL_BASE_PATH=./models
LOG_LEVEL=INFO
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
__pycache__/
*.py[cod]
venv/
env/
.env
.env.local
models/
*.h5
*.sav
*.pkl
*.safetensors
*.bin
.vscode/
.idea/
*.log
logs/
.DS_Store
Thumbs.db
EOF

# Create requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6
pydantic==2.5.3
motor==3.3.2
pymongo==4.6.1
tensorflow==2.15.0
keras==2.15.0
scikit-learn==1.4.0
joblib==1.3.2
transformers==4.37.2
sentence-transformers==2.3.1
safetensors==0.4.1
sentencepiece==0.1.99
Pillow==10.2.0
numpy==1.26.3
python-dotenv==1.0.0
requests==2.31.0
gunicorn==21.2.0
aiofiles==23.2.1
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.10-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    libgomp1 libglib2.0-0 libsm6 libxext6 libxrender-dev libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
RUN mkdir -p models
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
EOF

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: farmer_mongodb
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: farmer_advisory_system
    networks:
      - farmer_network
  api:
    build: .
    container_name: farmer_api
    restart: always
    ports:
      - "8000:8000"
    volumes:
      - ./models:/app/models
      - ./main.py:/app/main.py
    environment:
      - MONGODB_URL=mongodb://mongodb:27017
      - ESCALATION_WEBHOOK_URL=https://your-webhook-url.com/escalate
    depends_on:
      - mongodb
    networks:
      - farmer_network
volumes:
  mongodb_data:
    driver: local
networks:
  farmer_network:
    driver: bridge
EOF

# Create placeholder files
touch main.py
touch README.md

# Create .env from example
cp .env.example .env

echo ""
echo "✅ Backend structure created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy main.py content into: backend/main.py"
echo "2. Copy README.md content into: backend/README.md"
echo "3. Place your model files in: backend/models/"
echo "4. Edit .env file with your configuration"
echo "5. Run: docker-compose up -d"
echo ""
echo "�� Directory structure:"
tree -L 2 . 2>/dev/null || find . -maxdepth 2 -print

