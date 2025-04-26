import React, { useState, useEffect } from 'react';
import { Card as CardType } from '../types';
import { updateCard, deleteCard } from '../data/mockData';
import { X, Trash2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface CardModalProps {
  card: CardType;
  onClose: () => void;
  onCardUpdated: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, onClose, onCardUpdated }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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
    <Dialog.Root open={true} onOpenChange={() => onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onEscapeKeyDown={onClose}
          onInteractOutside={(e) => {
            e.preventDefault(); // Prevent closing on outside click
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <Dialog.Title className="text-lg font-medium">Edit Card</Dialog.Title>
              <Dialog.Close asChild>
                <button 
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100" 
                >
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
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
            </div>
            
            <div className="flex justify-between p-4 border-t">
              <button
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center"
                onClick={handleDelete}
              >
                <Trash2 size={16} className="mr-1" />
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CardModal;