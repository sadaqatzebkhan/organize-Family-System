import React, { useState, useEffect } from 'react';
import { Person, FamilyBranch } from '../../types';
import { ChevronDown, ChevronRight, User, Users, Search, CheckCircle2, ChevronUp, Sparkles, FolderOpen, FolderClosed, ArrowRight, CornerDownRight, ShieldAlert } from 'lucide-react';
import { getAncestors, getDescendants } from '../../lib/utils';

interface UnifiedFamilyTreeProps {
  people: Person[];
  branches: FamilyBranch[];
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string | null;
  searchQuery?: string;
  selectedBranchId?: string;
  selectedGeneration?: number | 'all';
  aliveFilter?: 'all' | 'alive' | 'deceased';
  highlightMode?: 'none' | 'ancestors' | 'descendants';
  onClearSelectedPerson?: () => void;
  onClearFilters?: () => void;
}

interface TreeNodeItemProps {
  person: Person;
  allPeople: Person[];
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string | null;
  searchQuery?: string;
  depth: number;
  highlightedIds?: Set<string>;
  expandedMap: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  person,
  allPeople,
  onSelectPerson,
  selectedPersonId,
  searchQuery,
  depth,
  highlightedIds,
  expandedMap,
  onToggleExpand,
}) => {
  const children = allPeople.filter((p) => p.fatherId === person.id || p.motherId === person.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedMap[person.id] !== false; // Default true

  const isSelected = selectedPersonId === person.id;
  const isHighlighted = highlightedIds?.has(person.id);
  const isSearchMatch =
    searchQuery && searchQuery.trim().length > 0
      ? person.fullName.toLowerCase().includes(searchQuery.toLowerCase().trim())
      : false;

  const father = allPeople.find((p) => p.id === person.fatherId);

  return (
    <div className="w-full relative group">
      {/* Node Row Container - Full width mobile adapted */}
      <div className="flex items-start gap-2 py-1.5 w-full">
        
        {/* Expand / Collapse Button or Terminal Dot */}
        <div className="pt-2 shrink-0">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(person.id);
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border transition-all ${
                isExpanded
                  ? 'bg-amber-100/80 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 shadow-xs'
              }`}
              title={isExpanded ? 'Collapse Branch' : 'Expand Branch'}
              aria-label={isExpanded ? 'Collapse branch' : 'Expand branch'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-amber-900" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-700" />
              )}
            </button>
          ) : (
            <div className="w-7 sm:w-8 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-[#c2410c] transition-colors" />
            </div>
          )}
        </div>

        {/* Person Card - 100% responsive width, never overflows screen */}
        <div
          id={`unified-node-${person.id}`}
          onClick={() => onSelectPerson(person)}
          className={`flex-1 min-w-0 p-3 sm:p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
            isSelected
              ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-md ring-2 ring-[#c2410c]'
              : isSearchMatch
              ? 'bg-amber-50 text-gray-900 border-[#c2410c] shadow-sm ring-2 ring-[#c2410c]/50'
              : isHighlighted
              ? 'bg-amber-50/70 text-gray-900 border-amber-400 ring-1 ring-amber-400'
              : 'bg-white text-gray-900 border-gray-200/90 hover:border-gray-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            
            {/* Left: Avatar + Names */}
            <div className="flex items-center gap-2.5 min-w-0">
              {person.photograph ? (
                <img
                  src={person.photograph}
                  alt={person.fullName}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-300 shrink-0"
                />
              ) : (
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm serif font-bold flex items-center justify-center border shrink-0 ${
                    isSelected
                      ? 'bg-white text-[#1a1a1a] border-white shadow-xs'
                      : 'bg-orange-50 text-[#c2410c] border-orange-200 shadow-xs'
                  }`}
                >
                  {person.fullName.charAt(0)}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="serif font-bold text-sm sm:text-base leading-snug truncate" title={person.fullName}>
                    {person.fullName}
                  </h4>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                      isSelected
                        ? 'bg-gray-800 text-gray-200 border-gray-700'
                        : 'bg-[#fcfaf7] text-gray-600 border-gray-200'
                    }`}
                  >
                    Gen {person.generation}
                  </span>
                </div>

                {father && (
                  <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                    ولدیت: <strong className={isSelected ? 'text-white' : 'text-gray-700'}>{father.fullName}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Right: Badges & Children count */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              {hasChildren && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isSelected
                      ? 'bg-gray-800 text-amber-300 border-gray-700'
                      : 'bg-amber-50 text-[#c2410c] border-amber-200'
                  }`}
                >
                  {children.length} اولاد
                </span>
              )}
              {person.aliveStatus && (
                <span
                  className={`text-[9px] font-medium ${
                    person.aliveStatus === 'alive'
                      ? isSelected
                        ? 'text-emerald-300'
                        : 'text-emerald-700'
                      : isSelected
                      ? 'text-gray-400'
                      : 'text-gray-400'
                  }`}
                >
                  {person.aliveStatus === 'alive' ? 'حیات' : 'مرحوم'}
                </span>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Children Sub-branch (Vertical Clean Indent) */}
      {hasChildren && isExpanded && (
        <div className="relative pl-4 sm:pl-7 ml-3.5 sm:ml-4 border-l-2 border-amber-200/80 my-1 space-y-1">
          {children.map((child) => (
            <TreeNodeItem
              key={child.id}
              person={child}
              allPeople={allPeople}
              onSelectPerson={onSelectPerson}
              selectedPersonId={selectedPersonId}
              searchQuery={searchQuery}
              depth={depth + 1}
              highlightedIds={highlightedIds}
              expandedMap={expandedMap}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const UnifiedFamilyTree: React.FC<UnifiedFamilyTreeProps> = ({
  people,
  branches,
  onSelectPerson,
  selectedPersonId,
  searchQuery = '',
  selectedBranchId = 'all',
  selectedGeneration = 'all',
  aliveFilter = 'all',
  highlightMode = 'none',
  onClearSelectedPerson,
  onClearFilters,
}) => {
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  // Auto-expand all on initial mount or filter changes
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    people.forEach((p) => {
      initial[p.id] = true;
    });
    setExpandedMap(initial);
  }, [people, searchQuery, selectedBranchId, selectedGeneration]);

  // Toggle expand for single node
  const handleToggleExpand = (id: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  // Highlight calculations
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

  const highlightedIds = highlightMode === 'ancestors' ? ancestorIds : highlightMode === 'descendants' ? descendantIds : undefined;

  const cleanQuery = searchQuery.trim().toLowerCase();
  const isSearchActive = cleanQuery.length > 0;

  // 1. SEARCH RESULTS: If search query is active, find matching persons
  const searchResults = React.useMemo(() => {
    if (!isSearchActive) return [];
    return people.filter((p) => {
      const matchName = p.fullName.toLowerCase().includes(cleanQuery);
      const matchFather = p.fatherId
        ? people.find((f) => f.id === p.fatherId)?.fullName.toLowerCase().includes(cleanQuery)
        : false;
      const matchBranch = p.branchName
        ? p.branchName.toLowerCase().includes(cleanQuery)
        : false;
      return matchName || matchFather || matchBranch;
    });
  }, [people, cleanQuery, isSearchActive]);

  // 2. BRANCH FILTERING ROOTS
  const branchRoots = React.useMemo(() => {
    if (isSearchActive) return [];

    // If 'all' branches selected
    if (!selectedBranchId || selectedBranchId === 'all') {
      // Return Gen 1 founding brothers
      const roots = people.filter((p) => p.generation === 1 || !p.fatherId);
      return roots.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    // Specific branch selected
    const branchInfo = branches.find((b) => b.id === selectedBranchId);

    // If branch has a defined patriarch person ID
    if (branchInfo?.patriarchPersonId) {
      const patriarch = people.find((p) => p.id === branchInfo.patriarchPersonId);
      if (patriarch) return [patriarch];
    }

    // Otherwise find people in this branch who have no father within this branch (top ancestors in this branch)
    const branchPeople = people.filter((p) => p.branchId === selectedBranchId);
    if (branchPeople.length === 0) return [];

    const branchPeopleIds = new Set(branchPeople.map((p) => p.id));
    const topOfBranch = branchPeople.filter((p) => !p.fatherId || !branchPeopleIds.has(p.fatherId));

    if (topOfBranch.length > 0) {
      return topOfBranch.sort((a, b) => (a.generation || 0) - (b.generation || 0));
    }

    // Fallback: lowest generation in this branch
    const minGen = Math.min(...branchPeople.map((p) => p.generation || 99));
    return branchPeople.filter((p) => p.generation === minGen);
  }, [people, branches, selectedBranchId, isSearchActive]);

  // 3. GENERATION FILTER
  const isGenerationFilterActive = selectedGeneration !== 'all' && !isSearchActive;
  const genFilteredPeople = isGenerationFilterActive
    ? people.filter((p) => {
        if (p.generation !== selectedGeneration) return false;
        if (selectedBranchId !== 'all' && p.branchId !== selectedBranchId) return false;
        if (aliveFilter !== 'all' && p.aliveStatus !== aliveFilter) return false;
        return true;
      })
    : [];

  return (
    <div className="w-full space-y-4">
      {/* Main Tree Canvas (100% Mobile Fitted, No Horizontal Scroll) */}
      <div className="w-full bg-[#fcfaf7] border border-gray-200/90 rounded-2xl p-3 sm:p-6 shadow-xs space-y-6">
        
        {/* CASE 1: SEARCH ACTIVE -> Show Matching Person + Their Entire Sub-Family Tree */}
        {isSearchActive ? (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-300 p-3.5 sm:p-4 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#c2410c]" />
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  تلاش: "{searchQuery}" کے مطابق <span className="text-[#c2410c]">{searchResults.length}</span> افراد اور ان کا ذیلی خاندان
                </span>
              </div>
              {onClearFilters && (
                <button
                  onClick={onClearFilters}
                  className="text-xs font-bold text-gray-600 hover:text-black bg-white border border-gray-300 px-2.5 py-1 rounded-lg shadow-2xs"
                >
                  فلٹر ختم کریں (Clear)
                </button>
              )}
            </div>

            {searchResults.length > 0 ? (
              searchResults.map((matchedPerson) => {
                const ancestors = getAncestors(matchedPerson.id, people);
                const descendants = getDescendants(matchedPerson.id, people);
                const directChildren = people.filter((p) => p.fatherId === matchedPerson.id);

                return (
                  <div
                    key={matchedPerson.id}
                    className="bg-white border-2 border-orange-200/90 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4"
                  >
                    {/* Header: Lineage Breadcrumb & Matched Person Banner */}
                    <div className="border-b border-gray-100 pb-3 space-y-2">
                      {ancestors.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 flex-wrap">
                          <span className="font-semibold text-gray-700">شجرہ نسب کا سلسلہ:</span>
                          {ancestors.reverse().map((anc, idx) => (
                            <span key={anc.id} className="flex items-center gap-1">
                              <button
                                onClick={() => onSelectPerson(anc)}
                                className="hover:text-[#c2410c] hover:underline font-medium"
                              >
                                {anc.fullName}
                              </button>
                              <span className="text-gray-400">›</span>
                            </span>
                          ))}
                          <span className="font-bold text-[#c2410c]">{matchedPerson.fullName}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#c2410c]" />
                          <h3 className="serif text-lg sm:text-xl font-bold text-[#1a1a1a]">
                            {matchedPerson.fullName} کا ذیلی خاندان و اولاد
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold bg-orange-100/80 text-[#c2410c] px-3 py-1 rounded-full border border-orange-200">
                            کل اولاد و نسل: {descendants.length} افراد
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Full Sub-tree of this Matched Person */}
                    <div className="bg-[#fcfaf7] p-3 sm:p-4 rounded-xl border border-gray-200/80">
                      <TreeNodeItem
                        person={matchedPerson}
                        allPeople={people}
                        onSelectPerson={onSelectPerson}
                        selectedPersonId={selectedPersonId}
                        searchQuery={searchQuery}
                        depth={1}
                        highlightedIds={highlightedIds}
                        expandedMap={expandedMap}
                        onToggleExpand={handleToggleExpand}
                      />
                    </div>

                    {/* Direct Children Quick summary if any */}
                    {directChildren.length > 0 ? (
                      <div className="text-xs text-gray-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60 flex items-center gap-1.5 flex-wrap">
                        <CornerDownRight className="w-3.5 h-3.5 text-[#c2410c]" />
                        <span className="font-bold text-gray-800">براہ راست بیٹے/اولاد ({directChildren.length}):</span>
                        {directChildren.map((c, i) => (
                          <span key={c.id} className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[11px] font-medium text-gray-800">
                            {c.fullName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">
                        (اس فرد کی کوئی آگے اولاد ریکارڈ میں درج نہیں ہے)
                      </p>
                    )}

                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 space-y-3">
                <Search className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">
                  "{searchQuery}" کے نام سے کوئی فرد نہیں ملا۔
                </p>
                <p className="text-xs text-gray-500">
                  براہِ کرم نام کے ہجے (Spelling) چیک کریں یا مختلف نام لکھ کر تلاش کریں۔
                </p>
                {onClearFilters && (
                  <button
                    onClick={onClearFilters}
                    className="mt-2 text-xs font-bold text-[#c2410c] hover:underline"
                  >
                    تمام شجرہ دوبارہ دیکھیں
                  </button>
                )}
              </div>
            )}
          </div>
        ) : isGenerationFilterActive ? (
          /* CASE 2: GENERATION FILTER ACTIVE */
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-amber-900">
                فلٹر شدہ جنریشن {selectedGeneration} کے کل {genFilteredPeople.length} افراد:
              </span>
              {onClearFilters && (
                <button
                  onClick={onClearFilters}
                  className="text-xs font-bold text-gray-600 hover:text-black bg-white border border-gray-300 px-2.5 py-1 rounded-lg"
                >
                  تمام شجرہ دیکھیں
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {genFilteredPeople.map((person) => {
                const father = people.find((p) => p.id === person.fatherId);
                const children = people.filter((p) => p.fatherId === person.id);
                const isSelected = selectedPersonId === person.id;

                return (
                  <div
                    key={person.id}
                    onClick={() => onSelectPerson(person)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-md ring-2 ring-[#c2410c]'
                        : 'bg-white text-gray-900 border-gray-200 hover:border-[#c2410c] shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="serif font-bold text-base">{person.fullName}</h4>
                      <span className="text-[10px] font-bold bg-orange-50 text-[#c2410c] border border-orange-200 px-2 py-0.5 rounded-md">
                        Gen {person.generation}
                      </span>
                    </div>
                    {father && (
                      <p className={`text-xs mt-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                        ولدیت: <strong className={isSelected ? 'text-white' : 'text-gray-800'}>{father.fullName}</strong>
                      </p>
                    )}
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className={isSelected ? 'text-gray-300' : 'text-gray-500'}>
                        اولاد: {children.length} افراد
                      </span>
                      <span className="text-[#c2410c] font-bold text-[11px] flex items-center gap-1">
                        مکمل تفصیل دیکھیں <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {genFilteredPeople.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border border-gray-200 text-gray-500 text-sm">
                اس فلٹر کے مطابق کوئی ریکارڈ موجود نہیں ہے۔
              </div>
            )}
          </div>
        ) : (
          /* CASE 3: STANDARD TREE (Branch-wise or Full Tree) */
          branchRoots.map((root) => {
            const branchDescendantsCount = getDescendants(root.id, people).length + 1;

            return (
              <div
                key={root.id}
                className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-5 shadow-2xs space-y-3"
              >
                {/* Branch Banner */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c2410c]" />
                    <h3 className="serif text-base sm:text-lg font-bold text-[#1a1a1a]">
                      شاخ / سلسلہ: {root.fullName}
                    </h3>
                  </div>
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    کل افراد: {branchDescendantsCount}
                  </span>
                </div>

                {/* Vertical Tree Branch */}
                <TreeNodeItem
                  person={root}
                  allPeople={people}
                  onSelectPerson={onSelectPerson}
                  selectedPersonId={selectedPersonId}
                  searchQuery={searchQuery}
                  depth={1}
                  highlightedIds={highlightedIds}
                  expandedMap={expandedMap}
                  onToggleExpand={handleToggleExpand}
                />
              </div>
            );
          })
        )}

        {!isSearchActive && !isGenerationFilterActive && branchRoots.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            کوئی ریکارڈ موجودہ فلٹر کے مطابق نہیں ملا۔
          </div>
        )}

      </div>
    </div>
  );
};
