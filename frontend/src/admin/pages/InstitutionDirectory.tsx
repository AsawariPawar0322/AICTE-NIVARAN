import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { Institution, InstitutionScorecardItem } from '../types';
import { Button } from '../design-system/Button';
import { Modal } from '../design-system/Modal';
import { useApp } from '../context/AppContext';
import {
  downloadSyntheticDocument,
  downloadScorecardDossierPdf,
  downloadInspectionOrderPdf,
} from '../utils/documentDownloader';
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  LayoutGrid,
  List,
  Phone,
  Mail,
  ExternalLink,
  Flame,
  Scale,
  FileText,
  Download,
  Calendar,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const InstitutionDirectory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useApp();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [scorecards, setScorecards] = useState<InstitutionScorecardItem[]>([]);
  const [viewMode, setViewMode] = useState<'scorecard' | 'grid' | 'table'>('scorecard');
  const [isLoading, setIsLoading] = useState(true);

  const queryParam = searchParams.get('query') || '';
  const regionParam = searchParams.get('region') || 'ALL';
  const tierParam = searchParams.get('tier') || 'ALL';

  const [searchInput, setSearchInput] = useState(queryParam);

  // Inspection Order & Dossier Modal State
  const [selectedScorecard, setSelectedScorecard] = useState<InstitutionScorecardItem | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Form State for Inspection Order
  const [inspectionType, setInspectionType] = useState<'SURPRISE_PHYSICAL' | 'STATUTORY_SHOW_CAUSE' | 'DESK_AUDIT' | 'NODAL_HEARING'>('SURPRISE_PHYSICAL');
  const [targetDate, setTargetDate] = useState('2026-11-05');
  const [officerName, setOfficerName] = useState('Dr. Ramesh Chandra Verma (PGRC)');
  const [termsOfReference, setTermsOfReference] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [instData, scData] = await Promise.all([
        apiService.getInstitutions(queryParam, regionParam),
        apiService.getScorecards({
          tier: tierParam !== 'ALL' ? tierParam : undefined,
          region: regionParam !== 'ALL' ? regionParam : undefined,
          search: queryParam || undefined,
        }),
      ]);
      setInstitutions(instData);
      setScorecards(scData);
    } catch (err) {
      console.error(err);
      addToast({
        type: 'danger',
        title: 'Error',
        message: 'Could not load institutions or scorecard data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryParam, regionParam, tierParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) next.set('query', searchInput.trim());
    else next.delete('query');
    setSearchParams(next);
  };

  const updateRegion = (reg: string) => {
    const next = new URLSearchParams(searchParams);
    if (reg === 'ALL') next.delete('region');
    else next.set('region', reg);
    setSearchParams(next);
  };

  const updateTier = (tier: string) => {
    const next = new URLSearchParams(searchParams);
    if (tier === 'ALL') next.delete('tier');
    else next.set('tier', tier);
    setSearchParams(next);
  };

  const handleOpenOrderModal = (item: InstitutionScorecardItem) => {
    setSelectedScorecard(item);
    // Pre-populate sensible terms of reference based on explainable reasons
    const rationale = item.explainable_reasons.join('; ');
    setTermsOfReference(
      `Statutory Inquiry pursuant to AICTE Chapter 10 regulations regarding Permanent ID ${item.permanent_id} (${item.institution_name}). Inquiry focus: ${rationale}.`
    );
    if (item.priority_tier === 'CRITICAL') {
      setInspectionType('SURPRISE_PHYSICAL');
    } else if (item.priority_tier === 'HIGH') {
      setInspectionType('STATUTORY_SHOW_CAUSE');
    } else {
      setInspectionType('NODAL_HEARING');
    }
    setIsOrderModalOpen(true);
  };

  const handleOpenDossier = (item: InstitutionScorecardItem) => {
    setSelectedScorecard(item);
    setIsDossierModalOpen(true);
  };

  const handleDispatchInspectionOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScorecard) return;
    setIsSubmittingOrder(true);
    try {
      await apiService.orderInspection(selectedScorecard.permanent_id, {
        officer_name: officerName,
        inspection_type: inspectionType,
        target_date: targetDate,
        terms_of_reference: termsOfReference,
        inspecting_team: [officerName, 'Regional Nodal Observer (AICTE)', 'Accounts Forensic Auditor'],
      });

      addToast({
        type: 'success',
        title: 'Inspection Mandate Dispatched',
        message: `Official ${inspectionType} order generated for ${selectedScorecard.institution_name} (Permanent ID: ${selectedScorecard.permanent_id}).`,
      });

      setIsOrderModalOpen(false);
      loadData();
    } catch (err) {
      addToast({
        type: 'danger',
        title: 'Order Dispatch Failed',
        message: 'Could not record inspection order on central ledger.',
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // KPI calculations
  const totalMonitored = scorecards.length;
  const criticalCount = scorecards.filter((s) => s.priority_tier === 'CRITICAL' || s.priority_tier === 'HIGH').length;
  const totalUpheld = scorecards.reduce((acc, curr) => acc + curr.upheld_complaints, 0);
  const avgOverdue = scorecards.length > 0
    ? Math.round(scorecards.reduce((acc, curr) => acc + curr.overdue_rate, 0) / scorecards.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & View Switcher */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E6EEF9] text-[#0B2A5B] border border-[#CBD2DC]">
                AICTE VIGILANCE &amp; ACCREDITATION INTELLIGENCE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                PERMANENT ID AGGREGATED
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#0B2A5B] flex items-center gap-2 mt-1">
              <Building2 className="w-5 h-5 text-[#C2570C]" />
              Institution Grievance Scorecard &amp; Inspection Priorities
            </h2>
            <p className="text-xs text-[#4B5565] mt-0.5">
              Multi-factor regulatory ledger aggregating cases by immutable AICTE Permanent ID with transparent, explainable inspection rules.
            </p>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F3F5F8] border border-[#CBD2DC] rounded-[6px]">
            <Button
              variant={viewMode === 'scorecard' ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<Flame className="w-3.5 h-3.5" />}
              onClick={() => setViewMode('scorecard')}
              className={viewMode === 'scorecard' ? 'bg-[#0B2A5B]' : ''}
            >
              Inspection Scorecard
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<LayoutGrid className="w-3.5 h-3.5" />}
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-[#0B2A5B]' : ''}
            >
              Directory Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<List className="w-3.5 h-3.5" />}
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'bg-[#0B2A5B]' : ''}
            >
              Master Directory
            </Button>
          </div>
        </div>

        {/* Search & Filter Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-[#CBD2DC]">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Institution Name, City, or AICTE Permanent ID (e.g. 1-10928341, 1-10294821)..."
              className="w-full h-9 pl-9 pr-20 text-xs bg-[#F3F5F8] border border-[#CBD2DC] rounded-[4px] text-[#1A1F2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
            />
            <Search className="w-4 h-4 text-[#4B5565] absolute left-2.5 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 h-7 px-3 bg-[#C2570C] text-white rounded-[3px] text-xs font-semibold hover:bg-[#9A4509]"
            >
              Search
            </button>
          </form>

          {/* Region Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#4B5565]" />
            <span className="font-semibold text-[#1A1F2B]">Region:</span>
            <select
              value={regionParam}
              onChange={(e) => updateRegion(e.target.value)}
              className="h-9 px-2.5 bg-white border border-[#CBD2DC] rounded-[4px] text-[#1A1F2B]"
            >
              <option value="ALL">All Regions (National)</option>
              <option value="Northern">Northern</option>
              <option value="Western">Western</option>
              <option value="Southern">Southern</option>
            </select>
          </div>

          {/* Priority Tier Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#1A1F2B]">Priority:</span>
            <select
              value={tierParam}
              onChange={(e) => updateTier(e.target.value)}
              className="h-9 px-2.5 bg-white border border-[#CBD2DC] rounded-[4px] text-[#1A1F2B]"
            >
              <option value="ALL">All Priority Tiers</option>
              <option value="CRITICAL">Critical (Surprise Inspection)</option>
              <option value="HIGH">High (Show-Cause)</option>
              <option value="MEDIUM">Medium (Hearing)</option>
              <option value="ROUTINE">Routine Monitoring</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: INSPECTION PRIORITY SCORECARD */}
      {viewMode === 'scorecard' && (
        <div className="space-y-5">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4">
              <div className="text-[11px] font-bold text-[#4B5565] uppercase">Institutions Monitored</div>
              <div className="text-2xl font-mono font-bold text-[#0B2A5B] mt-1">{totalMonitored}</div>
              <div className="text-[11px] text-[#4B5565] mt-0.5 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#1F5FBF]" />
                Permanent ID Ledger
              </div>
            </div>

            <div className="bg-white border border-[#FCA5A5] bg-red-50/30 rounded-[8px] p-4">
              <div className="text-[11px] font-bold text-[#991B1B] uppercase flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#DC2626]" />
                Priority Inspection Mandates
              </div>
              <div className="text-2xl font-mono font-bold text-[#DC2626] mt-1">{criticalCount}</div>
              <div className="text-[11px] text-[#991B1B] mt-0.5 font-medium">
                Surprise / Show-Cause required
              </div>
            </div>

            <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4">
              <div className="text-[11px] font-bold text-[#4B5565] uppercase">Upheld Student Violations</div>
              <div className="text-2xl font-mono font-bold text-[#166534] mt-1">{totalUpheld}</div>
              <div className="text-[11px] text-[#4B5565] mt-0.5 flex items-center gap-1">
                <Scale className="w-3 h-3 text-[#166534]" />
                Corrective refund/orders issued
              </div>
            </div>

            <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4">
              <div className="text-[11px] font-bold text-[#4B5565] uppercase">Avg Overdue SLA Rate</div>
              <div className="text-2xl font-mono font-bold text-[#C2570C] mt-1">{avgOverdue}%</div>
              <div className="text-[11px] text-[#4B5565] mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C2570C]" />
                Cases exceeding 21-day SLA
              </div>
            </div>
          </div>

          {/* Ranked Scorecard Table */}
          <div className="bg-white border border-[#CBD2DC] rounded-[8px] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#CBD2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F8FAFC]">
              <div>
                <h3 className="text-sm font-bold text-[#0B2A5B] flex items-center gap-1.5 uppercase">
                  <Scale className="w-4 h-4 text-[#C2570C]" />
                  AICTE Internal Inspection Priority Index (Ranked)
                </h3>
                <p className="text-xs text-[#4B5565] mt-0.5">
                  Scores calculated from 5 transparent rules: Overdue Rate (25%), Ombudsman Disputes (25%), Upheld Violations (20%), Overlap Density (15%), Evasive ATRs (15%).
                </p>
              </div>
              <span className="text-xs font-mono text-gray-500">
                Showing {scorecards.length} institutions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#CBD2DC] bg-[#F3F5F8] text-[#4B5565] uppercase font-semibold text-[11px]">
                    <th className="py-3 px-3 text-center w-12">Rank</th>
                    <th className="py-3 px-3">Permanent ID &amp; Institution</th>
                    <th className="py-3 px-3">Priority Score</th>
                    <th className="py-3 px-3">Mandated Regulatory Action</th>
                    <th className="py-3 px-3 text-center">Upheld</th>
                    <th className="py-3 px-3 text-center">Median SLA</th>
                    <th className="py-3 px-3 text-center">Overdue %</th>
                    <th className="py-3 px-3 text-center">Reopened</th>
                    <th className="py-3 px-3 text-center">Clusters</th>
                    <th className="py-3 px-3">Explainable Triggers</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD2DC]">
                  {scorecards.map((sc) => {
                    const isCritical = sc.priority_tier === 'CRITICAL';
                    const isHigh = sc.priority_tier === 'HIGH';
                    const isMedium = sc.priority_tier === 'MEDIUM';

                    let tierBadgeStyle = 'bg-gray-100 text-gray-700 border-gray-300';
                    let scoreBarColor = 'bg-gray-400';

                    if (isCritical) {
                      tierBadgeStyle = 'bg-red-100 text-red-800 border-red-300';
                      scoreBarColor = 'bg-red-600';
                    } else if (isHigh) {
                      tierBadgeStyle = 'bg-amber-100 text-amber-800 border-amber-300';
                      scoreBarColor = 'bg-amber-500';
                    } else if (isMedium) {
                      tierBadgeStyle = 'bg-orange-100 text-orange-800 border-orange-300';
                      scoreBarColor = 'bg-orange-500';
                    } else {
                      tierBadgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                      scoreBarColor = 'bg-emerald-500';
                    }

                    return (
                      <tr
                        key={sc.permanent_id}
                        className={`hover:bg-[#F8FAFC] transition-colors ${
                          isCritical ? 'bg-red-50/20' : isHigh ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-xs text-[#0B2A5B]">
                          #{sc.inspection_rank}
                        </td>

                        {/* Permanent ID & Institution */}
                        <td className="py-3 px-3 max-w-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[11px] font-bold text-[#0B2A5B] bg-[#E2E8F0] px-1.5 py-0.2 rounded border border-[#CBD2DC]">
                              {sc.permanent_id}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                              ({sc.region} Region)
                            </span>
                          </div>
                          <div className="font-bold text-xs text-[#1A1F2B] mt-1 leading-snug">
                            {sc.institution_name}
                          </div>
                          <div className="text-[11px] text-[#4B5565] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#C2570C]" />
                            <span>{sc.city}, {sc.state}</span>
                          </div>
                        </td>

                        {/* Priority Score & Progress Bar */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-baseline gap-1">
                            <span className="font-mono font-bold text-sm text-[#0B2A5B]">
                              {sc.inspection_priority_score}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">/ 100</span>
                          </div>
                          <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full ${scoreBarColor}`}
                              style={{ width: `${Math.max(5, sc.inspection_priority_score)}%` }}
                            />
                          </div>
                        </td>

                        {/* Mandated Action Badge */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${tierBadgeStyle}`}>
                              {(isCritical || isHigh) && <AlertTriangle className="w-3 h-3 text-red-600" />}
                              {sc.priority_tier} PRIORITY
                            </span>
                            <div className="text-[11px] font-medium text-[#1A1F2B]">
                              {sc.recommended_action_label}
                            </div>
                          </div>
                        </td>

                        {/* Upheld */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-xs text-[#166534]">
                          {sc.upheld_complaints > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {sc.upheld_complaints}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>

                        {/* Median Resolution */}
                        <td className="py-3 px-3 text-center font-mono text-xs text-[#4B5565]">
                          {sc.median_resolution_days}d
                        </td>

                        {/* Overdue Rate */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-xs">
                          {sc.overdue_rate > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                              {sc.overdue_rate}%
                            </span>
                          ) : (
                            <span className="text-emerald-700">0%</span>
                          )}
                        </td>

                        {/* Reopened / Ombudsman */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-xs">
                          {sc.reopened_cases > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              {sc.reopened_cases}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>

                        {/* Overlap Clusters */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-xs">
                          {sc.overlap_count > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                              {sc.overlap_count}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>

                        {/* Explainable Triggers */}
                        <td className="py-3 px-3 max-w-xs">
                          <div className="space-y-1">
                            {sc.explainable_reasons.slice(0, 2).map((reason, rIdx) => (
                              <div
                                key={rIdx}
                                className="text-[11px] text-[#374151] leading-tight flex items-start gap-1"
                              >
                                <span className="text-[#C2570C] font-bold">•</span>
                                <span>{reason}</span>
                              </div>
                            ))}
                            {sc.explainable_reasons.length > 2 && (
                              <button
                                onClick={() => handleOpenDossier(sc)}
                                className="text-[10px] text-[#1F5FBF] hover:underline font-semibold"
                              >
                                +{sc.explainable_reasons.length - 2} more audit factors...
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenDossier(sc)}
                              className="text-xs"
                            >
                              Dossier
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenOrderModal(sc)}
                              className="text-xs bg-[#C2570C] hover:bg-[#9A4509]"
                            >
                              Order Action
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: ORIGINAL DIRECTORY GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {institutions.map((inst) => (
            <div
              key={inst.id}
              className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 flex flex-col justify-between hover:border-[#1F5FBF] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-[#0B2A5B] bg-[#F3F5F8] px-2 py-0.5 rounded border border-[#CBD2DC]">
                    ID: {inst.permanentId}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-[#E6EEF9] text-[#1F5FBF]">
                    {inst.region} Region
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#1A1F2B] mt-2 leading-snug">
                  {inst.name}
                </h3>
                <div className="text-xs text-[#4B5565] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C2570C]" />
                  <span>{inst.city}, {inst.state} - {inst.pincode}</span>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-2 my-3 p-2 bg-[#F3F5F8] rounded border border-[#CBD2DC] text-center text-xs">
                  <div>
                    <div className="text-[10px] text-[#4B5565] uppercase font-bold">Active</div>
                    <div className="font-mono font-bold text-sm text-[#B91C1C]">{inst.activeCasesCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#4B5565] uppercase font-bold">Resolved</div>
                    <div className="font-mono font-bold text-sm text-[#166534]">{inst.resolvedCasesCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#4B5565] uppercase font-bold">Oldest Pending</div>
                    <div className="font-mono font-bold text-sm text-[#92400E]">{inst.oldestPendingDays}d</div>
                  </div>
                </div>

                {/* Nodal Officer Contact */}
                <div className="text-xs space-y-1 text-[#4B5565] border-t border-[#CBD2DC]/60 pt-2">
                  <div className="font-semibold text-[#1A1F2B]">Nodal Officer: {inst.nodalOfficerName}</div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Mail className="w-3 h-3" />
                    <span>{inst.nodalOfficerEmail}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Phone className="w-3 h-3" />
                    <span>{inst.nodalOfficerPhone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#CBD2DC] flex items-center justify-between">
                <Link
                  to={`/cases?institutionId=${inst.id}`}
                  className="text-xs text-[#C2570C] font-semibold hover:underline flex items-center gap-1"
                >
                  View Related Cases ({inst.activeCasesCount}) &rarr;
                </Link>
                <Link to={`/origin-explorer?selected=${inst.id}`}>
                  <Button variant="secondary" size="sm">
                    Locate on Map
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE 3: DIRECTORY TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white border border-[#CBD2DC] rounded-[8px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#CBD2DC] bg-[#F3F5F8] text-[#4B5565] uppercase font-semibold">
                  <th className="py-2.5 px-3">Permanent ID</th>
                  <th className="py-2.5 px-3">Institution Name</th>
                  <th className="py-2.5 px-3">Type &amp; Region</th>
                  <th className="py-2.5 px-3">City &amp; State</th>
                  <th className="py-2.5 px-3">Active Grievances</th>
                  <th className="py-2.5 px-3">Resolved</th>
                  <th className="py-2.5 px-3">Oldest Pending</th>
                  <th className="py-2.5 px-3">Compliance Score</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD2DC]">
                {institutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-[#F3F5F8] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#0B2A5B] whitespace-nowrap">
                      {inst.permanentId}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#1A1F2B] max-w-xs">
                      {inst.name}
                    </td>
                    <td className="py-3 px-3 text-[#4B5565] whitespace-nowrap">
                      <div>{inst.institutionType}</div>
                      <div className="text-[11px] font-bold text-[#1F5FBF]">{inst.region} Region</div>
                    </td>
                    <td className="py-3 px-3 text-[#4B5565] whitespace-nowrap">
                      {inst.city}, {inst.state}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#B91C1C]">
                      {inst.activeCasesCount}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#166534]">
                      {inst.resolvedCasesCount}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#92400E]">
                      {inst.oldestPendingDays} days
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                        inst.complianceScore >= 80 ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF3C7] text-[#92400E]'
                      }`}>
                        {inst.complianceScore}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <Link to={`/cases?institutionId=${inst.id}`}>
                        <Button variant="secondary" size="sm">
                          Cases
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: REGULATORY AUDIT DOSSIER & MATHEMATICAL BREAKDOWN */}
      <Modal
        isOpen={isDossierModalOpen && !!selectedScorecard}
        onClose={() => setIsDossierModalOpen(false)}
        title="Institution Grievance Scorecard & Regulatory Audit Dossier"
        maxWidth="lg"
      >
        {selectedScorecard && (
          <div className="space-y-4 text-xs">
            {/* Header summary */}
            <div className="p-3 bg-[#F8FAFC] border border-[#CBD2DC] rounded space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-[#0B2A5B] bg-white px-2 py-0.5 rounded border border-[#CBD2DC]">
                  Permanent ID: {selectedScorecard.permanent_id}
                </span>
                <span className="font-mono text-sm font-bold text-[#0B2A5B]">
                  Inspection Score: {selectedScorecard.inspection_priority_score}/100 · Rank #{selectedScorecard.inspection_rank}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#1A1F2B]">{selectedScorecard.institution_name}</h3>
              <p className="text-[#4B5565]">{selectedScorecard.city}, {selectedScorecard.state} ({selectedScorecard.region} Region)</p>
            </div>

            {/* 5 Transparent Scoring Factors Breakdown */}
            <div>
              <h4 className="font-bold text-[#0B2A5B] uppercase text-[11px] mb-2 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#C2570C]" />
                Transparent Rule Scoring Breakdown (Total: {selectedScorecard.inspection_priority_score} pts)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded space-y-1">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span>1. Overdue SLA Rate (Max 25 pts)</span>
                    <span className="text-[#0B2A5B] font-mono">{selectedScorecard.score_breakdown.overdue_points} pts</span>
                  </div>
                  <p className="text-[10px] text-gray-600">
                    Calculated from {selectedScorecard.overdue_rate}% of active complaints exceeding statutory resolution deadlines.
                  </p>
                </div>

                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded space-y-1">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span>2. Reopened / Ombudsman Disputes (Max 25 pts)</span>
                    <span className="text-[#0B2A5B] font-mono">{selectedScorecard.score_breakdown.reopened_points} pts</span>
                  </div>
                  <p className="text-[10px] text-gray-600">
                    {selectedScorecard.reopened_cases} cases contested by citizens and escalated to Ombudsman tier.
                  </p>
                </div>

                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded space-y-1">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span>3. Upheld Violations (Max 20 pts)</span>
                    <span className="text-[#0B2A5B] font-mono">{selectedScorecard.score_breakdown.upheld_points} pts</span>
                  </div>
                  <p className="text-[10px] text-gray-600">
                    {selectedScorecard.upheld_complaints} substantive complaints ruled against institution requiring corrective relief.
                  </p>
                </div>

                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded space-y-1">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span>4. Overlap Density (Max 15 pts)</span>
                    <span className="text-[#0B2A5B] font-mono">{selectedScorecard.score_breakdown.overlap_points} pts</span>
                  </div>
                  <p className="text-[10px] text-gray-600">
                    {selectedScorecard.overlap_count} overlapping complaints alleging repeat or systemic institutional malpractice.
                  </p>
                </div>

                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded space-y-1 sm:col-span-2">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span>5. Evasive ATR &amp; Fake Closure Scrutiny (Max 15 pts)</span>
                    <span className="text-[#0B2A5B] font-mono">{selectedScorecard.score_breakdown.evasive_atr_points} pts</span>
                  </div>
                  <p className="text-[10px] text-gray-600">
                    {selectedScorecard.flagged_atr_count} Action Taken Reports flagged for generic boilerplate or transfer runaround.
                  </p>
                </div>
              </div>
            </div>

            {/* Explainable Regulatory Rationale */}
            <div>
              <h4 className="font-bold text-[#0B2A5B] uppercase text-[11px] mb-1.5">
                Explainable Regulatory Trigger Log
              </h4>
              <ul className="space-y-1 bg-[#F8FAFC] p-3 rounded border border-[#CBD2DC]">
                {selectedScorecard.explainable_reasons.map((r, i) => (
                  <li key={i} className="text-[#1A1F2B] flex items-start gap-1.5 text-xs">
                    <span className="text-[#C2570C] font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal actions */}
            <div className="flex justify-between items-center pt-3 border-t border-[#CBD2DC]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  downloadScorecardDossierPdf(selectedScorecard);
                  addToast({
                    type: 'success',
                    title: 'Audit Dossier Downloaded',
                    message: `Official AICTE Audit Dossier for ${selectedScorecard.institution_name} generated as signed PDF.`,
                  });
                }}
                className="flex items-center gap-1.5 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download Audit Dossier
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsDossierModalOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsDossierModalOpen(false);
                    handleOpenOrderModal(selectedScorecard);
                  }}
                  className="bg-[#C2570C] hover:bg-[#9A4509]"
                >
                  Order Regulatory Inspection
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: ISSUE OFFICIAL INSPECTION ORDER */}
      <Modal
        isOpen={isOrderModalOpen && !!selectedScorecard}
        onClose={() => setIsOrderModalOpen(false)}
        title="Issue Official AICTE Regulatory Inspection Order"
        maxWidth="md"
      >
        {selectedScorecard && (
          <form onSubmit={handleDispatchInspectionOrder} className="space-y-4 text-xs">
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900 font-medium">
              You are issuing an official AICTE Vigilance mandate for <strong>{selectedScorecard.institution_name}</strong> (Permanent ID: {selectedScorecard.permanent_id}).
            </div>

            <div>
              <label className="block font-bold text-[#1A1F2B] mb-1">Mandate Type</label>
              <select
                value={inspectionType}
                onChange={(e: any) => setInspectionType(e.target.value)}
                className="w-full h-8 px-2 bg-white border border-[#CBD2DC] rounded text-xs"
              >
                <option value="SURPRISE_PHYSICAL">Surprise Physical On-Site Inspection (Vigilance Squad)</option>
                <option value="STATUTORY_SHOW_CAUSE">Statutory Show-Cause Notice &amp; Summons</option>
                <option value="DESK_AUDIT">Comprehensive Forensic Financial Desk Audit</option>
                <option value="NODAL_HEARING">Formal Ombudsman / Nodal Officer Virtual Hearing</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#1A1F2B] mb-1">Target Inspection Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-[#CBD2DC] rounded text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-[#1A1F2B] mb-1">Team Lead Officer</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-[#CBD2DC] rounded text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#1A1F2B] mb-1">Terms of Reference &amp; Audit Scope</label>
              <textarea
                value={termsOfReference}
                onChange={(e) => setTermsOfReference(e.target.value)}
                rows={3}
                className="w-full p-2 bg-white border border-[#CBD2DC] rounded text-xs leading-relaxed"
                placeholder="Specify the regulatory focus of the inspection..."
                required
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#CBD2DC]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  downloadInspectionOrderPdf({
                    scorecard: selectedScorecard,
                    inspectionType,
                    targetDate,
                    officerName,
                    termsOfReference,
                  });
                  addToast({
                    type: 'success',
                    title: 'Statutory Order Downloaded',
                    message: `Official AICTE Regulatory Inspection Order generated as signed PDF.`,
                  });
                }}
                className="flex items-center gap-1.5 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download Draft Order
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsOrderModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingOrder}
                  className="bg-[#C2570C] hover:bg-[#9A4509]"
                >
                  {isSubmittingOrder ? 'Dispatching...' : 'Dispatch Mandate'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
