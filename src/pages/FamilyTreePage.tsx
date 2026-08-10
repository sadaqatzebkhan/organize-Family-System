import React, { useState } from 'react';
import { Person, FamilyBranch, TreeViewStyle, TreeFilterOptions } from '../types';
import { TreeControls } from '../components/tree/TreeControls';
import { TraditionalTree } from '../components/tree/TraditionalTree';
import { InteractiveTree } from '../components/tree/InteractiveTree';

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
  const [viewStyle, setViewStyle] = useState<TreeViewStyle>('traditional');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [highlightMode, setHighlightMode] = useState<'none' | 'ancestors' | 'descendants'>('none');

  const [filterOptions, setFilterOptions] = useState<TreeFilterOptions>({
    searchQuery: '',
    selectedBranchId: 'all',
    selectedGeneration: 'all',
    aliveFilter: 'all',
  });

  const selectedPerson = people.find((p) => p.id === selectedPersonId);

  // Filter people based on filterOptions
  const filteredPeople = React.useMemo(() => {
    return people.filter((p) => {
      // Branch filter
      if (filterOptions.selectedBranchId !== 'all' && p.branchId !== filterOptions.selectedBranchId) {
        return false;
      }
      // Generation filter
      if (filterOptions.selectedGeneration !== 'all' && p.generation !== filterOptions.selectedGeneration) {
        return false;
      }
      // Alive filter
      if (filterOptions.aliveFilter !== 'all' && p.aliveStatus !== filterOptions.aliveFilter) {
        return false;
      }
      return true;
    });
  }, [people, filterOptions]);

  return (
    <div className="space-y-4 py-6 animate-fade-in text-[#1a1a1a]">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
        <div>
          <h1 className="serif text-2xl sm:text-3xl font-light italic text-[#1a1a1a]">
            Family Tree Visualization
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Switch tree layout styles, filter by generation or branch, and locate ancestor relationships.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <TreeControls
        viewStyle={viewStyle}
        onViewStyleChange={setViewStyle}
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel((z) => Math.min(z + 0.2, 2.5))}
        onZoomOut={() => setZoomLevel((z) => Math.max(z - 0.2, 0.4))}
        onResetZoom={() => setZoomLevel(1)}
        onFitScreen={() => setZoomLevel(0.85)}
        filterOptions={filterOptions}
        onFilterChange={(f) => setFilterOptions((prev) => ({ ...prev, ...f }))}
        branches={branches}
        highlightMode={highlightMode}
        onHighlightModeChange={setHighlightMode}
        selectedPersonName={selectedPerson?.fullName}
        onClearSelectedPerson={onClearSelectedPerson}
      />

      {/* Main Tree Canvas Container */}
      <div className="relative">
        {viewStyle === 'traditional' ? (
          <TraditionalTree
            people={filteredPeople}
            onSelectPerson={onSelectPerson}
            selectedPersonId={selectedPersonId}
            searchQuery={filterOptions.searchQuery}
            selectedBranchId={filterOptions.selectedBranchId}
            zoomLevel={zoomLevel}
          />
        ) : (
          <InteractiveTree
            people={filteredPeople}
            onSelectPerson={onSelectPerson}
            selectedPersonId={selectedPersonId}
            searchQuery={filterOptions.searchQuery}
            selectedBranchId={filterOptions.selectedBranchId}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            highlightMode={highlightMode}
          />
        )}
      </div>

    </div>
  );
};

