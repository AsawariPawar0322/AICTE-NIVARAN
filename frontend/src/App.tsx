// ==========================================================================
// NIVARAN · Master Application Entrypoint (App.tsx)
// Unified Architecture: GIGW-Compliant Citizen Portal & Enterprise Admin Portal
// SIH26264 · All India Council for Technical Education
// ==========================================================================

import React, { Suspense, lazy, useState } from 'react';
import { AppProviders, useApp } from './app/AppProviders';
import { Shell } from './app/Shell';
import { Skeleton } from './ui/FeedbackStates';
import { FloatingOfficialChat } from './ui/FloatingOfficialChat';

// Code-Split Dynamic Route Imports
const LandingView = lazy(() => import('./features/landing/LandingView').then(m => ({ default: m.LandingView })));
const SubmitComplaintView = lazy(() => import('./features/complaints/SubmitComplaintView').then(m => ({ default: m.SubmitComplaintView })));
const MyComplaintsView = lazy(() => import('./features/complaints/MyComplaintsView').then(m => ({ default: m.MyComplaintsView })));
const ComplaintDetailsView = lazy(() => import('./features/complaints/ComplaintDetailsView').then(m => ({ default: m.ComplaintDetailsView })));
const ResolutionConfirmView = lazy(() => import('./features/complaints/ResolutionConfirmView').then(m => ({ default: m.ResolutionConfirmView })));
const ComplaintDiscoveryView = lazy(() => import('./features/discovery/ComplaintDiscoveryView').then(m => ({ default: m.ComplaintDiscoveryView })));
const TrackComplaintView = lazy(() => import('./features/tracking/TrackComplaintView').then(m => ({ default: m.TrackComplaintView })));
const CitizenLoginView = lazy(() => import('./features/auth/CitizenLoginView').then(m => ({ default: m.CitizenLoginView })));
const AdminLoginView = lazy(() => import('./features/auth/AdminLoginView').then(m => ({ default: m.AdminLoginView })));
const AdminConsoleView = lazy(() => import('./features/admin/AdminConsoleView').then(m => ({ default: m.AdminConsoleView })));
const InterBureauHubView = lazy(() => import('./features/hub/InterBureauHubView').then(m => ({ default: m.InterBureauHubView })));
const UiCatalogView = lazy(() => import('./features/ui-gallery/UiCatalogView').then(m => ({ default: m.UiCatalogView })));

// Enterprise Admin Portal (15 Modules, Live FastAPI Backend, Scorecards, ATR Scrutiny Validator, Inspection Orders)
const AdminPortal = lazy(() => import('./admin/App').then(m => ({ default: m.AdminPortal })));

const RouteRenderer: React.FC = () => {
  const { activeTab, currentUser, navigateToTab } = useApp();
  const [adminViewMode, setAdminViewMode] = useState<'enterprise' | 'console'>('enterprise');

  // Enterprise Admin Portal Route
  if (activeTab === 'admin' || activeTab === 'admin-inbox') {
    return (
      <Suspense
        fallback={
          <div style={{ maxWidth: '1200px', margin: 'var(--sp-8) auto', padding: '0 var(--sp-6)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <Skeleton height="48px" width="40%" />
            <Skeleton height="240px" width="100%" />
            <Skeleton height="160px" width="100%" />
          </div>
        }
      >
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
          {/* Official Workspace Header Strip & Mode Toggle */}
          <div
            style={{
              backgroundColor: '#0F172A',
              color: '#F8FAFC',
              padding: '6px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              borderBottom: '1px solid #1E293B',
              zIndex: 50,
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ backgroundColor: '#C2410C', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '10px', letterSpacing: '0.04em' }}>
                OFFICIAL WORKSPACE
              </span>
              <span style={{ color: '#CBD5E1' }}>
                Signed in as: <strong style={{ color: '#fff' }}>{currentUser?.name || 'Dr. Ramesh Chandra Verma (PGRC Director)'}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#94A3B8', fontSize: '11px' }}>Mode:</span>
              <button
                type="button"
                onClick={() => setAdminViewMode('enterprise')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: adminViewMode === 'enterprise' ? 700 : 500,
                  backgroundColor: adminViewMode === 'enterprise' ? '#1E293B' : 'transparent',
                  color: adminViewMode === 'enterprise' ? '#38BDF8' : '#94A3B8',
                  border: adminViewMode === 'enterprise' ? '1px solid #38BDF8' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                Enterprise 15-Module (Live Backend &amp; Scorecard)
              </button>
              <button
                type="button"
                onClick={() => setAdminViewMode('console')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: adminViewMode === 'console' ? 700 : 500,
                  backgroundColor: adminViewMode === 'console' ? '#1E293B' : 'transparent',
                  color: adminViewMode === 'console' ? '#38BDF8' : '#94A3B8',
                  border: adminViewMode === 'console' ? '1px solid #38BDF8' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                Redressal Console (13 Screens)
              </button>
              <button
                type="button"
                onClick={() => navigateToTab('home')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#FCA5A5',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  cursor: 'pointer',
                  marginLeft: '8px'
                }}
              >
                Exit to Citizen Portal ✕
              </button>
            </div>
          </div>

          {adminViewMode === 'enterprise' ? (
            <AdminPortal
              officerInfo={currentUser}
              onExitAdmin={() => navigateToTab('home')}
              initialRoute={activeTab === 'admin-inbox' ? '/messages' : '/'}
            />
          ) : (
            <AdminConsoleView />
          )}
        </div>
      </Suspense>
    );
  }

  // Citizen / Public Shell Routes
  return (
    <Shell>
      <Suspense
        fallback={
          <div style={{ maxWidth: '1200px', margin: 'var(--sp-8) auto', padding: '0 var(--sp-6)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <Skeleton height="48px" width="40%" />
            <Skeleton height="240px" width="100%" />
            <Skeleton height="160px" width="100%" />
          </div>
        }
      >
        {activeTab === 'home' && <LandingView />}
        {activeTab === 'submit' && <SubmitComplaintView />}
        {activeTab === 'my-complaints' && <MyComplaintsView />}
        {activeTab === 'complaint-detail' && <ComplaintDetailsView />}
        {activeTab === 'resolution-confirm' && <ResolutionConfirmView />}
        {activeTab === 'discovery' && <ComplaintDiscoveryView />}
        {activeTab === 'track' && <TrackComplaintView />}
        {activeTab === 'citizen-login' && <CitizenLoginView />}
        {activeTab === 'admin-login' && <AdminLoginView />}
        {activeTab === 'hub' && <InterBureauHubView />}
        {activeTab === 'ui' && <UiCatalogView />}
      </Suspense>
      <FloatingOfficialChat />
    </Shell>
  );
};

export function App() {
  return (
    <AppProviders>
      <RouteRenderer />
    </AppProviders>
  );
}

export default App;
