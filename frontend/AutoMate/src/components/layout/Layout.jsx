import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * Main layout component that combines Header, Sidebar, and main content area
 */
const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header 
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={toggleMobileMenu}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
        />

        {/* Main content area */}
        <main className="flex-1 lg:ml-0">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;