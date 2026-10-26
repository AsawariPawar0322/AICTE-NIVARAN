import React from 'react';
import { Link } from 'react-router-dom';
import {
  SelectedNodeState,
  GraphClusterNode,
  GraphGrievanceNode,
  GraphInstitutionNode,
} from './types';
import { Button } from '../../design-system/Button';
import {
  Building2,
  FileText,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  GitCompare,
  Link2,
  Unlink2,
  X,
  User,
  Users,
  AlertOctagon,
  Calendar,
} from 'lucide-react';

interface ClusterDetailsPanelProps {
  selectedNode: SelectedNodeState;
  complaintsMap: Record<string, GraphGrievanceNode>;
  onClose: () => void;
  onOpenCompare: (cluster: GraphClusterNode) => void;
  onConfirmLink: (cluster: GraphClusterNode) => void;
  onUnlink: (cluster: GraphClusterNode) => void;
  onSelectGrievance: (grievance: GraphGrievanceNode, cluster: GraphClusterNode) => void;
}

export const ClusterDetailsPanel: React.FC<ClusterDetailsPanelProps> = ({
  selectedNode,
  complaintsMap,
  onClose,
  onOpenCompare,
  onConfirmLink,
  onUnlink,
  onSelectGrievance,
}) => {
  if (!selectedNode.type) {
    return (
      <div className="h-full bg-white border border-[#CBD2DC] rounded-lg p-6 flex flex-col items-center justify-center text-center text-[#64748B] space-y-2">
        <div className="w-10 h-10 rounded-full bg-[#F1F5F9] border border-[#CBD2DC] flex items-center justify-center text-[#0B2A5B]">
          <GitCompare className="w-5 h-5 text-[#1F5FBF]" />
        </div>
        <h4 className="font-bold text-sm text-[#0B2A5B]">Interactive Inspection Desk</h4>
        <p className="text-xs max-w-xs text-[#64748B]">
          Select an <strong>Institution</strong>, <strong>Issue Cluster</strong>, or <strong>Grievance Docket</strong> on the graph to inspect correlated evidence and take regulatory action.
        </p>
      </div>
    );
  }

  // ==========================================
  // RENDER 1: ISSUE CLUSTER SELECTED
  // ==========================================
  if (selectedNode.type === 'CLUSTER' && selectedNode.cluster) {
    const cluster = selectedNode.cluster;
    const isConfirmed = cluster.status === 'CONFIRMED_LINK';
    const clusterComplaints = cluster.complaintIds
      .map((id) => complaintsMap[id])
      .filter(Boolean);

    return (
      <div className="h-full bg-white border border-[#CBD2DC] rounded-lg flex flex-col overflow-hidden shadow-xs">
        {/* Panel Header */}
        <div className="p-4 border-b border-[#CBD2DC] bg-[#F8FAFC] flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Issue Cluster Investigation
              </span>
              <span
                className={`text-[10.5px] font-bold px-2 py-0.5 rounded border ${
                  isConfirmed
                    ? 'bg-teal-50 text-teal-800 border-teal-200'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                {isConfirmed ? '✓ Joint Inquiry Confirmed' : '⚠️ Needs Officer Review'}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#0B2A5B] mt-1 leading-snug">
              {cluster.title}
            </h3>
            <div className="text-xs text-[#64748B] mt-0.5 flex items-center gap-1.5">
              <span>{cluster.category}</span>
              <span>·</span>
              <span className="font-semibold text-[#1E293B]">
                {cluster.complaintsCount} Related Cases
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#64748B] hover:text-[#0B2A5B] hover:bg-[#F1F5F9] transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#CBD2DC]/80">
              <div className="text-[10px] uppercase font-bold text-[#64748B]">Match Confidence</div>
              <div className="text-base font-mono font-extrabold text-[#0B2A5B] mt-0.5">
                {cluster.confidenceScore}% Match
              </div>
            </div>
            <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#CBD2DC]/80">
              <div className="text-[10px] uppercase font-bold text-[#64748B]">Disputed Amount</div>
              <div className="text-base font-mono font-extrabold text-[#C2570C] mt-0.5">
                {cluster.disputedAmount || 'Non-Monetary'}
              </div>
            </div>
          </div>

          {/* Evidence Rationale Box: Why Linked */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
            <div className="font-bold text-[#0B2A5B] flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#1F5FBF]" />
              <span>Why These Cases Were Linked (AI Correlated)</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#1E293B]">
              {cluster.whyLinked.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#1F5FBF] font-bold mt-0.5">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Complaints List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#0B2A5B] uppercase tracking-wider">
                Correlated Grievance Dockets ({clusterComplaints.length})
              </span>
              <span className="text-[10.5px] text-[#64748B] italic">Click to inspect</span>
            </div>

            <div className="space-y-2">
              {clusterComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectGrievance(c, cluster)}
                  className="p-3 rounded-md border border-[#CBD2DC] hover:border-[#1F5FBF] bg-white hover:bg-[#F8FAFC] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#0B2A5B] text-xs">
                        {c.id}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                          c.complainantRole === 'PARENT'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {c.complainantRole === 'PARENT' ? 'Parent View' : 'Student View'}
                      </span>
                    </div>
                    <span className="text-[10.5px] text-[#64748B] font-mono">
                      {c.submittedAt}
                    </span>
                  </div>

                  <p className="text-[#1E293B] font-medium text-xs mt-1 truncate" title={c.title}>
                    {c.title}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1.5 pt-1.5 border-t border-[#F1F5F9]">
                    <span>{c.assignedBureau}</span>
                    <span className="text-[#1F5FBF] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Inspect Docket &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investigation Chronology / Development Timeline */}
          {cluster.timeline && cluster.timeline.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#CBD2DC]">
              <div className="font-bold text-xs text-[#0B2A5B] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C2570C]" />
                Pattern Chronology Timeline
              </div>
              <div className="relative pl-4 space-y-3 border-l-2 border-[#CBD2DC]/80 ml-2">
                {cluster.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#1F5FBF] border-2 border-white" />
                    <div className="text-[10.5px] font-mono font-bold text-[#64748B]">
                      {event.date}
                    </div>
                    <div className="font-semibold text-xs text-[#1E293B]">
                      {event.label}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {event.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer / Decision Rail */}
        <div className="p-3.5 border-t border-[#CBD2DC] bg-[#F8FAFC] space-y-2">
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-center"
            leftIcon={<GitCompare className="w-3.5 h-3.5 text-[#1F5FBF]" />}
            onClick={() => onOpenCompare(cluster)}
          >
            Compare Complaints Side-by-Side
          </Button>

          <div className="flex items-center gap-2">
            {isConfirmed ? (
              <Button
                variant="outline-danger"
                size="sm"
                className="flex-1 justify-center"
                leftIcon={<Unlink2 className="w-3.5 h-3.5" />}
                onClick={() => onUnlink(cluster)}
              >
                Separate Inquiries
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="flex-1 justify-center"
                leftIcon={<Link2 className="w-3.5 h-3.5" />}
                onClick={() => onConfirmLink(cluster)}
              >
                Confirm Joint Inquiry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER 2: INDIVIDUAL GRIEVANCE SELECTED
  // ==========================================
  if (selectedNode.type === 'GRIEVANCE' && selectedNode.grievance) {
    const grievance = selectedNode.grievance;

    return (
      <div className="h-full bg-white border border-[#CBD2DC] rounded-lg flex flex-col overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#CBD2DC] bg-[#F8FAFC] flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#0B2A5B] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#CBD2DC]">
                {grievance.id}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {grievance.complainantRole}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#1E293B] mt-1.5 leading-snug">
              {grievance.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#64748B] hover:text-[#0B2A5B] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Core Grievance Statement:</span>
            <p className="p-2.5 rounded bg-[#F8FAFC] border border-[#CBD2DC]/80 text-[#1E293B] leading-relaxed mt-1">
              "{grievance.description}"
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#CBD2DC]/80">
            <div className="flex items-center justify-between text-[#64748B]">
              <span>Category:</span>
              <span className="font-semibold text-[#1E293B]">{grievance.category}</span>
            </div>
            <div className="flex items-center justify-between text-[#64748B]">
              <span>Disputed Amount:</span>
              <span className="font-mono font-bold text-[#C2570C]">{grievance.disputedAmount || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-[#64748B]">
              <span>Bureau Assigned:</span>
              <span className="font-semibold text-[#1E293B]">{grievance.assignedBureau}</span>
            </div>
            <div className="flex items-center justify-between text-[#64748B]">
              <span>Filed On:</span>
              <span className="font-mono">{grievance.submittedAt}</span>
            </div>
            <div className="flex items-center justify-between text-[#64748B]">
              <span>Verified Evidence Attachments:</span>
              <span className="font-semibold text-[#166534]">{grievance.evidenceCount} Documents</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 border-t border-[#CBD2DC] bg-[#F8FAFC]">
          <Link
            to={`/cases/${grievance.id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-white border border-[#CBD2DC] hover:border-[#0B2A5B] hover:bg-[#F8FAFC] text-[#0B2A5B] font-bold text-xs shadow-xs transition-colors"
          >
            Open Complete Official Docket
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER 3: INSTITUTION SELECTED
  // ==========================================
  if (selectedNode.type === 'INSTITUTION' && selectedNode.institution) {
    const inst = selectedNode.institution;

    return (
      <div className="h-full bg-white border border-[#CBD2DC] rounded-lg flex flex-col overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#CBD2DC] bg-[#F8FAFC] flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#0B2A5B]" />
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B]">
                Institution Profile
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#0B2A5B] mt-1 leading-snug">
              {inst.name}
            </h3>
            <div className="text-xs font-mono text-[#64748B] mt-0.5">
              Perm ID: {inst.permanentId} · {inst.city}, {inst.state}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#64748B] hover:text-[#0B2A5B] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded bg-[#F8FAFC] border border-[#CBD2DC]/80">
              <span className="text-[10px] uppercase font-bold text-[#64748B]">Total Grievances</span>
              <div className="text-lg font-mono font-bold text-[#0B2A5B] mt-0.5">
                {inst.totalGrievances}
              </div>
            </div>
            <div className="p-3 rounded bg-[#F8FAFC] border border-[#CBD2DC]/80">
              <span className="text-[10px] uppercase font-bold text-[#64748B]">Active Clusters</span>
              <div className="text-lg font-mono font-bold text-[#C2570C] mt-0.5">
                {inst.clusters.length}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-xs text-[#0B2A5B] uppercase tracking-wider">
              Identified Pattern Clusters:
            </div>
            {inst.clusters.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded border border-[#CBD2DC] bg-white space-y-1"
              >
                <div className="flex items-center justify-between font-semibold text-xs text-[#1E293B]">
                  <span>{c.title}</span>
                  <span className="text-[10px] font-mono font-bold text-[#1F5FBF]">
                    {c.complaintsCount} cases
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Category: {c.category}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3.5 border-t border-[#CBD2DC] bg-[#F8FAFC]">
          <Link
            to="/institutions"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-white border border-[#CBD2DC] hover:border-[#0B2A5B] hover:bg-[#F8FAFC] text-[#0B2A5B] font-bold text-xs shadow-xs transition-colors"
          >
            Open Campus Directory Record
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return null;
};
