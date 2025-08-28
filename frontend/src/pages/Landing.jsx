import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  Upload, 
  MessageSquare, 
  Eye, 
  Zap, 
  BarChart3, 
  Brain, 
  Search, 
  CheckCircle, 
  TrendingUp, 
  GraduationCap, 
  Wheat, 
  Briefcase,
  ChevronRight,
  Sparkles,
  Database,
  Target,
  Loader
} from 'lucide-react';
import DashboardCube from '../components/DashboardCube.jsx';
import { Link } from 'react-router-dom';

function Landing() {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-purple-100/30"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%236366F1%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative px-4 py-20 sm:py-28 lg:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center ">
              {/* Left Content */}
              <div className="text-center lg:text-left ">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-8">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Data Visualization
                </div>
                
                {/* Main Title */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  Unlock Insights from Your Data
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block mt-2">
                    Instantly 🚀
                  </span>
                </h1>
                
                {/* Subtitle */}
                <p className="text-2xl sm:text-3xl font-semibold text-gray-700 mb-4">
                  Upload. Ask. Discover.
                </p>
                
                {/* Description */}
                <p className="text-xl text-gray-600 max-w-3xl mx-auto lg:mx-0 mb-12 leading-relaxed">
                  Turn your spreadsheets into interactive dashboards without lifting a finger.
                </p>
                
                {/* CTA Button */}
                <Link to="/login">
                  <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-blue-500/25">
                    <Upload className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    Upload Your Data Now
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
              </div>
              
              {/* Right Content - 3D Cube */}
              <div className="flex justify-center lg:justify-end ">
                <div className="w-80 h-80 lg:w-96 lg:h-96">
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center bg-white/50 rounded-2xl border border-gray-200">
                      <Loader className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  }>
                    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                      <DashboardCube />
                    </Canvas>
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your data into actionable insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Upload,
                title: "Upload your dataset",
                description: "Excel or CSV files",
                step: "1"
              },
              {
                icon: MessageSquare,
                title: "Tell us what you want to analyze",
                description: "Ask questions in plain English",
                step: "2"
              },
              {
                icon: Eye,
                title: "Get results instantly",
                description: "Clean dataset + Tableau dashboard",
                step: "3"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="relative group h-80"
                onMouseEnter={() => setHoveredCard(`how-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="bg-white h-full p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500 transform hover:scale-105 flex flex-col justify-between">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {item.step}
                    </div>
                  </div>
                  
                  <div className="text-center flex-1 flex flex-col justify-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto transition-all duration-500 ${
                      hoveredCard === `how-${index}` 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      <item.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use This Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Use Auto-Viz?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed to save time and unlock the full potential of your data
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Save hours of manual work",
                description: "No more cleaning & chart building",
                color: "from-yellow-400 to-orange-500"
              },
              {
                icon: BarChart3,
                title: "Perfect graphs instantly",
                description: "No need to figure out what fits best",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Brain,
                title: "AI-powered insights",
                description: "Tailored to your questions",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Search,
                title: "Explore what matters",
                description: "Find patterns & trends automatically",
                color: "from-green-500 to-emerald-500"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                onMouseEnter={() => setHoveredCard(`why-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-gradient-to-r ${item.color}`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 px-4 bg-white/70">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              What You Get
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for professional data analysis
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Fully interactive Tableau dashboard",
                description: "Professional dashboards ready for presentation and exploration"
              },
              {
                icon: BarChart3,
                title: "6+ meaningful charts",
                description: "Automatically selected and optimized for your specific analysis needs"
              },
              {
                icon: Database,
                title: "Clean, reliable data",
                description: "Ready for deeper exploration with all inconsistencies resolved"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-6 border border-blue-200">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For You Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Perfect For
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're in business, research, or policy-making
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: TrendingUp,
                title: "Business teams",
                description: "Track KPIs and performance metrics",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: GraduationCap,
                title: "Researchers & students",
                description: "Analyze project data efficiently",
                gradient: "from-purple-500 to-purple-600"
              },
              {
                icon: Wheat,
                title: "Farmers & policymakers",
                description: "Understand crop and price trends",
                gradient: "from-green-500 to-green-600"
              },
              {
                icon: Briefcase,
                title: "Data-driven professionals",
                description: "Get insights fast from any dataset",
                gradient: "from-orange-500 to-orange-600"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className={`group relative overflow-hidden p-6 rounded-xl bg-gradient-to-br ${item.gradient} hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white`}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300"></div>
                <div className="relative z-10">
                  <item.icon className="h-8 w-8 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Stop struggling with messy files.
          </h2>
          <p className="text-2xl text-blue-100 mb-8">
            Start making data-driven decisions today.
          </p>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-white text-blue-600 font-semibold rounded-xl text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <Upload className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              Upload Your Data Now
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
          
          <p className="text-blue-100 mt-6 text-sm">
            No sign-up required • Secure file processing • Instant results
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">
            © 2025 Auto-Viz. Transform your data, unlock your potential.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;