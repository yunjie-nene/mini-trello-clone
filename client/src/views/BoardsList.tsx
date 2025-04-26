import React from 'react';
import { Link } from 'react-router-dom';
import { getBoards } from '../data/mockData';

const BoardsList: React.FC = () => {
  const boards = getBoards();
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Boards</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {boards.map(board => (
          <Link
            key={board._id}
            to={`/board/${board._id}`}
            className="bg-blue-100 hover:bg-blue-200 p-4 rounded-lg h-24 flex flex-col transition-colors"
          >
            <h3 className="font-medium text-lg">{board.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BoardsList;