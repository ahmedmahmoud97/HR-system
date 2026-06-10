import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  Employee,
  Department,
  Section,
  JobTitle,
  CostCenter,
  InsuranceConfig,
  InsuranceOffice,
  ResignationReason,
  VacationType,
  VacationRequest,
  AttendanceRecord,
  SystemMonth,
  UserPermission,
  SystemAlert
} from '../types';

export interface SyncLog {
  id: string;
  time: string;
  action: string;
  details: string;
  status: 'info' | 'success' | 'error';
}

// Global logger to show inside the UI logs channel
let localLogs: SyncLog[] = [];
let logsListener: ((logs: SyncLog[]) => void) | null = null;

export const addSyncLog = (action: string, details: string, status: 'info' | 'success' | 'error' = 'info') => {
  const newLog: SyncLog = {
    id: `${Date.now()}-${Math.random()}`,
    time: new Date().toLocaleTimeString('ar-EG'),
    action,
    details,
    status
  };
  localLogs = [newLog, ...localLogs].slice(0, 50); // limit to last 50 logs
  if (logsListener) {
    logsListener(localLogs);
  }
};

export const subscribeToSyncLogs = (listener: (logs: SyncLog[]) => void) => {
  logsListener = listener;
  listener(localLogs);
  return () => {
    logsListener = null;
  };
};

/**
 * Sync list changes (calculating added/updated vs deleted items) to Supabase
 */
export function syncListDiff<T extends { id: string }>(
  tableName: string,
  newList: T[],
  oldList: T[],
  displayName: string
) {
  if (!isSupabaseConfigured()) return;
  
  const newIds = new Set(newList.map(item => item.id));
  const deleted = oldList.filter(item => !newIds.has(item.id));
  
  const oldMap = new Map(oldList.map(item => [item.id, item]));
  const upserted = newList.filter(item => {
    const oldItem = oldMap.get(item.id);
    return !oldItem || JSON.stringify(item) !== JSON.stringify(oldItem);
  });
  
  deleted.forEach(item => {
    syncDelete(tableName, item.id, displayName);
  });
  
  upserted.forEach(item => {
    syncUpsert(tableName, item, displayName);
  });
}

/**
 * Generic Fetcher with safety handling for missing tables or authorization issues
 */
async function fetchTable<T>(tableName: string): Promise<T[] | null> {
  try {
    if (!isSupabaseConfigured()) return null;
    
    addSyncLog(`جاري قراءة جدول...`, `استدعاء البيانات من جدول ${tableName}`);
    const { data, error } = await supabase.from(tableName).select('*');
    
    if (error) {
      if (error.code === '42P01') { // Table does not exist
        addSyncLog(`جدول غير موجود`, `الجدول ${tableName} غير متواجد في Supabase. يرجى تهيئة جداول قاعدة البيانات.`, 'error');
        throw new Error(`table_missing:${tableName}`);
      }
      addSyncLog(`خطأ اتصال`, `فشل قراءة ${tableName}: ${error.message}`, 'error');
      console.warn(`Supabase fetch failed for ${tableName}:`, error);
      return null;
    }
    
    addSyncLog(`تمت قراءة جدول`, `تم جلب عدد (${data?.length || 0}) سجل من ${tableName} بنجاح.`, 'success');
    return data as T[];
  } catch (err: any) {
    if (err.message?.startsWith('table_missing:')) {
      throw err;
    }
    return null;
  }
}

/**
 * Sync individual row mutations to Supabase and log everything
 */
export async function syncUpsert(tableName: string, row: any, recordName: string = 'سجل') {
  if (!isSupabaseConfigured()) return;
  try {
    addSyncLog(`جاري المزامنة...`, `حفظ وتحديث ${recordName} بقاعدة البيانات السحابية`);
    const { error } = await supabase.from(tableName).upsert(row);
    if (error) {
      addSyncLog(`فشلت المزامنة`, `خطأ أثناء تحديث الجدول ${tableName}: ${error.message}`, 'error');
      console.error(`Supabase upsert error for ${tableName}:`, error);
    } else {
      addSyncLog(`مزامنة فورية حية`, `تم حفظ وتأكيد ${recordName} في Supabase بنجاح.`, 'success');
    }
  } catch (err: any) {
    console.error(`Supabase network error for upsert on ${tableName}:`, err);
    addSyncLog(`خطأ شبكة`, `تواصل مع السيرفر السحابي فشل: ${err.message}`, 'error');
  }
}

export async function syncDelete(tableName: string, id: string, recordName: string = 'سجل') {
  if (!isSupabaseConfigured()) return;
  try {
    addSyncLog(`جاري الحذف السحابي...`, `شطب ${recordName} ذو المعرف (${id})`);
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
      addSyncLog(`فشل الحذف`, `حدث خطأ: ${error.message}`, 'error');
      console.error(`Supabase delete error for ${tableName}:`, error);
    } else {
      addSyncLog(`شطب فوري حي`, `تم إزالة ${recordName} نهائياً من Supabase بنجاح.`, 'success');
    }
  } catch (err: any) {
    console.error(`Supabase network error for delete on ${tableName}:`, err);
    addSyncLog(`خطأ شبكة`, `فشل الحذف: ${err.message}`, 'error');
  }
}

export async function syncDeleteMultiple(tableName: string, ids: string[], recordName: string = 'سجلات') {
  if (!isSupabaseConfigured()) return;
  try {
    addSyncLog(`مزامنة حذف جماعي...`, `شطب عدد (${ids.length}) ${recordName}`);
    const { error } = await supabase.from(tableName).delete().in('id', ids);
    if (error) {
      addSyncLog(`فشل الحذف الجماعي`, `حدث خطأ: ${error.message}`, 'error');
      console.error(`Supabase batch delete error for ${tableName}:`, error);
    } else {
      addSyncLog(`شطب جماعي حي`, `تم إزالة عدد (${ids.length}) ${recordName} من جدول ${tableName} بنجاح.`, 'success');
    }
  } catch (err: any) {
    console.error(`Supabase network error for batch delete on ${tableName}:`, err);
    addSyncLog(`خطأ شبكة`, `فشل الحذف الجماعي: ${err.message}`, 'error');
  }
}

/**
 * Fetch all HR State from Supabase
 */
export async function loadAllFromSupabase(defaults: {
  employees: Employee[];
  departments: Department[];
  sections: Section[];
  jobTitles: JobTitle[];
  costCenters: CostCenter[];
  insuranceConfig: InsuranceConfig;
  insuranceOffices: InsuranceOffice[];
  resignationReasons: ResignationReason[];
  vacationTypes: VacationType[];
  vacationRequests: VacationRequest[];
  attendance: AttendanceRecord[];
  systemMonth: SystemMonth;
  userPermissions: UserPermission[];
  alerts: SystemAlert[];
}) {
  addSyncLog(`تأمين الاتصال`, `بروتوكول تهيئة الاتصال فوري مع Supabase...`);
  
  try {
    const fetchDepartments = await fetchTable<Department>('departments');
    const fetchSections = await fetchTable<Section>('sections');
    const fetchJobTitles = await fetchTable<JobTitle>('job_titles');
    const fetchCostCenters = await fetchTable<CostCenter>('cost_centers');
    const fetchInsuranceConfigs = await fetchTable<InsuranceConfig>('insurance_configs');
    const fetchInsuranceOffices = await fetchTable<InsuranceOffice>('insurance_offices');
    const fetchResignationReasons = await fetchTable<ResignationReason>('resignation_reasons');
    const fetchVacationTypes = await fetchTable<VacationType>('vacation_types');
    const fetchEmployees = await fetchTable<Employee>('employees');
    const fetchVacationRequests = await fetchTable<VacationRequest>('vacation_requests');
    const fetchAttendance = await fetchTable<AttendanceRecord>('attendance');
    const fetchSystemMonthRows = await fetchTable<SystemMonth & { id: string }>('system_month');
    const fetchUserPermissions = await fetchTable<UserPermission>('user_permissions');
    const fetchAlerts = await fetchTable<SystemAlert>('system_alerts');

    // Determine if the connected DB is completely empty (brand new setup, needs seeding)
    const isActuallyEmpty = 
      (fetchEmployees !== null && fetchEmployees.length === 0) &&
      (fetchDepartments !== null && fetchDepartments.length === 0);

    if (isActuallyEmpty) {
      addSyncLog(`السحابة فارغة`, `تم تأكيد الاتصال بنجاح. قاعدة البيانات في Supabase فارغة حالياً. سيتم استخدام البيانات المحلية الحالية وعرضها حتى تقوم برفعها وتصديرها من صفحة الإعدادات.`, 'info');
      return {
        ...defaults,
        success: true,
        tablesNeeded: false
      };
    }

    // Apply safe defaults if any fetch returned null of connection failed
    const departments = fetchDepartments ?? defaults.departments;
    const sections = fetchSections ?? defaults.sections;
    const jobTitles = fetchJobTitles ?? defaults.jobTitles;
    const costCenters = fetchCostCenters ?? defaults.costCenters;
    const insuranceOffices = fetchInsuranceOffices ?? defaults.insuranceOffices;
    const resignationReasons = fetchResignationReasons ?? defaults.resignationReasons;
    const vacationTypes = fetchVacationTypes ?? defaults.vacationTypes;
    const employees = fetchEmployees ?? defaults.employees;
    const vacationRequests = fetchVacationRequests ?? defaults.vacationRequests;
    const attendance = fetchAttendance ?? defaults.attendance;
    const userPermissions = (fetchUserPermissions && fetchUserPermissions.length > 0) ? fetchUserPermissions : defaults.userPermissions;
    const alerts = fetchAlerts ?? defaults.alerts;

    // Format single rows safely
    const insuranceConfig = (fetchInsuranceConfigs && fetchInsuranceConfigs[0]) || defaults.insuranceConfig;
    const systemMonth = (fetchSystemMonthRows && fetchSystemMonthRows[0]) 
      ? { year: fetchSystemMonthRows[0].year, month: fetchSystemMonthRows[0].month }
      : defaults.systemMonth;

    addSyncLog(`ربط آمن كامل`, `تم جلب وموافقة جميع الكشوف اللوحية مع السحابة الإدارية.`, 'success');

    return {
      employees,
      departments,
      sections,
      jobTitles,
      costCenters,
      insuranceConfig,
      insuranceOffices,
      resignationReasons,
      vacationTypes,
      vacationRequests,
      attendance,
      systemMonth,
      userPermissions,
      alerts,
      success: true,
      tablesNeeded: false
    };
  } catch (error: any) {
    if (error.message?.startsWith('table_missing:')) {
      addSyncLog(`جداول ناقصة`, `يرجى تشغيل كود التهيئة لتأسيس الهيكل العام.`, 'error');
      return {
        ...defaults,
        success: false,
        tablesNeeded: true,
        error: error.message
      };
    }
    addSyncLog(`توقف الاتصال`, `جلب البيانات تعثر: ${error.message}`, 'error');
    return {
      ...defaults,
      success: false,
      tablesNeeded: false,
      error: error.message
    };
  }
}

/**
 * Seed Supabase structure with our initial dataset
 */
export async function seedDefaultData(data: {
  employees: Employee[];
  departments: Department[];
  sections: Section[];
  jobTitles: JobTitle[];
  costCenters: CostCenter[];
  insuranceConfig: InsuranceConfig;
  insuranceOffices: InsuranceOffice[];
  resignationReasons: ResignationReason[];
  vacationTypes: VacationType[];
  vacationRequests: VacationRequest[];
  attendance: AttendanceRecord[];
  systemMonth: SystemMonth;
  userPermissions: UserPermission[];
  alerts: SystemAlert[];
}): Promise<{ success: boolean; errors: string[] }> {
  if (!isSupabaseConfigured()) {
    return { success: false, errors: ['لم يتم تزويد متغيرات بيئة أو مفاتيح اتصال Supabase في التطبيق'] };
  }
  addSyncLog(`شحن البيانات المرجعية`, `بدء عملية ملء جداول المنشأة الافتراضية...`);

  const errors: string[] = [];

  async function seedTable(tableName: string, rows: any[], displayName: string) {
    if (!rows || rows.length === 0) return true;
    addSyncLog(`تغذية جدول ${displayName}`, `جاري رفع عدد (${rows.length}) سجل...`);
    const { error } = await supabase.from(tableName).upsert(rows);
    if (error) {
      const errMsg = `جدول ${displayName}: ${error.message} (رمز: ${error.code})`;
      addSyncLog(`فشل تغذية ${displayName}`, `حدث خطأ: ${error.message} (رمز: ${error.code})`, 'error');
      console.error(`Error seeding ${tableName}:`, error);
      errors.push(errMsg);
      return false;
    }
    addSyncLog(`نجاح تغذية ${displayName}`, `تم رفع البيانات للجدول بنجاح!`, 'success');
    return true;
  }

  try {
    const results = [
      await seedTable('departments', data.departments, 'الإدارات'),
      await seedTable('sections', data.sections, 'الأقسام'),
      await seedTable('job_titles', data.jobTitles, 'وظائف العمل'),
      await seedTable('cost_centers', data.costCenters, 'مراكز التكلفة'),
      await seedTable('insurance_offices', data.insuranceOffices, 'مكاتب التأمينات'),
      await seedTable('resignation_reasons', data.resignationReasons, 'أسباب الاستقالة'),
      await seedTable('vacation_types', data.vacationTypes, 'أنواع الإجازات'),
      await seedTable('insurance_configs', [data.insuranceConfig], 'شريحة التأمينات'),
      await seedTable('employees', data.employees, 'الموظفين'),
      await seedTable('vacation_requests', data.vacationRequests, 'طلبات الإجازة'),
      await seedTable('attendance', data.attendance, 'حركات الحضور'),
      await seedTable('system_month', [{ ...data.systemMonth, id: 'current' }], 'شهر النظام'),
      await seedTable('user_permissions', data.userPermissions, 'صلاحيات المستخدمين'),
      await seedTable('system_alerts', data.alerts, 'أرصدة التنبيهات')
    ];

    const allSuccessful = results.every(res => res === true);

    if (allSuccessful) {
      addSyncLog(`اكتمال التهيئة`, `تم رفع وتسكين الهياكل وكشوف الموظفين المرجعيين بنجاح دون أي أخطاء!`, 'success');
      return { success: true, errors: [] };
    } else {
      addSyncLog(`اكتمال جزئي`, `تم الانتهاء من عملية الشحن ولكن فشل رفع بعض الجداول. يرجى مراجعة الأخطاء في الأعلى.`, 'error');
      return { success: false, errors };
    }
  } catch (err: any) {
    addSyncLog(`فشل الشحن الكلي`, `تعثر رفع البيانات: ${err.message}`, 'error');
    console.error(`Seeding error:`, err);
    return { success: false, errors: [err.message] };
  }
}
