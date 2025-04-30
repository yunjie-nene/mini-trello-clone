import React, { useState, useRef, useEffect } from 'react';
import { Card as CardType, List as ListType } from '../types';
import CardModal from './CardModal';
import CardStatusChanger from './CardStatusChanger';
import { CheckCircle, MoreVertical, GripVertical } from 'lucide-react';

interface DraggableCardProps extends CardType {
  onCardUpdated: () => void;
  onDragStart?: (cardId: string, listId: string) => void;
  onDragEnd: () => void;
  isDone?: boolean;
  allLists: ListType[];
  onMoveCard: (cardId: string, targetListId: string, position: number) => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ 
  _id, 
  title, 
  description, 
  list, 
  onCardUpdated,
  onDragStart,
  onDragEnd,
  isDone = false,
  allLists,
  onMoveCard
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showMobileOptions, setShowMobileOptions] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  const handleCardClick = () => {
    if (!isDragging) {
      setIsModalOpen(true);
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('cardId', _id);
    e.dataTransfer.setData('sourceListId', list._id);
    
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(cardRef.current, rect.width / 2, rect.height / 2);
      
      setIsDragging(true);
      
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.opacity = '0.4';
        }
      }, 0);
      
      onDragStart?.(_id, list._id);
    }
  };

  const handleDragEnd = () => {
    if (cardRef.current) {
      cardRef.current.style.opacity = '1';
    }
    setIsDragging(false);
    onDragEnd();
  };

  const handleMobileOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMobileOptions(!showMobileOptions);
  };
  
  const handleTouchStart = () => {
    longPressTimeoutRef.current = setTimeout(() => {
      setShowMobileOptions(true);
    }, 800);
  };
  
  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };
  
  const handleTouchMove = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className={`rounded p-3 border shadow-sm hover:shadow cursor-pointer transition duration-200 ease-in-out ${
          isDone 
            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className={`font-medium flex items-center gap-2 ${isDone ? 'text-green-700' : 'text-gray-700'} break-words`}>
              {isDone && <CheckCircle className="text-green-500 flex-shrink-0" size={16} />}
              <span className={isDone ? 'line-through' : ''}>{title}</span>
            </h4>
            
            {description && (
              <p className="text-sm text-gray-500 mt-1 break-words">{description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <div className="touch-none md:cursor-grab text-gray-400 p-1 hidden md:flex">
              <GripVertical size={14} />
            </div>
            
            <CardStatusChanger
              cardId={_id}
              currentListId={list._id}
              lists={allLists}
              onMoveCard={onMoveCard}
            />
            
            <button 
              className="text-gray-400 p-1 rounded-full hover:bg-gray-100 md:hidden"
              onClick={handleMobileOptionsClick}
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </div>
        
        {showMobileOptions && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm md:hidden">
            <div className="text-center text-xs text-gray-500 mb-1">Card options</div>
            <button 
              className="w-full text-left py-1 text-blue-600"
              onClick={handleCardClick}
            >
              Edit Card
            </button>
            
            <div className="mt-2 border-t pt-2">
              <div className="text-xs text-gray-500 mb-1">Move to list:</div>
              <div className="space-y-1">
                {allLists.map(l => (
                  <button 
                    key={l._id} 
                    className={`w-full text-left py-1 px-2 rounded text-sm ${
                      l._id === list._id 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    disabled={l._id === list._id}
                    onClick={() => {
                      if (l._id !== list._id) {
                        onMoveCard(_id, l._id, Number.MAX_SAFE_INTEGER);
                        setShowMobileOptions(false);
                      }
                    }}
                  >
                    {l.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isModalOpen && (
        <CardModal 
          card={{ _id, title, description, list, position: 0 }} 
          onClose={handleCloseModal}
          onCardUpdated={onCardUpdated}
        />
      )}
    </>
  );
};

export default DraggableCard;
