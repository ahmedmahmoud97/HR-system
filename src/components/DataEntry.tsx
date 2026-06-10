/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  UserPlus,
  UserMinus,
  CalendarDays,
  CheckSquare,
  Building,
  DollarSign,
  Phone,
  FileText,
  BadgeAlert,
  FileSpreadsheet,
  Upload,
  Download,
  Clipboard,
  Sparkles,
  AlertCircle,
  Search,
  X,
} from 'lucide-react';
import {
  Employee,
  Department,
  Section,
  JobTitle,
  CostCenter,
  InsuranceOffice,
  ResignationReason,
  VacationType,
  VacationRequest,
  AttendanceRecord,
} from '../types';

interface DataEntryProps {
  employees: Employee[];
  departments: Department[];
  sections: Section[];
  jobTitles: JobTitle[];
  costCenters: CostCenter[];
  insuranceOffices: InsuranceOffice[];
  resignationReasons: ResignationReason[];
  vacationTypes: VacationType[];
  attendance: AttendanceRecord[];
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onTerminateEmployee: (empId: string, date: string, reasonId: string) => void;
  onAddVacationRequest: (req: Omit<VacationRequest, 'id' | 'requestDate' | 'status'> & { status: 'pending' | 'approved' }) => void;
  onUpdateAttendance: (records: { employeeId: string; date: string; clockIn: string; clockOut: string; status: 'present' | 'absent' | 'late' | 'excused'; notes?: string }[]) => void;
  onBatchAddEmployees: (newEmps: Omit<Employee, 'id'>[]) => void;
  onBatchUpdateAttendance: (records: { employeeId: string; date: string; clockIn: string; clockOut: string; status: 'present' | 'absent' | 'late' | 'excused'; notes?: string }[]) => void;
  systemMonth: { year: number; month: number };
}

export default function DataEntry({
  employees,
  departments,
  sections,
  jobTitles,
  costCenters,
  insuranceOffices,
  resignationReasons,
  vacationTypes,
  attendance,
  onAddEmployee,
  onUpdateEmployee,
  onTerminateEmployee,
  onAddVacationRequest,
  onUpdateAttendance,
  onBatchAddEmployees,
  onBatchUpdateAttendance,
  systemMonth,
}: DataEntryProps) {
  // Mini tabs state
  const [activeSubTab, setActiveSubTab] = useState<'hire' | 'edit' | 'terminate' | 'vacation' | 'attendance' | 'import'>('hire');

  // Filter sections by department for hiring form
  const [selectedDeptId, setSelectedDeptId] = useState('');

  // 1. Hiring form states
  const [hireCode, setHireCode] = useState('');
  const [hireName, setHireName] = useState('');
  const [hireNationalId, setHireNationalId] = useState('');
  const [hirePhone, setHirePhone] = useState('');
  const [hireEmail, setHireEmail] = useState('');
  const [hireDeptId, setHireDeptId] = useState('');
  const [hireSectionId, setHireSectionId] = useState('');
  const [hireJobId, setHireJobId] = useState('');
  const [hireCostCenterId, setHireCostCenterId] = useState('');
  const [hireInsuranceNumber, setHireInsuranceNumber] = useState('');
  const [hireInsuranceOfficeId, setHireInsuranceOfficeId] = useState('');
  const [hireDate, setHireDate] = useState(`2026-06-01`);
  const [hireBasicSalary, setHireBasicSalary] = useState('');
  const [hireInsuranceSalary, setHireInsuranceSalary] = useState('');
  const [hireVacationBalance, setHireVacationBalance] = useState('21');
  const [hireAddress, setHireAddress] = useState('');
  const [hireSocialStatus, setHireSocialStatus] = useState('');
  
  // New States requested for Hire template
  const [hireAltPhone, setHireAltPhone] = useState('');
  const [hireNationalIdExpiry, setHireNationalIdExpiry] = useState('');
  const [hireInsuranceStartDate, setHireInsuranceStartDate] = useState('');
  const [hireDateOfBirth, setHireDateOfBirth] = useState('');
  const [hirePlaceOfBirth, setHirePlaceOfBirth] = useState('');
  const [hireActualSalary, setHireActualSalary] = useState('');
  const [hireQualification, setHireQualification] = useState('');
  const [hireQualificationIssuer, setHireQualificationIssuer] = useState('');
  const [hireMilitaryStatus, setHireMilitaryStatus] = useState('');
  const [hireMilitaryDefermentExpiry, setHireMilitaryDefermentExpiry] = useState('');
  const [hirePromotionTitle, setHirePromotionTitle] = useState('');
  const [hireNewJobDate, setHireNewJobDate] = useState('');
  const [hirePersonalPhoto, setHirePersonalPhoto] = useState('');
  const [hireGender, setHireGender] = useState('ذكر');
  const [hireContractExpiryDate, setHireContractExpiryDate] = useState('');

  // 1.25. Editing employee form states
  const [editEmpId, setEditEmpId] = useState('');
  const [editSearchCode, setEditSearchCode] = useState('');
  const [editSearchName, setEditSearchName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editNationalId, setEditNationalId] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editSectionId, setEditSectionId] = useState('');
  const [editJobId, setEditJobId] = useState('');
  const [editCostCenterId, setEditCostCenterId] = useState('');
  const [editInsuranceNumber, setEditInsuranceNumber] = useState('');
  const [editInsuranceOfficeId, setEditInsuranceOfficeId] = useState('');
  const [editDate, setEditDate] = useState(`2026-06-01`);
  const [editBasicSalary, setEditBasicSalary] = useState('');
  const [editInsuranceSalary, setEditInsuranceSalary] = useState('');
  const [editVacationBalance, setEditVacationBalance] = useState('21');
  const [editStatus, setEditStatus] = useState<'active' | 'terminated'>('active');
  const [editAddress, setEditAddress] = useState('');
  const [editSocialStatus, setEditSocialStatus] = useState('');

  // New States requested for Edit template
  const [editAltPhone, setEditAltPhone] = useState('');
  const [editNationalIdExpiry, setEditNationalIdExpiry] = useState('');
  const [editInsuranceStartDate, setEditInsuranceStartDate] = useState('');
  const [editDateOfBirth, setEditDateOfBirth] = useState('');
  const [editPlaceOfBirth, setEditPlaceOfBirth] = useState('');
  const [editActualSalary, setEditActualSalary] = useState('');
  const [editQualification, setEditQualification] = useState('');
  const [editQualificationIssuer, setEditQualificationIssuer] = useState('');
  const [editMilitaryStatus, setEditMilitaryStatus] = useState('');
  const [editMilitaryDefermentExpiry, setEditMilitaryDefermentExpiry] = useState('');
  const [editPromotionTitle, setEditPromotionTitle] = useState('');
  const [editNewJobDate, setEditNewJobDate] = useState('');
  const [editPersonalPhoto, setEditPersonalPhoto] = useState('');
  const [editGender, setEditGender] = useState('ذكر');
  const [editContractExpiryDate, setEditContractExpiryDate] = useState('');

  // Feedback notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 2. Terminate form states
  const [termEmpId, setTermEmpId] = useState('');
  const [termDate, setTermDate] = useState(`2026-06-07`);
  const [termReasonId, setTermReasonId] = useState('');

  // 3. Vacation form states
  const [vacEmpId, setVacEmpId] = useState('');
  const [vacTypeId, setVacTypeId] = useState('');
  const [vacStartDate, setVacStartDate] = useState(`2026-06-07`);
  const [vacEndDate, setVacEndDate] = useState(`2026-06-07`);
  const [vacNotes, setVacNotes] = useState('');
  const [vacApproved, setVacApproved] = useState<'pending' | 'approved'>('pending');

  // 4. Attendance form states
  const todayStr = `2026-06-07`;
  const [attDate, setAttDate] = useState(todayStr);
  const activeEmployees = employees.filter((e) => e.status === 'active');

  // Excel Sheet Import States & Handlers
  const [importType, setImportType] = useState<'hires' | 'attendance'>('hires');
  const [importMethod, setImportMethod] = useState<'upload' | 'paste'>('upload');
  const [pastedData, setPastedData] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<{ type: 'error' | 'warning'; message: string; row: number }[]>([]);
  const [isAnalysed, setIsAnalysed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = (type: 'hires' | 'attendance') => {
    let headers = '';
    let rows = '';
    if (type === 'hires') {
      headers = 'كود الموظف,الاسم,الوظيفة,الادارة,القسم,رقم التليفون,رقم تليفون اخر,الرقم القومي,تاريخ نهاية البطاقة الشخصية,العنوان,تاريخ التعيين,الرقم التأميني,مكتب التأمينات,تاريخ بداية التأمين,الاساسي التأميني,الاجر التأميني,تاريخ الميلاد,محل الميلاد,الراتب الفعلي,الحالة الاجتماعية,اسم المؤهل الدراسي,جهة الحصول على المؤهل,حالة التجنيد,تاريخ نهاية التأجيل,الترقية الوظيفية,تاريخ الوظيفة الجديدة,الجنس,البريد الالكتروني\n';
      rows = '201,أحمد محمد حسني,أخصائي موارد بشرية,إدارة الموارد البشرية,قسم التعيينات,01012345678,01122334455,29108150101852,2030-05-20,القاهرة التجمع الخامس,2026-06-01,78541259,مكتب تأمينات المعادي,2026-06-01,8500,4500,1991-08-15,القاهرة,11000,متزوج,بكالوريوس تجارة,جامعة حلوان,أدى الخدمة العسكرية,,أخصائي أول,2026-06-01,ذكر,ahmed@company.com\n202,سامية عادل عبد الله,محاسب أول,الإدارة المالية,قسم الحسابات,01222334455,01599887766,29412151234567,2031-11-21,الجيزة الدقي,2026-06-01,98541200,مكتب تأمينات الجيزة,2026-06-01,9200,5000,1994-12-15,الجيزة,13000,أعزب,بكالوريوس محاسبة,جامعة القاهرة,غير مطلوب للتجنيد,,محاسب رئيسي,2026-06-01,أنثى,samia@company.com';
    } else {
      headers = 'كود الموظف,التاريخ,وقت الحضور,وقت الانصراف,حالة الحضور,ملاحظات\n';
      rows = '101,2026-06-07,08:50,17:15,حاضر,حضور رسمي مبكر\n102,2026-06-07,09:45,17:00,متأخر,تأخر بعلم المدير\n103,2026-06-07,,,غائب,غائب عن استدعاء اليوم';
    }
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", type === 'hires' ? "template_hires.csv" : "template_attendance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        analyseData(text);
      }
    };
    reader.onerror = () => {
      showNotification(false, 'خطأ أثناء قراءة ملف CSV أو سبريدشيت.');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        analyseData(text);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const analyseData = (rawTextToParse?: string) => {
    const text = rawTextToParse !== undefined ? rawTextToParse : pastedData;
    if (!text || !text.trim()) {
      showNotification(false, 'الرجاء كتابة أو لصق بيانات من الكشوف أو تحميل ملف مناسب للتحليل أولاً.');
      return;
    }

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      showNotification(false, 'البيانات المدخلة لا تحتوي على صفوف كافية (يتطلب ترويسة الأعمدة وصف بيانات واحد على الأقل).');
      return;
    }

    const headerLine = lines[0];
    const cellDelimiter = headerLine.includes('\t') ? '\t' : (headerLine.includes(';') ? ';' : ',');
    const headers = headerLine.split(cellDelimiter).map(h => h.replace(/^["']|["']$/g, '').trim());

    // Map headers dynamically
    const mapping: { [key: string]: number } = {};
    headers.forEach((h, idx) => {
      const clean = h.toLowerCase().trim();
      if (importType === 'hires') {
        if (clean.includes('كود') || clean.includes('code')) mapping.code = idx;
        else if (clean === 'اسم' || clean === 'الاسم' || clean.includes('الاسم') || clean.includes('name')) mapping.name = idx;
        else if (clean.includes('قومي') || clean.includes('national')) mapping.nationalId = idx;
        else if (clean.includes('رقم تليفون اخر') || clean.includes('تليفون اخر') || clean.includes('تليفون أخر') || clean.includes('alt_phone') || clean.includes('altphone')) mapping.altPhone = idx;
        else if (clean.includes('هاتف') || clean.includes('تليفون') || clean.includes('phone') || clean.includes('mobile')) mapping.phone = idx;
        else if (clean.includes('بريد') || clean.includes('email')) mapping.email = idx;
        else if (clean.includes('نهاية البطاقة') || clean.includes('نهايه البطاقه') || clean.includes('expiry_national') || clean.includes('nationalidexpiry')) mapping.nationalIdExpiry = idx;
        else if (clean.includes('عنوان') || clean.includes('address')) mapping.address = idx;
        else if (clean.includes('بداية التأمين') || clean.includes('بداية التامين') || clean.includes('insurancestartdate')) mapping.insuranceStartDate = idx;
        else if (clean.includes('ميلاد') && (clean.includes('محل') || clean.includes('place')) || clean.includes('placeofbirth')) mapping.placeOfBirth = idx;
        else if (clean.includes('ميلاد') && (clean.includes('تاريخ') || clean.includes('dateofbirth') || clean.includes('birth'))) mapping.dateOfBirth = idx;
        else if (clean.includes('راتب فعلي') || clean.includes('الراتب الفعلي') || clean.includes('actual') || clean.includes('actualsalary')) mapping.actualSalary = idx;
        else if (clean.includes('اسم المؤهل') || clean.includes('المؤهل الدراسي') || clean.includes('مؤهل') || clean.includes('qualification')) mapping.qualification = idx;
        else if (clean.includes('جهة الحصول') || clean.includes('جهة المؤهل') || clean.includes('qualificationissuer')) mapping.qualificationIssuer = idx;
        else if (clean.includes('تجنيد') || clean.includes('العسكرية') || clean.includes('military') || clean.includes('militarystatus')) mapping.militaryStatus = idx;
        else if (clean.includes('نهاية التأجيل') || clean.includes('نهايه التاجيل') || clean.includes('militarydefermentexpiry')) mapping.militaryDefermentExpiry = idx;
        else if (clean.includes('ترقية') || clean.includes('ترقيه') || clean.includes('promotion')) mapping.promotionTitle = idx;
        else if (clean.includes('تاريخ الوظيفة الجديدة') || clean.includes('تاريخ الوظيفه الجديده') || clean.includes('newjobdate')) mapping.newJobDate = idx;
        else if (clean.includes('جنس') || clean.includes('gender')) mapping.gender = idx;
        else if (clean.includes('اجتماعية') || clean.includes('social') || clean.includes('marital')) mapping.socialStatus = idx;
        else if (clean.includes('أساسي') || clean.includes('اساسي') || clean.includes('basic') || clean.includes('salary')) mapping.basicSalary = idx;
        else if (clean.includes('تأميني') || clean.includes('تاميني') || clean.includes('insurance')) mapping.insuranceSalary = idx;
        else if (clean.includes('رقم تأميني') || clean.includes('رقم تاميني') || clean.includes('insurance_num')) mapping.insuranceNumber = idx;
        else if (clean.includes('مكتب') || clean.includes('office')) mapping.insuranceOffice = idx;
        else if (clean.includes('تعيين') || clean.includes('hire_date')) mapping.hireDate = idx;
        else if (clean.includes('رصيد') || clean.includes('إجازات') || clean.includes('اجازات') || clean.includes('vacation')) mapping.vacationBalance = idx;
        else if (clean.includes('إدارة') || clean.includes('اداره') || clean.includes('department') || clean.includes('dept')) mapping.dept = idx;
        else if (clean.includes('قسم') || clean.includes('section')) mapping.section = idx;
        else if (clean.includes('وظيفة') || clean.includes('وظيفه') || clean.includes('job')) mapping.job = idx;
      } else {
        if (clean.includes('كود') || clean.includes('code')) mapping.code = idx;
        else if (clean.includes('تاريخ') || clean.includes('date') || clean.includes('يوم')) mapping.date = idx;
        else if (clean.includes('حضور') || clean.includes('in') || clean.includes('clock_in')) mapping.clockIn = idx;
        else if (clean.includes('انصراف') || clean.includes('out') || clean.includes('clock_out')) mapping.clockOut = idx;
        else if (clean.includes('حالة') || clean.includes('status') || clean.includes('حضور')) mapping.status = idx;
        else if (clean.includes('ملاحظات') || clean.includes('note')) mapping.notes = idx;
      }
    });

    const errors: typeof importErrors = [];
    const rows: any[] = [];

    // Check mandatory fields mapping
    if (importType === 'hires') {
      if (mapping.code === undefined || mapping.name === undefined) {
        showNotification(false, 'فشل التعرف الآلي على الأعمدة الأساسية (كود الموظف، الاسم رباعي). يرجى التأكد من تطابق ترويسات الجدول مع القالب المتاح.');
        return;
      }
    } else {
      if (mapping.code === undefined || mapping.status === undefined) {
        showNotification(false, 'فشل التعرف الآلي على الأعمدة الأساسية للحضور (كود الموظف، حالة الحضور). يرجى مراجعة ترويسات الجدول.');
        return;
      }
    }

    // Now loop through rows
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(cellDelimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
      
      // Skip empty line cells
      if (cells.length === 0 || cells.join('').trim() === '') continue;

      const codeVal = cells[mapping.code] || '';
      const rowNum = i + 1;
      
      if (importType === 'hires') {
        const nameVal = cells[mapping.name] || '';
        const natIdVal = cells[mapping.nationalId] || '';
        const phoneVal = mapping.phone !== undefined ? cells[mapping.phone] || '' : '';
        const emailVal = mapping.email !== undefined ? cells[mapping.email] || '' : '';
        const addressVal = mapping.address !== undefined ? cells[mapping.address] || '' : '';
        const socialVal = mapping.socialStatus !== undefined ? cells[mapping.socialStatus] || '' : '';
        const deptVal = mapping.dept !== undefined ? cells[mapping.dept] || '' : '';
        const sectionVal = mapping.section !== undefined ? cells[mapping.section] || '' : '';
        const jobVal = mapping.job !== undefined ? cells[mapping.job] || '' : '';
        const insNum = mapping.insuranceNumber !== undefined ? cells[mapping.insuranceNumber] || '' : '';
        const insOffVal = mapping.insuranceOffice !== undefined ? cells[mapping.insuranceOffice] || '' : '';
        const basicSal = mapping.basicSalary !== undefined ? parseFloat(cells[mapping.basicSalary]) || 5000 : 5000;
        const insSal = mapping.insuranceSalary !== undefined ? parseFloat(cells[mapping.insuranceSalary]) || 4000 : 4000;
        const hireDateVal = mapping.hireDate !== undefined ? cells[mapping.hireDate] || '2026-06-01' : '2026-06-01';
        const vacBal = mapping.vacationBalance !== undefined ? parseFloat(cells[mapping.vacationBalance]) || 21 : 21;

        // Custom new fields
        const altPhoneVal = mapping.altPhone !== undefined ? cells[mapping.altPhone] || '' : '';
        const natIdExpVal = mapping.nationalIdExpiry !== undefined ? cells[mapping.nationalIdExpiry] || '' : '';
        const insStartVal = mapping.insuranceStartDate !== undefined ? cells[mapping.insuranceStartDate] || '' : '';
        const dobVal = mapping.dateOfBirth !== undefined ? cells[mapping.dateOfBirth] || '' : '';
        const placeOfBirthVal = mapping.placeOfBirth !== undefined ? cells[mapping.placeOfBirth] || '' : '';
        const actSalVal = mapping.actualSalary !== undefined ? parseFloat(cells[mapping.actualSalary]) || undefined : undefined;
        const qualVal = mapping.qualification !== undefined ? cells[mapping.qualification] || '' : '';
        const qualIssVal = mapping.qualificationIssuer !== undefined ? cells[mapping.qualificationIssuer] || '' : '';
        const milStatVal = mapping.militaryStatus !== undefined ? cells[mapping.militaryStatus] || '' : '';
        const milDefVal = mapping.militaryDefermentExpiry !== undefined ? cells[mapping.militaryDefermentExpiry] || '' : '';
        const promVal = mapping.promotionTitle !== undefined ? cells[mapping.promotionTitle] || '' : '';
        const newJobDateVal = mapping.newJobDate !== undefined ? cells[mapping.newJobDate] || '' : '';
        const genderVal = mapping.gender !== undefined ? cells[mapping.gender] || 'ذكر' : 'ذكر';

        // Auto-resolve department Name to existing Department ID
        let matchedDeptId = '';
        if (deptVal) {
          const m = departments.find(d => d.name.includes(deptVal) || deptVal.includes(d.name) || d.id === deptVal);
          if (m) {
            matchedDeptId = m.id;
          }
        }
        if (!matchedDeptId) {
          matchedDeptId = departments[0]?.id || 'dept-1';
        }

        // Auto-resolve sectionName
        let matchedSectionId = '';
        if (sectionVal) {
          const m = sections.find(s => s.name.includes(sectionVal) || sectionVal.includes(s.name) || s.id === sectionVal);
          if (m) {
            matchedSectionId = m.id;
          }
        }
        if (!matchedSectionId) {
          matchedSectionId = sections.find(s => s.departmentId === matchedDeptId)?.id || sections[0]?.id || 'sec-1';
        }

        // Auto-resolve jobId
        let matchedJobId = '';
        if (jobVal) {
          const m = jobTitles.find(j => j.name.includes(jobVal) || jobVal.includes(j.name) || j.id === jobVal);
          if (m) {
            matchedJobId = m.id;
          }
        }
        if (!matchedJobId) {
          matchedJobId = jobTitles[0]?.id || 'job-1';
        }

        // Auto-resolve insuranceOfficeId
        let matchedOfficeId = '';
        if (insOffVal) {
          const m = insuranceOffices.find(off => off.name.includes(insOffVal) || insOffVal.includes(off.name) || off.code === insOffVal || off.id === insOffVal);
          if (m) {
            matchedOfficeId = m.id;
          }
        }
        if (!matchedOfficeId) {
          matchedOfficeId = insuranceOffices[0]?.id || 'off-1';
        }

        // Validate values
        if (!codeVal) {
          errors.push({ type: 'error', message: `الصف ${rowNum}: كود الموظف مفقود أو فارغ!`, row: rowNum });
        } else if (employees.some(emp => emp.code === codeVal)) {
          errors.push({ type: 'error', message: `الصف ${rowNum}: كود الموظف (${codeVal}) مسجل مسبقاً لموظف آخر بالمنظومة!`, row: rowNum });
        }

        if (!nameVal) {
          errors.push({ type: 'error', message: `الصف ${rowNum}: اسم الموظف مفقود!`, row: rowNum });
        }

        if (natIdVal && natIdVal.length !== 14) {
          errors.push({ type: 'warning', message: `الصف ${rowNum}: الرقم القومي (${natIdVal}) ليس طويلاً بما يكفي (يتطلب 14 خانة). يرجى التحقق.`, row: rowNum });
        }

        rows.push({
          code: codeVal,
          name: nameVal,
          nationalId: natIdVal,
          phone: phoneVal,
          email: emailVal,
          address: addressVal || undefined,
          socialStatus: socialVal || undefined,
          departmentId: matchedDeptId,
          sectionId: matchedSectionId,
          jobId: matchedJobId,
          costCenterId: costCenters[0]?.id || 'cc-1',
          insuranceNumber: insNum || undefined,
          insuranceOfficeId: matchedOfficeId || undefined,
          basicSalary: basicSal,
          insuranceSalary: insSal,
          vacationBalance: vacBal,
          initialVacationBalance: vacBal,
          hireDate: hireDateVal,
          status: 'active',
          
          // Custom properties saved to raw row
          altPhone: altPhoneVal || undefined,
          nationalIdExpiry: natIdExpVal || undefined,
          insuranceStartDate: insStartVal || undefined,
          dateOfBirth: dobVal || undefined,
          placeOfBirth: placeOfBirthVal || undefined,
          actualSalary: actSalVal || undefined,
          qualification: qualVal || undefined,
          qualificationIssuer: qualIssVal || undefined,
          militaryStatus: milStatVal || undefined,
          militaryDefermentExpiryDate: milDefVal || undefined,
          promotionTitle: promVal || undefined,
          newJobDate: newJobDateVal || undefined,
          personalPhoto: '',
          gender: genderVal || 'ذكر',

          _deptName: departments.find(d => d.id === matchedDeptId)?.name || 'افتراضي',
          _rowNum: rowNum
        });

      } else {
        // Attendance mapping
        const dateVal = mapping.date !== undefined ? cells[mapping.date] || '2026-06-07' : '2026-06-07';
        const inVal = mapping.clockIn !== undefined ? cells[mapping.clockIn] || '' : '';
        const outVal = mapping.clockOut !== undefined ? cells[mapping.clockOut] || '' : '';
        const rawStatus = cells[mapping.status] || '';
        const noteVal = mapping.notes !== undefined ? cells[mapping.notes] || '' : '';

        // Map status
        let mappedStatus: 'present' | 'absent' | 'late' | 'excused' = 'present';
        const cleanStatus = rawStatus.toLowerCase().replace(/\s/g, '');
        if (cleanStatus.includes('غائب') || cleanStatus.includes('غياب') || cleanStatus.includes('absent')) {
          mappedStatus = 'absent';
        } else if (cleanStatus.includes('متأخر') || cleanStatus.includes('تأخير') || cleanStatus.includes('late')) {
          mappedStatus = 'late';
        } else if (cleanStatus.includes('عذر') || cleanStatus.includes('إجازة') || cleanStatus.includes('اجازة') || cleanStatus.includes('excused') || cleanStatus.includes('vacation')) {
          mappedStatus = 'excused';
        }

        const matchedEmp = employees.find(emp => emp.code === codeVal);
        if (!codeVal) {
          errors.push({ type: 'error', message: `الصف ${rowNum}: كود الموظف مفقود!`, row: rowNum });
        } else if (!matchedEmp) {
          errors.push({ type: 'error', message: `الصف ${rowNum}: كود الموظف (${codeVal}) غير مدرج بسجلات العاملين!`, row: rowNum });
        }

        rows.push({
          employeeId: matchedEmp?.id || '',
          employeeCode: codeVal,
          employeeName: matchedEmp?.name || 'غير مدرج بالجدول الحركي ⚠️',
          date: dateVal,
          clockIn: mappedStatus === 'absent' || mappedStatus === 'excused' ? '' : (inVal || '09:00'),
          clockOut: mappedStatus === 'absent' || mappedStatus === 'excused' ? '' : (outVal || '17:00'),
          status: mappedStatus,
          notes: noteVal,
          _rowNum: rowNum
        });
      }
    }

    setParsedRows(rows);
    setImportErrors(errors);
    setIsAnalysed(true);
    showNotification(true, `تمت معالجة المدخلات بنجاح. وجدنا ${rows.length} حركة للتأكيد و ${errors.length} تنبيهاً.`);
  };

  const commitImport = () => {
    if (parsedRows.length === 0) {
      showNotification(false, 'الكشف فارغ، لا توجد سجلات بيانات صالحة للاعتماد بقاعدة البيانات.');
      return;
    }

    const criticalErrors = importErrors.filter(err => err.type === 'error');
    if (criticalErrors.length > 0) {
      if (!confirm(`تحذير: يحتوي ملفك الحالي على عدد (${criticalErrors.length}) من الأخطاء الحرجة. لن يتم استيراد الصفوف التالفة. هل ترغب في المتابعة لحفظ الصفوف السليمة فقط؟`)) {
        return;
      }
    }

    const rowNumbersWithErrors = new Set(criticalErrors.map(err => err.row));
    const validRows = parsedRows.filter(row => !rowNumbersWithErrors.has(row._rowNum));

    if (validRows.length === 0) {
      showNotification(false, 'لم تتبق هناك أي صفوف سليمة مطابقة للاستيراد النهائي بقاعدة البيانات الرسمية.');
      return;
    }

    if (importType === 'hires') {
      const payload: Omit<Employee, 'id'>[] = validRows.map(r => ({
        code: r.code,
        name: r.name,
        nationalId: r.nationalId,
        phone: r.phone,
        email: r.email,
        departmentId: r.departmentId,
        sectionId: r.sectionId,
        jobId: r.jobId,
        costCenterId: r.costCenterId,
        insuranceNumber: r.insuranceNumber,
        insuranceOfficeId: r.insuranceOfficeId,
        basicSalary: r.basicSalary,
        insuranceSalary: r.insuranceSalary,
        vacationBalance: r.vacationBalance,
        initialVacationBalance: r.initialVacationBalance,
        hireDate: r.hireDate,
        status: 'active',
        address: r.address,
        socialStatus: r.socialStatus,
        
        // Add new batch fields
        altPhone: r.altPhone,
        nationalIdExpiry: r.nationalIdExpiry,
        insuranceStartDate: r.insuranceStartDate,
        dateOfBirth: r.dateOfBirth,
        placeOfBirth: r.placeOfBirth,
        actualSalary: r.actualSalary,
        qualification: r.qualification,
        qualificationIssuer: r.qualificationIssuer,
        militaryStatus: r.militaryStatus,
        militaryDefermentExpiryDate: r.militaryDefermentExpiryDate,
        promotionTitle: r.promotionTitle,
        newJobDate: r.newJobDate,
        personalPhoto: '',
        gender: r.gender || 'ذكر'
      }));

      onBatchAddEmployees(payload);
      showNotification(true, `تم بنجاح مباشرة عمل واستيراد عدد (${payload.length}) ملف موظف جديد.`);
    } else {
      const matchedRows = validRows.filter(r => r.employeeId !== '');
      if (matchedRows.length === 0) {
        showNotification(false, 'خطأ: لم نجد أي موظف مطابق لمجموع الأكواد المدونة في الكشف الحالي.');
        return;
      }

      const payload = matchedRows.map(r => ({
        employeeId: r.employeeId,
        date: r.date,
        clockIn: r.clockIn,
        clockOut: r.clockOut,
        status: r.status as 'present' | 'absent' | 'late' | 'excused',
        notes: r.notes || undefined
      }));

      onBatchUpdateAttendance(payload);
      showNotification(true, `عملية ناجحة: تم استيراد وتحديث عدد (${payload.length}) سجل حضور وانصراف جماعي بنجاح.`);
    }

    setParsedRows([]);
    setImportErrors([]);
    setIsAnalysed(false);
    setPastedData('');
    setImportFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearImport = () => {
    setParsedRows([]);
    setImportErrors([]);
    setIsAnalysed(false);
    setPastedData('');
    setImportFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 4b. Local store init for attendance 

  // Store local copy of attendance inputs
  // We initialize these inputs when the date changes or when the component displays
  const [attRows, setAttRows] = useState<{
    [empId: string]: {
      clockIn: string;
      clockOut: string;
      status: 'present' | 'absent' | 'late' | 'excused';
      notes: string;
    };
  }>(() => {
    const initial: typeof attRows = {};
    activeEmployees.forEach((emp) => {
      // Find matches for today string in global attendance
      const existing = attendance.find((a) => a.employeeId === emp.id && a.date === todayStr);
      initial[emp.id] = {
        clockIn: existing?.clockIn || '09:00',
        clockOut: existing?.clockOut || '17:00',
        status: existing?.status || 'present',
        notes: existing?.notes || '',
      };
    });
    return initial;
  });

  const handleDateChangeForAttendance = (date: string) => {
    setAttDate(date);
    const newRows: typeof attRows = {};
    activeEmployees.forEach((emp) => {
      const existing = attendance.find((a) => a.employeeId === emp.id && a.date === date);
      newRows[emp.id] = {
        clockIn: existing?.clockIn || (existing?.status === 'absent' || existing?.status === 'excused' ? '' : '09:00'),
        clockOut: existing?.clockOut || (existing?.status === 'absent' || existing?.status === 'excused' ? '' : '17:00'),
        status: existing?.status || 'present',
        notes: existing?.notes || '',
      };
    });
    setAttRows(newRows);
  };

  const showNotification = (isSuccess: boolean, msg: string) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(msg);
      setSuccessMsg('');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Hire submission
  const handleHireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hireCode || !hireName || !hireNationalId || !hireDeptId || !hireJobId) {
      showNotification(false, 'يرجى ملء جميع الحقول الإلزامية التي تحمل علامة (*): كود الموظف، الاسم، الرقم القومي، الإدارة، والوظيفة.');
      return;
    }

    // Check code duplication
    if (employees.some((emp) => emp.code === hireCode)) {
      showNotification(false, `كود الموظف (${hireCode}) مسجل مسبقاً لموظف آخر.`);
      return;
    }

    const resolvedSection = hireSectionId || sections.find(s => s.departmentId === hireDeptId)?.id || sections[0]?.id || 'sec-1';
    const resolvedCostCenter = hireCostCenterId || costCenters[0]?.id || 'cc-1';

    onAddEmployee({
      code: hireCode.trim(),
      name: hireName.trim(),
      nationalId: hireNationalId.trim(),
      phone: hirePhone.trim(),
      email: hireEmail.trim(),
      departmentId: hireDeptId,
      sectionId: resolvedSection,
      jobId: hireJobId,
      costCenterId: resolvedCostCenter,
      insuranceNumber: hireInsuranceNumber.trim() || undefined,
      insuranceOfficeId: hireInsuranceOfficeId || undefined,
      hireDate,
      status: 'active',
      basicSalary: parseFloat(hireBasicSalary) || 0,
      insuranceSalary: parseFloat(hireInsuranceSalary) || 0,
      initialVacationBalance: parseFloat(hireVacationBalance) || 21,
      vacationBalance: parseFloat(hireVacationBalance) || 21,
      address: hireAddress.trim() || undefined,
      socialStatus: hireSocialStatus || undefined,
      
      // New customized fields added
      altPhone: hireAltPhone.trim() || undefined,
      nationalIdExpiry: hireNationalIdExpiry || undefined,
      insuranceStartDate: hireInsuranceStartDate || undefined,
      dateOfBirth: hireDateOfBirth || undefined,
      placeOfBirth: hirePlaceOfBirth.trim() || undefined,
      actualSalary: parseFloat(hireActualSalary) || undefined,
      qualification: hireQualification.trim() || undefined,
      qualificationIssuer: hireQualificationIssuer.trim() || undefined,
      militaryStatus: hireMilitaryStatus || undefined,
      militaryDefermentExpiryDate: hireMilitaryDefermentExpiry || undefined,
      promotionTitle: hirePromotionTitle.trim() || undefined,
      newJobDate: hireNewJobDate || undefined,
      personalPhoto: hirePersonalPhoto || undefined,
      gender: hireGender || undefined,
      contractExpiryDate: hireContractExpiryDate || undefined,
    });

    showNotification(true, `تم تعيين الموظف الجديد: ${hireName} بنجاح وملازمته لكود (${hireCode})`);
    
    // Clear fields
    setHireCode('');
    setHireName('');
    setHireNationalId('');
    setHirePhone('');
    setHireEmail('');
    setHireDeptId('');
    setHireSectionId('');
    setHireJobId('');
    setHireCostCenterId('');
    setHireInsuranceNumber('');
    setHireInsuranceOfficeId('');
    setHireBasicSalary('');
    setHireInsuranceSalary('');
    setHireVacationBalance('21');
    setHireAddress('');
    setHireSocialStatus('');
    
    // Clear new custom fields
    setHireAltPhone('');
    setHireNationalIdExpiry('');
    setHireInsuranceStartDate('');
    setHireDateOfBirth('');
    setHirePlaceOfBirth('');
    setHireActualSalary('');
    setHireQualification('');
    setHireQualificationIssuer('');
    setHireMilitaryStatus('');
    setHireMilitaryDefermentExpiry('');
    setHirePromotionTitle('');
    setHireNewJobDate('');
    setHirePersonalPhoto('');
    setHireGender('ذكر');
    setHireContractExpiryDate('');
  };

  // 1.25. Handle Edit Employee submission
  const handleSelectEmployeeToEdit = (id: string) => {
    setEditEmpId(id);
    const emp = employees.find(e => e.id === id);
    if (emp) {
      setEditCode(emp.code);
      setEditName(emp.name);
      setEditNationalId(emp.nationalId);
      setEditPhone(emp.phone);
      setEditEmail(emp.email);
      setEditDeptId(emp.departmentId);
      setEditSectionId(emp.sectionId);
      setEditJobId(emp.jobId);
      setEditCostCenterId(emp.costCenterId);
      setEditInsuranceNumber(emp.insuranceNumber || '');
      setEditInsuranceOfficeId(emp.insuranceOfficeId || '');
      setEditDate(emp.hireDate);
      setEditBasicSalary(String(emp.basicSalary));
      setEditInsuranceSalary(String(emp.insuranceSalary));
      setEditVacationBalance(String(emp.vacationBalance));
      setEditStatus(emp.status);
      setEditAddress(emp.address || '');
      setEditSocialStatus(emp.socialStatus || '');

      // Load new fields
      setEditAltPhone(emp.altPhone || '');
      setEditNationalIdExpiry(emp.nationalIdExpiry || '');
      setEditInsuranceStartDate(emp.insuranceStartDate || '');
      setEditDateOfBirth(emp.dateOfBirth || '');
      setEditPlaceOfBirth(emp.placeOfBirth || '');
      setEditActualSalary(emp.actualSalary ? String(emp.actualSalary) : '');
      setEditQualification(emp.qualification || '');
      setEditQualificationIssuer(emp.qualificationIssuer || '');
      setEditMilitaryStatus(emp.militaryStatus || '');
      setEditMilitaryDefermentExpiry(emp.militaryDefermentExpiryDate || '');
      setEditPromotionTitle(emp.promotionTitle || '');
      setEditNewJobDate(emp.newJobDate || '');
      setEditPersonalPhoto(emp.personalPhoto || '');
      setEditGender(emp.gender || 'ذكر');
      setEditContractExpiryDate(emp.contractExpiryDate || '');
    } else {
      // Clear
      setEditCode('');
      setEditName('');
      setEditNationalId('');
      setEditPhone('');
      setEditEmail('');
      setEditDeptId('');
      setEditSectionId('');
      setEditJobId('');
      setEditCostCenterId('');
      setEditInsuranceNumber('');
      setEditInsuranceOfficeId('');
      setEditDate(`2026-06-01`);
      setEditBasicSalary('');
      setEditInsuranceSalary('');
      setEditVacationBalance('21');
      setEditStatus('active');
      setEditAddress('');
      setEditSocialStatus('');

      // Clear new fields
      setEditAltPhone('');
      setEditNationalIdExpiry('');
      setEditInsuranceStartDate('');
      setEditDateOfBirth('');
      setEditPlaceOfBirth('');
      setEditActualSalary('');
      setEditQualification('');
      setEditQualificationIssuer('');
      setEditMilitaryStatus('');
      setEditMilitaryDefermentExpiry('');
      setEditPromotionTitle('');
      setEditNewJobDate('');
      setEditPersonalPhoto('');
      setEditGender('ذكر');
      setEditContractExpiryDate('');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmpId) {
      showNotification(false, 'يرجى اختيار الموظف المطلوب تعديل كشفه أولاً.');
      return;
    }

    if (!editCode.trim() || !editName.trim() || !editNationalId.trim()) {
      showNotification(false, 'يرجى ملء جميع الحقول الإلزامية الأساسية (الكود، الاسم، الرقم القومي).');
      return;
    }

    // Verify duplicate code excluding current employee itself
    if (employees.some(emp => emp.id !== editEmpId && emp.code === editCode.trim())) {
      showNotification(false, `الفشل: الكود (${editCode}) مكرر ومسجل لصالح موظف آخر.`);
      return;
    }

    const currentEmp = employees.find(e => e.id === editEmpId);
    if (!currentEmp) return;

    const resolvedSection = editSectionId || sections.find(s => s.departmentId === editDeptId)?.id || sections[0]?.id || 'sec-1';
    const resolvedCostCenter = editCostCenterId || costCenters[0]?.id || 'cc-1';

    const updated: Employee = {
      ...currentEmp,
      code: editCode.trim(),
      name: editName.trim(),
      nationalId: editNationalId.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      departmentId: editDeptId,
      sectionId: resolvedSection,
      jobId: editJobId,
      costCenterId: resolvedCostCenter,
      insuranceNumber: editInsuranceNumber.trim() || undefined,
      insuranceOfficeId: editInsuranceOfficeId || undefined,
      hireDate: editDate,
      basicSalary: parseFloat(editBasicSalary) || 0,
      insuranceSalary: parseFloat(editInsuranceSalary) || 0,
      vacationBalance: parseFloat(editVacationBalance) || 21,
      initialVacationBalance: parseFloat(editVacationBalance) || 21,
      status: editStatus,
      address: editAddress.trim() || undefined,
      socialStatus: editSocialStatus || undefined,
      
      // Save new fields
      altPhone: editAltPhone.trim() || undefined,
      nationalIdExpiry: editNationalIdExpiry || undefined,
      insuranceStartDate: editInsuranceStartDate || undefined,
      dateOfBirth: editDateOfBirth || undefined,
      placeOfBirth: editPlaceOfBirth.trim() || undefined,
      actualSalary: parseFloat(editActualSalary) || undefined,
      qualification: editQualification.trim() || undefined,
      qualificationIssuer: editQualificationIssuer.trim() || undefined,
      militaryStatus: editMilitaryStatus || undefined,
      militaryDefermentExpiryDate: editMilitaryDefermentExpiry || undefined,
      promotionTitle: editPromotionTitle.trim() || undefined,
      newJobDate: editNewJobDate || undefined,
      personalPhoto: editPersonalPhoto || undefined,
      gender: editGender || undefined,
      contractExpiryDate: editContractExpiryDate || undefined,
    };

    onUpdateEmployee(updated);
    showNotification(true, `تم تعديل وتحديث ملف الموظف "${editName}" بنجاح وتعميم معطياته.`);
  };

  // Terminate contract submission
  const handleTerminateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termEmpId || !termDate || !termReasonId) {
      showNotification(false, 'يرجى اختيار الموظف وتحديد تاريخ الاستقالة وسببها.');
      return;
    }

    const terminatedEmp = employees.find((emp) => emp.id === termEmpId);
    if (!terminatedEmp) return;

    onTerminateEmployee(termEmpId, termDate, termReasonId);
    showNotification(true, `تم إنهاء عقد الموظف: ${terminatedEmp.name} بنجاح وتسوية رصيد إجازاته.`);
    
    setTermEmpId('');
    setTermReasonId('');
  };

  // Vacation submission
  const handleVacationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacEmpId || !vacTypeId || !vacStartDate || !vacEndDate) {
      showNotification(false, 'يرجى ملء كافة تفاصيل طلب الإجازة.');
      return;
    }

    const selectedEmp = employees.find((emp) => emp.id === vacEmpId);
    if (!selectedEmp) return;

    // Calculate vacation days count
    const start = new Date(vacStartDate);
    const end = new Date(vacEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays <= 0 || isNaN(diffDays)) {
      showNotification(false, 'تاريخ انتهاء الإجازة يجب أن يكون مساوياً أو بعد تاريخ البدء.');
      return;
    }

    // Check vacation balance if approved immediately
    if (vacApproved === 'approved' && selectedEmp.vacationBalance < diffDays) {
      showNotification(false, `عذراً، رصيد إجازات الموظف (${selectedEmp.vacationBalance} يوم) لا يكفي لطلب إبرام إجازة مدتها [${diffDays} يوم]. يمكنك حجزها بصفة معلقة (قيد الانتظار).`);
      return;
    }

    onAddVacationRequest({
      employeeId: vacEmpId,
      vacationTypeId: vacTypeId,
      startDate: vacStartDate,
      endDate: vacEndDate,
      days: diffDays,
      status: vacApproved,
      notes: vacNotes,
    });

    const statusText = vacApproved === 'approved' ? 'مقبولة مباشرة وتم خصمها من الرصيد' : 'معلقة في انتظار مراجعة الإدارة المختصة';
    showNotification(true, `تم تسجيل طلب الإجازة للموظف: ${selectedEmp.name} بنحو صحيح بصفة [${statusText}]، إجمالي الأيام: ${diffDays} يوم.`);

    setVacEmpId('');
    setVacTypeId('');
    setVacNotes('');
  };

  // Attendance batch update
  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const batchUpdates = Object.entries(attRows).map(([empId, val]) => {
      const row = val as {
        clockIn: string;
        clockOut: string;
        status: 'present' | 'absent' | 'late' | 'excused';
        notes: string;
      };
      return {
        employeeId: empId,
        date: attDate,
        clockIn: row.status === 'absent' || row.status === 'excused' ? '' : row.clockIn,
        clockOut: row.status === 'absent' || row.status === 'excused' ? '' : row.clockOut,
        status: row.status,
        notes: row.notes,
      };
    });

    onUpdateAttendance(batchUpdates);
    showNotification(true, `تم تحديث الحضور والانصراف ليوم ${attDate} لجميع العاملين بنجاح.`);
  };

  const handleRowChange = (empId: string, field: string, value: string) => {
    setAttRows((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [field]: value,
      },
    }));
  };

  return (
    <div id="data-entry-section" className="space-y-8 dir-rtl text-right">
      {/* Page Header with Bold Display Typography */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col text-right">
          <span className="text-slate-400 text-xs font-black uppercase tracking-widest leading-none">مدخلات وحركات شئون الموظفين</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2.5">
            تحديث <span className="text-blue-600">البيانات والحضور</span>
          </h2>
        </div>
      </header>

      {/* Mini Tabs Selector styled as deep dark slate pill bar */}
      <div id="data-entry-tabs" className="flex flex-wrap gap-2 p-2 bg-slate-900 rounded-2xl max-w-fit shadow-lg shadow-slate-950/20">
        <button
          onClick={() => { setActiveSubTab('hire'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`px-4 py-2.5 text-xs font-black rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'hire' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4 shrink-0" />
          <span>تعيين موظف جديد</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('edit'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`px-4 py-2.5 text-xs font-black rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'edit' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clipboard className="w-4 h-4 shrink-0" />
          <span>تعديل بيانات موظف</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('terminate'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`px-4 py-2.5 text-xs font-black rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'terminate' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserMinus className="w-4 h-4 shrink-0" />
          <span>إنهاء عقد موظف</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('vacation'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`px-4 py-2.5 text-xs font-black rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'vacation' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span>طلب إجازة</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('attendance'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`px-4 py-2.5 text-xs font-black rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'attendance' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4 shrink-0" />
          <span>حضور وانصراف اليوم</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('import'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`px-4 py-2.5 text-xs font-black rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'import' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0 text-green-400" />
          <span>استيراد جماعي (إكسل)</span>
        </button>
      </div>

      {/* Status Notifications */}
      {successMsg && (
        <div id="entry-success-alert" className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-bold shadow-xs">
          <CheckSquare className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div id="entry-error-alert" className="p-4 bg-rose-50 border border-rose-150 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-bold shadow-xs">
          <BadgeAlert className="w-4.5 h-4.5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Area 1: Hire Form */}
      {activeSubTab === 'hire' && (
        <form onSubmit={handleHireSubmit} id="hire-form" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-850 flex items-center gap-2">
              <UserPlus className="w-5.5 h-5.5 text-blue-650" />
              قالب التعيينات وإدخال ملف الموظف الجديد
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              أدخل البيانات الأساسية، الوظيفية، والتأمينية المعتمدة لبدء إدراج الموظف في كشوف رواتب وموارد الشركة.
            </p>
          </div>

          {/* Group 1: Personal & Basic Data */}
          <div>
            <h4 className="text-xs font-black text-blue-600 mb-3.5 flex items-center gap-1.5 grayscale-0">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              أولاً: البيانات الشخصية والأساسية
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Employee Code */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">كود الموظف *</label>
                <input
                  type="text"
                  required
                  value={hireCode}
                  onChange={(e) => setHireCode(e.target.value)}
                  placeholder="مثال: 108"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              {/* Employee Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">الاسم بالكامل *</label>
                <input
                  type="text"
                  required
                  value={hireName}
                  onChange={(e) => setHireName(e.target.value)}
                  placeholder="الاسم ثلاثي أو رباعي كما في بطاقة الرقم القومي"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                />
              </div>

              {/* National ID */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">الرقم القومي (14 رقم) *</label>
                <input
                  type="text"
                  required
                  maxLength={14}
                  value={hireNationalId}
                  onChange={(e) => setHireNationalId(e.target.value.replace(/\D/g, ''))}
                  placeholder="29012345678901"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">رقم التليفون / الجوال</label>
                <input
                  type="text"
                  value={hirePhone}
                  onChange={(e) => setHirePhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              {/* Address (العنوان) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">العنوان السكني بالكامل</label>
                <input
                  type="text"
                  value={hireAddress}
                  onChange={(e) => setHireAddress(e.target.value)}
                  placeholder="المحافظة، الحي، الشارع، المعالم البارزة"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                />
              </div>

              {/* Social Status (الحالة الاجتماعية) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">الحالة الاجتماعية</label>
                <select
                  value={hireSocialStatus}
                  onChange={(e) => setHireSocialStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden"
                >
                  <option value="">-- اختر الحالة الاجتماعية --</option>
                  <option value="أعزب">أعزب / آنسة</option>
                  <option value="متزوج">متزوج</option>
                  <option value="متزوج ويعول">متزوج ويعول</option>
                  <option value="مطلق">مطلق / مطلقة</option>
                  <option value="أرمل">أرمل / أرملة</option>
                </select>
              </div>

              {/* Email (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  value={hireEmail}
                  onChange={(e) => setHireEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              {/* altPhone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">رقم تليفون آخر</label>
                <input
                  type="text"
                  value={hireAltPhone}
                  onChange={(e) => setHireAltPhone(e.target.value)}
                  placeholder="مثال: 01112223344"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              {/* nationalIdExpiry */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">تاريخ نهاية البطاقة الشخصية</label>
                <input
                  type="date"
                  value={hireNationalIdExpiry}
                  onChange={(e) => setHireNationalIdExpiry(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              {/* placeOfBirth */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">محل الميلاد</label>
                <input
                  type="text"
                  value={hirePlaceOfBirth}
                  onChange={(e) => setHirePlaceOfBirth(e.target.value)}
                  placeholder="مثال: القاهرة، مصر"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                />
              </div>

              {/* dateOfBirth */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">تاريخ الميلاد</label>
                <input
                  type="date"
                  value={hireDateOfBirth}
                  onChange={(e) => setHireDateOfBirth(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              {/* gender */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">الجنس</label>
                <select
                  value={hireGender}
                  onChange={(e) => setHireGender(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden"
                >
                  <option value="ذكور">ذكر</option>
                  <option value="إناث">أنثى</option>
                </select>
              </div>

              {/* qualification */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">اسم المؤهل الدراسي</label>
                <input
                  type="text"
                  value={hireQualification}
                  onChange={(e) => setHireQualification(e.target.value)}
                  placeholder="مثال: بكالوريوس نظم معلومات"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                />
              </div>

              {/* qualificationIssuer */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">جهة الحصول على المؤهل</label>
                <input
                  type="text"
                  value={hireQualificationIssuer}
                  onChange={(e) => setHireQualificationIssuer(e.target.value)}
                  placeholder="مثال: جامعة عين شمس"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                />
              </div>

              {/* militaryStatus */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">حالة التجنيد</label>
                <select
                  value={hireMilitaryStatus}
                  onChange={(e) => setHireMilitaryStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden"
                >
                  <option value="">-- اختر حالة التجنيد --</option>
                  <option value="أدى الخدمة العسكرية">أدى الخدمة العسكرية</option>
                  <option value="إعفاء نهائي">إعفاء نهائي</option>
                  <option value="إعفاء مؤقت">إعفاء مؤقت</option>
                  <option value="تأجيل مؤقت">تأجيل مؤقت</option>
                  <option value="غير مطلوب للتجنيد">غير مطلوب للتجنيد</option>
                </select>
              </div>

              {/* militaryDefermentExpiry */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">تاريخ نهاية التأجيل</label>
                <input
                  type="date"
                  value={hireMilitaryDefermentExpiry}
                  onChange={(e) => setHireMilitaryDefermentExpiry(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              {/* actualSalary */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">الراتب الفعلي (ج.م)</label>
                <input
                  type="number"
                  value={hireActualSalary}
                  onChange={(e) => setHireActualSalary(e.target.value)}
                  placeholder="الراتب المتفق عليه شاملاً البدلات"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              {/* promotionTitle */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">الترقية الوظيفية</label>
                <input
                  type="text"
                  value={hirePromotionTitle}
                  onChange={(e) => setHirePromotionTitle(e.target.value)}
                  placeholder="مسمى أحدث ترقية إن وجد"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                />
              </div>

              {/* newJobDate */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">تاريخ الوظيفة الجديدة</label>
                <input
                  type="date"
                  value={hireNewJobDate}
                  onChange={(e) => setHireNewJobDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              {/* insuranceStartDate */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">تاريخ بداية التأمين</label>
                <input
                  type="date"
                  value={hireInsuranceStartDate}
                  onChange={(e) => setHireInsuranceStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              {/* contractExpiryDate */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">تاريخ نهاية عقد الموظف</label>
                <input
                  type="date"
                  value={hireContractExpiryDate}
                  onChange={(e) => setHireContractExpiryDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              {/* personalPhoto */}
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-semibold text-slate-700 block">الصورة الشخصية للموظف</label>
                <div className="flex items-center gap-4">
                  {hirePersonalPhoto ? (
                    <img
                      src={hirePersonalPhoto}
                      alt="Personal avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-sky-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 border border-slate-200 font-bold">
                      لا توجد
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setHirePersonalPhoto(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                  />
                  {hirePersonalPhoto && (
                    <button
                      type="button"
                      onClick={() => setHirePersonalPhoto('')}
                      className="text-[10px] text-rose-600 hover:underline"
                    >
                      حذف الصورة
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Group 2: Job & Career Assignment */}
          <div className="border-t border-slate-100 pt-5">
            <h4 className="text-xs font-black text-blue-600 mb-3.5 flex items-center gap-1.5 grayscale-0">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              ثانياً: التسكين الوظيفي وتاريخ مباشرة العمل
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Department */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">الادارة *</label>
                <select
                  required
                  value={hireDeptId}
                  onChange={(e) => {
                    setHireDeptId(e.target.value);
                    setHireSectionId(''); // Clean section selection
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                >
                  <option value="">-- اختر الإدارة التابعة لها --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Job Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">الوظيفة / المسمى الوظيفي *</label>
                <select
                  required
                  value={hireJobId}
                  onChange={(e) => setHireJobId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                >
                  <option value="">-- اختر الوظيفة المعتمدة --</option>
                  {jobTitles.map((j) => (
                    <option key={j.id} value={j.id}>{j.name}</option>
                  ))}
                </select>
              </div>

              {/* Hire Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">تاريخ التعيين / المباشرة *</label>
                <input
                  type="date"
                  required
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              {/* Section Select (Optional but layout integrated) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">القسم الداخلي (إن وجد)</label>
                <select
                  value={hireSectionId}
                  onChange={(e) => setHireSectionId(e.target.value)}
                  disabled={!hireDeptId}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden disabled:opacity-50 font-medium"
                >
                  <option value="">-- حدد القسم التلقائي --</option>
                  {sections
                    .filter((sec) => sec.departmentId === hireDeptId)
                    .map((sec) => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                </select>
              </div>

              {/* Cost Center (Optional but layout integrated) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">مركز التكلفة المحاسبي</label>
                <select
                  value={hireCostCenterId}
                  onChange={(e) => setHireCostCenterId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                >
                  <option value="">-- حدد مركز التكلفة التلقائي --</option>
                  {costCenters.map((cc) => (
                    <option key={cc.id} value={cc.id}>{cc.code} - {cc.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Group 3: Financial & Insurance Info */}
          <div className="border-t border-slate-100 pt-5">
            <h4 className="text-xs font-black text-blue-600 mb-3.5 flex items-center gap-1.5 grayscale-0">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              ثالثاً: الأجور والتأمينات الاجتماعية ورصيد الإجازات
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Insurance Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">الرقم التأميني</label>
                <input
                  type="text"
                  value={hireInsuranceNumber}
                  onChange={(e) => setHireInsuranceNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9 أرقام تأمينية رسمية"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              {/* Insurance Office */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">مكتب التأمينات المختص</label>
                <select
                  value={hireInsuranceOfficeId}
                  onChange={(e) => setHireInsuranceOfficeId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                >
                  <option value="">-- اختر مكتب التأمين المختص --</option>
                  {insuranceOffices.map((off) => (
                    <option key={off.id} value={off.id}>{off.code} - {off.name}</option>
                  ))}
                </select>
              </div>

              {/* Basic Salary */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">الاساسي التاميني (ج.م) *</label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="number"
                    required
                    min={0}
                    value={hireBasicSalary}
                    onChange={(e) => setHireBasicSalary(e.target.value)}
                    placeholder="مثال: 6000"
                    className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Insurance Salary */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">الاجر التاميني الشهري (ج.م) *</label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="number"
                    required
                    min={0}
                    value={hireInsuranceSalary}
                    onChange={(e) => setHireInsuranceSalary(e.target.value)}
                    placeholder="الحصة الخاضعة للاشتراك"
                    className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Vacation Balance */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">رصيد الإجازات السنوية الحالي *</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={45}
                  value={hireVacationBalance}
                  onChange={(e) => setHireVacationBalance(e.target.value)}
                  placeholder="رصيد السنة الأولى (الافتراضي 21)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="bg-sky-650 hover:bg-sky-700 text-white text-xs font-black px-8 py-3 rounded-2xl cursor-pointer shadow-md shadow-sky-900/10 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4.5 h-4.5" />
              <span>حفظ وتعميد تعيين الموظف</span>
            </button>
          </div>
        </form>
      )}

      {/* Area 1.25: Edit Employee Form */}
      {activeSubTab === 'edit' && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xs space-y-8">
          {/* Header */}
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-850 flex items-center gap-2">
              <Clipboard className="w-5.5 h-5.5 text-blue-650" />
              تعديل وتحديث ملفات كشوف الموظفين
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">اختر الموظف النشط أو المستقيل لإعادة هيكلة وتعديل بيانات ملفه والتأمينات والأجور مباشرة.</p>
          </div>

          {/* Search Controls (البحث باسم الموظف وكود الموظف) */}
          <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <Search className="w-5 h-5 text-blue-600" />
              <h4 className="text-xs font-black text-slate-800">أدوات البحث والتحري في سجلات الكوادر البشرية</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search by Code */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">البحث بالرقم الحركي / كود الموظف:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editSearchCode}
                    onChange={(e) => setEditSearchCode(e.target.value)}
                    placeholder="أدخل كود الموظف (مثال: 101)"
                    className="w-full p-2.5 pr-3 pl-8 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono font-bold text-right"
                  />
                  {editSearchCode && (
                    <button
                      type="button"
                      onClick={() => setEditSearchCode('')}
                      className="absolute left-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search by Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">البحث بالاسم الكامل للموظف:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editSearchName}
                    onChange={(e) => setEditSearchName(e.target.value)}
                    placeholder="أدخل الاسم أو جزء منه للفيلتر السريع..."
                    className="w-full p-2.5 pr-3 pl-8 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium text-right"
                  />
                  {editSearchName && (
                    <button
                      type="button"
                      onClick={() => setEditSearchName('')}
                      className="absolute left-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setEditSearchCode('');
                  setEditSearchName('');
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                إستعادة وعرض كل القائمة
              </button>
            </div>
          </div>

          {/* Sequential Table of Employees (جدول متسلسل مع زري التعديل) */}
          <div className="bg-white rounded-[1.5rem] border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
              <span className="text-xs font-black text-slate-800">
                نتائج وجدول الموظفين الحاليين ({
                  employees.filter(emp => {
                    const codeVal = editSearchCode.trim().toLowerCase();
                    const nameVal = editSearchName.trim().toLowerCase();
                    return (codeVal === '' || emp.code.toLowerCase().includes(codeVal)) &&
                           (nameVal === '' || emp.name.toLowerCase().includes(nameVal));
                  }).length
                } موظف متطابق)
              </span>
              {editEmpId && (
                <span className="text-xs text-blue-600 font-black animate-pulse bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                  الموظف المفتوح للتحديث حالياً: {editName} (كود {editCode})
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-500 font-bold border-b border-slate-200 text-center">
                    <th className="p-3 w-16 text-center">المسلسل</th>
                    <th className="p-3 w-28 text-center">كود الموظف</th>
                    <th className="p-3 text-right">الاسم الكامل للموظف</th>
                    <th className="p-3 text-right">القسم / الإدارة</th>
                    <th className="p-3 text-right">المسمى الوظيفي</th>
                    <th className="p-3 text-center">الحالة الحالية</th>
                    <th className="p-3 text-left">التعديل التفصيلي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(() => {
                    const codeVal = editSearchCode.trim().toLowerCase();
                    const nameVal = editSearchName.trim().toLowerCase();
                    const filtered = employees.filter(emp => {
                      const matchesCode = codeVal === '' || emp.code.toLowerCase().includes(codeVal);
                      const matchesName = nameVal === '' || emp.name.toLowerCase().includes(nameVal);
                      return matchesCode && matchesName;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                            لا يوجد أي موظف يطابق معايير البحث والترميز المحددة أعلاه.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((emp, index) => {
                      const isSelected = editEmpId === emp.id;
                      const dept = departments.find(d => d.id === emp.departmentId)?.name || 'غير محدد';
                      const job = jobTitles.find(j => j.id === emp.jobId)?.name || 'غير محدد';

                      return (
                        <tr
                          key={emp.id}
                          className={`transition-colors border-b border-slate-100 ${
                            isSelected ? 'bg-blue-50/70 hover:bg-blue-100/50' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <td className="p-3 text-center font-mono font-bold text-slate-500">{index + 1}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-900 bg-slate-50/60">{emp.code}</td>
                          <td className="p-3 text-right font-extrabold text-slate-800">{emp.name}</td>
                          <td className="p-3 text-right font-semibold text-slate-650">{dept}</td>
                          <td className="p-3 text-right font-medium text-slate-600">{job}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold inline-block border ${
                              emp.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                                : 'bg-slate-50 text-slate-500 border-slate-200/50'
                            }`}>
                              {emp.status === 'active' ? 'مستمر بالخدمة' : 'تم ترحيله/مستقيل'}
                            </span>
                          </td>
                          <td className="p-3 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectEmployeeToEdit(emp.id);
                                setTimeout(() => {
                                  const formEl = document.getElementById('edit-employee-form-fields');
                                  if (formEl) {
                                    formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }, 120);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {isSelected ? 'قيد التحديث' : 'تعديل البيانات'}
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form */}
          {editEmpId ? (
            <form id="edit-employee-form-fields" onSubmit={handleEditSubmit} className="space-y-6 animate-fade-in text-right border-t border-slate-200/80 pt-6" dir="rtl">
              <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-sky-900">أنت الآن تقوم بتعديل البيانات التفصيلية للموظف:</h4>
                  <p className="text-[11px] text-sky-800 font-bold mt-0.5">الاسم: {editName} — الكود: {editCode}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditEmpId('')}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold bg-white border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  إغلاق التعديل والعودة
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Employee Code */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">كود الموظف الحالي *</label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    placeholder="مثال: 108"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                {/* Employee Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">اسم الموظف الكامل *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="أدخل الاسم ثلاثي أو رباعي"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                  />
                </div>

                {/* National ID */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">الرقم القومي (14 رقم) *</label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={editNationalId}
                    onChange={(e) => setEditNationalId(e.target.value)}
                    placeholder="29012345678901"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">رقم الهاتف الجوال</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="employee@company.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                  />
                </div>

                {/* altPhone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">رقم تليفون آخر</label>
                  <input
                    type="text"
                    value={editAltPhone}
                    onChange={(e) => setEditAltPhone(e.target.value)}
                    placeholder="مثال: 01112223344"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                {/* nationalIdExpiry */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">تاريخ نهاية البطاقة الشخصية</label>
                  <input
                    type="date"
                    value={editNationalIdExpiry}
                    onChange={(e) => setEditNationalIdExpiry(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                {/* placeOfBirth */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">محل الميلاد</label>
                  <input
                    type="text"
                    value={editPlaceOfBirth}
                    onChange={(e) => setEditPlaceOfBirth(e.target.value)}
                    placeholder="مثال: القاهرة، مصر"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                  />
                </div>

                {/* dateOfBirth */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={editDateOfBirth}
                    onChange={(e) => setEditDateOfBirth(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                {/* gender */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">الجنس</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                  >
                    <option value="ذكور">ذكر</option>
                    <option value="إناث">أنثى</option>
                  </select>
                </div>

                {/* qualification */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">اسم المؤهل الدراسي</label>
                  <input
                    type="text"
                    value={editQualification}
                    onChange={(e) => setEditQualification(e.target.value)}
                    placeholder="مثال: بكالوريوس تجارة"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                  />
                </div>

                {/* qualificationIssuer */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">جهة الحصول على المؤهل</label>
                  <input
                    type="text"
                    value={editQualificationIssuer}
                    onChange={(e) => setEditQualificationIssuer(e.target.value)}
                    placeholder="مثال: جامعة القاهرة"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                  />
                </div>

                {/* militaryStatus */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">حالة التجنيد</label>
                  <select
                    value={editMilitaryStatus}
                    onChange={(e) => setEditMilitaryStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                  >
                    <option value="">-- اختر حالة التجنيد --</option>
                    <option value="أدى الخدمة العسكرية">أدى الخدمة العسكرية</option>
                    <option value="إعفاء نهائي">إعفاء نهائي</option>
                    <option value="إعفاء مؤقت">إعفاء مؤقت</option>
                    <option value="تأجيل مؤقت">تأجيل مؤقت</option>
                    <option value="غير مطلوب للتجنيد">غير مطلوب للتجنيد</option>
                  </select>
                </div>

                {/* militaryDefermentExpiry */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">تاريخ نهاية التأجيل</label>
                  <input
                    type="date"
                    value={editMilitaryDefermentExpiry}
                    onChange={(e) => setEditMilitaryDefermentExpiry(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                {/* actualSalary */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">الراتب الفعلي (ج.م)</label>
                  <input
                    type="number"
                    value={editActualSalary}
                    onChange={(e) => setEditActualSalary(e.target.value)}
                    placeholder="الراتب الفعلي المتفق عليه"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                {/* promotionTitle */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">الترقية الوظيفية</label>
                  <input
                    type="text"
                    value={editPromotionTitle}
                    onChange={(e) => setEditPromotionTitle(e.target.value)}
                    placeholder="مسمى أحدث ترقية"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                  />
                </div>

                {/* newJobDate */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">تاريخ الوظيفة الجديدة</label>
                  <input
                    type="date"
                    value={editNewJobDate}
                    onChange={(e) => setEditNewJobDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                {/* insuranceStartDate */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">تاريخ بداية التأمين</label>
                  <input
                    type="date"
                    value={editInsuranceStartDate}
                    onChange={(e) => setEditInsuranceStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                {/* contractExpiryDate */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">تاريخ نهاية عقد الموظف</label>
                  <input
                    type="date"
                    value={editContractExpiryDate}
                    onChange={(e) => setEditContractExpiryDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                {/* personalPhoto */}
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-slate-705 block text-right">الصورة الشخصية للموظف</label>
                  <div className="flex items-center gap-4 justify-start">
                    {editPersonalPhoto ? (
                      <img
                        src={editPersonalPhoto}
                        alt="Personal avatar"
                        className="w-12 h-12 rounded-full object-cover border-2 border-sky-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 border border-slate-200 font-bold">
                        لا توجد
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setEditPersonalPhoto(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                    />
                    {editPersonalPhoto && (
                      <button
                        type="button"
                        onClick={() => setEditPersonalPhoto('')}
                        className="text-[10px] text-rose-600 hover:underline"
                      >
                        حذف الصورة
                      </button>
                    )}
                  </div>
                </div>

                {/* Department Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">الإدارة التابع لها *</label>
                  <select
                    required
                    value={editDeptId}
                    onChange={(e) => {
                      setEditDeptId(e.target.value);
                      // Auto reset section if no longer matches
                      setEditSectionId('');
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden"
                  >
                    <option value="">-- اختر الإدارة --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* Section Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">القسم الداخلي *</label>
                  <select
                    required
                    value={editSectionId}
                    onChange={(e) => setEditSectionId(e.target.value)}
                    disabled={!editDeptId}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden disabled:opacity-50"
                  >
                    <option value="">-- اختر القسم --</option>
                    {sections
                      .filter((sec) => sec.departmentId === editDeptId)
                      .map((sec) => (
                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                      ))}
                  </select>
                </div>

                {/* Job Title Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">المسمى الوظيفي المعتمد *</label>
                  <select
                    required
                    value={editJobId}
                    onChange={(e) => setEditJobId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden"
                  >
                    <option value="">-- اختر الوظيفة --</option>
                    {jobTitles.map((job) => (
                      <option key={job.id} value={job.id}>{job.name}</option>
                    ))}
                  </select>
                </div>

                {/* Cost Center Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">مركز التكلفة المحاسبي *</label>
                  <select
                    required
                    value={editCostCenterId}
                    onChange={(e) => setEditCostCenterId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden"
                  >
                    <option value="">-- اختر مركز التكلفة --</option>
                    {costCenters.map((cc) => (
                      <option key={cc.id} value={cc.id}>{cc.code} - {cc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Insurance Number */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">الرقم التأميني للعامل</label>
                  <input
                    type="text"
                    value={editInsuranceNumber}
                    onChange={(e) => setEditInsuranceNumber(e.target.value)}
                    placeholder="9 أرقام تأمينية"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                {/* Insurance Office Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">مكتب التأمينات الاجتماعية المختص</label>
                  <select
                    value={editInsuranceOfficeId}
                    onChange={(e) => setEditInsuranceOfficeId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden"
                  >
                    <option value="">-- اختر مكتب التأمينات --</option>
                    {insuranceOffices.map((office) => (
                      <option key={office.id} value={office.id}>{office.code} - {office.name}</option>
                    ))}
                  </select>
                </div>

                {/* Hire Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">تاريخ مباشرة العمل / التعيين *</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                {/* Basic Salary */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">الراتب الأساسي الشهري (ج.م) *</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="number"
                      required
                      min={0}
                      value={editBasicSalary}
                      onChange={(e) => setEditBasicSalary(e.target.value)}
                      placeholder="8500"
                      className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Insurance Salary */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">الأجر التأميني الشهري (ج.م) *</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="number"
                      required
                      min={0}
                      value={editInsuranceSalary}
                      onChange={(e) => setEditInsuranceSalary(e.target.value)}
                      placeholder="4500"
                      className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Vacation Balance */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">رصيد الإجازات السنوية الحالي (يوم) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editVacationBalance}
                    onChange={(e) => setEditVacationBalance(e.target.value)}
                    placeholder="21"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-mono"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">العنوان السكني بالكامل</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="المحافظة، الحي، الشارع، المعالم البارزة"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                  />
                </div>

                {/* Social Status */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">الحالة الاجتماعية</label>
                  <select
                    value={editSocialStatus}
                    onChange={(e) => setEditSocialStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-hidden font-medium"
                  >
                    <option value="">-- اختر الحالة الاجتماعية --</option>
                    <option value="أعزب">أعزب / آنسة</option>
                    <option value="متزوج">متزوج</option>
                    <option value="متزوج ويعول">متزوج ويعول</option>
                    <option value="مطلق">مطلق / مطلقة</option>
                    <option value="أرمل">أرمل / أرملة</option>
                  </select>
                </div>

                {/* Employee Status */}
                <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-1">
                  <label className="text-xs font-semibold text-slate-705 block text-right">حالة ملف الموظف بالنظام *</label>
                  <div className="flex gap-4 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer flex-1">
                      <input
                        type="radio"
                        name="editStatus"
                        value="active"
                        checked={editStatus === 'active'}
                        onChange={() => setEditStatus('active')}
                        className="w-4 h-4 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <span>مستمر بالعمل (Active)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer flex-1">
                      <input
                        type="radio"
                        name="editStatus"
                        value="terminated"
                        checked={editStatus === 'terminated'}
                        onChange={() => setEditStatus('terminated')}
                        className="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer"
                      />
                      <span>إنهاء الخدمة (Terminated)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleSelectEmployeeToEdit(editEmpId)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إعادة تعيين للتحديث
                </button>
                <button
                  type="button"
                  onClick={() => setEditEmpId('')}
                  className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء وإغلاق التعديل
                </button>
                <button
                  type="submit"
                  className="bg-sky-650 hover:bg-sky-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  حفظ وتعميم التعديلات
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 space-y-2">
              <Clipboard className="w-10 h-10 mx-auto text-slate-350 animate-pulse" />
              <p className="text-xs font-black text-slate-600">لم يتم تحديد أي موظف لتعديل بياناته بعد.</p>
              <p className="text-[10px] text-slate-400">الرجاء الضغط على زر "تعديل البيانات" الخاص بالموظف المطلوب من الجدول المتسلسل أعلاه لتهيئة حقول وملفات التعديل مباشرة.</p>
            </div>
          )}
        </div>
      )}

      {/* Area 2: Terminate Contract Form */}
      {activeSubTab === 'terminate' && (
        <form onSubmit={handleTerminateSubmit} id="terminate-form" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-md font-bold text-slate-800 flex items-center gap-2 text-rose-600">
              <UserMinus className="w-5 h-5 text-rose-500" />
              إنهاء عقد تقديم الخدمة / تسوية الملف التعاقدي للموظف
            </h3>
          </div>

          {activeEmployees.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              لا يوجد حالياً موظفين نشطين على ذمة العمل في قاعدة البيانات لإنهاء خدمتهم.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Employee list */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اختر الموظف النشط *</label>
                <select
                  required
                  value={termEmpId}
                  onChange={(e) => setTermEmpId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-rose-500 outline-hidden"
                >
                  <option value="">-- اختر الموظف لإنهاء خدمته --</option>
                  {activeEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} (كود: {emp.code})</option>
                  ))}
                </select>
              </div>

              {/* Termination Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">تاريخ انتهاء الخدمة الفعلي *</label>
                <input
                  type="date"
                  required
                  value={termDate}
                  onChange={(e) => setTermDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-rose-500 outline-hidden font-mono"
                />
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">سبب إنهاء الخدمة / الاستقالة *</label>
                <select
                  required
                  value={termReasonId}
                  onChange={(e) => setTermReasonId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-rose-500 outline-hidden"
                >
                  <option value="">-- اختر سبب الاستقالة --</option>
                  {resignationReasons.map((res) => (
                    <option key={res.id} value={res.id}>{res.reason}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-150">
            <button
              type="submit"
              disabled={activeEmployees.length === 0}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors disabled:opacity-50"
            >
              اعتماد إنهاء خدمة الموظف
            </button>
          </div>
        </form>
      )}

      {/* Area 3: Vacation Request Form */}
      {activeSubTab === 'vacation' && (
        <form onSubmit={handleVacationSubmit} id="vacation-form" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-md font-bold text-slate-800 flex items-center gap-2 text-violet-600">
              <CalendarDays className="w-5 h-5 text-violet-500" />
              طلب حركة إجازة جديدة بموافقة أو تحت التجربة
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Active employees selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">اختر الموظف مقدم الطلب *</label>
              <select
                required
                value={vacEmpId}
                onChange={(e) => setVacEmpId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 outline-hidden"
              >
                <option value="">-- اختر الموظف --</option>
                {activeEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} (الرصيد المتاح: {emp.vacationBalance} يوماً)
                  </option>
                ))}
              </select>
            </div>

            {/* Vacation Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">نوع الإجازة المطلوبة *</label>
              <select
                required
                value={vacTypeId}
                onChange={(e) => setVacTypeId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 outline-hidden"
              >
                <option value="">-- اختر نوع الإجازة --</option>
                {vacationTypes.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Decision state */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">حالة الاعتماد الأولي *</label>
              <select
                required
                value={vacApproved}
                onChange={(e) => setVacApproved(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 outline-hidden font-medium"
              >
                <option value="pending">قيد الانتظار لمعاينة الرصيد (معلقة)</option>
                <option value="approved">مقبولة فوراً (يخصم من الرصيد مباشرة)</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 font-mono">تاريخ بدء الإجازة *</label>
              <input
                type="date"
                required
                value={vacStartDate}
                onChange={(e) => setVacStartDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 outline-hidden font-mono"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 font-mono">تاريخ انتهاء الإجازة *</label>
              <input
                type="date"
                required
                value={vacEndDate}
                onChange={(e) => setVacEndDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 outline-hidden font-mono"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">شرح / مبررات طلب الإجازة</label>
              <input
                type="text"
                value={vacNotes}
                onChange={(e) => setVacNotes(e.target.value)}
                placeholder="أسباب عائلية، مرافقة مريض، الخ..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-150">
            <button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
            >
              تقديم وتسجيل حركة الإجازة
            </button>
          </div>
        </form>
      )}

      {/* Area 4: Attendance Registry Grid */}
      {activeSubTab === 'attendance' && (
        <form onSubmit={handleAttendanceSubmit} id="attendance-form" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-md font-bold text-slate-800 flex items-center gap-2 text-emerald-600">
              <CheckSquare className="w-5 h-5 text-emerald-500" />
              تسجيل الحضور والانصراف اليومي الجماعي
            </h3>
            
            {/* Choose Date */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">تاريخ يوم الحركة:</span>
              <input
                type="date"
                required
                value={attDate}
                onChange={(e) => handleDateChangeForAttendance(e.target.value)}
                className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden font-mono"
              />
            </div>
          </div>

          {activeEmployees.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              لا يوجد حالياً موظفين نشطين لإثبات حضورهم في قاعدة بيانات النظام.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-150">
                    <th className="p-3">كود</th>
                    <th className="p-3">اسم الموظف</th>
                    <th className="p-3">حالة الحضور</th>
                    <th className="p-3 font-mono">وقت الحضور</th>
                    <th className="p-3 font-mono">وقت الانصراف</th>
                    <th className="p-3">ملاحظات اليوم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeEmployees.map((emp) => {
                    const rowData = attRows[emp.id] || { clockIn: '', clockOut: '', status: 'present', notes: '' };

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-600">{emp.code}</td>
                        <td className="p-3 font-medium text-slate-800">{emp.name}</td>
                        <td className="p-3">
                          <select
                            value={rowData.status}
                            onChange={(e) => handleRowChange(emp.id, 'status', e.target.value)}
                            className={`p-1 rounded text-xs border focus:outline-hidden ${rowData.status === 'present' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : rowData.status === 'late' ? 'bg-amber-50 text-amber-800 border-amber-200' : rowData.status === 'absent' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}
                          >
                            <option value="present">حاضر (في الموعد)</option>
                            <option value="late">متأخر عن الحضور</option>
                            <option value="absent">غائب غير مبرر</option>
                            <option value="excused">إجازة رسمية / بعذر</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={rowData.clockIn}
                            placeholder="09:00"
                            disabled={rowData.status === 'absent' || rowData.status === 'excused'}
                            onChange={(e) => handleRowChange(emp.id, 'clockIn', e.target.value)}
                            className="w-16 p-1 border border-slate-200 rounded text-center disabled:opacity-40 font-mono text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={rowData.clockOut}
                            placeholder="17:00"
                            disabled={rowData.status === 'absent' || rowData.status === 'excused'}
                            onChange={(e) => handleRowChange(emp.id, 'clockOut', e.target.value)}
                            className="w-16 p-1 border border-slate-200 rounded text-center disabled:opacity-40 font-mono text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={rowData.notes}
                            placeholder="تدوين أي حركة استثنائية..."
                            onChange={(e) => handleRowChange(emp.id, 'notes', e.target.value)}
                            className="w-full max-w-[200px] p-1 border border-slate-200 rounded text-xs"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={activeEmployees.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors disabled:opacity-40"
            >
              حفظ كشف سجلات يوم الحضور اليوم
            </button>
          </div>
        </form>
      )}

      {activeSubTab === 'import' && (
        <div id="excel-import-card" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 mt-4 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <span>استيراد جماعي مرن من ملفات الكشوفات (Excel / CSV)</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                يتيح لك النظام تحميل الحركات أو التعيينات دفعة واحدة من ملفات الكشوفات أو بالنسخ واللصق المباشر من الإكسيل.
              </p>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => downloadTemplate('hires')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span>تحميل قالب التعيينات</span>
              </button>
              <button
                type="button"
                onClick={() => downloadTemplate('attendance')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>تحميل قالب الحضور</span>
              </button>
            </div>
          </div>

          {/* Stepper / Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-slate-700 font-black text-xs block">خطوة 1: حدد نوع الكشف المراد استيراده</label>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setImportType('hires'); clearImport(); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center transition-all cursor-pointer ${
                    importType === 'hires' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  تعيينات موظفين جدد (Hires)
                </button>
                <button
                  type="button"
                  onClick={() => { setImportType('attendance'); clearImport(); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center transition-all cursor-pointer ${
                    importType === 'attendance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  سجلات الحضور والانصراف
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 font-black text-xs block">خطوة 2: اختر مسار توفير البيانات</label>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setImportMethod('upload'); clearImport(); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center transition-all cursor-pointer ${
                    importMethod === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  رفع ملف CSV / جدول
                </button>
                <button
                  type="button"
                  onClick={() => { setImportMethod('paste'); clearImport(); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center transition-all cursor-pointer ${
                    importMethod === 'paste' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  اللصق المباشر من خلايا إكسيل
                </button>
              </div>
            </div>
          </div>

          {/* Input Method Segment */}
          {importMethod === 'upload' ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-200 hover:border-blue-500 transition-colors rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer relative bg-slate-50/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv, .txt, .tsv"
                className="hidden"
              />
              <Upload className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-slate-800 font-bold text-sm">قم بسحب وإفلات ملف CSV هنا أو انقر للتصفح والرفع</p>
              <p className="text-slate-400 text-xs mt-1">يدعم الاستيراد بترميز UTF-8 لتفادي مشكلات الأحرف العربية</p>
              
              {importFileName && (
                <div className="mt-4 px-4 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-full">
                  الملف النشط: {importFileName}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-slate-700 font-black text-xs block">الصق الأسطر المنسوخة من إكسيل بالأسفل (شاملاً صف العناوين):</label>
              <textarea
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                rows={6}
                placeholder={
                  importType === 'hires'
                    ? "كود الموظف\tاسم الموظف\tالرقم القومي\tاسم الإدارة\tالراتب الأساسي\n201\tأحمد محمد حسني\t29108150101852\tإدارة الموارد البشرية\t8500"
                    : "كود الموظف\tالتاريخ\tوقت الحضور\tوقت الانصراف\tحالة الحضور\tملاحظات\n101\t2026-06-07\t08:50\t17:15\tحاضر\tحضور مبكر"
                }
                className="w-full p-4 border border-slate-200 rounded-2xl text-xs font-mono bg-slate-50 text-slate-800 focus:outline-hidden focus:border-blue-500 leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => analyseData()}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>معالجة وتحليل خلايا الإكسيل الملتصقة</span>
                </button>
              </div>
            </div>
          )}

          {/* Analysis View Grid */}
          {isAnalysed && (
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>تقرير تحليل ومعاينة كشوف الاستيراد</span>
                  </h4>
                  <p className="text-slate-500 text-xs mt-0.5">
                    الرجاء مراجعة التحذيرات والأخطاء بتركيز قبل إتمام الحفظ النهائي والاعتماد.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg">
                    {parsedRows.length} صف جاهز
                  </span>
                  {importErrors.filter(e => e.type === 'error').length > 0 && (
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{importErrors.filter(e => e.type === 'error').length} خطأ حرج</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Errors container */}
              {importErrors.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/50 space-y-1.5">
                  <span className="font-black text-xs text-amber-800 block">رسائل التحقق والمراجعة المكتشفة بالجدول:</span>
                  <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                    {importErrors.map((err, idx) => (
                      <div key={idx} className={`flex items-start gap-1.5 ${err.type === 'error' ? 'text-rose-600' : 'text-amber-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${err.type === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                        <span>{err.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Preview Table */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-64 overflow-y-auto shadow-xs">
                {importType === 'hires' ? (
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-bold sticky top-0">
                      <tr>
                        <th className="p-3 text-right">رقم الصف</th>
                        <th className="p-3 text-right">كود الموظف</th>
                        <th className="p-3 text-right">الاسم رباعي</th>
                        <th className="p-3 text-right">الإدارة</th>
                        <th className="p-3 text-right">الرقم القومي</th>
                        <th className="p-3 text-right">الهاتف</th>
                        <th className="p-3 text-right">الراتب الأساسي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 animate-fade-in">
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-400 font-mono">#{row._rowNum}</td>
                          <td className="p-3 font-bold text-blue-600 font-mono">{row.code}</td>
                          <td className="p-3 font-black text-slate-900">{row.name}</td>
                          <td className="p-3">{row._deptName}</td>
                          <td className="p-3 font-mono text-slate-500">{row.nationalId || '-'}</td>
                          <td className="p-3 font-mono text-slate-500">{row.phone || '-'}</td>
                          <td className="p-3 font-bold text-slate-900 font-mono">{row.basicSalary} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-bold sticky top-0">
                      <tr>
                        <th className="p-3 text-right">رقم الصف</th>
                        <th className="p-3 text-right">كود الموظف</th>
                        <th className="p-3 text-right">اسم الموظف</th>
                        <th className="p-3 text-right">التاريخ</th>
                        <th className="p-3 text-right">الحالة</th>
                        <th className="p-3 text-right">حضور</th>
                        <th className="p-3 text-right">انصراف</th>
                        <th className="p-3 text-right">الملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 animate-fade-in">
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-400 font-mono">#{row._rowNum}</td>
                          <td className="p-3 font-bold text-blue-600 font-mono">{row.employeeCode}</td>
                          <td className="p-3 font-black text-slate-950">{row.employeeName}</td>
                          <td className="p-3 font-mono">{row.date}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.status === 'present' ? 'bg-emerald-50 text-emerald-700' :
                              row.status === 'absent' ? 'bg-rose-50 text-rose-700' :
                              row.status === 'late' ? 'bg-amber-50 text-amber-700' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {row.status === 'present' ? 'حاضر' :
                               row.status === 'absent' ? 'غائب' :
                               row.status === 'late' ? 'متأخر' : 'عذر مقبول'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-500">{row.clockIn || '-'}</td>
                          <td className="p-3 font-mono text-slate-500">{row.clockOut || '-'}</td>
                          <td className="p-3 text-slate-400 italic max-w-[150px] truncate">{row.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Confirm bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 gap-4">
                <span className="text-slate-600 text-xs font-bold">
                  سيتم استيراد {parsedRows.length - importErrors.filter(e => e.type === 'error').length} صف سليم مع استبعاد أي صف يحتوي على أخطاء حرجة.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearImport}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    تراجع وتفريغ المعاينة
                  </button>
                  <button
                    type="button"
                    onClick={commitImport}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>تأكيد اعتماد وحفظ الكشوفات</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
