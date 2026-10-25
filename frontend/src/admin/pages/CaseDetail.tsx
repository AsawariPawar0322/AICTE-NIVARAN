import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Complaint, ComplaintStatus, BureauName } from '../types';
import { StatusChip, UrgencyBadge } from '../design-system/StatusChip';
import { Button } from '../design-system/Button';
import { Modal } from '../design-system/Modal';
import { Input, TextArea, Select } from '../design-system/FormControls';
import { useApp } from '../context/AppContext';
import { downloadSyntheticDocument } from '../utils/documentDownloader';
import {
  Clock,
  Building2,
  FileCheck2,
  GitCommit,
  Network,
  StickyNote,
  Send,
  ArrowRightLeft,
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  User,
  ShieldAlert,
  Hash,
  Download,
  Calendar,
  Lock,
  Percent,
  Link2,
  Unlink2,
  Sparkles,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [relatedComplaints, setRelatedComplaints] = useState<Complaint[]>([]);
  const [unlinkedCounterpart, setUnlinkedCounterpart] = useState<Complaint | null>(null);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'history' | 'related' | 'notes'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Helper for POV badge rendering
  const renderPovBadge = (pov?: string, role?: string) => {
    const isParent = (pov && pov.toLowerCase().includes('parent')) || role === 'PARENT';
    const isFaculty = (pov && pov.toLowerCase().includes('faculty')) || role === 'FACULTY';
    const isAlumni = (pov && pov.toLowerCase().includes('alumni')) || role === 'ALUMNI';

    let label = 'Student View';
    let style = 'bg-blue-50 text-blue-700 border-blue-200';

    if (isParent) {
      label = 'Parent View';
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (isFaculty) {
      label = 'Faculty View';
      style = 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (isAlumni) {
      label = 'Alumni View';
      style = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    return (
      <span className={`text-[11px] px-2 py-0.5 rounded font-medium border ${style}`}>
        {label}
      </span>
    );
  };

  // Modals state
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Form states
  const [infoQuestion, setInfoQuestion] = useState('');
  const [infoRecipient, setInfoRecipient] = useState<'COMPLAINANT' | 'INSTITUTION'>('INSTITUTION');

  const [updateStatus, setUpdateStatus] = useState<ComplaintStatus>('ACTION_IN_PROGRESS');
  const [updateReason, setUpdateReason] = useState('');

  const [transferBureau, setTransferBureau] = useState<BureauName>('Approval Bureau');
  const [transferOfficer, setTransferOfficer] = useState('Dr. Sanjeev Khurana');
  const [transferReason, setTransferReason] = useState('');

  const [escalateLevel, setEscalateLevel] = useState('Level 2 (Member Secretary Office)');
  const [escalateReason, setEscalateReason] = useState('');

  const [decisionType, setDecisionType] = useState<'RESOLVED' | 'REJECTED'>('RESOLVED');
  const [decisionJustification, setDecisionJustification] = useState('');

  const [noteText, setNoteText] = useState('');
  const [noteConfidential, setNoteConfidential] = useState(true);

  const loadCase = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await apiService.getComplaintById(id);
      setComplaint(data);
      if (data) {
        // Load full related complaints
        const rels: Complaint[] = [];
        for (const rId of data.relatedCaseIds) {
          const rc = await apiService.getComplaintById(rId);
          if (rc) rels.push(rc);
        }
        setRelatedComplaints(rels);

        // Check if there is an unlinked counterpart for the same problem
        if (data.problemId) {
          const allRes = await apiService.getComplaints({ limit: 100 });
          const candidate = allRes.items.find(
            (c) => c.problemId === data.problemId && c.id !== data.id && !data.relatedCaseIds.includes(c.id)
          );
          setUnlinkedCounterpart(candidate || null);
        } else {
          setUnlinkedCounterpart(null);
        }

        // Check live matcher for high-confidence unlinked candidates
        try {
          const m = await apiService.getCaseAnalysis(id);
          setLiveMatches(m.filter((item: any) => !item.is_linked && item.confidence_score >= 80));
        } catch {
          setLiveMatches([]);
        }
      }
    } catch (err) {
      console.error(err);
      addToast({
        type: 'danger',
        title: 'Error',
        message: 'Could not load complaint details.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-12 text-center text-[#4B5565]">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-[#C2570C] border-t-transparent rounded-full mb-2" />
        <p className="text-xs font-semibold">Retrieving official case docket {id}...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-12 text-center text-[#4B5565] space-y-3">
        <h2 className="text-lg font-bold text-[#0B2A5B]">Complaint Record Not Found</h2>
        <p className="text-xs">No complaint registered under ID "{id}".</p>
        <Button variant="secondary" onClick={() => navigate('/cases')}>
          Return to Registry
        </Button>
      </div>
    );
  }

  // Action Handlers
  const handleRequestInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await apiService.requestAdditionalInfo(complaint.id, infoQuestion, infoRecipient);
      setComplaint(updated);
      setIsInfoModalOpen(false);
      setInfoQuestion('');
      addToast({
        type: 'info',
        title: 'Information Requested',
        message: `Notice dispatched to ${infoRecipient}. Case moved to Info Requested status.`,
      });
    } catch (err: any) {
      addToast({ type: 'danger', title: 'Error', message: err.message });
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await apiService.updateComplaintStatus(complaint.id, updateStatus, updateReason);
      setComplaint(updated);
      setIsUpdateModalOpen(false);
      setUpdateReason('');
      addToast({
        type: 'success',
        title: 'Progress Recorded',
        message: `Status updated to ${updateStatus.replace(/_/g, ' ')}.`,
      });
    } catch (err: any) {
      addToast({ type: 'danger', title: 'Error', message: err.message });
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await apiService.transferComplaint(complaint.id, transferBureau, transferOfficer, transferReason);
      setComplaint(updated);
      setIsTransferModalOpen(false);
      setTransferReason('');
      addToast({
        type: 'info',
        title: 'Case Transferred',
        message: `Reassigned to ${transferBureau}.`,
      });
    } catch (err: any) {
      addToast({ type: 'danger', title: 'Error', message: err.message });
    }
  };

  const handleEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await apiService.escalateComplaint(complaint.id, escalateLevel, escalateReason);
      setComplaint(updated);
      setIsEscalateModalOpen(false);
      setEscalateReason('');
      addToast({
        type: 'danger',
        title: 'Case Escalated',
        message: `Alert transmitted to ${escalateLevel}.`,
      });
    } catch (err: any) {
      addToast({ type: 'danger', title: 'Error', message: err.message });
    }
  };

  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await apiService.recordDecision(complaint.id, decisionType, decisionJustification);
      setComplaint(updated);
      setIsDecisionModalOpen(false);
      setDecisionJustification('');
      addToast({
        type: decisionType === 'RESOLVED' ? 'success' : 'warning',
        title: `Case ${decisionType}`,
        message: `Formal regulatory decision recorded.`,
      });
    } catch (err: any) {
      addToast({ type: 'danger', title: 'Error', message: err.message });
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await apiService.addInternalNote(complaint.id, noteText, noteConfidential);
      setComplaint(updated);
      setIsNoteModalOpen(false);
      setNoteText('');
      addToast({
        type: 'success',
        title: 'Note Logged',
        message: 'Internal officer note saved to audit record.',
      });
    } catch (err: any) {
      addToast({ type: 'danger', title: 'Error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Potential Overlapping Cases – Coordination Required Banner */}
      {liveMatches.length > 0 && complaint && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-[8px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1 bg-amber-200 text-amber-900 rounded font-bold text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Potential Overlapping Cases – Coordination Required
              </span>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                {liveMatches[0].confidence_score}% Match Confidence
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              AICTE NIVARAN detected an unlinked grievance (<strong>{liveMatches[0].candidate_case_id}</strong>) against <strong>{liveMatches[0].candidate_institution_name}</strong> reporting related issues ({liveMatches[0].candidate_category}).
              {liveMatches[0].breakdown?.extracted_amount_str && ` Both cases involve disputed amount: ${liveMatches[0].breakdown.extracted_amount_str}.`}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-800 font-medium">
              <span>Matching Factors: {liveMatches[0].match_reasons?.join(' · ')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/coordination"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold transition-colors shadow-xs"
            >
              Open Coordination Desk
            </Link>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Link2 className="w-3.5 h-3.5" />}
              onClick={async () => {
                await apiService.linkCases(complaint.id, liveMatches[0].candidate_case_id);
                addToast({
                  type: 'success',
                  title: 'Docket Linked for Joint Inquiry',
                  message: `Linked ${complaint.id} with ${liveMatches[0].candidate_case_id}.`,
                });
                loadCase();
              }}
            >
              Confirm Link
            </Button>
          </div>
        </div>
      )}

      {/* Official Case Header */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#CBD2DC]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-base font-bold text-[#0B2A5B] bg-[#F3F5F8] px-2.5 py-1 rounded border border-[#CBD2DC]">
                {complaint.id}
              </span>
              <StatusChip status={complaint.status} isOverdue={complaint.isOverdue} overdueDays={complaint.overdueDays} />
              <UrgencyBadge urgency={complaint.urgency} />
              {renderPovBadge(complaint.pov, complaint.complainantType)}
              {complaint.isPoolMember && (
                <span className="text-xs px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] rounded font-semibold flex items-center gap-1">
                  <Network className="w-3 h-3" /> Clustered in Grievance Pool
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-[#1A1F2B] mt-2 leading-snug">
              {complaint.title}
            </h2>
          </div>

          {/* SLA Clock & Owner Card */}
          <div className="flex items-center gap-3 bg-[#F3F5F8] p-3 rounded-[6px] border border-[#CBD2DC] flex-shrink-0">
            <div className="text-right">
              <div className="text-[11px] text-[#4B5565] uppercase font-bold tracking-wider">
                Jurisdiction &amp; SLA
              </div>
              <div className="text-xs font-semibold text-[#1A1F2B]">
                {complaint.assignedBureau}
              </div>
              <div className="text-[11px] text-[#4B5565]">
                Handler: {complaint.assignedOfficerName || 'Unassigned (Triage)'}
              </div>
            </div>
            <div className="w-[1px] h-10 bg-[#CBD2DC]" />
            <div className="text-center min-w-[90px]">
              <div className="text-[10px] text-[#4B5565] uppercase font-bold">
                Deadline
              </div>
              {complaint.isOverdue ? (
                <div className="text-sm font-extrabold text-[#B91C1C] flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> -{complaint.overdueDays}d
                </div>
              ) : (
                <div className="text-sm font-extrabold text-[#166534]">
                  {complaint.daysRemaining} days left
                </div>
              )}
              <div className="text-[10px] text-[#4B5565] font-mono">
                {complaint.slaDeadline.split('T')[0]}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Rail - Never dead buttons! */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="text-xs font-bold text-[#4B5565] uppercase mr-1">Official Actions:</span>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<HelpCircle className="w-3.5 h-3.5 text-[#C2570C]" />}
            onClick={() => setIsInfoModalOpen(true)}
          >
            Request Information
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Send className="w-3.5 h-3.5 text-[#1F5FBF]" />}
            onClick={() => setIsUpdateModalOpen(true)}
          >
            Update Progress
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowRightLeft className="w-3.5 h-3.5 text-[#3730A3]" />}
            onClick={() => setIsTransferModalOpen(true)}
          >
            Transfer Bureau
          </Button>

          <Button
            variant="outline-danger"
            size="sm"
            leftIcon={<AlertOctagon className="w-3.5 h-3.5" />}
            onClick={() => setIsEscalateModalOpen(true)}
          >
            Escalate Case
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
            onClick={() => setIsDecisionModalOpen(true)}
          >
            Record Decision
          </Button>

          <div className="ml-auto">
            <Button
              variant="tertiary"
              size="sm"
              leftIcon={<StickyNote className="w-3.5 h-3.5" />}
              onClick={() => setIsNoteModalOpen(true)}
            >
              Add Internal Note
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[#CBD2DC] flex gap-1">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'evidence', label: `Evidence (${complaint.evidence.length})` },
          { key: 'history', label: `Timeline (${complaint.timeline.length})` },
          { key: 'related', label: `Similar Cases (${complaint.relatedCaseIds.length})` },
          { key: 'notes', label: `Notes (${complaint.notes.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 -mb-[1px] transition-colors ${
              activeTab === tab.key
                ? 'border-[#1F5FBF] text-[#1F5FBF] bg-white'
                : 'border-transparent text-[#4B5565] hover:text-[#1A1F2B] hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Grievance Statement */}
            <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 space-y-3">
              <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wide">
                Grievance Narrative &amp; Statement of Facts
              </h3>
              <p className="text-sm text-[#1A1F2B] leading-relaxed whitespace-pre-line bg-[#F3F5F8] p-4 rounded border border-[#CBD2DC]">
                {complaint.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#4B5565] pt-2">
                <div>
                  <span className="font-semibold text-[#1A1F2B]">Filed on:</span> {complaint.createdAt.split('T')[0]}
                </div>
                <div>
                  <span className="font-semibold text-[#1A1F2B]">Category:</span> {complaint.category}
                </div>
                <div>
                  <span className="font-semibold text-[#1A1F2B]">Complainant Role:</span> {complaint.complainantType}
                </div>
              </div>
            </div>

            {/* Institution Profile */}
            <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#CBD2DC]">
                <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wide flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#1F5FBF]" />
                  Respondent Institution Details
                </h3>
                <Link
                  to={`/institutions?query=${complaint.institutionPermanentId}`}
                  className="text-xs text-[#C2570C] hover:underline font-semibold"
                >
                  View Full Institution Dossier &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#4B5565]">Institution Name:</span>
                  <div className="font-bold text-[#1A1F2B] text-sm mt-0.5">{complaint.institutionName}</div>
                </div>
                <div>
                  <span className="text-[#4B5565]">AICTE Permanent ID:</span>
                  <div className="font-mono font-bold text-[#0B2A5B] text-sm mt-0.5">{complaint.institutionPermanentId}</div>
                </div>
                <div>
                  <span className="text-[#4B5565]">Location:</span>
                  <div className="font-medium text-[#1A1F2B]">{complaint.city}, {complaint.state}</div>
                </div>
                <div>
                  <span className="text-[#4B5565]">Assigned AICTE Bureau:</span>
                  <div className="font-medium text-[#1A1F2B]">{complaint.assignedBureau}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info: Complainant Privacy Masking */}
          <div className="space-y-6">
            <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#CBD2DC]">
                <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wide flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#C2570C]" />
                  Complainant Identity (Protected)
                </h3>
                <span className="text-[10px] bg-[#E6EEF9] text-[#1F5FBF] px-1.5 py-0.5 rounded font-bold">
                  DPDP Protected
                </span>
              </div>

              <div className="text-xs space-y-2 text-[#4B5565]">
                <p className="text-[11px] leading-relaxed">
                  Complainant personal records are masked under AICTE Whistleblower &amp; DPDP compliance provisions.
                </p>
                <div>
                  <span className="font-semibold text-[#1A1F2B]">Display Alias:</span>
                  <div>{complaint.complainantName}</div>
                </div>
                <div>
                  <span className="font-semibold text-[#1A1F2B]">Contact Mobile (Masked):</span>
                  <div className="font-mono">{complaint.complainantPhoneMasked}</div>
                </div>
                <div>
                  <span className="font-semibold text-[#1A1F2B]">Email Address (Masked):</span>
                  <div className="font-mono">{complaint.complainantEmailMasked}</div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate(`/messages?complaintId=${complaint.id}`)}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Open Official Message Thread
              </Button>
            </div>

            {/* Quick Status Summary */}
            <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 space-y-3">
              <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wide">
                Next Expected Milestones
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-[#F3F5F8] rounded border border-[#CBD2DC]">
                  <div className="font-semibold text-[#1A1F2B]">Statutory Compliance Hearing</div>
                  <div className="text-[11px] text-[#4B5565] mt-0.5">Show-cause response due within 72h.</div>
                </div>
                <div className="p-2.5 bg-[#F3F5F8] rounded border border-[#CBD2DC]">
                  <div className="font-semibold text-[#1A1F2B]">Independent Evidence Audit</div>
                  <div className="text-[11px] text-[#4B5565] mt-0.5">Regional squad verify certificate return.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Evidence Docket */}
      {activeTab === 'evidence' && (
        <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#CBD2DC]">
            <div>
              <h3 className="text-sm font-bold text-[#0B2A5B] uppercase tracking-wide flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-[#166534]" />
                Cryptographically Hashed Evidence Dossier
              </h3>
              <p className="text-xs text-[#4B5565] mt-0.5">
                All submitted evidence is validated with SHA-256 integrity digests to guarantee tamper resistance.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#4B5565]">
              {complaint.evidence.length} file(s) attached
            </span>
          </div>

          <div className="space-y-3">
            {complaint.evidence.map((ev) => (
              <div key={ev.id} className="p-4 border border-[#CBD2DC] rounded-[6px] bg-[#F3F5F8] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#0B2A5B]">{ev.name}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] rounded font-bold">
                      {ev.status}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white border border-[#CBD2DC] rounded text-[#4B5565]">
                      Uploaded by {ev.uploaderRole}
                    </span>
                  </div>
                  <p className="text-xs text-[#1A1F2B]">{ev.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[#4B5565] font-mono">
                    <span>Size: {(ev.sizeBytes / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span className="truncate max-w-md">SHA-256: {ev.sha256Hash}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => {
                      downloadSyntheticDocument({
                        fileName: ev.name,
                        title: complaint.title,
                        caseId: complaint.id,
                        institutionName: complaint.institutionName,
                        sha256: ev.sha256Hash,
                        fileSize: ev.sizeBytes,
                        uploadedAt: ev.uploadedAt,
                        uploaderRole: ev.uploaderRole,
                        details: ev.description,
                      });
                      addToast({
                        type: 'success',
                        title: 'Document Downloaded',
                        message: `Downloaded ${ev.name}.`,
                      });
                    }}
                  >
                    Download File
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      addToast({
                        type: 'info',
                        title: 'Evidence Verification',
                        message: `SHA-256 hash ${ev.sha256Hash.substring(0, 16)}... matched original cryptographic registry.`,
                      });
                    }}
                  >
                    Inspect Hash
                  </Button>
                </div>
              </div>
            ))}

            {complaint.evidence.length === 0 && (
              <div className="py-8 text-center text-[#4B5565] text-xs">
                No attachments uploaded with this complaint yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: History & Stage Timeline */}
      {activeTab === 'history' && (
        <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 space-y-4">
          <div className="pb-3 border-b border-[#CBD2DC]">
            <h3 className="text-sm font-bold text-[#0B2A5B] uppercase tracking-wide flex items-center gap-1.5">
              <GitCommit className="w-4 h-4 text-[#1F5FBF]" />
              Official Chronological Stage &amp; Accountability Timeline
            </h3>
            <p className="text-xs text-[#4B5565] mt-0.5">
              Immutable log of bureau handoffs, actions taken, strict deadlines, and escalation triggers.
            </p>
          </div>

          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#CBD2DC]">
            {complaint.timeline.map((stage, idx) => (
              <div key={stage.id} className="relative">
                {/* Timeline node */}
                <div className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                  stage.isEscalated ? 'bg-[#B91C1C]' : 'bg-[#1F5FBF]'
                }`} />

                <div className="p-3.5 border border-[#CBD2DC] rounded-[6px] bg-[#F3F5F8] space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-xs text-[#0B2A5B] flex items-center gap-1.5">
                      {stage.stageName}
                      {stage.isEscalated && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] rounded font-bold">
                          ESCALATED
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-[#4B5565] font-mono">
                      {new Date(stage.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-[#1A1F2B] font-medium leading-relaxed">
                    {stage.actionTaken}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#4B5565] pt-1 border-t border-[#CBD2DC]/60">
                    <div>
                      <span className="font-semibold text-[#1A1F2B]">Actor:</span> {stage.performedByName} ({stage.performedByRole})
                    </div>
                    <div>
                      <span className="font-semibold text-[#1A1F2B]">Next Expected Step:</span> {stage.nextExpectedStep}
                    </div>
                    {stage.deadlineDate && (
                      <div className="font-mono text-[#C2570C]">
                        <span className="font-semibold text-[#1A1F2B]">Target SLA:</span> {stage.deadlineDate.split('T')[0]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Similar Cases */}
      {activeTab === 'related' && (
        <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 space-y-3 text-xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#CBD2DC]/60">
            <div>
              <h3 className="text-sm font-bold text-[#0B2A5B] flex items-center gap-1.5">
                <Network className="w-4 h-4 text-[#1F5FBF]" />
                Similar Cases
              </h3>
              <p className="text-[#6B7280] text-[11px] mt-0.5">
                Complaints about this same problem from different viewpoints (e.g. Student vs. Parent).
              </p>
            </div>
            {complaint.similarityScore && (
              <span className="text-xs px-2.5 py-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {complaint.similarityScore}% similarity
              </span>
            )}
          </div>

          {/* Problem & Viewpoints Overview */}
          {complaint.problemTitle && (
            <div className="p-3 bg-[#F8FAFC] border border-[#CBD2DC]/60 rounded space-y-1.5">
              <div className="font-semibold text-[#0B2A5B]">{complaint.problemTitle}</div>
              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                <span className="text-[#4B5565] font-medium">This Case:</span>
                {renderPovBadge(complaint.pov, complaint.complainantType)}
                <span className="text-[#9CA3AF]">↔</span>
                <span className="text-[#4B5565] font-medium">Counterpart:</span>
                {relatedComplaints.length > 0 ? (
                  renderPovBadge(relatedComplaints[0].pov, relatedComplaints[0].complainantType)
                ) : unlinkedCounterpart ? (
                  renderPovBadge(unlinkedCounterpart.pov, unlinkedCounterpart.complainantType)
                ) : (
                  <span className="text-[#9CA3AF]">None</span>
                )}
              </div>
            </div>
          )}

          {/* Linked Cases List */}
          <div className="space-y-2.5">
            {relatedComplaints.map((rel) => (
              <div key={rel.id} className="p-3 border border-[#CBD2DC] rounded bg-white space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-[#CBD2DC]/40">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0B2A5B]">{rel.id}</span>
                    <StatusChip status={rel.status} size="sm" />
                    {renderPovBadge(rel.pov, rel.complainantType)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/cases/${rel.id}`}>
                      <Button variant="secondary" size="sm" leftIcon={<ExternalLink className="w-3 h-3" />}>
                        View Case
                      </Button>
                    </Link>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={async () => {
                        await apiService.unlinkCases(complaint.id, rel.id);
                        loadCase();
                        addToast({
                          type: 'info',
                          title: 'Cases Unlinked',
                          message: `Unlinked ${complaint.id} and ${rel.id}.`,
                        });
                      }}
                    >
                      Unlink
                    </Button>
                  </div>
                </div>

                <div className="font-semibold text-[#1A1F2B]">{rel.title}</div>
                <p className="text-[#6B7280] text-[11px] line-clamp-2 leading-relaxed">{rel.description}</p>
                <div className="text-[11px] text-[#6B7280] flex items-center justify-between">
                  <span>By: <strong>{rel.complainantName}</strong></span>
                  <span>Bureau: {rel.assignedBureau}</span>
                </div>
              </div>
            ))}

            {relatedComplaints.length === 0 && !unlinkedCounterpart && (
              <div className="py-6 text-center text-[#6B7280] bg-[#F8FAFC] border border-[#CBD2DC]/60 rounded">
                No similar cases linked yet.
              </div>
            )}
          </div>

          {/* Unlinked Candidate Suggestion */}
          {unlinkedCounterpart && (
            <div className="p-3 border border-blue-200 bg-blue-50/50 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1E3A8A]">Suggested Match:</span>
                  <span className="font-mono font-bold text-[#0B2A5B]">{unlinkedCounterpart.id}</span>
                  {renderPovBadge(unlinkedCounterpart.pov, unlinkedCounterpart.complainantType)}
                  <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                    ({unlinkedCounterpart.similarityScore || 85}% match)
                  </span>
                </div>
                <div className="text-[11px] text-[#4B5565] line-clamp-1">{unlinkedCounterpart.title}</div>
              </div>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Link2 className="w-3.5 h-3.5" />}
                onClick={async () => {
                  await apiService.linkCases(complaint.id, unlinkedCounterpart.id);
                  loadCase();
                  addToast({
                    type: 'success',
                    title: 'Cases Linked',
                    message: `Linked ${complaint.id} and ${unlinkedCounterpart.id}.`,
                  });
                }}
              >
                Link Cases
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Confidential Notes */}
      {activeTab === 'notes' && (
        <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#CBD2DC]">
            <div>
              <h3 className="text-sm font-bold text-[#0B2A5B] uppercase tracking-wide flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#B91C1C]" />
                Internal Bureau &amp; Ombudsman Notes
              </h3>
              <p className="text-xs text-[#4B5565] mt-0.5">
                Strictly confidential official remarks. Not visible on Complainant or Public tracking portals.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setIsNoteModalOpen(true)}>
              Add New Note
            </Button>
          </div>

          <div className="space-y-3">
            {complaint.notes.map((note) => (
              <div key={note.id} className="p-4 border border-[#CBD2DC] rounded-[6px] bg-[#F3F5F8] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0B2A5B]">{note.authorName}</span>
                    <span className="text-[11px] text-[#4B5565]">({note.authorBureau})</span>
                    {note.isConfidential && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] rounded font-bold">
                        CONFIDENTIAL
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#4B5565] font-mono">
                    {new Date(note.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-[#1A1F2B] leading-relaxed whitespace-pre-line bg-white p-3 rounded border border-[#CBD2DC]">
                  {note.noteText}
                </p>
              </div>
            ))}

            {complaint.notes.length === 0 && (
              <p className="text-xs text-[#4B5565] py-8 text-center">
                No internal notes recorded yet for this case.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Modal 1: Request Information */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Request Additional Information / Clarification"
        description="Dispatches a formal statutory query. Resets SLA timer to 72 hours response window."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsInfoModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRequestInfo} disabled={!infoQuestion.trim()}>
              Dispatch Query
            </Button>
          </>
        }
      >
        <form onSubmit={handleRequestInfo} className="space-y-4">
          <Select
            label="Direct Query To:"
            value={infoRecipient}
            onChange={(e) => setInfoRecipient(e.target.value as any)}
            options={[
              { label: 'Institution Nodal Officer (Principal / Registrar)', value: 'INSTITUTION' },
              { label: 'Public Complainant (Student / Faculty / Parent)', value: 'COMPLAINANT' },
            ]}
          />
          <TextArea
            label="Specific Clarification or Document Requested"
            required
            placeholder="Specify missing fee receipts, attendance sync logs, or institutional reply..."
            value={infoQuestion}
            onChange={(e) => setInfoQuestion(e.target.value)}
            rows={4}
          />
        </form>
      </Modal>

      {/* Action Modal 2: Update Progress */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Case Investigation Progress"
        description="Records an official investigation milestone into the public tracking timeline."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpdateProgress} disabled={!updateReason.trim()}>
              Save Progress
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateProgress} className="space-y-4">
          <Select
            label="Set Current Status:"
            value={updateStatus}
            onChange={(e) => setUpdateStatus(e.target.value as any)}
            options={[
              { label: 'Action in Progress', value: 'ACTION_IN_PROGRESS' },
              { label: 'Under Review', value: 'UNDER_REVIEW' },
              { label: 'Assigned', value: 'ASSIGNED' },
            ]}
          />
          <TextArea
            label="Action Taken / Findings"
            required
            placeholder="e.g. Conducted hearing with Institute Director; verified accounting books..."
            value={updateReason}
            onChange={(e) => setUpdateReason(e.target.value)}
            rows={4}
          />
        </form>
      </Modal>

      {/* Action Modal 3: Transfer Bureau */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer Bureau Jurisdiction"
        description="Reassigns case ownership to another AICTE specialized bureau."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleTransfer} disabled={!transferReason.trim()}>
              Confirm Transfer
            </Button>
          </>
        }
      >
        <form onSubmit={handleTransfer} className="space-y-4">
          <Select
            label="Target Bureau:"
            value={transferBureau}
            onChange={(e) => setTransferBureau(e.target.value as any)}
            options={[
              { label: 'Approval Bureau', value: 'Approval Bureau' },
              { label: 'Policy & Academic Planning Bureau (P&AP)', value: 'Policy & Academic Planning Bureau (P&AP)' },
              { label: 'Student Development Bureau', value: 'Student Development Bureau' },
              { label: 'Finance & Accounts Bureau', value: 'Finance & Accounts Bureau' },
              { label: 'Faculty Development Bureau', value: 'Faculty Development Bureau' },
              { label: 'Skill Development Bureau', value: 'Skill Development Bureau' },
            ]}
          />
          <Input
            label="Assignee Officer Name"
            value={transferOfficer}
            onChange={(e) => setTransferOfficer(e.target.value)}
            required
          />
          <TextArea
            label="Transfer Justification"
            required
            placeholder="Explain why this bureau holds primary regulatory purview..."
            value={transferReason}
            onChange={(e) => setTransferReason(e.target.value)}
            rows={3}
          />
        </form>
      </Modal>

      {/* Action Modal 4: Escalate */}
      <Modal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        title="Escalate Case to Higher Authority"
        description="Flags severe non-compliance or critical SLA breach to executive leadership."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsEscalateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleEscalate} disabled={!escalateReason.trim()}>
              Confirm Escalation
            </Button>
          </>
        }
      >
        <form onSubmit={handleEscalate} className="space-y-4">
          <Select
            label="Escalation Target Level:"
            value={escalateLevel}
            onChange={(e) => setEscalateLevel(e.target.value)}
            options={[
              { label: 'Level 2 (Member Secretary Office)', value: 'Level 2 (Member Secretary Office)' },
              { label: 'Level 3 (AICTE Chairman & Central Ombudsman)', value: 'Level 3 (AICTE Chairman & Central Ombudsman)' },
              { label: 'Regional Director (Spot Inspection Team)', value: 'Regional Director (Spot Inspection Team)' },
            ]}
          />
          <TextArea
            label="Reason for Escalation"
            required
            placeholder="e.g. Total failure of college to comply with 72h show-cause notice..."
            value={escalateReason}
            onChange={(e) => setEscalateReason(e.target.value)}
            rows={4}
          />
        </form>
      </Modal>

      {/* Action Modal 5: Record Decision */}
      <Modal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        title="Record Formal Redressal Decision"
        description="Concludes active proceedings. Activates statutory 30-day appellate review window."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsDecisionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={decisionType === 'RESOLVED' ? 'primary' : 'danger'}
              size="sm"
              onClick={handleRecordDecision}
              disabled={!decisionJustification.trim()}
            >
              Record Official Decision
            </Button>
          </>
        }
      >
        <form onSubmit={handleRecordDecision} className="space-y-4">
          <Select
            label="Final Disposition:"
            value={decisionType}
            onChange={(e) => setDecisionType(e.target.value as any)}
            options={[
              { label: 'RESOLVED - Remedy Completed & Verified', value: 'RESOLVED' },
              { label: 'REJECTED - Grievance Dismissed / Unsubstantiated', value: 'REJECTED' },
            ]}
          />
          <TextArea
            label="Official Statutory Justification & Orders"
            required
            placeholder="Provide comprehensive findings, directive issued, or reason for dismissal under AICTE regulations..."
            value={decisionJustification}
            onChange={(e) => setDecisionJustification(e.target.value)}
            rows={5}
          />
        </form>
      </Modal>

      {/* Action Modal 6: Add Internal Note */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Log Confidential Internal Note"
        description="Only accessible to authorized AICTE bureau officials."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddNote} disabled={!noteText.trim()}>
              Save Confidential Note
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddNote} className="space-y-4">
          <TextArea
            label="Confidential Observation / Remark"
            required
            placeholder="e.g. Observed reluctance of management to produce ledger books..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
          />
          <label className="flex items-center gap-2 text-xs text-[#1A1F2B] font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={noteConfidential}
              onChange={(e) => setNoteConfidential(e.target.checked)}
              className="rounded"
            />
            <span>Mark strictly confidential (hide from standard reports)</span>
          </label>
        </form>
      </Modal>
    </div>
  );
};
