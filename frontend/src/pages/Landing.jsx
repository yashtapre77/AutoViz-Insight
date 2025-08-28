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
  Loader,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Users,
  Award,
  Shield
} from 'lucide-react';
import DashboardCube from '../components/DashboardCube';
import { Link, useNavigate } from 'react-router-dom';

function App() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const navigate = useNavigate();

   const goToLogin = () => {
    navigate("/login"); // 👈 Navigate to /login
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#00464B] to-[#006B73] rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-[#00464B]">Auto-Viz</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-700 hover:text-[#00464B] transition-colors duration-200 font-medium"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('why-use-us')}
                className="text-gray-700 hover:text-[#00464B] transition-colors duration-200 font-medium"
              >
                Why Use Us
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-[#00464B] transition-colors duration-200 font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gray-700 hover:text-[#00464B] transition-colors duration-200 font-medium"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-gray-700 hover:text-[#00464B] transition-colors duration-200 font-medium"
              >
                Contact
              </button>
            </div>

            {/* Sign In Button & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button className="hidden md:inline-flex items-center px-6 py-2 bg-[#00464B] text-white font-medium rounded-lg hover:bg-[#003A3E] transition-colors duration-200"
              onClick={goToLogin}>
                Sign In
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-700 hover:text-[#00464B] hover:bg-gray-100 transition-colors duration-200"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#00464B] hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => scrollToSection('why-use-us')}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#00464B] hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                >
                  Why Use Us
                </button>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#00464B] hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#00464B] hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                >
                  About
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#00464B] hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                >
                  Contact
                </button>

                <button className="mx-4 mt-2 px-6 py-2 bg-[#00464B] text-white font-medium rounded-lg hover:bg-[#003A3E] transition-colors duration-200"
                onClick={goToLogin}>
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00464B]/5 to-[#006B73]/5"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%2300464B%22 fill-opacity=%220.08%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative px-4 py-20 sm:py-28 lg:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00464B]/10 border border-[#00464B]/20 rounded-full text-[#00464B] text-sm font-medium mb-8">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Data Visualization
                </div>
                
                {/* Main Title */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  Unlock Insights from Your Data
                  <span className="bg-gradient-to-r from-[#00464B] to-[#006B73] bg-clip-text text-transparent block mt-2">
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
                <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00464B] to-[#006B73] text-white font-semibold rounded-xl text-lg hover:from-[#003A3E] hover:to-[#005A61] transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-[#00464B]/25"
                onClick={goToLogin}>
                  <Upload className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  Upload Your Data Now
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
              
              {/* Right Content - Enhanced 3D Cube */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-96 h-96 lg:w-[28rem] lg:h-[28rem]">
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center bg-white/50 rounded-2xl border border-gray-200">
                      <Loader className="h-8 w-8 animate-spin text-[#00464B]" />
                    </div>
                  }>
                    <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
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
      <section id="how-it-works" className="py-20 px-4 bg-white/70">
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
                description: "Excel or CSV files - we handle all formats and sizes with intelligent preprocessing",
                step: "1"
              },
              {
                icon: MessageSquare,
                title: "Tell us what you want to analyze",
                description: "Ask questions in plain English - our AI understands your business context",
                step: "2"
              },
              {
                icon: Eye,
                title: "Get results instantly",
                description: "Clean dataset + interactive Tableau dashboard with professional visualizations",
                step: "3"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="relative group h-80"
                onMouseEnter={() => setHoveredCard(`how-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="bg-white h-full p-8 rounded-2xl border border-gray-200 hover:border-[#00464B]/30 hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 flex flex-col justify-between">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#00464B] to-[#006B73] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  
                  <div className="text-center flex-1 flex flex-col justify-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto transition-all duration-500 ${
                      hoveredCard === `how-${index}` 
                        ? 'bg-gradient-to-r from-[#00464B] to-[#006B73] text-white shadow-lg' 
                        : 'bg-[#00464B]/10 text-[#00464B]'
                    }`}>
                      <item.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use Us Section */}
      <section id="why-use-us" className="py-20 px-4 bg-gradient-to-r from-[#00464B]/5 to-[#006B73]/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Auto-Viz?
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
                description: "No more cleaning & chart building - automated data processing",
                color: "from-amber-400 to-orange-500"
              },
              {
                icon: BarChart3,
                title: "Perfect graphs instantly",
                description: "AI selects optimal visualizations for your specific data patterns",
                color: "from-[#00464B] to-[#006B73]"
              },
              {
                icon: Brain,
                title: "AI-powered insights",
                description: "Advanced analytics tailored to your business questions",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Search,
                title: "Explore what matters",
                description: "Discover hidden patterns & trends automatically with smart algorithms",
                color: "from-emerald-500 to-teal-500"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-[#00464B]/30 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                onMouseEnter={() => setHoveredCard(`why-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-gradient-to-r ${item.color}`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/70">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              What You Get
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for professional data analysis and presentation
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Fully interactive Tableau dashboard",
                description: "Professional dashboards ready for presentation and exploration with drill-down capabilities and real-time filtering"
              },
              {
                icon: BarChart3,
                title: "6+ meaningful visualizations",
                description: "Automatically selected and optimized charts including bar, line, scatter, heatmaps, and custom visualizations for your specific analysis needs"
              },
              {
                icon: Database,
                title: "Clean, reliable dataset",
                description: "Professionally cleaned data ready for deeper exploration with all inconsistencies resolved, duplicates removed, and proper formatting applied"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-gray-200 hover:border-[#00464B]/30 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#00464B]/10 to-[#006B73]/10 rounded-2xl mb-6 border border-[#00464B]/20">
                  <CheckCircle className="h-8 w-8 text-[#00464B]" />
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

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-gradient-to-r from-[#00464B]/5 to-[#006B73]/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Perfect For
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're in business, research, or policy-making
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: TrendingUp,
                title: "Business teams",
                description: "Track KPIs, performance metrics, and business intelligence",
                gradient: "from-[#00464B] to-[#003A3E]"
              },
              {
                icon: GraduationCap,
                title: "Researchers & students",
                description: "Analyze research data and academic projects efficiently",
                gradient: "from-[#006B73] to-[#005A61]"
              },
              {
                icon: Wheat,
                title: "Farmers & policymakers",
                description: "Understand agricultural trends, crop data, and policy impacts",
                gradient: "from-emerald-600 to-emerald-700"
              },
              {
                icon: Briefcase,
                title: "Data professionals",
                description: "Get rapid insights from any dataset for strategic decisions",
                gradient: "from-slate-600 to-slate-700"
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
                  <p className="text-white/90 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Company Stats */}
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: Users, number: "10,000+", label: "Happy Users" },
              { icon: Award, number: "99.9%", label: "Accuracy Rate" },
              { icon: Shield, number: "100%", label: "Data Security" }
            ].map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-[#00464B]/10 rounded-lg mb-4 mx-auto">
                  <stat.icon className="h-6 w-6 text-[#00464B]" />
                </div>
                <div className="text-3xl font-bold text-[#00464B] mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-white/70">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600">
              Ready to transform your data? Contact us today
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-[#00464B]/10 rounded-lg">
                  <Mail className="h-6 w-6 text-[#00464B]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Email Us</h3>
                  <p className="text-gray-600">support@auto-viz.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-[#00464B]/10 rounded-lg">
                  <Phone className="h-6 w-6 text-[#00464B]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Call Us</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-[#00464B]/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-[#00464B]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Visit Us</h3>
                  <p className="text-gray-600">123 Data Street, Analytics City, AC 12345</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00464B]/20 focus:border-[#00464B] transition-colors duration-200"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00464B]/20 focus:border-[#00464B] transition-colors duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows="4" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00464B]/20 focus:border-[#00464B] transition-colors duration-200"
                    placeholder="Tell us about your data visualization needs..."
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#00464B] to-[#006B73] text-white font-medium rounded-lg hover:from-[#003A3E] hover:to-[#005A61] transition-all duration-200 transform hover:scale-105"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#00464B] to-[#006B73]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Stop struggling with messy files.
          </h2>
          <p className="text-2xl text-[#00464B]/20 mb-8">
            Start making data-driven decisions today.
          </p>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-white text-[#00464B] font-semibold rounded-xl text-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            onClick={goToLogin}>
              <Upload className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              Upload Your Data Now
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
          
          <p className="text-[#00464B]/30 mt-6 text-sm">
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

export default App;