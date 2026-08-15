import React, { useState } from 'react';
import { Person, FamilyBranch } from '../types';
import { Search, Filter, LayoutGrid, List, GitBranch, ArrowUpRight, Trash2, User, ChevronRight, CornerDownRight, RotateCcw, ArrowLeft, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { getAncestors, getDescendants } from '../lib/utils';

interface PeopleDirectoryPageProps {
  people: Person[];
  branches: FamilyBranch[];
  onSelectPerson: (person: Person) => void;
  onFocusInTree: (personId: string) => void;
  onDeletePerson?: (person: Person) => void;
  isAdmin?: boolean;
}

export const PeopleDirectoryPage: React.FC<PeopleDirectoryPageProps> = ({
  people,
  branches,
  onSelectPerson,
  onFocusInTree,
  onDeletePerson,
  isAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedGeneration, setSelectedGeneration] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Track the drilldown path in Grid view: [FounderId, Level1Id, Level2Id, ...]
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  // Gen 1 Founders (or people with no father in the tree)
  const founders = React.useMemo(() => {
    const gen1 = people.filter((p) => p.generation === 1 || !p.fatherId);
    return gen1.sort((a, b) => (a.generation || 1) - (b.generation || 1) || a.fullName.localeCompare(b.fullName));
  }, [people]);

  // Current active person at the deepest step of the path
  const currentActivePersonId = selectedPath.length > 0 ? selectedPath[selectedPath.length - 1] : null;
  const currentActivePerson = currentActivePersonId ? people.find((p) => p.id === currentActivePersonId) : null;

  // Direct children of current active person (checking both fatherId and motherId to ensure no data is missed)
  const activeChildren = React.useMemo(() => {
    if (!currentActivePersonId) return [];
    return people.filter((p) => p.fatherId === currentActivePersonId || p.motherId === currentActivePersonId);
  }, [people, currentActivePersonId]);

  // Total descendants of the current active person
  const activeDescendants = React.useMemo(() => {
    if (!currentActivePersonId) return [];
    return getDescendants(currentActivePersonId, people);
  }, [people, currentActivePersonId]);

  // When clicking on a person in the grid to drill deeper
  const handleDrilldown = (person: Person) => {
    setSelectedPath((prev) => [...prev, person.id]);
  };

  // Step back one generation
  const handleStepBack = () => {
    setSelectedPath((prev) => prev.slice(0, prev.length - 1));
  };

  // Jump to specific ancestor in breadcrumb
  const handleJumpToLevel = (levelIndex: number) => {
    if (levelIndex < 0) {
      setSelectedPath([]);
    } else {
      setSelectedPath((prev) => prev.slice(0, levelIndex + 1));
    }
  };

  const handleResetGrid = () => {
    setSelectedPath([]);
  };

  // Filtered people for List view or Search
  const filteredPeople = React.useMemo(() => {
    return people.filter((person) => {
      // Search query (matches name, father name, notes)
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const father = people.find((p) => p.id === person.fatherId);
        const nameMatch = person.fullName.toLowerCase().includes(query);
        const fatherMatch = father ? father.fullName.toLowerCase().includes(query) : false;
        const notesMatch = person.notes ? person.notes.toLowerCase().includes(query) : false;
        if (!nameMatch && !fatherMatch && !notesMatch) return false;
      }

      // Branch
      if (selectedBranch !== 'all' && person.branchId !== selectedBranch) return false;

      // Generation
      if (selectedGeneration !== 'all' && person.generation !== selectedGeneration) return false;

      return true;
    });
  }, [people, searchQuery, selectedBranch, selectedGeneration]);

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className="space-y-4 py-4 sm:py-6 animate-fade-in text-[#1a1a1a] w-full max-w-full overflow-x-hidden">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c2410c]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c2410c]">
              Directory & Records
            </span>
          </div>
          <h1 className="serif text-2xl sm:text-3xl font-medium text-[#1a1a1a] mt-0.5">
            تمام افراد کی ڈائریکٹری (People Directory)
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            خاندان کے تمام افراد کا ریکارڈ، شاخیں اور نسل بہ نسل شجرہ نسب۔
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center self-start sm:self-auto gap-1 bg-[#fcfaf7] p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#1a1a1a] text-white shadow-2xs'
                : 'text-gray-600 hover:text-[#1a1a1a]'
            }`}
            title="Grid View (Step-by-Step Generational Drilldown)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>گریڈ نسل بہ نسل (Grid)</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              viewMode === 'list'
                ? 'bg-[#1a1a1a] text-white shadow-2xs'
                : 'text-gray-600 hover:text-[#1a1a1a]'
            }`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
            <span>فہرست (List)</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="نام، ولدیت یا شاخ سے تلاش کریں..."
            className="w-full bg-[#fcfaf7] border border-gray-200 rounded-lg pl-9 pr-7 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#c2410c] text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-sm"
            >
              ×
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Branch Filter */}
          <div className="flex-1 sm:flex-initial flex items-center gap-1.5 min-w-[140px]">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-[#fcfaf7] border border-gray-200 rounded-lg px-2.5 py-2 text-gray-900 focus:outline-none focus:border-[#c2410c] text-xs"
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
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] font-bold text-gray-500">نسل:</span>
            <select
              value={selectedGeneration}
              onChange={(e) =>
                setSelectedGeneration(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
              }
              className="bg-[#fcfaf7] border border-gray-200 rounded-lg px-2.5 py-2 text-gray-900 focus:outline-none focus:border-[#c2410c] text-xs"
            >
              <option value="all">تمام (All)</option>
              {[1, 2, 3, 4, 5].map((g) => (
                <option key={g} value={g}>
                  Gen {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW MODE 1: FOCUSED STEP-BY-STEP GENERATION DRILLDOWN */}
      {/* ========================================================= */}
      {viewMode === 'grid' ? (
        <div className="space-y-5">
          
          {/* CASE A: Search is active in Grid View */}
          {isSearchActive ? (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950">
                  تلاش کے نتائج: "{searchQuery}"
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#c2410c] hover:underline font-bold"
                >
                  تلاش ختم کریں
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredPeople.map((person) => {
                  const father = people.find((p) => p.id === person.fatherId);
                  const children = people.filter((p) => p.fatherId === person.id || p.motherId === person.id);
                  return (
                    <div
                      key={person.id}
                      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-[#c2410c] transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        {person.photograph ? (
                          <img
                            src={person.photograph}
                            alt={person.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-orange-50 text-[#c2410c] border border-orange-200 serif font-bold text-sm flex items-center justify-center shrink-0">
                            {person.fullName.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="serif font-bold text-gray-900 text-base truncate">
                            {person.fullName}
                          </h3>
                          {father && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              ولدیت: <strong className="text-gray-700">{father.fullName}</strong>
                            </p>
                          )}
                          <span className="inline-block mt-1 text-[10px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">
                            Gen {person.generation}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onSelectPerson(person)}
                          className="text-xs text-gray-700 hover:text-[#c2410c] font-bold flex items-center gap-1"
                        >
                          پروفائل <ArrowUpRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            // Build lineage path from founders down to this person
                            const ancestors = getAncestors(person.id, people);
                            const path = [...ancestors.map((a) => a.id), person.id];
                            setSelectedPath(path);
                          }}
                          className="px-3 py-1.5 bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <span>اس شاخ میں جائیں ({children.length} اولاد) ↓</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* CASE B: FOCUSED SINGLE-ACTIVE GENERATION DRILLDOWN */
            <div className="space-y-5">
              
              {/* Breadcrumb & Step-back Action Bar */}
              <div className="bg-white border border-gray-200/90 rounded-xl p-3 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 flex-wrap text-xs sm:text-sm min-w-0">
                  <button
                    onClick={() => handleJumpToLevel(-1)}
                    className={`font-bold transition-colors ${
                      selectedPath.length === 0
                        ? 'text-[#c2410c] bg-orange-50 px-2 py-0.5 rounded border border-orange-200'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    بزرگ بانیان (Founders)
                  </button>

                  {selectedPath.map((personId, idx) => {
                    const person = people.find((p) => p.id === personId);
                    if (!person) return null;
                    const isLast = idx === selectedPath.length - 1;
                    return (
                      <React.Fragment key={person.id}>
                        <span className="text-gray-400 font-bold">›</span>
                        <button
                          onClick={() => handleJumpToLevel(idx)}
                          className={`font-bold transition-colors truncate max-w-[150px] sm:max-w-none ${
                            isLast
                              ? 'text-[#c2410c] bg-orange-50 px-2 py-0.5 rounded border border-orange-200'
                              : 'text-gray-700 hover:text-black'
                          }`}
                        >
                          {person.fullName}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>

                {selectedPath.length > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleStepBack}
                      className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 border border-gray-300 px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>پیچھے جائیں (Back)</span>
                    </button>
                    <button
                      onClick={handleResetGrid}
                      className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#c2410c] bg-[#fcfaf7] border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                      title="Reset to Founders"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>شروع سے</span>
                    </button>
                  </div>
                )}
              </div>

              {/* LEVEL 0: WHEN NO PERSON IS SELECTED -> SHOW THE 3 FOUNDERS */}
              {selectedPath.length === 0 ? (
                <div className="bg-[#fcfaf7] border border-gray-200/90 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#c2410c]" />
                      <h3 className="serif text-lg sm:text-xl font-bold text-[#1a1a1a]">
                        مرکزی بزرگ بانیان (Founders - Gen 1)
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                      کسی ایک بزرگ پر کلک کر کے ان کی شاخ اور اولاد دیکھیں
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {founders.map((founder) => {
                      const children = people.filter((p) => p.fatherId === founder.id || p.motherId === founder.id);

                      return (
                        <div
                          key={founder.id}
                          onClick={() => handleDrilldown(founder)}
                          className="group cursor-pointer p-4 rounded-xl border-2 bg-white text-gray-900 border-gray-200 hover:border-[#c2410c] shadow-2xs hover:shadow-md transition-all duration-150 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start gap-3">
                              {founder.photograph ? (
                                <img
                                  src={founder.photograph}
                                  alt={founder.fullName}
                                  className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full serif font-bold text-base flex items-center justify-center shrink-0 border bg-orange-50 text-[#c2410c] border-orange-200 group-hover:bg-[#c2410c] group-hover:text-white transition-colors shadow-2xs">
                                  {founder.fullName.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h4 className="serif font-bold text-base sm:text-lg leading-tight truncate text-gray-900 group-hover:text-[#c2410c] transition-colors">
                                  {founder.fullName}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  بانی بزرگ • Gen 1
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-[#c2410c] border-amber-200">
                                {children.length} براہ راست بیٹے
                              </span>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectPerson(founder);
                                  }}
                                  className="p-1.5 rounded-lg border bg-[#fcfaf7] text-gray-600 border-gray-200 hover:bg-gray-100 transition-colors"
                                  title="پروفائل دیکھیں"
                                >
                                  <User className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFocusInTree(founder.id);
                                  }}
                                  className="p-1.5 rounded-lg border bg-[#fcfaf7] text-[#c2410c] border-gray-200 hover:bg-gray-100 transition-colors"
                                  title="شجرہ میں دیکھیں"
                                >
                                  <GitBranch className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="mt-3.5 pt-2.5 border-t border-gray-100">
                            <div className="w-full py-2 bg-orange-50 group-hover:bg-[#c2410c] text-[#c2410c] group-hover:text-white rounded-lg text-center text-xs font-bold border border-orange-200 group-hover:border-[#c2410c] transition-all flex items-center justify-center gap-1.5 shadow-2xs">
                              <span>شاخ اور اولاد دیکھیں</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* LEVEL 1+ : FOCUSED PARENT & ONLY THEIR CHILDREN */
                currentActivePerson && (
                  <div className="space-y-5 animate-fade-in">
                    
                    {/* Active Selected Parent Card (Prominent Header Banner) */}
                    <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 sm:p-5 shadow-md border border-gray-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          {currentActivePerson.photograph ? (
                            <img
                              src={currentActivePerson.photograph}
                              alt={currentActivePerson.fullName}
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-orange-400 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-[#1a1a1a] serif font-bold text-lg sm:text-xl flex items-center justify-center shrink-0 shadow-sm border border-gray-300">
                              {currentActivePerson.fullName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-400/40 px-2 py-0.5 rounded-md">
                                منتخب بزرگ • Gen {currentActivePerson.generation}
                              </span>
                              {currentActivePerson.branchName && (
                                <span className="text-[10px] text-gray-300 bg-gray-800 px-2 py-0.5 rounded-md border border-gray-700 truncate">
                                  {currentActivePerson.branchName}
                                </span>
                              )}
                            </div>
                            <h2 className="serif text-xl sm:text-2xl font-bold text-white mt-1 truncate">
                              {currentActivePerson.fullName}
                            </h2>
                            {currentActivePerson.fatherId && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                ولدیت:{' '}
                                <strong className="text-gray-200">
                                  {people.find((p) => p.id === currentActivePerson.fatherId)?.fullName || '—'}
                                </strong>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Top Actions */}
                        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                          <button
                            onClick={() => onSelectPerson(currentActivePerson)}
                            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded-lg border border-gray-700 transition-colors flex items-center gap-1.5"
                          >
                            <User className="w-3.5 h-3.5 text-orange-400" />
                            <span>مکمل پروفائل</span>
                          </button>
                          <button
                            onClick={() => onFocusInTree(currentActivePerson.id)}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                          >
                            <GitBranch className="w-3.5 h-3.5" />
                            <span>شجرہ میں دیکھیں</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
                        <span>
                          براہ راست اولاد (بیٹے): <strong className="text-white">{activeChildren.length}</strong>
                        </span>
                        <span>
                          کل نسل و اولاد: <strong className="text-orange-400">{activeDescendants.length} افراد</strong>
                        </span>
                      </div>
                    </div>

                    {/* Children List / Sub-Branches Grid */}
                    <div className="bg-[#fcfaf7] border border-gray-200/90 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <div className="flex items-center gap-2">
                          <CornerDownRight className="w-4 h-4 text-[#c2410c]" />
                          <h3 className="serif text-base sm:text-lg font-bold text-[#1a1a1a]">
                            <strong className="text-[#c2410c]">{currentActivePerson.fullName}</strong> کی براہ راست اولاد (Gen {(currentActivePerson.generation || 1) + 1})
                          </h3>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          کل اولاد: <strong className="text-gray-800">{activeChildren.length}</strong>
                        </span>
                      </div>

                      {activeChildren.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                          {activeChildren.map((child) => {
                            const grandChildren = people.filter((p) => p.fatherId === child.id || p.motherId === child.id);
                            const hasGrandChildren = grandChildren.length > 0;

                            return (
                              <div
                                key={child.id}
                                onClick={() => {
                                  if (hasGrandChildren) {
                                    handleDrilldown(child);
                                  } else {
                                    onSelectPerson(child);
                                  }
                                }}
                                className="group cursor-pointer p-3.5 rounded-xl border bg-white text-gray-900 border-gray-200 hover:border-[#c2410c] shadow-2xs hover:shadow-md transition-all duration-150 flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-start gap-2.5 mb-2.5">
                                    {child.photograph ? (
                                      <img
                                        src={child.photograph}
                                        alt={child.fullName}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-orange-50 text-[#c2410c] border border-orange-200 serif font-bold text-sm flex items-center justify-center shrink-0 group-hover:bg-[#c2410c] group-hover:text-white transition-colors">
                                        {child.fullName.charAt(0)}
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <h4 className="serif font-bold text-sm sm:text-base leading-snug truncate group-hover:text-[#c2410c] transition-colors">
                                        {child.fullName}
                                      </h4>
                                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                        ولدیت: {currentActivePerson.fullName}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-1 text-xs pt-2 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">
                                        Gen {child.generation}
                                      </span>
                                      <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                          hasGrandChildren
                                            ? 'bg-amber-50 text-[#c2410c] border-amber-200'
                                            : 'bg-gray-50 text-gray-500 border-gray-200'
                                        }`}
                                      >
                                        {hasGrandChildren ? `${grandChildren.length} اولاد درج ہے` : 'کوئی آگے اولاد نہیں'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions / Drilldown button */}
                                <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectPerson(child);
                                      }}
                                      className="text-[11px] font-bold text-gray-600 hover:text-[#c2410c] flex items-center gap-1"
                                    >
                                      پروفائل <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onFocusInTree(child.id);
                                        }}
                                        className="p-1 rounded bg-[#fcfaf7] hover:bg-gray-100 text-gray-700 border border-gray-200"
                                        title="شجرہ میں دیکھیں"
                                      >
                                        <GitBranch className="w-3 h-3 text-[#c2410c]" />
                                      </button>
                                      {onDeletePerson && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onDeletePerson(child);
                                          }}
                                          className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                                          title="Delete"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {hasGrandChildren ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDrilldown(child);
                                      }}
                                      className="w-full py-1.5 bg-[#c2410c] hover:bg-[#9a3412] text-white rounded-lg text-center text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                                    >
                                      <span>ان کی اولاد دیکھیں ({grandChildren.length})</span>
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  ) : (
                                    <div className="py-1 text-center text-[10px] text-gray-400 italic">
                                      (آگے کوئی اولاد درج نہیں)
                                    </div>
                                  )}
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 space-y-2">
                          <p className="text-sm font-semibold text-gray-700">
                            {currentActivePerson.fullName} کی آگے کوئی اولاد ریکارڈ میں درج نہیں ہے۔
                          </p>
                          <p className="text-xs text-gray-500">
                            اگر آپ ایڈمن ہیں تو نئی اولاد ایڈمن پینل سے شامل کر سکتے ہیں۔
                          </p>
                          <button
                            onClick={handleStepBack}
                            className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>پچھلے مرحلے پر واپس جائیں</span>
                          </button>
                        </div>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>
      ) : (
        /* ========================================================= */
        /* VIEW MODE 2: LIST VIEW (Clean, Responsive, Zero Overflow) */
        /* ========================================================= */
        <div className="rounded-xl bg-white border border-gray-200/90 overflow-hidden shadow-2xs">
          
          {/* Desktop Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-2 bg-[#fcfaf7] border-b border-gray-200 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-600">
            <div className="col-span-4">نام (Name)</div>
            <div className="col-span-3">ولدیت (Father)</div>
            <div className="col-span-1 text-center">نسل</div>
            <div className="col-span-3">شاخ (Branch)</div>
            <div className="col-span-1 text-right">ایکشن</div>
          </div>

          {/* List Rows */}
          <div className="divide-y divide-gray-100">
            {filteredPeople.map((person) => {
              const father = people.find((p) => p.id === person.fatherId);
              return (
                <div
                  key={person.id}
                  onClick={() => onSelectPerson(person)}
                  className="p-3 sm:p-3.5 hover:bg-[#fcfaf7] cursor-pointer transition-colors flex flex-col md:grid md:grid-cols-12 md:items-center gap-2 md:gap-2"
                >
                  {/* Name + Avatar */}
                  <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-2.5 min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {person.photograph ? (
                        <img
                          src={person.photograph}
                          alt={person.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-orange-50 text-[#c2410c] border border-orange-200 serif font-bold text-xs flex items-center justify-center shrink-0">
                          {person.fullName.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 text-sm block truncate">
                          {person.fullName}
                        </span>
                        {/* Mobile Father Name inline */}
                        <span className="md:hidden text-[11px] text-gray-500 block truncate">
                          ولدیت: <strong className="text-gray-700">{father?.fullName || '—'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Mobile Badges (Gen) */}
                    <div className="md:hidden flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">
                        G{person.generation}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Father Column */}
                  <div className="hidden md:block md:col-span-3 text-xs text-gray-700 truncate">
                    {father?.fullName || '—'}
                  </div>

                  {/* Desktop Generation Column */}
                  <div className="hidden md:block md:col-span-1 text-center">
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                      G{person.generation}
                    </span>
                  </div>

                  {/* Branch & Actions Row on Mobile / Columns on Desktop */}
                  <div className="md:col-span-3 flex items-center justify-between md:justify-start gap-2 text-xs">
                    <span className="text-gray-600 text-[11px] truncate bg-[#fcfaf7] md:bg-transparent px-2 md:px-0 py-0.5 md:py-0 rounded border md:border-none border-gray-200">
                      <span className="md:hidden text-gray-400 font-normal">شاخ: </span>
                      <strong className="font-medium text-gray-800">{person.branchName || 'Mazid Khail'}</strong>
                    </span>

                    {/* Mobile Actions Button */}
                    <div className="md:hidden flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFocusInTree(person.id);
                        }}
                        className="px-2 py-1 rounded bg-orange-50 hover:bg-orange-100 text-[#c2410c] text-[10px] font-bold border border-orange-200 flex items-center gap-1"
                      >
                        <GitBranch className="w-3 h-3" />
                        <span>شجرہ</span>
                      </button>
                    </div>
                  </div>

                  {/* Desktop Actions Column */}
                  <div className="hidden md:flex md:col-span-1 items-center justify-end gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFocusInTree(person.id);
                      }}
                      className="p-1.5 rounded-lg bg-[#fcfaf7] hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors"
                      title="Locate in Tree"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-[#c2410c]" />
                    </button>
                    {onDeletePerson && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePerson(person);
                        }}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                        title="Delete Person"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {filteredPeople.length === 0 && (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200">
          کوئی ریکارڈ موجودہ تلاش کے مطابق نہیں ملا۔
        </div>
      )}

    </div>
  );
};
