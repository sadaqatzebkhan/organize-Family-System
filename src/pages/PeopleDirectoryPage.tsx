import React, { useState } from 'react';
import { Person, FamilyBranch } from '../types';
import { Search, Filter, LayoutGrid, List, GitBranch, ArrowUpRight, Trash2 } from 'lucide-react';

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

  return (
    <div className="space-y-6 py-6 animate-fade-in text-[#1a1a1a]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="serif text-3xl font-light italic text-[#1a1a1a]">
            People Directory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Search and explore all recorded family members across generations ({filteredPeople.length} records).
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#fcfaf7] p-1 rounded border border-gray-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'grid' ? 'bg-[#1a1a1a] text-white' : 'text-gray-600 hover:text-[#1a1a1a]'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'list' ? 'bg-[#1a1a1a] text-white' : 'text-gray-600 hover:text-[#1a1a1a]'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded bg-white border border-gray-200 shadow-2xs flex flex-wrap items-center gap-4 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, father, or notes..."
            className="w-full bg-[#fcfaf7] border border-gray-200 rounded pl-9 pr-4 py-2 text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-[#1a1a1a] text-xs"
          />
        </div>

        {/* Branch Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-[#fcfaf7] border border-gray-200 rounded px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] text-xs"
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
        <div className="flex items-center gap-2">
          <span className="label-caps">Gen:</span>
          <select
            value={selectedGeneration}
            onChange={(e) =>
              setSelectedGeneration(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
            }
            className="bg-[#fcfaf7] border border-gray-200 rounded px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] text-xs"
          >
            <option value="all">All Generations</option>
            {[1, 2, 3, 4, 5].map((g) => (
              <option key={g} value={g}>
                Gen {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Grid / List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPeople.map((person) => {
            const father = people.find((p) => p.id === person.fatherId);
            return (
              <div
                key={person.id}
                onClick={() => onSelectPerson(person)}
                className="group cursor-pointer p-5 rounded bg-white border border-gray-200 hover:border-[#1a1a1a] transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      {person.photograph ? (
                        <img
                          src={person.photograph}
                          alt={person.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-300"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white serif font-bold text-sm flex items-center justify-center">
                          {person.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="serif font-bold text-[#1a1a1a] group-hover:text-[#c2410c] transition-colors text-base">
                          {person.fullName}
                        </h3>
                        {father && (
                          <div className="text-xs text-gray-500">
                            S/O {father.fullName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Generation:</span>
                      <span className="font-bold text-[#1a1a1a]">Gen {person.generation}</span>
                    </div>
                    {person.branchName && (
                      <div className="flex items-center justify-between truncate">
                        <span className="font-medium">Branch:</span>
                        <span className="text-gray-800 truncate max-w-[120px]">{person.branchName}</span>
                      </div>
                    )}
                    {(person.birthDate || person.deathDate) && (
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Lifespan:</span>
                        <span>{person.birthDate || '?'} - {person.deathDate || (person.aliveStatus === 'alive' ? 'Living' : '?')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="label-caps text-[#c2410c] group-hover:underline flex items-center gap-1">
                    View Profile <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    {onDeletePerson && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePerson(person);
                        }}
                        className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                        title="Delete Person"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFocusInTree(person.id);
                      }}
                      className="p-1.5 rounded bg-[#fcfaf7] hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors"
                      title="Locate in Tree"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded bg-white border border-gray-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-[#1a1a1a]">
            <thead className="bg-[#fcfaf7] label-caps border-b border-gray-200">
              <tr>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Father</th>
                <th className="p-3.5">Gen</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPeople.map((person) => {
                const father = people.find((p) => p.id === person.fatherId);
                return (
                  <tr
                    key={person.id}
                    onClick={() => onSelectPerson(person)}
                    className="hover:bg-[#fcfaf7] cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-bold text-[#1a1a1a] flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white text-xs serif font-bold flex items-center justify-center">
                        {person.fullName.charAt(0)}
                      </div>
                      <span>{person.fullName}</span>
                    </td>
                    <td className="p-3.5 text-gray-600">{father?.fullName || '—'}</td>
                    <td className="p-3.5 font-bold text-[#1a1a1a]">G{person.generation}</td>
                    <td className="p-3.5">{person.branchName || 'Mazid Khail'}</td>
                    <td className="p-3.5 capitalize">{person.aliveStatus || 'Unknown'}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFocusInTree(person.id);
                        }}
                        className="px-2.5 py-1 rounded bg-[#fcfaf7] hover:bg-gray-100 text-[#1a1a1a] label-caps border border-gray-200"
                      >
                        Locate in Tree
                      </button>
                      {onDeletePerson && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePerson(person);
                          }}
                          className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors inline-block align-middle"
                          title="Delete Person"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredPeople.length === 0 && (
        <div className="text-center py-16 text-gray-500 bg-white rounded border border-gray-200">
          No family members matched your search filters.
        </div>
      )}

    </div>
  );
};

