import { create } from 'zustand';

type Language = 'en' | 'ar';

interface Translation {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const translations: Translation = {
  dashboard: {
    en: 'Dashboard',
    ar: 'لوحة القيادة',
  },
  failed_to_load_report: {
    en: 'Failed to load report.',
    ar: 'فشل تحميل التقرير.',
  },
  doctor_report: {
    en: 'Doctor Report',
    ar: 'تقرير الطبيب',
  },
  not_available: {
    en: 'N/A',
    ar: 'غير متاح',
  },
  loading_dashboard: {
    en: 'Loading Dashboard...',
    ar: 'جاري تحميل لوحة القيادة...',
  },
  error_loading_dashboard: {
    en: 'Error loading dashboard',
    ar: 'خطأ في تحميل لوحة القيادة',
  },
  patient_dashboard: {
    en: 'Patient Dashboard',
    ar: 'لوحة تحكم المريض',
  },
  disease_status: {
    en: 'Disease Status',
    ar: 'حالة المرض',
  },
  latest_scan: {
    en: 'Latest Scan',
    ar: 'آخر فحص',
  },
  no_scans_yet: {
    en: 'No scans yet',
    ar: 'لا توجد فحوصات بعد',
  },
  next_follow_up: {
    en: 'Next Follow-up',
    ar: 'المتابعة التالية',
  },
  not_scheduled: {
    en: 'Not scheduled',
    ar: 'غير مجدول',
  },
  not_enough_data: {
    en: 'Not enough data',
    ar: 'لا توجد بيانات كافية',
  },
  today_is_your_follow_up: {
    en: 'Today is your follow-up!',
    ar: 'اليوم هو موعد متابعتك!',
  },
  in_x_days: {
    en: 'In {{days}} day(s)',
    ar: 'في {{days}} يوم(أيام)',
  },
  was_x_days_ago: {
    en: 'Was {{days}} day(s) ago',
    ar: 'كان قبل {{days}} يوم(أيام)',
  },
  follow_up_reminder: {
    en: 'Reminder: Your follow-up is within 7 days!',
    ar: 'تذكير: موعد متابعتك خلال 7 أيام!',
  },
  medical_history: {
    en: 'Medical History',
    ar: 'التاريخ الطبي',
  },
  saving: {
    en: 'Saving...',
    ar: 'جاري الحفظ...',
  },
  save: {
    en: 'Save',
    ar: 'حفظ',
  },
  edit_medical_history: {
    en: 'Edit Medical History',
    ar: 'تعديل التاريخ الطبي',
  },
  edit: {
    en: 'Edit',
    ar: 'تعديل',
  },
  existing_conditions: {
    en: 'Existing Conditions',
    ar: 'الحالات الموجودة',
  },
  select_condition: {
    en: 'Select condition',
    ar: 'اختر حالة',
  },
  other: {
    en: 'Other',
    ar: 'أخرى',
  },
  please_specify: {
    en: 'Please specify',
    ar: 'يرجى التحديد',
  },
  none_reported: {
    en: 'None reported',
    ar: 'لم يتم الإبلاغ عن شيء',
  },
  chronic_diseases: {
    en: 'Chronic Diseases',
    ar: 'الأمراض المزمنة',
  },
  previous_eye_conditions: {
    en: 'Previous Eye Conditions',
    ar: 'حالات العين السابقة',
  },
  previous_ocular_surgeries: {
    en: 'Previous Ocular Surgeries',
    ar: 'العمليات الجراحية السابقة في العين',
  },
  select_surgery: {
    en: 'Select surgery',
    ar: 'اختر جراحة',
  },
  family_history_eye_diseases: {
    en: 'Family History with Eye Diseases',
    ar: 'تاريخ العائلة مع أمراض العيون',
  },
  select_disease: {
    en: 'Select disease',
    ar: 'اختر مرض',
  },
  last_checkup: {
    en: 'Last Checkup',
    ar: 'آخر فحص',
  },
  no_record: {
    en: 'No record',
    ar: 'لا يوجد سجل',
  },
  oct_scan_history: {
    en: 'OCT Scan History',
    ar: 'سجل فحوصات OCT',
  },
  oct_scan_from: {
    en: 'OCT Scan from',
    ar: 'فحص OCT من',
  },
  delete_scan: {
    en: 'Delete Scan',
    ar: 'حذف الفحص',
  },
  patient_health_analysis: {
    en: 'Patient Health Analysis from OCT Scans',
    ar: 'تحليل صحة المريض من فحوصات OCT',
  },
  personalized_analysis: {
    en: 'Personalized Analysis',
    ar: 'تحليل شخصي',
  },
  status: {
    en: 'Status',
    ar: 'الحالة',
  },
  analysis_description: {
    en: 'This section analyzes your overall eye health based on your uploaded OCT scans. The chart below shows how your health status has changed over time.',
    ar: 'يحلل هذا القسم صحة عينيك بشكل عام بناءً على فحوصات OCT التي قمت بتحميلها. يوضح الرسم البياني أدناه كيف تغيرت حالتك الصحية بمرور الوقت.',
  },
  poor: {
    en: 'Poor',
    ar: 'ضعيف',
  },
  fair: {
    en: 'Fair',
    ar: 'مقبول',
  },
  moderate: {
    en: 'Moderate',
    ar: 'متوسط',
  },
  good: {
    en: 'Good',
    ar: 'جيد',
  },
  excellent: {
    en: 'Excellent',
    ar: 'ممتاز',
  },
  health_status: {
    en: 'Health Status',
    ar: 'الحالة الصحية',
  },
  follow_up_appointment_reminder: {
    en: 'Your follow-up appointment is in {{days}} days. Please ensure you schedule your visit.',
    ar: 'موعد متابعتك بعد {{days}} أيام. يرجى التأكد من تحديد موعد زيارتك.',
  },
  next_follow_up_date: {
    en: 'Next Follow-up Date',
    ar: 'تاريخ المتابعة التالي',
  },
  no_follow_up_date_available: {
    en: 'No follow-up date available',
    ar: 'لا يوجد تاريخ متابعة متاح',
  },
  days_until_follow_up: {
    en: 'Days Until Follow-up',
    ar: 'الأيام المتبقية للمتابعة',
  },
  previous_diagnoses: {
    en: 'Previous Diagnoses',
    ar: 'التشخيصات السابقة',
  },
  date: {
    en: 'Date',
    ar: 'التاريخ',
  },
  disease_type: {
    en: 'Disease Type',
    ar: 'نوع المرض',
  },
  severity: {
    en: 'Severity',
    ar: 'الشدة',
  },
  confidence: {
    en: 'Confidence',
    ar: 'الثقة',
  },
  actions: {
    en: 'Actions',
    ar: 'الإجراءات',
  },
  view_report: {
    en: 'View Report',
    ar: 'عرض التقرير',
  },
  download_report: {
    en: 'Download Report',
    ar: 'تحميل التقرير',
  },
  report: {
    en: 'Report',
    ar: 'تقرير',
  },
  close: {
    en: 'Close',
    ar: 'إغلاق',
  },
  diabetes: {
    en: 'Diabetes',
    ar: 'السكري',
  },
  hypertension: {
    en: 'Hypertension',
    ar: 'ارتفاع ضغط الدم',
  },
  heart_disease: {
    en: 'Heart Disease',
    ar: 'أمراض القلب',
  },
  kidney_disease: {
    en: 'Kidney Disease',
    ar: 'أمراض الكلى',
  },
  thyroid_disorder: {
    en: 'Thyroid Disorder',
    ar: 'اضطراب الغدة الدرقية',
  },
  autoimmune_disease: {
    en: 'Autoimmune Disease',
    ar: 'أمراض المناعة الذاتية',
  },
  none: {
    en: 'None',
    ar: 'لا شيء',
  },
  asthma: {
    en: 'Asthma',
    ar: 'الربو',
  },
  arthritis: {
    en: 'Arthritis',
    ar: 'التهاب المفاصل',
  },
  glaucoma: {
    en: 'Glaucoma',
    ar: 'الجلوكوما',
  },
  cataracts: {
    en: 'Cataracts',
    ar: 'إعتام عدسة العين (الماء الأبيض)',
  },
  macular_degeneration: {
    en: 'Macular Degeneration',
    ar: 'الضمور البقعي',
  },
  diabetic_retinopathy: {
    en: 'Diabetic Retinopathy',
    ar: 'اعتلال الشبكية السكري',
  },
  retinal_detachment: {
    en: 'Retinal Detachment',
    ar: 'انفصال الشبكية',
  },
  cataract_surgery: {
    en: 'Cataract Surgery',
    ar: 'جراحة إزالة المياه البيضاء',
  },
  lasik: {
    en: 'LASIK',
    ar: 'الليزك',
  },
  vitrectomy: {
    en: 'Vitrectomy',
    ar: 'استئصال الزجاجية',
  },
  glaucoma_surgery: {
    en: 'Glaucoma Surgery',
    ar: 'جراحة الجلوكوما',
  },
  retinitis_pigmentosa: {
    en: 'Retinitis Pigmentosa',
    ar: 'التهاب الشبكية الصباغي',
  },
  diagnosis: {
    en: 'Diagnosis',
    ar: 'التشخيص'
  },
  education: {
    en: 'Education',
    ar: 'التعليم'
  },
  logout: {
    en: 'Logout',
    ar: 'تسجيل خروج'
  },
  login: {
    en: 'Login',
    ar: 'تسجيل دخول'
  },
  signup: {
    en: 'Sign Up',
    ar: 'إنشاء حساب'
  },
  appName: {
    en: 'OCT Vision AI',
    ar: 'الذكاء الاصطناعي لرؤية OCT'
  },
  heroTitle: {
    en: 'Advanced OCT Scan Analysis with AI',
    ar: 'تحليل متقدم لمسح OCT باستخدام الذكاء الاصطناعي'
  },
  heroSubtitle: {
    en: 'Detect retinal diseases early with our state-of-the-art deep learning system. Get instant, accurate diagnoses for DME, CNV, and Drusen.',
    ar: 'اكتشف أمراض الشبكية مبكرًا باستخدام نظام التعلم العميق المتطور لدينا. احصل على تشخيصات فورية ودقيقة لـ DME و CNV و Drusen.'
  },
  getStarted: {
    en: 'Get Started',
    ar: 'ابدأ الآن'
  },
  feature1Title: {
    en: 'AI-Powered Analysis',
    ar: 'تحليل مدعوم بالذكاء الاصطناعي'
  },
  feature1Description: {
    en: 'Advanced deep learning algorithms provide accurate disease detection and classification.',
    ar: 'توفر خوارزميات التعلم العميق المتقدمة كشفًا دقيقًا للأمراض وتصنيفها.'
  },
  feature2Title: {
    en: 'Secure & Private',
    ar: 'آمن و خاص'
  },
  feature2Description: {
    en: 'Your medical data is protected with enterprise-grade security and encryption.',
    ar: 'بياناتك الطبية محمية بأمان وتشفير على مستوى المؤسسات.'
  },
  feature3Title: {
    en: 'Instant Results',
    ar: 'نتائج فورية'
  },
  feature3Description: {
    en: 'Get detailed reports for both doctors and patients within seconds.',
    ar: 'احصل على تقارير مفصلة للأطباء والمرضى في غضون ثوانٍ.'
  },
  teamSectionTitle: {
    en: 'Development Team',
    ar: 'فريق التطوير'
  },
  educationCenterTitle: {
    en: 'Eye Health Education Center',
    ar: 'مركز تعليم صحة العين'
  },
  commonEyeConditionsTitle: {
    en: 'Common Eye Conditions',
    ar: 'أمراض العيون الشائعة'
  },
  commonEyeConditionsDescription: {
    en: 'Learn about various eye conditions, their symptoms, and treatment options.',
    ar: 'تعرف على أمراض العيون المختلفة وأعراضها وخيارات العلاج.'
  },
  diabeticRetinopathy: {
    en: 'Diabetic Retinopathy',
    ar: 'اعتلال الشبكية السكري'
  },
  macularDegeneration: {
    en: 'Age-related Macular Degeneration',
    ar: 'الضمور البقعي المرتبط بالعمر'
  },
  glaucoma: {
    en: 'Glaucoma',
    ar: 'الجلوكوما'
  },
  cataracts: {
    en: 'Cataracts',
    ar: 'إعتام عدسة العين (الماء الأبيض)'
  },
  preventionCareTitle: {
    en: 'Prevention & Care',
    ar: 'الوقاية والرعاية'
  },
  preventionCareDescription: {
    en: 'Discover ways to maintain healthy eyes and prevent vision problems.',
    ar: 'اكتشف طرق الحفاظ على صحة العين ومنع مشاكل الرؤية.'
  },
  regularEyeExams: {
    en: 'Regular Eye Examinations',
    ar: 'فحوصات العين المنتظمة'
  },
  properNutrition: {
    en: 'Proper Nutrition for Eye Health',
    ar: 'التغذية السليمة لصحة العين'
  },
  digitalEyeStrain: {
    en: 'Digital Eye Strain Prevention',
    ar: 'الوقاية من إجهاد العين الرقمي'
  },
  protectiveEyewear: {
    en: 'Protective Eyewear',
    ar: 'نظارات واقية'
  },
  treatmentOptionsTitle: {
    en: 'Treatment Options',
    ar: 'خيارات العلاج'
  },
  treatmentOptionsDescription: {
    en: 'Explore various treatment options and procedures available.',
    ar: 'استكشف خيارات وإجراءات العلاج المختلفة المتاحة.'
  },
  laserTreatments: {
    en: 'Laser Treatments',
    ar: 'علاجات الليزر'
  },
  medicationOptions: {
    en: 'Medication Options',
    ar: 'خيارات الأدوية'
  },
  surgicalProcedures: {
    en: 'Surgical Procedures',
    ar: 'الإجراءات الجراحية'
  },
  visionTherapy: {
    en: 'Vision Therapy',
    ar: 'العلاج البصري'
  },
  importantNoticeTitle: {
    en: 'Important Notice',
    ar: 'ملاحظة هامة'
  },
  importantNoticeDescription: {
    en: 'Regular eye examinations are crucial for maintaining eye health. The American Academy of Ophthalmology recommends comprehensive eye exams every 1-2 years for adults over 65, and every 2-4 years for adults aged 40-65.',
    ar: 'فحوصات العين المنتظمة ضرورية للحفاظ على صحة العين. توصي الأكاديمية الأمريكية لطب العيون بإجراء فحوصات شاملة للعين كل 1-2 سنة للبالغين فوق 65 عامًا، وكل 2-4 سنوات للبالغين الذين تتراوح أعمارهم بين 40-65 عامًا.'
  },
  latestResearchTitle: {
    en: 'Latest Research',
    ar: 'أحدث الأبحاث'
  },
  octTechnologyTitle: {
    en: 'Advances in OCT Technology',
    ar: 'تطورات في تقنية OCT'
  },
  octTechnologyDescription: {
    en: 'New developments in OCT imaging are revolutionizing early detection of eye diseases.',
    ar: 'التطورات الجديدة في تصوير OCT تحدث ثورة في الكشف المبكر عن أمراض العيون.'
  },
  aiOphthalmologyTitle: {
    en: 'AI in Ophthalmology',
    ar: 'الذكاء الاصطناعي في طب العيون'
  },
  aiOphthalmologyDescription: {
    en: 'How artificial intelligence is improving diagnosis accuracy and treatment planning.',
    ar: 'كيف يحسن الذكاء الاصطناعي دقة التشخيص وتخطيط العلاج.'
  },
  resourcesTitle: {
    en: 'Resources',
    ar: 'الموارد'
  },
  eyeHealthGuidelinesTitle: {
    en: 'Eye Health Guidelines',
    ar: 'إرشادات صحة العين'
  },
  eyeHealthGuidelinesDescription: {
    en: 'Download our comprehensive guide to maintaining healthy eyes.',
    ar: 'قم بتنزيل دليلنا الشامل للحفاظ على صحة العين.'
  },
  videoLibraryTitle: {
    en: 'Video Library',
    ar: 'مكتبة الفيديو'
  },
  videoLibraryDescription: {
    en: 'Watch educational videos about eye health and common conditions.',
    ar: 'شاهد مقاطع فيديو تعليمية حول صحة العين والحالات الشائعة.'
  },
  errorUploadingImage: {
    en: 'Error uploading image:',
    ar: 'خطأ في تحميل الصورة:',
  },
  imageUploadedSuccessfully: {
    en: 'Image uploaded successfully:',
    ar: 'تم تحميل الصورة بنجاح:',
  },
  imageUploadSuccessAlert: {
    en: 'Image uploaded successfully!',
    ar: 'تم تحميل الصورة بنجاح!',
  },
  unexpectedError: {
    en: 'Unexpected error:',
    ar: 'خطأ غير متوقع:',
  },
  uploadPatientImageTitle: {
    en: 'Upload Patient Image',
    ar: 'تحميل صورة المريض',
  },
  uploadingMessage: {
    en: 'Uploading...',
    ar: 'جاري التحميل...',
  }
};

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (key: string) => string;
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  translate: (key) => {
    const { language } = get();
    return translations[key]?.[language] || key;
  }
}));