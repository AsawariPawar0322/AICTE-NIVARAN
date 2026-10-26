// ==========================================================================
// NIVARAN · Application Shell (Shell.tsx)
// Provides Header, GIGW Breadcrumbs, main landmark, and Footer
// ==========================================================================

import React from 'react';
import { useApp } from './AppProviders';
import { ROUTES } from './router';
import { Header } from './Header';
import { Footer } from './Footer';

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTab, navigateToTab } = useApp();
  const route = ROUTES[activeTab] || ROUTES.home;

  const showBreadcrumbs = activeTab !== 'home' && activeTab !== 'admin';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* GIGW Accessible Breadcrumbs */}
      {showBreadcrumbs && (
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: 'var(--sp-2) var(--sp-6)',
            fontSize: 'var(--fs-xs)'
          }}
        >
          <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            {route.breadcrumb.map((crumb, idx) => {
              const isLast = idx === route.breadcrumb.length - 1;
              return (
                <React.Fragment key={crumb}>
                  {idx > 0 && <span style={{ color: 'var(--border)' }}>/</span>}
                  {isLast ? (
                    <span style={{ fontWeight: 700, color: 'var(--navy-900)' }} aria-current="page">
                      {crumb}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigateToTab(idx === 0 ? 'home' : (activeTab as any))}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'var(--link)',
                        cursor: 'pointer',
                        fontSize: 'inherit'
                      }}
                    >
                      {crumb}
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Landmark */}
      <main id="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      <Footer />
    </div>
  );
};
