import React, { Suspense, lazy } from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AdminShell } from './components/AdminShell';

// Route-level lazy loading for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const AllCases = lazy(() => import('./pages/AllCases').then((m) => ({ default: m.AllCases })));
const CaseDetail = lazy(() => import('./pages/CaseDetail').then((m) => ({ default: m.CaseDetail })));
const VerificationQueue = lazy(() => import('./pages/VerificationQueue').then((m) => ({ default: m.VerificationQueue })));
const InstitutionDirectory = lazy(() => import('./pages/InstitutionDirectory').then((m) => ({ default: m.InstitutionDirectory })));
const OriginExplorer = lazy(() => import('./pages/OriginExplorer').then((m) => ({ default: m.OriginExplorer })));
const RelatedCasesCoordination = lazy(() => import('./pages/RelatedCasesCoordination').then((m) => ({ default: m.RelatedCasesCoordination })));
const ResolutionProofReview = lazy(() => import('./pages/ResolutionProofReview').then((m) => ({ default: m.ResolutionProofReview })));
const StageTracking = lazy(() => import('./pages/StageTracking').then((m) => ({ default: m.StageTracking })));
const Messages = lazy(() => import('./pages/Messages').then((m) => ({ default: m.Messages })));
const ComplaintPoolVoting = lazy(() => import('./pages/ComplaintPoolVoting').then((m) => ({ default: m.ComplaintPoolVoting })));
const ReportsAnalytics = lazy(() => import('./pages/ReportsAnalytics').then((m) => ({ default: m.ReportsAnalytics })));
const AdminSettings = lazy(() => import('./pages/AdminSettings').then((m) => ({ default: m.AdminSettings })));
const AuditLogs = lazy(() => import('./pages/AuditLogs').then((m) => ({ default: m.AuditLogs })));
const ApiSpecViewer = lazy(() => import('./pages/ApiSpecViewer').then((m) => ({ default: m.ApiSpecViewer })));

const RouteLoadingFallback = () => (
  <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-8 text-center text-[#4B5565] animate-pulse space-y-2">
    <div className="w-8 h-8 rounded-full border-2 border-[#C2570C] border-t-transparent animate-spin mx-auto" />
    <p className="text-xs font-semibold">Loading official workspace component...</p>
  </div>
);

export interface AdminPortalProps {
  onExitAdmin?: () => void;
  officerInfo?: {
    name: string;
    role: string;
    institution?: string;
    rollOrId?: string;
  } | null;
  initialRoute?: string;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onExitAdmin, officerInfo, initialRoute }) => {
  return (
    <AppProvider onExitAdmin={onExitAdmin} officerInfo={officerInfo}>
      <MemoryRouter initialEntries={[initialRoute || '/']}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<AdminShell />}>
              <Route index element={<Dashboard />} />
              <Route path="cases" element={<AllCases />} />
              <Route path="cases/:id" element={<CaseDetail />} />
              <Route path="verification" element={<VerificationQueue />} />
              <Route path="institutions" element={<InstitutionDirectory />} />
              <Route path="origin-explorer" element={<OriginExplorer />} />
              <Route path="coordination" element={<RelatedCasesCoordination />} />
              <Route path="related-cases" element={<Navigate to="/coordination" replace />} />
              <Route path="resolution-proofs" element={<ResolutionProofReview />} />
              <Route path="stage-tracking" element={<StageTracking />} />
              <Route path="messages" element={<Messages />} />
              <Route path="complaint-pool" element={<ComplaintPoolVoting />} />
              <Route path="reports" element={<ReportsAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="api-spec" element={<ApiSpecViewer />} />
              <Route
                path="*"
                element={
                  <div className="bg-white border border-[#CBD2DC] rounded-[8px] p-12 text-center text-[#4B5565] space-y-2">
                    <h2 className="text-lg font-bold text-[#0B2A5B]">404 - Workspace Not Found</h2>
                    <p className="text-xs">The requested administrative route does not exist.</p>
                  </div>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </MemoryRouter>
    </AppProvider>
  );
};

export default AdminPortal;
