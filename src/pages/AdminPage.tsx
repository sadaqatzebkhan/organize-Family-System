import React, { useState, useEffect } from 'react';
import { Person, FamilyBranch, AuditLog, ImportPreviewResult } from '../types';
import { api } from '../services/api';
import { ShieldCheck, LogOut, Plus, Edit2, Trash2, Download, Upload, RefreshCw, Key, Users, GitFork, FileText, X } from 'lucide-react';
import { validateRelationship } from '../lib/utils';

interface AdminPageProps {
  people: Person[];
  branches: FamilyBranch[];
  onRefreshData: () => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  people,
  branches,
  onRefreshData,
  isAdmin,
  setIsAdmin,
}) => {
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'people' | 'branches' | 'import_export' | 'audit_logs' | 'settings'>('people');

  // People Form state
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
    branchId: '',
  });

  // Branch Form state
  const [branchForm, setBranchForm] = useState({ name: '', description: '' });

  // Import state
  const [importPreview, setImportPreview] = useState<ImportPreviewResult | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Settings state
  const [newPassword, setNewPassword] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');

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
    try {
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (e) {
      console.error(e);
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

  // Person CRUD handlers
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
        branchId: person.branchId || '',
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
        branchId: '',
      });
    }
    setIsPersonModalOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!personForm.fullName || !personForm.fullName.trim()) {
      setStatusMsg({ type: 'error', text: 'Full name is required.' });
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

    try {
      if (editingPerson) {
        await api.updatePerson(editingPerson.id, personForm);
        setStatusMsg({ type: 'success', text: `Updated ${personForm.fullName}` });
      } else {
        await api.createPerson(personForm);
        setStatusMsg({ type: 'success', text: `Added ${personForm.fullName}` });
      }
      setIsPersonModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save person.' });
    }
  };

  const handleDeletePerson = (person: Person) => {
    setConfirmDeletePerson(person);
  };

  const executeDeletePerson = async () => {
    if (!confirmDeletePerson) return;
    setIsDeleting(true);
    try {
      await api.deletePerson(confirmDeletePerson.id);
      setIsPersonModalOpen(false);
      setStatusMsg({ type: 'success', text: `Successfully deleted record for ${confirmDeletePerson.fullName}` });
      setConfirmDeletePerson(null);
      await onRefreshData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete record.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Branch Creation
  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim()) return;
    try {
      await api.createBranch(branchForm);
      setBranchForm({ name: '', description: '' });
      setStatusMsg({ type: 'success', text: 'New branch created successfully.' });
      onRefreshData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to create branch.' });
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
      setStatusMsg({ type: 'success', text: `Deleted branch "${confirmDeleteBranch.name}"` });
      setConfirmDeleteBranch(null);
      await onRefreshData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete branch.' });
    } finally {
      setIsDeleting(false);
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
          // Simple CSV parser
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
      setStatusMsg({ type: 'success', text: `Successfully imported ${res.addedCount} records.` });
      setImportPreview(null);
      onRefreshData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to commit import.' });
    }
  };

  // Change Password / Reset
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setSettingsMessage('Password must be at least 6 characters.');
      return;
    }
    try {
      await api.updateSettings({ newPassword });
      setSettingsMessage('Password updated successfully!');
      setNewPassword('');
    } catch (err: any) {
      setSettingsMessage(err.message || 'Failed to update password.');
    }
  };

  const handleResetToSeed = async () => {
    if (!confirm('WARNING: Reset database back to original PDF family history seed state? Any unsaved edits will be lost.')) {
      return;
    }
    try {
      await api.updateSettings({ resetToSeed: true });
      setStatusMsg({ type: 'success', text: 'Database reset to initial PDF seed state.' });
      onRefreshData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to reset database.' });
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded bg-white border border-gray-200 shadow-md text-[#1a1a1a]">
        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded bg-[#1a1a1a] text-white serif font-bold text-2xl flex items-center justify-center mx-auto shadow-2xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="serif text-2xl font-light italic text-[#1a1a1a]">
            Administrator Authentication
          </h2>
          <p className="text-xs text-gray-500">
            Authenticate with your admin credentials to modify family database records, manage branches, and import/export data.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block label-caps mb-1">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-[#fcfaf7] border border-gray-200 rounded px-4 py-2.5 text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-[#1a1a1a] text-xs font-mono"
              required
            />
          </div>

          {loginError && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            id="admin-login-submit-button"
            className="w-full py-3 rounded bg-[#1a1a1a] hover:bg-[#333333] text-white label-caps transition-colors shadow-2xs"
          >
            Authenticate & Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 animate-fade-in text-[#1a1a1a]">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-[#1a1a1a] text-white serif font-bold text-xl flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="serif text-2xl font-light italic text-[#1a1a1a]">
              Administrator Portal
            </h1>
            <p className="text-xs text-gray-500">
              Database CRUD Controls • Relationship Manager • Data Backup & Import
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 label-caps transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Admin Session</span>
        </button>
      </div>

      {/* Global Status Feedback Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded border flex items-center justify-between text-xs font-medium ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 bg-[#fcfaf7] p-1.5 rounded gap-1">
        <button
          onClick={() => setActiveTab('people')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs label-caps transition-colors ${
            activeTab === 'people' ? 'bg-[#1a1a1a] text-white shadow-2xs' : 'text-gray-600 hover:text-[#1a1a1a]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>People CRUD ({people.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs label-caps transition-colors ${
            activeTab === 'branches' ? 'bg-[#1a1a1a] text-white shadow-2xs' : 'text-gray-600 hover:text-[#1a1a1a]'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Branch Manager ({branches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('import_export')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs label-caps transition-colors ${
            activeTab === 'import_export' ? 'bg-[#1a1a1a] text-white shadow-2xs' : 'text-gray-600 hover:text-[#1a1a1a]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import / Export</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs label-caps transition-colors ${
            activeTab === 'audit_logs' ? 'bg-[#1a1a1a] text-white shadow-2xs' : 'text-gray-600 hover:text-[#1a1a1a]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs label-caps transition-colors ${
            activeTab === 'settings' ? 'bg-[#1a1a1a] text-white shadow-2xs' : 'text-gray-600 hover:text-[#1a1a1a]'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>

      {/* Tab 1: People CRUD */}
      {activeTab === 'people' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="serif text-xl font-light italic text-[#1a1a1a]">
              Manage Family Members
            </h3>
            <button
              onClick={() => handleOpenPersonForm()}
              id="admin-add-person-button"
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#1a1a1a] hover:bg-[#333333] text-white label-caps transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Person</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-[#1a1a1a]">
              <thead className="bg-[#fcfaf7] label-caps border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Full Name</th>
                  <th className="p-3.5">Father</th>
                  <th className="p-3.5">Gen</th>
                  <th className="p-3.5">Branch</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {people.map((person) => {
                  const father = people.find((p) => p.id === person.fatherId);
                  return (
                    <tr key={person.id} className="hover:bg-[#fcfaf7] transition-colors">
                      <td className="p-3.5 font-bold text-[#1a1a1a]">{person.fullName}</td>
                      <td className="p-3.5 text-gray-600">{father?.fullName || '—'}</td>
                      <td className="p-3.5 font-bold text-[#1a1a1a]">G{person.generation}</td>
                      <td className="p-3.5">{person.branchName || 'Mazid Khail'}</td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenPersonForm(person)}
                          className="p-1.5 rounded bg-[#fcfaf7] hover:bg-gray-100 text-gray-700 border border-gray-200"
                          title="Edit Person"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePerson(person)}
                          className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                          title="Delete Person"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Branch Manager */}
      {activeTab === 'branches' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 p-6 rounded bg-white border border-gray-200 shadow-2xs space-y-4">
            <h3 className="serif text-lg font-light italic text-[#1a1a1a]">
              Create New Branch
            </h3>
            <form onSubmit={handleCreateBranch} className="space-y-4 text-xs">
              <div>
                <label className="block label-caps mb-1">Branch Name</label>
                <input
                  type="text"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  placeholder="e.g. Saho Khan Branch"
                  className="w-full bg-[#fcfaf7] border border-gray-200 rounded px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a]"
                  required
                />
              </div>

              <div>
                <label className="block label-caps mb-1">Description</label>
                <textarea
                  value={branchForm.description}
                  onChange={(e) => setBranchForm({ ...branchForm, description: e.target.value })}
                  placeholder="Sub-branch description..."
                  className="w-full bg-[#fcfaf7] border border-gray-200 rounded px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded bg-[#1a1a1a] hover:bg-[#333333] text-white label-caps transition-colors shadow-2xs"
              >
                Create Branch
              </button>
            </form>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h3 className="serif text-lg font-light italic text-[#1a1a1a]">
              Existing Branches ({branches.length})
            </h3>
            <div className="space-y-3">
              {branches.map((b) => {
                const count = people.filter((p) => p.branchId === b.id).length;
                return (
                  <div key={b.id} className="p-4 rounded bg-white border border-gray-200 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#1a1a1a] text-sm">{b.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{b.description || 'No description provided.'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded bg-[#fcfaf7] border border-gray-200 text-[#1a1a1a] font-bold">
                        {count} Members
                      </span>
                      <button
                        onClick={() => handleDeleteBranch(b)}
                        className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Import / Export */}
      {activeTab === 'import_export' && (
        <div className="space-y-8">
          
          {/* Export Section */}
          <div className="p-6 rounded bg-white border border-gray-200 shadow-2xs space-y-4">
            <h3 className="serif text-xl font-light italic text-[#1a1a1a]">
              Export Database
            </h3>
            <p className="text-xs text-gray-500">
              Download complete family tree dataset for offline backup or printing.
            </p>
            <div className="flex gap-4">
              <a
                href={api.getExportUrl('json')}
                download
                className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#1a1a1a] text-white label-caps hover:bg-[#333333] transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export as JSON</span>
              </a>
              <a
                href={api.getExportUrl('csv')}
                download
                className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#fcfaf7] text-[#1a1a1a] border border-gray-200 label-caps hover:bg-gray-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export as CSV</span>
              </a>
            </div>
          </div>

          {/* Import Section */}
          <div className="p-6 rounded bg-white border border-gray-200 shadow-2xs space-y-6">
            <div>
              <h3 className="serif text-xl font-light italic text-[#1a1a1a]">
                Import Structured Family Data
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Upload a JSON or CSV file containing person records. The system will run a validation dry-run, check for duplicates, and require your confirmation before updating the database.
              </p>
            </div>

            <div className="p-6 border-2 border-dashed border-gray-300 rounded text-center bg-[#fcfaf7]">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <label className="cursor-pointer text-xs label-caps text-[#c2410c] hover:underline">
                <span>Select JSON or CSV File to Upload</span>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Import Preview */}
            {importPreview && (
              <div className="p-6 rounded bg-[#fcfaf7] border border-gray-200 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <h4 className="font-bold text-[#1a1a1a] text-xs uppercase tracking-wider">
                    Import Dry-Run Preview
                  </h4>
                  <div className="flex gap-2 text-xs">
                    <span className="text-emerald-700 font-bold">Valid: {importPreview.validCount}</span>
                    <span className="text-amber-700 font-bold">Duplicates: {importPreview.duplicateCount}</span>
                    <span className="text-red-700 font-bold">Errors: {importPreview.errorCount}</span>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                  {importPreview.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded border flex items-center justify-between ${
                        item.status === 'valid'
                          ? 'bg-white border-gray-200 text-[#1a1a1a]'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{item.person.fullName || 'Unnamed'}</div>
                        {item.duplicateReason && (
                          <div className="text-[11px] text-amber-700 mt-0.5">{item.duplicateReason}</div>
                        )}
                      </div>
                      <span className="text-[11px] uppercase tracking-wider font-bold">{item.status}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipDuplicates}
                      onChange={(e) => setSkipDuplicates(e.target.checked)}
                      className="rounded border-gray-300 text-[#1a1a1a]"
                    />
                    <span>Skip duplicates automatically during import</span>
                  </label>

                  <button
                    onClick={handleCommitImport}
                    className="px-6 py-2.5 rounded bg-[#1a1a1a] hover:bg-[#333333] text-white label-caps transition-colors shadow-2xs"
                  >
                    Confirm & Apply Import
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="serif text-xl font-light italic text-[#1a1a1a]">
              Database Audit History
            </h3>
            <button
              onClick={fetchAuditLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-[#1a1a1a] border border-gray-200 text-xs label-caps hover:bg-[#fcfaf7]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Logs</span>
            </button>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 rounded bg-white border border-gray-200 text-xs flex items-start justify-between shadow-2xs">
                <div>
                  <div className="font-bold text-[#1a1a1a] flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#fcfaf7] border border-gray-200 text-[#c2410c] text-[10px] label-caps">
                      {log.action}
                    </span>
                    <span>{log.details}</span>
                  </div>
                  {log.personName && (
                    <div className="text-gray-500 mt-1">Affected Person: {log.personName}</div>
                  )}
                </div>
                <div className="text-[11px] text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-xl space-y-8">
          <div className="p-6 rounded bg-white border border-gray-200 shadow-2xs space-y-4">
            <h3 className="serif text-xl font-light italic text-[#1a1a1a]">
              Change Admin Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block label-caps mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#fcfaf7] border border-gray-200 rounded px-4 py-2.5 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a]"
                  required
                />
              </div>

              {settingsMessage && (
                <div className="text-xs text-[#c2410c] font-medium">{settingsMessage}</div>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded bg-[#1a1a1a] hover:bg-[#333333] text-white label-caps transition-colors shadow-2xs"
              >
                Update Password
              </button>
            </form>
          </div>


        </div>
      )}

      {/* Person Add/Edit Modal */}
      {isPersonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-4 sm:pt-8 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white text-[#1a1a1a] rounded border border-gray-200 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-0 mb-12">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="serif text-xl font-light italic text-[#1a1a1a]">
                {editingPerson ? `Edit ${editingPerson.fullName}` : 'Add New Family Member'}
              </h3>
              <button
                onClick={() => setIsPersonModalOpen(false)}
                className="text-gray-400 hover:text-[#1a1a1a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="space-y-4 text-xs">
              <div>
                <label className="block label-caps mb-1">Full Name *</label>
                <input
                  type="text"
                  value={personForm.fullName}
                  onChange={(e) => setPersonForm({ ...personForm, fullName: e.target.value })}
                  className="w-full bg-[#fcfaf7] border border-gray-200 rounded px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a]"
                  required
                />
              </div>

              <div>
                <label className="block label-caps mb-1">Father</label>
                <select
                  value={personForm.fatherId || ''}
                  onChange={(e) => setPersonForm({ ...personForm, fatherId: e.target.value })}
                  className="w-full bg-[#fcfaf7] border border-gray-200 rounded px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a]"
                >
                  <option value="">No Father / Unknown</option>
                  {people
                    .filter((p) => !editingPerson || p.id !== editingPerson.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} (Gen {p.generation})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block label-caps mb-1">Birth Date</label>
                  <input
                    type="text"
                    value={personForm.birthDate || ''}
                    onChange={(e) => setPersonForm({ ...personForm, birthDate: e.target.value })}
                    placeholder="e.g. 1947 or YYYY-MM-DD"
                    className="w-full bg-[#fcfaf7] border border-gray-200 rounded px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a]"
                  />
                </div>
                <div>
                  <label className="block label-caps mb-1">Death Date</label>
                  <input
                    type="text"
                    value={personForm.deathDate || ''}
                    onChange={(e) => setPersonForm({ ...personForm, deathDate: e.target.value })}
                    placeholder="e.g. 2013-12-31"
                    className="w-full bg-[#fcfaf7] border border-gray-200 rounded px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a]"
                  />
                </div>
              </div>

              <div>
                <label className="block label-caps mb-1">Status</label>
                <select
                  value={personForm.aliveStatus || 'unknown'}
                  onChange={(e) => setPersonForm({ ...personForm, aliveStatus: e.target.value as any })}
                  className="w-full bg-[#fcfaf7] border border-gray-200 rounded px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a]"
                >
                  <option value="alive">Living</option>
                  <option value="deceased">Deceased</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block label-caps mb-1">Branch</label>
                <select
                  value={personForm.branchId || ''}
                  onChange={(e) => setPersonForm({ ...personForm, branchId: e.target.value })}
                  className="w-full bg-[#fcfaf7] border border-gray-200 rounded px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a]"
                >
                  <option value="">Default Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block label-caps mb-1">Photograph Image URL</label>
                <input
                  type="text"
                  value={personForm.photograph || ''}
                  onChange={(e) => setPersonForm({ ...personForm, photograph: e.target.value })}
                  placeholder="https://... or data:image/..."
                  className="w-full bg-[#fcfaf7] border border-gray-200 rounded px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a]"
                />
              </div>

              <div>
                <label className="block label-caps mb-1">Biography / Notes</label>
                <textarea
                  value={personForm.notes || ''}
                  onChange={(e) => setPersonForm({ ...personForm, notes: e.target.value })}
                  placeholder="Historical notes..."
                  className="w-full bg-[#fcfaf7] border border-gray-200 rounded px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] h-20"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200">
                {editingPerson ? (
                  <button
                    type="button"
                    onClick={() => handleDeletePerson(editingPerson)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 label-caps font-bold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>
                ) : <div />}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPersonModalOpen(false)}
                    className="px-4 py-2 rounded bg-[#fcfaf7] text-gray-700 hover:bg-gray-100 border border-gray-200 label-caps"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded bg-[#1a1a1a] hover:bg-[#333333] text-white label-caps shadow-2xs"
                  >
                    Save Person Record
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Person Delete Confirmation Modal */}
      {confirmDeletePerson && (
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
              Are you sure you want to delete <strong className="text-black">{confirmDeletePerson.fullName}</strong>? This will permanently remove their record and clean up associated family links.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDeletePerson(null)}
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDeletePerson}
                className="flex items-center gap-2 px-5 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branch Delete Confirmation Modal */}
      {confirmDeleteBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white text-[#1a1a1a] rounded-lg border border-gray-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Delete Family Branch?</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 bg-red-50/50 p-3 rounded border border-red-100">
              Are you sure you want to delete the branch <strong className="text-black">"{confirmDeleteBranch.name}"</strong>? Members assigned to this branch will be moved to default.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDeleteBranch(null)}
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDeleteBranch}
                className="flex items-center gap-2 px-5 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

