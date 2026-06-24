import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Login from '@/pages/auth/Login'

import AdminDashboard from '@/pages/admin/Dashboard'
import AdminStudents from '@/pages/admin/Students'
import AdminStaff from '@/pages/admin/Staff'
import AdminAcademics from '@/pages/admin/Academics'
import AdminFinance from '@/pages/admin/Finance'
import AdminCRM from '@/pages/admin/CRM'
import AdminReports from '@/pages/admin/Reports'
import AdminSettings from '@/pages/admin/Settings'

import TeacherDashboard from '@/pages/teacher/Dashboard'
import TeacherClasses from '@/pages/teacher/MyClasses'
import TeacherAttendance from '@/pages/teacher/Attendance'
import TeacherGrades from '@/pages/teacher/Grades'
import TeacherAssignments from '@/pages/teacher/Assignments'
import TeacherMaterials from '@/pages/teacher/Materials'

import StudentDashboard from '@/pages/student/Dashboard'
import StudentCourses from '@/pages/student/MyCourses'
import StudentGrades from '@/pages/student/Grades'
import StudentSchedule from '@/pages/student/Schedule'
import StudentAssignments from '@/pages/student/Assignments'

import ParentDashboard from '@/pages/parent/Dashboard'
import ParentChildren from '@/pages/parent/MyChildren'
import ParentAttendance from '@/pages/parent/Attendance'
import ParentGrades from '@/pages/parent/Grades'
import ParentPayments from '@/pages/parent/Payments'

import HRDashboard from '@/pages/hr/Dashboard'
import HRStaffList from '@/pages/hr/StaffList'
import HRLeaves from '@/pages/hr/Leaves'
import HRPayroll from '@/pages/hr/Payroll'
import HRInventory from '@/pages/hr/Inventory'

const P = (roles, element) => (
  <ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>
)

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <Login /> },

  // ── Admin ──
  { path: '/admin/dashboard', element: P(['admin'], <AdminDashboard />) },
  { path: '/admin/students',  element: P(['admin'], <AdminStudents />) },
  { path: '/admin/staff',     element: P(['admin'], <AdminStaff />) },
  { path: '/admin/academics', element: P(['admin'], <AdminAcademics />) },
  { path: '/admin/finance',   element: P(['admin'], <AdminFinance />) },
  { path: '/admin/crm',       element: P(['admin'], <AdminCRM />) },
  { path: '/admin/reports',   element: P(['admin'], <AdminReports />) },
  { path: '/admin/settings',  element: P(['admin'], <AdminSettings />) },

  // ── Teacher ──
  { path: '/teacher/dashboard',   element: P(['teacher'], <TeacherDashboard />) },
  { path: '/teacher/classes',     element: P(['teacher'], <TeacherClasses />) },
  { path: '/teacher/attendance',  element: P(['teacher'], <TeacherAttendance />) },
  { path: '/teacher/grades',      element: P(['teacher'], <TeacherGrades />) },
  { path: '/teacher/assignments', element: P(['teacher'], <TeacherAssignments />) },
  { path: '/teacher/materials',   element: P(['teacher'], <TeacherMaterials />) },

  // ── Student ──
  { path: '/student/dashboard',   element: P(['student'], <StudentDashboard />) },
  { path: '/student/courses',     element: P(['student'], <StudentCourses />) },
  { path: '/student/grades',      element: P(['student'], <StudentGrades />) },
  { path: '/student/schedule',    element: P(['student'], <StudentSchedule />) },
  { path: '/student/assignments', element: P(['student'], <StudentAssignments />) },

  // ── Parent ──
  { path: '/parent/dashboard',  element: P(['parent'], <ParentDashboard />) },
  { path: '/parent/children',   element: P(['parent'], <ParentChildren />) },
  { path: '/parent/attendance', element: P(['parent'], <ParentAttendance />) },
  { path: '/parent/grades',     element: P(['parent'], <ParentGrades />) },
  { path: '/parent/payments',   element: P(['parent'], <ParentPayments />) },

  // ── HR / Accountant ──
  { path: '/hr/dashboard', element: P(['hr', 'accountant'], <HRDashboard />) },
  { path: '/hr/staff',     element: P(['hr', 'accountant'], <HRStaffList />) },
  { path: '/hr/leaves',    element: P(['hr', 'accountant'], <HRLeaves />) },
  { path: '/hr/payroll',   element: P(['hr', 'accountant'], <HRPayroll />) },
  { path: '/hr/inventory', element: P(['hr', 'accountant'], <HRInventory />) },

  { path: '*', element: <Navigate to="/login" replace /> },
])
