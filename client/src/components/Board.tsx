import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BOARD, GET_LISTS, GET_CARDS, MOVE_CARD } from '../graphqlOperations';
import DroppableList from './DroppableList';
import ColumnSelector from './ColumnSelector';
import ColumnTabs from './ColumnTabs';
import AddListForm from './AddListForm';
import BoardOptions from './BoardOptions';
import { Layers, List } from 'lucide-react';
import { Card, List as ListType } from '../types';

const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  
  const [activeListId, setActiveListId] = useState<string>('');
  const [activeDragItem, setActiveDragItem] = useState<{ cardId: string, listId: string } | null>(null);
  const [viewMode, setViewMode] = useState<'tabs' | 'scroll'>('scroll');
  const [, setAddingList] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const { data: boardData, loading: boardLoading, error: boardError } = useQuery(GET_BOARD, {
    variables: { id: boardId },
    skip: !boardId
  });

  const { data: listsData, loading: listsLoading, refetch: refetchLists } = useQuery(GET_LISTS, {
    variables: { boardId },
    skip: !boardId
  });

  const { data: cardsData, refetch: refetchCards } = useQuery(GET_CARDS);

  const [moveCardMutation] = useMutation(MOVE_CARD);

  useEffect(() => {
    if (listsData?.lists?.length > 0 && !activeListId) {
      const firstList = listsData.lists[0];
      if (firstList && firstList._id) {
        setActiveListId(firstList._id);
      }
    }
  }, [listsData, activeListId]);

  useEffect(() => {
    if (boardError || !boardId) {
      navigate('/');
    }
  }, [boardError, boardId, navigate]);

  const handleCardAdded = () => {
    refetchLists();
    refetchCards();
  };

  const handleListAdded = () => {
    refetchLists();
    refetchCards();
    setAddingList(false);
  };

  const handleListUpdated = () => {
    refetchLists();
    refetchCards();
  };

  const handleCardMoved = async (
    cardId: string, 
    targetListId: string, 
    position: number
  ) => {
    setActiveDragItem(null);
    
    try {
      await moveCardMutation({ 
        variables: { 
          id: cardId, 
          listId: targetListId, 
          position 
        },
        refetchQueries: [
          { query: GET_CARDS }
        ]
      });
    } catch (error) {
      console.error('Error moving card:', error);
    }
  };
  
  const handleSelectList = (listId: string) => {
    setActiveListId(listId);
    
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

  if (boardLoading || listsLoading) {
    return (
      <div className="flex justify-center items-center h-full bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your board...</p>
        </div>
      </div>
    );
  }

  if (boardError) {
    return (
      <div className="flex justify-center items-center h-full bg-gradient-to-br from-red-50 to-rose-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <p className="text-red-600 font-medium">Error loading board data</p>
        </div>
      </div>
    );
  }

  const board = boardData?.board;
  const lists: ListType[] = listsData?.lists || [];
  const cards: Card[] = cardsData?.cards || [];

  if (!board) {
    return (
      <div className="flex justify-center items-center h-full bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <p className="text-gray-600 font-medium">Board not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="py-3 sm:py-5 bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="px-4 sm:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {board.title}
              </h2>
            </div>
            {boardId && <BoardOptions boardId={boardId} boardTitle={board.title} />}
          </div>
          
          <button 
            onClick={toggleViewMode}
            className="text-xs px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg md:hidden flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {viewMode === 'tabs' ? (
              <>
                <Layers size={14} />
                <span className="font-medium">Show All Lists</span>
              </>
            ) : (
              <>
                <List size={14} />
                <span className="font-medium">Tab View</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {viewMode === 'tabs' && lists.length > 0 && (
        <ColumnTabs
          lists={lists}
          cards={cards}
          activeListId={activeListId}
          onSelectList={handleSelectList}
          onCardAdded={handleCardAdded}
          onCardMoved={handleCardMoved}
          activeDragItem={activeDragItem}
          onListUpdated={handleListUpdated}
        />
      )}
      
      {viewMode === 'scroll' && lists.length > 0 && (
        <ColumnSelector 
          lists={lists} 
          activeListId={activeListId} 
          onSelectList={handleSelectList} 
        />
      )}
      
      <div className={`flex-1 px-3 sm:px-6 py-6 overflow-auto ${viewMode === 'tabs' ? 'hidden md:block' : ''}`}>
        <div 
          ref={listContainerRef}
          className="flex flex-nowrap overflow-x-auto pb-6 sm:pb-8 gap-4 sm:gap-5 md:gap-6 snap-x min-h-[calc(100vh-220px)] md:min-h-[calc(100vh-180px)]"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 transparent'
          }}
        >
          {lists.map((list: ListType) => {
            const listCards = cards.filter((card: Card) => {
              const cardListId = typeof card.list === 'object' 
                ? card.list._id 
                : card.list;
              return cardListId === list._id;
            });
            
            return (
              <div 
                id={`list-${list._id}`} 
                key={list._id} 
                className="snap-start flex-shrink-0"
              >
                <DroppableList
                  list={list}
                  cards={listCards}
                  onCardAdded={handleCardAdded}
                  onCardMoved={handleCardMoved}
                  activeDragItem={activeDragItem}
                  allLists={lists}
                  boardId={boardId || ''}
                  onListUpdated={handleListUpdated}
                />
              </div>
            );
          })}
          
          {boardId && lists.length < 4 && (
            <div className="snap-start flex-shrink-0">
              <AddListForm boardId={boardId} onListAdded={handleListAdded} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Board;