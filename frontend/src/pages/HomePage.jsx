import React, { useState } from 'react';
import { 
  BarChart3, 
  Database, 
  TrendingUp, 
  Clock, 
  User, 
  Settings,
  Upload,
  History,
  FileText,
  Activity,
  Calendar,
  ChevronRight,
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Plus
} from 'lucide-react';

function HomePage({ onNavigateToAnalysis, onNavigateToHistory, onNavigateToProfile }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    totalDatasets: 24,
    totalAnalyses: 47,
    successRate: 98.5,
    lastActivity: "2 hours ago"
  };

  // Mock recent analyses data
  const recentAnalyses = [
    {
      id: 1,
      name: "Sales Performance Q4",
      dataset: "sales_data_2024.csv",
      status: "completed",
      date: "2024-01-15",
      insights: 8
    },
    {
      id: 2,
      name: "Customer Demographics",
      dataset: "customer_data.xlsx",
      status: "processing",
      date: "2024-01-14",
      insights: 0
    },
    {
      id: 3,
      name: "Marketing Campaign ROI",
      dataset: "marketing_metrics.csv",
      status: "completed",
      date: "2024-01-13",
      insights: 12
    }
  ];

  const quickActions = [
    {
      title: "New Analysis",
      description: "Upload dataset and start analysis",
      icon: Upload,
      color: "from-[#00464B] to-[#006B73]",
      action: onNavigateToAnalysis
    },
    {
      title: "View History",
      description: "Browse past analyses",
      icon: History,
      color: "from-purple-600 to-purple-700",
      action: onNavigateToHistory
    },
    {
      title: "Data Library",
      description: "Manage your datasets",
      icon: Database,
      color: "from-emerald-600 to-emerald-700",
      action: () => console.log('Navigate to data library')
    },
    {
      title: "Templates",
      description: "Use analysis templates",
      icon: FileText,
      color: "from-amber-600 to-amber-700",
      action: () => console.log('Navigate to templates')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00464B] to-[#006B73] rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#00464B]">Auto-Viz</span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              <button 
                onClick={onNavigateToAnalysis}
                className="flex items-center space-x-2 text-gray-700 hover:text-[#00464B] transition-colors duration-200 font-medium"
              >
                <Upload className="h-4 w-4" />
                <span>Analyse</span>
              </button>
              <button 
                onClick={onNavigateToHistory}
                className="flex items-center space-x-2 text-gray-700 hover:text-[#00464B] transition-colors duration-200 font-medium"
              >
                <History className="h-4 w-4" />
                <span>History</span>
              </button>
            </div>

            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-[#00464B] transition-colors duration-200">
                <Bell className="h-5 w-5" />
              </button>
              <button 
                onClick={onNavigateToProfile}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-[#00464B] to-[#006B73] rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userData.name}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to unlock insights from your data? Let's dive in.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Datasets</p>
                <p className="text-3xl font-bold text-[#00464B]">{userData.totalDatasets}</p>
              </div>
              <div className="w-12 h-12 bg-[#00464B]/10 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-[#00464B]" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12% from last month
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Analyses Performed</p>
                <p className="text-3xl font-bold text-[#00464B]">{userData.totalAnalyses}</p>
              </div>
              <div className="w-12 h-12 bg-[#00464B]/10 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-[#00464B]" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8% from last month
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-[#00464B]">{userData.successRate}%</p>
              </div>
              <div className="w-12 h-12 bg-[#00464B]/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#00464B]" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +2.1% from last month
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Activity</p>
                <p className="text-lg font-semibold text-[#00464B]">{userData.lastActivity}</p>
              </div>
              <div className="w-12 h-12 bg-[#00464B]/10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#00464B]" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              Today at 2:30 PM
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-left"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-gradient-to-r ${action.color}`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#00464B] transition-colors duration-200">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {action.description}
                </p>
                <div className="flex items-center text-[#00464B] text-sm font-medium">
                  Get started
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Recent Analyses</h2>
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-400 hover:text-[#00464B] transition-colors duration-200">
                  <Search className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-[#00464B] transition-colors duration-200">
                  <Filter className="h-5 w-5" />
                </button>
                <button 
                  onClick={onNavigateToHistory}
                  className="text-[#00464B] hover:text-[#003A3E] font-medium text-sm transition-colors duration-200"
                >
                  View All
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {recentAnalyses.map((analysis) => (
              <div key={analysis.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{analysis.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        analysis.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {analysis.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{analysis.dataset}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {analysis.date}
                      </span>
                      {analysis.insights > 0 && (
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {analysis.insights} insights
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {analysis.status === 'completed' && (
                      <>
                        <button className="p-2 text-gray-400 hover:text-[#00464B] transition-colors duration-200">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-[#00464B] transition-colors duration-200">
                          <Download className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;