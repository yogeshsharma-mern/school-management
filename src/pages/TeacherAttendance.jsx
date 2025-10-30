import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReusableTable from "../components/Table";
import { apiGet, apiPost } from "../api/apiFetch";
import apiPath from "../api/apiPath";
import useDebounce from "../hooks/useDebounce";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function TeacherAttendancePage() {
    const queryClient = useQueryClient();

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [columnFilters, setColumnFilters] = useState([]);
    const navigate = useNavigate();


    const debouncedSearch = useDebounce(globalFilter, 500);


const {data:teachersData,isLoading,isFetching,error}= useQuery({
    queryKey:["teachers",pagination.pageIndex,pagination.pageSize,debouncedSearch],
    queryFn:()=>
        apiGet(apiPath.getTeachers,{
            page:pagination.pageIndex+1,
            limit:pagination.pageIndex,
            name:debouncedSearch,
        }),
})
  const { data: dashboardData, isLoading:loading, error:err } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: () => apiGet(apiPath.dashboardData),
  });
  console.log("dashboarddata",dashboardData);

const attendanceMutation = useMutation({
  mutationFn: async ({ teacherId, status }) => {
    return apiPost(apiPath.teacherAttendance, { teacherId, status });
  },
  onSuccess: (data) => {
    toast.success(data.message || "Attendance marked successfully ✅");
    // ✅ Refetch teachers to get updated todayAttendance
    queryClient.invalidateQueries(["teachers"]);
  },
  onError: (err) => {
    toast.error(err?.response?.data?.message || "Failed to mark attendance ❌");
  },
});



    // 🧮 Calculate stats
    const teachers = teachersData?.results?.docs || [];
    const totalTeachers = teachers.length;
    const presentCount = teachers.filter((t) => t.attendance?.includes("present")).length;
    const absentCount = teachers.filter((t) => t.attendance?.includes("absent")).length;
    const attendanceRate =
        totalTeachers > 0 ? Math.round((dashboardData?.results?.teachersPresentToday / totalTeachers) * 100) : 0;

    // 🧱 Define table columns
    const columns = useMemo(
        () => [
            {
                header: "#",
                cell: ({ row }) => row.index + 1,
            },
            {
                accessorKey: "name",
                header: "Teacher Name",
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <img
                            src={row.original.profilePic?.fileUrl || "/default-profile.png"}
                            alt={row.original.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100"
                        />
                        <div>
                            <p className="font-semibold text-gray-800">{row.original.name}</p>
                            <p className="text-sm text-gray-500">{row.original.email}</p>
                        </div>
                    </div>
                ),
            },
            {
                header: "Subjects",
                cell: ({ row }) => {
                    const subjects = row.original.subjectsHandled || [];
                    return subjects.length ? (
                        <div className="flex flex-wrap gap-2">
                            {subjects.map((s, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-md font-medium"
                                >
                                    {s.subjectCode || s.subjectName || "N/A"}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-gray-400">—</span>
                    );
                },
            },
            {
                header: "Department",
                cell: ({ row }) =>
                    row.original.specialization?.join(", ") || "—",
            },
            {
                header: "Status",
                cell: ({ row }) => {
                    const status = row.original?.todayAttendance?.status || "Not Marked";
                    return (
                        <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${status === "present"
                                    ? "bg-green-100 text-green-700"
                                    : status === "absent"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-500"
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    );
                },
            },
{
  accessorKey: "actions",
  header: "Actions",
  cell: ({ row }) => {
    const teacherId = row.original._id;
    const todayStatus = row.original.todayAttendance?.status || "not_marked";
    const isMarked = todayStatus !== "not_marked";
    const statusLabel =
      todayStatus === "not_marked"
        ? "Not Marked"
        : todayStatus.charAt(0).toUpperCase() + todayStatus.slice(1);

    return (
      <div className="flex items-center gap-2 w-full">
        {/* ✅ Present Button */}
        <button
          className={`flex cursor-pointer items-center gap-1 px-3 py-1 text-sm rounded-lg transition-all ${
            todayStatus === "Present"
              ? "bg-green-100 text-green-700 cursor-not-allowed"
              : "bg-green-50 text-green-600 hover:bg-green-100"
          }`}
          onClick={() =>
            attendanceMutation.mutate({
              teacherId,
              status: "Present",
            })
          }
          disabled={attendanceMutation.isLoading || isMarked}
        >
          <CheckCircle size={16} />
          Present
        </button>

        {/* ❌ Absent Button */}
        <button
          className={`flex items-center cursor-pointer gap-1 px-3 py-1 text-sm rounded-lg transition-all ${
            todayStatus === "Absent"
              ? "bg-red-100 text-red-700 cursor-not-allowed"
              : "bg-red-50 text-red-600 hover:bg-red-100"
          }`}
          onClick={() =>
            attendanceMutation.mutate({
              teacherId,
              status: "Absent",
            })
          }
          disabled={attendanceMutation.isLoading || isMarked}
        >
          <XCircle size={16} />
          Absent
        </button>

        {/* 👁 View Attendance */}
        <button
          className="flex items-center cursor-pointer gap-1 px-3 py-1 text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
          onClick={() => navigate(`/admin/teacher-attendance/${teacherId}`)}
        >
          <CalendarDays size={16} />
          View
        </button>
      </div>
    );
  },
}
        ],
        [attendanceMutation]
    );

    const totalPages = teachersData?.results?.pagination?.totalPages || 1;

    // 🗓️ Calendar-like date display
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString("default", { month: "short" });
    const year = today.getFullYear();

    const weekday = today.toLocaleString("default", { weekday: "long" });

    return (
        <div className="md:p-6 p-2 space-y-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <motion.div
                className=" p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div>
                    <h1 className="text-3xl font-bold">Teacher Attendance Dashboard</h1>
                    <p className="text-yellow-500 mt-1">
                        Manage and track teacher attendance efficiently.
                    </p>
                </div>

                {/* Modern Calendar Date Display */}
                <div className="mt-4 md:mt-0 flex items-center gap-3 bg-white/30 px-4 py-3 rounded-xl shadow-inner backdrop-blur-md">
                    <CalendarDays className="" size={28} />
                    <div className="text-right">
                        <p className="text-sm text-yellow-500">{weekday}</p>
                        <p className="text-lg font-semibold">
                            {day} <span className="text-yellow-500">{month}</span>   <span className="text-yellow-500">{year}</span>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-indigo-500"
                >
                    <p className="text-sm text-gray-500">Total Teachers</p>
                    <h2 className="text-2xl font-bold text-indigo-600">{totalTeachers}</h2>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-green-500"
                >
                    <p className="text-sm text-gray-500">Present</p>
                    <h2 className="text-2xl font-bold text-green-600">{dashboardData?.results?.teachersPresentToday}</h2>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-red-500"
                >
                    <p className="text-sm text-gray-500">Absent</p>
                    <h2 className="text-2xl font-bold text-red-600">{totalTeachers-(dashboardData?.results?.teachersPresentToday)}</h2>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-purple-500"
                >
                    <p className="text-sm text-gray-500">Attendance Rate</p>
                    <h2 className="text-2xl font-bold text-purple-600">{attendanceRate}%</h2>
                </motion.div>
            </div>

            {/* Table Section */}
            <motion.div
                className="bg-white rounded-2xl shadow-md md:p-6 p-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Attendance Details
                </h2>

                <div className="overflow-x-auto  w-[90vw] md:w-[75vw]">
                    <ReusableTable
                        columns={columns}
                        data={teachers}
                        paginationState={pagination}
                        setPaginationState={setPagination}
                        sortingState={sorting}
                        setSortingState={setSorting}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        columnFilters={columnFilters}
                        setColumnFilters={setColumnFilters}
                        totalCount={totalPages}
                        tablePlaceholder="Search teachers..."
                        fetching={isFetching}
                        loading={isLoading}
                        error={error}
                        isError={error}
                    />
                </div>

            </motion.div>
        </div>

    );
}
