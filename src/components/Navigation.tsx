import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import cyberLogo from '@/assets/cyber-logo.png';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b bg-card/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CyberSecure
            </h1>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant={isActive('/') ? 'default' : 'ghost'}
              asChild
              className="font-medium"
            >
              <Link to="/">Home</Link>
            </Button>
            <Button
              variant={isActive('/about') ? 'default' : 'ghost'}
              asChild
              className="font-medium"
            >
              <Link to="/about">About</Link>
            </Button>
            <Button
              variant={isActive('/contact') ? 'default' : 'ghost'}
              asChild
              className="font-medium"
            >
              <Link to="/contact">Contact</Link>
            </Button>
          </div>
          
          {/* Mobile Menu - Simple for now */}
          <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/about">About</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/contact">Contact</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;