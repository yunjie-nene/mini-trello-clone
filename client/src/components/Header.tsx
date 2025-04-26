import React from 'react';
import { FaTrello } from 'react-icons/fa';

const Header: React.FC = () => {
  return (
    <header className=" bg-blue-400 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FaTrello className="text-2xl" />
          <h1 className="text-xl font-bold">Nora Trello</h1>
        </div>
        {/* TODO:add board creation functionality later with React Router */}
      </div>
    </header>
  );
};

export default Header;