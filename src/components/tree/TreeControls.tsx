import React from 'react';
import { Search, Filter, Sparkles, X, Users, UserCheck } from 'lucide-react';
import { TreeFilterOptions, FamilyBranch } from '../../types';

interface TreeControlsProps {
  filterOptions: TreeFilterOptions;
  onFilterChange: (filters: Partial<TreeFilterOptions>) => void;
  branches: FamilyBranch[];
  highlightMode?: 'none' | 'ancestors' | 'descendants';
  onHighlightModeChange?: (mode: 'none' | 'ancestors' | 'descendants') => void;
  selectedPersonName?: string;
  onClearSelectedPerson?: () => void;
}

export const TreeControls: React.FC<TreeControlsProps> = ({
  filterOptions,
  onFilterChange,
  branches,
  highlightMode = 'none',
  onHighlightModeChange,
  selectedPersonName,
  onClearSelectedPerson,
}) => {
  return (
    <div className="bg-white border border-gray-200/90 p-4 rounded-xl text-[#1a1a1a] shadow-2xs space-y-3">
      
      {/* Selected Highlight Focus Bar */}
      {selectedPersonName && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#c2410c] font-bold text-[11px] uppercase tracking-wider">
              مرکزی منتخب فرد:
            </span>
            <span className="serif font-bold text-gray-900 text-sm">
              {selectedPersonName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onHighlightModeChange && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    onHighlightModeChange(highlightMode === 'ancestors' ? 'none' : 'ancestors')
                  }
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    highlightMode === 'ancestors'
                      ? 'bg-[#1a1a1a] text-white shadow-2xs'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  آباؤ اجداد (Ancestors)
                </button>
                <button
                  onClick={() =>
                    onHighlightModeChange(highlightMode === 'descendants' ? 'none' : 'descendants')
                  }
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    highlightMode === 'descendants'
                      ? 'bg-[#1a1a1a] text-white shadow-2xs'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  اولاد (Descendants)
                </button>
              </div>
            )}
            {onClearSelectedPerson && (
              <button
                onClick={onClearSelectedPerson}
                className="p-1 text-gray-400 hover:text-black font-bold text-base leading-none ml-1"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Row - 100% Mobile Responsive */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        
        {/* Search by Name */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterOptions.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="شجرہ میں کسی بھی فرد کا نام تلاش کریں..."
            className="w-full bg-[#fcfaf7] border border-gray-200 rounded-lg pl-9 pr-8 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#c2410c] text-xs"
          />
          {filterOptions.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              ×
            </button>
          )}
        </div>

        {/* Branch Filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={filterOptions.selectedBranchId}
            onChange={(e) => onFilterChange({ selectedBranchId: e.target.value })}
            className="bg-[#fcfaf7] border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-[#c2410c] text-xs"
          >
            <option value="all">تمام شاخیں (All Branches)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Generation Filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-gray-500">نسل (Gen):</span>
          <select
            value={filterOptions.selectedGeneration}
            onChange={(e) =>
              onFilterChange({
                selectedGeneration: e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10),
              })
            }
            className="bg-[#fcfaf7] border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-[#c2410c] text-xs"
          >
            <option value="all">تمام نسلیں (All Gen)</option>
            <option value="1">Gen 1 (بزرگ / Founders)</option>
            <option value="2">Gen 2</option>
            <option value="3">Gen 3</option>
            <option value="4">Gen 4</option>
            <option value="5">Gen 5</option>
          </select>
        </div>

      </div>

    </div>
  );
};
