/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building,
  Layers,
  Briefcase,
  Coins,
  Shield,
  FileCheck,
  AlertOctagon,
  CalendarCheck,
  Plus,
  Trash2,
  Edit2,
  Save,
  Download,
  Upload,
  FileSpreadsheet,
  FileUp,
  X,
  Clipboard,
} from 'lucide-react';
import {
  Department,
  Section,
  JobTitle,
  CostCenter,
  InsuranceConfig,
  InsuranceOffice,
  ResignationReason,
  VacationType,
} from '../types';

interface ControlPanelProps {
  departments: Department[];
  sections: Section[];
  jobTitles: JobTitle[];
  costCenters: CostCenter[];
  insuranceConfig: InsuranceConfig;
  insuranceOffices: InsuranceOffice[];
  resignationReasons: ResignationReason[];
  vacationTypes: VacationType[];
  onUpdateDepartments: (list: Department[]) => void;
  onUpdateSections: (list: Section[]) => void;
  onUpdateJobTitles: (list: JobTitle[]) => void;
  onUpdateCostCenters: (list: CostCenter[]) => void;
  onUpdateInsuranceConfig: (config: InsuranceConfig) => void;
  onUpdateInsuranceOffices: (list: InsuranceOffice[]) => void;
  onUpdateResignationReasons: (list: ResignationReason[]) => void;
  onUpdateVacationTypes: (list: VacationType[]) => void;
}

type ControlSubTab =
  | 'depts'
  | 'sections'
  | 'jobs'
  | 'cost_centers'
  | 'insurance_config'
  | 'insurance_offices'
  | 'res_reasons'
  | 'vac_types';

export default function ControlPanel({
  departments,
  sections,
  jobTitles,
  costCenters,
  insuranceConfig,
  insuranceOffices,
  resignationReasons,
  vacationTypes,
  onUpdateDepartments,
  onUpdateSections,
  onUpdateJobTitles,
  onUpdateCostCenters,
  onUpdateInsuranceConfig,
  onUpdateInsuranceOffices,
  onUpdateResignationReasons,
  onUpdateVacationTypes,
}: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState<ControlSubTab>('depts');

  // Input states
  const [newDeptName, setNewDeptName] = useState('');
  const [newSecName, setNewSecName] = useState('');
  const [newSecDeptId, setNewSecDeptId] = useState('');
  const [newJobName, setNewJobName] = useState('');
  const [newCcCode, setNewCcCode] = useState('');
  const [newCcName, setNewCcName] = useState('');
  const [newOfficeCode, setNewOfficeCode] = useState('');
  const [newOfficeName, setNewOfficeName] = useState('');
  const [newReasonText, setNewReasonText] = useState('');
  const [newVacName, setNewVacName] = useState('');
  const [newVacDays, setNewVacDays] = useState('21');

  // Job titles Excel/CSV import states
  const [jobImportFileName, setJobImportFileName] = useState('');
  const [jobImportPreview, setJobImportPreview] = useState<string[]>([]);
  const [jobImportPasteText, setJobImportPasteText] = useState('');

  // Insurance config inputs
  const [empRatio, setEmpRatio] = useState(insuranceConfig.employeeRatio.toString());
  const [compRatio, setCompRatio] = useState(insuranceConfig.companyRatio.toString());
  const [insMinLimit, setInsMinLimit] = useState(insuranceConfig.minLimit.toString());
  const [insMaxLimit, setInsMaxLimit] = useState(insuranceConfig.maxLimit.toString());

  // Message feedback
  const [feedback, setFeedback] = useState({ success: true, text: '' });

  const showFeedback = (isSuccess: boolean, text: string) => {
    setFeedback({ success: isSuccess, text });
    setTimeout(() => setFeedback({ success: true, text: '' }), 3000);
  };

  // Add handlers
  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    const newItem: Department = { id: `dept-${Date.now()}`, name: newDeptName.trim() };
    onUpdateDepartments([...departments, newItem]);
    setNewDeptName('');
    showFeedback(true, 'تم إضافة الإدارة بنجاح');
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecName.trim() || !newSecDeptId) return;
    const newItem: Section = { id: `sec-${Date.now()}`, name: newSecName.trim(), departmentId: newSecDeptId };
    onUpdateSections([...sections, newItem]);
    setNewSecName('');
    showFeedback(true, 'تم إضافة القسم بنجاح المبرم للإدارة');
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobName.trim()) return;
    const newItem: JobTitle = { id: `job-${Date.now()}`, name: newJobName.trim() };
    onUpdateJobTitles([...jobTitles, newItem]);
    setNewJobName('');
    showFeedback(true, 'تم إضافة رمز الوظيفة بنجاح');
  };

  const parseJobImportText = (text: string) => {
    if (!text || !text.trim()) {
      showFeedback(false, 'الرجاء كتابة أو لصق بيانات أو اختيار ملف أولاً.');
      return;
    }
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      showFeedback(false, 'الملف أو النص فارغ.');
      return;
    }
    
    let parsedNames: string[] = [];
    const firstLineClean = lines[0].toLowerCase().trim().replace(/['"‘“Arabic_,\t;]/g, '');
    
    // Check if first line is a header
    let startIndex = 0;
    if (firstLineClean.includes('المسمى') || firstLineClean.includes('المسمي') || firstLineClean.includes('اسم') || firstLineClean.includes('job') || firstLineClean.includes('title') || firstLineClean.includes('name')) {
      startIndex = 1;
    }
    
    for (let i = startIndex; i < lines.length; i++) {
      const delimiter = lines[i].includes('\t') ? '\t' : (lines[i].includes(';') ? ';' : ',');
      const columns = lines[i].split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
      const name = columns[0];
      if (name && name.length > 1 && !parsedNames.includes(name)) {
        parsedNames.push(name);
      }
    }

    const existingNames = jobTitles.map(j => j.name.toLowerCase().trim());
    const uniqueToImport = parsedNames.filter(n => !existingNames.includes(n.toLowerCase().trim()));

    if (uniqueToImport.length === 0) {
      if (parsedNames.length > 0) {
        showFeedback(false, 'كل الوظائف الموجودة بالملف مسجلة ومكودة بالنظام بالفعل!');
      } else {
        showFeedback(false, 'لم نتمكن من العثور على مسميات وظيفية صالحة بالملف.');
      }
      setJobImportPreview([]);
      return;
    }

    setJobImportPreview(uniqueToImport);
    showFeedback(true, `تم بنجاح تحليل الملف. تم العثور على ${uniqueToImport.length} مسمى وظيفي جديد جاهز للاستيراد.`);
  };

  const handleJobFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJobImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        parseJobImportText(text);
      }
    };
    reader.onerror = () => {
      showFeedback(false, 'خطأ أثناء قراءة ملف CSV أو سبريدشيت.');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmImportJobs = () => {
    if (jobImportPreview.length === 0) return;
    
    const newItems: JobTitle[] = jobImportPreview.map((name, index) => ({
      id: `job-${Date.now()}-${index}`,
      name: name
    }));

    onUpdateJobTitles([...jobTitles, ...newItems]);
    setJobImportPreview([]);
    setJobImportPasteText('');
    setJobImportFileName('');
    showFeedback(true, `تم استيراد وتكويد عدد ${newItems.length} وظيفة جديدة للملاك الوظيفي بنجاح!`);
  };

  const downloadJobTemplate = () => {
    const headers = "المسمى الوظيفي\n";
    const sampleRows = "مدير الموارد البشرية\nمحاسب أول\nمهندس برمجيات\nسائق عمومي\nأخصائي تسويق رقمي\n";
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(headers + sampleRows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "job_titles_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddCc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCcCode.trim() || !newCcName.trim()) return;
    const newItem: CostCenter = { id: `cc-${Date.now()}`, code: newCcCode.trim(), name: newCcName.trim() };
    onUpdateCostCenters([...costCenters, newItem]);
    setNewCcCode('');
    setNewCcName('');
    showFeedback(true, 'تم إضافة مركز التكلفة لقاعدة الحسابات');
  };

  const handleAddOffice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficeCode.trim() || !newOfficeName.trim()) return;
    const newItem: InsuranceOffice = { id: `off-${Date.now()}`, code: newOfficeCode.trim(), name: newOfficeName.trim() };
    onUpdateInsuranceOffices([...insuranceOffices, newItem]);
    setNewOfficeCode('');
    setNewOfficeName('');
    showFeedback(true, 'تم تسكين مكتب التأمينات الجديد');
  };

  const handleAddReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReasonText.trim()) return;
    const newItem: ResignationReason = { id: `res-${Date.now()}`, reason: newReasonText.trim() };
    onUpdateResignationReasons([...resignationReasons, newItem]);
    setNewReasonText('');
    showFeedback(true, 'تم تسوية سبب استقالة جديد');
  };

  const handleAddVacType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVacName.trim() || !newVacDays) return;
    const newItem: VacationType = { id: `vac-${Date.now()}`, name: newVacName.trim(), daysAllowed: parseInt(newVacDays) || 21 };
    onUpdateVacationTypes([...vacationTypes, newItem]);
    setNewVacName('');
    setNewVacDays('21');
    showFeedback(true, 'تم ترميز نظام الإجازة بنجاح');
  };

  // Insurance save
  const handleSaveInsuranceConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateInsuranceConfig({
      id: insuranceConfig.id,
      employeeRatio: parseFloat(empRatio) || 11,
      companyRatio: parseFloat(compRatio) || 18.75,
      minLimit: parseFloat(insMinLimit) || 2000,
      maxLimit: parseFloat(insMaxLimit) || 12600,
    });
    showFeedback(true, 'تم تحديث شرائح ونسب التأمينات الاجتماعية العامة');
  };

  // Delete helpers
  const handleRemoveItem = <T extends { id: string }>(
    list: T[],
    id: string,
    updateFn: (newList: T[]) => void,
    msg: string
  ) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا البند من إعدادات النظام؟')) {
      updateFn(list.filter((item) => item.id !== id));
      showFeedback(true, msg);
    }
  };

  return (
    <div id="control-panel-section" className="space-y-6 dir-rtl text-right">
      {/* Header */}
      <div id="control-panel-header" className="bg-white/85 p-6 rounded-2xl border border-slate-100 shadow-xs mb-2">
        <h1 className="text-xl font-bold text-slate-800">قوائم وموجهات لوحة التحكم والتكويد</h1>
        <p className="text-xs text-slate-500 mt-1">ضبط هيكل الإدارات، الأقسام، مراكز التكلفة، تأمينات العمل، وقواعد الإجازات الممنوحة لدورة النظام.</p>
      </div>

      {feedback.text && (
        <div id="control-feedback" className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${feedback.success ? 'bg-emerald-50 border-emerald-150 text-emerald-800' : 'bg-rose-50 border-rose-150 text-rose-800'}`}>
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Buttons List */}
        <div id="control-sidebar" className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
          <p className="text-xs font-bold text-slate-500 px-2 py-1 mb-2">الشجيرات والترميزات الرئيسية</p>

          <button
            onClick={() => setActiveTab('depts')}
            className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'depts' ? 'bg-sky-50 text-sky-700 border-r-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Building className="w-4 h-4 shrink-0" />
            الهيكل الإداري (الإدارات)
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'sections' ? 'bg-sky-50 text-sky-700 border-r-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Layers className="w-4 h-4 shrink-0 text-emerald-600" />
            الأقسام الداخلية
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'jobs' ? 'bg-sky-50 text-sky-700 border-r-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Briefcase className="w-4 h-4 shrink-0 text-amber-600" />
            تكويد الوظائف والمسميات
          </button>

          <button
            onClick={() => setActiveTab('cost_centers')}
            className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'cost_centers' ? 'bg-sky-50 text-sky-700 border-r-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Coins className="w-4 h-4 shrink-0 text-amber-500" />
            مراكز التكلفة المحاسبية
          </button>

          <button
            onClick={() => setActiveTab('insurance_config')}
            className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'insurance_config' ? 'bg-sky-50 text-sky-700 border-r-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Shield className="w-4 h-4 shrink-0 text-indigo-600" />
            معايير التأمينات (النسب والشرائح)
          </button>

          <button
            onClick={() => setActiveTab('insurance_offices')}
            className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'insurance_offices' ? 'bg-sky-50 text-sky-700 border-r-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Layers className="w-4 h-4 shrink-0 text-violet-600" />
            مكاتب التأمينات الاجتماعية
          </button>

          <button
            onClick={() => setActiveTab('res_reasons')}
            className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'res_reasons' ? 'bg-sky-50 text-sky-700 border-r-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
            أسباب الاستقالة المعيارية
          </button>

          <button
            onClick={() => setActiveTab('vac_types')}
            className={`w-full text-right p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'vac_types' ? 'bg-sky-50 text-sky-700 border-r-4 border-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <CalendarCheck className="w-4 h-4 shrink-0 text-rose-500" />
            أنواع وأرصدة ومميزات الإجازات
          </button>
        </div>

        {/* Content Workspace Column */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          
          {/* Tab 1: Departments */}
          {activeTab === 'depts' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">قائمة إدارات المنشأة الرئيسية</h3>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddDept} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="اسم الإدارة الجديدة (مثال: الشئون القانونية)"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-1 focus:ring-sky-500"
                />
                <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  إضافة
                </button>
              </form>

              {/* Items List */}
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                {departments.map((dept) => (
                  <div key={dept.id} className="p-3 flex justify-between items-center hover:bg-slate-50/50">
                    <span className="font-semibold text-slate-800">{dept.name}</span>
                    <button
                      onClick={() => handleRemoveItem(departments, dept.id, onUpdateDepartments, 'تم حذف الإدارة بنجاح')}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50/50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Sections */}
          {activeTab === 'sections' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">ترمير الأقسام التابعة الهرمية</h3>
              </div>

              {/* Add Form with Department Mapping */}
              <form onSubmit={handleAddSection} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  required
                  value={newSecDeptId}
                  onChange={(e) => setNewSecDeptId(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                >
                  <option value="">-- اختر الإدارة المستضيفة --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="اسم وقب اسم الشريان أو القسم"
                  value={newSecName}
                  onChange={(e) => setNewSecName(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-bold flex justify-center items-center gap-1.5 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  ربط وإضافة القسم
                </button>
              </form>

              {/* List */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="p-3">اسم القسم الداخلي</th>
                      <th className="p-3">الإدارة العليا المرتبط بها</th>
                      <th className="p-3 text-left">إجراء الحذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sections.map((sec) => (
                      <tr key={sec.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-800">{sec.name}</td>
                        <td className="p-3 text-slate-500">{departments.find((d) => d.id === sec.departmentId)?.name || '--'}</td>
                        <td className="p-3 text-left">
                          <button
                            onClick={() => handleRemoveItem(sections, sec.id, onUpdateSections, 'تم حذف القسم بنجاح')}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Positions / Jobs */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">قائمة الوظائف المعتمدة بالملاك الوظيفي</h3>
                <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100">
                  إجمالي المسجلين: {jobTitles.length}
                </span>
              </div>

              {/* Add manual form */}
              <form onSubmit={handleAddJob} className="flex gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <input
                  type="text"
                  required
                  placeholder="المسمى الوظيفي الجديد (مثال: طبيب مقيم، محاسب أول)"
                  value={newJobName}
                  onChange={(e) => setNewJobName(e.target.value)}
                  className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-1 focus:ring-amber-500 font-sans"
                />
                <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs">
                  <Plus className="w-4 h-4" />
                  تثبيت الفئة يدوياً
                </button>
              </form>

              {/* Excel/CSV Batch Import of job titles */}
              <div id="import-jobs-excel-section" className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100/80 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-amber-600 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black text-slate-800">ترميز واستيراد المسميات جماعياً من Excel / ملف CSV</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">يمكنك رفع شيت المسميات أو لصقها مباشرة من ملف الإكسل لتكديسها بالملاك الوظيفي فوراً.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={downloadJobTemplate}
                    className="px-3 py-1.5 bg-white border border-amber-200 hover:bg-amber-50 text-amber-800 text-[11px] font-black rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    تحميل نموذج Excel CSV
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Zone */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-700 block">اختر ملف CSV / Excel مصدّر:</label>
                    <div className="relative border border-dashed border-slate-300 hover:border-amber-400 bg-white p-4 rounded-xl text-center transition-colors">
                      <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleJobFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-1 flex flex-col items-center">
                        <Upload className="w-6 h-6 text-slate-400" />
                        <span className="text-[11px] text-slate-500 font-bold">اسحب الملف أو اضغط هنا للتصفح</span>
                        <span className="text-[9px] text-slate-400 font-mono">يدعم CSV المرمّز بـ UTF-8</span>
                      </div>
                    </div>
                    {jobImportFileName && (
                      <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 p-1.5 rounded-lg border border-emerald-100/70">
                        الملف المختار: {jobImportFileName}
                      </p>
                    )}
                  </div>

                  {/* Fast copy-paste from Excel column */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-700 block">لصق مباشر من عمود Excel:</label>
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={jobImportPasteText}
                        onChange={(e) => setJobImportPasteText(e.target.value)}
                        placeholder="الصق المسميات الوظيفية مباشرة هنا (كل وظيفة في سطر منفصل)..."
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-1 focus:ring-amber-500 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => parseJobImportText(jobImportPasteText)}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition-colors cursor-pointer flex justify-center items-center gap-1.5"
                      >
                        <FileUp className="w-4 h-4" />
                        تحليل النص المنسوخ
                      </button>
                    </div>
                  </div>
                </div>

                {/* Import Preview results */}
                {jobImportPreview.length > 0 && (
                  <div className="bg-white p-4 rounded-xl border border-emerald-250 space-y-3.5 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        معاينة المسميات الوظيفية المكتشفة بالملف ({jobImportPreview.length} مسمى جديد)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setJobImportPreview([]);
                          setJobImportFileName('');
                          setJobImportPasteText('');
                        }}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-bold underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        إلغاء المعاينة
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-slate-50/50 rounded-lg">
                      {jobImportPreview.map((name, idx) => (
                        <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold px-2 py-1 rounded-md">
                          {name}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                      <p className="text-[10px] text-emerald-800 font-bold">تم فلترة المسميات المكررة وجرد الملاك النظيف.</p>
                      <button
                        type="button"
                        onClick={handleConfirmImportJobs}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2'../types' rounded-xl cursor-pointer shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                      >
                        تأكيد واستيراد وترميز المسميات ({jobImportPreview.length})
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Established List */}
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-600">المسميات الوظيفية المعتمدة حالياً بالنظام:</p>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs max-h-96 overflow-y-auto font-sans">
                  {jobTitles.map((job) => (
                    <div key={job.id} className="p-3 flex justify-between items-center hover:bg-slate-50/50">
                      <span className="font-semibold text-slate-800">{job.name}</span>
                      <button
                        onClick={() => handleRemoveItem(jobTitles, job.id, onUpdateJobTitles, 'تم حذف مسمى الوظيفة بنجاح')}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50/50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Cost Centers */}
          {activeTab === 'cost_centers' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">ترميز مراكز التكلفة والمحاسبة الضريبية</h3>
              </div>

              <form onSubmit={handleAddCc} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="رمز الكود (مثال: 1004)"
                  value={newCcCode}
                  onChange={(e) => setNewCcCode(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden font-mono"
                />
                <input
                  type="text"
                  required
                  placeholder="اسم مركز التكلفة لقائمة الحصص"
                  value={newCcName}
                  onChange={(e) => setNewCcName(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                />
                <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-4 py-2 text-xs font-bold flex justify-center items-center gap-1.5 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  تثبيت المركز مالي
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="p-3">كود</th>
                      <th className="p-3">اسم مركز التكلفة الحسابي</th>
                      <th className="p-3 text-left">إلغاء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {costCenters.map((cc) => (
                      <tr key={cc.id} className="hover:bg-slate-50 border-slate-100">
                        <td className="p-3 text-slate-600 font-bold">{cc.code}</td>
                        <td className="p-3 font-mono font-sans text-slate-800 font-medium">{cc.name}</td>
                        <td className="p-3 text-left">
                          <button
                            onClick={() => handleRemoveItem(costCenters, cc.id, onUpdateCostCenters, 'تم إلغاء مركز التكلفة')}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Insurance percentages configuration */}
          {activeTab === 'insurance_config' && (
            <form onSubmit={handleSaveInsuranceConfig} className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">نسب مساهمة التأمينات للموظف والمؤسسة</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">نسبة اقتطاع الموظف لتأمين العمل (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={empRatio}
                    onChange={(e) => setEmpRatio(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400">القانون الشائع لهيئة التأمينات المعنية: 11%</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">نسبة مساهمة الشركة / صاحب العمل (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={compRatio}
                    onChange={(e) => setCompRatio(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400">القانون الشائع لهيئة التأمينات: 18.75%</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">الحد الأدنى للأجر التأميني المتغير (ج.م)</label>
                  <input
                    type="number"
                    required
                    value={insMinLimit}
                    onChange={(e) => setInsMinLimit(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">الحد الأقصى للأجر التأميني المتغير (ج.م)</label>
                  <input
                    type="number"
                    required
                    value={insMaxLimit}
                    onChange={(e) => setInsMaxLimit(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs">
                  <Save className="w-4 h-4" />
                  حفظ التعديلات التأمينية
                </button>
              </div>
            </form>
          )}

          {/* Tab 6: Insurance Offices */}
          {activeTab === 'insurance_offices' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">قائمة مكاتب التأمينات الاجتماعية المعتمدة بالتسجيل</h3>
              </div>

              <form onSubmit={handleAddOffice} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="رقم الكود الاستدلالي للمكتب التأميني"
                  value={newOfficeCode}
                  onChange={(e) => setNewOfficeCode(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden font-mono"
                />
                <input
                  type="text"
                  required
                  placeholder="اسم مكتب الهيئة التأمينية الفرعي"
                  value={newOfficeName}
                  onChange={(e) => setNewOfficeName(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                />
                <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-4 py-2 text-xs font-bold flex justify-center items-center gap-1.5 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  إضافة مكتب
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="p-3 font-mono">رقم كود المكتب</th>
                      <th className="p-3">اسم مكتب هيئة التأمينات</th>
                      <th className="p-3 text-left">إلغاء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {insuranceOffices.map((off) => (
                      <tr key={off.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-600 font-bold">{off.code}</td>
                        <td className="p-3 font-sans font-medium text-slate-800">{off.name}</td>
                        <td className="p-3 text-left">
                          <button
                            onClick={() => handleRemoveItem(insuranceOffices, off.id, onUpdateInsuranceOffices, 'تم مسح سجل المكتب بنجاح')}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 7: Resignation reasons */}
          {activeTab === 'res_reasons' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">شجرة أسباب استقالة الموظفين والانتهاء</h3>
              </div>

              <form onSubmit={handleAddReason} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="سبب الاستقالة أو مبرر التصفية المالية (مثال: بسبب التعاقد خارج القطر المصري)"
                  value={newReasonText}
                  onChange={(e) => setNewReasonText(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                />
                <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  إضافة بديل
                </button>
              </form>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                {resignationReasons.map((res) => (
                  <div key={res.id} className="p-3 flex justify-between items-center hover:bg-slate-50/50">
                    <span className="font-semibold text-slate-800">{res.reason}</span>
                    <button
                      onClick={() => handleRemoveItem(resignationReasons, res.id, onUpdateResignationReasons, 'تم إزالة سبب التصفية بنجاح')}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50/50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 8: Vacation config */}
          {activeTab === 'vac_types' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">قواعد إسناد وحصص إجازات العاملين</h3>
              </div>

              <form onSubmit={handleAddVacType} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="مسمى باقة الإجازة (مثال: إجازة زواج)"
                  value={newVacName}
                  onChange={(e) => setNewVacName(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                />
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="الرصيد الممنوح (عادة 21 يوماً)"
                  value={newVacDays}
                  onChange={(e) => setNewVacDays(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden font-mono"
                />
                <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-4 py-2 text-xs font-bold flex justify-center items-center gap-1.5 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  إضافة الإجازة
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="p-3">مسمى حركة رصيد الإجازة</th>
                      <th className="p-3 text-center">الرصيد الافتراضي السنوي</th>
                      <th className="p-3 text-left">أرشفة ومرئية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vacationTypes.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-800">{v.name}</td>
                        <td className="p-3 text-center font-mono text-emerald-700 font-bold">{v.daysAllowed} يوماً سنوياً</td>
                        <td className="p-3 text-left">
                          <button
                            onClick={() => handleRemoveItem(vacationTypes, v.id, onUpdateVacationTypes, 'تم إزالة حركة الترميز')}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  );
}
