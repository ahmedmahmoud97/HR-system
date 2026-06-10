/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  ArrowDownToLine,
  Printer,
  Users,
  Briefcase,
  Building,
  Calendar,
  XCircle,
  Clock,
  Coins,
} from 'lucide-react';
import {
  Employee,
  Department,
  Section,
  JobTitle,
  CostCenter,
  VacationRequest,
  AttendanceRecord,
  ResignationReason,
  VacationType,
} from '../types';
import { Trash2 } from 'lucide-react';

interface ReportsProps {
  employees: Employee[];
  departments: Department[];
  sections: Section[];
  jobTitles: JobTitle[];
  costCenters: CostCenter[];
  vacationRequests: VacationRequest[];
  attendance: AttendanceRecord[];
  resignationReasons: ResignationReason[];
  vacationTypes: VacationType[];
  systemMonth: { year: number; month: number };
  onDeleteEmployee: (id: string) => void;
  onBatchDeleteEmployees: (ids: string[]) => void;
}

type ReportType =
  | 'current_employees'
  | 'new_hires'
  | 'resignations'
  | 'vacations'
  | 'vacation_balances'
  | 'attendance_log'
  | 'org_summary';

export default function Reports({
  employees,
  departments,
  sections,
  jobTitles,
  costCenters,
  vacationRequests,
  attendance,
  resignationReasons,
  vacationTypes,
  systemMonth,
  onDeleteEmployee,
  onBatchDeleteEmployees,
}: ReportsProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>('current_employees');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedEmployeeCard, setSelectedEmployeeCard] = useState<Employee | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState(''); // for attendance

  // Helper resolvers
  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name || '--';
  const getSectionName = (id: string) => sections.find((s) => s.id === id)?.name || '--';
  const getJobName = (id: string) => jobTitles.find((j) => j.id === id)?.name || '--';
  const getCostCenterName = (id: string) => costCenters.find((cc) => cc.id === id)?.name || '--';
  const getResignationReason = (id?: string) => resignationReasons.find((r) => r.id === id)?.reason || '--';
  const getVacationType = (id: string) => vacationTypes.find((v) => v.id === id)?.name || '--';

  // Format Helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(val);
  };

  // Filtered queries
  const activeEmployees = employees.filter((e) => e.status === 'active');
  const termEmployees = employees.filter((e) => e.status === 'terminated');

  // Search filter
  const filterBySearchNameCode = (list: Employee[]) => {
    return list.filter(
      (emp) =>
        (emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.code.includes(searchQuery)) &&
        (selectedDeptFilter === '' || emp.departmentId === selectedDeptFilter)
    );
  };

  // 1. Current Employees report list
  const currentEmployeesReportData = filterBySearchNameCode(activeEmployees);

  // 2. New Hires report (hired in current system year 2026)
  const newHiresReportData = filterBySearchNameCode(activeEmployees).filter((emp) =>
    emp.hireDate.startsWith(systemMonth.year.toString())
  );

  // 3. Resignations/Terminations List
  const resignationsReportData = filterBySearchNameCode(termEmployees);

  // 4. Vacation Request Log Report
  const filteredVacationHistory = vacationRequests.filter((req) => {
    const emp = employees.find((e) => e.id === req.employeeId);
    if (!emp) return false;
    const nameMatch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.code.includes(searchQuery);
    const deptMatch = selectedDeptFilter === '' || emp.departmentId === selectedDeptFilter;
    return nameMatch && deptMatch;
  });

  // 5. Vacation Balances report
  const vacationBalancesData = filterBySearchNameCode(activeEmployees);

  // 6. Attendance Log Report
  const filteredAttendance = attendance.filter((log) => {
    const emp = employees.find((e) => e.id === log.employeeId);
    if (!emp) return false;
    const nameMatch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.code.includes(searchQuery);
    const deptMatch = selectedDeptFilter === '' || emp.departmentId === selectedDeptFilter;
    const dateMatch = selectedDateFilter === '' || log.date === selectedDateFilter;
    return nameMatch && deptMatch && dateMatch;
  });

  // Print simulation
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="reports-section" className="space-y-8 dir-rtl text-right">
      {/* Header with Bold Display Typography */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col text-right">
          <span className="text-slate-400 text-xs font-black uppercase tracking-widest leading-none">تفريغ وتحليل المسيرات الإدارية والمالية</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2.5">
            التقارير <span className="text-blue-600">وسحب السجلات</span>
          </h2>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={handlePrint}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border border-slate-800 text-xs font-black tracking-wider uppercase flex items-center gap-2 cursor-pointer transition-all shadow-lg"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>طباعة الكشف الورقي</span>
          </button>
        </div>
      </header>

      {/* Report Switcher & Controls Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Selecting Column Sidebar styled like a premium box */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xs space-y-1.5 h-fit">
          <p className="text-[10px] font-black text-slate-400 px-2 py-1 mb-3 uppercase tracking-widest">فهرس التقارير والمخرجات</p>

          <button
            onClick={() => { setSelectedReport('current_employees'); setSearchQuery(''); setSelectedDeptFilter(''); }}
            className={`w-full text-right p-3.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
              selectedReport === 'current_employees'
                ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-900/30'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-bold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 shrink-0" />
              <span>تقرير الموظفين الحاليين</span>
            </div>
            {selectedReport === 'current_employees' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
          </button>

          <button
            onClick={() => { setSelectedReport('new_hires'); setSearchQuery(''); setSelectedDeptFilter(''); }}
            className={`w-full text-right p-3.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
              selectedReport === 'new_hires'
                ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-900/30'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-bold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>تقرير التعيينات الجديدة</span>
            </div>
            {selectedReport === 'new_hires' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
          </button>

          <button
            onClick={() => { setSelectedReport('resignations'); setSearchQuery(''); setSelectedDeptFilter(''); }}
            className={`w-full text-right p-3.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
              selectedReport === 'resignations'
                ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-900/30'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-bold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>سجل إنهاء الخدمة والاستقالات</span>
            </div>
            {selectedReport === 'resignations' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
          </button>

          <button
            onClick={() => { setSelectedReport('vacations'); setSearchQuery(''); setSelectedDeptFilter(''); }}
            className={`w-full text-right p-3.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
              selectedReport === 'vacations'
                ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-900/30'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-bold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 shrink-0 text-violet-500" />
              <span>تقرير الإجازات التفصيلي</span>
            </div>
            {selectedReport === 'vacations' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
          </button>

          <button
            onClick={() => { setSelectedReport('vacation_balances'); setSearchQuery(''); setSelectedDeptFilter(''); }}
            className={`w-full text-right p-3.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
              selectedReport === 'vacation_balances'
                ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-900/30'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-bold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Coins className="w-4 h-4 shrink-0 text-amber-500" />
              <span>كشف أرصدة الإجازات</span>
            </div>
            {selectedReport === 'vacation_balances' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
          </button>

          <button
            onClick={() => { setSelectedReport('attendance_log'); setSearchQuery(''); setSelectedDeptFilter(''); setSelectedDateFilter(''); }}
            className={`w-full text-right p-3.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
              selectedReport === 'attendance_log'
                ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-900/30'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-bold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>تقرير الحضور والانصراف اليومي</span>
            </div>
            {selectedReport === 'attendance_log' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
          </button>

          <button
            onClick={() => { setSelectedReport('org_summary'); setSearchQuery(''); setSelectedDeptFilter(''); }}
            className={`w-full text-right p-3.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
              selectedReport === 'org_summary'
                ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-900/30'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 font-bold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 shrink-0 text-slate-500" />
              <span>تقريط بالوظائف والإدارات</span>
            </div>
            {selectedReport === 'org_summary' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
          </button>
        </div>

        {/* Content Column Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filtering Widgets (not shown for org_summary count) */}
          {selectedReport !== 'org_summary' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap gap-4 items-center">
              {/* Search text filter */}
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-4.5 h-4.5 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="ابحث بكود الموظف أو الاسم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-11 pl-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                />
              </div>

              {/* Department filter */}
              <div className="min-w-[150px] relative">
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 appearance-none cursor-pointer"
                >
                  <option value="">كل الإدارات الرئيسية</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Specific Date Filter for Attendance */}
              {selectedReport === 'attendance_log' && (
                <div className="min-w-[150px] flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold shrink-0">التاريخ:</span>
                  <input
                    type="date"
                    value={selectedDateFilter}
                    onChange={(e) => setSelectedDateFilter(e.target.value)}
                    className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none text-center focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              )}
            </div>
          )}

          {/* Actual Report Views rendering inside container */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            
            {/* View 1: Current Employees */}
            {selectedReport === 'current_employees' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800">الموظفون الحاليون المسجلون بالتأمينات وتاريخ تسكينهم</h3>
                  <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                      <button
                        onClick={() => {
                          onBatchDeleteEmployees(selectedIds);
                          setSelectedIds([]);
                        }}
                        className="text-xs bg-rose-50 text-rose-700 px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 hover:bg-rose-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        حذف المحدد ({selectedIds.length})
                      </button>
                    )}
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                      إجمالي {currentEmployeesReportData.length} موظفاً
                    </span>
                  </div>
                </div>

                {currentEmployeesReportData.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs">لا يوجد بيانات تطابق معايير وتصنيفات البحث.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-[11px] border-collapse min-w-[1200px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="p-2.5 w-10">
                            <input 
                              type="checkbox" 
                              checked={selectedIds.length === currentEmployeesReportData.length && currentEmployeesReportData.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedIds(currentEmployeesReportData.map(e => e.id));
                                else setSelectedIds([]);
                              }}
                            />
                          </th>
                          <th className="p-2.5">الكود</th>
                          <th className="p-2.5">الاسم الكامل (معاينة)</th>
                          <th className="p-2.5">الجنس</th>
                          <th className="p-2.5">الرقم القومي</th>
                          <th className="p-2.5">رقم الهاتف</th>
                          <th className="p-2.5">تليفون آخر</th>
                          <th className="p-2.5">الإدارة</th>
                          <th className="p-2.5 font-sans">المسمى الوظيفي</th>
                          <th className="p-2.5">القسم</th>
                          <th className="p-2.5 font-mono">تاريخ التعيين</th>
                          <th className="p-2.5 text-left font-mono">الراتب الأساسي</th>
                          <th className="p-2.5 text-left font-mono">الأجر التأميني</th>
                          <th className="p-2.5 text-left font-mono text-blue-700">الراتب الفعلي</th>
                          <th className="p-2.5 text-center">خدمة الملف</th>
                          <th className="p-2.5">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {currentEmployeesReportData.map((emp) => (
                          <tr key={emp.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5">
                              <input 
                                type="checkbox" 
                                checked={selectedIds.includes(emp.id)}
                                onChange={() => setSelectedIds(prev => prev.includes(emp.id) ? prev.filter(id => id !== emp.id) : [...prev, emp.id])}
                              />
                            </td>
                            <td className="p-2.5 font-mono font-bold text-slate-600">{emp.code}</td>
                            <td className="p-2.5">
                              <button
                                type="button"
                                onClick={() => setSelectedEmployeeCard(emp)}
                                className="font-black text-blue-600 hover:underline hover:text-blue-800 text-right cursor-pointer"
                              >
                                {emp.name}
                              </button>
                            </td>
                            <td className="p-2.5">{emp.gender || 'ذكر'}</td>
                            <td className="p-2.5 font-mono text-slate-500">{emp.nationalId}</td>
                            <td className="p-2.5 font-mono text-slate-600">{emp.phone || '--'}</td>
                            <td className="p-2.5 font-mono text-slate-400">{emp.altPhone || '--'}</td>
                            <td className="p-2.5 font-medium">{getDeptName(emp.departmentId)}</td>
                            <td className="p-2.5">{getJobName(emp.jobId)}</td>
                            <td className="p-2.5 text-slate-500">{getSectionName(emp.sectionId)}</td>
                            <td className="p-2.5 font-mono">{emp.hireDate}</td>
                            <td className="p-2.5 text-left font-mono text-emerald-700 font-medium">{formatCurrency(emp.basicSalary)}</td>
                            <td className="p-2.5 text-left font-mono text-slate-500">{formatCurrency(emp.insuranceSalary)}</td>
                            <td className="p-2.5 text-left font-mono text-blue-700 font-bold">{emp.actualSalary ? formatCurrency(emp.actualSalary) : '--'}</td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => setSelectedEmployeeCard(emp)}
                                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-1 rounded font-bold cursor-pointer transition-colors"
                              >
                                عرض الكارت الشامل
                              </button>
                            </td>
                            <td className="p-2.5">
                              <button onClick={() => {
                                if (confirm(`حذف الموظف ${emp.name}؟`)) {
                                  onDeleteEmployee(emp.id);
                                }
                              }} className="text-rose-500 hover:text-rose-700">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* View 2: New Hires */}
            {selectedReport === 'new_hires' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800">كشف تعيينات العام المالي ({systemMonth.year}) الجاري</h3>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold">
                    حركة تعيين: {newHiresReportData.length} موظفاً
                  </span>
                </div>

                {newHiresReportData.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs">لا توجد حركات تعيين جديدة مسجلة خلال هذا الربع المالي.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-[11px] border-collapse min-w-[950px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="p-3">كود</th>
                          <th className="p-3">الاسم كامل (معاينة)</th>
                          <th className="p-3">الجنس</th>
                          <th className="p-3">الإدارة والقسم</th>
                          <th className="p-3 font-sans">المسمى الوظيفي</th>
                          <th className="p-3">المؤهل الدراسي</th>
                          <th className="p-3 font-mono">تاريخ التعيين</th>
                          <th className="p-3 text-left font-mono">الراتب الأساسي</th>
                          <th className="p-3 text-left font-mono text-blue-700">الراتب الفعلي</th>
                          <th className="p-3 font-mono">الهاتف الرئيسي</th>
                          <th className="p-3 font-mono">هاتف إضافي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {newHiresReportData.map((emp) => (
                          <tr key={emp.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono font-bold text-slate-600">{emp.code}</td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => setSelectedEmployeeCard(emp)}
                                className="font-bold text-blue-600 hover:underline text-right cursor-pointer"
                              >
                                {emp.name}
                              </button>
                            </td>
                            <td className="p-3">{emp.gender || 'ذكر'}</td>
                            <td className="p-3">{getDeptName(emp.departmentId)} - {getSectionName(emp.sectionId)}</td>
                            <td className="p-3 italic text-slate-600">{getJobName(emp.jobId)}</td>
                            <td className="p-3">{emp.qualification || '--'}</td>
                            <td className="p-3 font-mono text-emerald-700 font-bold">{emp.hireDate}</td>
                            <td className="p-3 text-left font-mono">{formatCurrency(emp.basicSalary)}</td>
                            <td className="p-3 text-left font-mono font-bold text-blue-700">{emp.actualSalary ? formatCurrency(emp.actualSalary) : '--'}</td>
                            <td className="p-3 font-mono">{emp.phone || '--'}</td>
                            <td className="p-3 font-mono text-slate-400">{emp.altPhone || '--'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* View 3: Resignations */}
            {selectedReport === 'resignations' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800">دفتر الاستقالات وإنهاء التعاقد المالي والأرشفة</h3>
                  <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-mono font-bold">
                    مستقيل: {resignationsReportData.length} موظفاً
                  </span>
                </div>

                {resignationsReportData.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs">لا يوجد استقالات أو عقود عمل منتهية نشطة في الكشف المالي.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-[11px] border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-rose-50/40 text-rose-800 font-bold border-b border-rose-100">
                          <th className="p-3">كود</th>
                          <th className="p-3">الاسم رباعي</th>
                          <th className="p-3">تاريخ التعيين</th>
                          <th className="p-3 font-mono">تاريخ إنهاء الخدمة</th>
                          <th className="p-3">أسباب الاستقالة ومبرراتها</th>
                          <th className="p-3">الإدارة السابقة</th>
                          <th className="p-3 font-mono text-left">التأمين الملغي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {resignationsReportData.map((emp) => (
                          <tr key={emp.id} className="hover:bg-rose-50/10">
                            <td className="p-3 font-mono font-bold text-rose-700">{emp.code}</td>
                            <td className="p-3 font-bold text-slate-800 line-through decoration-rose-400 decoration-1">{emp.name}</td>
                            <td className="p-3 font-mono text-xs">{emp.hireDate}</td>
                            <td className="p-3 font-mono text-rose-600 font-bold">{emp.terminationDate}</td>
                            <td className="p-3 text-slate-600 font-medium bg-rose-50/20">{getResignationReason(emp.terminationReasonId)}</td>
                            <td className="p-3 text-xs">{getDeptName(emp.departmentId)}</td>
                            <td className="p-3 font-mono text-left">{emp.insuranceNumber || 'غير مؤمن عليه'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* View 4: Vacation Request Details */}
            {selectedReport === 'vacations' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800">تفاصيل حركات الإجازت الممنوحة وسجل الطلبات معلقة</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                    طلب إجازة: {filteredVacationHistory.length}
                  </span>
                </div>

                {filteredVacationHistory.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs">لا يوجد تفريغ لحركات طلبات إجازة تطابق البحث.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-[11px] border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="p-3">المقدم</th>
                          <th className="p-3">نوع الإجازة</th>
                          <th className="p-3 font-mono">تاريخ البدء</th>
                          <th className="p-3 font-mono">تاريخ العودة</th>
                          <th className="p-3 font-mono">مدة الإجازة</th>
                          <th className="p-3">حالة الطلب الإداري</th>
                          <th className="p-3">البيان والملاحظة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredVacationHistory.map((req) => {
                          const emp = employees.find((e) => e.id === req.employeeId);
                          return (
                            <tr key={req.id} className="hover:bg-slate-50/50">
                              <td className="p-3">
                                <span className="font-bold text-slate-800">{emp?.name}</span>
                                <span className="text-[10px] text-slate-400 block font-mono">كود: {emp?.code} [{getDeptName(emp?.departmentId || '')}]</span>
                              </td>
                              <td className="p-3 font-medium text-slate-700">{getVacationType(req.vacationTypeId)}</td>
                              <td className="p-3 font-mono">{req.startDate}</td>
                              <td className="p-3 font-mono">{req.endDate}</td>
                              <td className="p-3 font-mono font-bold text-violet-700 bg-violet-50/30 text-center rounded">{req.days} يوماً</td>
                              <td className="p-3 font-sans">
                                {req.status === 'approved' ? (
                                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-semibold border border-emerald-100">مقبولة ومخصومة</span>
                                ) : req.status === 'rejected' ? (
                                  <span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-semibold border border-rose-100">مرفوضة من الإدارة</span>
                                ) : (
                                  <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-semibold border border-amber-100 animate-pulse">قيد فحص الرصيد</span>
                                )}
                              </td>
                              <td className="p-3 text-slate-500 italic max-w-[200px] truncate">{req.notes || '--'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* View 5: Vacation Balances */}
            {selectedReport === 'vacation_balances' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800">أرصدة إجازات العاملين والاستنفاد السنوي</h3>
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-mono font-bold">
                    إجمالي الرصيد المتاح لقوة العمل النشطة
                  </span>
                </div>

                {vacationBalancesData.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs">لا يوجد بيانات إجازات.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-[11px] border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="p-3">كود</th>
                          <th className="p-3">اسم الموظف</th>
                          <th className="p-3 text-center">الرصيد الأصلي لمستوى الخدمة</th>
                          <th className="p-3 text-center font-bold text-emerald-700">الرصيد المتبقي (الحال)</th>
                          <th className="p-3 text-center font-bold text-rose-700 font-mono">الإجازات المستنفذة</th>
                          <th className="p-3 text-left">مؤشر الكفاية المئوي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {vacationBalancesData.map((emp) => {
                          const consumed = Math.max(emp.initialVacationBalance - emp.vacationBalance, 0);
                          const safePct = Math.round((emp.vacationBalance / (emp.initialVacationBalance || 1)) * 100);

                          return (
                            <tr key={emp.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-bold text-slate-600">{emp.code}</td>
                              <td className="p-3 font-bold text-slate-800">{emp.name}</td>
                              <td className="p-3 text-center font-mono">{emp.initialVacationBalance} يوم</td>
                              <td className="p-3 text-center font-mono font-bold text-emerald-700 bg-emerald-50/20">{emp.vacationBalance} يوم</td>
                              <td className="p-3 text-center font-mono font-bold text-rose-700 bg-rose-50/20">{consumed} يوم</td>
                              <td className="p-3 text-left font-mono">
                                <div className="flex items-center gap-2 justify-end">
                                  <span className="text-[10px] text-slate-500">{safePct}%</span>
                                  <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden flex">
                                    <div
                                      className={`h-full rounded-full ${safePct > 50 ? 'bg-emerald-500' : safePct > 25 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                      style={{ width: `${safePct}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* View 6: Attendance Log Record */}
            {selectedReport === 'attendance_log' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800">بيانات حركة الحاضر، المتأخر، والغياب</h3>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold">
                    حركة حضور مفصّلة: {filteredAttendance.length} سجلات
                  </span>
                </div>

                {filteredAttendance.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs">لا يوجد سجلات حضور مسجلة تطابق الموعد والبحث.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-[11px] border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="p-3">اليوم والتاريخ</th>
                          <th className="p-3">كود</th>
                          <th className="p-3">الاسم ثلاثي</th>
                          <th className="p-3">الإدارة</th>
                          <th className="p-3">حالة التواجد</th>
                          <th className="p-3 text-center font-mono">وقت الحضور</th>
                          <th className="p-3 text-center font-mono">وقت الانصراف</th>
                          <th className="p-3">ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredAttendance.map((log) => {
                          const emp = employees.find((e) => e.id === log.employeeId);
                          return (
                            <tr key={log.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-bold text-slate-600 bg-slate-50/20">{log.date}</td>
                              <td className="p-3 font-mono font-semibold">{emp?.code}</td>
                              <td className="p-3 font-medium text-slate-800">{emp?.name}</td>
                              <td className="p-3">{getDeptName(emp?.departmentId || '')}</td>
                              <td className="p-3 font-sans">
                                {log.status === 'present' ? (
                                  <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">حاضر</span>
                                ) : log.status === 'late' ? (
                                  <span className="bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">متأخر</span>
                                ) : log.status === 'absent' ? (
                                  <span className="bg-rose-50 text-rose-800 px-2.5 py-0.5 rounded-full font-bold">غائب غياب غير مبرر</span>
                                ) : (
                                  <span className="bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full font-bold">مأذون إجازة</span>
                                )}
                              </td>
                              <td className="p-3 text-center font-mono text-xs">{log.clockIn || '--'}</td>
                              <td className="p-3 text-center font-mono text-xs">{log.clockOut || '--'}</td>
                              <td className="p-3 text-slate-600 font-medium italic">{log.notes || '--'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* View 7: Org Summary Matrix */}
            {selectedReport === 'org_summary' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">كشف الملاك الوظيفي الموزع على الإدارات المعتمدة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {departments.map((dept) => {
                      const count = employees.filter((e) => e.departmentId === dept.id && e.status === 'active').length;
                      return (
                        <div key={dept.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                            <span className="font-bold text-slate-800 text-xs">{dept.name}</span>
                          </div>
                          <span className="font-mono text-xs text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md font-bold">
                            {count} موظفين نشطين
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">كشف الملاك الوظيفي الموزع على المسميات المهنية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobTitles.map((job) => {
                      const count = employees.filter((e) => e.jobId === job.id && e.status === 'active').length;
                      return (
                        <div key={job.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="font-bold text-slate-800 text-xs">{job.name}</span>
                          </div>
                          <span className="font-mono text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md font-bold">
                            {count} موظفين نشطين
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Comprehensive HR Employee Card Modal */}
      {selectedEmployeeCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in print:p-0 print:static print:bg-transparent overflow-y-auto">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col text-right dir-rtl print:shadow-none print:border-none print:max-h-full print:w-full print:static" dir="rtl">
            
            {/* Header / Actions */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">الملف الإداري الرقمي الموحد</h3>
                  <p className="text-[10px] text-slate-500 font-bold">كارت الموظف الشامل لجميع الملحقات والمسيرات</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const printContents = document.getElementById('printable-employee-card')?.innerHTML;
                    if (printContents) {
                      const originalContents = document.body.innerHTML;
                      document.body.innerHTML = `<div class="dir-rtl text-right p-8" style="direction: rtl; text-align: right;">${printContents}</div>`;
                      window.print();
                      document.body.innerHTML = originalContents;
                      window.location.reload(); // Quick restore React state
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الملف الفردي</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEmployeeCard(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  إغلاق نافذة العرض
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div id="printable-employee-card" className="p-8 space-y-6 overflow-y-auto flex-1">
              
              {/* Profile Card Header Segment */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                {/* Photo Element */}
                <div className="shrink-0">
                  {selectedEmployeeCard.personalPhoto ? (
                    <img
                      src={selectedEmployeeCard.personalPhoto}
                      alt={selectedEmployeeCard.name}
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center border-2 border-dashed border-blue-200 font-black text-xl">
                      <span>{selectedEmployeeCard.name.trim().charAt(0)}</span>
                      <span className="text-[9px] text-blue-400 mt-1 font-bold">بدون صورة</span>
                    </div>
                  )}
                </div>

                {/* Primary Meta */}
                <div className="text-center sm:text-right space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <span className="bg-slate-900 text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-md">
                      كود: {selectedEmployeeCard.code}
                    </span>
                    <span className="bg-blue-50 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                      {getDeptName(selectedEmployeeCard.departmentId)}
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {getJobName(selectedEmployeeCard.jobId)}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">{selectedEmployeeCard.name}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {getSectionName(selectedEmployeeCard.sectionId)} • تاريخ التعيين والمباشرة: <span className="font-mono font-bold text-slate-800">{selectedEmployeeCard.hireDate}</span>
                  </p>
                </div>
              </div>

              {/* Grid 1: البيانات الشخصية والأساسية */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-blue-600 border-r-2 border-blue-600 pr-2.5">البيانات الشخصية وأوراق الثبوتية</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">الرقم القومي (14 رقم)</span>
                    <span className="text-xs text-slate-800 font-mono font-black">{selectedEmployeeCard.nationalId}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">تاريخ نهاية صلاحية البطاقة</span>
                    <span className="text-xs text-slate-800 font-mono font-bold">{selectedEmployeeCard.nationalIdExpiry || '--'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">الجنس</span>
                    <span className="text-xs text-slate-800 font-bold">{selectedEmployeeCard.gender || 'ذكور'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">تاريخ الميلاد</span>
                    <span className="text-xs text-slate-800 font-mono font-bold">{selectedEmployeeCard.dateOfBirth || '--'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">محل الميلاد</span>
                    <span className="text-xs text-slate-800 font-bold">{selectedEmployeeCard.placeOfBirth || '--'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">الحالة الاجتماعية</span>
                    <span className="text-xs text-slate-800 font-bold">{selectedEmployeeCard.socialStatus || 'غير محدد'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">رقم الهاتف الأساسي</span>
                    <span className="text-xs text-slate-800 font-mono font-bold">{selectedEmployeeCard.phone || '--'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">الهاتف الإضافي / الطوارئ</span>
                    <span className="text-xs text-slate-800 font-mono font-bold">{selectedEmployeeCard.altPhone || '--'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">البريد الإلكتروني للعمل</span>
                    <span className="text-xs text-slate-800 font-mono text-slate-600">{selectedEmployeeCard.email || '--'}</span>
                  </div>
                  <div className="space-y-0.5 col-span-1 md:col-span-3">
                    <span className="text-[10px] text-slate-400 font-bold block">محل الإقامة والسكن الحالي بالتفصيل</span>
                    <span className="text-xs text-slate-800 font-bold">{selectedEmployeeCard.address || '--'}</span>
                  </div>
                </div>
              </div>

              {/* Grid 2: تفاصيل المؤهل والتجنيد */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* المؤهل الدراسي */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-indigo-650 border-r-2 border-indigo-500 pr-2.5">المؤهل الدراسي والخلفية التعليمية</h4>
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4 h-full">
                    <div className="space-y-0.5 col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold block">الشهادة / المؤهل الدراسي</span>
                      <span className="text-xs text-slate-800 font-bold">{selectedEmployeeCard.qualification || 'مؤهل جامعي متوسط'}</span>
                    </div>
                    <div className="space-y-0.5 col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold block">جهة الحصول على المؤهل الدراسي</span>
                      <span className="text-xs text-slate-800 font-bold">{selectedEmployeeCard.qualificationIssuer || '--'}</span>
                    </div>
                  </div>
                </div>

                {/* الموقف من التجنيد */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-amber-600 border-r-2 border-amber-500 pr-2.5">الموقف من الخدمة العسكرية (للذكور)</h4>
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4 h-full">
                    <div className="space-y-0.5 col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold block">حالة التجنيد الحالية</span>
                      <span className="text-xs text-slate-800 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md inline-block">
                        {selectedEmployeeCard.militaryStatus || 'غير مطلوب للتجنيد'}
                      </span>
                    </div>
                    {selectedEmployeeCard.militaryDefermentExpiry && (
                      <div className="space-y-0.5 col-span-2">
                        <span className="text-[10px] text-slate-400 font-bold block">تاريخ نهاية التأجيل / الإعفاء المؤقت</span>
                        <span className="text-xs text-rose-700 font-mono font-bold">{selectedEmployeeCard.militaryDefermentExpiry}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid 3: البيانات الإدارية والتأمينية والمالية */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-rose-600 border-r-2 border-rose-600 pr-2.5">البيانات الإدارية والمالية والتأمينية الشاملة</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">مركز التكلفة المعتمد</span>
                    <span className="text-xs text-slate-800 font-bold">{getCostCenterName(selectedEmployeeCard.costCenterId)}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">الحالة الوظيفية</span>
                    <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-black inline-block">
                      {selectedEmployeeCard.status === 'active' ? 'على رأس العمل' : 'منتهي الخدمة'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">رصيد الإجازات المتبقي</span>
                    <span className="text-xs text-slate-800 font-mono font-bold">{selectedEmployeeCard.vacationBalance} يوماً من {selectedEmployeeCard.initialVacationBalance || 21}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">رقم التأمين الاجتماعي</span>
                    <span className="text-xs text-slate-800 font-mono font-bold">{selectedEmployeeCard.insuranceNumber || '--'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">تاريخ بداية التأمين</span>
                    <span className="text-xs text-slate-800 font-mono font-bold">{selectedEmployeeCard.insuranceStartDate || '--'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">مكتب التأمينات التابع له</span>
                    <span className="text-xs text-slate-800 font-bold">{selectedEmployeeCard.insuranceOffice || '--'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">الأساسي التأميني</span>
                    <span className="text-xs text-slate-800 font-mono font-bold">{selectedEmployeeCard.basicSalary ? formatCurrency(selectedEmployeeCard.basicSalary) : '--'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">الأجر التأميني المسجل</span>
                    <span className="text-xs text-slate-500 font-mono font-bold">{selectedEmployeeCard.insuranceSalary ? formatCurrency(selectedEmployeeCard.insuranceSalary) : '--'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">الراتب الفعلي المتفق عليه</span>
                    <span className="text-xs text-blue-700 font-mono font-black">{selectedEmployeeCard.actualSalary ? formatCurrency(selectedEmployeeCard.actualSalary) : '--'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">الترقية الوظيفية الحالية</span>
                    <span className="text-xs text-slate-800 font-bold">{selectedEmployeeCard.promotionTitle || '--'}</span>
                  </div>
                  <div className="space-y-0.5 col-span-2">
                    <span className="text-[10px] text-slate-400 font-bold block">تاريخ شغل الوظيفة الجديدة</span>
                    <span className="text-xs text-slate-800 font-mono font-bold">{selectedEmployeeCard.newJobDate || '--'}</span>
                  </div>
                </div>
              </div>

              {/* End Note for print */}
              <div className="hidden print:block text-center text-[9px] text-slate-400 pt-8 border-t border-slate-100">
                تم استخراج كارت الملف الموحد من قاعدة بيانات الشؤون الإدارية والموارد البشرية بتاريخ اليوم.
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
