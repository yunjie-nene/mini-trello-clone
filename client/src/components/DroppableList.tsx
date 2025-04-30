import React, { useState } from 'react';
import { List as ListType, Card as CardType } from '../types';
import DraggableCard from './DraggableCard';
import AddCardForm from './AddCardForm';
import ListOptions from './ListOptions';

interface DroppableListProps {
  list: ListType;
  cards: CardType[];
  boardId: string;
  onCardAdded: () => void;
  onCardMoved: (cardId: string, sourceListId: string, targetListId: string, position: number) => void;
  activeDragItem: { cardId: string, listId: string } | null;
  allLists: ListType[];
  onListUpdated: () => void;
}

const DroppableList: React.FC<DroppableListProps> = ({ 
  list, 
  cards, 
  boardId,
  onCardAdded, 
  onCardMoved,
  activeDragItem,
  allLists,
  onListUpdated
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
    
    const position = dragOverIndex !== null ? dragOverIndex : cards.length;
    onCardMoved(cardId, sourceListId, list._id, position);
    
    setIsDragOver(false);
    setDragOverIndex(null);
  };
  
  const handleCardDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const targetElement = e.currentTarget;
    const targetRect = targetElement.getBoundingClientRect();
    const targetMiddleY = targetRect.top + targetRect.height / 2;
    
    if (e.clientY < targetMiddleY) {
      setDragOverIndex(index);
    } else {
      setDragOverIndex(index + 1);
    }
  };
  
  const handleDragStart = (cardId: string, listId: string) => {
    // Handled by parent component
  };
  
  const handleDragEnd = () => {
    setIsDragOver(false);
    setDragOverIndex(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    if (touchStartY !== null) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY;
      if (Math.abs(diff) > 30) {
        handleCardDragOver(
          e as unknown as React.DragEvent<HTMLDivElement>,
          diff > 0 ? index + 1 : index
        );
      }
    }
  };

  const handleTouchEnd = (_: React.TouchEvent, cardId: string) => {
    if (dragOverIndex !== null && touchStartY !== null) {
      onCardMoved(cardId, list._id, list._id, dragOverIndex);
    }
    setTouchStartY(null);
    setDragOverIndex(null);
  };

  const visibleCards = activeDragItem && activeDragItem.listId === list._id
    ? cards.filter(card => card._id !== activeDragItem.cardId)
    : cards;

  visibleCards.sort((a, b) => (a.position || 0) - (b.position || 0));

  const filteredCards = visibleCards.filter(card => {
    const cardListId = typeof card.list === 'object' && card.list !== null
      ? card.list._id 
      : card.list;
    return cardListId === list._id;
  });

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm w-full md:w-[280px] flex flex-col items-stretch ${
        isDragOver ? 'bg-blue-50' : ''
      }`}
    >
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-700">{list.title}</h3>
          <div className="text-xs text-gray-500">{filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'}</div>
        </div>
        <ListOptions 
          listId={list._id} 
          boardId={boardId} 
          listTitle={list.title} 
          onListUpdated={onListUpdated} 
        />
      </div>
      
      <div 
        className="flex-1 p-2 overflow-y-auto max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-180px)]"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {dragOverIndex === 0 && (
          <div className="h-1 bg-blue-500 rounded my-2" />
        )}
        
        {filteredCards.map((card, index) => (
          <React.Fragment key={card._id}>
            <div 
              className="mb-2"
              onDragOver={(e) => handleCardDragOver(e, index)}
              onDrop={handleDrop}
              onTouchStart={(e) => handleTouchStart(e)}
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
            {dragOverIndex === index + 1 && (
              <div className="h-1 bg-blue-500 rounded my-2" />
            )}
          </React.Fragment>
        ))}
        
        {filteredCards.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-400 text-sm h-16 flex items-center justify-center">
            Drop a card here
          </div>
        )}
      </div>
      
      <div className="p-2 border-t border-gray-200">
        <AddCardForm listId={list._id} onCardAdded={onCardAdded} />
      </div>
    </div>
  );
};

export default DroppableList;