import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Eye, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const { user, setUser } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-blue-600" />
              <span className="text-3xl font-semibold text-gray-900 tracking-wide">
                <span className="text-blue-600">OCT</span> Vision{' '}
                <span className="text-blue-600">AI</span>
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link to="/diagnosis" className="text-gray-700 hover:text-blue-600">
                  Diagnosis
                </Link>
                <Link to="/education" className="text-gray-700 hover:text-blue-600">
                  Education
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 pl-4">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="flex flex-col space-y-2 mt-2">
              {user ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                    Dashboard
                  </Link>
                  <Link to="/diagnosis" className="text-gray-700 hover:text-blue-600">
                    Diagnosis
                  </Link>
                  <Link to="/education" className="text-gray-700 hover:text-blue-600">
                    Education
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 pl-4">
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}