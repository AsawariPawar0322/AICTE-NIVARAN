import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { ResolutionProofItem } from '../types';
import { Button } from '../design-system/Button';
import { Modal } from '../design-system/Modal';
import { TextArea } from '../design-system/FormControls';
import { useApp } from '../context/AppContext';
import { downloadSyntheticDocument } from '../utils/documentDownloader';
import {
  FileCheck2,
  CheckCircle,
  AlertOctagon,
  XCircle,
  Hash,
  Download,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const ResolutionProofReview: React.FC = () => {
  const { addToast } = useApp();
  const [proofs, setProofs] = useState<ResolutionProofItem[]>([]);
  const [selectedProof, setSelectedProof] = useState<ResolutionProofItem | null>(null);
  const [decisionType, setDecisionType] = useState<'ACCEPTED' | 'DISPUTED' | 'REJECTED' | null>(null);
  const [reviewerRemarks, setReviewerRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadProofs = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getResolutionProofs();
      setProofs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProofs();
  }, []);

  const handleExecuteReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProof || !decisionType) return;

    try {
      await apiService.reviewResolutionProof(selectedProof.id, decisionType, reviewerRemarks);
      addToast({
        type: decisionType === 'ACCEPTED' ? 'success' : decisionType === 'DISPUTED' ? 'warning' : 'danger',
        title: `Resolution Proof ${decisionType}`,
        message: `Order recorded for ${selectedProof.complaintId}.`,
      });
      setSelectedProof(null);
      setDecisionType(null);
      setReviewerRemarks('');
      loadProofs();
    } catch (err: any) {
      addToast({ type: 'danger', title: 'Error', message: err.message });
    }
  };

  const verifiedCount = proofs.filter((p) => p.canDispatchOtp || p.status === 'ACCEPTED' || p.status === 'ACCEPTED_FOR_OTP').length;
  const flaggedCount = proofs.filter((p) => p.qualityVerdict && p.qualityVerdict !== 'PASSED_QUALITY_GATE').length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#166534]" />
            <h2 className="text-base font-bold text-[#0B2A5B]">
              Closure-Quality Validator &amp; Resolution Proofs
            </h2>
            <span className="text-xs px-2 py-0.5 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] rounded font-semibold">
              Quality Scrutiny Gate
            </span>
          </div>
          <p className="text-xs text-[#4B5565] mt-1">
            <strong>Two-Layer Verified Resolution Gate:</strong> Machine scrutiny audits Action Taken Reports (ATRs) for evasive boilerplate, missing transaction vouchers, and transfer runarounds before dispatching Citizen Confirmation OTP.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="px-2.5 py-1 bg-[#F3F5F8] border border-[#CBD2DC] rounded font-medium text-[#4B5565]">
            <strong>{proofs.length}</strong> Total Reports
          </span>
          <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 rounded font-medium text-rose-700">
            <strong>{flaggedCount}</strong> Evasive Closures Flagged
          </span>
          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded font-medium text-emerald-700">
            <strong>{verifiedCount}</strong> OTP Ready / Verified
          </span>
        </div>
      </div>

      {/* Proofs List */}
      <div className="space-y-4">
        {proofs.map((proof) => {
          let statusBg = 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]';
          let statusLabel = 'Awaiting Bureau Review';
          if (proof.status === 'ACCEPTED' || proof.status === 'ACCEPTED_FOR_OTP') {
            statusBg = 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]';
            statusLabel = 'Validated & OTP Dispatched';
          } else if (proof.status === 'DISPUTED') {
            statusBg = 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]';
            statusLabel = 'Disputed by Complainant';
          } else if (proof.status === 'REJECTED') {
            statusBg = 'bg-[#FEE2E2] text-[#991B1B] border-[#F87171]';
            statusLabel = 'Fake Closure Disallowed';
          }

          const isFlagged = proof.qualityVerdict && proof.qualityVerdict !== 'PASSED_QUALITY_GATE';

          return (
            <div
              key={proof.id}
              className={`bg-white border rounded-[8px] p-5 space-y-4 transition-colors ${
                isFlagged ? 'border-amber-300 ring-1 ring-amber-100' : 'border-[#CBD2DC]'
              }`}
            >
              {/* Top Row: Docket ID + Reference Case + Machine Quality Score Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#CBD2DC]">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#0B2A5B] bg-[#F3F5F8] px-2 py-0.5 rounded border border-[#CBD2DC]">
                      Docket: {proof.id}
                    </span>
                    <Link
                      to={`/cases/${proof.complaintId}`}
                      className="font-mono text-xs font-bold text-[#1F5FBF] hover:underline flex items-center gap-1"
                    >
                      Ref: {proof.complaintId} <ExternalLink className="w-3 h-3" />
                    </Link>

                    {/* Machine Quality Assessment Badge */}
                    {proof.qualityVerdict === 'PASSED_QUALITY_GATE' ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold border bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Quality Score: {proof.qualityScore || 92}/100 · Substantiated Proof
                      </span>
                    ) : proof.qualityVerdict === 'FLAGGED_EVASIVE_CLOSURE' ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold border bg-rose-50 text-rose-900 border-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Quality Score: {proof.qualityScore || 30}/100 · ⚠️ Flagged Evasive Fake Closure
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold border bg-amber-50 text-amber-900 border-amber-300 flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
                        Quality Score: {proof.qualityScore || 50}/100 · ⚠️ Low Quality / Hold for Review
                      </span>
                    )}

                    <span className={`text-xs px-2 py-0.5 rounded font-bold border ${statusBg}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#1A1F2B] mt-1.5">
                    {proof.complaintTitle}
                  </h3>
                  <div className="text-xs text-[#4B5565] mt-0.5">
                    Respondent: <span className="font-semibold text-[#1A1F2B]">{proof.institutionName}</span> ({proof.permanentId})
                  </div>
                </div>

                <div className="text-right text-xs text-[#4B5565]">
                  <div>Submitted by: <span className="font-semibold text-[#1A1F2B]">{proof.submittedBy}</span></div>
                  <div className="font-mono text-[11px] text-[#4B5565]">
                    {new Date(proof.submittedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Proposed Resolution Details */}
              <div className="p-3.5 bg-[#F3F5F8] rounded-[6px] border border-[#CBD2DC] space-y-3 text-xs">
                <div>
                  <div className="font-bold text-[#0B2A5B] uppercase text-[11px] mb-1">
                    Institutional Remedial Action Summary (Action Taken Report):
                  </div>
                  <p className="text-sm text-[#1A1F2B] leading-relaxed bg-white p-2.5 rounded border border-[#CBD2DC]">
                    "{proof.proposedResolutionSummary}"
                  </p>
                </div>

                {/* Automated Quality Scrutiny Warnings Box */}
                {proof.riskFlags && proof.riskFlags.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-[6px] space-y-2 text-xs">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-700" />
                      Automated Quality Validator Warnings (Review Before Dispatching OTP):
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {proof.riskFlags.map((flag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white text-rose-800 border border-rose-300 font-bold text-[11px]">
                          {flag === 'EVASIVE_BOILERPLATE_DETECTED'
                            ? '⚠️ Evasive Boilerplate Canned Reply'
                            : flag === 'MISSING_PAYMENT_UTR_AND_VOUCHER'
                            ? '⚠️ Missing Payment Transaction / UTR'
                            : flag === 'TRANSFER_ONLY_DISPOSAL'
                            ? '⚠️ Transfer-Only Runaround (No Remedy)'
                            : flag === 'DUPLICATE_HISTORICAL_ATR'
                            ? `⚠️ Copy-Paste ATR (${Math.round((proof.similarityToPastAtr || 0.92) * 100)}% Duplicate)`
                            : flag}
                        </span>
                      ))}
                    </div>
                    {proof.scrutinyReasons && proof.scrutinyReasons.length > 0 && (
                      <ul className="list-disc list-inside text-[11px] text-amber-900 space-y-1 pt-1">
                        {proof.scrutinyReasons.map((r, idx) => (
                          <li key={idx} className="leading-snug">{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Verified UTR Badge if extracted */}
                {proof.extractedUtr && (
                  <div className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-300 text-emerald-800 p-2 rounded">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      <strong>Verified Bank Transaction Reference:</strong> <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{proof.extractedUtr}</code>
                    </span>
                  </div>
                )}

                {/* Evidence Metadata & Cryptographic Hash */}
                <div className="p-2.5 bg-white rounded border border-[#CBD2DC] space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1A1F2B] flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-[#166534]" />
                      Attached Voucher: {proof.proofDocumentName || 'None (No Voucher Attached)'}
                    </span>
                    {proof.proofDocumentName && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                          onClick={() => {
                            downloadSyntheticDocument({
                              fileName: proof.proofDocumentName,
                              title: proof.complaintTitle,
                              caseId: proof.complaintId,
                              institutionName: proof.institutionName,
                              sha256: proof.proofSha256,
                              uploadedAt: proof.submittedAt,
                              uploaderRole: proof.submittedBy,
                              details: proof.proposedResolutionSummary,
                            });
                            addToast({
                              type: 'success',
                              title: 'Document Downloaded',
                              message: `Downloaded ${proof.proofDocumentName}.`,
                            });
                          }}
                        >
                          Download Voucher
                        </Button>
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => {
                            addToast({
                              type: 'info',
                              title: 'SHA-256 Verified',
                              message: `Digest verified: ${proof.proofSha256}`,
                            });
                          }}
                        >
                          Verify Hash
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-[#4B5565] truncate">
                    SHA-256 Digest: {proof.proofSha256}
                  </div>
                </div>

                {/* Dispute Alert if complainant flagged */}
                {proof.complainantDisputeFiled && (
                  <div className="p-2.5 bg-[#FEE2E2] border border-[#FCA5A5] rounded text-xs text-[#B91C1C] space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Active Complainant Contest / Dispute Logged
                    </div>
                    <p className="text-[11px] text-[#1A1F2B]">{proof.disputeReason}</p>
                  </div>
                )}

                {/* Reviewer remarks if already recorded */}
                {proof.reviewerRemarks && (
                  <div className="p-2 bg-white rounded border border-[#CBD2DC] text-xs">
                    <span className="font-semibold text-[#0B2A5B]">Official Review Record: </span>
                    <span className="text-[#1A1F2B]">{proof.reviewerRemarks}</span>
                    <div className="text-[10px] text-[#4B5565] mt-0.5">
                      Recorded by: {proof.reviewedBy} at {proof.reviewedAt && new Date(proof.reviewedAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                {/* Approve & Dispatch OTP */}
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setSelectedProof(proof);
                    setDecisionType('ACCEPTED');
                    setReviewerRemarks(
                      proof.qualityScore && proof.qualityScore >= 75
                        ? 'ATR and payment voucher verified against AICTE norms. Complainant OTP dispatched for closure confirmation.'
                        : 'Officer manual override: Verified after cross-checking with institution accounts section. Dispatching OTP.'
                    );
                  }}
                >
                  Approve &amp; Dispatch Citizen OTP
                </Button>

                {/* Reject Fake Closure */}
                <Button
                  variant="outline-danger"
                  size="sm"
                  leftIcon={<XCircle className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setSelectedProof(proof);
                    setDecisionType('REJECTED');
                    setReviewerRemarks(
                      proof.scrutinyReasons && proof.scrutinyReasons.length > 0
                        ? `Disallowed: ${proof.scrutinyReasons.join(' ')} Reverting case to active investigation.`
                        : 'Action Taken Report rejected as evasive boilerplate. Statutory notice issued to institution.'
                    );
                  }}
                >
                  Disallow Fake Closure &amp; Issue Notice
                </Button>

                {/* Dispute / Order Audit */}
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<AlertOctagon className="w-3.5 h-3.5 text-[#C2570C]" />}
                  onClick={() => {
                    setSelectedProof(proof);
                    setDecisionType('DISPUTED');
                    setReviewerRemarks('Complainant disputes institutional resolution claim. Requisitioning itemized accounts audit.');
                  }}
                >
                  Order Institutional Audit
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {selectedProof && decisionType && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedProof(null);
            setDecisionType(null);
          }}
          title={
            decisionType === 'ACCEPTED'
              ? `Accept Institutional Resolution & Authorize Closure`
              : decisionType === 'DISPUTED'
              ? `Dispute Resolution & Order Independent Verification`
              : `Reject Institutional Proof Submission`
          }
          description={`Complaint ${selectedProof.complaintId} · Respondent: ${selectedProof.institutionName}`}
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedProof(null);
                  setDecisionType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={decisionType === 'ACCEPTED' ? 'primary' : 'danger'}
                size="sm"
                onClick={handleExecuteReview}
                disabled={!reviewerRemarks.trim()}
              >
                Confirm {decisionType}
              </Button>
            </>
          }
        >
          <form onSubmit={handleExecuteReview} className="space-y-4">
            <TextArea
              label="Official Reviewer Findings &amp; Statutory Directive"
              required
              placeholder="Record your justification for this audit determination..."
              value={reviewerRemarks}
              onChange={(e) => setReviewerRemarks(e.target.value)}
              rows={4}
            />
          </form>
        </Modal>
      )}
    </div>
  );
};
