'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiBarChart2,
  FiUsers,
  FiShoppingBag,
  FiTrendingUp,
  FiAward,
  FiArrowRight,
  FiCheckCircle,
  FiShield,
  FiClock,
  FiStar,
  FiGlobe,
} from 'react-icons/fi';

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const features = [
    {
      icon: <FiBarChart2 className="text-blue-500" />,
      title: 'Real-time Analytics',
      description: 'Track your sales performance with live data and interactive dashboards.',
    },
    {
      icon: <FiUsers className="text-green-500" />,
      title: 'Team Management',
      description: 'Manage your sales team, assign roles, and monitor performance metrics.',
    },
    {
      icon: <FiShoppingBag className="text-purple-500" />,
      title: 'Product Management',
      description: 'Register products, track inventory, and manage your catalog efficiently.',
    },
    {
      icon: <FiTrendingUp className="text-orange-500" />,
      title: 'Sales Forecasting',
      description: 'Predict future sales trends with AI-powered analytics and what-if scenarios.',
    },
    {
      icon: <FiAward className="text-red-500" />,
      title: 'Goal Tracking',
      description: 'Set and track sales targets, monitor progress, and celebrate achievements.',
    },
    {
      icon: <FiShield className="text-teal-500" />,
      title: 'Role-based Access',
      description: 'Secure multi-level access control with Super Admin, Manager, and User roles.',
    },
  ];

  const stats = [
    { value: '542K', label: 'Total Revenue', icon: <FiDollarSign className="text-green-500" /> },
    { value: '1.2K', label: 'Active Users', icon: <FiUsers className="text-blue-500" /> },
    { value: '94.5%', label: 'Satisfaction', icon: <FiStar className="text-yellow-500" /> },
    { value: '18.5%', label: 'Growth Rate', icon: <FiTrendingUp className="text-purple-500" /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <FiBarChart2 className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold text-gray-900">SalesHub</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition">About</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">Contact</a>
            </div>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-5 py-2 text-gray-600 hover:text-gray-900 transition font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <FiCheckCircle className="text-blue-600" />
                <span>Sales Management Platform</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Smart Sales{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Management
                </span>
                <br />
                Made Simple
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-lg">
                Streamline your sales process, manage your team, and grow your business with our comprehensive sales management system.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium flex items-center gap-2"
                  >
                    Go to Dashboard
                    <FiArrowRight />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/register"
                      className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium flex items-center gap-2"
                    >
                      Start Free Trial
                      <FiArrowRight />
                    </Link>
                    <Link
                      href="/auth/login"
                      className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-600 hover:text-blue-600 transition font-medium"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-8 flex items-center gap-8">
                <div className="flex items-center gap-2 text-gray-500">
                  <FiCheckCircle className="text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <FiCheckCircle className="text-green-500" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl opacity-10 blur-2xl"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <FiBarChart2 className="text-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Sales Dashboard</h3>
                      <p className="text-sm text-gray-500">Real-time overview</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-gray-500">Revenue</p>
                        <p className="text-xl font-bold text-blue-600">$542K</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-xl">
                        <p className="text-sm text-gray-500">Growth</p>
                        <p className="text-xl font-bold text-green-600">18.5%</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Progress</span>
                        <span className="text-sm font-semibold text-gray-900">75%</span>
                      </div>
                      <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-gray-50 rounded-xl">{stat.icon}</div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything You Need for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Sales Success
              </span>
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Powerful features designed to help you manage, track, and grow your sales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Transform Your Sales?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Join thousands of businesses already using SalesHub to grow their sales.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition font-medium flex items-center gap-2"
              >
                Go to Dashboard
                <FiArrowRight />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition font-medium flex items-center gap-2"
                >
                  Get Started Free
                  <FiArrowRight />
                </Link>
                <Link
                  href="/auth/login"
                  className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 transition font-medium"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
          <p className="mt-6 text-blue-200 text-sm">14-day free trial. No commitment required.</p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <FiBarChart2 className="text-white text-sm" />
                </div>
                <span className="text-white font-bold">SalesHub</span>
              </div>
              <p className="text-gray-400 text-sm">Smart sales management platform for modern businesses.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>&copy; 2026 SalesHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Import missing icon
import { FiDollarSign } from 'react-icons/fi';