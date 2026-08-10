import React, { useState } from 'react';
import { Person, FamilyBranch } from '../types';
import { GitFork, ChevronRight, Users } from 'lucide-react';

interface FamilyBranchesPageProps {
  branches: FamilyBranch[];
  people: Person[];
  onSelectPerson: (person: Person) => void;
  onFocusInTree: (personId: string) => void;
}

export const FamilyBranchesPage: React.FC<FamilyBranchesPageProps> = ({
  branches,
  people,
  onSelectPerson,
  onFocusInTree,
}) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('branch_gujar');

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Get people belonging to selected branch
  const branchPeople = people.filter((p) => p.branchId === selectedBranchId);

  // Group branch people by generation
  const generationGroups = React.useMemo(() => {
    const map = new Map<number, Person[]>();
    for (const p of branchPeople) {
      const gen = p.generation || 1;
      if (!map.has(gen)) map.set(gen, []);
      map.get(gen)!.push(p);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [branchPeople]);

  return (
    <div className="space-y-8 py-6 animate-fade-in text-[#1a1a1a]">
      
      {/* Title */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="serif text-3xl font-light italic text-[#1a1a1a]">
          Family Branches Explorer
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Explore sub-branches, patriarchs, and generational hierarchy across the Mazid Khail archives.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Branch Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="label-caps mb-3 px-1 text-gray-500">
            Select Branch ({branches.length})
          </h3>
          <div className="space-y-1.5">
            {branches.map((branch) => {
              const active = selectedBranchId === branch.id;
              const count = people.filter((p) => p.branchId === branch.id).length;
              return (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranchId(branch.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded text-left text-xs uppercase tracking-wider font-bold transition-all ${
                    active
                      ? 'bg-[#1a1a1a] text-white shadow-2xs'
                      : 'bg-white hover:bg-[#fcfaf7] text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <GitFork className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-white' : 'text-[#c2410c]'}`} />
                    <span className="truncate">{branch.name}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded ${
                      active ? 'bg-gray-800 text-gray-200' : 'bg-[#fcfaf7] text-gray-600 border border-gray-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Branch Content */}
        <div className="lg:col-span-3 space-y-8 bg-white p-6 sm:p-8 rounded border border-gray-200 shadow-2xs">
          
          {/* Branch Header */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="label-caps text-[#c2410c]">Sub-Branch Overview</span>
                <h2 className="serif text-3xl font-light italic text-[#1a1a1a] mt-1">
                  {currentBranch?.name}
                </h2>
                {currentBranch?.description && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {currentBranch.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#fcfaf7] border border-gray-200 text-xs font-bold text-[#1a1a1a]">
                <Users className="w-3.5 h-3.5 text-[#c2410c]" />
                <span>{branchPeople.length} Members</span>
              </div>
            </div>
          </div>

          {/* Generational Breakdown for Branch */}
          <div className="space-y-8">
            {generationGroups.map(([gen, members]) => (
              <div key={gen} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded bg-[#1a1a1a] text-white serif font-bold text-xs">
                    Generation {gen} ({members.length})
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {members.map((person) => {
                    const father = people.find((p) => p.id === person.fatherId);
                    return (
                      <div
                        key={person.id}
                        onClick={() => onSelectPerson(person)}
                        className="group cursor-pointer p-4 rounded bg-[#fcfaf7] hover:bg-white border border-gray-200 hover:border-[#1a1a1a] transition-all flex items-center justify-between shadow-2xs"
                      >
                        <div>
                          <div className="serif font-bold text-[#1a1a1a] group-hover:text-[#c2410c] transition-colors">
                            {person.fullName}
                          </div>
                          {father && (
                            <div className="text-xs text-gray-500">
                              Father: {father.fullName}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFocusInTree(person.id);
                          }}
                          className="p-1.5 rounded bg-white text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white border border-gray-200 transition-colors"
                          title="Locate in Tree"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {branchPeople.length === 0 && (
              <div className="text-center py-12 text-gray-500 italic text-xs">
                No members recorded under this branch yet. You can add people to this branch in the Admin Panel.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

