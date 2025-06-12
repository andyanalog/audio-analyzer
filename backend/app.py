import os
import uuid
import shutil
import re
import traceback
import subprocess
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from typing import Optional

# Setup detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Audio dB Analyzer API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust this for your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory
UPLOAD_DIR = "temp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    """
    Analyzes audio levels in a file using ffmpeg's volumedetect filter
    Returns peak level and mean volume in dB
    """
    # Generate unique ID for this job
    job_id = str(uuid.uuid4())
    
    # Create job directory
    job_upload_dir = os.path.join(UPLOAD_DIR, job_id)
    os.makedirs(job_upload_dir, exist_ok=True)
    
    # Get file extension
    file_ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if not file_ext:
        file_ext = ".tmp"  # Default extension if none is provided
    
    # Save uploaded file
    input_path = os.path.join(job_upload_dir, f"input{file_ext}")
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    logger.info(f"File saved at: {input_path}")
    
    try:
        # Check if the file exists and is not empty
        if not os.path.exists(input_path):
            raise Exception(f"File does not exist: {input_path}")
        
        file_size = os.path.getsize(input_path)
        logger.info(f"File size: {file_size} bytes")
        
        if file_size == 0:
            raise Exception("File is empty")
        
        # Build the ffmpeg command with volumedetect filter
        command = [
            "ffmpeg",
            "-i", input_path,
            "-af", "volumedetect",
            "-vn",  # Skip video processing
            "-sn",  # Skip subtitle processing
            "-dn",  # Skip data processing
            "-f", "null",  # Output to null device
            "-"   # Output to stdout/stderr
        ]
        
        logger.info(f"Executing command: {' '.join(command)}")
        
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = process.communicate()
        
        logger.debug(f"ffmpeg stdout: {stdout}")
        if stderr:
            logger.debug(f"ffmpeg stderr: {stderr}")
        
        if process.returncode != 0:
            # Only raise if there's a meaningful error, not just the volumedetect output
            if not re.search(r"mean_volume|max_volume", stderr):
                raise Exception(f"ffmpeg process failed with code {process.returncode}: {stderr}")
        
        # Parse the output to extract peak and mean volume
        peak_match = re.search(r"max_volume: ([-\d.]+) dB", stderr)
        mean_match = re.search(r"mean_volume: ([-\d.]+) dB", stderr)
        
        if not peak_match or not mean_match:
            raise Exception("Could not find volume information in ffmpeg output")
        
        peak_db = float(peak_match.group(1))
        mean_db = float(mean_match.group(1))
        
        logger.info(f"Analysis results - Peak: {peak_db} dB, Mean: {mean_db} dB")
        
        # Clean up
        shutil.rmtree(job_upload_dir, ignore_errors=True)
        
        return {
            "status": "success",
            "peak_db": peak_db,
            "mean_db": mean_db
        }
        
    except Exception as e:
        logger.error(f"Error during processing: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Clean up
        shutil.rmtree(job_upload_dir, ignore_errors=True)
        
        # Return detailed error information
        raise HTTPException(
            status_code=500, 
            detail=f"Processing error: {str(e)}"
        )

@app.on_event("startup")
async def startup_event():
    """Clean temporary directories on startup"""
    if os.path.exists(UPLOAD_DIR):
        for item in os.listdir(UPLOAD_DIR):
            item_path = os.path.join(UPLOAD_DIR, item)
            if os.path.isdir(item_path):
                shutil.rmtree(item_path, ignore_errors=True)

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)