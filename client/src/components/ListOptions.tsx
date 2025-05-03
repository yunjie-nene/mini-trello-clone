import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_LIST, DELETE_LIST, GET_LISTS, GET_CARDS } from '../graphqlOperations';
import { MoreHorizontal, Edit2, Trash2, X } from 'lucide-react';
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
          className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          autoFocus
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
          disabled={updateLoading}
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setTitle(listTitle);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={16} />
        </button>
      </form>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="p-1 rounded-full hover:bg-gray-200">
          <MoreHorizontal size={16} className="text-gray-600" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[160px] bg-white rounded-md p-1 shadow-md border border-gray-200 z-50"
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Item
            className="flex items-center px-2 py-1.5 text-sm rounded-sm outline-none cursor-pointer text-gray-700 focus:bg-blue-50 focus:text-blue-600"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 size={14} className="mr-2" />
            Rename List
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

          <DropdownMenu.Item
            className="flex items-center px-2 py-1.5 text-sm rounded-sm outline-none cursor-pointer text-red-600 focus:bg-red-50"
            onClick={handleDeleteList}
          >
            <Trash2 size={14} className="mr-2" />
            Delete List
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ListOptions;