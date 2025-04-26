import React from 'react';
import { Link } from 'react-router-dom';
import { Trello } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-400 text-white px-4 py-2 sm:py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <Trello className="text-xl sm:text-2xl" />
            <h1 className="text-lg sm:text-xl font-bold">Nora Trello</h1>
          </Link>
        </div>
        
        <div className="flex items-center">
          <Link to="/" className="px-3 py-1 rounded hover:bg-blue-500">
            Boards
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;