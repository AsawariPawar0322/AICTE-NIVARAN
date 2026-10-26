import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Complaint } from '../types';
import { StatusChip } from '../design-system/StatusChip';
import { Button } from '../design-system/Button';
import {
  ListOrdered,
  Clock,
  AlertTriangle,
  GitCommit,
  Building2,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';

export const StageTracking: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true);
      try {
        const res = await apiService.getComplaints({ limit: 20 });
        setComplaints(res.items);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
  }, []);

  const filtered = complaints.filter((c) => {
    if (selectedCaseId !== 'ALL' && c.id !== selectedCaseId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.institutionName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-[#C2570C]" />
          <h2 className="text-base font-bold text-[#0B2A5B]">
            Timeline &amp; Progress
          </h2>
          <span className="text-xs px-2 py-0.5 bg-[#E6EEF9] text-[#1F5FBF] border border-[#93C5FD] rounded font-semibold">
            Stage Tracking
          </span>
        </div>
        <p className="text-xs text-[#4B5565] mt-1">
          Track step-by-step progress, actions taken, and escalation deadlines for active cases.
        </p>
      </div>

      {/* Filter Strip */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex-1 max-w-md relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, keyword, or institution..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#F3F5F8] border border-[#CBD2DC] rounded-[4px] text-[#1A1F2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
          />
          <Search className="w-3.5 h-3.5 text-[#4B5565] absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#4B5565]" />
          <span className="font-semibold text-[#1A1F2B]">Case Filter:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="h-8 px-2 bg-white border border-[#CBD2DC] rounded-[4px] text-[#1A1F2B]"
          >
            <option value="ALL">All Active Cases ({complaints.length})</option>
            {complaints.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.institutionName.substring(0, 24)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stage Cards Feed */}
      <div className="space-y-6">
        {filtered.map((c) => (
          <div
            key={c.id}
            className={`bg-white border rounded-[8px] p-5 space-y-4 ${
              c.isOverdue ? 'border-[#FCA5A5]' : 'border-[#CBD2DC]'
            }`}
          >
            {/* Case Summary Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#CBD2DC]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-[#0B2A5B] bg-[#F3F5F8] px-2 py-0.5 rounded border border-[#CBD2DC]">
                    {c.id}
                  </span>
                  <StatusChip status={c.status} isOverdue={c.isOverdue} overdueDays={c.overdueDays} size="sm" />
                  <span className="text-xs px-2 py-0.5 bg-[#F3F5F8] text-[#4B5565] rounded border border-[#CBD2DC]">
                    Bureau: {c.assignedBureau}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#1A1F2B] mt-1.5 leading-snug">
                  {c.title}
                </h3>
                <div className="text-xs text-[#4B5565] mt-0.5">
                  Respondent: <span className="font-semibold text-[#1A1F2B]">{c.institutionName}</span> ({c.institutionPermanentId})
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="text-right text-xs">
                  <div className="text-[#4B5565] text-[10px] uppercase font-bold">Target SLA</div>
                  <div className="font-mono font-bold text-xs text-[#0B2A5B]">
                    {c.slaDeadline.split('T')[0]}
                  </div>
                  {c.isOverdue ? (
                    <span className="text-[11px] font-bold text-[#B91C1C]">
                      Overdue by {c.overdueDays}d
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#166534]">
                      {c.daysRemaining} days remaining
                    </span>
                  )}
                </div>
                <Link to={`/cases/${c.id}`}>
                  <Button variant="secondary" size="sm">
                    Open Case
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stages Timeline */}
            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#CBD2DC]">
              {c.timeline.map((stage) => (
                <div key={stage.id} className="relative">
                  <div
                    className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${
                      stage.isEscalated ? 'bg-[#B91C1C]' : 'bg-[#1F5FBF]'
                    }`}
                  />
                  <div className="p-3 bg-[#F3F5F8] rounded-[6px] border border-[#CBD2DC] text-xs space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[#0B2A5B] flex items-center gap-1.5">
                        {stage.stageName}
                        {stage.isEscalated && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] rounded font-bold">
                            ESCALATED
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[11px] text-[#4B5565]">
                        {new Date(stage.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-[#1A1F2B] font-medium leading-relaxed">
                      {stage.actionTaken}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#4B5565] pt-1 border-t border-[#CBD2DC]/60">
                      <div>
                        <span className="font-semibold text-[#1A1F2B]">Responsible Role:</span> {stage.performedByRole} ({stage.performedByName})
                      </div>
                      <div>
                        <span className="font-semibold text-[#1A1F2B]">Next Expected Action:</span> {stage.nextExpectedStep}
                      </div>
                      {stage.deadlineDate && (
                        <div className="font-mono text-[#C2570C]">
                          <span className="font-semibold text-[#1A1F2B]">Step Deadline:</span> {stage.deadlineDate.split('T')[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
