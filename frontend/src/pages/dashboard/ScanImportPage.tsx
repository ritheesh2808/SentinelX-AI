import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as scanService from '../../services/scanService';

export const ScanImportPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const validateFile = (file: File): boolean => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate type (.xml)
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xml' && file.type !== 'text/xml' && file.type !== 'application/xml') {
      setErrorMsg('Unsupported file type. Please upload a valid Nmap XML report (.xml).');
      return false;
    }

    // Validate size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg('File size exceeds the 5MB upload limit.');
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    setUploadProgress(null);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setUploadProgress(15); // Start progress indication

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const xmlContent = e.target?.result as string;
        setUploadProgress(45);

        // Upload and parse XML content on backend
        await scanService.importScan(selectedFile.name, xmlContent);
        
        setUploadProgress(100);
        setSuccessMsg(`Successfully imported scan report "${selectedFile.name}"! Redirecting to report center...`);
        
        setTimeout(() => {
          navigate('/dashboard/scans');
        }, 1500);
      } catch (err: any) {
        console.error('Import failed:', err);
        const backendError = err.response?.data?.error || 'Failed to parse and store scan report.';
        setErrorMsg(backendError);
        setUploadProgress(null);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Failed to read the scan report file.');
      setUploadProgress(null);
      setIsProcessing(false);
    };

    // Read file as text
    reader.readAsText(selectedFile);
  };

  return (
    <div className="space-y-8 text-left max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc] mb-1">Import XML Scan</h1>
        <p className="text-sm text-[#94a3b8]">Upload and index Nmap scan results to catalog discovered hosts and audit profiles.</p>
      </div>

      {/* Success / Error Messages */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-400">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Drag & Drop Card */}
      <div className="bg-[#131c2e] border border-[#1e293b] rounded-2xl p-6 shadow-xl space-y-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!selectedFile ? triggerFileSelect : undefined}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
            selectedFile ? 'border-emerald-500/30 bg-emerald-500/5 cursor-default' :
            isDragOver ? 'border-[#6366f1] bg-[#6366f1]/5 scale-[0.99]' : 'border-[#1e293b] hover:border-[#6366f1]/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xml"
            className="hidden"
          />

          {!selectedFile ? (
            <div className="space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6366f1]/10 to-[#a855f7]/10 border border-[#6366f1]/20 text-[#6366f1] mb-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-[#f8fafc]">
                Drag and drop your Nmap XML report here
              </p>
              <p className="text-xs text-[#94a3b8]">
                or <span className="text-[#6366f1] underline font-bold">browse your filesystem</span> to select a report (.xml, max 5MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-[#f8fafc] font-mono truncate max-w-md mx-auto">{selectedFile.name}</p>
                <p className="text-xs text-[#475569] mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              
              {!isProcessing && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                >
                  Discard File
                </button>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {uploadProgress !== null && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-[#94a3b8]">
              <span>Parsing XML Elements...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full bg-[#0b0f19] rounded-full overflow-hidden border border-[#1e293b]">
              <div
                className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Upload Trigger Buttons */}
        {selectedFile && !isProcessing && uploadProgress === null && (
          <div className="flex justify-end pt-3">
            <button
              onClick={handleUploadSubmit}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] px-5 py-2.5 text-sm font-semibold text-[#f8fafc] shadow-lg shadow-[#6366f1]/20 hover:opacity-95 cursor-pointer transition-all"
            >
              <svg className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Execute XML Audit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanImportPage;
