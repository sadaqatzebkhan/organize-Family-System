export interface Person {
  id: string;
  fullName: string;
  fatherId?: string | null;
  motherId?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  aliveStatus?: 'alive' | 'deceased' | 'unknown';
  photograph?: string | null; // URL or base64 data
  biography?: string | null;
  notes?: string | null;
  occupation?: string | null;
  location?: string | null;
  generation: number;
  branchId?: string | null;
  branchName?: string | null;
  isAmbiguous?: boolean; // Flagged if source had incomplete/uncertain relationship
  ambiguityNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  id: string;
  type: 'parent_child' | 'spouse';
  personId1: string; // e.g., Father / Husband
  personId2: string; // e.g., Child / Wife
  createdAt: string;
}

export interface FamilyBranch {
  id: string;
  name: string;
  parentBranchId?: string | null;
  description?: string | null;
  patriarchPersonId?: string | null;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'PERSON_ADDED' | 'PERSON_UPDATED' | 'PERSON_DELETED' | 'RELATIONSHIP_ADDED' | 'RELATIONSHIP_REMOVED' | 'BRANCH_CREATED' | 'BRANCH_UPDATED' | 'BRANCH_DELETED' | 'DATA_IMPORTED' | 'DATA_RESTORED';
  personId?: string;
  personName?: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderBranch?: string | null;
  text: string;
  timestamp: string;
  pinned?: boolean;
  isVerified?: boolean;
  likes?: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface ChatMessageLog {
  id: string;
  messageId: string;
  senderName: string;
  deletedBy?: string;
  text: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  action: 'MESSAGE_SENT' | 'MESSAGE_DELETED';
}

export interface RestrictedUser {
  name: string;
  restrictedAt: string;
  restrictedBy?: string;
  reason?: string;
}

export interface FamilyDatabase {
  people: Person[];
  relationships: Relationship[];
  branches: FamilyBranch[];
  auditLogs: AuditLog[];
  messages?: ChatMessage[];
  messageLogs?: ChatMessageLog[];
  restrictedUsers?: RestrictedUser[];
  adminPasswordHash?: string;
  version: string;
  lastUpdated: string;
}

export interface ImportPreviewItem {
  person: Partial<Person>;
  isDuplicate: boolean;
  duplicateReason?: string;
  status: 'valid' | 'warning' | 'error';
  validationMessage?: string;
}

export interface ImportPreviewResult {
  validCount: number;
  duplicateCount: number;
  errorCount: number;
  items: ImportPreviewItem[];
  canImport: boolean;
}

export type TreeViewStyle = 'traditional' | 'interactive' | 'singlePage';

export interface TreeFilterOptions {
  searchQuery: string;
  selectedBranchId: string;
  selectedGeneration: number | 'all';
  aliveFilter: 'all' | 'alive' | 'deceased';
}
