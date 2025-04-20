import React, { useState, useRef } from 'react';
import { Upload, File, X, Check, Loader } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    
    // Here you would integrate with Snowflake API
    // Simulating upload for now
    setTimeout(() => {
      onFilesSelected(selectedFiles);
      setSelectedFiles([]);
      setUploading(false);
    }, 2000);
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple
        />
        
        <Upload className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
        
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Upload DOJ Immigration Files
        </h3>
        
        <p className="text-sm text-gray-500">
          Drag and drop files here, or click to select files
        </p>
        
        <p className="text-xs text-gray-400 mt-2">
          Supported formats: PDF, DOCX, CSV, JSON, XML
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-700">Selected Files ({selectedFiles.length})</h3>
            <button 
              className="text-sm text-red-500 hover:text-red-700"
              onClick={() => setSelectedFiles([])}
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <div className="flex items-center">
                  <File className="h-5 w-5 text-indigo-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                
                <button 
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            className={`mt-4 w-full flex items-center justify-center px-4 py-2 rounded-md text-white font-medium
              ${uploading 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'} 
              transition-colors duration-200`}
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Upload Files to Snowflake
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;