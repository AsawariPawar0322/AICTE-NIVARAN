import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AicteNivaranLogo } from './GovLogos';
import {
  LayoutDashboard,
  Files,
  CheckSquare,
  Building2,
  Compass,
  Network,
  FileCheck2,
  ListOrdered,
  MessageSquare,
  Vote,
  BarChart3,
  Settings,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface NavGroup {
  heading: string;
  items: {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar, t, activeOfficer } = useApp();

  const navGroups: NavGroup[] = [
    {
      heading: 'Core Registry',
      items: [
        { to: '/', label: t('nav_dashboard'), icon: LayoutDashboard },
        { to: '/cases', label: t('nav_cases'), icon: Files },
        { to: '/verification', label: t('nav_verification'), icon: CheckSquare, badge: '2 New' },
      ],
    },
    {
      heading: 'Coordination',
      items: [
        { to: '/coordination', label: t('nav_coordination'), icon: Network, badge: '5 Pairs' },
        { to: '/complaint-pool', label: t('nav_complaint_pool'), icon: Vote },
        { to: '/resolution-proofs', label: t('nav_resolution_proofs'), icon: FileCheck2 },
      ],
    },
    {
      heading: 'Campus & Timeline',
      items: [
        { to: '/stage-tracking', label: t('nav_stage_tracking'), icon: ListOrdered },
        { to: '/institutions', label: t('nav_institutions'), icon: Building2 },
        { to: '/origin-explorer', label: t('nav_origin_explorer'), icon: Compass },
      ],
    },
    {
      heading: 'Governance & Audit',
      items: [
        { to: '/messages', label: t('nav_messages'), icon: MessageSquare, badge: '1' },
        { to: '/reports', label: t('nav_reports'), icon: BarChart3 },
        { to: '/audit-logs', label: t('nav_audit_logs'), icon: ScrollText },
        { to: '/settings', label: t('nav_settings'), icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`bg-white border-b md:border-b-0 md:border-r border-[#CBD5E1] transition-all duration-200 flex flex-col flex-shrink-0 select-none w-full sticky-sidebar ${
        isSidebarCollapsed ? 'md:w-16' : 'md:w-64'
      } z-30`}
      aria-label="Official Sidebar Navigation"
    >
      {/* Sidebar Header / Toggle */}
      <div className="h-12 border-b border-[#CBD5E1] px-2.5 flex items-center justify-between bg-[#F8FAFC]">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <AicteNivaranLogo className="w-7 h-7 flex-shrink-0" />
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="text-[11px] font-black text-[#0B2A5B] tracking-wide uppercase font-sans truncate">
                AICTE NIVARAN
              </span>
              <span className="text-[9px] text-[#C2410C] font-semibold truncate">
                Official Admin Desk
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto" title="AICTE NIVARAN">
            <AicteNivaranLogo className="w-7 h-7" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-[4px] text-[#475569] hover:text-[#0F172A] hover:bg-white border border-transparent hover:border-[#CBD5E1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2 ml-auto flex-shrink-0 transition-all duration-200"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List Grouped by Bureau Responsibility - Stacks cleanly on mobile */}
      <nav className={`flex-1 overflow-y-auto py-2 px-2 space-y-4 ${isSidebarCollapsed ? 'hidden md:block' : 'block'}`}>
        {navGroups.map((group) => (
          <div key={group.heading} className="space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-3 text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                {group.heading}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2 ${
                      isActive
                        ? 'bg-[#0B2A5B] text-white font-semibold shadow-xs'
                        : 'text-[#0F172A] hover:bg-[#F1F5F9] hover:text-[#0B2A5B]'
                    }`
                  }
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-[#C2410C] text-white rounded font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Official Officer Credentials Box */}
      {!isSidebarCollapsed && (
        <div className="p-3 border-t border-[#CBD5E1] bg-[#F8FAFC] text-[11px] text-[#475569] space-y-1">
          <div className="flex items-center justify-between font-semibold text-[#0B2A5B]">
            <span>{activeOfficer.name}</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-[#166534] border border-emerald-200 rounded font-bold flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5" /> 2FA Active
            </span>
          </div>
          <div className="text-[10.5px] text-[#475569]">Govt. ID: <span className="font-mono text-[#0B2A5B]">AICTE-NDL-091</span></div>
          <div className="text-[10px] text-[#C2410C] font-semibold">Approval &amp; Grievance Lead</div>
        </div>
      )}
    </aside>
  );
};
