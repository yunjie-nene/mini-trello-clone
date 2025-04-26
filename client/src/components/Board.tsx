import React, { useState, useEffect } from 'react';
import { Board as BoardType, List as ListType, Card as CardType } from '../types';
import { getBoards, getLists, getCards } from '../data/mockData';
import Card from './Card';
import AddCardForm from './AddCardForm';

const Board: React.FC = () => {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [lists, setLists] = useState<ListType[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

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
    // Reload data after a card is added
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
          {lists.map(list => (
            <div 
              key={list._id} 
              className="bg-white rounded-lg shadow-sm min-w-[280px] max-w-[280px] flex flex-col items-stretch"
            >
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-700">{list.title}</h3>
              </div>
              
              <div className="flex-1 p-2 overflow-y-auto max-h-[calc(100vh-220px)]">
                {cards
                  .filter(card => card.list === list._id)
                  .map(card => (
                    <div key={card._id} className="mb-2">
                      <Card {...card} onCardUpdated={handleCardAdded} />
                    </div>
                  ))
                }
              </div>
              
              <div className="p-2 border-t border-gray-200">
                <AddCardForm listId={list._id} onCardAdded={handleCardAdded} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;