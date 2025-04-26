import React from 'react';
import { List as ListType, Card as CardType } from '../types';
import * as Tabs from '@radix-ui/react-tabs';
import DroppableList from './DroppableList';

interface ColumnTabsProps {
  lists: ListType[];
  cards: CardType[];
  activeListId: string;
  onSelectList: (listId: string) => void;
  onCardAdded: () => void;
  onCardMoved: (cardId: string, sourceListId: string, targetListId: string, position: number) => void;
  activeDragItem: { cardId: string, listId: string } | null;
}

const ColumnTabs: React.FC<ColumnTabsProps> = ({
  lists,
  cards,
  activeListId,
  onSelectList,
  onCardAdded,
  onCardMoved,
  activeDragItem
}) => {
  return (
    <Tabs.Root 
      defaultValue={activeListId || (lists.length > 0 ? lists[0]._id : '')}
      value={activeListId}
      onValueChange={onSelectList}
      className="w-full md:hidden"
    >
      <Tabs.List 
        className="flex overflow-x-auto bg-gray-100 border-b border-gray-200 w-full"
        aria-label="Board columns"
      >
        {lists.map(list => (
          <Tabs.Trigger 
            key={list._id} 
            value={list._id}
            className="px-4 py-2 text-sm flex-1 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white outline-none"
          >
            {list.title}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      
      {lists.map(list => {
        const listCards = cards.filter(card => card.list === list._id);
        
        return (
          <Tabs.Content 
            key={list._id} 
            value={list._id} 
            className="pt-3 outline-none"
            tabIndex={0}
          >
            <DroppableList
              list={list}
              cards={listCards}
              onCardAdded={onCardAdded}
              onCardMoved={onCardMoved}
              activeDragItem={activeDragItem}
              allLists={lists}
            />
          </Tabs.Content>
        );
      })}
    </Tabs.Root>
  );
};

export default ColumnTabs;