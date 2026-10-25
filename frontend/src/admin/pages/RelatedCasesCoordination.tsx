import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { OverlapCandidate } from '../types';
import { StatusChip } from '../design-system/StatusChip';
import { Button } from '../design-system/Button';
import { useApp } from '../context/AppContext';
import {
  Network,
  Link2,
  Unlink2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export const RelatedCasesCoordination: React.FC = () => {
  const { addToast } = useApp();
  const [candidates, setCandidates] = useState<OverlapCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LINKED' | 'UNLINKED'>('ALL');
  const [similarityFilter, setSimilarityFilter] = useState<'ALL' | 'ABOVE_90' | '80_90' | 'BELOW_80'>('ALL');

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const pairs = await apiService.getOverlapCandidates();
      setCandidates(pairs);
    } catch (err) {
      console.error(err);
      addToast({
        type: 'danger',
        title: 'Error',
        message: 'Could not load similar cases.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const handleLink = async (pair: OverlapCandidate) => {
    try {
      await apiService.linkCases(pair.primaryCase.id, pair.relatedCase.id);
      addToast({
        type: 'success',
        title: 'Cases Linked',
        message: `Linked ${pair.primaryCase.id} with ${pair.relatedCase.id}.`,
      });
      loadCandidates();
    } catch (err: any) {
      addToast({ type: 'danger', title: 'Error', message: err.message });
    }
  };

  const handleUnlink = async (pair: OverlapCandidate) => {
    try {
      await apiService.unlinkCases(pair.primaryCase.id, pair.relatedCase.id);
      addToast({
        type: 'info',
        title: 'Cases Unlinked',
        message: `Removed link between ${pair.primaryCase.id} and ${pair.relatedCase.id}.`,
      });
      loadCandidates();
    } catch (err: any) {
      addToast({ type: 'danger', title: 'Error', message: err.message });
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter((pair) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          pair.problemTitle.toLowerCase().includes(q) ||
          pair.primaryCase.id.toLowerCase().includes(q) ||
          pair.relatedCase.id.toLowerCase().includes(q) ||
          pair.primaryCase.institutionName.toLowerCase().includes(q) ||
          pair.primaryCase.title.toLowerCase().includes(q) ||
          pair.relatedCase.title.toLowerCase().includes(q) ||
          pair.primaryCase.complainantName.toLowerCase().includes(q) ||
          pair.relatedCase.complainantName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (statusFilter === 'LINKED' && !pair.isLinked) return false;
      if (statusFilter === 'UNLINKED' && pair.isLinked) return false;

      if (similarityFilter === 'ABOVE_90' && pair.confidenceScore < 90) return false;
      if (similarityFilter === '80_90' && (pair.confidenceScore < 80 || pair.confidenceScore >= 90)) return false;
      if (similarityFilter === 'BELOW_80' && pair.confidenceScore >= 80) return false;

      return true;
    });
  }, [candidates, searchQuery, statusFilter, similarityFilter]);

  const renderPovTag = (pov?: string, role?: string) => {
    const isParent = (pov && pov.toLowerCase().includes('parent')) || role === 'PARENT';
    const isFaculty = (pov && pov.toLowerCase().includes('faculty')) || role === 'FACULTY';
    const isAlumni = (pov && pov.toLowerCase().includes('alumni')) || role === 'ALUMNI';

    let label = 'Student View';
    let style = 'bg-blue-50 text-blue-700 border-blue-200';

    if (isParent) {
      label = 'Parent View';
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (isFaculty) {
      label = 'Faculty View';
      style = 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (isAlumni) {
      label = 'Alumni View';
      style = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    return (
      <span className={`text-[11px] px-2 py-0.5 rounded font-medium border ${style}`}>
        {label}
      </span>
    );
  };

  const linkedCount = candidates.filter((c) => c.isLinked).length;

  return (
    <div className="space-y-4">
      {/* Header Banner - Clean & Minimal */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#0B2A5B] flex items-center gap-2">
            <Network className="w-4 h-4 text-[#1F5FBF]" />
            Similar Cases
          </h2>
          <p className="text-xs text-[#4B5565] mt-0.5">
            Complaints about the same problem, reported from different viewpoints (e.g. Student vs. Parent).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-[#F3F5F8] border border-[#CBD2DC] rounded font-medium text-[#4B5565]">
            <strong>{candidates.length}</strong> problems
          </span>
          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded font-medium text-emerald-700">
            <strong>{linkedCount}</strong> linked
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-3 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problem, college, or case ID..."
            className="w-full pl-9 pr-3 py-1.5 border border-[#CBD2DC] rounded-[6px] text-xs focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#4B5565]">
            <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-[#CBD2DC] rounded-[6px] px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
            >
              <option value="ALL">All ({candidates.length})</option>
              <option value="LINKED">Linked ({linkedCount})</option>
              <option value="UNLINKED">Unlinked ({candidates.length - linkedCount})</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#4B5565]">
            <select
              value={similarityFilter}
              onChange={(e) => setSimilarityFilter(e.target.value as any)}
              className="border border-[#CBD2DC] rounded-[6px] px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
            >
              <option value="ALL">All Match %</option>
              <option value="ABOVE_90">&gt; 90% match</option>
              <option value="80_90">80% - 90% match</option>
              <option value="BELOW_80">&lt; 80% match</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate List */}
      <div className="space-y-3">
        {filteredCandidates.map((pair) => (
          <div
            key={pair.pairId}
            className={`bg-white border rounded-[8px] p-4 space-y-3 transition-colors ${
              pair.isLinked ? 'border-[#1F5FBF]/60 bg-white' : 'border-[#CBD2DC]'
            }`}
          >
            {/* Header: Problem Name + Institution + Similarity + Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#CBD2DC]/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[#0B2A5B]">
                    {pair.problemTitle}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${
                      pair.confidenceScore >= 90
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : pair.confidenceScore >= 80
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {pair.confidenceScore}% similarity
                  </span>
                  {pair.isLinked && (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Linked
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#6B7280]">
                  {pair.primaryCase.institutionName} · {pair.primaryCase.city}
                </div>
              </div>

              <div>
                {pair.isLinked ? (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    leftIcon={<Unlink2 className="w-3.5 h-3.5" />}
                    onClick={() => handleUnlink(pair)}
                  >
                    Unlink
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Link2 className="w-3.5 h-3.5" />}
                    onClick={() => handleLink(pair)}
                  >
                    Link Cases
                  </Button>
                )}
              </div>
            </div>

            {/* Viewpoints comparison strip */}
            <div className="flex items-center gap-2 text-xs flex-wrap bg-[#F8FAFC] px-3 py-1.5 rounded border border-[#CBD2DC]/50">
              <span className="font-semibold text-[#4B5565]">Viewpoints:</span>
              <div className="flex items-center gap-1.5">
                {renderPovTag(pair.primaryCase.pov, pair.primaryCase.complainantType)}
                <span className="text-[#6B7280]">({pair.primaryCase.complainantName})</span>
              </div>
              <span className="text-[#9CA3AF]">↔</span>
              <div className="flex items-center gap-1.5">
                {renderPovTag(pair.relatedCase.pov, pair.relatedCase.complainantType)}
                <span className="text-[#6B7280]">({pair.relatedCase.complainantName})</span>
              </div>
            </div>

            {/* Side-by-side Case Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Primary Case */}
              <div className="p-3 border border-[#CBD2DC] rounded-[6px] bg-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#0B2A5B]">{pair.primaryCase.id}</span>
                  <StatusChip status={pair.primaryCase.status} size="sm" />
                </div>
                <div className="font-semibold text-[#1A1F2B] line-clamp-1">{pair.primaryCase.title}</div>
                <p className="text-[#6B7280] text-[11px] line-clamp-2 leading-relaxed">
                  {pair.primaryCase.description}
                </p>
                <div className="pt-1.5 border-t border-[#CBD2DC]/40 flex items-center justify-between text-[11px] text-[#4B5565]">
                  <span>{pair.primaryCase.assignedBureau}</span>
                  <Link
                    to={`/cases/${pair.primaryCase.id}`}
                    className="text-[#C2570C] font-semibold hover:underline flex items-center gap-1"
                  >
                    View Docket <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Related Case */}
              <div className="p-3 border border-[#CBD2DC] rounded-[6px] bg-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#0B2A5B]">{pair.relatedCase.id}</span>
                  <StatusChip status={pair.relatedCase.status} size="sm" />
                </div>
                <div className="font-semibold text-[#1A1F2B] line-clamp-1">{pair.relatedCase.title}</div>
                <p className="text-[#6B7280] text-[11px] line-clamp-2 leading-relaxed">
                  {pair.relatedCase.description}
                </p>
                <div className="pt-1.5 border-t border-[#CBD2DC]/40 flex items-center justify-between text-[11px] text-[#4B5565]">
                  <span>{pair.relatedCase.assignedBureau}</span>
                  <Link
                    to={`/cases/${pair.relatedCase.id}`}
                    className="text-[#C2570C] font-semibold hover:underline flex items-center gap-1"
                  >
                    View Docket <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredCandidates.length === 0 && !isLoading && (
          <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-8 text-center text-[#4B5565] text-xs">
            No similar cases found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};
