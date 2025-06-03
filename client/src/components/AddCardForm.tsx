import React, { useState } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
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
        className="group w-full py-3 px-4 text-gray-600 text-sm text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl flex items-center transition-all duration-300 border-2 border-dashed border-gray-200 hover:border-blue-300 hover:text-blue-700"
        onClick={() => setIsFormOpen(true)}
      >
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 group-hover:bg-blue-200 mr-3 transition-colors duration-300">
          <Plus size={14} />
        </div>
        <span className="font-medium">Add a card</span>
        <Sparkles size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Enter card title..."
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-base font-medium placeholder-gray-400 transition-all duration-300"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          disabled={loading}
        />
        <textarea
          placeholder="Add a description... (optional)"
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 min-h-[80px] text-base placeholder-gray-400 resize-none transition-all duration-300"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
        <div className="flex justify-between items-center gap-3">
          <button
            type="submit"
            className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Card
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

export default AddCardForm;