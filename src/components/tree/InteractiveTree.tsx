import React, { useState, useRef, useEffect } from 'react';
import { Person } from '../../types';
import { ChevronDown, ChevronRight, Move, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { getAncestors, getDescendants } from '../../lib/utils';

interface InteractiveTreeProps {
  people: Person[];
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string | null;
  searchQuery?: string;
  selectedBranchId?: string;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  highlightMode?: 'none' | 'ancestors' | 'descendants';
}

export const InteractiveTree: React.FC<InteractiveTreeProps> = ({
  people,
  onSelectPerson,
  selectedPersonId,
  searchQuery,
  selectedBranchId,
  zoomLevel,
  setZoomLevel,
  highlightMode = 'none',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());

  // Calculate ancestors and descendants for selected person if highlight mode is active
  const ancestorIds = React.useMemo(() => {
    if (!selectedPersonId || highlightMode !== 'ancestors') return new Set<string>();
    const ancestors = getAncestors(selectedPersonId, people);
    return new Set<string>([selectedPersonId, ...ancestors.map((a) => a.id)]);
  }, [selectedPersonId, highlightMode, people]);

  const descendantIds = React.useMemo(() => {
    if (!selectedPersonId || highlightMode !== 'descendants') return new Set<string>();
    const descendants = getDescendants(selectedPersonId, people);
    return new Set<string>([selectedPersonId, ...descendants.map((d) => d.id)]);
  }, [selectedPersonId, highlightMode, people]);

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-tree-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoomLevel((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 2.5));
  };

  // Pan actions
  const panBy = (dx: number, dy: number) => {
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const resetView = () => {
    setPan({ x: 40, y: 20 });
    setZoomLevel(1);
  };

  const toggleCollapse = (personId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(personId)) {
        next.delete(personId);
      } else {
        next.add(personId);
      }
      return next;
    });
  };

  // Auto-scroll / pan to selected person
  useEffect(() => {
    if (selectedPersonId && containerRef.current) {
      const nodeEl = document.getElementById(`interactive-node-${selectedPersonId}`);
      if (nodeEl) {
        nodeEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }
  }, [selectedPersonId]);

  // Group people by generation
  const generationMap = React.useMemo<Map<number, Person[]>>(() => {
    const map = new Map<number, Person[]>();
    const filteredPeople = people.filter((p) => {
      if (selectedBranchId && selectedBranchId !== 'all') {
        return p.branchId === selectedBranchId;
      }
      return true;
    });

    for (const person of filteredPeople) {
      const gen = person.generation || 1;
      if (!map.has(gen)) map.set(gen, []);
      map.get(gen)!.push(person);
    }
    return map;
  }, [people, selectedBranchId]);

  const generations = Array.from(generationMap.keys()).map((k) => Number(k)).sort((a, b) => a - b);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className={`relative w-full h-[700px] overflow-auto bg-[#fcfaf7] rounded border border-gray-200 shadow-inner select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none min-w-max min-h-max"
        style={{
          backgroundImage: `radial-gradient(#1a1a1a 1px, transparent 1px)`,
          backgroundSize: `${30 * zoomLevel}px ${30 * zoomLevel}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Floating Canvas Controls (Pan & Instructions) */}
      <div className="sticky top-4 left-4 z-20 flex flex-wrap items-center gap-3 max-w-max">
        <div className="bg-white border border-gray-200 text-[#1a1a1a] text-xs px-3 py-2 rounded flex items-center gap-2 shadow-2xs">
          <Move className="w-4 h-4 text-[#c2410c]" />
          <span>Drag canvas to pan • Scroll to zoom</span>
        </div>

        {/* Directional Pan Buttons */}
        <div className="bg-white border border-gray-200 text-[#1a1a1a] p-1 rounded flex items-center gap-1 shadow-2xs">
          <button
            onClick={() => panBy(120, 0)}
            className="p-1 rounded hover:bg-gray-100 text-gray-700 transition-colors"
            title="Pan Left (Bring left nodes into view)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => panBy(-120, 0)}
            className="p-1 rounded hover:bg-gray-100 text-gray-700 transition-colors"
            title="Pan Right"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => panBy(0, 100)}
            className="p-1 rounded hover:bg-gray-100 text-gray-700 transition-colors"
            title="Pan Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => panBy(0, -100)}
            className="p-1 rounded hover:bg-gray-100 text-gray-700 transition-colors"
            title="Pan Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            className="p-1 rounded hover:bg-gray-100 text-gray-700 border-l border-gray-200 ml-1 pl-1.5 transition-colors flex items-center gap-1 text-[11px] font-medium"
            title="Reset Pan & Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Tree Canvas Group */}
      <div
        className="transition-transform duration-75 origin-top-left pl-16 pr-24 pt-8 pb-20 min-w-max"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
        }}
      >
        <div className="space-y-16 min-w-max">
          {generations.map((gen) => {
            const genPeople = generationMap.get(gen) || [];
            return (
              <div key={gen} className="relative min-w-max">
                {/* Generation Label Banner */}
                <div className="flex items-center gap-3 mb-4 min-w-max">
                  <span className="px-3 py-1 rounded bg-[#1a1a1a] text-white serif font-bold text-xs tracking-wider">
                    Generation {gen}
                  </span>
                  <div className="h-px w-32 bg-gray-300" />
                </div>

                {/* Nodes horizontal row */}
                <div className="flex items-center gap-6 min-w-max pb-2">
                  {genPeople.map((person) => {
                    const father = people.find((p) => p.id === person.fatherId);
                    const isSelected = selectedPersonId === person.id;
                    const isSearchMatch =
                      searchQuery && searchQuery.trim().length > 0
                        ? person.fullName.toLowerCase().includes(searchQuery.toLowerCase().trim())
                        : false;

                    const isAncestorHighlighted = ancestorIds.has(person.id);
                    const isDescendantHighlighted = descendantIds.has(person.id);
                    const isDimmed =
                      highlightMode !== 'none' &&
                      !isAncestorHighlighted &&
                      !isDescendantHighlighted;

                    const children = people.filter((p) => p.fatherId === person.id);
                    const isCollapsed = collapsedNodeIds.has(person.id);

                    return (
                      <div
                        key={person.id}
                        onClick={() => onSelectPerson(person)}
                        id={`interactive-node-${person.id}`}
                        className={`interactive-tree-node relative group p-4 rounded border transition-all duration-200 cursor-pointer w-[220px] shrink-0 ${
                          isDimmed
                            ? 'opacity-30 border-gray-200 bg-white'
                            : isSelected
                            ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] ring-2 ring-[#1a1a1a] scale-105 shadow-md'
                            : isAncestorHighlighted || isDescendantHighlighted
                            ? 'bg-amber-50 text-[#1a1a1a] border-[#c2410c] ring-2 ring-[#c2410c] shadow-sm'
                            : isSearchMatch
                            ? 'bg-amber-50 text-[#1a1a1a] border-[#c2410c] ring-2 ring-[#c2410c] shadow-sm'
                            : 'bg-white text-[#1a1a1a] border-gray-200 hover:border-gray-400 hover:scale-[1.02] shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            {person.photograph ? (
                              <img
                                src={person.photograph}
                                alt={person.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-gray-300 shrink-0"
                              />
                            ) : (
                              <div className={`w-9 h-9 rounded-full text-sm serif font-bold flex items-center justify-center border shrink-0 ${
                                isSelected ? 'bg-white text-[#1a1a1a] border-white' : 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                              }`}>
                                {person.fullName.charAt(0)}
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <div className="serif font-bold text-sm leading-snug break-words" title={person.fullName}>
                                {person.fullName}
                              </div>
                              {father && (
                                <div className={`text-[10px] truncate ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                  S/O {father.fullName}
                                </div>
                              )}
                              <div className={`text-[10px] font-medium mt-0.5 ${isSelected ? 'text-gray-400' : 'text-gray-600'}`}>
                                {person.branchName || 'Mazid Khail'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expand / Collapse Control */}
                        {children.length > 0 && (
                          <div className={`mt-3 pt-2 border-t flex items-center justify-between text-xs ${
                            isSelected ? 'border-gray-800 text-gray-200' : 'border-gray-100 text-gray-600'
                          }`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{children.length} {children.length === 1 ? 'descendant' : 'descendants'}</span>
                            <button
                              onClick={(e) => toggleCollapse(person.id, e)}
                              className={`p-1 rounded border transition-colors ${
                                isSelected ? 'bg-gray-800 text-white border-gray-700' : 'bg-[#fcfaf7] text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                              title={isCollapsed ? 'Expand branch' : 'Collapse branch'}
                            >
                              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
