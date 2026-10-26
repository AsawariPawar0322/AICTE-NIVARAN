import React from 'react';
import { GraphClusterNode, GraphGrievanceNode } from './types';
import { Button } from '../../design-system/Button';
import {
  GitCompare,
  X,
  CheckCircle2,
  AlertTriangle,
  Link2,
  Unlink2,
  FileText,
  Calendar,
  Coins,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface ComplaintCompareModalProps {
  cluster: GraphClusterNode | null;
  complaintsMap: Record<string, GraphGrievanceNode>;
  isOpen: boolean;
  onClose: () => void;
  onConfirmLink: (cluster: GraphClusterNode) => void;
  onUnlink: (cluster: GraphClusterNode) => void;
}

export const ComplaintCompareModal: React.FC<ComplaintCompareModalProps> = ({
  cluster,
  complaintsMap,
  isOpen,
  onClose,
  onConfirmLink,
  onUnlink,
}) => {
  if (!isOpen || !cluster) return null;

  const complaints = cluster.complaintIds
    .map((id) => complaintsMap[id])
    .filter(Boolean);

  const c1 = complaints[0];
  const c2 = complaints[1] || complaints[0];
  const isConfirmed = cluster.status === 'CONFIRMED_LINK';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#CBD2DC] rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#CBD2DC] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E6EEF9] text-[#1F5FBF] flex items-center justify-center">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0B2A5B]">
                Side-by-Side Grievance Correlation Inspection
              </h3>
              <p className="text-xs text-[#64748B]">
                Cluster: <strong>{cluster.title}</strong> · AI Confidence Score: <strong>{cluster.confidenceScore}%</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#64748B] hover:text-[#0B2A5B] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* AI Evidence Alignment Summary Strip */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg space-y-1.5">
            <div className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Correlated Evidence Factors (Why AI Recommends Joint Review):</span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-amber-950 font-medium pt-1">
              {cluster.whyLinked.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-white border border-amber-200 shadow-2xs"
                >
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="border border-[#CBD2DC] rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#CBD2DC] text-[#475569] font-bold uppercase text-[10.5px]">
                  <th className="py-2.5 px-3 w-1/4">Regulatory Attribute</th>
                  <th className="py-2.5 px-3 w-3/8 border-l border-[#CBD2DC] text-[#0B2A5B]">
                    Case A: {c1?.id}
                  </th>
                  <th className="py-2.5 px-3 w-3/8 border-l border-[#CBD2DC] text-[#0B2A5B]">
                    Case B: {c2?.id}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD2DC]">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#64748B] bg-[#F8FAFC]">
                    Complainant Perspective
                  </td>
                  <td className="py-2.5 px-3 border-l border-[#CBD2DC] font-medium">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[11px] font-semibold">
                      {c1?.complainantRole === 'PARENT' ? 'Parent View' : 'Student View'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 border-l border-[#CBD2DC] font-medium">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px] font-semibold">
                      {c2?.complainantRole === 'PARENT' ? 'Parent View' : 'Student View'}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#64748B] bg-[#F8FAFC]">
                    Issue Category
                  </td>
                  <td className="py-2.5 px-3 border-l border-[#CBD2DC] font-semibold text-[#1E293B]">
                    {c1?.category}
                  </td>
                  <td className="py-2.5 px-3 border-l border-[#CBD2DC] font-semibold text-[#1E293B]">
                    {c2?.category}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#64748B] bg-[#F8FAFC]">
                    Disputed Amount
                  </td>
                  <td className="py-2.5 px-3 border-l border-[#CBD2DC] font-mono font-bold text-[#C2570C]">
                    {c1?.disputedAmount || '₹44,000'}
                  </td>
                  <td className="py-2.5 px-3 border-l border-[#CBD2DC] font-mono font-bold text-[#C2570C]">
                    {c2?.disputedAmount || '₹44,000'}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#64748B] bg-[#F8FAFC]">
                    Date Registered
                  </td>
                  <td className="py-2.5 px-3 border-l border-[#CBD2DC] font-mono text-[#64748B]">
                    {c1?.submittedAt}
                  </td>
                  <td className="py-2.5 px-3 border-l border-[#CBD2DC] font-mono text-[#64748B]">
                    {c2?.submittedAt}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#64748B] bg-[#F8FAFC]">
                    Core Statement of Facts
                  </td>
                  <td className="py-2.5 px-3 border-l border-[#CBD2DC] leading-relaxed text-[#1E293B]">
                    "{c1?.description}"
                  </td>
                  <td className="py-2.5 px-3 border-l border-[#CBD2DC] leading-relaxed text-[#1E293B]">
                    "{c2?.description}"
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#64748B] bg-[#F8FAFC]">
                    Verified Attachments
                  </td>
                  <td className="py-2.5 px-3 border-l border-[#CBD2DC] text-[#166534] font-semibold">
                    {c1?.evidenceCount} Document(s) (Fee Receipts / Email Proof)
                  </td>
                  <td className="py-2.5 px-3 border-l border-[#CBD2DC] text-[#166534] font-semibold">
                    {c2?.evidenceCount} Document(s) (Cancellation Acknowledgment)
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#64748B] bg-[#F8FAFC]">
                    Assigned Bureau
                  </td>
                  <td className="py-2.5 px-3 border-l border-[#CBD2DC] text-[#1E293B]">
                    {c1?.assignedBureau}
                  </td>
                  <td className="py-2.5 px-3 border-l border-[#CBD2DC] text-[#1E293B]">
                    {c2?.assignedBureau}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#CBD2DC] bg-[#F8FAFC] flex items-center justify-between">
          <span className="text-[11px] text-[#64748B] italic">
            Connecting cases authorizes joint inquiry under AICTE Regulation Clause 11.2.
          </span>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close Inspection
            </Button>

            {isConfirmed ? (
              <Button
                variant="outline-danger"
                size="sm"
                leftIcon={<Unlink2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  onUnlink(cluster);
                  onClose();
                }}
              >
                Separate Inquiries
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Link2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  onConfirmLink(cluster);
                  onClose();
                }}
              >
                Confirm Joint Inquiry
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
