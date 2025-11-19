FROM python:3.11-slim

# Install system dependencies (FFmpeg is required for Whisper audio)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Keep the container running so it can listen for requests
CMD ["tail", "-f", "/dev/null"] 
# Later, you can change this to: CMD ["python", "main.py"]