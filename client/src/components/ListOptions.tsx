import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_LIST, DELETE_LIST, GET_LISTS, GET_CARDS } from '../graphqlOperations';
import { MoreHorizontal, Edit2, Trash2, X, Settings } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface ListOptionsProps {
  listId: string;
  boardId: string;
  listTitle: string;
  onListUpdated: () => void;
}

const ListOptions: React.FC<ListOptionsProps> = ({ listId, boardId, listTitle, onListUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(listTitle);

  const [updateList, { loading: updateLoading }] = useMutation(UPDATE_LIST, {
    refetchQueries: [
      { query: GET_LISTS, variables: { boardId } }
    ],
    onCompleted: () => {
      setIsEditing(false);
      onListUpdated();
    }
  });

  const [deleteList] = useMutation(DELETE_LIST, {
    refetchQueries: [
      { query: GET_LISTS, variables: { boardId } },
      { query: GET_CARDS }
    ],
    onCompleted: () => {
      onListUpdated();
    }
  });

  const handleUpdateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        await updateList({
          variables: {
            id: listId,
            title: title.trim()
          }
        });
      } catch (error) {
        console.error('Error updating list:', error);
      }
    }
  };

  const handleDeleteList = async () => {
    if (window.confirm('Are you sure you want to delete this list and all its cards? This action cannot be undone.')) {
      try {
        await deleteList({
          variables: {
            id: listId
          }
        });
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleUpdateList} className="flex gap-2 items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 bg-white border-2 border-blue-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[150px]"
          autoFocus
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium hover:scale-105 transition-all duration-200"
          disabled={updateLoading}
        >
          {updateLoading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setTitle(listTitle);
          }}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <X size={18} />
        </button>
      </form>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="p-2 rounded-xl hover:bg-gray-200/80 backdrop-blur-sm transition-all duration-200 group">
          <MoreHorizontal size={18} className="text-gray-600 group-hover:text-gray-800" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] bg-white/95 backdrop-blur-md rounded-xl p-2 shadow-xl border border-gray-200 z-50"
          sideOffset={8}
          align="end"
        >
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 font-semibold">
            <Settings size={14} />
            List Options
          </div>
          
          <DropdownMenu.Item
            className="flex items-center px-3 py-2.5 text-sm rounded-lg outline-none cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-105"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 size={16} className="mr-3" />
            Rename List
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 my-2" />

          <DropdownMenu.Item
            className="flex items-center px-3 py-2.5 text-sm rounded-lg outline-none cursor-pointer text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-105"
            onClick={handleDeleteList}
          >
            <Trash2 size={16} className="mr-3" />
            Delete List
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ListOptions;