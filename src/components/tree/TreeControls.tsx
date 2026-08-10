import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Network, Search, Filter, Layers } from 'lucide-react';
import { TreeViewStyle, TreeFilterOptions, FamilyBranch } from '../../types';

interface TreeControlsProps {
  viewStyle: TreeViewStyle;
  onViewStyleChange: (style: TreeViewStyle) => void;
  zoomLevel?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onFitScreen?: () => void;
  filterOptions: TreeFilterOptions;
  onFilterChange: (filters: Partial<TreeFilterOptions>) => void;
  branches: FamilyBranch[];
  highlightMode?: 'none' | 'ancestors' | 'descendants';
  onHighlightModeChange?: (mode: 'none' | 'ancestors' | 'descendants') => void;
  selectedPersonName?: string;
  onClearSelectedPerson?: () => void;
}

export const TreeControls: React.FC<TreeControlsProps> = ({
  viewStyle,
  onViewStyleChange,
  zoomLevel = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitScreen,
  filterOptions,
  onFilterChange,
  branches,
  highlightMode = 'none',
  onHighlightModeChange,
  selectedPersonName,
  onClearSelectedPerson,
}) => {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded text-[#1a1a1a] shadow-2xs space-y-3">
      
      {/* Top Row: Style Toggle & Main Zoom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Style Selector */}
        <div className="flex items-center gap-1 bg-[#fcfaf7] p-1 rounded border border-gray-200">
          <button
            onClick={() => onViewStyleChange('traditional')}
            id="tree-style-traditional-button"
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              viewStyle === 'traditional'
                ? 'bg-[#1a1a1a] text-white shadow-2xs'
                : 'text-gray-600 hover:text-[#1a1a1a]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Style 1: Traditional Tree</span>
          </button>
          <button
            onClick={() => onViewStyleChange('interactive')}
            id="tree-style-interactive-button"
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              viewStyle === 'interactive'
                ? 'bg-[#1a1a1a] text-white shadow-2xs'
                : 'text-gray-600 hover:text-[#1a1a1a]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Style 2: Interactive Tree</span>
          </button>
        </div>

        {/* Selected Highlight Context */}
        {selectedPersonName && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded text-xs">
            <span className="text-[#c2410c] label-caps">Focusing on:</span>
            <span className="serif font-bold text-[#1a1a1a]">{selectedPersonName}</span>
            {onHighlightModeChange && (
              <div className="flex items-center gap-1 ml-2 border-l border-amber-200 pl-2">
                <button
                  onClick={() => onHighlightModeChange(highlightMode === 'ancestors' ? 'none' : 'ancestors')}
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${
                    highlightMode === 'ancestors' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  Ancestors
                </button>
                <button
                  onClick={() => onHighlightModeChange(highlightMode === 'descendants' ? 'none' : 'descendants')}
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${
                    highlightMode === 'descendants' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  Descendants
                </button>
              </div>
            )}
            {onClearSelectedPerson && (
              <button
                onClick={onClearSelectedPerson}
                className="text-gray-400 hover:text-black ml-1 font-bold"
                title="Clear selection"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Zoom Controls (Available for both Traditional & Interactive modes) */}
        {onZoomIn && onZoomOut && (
          <div className="flex items-center gap-1 bg-[#fcfaf7] p-1 rounded border border-gray-200">
            <button
              onClick={onZoomOut}
              id="tree-zoom-out-button"
              className="p-1.5 rounded text-gray-600 hover:text-black hover:bg-gray-200 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-[#1a1a1a] min-w-[3.5rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={onZoomIn}
              id="tree-zoom-in-button"
              className="p-1.5 rounded text-gray-600 hover:text-black hover:bg-gray-200 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {onResetZoom && (
              <button
                onClick={onResetZoom}
                className="p-1.5 rounded text-gray-600 hover:text-black hover:bg-gray-200 transition-colors ml-1 border-l border-gray-200"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            {onFitScreen && (
              <button
                onClick={onFitScreen}
                className="p-1.5 rounded text-gray-600 hover:text-black hover:bg-gray-200 transition-colors"
                title="Fit Screen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

      </div>

      {/* Bottom Row: Search & Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200 text-xs">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterOptions.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search person in tree..."
            className="w-full bg-[#fcfaf7] border border-gray-200 rounded pl-8 pr-3 py-1.5 text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-[#1a1a1a] text-xs"
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
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={filterOptions.selectedBranchId}
            onChange={(e) => onFilterChange({ selectedBranchId: e.target.value })}
            className="bg-[#fcfaf7] border border-gray-200 rounded px-2.5 py-1.5 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] text-xs"
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Generation Filter */}
        <div className="flex items-center gap-1.5">
          <span className="label-caps">Gen:</span>
          <select
            value={filterOptions.selectedGeneration}
            onChange={(e) =>
              onFilterChange({
                selectedGeneration: e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10),
              })
            }
            className="bg-[#fcfaf7] border border-gray-200 rounded px-2.5 py-1.5 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] text-xs"
          >
            <option value="all">All Generations</option>
            <option value="1">Gen 1 (Founders)</option>
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

