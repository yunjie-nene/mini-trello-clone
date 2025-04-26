import React from 'react';
import { PencilRulerIcon } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-400 text-white px-4 py-2 sm:py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PencilRulerIcon className="text-xl sm:text-2xl" />
          <h1 className="text-lg sm:text-xl font-bold">Nora Trello</h1>
        </div>

      </div>
    </header>
  );
};

export default Header;