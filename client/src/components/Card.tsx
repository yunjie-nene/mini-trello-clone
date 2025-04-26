import React, { useState, useRef } from 'react';
import { Card as CardType } from '../types';
import CardModal from './CardModal';
import { CheckCircle } from 'lucide-react';

interface DraggableCardProps extends CardType {
  onCardUpdated: () => void;
  onDragStart: (cardId: string, listId: string) => void;
  onDragEnd: () => void;
  isDone?: boolean;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ 
  _id, 
  title, 
  description, 
  list, 
  onCardUpdated,
  onDragStart,
  onDragEnd,
  isDone = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCardClick = () => {
    if (!isDragging) {
      setIsModalOpen(true);
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Set data that will be used on drop
    e.dataTransfer.setData('cardId', _id);
    e.dataTransfer.setData('sourceListId', list);
    
    // Create a ghost image effect
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(cardRef.current, rect.width / 2, rect.height / 2);
      
      // Set dragging state
      setIsDragging(true);
      
      // Add a small delay to prevent the card click handler from firing
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.opacity = '0.4';
        }
      }, 0);
      
      onDragStart(_id, list);
    }
  };

  const handleDragEnd = () => {
    if (cardRef.current) {
      cardRef.current.style.opacity = '1';
    }
    setIsDragging(false);
    onDragEnd();
  };

  return (
    <>
      <div
        ref={cardRef}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleCardClick}
        className={`rounded p-3 border shadow-sm hover:shadow cursor-pointer transition duration-200 ease-in-out ${
          isDone 
            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}
      >
        <h4 className={`font-medium flex items-center gap-2 ${isDone ? 'text-green-700' : 'text-gray-700'}`}>
          {isDone && <CheckCircle className="text-green-500" />}
          <span className={isDone ? 'line-through' : ''}>{title}</span>
        </h4>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      
      {isModalOpen && (
        <CardModal 
          card={{ _id, title, description, list }} 
          onClose={handleCloseModal}
          onCardUpdated={onCardUpdated}
        />
      )}
    </>
  );
};

export default DraggableCard;