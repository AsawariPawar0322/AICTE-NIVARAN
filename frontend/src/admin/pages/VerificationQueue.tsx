import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Complaint } from '../types';
import { StatusChip, UrgencyBadge } from '../design-system/StatusChip';
import { Button } from '../design-system/Button';
import { Modal } from '../design-system/Modal';
import { TextArea, Select } from '../design-system/FormControls';
import { useApp } from '../context/AppContext';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  FileText,
} from 'lucide-react';

export const VerificationQueue: React.FC = () => {
  const { addToast } = useApp();
  const [queue, setQueue] = useState<Complaint[]>([]);
  const [selectedCase, setSelectedCase] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal actions
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_INFO' | null>(null);
  const [actionReason, setActionReason] = useState('');

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const items = await apiService.getVerificationQueue();
      setQueue(items);
    } catch (err) {
      console.error(err);
      addToast({
        type: 'danger',
        title: 'Error',
        message: 'Could not load verification queue.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !actionType) return;

    try {
      await apiService.verifyComplaint(selectedCase.id, actionType, actionReason);
      addToast({
        type: actionType === 'APPROVE' ? 'success' : actionType === 'REJECT' ? 'warning' : 'info',
        title: `Intake ${actionType}`,
        message: `Case ${selectedCase.id} successfully processed.`,
      });
      setActionType(null);
      setSelectedCase(null);
      setActionReason('');
      loadQueue();
    } catch (err: any) {
      addToast({
        type: 'danger',
        title: 'Action Error',
        message: err.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-[#C2570C]" />
          <h2 className="text-base font-bold text-[#0B2A5B]">
            Review Queue
          </h2>
          <span className="text-xs px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] rounded font-bold">
            {queue.length} Pending
          </span>
        </div>
        <p className="text-xs text-[#4B5565] mt-1">
          Review new incoming complaints and verify documents before assigning them to officers.
        </p>
      </div>

      {/* Queue Table */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#CBD2DC] bg-[#F3F5F8] text-[#4B5565] uppercase font-semibold">
                <th className="py-2.5 px-3">Complaint ID</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Institution</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Evidence</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD2DC]">
              {queue.map((c) => (
                <tr key={c.id} className="hover:bg-[#F3F5F8] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#0B2A5B] whitespace-nowrap">
                    <Link
                      to={`/cases/${c.id}`}
                      className="hover:text-[#C2570C] hover:underline flex items-center gap-1"
                    >
                      {c.id}
                      <ExternalLink className="w-3 h-3 text-[#4B5565]" />
                    </Link>
                  </td>
                  <td className="py-3 px-3 max-w-sm">
                    <div className="font-semibold text-[#1A1F2B]" title={c.title}>
                      {c.title}
                    </div>
                    <div className="text-[11px] text-[#4B5565] truncate mt-0.5">
                      {c.description}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-[#1A1F2B]">{c.institutionName}</div>
                    <div className="text-[11px] font-mono text-[#4B5565]">{c.institutionPermanentId} · {c.city}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-[#E6EEF9] text-[#1F5FBF] rounded font-semibold text-[11px]">
                      {c.complainantType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#4B5565] whitespace-nowrap">
                    {c.category}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-[#1A1F2B]">
                    {c.evidenceCount > 0 ? (
                      <span className="text-[#166534] font-semibold flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> {c.evidenceCount} attached
                      </span>
                    ) : (
                      <span className="text-[#92400E]">No attachments</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setSelectedCase(c);
                          setActionType('APPROVE');
                          setActionReason('Documents verified. Approved and assigned to bureau.');
                        }}
                      >
                        Approve
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<HelpCircle className="w-3.5 h-3.5 text-[#C2570C]" />}
                        onClick={() => {
                          setSelectedCase(c);
                          setActionType('REQUEST_INFO');
                          setActionReason('Please provide fee receipts or communications with the college.');
                        }}
                      >
                        Request Info
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setSelectedCase(c);
                          setActionType('REJECT');
                          setActionReason('Outside AICTE purview; matter pertains to state university autonomous exam syllabus.');
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {queue.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#4B5565]">
                    <div className="space-y-1">
                      <p className="font-semibold text-[#1A1F2B]">Queue is Clear</p>
                      <p className="text-xs">All incoming complaints have been reviewed.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {actionType && selectedCase && (
        <Modal
          isOpen={true}
          onClose={() => {
            setActionType(null);
            setSelectedCase(null);
          }}
          title={
            actionType === 'APPROVE'
              ? `Approve Complaint (${selectedCase.id})`
              : actionType === 'REJECT'
              ? `Reject Complaint (${selectedCase.id})`
              : `Request Information (${selectedCase.id})`
          }
          description={`College: ${selectedCase.institutionName}`}
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setActionType(null);
                  setSelectedCase(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'REJECT' ? 'danger' : 'primary'}
                size="sm"
                onClick={handleExecuteAction}
                disabled={!actionReason.trim()}
              >
                Confirm {actionType === 'APPROVE' ? 'Approval' : actionType === 'REJECT' ? 'Rejection' : 'Request'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleExecuteAction} className="space-y-4">
            <div className="p-3 bg-[#F3F5F8] rounded border border-[#CBD2DC] text-xs">
              <div className="font-semibold text-[#1A1F2B]">{selectedCase.title}</div>
              <div className="text-[#4B5565] mt-1">{selectedCase.description}</div>
            </div>

            <TextArea
              label={
                actionType === 'APPROVE'
                  ? 'Approval & Assignment Notes'
                  : actionType === 'REJECT'
                  ? 'Reason for Rejection'
                  : 'Requested Information or Documents'
              }
              required
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={4}
            />
          </form>
        </Modal>
      )}
    </div>
  );
};
