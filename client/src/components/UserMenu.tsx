import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface UserMenuProps {
  username?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ username = 'User' }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600', 
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-teal-500 to-teal-600'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-200 group">
          <div className={`w-10 h-10 bg-gradient-to-r ${getAvatarColor(username)} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
            <span className="text-white font-bold text-sm">
              {getInitials(username)}
            </span>
          </div>
          <span className="text-white font-medium hidden sm:block group-hover:text-blue-100 transition-colors duration-200">
            {username}
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] bg-white/95 backdrop-blur-md rounded-xl p-2 shadow-xl border border-gray-200 z-50"
          sideOffset={8}
          align="end"
        >
          <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100">
            <div className={`w-10 h-10 bg-gradient-to-r ${getAvatarColor(username)} rounded-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">
                {getInitials(username)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{username}</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          <DropdownMenu.Separator className="h-px bg-gray-200 my-2" />
          <DropdownMenu.Item
            className="flex items-center px-3 py-2.5 text-sm rounded-lg outline-none cursor-pointer text-red-600 hover:bg-red-50 transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-3" />
            Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default UserMenu;