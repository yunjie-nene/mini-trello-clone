import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Board as BoardType, List as ListType, Card as CardType } from '../types';
import { getBoards, getLists, getCards, moveCard } from '../data/mockData';
import DroppableList from './DroppableList';
import ColumnSelector from './ColumnSelector';
import ColumnTabs from './ColumnTabs';
import { Layers, List } from 'lucide-react';

const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  
  const [board, setBoard] = useState<BoardType | null>(null);
  const [lists, setLists] = useState<ListType[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDragItem, setActiveDragItem] = useState<{ cardId: string, listId: string } | null>(null);
  const [activeListId, setActiveListId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'tabs' | 'scroll'>('tabs');
  const listContainerRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    if (!boardId) {
      navigate('/');
      return;
    }
    
    const boards = getBoards();
    const currentBoard = boards.find(b => b._id === boardId);
    
    if (currentBoard) {
      setBoard(currentBoard);
      
      const boardLists = getLists().filter(list => 
        currentBoard.lists.includes(list._id)
      );
      setLists(boardLists);
      
      const allCards = getCards();
      setCards(allCards);
    } else {
      // Board not found, redirect to board list
      navigate('/');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [boardId]);
  
  // Set initial active list when lists are loaded
  useEffect(() => {
    if (lists.length > 0 && !activeListId) {
      setActiveListId(lists[0]._id);
    }
  }, [lists, activeListId]);

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
    setActiveDragItem(null);
    
    // Use the moveCard function from mockData
    moveCard(cardId, targetListId, position);
    
    // Reload data to update the UI
    loadData();
  };
  
  const handleSelectList = (listId: string) => {
    setActiveListId(listId);
    
    // Scroll to the selected list on desktop
    if (listContainerRef.current && viewMode === 'scroll') {
      const listElement = document.getElementById(`list-${listId}`);
      if (listElement) {
        listContainerRef.current.scrollTo({
          left: listElement.offsetLeft - 16,
          behavior: 'smooth'
        });
      }
    }
  };
  
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'tabs' ? 'scroll' : 'tabs');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (!board) {
    return <div className="flex justify-center items-center h-full">Board not found</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="py-2 sm:py-4 bg-white shadow-sm">
        <div className="px-4 sm:px-8 flex justify-between items-center">
          <h2 className="text-lg md:w-7xl max-auto sm:text-xl font-bold text-gray-800">{board.title}</h2>
          
          {/* Mobile view toggle */}
          <button 
            onClick={toggleViewMode}
            className="text-xs px-2 py-1 bg-gray-100 rounded md:hidden flex items-center gap-1"
          >
            {viewMode === 'tabs' ? (
              <>
                <Layers size={14} />
                <span>Show All Lists</span>
              </>
            ) : (
              <>
                <List size={14} />
                <span>Tab View</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Tab View */}
      {viewMode === 'tabs' && (
        <ColumnTabs
          lists={lists}
          cards={cards}
          activeListId={activeListId}
          onSelectList={handleSelectList}
          onCardAdded={handleCardAdded}
          onCardMoved={handleCardMoved}
          activeDragItem={activeDragItem}
        />
      )}
      
      {/* Mobile Column Selector for Scroll View */}
      {viewMode === 'scroll' && (
        <ColumnSelector 
          lists={lists} 
          activeListId={activeListId} 
          onSelectList={handleSelectList} 
        />
      )}
      
      {/* Scroll View (default for desktop, optional for mobile) */}
      <div className={`flex-1 px-2 sm:px-6 py-4 overflow-auto ${viewMode === 'tabs' ? 'hidden md:block' : ''}`}>
        <div 
          ref={listContainerRef}
          className="flex flex-nowrap justify-center overflow-x-auto pb-4 sm:pb-6 gap-3 sm:gap-4 md:gap-6 snap-x"
        >
          {lists.map(list => {
            const listCards = cards.filter(card => card.list === list._id);
            return (
              <div 
                id={`list-${list._id}`} 
                key={list._id} 
                className={`snap-start`}
              >
                <DroppableList
                  list={list}
                  cards={listCards}
                  onCardAdded={handleCardAdded}
                  onCardMoved={handleCardMoved}
                  activeDragItem={activeDragItem}
                  allLists={lists}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Board;