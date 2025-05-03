import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_LIST, GET_LISTS, GET_BOARD } from '../graphqlOperations';
import { Plus, X } from 'lucide-react';

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
      <div className="bg-white rounded-lg shadow-sm w-64 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50"
           onClick={() => setIsFormOpen(true)}>
        <Plus size={16} className="mr-2 text-blue-500" />
        <span className="text-blue-500">Add New list</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm w-64 p-3">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter list title..."
          className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none text-base"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          disabled={loading}
        />
        <div className="flex justify-between">
          <button
            type="submit"
            className={`bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add List'}
          </button>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 p-2"
            onClick={() => setIsFormOpen(false)}
            disabled={loading}
          >
            <X size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddListForm;