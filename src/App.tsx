/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Person, FamilyBranch } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PersonProfileModal } from './components/PersonProfileModal';
import { HomePage } from './pages/HomePage';
import { FamilyTreePage } from './pages/FamilyTreePage';
import { PeopleDirectoryPage } from './pages/PeopleDirectoryPage';
import { FamilyBranchesPage } from './pages/FamilyBranchesPage';
import { FamilyChatPage } from './pages/FamilyChatPage';
import { AdminPage } from './pages/AdminPage';
import { PdfExportModal } from './components/PdfExportModal';
import { InstallModal } from './components/InstallModal';
import { Search, X, Loader2, RefreshCw, Trash2 } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'tree' | 'people' | 'branches' | 'chat' | 'admin'>('home');
  const [people, setPeople] = useState<Person[]>([]);
  const [branches, setBranches] = useState<FamilyBranch[]>([]);
  const [personToDeleteGlobal, setPersonToDeleteGlobal] = useState<Person | null>(null);
  const [isDeletingGlobal, setIsDeletingGlobal] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPeople: 0,
    totalRelationships: 0,
    totalBranches: 0,
    knownLiving: 0,
    knownDeceased: 0,
    maxGeneration: 1,
  });
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedPersonIdForTree, setSelectedPersonIdForTree] = useState<string | null>(null);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search Dialog state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [quickQuery, setQuickQuery] = useState<string>('');

  // Centralized Navigation Handler with Browser History integration
  const handleNavigate = (
    page: 'home' | 'tree' | 'people' | 'branches' | 'chat' | 'admin',
    pushHistory = true
  ) => {
    if (page === currentPage) return;
    if (pushHistory) {
      const url = page === 'home' ? window.location.pathname : `?page=${page}`;
      window.history.pushState({ page, type: 'page' }, '', url);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPerson = (person: Person | null, pushHistory = true) => {
    setSelectedPerson(person);
    if (person && pushHistory) {
      window.history.pushState({ modal: 'person', personId: person.id, page: currentPage }, '', `?person=${person.id}`);
    }
  };

  const handleClosePerson = () => {
    setSelectedPerson(null);
    const params = new URLSearchParams(window.location.search);
    if (params.has('person')) {
      params.delete('person');
      const newSearch = params.toString() ? `?${params.toString()}` : (currentPage === 'home' ? window.location.pathname : `?page=${currentPage}`);
      window.history.replaceState({ page: currentPage, type: 'page' }, '', newSearch);
    }
  };

  const handleToggleSearch = (open: boolean, pushHistory = true) => {
    setIsSearchOpen(open);
    if (!open) setQuickQuery('');
    if (open && pushHistory) {
      window.history.pushState({ modal: 'search', page: currentPage }, '', window.location.href);
    }
  };

  const handleTogglePdfModal = (open: boolean, pushHistory = true) => {
    setIsPdfModalOpen(open);
    if (open && pushHistory) {
      window.history.pushState({ modal: 'pdf', page: currentPage }, '', window.location.href);
    }
  };

  const handleToggleInstallModal = (open: boolean, pushHistory = true) => {
    setIsInstallModalOpen(open);
    if (open && pushHistory) {
      window.history.pushState({ modal: 'install', page: currentPage }, '', window.location.href);
    }
  };

  // Listen to mobile / browser back button (popstate)
  useEffect(() => {
    // Check initial URL parameters on first load
    const params = new URLSearchParams(window.location.search);
    const initialPage = params.get('page') as any;
    if (['home', 'tree', 'people', 'branches', 'chat', 'admin'].includes(initialPage)) {
      setCurrentPage(initialPage);
    }

    // Ensure baseline history entry so back button always stays inside the app
    if (!window.history.state) {
      window.history.replaceState(
        { page: initialPage || 'home', type: 'page' },
        '',
        window.location.href
      );
    }

    const handlePopState = (event: PopStateEvent) => {
      // 1. If any modal is currently open, close it first without leaving the page
      if (selectedPerson) {
        setSelectedPerson(null);
        return;
      }
      if (isSearchOpen) {
        setIsSearchOpen(false);
        setQuickQuery('');
        return;
      }
      if (isPdfModalOpen) {
        setIsPdfModalOpen(false);
        return;
      }
      if (isInstallModalOpen) {
        setIsInstallModalOpen(false);
        return;
      }
      if (personToDeleteGlobal) {
        setPersonToDeleteGlobal(null);
        return;
      }

      // 2. Otherwise navigate to the page in history state, or fallback to 'home'
      const state = event.state;
      if (state && state.page && ['home', 'tree', 'people', 'branches', 'chat', 'admin'].includes(state.page)) {
        setCurrentPage(state.page);
      } else {
        // If user was on a subpage (e.g. chat, tree, people, etc.) and backed to root, go to home
        setCurrentPage('home');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedPerson, isSearchOpen, isPdfModalOpen, isInstallModalOpen, personToDeleteGlobal]);

  // Open initial person if specified in URL query
  useEffect(() => {
    if (people.length > 0 && !selectedPerson) {
      const params = new URLSearchParams(window.location.search);
      const personId = params.get('person');
      if (personId) {
        const found = people.find((p) => p.id === personId);
        if (found) {
          setSelectedPerson(found);
        }
      }
    }
  }, [people]);

  // Handle PWA installation prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.log('Install prompt error:', err);
      }
    }
  };

  const loadData = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const data = await api.getDatabase();
      setPeople(data.people || []);
      setBranches(data.branches || []);
      if (data.stats) setStats(data.stats);
      if (data.lastUpdated) setLastUpdated(data.lastUpdated);

      // Check if current selected person was deleted or updated
      setSelectedPerson((prev) => {
        if (!prev) return null;
        const exists = (data.people || []).find((p) => p.id === prev.id);
        return exists || null;
      });

      const authed = await api.checkAuth();
      setIsAdmin(authed);
    } catch (err: any) {
      console.error('Failed to load family database:', err);
      setError(err.message || 'Failed to connect to database server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const handleDeletePersonGlobal = (person: Person) => {
    setPersonToDeleteGlobal(person);
  };

  const executeDeleteGlobal = async () => {
    if (!personToDeleteGlobal) return;
    setIsDeletingGlobal(true);
    try {
      await api.deletePerson(personToDeleteGlobal.id);
      setSelectedPerson(null);
      if (selectedPersonIdForTree === personToDeleteGlobal.id) {
        setSelectedPersonIdForTree(null);
      }
      setPersonToDeleteGlobal(null);
      await loadData(false);
    } catch (err: any) {
      alert(err.message || 'Failed to delete person.');
    } finally {
      setIsDeletingGlobal(false);
    }
  };

  const handleSelectPersonById = (id: string) => {
    const p = people.find((item) => item.id === id);
    if (p) handleSelectPerson(p);
  };

  const handleFocusInTree = (personId: string) => {
    setSelectedPersonIdForTree(personId);
    handleNavigate('tree');
  };

  // Quick Search Results
  const quickResults = React.useMemo(() => {
    if (!quickQuery.trim()) return [];
    const q = quickQuery.toLowerCase().trim();
    return people.filter((p) => {
      const father = people.find((f) => f.id === p.fatherId);
      return (
        p.fullName.toLowerCase().includes(q) ||
        (father && father.fullName.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q))
      );
    }).slice(0, 10);
  }, [people, quickQuery]);

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#1a1a1a] font-sans selection:bg-[#1a1a1a] selection:text-white flex flex-col justify-between">
      
      <div>
        {/* Top Navigation (Hidden on Chat page for full-screen experience) */}
        {currentPage !== 'chat' && (
          <Header
            currentPage={currentPage}
            onNavigate={(page) => handleNavigate(page)}
            isAdmin={isAdmin}
            onSearchClick={() => handleToggleSearch(true)}
            onOpenPdfModal={() => handleTogglePdfModal(true)}
            onOpenInstallModal={() => handleToggleInstallModal(true)}
          />
        )}

        {/* Main Content Area */}
        <main className={currentPage === 'chat' ? 'w-full h-screen p-0 m-0 overflow-hidden' : 'max-w-7xl mx-auto px-4 sm:px-8'}>
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <Loader2 className="w-8 h-8 text-[#1a1a1a] animate-spin" />
              <p className="label-caps">
                Accessing Khan Family Archive Records...
              </p>
            </div>
          ) : error ? (
            <div className="my-12 p-8 rounded-lg bg-white border border-red-200 text-center max-w-xl mx-auto space-y-4 shadow-sm">
              <h3 className="serif text-xl font-bold text-red-900">
                Database Connection Failure
              </h3>
              <p className="text-xs text-gray-600">{error}</p>
              <button
                onClick={() => loadData(true)}
                className="px-6 py-2.5 rounded bg-[#1a1a1a] text-white font-bold text-xs hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : (
            <>
              {currentPage === 'home' && (
                <HomePage
                  stats={stats}
                  branches={branches}
                  people={people}
                  isAdmin={isAdmin}
                  onNavigate={(page) => handleNavigate(page)}
                  onSelectPerson={(p) => handleSelectPerson(p)}
                  onSearchClick={() => handleToggleSearch(true)}
                  onOpenPdfModal={() => handleTogglePdfModal(true)}
                  onOpenInstallModal={() => handleToggleInstallModal(true)}
                  deferredPrompt={deferredPrompt}
                  onInstallApp={handleInstallApp}
                />
              )}

              {currentPage === 'tree' && (
                <FamilyTreePage
                  people={people}
                  branches={branches}
                  onSelectPerson={(p) => handleSelectPerson(p)}
                  selectedPersonId={selectedPersonIdForTree}
                  onClearSelectedPerson={() => setSelectedPersonIdForTree(null)}
                />
              )}

              {currentPage === 'people' && (
                <PeopleDirectoryPage
                  people={people}
                  branches={branches}
                  onSelectPerson={(p) => handleSelectPerson(p)}
                  onFocusInTree={handleFocusInTree}
                  onDeletePerson={isAdmin ? handleDeletePersonGlobal : undefined}
                  isAdmin={isAdmin}
                />
              )}

              {currentPage === 'branches' && (
                <FamilyBranchesPage
                  branches={branches}
                  people={people}
                  onSelectPerson={(p) => handleSelectPerson(p)}
                  onFocusInTree={handleFocusInTree}
                />
              )}

              {currentPage === 'chat' && (
                <FamilyChatPage
                  branches={branches}
                  isAdmin={isAdmin}
                  onNavigate={(page) => handleNavigate(page)}
                  onRefreshGlobal={() => loadData(false)}
                />
              )}

              {currentPage === 'admin' && (
                <AdminPage
                  people={people}
                  branches={branches}
                  onRefreshData={loadData}
                  isAdmin={isAdmin}
                  setIsAdmin={setIsAdmin}
                  onSelectPerson={(p) => handleSelectPerson(p)}
                  onFocusInTree={handleFocusInTree}
                  onNavigate={(page) => handleNavigate(page)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Footer (Hidden on Chat page for clean full-screen chat experience) */}
      {currentPage !== 'chat' && (
        <Footer
          onNavigate={(page) => handleNavigate(page)}
          lastUpdated={lastUpdated}
        />
      )}

      {/* Person Profile Modal */}
      <PersonProfileModal
        person={selectedPerson}
        people={people}
        isAdmin={isAdmin}
        onClose={handleClosePerson}
        onSelectPerson={handleSelectPersonById}
        onFocusInTree={handleFocusInTree}
        onDeletePerson={handleDeletePersonGlobal}
        onEditPerson={(p) => {
          handleClosePerson();
          handleNavigate('admin');
        }}
      />

      {/* Quick Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl bg-[#fcfaf7] border border-black/10 rounded-lg shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-[#1a1a1a]" />
                <input
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder="Search ancestors, parents, notes..."
                  autoFocus
                  className="w-full bg-transparent text-[#1a1a1a] placeholder-gray-400 focus:outline-none text-sm"
                />
              </div>
              <button
                onClick={() => handleToggleSearch(false)}
                className="p-1 text-gray-400 hover:text-[#1a1a1a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Results */}
            <div className="max-h-80 overflow-y-auto space-y-1">
              {quickResults.map((p) => {
                const father = people.find((f) => f.id === p.fatherId);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      handleSelectPerson(p);
                      handleToggleSearch(false);
                    }}
                    className="w-full p-3 rounded bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-between text-left transition-colors"
                  >
                    <div>
                      <div className="serif font-bold text-[#1a1a1a] text-sm">{p.fullName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {father ? `Father: ${father.fullName} • ` : ''}Generation {p.generation}
                      </div>
                    </div>
                    <span className="text-xs text-[#c2410c] font-medium">View Record →</span>
                  </button>
                );
              })}

              {quickQuery.trim() && quickResults.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-500 italic">
                  No ancestor records matched "{quickQuery}"
                </div>
              )}

              {!quickQuery.trim() && (
                <div className="text-center py-6 text-xs text-gray-400 uppercase tracking-wider">
                  Type to query the Khan family archive
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Delete Confirmation Modal */}
      {personToDeleteGlobal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white text-[#1a1a1a] rounded-lg border border-gray-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Delete Person Record?</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 bg-red-50/50 p-3 rounded border border-red-100">
              Are you sure you want to delete <strong className="text-black">{personToDeleteGlobal.fullName}</strong>? This will permanently remove their record and clean up associated family links.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingGlobal}
                onClick={() => setPersonToDeleteGlobal(null)}
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingGlobal}
                onClick={executeDeleteGlobal}
                className="flex items-center gap-2 px-5 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingGlobal ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF & Book Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => handleTogglePdfModal(false)}
        people={people}
        branches={branches}
        stats={stats}
      />

      {/* 1-Tap Mobile App Install Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => handleToggleInstallModal(false)}
        deferredPrompt={deferredPrompt}
        onInstallSuccess={() => setDeferredPrompt(null)}
      />

    </div>
  );
}
