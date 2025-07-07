
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/authcontext';

const Header = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="text-2xl font-bold text-brand-dark hover:text-brand-primary transition-colors">
          TS School
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {user.cargo}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
