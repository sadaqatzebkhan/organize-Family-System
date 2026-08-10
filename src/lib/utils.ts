import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Person, Relationship } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Not available';
  // Check if it's year only
  if (/^\d{4}$/.test(dateStr)) return dateStr;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
}

export function getParents(person: Person, people: Person[]): { father?: Person; mother?: Person } {
  const father = person.fatherId ? people.find((p) => p.id === person.fatherId) : undefined;
  const mother = person.motherId ? people.find((p) => p.id === person.motherId) : undefined;
  return { father, mother };
}

export function getChildren(personId: string, people: Person[]): Person[] {
  return people.filter((p) => p.fatherId === personId || p.motherId === personId);
}

export function getSiblings(person: Person, people: Person[]): Person[] {
  if (!person.fatherId && !person.motherId) return [];
  return people.filter(
    (p) =>
      p.id !== person.id &&
      ((person.fatherId && p.fatherId === person.fatherId) ||
        (person.motherId && p.motherId === person.motherId))
  );
}

export function getAncestors(personId: string, people: Person[]): Person[] {
  const ancestors: Person[] = [];
  const visited = new Set<string>();

  function traverse(currentId: string) {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    const person = people.find((p) => p.id === currentId);
    if (!person) return;

    if (person.fatherId) {
      const father = people.find((p) => p.id === person.fatherId);
      if (father) {
        ancestors.push(father);
        traverse(father.id);
      }
    }
    if (person.motherId) {
      const mother = people.find((p) => p.id === person.motherId);
      if (mother) {
        ancestors.push(mother);
        traverse(mother.id);
      }
    }
  }

  traverse(personId);
  return ancestors;
}

export function getDescendants(personId: string, people: Person[]): Person[] {
  const descendants: Person[] = [];
  const visited = new Set<string>();

  function traverse(currentId: string) {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    const children = getChildren(currentId, people);
    for (const child of children) {
      descendants.push(child);
      traverse(child.id);
    }
  }

  traverse(personId);
  return descendants;
}

export function getAncestralPath(personId: string, people: Person[]): Person[] {
  const path: Person[] = [];
  let current = people.find((p) => p.id === personId);

  while (current) {
    path.unshift(current);
    if (current.fatherId) {
      current = people.find((p) => p.id === current!.fatherId);
    } else if (current.motherId) {
      current = people.find((p) => p.id === current!.motherId);
    } else {
      current = undefined;
    }
  }

  return path;
}

/**
 * Validates a potential parent-child relationship to prevent circular dependencies
 */
export function validateRelationship(
  parentId: string,
  childId: string,
  people: Person[]
): { valid: boolean; error?: string } {
  if (parentId === childId) {
    return { valid: false, error: 'A person cannot be their own parent.' };
  }

  // Check if child is an ancestor of the parent (would cause a cycle)
  const ancestorsOfParent = getAncestors(parentId, people);
  if (ancestorsOfParent.some((a) => a.id === childId)) {
    return {
      valid: false,
      error: 'Circular relationship detected: Child is already an ancestor of the specified parent.',
    };
  }

  return { valid: true };
}
