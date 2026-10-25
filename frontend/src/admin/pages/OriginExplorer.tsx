import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Institution } from '../types';
import { Button } from '../design-system/Button';
import {
  Compass,
  MapPin,
  Search,
  Building2,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const OriginExplorer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>('inst-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('ALL');

  useEffect(() => {
    const fetchInst = async () => {
      const data = await apiService.getInstitutions(searchQuery, activeRegion);
      setInstitutions(data);
      const selFromUrl = searchParams.get('selected');
      if (selFromUrl && data.some((i) => i.id === selFromUrl)) {
        setSelectedInstId(selFromUrl);
      } else if (data.length > 0 && !data.some((i) => i.id === selectedInstId)) {
        setSelectedInstId(data[0].id);
      }
    };
    fetchInst();
  }, [searchQuery, activeRegion, searchParams]);

  const selectedInst = institutions.find((i) => i.id === selectedInstId) || institutions[0];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#0B2A5B] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#C2570C]" />
            Map View
          </h2>
          <p className="text-xs text-[#4B5565] mt-0.5">
            View complaints by college campus and regional location.
          </p>
        </div>
        <div className="text-xs px-2.5 py-1 bg-[#E6EEF9] text-[#1F5FBF] border border-[#93C5FD] rounded font-semibold self-start md:self-auto">
          Interactive Map &amp; List
        </div>
      </div>

      {/* Split View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[620px]">
        {/* Left Column: Searchable List (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#CBD2DC] rounded-[8px] flex flex-col overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-[#CBD2DC] bg-[#F3F5F8] space-y-2">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter institutions or city..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-[#CBD2DC] rounded-[4px] text-[#1A1F2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
              />
              <Search className="w-3.5 h-3.5 text-[#4B5565] absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['ALL', 'Northern', 'Western', 'Eastern', 'Southern', 'Central'].map((reg) => (
                <button
                  key={reg}
                  onClick={() => setActiveRegion(reg)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${
                    activeRegion === reg
                      ? 'bg-[#1F5FBF] text-white'
                      : 'bg-white border border-[#CBD2DC] text-[#4B5565] hover:bg-gray-100'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* List Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#CBD2DC]">
            {institutions.map((inst) => {
              const isSelected = inst.id === selectedInstId;
              return (
                <div
                  key={inst.id}
                  onClick={() => {
                    setSelectedInstId(inst.id);
                    setSearchParams({ selected: inst.id });
                  }}
                  className={`p-3.5 cursor-pointer transition-colors text-xs ${
                    isSelected ? 'bg-[#E6EEF9] border-l-4 border-l-[#1F5FBF]' : 'hover:bg-[#F3F5F8]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#0B2A5B]">
                      {inst.permanentId}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-white border border-[#CBD2DC] rounded font-semibold text-[#4B5565]">
                      {inst.region}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#1A1F2B] mt-1 line-clamp-1">
                    {inst.name}
                  </h3>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-[#4B5565]">
                    <span>{inst.city}, {inst.state}</span>
                    <span className="font-mono font-bold text-[#B91C1C]">
                      {inst.activeCasesCount} pending
                    </span>
                  </div>
                </div>
              );
            })}

            {institutions.length === 0 && (
              <div className="p-8 text-center text-[#4B5565] text-xs">
                No institutions match search query.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Map Simulation & Detailed Pin Dossier (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Spatial Canvas (Stylized SVG Map Projection of India with Pins) */}
          <div className="bg-[#0B2A5B] border border-[#CBD2DC] rounded-[8px] p-4 relative overflow-hidden flex flex-col justify-between min-h-[380px] shadow-inner select-none text-white">
            <div className="flex items-center justify-between z-10 bg-[#0B2A5B]/80 backdrop-blur-sm p-2 rounded border border-white/10">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#F2895E]" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Regional Jurisdictional Map
                </span>
              </div>
              <span className="text-[11px] text-[#CBD2DC] font-mono">
                Projection: AICTE Zones
              </span>
            </div>

            {/* Stylized National Grid Visualization */}
            <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 600 500" fill="none" stroke="currentColor">
                <path d="M 200,80 Q 280,40 330,100 T 400,200 T 450,260 T 380,360 T 320,460 T 260,380 T 160,260 T 180,180 Z" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="280" cy="140" r="120" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx="300" cy="300" r="140" strokeWidth="1" strokeDasharray="2 2" />
              </svg>
            </div>

            {/* Pin Placement on Normalized Canvas */}
            <div className="relative w-full h-[280px] my-auto">
              {institutions.map((inst) => {
                const isSelected = inst.id === selectedInstId;
                
                // Map coordinates approximate to container
                // Delhi: 28.7N, 77.1E -> top: 22%, left: 42%
                // Pune: 18.5N, 73.8E -> top: 58%, left: 34%
                // Kolkata: 22.5N, 88.3E -> top: 48%, left: 74%
                // Bengaluru: 12.9N, 77.5E -> top: 76%, left: 45%
                // Jaipur: 26.9N, 75.7E -> top: 28%, left: 36%
                // Chennai: 13.0N, 80.2E -> top: 75%, left: 56%
                // Bhopal: 23.2N, 77.4E -> top: 44%, left: 46%

                let top = '50%';
                let left = '50%';

                // Add deterministic jitter based on inst.id so multiple institutes in Pune/Mumbai don't overlap completely
                const hashOffset = (inst.permanentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 9) - 4;
                const jitterX = hashOffset * 1.5;
                const jitterY = (hashOffset * -1.2);

                if (inst.city === 'Pune') { 
                  top = `${58 + jitterY}%`; 
                  left = `${34 + jitterX}%`; 
                } else if (inst.city === 'Mumbai') { 
                  top = `${53 + jitterY}%`; 
                  left = `${27 + jitterX}%`; 
                } else if (inst.city === 'Nagpur') { 
                  top = `${46 + jitterY}%`; 
                  left = `${52 + jitterX}%`; 
                } else if (inst.city === 'Sangli') { 
                  top = `${66 + jitterY}%`; 
                  left = `${33 + jitterX}%`; 
                } else if (inst.city.includes('Sambhajinagar') || inst.city === 'Aurangabad') { 
                  top = '49%'; 
                  left = '37%'; 
                } else if (inst.city === 'Nashik') { 
                  top = '49%'; 
                  left = '30%'; 
                } else if (inst.city === 'Karad') { 
                  top = '64%'; 
                  left = '32%'; 
                } else if (inst.city === 'Kolhapur') { 
                  top = '69%'; 
                  left = '31%'; 
                } else if (inst.city === 'Solapur') { 
                  top = '62%'; 
                  left = '39%'; 
                } else if (inst.city === 'Nanded') { 
                  top = '54%'; 
                  left = '45%'; 
                } else if (inst.city === 'Amravati') { 
                  top = '45%'; 
                  left = '48%'; 
                } else if (inst.city === 'New Delhi') { 
                  top = '22%'; 
                  left = '42%'; 
                } else if (inst.city === 'Kolkata') { 
                  top = '46%'; 
                  left = '74%'; 
                } else if (inst.city === 'Bengaluru') { 
                  top = '76%'; 
                  left = '45%'; 
                } else if (inst.city === 'Jaipur') { 
                  top = '28%'; 
                  left = '36%'; 
                } else if (inst.city === 'Chennai') { 
                  top = '74%'; 
                  left = '56%'; 
                } else if (inst.city === 'Bhopal') { 
                  top = '44%'; 
                  left = '46%'; 
                }

                return (
                  <button
                    key={inst.id}
                    onClick={() => {
                      setSelectedInstId(inst.id);
                      setSearchParams({ selected: inst.id });
                    }}
                    style={{ top, left }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                      isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                    }`}
                    title={`${inst.name} (${inst.city}) - ${inst.activeCasesCount} cases`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-[11px] shadow-lg border-2 ${
                        isSelected
                          ? 'bg-[#C2570C] border-white text-white ring-4 ring-[#C2570C]/50'
                          : inst.activeCasesCount > 12
                          ? 'bg-[#B91C1C] border-white text-white'
                          : 'bg-[#1F5FBF] border-white text-white'
                      }`}
                    >
                      {inst.activeCasesCount}
                    </div>
                    {isSelected && (
                      <span className="bg-[#1A1F2B] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap border border-white/20">
                        {inst.city}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Map Legend */}
            <div className="flex items-center justify-between text-[11px] text-[#CBD2DC] pt-2 border-t border-white/10 z-10">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B91C1C]" /> &gt;12 Active Cases
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1F5FBF]" /> Standard Volume
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C2570C]" /> Selected Pin
                </span>
              </div>
              <span className="font-mono text-[10px]">Data updated: Realtime</span>
            </div>
          </div>

          {/* Detailed Selected Institution Dossier Card */}
          {selectedInst && (
            <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#CBD2DC]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0B2A5B] bg-[#F3F5F8] px-2 py-0.5 rounded border border-[#CBD2DC]">
                      {selectedInst.permanentId}
                    </span>
                    <span className="text-xs font-semibold text-[#1F5FBF]">
                      {selectedInst.institutionType}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1A1F2B] mt-1">
                    {selectedInst.name}
                  </h3>
                  <div className="text-xs text-[#4B5565] mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C2570C]" />
                    <span>{selectedInst.address}, {selectedInst.city}, {selectedInst.state}</span>
                  </div>
                </div>

                <Link to={`/cases?institutionId=${selectedInst.id}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View All {selectedInst.activeCasesCount} Cases
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2 bg-[#F3F5F8] rounded border border-[#CBD2DC] text-center">
                  <div className="text-[10px] text-[#4B5565] uppercase font-bold">Active Cases</div>
                  <div className="font-mono font-bold text-base text-[#B91C1C] mt-0.5">{selectedInst.activeCasesCount}</div>
                </div>
                <div className="p-2 bg-[#F3F5F8] rounded border border-[#CBD2DC] text-center">
                  <div className="text-[10px] text-[#4B5565] uppercase font-bold">Resolved Cases</div>
                  <div className="font-mono font-bold text-base text-[#166534] mt-0.5">{selectedInst.resolvedCasesCount}</div>
                </div>
                <div className="p-2 bg-[#F3F5F8] rounded border border-[#CBD2DC] text-center">
                  <div className="text-[10px] text-[#4B5565] uppercase font-bold">Oldest Pending</div>
                  <div className="font-mono font-bold text-base text-[#92400E] mt-0.5">{selectedInst.oldestPendingDays} days</div>
                </div>
                <div className="p-2 bg-[#F3F5F8] rounded border border-[#CBD2DC] text-center">
                  <div className="text-[10px] text-[#4B5565] uppercase font-bold">Compliance Rating</div>
                  <div className="font-mono font-bold text-base text-[#1F5FBF] mt-0.5">{selectedInst.complianceScore}%</div>
                </div>
              </div>

              <div className="text-xs text-[#4B5565] pt-1">
                <span className="font-semibold text-[#1A1F2B]">Bureaus Actively Engaged: </span>
                <span>{selectedInst.bureausInvolved.join(', ')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
