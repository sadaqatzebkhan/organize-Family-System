import React, { useState, useEffect, useMemo } from 'react';
import { Person, FamilyBranch, AuditLog, ImportPreviewResult } from '../types';
import { api } from '../services/api';
import {
  ShieldCheck,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Key,
  Users,
  GitFork,
  FileText,
  X,
  Search,
  Filter,
  UserPlus,
  Eye,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Link,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
  Building,
  Calendar,
  MapPin,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import { validateRelationship } from '../lib/utils';

interface AdminPageProps {
  people: Person[];
  branches: FamilyBranch[];
  onRefreshData: () => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onSelectPerson?: (person: Person) => void;
  onFocusInTree?: (personId: string) => void;
  onNavigate?: (page: 'home' | 'tree' | 'people' | 'branches' | 'admin') => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  people,
  branches,
  onRefreshData,
  isAdmin,
  setIsAdmin,
  onSelectPerson,
  onFocusInTree,
  onNavigate,
}) => {
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'people' | 'branches' | 'tree_links' | 'import_export' | 'audit_logs' | 'settings'>('people');

  // Search & Filter state for People Table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranchId, setFilterBranchId] = useState<string>('all');
  const [filterGen, setFilterGen] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'alive' | 'deceased' | 'unknown'>('all');
  const [sortBy, setSortBy] = useState<'generation' | 'name' | 'recent'>('generation');

  // People Form modal state
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [personForm, setPersonForm] = useState<Partial<Person>>({
    fullName: '',
    fatherId: '',
    birthDate: '',
    deathDate: '',
    aliveStatus: 'unknown',
    photograph: '',
    biography: '',
    notes: '',
    occupation: '',
    location: '',
    branchId: '',
    generation: 1,
  });

  // Branch Form modal / state
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<FamilyBranch | null>(null);
  const [branchForm, setBranchForm] = useState<{ name: string; description: string; patriarchPersonId?: string }>({
    name: '',
    description: '',
    patriarchPersonId: '',
  });
  const [selectedBranchFilterForMembers, setSelectedBranchFilterForMembers] = useState<string | null>(null);

  // Quick Relationship Linker modal
  const [quickLinkPerson, setQuickLinkPerson] = useState<Person | null>(null);
  const [quickLinkFatherId, setQuickLinkFatherId] = useState<string>('');

  // Import state
  const [importPreview, setImportPreview] = useState<ImportPreviewResult | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Settings state
  const [newPassword, setNewPassword] = useState('');
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Status/Feedback message
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Deletion Modal states
  const [confirmDeletePerson, setConfirmDeletePerson] = useState<Person | null>(null);
  const [confirmDeleteBranch, setConfirmDeleteBranch] = useState<FamilyBranch | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isAdmin && activeTab === 'audit_logs') {
      fetchAuditLogs();
    }
  }, [isAdmin, activeTab]);

  const fetchAuditLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await api.login(password);
      if (res.success) {
        setIsAdmin(true);
        setPassword('');
        onRefreshData();
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid password.');
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAdmin(false);
  };

  // Helper: Open Add Person with prefilled father
  const handleOpenAddChild = (parentPerson: Person) => {
    setEditingPerson(null);
    const parentGen = parentPerson.generation || 1;
    setPersonForm({
      fullName: '',
      fatherId: parentPerson.id,
      birthDate: '',
      deathDate: '',
      aliveStatus: 'alive',
      photograph: '',
      biography: '',
      notes: '',
      occupation: '',
      location: '',
      branchId: parentPerson.branchId || '',
      generation: parentGen + 1,
    });
    setIsPersonModalOpen(true);
  };

  // Helper: Open Add Sibling with same father
  const handleOpenAddSibling = (person: Person) => {
    setEditingPerson(null);
    setPersonForm({
      fullName: '',
      fatherId: person.fatherId || '',
      birthDate: '',
      deathDate: '',
      aliveStatus: 'alive',
      photograph: '',
      biography: '',
      notes: '',
      occupation: '',
      location: '',
      branchId: person.branchId || '',
      generation: person.generation || 1,
    });
    setIsPersonModalOpen(true);
  };

  // Open Edit Person Form
  const handleOpenPersonForm = (person?: Person) => {
    if (person) {
      setEditingPerson(person);
      setPersonForm({
        fullName: person.fullName,
        fatherId: person.fatherId || '',
        birthDate: person.birthDate || '',
        deathDate: person.deathDate || '',
        aliveStatus: person.aliveStatus || 'unknown',
        photograph: person.photograph || '',
        biography: person.biography || '',
        notes: person.notes || '',
        occupation: person.occupation || '',
        location: person.location || '',
        branchId: person.branchId || '',
        generation: person.generation || 1,
      });
    } else {
      setEditingPerson(null);
      setPersonForm({
        fullName: '',
        fatherId: '',
        birthDate: '',
        deathDate: '',
        aliveStatus: 'unknown',
        photograph: '',
        biography: '',
        notes: '',
        occupation: '',
        location: '',
        branchId: '',
        generation: 1,
      });
    }
    setIsPersonModalOpen(true);
  };

  // Save Person (Add or Edit)
  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!personForm.fullName || !personForm.fullName.trim()) {
      setStatusMsg({ type: 'error', text: 'Full name is required (نام درج کرنا لازمی ہے)' });
      return;
    }

    // Pre-save relationship validation if father is selected
    if (personForm.fatherId) {
      if (editingPerson && personForm.fatherId !== editingPerson.fatherId) {
        const val = validateRelationship(personForm.fatherId, editingPerson.id, people);
        if (!val.valid) {
          setStatusMsg({ type: 'error', text: val.error || 'Invalid relationship.' });
          return;
        }
      }
    }

    // Automatically calculate generation based on father if not explicitly specified
    let targetGen = personForm.generation;
    if (personForm.fatherId) {
      const father = people.find((p) => p.id === personForm.fatherId);
      if (father) {
        targetGen = (father.generation || 1) + 1;
      }
    } else {
      targetGen = 1; // Gen 1 for root founders
    }

    const payload = {
      ...personForm,
      generation: targetGen,
    };

    try {
      if (editingPerson) {
        await api.updatePerson(editingPerson.id, payload);
        setStatusMsg({ type: 'success', text: `کامیابی: "${personForm.fullName}" کا ریکارڈ اپڈیٹ ہو گیا۔` });
      } else {
        await api.createPerson(payload);
        setStatusMsg({ type: 'success', text: `کامیابی: نیا فرد "${personForm.fullName}" ڈیٹا بیس میں شامل ہو گیا۔` });
      }
      setIsPersonModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save person record.' });
    }
  };

  // Delete Person
  const handleDeletePerson = (person: Person) => {
    setConfirmDeletePerson(person);
  };

  const executeDeletePerson = async () => {
    if (!confirmDeletePerson) return;
    setIsDeleting(true);
    try {
      await api.deletePerson(confirmDeletePerson.id);
      setIsPersonModalOpen(false);
      setStatusMsg({ type: 'success', text: `ریکارڈ کامیابی کے ساتھ حذف کر دیا گیا: ${confirmDeletePerson.fullName}` });
      setConfirmDeletePerson(null);
      await onRefreshData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete record.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Branch CRUD
  const handleOpenBranchModal = (branch?: FamilyBranch) => {
    if (branch) {
      setEditingBranch(branch);
      setBranchForm({
        name: branch.name,
        description: branch.description || '',
        patriarchPersonId: branch.patriarchPersonId || '',
      });
    } else {
      setEditingBranch(null);
      setBranchForm({ name: '', description: '', patriarchPersonId: '' });
    }
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim()) return;
    try {
      if (editingBranch) {
        await api.updateBranch(editingBranch.id, branchForm);
        setStatusMsg({ type: 'success', text: `شاخ "${branchForm.name}" اپڈیٹ ہو گئی۔` });
      } else {
        await api.createBranch(branchForm);
        setStatusMsg({ type: 'success', text: `نئی شاخ "${branchForm.name}" بنا دی گئی۔` });
      }
      setIsBranchModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save branch.' });
    }
  };

  const handleDeleteBranch = (branch: FamilyBranch) => {
    setConfirmDeleteBranch(branch);
  };

  const executeDeleteBranch = async () => {
    if (!confirmDeleteBranch) return;
    setIsDeleting(true);
    try {
      await api.deleteBranch(confirmDeleteBranch.id);
      setStatusMsg({ type: 'success', text: `شاخ "${confirmDeleteBranch.name}" حذف ہو گئی۔` });
      setConfirmDeleteBranch(null);
      await onRefreshData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete branch.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Father Re-linking
  const handleQuickLinkSave = async () => {
    if (!quickLinkPerson) return;
    try {
      await api.updatePerson(quickLinkPerson.id, {
        fatherId: quickLinkFatherId || null,
      });
      setStatusMsg({ type: 'success', text: `${quickLinkPerson.fullName} کا والد کامیابی سے منسلک ہو گیا۔` });
      setQuickLinkPerson(null);
      onRefreshData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to link father.' });
    }
  };

  // Import Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;

      try {
        let items: any[] = [];
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          items = Array.isArray(parsed) ? parsed : parsed.people || [];
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n').filter((l) => l.trim());
          const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
            const obj: any = {};
            headers.forEach((h, idx) => {
              obj[h] = cols[idx];
            });
            items.push(obj);
          }
        }

        const preview = await api.previewImport(items);
        setImportPreview(preview);
      } catch (err: any) {
        setStatusMsg({ type: 'error', text: 'Error parsing import file: ' + err.message });
      }
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (!importPreview || !importPreview.items) return;
    try {
      const itemsToImport = importPreview.items.map((i) => i.person);
      const res = await api.commitImport(itemsToImport, skipDuplicates);
      setStatusMsg({ type: 'success', text: `کامیابی: ${res.addedCount} ریکارڈز امپورٹ ہو گئے۔` });
      setImportPreview(null);
      onRefreshData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to commit import.' });
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setSettingsMessage({ type: 'error', text: 'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔' });
      return;
    }
    try {
      await api.updateSettings({ newPassword });
      setSettingsMessage({ type: 'success', text: 'پاس ورڈ کامیابی سے تبدیل ہو گیا!' });
      setNewPassword('');
    } catch (err: any) {
      setSettingsMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    }
  };

  const handleResetToSeed = async () => {
    if (!confirm('خبردار: کیا آپ واقعی مکمل ڈیٹا بیس کو ابتدائی بیج (Original PDF Family History) پر ری سیٹ کرنا چاہتے ہیں؟ تمام تر نئی تبدیلیاں ختم ہو جائیں گی۔')) {
      return;
    }
    try {
      await api.updateSettings({ resetToSeed: true });
      setStatusMsg({ type: 'success', text: 'ڈیٹا بیس ابتدائی خاندانی ریکارڈ پر ری سیٹ کر دیا گیا۔' });
      onRefreshData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to reset database.' });
    }
  };

  // Filter and Sort People Table
  const filteredPeople = useMemo(() => {
    return people
      .filter((p) => {
        const father = people.find((f) => f.id === p.fatherId);
        const matchesSearch =
          !searchQuery.trim() ||
          p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (father && father.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.occupation && p.occupation.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesBranch = filterBranchId === 'all' || p.branchId === filterBranchId;
        const matchesGen = filterGen === 'all' || String(p.generation) === filterGen;
        const matchesStatus = filterStatus === 'all' || p.aliveStatus === filterStatus;

        return matchesSearch && matchesBranch && matchesGen && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'generation') {
          if (a.generation !== b.generation) return a.generation - b.generation;
          return a.fullName.localeCompare(b.fullName);
        }
        if (sortBy === 'name') {
          return a.fullName.localeCompare(b.fullName);
        }
        if (sortBy === 'recent') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        return 0;
      });
  }, [people, searchQuery, filterBranchId, filterGen, filterStatus, sortBy]);

  // Calculations for Stats
  const totalGenerations = useMemo(() => Math.max(1, ...people.map((p) => p.generation || 1)), [people]);
  const totalLiving = useMemo(() => people.filter((p) => p.aliveStatus === 'alive').length, [people]);
  const totalDeceased = useMemo(() => people.filter((p) => p.aliveStatus === 'deceased').length, [people]);
  const unlinkedPeople = useMemo(() => people.filter((p) => !p.fatherId && p.generation > 1), [people]);

  // If Not Logged In
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 sm:p-8 rounded-xl bg-white border border-gray-200 shadow-xl text-[#1a1a1a]">
        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#1a1a1a] text-white serif font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7 text-[#c2410c]" />
          </div>
          <h2 className="serif text-2xl font-bold text-[#1a1a1a]">
            ایڈمن لاگ ان (Admin Portal)
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            خاندانِ مزید خیل کا شجرہ نسب اور مکمل ڈیٹا بیس مینیج، ایڈٹ، ڈیلیٹ یا نیا ریکارڈ شامل کرنے کے لیے ایڈمن پاس ورڈ درج کریں۔
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              ایڈمن پاس ورڈ (Admin Password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="پاس ورڈ درج کریں (Enter password)"
              className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-4 py-2.5 text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-[#c2410c] text-xs font-mono"
              required
            />
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            id="admin-login-submit-button"
            className="w-full py-3 rounded-lg bg-[#1a1a1a] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#c2410c]" />
            <span>لاگ ان کریں اور ڈیش بورڈ کھولیں</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 animate-fade-in text-[#1a1a1a]">
      
      {/* Top Banner with Stats & Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] text-white serif font-bold text-xl flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-[#c2410c]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="serif text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                  ایڈمن کنٹرول پینل (Admin Control Center)
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  Active Session
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                شجرہ نسب، تمام افراد، شاخیں، اور خاندانی روابط کا مکمل انتظام (Add, Edit, Delete, Link)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleOpenPersonForm()}
              id="admin-add-person-quick-btn"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#c2410c] hover:bg-[#ea580c] text-white text-xs font-bold transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>نیا فرد شامل کریں (Add Person)</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>لاگ آؤٹ</span>
            </button>
          </div>
        </div>

        {/* Live Database Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-gray-100 text-xs">
          <div className="p-2.5 rounded-lg bg-[#fcfaf7] border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">کل افراد (Members)</span>
              <span className="font-bold text-sm text-[#1a1a1a]">{people.length} افراد</span>
            </div>
            <Users className="w-5 h-5 text-[#c2410c]/80" />
          </div>

          <div className="p-2.5 rounded-lg bg-[#fcfaf7] border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">نسلیں (Generations)</span>
              <span className="font-bold text-sm text-[#1a1a1a]">{totalGenerations} نسلیں (G1-G{totalGenerations})</span>
            </div>
            <GitBranch className="w-5 h-5 text-amber-600/80" />
          </div>

          <div className="p-2.5 rounded-lg bg-[#fcfaf7] border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">شاخیں (Branches)</span>
              <span className="font-bold text-sm text-[#1a1a1a]">{branches.length} شاخیں</span>
            </div>
            <GitFork className="w-5 h-5 text-indigo-600/80" />
          </div>

          <div className="p-2.5 rounded-lg bg-[#fcfaf7] border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">حیات / وفات (Status)</span>
              <span className="font-bold text-sm text-[#1a1a1a]">{totalLiving} حیات / {totalDeceased} وفات</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600/80" />
          </div>

          <div className="p-2.5 rounded-lg bg-[#fcfaf7] border border-gray-200 flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">غیر مربوط (Unlinked)</span>
              <span className={`font-bold text-sm ${unlinkedPeople.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {unlinkedPeople.length} افراد
              </span>
            </div>
            <Link className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Global Status Notification Banner */}
      {statusMsg && (
        <div
          className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs animate-fade-in ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
              : 'bg-red-50 text-red-950 border-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="p-1 text-gray-500 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center border-b border-gray-200 bg-white p-1 rounded-xl gap-1 overflow-x-auto shadow-2xs">
        <button
          onClick={() => setActiveTab('people')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'people' ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-100'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#c2410c]" />
          <span>افراد کا انتظام (People - {people.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'branches' ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-100'
          }`}
        >
          <GitFork className="w-3.5 h-3.5 text-[#c2410c]" />
          <span>شاخوں کا انتظام (Branches - {branches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tree_links')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'tree_links' ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-100'
          }`}
        >
          <Link className="w-3.5 h-3.5 text-[#c2410c]" />
          <span>شجرہ روابط فکسر (Relationship Fixer)</span>
        </button>

        <button
          onClick={() => setActiveTab('import_export')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'import_export' ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-100'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-[#c2410c]" />
          <span>امپورٹ و ایکسپورٹ (Backup & Import)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'audit_logs' ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-[#c2410c]" />
          <span>تبدیلیوں کی تاریخ (Audit Logs)</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'settings' ? 'bg-[#1a1a1a] text-white shadow-xs' : 'text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-100'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-[#c2410c]" />
          <span>سیٹنگز و پاس ورڈ (Settings)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PEOPLE CRUD MANAGEMENT                                              */}
      {/* ========================================================================= */}
      {activeTab === 'people' && (
        <div className="space-y-4">
          
          {/* Controls Bar: Search, Filters, Add Person */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              
              {/* Search Box */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="تلاش کریں: نام، ولدیت، پیشہ، مقام، نوٹس..."
                  className="w-full pl-9 pr-8 py-2 bg-[#fcfaf7] border border-gray-300 rounded-lg text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters Group */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                
                {/* Branch Filter */}
                <select
                  value={filterBranchId}
                  onChange={(e) => setFilterBranchId(e.target.value)}
                  className="bg-[#fcfaf7] border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                >
                  <option value="all">تمام شاخیں (All Branches)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>

                {/* Generation Filter */}
                <select
                  value={filterGen}
                  onChange={(e) => setFilterGen(e.target.value)}
                  className="bg-[#fcfaf7] border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                >
                  <option value="all">تمام نسلیں (All Gen)</option>
                  {Array.from({ length: totalGenerations }).map((_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      نسل G{i + 1}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-[#fcfaf7] border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                >
                  <option value="all">تمام کیفیت (Status)</option>
                  <option value="alive">حیات (Living)</option>
                  <option value="deceased">وفات (Deceased)</option>
                  <option value="unknown">نامعلوم (Unknown)</option>
                </select>

                {/* Sort Option */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#fcfaf7] border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                >
                  <option value="generation">ترتیب: نسل (Generation)</option>
                  <option value="name">ترتیب: نام (Name A-Z)</option>
                  <option value="recent">ترتیب: حالیہ (Recently Added)</option>
                </select>

                {/* Clear Filters Button */}
                {(searchQuery || filterBranchId !== 'all' || filterGen !== 'all' || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterBranchId('all');
                      setFilterGen('all');
                      setFilterStatus('all');
                    }}
                    className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                  >
                    ری سیٹ فلٹر
                  </button>
                )}

                {/* Add Person Button */}
                <button
                  onClick={() => handleOpenPersonForm()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#333333] text-white font-bold text-xs shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#c2410c]" />
                  <span>نیا اندراج</span>
                </button>
              </div>

            </div>

            <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
              <span>دستیاب نتائج: <strong>{filteredPeople.length}</strong> از <strong>{people.length}</strong> افراد</span>
              <span>ہر فرد کے سامنے <strong>ترمیم (Edit)</strong>، <strong>اولاد شامل کریں (+ Child)</strong>، یا <strong>حذف (Delete)</strong> کے آپشنز موجود ہیں۔</span>
            </div>
          </div>

          {/* People Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1a1a1a]">
                <thead className="bg-[#1a1a1a] text-white border-b border-gray-800 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">فرد کا نام (Full Name)</th>
                    <th className="p-3">والد / ولدیت (Father)</th>
                    <th className="p-3 text-center">نسل (Gen)</th>
                    <th className="p-3">شاخ (Branch)</th>
                    <th className="p-3 text-center">اولاد (Children)</th>
                    <th className="p-3 text-center">کیفیت (Status)</th>
                    <th className="p-3 text-right">انتظام / ایکشنز (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPeople.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        کوئی ریکارڈ نہیں ملا۔ سرچ یا فلٹر تبدیل کریں۔
                      </td>
                    </tr>
                  ) : (
                    filteredPeople.map((person) => {
                      const father = people.find((p) => p.id === person.fatherId);
                      const children = people.filter((p) => p.fatherId === person.id || p.motherId === person.id);

                      return (
                        <tr key={person.id} className="hover:bg-amber-50/40 transition-colors">
                          
                          {/* Name & Avatar */}
                          <td className="p-3 font-semibold">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 text-[#c2410c] serif font-bold text-xs flex items-center justify-center shrink-0">
                                {person.fullName.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[#1a1a1a] text-xs sm:text-sm">
                                    {person.fullName}
                                  </span>
                                  {person.generation === 1 && (
                                    <span className="text-[9px] font-bold bg-[#1a1a1a] text-orange-300 px-1 py-0.2 rounded">
                                      بانی (Gen 1)
                                    </span>
                                  )}
                                </div>
                                {person.occupation && (
                                  <p className="text-[10px] text-gray-500 font-normal">{person.occupation}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Father */}
                          <td className="p-3 text-gray-700">
                            {father ? (
                              <button
                                onClick={() => handleOpenPersonForm(father)}
                                className="hover:text-[#c2410c] hover:underline font-medium text-left"
                                title="والد کا ریکارڈ دیکھیں"
                              >
                                {father.fullName}
                              </button>
                            ) : (
                              <span className="text-gray-400 italic text-[11px]">
                                {person.generation === 1 ? 'بانی شاخ (Root)' : '— غیر منسلک'}
                              </span>
                            )}
                          </td>

                          {/* Generation */}
                          <td className="p-3 text-center">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              G{person.generation}
                            </span>
                          </td>

                          {/* Branch */}
                          <td className="p-3 text-gray-700 text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-[10px] font-medium">
                              {person.branchName || 'Mazid Khail'}
                            </span>
                          </td>

                          {/* Children */}
                          <td className="p-3 text-center">
                            {children.length > 0 ? (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                                {children.length} اولاد
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[10px]">0</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="p-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                person.aliveStatus === 'alive'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : person.aliveStatus === 'deceased'
                                  ? 'bg-gray-200 text-gray-800'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {person.aliveStatus === 'alive' ? 'حیات' : person.aliveStatus === 'deceased' ? 'وفات' : 'نامعلوم'}
                            </span>
                          </td>

                          {/* Actions Suite */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              
                              {/* Edit Button */}
                              <button
                                onClick={() => handleOpenPersonForm(person)}
                                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
                                title="ترمیم کریں (Edit Person)"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Add Child Button */}
                              <button
                                onClick={() => handleOpenAddChild(person)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors text-[10px] font-bold"
                                title="اس فرد کی اولاد شامل کریں (+ Child)"
                              >
                                <Plus className="w-3 h-3" />
                                <span>اولاد</span>
                              </button>

                              {/* Add Sibling Button */}
                              {person.fatherId && (
                                <button
                                  onClick={() => handleOpenAddSibling(person)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors text-[10px] font-bold hidden sm:inline-flex"
                                  title="بھائی یا بہن شامل کریں (+ Sibling)"
                                >
                                  <span>+ بھائی</span>
                                </button>
                              )}

                              {/* View Profile */}
                              {onSelectPerson && (
                                <button
                                  onClick={() => onSelectPerson(person)}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors"
                                  title="پروفائل دیکھیں (View Profile)"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeletePerson(person)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                                title="حذف کریں (Delete Record)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BRANCH MANAGEMENT                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'branches' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Create Branch Box */}
          <div className="md:col-span-1 p-5 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="serif text-base font-bold text-[#1a1a1a]">
                {editingBranch ? 'شاخ میں ترمیم (Edit Branch)' : 'نئی شاخ بنائیں (Add Branch)'}
              </h3>
              {editingBranch && (
                <button
                  onClick={() => {
                    setEditingBranch(null);
                    setBranchForm({ name: '', description: '', patriarchPersonId: '' });
                  }}
                  className="text-xs text-gray-500 hover:text-black font-semibold"
                >
                  منسوخ
                </button>
              )}
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">شاخ کا نام (Branch Name) *</label>
                <input
                  type="text"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  placeholder="e.g. Saho Khan Branch / شاخ دور محمد خان"
                  className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">بانی یا سرپرست فرد (Patriarch / Founder)</label>
                <select
                  value={branchForm.patriarchPersonId || ''}
                  onChange={(e) => setBranchForm({ ...branchForm, patriarchPersonId: e.target.value })}
                  className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                >
                  <option value="">کوئی مخصوص بانی منتخب نہیں</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} (Gen {p.generation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">تفصیلات و سوانح (Description)</label>
                <textarea
                  value={branchForm.description}
                  onChange={(e) => setBranchForm({ ...branchForm, description: e.target.value })}
                  placeholder="شاخ کے بارے میں تاریخی معلومات اور کوائف..."
                  className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#c2410c] h-24"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                {editingBranch ? 'شاخ اپڈیٹ کریں (Update Branch)' : 'نئی شاخ محفوظ کریں (Save Branch)'}
              </button>
            </form>
          </div>

          {/* Existing Branches List */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="serif text-base font-bold text-[#1a1a1a]">
                موجودہ شاخیں (Existing Branches - {branches.length})
              </h3>
              <span className="text-xs text-gray-500">کسی بھی شاخ کے افراد دیکھنے کے لیے کلک کریں</span>
            </div>

            <div className="space-y-3">
              {branches.map((b) => {
                const members = people.filter((p) => p.branchId === b.id);
                const patriarch = people.find((p) => p.id === b.patriarchPersonId);
                const isSelected = selectedBranchFilterForMembers === b.id;

                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl bg-white border transition-all ${
                      isSelected ? 'border-[#c2410c] shadow-md ring-1 ring-[#c2410c]/20' : 'border-gray-200 shadow-2xs hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-[#1a1a1a]">{b.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            {members.length} افراد
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {b.description || 'کوئی تفصیل درج نہیں ہے۔'}
                        </p>
                        {patriarch && (
                          <div className="text-[11px] text-[#c2410c] font-semibold flex items-center gap-1">
                            <span>بانی / سرپرست:</span>
                            <span className="font-bold">{patriarch.fullName}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setSelectedBranchFilterForMembers(isSelected ? null : b.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            isSelected ? 'bg-[#c2410c] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {isSelected ? 'افراد چھپائیں' : 'افراد دیکھیں'}
                        </button>
                        <button
                          onClick={() => handleOpenBranchModal(b)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                          title="شاخ میں ترمیم کریں"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(b)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                          title="شاخ حذف کریں"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Members List */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 animate-fade-in">
                        <div className="text-xs font-bold text-gray-700">شاخ کے اراکین ({members.length}):</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                          {members.map((m) => (
                            <div
                              key={m.id}
                              className="p-2 rounded bg-[#fcfaf7] border border-gray-200 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold">{m.fullName}</span>
                                <span className="text-[10px] text-gray-500 block">G{m.generation}</span>
                              </div>
                              <button
                                onClick={() => handleOpenPersonForm(m)}
                                className="p-1 text-[#c2410c] hover:bg-orange-100 rounded"
                                title="ترمیم"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RELATIONSHIP FIXER / UNLINKED MEMBERS                               */}
      {/* ========================================================================= */}
      {activeTab === 'tree_links' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
          <div>
            <h3 className="serif text-lg font-bold text-[#1a1a1a]">
              شجرہ نسب روابط درست کریں (Relationship Fixer)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              یہاں وہ تمام افراد درج ہیں جن کی ولدیت یا خاندانی شجرہ کا رابطہ نامکمل ہے۔ آپ 1-کلک میں ان کا والد مقرر کر سکتے ہیں۔
            </p>
          </div>

          <div className="space-y-3">
            {unlinkedPeople.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-950">ماشاء اللہ! تمام اراکین شجرہ میں مکمل طور پر منسلک ہیں۔</h4>
                <p className="text-xs text-emerald-800">کوئی بھی فرد والد کے لنک کے بغیر موجود نہیں ہے۔</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {unlinkedPeople.map((person) => (
                  <div key={person.id} className="p-3.5 flex items-center justify-between gap-3 bg-amber-50/30">
                    <div>
                      <div className="font-bold text-sm text-[#1a1a1a] flex items-center gap-2">
                        <span>{person.fullName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                          G{person.generation}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        شاخ: {person.branchName || 'Mazid Khail'} | کوئی والد منسلک نہیں
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setQuickLinkPerson(person);
                          setQuickLinkFatherId('');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c2410c] hover:bg-[#ea580c] text-white text-xs font-bold transition-colors"
                      >
                        <Link className="w-3.5 h-3.5" />
                        <span>والد منسلک کریں</span>
                      </button>
                      <button
                        onClick={() => handleOpenPersonForm(person)}
                        className="p-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                        title="مکمل فارم کھولیں"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: IMPORT / EXPORT & BACKUP                                            */}
      {/* ========================================================================= */}
      {activeTab === 'import_export' && (
        <div className="space-y-6">
          
          {/* Export Section */}
          <div className="p-5 sm:p-6 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-3">
            <h3 className="serif text-lg font-bold text-[#1a1a1a]">
              ڈیٹا بیس بیک اپ ڈاؤن لوڈ کریں (Export Database Backup)
            </h3>
            <p className="text-xs text-gray-500">
              شجرہ نسب کا مکمل ریکارڈ محفوظ رکھنے کے لیے JSON یا ایکسل CSV فارمیٹ میں بیک اپ ڈاؤن لوڈ کریں۔
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href={api.getExportUrl('json')}
                download
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1a1a1a] text-white text-xs font-bold hover:bg-[#333333] transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-[#c2410c]" />
                <span>JSON بیک اپ ڈاؤن لوڈ کریں (Full Data)</span>
              </a>
              <a
                href={api.getExportUrl('csv')}
                download
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#fcfaf7] text-[#1a1a1a] border border-gray-300 text-xs font-bold hover:bg-gray-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>CSV / Excel شیٹ ڈاؤن لوڈ کریں</span>
              </a>
            </div>
          </div>

          {/* Import Section */}
          <div className="p-5 sm:p-6 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-4">
            <div>
              <h3 className="serif text-lg font-bold text-[#1a1a1a]">
                نیا ڈیٹا یا بیک اپ امپورٹ کریں (Import Data)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                JSON یا CSV فائل منتخب کریں۔ سسٹم خودکار طور پر ڈپلیکیٹ چیک کرے گا اور آپ کی تصدیق کے بعد ریکارڈ شامل کرے گا۔
              </p>
            </div>

            <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center bg-[#fcfaf7] hover:border-[#c2410c] transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <label className="cursor-pointer text-xs font-bold text-[#c2410c] hover:underline block">
                <span>فائل اپلوڈ کریں (Select JSON or CSV File)</span>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[10px] text-gray-400 mt-1 block">Supported formats: .json, .csv</span>
            </div>

            {/* Import Preview */}
            {importPreview && (
              <div className="p-4 rounded-xl bg-[#fcfaf7] border border-gray-200 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider">
                    امپورٹ پری ویو (Import Preview)
                  </h4>
                  <div className="flex gap-3 text-xs">
                    <span className="text-emerald-700 font-bold">صحیح: {importPreview.validCount}</span>
                    <span className="text-amber-700 font-bold">ڈپلیکیٹ: {importPreview.duplicateCount}</span>
                    <span className="text-red-700 font-bold">خراب: {importPreview.errorCount}</span>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 text-xs">
                  {importPreview.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        item.status === 'valid'
                          ? 'bg-white border-gray-200 text-[#1a1a1a]'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{item.person.fullName || 'Unnamed'}</div>
                        {item.duplicateReason && (
                          <div className="text-[10px] text-amber-700 mt-0.5">{item.duplicateReason}</div>
                        )}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold">{item.status}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 flex-wrap gap-2">
                  <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipDuplicates}
                      onChange={(e) => setSkipDuplicates(e.target.checked)}
                      className="rounded border-gray-300 text-[#c2410c] focus:ring-[#c2410c]"
                    />
                    <span>پہلے سے موجود ناموں کو چھوڑ دیں (Skip duplicates)</span>
                  </label>

                  <button
                    onClick={handleCommitImport}
                    className="px-5 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#333333] text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    امپورٹ کنفرم کریں اور ڈیٹا محفوظ کریں
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset to Original Seed Data */}
          <div className="p-5 rounded-xl bg-red-50/60 border border-red-200 space-y-2">
            <h4 className="font-bold text-xs text-red-900 uppercase tracking-wider">
              فیکٹری ری سیٹ (Restore Original PDF Seed Records)
            </h4>
            <p className="text-xs text-red-800">
              اگر ڈیٹا میں کوئی خرابی ہو جائے تو آپ ڈیٹا بیس کو شجرہ کی اصل اور بنیادی حالت پر ری سیٹ کر سکتے ہیں۔
            </p>
            <button
              onClick={handleResetToSeed}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
            >
              اصل شجرہ بیج پر ری سیٹ کریں (Reset Database)
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AUDIT LOGS                                                          */}
      {/* ========================================================================= */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="serif text-lg font-bold text-[#1a1a1a]">
                ایڈمن تبدیلیوں کی تاریخ (Audit Log History)
              </h3>
              <p className="text-xs text-gray-500">
                تمام اراکین کے اندراج، تبدیلی اور ڈیلیٹ کرنے کی مکمل ہسٹری
              </p>
            </div>
            <button
              onClick={fetchAuditLogs}
              disabled={isLoadingLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              <span>ریفریش</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs">
                ابھی تک کوئی لاگ ریکارڈ نہیں ملا۔
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-[#fcfaf7] border border-gray-200 text-xs flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-[#1a1a1a] flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-[#c2410c] text-[10px] font-bold">
                        {log.action}
                      </span>
                      <span>{log.details}</span>
                    </div>
                    {log.personName && (
                      <div className="text-gray-500 text-[11px]">متعلقہ فرد: <strong>{log.personName}</strong></div>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString('ur-PK', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SETTINGS & PASSWORD                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="max-w-xl space-y-6">
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-4">
            <h3 className="serif text-lg font-bold text-[#1a1a1a]">
              ایڈمن پاس ورڈ تبدیل کریں (Change Admin Password)
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">نیا پاس ورڈ (New Password)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="کم از کم 6 حروف کا پاس ورڈ درج کریں"
                  className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-4 py-2.5 text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                  required
                />
              </div>

              {settingsMessage && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold ${
                    settingsMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  {settingsMessage.text}
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                پاس ورڈ اپڈیٹ کریں
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT PERSON MODAL                                           */}
      {/* ========================================================================= */}
      {isPersonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white text-[#1a1a1a] rounded-xl border border-gray-300 p-5 sm:p-7 shadow-2xl space-y-4 my-4 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="serif text-lg sm:text-xl font-bold text-[#1a1a1a]">
                  {editingPerson ? `ترمیم: ${editingPerson.fullName}` : 'نیا خاندانی رکن شامل کریں (Add Member)'}
                </h3>
                <p className="text-xs text-gray-500">فرد کی تمام تر معلومات اور ولدیت کا درست اندراج کریں</p>
              </div>
              <button
                onClick={() => setIsPersonModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePerson} className="space-y-4 text-xs">
              
              {/* Full Name */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  پورا نام (Full Name) *
                </label>
                <input
                  type="text"
                  value={personForm.fullName || ''}
                  onChange={(e) => setPersonForm({ ...personForm, fullName: e.target.value })}
                  placeholder="e.g. دور محمد خان / Sadaqat Zeb Khan"
                  className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#1a1a1a] font-bold focus:outline-none focus:border-[#c2410c]"
                  required
                />
              </div>

              {/* Father Selection */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  والد / ولدیت (Father / Parent)
                </label>
                <select
                  value={personForm.fatherId || ''}
                  onChange={(e) => {
                    const fid = e.target.value;
                    const f = people.find((p) => p.id === fid);
                    setPersonForm({
                      ...personForm,
                      fatherId: fid,
                      generation: f ? (f.generation || 1) + 1 : 1,
                      branchId: f?.branchId || personForm.branchId,
                    });
                  }}
                  className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                >
                  <option value="">کوئی والد نہیں / بانی شاخ (Founder - Gen 1)</option>
                  {people
                    .filter((p) => !editingPerson || p.id !== editingPerson.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} (نسل G{p.generation} — {p.branchName || 'Mazid Khail'})
                      </option>
                    ))}
                </select>
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  والد کا انتخاب کرنے پر نسل (Generation) اور شاخ خود بخود سیٹ ہو جائے گی۔
                </span>
              </div>

              {/* Generation & Branch Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">نسل (Generation)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={personForm.generation || 1}
                    onChange={(e) => setPersonForm({ ...personForm, generation: Number(e.target.value) })}
                    className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">شاخ (Branch)</label>
                  <select
                    value={personForm.branchId || ''}
                    onChange={(e) => setPersonForm({ ...personForm, branchId: e.target.value })}
                    className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                  >
                    <option value="">ڈیفالٹ شاخ (Default Branch)</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status & Dates Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">کیفیت (Living Status)</label>
                  <select
                    value={personForm.aliveStatus || 'unknown'}
                    onChange={(e) => setPersonForm({ ...personForm, aliveStatus: e.target.value as any })}
                    className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                  >
                    <option value="alive">حیات (Living)</option>
                    <option value="deceased">وفات (Deceased)</option>
                    <option value="unknown">نامعلوم (Unknown)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">سنِ پیدائش (Birth Date / Year)</label>
                  <input
                    type="text"
                    value={personForm.birthDate || ''}
                    onChange={(e) => setPersonForm({ ...personForm, birthDate: e.target.value })}
                    placeholder="e.g. 1952"
                    className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">سنِ وفات (Death Date / Year)</label>
                  <input
                    type="text"
                    value={personForm.deathDate || ''}
                    onChange={(e) => setPersonForm({ ...personForm, deathDate: e.target.value })}
                    placeholder="e.g. 2018"
                    className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                  />
                </div>
              </div>

              {/* Occupation & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">پیشہ / عہدہ (Occupation)</label>
                  <input
                    type="text"
                    value={personForm.occupation || ''}
                    onChange={(e) => setPersonForm({ ...personForm, occupation: e.target.value })}
                    placeholder="e.g. لینڈ لارڈ، بزنس مین، وکیل..."
                    className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">مقام / گاؤں (Location / Residence)</label>
                  <input
                    type="text"
                    value={personForm.location || ''}
                    onChange={(e) => setPersonForm({ ...personForm, location: e.target.value })}
                    placeholder="e.g. چارسدہ، پشاور، مردان..."
                    className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                  />
                </div>
              </div>

              {/* Photograph URL */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">تصویر کا لنک (Photograph URL)</label>
                <input
                  type="text"
                  value={personForm.photograph || ''}
                  onChange={(e) => setPersonForm({ ...personForm, photograph: e.target.value })}
                  placeholder="https://... or data:image/..."
                  className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c]"
                />
              </div>

              {/* Biography / Notes */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">تاریخی تفصیلات و سوانح (Biography & Notes)</label>
                <textarea
                  value={personForm.notes || ''}
                  onChange={(e) => setPersonForm({ ...personForm, notes: e.target.value })}
                  placeholder="فرد کے تاریخی حالات، خدمات، اولاد، اور دیگر کوائف..."
                  className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#c2410c] h-20"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200">
                {editingPerson ? (
                  <button
                    type="button"
                    onClick={() => handleDeletePerson(editingPerson)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ریکارڈ حذف کریں</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPersonModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold"
                  >
                    منسوخ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#333333] text-white font-bold shadow-sm"
                  >
                    محفوظ کریں (Save Record)
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK FATHER LINKING MODAL                                        */}
      {/* ========================================================================= */}
      {quickLinkPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl border border-gray-300 p-6 shadow-2xl space-y-4 text-xs text-[#1a1a1a]">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-[#1a1a1a]">
                والد کا انتخاب کریں: {quickLinkPerson.fullName}
              </h3>
              <button onClick={() => setQuickLinkPerson(null)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  کس کا بیٹا / اولاد ہے؟ (Select Father)
                </label>
                <select
                  value={quickLinkFatherId}
                  onChange={(e) => setQuickLinkFatherId(e.target.value)}
                  className="w-full bg-[#fcfaf7] border border-gray-300 rounded-lg p-2.5 text-xs text-[#1a1a1a]"
                >
                  <option value="">کوئی والد منتخب نہیں (Unlinked)</option>
                  {people
                    .filter((p) => p.id !== quickLinkPerson.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} (Gen {p.generation})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setQuickLinkPerson(null)}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                >
                  منسوخ
                </button>
                <button
                  type="button"
                  onClick={handleQuickLinkSave}
                  className="px-4 py-1.5 rounded-lg bg-[#c2410c] hover:bg-[#ea580c] text-white font-bold"
                >
                  لنک محفوظ کریں
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PERSON DELETE CONFIRMATION                                        */}
      {/* ========================================================================= */}
      {confirmDeletePerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white text-[#1a1a1a] rounded-xl border border-gray-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">کیا آپ واقعی ریکارڈ حذف کرنا چاہتے ہیں؟</h3>
                <p className="text-xs text-gray-500">یہ عمل ناقابلِ واپسی ہے۔</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 bg-red-50/70 p-3 rounded-lg border border-red-200 leading-relaxed">
              کیا آپ کو یقین ہے کہ آپ <strong className="text-black">{confirmDeletePerson.fullName}</strong> کا ریکارڈ مستقل طور پر حذف کرنا چاہتے ہیں؟ ان سے وابستہ خاندانی روابط محفوظ طریقے سے اپڈیٹ ہو جائیں گے۔
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDeletePerson(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
              >
                منسوخ کریں
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDeletePerson}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'حذف ہو رہا ہے...' : 'ہاں، مستقل حذف کریں'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: BRANCH DELETE CONFIRMATION                                        */}
      {/* ========================================================================= */}
      {confirmDeleteBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white text-[#1a1a1a] rounded-xl border border-gray-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">شاخ حذف کریں؟</h3>
                <p className="text-xs text-gray-500">یہ عمل ناقابلِ واپسی ہے۔</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 bg-red-50/70 p-3 rounded-lg border border-red-200 leading-relaxed">
              کیا آپ واقعی شاخ <strong className="text-black">"{confirmDeleteBranch.name}"</strong> کو حذف کرنا چاہتے ہیں؟ اس شاخ کے اراکین کو ڈیفالٹ شاخ پر منتقل کر دیا جائے گا۔
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDeleteBranch(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
              >
                منسوخ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDeleteBranch}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'حذف ہو رہا ہے...' : 'شاخ حذف کریں'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
