import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';
export type TextSize = 'sm' | 'md' | 'lg';

export interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeOfficer: {
    name: string;
    role: string;
    bureau: string;
    email: string;
  };
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  t: (key: string) => string;
  onExitAdmin?: () => void;
}

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Header & Brand
    gov_of_india: 'Government of India',
    ministry_of_edu: 'Ministry of Education',
    screen_reader: 'Screen Reader Access',
    contrast_toggle: 'Contrast',
    official_portal_title: 'Centralized Grievance Redressal & Monitoring Portal',
    official_portal_acronym: 'AICTE NIVARAN',
    project_name: 'AICTE NIVARAN',
    aicte_full_name: 'All India Council for Technical Education',
    aicte_hindi_name: 'अखिल भारतीय तकनीकी शिक्षा परिषद',
    aicte_tagline: 'A Statutory Body of the Government of India',
    satyameva_jayate: 'Satyameva Jayate',
    portal_subheading: 'AICTE NIVARAN · Central Bureau Redressal & Coordination Desk',
    prototype_badge: 'OFFICIAL GOVERNMENT PORTAL',
    skip_to_content: 'Skip to main content',
    search_placeholder: 'Search by Case ID, Institution, or Permanent ID...',

    // Navigation
    nav_dashboard: 'Dashboard',
    nav_cases: 'All Cases',
    nav_verification: 'Review Queue',
    nav_institutions: 'Colleges',
    nav_origin_explorer: 'Map View',
    nav_coordination: 'Similar Cases',
    nav_resolution_proofs: 'Resolution Proofs',
    nav_stage_tracking: 'Timeline',
    nav_messages: 'Messages',
    nav_complaint_pool: 'Pooled Cases',
    nav_reports: 'Reports',
    nav_settings: 'Settings',
    nav_audit_logs: 'Audit Logs',

    // Dashboard metrics
    metric_new: 'New Cases',
    metric_assigned: 'Assigned to Me',
    metric_due_soon: 'Due in 3 Days',
    metric_overdue: 'Overdue Cases',
    metric_resolved: 'Resolved Cases',

    // Statuses
    status_registered: 'Registered',
    status_under_review: 'Under Review',
    status_info_requested: 'Info Requested',
    status_assigned: 'Assigned',
    status_action_in_progress: 'Action in Progress',
    status_escalated: 'Escalated',
    status_resolved: 'Resolved',
    status_rejected: 'Rejected',

    // Common actions
    action_request_info: 'Request Information',
    action_update_progress: 'Update Progress',
    action_transfer: 'Transfer Bureau',
    action_escalate: 'Escalate Case',
    action_record_decision: 'Record Decision',
    action_export_csv: 'Export CSV',
    action_view_details: 'View Details',
    action_cancel: 'Cancel',
    action_submit: 'Submit Decision',
    action_add_note: 'Add Note',
  },
  hi: {
    // Header & Brand
    gov_of_india: 'भारत सरकार',
    ministry_of_edu: 'शिक्षा मंत्रालय',
    screen_reader: 'स्क्रीन रीडर एक्सेस',
    contrast_toggle: 'कंट्रास्ट',
    official_portal_title: 'केंद्रीकृत लोक शिकायत निवारण एवं निगरानी पोर्टल',
    official_portal_acronym: 'एआईसीटीई निवारण',
    project_name: 'एआईसीटीई निवारण',
    aicte_full_name: 'अखिल भारतीय तकनीकी शिक्षा परिषद',
    aicte_hindi_name: 'अखिल भारतीय तकनीकी शिक्षा परिषद',
    aicte_tagline: 'भारत सरकार का एक सांविधिक निकाय',
    satyameva_jayate: 'सत्यमेव जयते',
    portal_subheading: 'एआईसीटीई निवारण · एकीकृत शिकायत समन्वय एवं समाधान व्यवस्था',
    prototype_badge: 'आधिकारिक सरकारी पोर्टल',
    skip_to_content: 'मुख्य सामग्री पर जाएं',
    search_placeholder: 'शिकायत संख्या, संस्थान या स्थायी आईडी द्वारा खोजें...',

    // Navigation
    nav_dashboard: 'डैशबोर्ड',
    nav_cases: 'सभी मामले',
    nav_verification: 'सत्यापन',
    nav_institutions: 'कॉलेज सूची',
    nav_origin_explorer: 'मानचित्र दृश्य',
    nav_coordination: 'समान मामले',
    nav_resolution_proofs: 'समाधान प्रमाण',
    nav_stage_tracking: 'समयरेखा',
    nav_messages: 'संदेश',
    nav_complaint_pool: 'पूल मामले',
    nav_reports: 'रिपोर्ट',
    nav_settings: 'सेटिंग्स',
    nav_audit_logs: 'ऑडिट लॉग',

    // Dashboard metrics
    metric_new: 'नए मामले',
    metric_assigned: 'मुझे सौंपे गए',
    metric_due_soon: '3 दिनों में देय',
    metric_overdue: 'समय-सीमा पार (अतिदेय)',
    metric_resolved: 'निस्तारित मामले',

    // Statuses
    status_registered: 'पंजीकृत',
    status_under_review: 'समीक्षाधीन',
    status_info_requested: 'जानकारी मांगी गई',
    status_assigned: 'अधिकारी को सौंपा गया',
    status_action_in_progress: 'कार्रवाई प्रगति पर',
    status_escalated: 'उच्च स्तर पर प्रेषित',
    status_resolved: 'सफलतापूर्वक निस्तारित',
    status_rejected: 'अस्वीकृत',

    // Common actions
    action_request_info: 'जानकारी का अनुरोध करें',
    action_update_progress: 'प्रगति अद्यतन करें',
    action_transfer: 'ब्यूरो स्थानांतरित करें',
    action_escalate: 'मामला उच्चाधिकारी को भेजें',
    action_record_decision: 'अंतिम निर्णय दर्ज करें',
    action_export_csv: 'सीएसवी निर्यात',
    action_view_details: 'विवरण देखें',
    action_cancel: 'रद्द करें',
    action_submit: 'निर्णय सुरक्षित करें',
    action_add_note: 'टिप्पणी जोड़ें',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export interface AppProviderProps {
  children: React.ReactNode;
  onExitAdmin?: () => void;
  officerInfo?: {
    name: string;
    role: string;
    institution?: string;
    rollOrId?: string;
  } | null;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, onExitAdmin, officerInfo }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('aicte_lang') as Language) || 'en';
  });

  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    return (localStorage.getItem('aicte_text_size') as TextSize) || 'md';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('aicte_sidebar_collapsed') === 'true';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('aicte_contrast') === 'high';
  });

  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      const next = !prev;
      localStorage.setItem('aicte_contrast', next ? 'high' : 'normal');
      if (next) {
        document.documentElement.classList.add('contrast-more');
      } else {
        document.documentElement.classList.remove('contrast-more');
      }
      return next;
    });
  };

  const [toasts, setToasts] = useState<ToastNotification[]>([
    {
      id: 'welcome-toast',
      type: 'info',
      title: 'Official Session Initialized',
      message: `Logged in as ${officerInfo?.name || 'Dr. Ramesh Chandra Verma'}. Live AICTE Coordination Desk Active.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const activeOfficer = officerInfo ? {
    name: officerInfo.name,
    role: officerInfo.role,
    bureau: officerInfo.institution || 'Grievance Coordination Bureau',
    email: `${officerInfo.name.toLowerCase().replace(/[^a-z]/g, '.')}@aicte-india.org`,
  } : {
    name: 'Dr. Ramesh Chandra Verma',
    role: 'Director, PGRC',
    bureau: 'Public Grievance Redressal Cell (PGRC)',
    email: 'ramesh.verma@aicte-india.org',
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('aicte_lang', lang);
    document.documentElement.lang = lang;
  };

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    localStorage.setItem('aicte_text_size', size);
    const root = document.documentElement;
    if (size === 'sm') root.style.setProperty('--text-scale', '0.92');
    else if (size === 'md') root.style.setProperty('--text-scale', '1');
    else if (size === 'lg') root.style.setProperty('--text-scale', '1.15');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('aicte_sidebar_collapsed', String(next));
      return next;
    });
  };

  const addToast = (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastNotification = {
      ...toast,
      id,
      timestamp: new Date().toLocaleTimeString(),
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    // Accessible auto-dismiss after 8 seconds (complies with rule: not auto-dismissed under 6s)
    setTimeout(() => {
      removeToast(id);
    }, 8000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
    if (textSize === 'sm') document.documentElement.style.setProperty('--text-scale', '0.92');
    else if (textSize === 'lg') document.documentElement.style.setProperty('--text-scale', '1.15');
    else document.documentElement.style.setProperty('--text-scale', '1');

    if (highContrast) {
      document.documentElement.classList.add('contrast-more');
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        textSize,
        setTextSize,
        highContrast,
        toggleHighContrast,
        isSidebarCollapsed,
        toggleSidebar,
        activeOfficer,
        toasts,
        addToast,
        removeToast,
        t,
        onExitAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
