import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { AnalyticsSummary } from '../types';
import { Button } from '../design-system/Button';
import { useApp } from '../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Download,
  Table as TableIcon,
  PieChart as PieIcon,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const { addToast } = useApp();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [showTableAlt, setShowTableAlt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const summary = await apiService.getAnalyticsSummary();
        setData(summary);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Bureau', 'Total Cases', 'Overdue Cases'],
      ...data.bureauBreakdown.map((b) => [b.bureau, b.count, b.overdue]),
      [],
      ['Category', 'Count'],
      ...data.categoryBreakdown.map((c) => [c.category, c.count]),
      [],
      ['Month', 'Received', 'Resolved'],
      ...data.monthlyTrend.map((m) => [m.month, m.received, m.resolved]),
    ];

    const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AICTE_Official_Grievance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Report Downloaded',
      message: 'Comprehensive analytics exported to CSV.',
    });
  };

  if (!data) {
    return (
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-12 text-center text-[#4B5565]">
        Loading analytics engine...
      </div>
    );
  }

  // Token calibrated colors
  const COLORS = ['#1F5FBF', '#C2570C', '#0B2A5B', '#166534', '#92400E', '#B91C1C', '#4B5565'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#C2570C]" />
            <h2 className="text-base font-bold text-[#0B2A5B]">
              Reports &amp; Analytics
            </h2>
          </div>
          <p className="text-xs text-[#4B5565] mt-1">
            Monthly complaint statistics, resolution timeframes, and category breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<TableIcon className="w-3.5 h-3.5" />}
            onClick={() => setShowTableAlt(!showTableAlt)}
          >
            {showTableAlt ? 'Show Charts' : 'Table View'}
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

      {/* High Level Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 text-center">
          <div className="text-[11px] font-bold uppercase text-[#4B5565]">Total Received</div>
          <div className="text-2xl font-extrabold text-[#0B2A5B] font-mono mt-1">{data.totalReceived}</div>
          <div className="text-[10px] text-[#4B5565] mt-0.5">Current cycle</div>
        </div>

        <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 text-center">
          <div className="text-[11px] font-bold uppercase text-[#166534]">Disposed / Resolved</div>
          <div className="text-2xl font-extrabold text-[#166534] font-mono mt-1">{data.totalResolved}</div>
          <div className="text-[10px] text-[#166534] mt-0.5">
            {((data.totalResolved / data.totalReceived) * 100).toFixed(1)}% resolution rate
          </div>
        </div>

        <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 text-center">
          <div className="text-[11px] font-bold uppercase text-[#92400E]">Average Resolution Time</div>
          <div className="text-2xl font-extrabold text-[#92400E] font-mono mt-1">{data.avgResolutionDays}d</div>
          <div className="text-[10px] text-[#4B5565] mt-0.5">Target: under 15 days</div>
        </div>

        <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 text-center">
          <div className="text-[11px] font-bold uppercase text-[#B91C1C]">Overdue Escalations</div>
          <div className="text-2xl font-extrabold text-[#B91C1C] font-mono mt-1">{data.overdueCases}</div>
          <div className="text-[10px] text-[#B91C1C] mt-0.5">SLA breaches flagged</div>
        </div>
      </div>

      {/* Chart View or Accessible Data Table View */}
      {!showTableAlt ? (
        <div className="space-y-6">
          {/* Row 1: Bureau Breakdown & Monthly Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bureau Breakdown Bar Chart */}
            <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 space-y-3">
              <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wide">
                Grievance Volume &amp; Overdue Status by AICTE Bureau
              </h3>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.bureauBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#CBD2DC" vertical={false} />
                    <XAxis
                      dataKey="bureau"
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                      tick={{ fill: '#1A1F2B', fontSize: 10 }}
                    />
                    <YAxis tick={{ fill: '#4B5565', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD2DC', borderRadius: 4, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="count" name="Total Received" fill="#1F5FBF" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="overdue" name="Overdue" fill="#B91C1C" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Intake vs Resolution Trend */}
            <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 space-y-3">
              <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wide">
                6-Month Trajectory: Lodged vs Disposed Grievances
              </h3>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyTrend} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#CBD2DC" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#1A1F2B', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#4B5565', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD2DC', borderRadius: 4, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="received"
                      name="Received"
                      stroke="#C2570C"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      name="Resolved"
                      stroke="#166534"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: Category Breakdown & Regional Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 space-y-3">
              <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wide">
                Subject Matter &amp; Regulatory Category Breakdown
              </h3>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.categoryBreakdown}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 60, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#CBD2DC" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#4B5565', fontSize: 11 }} />
                    <YAxis
                      dataKey="category"
                      type="category"
                      width={120}
                      tick={{ fill: '#1A1F2B', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD2DC', borderRadius: 4, fontSize: 12 }}
                    />
                    <Bar dataKey="count" name="Complaints" fill="#0B2A5B" radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Regional Geographic Distribution */}
            <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 space-y-3">
              <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wide">
                Distribution Across AICTE Regional Directorates
              </h3>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.regionDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#CBD2DC" vertical={false} />
                    <XAxis dataKey="region" tick={{ fill: '#1A1F2B', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#4B5565', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD2DC', borderRadius: 4, fontSize: 12 }}
                    />
                    <Bar dataKey="count" name="Case Count" fill="#1F5FBF" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Accessible Data Table Alternative */
        <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#0B2A5B]">Bureau Breakdown Data Table</h3>
            <table className="w-full text-left text-xs border border-[#CBD2DC]">
              <thead className="bg-[#F3F5F8] text-[#4B5565]">
                <tr>
                  <th className="p-2 border-b border-[#CBD2DC]">Bureau Name</th>
                  <th className="p-2 border-b border-[#CBD2DC]">Total Cases</th>
                  <th className="p-2 border-b border-[#CBD2DC]">Overdue Cases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD2DC]">
                {data.bureauBreakdown.map((b) => (
                  <tr key={b.bureau}>
                    <td className="p-2 font-medium">{b.bureau}</td>
                    <td className="p-2 font-mono">{b.count}</td>
                    <td className="p-2 font-mono text-[#B91C1C]">{b.overdue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#0B2A5B]">Category Distribution Data Table</h3>
            <table className="w-full text-left text-xs border border-[#CBD2DC]">
              <thead className="bg-[#F3F5F8] text-[#4B5565]">
                <tr>
                  <th className="p-2 border-b border-[#CBD2DC]">Category</th>
                  <th className="p-2 border-b border-[#CBD2DC]">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD2DC]">
                {data.categoryBreakdown.map((c) => (
                  <tr key={c.category}>
                    <td className="p-2 font-medium">{c.category}</td>
                    <td className="p-2 font-mono">{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
