// ==========================================================================
// AICTE NIVARAN · Evidence helpers (real SHA-256 via Web Crypto)
// ==========================================================================

import { EvidenceFile } from '../types';

// crypto.subtle is only available in secure contexts (https or localhost)
export async function sha256Hex(file: File): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('SHA-256 hashing needs a secure context (https or localhost).');
  }
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function toEvidenceFiles(files: FileList | File[]): Promise<EvidenceFile[]> {
  return Promise.all(
    Array.from(files).map(async (file, idx) => ({
      id: `proof-${Date.now()}-${idx}`,
      name: file.name,
      size: file.size,
      type: file.type || 'document/attachment',
      sha256Hash: await sha256Hex(file),
      uploadDate: 'Just now'
    }))
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
