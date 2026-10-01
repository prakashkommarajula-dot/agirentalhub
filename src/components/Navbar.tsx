import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tractor, User, LogOut, Menu, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
                <Tractor className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
                AgriRent
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link to={user.role === 'farmer' ? '/farmer/home' : user.role === 'owner' ? '/owner/dashboard' : '/admin/dashboard'} className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link to="/bookings" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
                  My Bookings
                </Link>
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>
                  <div className="flex items-center space-x-3 pl-4 border-l border-gray-100">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{user.displayName}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/login" className="bg-emerald-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95">
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-emerald-50 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {user ? (
                <>
                  <Link to={user.role === 'farmer' ? '/farmer/home' : user.role === 'owner' ? '/owner/dashboard' : '/admin/dashboard'} className="block px-4 py-3 text-gray-600 font-medium hover:bg-emerald-50 rounded-xl">Dashboard</Link>
                  <Link to="/bookings" className="block px-4 py-3 text-gray-600 font-medium hover:bg-emerald-50 rounded-xl">My Bookings</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl flex items-center space-x-2">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="block px-4 py-3 bg-emerald-600 text-white text-center font-bold rounded-xl shadow-lg shadow-emerald-100">Login / Signup</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
