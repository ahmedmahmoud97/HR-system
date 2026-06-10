/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Employee {
  id: string;
  code: string; // كود الموظف
  name: string; // اسم الموظف
  nationalId: string; // الرقم القومي
  phone: string; // رقم التليفون
  email: string; // البريد الإلكتروني
  departmentId: string; // الإدارة
  sectionId: string; // القسم
  jobId: string; // الوظيفة
  costCenterId: string; // مركز التكلفة
  hireDate: string; // تاريخ التعيين
  status: 'active' | 'terminated'; // حالة الموظف
  terminationDate?: string; // تاريخ إنهاء العقد
  terminationReasonId?: string; // سبب الاستقالة/الإنهاء
  insuranceNumber?: string; // الرقم التأميني
  insuranceOfficeId?: string; // مكتب التأمينات
  basicSalary: number; // الراتب الأساسي (الأساسي التأميني)
  insuranceSalary: number; // الأجر التأميني
  vacationBalance: number; // رصيد الإجازات الحالي
  initialVacationBalance: number; // رصيد الإجازات الأصلي
  dateOfBirth?: string; // تاريخ الميلاد
  contractExpiryDate?: string; // تاريخ انتهاء العقد
  militaryDefermentExpiryDate?: string; // تاريخ انتهاء تأجيل التجنيد
  address?: string; // العنوان
  socialStatus?: string; // الحالة الاجتماعية (أعزب، متزوج، متزوج ويعول، مطلق، أرمل)
  
  // New customized profile fields requested:
  altPhone?: string; // رقم تليفون آخر
  nationalIdExpiry?: string; // تاريخ نهاية البطاقة الشخصية
  insuranceStartDate?: string; // تاريخ بداية التأمين
  placeOfBirth?: string; // محل الميلاد
  actualSalary?: number; // الراتب الفعلي
  qualification?: string; // اسم المؤهل الدراسي
  qualificationIssuer?: string; // جهة الحصول على المؤهل
  militaryStatus?: string; // حالة التجنيد
  promotionTitle?: string; // الترقية الوظيفية
  newJobDate?: string; // تاريخ الوظيفة الجديدة
  personalPhoto?: string; // صورة شخصية
  gender?: string; // الجنس (ذكر / أنثى)
}

export interface Department {
  id: string;
  name: string;
}

export interface Section {
  id: string;
  name: string;
  departmentId: string;
}

export interface JobTitle {
  id: string;
  name: string;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
}

export interface InsuranceConfig {
  id: string;
  employeeRatio: number; // نسبة مساهمة الموظف %
  companyRatio: number; // نسبة مساهمة الشركة %
  maxLimit: number; // الحد الأقصى للأجر التأميني
  minLimit: number; // الحد الأدنى للأجر التأميني
}

export interface InsuranceOffice {
  id: string;
  code: string;
  name: string;
}

export interface ResignationReason {
  id: string;
  reason: string;
}

export interface VacationType {
  id: string;
  name: string;
  daysAllowed: number;
}

export interface VacationRequest {
  id: string;
  employeeId: string;
  vacationTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  requestDate: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string; // وقت الحضور HH:MM
  clockOut: string; // وقت الانصراف HH:MM
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface SystemMonth {
  year: number;
  month: number; // 1-12
}

export interface UserPermission {
  id: string;
  userCode: string;
  userName: string;
  role: 'admin' | 'manager' | 'entry' | 'reports';
  permissions: {
    dataEntry: boolean;
    reports: boolean;
    controlPanel: boolean;
    settings: boolean;
  };
}

export interface SystemAlert {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'warning' | 'info' | 'success';
}
