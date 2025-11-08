import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
          onClick={() => setSidebarOpen(false)} 
        />
        <div className="relative flex-1 flex flex-col max-w-xs w-full">
          <Sidebar 
            onClose={() => setSidebarOpen(false)}
            isExpanded={true}
            setIsExpanded={null}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div 
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 z-30 transition-all duration-300 p-4 ${
          sidebarExpanded ? 'md:w-72' : 'md:w-28'
        }`}
      >
        <Sidebar 
          isExpanded={sidebarExpanded}
          setIsExpanded={setSidebarExpanded}
        />
      </div>

      {/* Main content */}
      <div 
        className={`md:flex md:flex-col md:flex-1 transition-all duration-300 ${
          sidebarExpanded ? 'md:pl-72' : 'md:pl-28'
        }`}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

