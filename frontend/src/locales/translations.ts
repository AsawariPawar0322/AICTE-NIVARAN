// ==========================================================================
// AICTE Grievance Coordination System · Bilingual Dictionary (EN / HI)
// ==========================================================================

export type Language = 'en' | 'hi';

export const translations = {
  en: {
    // Header & Meta
    govIndia: 'Government of India',
    ministry: 'Ministry of Education',
    aicteName: 'All India Council for Technical Education',
    portalTitle: 'AICTE NIVARAN · Central Redressal System',
    projectName: 'AICTE NIVARAN',
    motto: 'योगः कर्मसु कौशलम्',
    tagline: 'Single front door for student, faculty and parent grievance redressal across India',
    skipToContent: 'Skip to main content',
    screenReader: 'Screen Reader Access',
    emergencyHelplines: 'Emergency Helplines',
    antiRaggingHelpline: 'Anti-Ragging: 1800-180-5522',
    womenHelpline: 'Women In Distress: 1091',
    cyberHelpline: 'Cyber Fraud: 1930',

    // Role Switch
    complainantRole: 'Complainant (Student / Parent / Faculty)',
    officialRole: 'AICTE Official / Institute Nodal Officer',

    // Nav
    navHome: 'Home',
    navDashboard: 'User Dashboard',
    navFileComplaint: 'File a Complaint',
    navTrack: 'Track Status & Stages',
    navChat: 'Official Chatbox',
    navDiscord: 'Discord Community Hub',
    navGuidelines: 'AICTE Regulations',

    // Home Hero
    heroTitle: 'Resolving Academic Grievances with Complete Transparency',
    heroSubtitle: 'Every complaint is tracked across 6 clear stages, backed by cryptographic evidence hashing and citizen OTP-verified closure.',
    searchPlaceholder: 'Search by College Name, City or AICTE Permanent ID (e.g. 1-10972341)...',
    voiceSearchTooltip: 'Click to speak or search college',
    findInstituteBtn: 'Find Institute',

    // Action Cards
    fileCardTitle: 'File a Complaint',
    fileCardDesc: 'Submit an academic, fee, ragging or infrastructure issue in 5 guided steps. 100% confidential option available.',
    fileCardBtn: 'File Complaint Now',

    // Track Card
    trackCardTitle: 'Track Existing Case',
    trackCardDesc: 'Instant status lookup, live SLA countdown timer, and Citizen OTP acknowledgment for resolved matters.',
    trackCardBtn: 'Track by Case ID',

    // 3-Step Explainer
    step1Title: '1. Register & Submit Proof',
    step1Desc: 'Upload evidence with automated cryptographic SHA-256 hash stamp to prevent document tampering.',
    step2Title: '2. Multi-Bureau Investigation',
    step2Desc: 'Assigned to AICTE Regional Bureau or Institute Nodal Officer with a strict 72-hour initial response SLA.',
    step3Title: '3. Citizen OTP Closure',
    step3Desc: 'No official can close a case unilaterally. Closure requires your mobile OTP verification of satisfaction.',

    // Categories
    categoriesTitle: 'Redressal Categories with Dedicated Desks',
    catFees: 'Fee Refund & Excess Charges',
    catRagging: 'Anti-Ragging & Harassment',
    catScholarship: 'AICTE Pragati / Saksham / PMSSS',
    catHarassment: 'Internal Complaints Committee (ICC)',
    catFaculty: 'Faculty & Lab Infrastructure',
    catAdmission: 'Admissions, Marks & Certificates',

    // Stats
    statResolved: '14,890+',
    statResolvedLabel: 'Cases Successfully Resolved',
    statSla: '48.4 Hours',
    statSlaLabel: 'Average First-Response SLA',
    statInstitutes: '12,450+',
    statInstitutesLabel: 'AICTE Approved Colleges Connected',
    statSatisfaction: '96.2%',
    statSatisfactionLabel: 'Citizen OTP Satisfaction Rate',

    // Common
    loading: 'Loading...',
    submit: 'Submit',
    cancel: 'Cancel',
    back: 'Back',
    next: 'Next Step',
    step: 'Step',
    of: 'of',
  },
  hi: {
    // Header & Meta
    govIndia: 'भारत सरकार',
    ministry: 'शिक्षा मंत्रालय',
    aicteName: 'अखिल भारतीय तकनीकी शिक्षा परिषद',
    portalTitle: 'एआईसीटीई निवारण (AICTE NIVARAN)',
    projectName: 'एआईसीटीई निवारण',
    motto: 'योगः कर्मसु कौशलम्',
    tagline: 'भारत भर के सभी एआईसीटीई अनुमोदित संस्थानों के लिए एकल शिकायत निवारण द्वार',
    skipToContent: 'मुख्य सामग्री पर जाएं',
    screenReader: 'स्क्रीन रीडर एक्सेस',
    emergencyHelplines: 'आपातकालीन हेल्पलाइन',
    antiRaggingHelpline: 'एंटी-रैगिंग: 1800-180-5522',
    womenHelpline: 'महिला हेल्पलाइन: 1091',
    cyberHelpline: 'साइबर अपराध: 1930',

    // Role Switch
    complainantRole: 'शिकायतकर्ता (छात्र / अभिभावक / शिक्षक)',
    officialRole: 'एआईसीटीई अधिकारी / नोडल अधिकारी',

    // Nav
    navHome: 'होम',
    navDashboard: 'यूजर डैशबोर्ड',
    navFileComplaint: 'शिकायत दर्ज करें',
    navTrack: 'स्थिति एवं चरण ट्रैक करें',
    navChat: 'अधिकारी चैटबॉक्स',
    navDiscord: 'डिस्कॉर्ड समन्वय केंद्र',
    navGuidelines: 'एआईसीटीई नियम',

    // Home Hero
    heroTitle: 'पूर्ण पारदर्शिता के साथ शैक्षणिक शिकायतों का समाधान',
    heroSubtitle: 'प्रत्येक शिकायत 6 चरणों में ट्रैक की जाती है, साक्ष्य की अखंडता हैशिंग और नागरिक ओटीपी सत्यापन द्वारा सत्यापित होती है।',
    searchPlaceholder: 'कॉलेज का नाम, शहर या एआईसीटीई स्थायी आईडी खोजें...',
    voiceSearchTooltip: 'बोलकर या टाइप करके संस्थान खोजें',
    findInstituteBtn: 'संस्थान खोजें',

    // Action Cards
    fileCardTitle: 'शिकायत दर्ज करें',
    fileCardDesc: '5 चरणों में शैक्षणिक, शुल्क, रैगिंग या बुनियादी ढांचे की समस्या दर्ज करें। पूर्णतः गोपनीय विकल्प उपलब्ध।',
    fileCardBtn: 'अब शिकायत दर्ज करें',

    // Track Card
    trackCardTitle: 'शिकायत की स्थिति जांचें',
    trackCardDesc: 'तुरंत स्थिति, 72 घंटे की समय सीमा उल्टी गिनती, और समाधान के लिए नागरिक ओटीपी सत्यापन।',
    trackCardBtn: 'केस आईडी से ट्रैक करें',

    // 3-Step Explainer
    step1Title: '1. साक्ष्य के साथ पंजीकरण',
    step1Desc: 'दस्तावेजों में किसी भी छेड़छाड़ को रोकने के लिए SHA-256 क्रिप्टोग्राफिक हैश के साथ साक्ष्य अपलोड करें।',
    step2Title: '2. त्वरित जांच व समन्वय',
    step2Desc: '72 घंटे के कड़े एसएलए के साथ संबंधित क्षेत्रीय ब्यूरो या कॉलेज नोडल अधिकारी को आवंटन।',
    step3Title: '3. नागरिक ओटीपी द्वारा अंतिम समाधान',
    step3Desc: 'कोई भी अधिकारी एकतरफा केस बंद नहीं कर सकता। केस बंद करने के लिए आपके मोबाइल ओटीपी की आवश्यकता है।',

    // Categories
    categoriesTitle: 'विशेष डेस्क वाली शिकायत श्रेणियां',
    catFees: 'शुल्क वापसी एवं अतिरिक्त शुल्क',
    catRagging: 'रैगिंग रोकथाम एवं उत्पीड़न',
    catScholarship: 'प्रगति / सक्षम / पीएमएसएसएस छात्रवृत्ति',
    catHarassment: 'आंतरिक शिकायत समिति (आईसीसी)',
    catFaculty: 'शिक्षक एवं प्रयोगशाला अवसंरचना',
    catAdmission: 'प्रवेश, अंकतालिका एवं प्रमाण पत्र',

    // Stats
    statResolved: '14,890+',
    statResolvedLabel: 'सफलतापूर्वक निस्तारित मामले',
    statSla: '48.4 घंटे',
    statSlaLabel: 'औसत प्रथम प्रतिक्रिया समय',
    statInstitutes: '12,450+',
    statInstitutesLabel: 'संबद्ध एआईसीटीई संस्थान',
    statSatisfaction: '96.2%',
    statSatisfactionLabel: 'नागरिक संतुष्टि दर (ओटीपी आधारित)',

    // Common
    loading: 'लोड हो रहा है...',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    back: 'पीछे जाएं',
    next: 'अगला चरण',
    step: 'चरण',
    of: 'का',
  }
};
