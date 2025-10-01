import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./Layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Fees from "./pages/Fees";
import Assignment from "./pages/Assignment";
import Login from "./pages/Login";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Class from "./pages/Class";
import  { Toaster } from 'react-hot-toast';
import Subject from "./pages/Subject";
import StudentDetail from "./pages/StudentDetail";
import CreateStudent from "./pages/CreateStudent";

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
        <Toaster />

      <Routes>
        {/* Admin Layout with nested routes */}
        {/* public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        {/* protectedroute  */}
        <Route element={<ProtectedRoute />}>
        
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="classess" element={<Class />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="Assignments" element={<Assignment />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="student/create" element={<CreateStudent />} />


            <Route path="teachers" element={<Teachers />} />
            <Route path="fees" element={<Fees />} />
            <Route path="subjects" element={<Subject />} />

          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}
