// ==========================================================================
// NIVARAN · Potential Overlap & Similar Complaint Scoring Engine (similarity.ts)
// Permanent ID & Normalized Identity First, Contextual Keywords Second
// ==========================================================================

import { Complaint, GrievanceCategory } from './types';

export interface SimilarityResult {
  complaint: Complaint;
  score: number;
  matchReasons: string[];
  isSameInstitution: boolean;
  isSameCategory: boolean;
  sharedKeywords: string[];
}

const KEYWORD_STOPLIST = new Set([
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with', 'from',
  'my', 'i', 'our', 'college', 'institute', 'student', 'year', 'semester', 'after', 'please'
]);

function extractKeywords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !KEYWORD_STOPLIST.has(w));
  return new Set(words);
}

export function computeSimilarity(
  query: {
    institutionName?: string;
    aictePermanentId?: string;
    category?: GrievanceCategory;
    title?: string;
    details?: string;
  },
  candidate: Complaint
): SimilarityResult {
  const matchReasons: string[] = [];
  let score = 0;

  // Rule 1: AICTE Permanent ID match (Weight: 45%)
  const cleanQueryPerm = query.aictePermanentId?.trim().toUpperCase();
  const cleanCandPerm = candidate.aictePermanentId?.trim().toUpperCase();
  const isSamePermanentId = Boolean(cleanQueryPerm && cleanCandPerm && cleanQueryPerm === cleanCandPerm);

  const cleanQueryInst = query.institutionName?.trim().toLowerCase();
  const cleanCandInst = candidate.institutionName?.trim().toLowerCase();
  const isSameInstName = Boolean(cleanQueryInst && cleanCandInst && cleanQueryInst === cleanCandInst);

  const isSameInstitution = isSamePermanentId || isSameInstName;

  if (isSamePermanentId) {
    score += 45;
    matchReasons.push(`Exact AICTE Permanent ID match: ${candidate.aictePermanentId}`);
  } else if (isSameInstName) {
    score += 35;
    matchReasons.push(`Matching Institution: ${candidate.institutionName}`);
  }

  // Rule 2: Grievance Category Match (Weight: 25%)
  const isSameCategory = Boolean(query.category && query.category === candidate.category);
  if (isSameCategory) {
    score += 25;
    matchReasons.push(`Identical Category: ${candidate.categoryLabel}`);
  }

  // Rule 3: Text & Keyword Overlap (Weight: 30%)
  const queryText = `${query.title || ''} ${query.details || ''}`;
  const candText = `${candidate.title} ${candidate.details}`;
  const queryWords = extractKeywords(queryText);
  const candWords = extractKeywords(candText);

  const shared: string[] = [];
  queryWords.forEach(word => {
    if (candWords.has(word)) {
      shared.push(word);
    }
  });

  if (shared.length > 0) {
    const textBonus = Math.min(30, shared.length * 6);
    score += textBonus;
    matchReasons.push(`Shared descriptive terms: ${shared.slice(0, 4).join(', ')}`);
  }

  return {
    complaint: candidate,
    score: Math.min(99, score),
    matchReasons,
    isSameInstitution,
    isSameCategory,
    sharedKeywords: shared
  };
}

export function findSimilarComplaints(
  query: {
    institutionName?: string;
    aictePermanentId?: string;
    category?: GrievanceCategory;
    title?: string;
    details?: string;
  },
  allComplaints: Complaint[],
  excludeId?: string
): SimilarityResult[] {
  return allComplaints
    .filter(c => c.id !== excludeId)
    .map(c => computeSimilarity(query, c))
    .filter(res => res.score >= 35)
    .sort((a, b) => b.score - a.score);
}
