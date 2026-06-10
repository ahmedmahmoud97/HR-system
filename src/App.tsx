/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  FileSpreadsheet,
  Settings as SettingsIcon,
  Sliders,
  TrendingUp,
  RotateCcw,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';

// Sub-components
import Dashboard from './components/Dashboard';
import DataEntry from './components/DataEntry';
import Reports from './components/Reports';
import ControlPanel from './components/ControlPanel';
import Settings from './components/Settings';

// Types
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
  SystemAlert,
} from './types';

// Mock/Initial Data
import {
  initialEmployees,
  initialDepartments,
  initialSections,
  initialJobTitles,
  initialCostCenters,
  initialInsuranceConfig,
  initialInsuranceOffices,
  initialResignationReasons,
  initialVacationTypes,
  initialVacationRequests,
  initialAttendanceRecords,
  initialSystemMonth,
  initialUserPermissions,
  initialAlerts,
} from './utils/initialData';

// Supabase integrations
import { isSupabaseConfigured, supabase } from './utils/supabaseClient';
import {
  loadAllFromSupabase,
  seedDefaultData,
  syncUpsert,
  syncDelete,
  syncDeleteMultiple,
  syncListDiff,
  addSyncLog
} from './utils/supabaseSync';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data_entry' | 'reports' | 'control_panel' | 'settings'>('dashboard');

  // Core App States (using lazy initialization with localStorage)
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('hr_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('hr_departments');
    return saved ? JSON.parse(saved) : initialDepartments;
  });

  const [sections, setSections] = useState<Section[]>(() => {
    const saved = localStorage.getItem('hr_sections');
    return saved ? JSON.parse(saved) : initialSections;
  });

  const [jobTitles, setJobTitles] = useState<JobTitle[]>(() => {
    const saved = localStorage.getItem('hr_jobtitles');
    return saved ? JSON.parse(saved) : initialJobTitles;
  });

  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => {
    const saved = localStorage.getItem('hr_costcenters');
    return saved ? JSON.parse(saved) : initialCostCenters;
  });

  const [insuranceConfig, setInsuranceConfig] = useState<InsuranceConfig>(() => {
    const saved = localStorage.getItem('hr_insuranceconfig');
    return saved ? JSON.parse(saved) : initialInsuranceConfig;
  });

  const [insuranceOffices, setInsuranceOffices] = useState<InsuranceOffice[]>(() => {
    const saved = localStorage.getItem('hr_insuranceoffices');
    return saved ? JSON.parse(saved) : initialInsuranceOffices;
  });

  const [resignationReasons, setResignationReasons] = useState<ResignationReason[]>(() => {
    const saved = localStorage.getItem('hr_resignationreasons');
    return saved ? JSON.parse(saved) : initialResignationReasons;
  });

  const [vacationTypes, setVacationTypes] = useState<VacationType[]>(() => {
    const saved = localStorage.getItem('hr_vacationtypes');
    return saved ? JSON.parse(saved) : initialVacationTypes;
  });

  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>(() => {
    const saved = localStorage.getItem('hr_vacationrequests');
    return saved ? JSON.parse(saved) : initialVacationRequests;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('hr_attendance');
    return saved ? JSON.parse(saved) : initialAttendanceRecords;
  });

  const [systemMonth, setSystemMonth] = useState<SystemMonth>(() => {
    const saved = localStorage.getItem('hr_systemmonth');
    return saved ? JSON.parse(saved) : initialSystemMonth;
  });

  const [userPermissions, setUserPermissions] = useState<UserPermission[]>(() => {
    const saved = localStorage.getItem('hr_userpermissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.error('Error parsing user permissions:', err);
      }
    }
    return initialUserPermissions;
  });

  // Active User session (local simulation with persistence)
  const [activeUserId, setActiveUserId] = useState<string>(() => {
    return localStorage.getItem('hr_active_user_id') || 'user-admin';
  });

  // Save active user ID on changes
  useEffect(() => {
    localStorage.setItem('hr_active_user_id', activeUserId);
  }, [activeUserId]);

  const activeUser = userPermissions.find(u => u.id === activeUserId) || userPermissions[0] || initialUserPermissions[0];

  const hasAccessToTab = (tab: 'dashboard' | 'data_entry' | 'reports' | 'control_panel' | 'settings') => {
    if (tab === 'dashboard') return true;
    if (!activeUser || !activeUser.permissions) return false;
    if (tab === 'data_entry') return activeUser.permissions.dataEntry;
    if (tab === 'reports') return activeUser.permissions.reports;
    if (tab === 'control_panel') return activeUser.permissions.controlPanel;
    if (tab === 'settings') return activeUser.permissions.settings;
    return false;
  };

  const [alerts, setAlerts] = useState<SystemAlert[]>(() => {
    const saved = localStorage.getItem('hr_alerts');
    return saved ? JSON.parse(saved) : initialAlerts;
  });

  // Supabase states
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);
  const [supabaseSchemaMissing, setSupabaseSchemaMissing] = useState(false);
  const [supabaseErrorState, setSupabaseErrorState] = useState<string | null>(null);

  // Supabase Initial Loader & Realtime synchronization
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsUsingSupabase(false);
      return;
    }

    const initSupabase = async () => {
      setSupabaseLoading(true);
      setSupabaseErrorState(null);
      setSupabaseSchemaMissing(false);

      const res = await loadAllFromSupabase({
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
        alerts
      });

      if (res.success) {
        setIsUsingSupabase(true);
        setEmployees(res.employees);
        setDepartments(res.departments);
        setSections(res.sections);
        setJobTitles(res.jobTitles);
        setCostCenters(res.costCenters);
        setInsuranceConfig(res.insuranceConfig);
        setInsuranceOffices(res.insuranceOffices);
        setResignationReasons(res.resignationReasons);
        setVacationTypes(res.vacationTypes);
        setVacationRequests(res.vacationRequests);
        setAttendance(res.attendance);
        setSystemMonth(res.systemMonth);
        setUserPermissions(res.userPermissions);
        setAlerts(res.alerts);
        setSupabaseSchemaMissing(false);
      } else if (res.tablesNeeded) {
        setSupabaseSchemaMissing(true);
      } else {
        setSupabaseErrorState((res as any).error || 'Failed to connect');
      }
      setSupabaseLoading(false);
    };

    initSupabase();

    // 2. Setup Realtime Listener Channel
    addSyncLog('قناة البث الفوري', 'بدء الاتصال بالبث الفوري للتحديثات...');
    const channel = supabase.channel('realtime-hr-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const { table, eventType, new: newRow, old: oldRow } = payload;
        
        console.log('Realtime change received:', table, eventType, newRow);
        addSyncLog('حدث بث فوري', `تحديث تلقائي على جدول ${table} (${eventType})`);

        if (table === 'employees') {
          if (eventType === 'INSERT') {
            setEmployees(prev => !prev.some(x => x.id === newRow.id) ? [...prev, newRow as Employee] : prev);
          } else if (eventType === 'UPDATE') {
            setEmployees(prev => prev.map(x => x.id === newRow.id ? (newRow as Employee) : x));
          } else if (eventType === 'DELETE') {
            setEmployees(prev => prev.filter(x => x.id !== oldRow.id));
          }
        }
        else if (table === 'departments') {
          if (eventType === 'INSERT') setDepartments(prev => !prev.some(x => x.id === newRow.id) ? [...prev, newRow as Department] : prev);
          else if (eventType === 'UPDATE') setDepartments(prev => prev.map(x => x.id === newRow.id ? (newRow as Department) : x));
          else if (eventType === 'DELETE') setDepartments(prev => prev.filter(x => x.id !== oldRow.id));
        }
        else if (table === 'sections') {
          if (eventType === 'INSERT') setSections(prev => !prev.some(x => x.id === newRow.id) ? [...prev, newRow as Section] : prev);
          else if (eventType === 'UPDATE') setSections(prev => prev.map(x => x.id === newRow.id ? (newRow as Section) : x));
          else if (eventType === 'DELETE') setSections(prev => prev.filter(x => x.id !== oldRow.id));
        }
        else if (table === 'job_titles') {
          if (eventType === 'INSERT') setJobTitles(prev => !prev.some(x => x.id === newRow.id) ? [...prev, newRow as JobTitle] : prev);
          else if (eventType === 'UPDATE') setJobTitles(prev => prev.map(x => x.id === newRow.id ? (newRow as JobTitle) : x));
          else if (eventType === 'DELETE') setJobTitles(prev => prev.filter(x => x.id !== oldRow.id));
        }
        else if (table === 'cost_centers') {
          if (eventType === 'INSERT') setCostCenters(prev => !prev.some(x => x.id === newRow.id) ? [...prev, newRow as CostCenter] : prev);
          else if (eventType === 'UPDATE') setCostCenters(prev => prev.map(x => x.id === newRow.id ? (newRow as CostCenter) : x));
          else if (eventType === 'DELETE') setCostCenters(prev => prev.filter(x => x.id !== oldRow.id));
        }
        else if (table === 'insurance_configs') {
          if (eventType === 'UPDATE' || eventType === 'INSERT') setInsuranceConfig(newRow as InsuranceConfig);
        }
        else if (table === 'insurance_offices') {
          if (eventType === 'INSERT') setInsuranceOffices(prev => !prev.some(x => x.id === newRow.id) ? [...prev, newRow as InsuranceOffice] : prev);
          else if (eventType === 'UPDATE') setInsuranceOffices(prev => prev.map(x => x.id === newRow.id ? (newRow as InsuranceOffice) : x));
          else if (eventType === 'DELETE') setInsuranceOffices(prev => prev.filter(x => x.id !== oldRow.id));
        }
        else if (table === 'resignation_reasons') {
          if (eventType === 'INSERT') setResignationReasons(prev => !prev.some(x => x.id === newRow.id) ? [...prev, newRow as ResignationReason] : prev);
          else if (eventType === 'UPDATE') setResignationReasons(prev => prev.map(x => x.id === newRow.id ? (newRow as ResignationReason) : x));
          else if (eventType === 'DELETE') setResignationReasons(prev => prev.filter(x => x.id !== oldRow.id));
        }
        else if (table === 'vacation_types') {
          if (eventType === 'INSERT') setVacationTypes(prev => !prev.some(x => x.id === newRow.id) ? [...prev, newRow as VacationType] : prev);
          else if (eventType === 'UPDATE') setVacationTypes(prev => prev.map(x => x.id === newRow.id ? (newRow as VacationType) : x));
          else if (eventType === 'DELETE') setVacationTypes(prev => prev.filter(x => x.id !== oldRow.id));
        }
        else if (table === 'vacation_requests') {
          if (eventType === 'INSERT') setVacationRequests(prev => !prev.some(x => x.id === newRow.id) ? [newRow as VacationRequest, ...prev] : prev);
          else if (eventType === 'UPDATE') setVacationRequests(prev => prev.map(x => x.id === newRow.id ? (newRow as VacationRequest) : x));
          else if (eventType === 'DELETE') setVacationRequests(prev => prev.filter(x => x.id !== oldRow.id));
        }
        else if (table === 'attendance') {
          if (eventType === 'INSERT') setAttendance(prev => !prev.some(x => x.id === newRow.id) ? [...prev, newRow as AttendanceRecord] : prev);
          else if (eventType === 'UPDATE') setAttendance(prev => prev.map(x => x.id === newRow.id ? (newRow as AttendanceRecord) : x));
          else if (eventType === 'DELETE') setAttendance(prev => prev.filter(x => x.id !== oldRow.id));
        }
        else if (table === 'system_month') {
          if (eventType === 'UPDATE' || eventType === 'INSERT') setSystemMonth({ year: newRow.year, month: newRow.month });
        }
        else if (table === 'user_permissions') {
          if (eventType === 'INSERT') setUserPermissions(prev => !prev.some(x => x.id === newRow.id) ? [...prev, newRow as UserPermission] : prev);
          else if (eventType === 'UPDATE') setUserPermissions(prev => prev.map(x => x.id === newRow.id ? (newRow as UserPermission) : x));
          else if (eventType === 'DELETE') setUserPermissions(prev => prev.filter(x => x.id !== oldRow.id));
        }
        else if (table === 'system_alerts') {
          if (eventType === 'INSERT') setAlerts(prev => !prev.some(x => x.id === newRow.id) ? [newRow as SystemAlert, ...prev] : prev);
          else if (eventType === 'UPDATE') setAlerts(prev => prev.map(x => x.id === newRow.id ? (newRow as SystemAlert) : x));
          else if (eventType === 'DELETE') setAlerts(prev => prev.filter(x => x.id !== oldRow.id));
        }
      })
      .subscribe((status) => {
        addSyncLog('حالة البث فوري', `اتصال البث الفوري الآن: ${status}`);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Periodic alerts check
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const newAlerts: SystemAlert[] = [];

    employees.filter(e => e.status === 'active').forEach(emp => {
      // 1. Birthday
      if (emp.dateOfBirth) {
        const dob = new Date(emp.dateOfBirth);
        if (dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate()) {
          newAlerts.push({
            id: `birthday-${emp.id}-${todayStr}`,
            title: 'عيد ميلاد موظف',
            description: `عيد ميلاد الموظف "${emp.name}" اليوم!`,
            date: todayStr,
            type: 'info'
          });
        }
      }

      // 2. Contract Expiry (1 month before)
      if (emp.contractExpiryDate) {
        const expiry = new Date(emp.contractExpiryDate);
        const oneMonthBefore = new Date(expiry);
        oneMonthBefore.setMonth(expiry.getMonth() - 1);

        if (oneMonthBefore.toISOString().split('T')[0] === todayStr) {
          newAlerts.push({
            id: `contract-${emp.id}-${todayStr}`,
            title: 'تنبيه انتهاء عقد',
            description: `سينتهي عقد الموظف "${emp.name}" في ${emp.contractExpiryDate}`,
            date: todayStr,
            type: 'warning'
          });
        }
      }

      // 3. Military Expiry (1 month before)
      if (emp.militaryDefermentExpiryDate) {
        const expiry = new Date(emp.militaryDefermentExpiryDate);
        const oneMonthBefore = new Date(expiry);
        oneMonthBefore.setMonth(expiry.getMonth() - 1);

        if (oneMonthBefore.toISOString().split('T')[0] === todayStr) {
          newAlerts.push({
            id: `military-${emp.id}-${todayStr}`,
            title: 'تنبيه انتهاء تأجيل تجنيد',
            description: `سينتهي تأجيل التجنيد للموظف "${emp.name}" في ${emp.militaryDefermentExpiryDate}`,
            date: todayStr,
            type: 'warning'
          });
        }
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const filteredNew = newAlerts.filter(a => !existingIds.has(a.id));
        if (filteredNew.length === 0) return prev;
        return [...filteredNew, ...prev];
      });
    }
  }, [employees]);

  // Persisting states to localStorage on change
  useEffect(() => {
    localStorage.setItem('hr_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('hr_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('hr_sections', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('hr_jobtitles', JSON.stringify(jobTitles));
  }, [jobTitles]);

  useEffect(() => {
    localStorage.setItem('hr_costcenters', JSON.stringify(costCenters));
  }, [costCenters]);

  useEffect(() => {
    localStorage.setItem('hr_insuranceconfig', JSON.stringify(insuranceConfig));
  }, [insuranceConfig]);

  useEffect(() => {
    localStorage.setItem('hr_insuranceoffices', JSON.stringify(insuranceOffices));
  }, [insuranceOffices]);

  useEffect(() => {
    localStorage.setItem('hr_resignationreasons', JSON.stringify(resignationReasons));
  }, [resignationReasons]);

  useEffect(() => {
    localStorage.setItem('hr_vacationtypes', JSON.stringify(vacationTypes));
  }, [vacationTypes]);

  useEffect(() => {
    localStorage.setItem('hr_vacationrequests', JSON.stringify(vacationRequests));
  }, [vacationRequests]);

  useEffect(() => {
    localStorage.setItem('hr_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('hr_systemmonth', JSON.stringify(systemMonth));
  }, [systemMonth]);

  useEffect(() => {
    localStorage.setItem('hr_userpermissions', JSON.stringify(userPermissions));
  }, [userPermissions]);

  useEffect(() => {
    localStorage.setItem('hr_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Operations callbacks
  // 1. Add Employee
  const handleAddEmployee = (newEmp: Omit<Employee, 'id'>) => {
    const withId: Employee = {
      ...newEmp,
      id: `emp-${Date.now()}`,
    };
    setEmployees((prev) => [...prev, withId]);

    // Send visual notification
    const logAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      title: 'إضافة ومباشرة عمل جديدة',
      description: `تم إضافة المعين الجديد "${newEmp.name}" بنجاح وكود تشغيل (${newEmp.code}) وإدراجه بقاعدة بيانات الإدارة الحالية.`,
      date: new Date().toISOString().split('T')[0],
      type: 'success',
    };
    setAlerts((prev) => [logAlert, ...prev]);

    if (isSupabaseConfigured()) {
      syncUpsert('employees', withId, 'موظف جديد');
      syncUpsert('system_alerts', logAlert, 'تنبيه تعيين');
    }
  };

  // 1.5. Update Employee
  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updatedEmp.id ? updatedEmp : emp))
    );

    // Add alert
    const logAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      title: 'تحديث بيانات موظف',
      description: `تم تعديل وتحديث بيانات ملف الموظف "${updatedEmp.name}" وكود تشغيل (${updatedEmp.code}) بنجاح.`,
      date: new Date().toISOString().split('T')[0],
      type: 'info',
    };
    setAlerts((prev) => [logAlert, ...prev]);

    if (isSupabaseConfigured()) {
      syncUpsert('employees', updatedEmp, 'تحديث بيانات موظف');
      syncUpsert('system_alerts', logAlert, 'تنبيه تحديث موظف');
    }
  };

  // 2. Terminate Employee
  const handleTerminateEmployee = (empId: string, date: string, reasonId: string) => {
    let nextEmp: Employee | undefined;
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId) {
          const updated = {
            ...emp,
            status: 'terminated' as const,
            terminationDate: date,
            terminationReasonId: reasonId,
          };
          nextEmp = updated;
          return updated;
        }
        return emp;
      })
    );

    const target = employees.find((e) => e.id === empId);

    // Add alert
    const logAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      title: 'إنهاء تعاقد وإخلاء طرف مالي',
      description: `تم إنهاء خدمة الموظف "${target?.name || ''}" فعلياً بتاريخ ${date} لحساب أرصدة المستحقات الاجتماعية وقانون العمل.`,
      date: new Date().toISOString().split('T')[0],
      type: 'warning',
    };
    setAlerts((prev) => [logAlert, ...prev]);

    if (isSupabaseConfigured()) {
      if (nextEmp) syncUpsert('employees', nextEmp, 'إنهاء خدمة موظف');
      syncUpsert('system_alerts', logAlert, 'تنبيه إنهاء');
    }
  };

  // 3. Add Vacation Request
  const handleAddVacationRequest = (req: Omit<VacationRequest, 'id' | 'requestDate' | 'status'> & { status: 'pending' | 'approved' }) => {
    const withId: VacationRequest = {
      ...req,
      id: `req-${Date.now()}`,
      requestDate: new Date().toISOString().split('T')[0],
    };

    setVacationRequests((prev) => [withId, ...prev]);

    let updatedEmp: Employee | undefined;
    // If approved right now, deduct vacation balances
    if (req.status === 'approved') {
      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.id === req.employeeId) {
            const next = {
              ...emp,
              vacationBalance: Math.max(emp.vacationBalance - req.days, 0),
            };
            updatedEmp = next;
            return next;
          }
          return emp;
        })
      );
    }

    const targetEmp = employees.find((e) => e.id === req.employeeId);
    let logAlert: SystemAlert | undefined;
    
    // Add alert if pending
    if (req.status === 'pending') {
      logAlert = {
        id: `alt-${Date.now()}`,
        title: 'طلب إجازة طارئة معلق',
        description: `طلب إجازة معلق للموظف "${targetEmp?.name || ''}" مدته [${req.days} يوماً] يتطلب مراجعة الأرصدة الاستحقاقية السنوية للقبول الأخير.`,
        date: new Date().toISOString().split('T')[0],
        type: 'warning',
      };
      setAlerts((prev) => [logAlert!, ...prev]);
    }

    if (isSupabaseConfigured()) {
      syncUpsert('vacation_requests', withId, 'طلب إجازة');
      if (updatedEmp) syncUpsert('employees', updatedEmp, 'رصيد إجازات موظف');
      if (logAlert) syncUpsert('system_alerts', logAlert, 'تنبيه إجازة');
    }
  };

  // 4. Update Attendance Records for a specific day
  const handleUpdateAttendance = (records: { employeeId: string; date: string; clockIn: string; clockOut: string; status: 'present' | 'absent' | 'late' | 'excused'; notes?: string }[]) => {
    const fullRecords: AttendanceRecord[] = records.map((r, idx) => ({
      ...r,
      id: `att-${Date.now()}-${idx}`,
    }));

    setAttendance((prev) => {
      // Filter out any existing records for this specific date
      const targetDate = records[0]?.date || '';
      const filtered = prev.filter((item) => item.date !== targetDate);
      return [...filtered, ...fullRecords];
    });

    if (isSupabaseConfigured()) {
      fullRecords.forEach(r => syncUpsert('attendance', r, 'حركة حضور وانصراف'));
    }
  };

  // 4b. Batch Add Employees (from Spreadsheet Import)
  const handleBatchAddEmployees = (newEmps: Omit<Employee, 'id'>[]) => {
    const withIds: Employee[] = newEmps.map((emp, i) => ({
      ...emp,
      id: `emp-excel-${Date.now()}-${i}`,
    }));
    setEmployees((prev) => [...prev, ...withIds]);

    const logAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      title: 'استيراد جماعي للموظفين',
      description: `اكتمل بنجاح استيراد وإدراج عدد ${newEmps.length} ملفات موظفين بقاعدة بيانات المنشأة وموافاتهم بأكواد التعيين الحاكمة.`,
      date: new Date().toISOString().split('T')[0],
      type: 'success',
    };
    setAlerts((prev) => [logAlert, ...prev]);

    if (isSupabaseConfigured()) {
      withIds.forEach(emp => syncUpsert('employees', emp, 'موظف مستورد'));
      syncUpsert('system_alerts', logAlert, 'تنبيه استيراد');
    }
  };

  // 4c. Batch Update Attendance (from Spreadsheet Import)
  const handleBatchUpdateAttendance = (records: { employeeId: string; date: string; clockIn: string; clockOut: string; status: 'present' | 'absent' | 'late' | 'excused'; notes?: string }[]) => {
    const newRecords: AttendanceRecord[] = records.map((r, idx) => ({
      ...r,
      id: `att-import-${Date.now()}-${idx}`
    }));

    setAttendance((prev) => {
      const updateMap = new Map(records.map(r => [`${r.employeeId}_${r.date}`, r]));
      const filtered = prev.filter(item => !updateMap.has(`${item.employeeId}_${item.date}`));
      return [...filtered, ...newRecords];
    });

    const dates = Array.from(new Set(records.map(r => r.date)));
    const logAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      title: 'استيراد جماعي لكشف الحضور',
      description: `تم سحب وتحديث عدد (${records.length}) حركات حضور وانصراف من ملف إكسل الخارجي بنجاح على التواريخ (${dates.join(', ')}).`,
      date: new Date().toISOString().split('T')[0],
      type: 'success',
    };
    setAlerts((prev) => [logAlert, ...prev]);

    if (isSupabaseConfigured()) {
      newRecords.forEach(r => syncUpsert('attendance', r, 'حضور مستورد'));
      syncUpsert('system_alerts', logAlert, 'تنبيه استيراد حضور');
    }
  };

  // 5. Carryforward balances
  const handleCarryforwardBalances = (days: number) => {
    let nextList: Employee[] = [];
    setEmployees((prev) => {
      const next = prev.map((emp) =>
        emp.status === 'active'
          ? {
              ...emp,
              vacationBalance: emp.vacationBalance + days,
              initialVacationBalance: emp.initialVacationBalance + days,
            }
          : emp
      );
      nextList = next.filter(e => e.status === 'active');
      return next;
    });

    // Add alert
    const logAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      title: 'ترحيل سنوي وتحديث الإجازات العامة',
      description: `اكتمل ترحيل الأرصدة بنجاح، جرى تسوية وإضافة [${days} يوم] رصيد إجازة معتمد لجميع موظفي الهيكل النشطين.`,
      date: new Date().toISOString().split('T')[0],
      type: 'success',
    };
    setAlerts((prev) => [logAlert, ...prev]);

    if (isSupabaseConfigured()) {
      nextList.forEach(emp => syncUpsert('employees', emp, 'ترحيل رصيد موظف'));
      syncUpsert('system_alerts', logAlert, 'تنبيه ترحيل');
    }
  };

  // 6. Increase Insurances by specified percentage
  const handleIncreaseInsurances = (percentRatio: number) => {
    const factor = 1 + percentRatio / 100;
    let nextList: Employee[] = [];

    // Boost employees' insurance wages
    setEmployees((prev) => {
      const next = prev.map((emp) =>
        emp.status === 'active'
          ? {
              ...emp,
              insuranceSalary: Math.round(emp.insuranceSalary * factor),
            }
          : emp
      );
      nextList = next.filter(e => e.status === 'active');
      return next;
    });

    // Boost config limits
    let nextConfig: InsuranceConfig;
    setInsuranceConfig((prev) => {
      const next = {
        ...prev,
        minLimit: Math.round(prev.minLimit * factor),
        maxLimit: Math.round(prev.maxLimit * factor),
      };
      nextConfig = next;
      return next;
    });

    // Add alert
    const logAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      title: 'ترفيع الأجر التأميني السنوي المقرّر',
      description: `تم إعمال الزيادة التأمينية بنسبة (${percentRatio}٪) على قوة الأجور المؤمنة لجميع العاملين، وزيادة الحد الأدنى والحد الأقصى للأنصبة.`,
      date: new Date().toISOString().split('T')[0],
      type: 'success',
    };
    setAlerts((prev) => [logAlert, ...prev]);

    if (isSupabaseConfigured()) {
      nextList.forEach(emp => syncUpsert('employees', emp, 'زيادة تأمينات موظف'));
      if (nextConfig!) syncUpsert('insurance_configs', nextConfig, 'تحديث حدود التأمين');
      syncUpsert('system_alerts', logAlert, 'تنبيه الزيادة التأمينية');
    }
  };

  // 7. Manual system notification creation
  const handleAddAlert = (alert: Omit<SystemAlert, 'id'>) => {
    const withId: SystemAlert = {
      ...alert,
      id: `alt-${Date.now()}`,
    };
    setAlerts((prev) => [withId, ...prev]);

    if (isSupabaseConfigured()) {
      syncUpsert('system_alerts', withId, 'تنبيه يدوي');
    }
  };

  // 8. Clear single notification
  const handleClearAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));

    if (isSupabaseConfigured()) {
      syncDelete('system_alerts', id, 'تنبيه');
    }
  };

  // 9. Delete Employee
  const handleDeleteEmployee = (empId: string) => {
    const target = employees.find(e => e.id === empId);
    setEmployees(prev => prev.filter(e => e.id !== empId));
    
    // Add alert
    const logAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      title: 'حذف بيانات موظف',
      description: `تم حذف بيانات الموظف "${target?.name || 'غير معروف'}" نهائياً من سجلات النظام.`,
      date: new Date().toISOString().split('T')[0],
      type: 'warning',
    };
    setAlerts((prev) => [logAlert, ...prev]);

    if (isSupabaseConfigured()) {
      syncDelete('employees', empId, 'موظف');
      syncUpsert('system_alerts', logAlert, 'تنبيه حذف');
    }
  };

  // 10. Batch Delete Employees
  const handleBatchDeleteEmployees = (empIds: string[]) => {
    console.log('Batch deleting IDs:', empIds);
    setEmployees(prev => prev.filter(e => !empIds.includes(e.id)));
    
    // Add alert
    const logAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      title: 'حذف جماعي للموظفين',
      description: `تم حذف بيانات عدد (${empIds.length}) موظف نهائياً من سجلات النظام.`,
      date: new Date().toISOString().split('T')[0],
      type: 'warning',
    };
    setAlerts((prev) => [logAlert, ...prev]);

    if (isSupabaseConfigured()) {
      syncDeleteMultiple('employees', empIds, 'موظفين');
      syncUpsert('system_alerts', logAlert, 'تنبيه حذف جماعي');
    }
  };

  // Factory reset demo data helper
  const handleFactoryResetData = () => {
    if (confirm('هل ترغب فعلياً في إعادة تهيئة النظام وحذف كل التعديلات لإعادة ملء كشوف العاملين المرجعية الافتراضية؟')) {
      localStorage.clear();
      setEmployees(initialEmployees);
      setDepartments(initialDepartments);
      setSections(initialSections);
      setJobTitles(initialJobTitles);
      setCostCenters(initialCostCenters);
      setInsuranceConfig(initialInsuranceConfig);
      setInsuranceOffices(initialInsuranceOffices);
      setResignationReasons(initialResignationReasons);
      setVacationTypes(initialVacationTypes);
      setVacationRequests(initialVacationRequests);
      setAttendance(initialAttendanceRecords);
      setSystemMonth(initialSystemMonth);
      setUserPermissions(initialUserPermissions);
      setAlerts(initialAlerts);
      setActiveTab('dashboard');
    }
  };

  // Apply custom Cairo font and directions style immediately on page mount
  useEffect(() => {
    document.title = "نظام شئون العاملين - الموارد البشرية";
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  // Wrapped state updater methods to synchronize via Supabase
  const handleUpdateDepartments = (next: Department[]) => {
    syncListDiff('departments', next, departments, 'إدارة');
    setDepartments(next);
  };
  const handleUpdateSections = (next: Section[]) => {
    syncListDiff('sections', next, sections, 'قسم');
    setSections(next);
  };
  const handleUpdateJobTitles = (next: JobTitle[]) => {
    syncListDiff('job_titles', next, jobTitles, 'وظيفة عمل');
    setJobTitles(next);
  };
  const handleUpdateCostCenters = (next: CostCenter[]) => {
    syncListDiff('cost_centers', next, costCenters, 'مركز تكلفة');
    setCostCenters(next);
  };
  const handleUpdateInsuranceConfig = (next: InsuranceConfig) => {
    syncUpsert('insurance_configs', next, 'شريحة تأمين');
    setInsuranceConfig(next);
  };
  const handleUpdateInsuranceOffices = (next: InsuranceOffice[]) => {
    syncListDiff('insurance_offices', next, insuranceOffices, 'مكتب تأمينات');
    setInsuranceOffices(next);
  };
  const handleUpdateResignationReasons = (next: ResignationReason[]) => {
    syncListDiff('resignation_reasons', next, resignationReasons, 'سبب استقالة');
    setResignationReasons(next);
  };
  const handleUpdateVacationTypes = (next: VacationType[]) => {
    syncListDiff('vacation_types', next, vacationTypes, 'نوع إجازة');
    setVacationTypes(next);
  };
  const handleUpdateUserPermissions = (next: UserPermission[]) => {
    syncListDiff('user_permissions', next, userPermissions, 'صلاحيات مستخدم');
    setUserPermissions(next);
  };
  const handleUpdateSystemMonth = (next: SystemMonth) => {
    const row = { id: 'current', year: next.year, month: next.month };
    syncUpsert('system_month', row, 'شهر النظام');
    setSystemMonth(next);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-600 selection:text-white flex flex-col antialiased">
      
      {/* Main Body Layout splits into Sidebar (Right side, RTL) and workspace (Left side) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Right Sidebar Navigation in Dark Slate Theme */}
        <aside id="main-sidebar" className="w-full md:w-72 bg-slate-900 text-white flex flex-col justify-between shrink-0 z-10 shadow-2xl border-l border-slate-800">
          <div>
            {/* Sidebar Branding Header */}
            <div className="p-6 border-b border-slate-800 mb-4 text-right">
              <div className="flex items-center gap-3 justify-start mb-1.5 pb-1">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/40 transform hover:scale-105 transition-all">
                  <Building2 className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tighter text-blue-400 font-sans leading-none">HR Pro</h1>
                  <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">نظام شؤون العاملين</span>
                </div>
              </div>
            </div>

            {/* Active User Switcher Corporate ID Section */}
            <div className="px-4 mb-4">
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2.5 text-right">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                    {activeUser.userName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[11px] font-bold text-slate-100 leading-tight truncate">{activeUser.userName}</h3>
                    <span className="text-[9px] text-slate-400 font-semibold">
                      الحقيبة: {activeUser.role === 'admin' ? 'مدير النظام العام' : activeUser.role === 'manager' ? 'مدير الموارد' : activeUser.role === 'reports' ? 'أخصائي التقارير' : 'مدخل حركات اليوم'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[8.5px] uppercase font-bold text-slate-500 block">تبديل الحساب الإداري النشط:</label>
                  <select
                    value={activeUserId}
                    onChange={(e) => {
                      setActiveUserId(e.target.value);
                      setActiveTab('dashboard'); // Safe reset tab to dashboard on swap
                    }}
                    className="w-full text-right py-1 px-2 bg-slate-900 border border-slate-700 hover:border-slate-650 rounded-lg text-[10.5px] text-slate-200 font-bold focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                  >
                    {userPermissions.map(u => (
                      <option key={u.id} value={u.id} className="text-slate-800 font-semibold bg-white">{u.userName} ({u.userCode})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-4 space-y-5">
              {/* Quick overview indicator */}
              <div className="px-4 py-2.5 bg-slate-850/40 rounded-xl space-y-1 text-xs border border-slate-800/60">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-medium text-[10.5px]">شهر العمل الحاكم:</span>
                  <span className="font-black text-blue-400 bg-slate-850 px-2 py-0.5 rounded-md text-[10px]">{systemMonth.month} / {systemMonth.year}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-medium text-[10.5px]">قوة الكشف النشطة:</span>
                  <span className="font-black text-emerald-400 bg-slate-850 px-2 py-0.5 rounded-md text-[10px]">{employees.filter(e => e.status === 'active').length} موظفاً</span>
                </div>
              </div>

              {/* Nav Menu */}
              <nav className="space-y-5">
                <section>
                  <h2 className="text-[9.5px] uppercase text-slate-500 font-black mb-2 px-3 tracking-widest">لوحة المتابعة</h2>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full text-right px-4 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'dashboard'
                        ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-900/50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="w-4 h-4 shrink-0 text-sky-400" />
                      <span>لوحة الإحصائيات والرئيسية</span>
                    </div>
                    {activeTab === 'dashboard' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                  </button>
                </section>

                <section>
                  <h2 className="text-[9.5px] uppercase text-slate-500 font-black mb-2 px-3 tracking-widest">الحركات والمدخلات</h2>
                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveTab('data_entry')}
                      className={`w-full text-right px-4 py-2 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'data_entry'
                          ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-900/50'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 shrink-0" />
                        <span className={!hasAccessToTab('data_entry') ? 'opacity-70' : ''}>إدخال الحركات والمسيرات</span>
                        {!hasAccessToTab('data_entry') && <Lock className="w-3 h-3 text-emerald-450/70 shrink-0 ml-1" />}
                      </div>
                      {activeTab === 'data_entry' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                    </button>

                    <button
                      onClick={() => setActiveTab('control_panel')}
                      className={`w-full text-right px-4 py-2 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                        activeTab === 'control_panel'
                          ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-900/50'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Sliders className="w-4 h-4 shrink-0" />
                        <span className={!hasAccessToTab('control_panel') ? 'opacity-70' : ''}>لوحة التحكم وتكويد المنشأة</span>
                        {!hasAccessToTab('control_panel') && <Lock className="w-3 h-3 text-emerald-450/70 shrink-0 ml-1" />}
                      </div>
                      {activeTab === 'control_panel' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                    </button>
                  </div>
                </section>

                <section>
                  <h2 className="text-[9.5px] uppercase text-slate-500 font-black mb-2 px-3 tracking-widest">التقارير و المستندات</h2>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`w-full text-right px-4 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'reports'
                        ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-900/50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 shrink-0" />
                      <span className={!hasAccessToTab('reports') ? 'opacity-70' : ''}>التقارير وسحب الكشوف</span>
                      {!hasAccessToTab('reports') && <Lock className="w-3 h-3 text-emerald-450/70 shrink-0 ml-1" />}
                    </div>
                    {activeTab === 'reports' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                  </button>
                </section>

                <section>
                  <h2 className="text-[9.5px] uppercase text-slate-500 font-black mb-2 px-3 tracking-widest">الإعدادات الكبرى</h2>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full text-right px-4 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-900/50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <SettingsIcon className="w-4 h-4 shrink-0" />
                      <span className={!hasAccessToTab('settings') ? 'opacity-70' : ''}>الإعدادات والخصائص العامة</span>
                      {!hasAccessToTab('settings') && <Lock className="w-3 h-3 text-emerald-450/70 shrink-0 ml-1" />}
                    </div>
                    {activeTab === 'settings' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                  </button>
                </section>
              </nav>
            </div>
          </div>

          {/* Reset / Clean state action at the bottom of sidebar */}
          <div className="p-6 border-t border-slate-800 mt-6">
            <button
              onClick={handleFactoryResetData}
              className="w-full py-2.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-750 hover:border-rose-900"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة تهيئة البيانات</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Workspace (Main rest of screen) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {activeTab === 'dashboard' && hasAccessToTab('dashboard') && (
            <Dashboard
              employees={employees}
              departments={departments}
              attendance={attendance}
              alerts={alerts}
              systemMonth={systemMonth}
              onClearAlert={handleClearAlert}
            />
          )}

          {activeTab === 'data_entry' && hasAccessToTab('data_entry') && (
            <DataEntry
              employees={employees}
              departments={departments}
              sections={sections}
              jobTitles={jobTitles}
              costCenters={costCenters}
              insuranceOffices={insuranceOffices}
              resignationReasons={resignationReasons}
              vacationTypes={vacationTypes}
              attendance={attendance}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onTerminateEmployee={handleTerminateEmployee}
              onAddVacationRequest={handleAddVacationRequest}
              onUpdateAttendance={handleUpdateAttendance}
              onBatchAddEmployees={handleBatchAddEmployees}
              onBatchUpdateAttendance={handleBatchUpdateAttendance}
              systemMonth={systemMonth}
            />
          )}

          {activeTab === 'reports' && hasAccessToTab('reports') && (
            <Reports
              employees={employees}
              departments={departments}
              sections={sections}
              jobTitles={jobTitles}
              costCenters={costCenters}
              vacationRequests={vacationRequests}
              attendance={attendance}
              resignationReasons={resignationReasons}
              vacationTypes={vacationTypes}
              systemMonth={systemMonth}
              onDeleteEmployee={handleDeleteEmployee}
              onBatchDeleteEmployees={handleBatchDeleteEmployees}
            />
          )}

          {activeTab === 'control_panel' && hasAccessToTab('control_panel') && (
            <ControlPanel
              departments={departments}
              sections={sections}
              jobTitles={jobTitles}
              costCenters={costCenters}
              insuranceConfig={insuranceConfig}
              insuranceOffices={insuranceOffices}
              resignationReasons={resignationReasons}
              vacationTypes={vacationTypes}
              onUpdateDepartments={handleUpdateDepartments}
              onUpdateSections={handleUpdateSections}
              onUpdateJobTitles={handleUpdateJobTitles}
              onUpdateCostCenters={handleUpdateCostCenters}
              onUpdateInsuranceConfig={handleUpdateInsuranceConfig}
              onUpdateInsuranceOffices={handleUpdateInsuranceOffices}
              onUpdateResignationReasons={handleUpdateResignationReasons}
              onUpdateVacationTypes={handleUpdateVacationTypes}
            />
          )}

          {activeTab === 'settings' && hasAccessToTab('settings') && (
            <Settings
              userPermissions={userPermissions}
              systemMonth={systemMonth}
              alerts={alerts}
              onUpdateUserPermissions={handleUpdateUserPermissions}
              onUpdateSystemMonth={handleUpdateSystemMonth}
              onCarryforwardBalances={handleCarryforwardBalances}
              onIncreaseInsurances={handleIncreaseInsurances}
              onAddAlert={handleAddAlert}
              onRemoveAlert={handleClearAlert}
              employees={employees}
              departments={departments}
              sections={sections}
              jobTitles={jobTitles}
              costCenters={costCenters}
              insuranceConfig={insuranceConfig}
              insuranceOffices={insuranceOffices}
              resignationReasons={resignationReasons}
              vacationTypes={vacationTypes}
              vacationRequests={vacationRequests}
              attendance={attendance}
            />
          )}

          {/* Shield/Denial Warning Panel if lack of access */}
          {!hasAccessToTab(activeTab) && (
            <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl text-center space-y-6">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-2 text-right sm:text-center">
                <h3 className="text-sm font-black text-slate-800">صلاحيات الوصول والتبويب غير كافية</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  عذراً، الحساب الحالي <strong className="text-slate-700">[{activeUser.userName}]</strong> لا يملك امتيازات كافية لتصفح أو العمل على لوحة <strong className="text-blue-600">[{
                    activeTab === 'data_entry' ? 'إدخال الحركات والمسيرات' :
                    activeTab === 'control_panel' ? 'تكويد المنشأة ولوحة السيطرة' :
                    activeTab === 'reports' ? 'التقارير وسحب الكشوف' :
                    activeTab === 'settings' ? 'الإعدادات والخصائص العامة' : ''
                  }]</strong>.
                </p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-xl text-[11px] text-slate-600 max-w-sm mx-auto space-y-2 border border-slate-100 text-right font-medium">
                <p className="font-bold border-b border-slate-200 pb-1 text-slate-700">
                  تفاصيل لوحة تراخيص الحساب النشط:
                </p>
                <div className="flex justify-between">
                  <span>صلاحية إدخال الحركات والمسيرات:</span>
                  <span className={activeUser.permissions?.dataEntry ? 'text-emerald-600 font-black' : 'text-rose-500'}>{activeUser.permissions?.dataEntry ? 'ممنوحة ✔' : 'محجوبة ✖'}</span>
                </div>
                <div className="flex justify-between">
                  <span>صلاحية عرض وتصدير التقارير:</span>
                  <span className={activeUser.permissions?.reports ? 'text-emerald-600 font-black' : 'text-rose-500'}>{activeUser.permissions?.reports ? 'ممنوحة ✔' : 'محجوبة ✖'}</span>
                </div>
                <div className="flex justify-between">
                  <span>صلاحية لوحة التحكم وتكويد المنشأة:</span>
                  <span className={activeUser.permissions?.controlPanel ? 'text-emerald-600 font-black' : 'text-rose-500'}>{activeUser.permissions?.controlPanel ? 'ممنوحة ✔' : 'محجوبة ✖'}</span>
                </div>
                <div className="flex justify-between">
                  <span>صلاحية شهر النظم والخصائص الكبرى:</span>
                  <span className={activeUser.permissions?.settings ? 'text-emerald-600 font-black' : 'text-rose-500'}>{activeUser.permissions?.settings ? 'ممنوحة ✔' : 'محجوبة ✖'}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const adminUser = userPermissions.find(x => x.userCode === 'admin' || x.role === 'admin') || userPermissions[0];
                    if (adminUser) {
                      setActiveUserId(adminUser.id);
                    }
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer font-sans"
                >
                  التبديل التلقائي لحساب المدير العام (admin)
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Styled Footer */}
      <footer className="bg-white border-t border-slate-100 py-3 text-center text-[10px] text-slate-400 shrink-0 font-sans select-none flex items-center justify-between px-6">
        <span>البوابة الإدارية لوحدة كشوف الخدمات لشئون العاملين - هاني معوض</span>
        <span>تحديث يونيو ٢٠٢٦ م ( ذو الحجة ١٤٤٧ هـ )</span>
      </footer>

    </div>
  );
}
