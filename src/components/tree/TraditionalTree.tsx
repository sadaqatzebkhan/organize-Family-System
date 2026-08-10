import React, { useState, useEffect } from 'react';
import { Person } from '../../types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TraditionalTreeProps {
  people: Person[];
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string | null;
  searchQuery?: string;
  selectedBranchId?: string;
  highlightedIds?: Set<string>;
  zoomLevel?: number;
}

interface TreeNodeProps {
  person: Person;
  allPeople: Person[];
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string | null;
  searchQuery?: string;
  level: number;
  highlightedIds?: Set<string>;
}

// Helper to check if a target person is a descendant of the current node
function hasDescendant(parentId: string, targetId: string, allPeople: Person[]): boolean {
  const children = allPeople.filter((p) => p.fatherId === parentId || p.motherId === parentId);
  for (const child of children) {
    if (child.id === targetId) return true;
    if (hasDescendant(child.id, targetId, allPeople)) return true;
  }
  return false;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  person,
  allPeople,
  onSelectPerson,
  selectedPersonId,
  searchQuery,
  level,
  highlightedIds,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Find children
  const children = allPeople.filter((p) => p.fatherId === person.id || p.motherId === person.id);
  const hasChildren = children.length > 0;

  // Auto-expand if selected person is a descendant or matches search
  useEffect(() => {
    if (selectedPersonId && hasDescendant(person.id, selectedPersonId, allPeople)) {
      setIsExpanded(true);
    }
  }, [selectedPersonId, person.id, allPeople]);

  const isSelected = selectedPersonId === person.id;
  const isHighlighted = highlightedIds?.has(person.id);
  const isSearchMatch =
    searchQuery && searchQuery.trim().length > 0
      ? person.fullName.toLowerCase().includes(searchQuery.toLowerCase().trim())
      : false;

  const father = allPeople.find((p) => p.id === person.fatherId);

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        id={`tree-node-${person.id}`}
        className={`relative group cursor-pointer transition-all duration-200 z-10 ${
          isSelected
            ? 'ring-2 ring-[#1a1a1a] scale-105 shadow-md'
            : isSearchMatch
            ? 'ring-2 ring-[#c2410c] bg-amber-50 shadow-sm'
            : isHighlighted
            ? 'ring-2 ring-gray-400 bg-gray-50'
            : 'hover:scale-[1.02] shadow-2xs'
        }`}
        onClick={() => onSelectPerson(person)}
      >
        <div
          className={`p-3.5 rounded border min-w-[180px] max-w-[240px] text-center transition-colors ${
            isSelected
              ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
              : isSearchMatch
              ? 'bg-amber-50 border-[#c2410c] text-[#1a1a1a]'
              : 'bg-white border-gray-200 hover:border-gray-400 text-[#1a1a1a]'
          }`}
        >
          {/* Header Row: Avatar & Gen Badge */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${
              isSelected ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-[#fcfaf7] text-gray-600 border-gray-200'
            }`}>
              Gen {person.generation}
            </span>

            {person.photograph ? (
              <img
                src={person.photograph}
                alt={person.fullName}
                className="w-7 h-7 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className={`w-6 h-6 rounded-full text-[11px] serif font-bold flex items-center justify-center border ${
                isSelected ? 'bg-white text-[#1a1a1a] border-white' : 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
              }`}>
                {person.fullName.charAt(0)}
              </div>
            )}
          </div>

          {/* Full Name */}
          <div className="serif text-sm font-bold leading-snug break-words" title={person.fullName}>
            {person.fullName}
          </div>

          {/* Father Lineage Hint */}
          {father && (
            <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
              S/O {father.fullName}
            </div>
          )}

          {/* Branch Badge */}
          {person.branchName && (
            <div className={`text-[10px] font-medium mt-1 inline-block px-1.5 py-0.5 rounded ${
              isSelected ? 'bg-gray-800 text-gray-300' : 'bg-[#fcfaf7] text-gray-600 border border-gray-200'
            }`}>
              {person.branchName}
            </div>
          )}

          {/* Expand/Collapse Toggle if has children */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={`mt-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 w-full py-1 rounded border transition-colors ${
                isSelected
                  ? 'bg-gray-800 text-white border-gray-700'
                  : 'bg-[#fcfaf7] hover:bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              <span>{children.length} {children.length === 1 ? 'child' : 'children'}</span>
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Children Branch with Exact Connector Lines */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center mt-3">
          {/* Vertical stem down from parent */}
          <div className="w-0.5 h-6 bg-gray-400" />

          {/* Children flex container */}
          <div className="flex items-start gap-6 relative">
            {children.map((child, idx) => (
              <div key={child.id} className="flex flex-col items-center relative">
                {/* Horizontal line segment connecting siblings at exact stem locations */}
                {children.length > 1 && (
                  <div
                    className="absolute top-0 h-0.5 bg-gray-400"
                    style={{
                      left: idx === 0 ? '50%' : '0',
                      right: idx === children.length - 1 ? '50%' : '0',
                    }}
                  />
                )}

                {/* Vertical stem down to child */}
                <div className="w-0.5 h-6 bg-gray-400" />

                <TreeNode
                  person={child}
                  allPeople={allPeople}
                  onSelectPerson={onSelectPerson}
                  selectedPersonId={selectedPersonId}
                  searchQuery={searchQuery}
                  level={level + 1}
                  highlightedIds={highlightedIds}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const TraditionalTree: React.FC<TraditionalTreeProps> = ({
  people,
  onSelectPerson,
  selectedPersonId,
  searchQuery,
  selectedBranchId,
  highlightedIds,
  zoomLevel = 1,
}) => {
  // Find roots (people with no fatherId or fatherId not in current view)
  const rootPeople = people.filter((p) => {
    if (!p.fatherId) return true;
    if (selectedBranchId && selectedBranchId !== 'all') {
      return p.branchId === selectedBranchId && !people.some((parent) => parent.id === p.fatherId);
    }
    return !people.some((parent) => parent.id === p.fatherId);
  });

  // Auto-scroll to selected node
  useEffect(() => {
    if (selectedPersonId) {
      const el = document.getElementById(`tree-node-${selectedPersonId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }
  }, [selectedPersonId]);

  return (
    <div className="w-full overflow-x-auto overflow-y-auto p-6 min-h-[600px] max-h-[850px] bg-[#fcfaf7] rounded border border-gray-200 shadow-inner flex">
      <div
        className="inline-flex items-start gap-12 min-w-max px-16 pb-16 pt-6 m-auto transition-transform duration-150 origin-top-left"
        style={{
          transform: `scale(${zoomLevel})`,
        }}
      >
        {rootPeople.map((root) => (
          <TreeNode
            key={root.id}
            person={root}
            allPeople={people}
            onSelectPerson={onSelectPerson}
            selectedPersonId={selectedPersonId}
            searchQuery={searchQuery}
            level={1}
            highlightedIds={highlightedIds}
          />
        ))}

        {rootPeople.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-sm">
            No root records match the current filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
