import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { Institution } from '../types';
import { Button } from '../design-system/Button';
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Clock,
  ShieldCheck,
  LayoutGrid,
  List,
  Phone,
  Mail,
  ExternalLink,
} from 'lucide-react';

export const InstitutionDirectory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  const queryParam = searchParams.get('query') || '';
  const regionParam = searchParams.get('region') || 'ALL';

  const [searchInput, setSearchInput] = useState(queryParam);

  const loadInstitutions = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getInstitutions(queryParam, regionParam);
      setInstitutions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, [queryParam, regionParam]);

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

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#0B2A5B] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C2570C]" />
              Colleges &amp; Institutions
            </h2>
            <p className="text-xs text-[#4B5565] mt-0.5">
              Browse approved technical colleges, nodal officers, and grievance history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<LayoutGrid className="w-3.5 h-3.5" />}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<List className="w-3.5 h-3.5" />}
              onClick={() => setViewMode('table')}
            >
              List Table
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-[#CBD2DC]">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Institution Name, City, or AICTE Permanent ID (e.g. 1-332918231)..."
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
              <option value="North-Western">North-Western</option>
              <option value="Central">Central</option>
              <option value="Western">Western</option>
              <option value="Eastern">Eastern</option>
              <option value="Southern">Southern</option>
              <option value="South-Western">South-Western</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid View Mode */}
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

      {/* Table View Mode */}
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
    </div>
  );
};
