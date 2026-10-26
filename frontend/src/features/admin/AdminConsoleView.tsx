// ==========================================================================
// NIVARAN · Master Admin Console Controller (AdminConsoleView.tsx)
// Renders the 13 official redressal screens within AdminLayout
// ==========================================================================

import React, { useState } from 'react';
import { AdminLayout, AdminScreenKey } from './AdminLayout';
import { DashboardView } from './DashboardView';
import { AllCasesView } from './AllCasesView';
import { AdminCaseDetailsView } from './AdminCaseDetailsView';
import { PotentialOverlapsView } from './PotentialOverlapsView';
import { InstitutionDirectoryView } from './InstitutionDirectoryView';
import { BureauWorkloadView } from './BureauWorkloadView';
import { ResolutionProofReviewView } from './ResolutionProofReviewView';
import { StageEscalationsView } from './StageEscalationsView';
import { AuditVerificationView } from './AuditVerificationView';
import {
  VerificationQueueView,
  ReportsAnalyticsView,
  MessagesRequestsView,
  CohortRemediesView,
  SettingsView
} from './RemainingAdminViews';

export const AdminConsoleView: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AdminScreenKey>('dashboard');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [filterPreset, setFilterPreset] = useState<any>(null);

  const handleSelectScreen = (screen: AdminScreenKey, preset?: any) => {
    setActiveCaseId(null);
    setCurrentScreen(screen);
    setFilterPreset(preset || null);
  };

  const handleOpenCase = (caseId: string) => {
    setActiveCaseId(caseId);
  };

  return (
    <AdminLayout currentScreen={currentScreen} onSelectScreen={handleSelectScreen}>
      {activeCaseId ? (
        <AdminCaseDetailsView
          caseId={activeCaseId}
          onBack={() => setActiveCaseId(null)}
          onNavigateScreen={handleSelectScreen}
        />
      ) : (
        <>
          {currentScreen === 'dashboard' && (
            <DashboardView
              onNavigateScreen={handleSelectScreen}
              onOpenCase={handleOpenCase}
            />
          )}

          {currentScreen === 'all-cases' && (
            <AllCasesView
              onOpenCase={handleOpenCase}
              presetFilters={filterPreset}
            />
          )}

          {currentScreen === 'verification' && (
            <VerificationQueueView onOpenCase={handleOpenCase} />
          )}

          {currentScreen === 'overlaps' && <PotentialOverlapsView />}

          {currentScreen === 'institutions' && <InstitutionDirectoryView />}

          {currentScreen === 'workload' && <BureauWorkloadView />}

          {currentScreen === 'escalations' && (
            <StageEscalationsView onOpenCase={handleOpenCase} />
          )}

          {currentScreen === 'proof-review' && <ResolutionProofReviewView />}

          {currentScreen === 'reports' && <ReportsAnalyticsView />}

          {currentScreen === 'audit-logs' && <AuditVerificationView />}

          {currentScreen === 'messages' && <MessagesRequestsView />}

          {currentScreen === 'cohort-remedies' && <CohortRemediesView />}

          {currentScreen === 'settings' && <SettingsView />}
        </>
      )}
    </AdminLayout>
  );
};
