import React, { useState } from 'react';
import { X, Calendar, MapPin, Briefcase, GitBranch, ArrowUpRight, FileText, AlertCircle, ChevronRight, Trash2, Edit2 } from 'lucide-react';
import { Person } from '../types';
import { formatDate, getParents, getChildren, getSiblings, getAncestralPath } from '../lib/utils';

interface PersonProfileModalProps {
  person: Person | null;
  people: Person[];
  onClose: () => void;
  onSelectPerson: (personId: string) => void;
  onFocusInTree?: (personId: string) => void;
  onDeletePerson?: (person: Person) => void;
  onEditPerson?: (person: Person) => void;
  isAdmin?: boolean;
}

export const PersonProfileModal: React.FC<PersonProfileModalProps> = ({
  person,
  people,
  onClose,
  onSelectPerson,
  onFocusInTree,
  onDeletePerson,
  onEditPerson,
  isAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'relatives' | 'lineage'>('profile');

  if (!person) return null;

  const { father, mother } = getParents(person, people);
  const children = getChildren(person.id, people);
  const siblings = getSiblings(person, people);
  const ancestralPath = getAncestralPath(person.id, people);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#fcfaf7] text-[#1a1a1a] rounded-lg border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Banner */}
        <div className="bg-white p-6 border-b border-gray-200 flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Photograph or Avatar */}
            <div className="relative">
              {person.photograph ? (
                <img
                  src={person.photograph}
                  alt={person.fullName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-gray-200 shadow-2xs"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-2xl serif font-light shadow-2xs">
                  {person.fullName.charAt(0)}
                </div>
              )}
              {person.aliveStatus && (
                <span
                  title={person.aliveStatus === 'alive' ? 'Living' : 'Deceased'}
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    person.aliveStatus === 'alive' ? 'bg-emerald-600' : 'bg-gray-400'
                  }`}
                />
              )}
            </div>

            <div>
              <h2 className="serif text-2xl sm:text-3xl font-light text-[#1a1a1a]">
                {person.fullName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="label-caps px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                  Gen {person.generation}
                </span>
                {person.branchName && (
                  <span className="label-caps px-2 py-0.5 rounded bg-amber-50 text-[#c2410c] border border-amber-200">
                    {person.branchName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onFocusInTree && (
              <button
                onClick={() => {
                  onFocusInTree(person.id);
                  onClose();
                }}
                id="modal-locate-tree-button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-2xs"
                title="Locate person in tree"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Focus in Tree</span>
              </button>
            )}

            <button
              onClick={onClose}
              id="modal-close-button"
              className="p-1.5 rounded text-gray-400 hover:text-[#1a1a1a] hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 bg-[#fcfaf7] px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-[#1a1a1a] text-[#1a1a1a]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Person Details
          </button>
          <button
            onClick={() => setActiveTab('relatives')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'relatives'
                ? 'border-[#1a1a1a] text-[#1a1a1a]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Family Connections ({children.length + (father ? 1 : 0) + siblings.length})
          </button>
          <button
            onClick={() => setActiveTab('lineage')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'lineage'
                ? 'border-[#1a1a1a] text-[#1a1a1a]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Lineage Path
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm bg-[#fcfaf7]">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Dynamic Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Father */}
                <div className="p-4 rounded bg-white border border-gray-200 shadow-2xs">
                  <span className="label-caps block mb-1">Father</span>
                  {father ? (
                    <button
                      onClick={() => onSelectPerson(father.id)}
                      className="serif font-bold text-[#1a1a1a] hover:text-[#c2410c] hover:underline flex items-center gap-1 group text-base"
                    >
                      <span>{father.fullName}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </button>
                  ) : (
                    <span className="text-gray-400 italic text-xs">Not recorded</span>
                  )}
                </div>

                {/* Mother */}
                <div className="p-4 rounded bg-white border border-gray-200 shadow-2xs">
                  <span className="label-caps block mb-1">Mother</span>
                  {mother ? (
                    <button
                      onClick={() => onSelectPerson(mother.id)}
                      className="serif font-bold text-[#1a1a1a] hover:text-[#c2410c] hover:underline flex items-center gap-1 group text-base"
                    >
                      <span>{mother.fullName}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </button>
                  ) : (
                    <span className="text-gray-400 italic text-xs">Not recorded</span>
                  )}
                </div>

                {/* Birth Date */}
                <div className="p-4 rounded bg-white border border-gray-200 shadow-2xs">
                  <span className="label-caps block mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    Birth Date
                  </span>
                  <span className={person.birthDate ? 'text-[#1a1a1a] font-medium' : 'text-gray-400 italic'}>
                    {formatDate(person.birthDate)}
                  </span>
                </div>

                {/* Death Date */}
                <div className="p-4 rounded bg-white border border-gray-200 shadow-2xs">
                  <span className="label-caps block mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    Death Date
                  </span>
                  <span className={person.deathDate ? 'text-[#1a1a1a] font-medium' : 'text-gray-400 italic'}>
                    {formatDate(person.deathDate)}
                  </span>
                </div>

                {/* Status */}
                <div className="p-4 rounded bg-white border border-gray-200 shadow-2xs">
                  <span className="label-caps block mb-1">Status</span>
                  <span className="capitalize font-semibold text-[#1a1a1a]">
                    {person.aliveStatus || 'Not specified'}
                  </span>
                </div>

                {/* Branch */}
                <div className="p-4 rounded bg-white border border-gray-200 shadow-2xs">
                  <span className="label-caps block mb-1">Branch</span>
                  <span className="text-[#1a1a1a] font-medium">
                    {person.branchName || 'Mazid Khail Main Branch'}
                  </span>
                </div>

                {/* Occupation if available */}
                {person.occupation && (
                  <div className="p-4 rounded bg-white border border-gray-200 shadow-2xs sm:col-span-2">
                    <span className="label-caps block mb-1 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-gray-400" />
                      Occupation
                    </span>
                    <span className="text-[#1a1a1a] font-medium">{person.occupation}</span>
                  </div>
                )}

                {/* Location if available */}
                {person.location && (
                  <div className="p-4 rounded bg-white border border-gray-200 shadow-2xs sm:col-span-2">
                    <span className="label-caps block mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      Location / Residence
                    </span>
                    <span className="text-[#1a1a1a] font-medium">{person.location}</span>
                  </div>
                )}

              </div>

              {/* Biography if available */}
              {person.biography && (
                <div className="p-5 rounded bg-amber-50/50 border border-amber-200">
                  <h4 className="label-caps text-[#c2410c] mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Biography / Historical Profile
                  </h4>
                  <p className="text-[#1a1a1a] leading-relaxed text-sm">
                    {person.biography}
                  </p>
                </div>
              )}

              {/* Archive Record Notes */}
              {person.notes && (
                <div className="p-5 rounded bg-white border border-gray-200">
                  <h4 className="label-caps text-gray-500 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#c2410c]" />
                    Genealogical Notes
                  </h4>
                  <p className="text-gray-600 text-xs italic leading-relaxed">
                    {person.notes}
                  </p>
                </div>
              )}

            </div>
          )}

          {activeTab === 'relatives' && (
            <div className="space-y-6">
              
              {/* Parents */}
              <div>
                <span className="label-caps block mb-3">Parents</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {father && (
                    <button
                      onClick={() => onSelectPerson(father.id)}
                      className="p-4 rounded bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-between text-left transition-colors shadow-2xs"
                    >
                      <div>
                        <div className="serif font-bold text-[#1a1a1a] text-base">{father.fullName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Father • Gen {father.generation}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                  {mother && (
                    <button
                      onClick={() => onSelectPerson(mother.id)}
                      className="p-4 rounded bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-between text-left transition-colors shadow-2xs"
                    >
                      <div>
                        <div className="serif font-bold text-[#1a1a1a] text-base">{mother.fullName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Mother • Gen {mother.generation}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                  {!father && !mother && (
                    <div className="text-xs text-gray-400 italic p-4 bg-white border border-gray-200 rounded">
                      No parent records in archive for this individual.
                    </div>
                  )}
                </div>
              </div>

              {/* Children */}
              <div>
                <span className="label-caps block mb-3">Children ({children.length})</span>
                {children.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => onSelectPerson(child.id)}
                        className="p-4 rounded bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-between text-left transition-colors shadow-2xs"
                      >
                        <div>
                          <div className="serif font-bold text-[#1a1a1a] text-base">{child.fullName}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Child • Gen {child.generation}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic p-4 bg-white border border-gray-200 rounded">
                    No children listed in archive records.
                  </div>
                )}
              </div>

              {/* Siblings */}
              <div>
                <span className="label-caps block mb-3">Siblings ({siblings.length})</span>
                {siblings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
                    {siblings.map((sib) => (
                      <button
                        key={sib.id}
                        onClick={() => onSelectPerson(sib.id)}
                        className="p-4 rounded bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-between text-left transition-colors shadow-2xs"
                      >
                        <div>
                          <div className="serif font-bold text-[#1a1a1a] text-base">{sib.fullName}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Sibling • Gen {sib.generation}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic p-4 bg-white border border-gray-200 rounded">
                    No recorded siblings in archive.
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'lineage' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Direct ancestral descent back to the senior patriarch generation:
              </p>
              <div className="space-y-2">
                {ancestralPath.map((ancestor) => {
                  const isCurrent = ancestor.id === person.id;
                  return (
                    <div
                      key={ancestor.id}
                      className={`p-4 rounded border flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-[#1a1a1a] text-white border-black shadow-md'
                          : 'bg-white border-gray-200 hover:border-black/30 cursor-pointer shadow-2xs'
                      }`}
                      onClick={() => !isCurrent && onSelectPerson(ancestor.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`label-caps px-2 py-0.5 rounded ${
                          isCurrent ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          Gen {ancestor.generation}
                        </span>
                        <div>
                          <div className={`serif font-bold text-base ${isCurrent ? 'text-white' : 'text-[#1a1a1a]'}`}>
                            {ancestor.fullName}
                          </div>
                          <div className={`text-xs ${isCurrent ? 'text-gray-300' : 'text-gray-500'}`}>
                            {ancestor.branchName || 'Mazid Khail Branch'}
                          </div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="label-caps px-2.5 py-1 bg-amber-500 text-black font-bold rounded">
                          Selected
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] hidden sm:inline mr-2">RECORD: {person.id}</span>
            {onDeletePerson && (
              <button
                onClick={() => onDeletePerson(person)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors shadow-2xs"
                title="Delete this person record"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
            {onEditPerson && (
              <button
                onClick={() => onEditPerson(person)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 text-xs font-bold transition-colors shadow-2xs"
                title="Edit this person record"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            Close Record
          </button>
        </div>

      </div>
    </div>
  );
};

