/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  Building,
  Briefcase,
  Bell,
  Clock,
  Cake,
  FileText,
  CreditCard,
  Shield,
} from 'lucide-react';
import { Employee, Department, AttendanceRecord, SystemAlert } from '../types';

interface DashboardProps {
  employees: Employee[];
  departments: Department[];
  attendance: AttendanceRecord[];
  alerts: SystemAlert[];
  systemMonth: { year: number; month: number };
  onClearAlert: (id: string) => void;
}

export default function Dashboard({
  employees,
  departments,
  attendance,
  alerts,
  systemMonth,
  onClearAlert,
}: DashboardProps) {
  // Stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'active').length;
  const terminatedEmployees = employees.filter((e) => e.status === 'terminated').length;

  // Let's count recent hires (hired in the system year - 2026 or last 6 months)
  const recentHires = employees.filter(
    (e) => e.status === 'active' && e.hireDate.startsWith(systemMonth.year.toString())
  ).length;

  // Today's attendance counts
  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const lateCount = attendance.filter((a) => a.status === 'late').length;
  const absentCount = attendance.filter((a) => a.status === 'absent').length;
  const excusedCount = attendance.filter((a) => a.status === 'excused').length;
  const totalTrackedToday = attendance.length;

  // Department distribution
  const deptStats = departments.map((dept) => {
    const count = employees.filter((e) => e.departmentId === dept.id && e.status === 'active').length;
    return {
      name: dept.name,
      count,
    };
  });

  const maxDeptCount = Math.max(...deptStats.map((d) => d.count), 1);

  // Month name in Arabic
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const currentMonthName = arabicMonths[systemMonth.month - 1] || '';
  const todayStr = new Date().toISOString().split('T')[0];

  // Hidden alerts persistence
  const [hiddenAlertIds, setHiddenAlertIds] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('hidden_dashboard_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  const handleHideAlert = (id: string) => {
    if (
      id.startsWith('contract-expiry-') ||
      id.startsWith('birthday-') ||
      id.startsWith('military-') ||
      id.startsWith('national-id-')
    ) {
      const updated = [...hiddenAlertIds, id];
      setHiddenAlertIds(updated);
      localStorage.setItem('hidden_dashboard_alerts', JSON.stringify(updated));
    } else {
      onClearAlert(id);
    }
  };

  // Helper to calculate days diff
  const getDaysDifference = (dateStr?: string): number | null => {
    if (!dateStr) return null;
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Generate requested dynamic alerts (contract expiry, birthday, military status, and national id expiry)
  const activeEmps = employees.filter((e) => e.status === 'active');

  // 1. Contract Expiries list
  const contractExpiriesList = activeEmps.map(emp => {
    const days = getDaysDifference(emp.contractExpiryDate);
    return { emp, days };
  }).filter((item) => item.days !== null && item.days >= 0 && item.days <= 30)
    .filter((item) => !hiddenAlertIds.includes(`contract-expiry-${item.emp.id}`));

  // 2. Month Birthdays list
  const birthdaysList = activeEmps.map(emp => {
    if (!emp.dateOfBirth) return null;
    const dobParts = emp.dateOfBirth.split('-');
    if (dobParts.length < 2) return null;
    const birthMonth = parseInt(dobParts[1], 10);
    const birthDay = dobParts[2] ? parseInt(dobParts[2], 10) : null;
    if (birthMonth === systemMonth.month) {
      return { emp, birthDay, birthMonth };
    }
    return null;
  }).filter((item): item is { emp: Employee; birthDay: number | null; birthMonth: number } => item !== null)
    .filter((item) => !hiddenAlertIds.includes(`birthday-${item.emp.id}-${systemMonth.year}-${systemMonth.month}`));

  // 3. Military Deferment Expiries list
  const militaryExpiriesList = activeEmps.map(emp => {
    const days = getDaysDifference(emp.militaryDefermentExpiryDate);
    return { emp, days };
  }).filter((item) => item.days !== null && item.days >= 0 && item.days <= 30)
    .filter((item) => !hiddenAlertIds.includes(`military-deferment-${item.emp.id}`));

  // 4. National ID Expiries list
  const nationalIdExpiriesList = activeEmps.map(emp => {
    const days = getDaysDifference(emp.nationalIdExpiry);
    return { emp, days };
  }).filter((item) => item.days !== null && item.days >= 0 && item.days <= 30)
    .filter((item) => !hiddenAlertIds.includes(`national-id-${item.emp.id}`));

  const totalMyAlertsCount = contractExpiriesList.length + birthdaysList.length + militaryExpiriesList.length + nationalIdExpiriesList.length;

  return (
    <div id="dashboard-section" className="space-y-8 dir-rtl text-right">
      {/* Upper header segment inspired by Bold Typography with active avatar details */}
      <header id="dashboard-header" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col">
          <span className="text-slate-400 text-xs font-black uppercase tracking-widest leading-none">نظرة عامة على المؤسسة</span>
          <h2 id="dashboard-title" className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2.5">
            الإحصائيات <span className="text-blue-600">الذكية</span>
          </h2>
        </div>
        <div id="system-time-badge" className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-xs border border-slate-100/90 hover:shadow-sm transition-all">
          <div className="text-right pl-4 border-l border-slate-100">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">شهر النظام الحالي</p>
            <p className="text-sm font-black text-slate-950 font-sans">{currentMonthName} {systemMonth.year}</p>
          </div>
          <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center font-black text-white text-xs select-none">
            HM
          </div>
        </div>
      </header>

      {/* 4 Premium Stats Cards Centered with Bold Typography */}
      <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div id="card-total-employees" className="bg-white p-8 rounded-[2rem] shadow-xs border border-slate-100 flex flex-col items-center justify-center space-y-2 text-center transition-all hover:scale-[1.02] hover:shadow-md">
          <span className="text-5xl font-black text-blue-600 font-mono tracking-tighter leading-none">{totalEmployees}</span>
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">إجمالي الموظفين</span>
        </div>

        {/* Active Employees */}
        <div id="card-active-employees" className="bg-white p-8 rounded-[2rem] shadow-xs border border-slate-100 flex flex-col items-center justify-center space-y-2 text-center transition-all hover:scale-[1.02] hover:shadow-md">
          <span className="text-5xl font-black text-emerald-500 font-mono tracking-tighter leading-none">{activeEmployees}</span>
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">نشط على رأس العمل</span>
        </div>

        {/* Recent Hires */}
        <div id="card-recent-hires" className="bg-white p-8 rounded-[2rem] shadow-xs border border-slate-100 flex flex-col items-center justify-center space-y-2 text-center transition-all hover:scale-[1.02] hover:shadow-md">
          <span className="text-5xl font-black text-amber-500 font-mono tracking-tighter leading-none">{recentHires}</span>
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">تعيينات جديدة ({systemMonth.year})</span>
        </div>

        {/* Resigned / Terminated */}
        <div id="card-terminated-employees" className="bg-white p-8 rounded-[2rem] shadow-xs border border-slate-100 flex flex-col items-center justify-center space-y-2 text-center transition-all hover:scale-[1.02] hover:shadow-md">
          <span className="text-5xl font-black text-slate-900 font-mono tracking-tighter leading-none">{terminatedEmployees}</span>
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">إنهاء الخدمة والأرشيف</span>
        </div>
      </div>

      {/* مركز تنبيهات ومتابعة الموارد البشرية الذكي */}
      <div id="alerts-section" className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200/80 flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              تنبيهات ومتابعات النظام الذكية ({totalMyAlertsCount})
            </h3>
            <p className="text-xs text-slate-500 font-bold mt-1">
              جدول زمني ومتابعة مستمرة لعقود الموظفين، أعياد الميلاد، التجنيد وبطاقات الهوية
            </p>
          </div>
          <span className="text-[10px] bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full font-black uppercase text-center self-start sm:self-center">
            إجراء فوري مطلوب
          </span>
        </div>

        {totalMyAlertsCount === 0 ? (
          <div className="bg-white p-10 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-800">بيانات وتواريخ سارية بالكامل!</h4>
              <p className="text-xs text-slate-400 font-bold">
                جميع ملفات الموظفين وعقودهم والوثائق الشخصية والمواقف العسكرية سليمة تماماً ولا توجد إجراءات معلقة حالياً.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Contract Expiries Section */}
            {contractExpiriesList.length > 0 && (
              <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-3 shadow-xs">
                <div className="flex items-center gap-2.5 text-amber-600 border-r-4 border-amber-500 pr-3.5">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <h4 className="text-sm font-black text-slate-800">تنبيهات عقود العمل التي أوشكت على الانتهاء</h4>
                  <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md">
                    {contractExpiriesList.length} موظفين
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <th className="p-3 w-20">كود الموظف</th>
                        <th className="p-3">اسم الموظف</th>
                        <th className="p-3">تاريخ انتهاء العقد</th>
                        <th className="p-3 text-center">المدة المتبقية</th>
                        <th className="p-3 text-left">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {contractExpiriesList.map(({ emp, days }) => (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-900 bg-slate-50/50 rounded-r-lg">{emp.code}</td>
                          <td className="p-3 font-extrabold text-slate-800">{emp.name}</td>
                          <td className="p-3 font-mono text-slate-600">{emp.contractExpiryDate}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold inline-block ${
                              days === 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {days === 0 ? 'ينتهي اليوم!' : `تبقي ${days} يوم`}
                            </span>
                          </td>
                          <td className="p-3 text-left rounded-l-lg">
                            <button
                              onClick={() => handleHideAlert(`contract-expiry-${emp.id}`)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer bg-rose-50/50 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              إخفاء التنبيه
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. Birthdays Section */}
            {birthdaysList.length > 0 && (
              <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-3 shadow-xs">
                <div className="flex items-center gap-2.5 text-pink-600 border-r-4 border-pink-500 pr-3.5">
                  <Cake className="w-5 h-5 text-pink-500" />
                  <h4 className="text-sm font-black text-slate-800">أعياد ميلاد منتسبي الكادر (خلال شهر {currentMonthName})</h4>
                  <span className="text-[10px] bg-pink-50 text-pink-700 font-bold px-2 py-0.5 rounded-md">
                    {birthdaysList.length} مناسبات لهذا الشهر
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <th className="p-3 w-20">كود الموظف</th>
                        <th className="p-3">اسم الموظف</th>
                        <th className="p-3">تاريخ الميلاد الكامل</th>
                        <th className="p-3 text-center">يوم المناسبة</th>
                        <th className="p-3 text-center">التهنئة السنوية</th>
                        <th className="p-3 text-left">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {birthdaysList.map(({ emp, birthDay }) => (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-900 bg-slate-50/50 rounded-r-lg">{emp.code}</td>
                          <td className="p-3 font-extrabold text-slate-800">{emp.name}</td>
                          <td className="p-3 font-mono text-slate-600">{emp.dateOfBirth}</td>
                          <td className="p-3 text-center">
                            <span className="bg-pink-50 text-pink-700 px-2.5 py-1 rounded-md text-[10px] font-bold inline-block">
                              {birthDay ? `يوم ${birthDay} الشهر` : 'هذا الشهر'}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold text-pink-600 text-[11px]">
                            كل عام وأنتم بألف خير 🎉🍰
                          </td>
                          <td className="p-3 text-left rounded-l-lg">
                            <button
                              onClick={() => handleHideAlert(`birthday-${emp.id}-${systemMonth.year}-${systemMonth.month}`)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer bg-rose-50/50 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              إخفاء التنبيه
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Military Deferments Section */}
            {militaryExpiriesList.length > 0 && (
              <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-3 shadow-xs">
                <div className="flex items-center gap-2.5 text-indigo-600 border-r-4 border-indigo-500 pr-3.5">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-sm font-black text-slate-800">مواعيد انتهاء تأجيل الخدمة العسكرية / التجنيد</h4>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
                    {militaryExpiriesList.length} معاملة عسكرية
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <th className="p-3 w-20">كود الموظف</th>
                        <th className="p-3">اسم الموظف</th>
                        <th className="p-3">تاريخ انتهاء التأجيل</th>
                        <th className="p-3 text-center">المدة المتبقية</th>
                        <th className="p-3 text-left">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {militaryExpiriesList.map(({ emp, days }) => (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-900 bg-slate-50/50 rounded-r-lg">{emp.code}</td>
                          <td className="p-3 font-extrabold text-slate-800">{emp.name}</td>
                          <td className="p-3 font-mono text-slate-600">{emp.militaryDefermentExpiryDate}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold inline-block ${
                              days === 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-700'
                            }`}>
                              {days === 0 ? 'ينتهي اليوم!' : `تبقي ${days} يوم`}
                            </span>
                          </td>
                          <td className="p-3 text-left rounded-l-lg">
                            <button
                              onClick={() => handleHideAlert(`military-deferment-${emp.id}`)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer bg-rose-50/50 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              إخفاء التنبيه
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. National ID Expiries Section */}
            {nationalIdExpiriesList.length > 0 && (
              <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-3 shadow-xs">
                <div className="flex items-center gap-2.5 text-rose-600 border-r-4 border-rose-500 pr-3.5">
                  <CreditCard className="w-5 h-5 text-rose-500" />
                  <h4 className="text-sm font-black text-slate-800">مواعيد نهاية صلاحية بطاقات الهوية الرقمية / الشخصية</h4>
                  <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-md">
                    {nationalIdExpiriesList.length} هويات شخصية
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <th className="p-3 w-20">كود الموظف</th>
                        <th className="p-3">اسم الموظف</th>
                        <th className="p-3">تاريخ انتهاء البطاقة</th>
                        <th className="p-3 text-center">المدة المتبقية</th>
                        <th className="p-3 text-left">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {nationalIdExpiriesList.map(({ emp, days }) => (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-900 bg-slate-50/50 rounded-r-lg">{emp.code}</td>
                          <td className="p-3 font-extrabold text-slate-800">{emp.name}</td>
                          <td className="p-3 font-mono text-slate-600">{emp.nationalIdExpiry}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold inline-block ${
                              days === 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-rose-55 text-rose-700'
                            }`}>
                              {days === 0 ? 'تنتهي اليوم!' : `تبقي ${days} يوم`}
                            </span>
                          </td>
                          <td className="p-3 text-left rounded-l-lg">
                            <button
                              onClick={() => handleHideAlert(`national-id-${emp.id}`)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer bg-rose-50/50 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              إخفاء التنبيه
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main analytical visuals containing Dept bars and Attendances */}
      <div id="analytics-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Distribution Chart (takes 2 cols on lg screens) */}
        <div id="dept-chart-container" className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-xs border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                توزيع الموظفين حسب الإدارة
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-black uppercase tracking-wider">الإدارات المعتمدة</span>
            </div>

            {/* Custom elegant presentation with generous negative space and bold elements */}
            <div className="space-y-5 my-4">
              {deptStats.map((dept, index) => {
                const percentage = Math.round((dept.count / maxDeptCount) * 100);
                const colors = [
                  'bg-blue-600', 
                  'bg-emerald-500', 
                  'bg-amber-500', 
                  'bg-indigo-600', 
                  'bg-rose-500',
                  'bg-violet-500'
                ];
                const activeColor = colors[index % colors.length];

                return (
                  <div key={dept.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-slate-700">
                      <span className="font-bold text-[13px]">{dept.name}</span>
                      <span className="font-black font-sans bg-slate-50 px-2.5 py-0.5 rounded border border-slate-100">{dept.count} موظف</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full rounded-full transition-all duration-750 ${activeColor}`}
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-6 pt-4 border-t border-slate-100">
            * الإحصائية أعلاه تحتسب الموظفين المسجلين كـ "نشطين" فقط في قاعدة بيانات شهر النظام الحالي.
          </div>
        </div>

        {/* Today's Attendance breakdown */}
        <div id="attendance-breakdown-container" className="bg-white rounded-[2.5rem] p-8 shadow-xs border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                حضور اليوم
              </h3>
              <span className="text-[10px] bg-slate-150 text-slate-600 px-3 py-1 rounded-full font-black uppercase">{todayStr}</span>
            </div>

            {/* Attendance Ring Chart (SVG) */}
            <div className="flex flex-col items-center justify-center my-4 py-2 relative">
              <svg className="w-36 h-36 transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  className="stroke-slate-100 fill-none"
                  strokeWidth="12"
                />
                
                {/* Present percentage indicator */}
                {totalTrackedToday > 0 && (
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    className="stroke-emerald-500 fill-none transition-all duration-500"
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - (presentCount + lateCount) / totalTrackedToday)}`}
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {totalTrackedToday > 0 ? Math.round(((presentCount + lateCount) / totalTrackedToday) * 100) : 0}%
                </span>
                <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-0.5">نسبة التواجد</span>
              </div>
            </div>

            {/* Attendance breakdown list */}
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-slate-500 font-bold">حضور</p>
                  <p className="font-extrabold text-emerald-800 font-mono text-sm mt-0.5">{presentCount}</p>
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>

              <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-slate-500 font-bold">متأخرين</p>
                  <p className="font-extrabold text-amber-800 font-mono text-sm mt-0.5">{lateCount}</p>
                </div>
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              </div>

              <div className="p-2.5 bg-rose-50/55 border border-rose-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-slate-500 font-bold">غياب</p>
                  <p className="font-extrabold text-rose-800 font-mono text-sm mt-0.5">{absentCount}</p>
                </div>
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
              </div>

              <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-slate-500 font-bold">إجازات</p>
                  <p className="font-extrabold text-blue-800 font-mono text-sm mt-0.5">{excusedCount}</p>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-5 text-center">
            إجمالي الحضور المسجل اليوم: <span className="font-mono font-black text-slate-700">{totalTrackedToday}</span> موظفين
          </p>
        </div>
      </div>
    </div>
  );
}
