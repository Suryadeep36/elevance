'use client';

import { useState, useRef } from 'react';

interface UploadResult {
  publicId: string;
  url: string;
  success: boolean;
}

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Double-check it's a PDF
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a PDF file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/resume-upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const result = await response.json();
      setUploadResult(result);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Resume Upload</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">
          Select a PDF Resume
        </label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="w-full p-2 border rounded"
          disabled={isUploading}
        />
        {file && (
          <p className="mt-2 text-sm text-gray-500">
            Selected: {file.name} ({Math.round(file.size / 1024)}KB)
          </p>
        )}
      </div>
      
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`w-full py-2 rounded ${
          !file || isUploading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isUploading ? 'Uploading...' : 'Upload Resume'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {uploadResult && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Upload Successful!</h3>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">Public ID:</p>
            <p className="text-sm truncate text-gray-500">{uploadResult.publicId}</p>
            
            <p className="text-sm font-medium text-gray-700 mt-2">PDF URL:</p>
            <a 
              href={uploadResult.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline truncate block"
            >
              {uploadResult.url}
            </a>
            <button
              onClick={() => window.open(uploadResult.url, '_blank')}
              className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-800 text-sm"
            >
              View PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
