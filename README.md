# Audio dB Analyzer


https://github.com/user-attachments/assets/8daefa3a-62ac-4012-8b4d-5919694c1459


A modern web application for analyzing audio levels in audio and video files. The application provides real-time audio level analysis including peak and average dB measurements with an intuitive drag-and-drop interface.

## 🚀 Features

- **Universal Format Support**: Supports all major audio and video formats (MP3, WAV, FLAC, OGG, AAC, MP4, MOV, AVI, MKV, etc.)
- **Drag & Drop Interface**: Modern, responsive web interface with drag-and-drop file upload
- **Real-time Analysis**: Fast audio level analysis using FFmpeg's volumedetect filter
- **Professional Metrics**: 
  - Peak level detection (dB)
  - Average level measurement (dB)
  - Clipping detection warnings
  - Industry standard recommendations
- **Cross-platform**: Runs on any system with Docker support
- **Large File Support**: Handles files up to 500MB

## 🏗️ Architecture

The project consists of two main components:

- **Frontend**: Next.js 15 React application with TypeScript and Tailwind CSS
- **Backend**: FastAPI Python service with FFmpeg integration
- **Containerization**: Docker Compose for easy deployment

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/andyanalog/audio-analyzer
   cd audio-analyzer
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Local Development Setup

#### Backend Setup

1. **Navigate to the backend directory**
   ```bash
   cd backend  # Adjust path as needed
   ```

2. **Install system dependencies**
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install ffmpeg libsndfile1 gcc g++ build-essential
   
   # macOS
   brew install ffmpeg
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend**
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

#### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd frontend/frontend  # Adjust path as needed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## 🎯 Audio Level Guidelines

The application provides industry-standard recommendations:

### Peak Levels
- **Target Range**: -6dB to -3dB for optimal headroom
- **Warning**: Peaks above 0dB indicate digital clipping
- **Recommendation**: Keep peaks below -1dB to prevent distortion

### Average Levels
- **Target Range**: -18dB to -14dB (LUFS) for good dynamic range
- **Too High**: Above -18dB may sound compressed
- **Too Low**: Below -30dB may sound too quiet

## 🛠️ Technical Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **File Upload**: react-dropzone
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.9
- **Audio Processing**: FFmpeg with volumedetect filter
- **Additional Libraries**: 
  - pydub for audio manipulation
  - demucs for advanced audio processing
  - torchaudio for ML-based audio processing

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Uvicorn (ASGI)
- **CORS**: Configured for cross-origin requests

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
