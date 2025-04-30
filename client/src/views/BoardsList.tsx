import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BOARDS, CREATE_BOARD, DELETE_BOARD, UPDATE_BOARD } from '../graphqlOperations';
import { Plus, MoreHorizontal, Edit2, Trash2, X } from 'lucide-react';
import { Board } from '../types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const BoardsList: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardTitle, setEditingBoardTitle] = useState('');
  
  const { data, loading, error } = useQuery(GET_BOARDS);
  
  const [createBoard, { loading: createLoading }] = useMutation(CREATE_BOARD, {
    refetchQueries: [{ query: GET_BOARDS }],
    onCompleted: () => {
      setNewBoardTitle('');
      setIsCreating(false);
    }
  });

  const [updateBoard, { loading: updateLoading }] = useMutation(UPDATE_BOARD, {
    refetchQueries: [{ query: GET_BOARDS }],
    onCompleted: () => {
      setEditingBoardId(null);
      setEditingBoardTitle('');
    }
  });

  const [deleteBoard, { loading: deleteLoading }] = useMutation(DELETE_BOARD, {
    refetchQueries: [{ query: GET_BOARDS }]
  });
  
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardTitle.trim()) {
      try {
        await createBoard({
          variables: { title: newBoardTitle.trim() }
        });
      } catch (err) {
        console.error('Error creating board:', err);
      }
    }
  };

  const handleUpdateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBoardId && editingBoardTitle.trim()) {
      try {
        await updateBoard({
          variables: {
            id: editingBoardId,
            title: editingBoardTitle.trim()
          }
        });
      } catch (err) {
        console.error('Error updating board:', err);
      }
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      try {
        await deleteBoard({
          variables: { id: boardId }
        });
      } catch (err) {
        console.error('Error deleting board:', err);
      }
    }
  };

  const startEditingBoard = (board: Board) => {
    setEditingBoardId(board._id);
    setEditingBoardTitle(board.title);
  };
  
  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-full">Error loading boards</div>;
  
  const boards: Board[] = data?.boards || [];
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Boards</h1>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Create Board
          </button>
        )}
      </div>
      
      {isCreating && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-3">Create New Board</h2>
          <form onSubmit={handleCreateBoard}>
            <input
              type="text"
              placeholder="Enter board title..."
              className="w-full p-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewBoardTitle('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                disabled={createLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
                  createLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!newBoardTitle.trim() || createLoading}
              >
                {createLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {boards.map(board => (
          <div key={board._id} className="relative">
            {editingBoardId === board._id ? (
              <div className="bg-white p-4 rounded-lg shadow h-24">
                <form onSubmit={handleUpdateBoard}>
                  <input 
                    type="text"
                    value={editingBoardTitle}
                    onChange={(e) => setEditingBoardTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingBoardId(null);
                        setEditingBoardTitle('');
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={16} />
                    </button>
                    <button
                      type="submit"
                      className="text-blue-500 hover:text-blue-700 font-medium text-sm"
                      disabled={updateLoading}
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-blue-100 hover:bg-blue-200 p-4 rounded-lg h-24 flex flex-col transition-colors">
                <div className="flex justify-between items-start">
                  <Link
                    to={`/board/${board._id}`}
                    className="font-medium text-lg flex-1"
                  >
                    {board.title}
                  </Link>
                  
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="p-1 rounded-full hover:bg-blue-300 text-blue-600" onClick={(e) => e.preventDefault()}>
                        <MoreHorizontal size={16} />
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
                          onClick={() => startEditingBoard(board)}
                        >
                          <Edit2 size={14} className="mr-2" />
                          Rename Board
                        </DropdownMenu.Item>
                        
                        <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                        
                        <DropdownMenu.Item
                          className="flex items-center px-2 py-1.5 text-sm rounded-sm outline-none cursor-pointer text-red-600 focus:bg-red-50"
                          onClick={() => handleDeleteBoard(board._id)}
                          disabled={deleteLoading}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Delete Board
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {boards.length === 0 && !isCreating && (
          <div 
            onClick={() => setIsCreating(true)}
            className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50"
          >
            <Plus size={20} className="mr-2" />
            <span>Create your first board</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardsList;