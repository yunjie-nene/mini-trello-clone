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
  onCardMoved: (cardId: string,targetListId: string, position: number) => void;
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
    
    const position = dragOverIndex !== null ? dragOverIndex : cards.length;
    onCardMoved(cardId, list._id, position);
    
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
      onCardMoved(cardId, list._id, dragOverIndex);
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
      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 w-full md:w-[300px] flex flex-col items-stretch transition-all duration-300 hover:shadow-2xl ${
        isDragOver ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-2xl scale-105' : ''
      }`}
      style={{ minHeight: '400px' }}
    >
      <div className="p-4 border-b border-gray-100/50 flex justify-between items-center bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-2xl">
        <div>
          <h3 className="font-semibold text-gray-800 text-lg tracking-wide">{list.title}</h3>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
            {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'}
          </div>
        </div>
        <ListOptions 
          listId={list._id} 
          boardId={boardId} 
          listTitle={list.title} 
          onListUpdated={onListUpdated} 
        />
      </div>
      
      <div 
        className="flex-1 p-3 overflow-y-auto max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-240px)] custom-scrollbar"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent'
        }}
      >
        {dragOverIndex === 0 && (
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full my-2 shadow-sm animate-pulse" />
        )}
        
        {filteredCards.map((card, index) => (
          <React.Fragment key={card._id}>
            <div 
              className="mb-3 transform transition-all duration-200 hover:scale-[1.02]"
              onDragOver={(e) => handleCardDragOver(e, index)}
              onDrop={handleDrop}
              onTouchStart={(e) => handleTouchStart(e)}
              onTouchMove={(e) => handleTouchMove(e, index)}
              onTouchEnd={(e) => handleTouchEnd(e, card._id)}
            >
              <DraggableCard 
                {...card} 
                onCardUpdated={onCardAdded}
                onDragEnd={handleDragEnd}
                isDone={list.title === 'Done'}
                allLists={allLists}
                onMoveCard={onCardMoved}
              />
            </div>
            {dragOverIndex === index + 1 && (
              <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full my-2 shadow-sm animate-pulse" />
            )}
          </React.Fragment>
        ))}
        
        {filteredCards.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm h-20 flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
            <div className="flex flex-col items-center gap-2">
              <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded"></div>
              <span className="font-medium">Drop a card here</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-100/50 bg-gradient-to-r from-gray-50 to-slate-50 rounded-b-2xl">
        <AddCardForm listId={list._id} onCardAdded={onCardAdded} />
      </div>
    </div>
  );
};

export default DroppableList;