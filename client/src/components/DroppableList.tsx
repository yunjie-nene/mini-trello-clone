import React, { useState } from 'react';
import { List as ListType, Card as CardType } from '../types';
import DraggableCard from './DraggableCard';
import AddCardForm from './AddCardForm';

interface DroppableListProps {
  list: ListType;
  cards: CardType[];
  onCardAdded: () => void;
  onCardMoved: (cardId: string, sourceListId: string, targetListId: string, position: number) => void;
  activeDragItem: { cardId: string, listId: string } | null;
  allLists: ListType[];
}

const DroppableList: React.FC<DroppableListProps> = ({ 
  list, 
  cards, 
  onCardAdded, 
  onCardMoved,
  activeDragItem,
  allLists
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
    setDragOverIndex(null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const cardId = e.dataTransfer.getData('cardId');
    const sourceListId = e.dataTransfer.getData('sourceListId');
    
    // Only process drop if card is from another list or if we're reordering
    if (sourceListId !== list._id || dragOverIndex !== null) {
      const position = dragOverIndex !== null ? dragOverIndex : cards.length;
      onCardMoved(cardId, sourceListId, list._id, position);
    }
    
    setIsDragOver(false);
    setDragOverIndex(null);
  };
  
  const handleCardDragOver = (index: number) => {
    setDragOverIndex(index);
  };
  
  const handleDragStart = (cardId: string, listId: string) => {
    // This is handled by the parent component
  };
  
  const handleDragEnd = () => {
    // Reset UI state after drag ends
    setIsDragOver(false);
    setDragOverIndex(null);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, index: number, cardId: string) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    if (touchStartY !== null) {
      const currentY = e.touches[0].clientY;
      // Detect if we're moving up or down significantly
      const diff = currentY - touchStartY;
      if (Math.abs(diff) > 30) {
        handleCardDragOver(diff > 0 ? index + 1 : index);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, cardId: string) => {
    if (dragOverIndex !== null && touchStartY !== null) {
      // Move card to the new position within the list
      onCardMoved(cardId, list._id, list._id, dragOverIndex);
    }
    setTouchStartY(null);
    setDragOverIndex(null);
  };

  // Filter out the active card being dragged if it's from this list
  const visibleCards = activeDragItem && activeDragItem.listId === list._id
    ? cards.filter(card => card._id !== activeDragItem.cardId)
    : cards;

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm w-full md:w-[280px] flex flex-col items-stretch ${
        isDragOver ? 'bg-blue-50' : ''
      }`}
    >
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-medium text-gray-700">{list.title}</h3>
        <div className="text-xs text-gray-500">{cards.length} {cards.length === 1 ? 'card' : 'cards'}</div>
      </div>
      
      <div 
        className="flex-1 p-2 overflow-y-auto max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-180px)]"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {visibleCards.map((card, index) => (
          <React.Fragment key={card._id}>
            {dragOverIndex === index && (
              <div className="h-2 bg-blue-300 rounded my-1" />
            )}
            <div 
              className="mb-2"
              onDragOver={(e) => {
                e.preventDefault();
                handleCardDragOver(index);
              }}
              onTouchStart={(e) => handleTouchStart(e, index, card._id)}
              onTouchMove={(e) => handleTouchMove(e, index)}
              onTouchEnd={(e) => handleTouchEnd(e, card._id)}
            >
              <DraggableCard 
                {...card} 
                onCardUpdated={onCardAdded}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isDone={list.title === 'Done'}
                allLists={allLists}
                onMoveCard={onCardMoved}
              />
            </div>
          </React.Fragment>
        ))}
        {dragOverIndex === visibleCards.length && (
          <div className="h-2 bg-blue-300 rounded my-1" />
        )}
      </div>
      
      <div className="p-2 border-t border-gray-200">
        <AddCardForm listId={list._id} onCardAdded={onCardAdded} />
      </div>
    </div>
  );
};

export default DroppableList;