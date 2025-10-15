import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "../components/Card";
import { FaUserGraduate, FaChalkboardTeacher, FaSchool } from "react-icons/fa";
import apiPath from "../api/apiPath";
import { apiGet } from "../api/apiFetch";
import { useQuery } from "@tanstack/react-query";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A855F7", "#F87171"];

export default function Dashboard() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: () => apiGet(apiPath.dashboardData),
  });

  // if (isLoading) return <div className="p-8 text-center">Loading Dashboard...</div>;
  if(isLoading)
  {
    return  <div className=" h-[70vh] inset-0 flex items-center justify-center bg-opacity-70 z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
    </div>
  }
  if (error) return <div className="p-8 text-center text-red-500">Failed to load data</div>;

  const results = dashboardData?.results || {};

  // ✅ Transform dailyTeacherAttendance for recharts
  const dailyAttendanceData =
    results.dailyTeacherAttendance?.xAxis?.map((day, idx) => ({
      day,
      attendance: results.dailyTeacherAttendance.yAxis[idx] || 0,
    })) || [];

  // ✅ Teacher by subject pie chart
  const teacherSubjectData = results.teachersBySubject || [];

  // ✅ Gender Stats for pie
  const genderData = [
    { name: "Male", value: results.genderStats?.male || 0 },
    { name: "Female", value: results.genderStats?.female || 0 },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* --- Top Metrics --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-yellow-100">
          <CardContent className="flex items-center gap-4">
            <FaUserGraduate size={32} className="text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{results.totalNumberOfStudents}</p>
              <p>Total Students</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-100">
          <CardContent className="flex items-center gap-4">
            <FaChalkboardTeacher size={32} className="text-green-600" />
            <div>
              <p className="text-2xl font-bold">{results.totalNumberOfTeachers}</p>
              <p>Total Teachers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-100">
          <CardContent className="flex items-center gap-4">
            <FaSchool size={32} className="text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{results.totalNumberOfClasses}</p>
              <p>Classes Active</p>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="bg-red-100">
          <CardContent className="flex items-center gap-4">
            <FaSchool size={32} className="text-blue-600" />

            <div className="text-red-600 text-2xl font-bold">
              {results.percentageTeachersPresentToday ?? 0}
            </div>
            <div>
              <p>Today Present Teacher </p>
            </div>
          </CardContent>
        </Card> */}
         <Card className="bg-blue-100">
          <CardContent className="flex items-center gap-4">
            <FaSchool size={32} className="text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{results.percentageTeachersPresentToday ??  0}</p>
              <p>Today Present Teachers</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* --- Charts --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 📊 Daily Teacher Attendance Trend */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Daily Teacher Attendance</h2>
          <LineChart width={400} height={250} data={dailyAttendanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="#8884d8"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </Card>

        {/* 🧑‍🏫 Teacher Distribution */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Teacher Distribution by Subject</h2>
          <PieChart width={400} height={250}>
            <Pie
              data={teacherSubjectData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {teacherSubjectData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Card>

        {/* 👥 Gender Ratio */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Gender Ratio</h2>
          <PieChart width={400} height={250}>
            <Pie
              data={genderData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              <Cell fill="#0088FE" />
              <Cell fill="#FF8042" />
            </Pie>
            <Tooltip />
          </PieChart>
        </Card>

        {/* 📊 Teacher Attendance Overview */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Teacher Attendance Overview</h2>
          <BarChart width={400} height={250} data={dailyAttendanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="attendance" fill="#82ca9d" />
          </BarChart>
        </Card>
      </div>
    </div>
  );
}
