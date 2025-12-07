import React from 'react';
import { User, PageView } from '../types';
import { LogOut, Home, Car } from 'lucide-react';

interface LayoutProps {
  currentUser: User | null;
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentUser, currentPage, onNavigate, onLogout, children }) => {
  const showHeader = !!currentUser;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {showHeader && (
        <header className="bg-blue-900 text-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div 
                className="flex items-center cursor-pointer space-x-2" 
                onClick={() => onNavigate('dashboard')}
              >
                <Car className="h-6 w-6 text-blue-300" />
                <span className="font-bold text-xl tracking-tight">IBA Carpool</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="hidden sm:inline text-sm text-blue-200">Hello, {currentUser.name}</span>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`p-2 rounded-full hover:bg-blue-800 transition ${currentPage === 'dashboard' ? 'bg-blue-800' : ''}`}
                  title="Dashboard"
                >
                  <Home className="h-5 w-5" />
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} IBA Carpool Connect. Student Project.
        </div>
      </footer>
    </div>
  );
};