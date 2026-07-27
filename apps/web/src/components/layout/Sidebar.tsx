'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FiHome,
  FiBarChart2,
  FiBell,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiUsers,
  FiTrendingUp,
  FiCpu,
} from 'react-icons/fi';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: FiHome },
  { name: 'Metrics', href: '/dashboard/metrics', icon: FiBarChart2 },
  { name: 'Alerts', href: '/dashboard/alerts', icon: FiBell },
  { name: 'Reports', href: '/dashboard/reports', icon: FiFileText },
  { name: 'Analytics', href: '/dashboard/analytics', icon: FiTrendingUp },
  { name: 'NLP Query', href: '/dashboard/nlp', icon: FiCpu },
  { name: 'What-If Analysis', href: '/dashboard/what-if', icon: FiUsers },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Logged out successfully');
    router.push('/auth/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiMenu size={24} className="text-gray-700" />
        </button>
        <span className="text-lg font-bold text-gray-900">Dashboard</span>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 lg:shadow-xl`}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Desktop */}
          <div className="hidden lg:flex flex-shrink-0 p-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiBarChart2 className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold text-gray-900">Dashboard</span>
            </Link>
          </div>

          {/* Logo - Mobile */}
          <div className="lg:hidden flex-shrink-0 p-4 border-b border-gray-200 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3" onClick={closeSidebar}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiBarChart2 className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold text-gray-900">Dashboard</span>
            </Link>
            <button
              onClick={closeSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX size={24} className="text-gray-700" />
            </button>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`text-xl flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium truncate">{item.name}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-8 bg-blue-600 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
            <div className="space-y-1">
              <Link
                href="/dashboard/settings"
                onClick={closeSidebar}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                <FiSettings className="text-xl text-gray-400 flex-shrink-0" />
                <span className="font-medium">Settings</span>
              </Link>
              <button
                onClick={() => {
                  closeSidebar();
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
              >
                <FiLogOut className="text-xl flex-shrink-0" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16"></div>
    </>
  );
}