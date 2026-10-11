export type UserRole = 'admin' | 'administrator' | 'viewer' | 'guest';

export type StudentStatus = 'aktif' | 'nonaktif';

export type TimePeriod = 'pagi' | 'siang' | 'sore' | 'malam';

export type TransactionCategory = 'Makanan' | 'Minuman' | 'Snack' | 'ATK' | 'Lainnya' | string;

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'aktif' | 'nonaktif';
  avatar_url?: string;
  created_at: string;
  password?: string;
  parent_name?: string;
  santri_name?: string;
  santri_id?: string;
  santri_nis?: string;
  relationship?: string;
  phone?: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  class_name: string;
  dormitory: string;
  parent_name: string;
  parent_phone: string;
  status: StudentStatus;
  joined_date: string;
  avatar_url?: string;
  balance: number;
  qr_code_data: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  code?: string;
  icon_name?: string;
  color?: string;
}

export interface Transaction {
  id: string;
  transaction_code: string;
  student_id: string;
  student_name?: string;
  student_nis?: string;
  student_class?: string;
  amount: number;
  category: TransactionCategory;
  notes: string;
  time_period: TimePeriod;
  created_by: string;
  created_at: string;
}

export interface TopUp {
  id: string;
  topup_code: string;
  student_id: string;
  student_name?: string;
  student_nis?: string;
  amount: number;
  notes: string;
  payment_method: 'Tunai' | 'Transfer' | 'Potongan Gaji' | 'Lainnya';
  created_by: string;
  created_at: string;
}

export interface HeroSlide {
  id: string;
  type: 'video' | 'image';
  url: string;
  title: string;
  subtitle?: string;
  caption?: string;
  badge?: string;
}

export interface AppSettings {
  pesantren_name: string;
  koperasi_name: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
  login_image_url?: string;
  treasurer_name: string;
  head_pesantren_name: string;
  enable_wa_notif: boolean;
  min_balance_alert: number;
  allow_debt?: boolean;
  max_debt_limit?: number;

  // Prayer schedule settings
  prayer_provinsi?: string;
  prayer_kabkota?: string;
  prayer_auto_location?: boolean;
  prayer_lat?: number;
  prayer_lon?: number;
  prayer_location_name?: string;
  prayer_enable_reminder?: boolean;
  prayer_enable_adzan_notif?: boolean;
  prayer_enable_adzan_audio?: boolean;
  prayer_adzan_volume?: number;
  prayer_timezone_label?: string;

  hero_slides?: HeroSlide[];
  categories?: Category[];
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  role?: string;
  action: string;
  details: string;
  santri_name?: string;
  santri_nis?: string;
  santri_class?: string;
  phone?: string;
  relationship?: string;
  device?: string;
  ip?: string;
  created_at: string;
}

export interface DashboardStats {
  total_students: number;
  active_students: number;
  total_balance_all: number;
  today_transactions_count: number;
  today_income: number;
  today_expense: number;
  yesterday_income: number;
  yesterday_expense: number;
  this_month_expense: number;
  this_month_topup: number;
}

export interface TopSantriStat {
  student_id: string;
  student_name: string;
  nis: string;
  class_name: string;
  dormitory: string;
  avatar_url?: string;
  total_spent: number;
  transaction_count: number;
  current_balance: number;
}

export interface DailySummaryReport {
  id: string;
  report_date: string;
  total_transactions_count: number;
  total_transactions_amount: number;
  total_topups_count: number;
  total_topups_amount: number;
  net_cash_flow: number;
  category_breakdown: Record<string, { count: number; amount: number }>;
  payment_method_breakdown: Record<string, { count: number; amount: number }>;
  top_active_students: Array<{ name: string; class_name: string; amount: number }>;
  sent_to_email: string;
  status: 'sent' | 'pending' | 'failed';
  trigger_type: 'automated_cron' | 'manual_trigger';
  generated_at: string;
  email_content_html?: string;
  log_message?: string;
}


export interface PrayerSchedule {
  tanggal: number;
  tanggal_lengkap: string;
  hari: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  timezone_label?: string;
}
