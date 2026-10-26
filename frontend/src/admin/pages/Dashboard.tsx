import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Complaint, AnalyticsSummary } from '../types';
import { StatusChip, UrgencyBadge } from '../design-system/StatusChip';
import { Button } from '../design-system/Button';
import { useApp } from '../context/AppContext';
import {
  FileText,
  UserCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
  RefreshCw,
  Building2,
  ExternalLink,
  ShieldCheck,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, addToast } = useApp();
  const [metrics, setMetrics] = useState<AnalyticsSummary | null>(null);
  const [needsActionCases, setNeedsActionCases] = useState<Complaint[]>([]);
  const [selectedBureau, setSelectedBureau] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const summary = await apiService.getAnalyticsSummary();
      setMetrics(summary);

      // Load cases needing urgent action (overdue or critical)
      const res = await apiService.getComplaints({ limit: 6, sortBy: 'slaDeadline', sortDir: 'asc' });
      setNeedsActionCases(res.items);
    } catch (err) {
      console.error(err);
      addToast({
        type: 'danger',
        title: 'Data Load Error',
        message: 'Could not refresh dashboard metrics.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBureau]);

  const filteredNeedsAction = selectedBureau === 'ALL'
    ? needsActionCases
    : needsActionCases.filter((c) => c.assignedBureau.includes(selectedBureau));

  return (
    <div className="space-y-6">
      {/* Overview Command Banner */}
      <div className="bg-white border border-[#CBD2DC] rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg md:text-xl font-bold text-[#0B2A5B] tracking-tight">
              National Grievance Redressal Dashboard
            </h2>
            <span className="text-xs px-2.5 py-0.5 bg-[#E6EEF9] text-[#1F5FBF] border border-[#93C5FD] rounded-full font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1F5FBF] animate-pulse" />
              Live Bureau Sync
            </span>
          </div>
          <p className="text-xs text-[#4B5565] mt-1 max-w-2xl">
            Real-time multi-perspective case intake, SLA breach monitoring, and inter-bureau redressal coordination across all AICTE-approved technical institutions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => {
              loadData();
              addToast({
                type: 'info',
                title: 'Counters Updated',
                message: 'Dashboard counters and priority queue refreshed.',
              });
            }}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/verification')}
          >
            Review Intake Queue
          </Button>
        </div>
      </div>

      {/* Metric Tiles - GIGW Standard Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: New Cases */}
        <Link
          to="/cases?status=REGISTERED"
          className="bg-white border border-[#CBD2DC] hover:border-[#1F5FBF] rounded-lg p-5 flex flex-col justify-between transition-all duration-150 hover:shadow-sm no-underline group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4B5565] uppercase tracking-wider">
              {t('metric_new')}
            </span>
            <div className="w-9 h-9 rounded-md bg-[#E6EEF9] text-[#1F5FBF] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#0B2A5B] font-mono tracking-tight">
              {metrics ? metrics.statusDistribution.find(s => s.status.includes('Registered'))?.count || 8 : '--'}
            </div>
            <div className="flex items-center justify-between text-xs text-[#4B5565] mt-2 pt-2 border-t border-[#F1F5F9]">
              <span>Awaiting intake triage</span>
              <span className="text-[#1F5FBF] font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Review <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </Link>

        {/* Metric 2: Assigned to Me */}
        <Link
          to="/cases?bureau=Approval"
          className="bg-white border border-[#CBD2DC] hover:border-[#4338CA] rounded-lg p-5 flex flex-col justify-between transition-all duration-150 hover:shadow-sm no-underline group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4B5565] uppercase tracking-wider">
              {t('metric_assigned')}
            </span>
            <div className="w-9 h-9 rounded-md bg-[#EEF2FF] text-[#4338CA] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#0B2A5B] font-mono tracking-tight">
              12
            </div>
            <div className="flex items-center justify-between text-xs text-[#4B5565] mt-2 pt-2 border-t border-[#F1F5F9]">
              <span>Approval Bureau lead</span>
              <span className="text-[#4338CA] font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                View <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </Link>

        {/* Metric 3: Due in 3 Days */}
        <Link
          to="/cases?dueSoon=true"
          className="bg-white border border-[#CBD2DC] hover:border-[#D97706] rounded-lg p-5 flex flex-col justify-between transition-all duration-150 hover:shadow-sm no-underline group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#92400E] uppercase tracking-wider">
              {t('metric_due_soon')}
            </span>
            <div className="w-9 h-9 rounded-md bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#92400E] font-mono tracking-tight">
              {metrics ? metrics.dueIn3Days : '--'}
            </div>
            <div className="flex items-center justify-between text-xs text-[#92400E] mt-2 pt-2 border-t border-[#FEF3C7]/60">
              <span>Mandatory 72h window closing</span>
              <span className="font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Prioritize <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </Link>

        {/* Metric 4: Overdue Cases */}
        <Link
          to="/cases?isOverdue=true"
          className="bg-white border border-[#CBD2DC] hover:border-[#DC2626] rounded-lg p-5 flex flex-col justify-between transition-all duration-150 hover:shadow-sm no-underline group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B91C1C] uppercase tracking-wider">
              {t('metric_overdue')}
            </span>
            <div className="w-9 h-9 rounded-md bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#B91C1C] font-mono tracking-tight">
              {metrics ? metrics.overdueCases : '--'}
            </div>
            <div className="flex items-center justify-between text-xs text-[#B91C1C] mt-2 pt-2 border-t border-[#FEE2E2]/60">
              <span>Escalation notice dispatched</span>
              <span className="font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Action required <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Priority Cases Table Card */}
      <div className="bg-white border border-[#CBD2DC] rounded-lg shadow-xs overflow-hidden">
        {/* Table Header with Bureau Filter */}
        <div className="p-4 border-b border-[#CBD2DC] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C2570C]" />
            <h3 className="text-sm font-bold text-[#0B2A5B] uppercase tracking-wide">
              Priority Redressal Cases
            </h3>
            <span className="text-xs px-2 py-0.5 bg-[#F1F5F9] text-[#475569] font-semibold rounded border border-[#CBD2DC]">
              {filteredNeedsAction.length} Needing Action
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#475569]" aria-hidden="true" />
            <label htmlFor="bureau-select" className="text-xs font-semibold text-[#1A1F2B]">
              Bureau:
            </label>
            <select
              id="bureau-select"
              value={selectedBureau}
              onChange={(e) => setSelectedBureau(e.target.value)}
              className="h-8 px-2.5 text-xs bg-white border border-[#CBD2DC] rounded text-[#1A1F2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
            >
              <option value="ALL">All Bureaus (AICTE-wide)</option>
              <option value="Approval">Approval Bureau</option>
              <option value="Policy & Academic Planning">Policy &amp; Academic Planning (P&amp;AP)</option>
              <option value="Student Development">Student Development Bureau</option>
              <option value="Finance">Finance &amp; Accounts Bureau</option>
              <option value="Faculty Development">Faculty Development Bureau</option>
              <option value="Skill Development">Skill Development Bureau</option>
            </select>
          </div>
        </div>

        {/* Table Content with horizontal scroll container to prevent cutoffs */}
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[1024px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#CBD2DC] bg-[#F8FAFC] text-[#475569] uppercase font-bold tracking-wider text-[11px]">
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Subject / Core Issue</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">SLA Window</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD2DC]">
              {filteredNeedsAction.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#0B2A5B] whitespace-nowrap">
                    <Link
                      to={`/cases/${c.id}`}
                      className="hover:text-[#C2570C] inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#CBD2DC]"
                    >
                      {c.id}
                      <ExternalLink className="w-3 h-3 text-[#64748B]" />
                    </Link>
                  </td>
                  <td className="py-3 px-4 max-w-xs font-medium text-[#1A1F2B]">
                    <div className="truncate font-semibold" title={c.title}>
                      {c.title}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#475569]">
                    <div className="font-semibold text-[#1A1F2B] truncate max-w-[200px]" title={c.institutionName}>
                      {c.institutionName}
                    </div>
                    <div className="text-[11px] font-mono text-[#64748B]">
                      {c.institutionPermanentId} · {c.city}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#475569] whitespace-nowrap font-medium">
                    {c.category}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusChip status={c.status} isOverdue={c.isOverdue} overdueDays={c.overdueDays} size="sm" />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <UrgencyBadge urgency={c.urgency} size="sm" />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-mono">
                    {c.isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-[#B91C1C] font-bold bg-[#FEE2E2] px-2 py-0.5 rounded border border-[#FCA5A5]">
                        <Clock className="w-3 h-3" /> Overdue {c.overdueDays}d
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold ${
                        c.daysRemaining <= 3
                          ? 'text-[#92400E] bg-[#FEF3C7] border border-[#FCD34D]'
                          : 'text-[#166534] bg-[#DCFCE7] border border-[#86EFAC]'
                      }`}>
                        <Clock className="w-3 h-3" /> {c.daysRemaining}d left
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <Link
                      to={`/cases/${c.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#CBD2DC] hover:border-[#0B2A5B] hover:bg-[#F8FAFC] text-[#0B2A5B] font-semibold text-xs shadow-xs transition-colors"
                    >
                      Handle
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredNeedsAction.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#4B5565]">
                    <CheckCircle2 className="w-8 h-8 text-[#166534] mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#1A1F2B]">No Urgent Action Items</p>
                    <p className="text-xs text-[#64748B] mt-0.5">All complaints in this bureau are progressing within their designated SLA targets.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 border-t border-[#CBD2DC] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-2 text-xs text-[#4B5565]">
          <span>Showing priority queue records needing immediate officer attention</span>
          <Link
            to="/cases"
            className="text-[#C2570C] font-bold hover:underline inline-flex items-center gap-1"
          >
            View all grievances in national registry &rarr;
          </Link>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Institution Quick Look */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Official Activity Feed */}
        <div className="lg:col-span-2 bg-white border border-[#CBD2DC] rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-[#CBD2DC]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1F5FBF]" />
              <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider">
                Official Audit &amp; Action Log
              </h3>
            </div>
            <Link to="/audit-logs" className="text-xs text-[#C2570C] hover:underline font-bold">
              View all activity &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-md bg-[#F8FAFC] border border-[#CBD2DC]/60 text-xs">
              <div className="w-2 h-2 rounded-full bg-[#B91C1C] mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-bold text-[#1A1F2B]">Case Escalated to Level 2 (Member Secretary)</span>
                  <span className="text-[11px] text-[#64748B] font-mono">18:12 today</span>
                </div>
                <div className="text-[#4B5565] mt-1">
                  Officer S. Khurana escalated <span className="font-mono font-bold text-[#0B2A5B]">AICTE-2024-GRV-8102</span> (DIET Delhi) due to 4 days SLA breach.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-md bg-[#F8FAFC] border border-[#CBD2DC]/60 text-xs">
              <div className="w-2 h-2 rounded-full bg-[#1F5FBF] mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-bold text-[#1A1F2B]">Clarification Notice Dispatched</span>
                  <span className="text-[11px] text-[#64748B] font-mono">14:10 today</span>
                </div>
                <div className="text-[#4B5565] mt-1">
                  Student Development Bureau requested biometric logs from <span className="font-mono font-bold text-[#0B2A5B]">COEP Tech</span> (AICTE-2024-GRV-8308).
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-md bg-[#F8FAFC] border border-[#CBD2DC]/60 text-xs">
              <div className="w-2 h-2 rounded-full bg-[#166534] mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-bold text-[#1A1F2B]">Resolution Proof Verified &amp; Closed</span>
                  <span className="text-[11px] text-[#64748B] font-mono">Yesterday</span>
                </div>
                <div className="text-[#4B5565] mt-1">
                  Skill Development Bureau verified dispatch of migration certificate for <span className="font-mono font-bold text-[#0B2A5B]">AICTE-2024-GRV-7120</span>.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Institution Quick Directory Card */}
        <div className="bg-white border border-[#CBD2DC] rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-[#CBD2DC]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0B2A5B]" />
                <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider">
                  Campus Hotspots
                </h3>
              </div>
              <span className="text-[10.5px] font-semibold text-[#64748B]">Active Cases</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 border border-[#CBD2DC] rounded-md bg-[#F8FAFC] hover:bg-white hover:border-[#1F5FBF] transition-all">
                <div className="font-bold text-[#1A1F2B]">Dr. D. Y. Patil Inst. of Technology, Pune</div>
                <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1.5 pt-1 border-t border-[#E2E8F0]">
                  <span className="font-mono">Perm ID: 1-94857697</span>
                  <span className="text-[#B91C1C] font-bold bg-red-50 border border-red-200 px-2 py-0.2 rounded-full">
                    14 Active Cases
                  </span>
                </div>
              </div>

              <div className="p-3 border border-[#CBD2DC] rounded-md bg-[#F8FAFC] hover:bg-white hover:border-[#1F5FBF] transition-all">
                <div className="font-bold text-[#1A1F2B]">Govt. College of Engg, Sambhajinagar</div>
                <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1.5 pt-1 border-t border-[#E2E8F0]">
                  <span className="font-mono">Perm ID: 1-50918244</span>
                  <span className="text-[#B91C1C] font-bold bg-red-50 border border-red-200 px-2 py-0.2 rounded-full">
                    12 Active Cases
                  </span>
                </div>
              </div>

              <div className="p-3 border border-[#CBD2DC] rounded-md bg-[#F8FAFC] hover:bg-white hover:border-[#1F5FBF] transition-all">
                <div className="font-bold text-[#1A1F2B]">Bharati Vidyapeeth CoE, Katraj Pune</div>
                <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1.5 pt-1 border-t border-[#E2E8F0]">
                  <span className="font-mono">Perm ID: 1-97887920</span>
                  <span className="text-[#92400E] font-bold bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-full">
                    11 Active Cases
                  </span>
                </div>
              </div>

              <div className="p-3 border border-[#CBD2DC] rounded-md bg-[#F8FAFC] hover:bg-white hover:border-[#1F5FBF] transition-all">
                <div className="font-bold text-[#1A1F2B]">Veermata Jijabai Tech. Inst. (VJTI), Mumbai</div>
                <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1.5 pt-1 border-t border-[#E2E8F0]">
                  <span className="font-mono">Perm ID: 1-12490182</span>
                  <span className="text-[#1F5FBF] font-bold bg-blue-50 border border-blue-200 px-2 py-0.2 rounded-full">
                    7 Active Cases
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-4"
            onClick={() => navigate('/origin-explorer')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Open Geo-Spatial Map View
          </Button>
        </div>
      </div>
    </div>
  );
};
;
