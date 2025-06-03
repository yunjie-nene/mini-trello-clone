import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_LIST, GET_LISTS, GET_BOARD } from '../graphqlOperations';
import { Plus, X, Layers } from 'lucide-react';

interface AddListFormProps {
  boardId: string;
  onListAdded: () => void;
}

const AddListForm: React.FC<AddListFormProps> = ({ boardId, onListAdded }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');

  const [createList, { loading }] = useMutation(CREATE_LIST, {
    refetchQueries: [
      { query: GET_LISTS, variables: { boardId } },
      { query: GET_BOARD, variables: { id: boardId } }
    ],
    onCompleted: () => {
      onListAdded();
      setTitle('');
      setIsFormOpen(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        await createList({
          variables: {
            title: title.trim(),
            boardId
          }
        });
      } catch (error) {
        console.error('Error creating list:', error);
      }
    }
  };

  if (!isFormOpen) {
    return (
      <div 
        className="group bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-dashed border-gray-200 hover:border-blue-300 w-[300px] h-16 flex items-center justify-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
        onClick={() => setIsFormOpen(true)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
            <Plus size={18} className="text-blue-600" />
          </div>
          <span className="text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">
            Add New List
          </span>
          <Layers size={16} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 w-[300px] p-5">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          <h3 className="text-sm font-semibold text-gray-700">Create New List</h3>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter list title..."
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-base font-medium placeholder-gray-400 transition-all duration-300"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          disabled={loading}
        />
        
        <div className="flex justify-between items-center gap-3">
          <button
            type="submit"
            className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
            disabled={loading || !title.trim()}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add List
              </>
            )}
          </button>
          
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
            onClick={() => setIsFormOpen(false)}
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddListForm;