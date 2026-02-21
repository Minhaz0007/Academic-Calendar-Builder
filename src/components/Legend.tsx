import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { LegendItem } from '../types';

interface LegendProps {
  legendItems: LegendItem[];
  setLegendItems: (items: LegendItem[]) => void;
  selectedColorId: string | null;
  setSelectedColorId: (id: string | null) => void;
}

export const Legend: React.FC<LegendProps> = ({
  legendItems,
  setLegendItems,
  selectedColorId,
  setSelectedColorId,
}) => {
  const addLegendItem = () => {
    const newItem: LegendItem = {
      id: crypto.randomUUID(),
      color: '#3b82f6', // Default blue
      label: 'New Category',
    };
    setLegendItems([...legendItems, newItem]);
    setSelectedColorId(newItem.id);
  };

  const updateItem = (id: string, updates: Partial<LegendItem>) => {
    setLegendItems(legendItems.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteItem = (id: string) => {
    setLegendItems(legendItems.filter(item => item.id !== id));
    if (selectedColorId === id) {
      setSelectedColorId(null);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:shadow-none print:border print:border-black print:p-0 font-serif mt-4 print:mt-1">
      <div className="flex items-center justify-between mb-3 print:hidden">
        <h3 className="font-semibold text-gray-700">Legend & Color Key</h3>
        <button 
          onClick={addLegendItem}
          className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>
      
      <div className="flex flex-wrap gap-4 print:grid print:grid-cols-4 print:gap-0 print:text-[10px]">
        {legendItems.map((item, idx) => (
          <div 
            key={item.id} 
            className={`flex items-center gap-2 p-1 rounded-lg border-2 transition-all ${
              selectedColorId === item.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-transparent hover:bg-gray-50'
            } print:border-none print:bg-transparent print:p-0 print:rounded-none print:border-b print:border-r print:border-gray-300 print:last:border-0`}
            onClick={() => setSelectedColorId(item.id)}
          >
            <div className="relative group flex items-center print:w-full">
              <input
                type="color"
                value={item.color}
                onChange={(e) => updateItem(item.id, { color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent print:hidden"
              />
              
              {/* Print View: Colored Box with Label */}
              <div 
                className="hidden print:flex items-center px-1 py-0.5 font-bold text-black uppercase w-1/3 border-r border-gray-300 h-full leading-tight"
                style={{ backgroundColor: item.color }}
              >
                {item.label}
              </div>
              
              {/* Edit View: Color Circle */}
              <div 
                className="w-6 h-6 rounded-full border border-gray-200 hidden print:hidden"
                style={{ backgroundColor: item.color }}
              />

              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(item.id, { label: e.target.value })}
                className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none text-sm font-medium text-gray-700 min-w-[100px] print:hidden ml-2"
                placeholder="Category Name"
              />

            </div>

            <div className="flex items-center gap-1 print:hidden">
              <input
                type="checkbox"
                checked={item.style === 'cross'}
                onChange={(e) => updateItem(item.id, { style: e.target.checked ? 'cross' : 'solid' })}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 print:hidden"
                title="Mark with X"
              />
              <span className="text-xs text-gray-500 print:hidden">X</span>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteItem(item.id);
              }}
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden ml-auto"
              title="Delete category"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 print:hidden">
        <p>Tip: Select a color above, then click a date to start a range, and click another date to fill it. Click the same date twice to color just that day.</p>
      </div>
    </div>
  );
};
