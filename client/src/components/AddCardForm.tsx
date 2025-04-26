import React, { useState } from 'react';
import { AiOutlinePlus, AiOutlineClose } from 'react-icons/ai';
import { createCard } from '../data/mockData';

interface AddCardFormProps {
  listId: string;
  onCardAdded: () => void;
}

const AddCardForm: React.FC<AddCardFormProps> = ({ listId, onCardAdded }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createCard(title, listId, description || undefined);
      setTitle('');
      setDescription('');
      onCardAdded();
      setIsFormOpen(false);
    }
  };

  if (!isFormOpen) {
    return (
      <button 
        className="w-full py-2 px-3 text-gray-600 text-sm text-left hover:bg-gray-100 rounded flex items-center"
        onClick={() => setIsFormOpen(true)}
      >
        <AiOutlinePlus className="mr-1" />
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
          className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <textarea
          placeholder="Add a description... (optional)"
          className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[60px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Add Card
          </button>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setIsFormOpen(false)}
          >
            <AiOutlineClose />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCardForm;