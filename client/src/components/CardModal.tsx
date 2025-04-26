import React, { useState } from 'react';
import { Card as CardType } from '../types';
import { updateCard, deleteCard } from '../data/mockData';
import { AiOutlineClose, AiOutlineDelete } from 'react-icons/ai';

interface CardModalProps {
  card: CardType;
  onClose: () => void;
  onCardUpdated: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, onClose, onCardUpdated }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');

  const handleSave = () => {
    if (title.trim()) {
      updateCard({
        ...card,
        title,
        description: description.trim() ? description : undefined
      });
      onCardUpdated();
      onClose();
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      deleteCard(card._id);
      onCardUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Edit Card</h3>
          <button 
            className="text-gray-500 hover:text-gray-700" 
            onClick={onClose}
          >
            <AiOutlineClose />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="flex justify-between">
          <button
            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center"
            onClick={handleDelete}
          >
            <AiOutlineDelete className="mr-1" />
            Delete
          </button>
          
          <div className="space-x-2">
            <button
              className="bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;