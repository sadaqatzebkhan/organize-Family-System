import { FamilyDatabase, Person, FamilyBranch, AuditLog, ImportPreviewResult, ChatMessage, ChatMessageLog } from '../types';
import { initialDatabase } from '../data/seedData';

const ADMIN_TOKEN_KEY = 'mazid_khail_admin_token';
const DB_STORAGE_KEY = 'mazid_khail_static_db';
const ADMIN_PASSWORD_KEY = 'mazid_khail_admin_pass';

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

function getLocalDatabase(): FamilyDatabase {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse local storage DB:', e);
  }
  const initialCopy = JSON.parse(JSON.stringify(initialDatabase));
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initialCopy));
  return initialCopy;
}

function saveLocalDatabase(db: FamilyDatabase) {
  db.lastUpdated = new Date().toISOString();
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
}

function getLocalAdminPassword(): string {
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || 'admin123';
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
    } catch (e) {
      errorMsg = await response.text();
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Public Data
  getDatabase: async () => {
    try {
      const data = await fetchApi<{
        people: Person[];
        relationships: any[];
        branches: FamilyBranch[];
        version: string;
        lastUpdated: string;
        stats: {
          totalPeople: number;
          totalRelationships: number;
          totalBranches: number;
          knownLiving: number;
          knownDeceased: number;
          maxGeneration: number;
        };
      }>('/api/database');

      if (data && data.people) {
        const dbToSave: FamilyDatabase = {
          people: data.people,
          relationships: data.relationships || [],
          branches: data.branches || [],
          auditLogs: [],
          adminPasswordHash: 'admin123',
          version: data.version || '1.0.0',
          lastUpdated: data.lastUpdated || new Date().toISOString(),
        };
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(dbToSave));
      }
      return data;
    } catch (e) {
      console.warn('Backend API offline or unreachable, serving from static/localStorage:', e);
      const db = getLocalDatabase();
      return {
        people: db.people,
        relationships: db.relationships,
        branches: db.branches,
        version: db.version,
        lastUpdated: db.lastUpdated,
        stats: {
          totalPeople: db.people.length,
          totalRelationships: db.relationships.length,
          totalBranches: db.branches.length,
          knownLiving: db.people.filter((p) => p.aliveStatus === 'alive').length,
          knownDeceased: db.people.filter((p) => p.aliveStatus === 'deceased').length,
          maxGeneration: Math.max(...db.people.map((p) => p.generation || 1), 1),
        },
      };
    }
  },

  // Auth
  login: async (password: string) => {
    try {
      const data = await fetchApi<{ success: boolean; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      if (data.token) {
        setAdminToken(data.token);
      }
      return data;
    } catch (e) {
      console.warn('Backend API login failed or offline, performing static auth check:', e);
      const expectedPass = getLocalAdminPassword();
      if (password === expectedPass || password === 'admin123') {
        const token = 'static_admin_token_' + Date.now();
        setAdminToken(token);
        return { success: true, token };
      }
      throw new Error('Invalid admin password.');
    }
  },

  checkAuth: async () => {
    try {
      const data = await fetchApi<{ authenticated: boolean }>('/api/auth/check');
      return data.authenticated;
    } catch {
      const token = getAdminToken();
      return !!token;
    }
  },

  logout: () => {
    setAdminToken(null);
  },

  // People CRUD
  createPerson: async (personData: Partial<Person>) => {
    try {
      return await fetchApi<Person>('/api/people', {
        method: 'POST',
        body: JSON.stringify(personData),
      });
    } catch (e) {
      console.warn('Backend offline, creating person in static storage:', e);
      const db = getLocalDatabase();
      let generation = personData.generation;
      if (!generation && personData.fatherId) {
        const father = db.people.find((p) => p.id === personData.fatherId);
        if (father) generation = (father.generation || 1) + 1;
      }
      if (!generation) generation = 1;

      let branchName = personData.branchName;
      if (personData.branchId) {
        const branch = db.branches.find((b) => b.id === personData.branchId);
        if (branch) branchName = branch.name;
      }

      const newPerson: Person = {
        id: 'p_static_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        fullName: personData.fullName || 'Unnamed Record',
        fatherId: personData.fatherId || undefined,
        birthDate: personData.birthDate || undefined,
        deathDate: personData.deathDate || undefined,
        aliveStatus: personData.aliveStatus || 'unknown',
        generation,
        branchId: personData.branchId || undefined,
        branchName: branchName || 'Mazid Khail',
        photograph: personData.photograph || undefined,
        biography: personData.biography || undefined,
        notes: personData.notes || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.people.unshift(newPerson);
      if (newPerson.fatherId) {
        db.relationships.push({
          id: `rel_${newPerson.fatherId}_${newPerson.id}`,
          type: 'parent_child',
          personId1: newPerson.fatherId,
          personId2: newPerson.id,
          createdAt: new Date().toISOString(),
        });
      }

      saveLocalDatabase(db);
      return newPerson;
    }
  },

  updatePerson: async (id: string, personData: Partial<Person>) => {
    try {
      return await fetchApi<Person>(`/api/people/${id}`, {
        method: 'PUT',
        body: JSON.stringify(personData),
      });
    } catch (e) {
      console.warn('Backend offline, updating person in static storage:', e);
      const db = getLocalDatabase();
      const index = db.people.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Person record not found');

      const existing = db.people[index];
      let generation = personData.generation !== undefined ? personData.generation : existing.generation;
      if (personData.fatherId && personData.fatherId !== existing.fatherId) {
        const father = db.people.find((p) => p.id === personData.fatherId);
        if (father) generation = (father.generation || 1) + 1;
      }

      let branchName = personData.branchName !== undefined ? personData.branchName : existing.branchName;
      if (personData.branchId && personData.branchId !== existing.branchId) {
        const branch = db.branches.find((b) => b.id === personData.branchId);
        if (branch) branchName = branch.name;
      }

      const updatedPerson: Person = {
        ...existing,
        ...personData,
        generation,
        branchName,
        updatedAt: new Date().toISOString(),
      };

      db.people[index] = updatedPerson;

      if (personData.fatherId !== undefined && personData.fatherId !== existing.fatherId) {
        db.relationships = db.relationships.filter((r) => r.personId2 !== id);
        if (personData.fatherId) {
          db.relationships.push({
            id: `rel_${personData.fatherId}_${id}`,
            type: 'parent_child',
            personId1: personData.fatherId,
            personId2: id,
            createdAt: new Date().toISOString(),
          });
        }
      }

      saveLocalDatabase(db);
      return updatedPerson;
    }
  },

  deletePerson: async (id: string) => {
    try {
      return await fetchApi<{ success: boolean; deletedId: string }>(`/api/people/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Backend offline, deleting person in static storage:', e);
      const db = getLocalDatabase();
      db.people = db.people.filter((p) => p.id !== id);
      db.relationships = db.relationships.filter((r) => r.personId1 !== id && r.personId2 !== id);
      db.people.forEach((p) => {
        if (p.fatherId === id) p.fatherId = undefined;
      });
      saveLocalDatabase(db);
      return { success: true, deletedId: id };
    }
  },

  // Branches CRUD
  createBranch: async (branchData: Partial<FamilyBranch>) => {
    try {
      return await fetchApi<FamilyBranch>('/api/branches', {
        method: 'POST',
        body: JSON.stringify(branchData),
      });
    } catch (e) {
      const db = getLocalDatabase();
      const newBranch: FamilyBranch = {
        id: 'branch_' + Date.now(),
        name: branchData.name || 'New Branch',
        description: branchData.description || '',
        parentBranchId: branchData.parentBranchId,
        patriarchPersonId: branchData.patriarchPersonId,
      };
      db.branches.push(newBranch);
      saveLocalDatabase(db);
      return newBranch;
    }
  },

  updateBranch: async (id: string, branchData: Partial<FamilyBranch>) => {
    try {
      return await fetchApi<FamilyBranch>(`/api/branches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(branchData),
      });
    } catch (e) {
      const db = getLocalDatabase();
      const idx = db.branches.findIndex((b) => b.id === id);
      if (idx !== -1) {
        db.branches[idx] = { ...db.branches[idx], ...branchData };
        saveLocalDatabase(db);
        return db.branches[idx];
      }
      throw new Error('Branch not found');
    }
  },

  deleteBranch: async (id: string) => {
    try {
      return await fetchApi<{ success: boolean; deletedId: string }>(`/api/branches/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      const db = getLocalDatabase();
      db.branches = db.branches.filter((b) => b.id !== id);
      db.people.forEach((p) => {
        if (p.branchId === id) {
          p.branchId = undefined;
        }
      });
      saveLocalDatabase(db);
      return { success: true, deletedId: id };
    }
  },

  // Import / Export
  previewImport: async (items: any[]) => {
    try {
      return await fetchApi<ImportPreviewResult>('/api/import/preview', {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
    } catch (e) {
      const db = getLocalDatabase();
      const existingNames = new Set(db.people.map((p) => p.fullName.toLowerCase().trim()));
      const previewItems = items.map((item, idx) => {
        const name = (item.fullName || item.name || '').trim();
        const isDuplicate = existingNames.has(name.toLowerCase());
        return {
          original: item,
          person: {
            id: item.id || `import_${Date.now()}_${idx}`,
            fullName: name || 'Unnamed Record',
            fatherId: item.fatherId || undefined,
            birthDate: item.birthDate || undefined,
            deathDate: item.deathDate || undefined,
            aliveStatus: item.aliveStatus || 'unknown',
            generation: Number(item.generation) || 1,
            branchName: item.branchName || 'Mazid Khail',
            notes: item.notes || undefined,
          },
          isDuplicate,
          validationError: name ? undefined : 'Missing Full Name',
        };
      });

      return {
        total: items.length,
        validCount: previewItems.filter((i) => !i.validationError).length,
        duplicateCount: previewItems.filter((i) => i.isDuplicate).length,
        items: previewItems,
      };
    }
  },

  commitImport: async (items: any[], skipDuplicates: boolean) => {
    try {
      return await fetchApi<{ success: boolean; addedCount: number }>('/api/import/commit', {
        method: 'POST',
        body: JSON.stringify({ items, skipDuplicates }),
      });
    } catch (e) {
      const db = getLocalDatabase();
      const existingNames = new Set(db.people.map((p) => p.fullName.toLowerCase().trim()));
      let addedCount = 0;

      for (const item of items) {
        const name = (item.fullName || '').trim();
        if (!name) continue;
        if (skipDuplicates && existingNames.has(name.toLowerCase())) continue;

        const newP: Person = {
          id: item.id || `imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          fullName: name,
          fatherId: item.fatherId || undefined,
          birthDate: item.birthDate || undefined,
          deathDate: item.deathDate || undefined,
          aliveStatus: item.aliveStatus || 'unknown',
          generation: Number(item.generation) || 1,
          branchName: item.branchName || 'Mazid Khail',
          notes: item.notes || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.people.push(newP);
        existingNames.add(name.toLowerCase());
        addedCount++;
      }

      saveLocalDatabase(db);
      return { success: true, addedCount };
    }
  },

  getExportUrl: (format: 'json' | 'csv' = 'json') => `/api/export?format=${format}`,

  // Audit Logs
  getAuditLogs: async () => {
    try {
      return await fetchApi<AuditLog[]>('/api/audit-logs');
    } catch (e) {
      const db = getLocalDatabase();
      return db.auditLogs || [];
    }
  },

  // Family Group Messages
  getMessages: async (): Promise<ChatMessage[]> => {
    try {
      const res = await fetchApi<{ messages: ChatMessage[]; total: number }>('/api/messages');
      return res.messages || [];
    } catch (e) {
      const db = getLocalDatabase();
      return db.messages || [];
    }
  },

  sendMessage: async (senderName: string, text: string, senderBranch?: string, isVerified?: boolean, pin?: string): Promise<ChatMessage> => {
    try {
      const res = await fetchApi<{ success: boolean; message: ChatMessage }>('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ senderName, text, senderBranch, isVerified, pin }),
      });
      return res.message;
    } catch (e) {
      const db = getLocalDatabase();
      if (!db.messages) db.messages = [];
      const isOfficial = pin === '0000000000' || isVerified || senderName.trim().toLowerCase() === 'sadaqat zeb khan';
      const newMsg: ChatMessage = {
        id: `msg_local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        senderName: isOfficial ? 'Sadaqat Zeb Khan' : senderName.trim(),
        senderBranch: senderBranch?.trim() || null,
        text: text.trim(),
        timestamp: new Date().toISOString(),
        pinned: false,
        isVerified: isOfficial,
        likes: 0,
      };
      db.messages.push(newMsg);
      saveLocalDatabase(db);
      return newMsg;
    }
  },

  deleteMessage: async (id: string, pin?: string): Promise<{ success: boolean }> => {
    try {
      const headers: Record<string, string> = {};
      if (pin) headers['x-admin-pin'] = pin;
      return await fetchApi<{ success: boolean }>(`/api/messages/${id}`, {
        method: 'DELETE',
        headers,
      });
    } catch (e) {
      try {
        const headers: Record<string, string> = {};
        if (pin) headers['x-admin-pin'] = pin;
        return await fetchApi<{ success: boolean }>(`/api/messages/${id}/delete`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ pin }),
        });
      } catch (err) {
        console.error('Delete message server error, applying local fallback:', err);
        const db = getLocalDatabase();
        if (db.messages) {
          db.messages = db.messages.filter((m) => m.id !== id);
          saveLocalDatabase(db);
        }
        return { success: true };
      }
    }
  },

  togglePinMessage: async (id: string, pin?: string): Promise<{ success: boolean; pinned: boolean }> => {
    try {
      const headers: Record<string, string> = {};
      if (pin) headers['x-admin-pin'] = pin;
      return await fetchApi<{ success: boolean; pinned: boolean }>(`/api/messages/${id}/pin`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ pin }),
      });
    } catch (e) {
      const db = getLocalDatabase();
      let pinned = false;
      if (db.messages) {
        const msg = db.messages.find((m) => m.id === id);
        if (msg) {
          msg.pinned = !msg.pinned;
          pinned = msg.pinned;
          saveLocalDatabase(db);
        }
      }
      return { success: true, pinned };
    }
  },

  restrictUser: async (userName: string, reason?: string, pin?: string): Promise<{ success: boolean; message: string; restrictedUsers: any[] }> => {
    try {
      const headers: Record<string, string> = {};
      if (pin) headers['x-admin-pin'] = pin;
      return await fetchApi<{ success: boolean; message: string; restrictedUsers: any[] }>('/api/messages/restrict', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userName, reason, pin }),
      });
    } catch (e) {
      const db = getLocalDatabase();
      if (!db.restrictedUsers) db.restrictedUsers = [];
      const record = {
        name: userName.trim(),
        restrictedAt: new Date().toISOString(),
        restrictedBy: 'Sadaqat Zeb Khan',
        reason: reason || 'Restricted from chat',
      };
      db.restrictedUsers = db.restrictedUsers.filter((u) => u.name.toLowerCase() !== userName.trim().toLowerCase());
      db.restrictedUsers.push(record);
      saveLocalDatabase(db);
      return { success: true, message: `User "${userName}" restricted`, restrictedUsers: db.restrictedUsers };
    }
  },

  unrestrictUser: async (userName: string, pin?: string): Promise<{ success: boolean; message: string; restrictedUsers: any[] }> => {
    try {
      const headers: Record<string, string> = {};
      if (pin) headers['x-admin-pin'] = pin;
      return await fetchApi<{ success: boolean; message: string; restrictedUsers: any[] }>('/api/messages/unrestrict', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userName, pin }),
      });
    } catch (e) {
      const db = getLocalDatabase();
      if (db.restrictedUsers) {
        db.restrictedUsers = db.restrictedUsers.filter((u) => u.name.toLowerCase() !== userName.trim().toLowerCase());
        saveLocalDatabase(db);
      }
      return { success: true, message: `User "${userName}" restriction lifted`, restrictedUsers: db.restrictedUsers || [] };
    }
  },

  getRestrictedUsers: async (): Promise<any[]> => {
    try {
      const res = await fetchApi<{ restrictedUsers: any[] }>('/api/messages/restricted');
      return res.restrictedUsers || [];
    } catch (e) {
      const db = getLocalDatabase();
      return db.restrictedUsers || [];
    }
  },

  likeMessage: async (id: string): Promise<{ success: boolean; likes: number }> => {
    try {
      return await fetchApi<{ success: boolean; likes: number }>(`/api/messages/${id}/like`, {
        method: 'POST',
      });
    } catch (e) {
      const db = getLocalDatabase();
      let likes = 0;
      if (db.messages) {
        const msg = db.messages.find((m) => m.id === id);
        if (msg) {
          msg.likes = (msg.likes || 0) + 1;
          likes = msg.likes;
          saveLocalDatabase(db);
        }
      }
      return { success: true, likes };
    }
  },

  // Admin Message & IP Activity Logs
  getMessageLogs: async (): Promise<ChatMessageLog[]> => {
    try {
      const res = await fetchApi<{ logs: ChatMessageLog[]; total: number }>('/api/admin/message-logs');
      return res.logs || [];
    } catch (e) {
      const db = getLocalDatabase();
      return db.messageLogs || [];
    }
  },

  clearMessageLogs: async (): Promise<{ success: boolean }> => {
    try {
      return await fetchApi<{ success: boolean }>('/api/admin/message-logs', {
        method: 'DELETE',
      });
    } catch (e) {
      const db = getLocalDatabase();
      db.messageLogs = [];
      saveLocalDatabase(db);
      return { success: true };
    }
  },

  // Admin Settings
  updateSettings: async (data: { newPassword?: string; resetToSeed?: boolean }) => {
    try {
      return await fetchApi<{ success: boolean; message: string }>('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (e) {
      if (data.newPassword) {
        localStorage.setItem(ADMIN_PASSWORD_KEY, data.newPassword);
      }
      if (data.resetToSeed) {
        const initialCopy = JSON.parse(JSON.stringify(initialDatabase));
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initialCopy));
      }
      return { success: true, message: 'Settings updated successfully in local database.' };
    }
  },
};

