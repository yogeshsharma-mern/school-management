import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { Card, CardContent } from "../components/Card"; // assuming shadcn ui
import { FaUserGraduate, FaChalkboardTeacher, FaSchool } from "react-icons/fa";
import apiPath from "../api/apiPath";
import { apiGet, apiPut } from "../api/apiFetch";
import { useQuery } from "@tanstack/react-query";


const studentData = [
  { month: "Jan", students: 40 },
  { month: "Feb", students: 55 },
  { month: "Mar", students: 70 },
  { month: "Apr", students: 65 },
  { month: "May", students: 80 },
];

const teacherData = [
  { name: "Math", value: 10 },
  { name: "Science", value: 8 },
  { name: "English", value: 12 },
  { name: "Arts", value: 5 },
];

const attendanceData = [
  { class: "1A", attendance: 90 },
  { class: "1B", attendance: 85 },
  { class: "2A", attendance: 95 },
  { class: "2B", attendance: 88 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Dashboard() {
    const { data: dashboardData, isLoading, isFetching, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: () =>
      apiGet(apiPath.dashboardData),
  });
  console.log("dashboardData",dashboardData);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* --- Top Metrics --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-yellow-100">
          <CardContent className="flex items-center gap-4">
            <FaUserGraduate size={32} className="text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{dashboardData?.results?.totalNumberOfStudents}</p>
              <p>Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-100">
          <CardContent className="flex items-center gap-4">
            <FaChalkboardTeacher size={32} className="text-green-600" />
            <div>
              <p className="text-2xl font-bold">{dashboardData?.results?.totalNumberOfTeachers}</p>
              <p>Total Teachers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-100">
          <CardContent className="flex items-center gap-4">
            <FaSchool size={32} className="text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{dashboardData?.results?.totalNumberOfClasses}</p>
              <p>Classes Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-100">
          <CardContent className="flex items-center gap-4">
            <p className="text-2xl font-bold text-red-600">95%</p>
            <div>
              <p>Average Attendance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Graphs Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Enrollment Trend */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Student Enrollment Trend</h2>
          <LineChart width={400} height={250} data={studentData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="students" stroke="#8884d8" strokeWidth={3} />
          </LineChart>
        </Card>

        {/* Teacher Distribution */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Teacher Distribution</h2>
          <PieChart width={400} height={250}>
            <Pie
              data={teacherData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {teacherData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Card>

        {/* Attendance Overview */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Attendance Overview</h2>
          <BarChart width={400} height={250} data={attendanceData}>
            <XAxis dataKey="class" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="attendance" fill="#82ca9d" />
          </BarChart>
        </Card>

        {/* Gender Ratio */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Gender Ratio</h2>
          <PieChart width={400} height={250}>
            <Pie
              data={[
                { name: "Male", value: 180 },
                { name: "Female", value: 140 },
              ]}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              <Cell fill="#0088FE" />
              <Cell fill="#FF8042" />
            </Pie>
            <Tooltip />
          </PieChart>
        </Card>
      </div>

      {/* --- Recent Activity Table --- */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recently Registered Students</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Class</th>
                <th className="p-2 border">Enrollment Date</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-2 border">Alice</td><td className="p-2 border">1A</td><td className="p-2 border">01/10/2025</td></tr>
              <tr><td className="p-2 border">Bob</td><td className="p-2 border">2B</td><td className="p-2 border">03/10/2025</td></tr>
            </tbody>
          </table>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recently Added Teachers</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Subject</th>
                <th className="p-2 border">Joined On</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-2 border">Mr. Smith</td><td className="p-2 border">Math</td><td className="p-2 border">01/09/2025</td></tr>
              <tr><td className="p-2 border">Mrs. Johnson</td><td className="p-2 border">Science</td><td className="p-2 border">10/09/2025</td></tr>
            </tbody>
          </table>
        </Card>
      </div> */}
    </div>
  );
}
