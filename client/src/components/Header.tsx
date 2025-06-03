import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Trello } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GET_CURRENT_USER } from '../graphqlOperations';
import UserMenu from './UserMenu';

const Header: React.FC = () => {
  const { token } = useAuth();
  const { data: userData } = useQuery(GET_CURRENT_USER, {
    skip: !token,
    errorPolicy: 'ignore'
  });

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white px-4 py-3 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
              <Trello className="text-xl sm:text-2xl" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-wide group-hover:text-blue-100 transition-colors duration-300">
              Nora Trello
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="px-4 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-300 font-medium border border-white/20 hover:border-white/40 hover:shadow-lg"
          >
            Boards
          </Link>
          
          {token && (
            <UserMenu username={userData?.me?.username || 'User'} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;