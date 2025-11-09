import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  ArrowRight,
  DollarSign,
  Clock,
  BarChart3,
  Globe,
  Sparkles,
  Star
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0);

  const rotatingTexts = [
    'increased productivity',
    'improved collaboration',
    'dynamic teams',
    'task control'
  ];

  // Rotate text every 3 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Create and send invoices in seconds. Our streamlined interface makes invoicing a breeze.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Bank-level encryption keeps your financial data safe and secure at all times.'
    },
    {
      icon: TrendingUp,
      title: 'Business Insights',
      description: 'Track revenue, expenses, and cash flow with powerful analytics and reports.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with role-based access and real-time updates.'
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'Log hours, track project progress, and bill accurately for your time.'
    },
    {
      icon: Globe,
      title: 'Financial Management',
      description: 'Complete financial tracking and reporting in Indian Rupees.'
    }
  ];

  const benefits = [
    'Unlimited invoices and quotes',
    'Project and task management',
    'Expense tracking and receipts',
    'Customer and vendor management',
    'Real-time notifications',
    'Mobile responsive design',
    'Export to PDF and Excel',
    'Multi-user collaboration'
  ];

  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '$50M+', label: 'Invoices Processed' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary-100 rounded-xl">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">OneFlow</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 font-medium transition-colors">
                Features
              </a>
              <a href="#benefits" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 font-medium transition-colors">
                Benefits
              </a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 font-medium transition-colors">
                Pricing
              </a>
              <Link
                to="/register"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Link
                to="/register"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-primary-600 mr-2" />
              <span className="text-sm font-semibold text-primary-700">
                The Future of Invoicing is Here
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6">
              <span className="block text-gray-900 dark:text-white">
                Project management software
              </span>
              <span className="block text-gray-900 dark:text-white">
                built for
              </span>
              <span className="block relative overflow-hidden" style={{ height: '1.2em' }}>
                <span
                  key={currentTextIndex}
                  className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent animate-slide-up"
                >
                  {rotatingTexts[currentTextIndex]}
                </span>
              </span>
            </h1>

            {/* Subheading - Feature Points */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-10 text-gray-700 dark:text-gray-300 font-medium">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary-600 mr-2" />
                Plan your projects
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary-600 mr-2" />
                Track work efficiently
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary-600 mr-2" />
                Collaborate with global teams
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/register"
                className="group px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Hero Image / Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-inner min-h-[600px]">
                {/* Browser Chrome */}
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-4 flex-1 h-7 bg-white dark:bg-gray-800 rounded-lg flex items-center px-3">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="space-y-4">
                  {/* Header with Welcome */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Welcome back, Sarah!</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Here's what's happening today</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        SM
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-blue-400">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Active Projects</div>
                      <div className="text-2xl font-bold text-blue-600">12</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-400">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Completed</div>
                      <div className="text-2xl font-bold text-green-600">48</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-400">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Hours Logged</div>
                      <div className="text-2xl font-bold text-yellow-600">156</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-purple-400">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Revenue</div>
                      <div className="text-2xl font-bold text-purple-600">$45K</div>
                    </div>
                  </div>

                  {/* Main Content Area - Charts and Projects */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Left - Line Chart */}
                    <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Weekly Activity</div>
                      {/* Simple Line Chart */}
                      <div className="relative h-40">
                        <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                          {/* Grid lines */}
                          <line x1="0" y1="30" x2="300" y2="30" stroke="#f3f4f6" strokeWidth="1"/>
                          <line x1="0" y1="60" x2="300" y2="60" stroke="#f3f4f6" strokeWidth="1"/>
                          <line x1="0" y1="90" x2="300" y2="90" stroke="#f3f4f6" strokeWidth="1"/>
                          {/* Line chart path */}
                          <path
                            d="M 0 80 L 50 60 L 100 40 L 150 50 L 200 30 L 250 45 L 300 20"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          {/* Area fill */}
                          <path
                            d="M 0 80 L 50 60 L 100 40 L 150 50 L 200 30 L 250 45 L 300 20 L 300 120 L 0 120 Z"
                            fill="url(#gradient)"
                            opacity="0.2"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="flex justify-between mt-3">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                          <div key={i} className="text-xs text-gray-400">{day}</div>
                        ))}
                      </div>
                    </div>

                    {/* Right - Team Members */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Team Members</div>
                      <div className="space-y-3">
                        {/* Team Member 1 - Admin */}
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            SM
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-800 dark:text-gray-200">Sarah Miller</div>
                            <div className="text-xs text-purple-600 font-medium">Admin</div>
                          </div>
                        </div>
                        {/* Team Member 2 - Manager */}
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            JD
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-800 dark:text-gray-200">John Davis</div>
                            <div className="text-xs text-blue-600 font-medium">Project Manager</div>
                          </div>
                        </div>
                        {/* Team Member 3 - Employee */}
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            AK
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-800 dark:text-gray-200">Alex Kim</div>
                            <div className="text-xs text-green-600 font-medium">Team Member</div>
                          </div>
                        </div>
                        {/* Team Member 4 */}
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            MC
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-800 dark:text-gray-200">Maria Chen</div>
                            <div className="text-xs text-pink-600 font-medium">Sales/Finance</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Progress Bars */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Project 1 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">Website Redesign</div>
                        <div className="text-xs font-semibold text-blue-600">75%</div>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Due: Dec 15</div>
                      </div>
                    </div>

                    {/* Project 2 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">Mobile App Development</div>
                        <div className="text-xs font-semibold text-green-600">45%</div>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-white"></div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Due: Jan 20</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section - Donut Chart and Task Progress */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Donut Chart - Project Status */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Project Status</div>
                      <div className="flex items-center justify-center">
                        {/* Donut Chart */}
                        <svg className="w-32 h-32" viewBox="0 0 100 100">
                          {/* Background circle */}
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="12"/>
                          {/* Blue segment (Completed) - 40% */}
                          <circle 
                            cx="50" cy="50" r="40" 
                            fill="none" 
                            stroke="#3b82f6" 
                            strokeWidth="12"
                            strokeDasharray="100 151"
                            transform="rotate(-90 50 50)"
                          />
                          {/* Yellow segment (Active) - 30% */}
                          <circle 
                            cx="50" cy="50" r="40" 
                            fill="none" 
                            stroke="#fbbf24" 
                            strokeWidth="12"
                            strokeDasharray="75 176"
                            strokeDashoffset="-100"
                            transform="rotate(-90 50 50)"
                          />
                          {/* Cyan segment (In Progress) - 20% */}
                          <circle 
                            cx="50" cy="50" r="40" 
                            fill="none" 
                            stroke="#06b6d4" 
                            strokeWidth="12"
                            strokeDasharray="50 201"
                            strokeDashoffset="-175"
                            transform="rotate(-90 50 50)"
                          />
                          {/* Center text */}
                          <text x="50" y="50" textAnchor="middle" dy="7" fontSize="20" fontWeight="bold" fill="#1f2937">
                            8
                          </text>
                        </svg>
                      </div>
                      {/* Legend */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                            <span className="text-gray-600 dark:text-gray-400">Completed</span>
                          </div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">40%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                            <span className="text-gray-600 dark:text-gray-400">Active</span>
                          </div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">30%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-cyan-400 mr-2"></div>
                            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
                          </div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">20%</span>
                        </div>
                      </div>
                    </div>

                    {/* Task Progress Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Current Sprint</div>
                      <div className="flex items-center space-x-4">
                        {/* Circular Progress */}
                        <div className="relative w-20 h-20">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="32" stroke="#e5e7eb" strokeWidth="8" fill="none"/>
                            <circle 
                              cx="40" cy="40" r="32" 
                              stroke="#3b82f6" 
                              strokeWidth="8" 
                              fill="none"
                              strokeDasharray="201"
                              strokeDashoffset="138"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">31%</span>
                          </div>
                        </div>
                        {/* Details */}
                        <div className="flex-1 space-y-2">
                          <div className="text-xs font-medium text-gray-800 dark:text-gray-200">Martin Young</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Nov 2 - Nov 14</div>
                          <div className="text-xs text-red-500 font-medium">2 days behind</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Employee Tracking / Task Assignment */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Active Tasks</div>
                    <div className="space-y-3">
                      {/* Task Row 1 */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border-l-3 border-blue-400">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            AM
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-800 dark:text-gray-200">Alice Martinez</div>
                            <div className="text-xs text-blue-600">UI/UX Design Task</div>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-blue-100 rounded-full">
                          <span className="text-xs font-semibold text-blue-700">In Progress</span>
                        </div>
                      </div>

                      {/* Task Row 2 */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg border-l-3 border-green-400">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            SJ
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-800 dark:text-gray-200">Sam Johnson</div>
                            <div className="text-xs text-green-600">Backend Development</div>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-green-100 rounded-full">
                          <span className="text-xs font-semibold text-green-700">Completed</span>
                        </div>
                      </div>

                      {/* Task Row 3 */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg border-l-3 border-purple-400">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            RK
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-800 dark:text-gray-200">Robert Kumar</div>
                            <div className="text-xs text-purple-600">Database Optimization</div>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-purple-100 rounded-full">
                          <span className="text-xs font-semibold text-purple-700">Review</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to save you time and help you get paid faster
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose OneFlow?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Join thousands of businesses that trust OneFlow to manage their invoicing and finances
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all transform hover:scale-105 shadow-xl"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Right - Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-8 w-8 text-primary-600" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">$125,430</div>
                      </div>
                    </div>
                    <div className="text-green-500 text-sm font-semibold">+12.5%</div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">Invoice #{1000 + i}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Client Project</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white">${(i * 1250).toFixed(2)}</div>
                          <div className="text-xs text-green-600">Paid</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold text-gray-900 dark:text-white">4.9/5</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Starter</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Up to 5 invoices/month
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  1 project
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Basic support
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-primary-300 hover:bg-gray-50 dark:bg-gray-700 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan - Highlighted */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 shadow-2xl transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 dark:text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  POPULAR
                </span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-white">$29</span>
                  <span className="text-primary-100 ml-2">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                  Unlimited invoices
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                  Unlimited projects
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                  Team collaboration
                </li>
                <li className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-3 flex-shrink-0" />
                  Priority support
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center px-6 py-3 bg-white dark:bg-gray-800 text-primary-600 rounded-lg font-semibold hover:bg-gray-50 dark:bg-gray-700 transition-all shadow-lg"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">$99</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Everything in Pro
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Advanced analytics
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Custom integrations
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  24/7 phone support
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-primary-300 hover:bg-gray-50 dark:bg-gray-700 transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Businesses Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "OneFlow transformed how we handle invoicing. It's fast, intuitive, and our clients love the professional look.",
                author: "Sarah Johnson",
                role: "CEO, TechStart Inc.",
                rating: 5
              },
              {
                quote: "Managing multiple projects became so much easier. The time tracking and reporting features are exceptional.",
                author: "Michael Chen",
                role: "Freelance Designer",
                rating: 5
              },
              {
                quote: "Best invoicing software we've used. The support team is responsive and the features keep getting better!",
                author: "Emma Williams",
                role: "Agency Owner",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white dark:bg-gray-800 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white dark:bg-gray-800 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Simplify Your Invoicing?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Join thousands of businesses using OneFlow. Start your free 30-day trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group px-8 py-4 bg-white dark:bg-gray-800 text-primary-600 rounded-xl font-semibold text-lg hover:bg-gray-50 dark:bg-gray-700 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white dark:bg-gray-800/10 transition-all transform hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-primary-600 rounded-xl">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">OneFlow</span>
              </div>
              <p className="text-sm text-gray-400">
                Invoicing made simple for modern businesses.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Updates</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} OneFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

