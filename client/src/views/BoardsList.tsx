import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BOARDS, CREATE_BOARD, DELETE_BOARD, UPDATE_BOARD } from '../graphqlOperations';
import { Plus, MoreHorizontal, Edit2, Trash2, X, Grid, Sparkles } from 'lucide-react';
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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 font-medium text-lg">Loading your boards...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex justify-center items-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100">
          <p className="text-red-600 font-medium text-lg">Error loading boards</p>
        </div>
      </div>
    );
  }
  
  const boards: Board[] = data?.boards || [];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Grid size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Your Boards
              </h1>
              <p className="text-gray-600 mt-1">Manage and organize your projects</p>
            </div>
          </div>
          
          {!isCreating && (
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105"
            >
              <Plus size={18} />
              Create Board
              <Sparkles size={16} />
            </button>
          )}
        </div>

        {isCreating && (
          <div className="mb-8 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg"></div>
              <h2 className="text-xl font-bold text-gray-800">Create New Board</h2>
            </div>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <input
                type="text"
                placeholder="Enter board title..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-base font-medium transition-all duration-300"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewBoardTitle('');
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-all duration-300"
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 ${
                    createLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                  disabled={!newBoardTitle.trim() || createLoading}
                >
                  {createLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {boards.map(board => (
            <div key={board._id} className="group relative">
              {editingBoardId === board._id ? (
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 h-32">
                  <form onSubmit={handleUpdateBoard} className="h-full flex flex-col">
                    <input 
                      type="text"
                      value={editingBoardTitle}
                      onChange={(e) => setEditingBoardTitle(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 font-medium"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-auto">
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingBoardId(null);
                          setEditingBoardTitle('');
                        }}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <X size={18} />
                      </button>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
                        disabled={updateLoading}
                      >
                        {updateLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 hover:from-blue-200 hover:via-blue-100 hover:to-indigo-200 p-6 rounded-2xl h-32 flex flex-col transition-all duration-300 shadow-lg hover:shadow-2xl border border-blue-200/50 hover:scale-105 cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <Link
                      to={`/board/${board._id}`}
                      className="font-bold text-xl text-gray-800 flex-1 hover:text-blue-700 transition-colors duration-200 line-clamp-2"
                    >
                      {board.title}
                    </Link>
                    
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button 
                          className="p-2 rounded-xl hover:bg-blue-200/80 text-blue-700 opacity-0 group-hover:opacity-100 transition-all duration-200" 
                          onClick={(e) => e.preventDefault()}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </DropdownMenu.Trigger>
                      
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="min-w-[180px] bg-white/95 backdrop-blur-md rounded-xl p-2 shadow-xl border border-gray-200 z-50"
                          sideOffset={8}
                          align="end"
                        >
                          <DropdownMenu.Item
                            className="flex items-center px-3 py-2.5 text-sm rounded-lg outline-none cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                            onClick={() => startEditingBoard(board)}
                          >
                            <Edit2 size={16} className="mr-3" />
                            Rename Board
                          </DropdownMenu.Item>
                          
                          <DropdownMenu.Separator className="h-px bg-gray-200 my-2" />
                          
                          <DropdownMenu.Item
                            className="flex items-center px-3 py-2.5 text-sm rounded-lg outline-none cursor-pointer text-red-600 hover:bg-red-50 transition-all duration-200"
                            onClick={() => handleDeleteBoard(board._id)}
                            disabled={deleteLoading}
                          >
                            <Trash2 size={16} className="mr-3" />
                            Delete Board
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {boards.length === 0 && !isCreating && (
            <div 
              onClick={() => setIsCreating(true)}
              className="border-3 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl h-32 flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 cursor-pointer hover:bg-blue-50/50 transition-all duration-300 group bg-white/50"
            >
              <div className="p-3 bg-gray-100 group-hover:bg-blue-100 rounded-full mb-2 transition-colors duration-300">
                <Plus size={24} className="group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-medium text-lg">Create your first board</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardsList;