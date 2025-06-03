import React, { useState, useEffect } from 'react';
import { Card as CardType } from '../types';
import { useMutation } from '@apollo/client';
import { UPDATE_CARD, DELETE_CARD, GET_CARDS } from '../graphqlOperations';
import { X, Trash2, Edit3, FileText } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface CardModalProps {
  card: CardType;
  onClose: () => void;
  onCardUpdated: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, onClose, onCardUpdated }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');

  const [updateCard, { loading: updateLoading }] = useMutation(UPDATE_CARD, {
    refetchQueries: [{ query: GET_CARDS }],
    onCompleted: () => {
      onCardUpdated();
    }
  });

  const [deleteCard, { loading: deleteLoading }] = useMutation(DELETE_CARD, {
    refetchQueries: [{ query: GET_CARDS }],
    onCompleted: () => {
      onCardUpdated();
    }
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSave = async () => {
    if (title.trim()) {
      try {
        await updateCard({
          variables: {
            id: card._id,
            title: title.trim(),
            description: description.trim() || null
          }
        });
        onClose();
      } catch (error) {
        console.error('Error updating card:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await deleteCard({
          variables: {
            id: card._id
          }
        });
        onClose();
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  const isLoading = updateLoading || deleteLoading;

  return (
    <Dialog.Root open={true} onOpenChange={() => onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300" />
        <Dialog.Content 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in zoom-in-95 fade-in duration-300"
          onEscapeKeyDown={onClose}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
              <Dialog.Title className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Edit3 size={16} className="text-white" />
                </div>
                Edit Card
              </Dialog.Title>
              <Dialog.Close asChild>
                <button 
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200" 
                  disabled={isLoading}
                >
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Edit3 size={16} />
                  Card Title
                </label>
                <input
                  type="text"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 font-medium text-gray-800 transition-all duration-300"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter card title..."
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <FileText size={16} />
                  Description
                </label>
                <textarea
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 min-h-[120px] resize-none text-gray-800 transition-all duration-300"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  placeholder="Add a description for this card..."
                />
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex justify-between p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
              <button
                className={`bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 size={16} />
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
              
              <div className="flex gap-3">
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {updateLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
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