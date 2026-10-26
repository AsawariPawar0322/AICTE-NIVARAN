// ==========================================================================
// NIVARAN · Institution Directory & Scorecard Service (institutions.ts)
// ==========================================================================

import { Institution } from '../domain/types';
import { INITIAL_INSTITUTIONS } from './mockStore';

const STORAGE_KEY = 'nivaran_institutions_v2';

export function getInstitutions(): Institution[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading institutions from localStorage', err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INSTITUTIONS));
  return INITIAL_INSTITUTIONS;
}

export function saveInstitutions(institutions: Institution[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(institutions));
}

export function findInstitutionByPermanentId(permanentId: string): Institution | undefined {
  const list = getInstitutions();
  const clean = permanentId.trim().toUpperCase();
  return list.find(inst => inst.permanentId.toUpperCase() === clean);
}

export function searchInstitutions(query: string): Institution[] {
  const list = getInstitutions();
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(inst =>
    inst.name.toLowerCase().includes(q) ||
    inst.permanentId.toLowerCase().includes(q) ||
    inst.city.toLowerCase().includes(q) ||
    inst.state.toLowerCase().includes(q)
  );
}
