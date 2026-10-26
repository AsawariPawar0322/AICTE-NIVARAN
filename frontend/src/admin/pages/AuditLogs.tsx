import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { AuditLogEntry } from '../types';
import { Button } from '../design-system/Button';
import { useApp } from '../context/AppContext';
import {
  ScrollText,
  ShieldCheck,
  Search,
  Filter,
  Download,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const { addToast } = useApp();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.targetEntity.toLowerCase().includes(q) ||
        (log.targetCaseId && log.targetCaseId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor Name', 'Role', 'Bureau', 'Action', 'Target ID', 'Target Entity', 'Details', 'Origin IP'];
    const rows = filtered.map((l) => [
      `"${l.timestamp}"`,
      `"${l.actorName}"`,
      `"${l.actorRole}"`,
      `"${l.bureau}"`,
      `"${l.action}"`,
      `"${l.targetCaseId || ''}"`,
      `"${l.targetEntity}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AICTE_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Audit Trail Exported',
      message: `Exported ${filtered.length} audit records to CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-[#C2570C]" />
              <h2 className="text-base font-bold text-[#0B2A5B]">
                Audit Logs
              </h2>
            </div>
            <p className="text-xs text-[#4B5565] mt-1">
              History of all official case actions, approvals, transfers, and decisions.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export Audit Trail (CSV)
          </Button>
        </div>

      </div>

      {/* Filter Strip */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex-1 max-w-md relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by officer, case ID, or keyword..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#F3F5F8] border border-[#CBD2DC] rounded-[4px] text-[#1A1F2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
          />
          <Search className="w-3.5 h-3.5 text-[#4B5565] absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#4B5565]" />
          <span className="font-semibold text-[#1A1F2B]">Action Type:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-8 px-2 bg-white border border-[#CBD2DC] rounded-[4px] text-[#1A1F2B]"
          >
            <option value="ALL">All Recorded Actions</option>
            <option value="CASE_TRIAGED">Case Triaged</option>
            <option value="STATUS_UPDATED">Status Updated</option>
            <option value="CASE_ESCALATED">Case Escalated</option>
            <option value="INFO_REQUESTED">Info Requested</option>
            <option value="RESOLUTION_APPROVED">Resolution Approved</option>
            <option value="RESOLUTION_DISPUTED">Resolution Disputed</option>
            <option value="CASE_TRANSFERRED">Case Transferred</option>
            <option value="CONFIDENTIAL_NOTE_ADDED">Confidential Note Added</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#CBD2DC] bg-[#F3F5F8] text-[#4B5565] uppercase font-semibold">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Official Actor</th>
                <th className="py-2.5 px-3">Action Recorded</th>
                <th className="py-2.5 px-3">Target Reference</th>
                <th className="py-2.5 px-3">Action Details</th>
                <th className="py-2.5 px-3">Origin IP / Network</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD2DC]">
              {filtered.map((log) => {
                let badgeBg = 'bg-[#E6EEF9] text-[#1F5FBF] border-[#93C5FD]';
                if (log.action.includes('ESCALATED')) badgeBg = 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]';
                else if (log.action.includes('APPROVED')) badgeBg = 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]';
                else if (log.action.includes('DISPUTED')) badgeBg = 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]';

                return (
                  <tr key={log.id} className="hover:bg-[#F3F5F8] transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-[#4B5565]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-[#1A1F2B]">{log.actorName}</div>
                      <div className="text-[11px] text-[#4B5565]">{log.actorRole}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold border ${badgeBg}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {log.targetCaseId ? (
                        <Link
                          to={`/cases/${log.targetCaseId}`}
                          className="font-mono font-bold text-[#1F5FBF] hover:underline flex items-center gap-1"
                        >
                          {log.targetCaseId}
                          <ExternalLink className="w-3 h-3 text-[#4B5565]" />
                        </Link>
                      ) : (
                        <span className="font-mono text-[#4B5565]">-</span>
                      )}
                      <div className="text-[11px] text-[#4B5565] truncate max-w-[140px]">
                        {log.targetEntity}
                      </div>
                    </td>
                    <td className="py-3 px-3 max-w-sm text-[#1A1F2B]">
                      {log.details}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-[#4B5565]">
                      {log.ipAddress}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#4B5565]">
                    No audit records match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
