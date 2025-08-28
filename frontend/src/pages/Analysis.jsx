import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  MessageSquare, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Database,
  BarChart3,
  Loader,
  X
} from 'lucide-react';

const Analysis = ({ onBack }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv') || 
          file.type === 'application/vnd.ms-excel' || file.name.endsWith('.xlsx')) {
        setUploadedFile(file);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const handleAnalysis = () => {
    if (!uploadedFile || !query.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (analysisComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Complete!</h1>
            <p className="text-gray-600">Your data has been processed and visualized</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Results Summary</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-teal-50 rounded-lg">
                <Database className="h-8 w-8 text-teal-700 mx-auto mb-2" />
                <div className="text-2xl font-bold text-teal-700">1,247</div>
                <div className="text-sm text-gray-600">Data Points Processed</div>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-teal-700 mx-auto mb-2" />
                <div className="text-2xl font-bold text-teal-700">6</div>
                <div className="text-sm text-gray-600">Visualizations Created</div>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-teal-700 mx-auto mb-2" />
                <div className="text-2xl font-bold text-teal-700">100%</div>
                <div className="text-sm text-gray-600">Data Quality</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-teal-700 to-teal-600 text-white font-semibold rounded-lg hover:from-teal-800 hover:to-teal-700 transition-all duration-200">
              View Dashboard
            </button>
            <button className="px-8 py-3 bg-white text-teal-700 font-semibold rounded-lg border border-teal-700 hover:bg-teal-50 transition-all duration-200">
              Download Results
            </button>
            <button 
              onClick={() => {
                setAnalysisComplete(false);
                setUploadedFile(null);
                setQuery('');
              }}
              className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              New Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 overflow-hidden ">
      <div className="max-w-screen-2xl mx-auto px-4 py-4 h-full overflow-y-auto" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
        {/* Header */}
        <div className="text-center mb-8 mt-8">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Upload Your Dataset
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your data file and tell us what insights you're looking for
          </p>
        </div>

        {/* Steps Container */}
        <div className="grid h-[55vh] w-[50wh] lg:grid-cols-2 gap-6 mb-6">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 ">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <Upload className="h-6 w-6 text-teal-700" />
              Step 1: Upload Your Data
            </h2>
            
            {!uploadedFile ? (
              <div
                className={`relative h-[85%] border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive 
                    ? 'border-teal-700 bg-teal-50' 
                    : 'border-gray-300 hover:border-teal-500 hover:bg-teal-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag} 
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-teal-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Drop your file here or click to browse
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Supports CSV, Excel (.xlsx, .xls) files up to 50MB
                  </p>
                  <button className="px-4 py-2 bg-teal-700 text-white font-medium rounded-lg hover:bg-teal-800 transition-colors duration-200 text-sm">
                    Choose File
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-teal-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{uploadedFile.name}</h3>
                      <p className="text-sm text-gray-600">{formatFileSize(uploadedFile.size)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={removeFile}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Query Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-teal-700" />
              Step 2: What do you want to analyze?
            </h2>
            
            <div className="space-y-4 h-[65%]">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe what insights you're looking for... 
Examples:
• Show me sales trends over the last 12 months
• Compare performance across different regions
• Identify top-performing products by revenue
• Analyze customer demographics and behavior patterns"
                className="w-full h-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors duration-200 resize-none bg-white text-gray-900"
                style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
              />
              
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Quick suggestions:</span>
                {[
                  "Show trends over time",
                  "Compare categories",
                  "Find correlations",
                  "Identify outliers"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(suggestion)}
                    className="px-3 py-1 text-sm bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Button */}
        <div className="text-center">
          <button
            onClick={handleAnalysis}
            disabled={!uploadedFile || !query.trim() || isAnalyzing}
            className={`group relative inline-flex items-center gap-3 px-12 py-4 font-semibold rounded-xl text-lg transition-all duration-300 transform ${
              !uploadedFile || !query.trim() || isAnalyzing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-700 to-teal-600 text-white hover:from-teal-800 hover:to-teal-700 hover:scale-105 hover:shadow-xl shadow-teal-500/25'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Analyzing Your Data...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Start Analysis
              </>
            )}
          </button>
          
          {(!uploadedFile || !query.trim()) && (
            <div className="flex items-center justify-center gap-2 mt-4 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Please upload a file and enter your analysis query</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Analysis;
