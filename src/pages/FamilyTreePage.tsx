import React, { useState } from 'react';
import { Person, FamilyBranch, TreeFilterOptions } from '../types';
import { TreeControls } from '../components/tree/TreeControls';
import { UnifiedFamilyTree } from '../components/tree/UnifiedFamilyTree';

interface FamilyTreePageProps {
  people: Person[];
  branches: FamilyBranch[];
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string | null;
  onClearSelectedPerson?: () => void;
}

export const FamilyTreePage: React.FC<FamilyTreePageProps> = ({
  people,
  branches,
  onSelectPerson,
  selectedPersonId,
  onClearSelectedPerson,
}) => {
  const [highlightMode, setHighlightMode] = useState<'none' | 'ancestors' | 'descendants'>('none');

  const [filterOptions, setFilterOptions] = useState<TreeFilterOptions>({
    searchQuery: '',
    selectedBranchId: 'all',
    selectedGeneration: 'all',
    aliveFilter: 'all',
  });

  const selectedPerson = people.find((p) => p.id === selectedPersonId);

  const handleClearFilters = () => {
    setFilterOptions({
      searchQuery: '',
      selectedBranchId: 'all',
      selectedGeneration: 'all',
      aliveFilter: 'all',
    });
  };

  return (
    <div className="space-y-4 py-6 animate-fade-in text-[#1a1a1a]">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c2410c]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c2410c]">
              Interactive Lineage Tree
            </span>
          </div>
          <h1 className="serif text-2xl sm:text-3xl font-medium text-[#1a1a1a] mt-0.5">
            مزید خیل شجرہ نسب (Family Tree)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            نام تلاش کریں یا شاخ منتخب کریں تاکہ ان کا مکمل ذیلی خاندان اور اولاد نیچے ظاہر ہو جائے۔
          </p>
        </div>
      </div>

      {/* Control Bar (Clean Filters & Search) */}
      <TreeControls
        filterOptions={filterOptions}
        onFilterChange={(f) => setFilterOptions((prev) => ({ ...prev, ...f }))}
        branches={branches}
        highlightMode={highlightMode}
        onHighlightModeChange={setHighlightMode}
        selectedPersonName={selectedPerson?.fullName}
        onClearSelectedPerson={onClearSelectedPerson}
      />

      {/* Main Single Unified Tree Canvas - 100% Screen Fitted, No Horizontal Scroll */}
      <div className="w-full">
        <UnifiedFamilyTree
          people={people}
          branches={branches}
          onSelectPerson={onSelectPerson}
          selectedPersonId={selectedPersonId}
          searchQuery={filterOptions.searchQuery}
          selectedBranchId={filterOptions.selectedBranchId}
          selectedGeneration={filterOptions.selectedGeneration}
          aliveFilter={filterOptions.aliveFilter}
          highlightMode={highlightMode}
          onClearSelectedPerson={onClearSelectedPerson}
          onClearFilters={handleClearFilters}
        />
      </div>

    </div>
  );
};
