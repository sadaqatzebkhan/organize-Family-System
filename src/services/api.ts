import { FamilyDatabase, Person, FamilyBranch, AuditLog, ImportPreviewResult } from '../types';
import { initialDatabase } from '../data/seedData';

const ADMIN_TOKEN_KEY = 'mazid_khail_admin_token';

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
      return await fetchApi<{
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
    } catch (e) {
      console.warn('Backend API unreachable, using static embedded database:', e);
      return {
        people: initialDatabase.people,
        relationships: initialDatabase.relationships,
        branches: initialDatabase.branches,
        version: initialDatabase.version,
        lastUpdated: initialDatabase.lastUpdated,
        stats: {
          totalPeople: initialDatabase.people.length,
          totalRelationships: initialDatabase.relationships.length,
          totalBranches: initialDatabase.branches.length,
          knownLiving: initialDatabase.people.filter((p) => p.aliveStatus === 'alive').length,
          knownDeceased: initialDatabase.people.filter((p) => p.aliveStatus === 'deceased').length,
          maxGeneration: Math.max(...initialDatabase.people.map((p) => p.generation || 1)),
        },
      };
    }
  },

  // Auth
  login: async (password: string) => {
    const data = await fetchApi<{ success: boolean; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    if (data.token) {
      setAdminToken(data.token);
    }
    return data;
  },

  checkAuth: async () => {
    try {
      const data = await fetchApi<{ authenticated: boolean }>('/api/auth/check');
      return data.authenticated;
    } catch {
      return false;
    }
  },

  logout: () => {
    setAdminToken(null);
  },

  // People CRUD
  createPerson: (personData: Partial<Person>) =>
    fetchApi<Person>('/api/people', {
      method: 'POST',
      body: JSON.stringify(personData),
    }),

  updatePerson: (id: string, personData: Partial<Person>) =>
    fetchApi<Person>(`/api/people/${id}`, {
      method: 'PUT',
      body: JSON.stringify(personData),
    }),

  deletePerson: (id: string) =>
    fetchApi<{ success: boolean; deletedId: string }>(`/api/people/${id}`, {
      method: 'DELETE',
    }),

  // Branches CRUD
  createBranch: (branchData: Partial<FamilyBranch>) =>
    fetchApi<FamilyBranch>('/api/branches', {
      method: 'POST',
      body: JSON.stringify(branchData),
    }),

  updateBranch: (id: string, branchData: Partial<FamilyBranch>) =>
    fetchApi<FamilyBranch>(`/api/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(branchData),
    }),

  deleteBranch: (id: string) =>
    fetchApi<{ success: boolean; deletedId: string }>(`/api/branches/${id}`, {
      method: 'DELETE',
    }),

  // Import / Export
  previewImport: (items: any[]) =>
    fetchApi<ImportPreviewResult>('/api/import/preview', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  commitImport: (items: any[], skipDuplicates: boolean) =>
    fetchApi<{ success: boolean; addedCount: number }>('/api/import/commit', {
      method: 'POST',
      body: JSON.stringify({ items, skipDuplicates }),
    }),

  getExportUrl: (format: 'json' | 'csv' = 'json') => `/api/export?format=${format}`,

  // Audit Logs
  getAuditLogs: () => fetchApi<AuditLog[]>('/api/audit-logs'),

  // Admin Settings
  updateSettings: (data: { newPassword?: string; resetToSeed?: boolean }) =>
    fetchApi<{ success: boolean; message: string }>('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
