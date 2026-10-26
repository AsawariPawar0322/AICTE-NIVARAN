import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Complaint, ComplaintStatus, UrgencyLevel } from '../types';
import { StatusChip, UrgencyBadge } from '../design-system/StatusChip';
import { Button } from '../design-system/Button';
import { useApp } from '../context/AppContext';
import {
  Download,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  FileSpreadsheet,
} from 'lucide-react';

export const AllCases: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useApp();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // Filters read from URL
  const queryParam = searchParams.get('query') || '';
  const statusParam = searchParams.get('status') || 'ALL';
  const bureauParam = searchParams.get('bureau') || 'ALL';
  const urgencyParam = searchParams.get('urgency') || 'ALL';
  const isOverdueParam = searchParams.get('isOverdue') === 'true';
  const dueSoonParam = searchParams.get('dueSoon') === 'true';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const sortByParam = (searchParams.get('sortBy') as any) || 'createdAt';
  const sortDirParam = (searchParams.get('sortDir') as any) || 'desc';

  const [searchInput, setSearchInput] = useState(queryParam);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getComplaints({
        query: queryParam,
        status: statusParam,
        bureau: bureauParam,
        urgency: urgencyParam,
        isOverdue: isOverdueParam,
        dueSoon: dueSoonParam,
        page: pageParam,
        limit: 10,
        sortBy: sortByParam,
        sortDir: sortDirParam,
      });
      setComplaints(res.items);
      setTotalItems(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
      addToast({
        type: 'danger',
        title: 'Error loading cases',
        message: 'Unable to retrieve complaints data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [
    queryParam,
    statusParam,
    bureauParam,
    urgencyParam,
    isOverdueParam,
    dueSoonParam,
    pageParam,
    sortByParam,
    sortDirParam,
  ]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'ALL') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('query', searchInput.trim() || null);
  };

  const handleSort = (field: 'createdAt' | 'slaDeadline' | 'urgency' | 'status' | 'id') => {
    const next = new URLSearchParams(searchParams);
    if (sortByParam === field) {
      next.set('sortDir', sortDirParam === 'asc' ? 'desc' : 'asc');
    } else {
      next.set('sortBy', field);
      next.set('sortDir', 'asc');
    }
    setSearchParams(next);
  };

  const handleExportCSV = async () => {
    try {
      const all = await apiService.getComplaints({
        query: queryParam,
        status: statusParam,
        bureau: bureauParam,
        urgency: urgencyParam,
        isOverdue: isOverdueParam,
        dueSoon: dueSoonParam,
        limit: 500,
      });
      apiService.exportComplaintsToCSV(all.items);
      addToast({
        type: 'success',
        title: 'CSV Export Initiated',
        message: `Exported ${all.items.length} grievance records to CSV.`,
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: 'danger',
        title: 'Export Failed',
        message: 'Could not generate CSV file.',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Search and Filters */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Text Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by ID, keyword, institute, or city..."
              className="w-full h-9 pl-9 pr-20 text-xs bg-[#F3F5F8] border border-[#CBD2DC] rounded-[4px] text-[#1A1F2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
            />
            <Search className="w-4 h-4 text-[#4B5565] absolute left-2.5 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 h-7 px-2.5 bg-[#C2570C] text-white rounded-[3px] text-xs font-semibold hover:bg-[#9A4509]"
            >
              Search
            </button>
          </form>

          {/* Action Buttons: Export & Density */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
              onClick={() => setIsCompact(!isCompact)}
            >
              {isCompact ? 'Comfortable View' : 'Compact Density'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filter Dropdowns Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#CBD2DC] text-xs">
          <div className="flex items-center gap-1 text-[#4B5565] font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusParam}
            onChange={(e) => updateParam('status', e.target.value)}
            className="h-8 px-2 bg-white border border-[#CBD2DC] rounded-[4px] text-[#1A1F2B]"
          >
            <option value="ALL">All Statuses</option>
            <option value="REGISTERED">Registered</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="INFO_REQUESTED">Info Requested</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="ACTION_IN_PROGRESS">Action in Progress</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Bureau Filter */}
          <select
            value={bureauParam}
            onChange={(e) => updateParam('bureau', e.target.value)}
            className="h-8 px-2 bg-white border border-[#CBD2DC] rounded-[4px] text-[#1A1F2B]"
          >
            <option value="ALL">All Bureaus</option>
            <option value="Approval">Approval Bureau</option>
            <option value="Policy & Academic Planning">Policy &amp; Academic Planning</option>
            <option value="Student Development">Student Development</option>
            <option value="Finance">Finance &amp; Accounts</option>
            <option value="Faculty Development">Faculty Development</option>
            <option value="Skill Development">Skill Development</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyParam}
            onChange={(e) => updateParam('urgency', e.target.value)}
            className="h-8 px-2 bg-white border border-[#CBD2DC] rounded-[4px] text-[#1A1F2B]"
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* SLA Quick Presets */}
          <button
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              if (isOverdueParam) next.delete('isOverdue');
              else next.set('isOverdue', 'true');
              next.delete('dueSoon');
              setSearchParams(next);
            }}
            className={`h-8 px-2.5 rounded-[4px] border font-semibold ${
              isOverdueParam
                ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                : 'bg-white border-[#CBD2DC] text-[#B91C1C] hover:bg-red-50'
            }`}
          >
            Overdue Only
          </button>

          <button
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              if (dueSoonParam) next.delete('dueSoon');
              else next.set('dueSoon', 'true');
              next.delete('isOverdue');
              setSearchParams(next);
            }}
            className={`h-8 px-2.5 rounded-[4px] border font-semibold ${
              dueSoonParam
                ? 'bg-[#92400E] text-white border-[#92400E]'
                : 'bg-white border-[#CBD2DC] text-[#92400E] hover:bg-yellow-50'
            }`}
          >
            Due in 3 Days
          </button>

          {(statusParam !== 'ALL' || bureauParam !== 'ALL' || urgencyParam !== 'ALL' || isOverdueParam || dueSoonParam || queryParam) && (
            <button
              onClick={() => setSearchParams(new URLSearchParams())}
              className="text-[#C2570C] hover:underline font-semibold ml-auto"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Cases Table */}
      <div className="bg-white border border-[#CBD2DC] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[1100px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#CBD2DC] bg-[#F8FAFC] text-[#475569] uppercase font-bold tracking-wider text-[11px]">
                <th className="py-3 px-4">
                  <button
                    onClick={() => handleSort('id')}
                    className="flex items-center gap-1 hover:text-[#1A1F2B]"
                  >
                    <span>Complaint ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Subject &amp; Category</th>
                <th className="py-3 px-4">Institution &amp; Region</th>
                <th className="py-3 px-4">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-[#1A1F2B]"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    onClick={() => handleSort('urgency')}
                    className="flex items-center gap-1 hover:text-[#1A1F2B]"
                  >
                    <span>Urgency</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Bureau &amp; Officer</th>
                <th className="py-3 px-4">
                  <button
                    onClick={() => handleSort('slaDeadline')}
                    className="flex items-center gap-1 hover:text-[#1A1F2B]"
                  >
                    <span>SLA Deadline</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD2DC]">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0B2A5B] whitespace-nowrap">
                    <Link
                      to={`/cases/${c.id}`}
                      className="hover:text-[#C2570C] inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#CBD2DC]"
                    >
                      {c.id}
                      <ExternalLink className="w-3 h-3 text-[#64748B]" />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="font-semibold text-[#1A1F2B] truncate" title={c.title}>
                      {c.title}
                    </div>
                    <div className="text-[11px] text-[#4B5565] flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span>{c.category}</span>
                      {c.pov && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#EEF2FF] text-[#3730A3] border border-[#C7D2FE] rounded font-medium">
                          {c.pov}
                        </span>
                      )}
                      {c.similarityScore && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] rounded font-mono font-bold">
                          {c.similarityScore}% match
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#1A1F2B] truncate max-w-[200px]" title={c.institutionName}>
                      {c.institutionName}
                    </div>
                    <div className="text-[11px] font-mono text-[#64748B]">
                      {c.institutionPermanentId} · {c.city}, {c.state}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusChip status={c.status} isOverdue={c.isOverdue} overdueDays={c.overdueDays} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <UrgencyBadge urgency={c.urgency} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-[#1A1F2B] truncate max-w-[160px] font-semibold">
                      {c.assignedBureau}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {c.assignedOfficerName || 'Unassigned (Triage)'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                    <div>{c.slaDeadline.split('T')[0]}</div>
                    {c.isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-[#B91C1C] font-bold text-[11px] bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                        Overdue by {c.overdueDays}d
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#166534] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {c.daysRemaining}d remaining
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link
                      to={`/cases/${c.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#CBD2DC] hover:border-[#0B2A5B] hover:bg-[#F8FAFC] text-[#0B2A5B] font-semibold text-xs shadow-xs transition-colors"
                    >
                      View Detail
                      <ExternalLink className="w-3 h-3 text-[#64748B]" />
                    </Link>
                  </td>
                </tr>
              ))}

              {complaints.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#4B5565]">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-semibold text-[#1A1F2B]">No complaints match current filters</p>
                      <p className="text-xs">Try clearing query terms or selecting "All Bureaus" and "All Statuses".</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSearchParams(new URLSearchParams())}
                      >
                        Reset All Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-[#CBD2DC] bg-[#F3F5F8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#4B5565]">
          <div>
            Showing <span className="font-semibold text-[#1A1F2B]">{complaints.length}</span> of{' '}
            <span className="font-semibold text-[#1A1F2B]">{totalItems}</span> cases in registry
          </div>

          <div className="flex items-center gap-2">
            <span className="mr-1">
              Page <span className="font-bold text-[#1A1F2B]">{pageParam}</span> of{' '}
              <span className="font-bold text-[#1A1F2B]">{totalPages}</span>
            </span>

            <button
              disabled={pageParam <= 1}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set('page', String(pageParam - 1));
                setSearchParams(next);
              }}
              className="p-1.5 rounded border border-[#CBD2DC] bg-white text-[#1A1F2B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F3F5F8]"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              disabled={pageParam >= totalPages}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set('page', String(pageParam + 1));
                setSearchParams(next);
              }}
              className="p-1.5 rounded border border-[#CBD2DC] bg-white text-[#1A1F2B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F3F5F8]"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
