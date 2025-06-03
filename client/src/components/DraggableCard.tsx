import React, { useState, useRef, useEffect } from 'react';
import { Card as CardType, List as ListType } from '../types';
import CardModal from './CardModal';
import CardStatusChanger from './CardStatusChanger';
import { CheckCircle, MoreVertical, GripVertical, Sparkles } from 'lucide-react';

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
        className={`group relative rounded-xl p-4 border shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
          isDone 
            ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 hover:from-emerald-100 hover:to-green-100' 
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200'
        }`}
      >
        {/* Top gradient accent */}
        <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
          isDone 
            ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
            : 'bg-gradient-to-r from-blue-400 to-purple-500'
        }`} />
        
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className={`font-semibold flex items-center gap-3 ${isDone ? 'text-emerald-700' : 'text-gray-800'} break-words leading-relaxed`}>
              {isDone && (
                <div className="flex items-center justify-center w-5 h-5 bg-emerald-100 rounded-full">
                  <CheckCircle className="text-emerald-600 flex-shrink-0" size={14} />
                </div>
              )}
              <span className={isDone ? 'line-through decoration-emerald-400' : ''}>
                {title}
              </span>
              {isDone && <Sparkles className="text-emerald-500" size={16} />}
            </h4>
            
            {description && (
              <p className="text-sm text-gray-600 mt-2 break-words leading-relaxed bg-gray-50/50 rounded-lg p-2 border border-gray-100">
                {description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 ml-3 flex-shrink-0">
            <div className="touch-none md:cursor-grab text-gray-400 p-2 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 rounded-lg">
              <GripVertical size={16} />
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <CardStatusChanger
                cardId={_id}
                currentListId={list._id}
                lists={allLists}
                onMoveCard={onMoveCard}
              />
            </div>
            
            <button 
              className="text-gray-400 p-2 rounded-lg hover:bg-gray-100 md:hidden transition-colors duration-200"
              onClick={handleMobileOptionsClick}
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
        
        {showMobileOptions && (
          <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 text-sm md:hidden shadow-inner">
            <div className="text-center text-xs text-gray-500 mb-3 font-medium">Card Options</div>
            
            <button 
              className="w-full text-left py-2 px-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 font-medium"
              onClick={handleCardClick}
            >
              ✏️ Edit Card
            </button>
            
            <div className="mt-3 border-t border-gray-200 pt-3">
              <div className="text-xs text-gray-500 mb-2 font-medium">Move to list:</div>
              <div className="space-y-1">
                {allLists.map(l => (
                  <button 
                    key={l._id} 
                    className={`w-full text-left py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
                      l._id === list._id 
                        ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200' 
                        : 'hover:bg-gray-100 text-gray-700 border border-transparent hover:border-gray-200'
                    }`}
                    disabled={l._id === list._id}
                    onClick={() => {
                      if (l._id !== list._id) {
                        onMoveCard(_id, l._id, Number.MAX_SAFE_INTEGER);
                        setShowMobileOptions(false);
                      }
                    }}
                  >
                    {l._id === list._id && '📍 '}
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