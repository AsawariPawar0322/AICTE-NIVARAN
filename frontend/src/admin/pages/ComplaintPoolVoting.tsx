import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { ComplaintPoolGroup } from '../types';
import { Button } from '../design-system/Button';
import { useApp } from '../context/AppContext';
import {
  Vote,
  Users,
  AlertTriangle,
  Building2,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
  Flame,
  ThumbsUp,
} from 'lucide-react';

export const ComplaintPoolVoting: React.FC = () => {
  const { addToast } = useApp();
  const [pools, setPools] = useState<ComplaintPoolGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPools = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getComplaintPools();
      setPools(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, []);

  const handleVote = async (poolId: string) => {
    try {
      const updated = await apiService.voteInPool(poolId);
      addToast({
        type: 'success',
        title: 'Community Vote Logged',
        message: `Affinity vote cast. Total: ${updated.voteCount} votes.`,
      });
      loadPools();
    } catch (err: any) {
      addToast({ type: 'danger', title: 'Error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Vote className="w-4 h-4 text-[#C2570C]" />
          <h2 className="text-base font-bold text-[#0B2A5B]">
            Pooled Cases &amp; Community Impact
          </h2>
          <span className="text-xs px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] rounded font-semibold">
            Impact Monitor
          </span>
        </div>
        <p className="text-xs text-[#4B5565]">
          Groups related complaints to measure how many people are affected. Note: Community votes highlight priority, while official resolutions are based on verified evidence.
        </p>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pools.map((pool) => {
          const isHighConcern = pool.status === 'FLAGGED_HIGH_CONCERN';
          const percent = Math.min(Math.round((pool.voteCount / pool.thresholdCount) * 100), 100);

          return (
            <div
              key={pool.id}
              className={`bg-white border rounded-[8px] p-5 flex flex-col justify-between transition-colors ${
                isHighConcern ? 'border-[#B91C1C] ring-1 ring-[#B91C1C]/20' : 'border-[#CBD2DC]'
              }`}
            >
              <div className="space-y-3">
                {/* Header status */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-[#0B2A5B] bg-[#F3F5F8] px-2 py-0.5 rounded border border-[#CBD2DC]">
                    {pool.id}
                  </span>
                  {isHighConcern ? (
                    <span className="text-xs px-2 py-0.5 bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] rounded font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> High Concern
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-[#E6EEF9] text-[#1F5FBF] border border-[#93C5FD] rounded font-semibold">
                      Open Pool
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-[#1A1F2B] leading-snug">
                  {pool.title}
                </h3>

                <div className="text-xs text-[#4B5565] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#C2570C]" />
                  <span>{pool.institutionName} ({pool.permanentId})</span>
                </div>

                <p className="text-xs text-[#1A1F2B] leading-relaxed bg-[#F3F5F8] p-3 rounded border border-[#CBD2DC]">
                  {pool.summary}
                </p>

                {/* Progress toward threshold */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#4B5565] font-semibold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#1F5FBF]" />
                      Affinity Votes: <strong className="text-[#1A1F2B] font-mono">{pool.voteCount}</strong>
                    </span>
                    <span className="text-[11px] text-[#4B5565]">
                      Threshold: {pool.thresholdCount} votes
                    </span>
                  </div>

                  <div className="w-full h-2 bg-[#CBD2DC]/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isHighConcern ? 'bg-[#B91C1C]' : 'bg-[#1F5FBF]'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Sample Case Links */}
                <div className="text-xs text-[#4B5565] space-y-1 pt-1">
                  <span className="font-semibold text-[#1A1F2B]">Associated Case Dockets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {pool.sampleCaseIds.map((cId) => (
                      <Link
                        key={cId}
                        to={`/cases/${cId}`}
                        className="font-mono text-[11px] text-[#1F5FBF] hover:underline bg-[#E6EEF9] px-1.5 py-0.5 rounded"
                      >
                        {cId}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-4 mt-3 border-t border-[#CBD2DC] flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<ThumbsUp className="w-3.5 h-3.5" />}
                  onClick={() => handleVote(pool.id)}
                >
                  Cast Demo Vote (+1)
                </Button>

                <Link to={`/cases?bureau=Approval`}>
                  <Button variant="tertiary" size="sm">
                    Inquire Cluster &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
