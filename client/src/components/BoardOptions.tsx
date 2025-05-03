import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_BOARD, DELETE_BOARD, GET_BOARDS } from '../graphqlOperations';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Edit2, Trash2, X } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface BoardOptionsProps {
  boardId: string;
  boardTitle: string;
}

const BoardOptions: React.FC<BoardOptionsProps> = ({ boardId, boardTitle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(boardTitle);
  const navigate = useNavigate();

  const [updateBoard, { loading: updateLoading }] = useMutation(UPDATE_BOARD, {
    onCompleted: () => {
      setIsEditing(false);
    }
  });

  const [deleteBoard, ] = useMutation(DELETE_BOARD, {
    refetchQueries: [{ query: GET_BOARDS }],
    onCompleted: () => {
      navigate('/');
    }
  });

  const handleUpdateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        await updateBoard({
          variables: {
            id: boardId,
            title: title.trim()
          }
        });
      } catch (error) {
        console.error('Error updating board:', error);
      }
    }
  };

  const handleDeleteBoard = async () => {
    if (window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      try {
        await deleteBoard({
          variables: {
            id: boardId
          }
        });
      } catch (error) {
        console.error('Error deleting board:', error);
      }
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleUpdateBoard} className="flex gap-2 items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            setTitle(boardTitle);
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
          <MoreHorizontal size={18} className="text-gray-600" />
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
            Rename Board
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

          <DropdownMenu.Item
            className="flex items-center px-2 py-1.5 text-sm rounded-sm outline-none cursor-pointer text-red-600 focus:bg-red-50"
            onClick={handleDeleteBoard}
          >
            <Trash2 size={14} className="mr-2" />
            Delete Board
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default BoardOptions;