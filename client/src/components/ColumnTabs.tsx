import React from 'react';
import { List as ListType, Card as CardType } from '../types';
import DroppableList from './DroppableList';
import * as Tabs from '@radix-ui/react-tabs';
import { useParams } from 'react-router-dom';
import ListOptions from './ListOptions';

interface ColumnTabsProps {
  lists: ListType[];
  cards: CardType[];
  activeListId: string;
  onSelectList: (listId: string) => void;
  onCardAdded: () => void;
  onCardMoved: (cardId: string,targetListId: string, position: number) => void;
  activeDragItem: { cardId: string, listId: string } | null;
  onListUpdated: () => void;
}

const ColumnTabs: React.FC<ColumnTabsProps> = ({
  lists,
  cards,
  activeListId,
  onSelectList,
  onCardAdded,
  onCardMoved,
  activeDragItem,
  onListUpdated
}) => {
  const { boardId } = useParams<{ boardId: string }>();
  
  if (lists.length === 0) {
    return null;
  }

  return (
    <Tabs.Root
      value={activeListId}
      onValueChange={onSelectList}
      className="w-full md:hidden"
    >
      <Tabs.List className="flex overflow-x-auto border-b border-gray-200/50 bg-gradient-to-r from-white to-gray-50 backdrop-blur-sm">
        {lists.map(list => (
          <Tabs.Trigger
            key={list._id}
            value={list._id}
            className="relative px-6 py-4 border-b-3 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 flex-shrink-0 text-sm font-semibold whitespace-nowrap focus:outline-none transition-all duration-300 hover:bg-blue-50 data-[state=active]:bg-white data-[state=active]:shadow-lg"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                list._id === activeListId 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                  : 'bg-gray-300'
              }`} />
              {list.title}
            </div>
            {list._id === activeListId && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full" />
            )}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      
      {lists.map(list => {
        const listCards = cards.filter(card => {
          const cardListId = typeof card.list === 'object' 
            ? card.list._id 
            : card.list;
          return cardListId === list._id;
        });

        return (
          <Tabs.Content key={list._id} value={list._id} className="p-4 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="flex items-center justify-between mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <h3 className="font-bold text-xl text-gray-800">{list.title}</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {listCards.length} cards
                </span>
              </div>
              {boardId && (
                <ListOptions 
                  listId={list._id} 
                  boardId={boardId} 
                  listTitle={list.title} 
                  onListUpdated={onListUpdated}
                />
              )}
            </div>
            
            <DroppableList
              list={list}
              cards={listCards}
              onCardAdded={onCardAdded}
              onCardMoved={onCardMoved}
              activeDragItem={activeDragItem}
              allLists={lists}
              boardId={boardId || ''}
              onListUpdated={onListUpdated}
            />
          </Tabs.Content>
        );
      })}
    </Tabs.Root>
  );
};

export default ColumnTabs;