import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Loader from "./components/Loading.jsx";
import NotFound from "./pages/NotFound.jsx";
import SalaryDetail from "./pages/SalaryDetail.jsx";

import ScrollToTop from "./ScrollToTop";



// Lazy load pages
const AdminLayout = lazy(() => import("./Layouts/AdminLayout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Students = lazy(() => import("./pages/Students"));
const Teachers = lazy(() => import("./pages/Teachers"));
const Fees = lazy(() => import("./pages/Fees"));
const Assignment = lazy(() => import("./pages/Assignment"));
const Login = lazy(() => import("./pages/Login"));
const Class = lazy(() => import("./pages/Class"));
const Subject = lazy(() => import("./pages/Subject"));
const StudentDetail = lazy(() => import("./pages/StudentDetail"));
const CreateStudent = lazy(() => import("./pages/CreateStudent"));
const EditStudent = lazy(() => import("./pages/EditStudent"));
const AdminProfile = lazy(() => import("./pages/AdminProfile"));
const CreateTeacher = lazy(() => import("./pages/CreateTeacher"));
const TeacherDetails = lazy(() => import("./pages/TeacherDetails.jsx"));
const AdminSettings = lazy(() => import("./components/AdminSettings.jsx"));
const ChangePassword = lazy(() => import("./components/ChangePasswoord.jsx"));
const EditTeacher = lazy(() => import("./pages/EditTeacher.jsx"));
const ResetPassword = lazy(() => import("./components/ResetPassword.jsx"));
const ResetPasswordId = lazy(() => import("./pages/ResetPasswordId.jsx"));
const TeacherAttendance = lazy(() => import("./pages/TeacherAttendance.jsx"));
const TeacherSalary = lazy(() => import("./pages/TeacherSalary.jsx"));
const TeacherMonthlyAttendance = lazy(() => import("./pages/TeacherMonthlyAttendance.jsx"));
const ClockwiseAttendanceUi = lazy(() => import("./pages/ClockwiseAttendanceUi.jsx"));
const IpSetting = lazy(() => import("./pages/IpSetting.jsx"));
const NoFound = lazy(() => import("./pages/NotFound.jsx"));
const salaryDetail = lazy(() => import("./pages/SalaryDetail.jsx"));
const EventCalendar = lazy(() => import("./pages/EventCalendar.jsx"));
const InquiryManagement = lazy(() => import("./pages/InquiryManagement.jsx"));
// const EditFeesForm=lazy(()=>import('./pages/EditFeesForm.jsx'));
const Assign = lazy(() => import('./pages/Assign.jsx'));
const GallerySetting = lazy(() => import('./pages/GallerySetting.jsx'));
const LeaderShip = lazy(() => import('./pages/LeaderShip.jsx'));
const AboutUs = lazy(() => import('./pages/AboutUs.jsx'));
const TransactionDetails = lazy(() => import('./pages/TransactionDetails.jsx'));

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <ScrollToTop /> {/* Auto-scroll on route change */}

      <Routes>
        {/* Admin Layout with nested routes */}
        {/* public routes */}

        <Route element={<PublicRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="reset-password/:id" element={<ResetPasswordId />} />
          <Route path="*" element={<NotFound />} />



        </Route>
        {/* protectedroute  */}
        <Route element={<ProtectedRoute />}>

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="classess" element={<Class />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="Assignments" element={<Assignment />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="students/edit/:id" element={<EditStudent />} />
            {/* <Route path="students/edit/fees/:id" element={<EditFeesForm />} /> */}

            <Route path="profile" element={<AdminProfile />} />
            <Route path="students/create" element={<CreateStudent />} />


            <Route path="teachers" element={<Teachers />} />
            <Route path="teachers/create" element={<CreateTeacher />} />

            <Route path="fees" element={<Fees />} />
            <Route path="subjects" element={<Subject />} />
            <Route path="teachers/:id" element={<TeacherDetails />} />
            {/* admin/teachers/attendance */}
            <Route path="teacher/attendance" element={<TeacherAttendance />} />
            <Route path="teacher/attendance/clockwise" element={<ClockwiseAttendanceUi />} />

            <Route path="teacher/salary" element={<TeacherSalary />} />
            <Route path="event-calendar" element={<EventCalendar />} />
            <Route path="event-calendar" element={<EventCalendar />} />
            <Route path="inquiry-management" element={<InquiryManagement />} />
            <Route path="wallet/transaction" element={<TransactionDetails />} />
            <Route path="teacher/salary/salaryinfo/:id" element={<SalaryDetail />} />


            <Route path="teacher-attendance/:id" element={<TeacherMonthlyAttendance />} />




            {/* <Route path="teachers/:id" element={<TeacherDetails />} /> */}
            <Route path="teachers/edit/:id" element={<EditTeacher />} />
            <Route path="settings" element={<AdminSettings />} />
            {/* /admin/setting/gallery */}
            <Route path="/admin/setting/gallery" element={<GallerySetting />} />
            <Route path="/admin/school/leadership" element={<LeaderShip />} />
            <Route path="/admin/school/setting/about-us" element={<AboutUs />} />



            <Route path="school/ip-setting" element={<IpSetting />} />
            <Route path="password" element={<ChangePassword />} />
            <Route path="assign" element={<Assign />} />



          </Route>
          <Route path="/admin/*" element={<NotFound />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}
