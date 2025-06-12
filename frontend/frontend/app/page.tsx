"use client";

import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioStats, setAudioStats] = useState<{
    peakLevel: number | null;
    avgLevel: number | null;
  } | null>(null);
  
  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setError(null);
      setAudioStats(null);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Accept any file formats that ffmpeg can handle
    accept: {
      'audio/*': [],
      'video/*': [],
      '.mp3': [],
      '.wav': [],
      '.flac': [],
      '.ogg': [],
      '.aac': [],
      '.mp4': [],
      '.mov': [],
      '.avi': [],
      '.mkv': []
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB max file size
    multiple: false,
  });

  // Handle manual file selection
  const handleManualFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setError(null);
      setAudioStats(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Add progress tracking
      const progressInterval = setInterval(() => {
        // Simulate progress since we don't have real-time progress from backend
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 15;
        });
      }, 300);
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Set audio stats from response
      setAudioStats({
        peakLevel: response.data.peak_db,
        avgLevel: response.data.mean_db
      });
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during analysis');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black-900 text-white flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <h1 className="text-5xl font-bold mb-10 text-center bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Audio dB Analyzer</h1>
        
        <div className="w-full max-w-2xl">
          {/* Dropzone with improved styling */}
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-14 text-center transition-all cursor-pointer
              ${isDragActive ? 'border-blue-400 bg-gray-800/50' : 'border-blue-700 hover:border-blue-300 hover:bg-gray-800/30'}
              ${file ? 'border-blue-500 bg-gray-900/10' : ''}`}
          >
            <input {...getInputProps()} />
            
            {isDragActive ? (
              <div>
                <div className="text-6xl mb-4">↓</div>
                <p className="text-xl">Drop the file here...</p>
              </div>
            ) : file ? (
              <div>
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xl mb-3 font-medium text-blue-400">File selected:</p>
                <p className="text-blue-300 break-all mb-1">{file.name}</p>
                <p className="text-blue-200 text-sm">({(file.size / (1024 * 1024)).toFixed(2)} MB)</p>
              </div>
            ) : (
              <div>
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <p className="text-xl mb-2 font-medium text-blue-300">Drag & drop your file here</p>
                <p className="text-blue-200 mb-5 text-grey-300">or click to select a file</p>
                <p className="text-gray-500 text-sm py-1 px-3 font-bold rounded-full bg-gray-500/10 inline-block">Supports all audio and video formats</p>
              </div>
            )}
          </div>
          
          {/* Manual file input - more stylish */}
          <div className="mt-5 text-center">
            <p className="text-sm text-gray-400 mb-3">If drag & drop doesn't work, select a file manually:</p>
            <label className="inline-block px-4 py-2 rounded-lg bg-grey-900 hover:bg-blue-900 text-gray-300 transition-colors cursor-pointer">
              <span>Select File</span>
              <input 
                type="file" 
                accept="audio/*,video/*,.mp3,.wav,.flac,.ogg,.aac,.mp4,.mov,.avi,.mkv"
                onChange={handleManualFileSelect}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="mt-10 flex flex-col items-center">
            <button
              onClick={handleAnalyze}
              disabled={!file || isProcessing}
              className={`w-full py-4 px-6 rounded-xl text-lg font-medium transition-all 
                ${!file || isProcessing 
                  ? 'bg-gray-900 cursor-not-allowed opacity-60' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 cursor-pointer shadow-lg'}`}
            >
              {isProcessing ? 'Analyzing...' : 'Analyze Audio Levels'}
            </button>
            
            {isProcessing && (
              <div className="w-full mt-6">
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center mt-2 text-gray-400">{Math.round(progress)}% complete</p>
              </div>
            )}
            
            {error && (
              <div className="mt-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400 w-full">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            {audioStats && (
              <div className="mt-8 text-center bg-gray-800/50 p-8 rounded-xl w-full">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-blue-400 text-2xl font-medium mb-6">Audio Analysis Results</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 p-6 rounded-lg text-center">
                    <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-2">Peak Level</h3>
                    <div className="flex items-center justify-center">
                      <span className="text-3xl font-bold text-blue-300">{audioStats.peakLevel?.toFixed(2)}</span>
                      <span className="text-xl text-blue-400 ml-1">dB</span>
                    </div>
                    <div className={`mt-2 text-sm ${audioStats.peakLevel && audioStats.peakLevel > -1 ? 'text-red-400' : 'text-gray-400'}`}>
                      {audioStats.peakLevel && audioStats.peakLevel > -1 ? 'Warning: Possible clipping' : 'No clipping detected'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/30 p-6 rounded-lg text-center">
                    <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-2">Average Level</h3>
                    <div className="flex items-center justify-center">
                      <span className="text-3xl font-bold text-blue-300">{audioStats.avgLevel?.toFixed(2)}</span>
                      <span className="text-xl text-blue-400 ml-1">dB</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      {audioStats.avgLevel && audioStats.avgLevel > -18 
                        ? 'Higher than recommended' 
                        : audioStats.avgLevel && audioStats.avgLevel < -30
                          ? 'Lower than optimal'
                          : 'Good average level'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-700/20 rounded-lg">
                  <h3 className="text-gray-300 text-sm mb-2">Level Guide:</h3>
                  <ul className="text-sm text-gray-400 text-left">
                    <li>• Peak Target: Between -6dB and -3dB for optimal headroom</li>
                    <li>• Average Target: Around -18dB to -14dB (LUFS) for good dynamic range</li>
                    <li>• Avoid peaks above 0dB to prevent digital clipping</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-gray-500">
        <p>Audio dB Analyzer &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}