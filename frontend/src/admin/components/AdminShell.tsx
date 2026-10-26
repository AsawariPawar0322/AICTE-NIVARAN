import React from 'react';
import { Outlet } from 'react-router-dom';
import { HeaderStrip } from './HeaderStrip';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { GovFooter } from './GovFooter';
import { ToastContainer } from '../design-system/ToastContainer';

export const AdminShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F5F8] text-[#1A1F2B]">
      {/* Official Government Top Bar & Brand Header */}
      <HeaderStrip />

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible official sidebar */}
        <Sidebar />

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
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
