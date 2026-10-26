// ==========================================================================
// NIVARAN · Official Admin Console Shell (AdminLayout.tsx)
// 280px Dark-Navy Sidebar, Slim Top Bar with Global Search, Role Lock
// Fixes Defect D2 (sidebar badges stretch: flex: 0 0 auto)
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../../app/AppProviders';
import { Icon, IconName } from '../../ui/Icon';
import { Button } from '../../ui/Button';
import styles from '../../ui/ui.module.css';

export type AdminScreenKey =
  | 'dashboard'
  | 'all-cases'
  | 'verification'
  | 'overlaps'
  | 'institutions'
  | 'workload'
  | 'escalations'
  | 'proof-review'
  | 'reports'
  | 'audit-logs'
  | 'messages'
  | 'cohort-remedies'
  | 'settings';

interface SidebarItem {
  key: AdminScreenKey;
  label: string;
  icon: IconName;
  badge?: number | string;
  badgeVariant?: 'danger' | 'warn' | 'neutral';
}

interface SidebarGroup {
  groupName: string;
  items: SidebarItem[];
}

interface AdminLayoutProps {
  currentScreen: AdminScreenKey;
  onSelectScreen: (screen: AdminScreenKey, filterPreset?: any) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentScreen,
  onSelectScreen,
  children
}) => {
  const { currentUser, logout, complaints, navigateToTab } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Count active items
  const overdueCount = complaints.filter(c => c.slaClock.isOverdue).length;
  const overlapCount = complaints.filter(c => c.overlapInfo?.hasOverlap && c.overlapInfo.status === 'UNREVIEWED').length;
  const proofReviewCount = complaints.filter(c => c.currentStage === 'RESOLUTION_PROPOSED').length;

  const GROUPS: SidebarGroup[] = [
    {
      groupName: 'Overview',
      items: [
        { key: 'dashboard', label: '1. Executive Dashboard', icon: 'chart-bar' },
        { key: 'all-cases', label: '2. All Grievance Cases', icon: 'folder', badge: complaints.length },
        { key: 'verification', label: '3. Verification Queue', icon: 'shield', badge: 2 }
      ]
    },
    {
      groupName: 'Coordination',
      items: [
        { key: 'overlaps', label: '4. Potential Overlaps', icon: 'search', badge: overlapCount, badgeVariant: 'warn' },
        { key: 'institutions', label: '5. Institution Directory', icon: 'building' },
        { key: 'workload', label: '6. Bureau Workload & Roster', icon: 'user' },
        { key: 'escalations', label: '7. Stage Tracking & SLA', icon: 'clock', badge: overdueCount, badgeVariant: 'danger' }
      ]
    },
    {
      groupName: 'Resolution & Audit',
      items: [
        { key: 'proof-review', label: '8. Resolution Proof Review', icon: 'check-circle', badge: proofReviewCount, badgeVariant: 'warn' },
        { key: 'reports', label: '9. Reports & Analytics', icon: 'chart-line' },
        { key: 'audit-logs', label: '10. Audit Logs & Hash Chain', icon: 'lock' }
      ]
    },
    {
      groupName: 'Administration',
      items: [
        { key: 'messages', label: '11. Official Messages', icon: 'chat' },
        { key: 'cohort-remedies', label: '12. Cohort Remedies Pool', icon: 'plus' },
        { key: 'settings', label: '13. Bureau & SLA Settings', icon: 'sliders' }
      ]
    }
  ];

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    onSelectScreen('all-cases', { search: globalSearch.trim() });
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)', backgroundColor: 'var(--bg)' }}>
      {/* ── 1. Fixed 280px Dark-Navy Sidebar ── */}
      <aside
        style={{
          width: collapsed ? '72px' : '280px',
          backgroundColor: 'var(--navy-900)',
          color: '#FFFFFF',
          transition: 'width var(--transition-normal)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.15)',
          overflowY: 'auto'
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: 'var(--sp-4)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.04em' }}>
                OFFICIAL CONSOLE
              </span>
              <span style={{ fontSize: '10px', color: 'var(--india-saffron)', fontWeight: 600 }}>
                {currentUser?.bureau || 'Central PGRC Bureau'}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              color: '#FFFFFF',
              padding: '4px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              cursor: 'pointer'
            }}
          >
            <Icon name={collapsed ? 'arrow-right' : 'arrow-left'} size={16} />
          </button>
        </div>

        {/* Sidebar Nav Groups */}
        <nav style={{ flex: 1, padding: 'var(--sp-3) var(--sp-2)' }}>
          {GROUPS.map(group => (
            <div key={group.groupName} style={{ marginBottom: 'var(--sp-4)' }}>
              {!collapsed && (
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.45)',
                    padding: '4px var(--sp-3)',
                    letterSpacing: '0.05em'
                  }}
                >
                  {group.groupName}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                {group.items.map(item => {
                  const isActive = currentScreen === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onSelectScreen(item.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'space-between',
                        padding: 'var(--sp-2) var(--sp-3)',
                        borderRadius: 'var(--rad-sm)',
                        backgroundColor: isActive ? 'var(--navy-700)' : 'transparent',
                        color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: 'var(--fs-xs)',
                        fontWeight: isActive ? 700 : 500,
                        transition: 'background-color var(--transition-fast)'
                      }}
                      title={collapsed ? item.label : undefined}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', minWidth: 0 }}>
                        <Icon name={item.icon} size={18} weight={isActive ? 'duotone' : 'regular'} />
                        {!collapsed && (
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.label}
                          </span>
                        )}
                      </div>

                      {/* Defect D2 Fix: sidebar count badge flex: 0 0 auto, never stretches */}
                      {!collapsed && item.badge !== undefined && (
                        <span
                          className="sidebar-count"
                          style={{
                            flex: '0 0 auto',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 'var(--rad-full)',
                            backgroundColor:
                              item.badgeVariant === 'danger'
                                ? 'var(--danger)'
                                : item.badgeVariant === 'warn'
                                ? 'var(--action)'
                                : 'rgba(255, 255, 255, 0.2)',
                            color: '#FFFFFF'
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Officer Profile & Sign Out to Home */}
        <div
          style={{
            padding: 'var(--sp-3)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          {!collapsed && (
            <div style={{ marginBottom: 'var(--sp-2)', fontSize: '11px' }}>
              <div style={{ fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.name || 'Dr. Ramesh Chandra Verma'}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.designation || 'Director · PGRC'}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 'var(--sp-2)',
              padding: '6px 10px',
              borderRadius: 'var(--rad-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontSize: 'var(--fs-xs)',
              cursor: 'pointer'
            }}
          >
            <Icon name="sign-out" size={14} />
            {!collapsed && <span>Sign Out to Home</span>}
          </button>
        </div>
      </aside>

      {/* ── 2. Top Bar & Main Content Viewport ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* Slim Top Bar */}
        <header
          style={{
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: 'var(--sp-3) var(--sp-6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--sp-4)',
            flexWrap: 'wrap'
          }}
        >
          {/* Global Search (Docket, Permanent ID, College) */}
          <form onSubmit={handleGlobalSearch} style={{ flex: '1 1 280px', maxWidth: '420px', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            >
              <Icon name="search" size={16} />
            </div>
            <input
              type="text"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder="Search by Docket (NIV-...), Permanent ID (DEMO-...), or College..."
              className={styles.input}
              style={{ paddingLeft: '34px', minHeight: '36px', fontSize: 'var(--fs-xs)' }}
            />
          </form>

          {/* Quick Shortcuts & Notices */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <button
              type="button"
              onClick={() => onSelectScreen('overlaps')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: 'var(--fs-xs)',
                fontWeight: 600,
                color: overlapCount > 0 ? 'var(--action)' : 'var(--text-muted)',
                padding: '4px 8px',
                borderRadius: 'var(--rad-sm)',
                backgroundColor: overlapCount > 0 ? 'var(--action-tint)' : 'var(--navy-50)',
                border: `1px solid ${overlapCount > 0 ? 'var(--action-border)' : 'var(--border)'}`,
                cursor: 'pointer'
              }}
            >
              <Icon name="search" size={14} />
              <span>{overlapCount} Potential Overlaps</span>
            </button>

            <button
              type="button"
              onClick={() => navigateToTab('hub')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: 'var(--fs-xs)',
                fontWeight: 600,
                color: 'var(--navy-900)',
                padding: '4px 8px',
                borderRadius: 'var(--rad-sm)',
                backgroundColor: 'var(--navy-50)',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              <Icon name="chat" size={14} />
              <span>Inter-Bureau Hub</span>
            </button>
          </div>
        </header>

        {/* Dynamic Screen Viewport */}
        <main id="main-content" style={{ flex: 1, padding: 'var(--sp-6)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
