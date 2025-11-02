import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  Download, 
  Trash2,
  FileText,
  Database,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';

function HistoryPage({ onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Mock analysis history data
  const analysisHistory = [
    {
      id: 1,
      name: "Sales Performance Q4 2024",
      dataset: "sales_data_2024.csv",
      status: "completed",
      date: "2024-01-15",
      time: "14:30",
      duration: "2m 45s",
      insights: 8,
      visualizations: 6,
      query: "Analyze quarterly sales performance and identify top-performing products",
      size: "2.4 MB"
    },
    {
      id: 2,
      name: "Customer Demographics Analysis",
      dataset: "customer_data.xlsx",
      status: "processing",
      date: "2024-01-14",
      time: "16:20",
      duration: "Processing...",
      insights: 0,
      visualizations: 0,
      query: "Break down customer demographics by age, location, and purchase behavior",
      size: "5.1 MB"
    },
    {
      id: 3,
      name: "Marketing Campaign ROI",
      dataset: "marketing_metrics.csv",
      status: "completed",
      date: "2024-01-13",
      time: "09:15",
      duration: "1m 32s",
      insights: 12,
      visualizations: 8,
      query: "Calculate ROI for different marketing channels and campaigns",
      size: "1.8 MB"
    },
    {
      id: 4,
      name: "Employee Performance Review",
      dataset: "hr_data_2024.xlsx",
      status: "failed",
      date: "2024-01-12",
      time: "11:45",
      duration: "Failed",
      insights: 0,
      visualizations: 0,
      query: "Analyze employee performance metrics and identify improvement areas",
      size: "3.2 MB"
    },
    {
      id: 5,
      name: "Website Traffic Analysis",
      dataset: "web_analytics.csv",
      status: "completed",
      date: "2024-01-11",
      time: "13:20",
      duration: "3m 12s",
      insights: 15,
      visualizations: 10,
      query: "Analyze website traffic patterns and user engagement metrics",
      size: "4.7 MB"
    },
    {
      id: 6,
      name: "Inventory Management Report",
      dataset: "inventory_data.xlsx",
      status: "completed",
      date: "2024-01-10",
      time: "10:30",
      duration: "2m 18s",
      insights: 6,
      visualizations: 4,
      query: "Track inventory levels and identify slow-moving products",
      size: "2.9 MB"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Loader className="h-5 w-5 text-yellow-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`;
  };

  const filteredAnalyses = analysisHistory.filter(analysis => {
    const matchesSearch = analysis.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.dataset.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || analysis.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalAnalyses = analysisHistory.length;
  const completedAnalyses = analysisHistory.filter(a => a.status === 'completed').length;
  const processingAnalyses = analysisHistory.filter(a => a.status === 'processing').length;
  const failedAnalyses = analysisHistory.filter(a => a.status === 'failed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[#00464B] hover:text-[#003A3E] transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
              <p className="text-gray-600 mt-1">View and manage your past data analyses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                <p className="text-3xl font-bold text-[#00464B]">{totalAnalyses}</p>
              </div>
              <div className="w-12 h-12 bg-[#00464B]/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-[#00464B]" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedAnalyses}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-3xl font-bold text-yellow-600">{processingAnalyses}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Loader className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-red-600">{failedAnalyses}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search analyses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00464B]/20 focus:border-[#00464B] transition-colors duration-200"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00464B]/20 focus:border-[#00464B] transition-colors duration-200"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00464B]/20 focus:border-[#00464B] transition-colors duration-200"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analysis List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Analysis History ({filteredAnalyses.length} results)
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredAnalyses.map((analysis) => (
              <div key={analysis.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(analysis.status)}
                      <h3 className="text-lg font-semibold text-gray-900">{analysis.name}</h3>
                      <span className={getStatusBadge(analysis.status)}>
                        {analysis.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Database className="h-4 w-4 mr-2" />
                          <span className="font-medium">Dataset:</span>
                          <span className="ml-1">{analysis.dataset}</span>
                          <span className="ml-2 text-gray-400">({analysis.size})</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="font-medium">Date:</span>
                          <span className="ml-1">{analysis.date} at {analysis.time}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="font-medium">Duration:</span>
                          <span className="ml-1">{analysis.duration}</span>
                        </div>
                      </div>

                      {analysis.status === 'completed' && (
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            <span className="font-medium">Insights:</span>
                            <span className="ml-1">{analysis.insights} generated</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            <span className="font-medium">Visualizations:</span>
                            <span className="ml-1">{analysis.visualizations} created</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Query:</span> {analysis.query}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {analysis.status === 'completed' && (
                      <>
                        <button className="p-2 text-gray-400 hover:text-[#00464B] transition-colors duration-200" title="View Results">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-[#00464B] transition-colors duration-200" title="Download">
                          <Download className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200" title="Delete">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAnalyses.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;