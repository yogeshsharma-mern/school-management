import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Loader from "./components/Loading.jsx";



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
const EditTeacher=lazy(()=>import("./pages/EditTeacher.jsx"));
const ResetPassword=lazy(()=>import("./components/ResetPassword.jsx"));
const ResetPasswordId=lazy(()=>import("./pages/ResetPasswordId.jsx"));
const TeacherAttendance=lazy(()=>import("./pages/TeacherAttendance.jsx"));
const TeacherSalary = lazy(()=>import("./pages/TeacherSalary.jsx"));
const TeacherMonthlyAttendance=lazy(()=>import("./pages/TeacherMonthlyAttendance.jsx"));
// const EditFeesForm=lazy(()=>import('./pages/EditFeesForm.jsx'));
const Assign = lazy(()=>import('./pages/Assign.jsx'));

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
        <Toaster />

      <Routes>
        {/* Admin Layout with nested routes */}
        {/* public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Login />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="reset-password/:id" element={<ResetPasswordId />} />


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
            <Route path="teacher/salary" element={<TeacherSalary />} />
            <Route path="teacher-attendance/:id" element={<TeacherMonthlyAttendance />} />


            
            {/* <Route path="teachers/:id" element={<TeacherDetails />} /> */}
            <Route path="teachers/edit/:id" element={<EditTeacher />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="password" element={<ChangePassword />} />
            <Route path="assign" element={<Assign />} />



          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}
