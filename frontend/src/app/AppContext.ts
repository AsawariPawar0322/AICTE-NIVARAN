// ==========================================================================
// NIVARAN · Singleton Application Context (AppContext.ts)
// Separated to prevent Vite Fast Refresh Context desynchronization
// ==========================================================================

import { createContext } from 'react';
import { UserProfile, Complaint, Institution, NavTab } from '../domain/types';
import { DEMO_USERS } from '../api/mockStore';

export interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  loginAs: (userKey: keyof typeof DEMO_USERS) => void;
  logout: () => void;

  activeTab: NavTab;
  navigateToTab: (tab: NavTab, options?: { complaintId?: string }) => void;

  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;

  complaints: Complaint[];
  institutions: Institution[];
  refreshData: () => void;

  isFloatingChatOpen: boolean;
  setIsFloatingChatOpen: (open: boolean) => void;
}

export const AppContext = createContext<AppContextType | null>(null);
