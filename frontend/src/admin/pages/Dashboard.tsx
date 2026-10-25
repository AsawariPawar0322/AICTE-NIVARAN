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
  CheckCircle2,
  ArrowRight,
  Filter,
  RefreshCw,
  Building2,
  ExternalLink,
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
      {/* Overview Banner */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#0B2A5B]">
              Grievance Dashboard
            </h2>
            <span className="text-xs px-2 py-0.5 bg-[#E6EEF9] text-[#1F5FBF] border border-[#93C5FD] rounded font-semibold">
              Live
            </span>
          </div>
          <p className="text-xs text-[#4B5565] mt-0.5">
            Overview of active complaints, deadlines, and recent case actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => {
              loadData();
              addToast({
                type: 'info',
                title: 'Refreshed',
                message: 'Dashboard counters updated.',
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
            Review Queue
          </Button>
        </div>
      </div>

      {/* Metric Tiles - Pre-filtered navigation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: New Cases */}
        <Link
          to="/cases?status=REGISTERED"
          className="bg-white border border-[#CBD2DC] hover:border-[#1F5FBF] rounded-[8px] p-4 flex flex-col justify-between transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4B5565] uppercase tracking-wider">
              {t('metric_new')}
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-[#E6EEF9] text-[#1F5FBF] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#0B2A5B] font-mono">
              {metrics ? metrics.statusDistribution.find(s => s.status.includes('Registered'))?.count || 8 : '--'}
            </div>
            <div className="flex items-center justify-between text-xs text-[#4B5565] mt-1">
              <span>Awaiting intake triage</span>
              <span className="text-[#1F5FBF] font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                Review &rarr;
              </span>
            </div>
          </div>
        </Link>

        {/* Metric 2: Assigned to Me */}
        <Link
          to="/cases?bureau=Approval"
          className="bg-white border border-[#CBD2DC] hover:border-[#1F5FBF] rounded-[8px] p-4 flex flex-col justify-between transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4B5565] uppercase tracking-wider">
              {t('metric_assigned')}
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-[#E0E7FF] text-[#3730A3] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#0B2A5B] font-mono">
              12
            </div>
            <div className="flex items-center justify-between text-xs text-[#4B5565] mt-1">
              <span>Under Approval Bureau lead</span>
              <span className="text-[#1F5FBF] font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                View &rarr;
              </span>
            </div>
          </div>
        </Link>

        {/* Metric 3: Due in 3 Days */}
        <Link
          to="/cases?dueSoon=true"
          className="bg-white border border-[#CBD2DC] hover:border-[#FCD34D] rounded-[8px] p-4 flex flex-col justify-between transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#92400E] uppercase tracking-wider">
              {t('metric_due_soon')}
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#92400E] font-mono">
              {metrics ? metrics.dueIn3Days : '--'}
            </div>
            <div className="flex items-center justify-between text-xs text-[#92400E] mt-1">
              <span>Mandatory 72h window closing</span>
              <span className="font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                Prioritize &rarr;
              </span>
            </div>
          </div>
        </Link>

        {/* Metric 4: Overdue Cases */}
        <Link
          to="/cases?isOverdue=true"
          className="bg-white border border-[#CBD2DC] hover:border-[#FCA5A5] rounded-[8px] p-4 flex flex-col justify-between transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B91C1C] uppercase tracking-wider">
              {t('metric_overdue')}
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#B91C1C] font-mono">
              {metrics ? metrics.overdueCases : '--'}
            </div>
            <div className="flex items-center justify-between text-xs text-[#B91C1C] mt-1">
              <span>Escalation notice dispatched</span>
              <span className="font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                Action required &rarr;
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Bureau Filter & Needs Action Table */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] overflow-hidden">
        {/* Table Header with Bureau Filter */}
        <div className="p-4 border-b border-[#CBD2DC] bg-[#F3F5F8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#0B2A5B] uppercase tracking-wide">
              Priority Cases
            </h3>
            <span className="text-xs text-[#4B5565] font-normal">
              ({filteredNeedsAction.length} cases needing action)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#4B5565]" aria-hidden="true" />
            <span className="text-xs font-semibold text-[#1A1F2B]">Filter by Bureau:</span>
            <select
              value={selectedBureau}
              onChange={(e) => setSelectedBureau(e.target.value)}
              className="h-8 px-2 text-xs bg-white border border-[#CBD2DC] rounded-[4px] text-[#1A1F2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
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

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#CBD2DC] bg-[#F3F5F8] text-[#4B5565] uppercase font-semibold">
                <th className="py-2.5 px-3">Complaint ID</th>
                <th className="py-2.5 px-3">Subject / Core Issue</th>
                <th className="py-2.5 px-3">Institution</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Urgency</th>
                <th className="py-2.5 px-3">SLA Remaining</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD2DC]">
              {filteredNeedsAction.map((c) => (
                <tr key={c.id} className="hover:bg-[#F3F5F8] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#0B2A5B] whitespace-nowrap">
                    <Link to={`/cases/${c.id}`} className="hover:text-[#C2570C] hover:underline flex items-center gap-1">
                      {c.id}
                      <ExternalLink className="w-3 h-3 text-[#4B5565]" />
                    </Link>
                  </td>
                  <td className="py-3 px-3 max-w-xs truncate font-medium text-[#1A1F2B]" title={c.title}>
                    {c.title}
                  </td>
                  <td className="py-3 px-3 text-[#4B5565]">
                    <div className="font-semibold text-[#1A1F2B] truncate max-w-[180px]">{c.institutionName}</div>
                    <div className="text-[11px] font-mono text-[#4B5565]">{c.institutionPermanentId} · {c.city}</div>
                  </td>
                  <td className="py-3 px-3 text-[#4B5565] whitespace-nowrap">
                    {c.category}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusChip status={c.status} isOverdue={c.isOverdue} overdueDays={c.overdueDays} size="sm" />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <UrgencyBadge urgency={c.urgency} size="sm" />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono">
                    {c.isOverdue ? (
                      <span className="text-[#B91C1C] font-bold">Overdue {c.overdueDays}d</span>
                    ) : (
                      <span className={c.daysRemaining <= 3 ? 'text-[#92400E] font-bold' : 'text-[#166534]'}>
                        {c.daysRemaining} days left
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/cases/${c.id}`)}
                    >
                      Handle
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredNeedsAction.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#4B5565]">
                    No urgent action items in this bureau. All cases within SLA targets.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 border-t border-[#CBD2DC] bg-[#F3F5F8] flex items-center justify-between text-xs text-[#4B5565]">
          <span>Showing priority queue records</span>
          <Link to="/cases" className="text-[#C2570C] font-semibold hover:underline flex items-center gap-1">
            View all cases in registry &rarr;
          </Link>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Institution Quick Look */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Official Activity Feed */}
        <div className="lg:col-span-2 bg-white border border-[#CBD2DC] rounded-[8px] p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#CBD2DC]">
            <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wide">
              Recent Activity
            </h3>
            <Link to="/audit-logs" className="text-xs text-[#C2570C] hover:underline font-semibold">
              View all activity &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-2 rounded hover:bg-[#F3F5F8] text-xs">
              <div className="w-2 h-2 rounded-full bg-[#B91C1C] mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1A1F2B]">Case Escalated to Level 2 (Member Secretary)</span>
                  <span className="text-[11px] text-[#4B5565] font-mono">18:12 today</span>
                </div>
                <div className="text-[#4B5565] mt-0.5">
                  Officer S. Khurana escalated <span className="font-mono text-[#0B2A5B]">AICTE-2024-GRV-8102</span> (DIET Delhi) due to 4 days SLA breach.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 rounded hover:bg-[#F3F5F8] text-xs">
              <div className="w-2 h-2 rounded-full bg-[#1F5FBF] mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1A1F2B]">Clarification Notice Dispatched</span>
                  <span className="text-[11px] text-[#4B5565] font-mono">14:10 today</span>
                </div>
                <div className="text-[#4B5565] mt-0.5">
                  Student Development Bureau requested biometric logs from <span className="font-mono text-[#0B2A5B]">COEP Tech</span> (AICTE-2024-GRV-8308).
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 rounded hover:bg-[#F3F5F8] text-xs">
              <div className="w-2 h-2 rounded-full bg-[#166534] mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1A1F2B]">Resolution Proof Verified &amp; Closed</span>
                  <span className="text-[11px] text-[#4B5565] font-mono">Yesterday</span>
                </div>
                <div className="text-[#4B5565] mt-0.5">
                  Skill Development Bureau verified dispatch of migration certificate for <span className="font-mono text-[#0B2A5B]">AICTE-2024-GRV-7120</span>.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Institution Quick Directory Card */}
        <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#CBD2DC]">
              <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wide">
                Colleges with Active Cases
              </h3>
              <Building2 className="w-4 h-4 text-[#4B5565]" />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2 border border-[#CBD2DC] rounded bg-[#F3F5F8]">
                <div className="font-semibold text-[#1A1F2B]">Dr. D. Y. Patil Inst. of Technology, Pune</div>
                <div className="flex items-center justify-between text-[11px] text-[#4B5565] mt-1">
                  <span>Perm ID: 1-94857697</span>
                  <span className="text-[#B91C1C] font-bold">14 Active Cases</span>
                </div>
              </div>

              <div className="p-2 border border-[#CBD2DC] rounded bg-[#F3F5F8]">
                <div className="font-semibold text-[#1A1F2B]">Govt. College of Engg, Sambhajinagar</div>
                <div className="flex items-center justify-between text-[11px] text-[#4B5565] mt-1">
                  <span>Perm ID: 1-50918244</span>
                  <span className="text-[#B91C1C] font-bold">12 Active Cases</span>
                </div>
              </div>

              <div className="p-2 border border-[#CBD2DC] rounded bg-[#F3F5F8]">
                <div className="font-semibold text-[#1A1F2B]">Bharati Vidyapeeth CoE, Katraj Pune</div>
                <div className="flex items-center justify-between text-[11px] text-[#4B5565] mt-1">
                  <span>Perm ID: 1-97887920</span>
                  <span className="text-[#92400E] font-bold">11 Active Cases</span>
                </div>
              </div>

              <div className="p-2 border border-[#CBD2DC] rounded bg-[#F3F5F8]">
                <div className="font-semibold text-[#1A1F2B]">Veermata Jijabai Tech. Inst. (VJTI), Mumbai</div>
                <div className="flex items-center justify-between text-[11px] text-[#4B5565] mt-1">
                  <span>Perm ID: 1-12490182</span>
                  <span className="text-[#1F5FBF] font-bold">7 Active Cases</span>
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
            Open Map View
          </Button>
        </div>
      </div>
    </div>
  );
};
