import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { FamilyDatabase, Person, Relationship, FamilyBranch, AuditLog, ImportPreviewResult } from './src/types';
import { initialDatabase } from './src/data/seedData';
import { validateRelationship } from './src/lib/utils';

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'data', 'family_database.json');
const ADMIN_TOKEN = 'mazid_khail_admin_secure_session_2026';

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// Load or initialize Database
function loadDatabase(): FamilyDatabase {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const db = JSON.parse(content) as FamilyDatabase;
      return db;
    }
  } catch (err) {
    console.error('Error loading database file, reinitializing:', err);
  }
  // Initialize with seed data
  saveDatabase(initialDatabase);
  return initialDatabase;
}

function saveDatabase(db: FamilyDatabase) {
  db.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

let db = loadDatabase();

function addAuditLog(
  action: AuditLog['action'],
  details: string,
  personId?: string,
  personName?: string,
  previousValue?: string,
  newValue?: string
) {
  const log: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    personId,
    personName,
    previousValue,
    newValue,
  };
  db.auditLogs.unshift(log);
  // Keep last 200 audit logs
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }
}

// Auth Middleware
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '') || req.query.token;

  if (token === ADMIN_TOKEN) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: db.version, lastUpdated: db.lastUpdated });
  });

  // Auth check
  app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    const expectedPassword = db.adminPasswordHash || 'admin123';

    if (password === expectedPassword) {
      return res.json({ success: true, token: ADMIN_TOKEN });
    }
    return res.status(401).json({ error: 'Invalid admin password.' });
  });

  app.get('/api/auth/check', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
    if (token === ADMIN_TOKEN) {
      return res.json({ authenticated: true });
    }
    return res.json({ authenticated: false });
  });

  // Database GET (Public Read-Only)
  app.get('/api/database', (req, res) => {
    res.json({
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
        maxGeneration: Math.max(0, ...db.people.map((p) => p.generation || 1)),
      },
    });
  });

  // Person CRUD
  app.post('/api/people', requireAdminAuth, (req, res) => {
    const personData: Partial<Person> = req.body;
    if (!personData.fullName || !personData.fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }

    const now = new Date().toISOString();
    const newPerson: Person = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      fullName: personData.fullName.trim(),
      fatherId: personData.fatherId || null,
      motherId: personData.motherId || null,
      birthDate: personData.birthDate || null,
      deathDate: personData.deathDate || null,
      aliveStatus: personData.aliveStatus || 'unknown',
      photograph: personData.photograph || null,
      biography: personData.biography || null,
      notes: personData.notes || null,
      occupation: personData.occupation || null,
      location: personData.location || null,
      generation: personData.generation || 1,
      branchId: personData.branchId || null,
      branchName: personData.branchName || null,
      createdAt: now,
      updatedAt: now,
    };

    // Automatically calculate generation if father exists
    if (newPerson.fatherId) {
      const father = db.people.find((p) => p.id === newPerson.fatherId);
      if (father) {
        newPerson.generation = father.generation + 1;
        if (!newPerson.branchId && father.branchId) {
          newPerson.branchId = father.branchId;
          newPerson.branchName = father.branchName;
        }
      }
    }

    db.people.push(newPerson);

    // Auto create parent-child relationship if fatherId is provided
    if (newPerson.fatherId) {
      const rel: Relationship = {
        id: `rel_${newPerson.fatherId}_${newPerson.id}`,
        type: 'parent_child',
        personId1: newPerson.fatherId,
        personId2: newPerson.id,
        createdAt: now,
      };
      db.relationships.push(rel);
    }

    addAuditLog('PERSON_ADDED', `Added new person: ${newPerson.fullName}`, newPerson.id, newPerson.fullName);
    saveDatabase(db);

    return res.status(201).json(newPerson);
  });

  app.put('/api/people/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const index = db.people.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Person not found.' });
    }

    const existingPerson = db.people[index];
    const updateData: Partial<Person> = req.body;

    // Validate relationship if father is changing
    if (updateData.fatherId && updateData.fatherId !== existingPerson.fatherId) {
      const validation = validateRelationship(updateData.fatherId, id, db.people);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
    }

    const updatedPerson: Person = {
      ...existingPerson,
      fullName: updateData.fullName !== undefined ? updateData.fullName.trim() : existingPerson.fullName,
      fatherId: updateData.fatherId !== undefined ? updateData.fatherId : existingPerson.fatherId,
      motherId: updateData.motherId !== undefined ? updateData.motherId : existingPerson.motherId,
      birthDate: updateData.birthDate !== undefined ? updateData.birthDate : existingPerson.birthDate,
      deathDate: updateData.deathDate !== undefined ? updateData.deathDate : existingPerson.deathDate,
      aliveStatus: updateData.aliveStatus !== undefined ? updateData.aliveStatus : existingPerson.aliveStatus,
      photograph: updateData.photograph !== undefined ? updateData.photograph : existingPerson.photograph,
      biography: updateData.biography !== undefined ? updateData.biography : existingPerson.biography,
      notes: updateData.notes !== undefined ? updateData.notes : existingPerson.notes,
      occupation: updateData.occupation !== undefined ? updateData.occupation : existingPerson.occupation,
      location: updateData.location !== undefined ? updateData.location : existingPerson.location,
      generation: updateData.generation !== undefined ? updateData.generation : existingPerson.generation,
      branchId: updateData.branchId !== undefined ? updateData.branchId : existingPerson.branchId,
      branchName: updateData.branchName !== undefined ? updateData.branchName : existingPerson.branchName,
      updatedAt: new Date().toISOString(),
    };

    // Update parent-child relationship if father changed
    if (updateData.fatherId !== undefined && updateData.fatherId !== existingPerson.fatherId) {
      // remove old relationship
      db.relationships = db.relationships.filter(
        (r) => !(r.type === 'parent_child' && r.personId2 === id && r.personId1 === existingPerson.fatherId)
      );
      // add new relationship if new father exists
      if (updateData.fatherId) {
        db.relationships.push({
          id: `rel_${updateData.fatherId}_${id}`,
          type: 'parent_child',
          personId1: updateData.fatherId,
          personId2: id,
          createdAt: new Date().toISOString(),
        });
      }
    }

    db.people[index] = updatedPerson;
    addAuditLog(
      'PERSON_UPDATED',
      `Updated profile for ${updatedPerson.fullName}`,
      updatedPerson.id,
      updatedPerson.fullName,
      JSON.stringify(existingPerson),
      JSON.stringify(updatedPerson)
    );
    saveDatabase(db);

    return res.json(updatedPerson);
  });

  app.delete('/api/people/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const person = db.people.find((p) => p.id === id);
    if (!person) {
      return res.status(404).json({ error: 'Person not found.' });
    }

    // Cascade delete relationships involving this person
    db.people = db.people.filter((p) => p.id !== id);
    db.relationships = db.relationships.filter((r) => r.personId1 !== id && r.personId2 !== id);

    // Update children's fatherId/motherId pointers
    db.people.forEach((p) => {
      if (p.fatherId === id) p.fatherId = null;
      if (p.motherId === id) p.motherId = null;
    });

    // Clean up branch patriarch pointers
    db.branches.forEach((b) => {
      if (b.patriarchPersonId === id) b.patriarchPersonId = null;
    });

    addAuditLog('PERSON_DELETED', `Deleted person: ${person.fullName}`, id, person.fullName);
    saveDatabase(db);

    return res.json({ success: true, deletedId: id });
  });

  // Branch CRUD
  app.post('/api/branches', requireAdminAuth, (req, res) => {
    const { name, parentBranchId, description, patriarchPersonId } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Branch name is required.' });

    const newBranch: FamilyBranch = {
      id: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      parentBranchId: parentBranchId || null,
      description: description || null,
      patriarchPersonId: patriarchPersonId || null,
    };

    db.branches.push(newBranch);
    addAuditLog('BRANCH_CREATED', `Created new branch: ${newBranch.name}`);
    saveDatabase(db);

    return res.status(201).json(newBranch);
  });

  app.put('/api/branches/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const branchIndex = db.branches.findIndex((b) => b.id === id);
    if (branchIndex === -1) return res.status(404).json({ error: 'Branch not found.' });

    const { name, parentBranchId, description, patriarchPersonId } = req.body;
    db.branches[branchIndex] = {
      ...db.branches[branchIndex],
      name: name ? name.trim() : db.branches[branchIndex].name,
      parentBranchId: parentBranchId !== undefined ? parentBranchId : db.branches[branchIndex].parentBranchId,
      description: description !== undefined ? description : db.branches[branchIndex].description,
      patriarchPersonId: patriarchPersonId !== undefined ? patriarchPersonId : db.branches[branchIndex].patriarchPersonId,
    };

    addAuditLog('BRANCH_UPDATED', `Updated branch: ${db.branches[branchIndex].name}`);
    saveDatabase(db);

    return res.json(db.branches[branchIndex]);
  });

  app.delete('/api/branches/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const branchIndex = db.branches.findIndex((b) => b.id === id);
    if (branchIndex === -1) return res.status(404).json({ error: 'Branch not found.' });

    const branchName = db.branches[branchIndex].name;
    db.branches = db.branches.filter((b) => b.id !== id);

    // Unset branchId on people belonging to this branch
    db.people.forEach((p) => {
      if (p.branchId === id) {
        p.branchId = null;
        p.branchName = null;
      }
    });

    addAuditLog('BRANCH_DELETED', `Deleted branch: ${branchName}`);
    saveDatabase(db);

    return res.json({ success: true, deletedId: id });
  });

  // Import Preview & Commit
  app.post('/api/import/preview', requireAdminAuth, (req, res) => {
    const { items } = req.body; // array of raw person objects
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Import items must be an array.' });
    }

    const previewItems: ImportPreviewResult['items'] = [];
    let validCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    for (const item of items) {
      if (!item.fullName || typeof item.fullName !== 'string') {
        errorCount++;
        previewItems.push({
          person: item,
          isDuplicate: false,
          status: 'error',
          validationMessage: 'Missing full name.',
        });
        continue;
      }

      // Duplicate check by full name and fatherId or birthDate
      const existing = db.people.find(
        (p) =>
          p.fullName.toLowerCase().trim() === item.fullName.toLowerCase().trim() &&
          (!item.fatherId || p.fatherId === item.fatherId)
      );

      if (existing) {
        duplicateCount++;
        previewItems.push({
          person: item,
          isDuplicate: true,
          duplicateReason: `Record with name "${item.fullName}" already exists in database.`,
          status: 'warning',
          validationMessage: 'Duplicate entry detected.',
        });
      } else {
        validCount++;
        previewItems.push({
          person: item,
          isDuplicate: false,
          status: 'valid',
        });
      }
    }

    return res.json({
      validCount,
      duplicateCount,
      errorCount,
      items: previewItems,
      canImport: validCount > 0 || duplicateCount > 0,
    });
  });

  app.post('/api/import/commit', requireAdminAuth, (req, res) => {
    const { items, skipDuplicates } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Items must be an array.' });

    let addedCount = 0;
    const now = new Date().toISOString();

    for (const raw of items) {
      if (!raw.fullName) continue;

      if (skipDuplicates) {
        const existing = db.people.find(
          (p) => p.fullName.toLowerCase().trim() === raw.fullName.toLowerCase().trim()
        );
        if (existing) continue;
      }

      const newPerson: Person = {
        id: `p_imp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        fullName: raw.fullName.trim(),
        fatherId: raw.fatherId || null,
        motherId: raw.motherId || null,
        birthDate: raw.birthDate || null,
        deathDate: raw.deathDate || null,
        aliveStatus: raw.aliveStatus || 'unknown',
        photograph: raw.photograph || null,
        biography: raw.biography || null,
        notes: raw.notes || null,
        generation: raw.generation || 1,
        branchId: raw.branchId || null,
        branchName: raw.branchName || null,
        createdAt: now,
        updatedAt: now,
      };

      db.people.push(newPerson);

      if (newPerson.fatherId) {
        db.relationships.push({
          id: `rel_${newPerson.fatherId}_${newPerson.id}`,
          type: 'parent_child',
          personId1: newPerson.fatherId,
          personId2: newPerson.id,
          createdAt: now,
        });
      }

      addedCount++;
    }

    addAuditLog('DATA_IMPORTED', `Imported ${addedCount} records into the family database.`);
    saveDatabase(db);

    return res.json({ success: true, addedCount });
  });

  // Export Data
  app.get('/api/export', (req, res) => {
    const format = req.query.format || 'json';
    if (format === 'csv') {
      const headers = ['id', 'fullName', 'fatherId', 'generation', 'birthDate', 'deathDate', 'aliveStatus', 'branchName', 'notes'];
      const rows = db.people.map((p) => [
        p.id,
        `"${(p.fullName || '').replace(/"/g, '""')}"`,
        p.fatherId || '',
        p.generation || 1,
        p.birthDate || '',
        p.deathDate || '',
        p.aliveStatus || '',
        `"${(p.branchName || '').replace(/"/g, '""')}"`,
        `"${(p.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="mazid_khail_family_data.csv"');
      return res.send(csvContent);
    }

    // Default JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="mazid_khail_family_data.json"');
    return res.send(JSON.stringify(db, null, 2));
  });

  // Audit logs GET
  app.get('/api/audit-logs', requireAdminAuth, (req, res) => {
    res.json(db.auditLogs);
  });

  // Admin Settings & Reset
  app.post('/api/admin/settings', requireAdminAuth, (req, res) => {
    const { newPassword, resetToSeed } = req.body;

    if (resetToSeed) {
      db = JSON.parse(JSON.stringify(initialDatabase));
      addAuditLog('DATA_RESTORED', 'Reset database to initial PDF family history seed dataset.');
      saveDatabase(db);
      return res.json({ success: true, message: 'Database reset to initial PDF seed state.' });
    }

    if (newPassword && newPassword.trim().length >= 6) {
      db.adminPasswordHash = newPassword.trim();
      addAuditLog('PERSON_UPDATED', 'Admin password updated.');
      saveDatabase(db);
      return res.json({ success: true, message: 'Admin password updated successfully.' });
    }

    return res.status(400).json({ error: 'Invalid settings request.' });
  });

  // Explicit Android APK Download Handlers
  const handleApkDownload = (req: Request, res: Response) => {
    const apkPath = path.join(process.cwd(), 'public', 'Mazid_Khail_Family_Archive.apk');
    if (fs.existsSync(apkPath)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="Mazid_Khail_Family_Archive.apk"');
      const stat = fs.statSync(apkPath);
      res.setHeader('Content-Length', stat.size);
      const readStream = fs.createReadStream(apkPath);
      return readStream.pipe(res);
    }
    return res.status(404).send('APK file not found on server.');
  };

  app.get('/download-apk', handleApkDownload);
  app.get('/Mazid_Khail_Family_Archive.apk', handleApkDownload);
  app.get('/Khan_Family_Archive.apk', handleApkDownload);

  // Serve Vite in Development or Static Dist in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mazid Khail Family Database server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
