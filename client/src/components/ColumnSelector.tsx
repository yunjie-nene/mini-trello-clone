import React, { useState } from 'react';
import { List as ListType } from '../types';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';

interface ColumnSelectorProps {
  lists: ListType[];
  activeListId: string;
  onSelectList: (listId: string) => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({ 
  lists,
  activeListId,
  onSelectList
}) => {
  // Find the active list name
  const activeList = lists.find(list => list._id === activeListId);
  
  return (
    <div className="md:hidden w-full px-4 py-2 border-b border-gray-200">
      <Select.Root value={activeListId} onValueChange={onSelectList}>
        <Select.Trigger 
          className="flex items-center justify-between w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm"
          aria-label="Select a column"
        >
          <Select.Value placeholder="Select a column">
            {activeList?.title || "Select column"}
          </Select.Value>
          <Select.Icon>
            <ChevronDown size={16} />
          </Select.Icon>
        </Select.Trigger>
        
        <Select.Portal>
          <Select.Content 
            className="overflow-hidden bg-white rounded-md shadow-md border border-gray-200 z-50"
            position="popper"
          >
            <Select.Viewport className="p-1">
              {lists.map(list => (
                <Select.Item
                  key={list._id}
                  value={list._id}
                  className="flex items-center px-6 py-2 text-sm rounded relative select-none outline-none data-[highlighted]:bg-gray-100 data-[state=checked]:font-medium cursor-pointer"
                >
                  <Select.ItemText>{list.title}</Select.ItemText>
                  <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                    <Check size={14} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};

export default ColumnSelector;