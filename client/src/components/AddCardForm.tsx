import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { CREATE_CARD, GET_CARDS } from '../graphqlOperations';

interface AddCardFormProps {
  listId: string;
  onCardAdded: () => void;
}

const AddCardForm: React.FC<AddCardFormProps> = ({ listId, onCardAdded }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [createCard, { loading }] = useMutation(CREATE_CARD, {
    refetchQueries: [{ query: GET_CARDS }],
    onCompleted: () => {
      onCardAdded();
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        await createCard({
          variables: {
            title: title.trim(),
            listId,
            description: description.trim() || null
          }
        });
        
        setTitle('');
        setDescription('');
        setIsFormOpen(false);
      } catch (error) {
        console.error('Error creating card:', error);
      }
    }
  };

  if (!isFormOpen) {
    return (
      <button 
        className="w-full py-2 px-3 text-gray-600 text-sm text-left hover:bg-gray-100 rounded flex items-center"
        onClick={() => setIsFormOpen(true)}
      >
        <Plus size={16} className="mr-1" />
        Add a card
      </button>
    );
  }

  return (
    <div className="p-2">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter card title..."
          className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none text-base"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          disabled={loading}
        />
        <textarea
          placeholder="Add a description... (optional)"
          className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none min-h-[60px] text-base"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
            {loading ? 'Adding...' : 'Add Card'}
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

export default AddCardForm;