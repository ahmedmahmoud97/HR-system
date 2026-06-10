/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  CalendarDays,
  RefreshCw,
  TrendingUp,
  Bell,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Database,
  Copy,
  Terminal,
  Check,
  CloudLightning,
} from 'lucide-react';
import { UserPermission, SystemAlert } from '../types';
import { isSupabaseConfigured, SUPABASE_SQL_SETUP } from '../utils/supabaseClient';
import { subscribeToSyncLogs, SyncLog, seedDefaultData } from '../utils/supabaseSync';

interface SettingsProps {
  userPermissions: UserPermission[];
  systemMonth: { year: number; month: number };
  alerts: SystemAlert[];
  onUpdateUserPermissions: (list: UserPermission[]) => void;
  onUpdateSystemMonth: (month: { year: number; month: number }) => void;
  onCarryforwardBalances: (daysToCarry: number) => void;
  onIncreaseInsurances: (ratioPercent: number) => void;
  onAddAlert: (alert: Omit<SystemAlert, 'id'>) => void;
  onRemoveAlert: (id: string) => void;
  employees?: any[];
  departments?: any[];
  sections?: any[];
  jobTitles?: any[];
  costCenters?: any[];
  insuranceConfig?: any;
  insuranceOffices?: any[];
  resignationReasons?: any[];
  vacationTypes?: any[];
  vacationRequests?: any[];
  attendance?: any[];
}

export default function Settings({
  userPermissions,
  systemMonth,
  alerts,
  onUpdateUserPermissions,
  onUpdateSystemMonth,
  onCarryforwardBalances,
  onIncreaseInsurances,
  onAddAlert,
  onRemoveAlert,
  employees = [],
  departments = [],
  sections = [],
  jobTitles = [],
  costCenters = [],
  insuranceConfig = { employeeRatio: 11, companyRatio: 18.75, maxLimit: 14000, minLimit: 2000 },
  insuranceOffices = [],
  resignationReasons = [],
  vacationTypes = [],
  vacationRequests = [],
  attendance = [],
}: SettingsProps) {
  // Navigation states inside settings view
  const [activeSegment, setActiveSegment] = useState<'perms' | 'month' | 'carry' | 'insurance_boost' | 'reminders' | 'supabase'>('perms');

  // Supabase monitoring states
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);
  const [seedingErrors, setSeedingErrors] = useState<string[]>([]);

  useEffect(() => {
    return subscribeToSyncLogs((logs) => {
      setSyncLogs(logs);
    });
  }, []);

  const handleSeedData = async () => {
    if (!isSupabaseConfigured()) {
      triggerFeedbackByToast('قاعدة البيانات غير مهيأة! يرجى تقديم المتغيرات أولاً.');
      return;
    }
    setSeedingLoading(true);
    setSeedingErrors([]);
    triggerFeedbackByToast('جاري بدء معالجة رفع وتسكين البيانات السحابية...');
    const result = await seedDefaultData({
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
    setSeedingLoading(false);
    if (result.success) {
      setSeedingErrors([]);
      triggerFeedbackByToast('تم تهيئة وتغذية الجداول في Supabase بالبيانات الإدارية بنجاح!');
    } else {
      setSeedingErrors(result.errors);
      triggerFeedbackByToast('تعذر رفع بعض البيانات. يرجى التحقق من الأخطاء والتعليمات أسفله.');
    }
  };

  // Input states
  // 1. User perms
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const currentUser = userPermissions[selectedUserIndex] || userPermissions[0] || null;

  // New User Creation Dialog / Fields
  const [showAddUser, setShowAddUser] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'manager' | 'entry' | 'reports'>('entry');

  // Temporary edit states for selected user
  const [editCode, setEditCode] = useState(currentUser ? currentUser.userCode : '');
  const [editName, setEditName] = useState(currentUser ? currentUser.userName : '');
  const [editRole, setEditRole] = useState<'admin' | 'manager' | 'entry' | 'reports'>(currentUser ? currentUser.role : 'entry');

  // Sync edits when selected user changes
  useEffect(() => {
    if (currentUser) {
      setEditCode(currentUser.userCode);
      setEditName(currentUser.userName);
      setEditRole(currentUser.role);
    }
  }, [selectedUserIndex, currentUser]);

  // 2. System month
  const [selectedYear, setSelectedYear] = useState(systemMonth.year);
  const [selectedMonthValue, setSelectedMonthValue] = useState(systemMonth.month);

  // 3. Carry balances
  const [carryDays, setCarryDays] = useState('21');

  // 4. Boost Insurance percentage
  const [boostPercent, setBoostPercent] = useState('10'); // increase by 10%

  // 5. Alert creator
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDesc, setAlertDesc] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'warning' | 'success'>('info');

  // Success feedbacks
  const [notification, setNotification] = useState('');

  const triggerFeedbackByToast = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(''), 4000);
  };

  // Add User submit handler
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) {
      triggerFeedbackByToast('يرجى ملء كود المستخدم واسمه بالكامل');
      return;
    }
    // Check if code already exists
    if (userPermissions.some(u => u.userCode.trim().toLowerCase() === newCode.trim().toLowerCase())) {
      triggerFeedbackByToast('كود المستخدم هذا متواجد مسبقاً بنظام الصلاحيات');
      return;
    }

    const defaultPerms = {
      admin: { dataEntry: true, reports: true, controlPanel: true, settings: true },
      manager: { dataEntry: true, reports: true, controlPanel: true, settings: false },
      entry: { dataEntry: true, reports: false, controlPanel: false, settings: false },
      reports: { dataEntry: false, reports: true, controlPanel: false, settings: false },
    };

    const newUser: UserPermission = {
      id: `user-${Date.now()}`,
      userCode: newCode.trim(),
      userName: newName.trim(),
      role: newRole,
      permissions: defaultPerms[newRole],
    };

    const nextList = [...userPermissions, newUser];
    onUpdateUserPermissions(nextList);
    setNewCode('');
    setNewName('');
    setNewRole('entry');
    setShowAddUser(false);
    setSelectedUserIndex(nextList.length - 1);
    triggerFeedbackByToast(`تم إضافة حساب المستخدم [${newUser.userName}] بنجاح وتفويض صلاحياته الافتراضية`);
  };

  // Save changes to selected account details (role, name, code)
  const handleSaveAccountDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!editCode.trim() || !editName.trim()) {
      triggerFeedbackByToast('لا يمكن حفظ بيانات فارغة لاسم أو كود المستخدم');
      return;
    }

    // Check if code exists on another ID
    if (userPermissions.some(u => u.id !== currentUser.id && u.userCode.trim().toLowerCase() === editCode.trim().toLowerCase())) {
      triggerFeedbackByToast('كود المستخدم هذا مكرر ومسجل لحساب آخر بالفعل');
      return;
    }

    const nextList = [...userPermissions];
    nextList[selectedUserIndex] = {
      ...currentUser,
      userCode: editCode.trim(),
      userName: editName.trim(),
      role: editRole,
    };
    onUpdateUserPermissions(nextList);
    triggerFeedbackByToast(`تم حفظ وتحديث بيانات حساب الموظف [${editName}] بنجاح`);
  };

  // Delete selected user account
  const handleDeleteUser = () => {
    if (!currentUser) return;
    if (currentUser.userCode === 'admin' || currentUser.id === 'user-admin') {
      triggerFeedbackByToast('عذراً: لا يمكن حذف الحساب الإداري الرئيسي للمنشأة (admin)');
      return;
    }
    if (confirm(`هل أنت متأكد من رغبتك في حذف حساب المستخدم [${currentUser.userName}] بالكامل وسحب كافة صلاحياته من النظام؟`)) {
      const nextList = userPermissions.filter(u => u.id !== currentUser.id);
      onUpdateUserPermissions(nextList);
      setSelectedUserIndex(0);
      triggerFeedbackByToast('تم حذف وإلغاء صلاحيات حساب الموظف الإداري بنجاح');
    }
  };

  // Save User Permissions back
  const handleTogglePerm = (permName: 'dataEntry' | 'reports' | 'controlPanel' | 'settings') => {
    if (!currentUser) return;
    const updatedList = [...userPermissions];
    updatedList[selectedUserIndex] = {
      ...currentUser,
      permissions: {
        ...currentUser.permissions,
        [permName]: !currentUser.permissions[permName],
      },
    };
    onUpdateUserPermissions(updatedList);
    triggerFeedbackByToast(`تم تحديث صلاحية الوصول لـ [${currentUser.userName}] بنجاح`);
  };

  // Change Month handler
  const handleSaveMonth = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSystemMonth({ year: selectedYear, month: selectedMonthValue });
    triggerFeedbackByToast(`تم ضبط وتفعيل شهر نظام العمل الحالي على: ${selectedMonthValue} / ${selectedYear}`);
  };

  // Carry Balances handler
  const handlePerformCarry = (e: React.FormEvent) => {
    e.preventDefault();
    const days = parseInt(carryDays) || 21;
    if (confirm(`تحذير ترحيل أرصدة الإجازات: هل ترغب في ترحيل وإضافة [${days} يوم] رصيد إجازة سنوية جديد لجميع الموظفين الحاليين على رأس العمل في النظام؟`)) {
      onCarryforwardBalances(days);
      triggerFeedbackByToast(`عملية ناجحة: تم ترحيل الأرصدة وإضافة ${days} يوم لجميع الكشوف الاستحقاقية.`);
    }
  };

  // Boost insurance wages handler
  const handlePerformBoost = (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseFloat(boostPercent);
    if (isNaN(pct) || pct <= 0) return;
    if (confirm(`هل أنت متأكد من زيادة الأجر التأميني للموظفين والشرائح الخاضعة بنسبة معينة قدرها [${pct}%]؟ سيقوم النظام بتعديل الكشوف فورياً.`)) {
      onIncreaseInsurances(pct);
      triggerFeedbackByToast(`تم بنجاح ترفيع الأجر الائتماني للشريحة التأمينية على جميع الموظفين بنسبة الزيادة السنوية المقررة: ${pct}%`);
    }
  };

  // Alert manual registration
  const handleAddAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertDesc.trim()) return;
    onAddAlert({
      title: alertTitle.trim(),
      description: alertDesc.trim(),
      type: alertType,
      date: new Date().toISOString().split('T')[0],
    });
    setAlertTitle('');
    setAlertDesc('');
    triggerFeedbackByToast('تم نشر وتوجيه التنبيه الجديد لغرفة لوحة القيادة بنجاح');
  };

  return (
    <div id="settings-section" className="space-y-6 dir-rtl text-right">
      {/* Upper header */}
      <div id="settings-header" className="bg-white/85 p-6 rounded-2xl border border-slate-100 shadow-xs mb-2">
        <h1 className="text-xl font-bold text-slate-800">إعدادات النظم الإدارية وصلاحيات المستخدمين</h1>
        <p className="text-xs text-slate-500 mt-1">ضبط الشهور المحاسبية، وتعديل صلاحيات الموظفين، وإعمال ترحيل رصيد الإجازات وزيادة الأجور التأمينية.</p>
      </div>

      {notification && (
        <div id="settings-notification" className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600 animate-bounce" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Settings Navigation */}
        <div id="settings-nav" className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
          <p className="text-xs font-bold text-slate-500 px-2 py-1 mb-2">معلمة الإعدادات</p>

          <button
            onClick={() => setActiveSegment('perms')}
            className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${activeSegment === 'perms' ? 'bg-sky-50 text-sky-700 border-r-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <UserCheck className="w-4 h-4 shrink-0 text-sky-600" />
            أكواد وصلاحيات المستخدمين
          </button>

          <button
            onClick={() => setActiveSegment('month')}
            className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${activeSegment === 'month' ? 'bg-sky-50 text-sky-700 border-r-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <CalendarDays className="w-4 h-4 shrink-0 text-emerald-600" />
            تعديل شهر نظام العمل
          </button>

          <button
            onClick={() => setActiveSegment('carry')}
            className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${activeSegment === 'carry' ? 'bg-sky-50 text-sky-700 border-r-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <RefreshCw className="w-4 h-4 shrink-0 text-violet-600 animate-spin-reverse" />
            ترحيل وبواقي أرصدة الإجازات
          </button>

          <button
            onClick={() => setActiveSegment('insurance_boost')}
            className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${activeSegment === 'insurance_boost' ? 'bg-sky-50 text-sky-700 border-r-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <TrendingUp className="w-4 h-4 shrink-0 text-indigo-600" />
            زيادة التأمينات بنسبة معينة
          </button>

          <button
            onClick={() => setActiveSegment('reminders')}
            className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${activeSegment === 'reminders' ? 'bg-sky-50 text-sky-700 border-r-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Bell className="w-4 h-4 shrink-0 text-rose-500 font-bold" />
            التنبيهات والتذكيرات اليدوية
          </button>

          <button
            onClick={() => setActiveSegment('supabase')}
            className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${activeSegment === 'supabase' ? 'bg-sky-50 text-sky-700 border-r-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Database className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
            تكامل ورصد قاعدة Supabase
          </button>
        </div>

        {/* Configurations Fields */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          
          {/* Segment 1: Permissions */}
          {activeSegment === 'perms' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">إدارة حسابات وأكواد وصلاحيات مستخدمي النظام</h3>
                  <p className="text-[10px] text-slate-400 mt-1">أضف، عدل أو احذف حسابات الموظفين الإداريين وتحكم بتخويل الصلاحيات والوصول للوحات الحاكمية.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddUser(!showAddUser)}
                  className="px-3 py-1.5 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddUser ? 'إلغاء الإضافة' : 'إضافة حساب جديد'}</span>
                </button>
              </div>

              {/* Form to Add New User */}
              {showAddUser && (
                <form onSubmit={handleAddUserSubmit} className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700">إنشاء حساب إداري جديد مفوض بصلاحيات</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold block">كود حساب الدخول (ID/Code):</label>
                      <input
                        type="text"
                        placeholder="مثال: user-4"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold block">اسم الموظف أو المستخدم الوظيفي:</label>
                      <input
                        type="text"
                        placeholder="مثال: أخصائي ثان رواتب"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold block">الدور الرئيسي بالحساب:</label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="entry">مدخل بيانات (Data Entry)</option>
                        <option value="manager">مدير الموارد البشرية (Manager)</option>
                        <option value="reports">أخصائي تقارير ومطابقة (Reports Specialist)</option>
                        <option value="admin">مدير نظام كامل (Super Admin)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-start gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      تسجيل الحساب وتوليد الصلاحيات
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddUser(false)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}

              {currentUser && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Account Selector and Details editor (Left on desktop/top on mobile) */}
                  <div className="lg:col-span-2 space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-150">
                      <label className="text-[11px] font-bold text-slate-600 block">اختر حساب الموظف الإداري النشط للتعديل:</label>
                      <select
                        value={selectedUserIndex}
                        onChange={(e) => setSelectedUserIndex(parseInt(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                      >
                        {userPermissions.map((user, idx) => (
                          <option key={user.id} value={idx}>{user.userName} (كود: {user.userCode})</option>
                        ))}
                      </select>
                    </div>

                    <form onSubmit={handleSaveAccountDetails} className="space-y-3 bg-white p-4 rounded-xl border border-slate-150">
                      <p className="text-[11px] font-bold text-slate-700 border-b border-slate-100 pb-1.5 md:pb-2">تحديث بيانات وخصائص هذا الحساب:</p>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold block">كود الدخول للموظف (User Code):</label>
                        <input
                          type="text"
                          value={editCode}
                          onChange={(e) => setEditCode(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold block">اسم الموظف أو الحساب بالكامل:</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold block">المسمى الإداري (الدور):</label>
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as any)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                        >
                          <option value="entry">مدخل بيانات</option>
                          <option value="manager">مدير الموارد البشرية</option>
                          <option value="reports font-sans">أخصائي كشوف وتقارير</option>
                          <option value="admin">مدير نظام كامل</option>
                        </select>
                      </div>

                      <div className="flex gap-2 pt-2 justify-between">
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          تحديث المعطيات
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteUser}
                          disabled={currentUser.userCode === 'admin'}
                          className={`px-3 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center ${currentUser.userCode === 'admin' ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Interactive checkboxes representation as beautiful toggle cards (Right on desktop/bottom on mobile) */}
                  <div className="lg:col-span-3 space-y-3">
                    <p className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>تفويض صلاحيات الوصول والصفحات لـ [{currentUser.userName}]:</span>
                      <span className="text-[10px] bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full font-bold">كود الموظف: {currentUser.userCode}</span>
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Data entry toggle card */}
                      <div
                        onClick={() => handleTogglePerm('dataEntry')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${currentUser.permissions.dataEntry ? 'bg-sky-50/40 border-sky-200 text-sky-900 border-r-4 border-r-sky-600' : 'bg-slate-50 border-slate-150 text-slate-400'}`}
                      >
                        <div className="text-right">
                          <p className="text-xs font-bold">إدخال الحركات والمسيرات والمدخلات</p>
                          <p className="text-[10px] text-slate-400 mt-1">حركات تبويب الإجازات، تسجيل الحضور والانصراف، وتهيئة مستندات العقود للخدمات.</p>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-1.5 ${currentUser.permissions.dataEntry ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300'}`}>
                          {currentUser.permissions.dataEntry && <span className="text-[10px]">✔</span>}
                        </div>
                      </div>

                      {/* Reports toggle card */}
                      <div
                        onClick={() => handleTogglePerm('reports')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${currentUser.permissions.reports ? 'bg-sky-50/40 border-sky-200 text-sky-900 border-r-4 border-r-sky-600' : 'bg-slate-50 border-slate-150 text-slate-400'}`}
                      >
                        <div className="text-right">
                          <p className="text-xs font-bold">عرض وتصدير وطباعة كشوف التقارير</p>
                          <p className="text-[10px] text-slate-400 mt-1">تتيح سحب كشوف الموظفين الحاليين والوفيات والاستقالات وأرصدة إجازاتهم.</p>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-1.5 ${currentUser.permissions.reports ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300'}`}>
                          {currentUser.permissions.reports && <span className="text-[10px]">✔</span>}
                        </div>
                      </div>

                      {/* Control panel toggle card */}
                      <div
                        onClick={() => handleTogglePerm('controlPanel')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${currentUser.permissions.controlPanel ? 'bg-sky-50/40 border-sky-200 text-sky-900 border-r-4 border-r-sky-600' : 'bg-slate-50 border-slate-150 text-slate-400'}`}
                      >
                        <div className="text-right">
                          <p className="text-xs font-bold">لوحة تحكم المنشأة (التكويد والترهين)</p>
                          <p className="text-[10px] text-slate-400 mt-1">تتيح تكويد الإدارات، الأقسام، مراكز التكلفة، ومكاتب التأمينات الاجتماعية.</p>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-1.5 ${currentUser.permissions.controlPanel ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300'}`}>
                          {currentUser.permissions.controlPanel && <span className="text-[10px]">✔</span>}
                        </div>
                      </div>

                      {/* Settings toggle card */}
                      <div
                        onClick={() => handleTogglePerm('settings')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${currentUser.permissions.settings ? 'bg-sky-50/40 border-sky-200 text-sky-900 border-r-4 border-r-sky-600' : 'bg-slate-50 border-slate-150 text-slate-400'}`}
                      >
                        <div className="text-right">
                          <p className="text-xs font-bold">شهر النظم والإعدادات الكبرى</p>
                          <p className="text-[10px] text-slate-400 mt-1">أعلى مستوى أمان: ترحيل وإعادة تهيئة الحركات وإجازات الملاحة وتعديل الصلاحيات الفردية.</p>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-1.5 ${currentUser.permissions.settings ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300'}`}>
                          {currentUser.permissions.settings && <span className="text-[10px]">✔</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Table of all users, showing their codes and exact permissions in a gorgeous responsive table! */}
                  <div className="lg:col-span-5 mt-6 pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-sky-600" />
                          <span>كشف ومعاينة صلاحيات المستخدمين النشطين بالتطبيق ({userPermissions.length})</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">استعراض تفصيلي لأكواد الدخول والصلاحيات الممنوحة لكل مسؤول بالشركة ومطابقتها فليكس.</p>
                      </div>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-black">
                        التحكم بالصلاحيات نَشِط
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                            <th className="p-3">كود الحساب (Code)</th>
                            <th className="p-3">اسم المستخدِم</th>
                            <th className="p-3">الدور الإداري</th>
                            <th className="p-3 text-center">إدخال الحركات والمسيرات</th>
                            <th className="p-3 text-center">استخراج التقارير وسحب الكشوف</th>
                            <th className="p-3 text-center">تكويد أقسام المنشأة</th>
                            <th className="p-3 text-center">الأشهر والإعدادات</th>
                            <th className="p-3 text-center">إجراء فوري</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {userPermissions.map((user, idx) => (
                            <tr
                              key={user.id}
                              className={`hover:bg-slate-50/50 transition-colors ${currentUser && currentUser.id === user.id ? 'bg-sky-50/10 font-medium' : ''}`}
                            >
                              <td className="p-3">
                                <span className="font-mono text-[10.5px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-150">
                                  {user.userCode}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px] shrink-0 select-none">
                                    {user.userName.charAt(0)}
                                  </div>
                                  <span className="font-black text-slate-700">{user.userName}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                {user.role === 'admin' ? (
                                  <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-md font-bold">مدير نظام عام</span>
                                ) : user.role === 'manager' ? (
                                  <span className="text-[10px] bg-violet-50 text-violet-600 border border-violet-100 px-1.5 py-0.5 rounded-md font-bold">مدير الموارد</span>
                                ) : user.role?.startsWith('reports') ? (
                                  <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-md font-bold">أخصائي تقارير</span>
                                ) : (
                                  <span className="text-[10px] bg-sky-50 text-sky-600 border border-sky-100 px-1.5 py-0.5 rounded-md font-bold">مدخل الحركات</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`text-[11px] font-bold ${user.permissions.dataEntry ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-slate-300'}`}>
                                  {user.permissions.dataEntry ? 'ممنوحة ✔' : 'محجوبة ✖'}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`text-[11px] font-bold ${user.permissions.reports ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-slate-300'}`}>
                                  {user.permissions.reports ? 'ممنوحة ✔' : 'محجوبة ✖'}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`text-[11px] font-bold ${user.permissions.controlPanel ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-slate-300'}`}>
                                  {user.permissions.controlPanel ? 'ممنوحة ✔' : 'محجوبة ✖'}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`text-[11px] font-bold ${user.permissions.settings ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-slate-300'}`}>
                                  {user.permissions.settings ? 'ممنوحة ✔' : 'محجوبة ✖'}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedUserIndex(idx)}
                                  className={`text-[11px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${currentUser && currentUser.id === user.id ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                                >
                                  {currentUser && currentUser.id === user.id ? 'يتم تعديله حالياً ⚡' : 'تحديد للتعديل ⚙'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Segment 2: System Month Calendar */}
          {activeSegment === 'month' && (
            <form onSubmit={handleSaveMonth} className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">تهيئة وتعيين شهر النظام الأساسي</h3>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-150 rounded-xl text-xs text-amber-800 flex items-start gap-2 max-w-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>مذكرة محاسبية للتأكيد:</strong> تغيير شهر النظام يؤثر مباشرة على تاريخ حركة تسجيل الحضور والانصراف، وترويسة وعينات كشوف التقارير الصادرة. يرجى المتابعة بحذر.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-lg">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">السنة المحاسبية بالنظام</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">شهر إغلاق كشف العاملين (1 - 12)</label>
                  <select
                    value={selectedMonthValue}
                    onChange={(e) => setSelectedMonthValue(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                  >
                    {[
                      '1 - يناير', '2 - فبراير', '3 - مارس', '4 - أبريل', '5 - مايو', '6 - يونيو',
                      '7 - يوليو', '8 - أغسطس', '9 - سبتمبر', '10 - أكتوبر', '11 - نوفمبر', '12 - ديسمبر'
                    ].map((name, index) => (
                      <option key={index} value={index + 1}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer">
                  تحديث شهر النظام التشغيلي
                </button>
              </div>
            </form>
          )}

          {/* Segment 3: Carry balances */}
          {activeSegment === 'carry' && (
            <form onSubmit={handlePerformCarry} className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">ترحيل وتحديث رصيد الإجازات السنوية للعاملين</h3>
              </div>

              <div className="p-4 bg-sky-50 border border-sky-150 rounded-xl text-xs text-sky-800 flex items-start gap-2.5 max-w-xl">
                <RefreshCw className="w-4 h-4 text-sky-600 shrink-0 mt-0.5 animate-spin-reverse" />
                <p>
                  <strong>آلية ترحيل الأرصدة (Balance Carryforward):</strong> يقوم النظام تلقائياً بإضافة الأيام المقررة لحصص الموظفين النشطين (مع الحفاظ على رصيدهم السابق للذمة السنوية، وجمع البواقي).
                </p>
              </div>

              <div className="space-y-2 max-w-xs">
                <label className="text-xs font-semibold text-slate-700 block">شريحة الباقة المطلوب ترحيلها (أيام) *</label>
                <input
                  type="number"
                  min={1}
                  max={45}
                  value={carryDays}
                  onChange={(e) => setCarryDays(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-hidden"
                />
              </div>

              <div className="pt-4 flex justify-end border-t border-slate-100">
                <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs">
                  <RefreshCw className="w-4 h-4" />
                  تشغيل معالجة الترحيل العام فوراً
                </button>
              </div>
            </form>
          )}

          {/* Segment 4: Boost insurance salary by ratio % */}
          {activeSegment === 'insurance_boost' && (
            <form onSubmit={handlePerformBoost} className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">زيادة الأجر التأميني بنسبة معيارية معينة للشركة ككل</h3>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-150 rounded-xl text-xs text-amber-800 flex items-start gap-2.5 max-w-xl">
                <TrendingUp className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>تأكيد الزيادة السنوية:</strong> إدخال النسبة هنا سيقوم بترفيع الأجور للشريحة التأمينية لجميع الموظفين المسجلين على ذمة العمل بنسبة مئوية (٪). مثال: زيادة 10٪ تحول أجر 5000 ج.م إلى 5500 ج.م تلاؤماً مع قرارات التأمينات الاجتماعية.
                </p>
              </div>

              <div className="space-y-2 max-w-xs">
                <label className="text-xs font-semibold text-slate-700 block">نسبة الزيادة التأمينية الافتراضية (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  min={0.1}
                  max={100}
                  value={boostPercent}
                  onChange={(e) => setBoostPercent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-hidden"
                />
              </div>

              <div className="pt-4 flex justify-end border-t border-slate-100">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm">
                  <TrendingUp className="w-4 h-4" />
                  تطبيق معالجة زيادة الأجور التأمينية
                </button>
              </div>
            </form>
          )}

          {/* Segment 5: Reminders List & Custom alert generation */}
          {activeSegment === 'reminders' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">بث التنبيهات ولوحة المنشورات الإدارية</h3>
              </div>

              {/* Creators form */}
              <form onSubmit={handleAddAlertSubmit} className="p-4 border border-slate-150 rounded-xl space-y-4">
                <p className="text-xs font-bold text-slate-700">إنشاء تنبيه/ملاحظة عاجلة جديدة بالنظام:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">عنوان التنبيه الرئيسي *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: بدء تحصيل كود الحضور الجديد"
                      value={alertTitle}
                      onChange={(e) => setAlertTitle(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500">فئة تنبيه الإشارة *</label>
                    <select
                      value={alertType}
                      onChange={(e) => setAlertType(e.target.value as any)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-hidden"
                    >
                      <option value="info">إرشادية (زرقاء)</option>
                      <option value="warning">تحذير طارئ (برتقالي)</option>
                      <option value="success">إجرائية مكتملة (خضراء)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 font-sans">تفاصيل وموجز نص الإخطار *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="يرجى الالتزام بالتعليمات القانونية وإشراك شئون العاملين..."
                    value={alertDesc}
                    onChange={(e) => setAlertDesc(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-hidden resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-1">
                  <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-4 py-1.5 text-xs font-semibold flex items-center gap-1 cursor-pointer">
                    <Plus className="w-4 h-4" />
                    بث المنشور الآن
                  </button>
                </div>
              </form>

              {/* Items List */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">التنبيهات المنشورة حالياً بنظام لوحة القيادة:</p>
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-400">لا توجد لوحة إشعارات مفعلة.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                    {alerts.map((al) => (
                      <div key={al.id} className="p-3.5 flex justify-between items-center hover:bg-slate-50">
                        <div>
                          <p className="font-bold text-slate-800">{al.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{al.description}</p>
                        </div>
                        <button
                          onClick={() => { onRemoveAlert(al.id); triggerFeedbackByToast('تم حذف وإزالة التنبيه من لوحة الإعلانات'); }}
                          className="text-slate-400 hover:text-rose-500 p-1.5 rounded-md hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Segment 6: Supabase Integration Panel */}
          {activeSegment === 'supabase' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">إعدادات ومزامنة قاعدة البيانات السحابية Supabase</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">الربط الفوري وتبادل التحديثات حياً دون الحاجة لإعادة تحميل التطبيق</p>
                </div>
                <CloudLightning className={`w-5 h-5 ${isSupabaseConfigured() ? 'text-emerald-500 animate-bounce' : 'text-slate-300'}`} />
              </div>

              {/* Status Header */}
              {isSupabaseConfigured() ? (
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CloudLightning className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <p className="text-xs font-bold text-emerald-900">الاتصال نشط وقيد المزامنة الفورية السحابية</p>
                    </div>
                    <p className="text-[10px] text-emerald-700/80 mt-1 pt-0.5">
                      تم العثور على مفاتيح Supabase المشفرة بنجاح! أي حركة إدخال، تعيين، ترحيل، غياب، أو تعديل في صلاحياتك الآن سيتم مزامنتها وبثها لجميع المتصفحات المفتوحة حياً!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/50 border border-amber-105 rounded-2xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">تنبيه: قاعدة البيانات السحابية غير متصلة بالكامل</h4>
                    <p className="text-[10px] text-amber-700/80 mt-1 leading-relaxed">
                      يعمل التطبيق حالياً بالوضع المحلي المؤقت (Local State). للربط الدائم، يرجى تزويد متغيرات البيئة التالية في ملف <code className="bg-amber-100 px-1 py-0.5 rounded text-[9px] font-mono font-bold">.env.example</code> أو إعدادات تشغيل التطبيق في المنصة:
                    </p>
                    <div className="mt-2 bg-slate-900 text-slate-100 p-2.5 rounded-xl font-mono text-[9px] space-y-1 block max-w-md">
                      <div>VITE_SUPABASE_URL=your_supabase_project_url</div>
                      <div>VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Seeding Block (if connected) */}
              {isSupabaseConfigured() && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-blue-900">تغذية أولية وتسكين السحابة (Database Seeding)</h4>
                      <p className="text-[10px] text-blue-700 leading-relaxed max-w-xl">
                        إذا قمت بإنشاء الجداول للتو وترغب في رفع كافة البيانات الحالية من موظفين، أقسام، هياكل إدارية، وكشوف حضور فوراً إلى السحابة للبدء الإجمالي:
                      </p>
                    </div>
                    <button
                      onClick={handleSeedData}
                      disabled={seedingLoading}
                      className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <Database className="w-4 h-4" />
                      {seedingLoading ? 'جاري الرفع والسحب السحابي...' : 'تصدير وتغذية البيانات الحالية'}
                    </button>
                  </div>

                  {/* Seeding Errors list */}
                  {seedingErrors.length > 0 && (
                    <div id="seeding-errors-panel" className="p-4 bg-rose-50 border border-rose-150 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-rose-800">
                        <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                        <h5 className="text-xs font-bold">تنبيه: فشل رفع وتغذية بعض الجداول بقاعدة البيانات السحابية</h5>
                      </div>
                      <p className="text-[10px] text-rose-700/90 leading-relaxed">
                        يعود هذا الخطأ عادةً لنقص في تهيئة الجداول أو صلاحية الوصول (policies) على Supabase. يرجى التأكد من تشغيل كود SQL المذكور بالأسفل بالكامل على واجهة مشروعك في <strong>SQL Editor</strong> أولاً للتأسيس:
                      </p>
                      <ul className="list-disc list-inside text-[9.5px]/[1.5] text-rose-900 font-mono space-y-1 bg-white/70 p-3 rounded-xl border border-rose-100/50">
                        {seedingErrors.map((err, idx) => (
                          <li key={idx} className="leading-normal">{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Live change monitor (Terminal style) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-slate-600" />
                    شاشة رصد مزامنة البث الفوري (Live Telemetry Logs)
                  </p>
                  <span className="text-[9px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded">
                     {syncLogs.length} سطر مسجل
                  </span>
                </div>
                <div className="bg-slate-900 text-emerald-400 font-mono text-[9px] p-4 rounded-2xl h-44 overflow-y-auto block space-y-1.5 border border-slate-800">
                  {syncLogs.length === 0 ? (
                    <p className="text-slate-500 italic">بانتظار حدوث أي حركة أو تعديل إداري لرصد بثها الفوري هنا...</p>
                  ) : (
                    syncLogs.map((log, idx) => (
                      <div key={idx} className={`flex items-start gap-2 border-b border-slate-800/50 pb-1 ${
                        log.status === 'error' ? 'text-rose-400' :
                        log.status === 'success' ? 'text-emerald-400' :
                        'text-slate-100'
                      }`}>
                        <span className="text-slate-500 shrink-0">[{log.time}]</span>
                        <span className="text-sky-400 shrink-0">[{log.action}]</span>
                        <span className="leading-normal">{log.details}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SQL setup schema script */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-indigo-600" />
                    كود تهيئة وبناء الجداول لـ Supabase SQL Editor
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 3000);
                      triggerFeedbackByToast('تم نسخ كود SQL لـ Supabase بنجاح!');
                    }}
                    className="flex items-center gap-1.5 text-[10px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSql ? 'تم نسخ الكود!' : 'نسخ كود SQL'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  افتح واجهة مشروعك في Supabase، اذهب إلى <strong>SQL Editor</strong>، قم بلصق الكود التالي بالكامل ثم اضغط <strong>Run</strong> لإنشاء كافة الهياكل وتفعيل البث الفوري (Realtime Pub/Sub) فورياً لتحديث المتصفحات:
                </p>
                <div className="relative">
                  <pre className="bg-slate-50 border border-slate-200 text-slate-700 p-4 rounded-xl text-[9px] font-mono overflow-x-auto max-h-48">
                    {SUPABASE_SQL_SETUP}
                  </pre>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
