import React, { useState } from 'react';
import { Menu, X, FileText, Home, Search, BarChart2, MessageSquare, User, LogOut, CreditCard } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-indigo-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <FileText className="h-8 w-8 text-teal-400" />
              <span className="ml-2 text-xl font-bold">iknowmygrationrights</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/" icon={<Home size={18} />} text="Dashboard" active={location.pathname === '/'} />
            <NavLink to="/documents" icon={<FileText size={18} />} text="Documents" active={location.pathname === '/documents'} />
            <NavLink to="/search" icon={<Search size={18} />} text="Search" active={location.pathname === '/search'} />
            <NavLink to="/analytics" icon={<BarChart2 size={18} />} text="Analytics" active={location.pathname === '/analytics'} />
            <NavLink to="/chat" icon={<MessageSquare size={18} />} text="Chatbot" active={location.pathname === '/chat'} />
            <NavLink to="/pricing" icon={<CreditCard size={18} />} text="Pricing" active={location.pathname === '/pricing'} />
            
            <div className="ml-4 flex items-center space-x-2">
              <button className="flex items-center bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md transition-colors duration-200">
                <User size={18} className="mr-2" />
                <span>{user.email}</span>
              </button>
              <button 
                onClick={handleSignOut}
                className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-gray-200 hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-indigo-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink to="/" icon={<Home size={18} />} text="Dashboard" active={location.pathname === '/'} />
            <MobileNavLink to="/documents" icon={<FileText size={18} />} text="Documents" active={location.pathname === '/documents'} />
            <MobileNavLink to="/search" icon={<Search size={18} />} text="Search" active={location.pathname === '/search'} />
            <MobileNavLink to="/analytics" icon={<BarChart2 size={18} />} text="Analytics" active={location.pathname === '/analytics'} />
            <MobileNavLink to="/chat" icon={<MessageSquare size={18} />} text="Chatbot" active={location.pathname === '/chat'} />
            <MobileNavLink to="/pricing" icon={<CreditCard size={18} />} text="Pricing" active={location.pathname === '/pricing'} />
            <div className="border-t border-indigo-700 pt-2">
              <div className="px-3 py-2 text-sm text-gray-200">
                Signed in as: {user.email}
              </div>
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center px-3 py-2 text-base font-medium text-red-300 hover:text-red-100 hover:bg-red-600 rounded-md"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, text, active }) => (
  <Link 
    to={to}
    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
      active 
        ? 'bg-indigo-700 text-white' 
        : 'text-gray-200 hover:bg-indigo-700 hover:text-white'
    } transition-colors duration-200`}
  >
    <span className="mr-2">{icon}</span>
    {text}
  </Link>
);

const MobileNavLink: React.FC<NavLinkProps> = ({ to, icon, text, active }) => (
  <Link 
    to={to}
    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
      active 
        ? 'bg-indigo-700 text-white' 
        : 'text-gray-200 hover:bg-indigo-700 hover:text-white'
    } transition-colors duration-200`}
  >
    <span className="mr-3">{icon}</span>
    {text}
  </Link>
);

export default Navbar;