import React from 'react';
import { Outlet } from 'react-router-dom';
import { HeaderStrip } from './HeaderStrip';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { GovFooter } from './GovFooter';
import { ToastContainer } from '../design-system/ToastContainer';

export const AdminShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary,#F8FAFC)] text-[var(--text-primary,#0F172A)] overflow-x-hidden max-w-full">
      {/* Official Government Top Bar & Brand Header */}
      <HeaderStrip />

      {/* Responsive Shell: Stacks into single-column on mobile (< 768px) and multi-column on desktop (>= 768px) */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-full min-h-0">
        {/* Sticky official sidebar */}
        <Sidebar />

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-y-auto">
          {/* Top Bar with title, search, breadcrumbs, profile */}
          <TopBar />

          {/* Main workspace area */}
          <main id="main-content" tabIndex={-1} className="flex-1 p-4 md:p-6 outline-none max-w-[1600px] w-full mx-auto">
            <Outlet />
          </main>

          {/* Official GIGW Government Footer */}
          <GovFooter />
        </div>
      </div>

      {/* Accessible Notifications Container */}
      <ToastContainer />
    </div>
  );
};
