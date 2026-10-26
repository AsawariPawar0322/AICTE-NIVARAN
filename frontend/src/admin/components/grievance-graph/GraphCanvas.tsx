import React, { useState, useRef, useMemo } from 'react';
import {
  GraphInstitutionNode,
  GraphClusterNode,
  GraphGrievanceNode,
  SelectedNodeState,
} from './types';
import {
  Building2,
  Coins,
  FileText,
  ShieldAlert,
  GraduationCap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Link2,
  CheckCircle2,
  Clock,
  User,
  Users,
} from 'lucide-react';

interface GraphCanvasProps {
  institution: GraphInstitutionNode;
  clusters: GraphClusterNode[];
  complaintsMap: Record<string, GraphGrievanceNode>;
  selectedNode: SelectedNodeState;
  onSelectInstitution: (inst: GraphInstitutionNode) => void;
  onSelectCluster: (cluster: GraphClusterNode) => void;
  onSelectGrievance: (grievance: GraphGrievanceNode, cluster: GraphClusterNode) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  institution,
  clusters,
  complaintsMap,
  selectedNode,
  onSelectInstitution,
  onSelectCluster,
  onSelectGrievance,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Pan and Zoom transform state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Canvas dimensions
  const width = 800;
  const height = 540;
  const centerX = width / 2;
  const centerY = height / 2;

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only pan if clicking canvas background
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'rect') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Node Positions Calculation
  const { clusterPositions, grievancePositions } = useMemo(() => {
    const clusterRadius = Math.min(width, height) * 0.34;
    const cPositions: Record<string, { x: number; y: number }> = {};
    const gPositions: Record<string, { x: number; y: number }> = {};

    clusters.forEach((cluster, idx) => {
      // Distribute clusters evenly in radial circle
      const angle = (2 * Math.PI * idx) / Math.max(clusters.length, 1) - Math.PI / 2;
      const cx = centerX + clusterRadius * Math.cos(angle);
      const cy = centerY + clusterRadius * Math.sin(angle);
      cPositions[cluster.id] = { x: cx, y: cy };

      // Calculate child grievance positions radiating outward from cluster
      const childCount = cluster.complaintIds.length;
      const gRadius = 68;
      const spreadAngle = Math.PI * 0.65; // 117 degree arc facing outward
      const baseAngle = angle;

      cluster.complaintIds.forEach((cId, gIdx) => {
        let gAngle = baseAngle;
        if (childCount > 1) {
          const step = spreadAngle / (childCount - 1);
          gAngle = baseAngle - spreadAngle / 2 + step * gIdx;
        }
        const gx = cx + gRadius * Math.cos(gAngle);
        const gy = cy + gRadius * Math.sin(gAngle);
        gPositions[cId] = { x: gx, y: gy };
      });
    });

    return { clusterPositions: cPositions, grievancePositions: gPositions };
  }, [clusters, width, height, centerX, centerY]);

  // Determine active cluster
  const activeClusterId =
    selectedNode.type === 'CLUSTER'
      ? selectedNode.cluster?.id
      : selectedNode.type === 'GRIEVANCE'
      ? selectedNode.grievance?.clusterId
      : null;

  const isClusterActive = (clusterId: string) => {
    if (!activeClusterId) return true; // all normal when none selected
    return activeClusterId === clusterId;
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('fee') || cat.includes('refund') || cat.includes('deposit') || cat.includes('money')) {
      return <Coins className="w-3.5 h-3.5 text-[#C2570C]" />;
    }
    if (cat.includes('certificate') || cat.includes('withhold') || cat.includes('document')) {
      return <FileText className="w-3.5 h-3.5 text-[#1F5FBF]" />;
    }
    if (cat.includes('ragging') || cat.includes('harass') || cat.includes('safety')) {
      return <ShieldAlert className="w-3.5 h-3.5 text-[#B91C1C]" />;
    }
    return <GraduationCap className="w-3.5 h-3.5 text-[#166534]" />;
  };

  return (
    <div className="relative w-full h-[540px] bg-[#F8FAFC] rounded-lg border border-[#CBD2DC] overflow-hidden select-none">
      {/* Floating Canvas Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-[#CBD2DC] rounded-md p-1 shadow-xs">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 1.8))}
          className="p-1.5 text-[#475569] hover:text-[#0B2A5B] hover:bg-[#F1F5F9] rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.65))}
          className="p-1.5 text-[#475569] hover:text-[#0B2A5B] hover:bg-[#F1F5F9] rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-[#CBD2DC]" />
        <button
          onClick={resetView}
          className="p-1.5 text-[#475569] hover:text-[#0B2A5B] hover:bg-[#F1F5F9] rounded transition-colors text-xs flex items-center gap-1 font-semibold"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[11px]">Center</span>
        </button>
      </div>

      {/* Legend Badge Bar */}
      <div className="absolute bottom-3 left-3 z-20 hidden md:flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-[#CBD2DC] rounded-md px-3 py-1.5 shadow-xs text-[11px] text-[#475569]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#0B2A5B] inline-block" />
          <span>Institution</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 inline-block" />
          <span>Candidate Cluster</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400 inline-block" />
          <span>Confirmed Joint Inquiry</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#1F5FBF] inline-block" />
          <span>Grievance Docket</span>
        </div>
      </div>

      {/* Interactive SVG Surface */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#E2E8F0" />
          </pattern>

          {/* Gradients */}
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B2A5B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1F5FBF" stopOpacity="0.6" />
          </linearGradient>

          <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Background Grid */}
        <rect width={width} height={height} fill="url(#grid-pattern)" />

        {/* Zoom & Pan Container */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* 1. EDGES: Institution to Clusters */}
          {clusters.map((cluster) => {
            const pos = clusterPositions[cluster.id];
            if (!pos) return null;
            const active = isClusterActive(cluster.id);

            return (
              <g key={`edge-inst-${cluster.id}`} opacity={active ? 1 : 0.25} className="transition-opacity duration-200">
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={cluster.status === 'CONFIRMED_LINK' ? '#0D9488' : '#94A3B8'}
                  strokeWidth={active && activeClusterId === cluster.id ? 2.5 : 1.5}
                  strokeDasharray={cluster.status === 'CONFIRMED_LINK' ? undefined : '5 4'}
                />
              </g>
            );
          })}

          {/* 2. EDGES: Cluster to Grievances */}
          {clusters.map((cluster) => {
            const cPos = clusterPositions[cluster.id];
            if (!cPos) return null;
            const active = isClusterActive(cluster.id);

            return cluster.complaintIds.map((cId) => {
              const gPos = grievancePositions[cId];
              if (!gPos) return null;

              const isGrievanceSelected =
                selectedNode.type === 'GRIEVANCE' && selectedNode.grievance?.id === cId;

              return (
                <g key={`edge-cluster-${cId}`} opacity={active ? 1 : 0.2} className="transition-opacity duration-200">
                  <line
                    x1={cPos.x}
                    y1={cPos.y}
                    x2={gPos.x}
                    y2={gPos.y}
                    stroke={
                      isGrievanceSelected
                        ? '#C2570C'
                        : cluster.status === 'CONFIRMED_LINK'
                        ? '#0D9488'
                        : '#94A3B8'
                    }
                    strokeWidth={isGrievanceSelected ? 2.5 : 1.5}
                    strokeDasharray={cluster.status === 'CONFIRMED_LINK' ? undefined : '3 3'}
                  />
                </g>
              );
            });
          })}

          {/* 3. GRIEVANCE NODES */}
          {clusters.map((cluster) => {
            const active = isClusterActive(cluster.id);

            return cluster.complaintIds.map((cId) => {
              const gPos = grievancePositions[cId];
              const grievance = complaintsMap[cId];
              if (!gPos || !grievance) return null;

              const isSelected = selectedNode.type === 'GRIEVANCE' && selectedNode.grievance?.id === cId;

              return (
                <g
                  key={`node-g-${cId}`}
                  transform={`translate(${gPos.x}, ${gPos.y})`}
                  opacity={active ? 1 : 0.25}
                  className="transition-opacity duration-200 cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectGrievance(grievance, cluster);
                  }}
                >
                  <circle
                    r={isSelected ? 16 : 13}
                    fill={isSelected ? '#FEF3C7' : '#FFFFFF'}
                    stroke={isSelected ? '#C2570C' : '#1F5FBF'}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    filter="url(#node-shadow)"
                    className="transition-all duration-150 group-hover:scale-110"
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                    fill={isSelected ? '#92400E' : '#0B2A5B'}
                  >
                    {grievance.shortId}
                  </text>
                  {/* Complainant Role Indicator Tag */}
                  <circle
                    cx="10"
                    cy="-10"
                    r="4.5"
                    fill={grievance.complainantRole === 'PARENT' ? '#10B981' : '#3B82F6'}
                    stroke="#FFFFFF"
                    strokeWidth="1"
                  />
                </g>
              );
            });
          })}

          {/* 4. ISSUE CLUSTER NODES */}
          {clusters.map((cluster) => {
            const pos = clusterPositions[cluster.id];
            if (!pos) return null;

            const isSelected = selectedNode.type === 'CLUSTER' && selectedNode.cluster?.id === cluster.id;
            const active = isClusterActive(cluster.id);

            const isConfirmed = cluster.status === 'CONFIRMED_LINK';
            const isPrioritized = cluster.tier === 'PRIORITIZED';

            return (
              <g
                key={`node-c-${cluster.id}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                opacity={active ? 1 : 0.3}
                className="transition-opacity duration-200 cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCluster(cluster);
                }}
              >
                {/* Pulse ring for high-priority unlinked cluster */}
                {isPrioritized && !isConfirmed && (
                  <circle r="36" fill="#F59E0B" fillOpacity="0.15" className="animate-ping" />
                )}

                {/* Node Body Card */}
                <rect
                  x="-68"
                  y="-26"
                  width="136"
                  height="52"
                  rx="8"
                  fill="#FFFFFF"
                  stroke={
                    isSelected
                      ? '#C2570C'
                      : isConfirmed
                      ? '#0D9488'
                      : isPrioritized
                      ? '#F59E0B'
                      : '#CBD2DC'
                  }
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  filter="url(#node-shadow)"
                  className="transition-all duration-150 group-hover:scale-105"
                />

                {/* Status indicator bar on top edge */}
                <rect
                  x="-68"
                  y="-26"
                  width="136"
                  height="4"
                  rx="2"
                  fill={isConfirmed ? '#0D9488' : isPrioritized ? '#F59E0B' : '#94A3B8'}
                />

                {/* Title */}
                <text
                  x="-58"
                  y="-6"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#0B2A5B"
                  className="truncate"
                >
                  {cluster.title.length > 18 ? cluster.title.substring(0, 18) + '...' : cluster.title}
                </text>

                {/* Subtitle & Count */}
                <text x="-58" y="10" fontSize="9" fill="#475569">
                  {cluster.complaintsCount} Grievances · {cluster.confidenceScore}% Match
                </text>

                {/* Status Badge Tag */}
                <rect
                  x="-58"
                  y="13"
                  width="68"
                  height="12"
                  rx="3"
                  fill={isConfirmed ? '#CCFBF1' : '#FEF3C7'}
                />
                <text
                  x="-24"
                  y="22"
                  textAnchor="middle"
                  fontSize="7.5"
                  fontWeight="bold"
                  fill={isConfirmed ? '#0F766E' : '#92400E'}
                >
                  {isConfirmed ? 'CONFIRMED' : 'NEEDS REVIEW'}
                </text>
              </g>
            );
          })}

          {/* 5. CENTRAL ANCHOR: INSTITUTION NODE */}
          <g
            transform={`translate(${centerX}, ${centerY})`}
            className="cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              onSelectInstitution(institution);
            }}
          >
            {/* Outer Accent Ring */}
            <circle
              r="48"
              fill="#0B2A5B"
              stroke="#CBD2DC"
              strokeWidth="2"
              filter="url(#node-shadow)"
              className="transition-transform duration-150 group-hover:scale-105"
            />
            {/* Emblem Circle */}
            <circle r="42" fill="#071D3F" stroke="#FCD34D" strokeWidth="1.5" />

            {/* Icon */}
            <foreignObject x="-14" y="-28" width="28" height="28">
              <div className="w-full h-full flex items-center justify-center text-[#FCD34D]">
                <Building2 className="w-5 h-5 text-amber-300" />
              </div>
            </foreignObject>

            {/* Institution Name */}
            <text
              textAnchor="middle"
              y="6"
              fontSize="9.5"
              fontWeight="bold"
              fill="#FFFFFF"
              className="font-sans"
            >
              {institution.shortName}
            </text>

            {/* Permanent ID Badge */}
            <rect x="-36" y="13" width="72" height="13" rx="3" fill="#1E293B" />
            <text
              textAnchor="middle"
              y="22"
              fontSize="7.5"
              fontWeight="bold"
              fontFamily="monospace"
              fill="#94A3B8"
            >
              {institution.permanentId}
            </text>

            {/* Case Counter Badge Pill */}
            <rect x="-24" y="38" width="48" height="15" rx="7.5" fill="#C2570C" stroke="#FFFFFF" strokeWidth="1.5" />
            <text
              textAnchor="middle"
              y="49"
              fontSize="8"
              fontWeight="bold"
              fill="#FFFFFF"
            >
              {institution.totalGrievances} Cases
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
