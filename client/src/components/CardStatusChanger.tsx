import React from 'react';
import { List as ListType } from '../types';
import { useMutation } from '@apollo/client';
import { MOVE_CARD, GET_CARDS } from '../graphqlOperations';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface CardStatusChangerProps {
  cardId: string;
  currentListId: string;
  lists: ListType[];
  onMoveCard: (cardId: string, sourceListId: string, targetListId: string, position: number) => void;
}

const CardStatusChanger: React.FC<CardStatusChangerProps> = ({
  cardId,
  currentListId,
  lists,
  onMoveCard
}) => {

  const handleMoveToList = async (targetListId: string) => {
    if (targetListId === currentListId) return;
    onMoveCard(cardId, currentListId, targetListId, 999999);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button 
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded outline-none"
          aria-label="More options"
        >
          <MoreVertical size={16} />
        </button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-[180px] bg-white rounded-md p-1 shadow-md border border-gray-200 z-50"
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Label className="px-2 py-1.5 text-xs text-gray-500 font-medium">
            Move to
          </DropdownMenu.Label>
          
          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
          
          {lists.map(list => (
            <DropdownMenu.Item
              key={list._id}
              disabled={list._id === currentListId}
              onClick={() => handleMoveToList(list._id)}
              className={`px-2 py-1.5 text-sm rounded-sm outline-none cursor-pointer ${
                list._id === currentListId
                  ? 'opacity-50 cursor-not-allowed text-gray-400' 
                  : 'text-gray-700 focus:bg-blue-50 focus:text-blue-600'
              }`}
            >
              {list.title}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default CardStatusChanger;