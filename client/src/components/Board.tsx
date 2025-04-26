import React, { useState, useEffect } from 'react';
import { Board as BoardType, List as ListType, Card as CardType } from '../types';
import { getBoards, getLists, getCards, moveCard } from '../data/mockData';
import DroppableList from './DroppableList';

const Board: React.FC = () => {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [lists, setLists] = useState<ListType[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDragItem, setActiveDragItem] = useState<{ cardId: string, listId: string } | null>(null);

  const loadData = () => {
    const boards = getBoards();
    
    if (boards.length > 0) {
      const activeBoard = boards[0]; // For now, just use the first board
      setBoard(activeBoard);
      
      const boardLists = getLists().filter(list => 
        activeBoard.lists.includes(list._id)
      );
      setLists(boardLists);
      
      const allCards = getCards();
      setCards(allCards);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    // Load data from localStorage
    loadData();
  }, []);

  const handleCardAdded = () => {
    // Reload data after a card is added or updated
    loadData();
  };

  const handleCardMoved = (
    cardId: string, 
    sourceListId: string, 
    targetListId: string, 
    position: number
  ) => {
    console.log(`Moving card ${cardId} from ${sourceListId} to ${targetListId} at position ${position}`);
    
    // Set the active drag item to null to reset the state
    setActiveDragItem
    // Use the moveCard function from mockData
    moveCard(cardId, targetListId, position);
    
    // Reload data to update the UI
    loadData();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!board) {
    return <div className="flex justify-center items-center h-screen">No boards found</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="py-4 bg-white shadow-sm">
        <h2 className="text-xl w-7xl mx-auto font-bold text-gray-800">{board.title}</h2>
      </div>
      
      <div className="flex-1 px-8 py-6 overflow-x-auto">
        <div className="flex justify-center mx-auto max-w-5xl space-x-6 max-h-full">
          {lists.map(list => {
            const listCards = cards.filter(card => card.list === list._id);
            return (
              <DroppableList
                key={list._id}
                list={list}
                cards={listCards}
                onCardAdded={handleCardAdded}
                onCardMoved={handleCardMoved}
                activeDragItem={activeDragItem}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Board;