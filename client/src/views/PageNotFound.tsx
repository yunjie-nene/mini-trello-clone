import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const PageNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center mx-auto"
        >
          <Home size={16} className="mr-2" />
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;