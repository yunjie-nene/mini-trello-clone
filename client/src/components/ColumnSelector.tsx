import React from 'react';
import { List as ListType } from '../types';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check, Layers } from 'lucide-react';

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
  const activeList = lists.find(list => list._id === activeListId);
  
  return (
    <div className="md:hidden w-full px-4 py-3 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
      <Select.Root value={activeListId} onValueChange={onSelectList}>
        <Select.Trigger 
          className="flex items-center justify-between w-full bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 hover:border-blue-300 rounded-xl px-4 py-3 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Select a column"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <Select.Value placeholder="Select a column">
              {activeList?.title || "Select column"}
            </Select.Value>
          </div>
          <Select.Icon>
            <ChevronDown size={18} className="text-gray-500" />
          </Select.Icon>
        </Select.Trigger>
        
        <Select.Portal>
          <Select.Content 
            className="overflow-hidden bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 z-50"
            position="popper"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <Layers size={16} className="text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">Select List</span>
            </div>
            
            <Select.Viewport className="p-2">
              {lists.map(list => (
                <Select.Item
                  key={list._id}
                  value={list._id}
                  className="flex items-center px-4 py-3 text-sm rounded-lg relative select-none outline-none data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 cursor-pointer transition-all duration-200 hover:scale-105"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-3"></div>
                  <Select.ItemText className="font-medium">{list.title}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-3 inline-flex items-center">
                    <Check size={16} className="text-blue-600" />
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