
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { BookmarkIcon, LogIn, LogOut, User, BookOpen, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-library-primary text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center space-x-2">
            <BookmarkIcon size={24} />
            <span className="text-xl font-serif font-bold">{isMobile ? 'SS' : 'Shelf Sync'}</span>
          </Link>
          
          <nav>
            <ul className="flex items-center space-x-2 md:space-x-6">
              {!user ? (
                <>
                  <li>
                    <Link to="/login" className="flex items-center space-x-1 hover:text-library-secondary transition-colors">
                      <LogIn size={18} />
                      <span className="hidden md:inline">Login</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/register">
                      <Button variant="outline" size={isMobile ? "sm" : "default"} className="bg-white text-library-primary hover:bg-library-secondary">
                        {isMobile ? "Sign Up" : "Register"}
                      </Button>
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  {user.role === 'user' && (
                    <>
                      <li>
                        <Link 
                          to="/dashboard" 
                          className={`flex items-center space-x-1 hover:text-library-secondary transition-colors ${location.pathname === '/dashboard' ? 'text-library-secondary' : ''}`}
                        >
                          <User size={18} />
                          <span className="hidden md:inline">Dashboard</span>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/books" 
                          className={`flex items-center space-x-1 hover:text-library-secondary transition-colors ${location.pathname === '/books' ? 'text-library-secondary' : ''}`}
                        >
                          <BookOpen size={18} />
                          <span className="hidden md:inline">Available Books</span>
                        </Link>
                      </li>
                    </>
                  )}
                  
                  {user.role === 'admin' && (
                    <li>
                      <Link 
                        to="/admin/requests" 
                        className={`flex items-center space-x-1 hover:text-library-secondary transition-colors ${location.pathname === '/admin/requests' ? 'text-library-secondary' : ''}`}
                      >
                        <FileText size={18} />
                        <span className="hidden md:inline">Book Requests</span>
                      </Link>
                    </li>
                  )}
                  
                  <li className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <User size={18} />
                      <span className="hidden md:inline">{user.name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleLogout}
                      className="text-white hover:text-library-secondary"
                    >
                      <LogOut size={18} />
                      <span className="sr-only">Logout</span>
                    </Button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};
