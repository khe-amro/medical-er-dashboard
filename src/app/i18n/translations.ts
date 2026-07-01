import { Language } from '../components/LanguageToggle';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header & Navigation
    'emergency_department': 'Emergency Department Dashboard',
    'hospital_name': "St. Mary's Medical Center",
    'beds': 'Beds',
    'avg_wait': 'Avg Wait',
    'critical': 'Critical',
    'overview_dashboard': 'Overview Dashboard',
    'doctor_queue': "Doctor's Queue",
    'nurse_intake': 'Nurse Intake Portal',
    'ai_diagnostics': 'AI Diagnostics',
    'analytics': 'Analytics',
    'reports': 'Reports',
    'alerts': 'Alerts',
    'settings': 'Settings',
    'admin': 'Admin',

    // Patient Info
    'active_patients': 'Active Patients',
    'patient': 'Patient',
    'patient_name': 'Patient Name',
    'age': 'Age',
    'gender': 'Gender',
    'male': 'Male',
    'female': 'Female',
    'chief_complaint': 'Chief Complaint',
    'arrived': 'Arrived',
    'bed': 'Bed',

    // Medical Terms
    'chest_pain': 'Chest pain',
    'shortness_of_breath': 'shortness of breath',
    'abdominal_pain': 'abdominal pain',
    'laceration': 'Laceration',
    'migraine': 'Migraine headache',
    'burn': 'Burn',
    'asthma': 'Asthma exacerbation',

    // Vital Signs
    'vital_signs': 'Vital Signs Entry',
    'blood_pressure': 'Blood Pressure',
    'heart_rate': 'Heart Rate',
    'temperature': 'Temperature',
    'oxygen_saturation': 'Oxygen Saturation',
    'respiratory_rate': 'Respiratory Rate',
    'pain_level': 'Pain Level',
    'submit_vitals': 'Submit Vitals',
    'vitals_submitted': 'Vitals submitted successfully!',
    'vital_trends': 'Vital Trends',

    // AI & Diagnostics
    'ai_clinical_insights': 'AI Clinical Insights',
    'ai_triage': 'AI Triage Assessment',
    'live': 'Live',
    'live_analysis': 'Live Analysis',
    'top_differentials': 'Top 3 Differential Diagnoses',
    'confidence': 'Confidence',
    'ai_analysis_complete': 'AI analysis complete',
    'xray_ai_analysis': 'X-Ray AI Analysis',
    'sepsis_risk': 'Sepsis Risk Detected',
    'deterioration_pattern': 'Deterioration Pattern',
    'resource_optimization': 'Resource Optimization',

    // Voice & Recording
    'voice_pulse': 'Voice Pulse - Clinical Intake',
    'recording': 'Recording...',
    'live_transcript': 'Live Transcript',
    'voice_summary': 'Voice Intake Summary',

    // Medical Imaging
    'medical_imaging': 'Medical Imaging Upload',
    'drop_xray': 'Drop X-Ray images here',
    'or_browse': 'or click to browse',
    'processing_ai': 'Processing via AI...',
    'xray_processed': 'X-Ray Processed Successfully',
    'digital_xray_viewer': 'Digital X-Ray Viewer',

    // Labs & Results
    'recent_labs': 'Recent Labs',
    'troponin': 'Troponin I',
    'bnp': 'BNP',
    'ddimer': 'D-Dimer',
    'wbc': 'WBC',

    // Time & Status
    'wait_time': 'Wait Time',
    'minutes': 'minutes',
    'hours': 'hours',
    'ago': 'ago',
    'active': 'Active',
    'inactive': 'Inactive',
    'on_leave': 'On Leave',

    // ESI Levels
    'esi_1': 'ESI-1 Critical',
    'esi_2': 'ESI-2 Emergent',
    'esi_3': 'ESI-3 Urgent',
    'esi_4': 'ESI-4 Less Urgent',
    'esi_5': 'ESI-5 Non-Urgent',

    // Analytics
    'total_patients': 'Total Patients',
    'avg_length_stay': 'Avg Length of Stay',
    'bed_occupancy': 'Bed Occupancy',
    'critical_cases': 'Critical Cases',
    'patient_flow': 'Patient Flow Trends',
    'esi_distribution': 'ESI Distribution',
    'department_performance': 'Department Performance',

    // Reports
    'reports_center': 'Reports Center',
    'generate_report': 'Generate Report',
    'shift_handoff': 'Shift Handoff Report',
    'patient_volume': 'Patient Volume Analysis',
    'quality_metrics': 'Quality Metrics Report',
    'compliance': 'Regulatory Compliance',
    'view': 'View',
    'download': 'Download',
    'print': 'Print',
    'share': 'Share',

    // Alerts
    'alert_management': 'Alert Management',
    'acknowledge': 'Acknowledge',
    'dismiss': 'Dismiss',
    'sound_on': 'Sound On',
    'sound_off': 'Sound Off',
    'all': 'All',
    'warning': 'Warning',
    'info': 'Info',
    'success': 'Success',

    // Admin
    'admin_dashboard': 'Admin Dashboard',
    'staff_management': 'Staff Management',
    'patient_analytics': 'Patient Analytics',
    'ai_analytics': 'AI Analytics',
    'system_monitor': 'System Monitor',
    'add_staff': 'Add Staff Member',
    'edit_staff': 'Edit Staff Member',
    'delete_staff': 'Delete Staff',
    'doctor': 'Doctor',
    'nurse': 'Nurse',
    'admin_role': 'Admin',

    // Actions
    'save': 'Save',
    'cancel': 'Cancel',
    'submit': 'Submit',
    'close': 'Close',
    'edit': 'Edit',
    'delete': 'Delete',
    'add': 'Add',
    'update': 'Update',
    'save_changes': 'Save Changes',
    'settings_saved': 'Settings saved successfully!',

    // Common
    'name': 'Name',
    'email': 'Email',
    'phone': 'Phone',
    'department': 'Department',
    'role': 'Role',
    'status': 'Status',
    'rating': 'Rating',
    'description': 'Description',
    'details': 'Details',
    'actions': 'Actions',
  },
  fr: {
    // Header & Navigation
    'emergency_department': 'Tableau de Bord des Urgences',
    'hospital_name': 'Centre Médical St. Mary',
    'beds': 'Lits',
    'avg_wait': 'Attente Moy',
    'critical': 'Critique',
    'overview_dashboard': 'Tableau de Bord Global',
    'doctor_queue': 'File d\'Attente Médecin',
    'nurse_intake': 'Portail d\'Admission Infirmière',
    'ai_diagnostics': 'Diagnostics IA',
    'analytics': 'Analytique',
    'reports': 'Rapports',
    'alerts': 'Alertes',
    'settings': 'Paramètres',
    'admin': 'Administrateur',

    // Patient Info
    'active_patients': 'Patients Actifs',
    'patient': 'Patient',
    'patient_name': 'Nom du Patient',
    'age': 'Âge',
    'gender': 'Sexe',
    'male': 'Homme',
    'female': 'Femme',
    'chief_complaint': 'Plainte Principale',
    'arrived': 'Arrivé',
    'bed': 'Lit',

    // Medical Terms
    'chest_pain': 'Douleur thoracique',
    'shortness_of_breath': 'essoufflement',
    'abdominal_pain': 'douleur abdominale',
    'laceration': 'Lacération',
    'migraine': 'Migraine',
    'burn': 'Brûlure',
    'asthma': 'Exacerbation de l\'asthme',

    // Vital Signs
    'vital_signs': 'Saisie des Signes Vitaux',
    'blood_pressure': 'Tension Artérielle',
    'heart_rate': 'Fréquence Cardiaque',
    'temperature': 'Température',
    'oxygen_saturation': 'Saturation en Oxygène',
    'respiratory_rate': 'Fréquence Respiratoire',
    'pain_level': 'Niveau de Douleur',
    'submit_vitals': 'Soumettre les Signes Vitaux',
    'vitals_submitted': 'Signes vitaux soumis avec succès!',
    'vital_trends': 'Tendances Vitales',

    // AI & Diagnostics
    'ai_clinical_insights': 'Insights Cliniques IA',
    'ai_triage': 'Évaluation Triage IA',
    'live': 'Direct',
    'live_analysis': 'Analyse en Direct',
    'top_differentials': 'Top 3 Diagnostics Différentiels',
    'confidence': 'Confiance',
    'ai_analysis_complete': 'Analyse IA terminée',
    'xray_ai_analysis': 'Analyse IA de la Radiographie',
    'sepsis_risk': 'Risque de Sepsis Détecté',
    'deterioration_pattern': 'Modèle de Détérioration',
    'resource_optimization': 'Optimisation des Ressources',

    // Voice & Recording
    'voice_pulse': 'Voice Pulse - Admission Clinique',
    'recording': 'Enregistrement...',
    'live_transcript': 'Transcription en Direct',
    'voice_summary': 'Résumé Vocal d\'Admission',

    // Medical Imaging
    'medical_imaging': 'Téléchargement d\'Imagerie Médicale',
    'drop_xray': 'Déposer les radiographies ici',
    'or_browse': 'ou cliquer pour parcourir',
    'processing_ai': 'Traitement par IA...',
    'xray_processed': 'Radiographie Traitée avec Succès',
    'digital_xray_viewer': 'Visionneuse de Radiographie Numérique',

    // Labs & Results
    'recent_labs': 'Laboratoires Récents',
    'troponin': 'Troponine I',
    'bnp': 'BNP',
    'ddimer': 'D-Dimère',
    'wbc': 'GB',

    // Time & Status
    'wait_time': 'Temps d\'Attente',
    'minutes': 'minutes',
    'hours': 'heures',
    'ago': 'il y a',
    'active': 'Actif',
    'inactive': 'Inactif',
    'on_leave': 'En Congé',

    // ESI Levels
    'esi_1': 'ESI-1 Critique',
    'esi_2': 'ESI-2 Urgent',
    'esi_3': 'ESI-3 Urgent',
    'esi_4': 'ESI-4 Moins Urgent',
    'esi_5': 'ESI-5 Non Urgent',

    // Analytics
    'total_patients': 'Total des Patients',
    'avg_length_stay': 'Durée Moyenne de Séjour',
    'bed_occupancy': 'Occupation des Lits',
    'critical_cases': 'Cas Critiques',
    'patient_flow': 'Flux de Patients',
    'esi_distribution': 'Distribution ESI',
    'department_performance': 'Performance du Département',

    // Reports
    'reports_center': 'Centre de Rapports',
    'generate_report': 'Générer un Rapport',
    'shift_handoff': 'Rapport de Passation',
    'patient_volume': 'Analyse du Volume de Patients',
    'quality_metrics': 'Rapport de Métriques de Qualité',
    'compliance': 'Conformité Réglementaire',
    'view': 'Voir',
    'download': 'Télécharger',
    'print': 'Imprimer',
    'share': 'Partager',

    // Alerts
    'alert_management': 'Gestion des Alertes',
    'acknowledge': 'Accuser Réception',
    'dismiss': 'Rejeter',
    'sound_on': 'Son Activé',
    'sound_off': 'Son Désactivé',
    'all': 'Tout',
    'warning': 'Avertissement',
    'info': 'Info',
    'success': 'Succès',

    // Admin
    'admin_dashboard': 'Tableau de Bord Admin',
    'staff_management': 'Gestion du Personnel',
    'patient_analytics': 'Analytique des Patients',
    'ai_analytics': 'Analytique IA',
    'system_monitor': 'Moniteur Système',
    'add_staff': 'Ajouter du Personnel',
    'edit_staff': 'Modifier le Personnel',
    'delete_staff': 'Supprimer le Personnel',
    'doctor': 'Médecin',
    'nurse': 'Infirmière',
    'admin_role': 'Admin',

    // Actions
    'save': 'Enregistrer',
    'cancel': 'Annuler',
    'submit': 'Soumettre',
    'close': 'Fermer',
    'edit': 'Modifier',
    'delete': 'Supprimer',
    'add': 'Ajouter',
    'update': 'Mettre à Jour',
    'save_changes': 'Enregistrer les Modifications',
    'settings_saved': 'Paramètres enregistrés avec succès!',

    // Common
    'name': 'Nom',
    'email': 'E-mail',
    'phone': 'Téléphone',
    'department': 'Département',
    'role': 'Rôle',
    'status': 'Statut',
    'rating': 'Évaluation',
    'description': 'Description',
    'details': 'Détails',
    'actions': 'Actions',
  },
  ar: {
    // Header & Navigation
    'emergency_department': 'لوحة تحكم الطوارئ',
    'hospital_name': 'مركز سانت ماري الطبي',
    'beds': 'أسرّة',
    'avg_wait': 'متوسط الانتظار',
    'critical': 'حرج',
    'overview_dashboard': 'لوحة المعلومات العامة',
    'doctor_queue': 'قائمة انتظار الطبيب',
    'nurse_intake': 'بوابة استقبال الممرضة',
    'ai_diagnostics': 'تشخيصات الذكاء الاصطناعي',
    'analytics': 'التحليلات',
    'reports': 'التقارير',
    'alerts': 'التنبيهات',
    'settings': 'الإعدادات',
    'admin': 'المسؤول',

    // Patient Info
    'active_patients': 'المرضى النشطون',
    'patient': 'مريض',
    'patient_name': 'اسم المريض',
    'age': 'العمر',
    'gender': 'الجنس',
    'male': 'ذكر',
    'female': 'أنثى',
    'chief_complaint': 'الشكوى الرئيسية',
    'arrived': 'وصل',
    'bed': 'سرير',

    // Medical Terms
    'chest_pain': 'ألم في الصدر',
    'shortness_of_breath': 'ضيق في التنفس',
    'abdominal_pain': 'ألم في البطن',
    'laceration': 'جرح',
    'migraine': 'صداع نصفي',
    'burn': 'حرق',
    'asthma': 'تفاقم الربو',

    // Vital Signs
    'vital_signs': 'إدخال العلامات الحيوية',
    'blood_pressure': 'ضغط الدم',
    'heart_rate': 'معدل ضربات القلب',
    'temperature': 'درجة الحرارة',
    'oxygen_saturation': 'تشبع الأكسجين',
    'respiratory_rate': 'معدل التنفس',
    'pain_level': 'مستوى الألم',
    'submit_vitals': 'إرسال العلامات الحيوية',
    'vitals_submitted': 'تم إرسال العلامات الحيوية بنجاح!',
    'vital_trends': 'اتجاهات العلامات الحيوية',

    // AI & Diagnostics
    'ai_clinical_insights': 'رؤى سريرية بالذكاء الاصطناعي',
    'ai_triage': 'تقييم الفرز بالذكاء الاصطناعي',
    'live': 'مباشر',
    'live_analysis': 'تحليل مباشر',
    'top_differentials': 'أفضل 3 تشخيصات تفاضلية',
    'confidence': 'الثقة',
    'ai_analysis_complete': 'اكتمل تحليل الذكاء الاصطناعي',
    'xray_ai_analysis': 'تحليل الأشعة السينية بالذكاء الاصطناعي',
    'sepsis_risk': 'تم اكتشاف خطر الإنتان',
    'deterioration_pattern': 'نمط التدهور',
    'resource_optimization': 'تحسين الموارد',

    // Voice & Recording
    'voice_pulse': 'Voice Pulse - الاستقبال السريري',
    'recording': 'جاري التسجيل...',
    'live_transcript': 'نسخ مباشر',
    'voice_summary': 'ملخص صوتي للاستقبال',

    // Medical Imaging
    'medical_imaging': 'تحميل التصوير الطبي',
    'drop_xray': 'إسقاط صور الأشعة السينية هنا',
    'or_browse': 'أو انقر للتصفح',
    'processing_ai': 'معالجة بالذكاء الاصطناعي...',
    'xray_processed': 'تمت معالجة الأشعة السينية بنجاح',
    'digital_xray_viewer': 'عارض الأشعة السينية الرقمي',

    // Labs & Results
    'recent_labs': 'المختبرات الحديثة',
    'troponin': 'تروبونين I',
    'bnp': 'BNP',
    'ddimer': 'D-Dimer',
    'wbc': 'WBC',

    // Time & Status
    'wait_time': 'وقت الانتظار',
    'minutes': 'دقائق',
    'hours': 'ساعات',
    'ago': 'منذ',
    'active': 'نشط',
    'inactive': 'غير نشط',
    'on_leave': 'في إجازة',

    // ESI Levels
    'esi_1': 'ESI-1 حرج',
    'esi_2': 'ESI-2 طارئ',
    'esi_3': 'ESI-3 عاجل',
    'esi_4': 'ESI-4 أقل إلحاحًا',
    'esi_5': 'ESI-5 غير عاجل',

    // Analytics
    'total_patients': 'إجمالي المرضى',
    'avg_length_stay': 'متوسط مدة الإقامة',
    'bed_occupancy': 'إشغال الأسرة',
    'critical_cases': 'الحالات الحرجة',
    'patient_flow': 'اتجاهات تدفق المرضى',
    'esi_distribution': 'توزيع ESI',
    'department_performance': 'أداء القسم',

    // Reports
    'reports_center': 'مركز التقارير',
    'generate_report': 'إنشاء تقرير',
    'shift_handoff': 'تقرير تسليم الوردية',
    'patient_volume': 'تحليل حجم المرضى',
    'quality_metrics': 'تقرير مقاييس الجودة',
    'compliance': 'الامتثال التنظيمي',
    'view': 'عرض',
    'download': 'تحميل',
    'print': 'طباعة',
    'share': 'مشاركة',

    // Alerts
    'alert_management': 'إدارة التنبيهات',
    'acknowledge': 'إقرار',
    'dismiss': 'رفض',
    'sound_on': 'الصوت مفعل',
    'sound_off': 'الصوت متوقف',
    'all': 'الكل',
    'warning': 'تحذير',
    'info': 'معلومات',
    'success': 'نجاح',

    // Admin
    'admin_dashboard': 'لوحة تحكم المسؤول',
    'staff_management': 'إدارة الموظفين',
    'patient_analytics': 'تحليلات المرضى',
    'ai_analytics': 'تحليلات الذكاء الاصطناعي',
    'system_monitor': 'مراقبة النظام',
    'add_staff': 'إضافة موظف',
    'edit_staff': 'تعديل الموظف',
    'delete_staff': 'حذف الموظف',
    'doctor': 'طبيب',
    'nurse': 'ممرضة',
    'admin_role': 'مسؤول',

    // Actions
    'save': 'حفظ',
    'cancel': 'إلغاء',
    'submit': 'إرسال',
    'close': 'إغلاق',
    'edit': 'تعديل',
    'delete': 'حذف',
    'add': 'إضافة',
    'update': 'تحديث',
    'save_changes': 'حفظ التغييرات',
    'settings_saved': 'تم حفظ الإعدادات بنجاح!',

    // Common
    'name': 'الاسم',
    'email': 'البريد الإلكتروني',
    'phone': 'الهاتف',
    'department': 'القسم',
    'role': 'الدور',
    'status': 'الحالة',
    'rating': 'التقييم',
    'description': 'الوصف',
    'details': 'التفاصيل',
    'actions': 'الإجراءات',
  },
};

export function t(key: string, language: Language): string {
  return translations[language][key] || translations.en[key] || key;
}
