import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { OverlapCandidate, Complaint } from '../types';
import { StatusChip } from '../design-system/StatusChip';
import { Button } from '../design-system/Button';
import { useApp } from '../context/AppContext';
import {
  GraphCanvas,
} from '../components/grievance-graph/GraphCanvas';
import {
  ClusterDetailsPanel,
} from '../components/grievance-graph/ClusterDetailsPanel';
import {
  ComplaintCompareModal,
} from '../components/grievance-graph/ComplaintCompareModal';
import {
  GraphInstitutionNode,
  GraphClusterNode,
  GraphGrievanceNode,
  SelectedNodeState,
} from '../components/grievance-graph/types';
import {
  Network,
  Link2,
  Unlink2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Coins,
  ShieldCheck,
  Tag,
  Clock,
  Layers,
  Workflow,
  Table as TableIcon,
  GitCompare,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const RelatedCasesCoordination: React.FC = () => {
  const { addToast } = useApp();
  const [candidates, setCandidates] = useState<OverlapCandidate[]>([]);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View Mode: Interactive Graph vs High-Density Table
  const [viewMode, setViewMode] = useState<'GRAPH' | 'TABLE'>('GRAPH');

  // Active filters
  const [selectedInstId, setSelectedInstId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEEDS_REVIEW' | 'CONFIRMED'>('ALL');

  // Graph Selection State
  const [selectedNode, setSelectedNode] = useState<SelectedNodeState>({ type: null });

  // Compare Modal State
  const [compareCluster, setCompareCluster] = useState<GraphClusterNode | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pairs, compRes] = await Promise.all([
        apiService.getOverlapCandidates(),
        apiService.getComplaints({ limit: 100 }),
      ]);
      setCandidates(pairs);
      setAllComplaints(compRes.items);
    } catch (err) {
      console.error(err);
      addToast({
        type: 'danger',
        title: 'Error Loading Data',
        message: 'Could not load overlap candidates and grievances.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map of all complaints by ID for quick node lookups
  const complaintsMap = useMemo<Record<string, GraphGrievanceNode>>(() => {
    const map: Record<string, GraphGrievanceNode> = {};

    allComplaints.forEach((c) => {
      const isParent = (c.pov && c.pov.toLowerCase().includes('parent')) || c.complainantType === 'PARENT';
      map[c.id] = {
        id: c.id,
        shortId: c.id.replace('AICTE-2024-GRV-', 'G-').replace('AICTE-2026-GRV-', 'G-'),
        clusterId: c.problemId || 'cluster-general',
        title: c.title,
        category: c.category,
        status: c.status,
        urgency: c.urgency,
        submittedAt: c.createdAt ? c.createdAt.split('T')[0] : '12 Oct 2026',
        complainantName: c.complainantName,
        complainantRole: isParent ? 'PARENT' : 'STUDENT',
        disputedAmount: c.description?.match(/₹[\d,]+/)?.[0] || '₹44,000',
        assignedBureau: c.assignedBureau,
        description: c.description,
        evidenceCount: c.evidence?.length || 1,
      };
    });

    // Also populate from candidates primary/related
    candidates.forEach((cand) => {
      if (cand.primaryCase && !map[cand.primaryCase.id]) {
        map[cand.primaryCase.id] = {
          id: cand.primaryCase.id,
          shortId: cand.primaryCase.id.replace(/AICTE-\d+-GRV-/, 'G-'),
          clusterId: cand.problemId,
          title: cand.primaryCase.title,
          category: cand.primaryCase.category,
          status: cand.primaryCase.status,
          urgency: cand.primaryCase.urgency || 'HIGH',
          submittedAt: cand.primaryCase.createdAt ? cand.primaryCase.createdAt.split('T')[0] : '12 Oct 2026',
          complainantName: cand.primaryCase.complainantName,
          complainantRole: (cand.primaryCase.pov?.toLowerCase().includes('parent') ? 'PARENT' : 'STUDENT'),
          disputedAmount: cand.breakdown?.extracted_amount_str || '₹44,000',
          assignedBureau: cand.primaryCase.assignedBureau,
          description: cand.primaryCase.description,
          evidenceCount: cand.primaryCase.evidenceCount || 1,
        };
      }
      if (cand.relatedCase && !map[cand.relatedCase.id]) {
        map[cand.relatedCase.id] = {
          id: cand.relatedCase.id,
          shortId: cand.relatedCase.id.replace(/AICTE-\d+-GRV-/, 'G-'),
          clusterId: cand.problemId,
          title: cand.relatedCase.title,
          category: cand.relatedCase.category,
          status: cand.relatedCase.status,
          urgency: cand.relatedCase.urgency || 'HIGH',
          submittedAt: cand.relatedCase.createdAt ? cand.relatedCase.createdAt.split('T')[0] : '15 Oct 2026',
          complainantName: cand.relatedCase.complainantName,
          complainantRole: (cand.relatedCase.pov?.toLowerCase().includes('parent') ? 'PARENT' : 'STUDENT'),
          disputedAmount: cand.breakdown?.extracted_amount_str || '₹44,000',
          assignedBureau: cand.relatedCase.assignedBureau,
          description: cand.relatedCase.description,
          evidenceCount: cand.relatedCase.evidenceCount || 1,
        };
      }
    });

    return map;
  }, [allComplaints, candidates]);

  // Build Institutions & Clusters Hierarchy
  const institutions = useMemo<GraphInstitutionNode[]>(() => {
    const instMap = new Map<string, GraphInstitutionNode>();

    // Seed major institutions
    const defaultInsts = [
      {
        id: 'inst-DIET',
        name: 'Delhi Institute of Engineering and Technology (DIET)',
        shortName: 'DIET Delhi',
        permanentId: '1-332918231',
        city: 'New Delhi',
        state: 'Delhi',
      },
      {
        id: 'inst-DTU',
        name: 'Delhi Technological University (DTU)',
        shortName: 'DTU Delhi',
        permanentId: '1-10928341',
        city: 'New Delhi',
        state: 'Delhi',
      },
      {
        id: 'inst-BENGAL',
        name: 'Bengal College of Pharmaceutical Sciences',
        shortName: 'Bengal Pharmacy CoE',
        permanentId: '1-18294821',
        city: 'Durgapur',
        state: 'West Bengal',
      },
      {
        id: 'inst-COEP',
        name: 'COEP Technological University',
        shortName: 'COEP Tech',
        permanentId: '1-45892118',
        city: 'Pune',
        state: 'Maharashtra',
      },
      {
        id: 'inst-VJTI',
        name: 'Veermata Jijabai Technological Institute (VJTI)',
        shortName: 'VJTI Mumbai',
        permanentId: '1-12490182',
        city: 'Mumbai',
        state: 'Maharashtra',
      },
    ];

    defaultInsts.forEach((inst) => {
      instMap.set(inst.id, {
        ...inst,
        totalGrievances: 0,
        openInvestigations: 1,
        confirmedClusters: 0,
        clusters: [],
      });
    });

    // Populate clusters from candidates
    candidates.forEach((cand, idx) => {
      const instName = cand.primaryCase?.institutionName || 'Delhi Institute of Engineering and Technology';
      let instId = 'inst-DIET';
      if (instName.includes('DTU') || instName.includes('Technological University (DTU)')) instId = 'inst-DTU';
      else if (instName.includes('Bengal')) instId = 'inst-BENGAL';
      else if (instName.includes('COEP')) instId = 'inst-COEP';
      else if (instName.includes('VJTI') || instName.includes('Veermata')) instId = 'inst-VJTI';

      const targetInst = instMap.get(instId);
      if (!targetInst) return;

      const clusterId = `cluster-${cand.pairId || idx}`;
      const complaintIds = [cand.primaryCase?.id, cand.relatedCase?.id].filter(Boolean) as string[];

      // Why Linked reasons
      const reasons = cand.matchReasons || [
        `Permanent ID Match: ${targetInst.permanentId}`,
        `Same Category: ${cand.primaryCase?.category || 'Fee & Refund'}`,
        'Temporal intake alignment within 5 days',
      ];
      if (cand.breakdown?.extracted_amount_str) {
        reasons.push(`Disputed Amount Correlated: ${cand.breakdown.extracted_amount_str}`);
      }

      // Sample Investigation Timeline
      const timeline = [
        {
          date: '12 Oct 2026',
          type: 'COMPLAINT_FILED' as const,
          label: `Docket ${complaintIds[0] || 'G-8102'} Lodged`,
          description: 'Registered via National AICTE Redressal Portal (Student Intake).',
        },
        {
          date: '15 Oct 2026',
          type: 'COMPLAINT_FILED' as const,
          label: `Docket ${complaintIds[1] || 'G-8119'} Lodged`,
          description: 'Registered reporting identical fee head (Parent Intake).',
        },
        {
          date: '16 Oct 2026',
          type: 'AI_CORRELATION' as const,
          label: `AI Correlation Engine (${cand.confidenceScore}% Match)`,
          description: 'Flagged shared Permanent ID and matching financial amount.',
        },
        {
          date: '18 Oct 2026',
          type: 'OFFICER_REVIEW' as const,
          label: 'Bureau Officer Triage',
          description: 'Queued for inter-bureau joint inquiry confirmation.',
        },
      ];

      const clusterNode: GraphClusterNode = {
        id: clusterId,
        institutionId: instId,
        title: cand.problemTitle || 'Caution Deposit Deduction & Fee Refund',
        category: cand.primaryCase?.category || 'Fee Refund & Excess Charges',
        status: cand.isLinked ? 'CONFIRMED_LINK' : 'NEEDS_REVIEW',
        tier: cand.tier || 'PRIORITIZED',
        confidenceScore: cand.confidenceScore || 92,
        firstDetected: '12 Oct 2026',
        complaintsCount: complaintIds.length,
        disputedAmount: cand.breakdown?.extracted_amount_str || '₹44,000',
        whyLinked: reasons,
        timeline,
        complaintIds,
      };

      targetInst.clusters.push(clusterNode);
      targetInst.totalGrievances += complaintIds.length;
      if (cand.isLinked) targetInst.confirmedClusters += 1;
    });

    return Array.from(instMap.values());
  }, [candidates]);

  // Selected Active Institution (Default: first institution with clusters or DIET)
  const activeInstitution = useMemo<GraphInstitutionNode>(() => {
    if (selectedInstId !== 'ALL') {
      const found = institutions.find((i) => i.id === selectedInstId);
      if (found) return found;
    }
    return (
      institutions.find((i) => i.clusters.length > 0) ||
      institutions[0] || {
        id: 'inst-DIET',
        name: 'Delhi Institute of Engineering and Technology (DIET)',
        shortName: 'DIET Delhi',
        permanentId: '1-332918231',
        city: 'New Delhi',
        state: 'Delhi',
        totalGrievances: 6,
        openInvestigations: 1,
        confirmedClusters: 1,
        clusters: [],
      }
    );
  }, [institutions, selectedInstId]);

  // Filtered clusters for active view
  const activeClusters = useMemo<GraphClusterNode[]>(() => {
    let list = activeInstitution.clusters;

    if (categoryFilter !== 'ALL') {
      list = list.filter((c) => c.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    if (statusFilter === 'NEEDS_REVIEW') {
      list = list.filter((c) => c.status === 'NEEDS_REVIEW');
    } else if (statusFilter === 'CONFIRMED') {
      list = list.filter((c) => c.status === 'CONFIRMED_LINK');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.complaintIds.some((id) => id.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeInstitution, categoryFilter, statusFilter, searchQuery]);

  // Handle Linking / Unlinking with Backend Synchronization
  const handleConfirmLink = async (cluster: GraphClusterNode) => {
    if (cluster.complaintIds.length >= 2) {
      try {
        await apiService.linkCases(cluster.complaintIds[0], cluster.complaintIds[1]);
        addToast({
          type: 'success',
          title: 'Joint Inquiry Docket Established',
          message: `Linked ${cluster.complaintIds[0]} with ${cluster.complaintIds[1]} under verified AICTE Cluster.`,
        });
        loadData();
      } catch (err: any) {
        addToast({ type: 'danger', title: 'Error', message: err.message });
      }
    }
  };

  const handleUnlink = async (cluster: GraphClusterNode) => {
    if (cluster.complaintIds.length >= 2) {
      try {
        await apiService.unlinkCases(cluster.complaintIds[0], cluster.complaintIds[1]);
        addToast({
          type: 'info',
          title: 'Cases Unlinked / Separated',
          message: `Removed joint correlation link between ${cluster.complaintIds[0]} and ${cluster.complaintIds[1]}.`,
        });
        loadData();
      } catch (err: any) {
        addToast({ type: 'danger', title: 'Error', message: err.message });
      }
    }
  };

  // Node Selection Handlers
  const handleSelectCluster = (cluster: GraphClusterNode) => {
    setSelectedNode({
      type: 'CLUSTER',
      cluster,
    });
  };

  const handleSelectGrievance = (grievance: GraphGrievanceNode, cluster: GraphClusterNode) => {
    setSelectedNode({
      type: 'GRIEVANCE',
      cluster,
      grievance,
    });
  };

  const handleSelectInstitution = (inst: GraphInstitutionNode) => {
    setSelectedNode({
      type: 'INSTITUTION',
      institution: inst,
    });
  };

  // Summary Metrics Across System
  const totalMonitoredInstitutions = institutions.length;
  const totalClustersCount = institutions.reduce((acc, i) => acc + i.clusters.length, 0);
  const totalNeedsReviewCount = institutions.reduce(
    (acc, i) => acc + i.clusters.filter((c) => c.status === 'NEEDS_REVIEW').length,
    0
  );
  const totalConfirmedCount = institutions.reduce(
    (acc, i) => acc + i.clusters.filter((c) => c.status === 'CONFIRMED_LINK').length,
    0
  );

  return (
    <div className="space-y-5">
      {/* 1. Header Command Banner */}
      <div className="bg-white border border-[#CBD2DC] rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg md:text-xl font-bold text-[#0B2A5B] tracking-tight flex items-center gap-2">
              <Network className="w-5 h-5 text-[#1F5FBF]" />
              Institutional Grievance Graph Workspace
            </h2>
            <span className="text-xs px-2.5 py-0.5 bg-[#E6EEF9] text-[#1F5FBF] border border-[#93C5FD] rounded-full font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1F5FBF] animate-pulse" />
              Pattern Discovery Engine
            </span>
          </div>
          <p className="text-xs text-[#4B5565] mt-1 max-w-3xl">
            Correlate related grievances by AICTE Permanent ID, disputed amounts, and multi-perspective evidence. Investigate institutional clusters to identify emerging systemic irregularities.
          </p>
        </div>

        {/* View Mode Toggle: Graph vs Table */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
          <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#CBD2DC]">
            <button
              onClick={() => setViewMode('GRAPH')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === 'GRAPH'
                  ? 'bg-white text-[#0B2A5B] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B2A5B]'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Graph View</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-white text-[#0B2A5B] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B2A5B]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Pattern Table</span>
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => {
              loadData();
              addToast({
                type: 'info',
                title: 'Data Synced',
                message: 'Refreshed cluster correlations from FastAPI Hybrid Matcher.',
              });
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Triage Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#CBD2DC] rounded-lg p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold uppercase text-[#64748B] tracking-wider">
              Monitored Institutions
            </div>
            <div className="text-2xl font-mono font-extrabold text-[#0B2A5B] mt-1">
              {totalMonitoredInstitutions}
            </div>
            <div className="text-[11px] text-[#475569] mt-0.5">Verified AICTE Campuses</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#E6EEF9] text-[#1F5FBF] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#CBD2DC] rounded-lg p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold uppercase text-[#64748B] tracking-wider">
              Identified Clusters
            </div>
            <div className="text-2xl font-mono font-extrabold text-[#0B2A5B] mt-1">
              {totalClustersCount}
            </div>
            <div className="text-[11px] text-[#475569] mt-0.5">Underlying Issue Patterns</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] text-[#4338CA] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#CBD2DC] rounded-lg p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold uppercase text-[#92400E] tracking-wider">
              Needs Officer Review
            </div>
            <div className="text-2xl font-mono font-extrabold text-[#92400E] mt-1">
              {totalNeedsReviewCount}
            </div>
            <div className="text-[11px] text-[#92400E] mt-0.5">Awaiting Joint Inquiry Approval</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#CBD2DC] rounded-lg p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold uppercase text-[#166534] tracking-wider">
              Confirmed Joint Inquiries
            </div>
            <div className="text-2xl font-mono font-extrabold text-[#166534] mt-1">
              {totalConfirmedCount}
            </div>
            <div className="text-[11px] text-[#166534] mt-0.5">Consolidated Redressal Inquiries</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Graph Toolbar & Exploration Filters */}
      <div className="bg-white border border-[#CBD2DC] rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Institution Selector */}
          <div className="flex items-center gap-2 flex-1">
            <Building2 className="w-4 h-4 text-[#0B2A5B] flex-shrink-0" />
            <label htmlFor="inst-select" className="text-xs font-bold text-[#1E293B] whitespace-nowrap">
              Institution:
            </label>
            <select
              id="inst-select"
              value={selectedInstId}
              onChange={(e) => {
                setSelectedInstId(e.target.value);
                setSelectedNode({ type: null }); // reset active inspection
              }}
              className="h-9 px-3 text-xs bg-white border border-[#CBD2DC] rounded-md font-semibold text-[#0B2A5B] focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] flex-1 max-w-md"
            >
              <option value="ALL">All Monitored Institutions ({institutions.length})</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.clusters.length} Clusters · Perm ID: {inst.permanentId})
                </option>
              ))}
            </select>
          </div>

          {/* Search by Keyword / Docket ID */}
          <div className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cluster, keyword, or docket..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#CBD2DC] rounded-md text-[#1E293B] placeholder-[#64748B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-[#CBD2DC] text-xs">
          <div className="flex items-center gap-1.5 text-[#64748B] font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 px-2.5 text-xs bg-white border border-[#CBD2DC] rounded-md text-[#1E293B]"
          >
            <option value="ALL">All Categories</option>
            <option value="fee">Fee Refund &amp; Caution Money</option>
            <option value="certificate">Original Certificates</option>
            <option value="ragging">Ragging &amp; Campus Safety</option>
            <option value="scholarship">GATE / AICTE Scholarships</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-8 px-2.5 text-xs bg-white border border-[#CBD2DC] rounded-md text-[#1E293B]"
          >
            <option value="ALL">All Review States</option>
            <option value="NEEDS_REVIEW">Needs Review Only</option>
            <option value="CONFIRMED">Confirmed Joint Inquiries</option>
          </select>

          {(categoryFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery || selectedInstId !== 'ALL') && (
            <button
              onClick={() => {
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
                setSearchQuery('');
                setSelectedInstId('ALL');
                setSelectedNode({ type: null });
              }}
              className="text-[#C2570C] font-bold text-xs hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. MAIN WORKSPACE VIEW */}
      {viewMode === 'GRAPH' ? (
        <div className="space-y-5">
          {/* Graph + Contextual Inspection Panel (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 8 Cols: Interactive SVG Graph Canvas */}
            <div className="lg:col-span-8 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
                <span>
                  Viewing Institutional Topology: <strong>{activeInstitution.name}</strong>
                </span>
                <span className="italic">Click any node to inspect &amp; compare</span>
              </div>

              <GraphCanvas
                institution={activeInstitution}
                clusters={activeClusters}
                complaintsMap={complaintsMap}
                selectedNode={selectedNode}
                onSelectInstitution={handleSelectInstitution}
                onSelectCluster={handleSelectCluster}
                onSelectGrievance={handleSelectGrievance}
              />
            </div>

            {/* Right 4 Cols: Contextual Details Panel */}
            <div className="lg:col-span-4 h-[540px]">
              <ClusterDetailsPanel
                selectedNode={selectedNode}
                complaintsMap={complaintsMap}
                onClose={() => setSelectedNode({ type: null })}
                onOpenCompare={(cluster) => {
                  setCompareCluster(cluster);
                  setIsCompareOpen(true);
                }}
                onConfirmLink={handleConfirmLink}
                onUnlink={handleUnlink}
                onSelectGrievance={handleSelectGrievance}
              />
            </div>
          </div>

          {/* Potential Patterns Summary Card below Graph */}
          <div className="bg-white border border-[#CBD2DC] rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#CBD2DC] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1F5FBF]" />
                <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider">
                  Active Institutional Pattern Clusters ({activeClusters.length})
                </h3>
              </div>
              <span className="text-[11px] text-[#64748B]">
                AICTE Hybrid Matcher v3.0 · Clause 11.2 Inquiries
              </span>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[950px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#CBD2DC] bg-[#F8FAFC] text-[#475569] uppercase font-bold tracking-wider text-[10.5px]">
                    <th className="py-2.5 px-4">Pattern / Issue Cluster</th>
                    <th className="py-2.5 px-4">Associated Institution</th>
                    <th className="py-2.5 px-4">Cases</th>
                    <th className="py-2.5 px-4">Match Confidence</th>
                    <th className="py-2.5 px-4">Disputed Amount</th>
                    <th className="py-2.5 px-4">Review Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD2DC]">
                  {activeClusters.map((cluster) => {
                    const isConfirmed = cluster.status === 'CONFIRMED_LINK';

                    return (
                      <tr key={cluster.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#0B2A5B]">
                          <button
                            onClick={() => handleSelectCluster(cluster)}
                            className="hover:text-[#C2570C] text-left hover:underline flex items-center gap-1.5"
                          >
                            <span>{cluster.title}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-[#475569]">
                          <div className="font-semibold text-[#1E293B]">{activeInstitution.shortName}</div>
                          <div className="text-[10.5px] font-mono text-[#64748B]">Perm ID: {activeInstitution.permanentId}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#1E293B]">
                          {cluster.complaintsCount} complaints
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#1F5FBF]">
                          {cluster.confidenceScore}% match
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#C2570C]">
                          {cluster.disputedAmount || 'N/A'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10.5px] border ${
                              isConfirmed
                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                : 'bg-amber-50 text-amber-900 border-amber-300'
                            }`}
                          >
                            {isConfirmed ? '✓ Joint Inquiry' : '⚠️ Needs Review'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setCompareCluster(cluster);
                                setIsCompareOpen(true);
                              }}
                              className="px-2.5 py-1 rounded bg-white border border-[#CBD2DC] hover:border-[#0B2A5B] text-[#0B2A5B] font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <GitCompare className="w-3 h-3 text-[#1F5FBF]" />
                              Compare
                            </button>

                            {isConfirmed ? (
                              <button
                                onClick={() => handleUnlink(cluster)}
                                className="px-2.5 py-1 rounded bg-white border border-red-200 text-[#B91C1C] hover:bg-red-50 font-semibold text-xs transition-colors"
                              >
                                Unlink
                              </button>
                            ) : (
                              <button
                                onClick={() => handleConfirmLink(cluster)}
                                className="px-2.5 py-1 rounded bg-[#C2570C] hover:bg-[#9A4509] text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                              >
                                <Link2 className="w-3 h-3" />
                                Confirm
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {activeClusters.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[#64748B]">
                        No active pattern clusters found for current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* 5. ALTERNATIVE HIGH-DENSITY REGULATORY TABLE VIEW */
        <div className="bg-white border border-[#CBD2DC] rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#CBD2DC] bg-[#F8FAFC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-[#0B2A5B]" />
              <h3 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider">
                Full Grievance Overlap &amp; Coordination Ledger
              </h3>
            </div>
            <span className="text-xs text-[#64748B]">
              Showing {candidates.length} Correlated Case Pairs
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[1050px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#CBD2DC] bg-[#F8FAFC] text-[#475569] uppercase font-bold tracking-wider text-[10.5px]">
                  <th className="py-3 px-4">Problem / Cluster</th>
                  <th className="py-3 px-4">Primary Case (Case A)</th>
                  <th className="py-3 px-4">Related Case (Case B)</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Match Factors</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4 text-right">Regulatory Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD2DC]">
                {candidates.map((cand) => (
                  <tr key={cand.pairId} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-[#0B2A5B] leading-snug">
                        {cand.problemTitle}
                      </div>
                      <div className="text-[10.5px] text-[#64748B] mt-0.5">
                        {cand.primaryCase?.category}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <Link
                        to={`/cases/${cand.primaryCase?.id}`}
                        className="font-bold text-[#1F5FBF] hover:underline flex items-center gap-1"
                      >
                        {cand.primaryCase?.id}
                        <ExternalLink className="w-3 h-3 text-[#64748B]" />
                      </Link>
                      <div className="text-[10.5px] text-[#64748B] font-sans">
                        {cand.primaryCase?.complainantName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <Link
                        to={`/cases/${cand.relatedCase?.id}`}
                        className="font-bold text-[#1F5FBF] hover:underline flex items-center gap-1"
                      >
                        {cand.relatedCase?.id}
                        <ExternalLink className="w-3 h-3 text-[#64748B]" />
                      </Link>
                      <div className="text-[10.5px] text-[#64748B] font-sans">
                        {cand.relatedCase?.complainantName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#475569]">
                      <div className="font-semibold text-[#1E293B]">
                        {cand.primaryCase?.institutionName}
                      </div>
                      <div className="text-[10.5px] font-mono text-[#64748B]">
                        {cand.primaryCase?.institutionPermanentId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {cand.matchReasons?.slice(0, 2).map((r, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-[#F1F5F9] border border-[#CBD2DC] text-[#475569]"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0B2A5B]">
                      {cand.confidenceScore}%
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {cand.isLinked ? (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          leftIcon={<Unlink2 className="w-3.5 h-3.5" />}
                          onClick={async () => {
                            await apiService.unlinkCases(cand.primaryCase.id, cand.relatedCase.id);
                            loadData();
                          }}
                        >
                          Unlink
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Link2 className="w-3.5 h-3.5" />}
                          onClick={async () => {
                            await apiService.linkCases(cand.primaryCase.id, cand.relatedCase.id);
                            loadData();
                          }}
                        >
                          Confirm Link
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Side-by-Side Comparison Modal */}
      <ComplaintCompareModal
        cluster={compareCluster}
        complaintsMap={complaintsMap}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onConfirmLink={handleConfirmLink}
        onUnlink={handleUnlink}
      />
    </div>
  );
};
