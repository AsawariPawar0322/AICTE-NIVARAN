// ==========================================================================
// NIVARAN · Typed Route Registry & Guards (router.ts)
// ==========================================================================

import { NavTab, RouteMeta } from '../domain/types';

export const ROUTES: Record<NavTab, RouteMeta> = {
  home: {
    tab: 'home',
    title: 'AICTE NIVARAN · Unified Technical Grievance Coordination Portal',
    roleRequired: 'any',
    breadcrumb: ['Home']
  },
  submit: {
    tab: 'submit',
    title: 'File a Grievance Docket · AICTE NIVARAN',
    roleRequired: 'any',
    breadcrumb: ['Home', 'File a Complaint']
  },
  'my-complaints': {
    tab: 'my-complaints',
    title: 'My Complaints · Citizen Grievance Dashboard',
    roleRequired: 'citizen',
    breadcrumb: ['Home', 'Citizen Portal', 'My Complaints']
  },
  'complaint-detail': {
    tab: 'complaint-detail',
    title: 'Docket Inspection & Event Timeline · AICTE NIVARAN',
    roleRequired: 'any',
    breadcrumb: ['Home', 'Grievance Docket']
  },
  track: {
    tab: 'track',
    title: 'Track Grievance Docket · Public Verification',
    roleRequired: 'any',
    breadcrumb: ['Home', 'Track a Docket']
  },
  discovery: {
    tab: 'discovery',
    title: 'Similar Complaint Discovery Engine · AICTE NIVARAN',
    roleRequired: 'any',
    breadcrumb: ['Home', 'Similar Complaints']
  },
  'resolution-confirm': {
    tab: 'resolution-confirm',
    title: 'Action Taken Report (ATR) Citizen Confirmation',
    roleRequired: 'citizen',
    breadcrumb: ['Home', 'My Complaints', 'Confirm Resolution']
  },
  admin: {
    tab: 'admin',
    title: 'Official Redressal & Accountability Console · AICTE NIVARAN',
    roleRequired: 'official',
    breadcrumb: ['Home', 'Official Console']
  },
  hub: {
    tab: 'hub',
    title: 'Inter-Bureau Grievance Coordination Hub · AICTE NIVARAN',
    roleRequired: 'any',
    breadcrumb: ['Home', 'Inter-Bureau Hub']
  },
  'citizen-login': {
    tab: 'citizen-login',
    title: 'Citizen Portal Sign In · AICTE NIVARAN',
    roleRequired: 'any',
    breadcrumb: ['Home', 'Citizen Sign In']
  },
  'admin-login': {
    tab: 'admin-login',
    title: 'Official Console Sign In · AICTE Redressal Officers',
    roleRequired: 'any',
    breadcrumb: ['Home', 'Official Sign In']
  },
  ui: {
    tab: 'ui',
    title: 'Design System & Component Library Gallery · NIVARAN #ui',
    roleRequired: 'any',
    breadcrumb: ['Home', 'UI Catalog']
  }
};

export function getActiveTabFromHash(): NavTab {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (hash in ROUTES) {
    return hash as NavTab;
  }
  return 'home';
}
