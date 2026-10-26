import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Bell, UserCheck, ShieldAlert, Check, ShieldCheck, Clock, Building, ArrowLeft } from 'lucide-react';

export const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeOfficer, t, addToast, onExitAdmin } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) {
      return [{ label: t('nav_dashboard'), path: '/' }];
    }
    const crumbs = [{ label: t('nav_dashboard'), path: '/' }];
    let accum = '';
    parts.forEach((p) => {
      accum += `/${p}`;
      let label = p;
      if (p === 'cases') label = t('nav_cases');
      else if (p === 'verification') label = t('nav_verification');
      else if (p === 'institutions') label = t('nav_institutions');
      else if (p === 'origin-explorer') label = t('nav_origin_explorer');
      else if (p === 'coordination') label = t('nav_coordination');
      else if (p === 'resolution-proofs') label = t('nav_resolution_proofs');
      else if (p === 'stage-tracking') label = t('nav_stage_tracking');
      else if (p === 'messages') label = t('nav_messages');
      else if (p === 'complaint-pool') label = t('nav_complaint_pool');
      else if (p === 'reports') label = t('nav_reports');
      else if (p === 'settings') label = t('nav_settings');
      else if (p === 'audit-logs') label = t('nav_audit_logs');
      crumbs.push({ label, path: accum });
    });
    return crumbs;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cases?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const breadcrumbs = getBreadcrumbs();
  const currentTitle = breadcrumbs[breadcrumbs.length - 1]?.label || t('nav_dashboard');

  return (
    <div className="bg-white border-b border-[#CBD2DC] px-4 md:px-6 py-2.5 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 min-h-[58px] select-none shadow-xs">
      {/* Title, Ministry Desk Tag & Breadcrumbs */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#0B2A5B] text-white font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            AICTE NIVARAN · Govt. of India
          </span>
          <span className="text-[10.5px] font-semibold text-[#64748B] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#94A3B8]" />
            25 Oct 2026 | IST
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <h1 className="text-base md:text-lg font-bold text-[#0B2A5B] leading-none">
            {currentTitle}
          </h1>
          <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-1.5 text-xs text-[#64748B]">
            <span className="text-[#CBD2DC]">·</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.path}>
                {idx > 0 && <span className="text-[#CBD2DC]">/</span>}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-[#1E293B]">{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} className="hover:text-[#C2570C] hover:underline">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      {/* Global Search & Official Officer Tools */}
      <div className="flex items-center gap-2.5 ml-auto flex-shrink-0">
        {/* Global Registry Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-64 md:w-72">
          <label htmlFor="global-search" className="sr-only">
            {t('search_placeholder')}
          </label>
          <input
            id="global-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#0F172A] placeholder-[#475569] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-all duration-200"
          />
          <Search className="w-3.5 h-3.5 text-[#475569] absolute left-2.5 top-2.5 pointer-events-none" aria-hidden="true" />
        </form>

        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded border border-[#CBD2DC] text-[#1E293B] bg-[#F8FAFC] hover:bg-white flex items-center justify-center transition-colors relative"
            aria-label="View official notifications"
            aria-expanded={showNotifications}
          >
            <Bell className="w-4 h-4 text-[#475569]" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B91C1C] text-white text-[9.5px] font-bold flex items-center justify-center">
              2
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#CBD2DC] rounded-[8px] shadow-lg z-50 p-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#CBD2DC]">
                <span className="text-xs font-bold text-[#0B2A5B] uppercase">SLA &amp; Intake Alerts</span>
                <span className="text-[10px] text-[#C2570C] font-semibold">2 pending</span>
              </div>
              <div className="py-2 space-y-2">
                <div
                  className="p-2 bg-[#FEE2E2] border border-[#FCA5A5] rounded text-xs cursor-pointer hover:bg-red-100"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/cases/AICTE-2024-GRV-8102');
                  }}
                >
                  <div className="font-bold text-[#B91C1C] flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> SLA Breach (Overdue 4d)
                  </div>
                  <div className="text-[#1A1F2B] text-[11px] font-mono mt-0.5">AICTE-2024-GRV-8102</div>
                  <div className="text-[11px] text-[#4B5565]">Delhi Institute of Engg - Certificate Withheld</div>
                </div>

                <div
                  className="p-2 bg-[#FEF3C7] border border-[#FCD34D] rounded text-xs cursor-pointer hover:bg-yellow-100"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/verification');
                  }}
                >
                  <div className="font-bold text-[#92400E] flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Intake Review Needed
                  </div>
                  <div className="text-[#1A1F2B] text-[11px] font-mono mt-0.5">AICTE-2024-GRV-8805</div>
                  <div className="text-[11px] text-[#4B5565]">SPCE Mumbai - Caution Money Refund</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Exit to Citizen Portal button */}
        {onExitAdmin && (
          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#CBD2DC] bg-[#FFF7ED] text-[#C2570C] hover:bg-[#FFEDD5] text-xs font-bold transition-colors cursor-pointer"
            title="Switch back to Citizen / Complainant Portal"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C2570C]" />
            <span className="hidden sm:inline">Citizen Portal</span>
          </button>
        )}

        {/* Official Officer Profile Pill (e-Office Profile) */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] border border-[#CBD2DC] bg-[#F8FAFC] hover:bg-white text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
            aria-expanded={showProfileMenu}
            title="Official Gazetted Officer Credentials"
          >
            <div className="w-6 h-6 rounded bg-[#0B2A5B] text-white flex items-center justify-center font-bold text-xs font-mono">
              {activeOfficer.name
                .replace(/^Dr\.\s*|^Prof\.\s*|^Shri\.\s*|^Mr\.\s*|^Ms\.\s*/i, '')
                .split(' ')
                .map((n) => n[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'AD'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-[#0B2A5B] leading-none">{activeOfficer.name}</div>
              <div className="text-[10px] text-[#64748B] leading-none mt-0.5">{activeOfficer.role}</div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#CBD2DC] rounded-[8px] shadow-lg z-50 p-3">
              <div className="border-b border-[#CBD2DC] pb-2 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B2A5B]">{activeOfficer.name}</span>
                  <span className="text-[9px] px-1 py-0.2 bg-emerald-50 text-[#166534] font-bold rounded border border-emerald-200">
                    NIC Certified
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] font-mono">{activeOfficer.email}</div>
                <div className="text-[11px] text-[#C2570C] font-semibold mt-1">
                  Bureau: {activeOfficer.bureau}
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5">
                  HQ: Nelson Mandela Marg, Vasant Kunj, New Delhi
                </div>
              </div>

              <div className="text-xs font-semibold text-[#64748B] mb-1.5 uppercase">Switch Officer Role</div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    addToast({
                      type: 'info',
                      title: 'Role Switched',
                      message: 'Viewing interface as Approval Bureau Regional Lead.',
                    });
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left text-xs p-1.5 rounded hover:bg-[#F8FAFC] flex items-center justify-between font-medium text-[#1E293B]"
                >
                  <span>Regional Lead (Approval Bureau)</span>
                  <Check className="w-3.5 h-3.5 text-[#166534]" />
                </button>
                <button
                  onClick={() => {
                    addToast({
                      type: 'info',
                      title: 'Role Switched',
                      message: 'Viewing interface as Central Triage Officer.',
                    });
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left text-xs p-1.5 rounded hover:bg-[#F8FAFC] flex items-center justify-between text-[#64748B]"
                >
                  <span>Central Triage Desk Executive</span>
                </button>
                <button
                  onClick={() => {
                    addToast({
                      type: 'info',
                      title: 'Role Switched',
                      message: 'Viewing interface as Institution Grievance Nodal Officer.',
                    });
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left text-xs p-1.5 rounded hover:bg-[#F8FAFC] flex items-center justify-between text-[#64748B]"
                >
                  <span>Institution Nodal Officer (DIET)</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
