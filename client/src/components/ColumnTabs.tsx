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
      <Tabs.List className="flex overflow-x-auto border-b border-gray-200 bg-white">
        {lists.map(list => (
          <Tabs.Trigger
            key={list._id}
            value={list._id}
            className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 flex-shrink-0 text-sm sm:text-base font-medium whitespace-nowrap focus:outline-none"
          >
            {list.title}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      
      {lists.map(list => {
        // Filter cards for this list
        const listCards = cards.filter(card => {
          const cardListId = typeof card.list === 'object' 
            ? card.list._id 
            : card.list;
          return cardListId === list._id;
        });

        return (
          <Tabs.Content key={list._id} value={list._id} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg text-gray-700">{list.title}</h3>
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