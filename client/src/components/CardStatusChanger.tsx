import React from 'react';
import { List as ListType } from '../types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, ArrowRight } from 'lucide-react';

interface CardStatusChangerProps {
  cardId: string;
  currentListId: string;
  lists: ListType[];
  onMoveCard: (cardId: string, targetListId: string, position: number) => void;
}

const CardStatusChanger: React.FC<CardStatusChangerProps> = ({
  cardId,
  currentListId,
  lists,
  onMoveCard
}) => {

  const handleMoveToList = async (targetListId: string) => {
    if (targetListId === currentListId) return;
    onMoveCard(cardId,targetListId, 999999);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button 
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg outline-none transition-all duration-200 group"
          aria-label="More options"
        >
          <MoreVertical size={16} className="group-hover:scale-110 transition-transform duration-200" />
        </button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-[200px] bg-white/95 backdrop-blur-md rounded-xl p-2 shadow-xl border border-gray-200 z-50"
          sideOffset={8}
          align="end"
        >
          <DropdownMenu.Label className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 font-semibold">
            <ArrowRight size={14} />
            Move to List
          </DropdownMenu.Label>
          
          <DropdownMenu.Separator className="h-px bg-gray-200 my-2" />
          
          {lists.map(list => (
            <DropdownMenu.Item
              key={list._id}
              disabled={list._id === currentListId}
              onClick={() => handleMoveToList(list._id)}
              className={`flex items-center px-3 py-2.5 text-sm rounded-lg outline-none cursor-pointer transition-all duration-200 ${
                list._id === currentListId
                  ? 'opacity-50 cursor-not-allowed text-gray-400 bg-gray-50' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:scale-105'
              }`}
            >
              <div className={`w-3 h-3 rounded-full mr-3 ${
                list._id === currentListId 
                  ? 'bg-gray-300' 
                  : 'bg-gradient-to-r from-blue-400 to-purple-400'
              }`} />
              {list.title}
              {list._id === currentListId && (
                <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded-full">Current</span>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default CardStatusChanger;