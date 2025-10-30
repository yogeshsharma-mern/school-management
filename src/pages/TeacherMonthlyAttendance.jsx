// import React, { useMemo, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { apiGet } from "../api/apiFetch";
// import { ArrowLeft, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
// import { motion } from "framer-motion";
// import dayjs from "dayjs";

// export default function TeacherMonthlyAttendance() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   // 🗓️ Current month state
//   const [selectedMonth, setSelectedMonth] = useState(dayjs().month()); // 0–11

//   const handlePrevMonth = () => {
//     setSelectedMonth((prev) => (prev > 0 ? prev - 1 : 11));
//   };

//   const handleNextMonth = () => {
//     setSelectedMonth((prev) => (prev < 11 ? prev + 1 : 0));
//   };

//   // ✅ Fetch attendance with selected month as query param
//   const { data, isLoading, error } = useQuery({
//     queryKey: ["teacherAttendance", id, selectedMonth],
//     queryFn: () => apiGet(`/admins/teachers/get-attendance/${id}?month=${selectedMonth + 1}`),
//   });

//   const attendanceData = data?.results?.docs || [];
//   const teacherName = attendanceData[0]?.teacherName || "Teacher";

//   // 🗓️ Month boundaries
//   const currentYear = dayjs().year();
//   const startOfMonth = dayjs().year(currentYear).month(selectedMonth).startOf("month");
//   const endOfMonth = dayjs().year(currentYear).month(selectedMonth).endOf("month");
//   const daysInMonth = endOfMonth.date();

//   // 🔍 Map attendance by date
//   const attendanceMap = useMemo(() => {
//     const map = {};
//     attendanceData.forEach((item) => {
//       const dateKey = dayjs(item.date).format("YYYY-MM-DD");
//       map[dateKey] = item.status;
//     });
//     return map;
//   }, [attendanceData]);

//   const days = Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, "day"));

//   // 🧭 Loading / Error states
//   if (isLoading)
//     return      <div className="flex justify-center items-center min-h-[80vh] bg-opacity-70 z-50">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
//     </div>
//   if (error)
//     return <p className="text-center text-red-500 mt-10">Failed to load attendance</p>;

//   return (
//     <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* Header */}
//       <div className="flex flex-wrap items-center justify-between mb-8">
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition"
//         >
//           <ArrowLeft size={20} /> <span className="font-medium">Back</span>
//         </button>

//         <div className="flex flex-col mt-10 md:flex-row md:items-center gap-4">
//           <h1 className="text-2xl font-bold text-gray-800">
//             {teacherName}'s Attendance
//           </h1>

//           {/* Month Filter */}
//           <div className="flex items-center gap-2 bg-white shadow-sm border border-gray-300 rounded-xl px-4 py-2">
//             <button
//               onClick={handlePrevMonth}
//               className="p-1 hover:bg-gray-100 rounded-full transition"
//             >
//               <ChevronLeft size={18} />
//             </button>

//             <div className="flex items-center gap-2">
//               <Calendar className="text-indigo-500" size={18} />
//               <select
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(Number(e.target.value))}
//                 className="bg-transparent outline-none text-sm font-medium text-gray-700"
//               >
//                 {Array.from({ length: 12 }, (_, i) => (
//                   <option key={i} value={i}>
//                     {dayjs().month(i).format("MMMM YYYY")}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <button
//               onClick={handleNextMonth}
//               className="p-1 hover:bg-gray-100 rounded-full transition"
//             >
//               <ChevronRight size={18} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Calendar Grid */}
//       <motion.div
//         className="grid grid-cols-7 gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//       >
//         {/* Weekday Headers */}
//         {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
//           <div
//             key={d}
//             className="text-center text-sm font-semibold text-gray-600 uppercase tracking-wide"
//           >
//             {d}
//           </div>
//         ))}

//         {/* Days */}
//         {days.map((day) => {
//           const dateKey = day.format("YYYY-MM-DD");
//           const status = attendanceMap[dateKey] || "Not Marked";

//           const statusClass =
//             status === "Present"
//               ? "bg-green-50 text-green-700 border-green-300"
//               : status === "Absent"
//               ? "bg-red-50 text-red-700 border-red-300"
//               : "bg-gray-50 text-gray-500 border-gray-200";

//           return (
//             <motion.div
//               key={dateKey}
//               whileHover={{ scale: 1.05 }}
//               className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${statusClass}`}
//             >
//               <p className="text-lg font-semibold">{day.date()}</p>
//               <p className="text-xs mt-1">{status}</p>
//             </motion.div>
//           );
//         })}
//       </motion.div>

//       {/* Footer Summary */}
//       <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-600">
//         <div className="flex items-center gap-2">
//           <span className="w-4 h-4 rounded bg-green-100 border border-green-400"></span>
//           Present
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="w-4 h-4 rounded bg-red-100 border border-red-400"></span>
//           Absent
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></span>
//           Not Marked
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api/apiFetch";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import dayjs from "dayjs";

export default function TeacherMonthlyAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => (prev > 0 ? prev - 1 : 11));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => (prev < 11 ? prev + 1 : 0));
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["teacherAttendance", id, selectedMonth],
    queryFn: () =>
      apiGet(`/admins/teachers/get-attendance/${id}?month=${selectedMonth + 1}`),
  });

  const attendanceData = data?.results?.docs || [];
  const teacherName = attendanceData[0]?.teacherName || "Teacher";

  const currentYear = dayjs().year();
  const startOfMonth = dayjs()
    .year(currentYear)
    .month(selectedMonth)
    .startOf("month");
  const endOfMonth = dayjs()
    .year(currentYear)
    .month(selectedMonth)
    .endOf("month");
  const daysInMonth = endOfMonth.date();

  const attendanceMap = useMemo(() => {
    const map = {};
    attendanceData.forEach((item) => {
      const dateKey = dayjs(item.date).format("YYYY-MM-DD");
      map[dateKey] = item.status;
    });
    return map;
  }, [attendanceData]);

  const days = Array.from({ length: daysInMonth }, (_, i) =>
    startOfMonth.add(i, "day")
  );

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-opacity-70 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );

  if (error)
    return (
      <p className="text-center text-red-500 mt-10">
        Failed to load attendance
      </p>
    );

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition text-sm sm:text-base"
        >
          <ArrowLeft size={20} /> <span className="font-medium">Back</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left">
            {teacherName}'s Attendance
          </h1>

          {/* Month Filter */}
          <div className="flex items-center justify-center sm:justify-start gap-2 bg-white shadow-sm border border-gray-300 rounded-xl px-3 sm:px-4 py-2">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
              <Calendar className="text-indigo-500" size={18} />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent outline-none text-sm sm:text-base font-medium text-gray-700"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {dayjs().month(i).format("MMMM YYYY")}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ===== Calendar Grid ===== */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4 bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Weekday Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="hidden md:block text-center text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide"
          >
            {d}
          </div>
        ))}

        {/* Days */}
        {days.map((day) => {
          const dateKey = day.format("YYYY-MM-DD");
          const status = attendanceMap[dateKey] || "Not Marked";

          const statusClass =
            status === "Present"
              ? "bg-green-50 text-green-700 border-green-300"
              : status === "Absent"
              ? "bg-red-50 text-red-700 border-red-300"
              : "bg-gray-50 text-gray-500 border-gray-200";

          return (
            <motion.div
              key={dateKey}
              whileHover={{ scale: 1.03 }}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-center transition-all ${statusClass}`}
            >
              <p className="text-base sm:text-lg font-semibold">{day.date()}</p>
              <p className="text-[10px] sm:text-xs mt-1">{status}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ===== Footer Summary ===== */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-100 border border-green-400"></span>
          Present
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-100 border border-red-400"></span>
          Absent
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-100 border border-gray-300"></span>
          Not Marked
        </div>
      </div>
    </div>
  );
}
