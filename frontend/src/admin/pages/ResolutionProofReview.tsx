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

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-[#166534]" />
          <h2 className="text-base font-bold text-[#0B2A5B]">
            Resolution Proofs
          </h2>
          <span className="text-xs px-2 py-0.5 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] rounded font-semibold">
            Proof Review
          </span>
        </div>
        <p className="text-xs text-[#4B5565] mt-1">
          Review proof documents submitted by colleges (such as fee refunds or return of certificates) before closing a complaint.
        </p>
      </div>

      {/* Proofs List */}
      <div className="space-y-4">
        {proofs.map((proof) => {
          let statusBg = 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]';
          let statusLabel = 'Awaiting Bureau Review';
          if (proof.status === 'ACCEPTED') {
            statusBg = 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]';
            statusLabel = 'Resolution Accepted & Case Closed';
          } else if (proof.status === 'DISPUTED') {
            statusBg = 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]';
            statusLabel = 'Disputed by Complainant';
          } else if (proof.status === 'REJECTED') {
            statusBg = 'bg-[#FEE2E2] text-[#991B1B] border-[#F87171]';
            statusLabel = 'Proof Rejected - Inadequate';
          }

          return (
            <div
              key={proof.id}
              className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 space-y-4"
            >
              {/* Top Row */}
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
              <div className="p-3.5 bg-[#F3F5F8] rounded-[6px] border border-[#CBD2DC] space-y-2 text-xs">
                <div className="font-bold text-[#0B2A5B] uppercase text-[11px]">
                  Institutional Remedial Action Summary:
                </div>
                <p className="text-sm text-[#1A1F2B] leading-relaxed">
                  {proof.proposedResolutionSummary}
                </p>

                {/* Evidence Metadata & Cryptographic Hash */}
                <div className="p-2.5 bg-white rounded border border-[#CBD2DC] space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1A1F2B] flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-[#166534]" />
                      Attached Voucher: {proof.proofDocumentName}
                    </span>
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
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setSelectedProof(proof);
                    setDecisionType('ACCEPTED');
                    setReviewerRemarks('Resolution verified with student confirmation; compliance satisfied.');
                  }}
                >
                  Accept &amp; Close Case
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<AlertOctagon className="w-3.5 h-3.5 text-[#C2570C]" />}
                  onClick={() => {
                    setSelectedProof(proof);
                    setDecisionType('DISPUTED');
                    setReviewerRemarks('Complainant disputes deduction amount. Requesting itemized bills.');
                  }}
                >
                  Dispute / Order Audit
                </Button>

                <Button
                  variant="outline-danger"
                  size="sm"
                  leftIcon={<XCircle className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setSelectedProof(proof);
                    setDecisionType('REJECTED');
                    setReviewerRemarks('Document is illegible and lacks official institutional stamp.');
                  }}
                >
                  Reject Proof
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
