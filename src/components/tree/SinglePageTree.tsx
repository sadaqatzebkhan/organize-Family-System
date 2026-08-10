import React from 'react';
import { Person } from '../../types';
import { Users, Layers, CheckCircle2 } from 'lucide-react';

interface SinglePageTreeProps {
  people: Person[];
  onSelectPerson: (person: Person) => void;
  selectedPersonId?: string | null;
  searchQuery?: string;
  zoomLevel?: number;
}

export const SinglePageTree: React.FC<SinglePageTreeProps> = ({
  people,
  onSelectPerson,
  selectedPersonId,
  searchQuery = '',
  zoomLevel = 1,
}) => {
  // Sort generations 1 to 5
  const gen1 = people.filter((p) => p.generation === 1);
  const gen2 = people.filter((p) => p.generation === 2);
  const gen3 = people.filter((p) => p.generation === 3);
  const gen4 = people.filter((p) => p.generation === 4);
  const gen5 = people.filter((p) => p.generation === 5);

  const totalCount = people.length;

  const isSearchMatch = (person: Person) => {
    if (!searchQuery || !searchQuery.trim()) return false;
    return person.fullName.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  const getFatherName = (fatherId?: string | null) => {
    if (!fatherId) return null;
    const father = people.find((p) => p.id === fatherId);
    return father ? father.fullName : null;
  };

  return (
    <div className="w-full bg-[#fcfaf7] border border-gray-200 rounded p-4 sm:p-6 shadow-inner overflow-x-auto text-[#1a1a1a]">
      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200 bg-white p-4 rounded shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1a1a1a] text-white rounded">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="serif text-lg font-bold text-[#1a1a1a]">
              Complete Single-Page Family Chart
            </h2>
            <p className="text-xs text-gray-500">
              All {totalCount} members of the Mazid Khail family lineage displayed on 1 unified sheet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Complete ({totalCount} / 85 Records)</span>
          </span>
        </div>
      </div>

      {/* Main Single Page Canvas */}
      <div
        className="transition-transform duration-150 origin-top-left space-y-8 min-w-[1100px]"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* --- GENERATION 1 --- */}
        <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <span className="px-2.5 py-0.5 bg-[#1a1a1a] text-white text-[11px] font-bold rounded uppercase tracking-wider">
              Gen 1 — Founding Patriarchs ({gen1.length})
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {gen1.map((p) => {
              const sons = gen2.filter((s) => s.fatherId === p.id);
              const isSelected = selectedPersonId === p.id;
              const isMatch = isSearchMatch(p);

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPerson(p)}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-md scale-[1.02]'
                      : isMatch
                      ? 'bg-amber-50 border-[#c2410c] text-[#1a1a1a]'
                      : 'bg-[#fcfaf7] hover:bg-white border-gray-200 hover:border-gray-400 text-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="serif font-bold text-sm truncate">{p.fullName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                      {p.aliveStatus === 'alive' ? 'Living' : 'Deceased'}
                    </span>
                  </div>
                  <div className={`text-[10px] mt-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                    Sons: {sons.length} ({sons.map((s) => s.fullName).join(', ')})
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- GENERATION 2 --- */}
        <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <span className="px-2.5 py-0.5 bg-gray-800 text-white text-[11px] font-bold rounded uppercase tracking-wider">
              Gen 2 — Direct Patriarch Lineages ({gen2.length})
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
            {gen2.map((p) => {
              const fatherName = getFatherName(p.fatherId);
              const isSelected = selectedPersonId === p.id;
              const isMatch = isSearchMatch(p);

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPerson(p)}
                  className={`p-2.5 rounded border text-center cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-md'
                      : isMatch
                      ? 'bg-amber-50 border-[#c2410c] text-[#1a1a1a]'
                      : 'bg-[#fcfaf7] hover:bg-white border-gray-200 text-[#1a1a1a]'
                  }`}
                >
                  <div className="serif font-bold text-xs truncate" title={p.fullName}>
                    {p.fullName}
                  </div>
                  {fatherName && (
                    <div className={`text-[9px] truncate mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                      S/O {fatherName}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- GENERATION 3 --- */}
        <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <span className="px-2.5 py-0.5 bg-gray-700 text-white text-[11px] font-bold rounded uppercase tracking-wider">
              Gen 3 — Sub-Branch Leaders ({gen3.length})
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {gen3.map((p) => {
              const fatherName = getFatherName(p.fatherId);
              const sons = gen4.filter((s) => s.fatherId === p.id);
              const isSelected = selectedPersonId === p.id;
              const isMatch = isSearchMatch(p);

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPerson(p)}
                  className={`p-2.5 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-md'
                      : isMatch
                      ? 'bg-amber-50 border-[#c2410c] text-[#1a1a1a]'
                      : 'bg-[#fcfaf7] hover:bg-white border-gray-200 text-[#1a1a1a]'
                  }`}
                >
                  <div className="serif font-bold text-xs truncate" title={p.fullName}>
                    {p.fullName}
                  </div>
                  {fatherName && (
                    <div className={`text-[9px] truncate ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                      S/O {fatherName}
                    </div>
                  )}
                  <div className={`text-[9px] font-mono mt-1 ${isSelected ? 'text-[#c2410c]' : 'text-[#c2410c]'}`}>
                    {sons.length} Sons
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- GENERATION 4 --- */}
        <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <span className="px-2.5 py-0.5 bg-gray-600 text-white text-[11px] font-bold rounded uppercase tracking-wider">
              Gen 4 — Elders & Household Heads ({gen4.length})
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {gen4.map((p) => {
              const fatherName = getFatherName(p.fatherId);
              const isSelected = selectedPersonId === p.id;
              const isMatch = isSearchMatch(p);

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPerson(p)}
                  className={`p-2 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : isMatch
                      ? 'bg-amber-50 border-[#c2410c] text-[#1a1a1a]'
                      : 'bg-[#fcfaf7] hover:bg-white border-gray-200 text-[#1a1a1a]'
                  }`}
                >
                  <div className="serif font-semibold text-[11px] truncate" title={p.fullName}>
                    {p.fullName}
                  </div>
                  {fatherName && (
                    <div className={`text-[8px] truncate ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                      S/O {fatherName}
                    </div>
                  )}
                  <div className={`text-[8px] mt-0.5 ${p.aliveStatus === 'alive' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
                    {p.aliveStatus === 'alive' ? 'Living' : 'Deceased'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- GENERATION 5 --- */}
        <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="px-2.5 py-0.5 bg-[#c2410c] text-white text-[11px] font-bold rounded uppercase tracking-wider">
              Gen 5 — Present Generation ({gen5.length})
            </span>
            <span className="text-[10px] text-gray-500 italic">
              (All 40 living & recorded members)
            </span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {gen5.map((p) => {
              const fatherName = getFatherName(p.fatherId);
              const isSelected = selectedPersonId === p.id;
              const isMatch = isSearchMatch(p);

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPerson(p)}
                  className={`p-1.5 rounded border text-center cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : isMatch
                      ? 'bg-amber-50 border-[#c2410c] text-[#1a1a1a]'
                      : 'bg-[#fcfaf7] hover:bg-white border-gray-200 text-[#1a1a1a]'
                  }`}
                >
                  <div className="serif font-semibold text-[10px] leading-tight truncate" title={p.fullName}>
                    {p.fullName}
                  </div>
                  {fatherName && (
                    <div className={`text-[8px] truncate ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                      S/O {fatherName}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
