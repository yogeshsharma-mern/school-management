
import React from "react";
import ReactApexChart from "react-apexcharts";
import { FaUserGraduate, FaChalkboardTeacher, FaSchool } from "react-icons/fa";
import { Card, CardContent } from "../components/Card";
import apiPath from "../api/apiPath";
import { apiGet } from "../api/apiFetch";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: () => apiGet(apiPath.dashboardData),
  });

  if (isLoading)
    return (
      <div className=" h-[70vh] inset-0 flex items-center justify-center bg-opacity-70 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );

  if (error)
    return <div className="p-8 text-center text-red-500">Failed to load data</div>;

  const results = dashboardData?.results || {};

  // ✅ Data Prep
  const dailyAttendanceData =
    results.dailyTeacherAttendance?.xAxis?.map((day, idx) => ({
      x: day,
      y: results.dailyTeacherAttendance.yAxis[idx] || 0,
    })) || [];

  const teacherSubjectData =
    results.teachersBySubject?.map((s) => ({
      name: s.name,
      y: s.value,
    })) || [];

const teacherGenderData = [
  { name: "Male", y: results.teacherGenderStats?.male || 0 },
  { name: "Female", y: results.teacherGenderStats?.female || 0 },
  { name: "Other", y: results.teacherGenderStats?.other || 0 },
];

const studentGenderData = [
  { name: "Male", y: results.studentGenderStats?.male || 0 },
  { name: "Female", y: results.studentGenderStats?.female || 0 },
  { name: "Other", y: results.studentGenderStats?.other || 0 },
];


  // 🎨 Chart Configurations
  const lineOptions = {
    chart: { type: "line", toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: "smooth", width: 3 },
    xaxis: { type: "category", labels: { style: { colors: "#6B7280" } } },
    yaxis: { labels: { style: { colors: "#6B7280" } } },
    colors: ["#6366F1"],
    tooltip: { theme: "dark" },
    grid: { borderColor: "#E5E7EB" },
  };

  const pieOptions = {
    chart: { type: "donut" },
    labels: teacherSubjectData.map((d) => d.name),
    colors: ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    legend: { position: "bottom", labels: { colors: "#6B7280" } },
  };

const genderOptions = (labels) => ({
  chart: { type: "pie" },
  labels,
  colors: ["#3B82F6", "#F87171", "#A78BFA"],
  legend: {
    position: "bottom",
    labels: { colors: "#6B7280" },
  },
});


  return (
    <div className="md:p-8 p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">
     
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="md:text-3xl text-2xl font-bold text-gray-800 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-2 sm:mt-0">
            Updated in real-time via API
          </p>
        </div>

        {/* --- Top Stats --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <FaUserGraduate size={30} className="text-indigo-500" />,
              value: results.totalNumberOfStudents,
              label: "Total Students",
              color: "from-indigo-500/10 to-indigo-500/20",
              path: "/admin/students"
            },
            {
              icon: <FaChalkboardTeacher size={30} className="text-green-500" />,
              value: results.totalNumberOfTeachers,
              label: "Total Teachers",
              color: "from-green-500/10 to-green-500/20",
              path: "/admin/teachers"
            },
            {
              icon: <FaSchool size={30} className="text-blue-500" />,
              value: results?.classStatusStats?.active,
              label: "Classes Active",
              color: "from-blue-500/10 to-blue-500/20",
              path: "/admin/classess"
            },
            {
              icon: <FaChalkboardTeacher size={30} className="text-yellow-500" />,
              value: results.teachersPresentToday ?? 0,
              label: "Teachers Present ",
              color: "from-yellow-500/10 to-yellow-500/20",
              path: "/admin/teacher/attendance/clockwise"
            },
          ].map((item, i) => (
            <Link to={item.path}>
              <Card
                key={i}
                className={`bg-gradient-to-br ${item.color} backdrop-blur-md border border-white/30 shadow-md hover:shadow-xl transition-all duration-300`}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="p-3 bg-white/70 rounded-xl shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                    <p className="text-gray-600">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* --- Charts --- */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  
  {/* 🍩 Teacher by Subject */}
  <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-2xl">
    <h2 className="text-lg font-semibold mb-4 text-gray-800">
      📊 Teacher Distribution by Subject
    </h2>
    <ReactApexChart
      options={pieOptions}
      series={teacherSubjectData.map((d) => d.y)}
      type="donut"
      height={280}
    />
  </Card>

  {/* 👩‍🏫 Teachers Gender Ratio */}
  <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-2xl">
    <h2 className="text-lg font-semibold mb-4 text-gray-800">
      ⚧ Teachers Gender Ratio
    </h2>
    <ReactApexChart
      options={genderOptions(teacherGenderData.map(d => d.name))}
      series={teacherGenderData.map(d => d.y)}
      type="pie"
      height={280}
    />
  </Card>

  {/* 🎓 Students Gender Ratio (NEW) */}
  <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-2xl">
    <h2 className="text-lg font-semibold mb-4 text-gray-800">
      🎓 Students Gender Ratio
    </h2>
    <ReactApexChart
      options={genderOptions(studentGenderData.map(d => d.name))}
      series={studentGenderData.map(d => d.y)}
      type="pie"
      height={280}
    />
  </Card>

</div>

            {/* 📈 Daily Attendance */}
          <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-2xl hover:shadow-md transition-all">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              📅 Daily Teacher Attendance
            </h2>
            <ReactApexChart
              options={lineOptions}
              series={[{ name: "Attendance", data: dailyAttendanceData }]}
              type="line"
              height={280}
            />
          </Card>
      </div>
    </div>
  );
}
