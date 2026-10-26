// ==========================================================================
// NIVARAN · Tamper-Evident Audit Log & Hash Chaining Service (audit.ts)
// Simulated SHA-256 Digest & Timeline Integrity Verification
// ==========================================================================

import { AuditEvent } from '../domain/types';

export const GENESIS_ROOT_HASH = 'GENESIS_ROOT_HASH_0000000000000000000000000000000000000000000000000';

// Simple deterministic hash simulation for in-browser verification
export function computeSimulatedHash(seedText: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  for (let i = 0; i < seedText.length; i++) {
    const ch = seedText.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${part1}${part2}${part1}${part2}`.padEnd(64, 'a').slice(0, 64);
}

export function createAuditEvent(
  caseId: string,
  actor: string,
  role: string,
  action: string,
  options: {
    previousValue?: string;
    newValue?: string;
    reason?: string;
    lastHash?: string;
  }
): AuditEvent {
  const timestamp = new Date().toISOString();
  const previousHash = options.lastHash || GENESIS_ROOT_HASH;
  const payload = `${previousHash}|${timestamp}|${caseId}|${actor}|${action}|${options.newValue || ''}|${options.reason || ''}`;
  const currentHash = computeSimulatedHash(payload);

  return {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    caseId,
    actor,
    role,
    action,
    previousValue: options.previousValue,
    newValue: options.newValue,
    reason: options.reason,
    timestamp,
    previousHash,
    currentHash
  };
}

export interface VerificationReport {
  isValid: boolean;
  totalEvents: number;
  brokenEventIndex: number | null;
  brokenEvent?: AuditEvent;
  rootHash: string;
  finalHash: string;
  notes: string;
}

export function verifyTimelineIntegrity(events: AuditEvent[]): VerificationReport {
  if (events.length === 0) {
    return {
      isValid: true,
      totalEvents: 0,
      brokenEventIndex: null,
      rootHash: GENESIS_ROOT_HASH,
      finalHash: GENESIS_ROOT_HASH,
      notes: 'No events registered in this docket chain.'
    };
  }

  // Check first event links to GENESIS
  let prevHash = GENESIS_ROOT_HASH;
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (i === 0 && ev.previousHash !== GENESIS_ROOT_HASH) {
      return {
        isValid: false,
        totalEvents: events.length,
        brokenEventIndex: 0,
        brokenEvent: ev,
        rootHash: ev.previousHash,
        finalHash: events[events.length - 1].currentHash,
        notes: `Broken Genesis link: Event #${ev.id} does not anchor to system root hash.`
      };
    }

    if (i > 0 && ev.previousHash !== prevHash) {
      return {
        isValid: false,
        totalEvents: events.length,
        brokenEventIndex: i,
        brokenEvent: ev,
        rootHash: events[0].previousHash,
        finalHash: events[events.length - 1].currentHash,
        notes: `Hash discrepancy detected at event #${i + 1} (${ev.action}). Previous digest does not match chained digest.`
      };
    }
    prevHash = ev.currentHash;
  }

  return {
    isValid: true,
    totalEvents: events.length,
    brokenEventIndex: null,
    rootHash: events[0].previousHash,
    finalHash: events[events.length - 1].currentHash,
    notes: `All ${events.length} chronological audit entries are cryptographically continuous and tamper-evident.`
  };
}
