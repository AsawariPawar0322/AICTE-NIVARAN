// ==========================================================================
// NIVARAN · Master Application Context & Providers (AppProviders.tsx)
// Fixes Defect D1 (Chat open after logout), D6 (Sign out click), D8 (Toasts)
// ==========================================================================

import React, { useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Complaint, Institution, NavTab } from '../domain/types';
import { getComplaints } from '../api/complaints';
import { getInstitutions } from '../api/institutions';
import { DEMO_USERS } from '../api/mockStore';
import { ROUTES, getActiveTabFromHash } from './router';
import { I18nProvider } from '../i18n/context';
import { ToastProvider, useToast } from '../ui/Toast';
import { AppContext, AppContextType } from './AppContext';
export type { AppContextType };

const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { error, info } = useToast();

  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('nivaran_current_user_v2');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTabState] = useState<NavTab>(getActiveTabFromHash);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(() => {
    return localStorage.getItem('nivaran_selected_case') || 'NIV-2026-1042';
  });

  const [complaints, setComplaints] = useState<Complaint[]>(getComplaints);
  const [institutions, setInstitutions] = useState<Institution[]>(getInstitutions);

  // Defect D1: Floating chat must never remain open after sign-out or for visitors
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

  const refreshData = useCallback(() => {
    setComplaints([...getComplaints()]);
    setInstitutions([...getInstitutions()]);
  }, []);

  const setCurrentUser = useCallback((user: UserProfile | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('nivaran_current_user_v2', JSON.stringify(user));
    } else {
      localStorage.removeItem('nivaran_current_user_v2');
      // D1 Fix: Close chat, clear selected complaint on sign-out
      setIsFloatingChatOpen(false);
      setSelectedComplaintId(null);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsFloatingChatOpen(false);
    setSelectedComplaintId(null);
    window.location.hash = '#home';
    setActiveTabState('home');
    info('Signed out successfully.');
  }, [setCurrentUser, info]);

  const loginAs = useCallback((userKey: keyof typeof DEMO_USERS) => {
    const user = DEMO_USERS[userKey];
    if (user) {
      setCurrentUser(user);
      info(`Signed in as ${user.name} (${user.role})`);
      if (user.portalType === 'official') {
        window.location.hash = '#admin';
        setActiveTabState('admin');
      } else {
        window.location.hash = '#my-complaints';
        setActiveTabState('my-complaints');
      }
    }
  }, [setCurrentUser, info]);

  const navigateToTab = useCallback((tab: NavTab, options?: { complaintId?: string }) => {
    if (options?.complaintId) {
      setSelectedComplaintId(options.complaintId);
      localStorage.setItem('nivaran_selected_case', options.complaintId);
    }

    const route = ROUTES[tab];
    // Guard protected routes
    if (route.roleRequired === 'official' && (!currentUser || currentUser.portalType !== 'official')) {
      error('Access restricted to verified AICTE Redressal Officers.');
      window.location.hash = '#admin-login';
      setActiveTabState('admin-login');
      return;
    }

    if (route.roleRequired === 'citizen' && (!currentUser || currentUser.portalType !== 'citizen')) {
      error('Please sign in to access your Citizen Grievance Portal.');
      window.location.hash = '#citizen-login';
      setActiveTabState('citizen-login');
      return;
    }

    window.location.hash = `#${tab}`;
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentUser, error]);

  // Sync hash routing with browser forward/back buttons
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = getActiveTabFromHash();
      setActiveTabState(currentHash);
      const route = ROUTES[currentHash];
      if (route) {
        document.title = route.title;
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginAs,
        logout,
        activeTab,
        navigateToTab,
        selectedComplaintId,
        setSelectedComplaintId,
        complaints,
        institutions,
        refreshData,
        isFloatingChatOpen,
        setIsFloatingChatOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <I18nProvider>
      <ToastProvider>
        <AppContextProvider>{children}</AppContextProvider>
      </ToastProvider>
    </I18nProvider>
  );
};

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProviders');
  }
  return ctx;
}
