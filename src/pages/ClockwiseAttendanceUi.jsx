// import React, { useState } from "react";
// import { Check, Clock, X, Star, Plane, StarHalf } from "lucide-react";
// import { FaFileExport } from "react-icons/fa";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiGet, apiPut } from "../api/apiFetch";
// import useDebounce from "../hooks/useDebounce";
// import apiPath from "../api/apiPath";
// import { format } from "date-fns";
// // import { FaFileExport } from "react-icons/fa";
// import Papa from "papaparse";
// import { saveAs } from "file-saver";

// function getDaysInMonth(month, year) {
//     const days = new Date(year, month + 1, 0).getDate();
//     const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//     return Array.from({ length: days }, (_, i) => {
//         const date = new Date(year, month, i + 1);

//         return {
//             day: i + 1,
//             weekday: weekdays[date.getDay()],
//             dateString: `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1)
//                 .padStart(2, "0")}`, // FIXED ✔ no timezone problem!
//             isToday: date.toDateString() === new Date().toDateString(),
//         };
//     });
// }


// // Convert status to UI icon (same as old UI)
// const statusIcon = (status) => {
//     if (status === "Present") return <Check className="w-4 h-4 text-green-500 mx-auto" />;
//     if (status === "Late") return <Clock className="w-4 h-4 text-orange-500 mx-auto" />;
//     if (status === "Absent") return <X className="w-4 h-4 text-red-500 mx-auto" />;
//     if (status === "Holiday") return <Star className="w-4 h-4 text-yellow-500 mx-auto" />;
//     if (status === "Leave") return <Plane className="w-4 h-4 text-blue-500 mx-auto" />;
//     if (status === "Half Day") return <StarHalf className="w-4 h-4 text-blue-500 mx-auto" />;

//     return <span className="text-gray-300">—</span>;
// };

// export default function AttendanceTable() {
//     const today = new Date();
//     const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
//     const [selectedYear, setSelectedYear] = useState(today.getFullYear());
//     const [searchTerm, setSearchTerm] = useState("");
//     const [page, setPage] = useState(1);
//     console.log("searchterm", searchTerm);
//     const [currentPage, setCurrentPage] = useState(1);
//     const rowsPerPage = 10;
//     const [limit, setLimit] = useState(10);


//     const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
//     const monthName = new Date(selectedYear, selectedMonth).toLocaleString("default", {
//         month: "long",
//     });

//     const queryClient = useQueryClient();
//     const debouncedSearch = useDebounce(searchTerm, 500);
//     // ------------------------------
//     // GET ATTENDANCE LIST API
//     // ------------------------------
//     const { data, isLoading } = useQuery({
//         queryKey: ["attendance", selectedMonth, selectedYear, debouncedSearch, page, limit],
//         queryFn: () => apiGet(apiPath.getAttendanceClockwise, { page: page, limit: limit, search: debouncedSearch, }),
//     });
//     const totalDocs = data?.results?.totalDocs || 0;
//     const totalPages = data?.results?.totalPages || 1;
//     const currentpage = data?.results?.page;

//     // ------------------------------
//     // UPDATE ATTENDANCE API
//     // ------------------------------
//     const updateMutation = useMutation({
//         mutationFn: ({ teacherId, date, status }) =>
//             apiPut(apiPath.updateIp, { teacherId, date, status }),

//         onSuccess: () => {
//             queryClient.invalidateQueries(["attendance"]);
//             alert("Attendance updated!");
//         },
//     });
//     const handleExportAttendance = (docs, selectedMonth, selectedYear) => {
//         if (!docs || docs.length === 0) {
//             alert("No data to export");
//             return;
//         }

//         // Build all month dates
//         const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
//         const allDates = Array.from({ length: totalDays }, (_, i) => {
//             const d = new Date(selectedYear, selectedMonth, i + 1);
//             return format(d, "yyyy-MM-dd");
//         });

//         // Final rows for CSV
//         const rows = docs.map((teacher) => {
//             const row = {};

//             // Employee Name
//             row["Employee"] = teacher.name || "";

//             // Generate attendance map from nested response
//             const attendanceMap = {};

//             teacher.attendanceRecords?.forEach((record) => {
//                 record.attendance?.forEach((a) => {
//                     const dateKey = a.date.split("T")[0];
//                     attendanceMap[dateKey] = a.status;
//                 });
//             });

//             // Fill each day column
//             allDates.forEach((date) => {
//                 row[date] = attendanceMap[date] || "Absent";
//             });

//             return row;
//         });

//         // Convert to CSV
//         const csv = Papa.unparse(rows, {
//             quotes: false,
//             delimiter: ",",
//             header: true,
//             newline: "\r\n",
//         });

//         // File name
//         const stamp = new Date().toISOString().replace(/[:]/g, "-").split(".")[0];
//         const filename = `Attendance_${selectedYear}-${selectedMonth + 1}_${stamp}.csv`;

//         // Download file
//         const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
//         saveAs(blob, filename);

//     };
//     if (isLoading) {
//         return (
//             <div className="flex justify-center items-center min-h-[80vh] bg-opacity-70 z-50">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen md:w-[82vw] w-[99vw] bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 sm:px-8 py-8 text-gray-800 font-['Inter']">

//             {/* Header Section */}
//             <div className="flex md:flex-col items-center md: flex-row justify-between items-start mb-6 gap-4">
//                 <h2 className="text-2xl font-semibold text-gray-900">
//                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-500">
//                         Attendance — {monthName} {selectedYear}
//                     </span>
//                 </h2>



//                 {/* Filters */}
//                 <div className="flex gap-3 justify-between w-full mb-6">
//                     <div className="flex gap-2">
//                         <select
//                             className="border border-gray-300 px-3 py-2 rounded-md"
//                             value={selectedMonth}
//                             onChange={(e) => setSelectedMonth(Number(e.target.value))}
//                         >
//                             {Array.from({ length: 12 }, (_, i) => (
//                                 <option key={i} value={i}>
//                                     {new Date(0, i).toLocaleString("default", { month: "long" })}
//                                 </option>
//                             ))}
//                         </select>

//                         <select
//                             className="border border-gray-300 px-3 py-2 rounded-md"
//                             value={selectedYear}
//                             onChange={(e) => setSelectedYear(Number(e.target.value))}
//                         >
//                             {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map((yr) => (
//                                 <option key={yr} value={yr}>
//                                     {yr}
//                                 </option>
//                             ))}
//                         </select>

//                     </div>
//                     <button
//                         onClick={() => handleExportAttendance(data?.results?.docs, selectedMonth, selectedYear)}
//                         className="flex items-center cursor-pointer gap-1 px-4 py-2 rounded-md text-sm font-medium  bg-[image:var(--gradient-primary)] shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
//                         <FaFileExport className="" /> Export Report
//                     </button>
//                 </div>
//             </div>

//             {/* Legend */}
//             <div className="flex flex-wrap gap-3 mb-6 text-xs sm:text-sm text-gray-700">
//                 <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm">
//                     <Star className="w-4 h-4 text-yellow-500" /> Holiday
//                 </span>
//                 <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm">
//                     <Check className="w-4 h-4 text-green-500" /> Present
//                 </span>
//                 <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm">
//                     <Clock className="w-4 h-4 text-orange-500" /> Late
//                 </span>
//                 <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm">
//                     <X className="w-4 h-4 text-red-500" /> Absent
//                 </span>
//                 <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm">
//                     <Plane className="w-4 h-4 text-blue-500" /> On Leave
//                 </span>
//                 <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm">
//                     <StarHalf className="w-4 h-4 text-blue-500" /> On Half Day
//                 </span>
//             </div>
//             <div className="flex items-center justify-between">
//                 <input
//                     type="text"
//                     placeholder="Search teachers"
//                     value={searchTerm}
//                     onChange={(e) => {
//                         setSearchTerm(e.target.value);
//                         setCurrentPage(1);
//                     }}
//                     autoFocus
//                     className="border px-3 py-2 border-gray-300 rounded-md mb-2 "
//                     style={{ width: "200px" }}
//                 />
//                 <select
//                     className="border px-3 py-2 border-gray-300 rounded-md mb-2 "
//                     value={limit}
//                     onChange={(e) => {
//                         setLimit(Number(e.target.value));
//                         setPage(1); // reset page to 1 when limit changes
//                     }}
//                 >
//                     {[10, 20, 50, 100].map((num) => (
//                         <option key={num} value={num}>
//                             {num}
//                         </option>
//                     ))}
//                 </select>
//             </div>

//             {/* TABLE */}
//             <div className="bg-white/80 h-[80vh] backdrop-blur-md rounded-xl border border-slate-200 shadow-lg overflow-x-auto overflow-y-auto">
//                 <table className="min-w-[900px] w-full text-xs sm:text-sm border-collapse">
//                     <thead className="bg-gradient-to-r from-slate-100 to-slate-200 sticky top-0 z-10">
//                         <tr className="text-gray-700">
//                             <th className="text-left px-4 py-3 font-semibold text-sm">Teachers</th>

//                             {daysInMonth.map(({ day, weekday, isToday }) => (
//                                 <th
//                                     key={day}
//                                     className={`text-center px-2 py-2 rounded-md ${isToday ? "bg-blue-100 font-bold text-blue-700 shadow-inner" : "text-gray-600"
//                                         }`}
//                                 >
//                                     <div>{day}</div>
//                                     <div className="text-[10px] text-gray-400">{weekday}</div>
//                                 </th>
//                             ))}

//                             <th className="text-center px-2 py-2 font-semibold text-gray-700">Total</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {data?.results?.docs?.map((item) => {
//                             const attendMap = {};

//                             // Extract all attendance from ALL records safely
//                             item.attendanceRecords?.forEach((record) => {
//                                 record.attendance?.forEach((a) => {
//                                     attendMap[a.date] = a.status;
//                                 });
//                             });

//                             // Calculate total Present
//                             const totalPresent = Object.values(attendMap).filter(
//                                 (v) => v === "Present"
//                             ).length;

//                             return (
//                                 <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
//                                     {/* Teacher Details */}
//                                     <td className="px-4 py-3">
//                                         <div className="font-medium text-gray-900 text-sm">
//                                             {item?.name || "Unknown"}
//                                         </div>
//                                         <div className="text-[11px] text-gray-500">
//                                             {item?.email}
//                                         </div>
//                                     </td>

//                                     {/* Attendance Cells */}
//                                     {daysInMonth.map((d) => (
//                                         <td
//                                             key={d.dateString}
//                                             className="text-center px-2 py-2 cursor-pointer hover:scale-105 transition"
//                                             onClick={() =>
//                                                 updateMutation.mutate({
//                                                     teacherId: item._id, // employee's unique ID
//                                                     date: d.dateString,
//                                                     status: "Present",
//                                                 })
//                                             }
//                                         >
//                                             {statusIcon(attendMap[d.dateString])}
//                                         </td>
//                                     ))}

//                                     {/* Total Present */}
//                                     <td className="text-center font-semibold text-gray-800 bg-slate-50">
//                                         {totalPresent}/{daysInMonth.length}
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                     </tbody>

//                 </table>


//             </div>
//             <div className="flex justify-end items-center gap-2 mt-4">

//                 <button
//                     onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
//                     disabled={page === 1}
//                     className="px-3 py-1 border cursor-pointer rounded-md hover:bg-gray-100 disabled:opacity-50"
//                 >
//                     Prev
//                 </button>
//                 {currentpage} of {totalPages}
//                 {/* {Array.from({ length: totalPages }, (_, i) => (
//                         <button
//                             key={i}
//                             onClick={() => setPage(i + 1)}
//                             className={`px-3 py-1 border rounded-md ${page === i + 1 ? "bg-yellow-500 text-white" : "hover:bg-gray-100"
//                                 }`}
//                         >
//                             {i + 1}
//                         </button>
//                     ))} */}

//                 <button
//                     onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
//                     disabled={page === totalPages}
//                     className="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-100 disabled:opacity-50"
//                 >
//                     Next
//                 </button>

//             </div>
//         </div>
//     );
// }
import React, { useState } from "react";
import { Check, Clock, X, Star, Plane, StarHalf } from "lucide-react";
import { FaFileExport } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "../api/apiFetch";
import useDebounce from "../hooks/useDebounce";
import apiPath from "../api/apiPath";
import { format } from "date-fns";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import { FaEdit } from "react-icons/fa";


/* ---------- helpers ---------- */
function getDaysInMonth(month, year) {
  const days = new Date(year, month + 1, 0).getDate();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(year, month, i + 1);
    return {
      day: i + 1,
      weekday: weekdays[date.getDay()],
      dateString: `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
      isToday: date.toDateString() === new Date().toDateString(),
    };
  });
}

const statusIcon = (status) => {
  if (status === "Present") return <Check className="w-4 h-4 text-green-500 mx-auto" />;
  if (status === "Late") return <Clock className="w-4 h-4 text-orange-500 mx-auto" />;
  if (status === "Absent") return <X className="w-4 h-4 text-red-500 mx-auto" />;
  if (status === "Holiday") return <Star className="w-4 h-4 text-yellow-500 mx-auto" />;
  if (status === "Leave") return <Plane className="w-4 h-4 text-blue-500 mx-auto" />;
  if (status === "Half Day") return <StarHalf className="w-4 h-4 text-blue-500 mx-auto" />;
  return <span className="text-gray-300">—</span>;
};

/* ---------- main component ---------- */
export default function AttendanceTable() {
  const today = new Date();
  // ----- state/hooks (always at top) -----
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("all"); // "all" | "specific"
  const [modalDate, setModalDate] = useState(""); // YYYY-MM-DD
  const [modalStatus, setModalStatus] = useState("");
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState("");

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const monthName = new Date(selectedYear, selectedMonth).toLocaleString("default", { month: "long" });

  const queryClient = useQueryClient();

  // ---------------- GET ATTENDANCE ----------------
  const { data, isLoading } = useQuery({
    queryKey: ["attendance", selectedMonth, selectedYear, debouncedSearch, page, limit],
    queryFn: () =>
      apiGet(apiPath.getAttendanceClockwise, {
        page,
        limit,
        name: debouncedSearch,
        month: selectedMonth + 1,
        year: selectedYear,
      }),
    keepPreviousData: true,
  });

  const totalDocs = data?.results?.totalDocs || 0;
  const totalPages = data?.results?.totalPages || 1;
  const currentpage = data?.results?.page || page;

  // ---------------- UPDATE (single or bulk) ----------------
  const updateMutation = useMutation({
    mutationFn: (payload) => apiPut(apiPath.updateClockwiseAttendance, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["attendance"]);
      setModalOpen(false);
      setModalStatus("");
      setModalDate("");
      setSelectedTeacherIds([]);
      toast.success(res?.message);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message);
    },
  });

  // ---------- derived arrays (NO hooks) ----------
  const teachers = Array.isArray(data?.results?.docs) ? data.results.docs : [];

  // filteredTeacherOptions (no useMemo)
  const normalizedTeacherSearch = (teacherSearch || "").trim().toLowerCase();
  const filteredTeacherOptions = !normalizedTeacherSearch
    ? teachers
    : teachers.filter((t) => {
        const n = (t?.name || "").toLowerCase();
        const e = (t?.email || "").toLowerCase();
        return n.includes(normalizedTeacherSearch) || e.includes(normalizedTeacherSearch);
      });

  // missingForDate (teachers without attendance for chosen modalDate)
  const missingForDate = (() => {
    if (!modalDate) return teachers.slice(); // return full list (or return [])
    return teachers.filter((t) => {
      const map = {};
      t.attendanceRecords?.forEach((rec) => {
        rec.attendance?.forEach((a) => {
          map[a.date.split("T")[0]] = a.status;
        });
      });
      return !map[modalDate];
    });
  })();

  // ---------- export function ----------
  const handleExportAttendance = (docs, selMonth, selYear) => {
    if (!docs || docs.length === 0) {
      alert("No data to export");
      return;
    }

    const totalDays = new Date(selYear, selMonth + 1, 0).getDate();
    const allDates = Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(selYear, selMonth, i + 1);
      return format(d, "yyyy-MM-dd");
    });

    const rows = docs.map((teacher) => {
      const row = {};
      row["Employee"] = teacher.name || "";

      const attendanceMap = {};
      teacher.attendanceRecords?.forEach((record) =>
        record.attendance?.forEach((a) => {
          const dateKey = a.date.split("T")[0];
          attendanceMap[dateKey] = a.status;
        })
      );

      allDates.forEach((date) => {
        row[date] = attendanceMap[date] || "Absent";
      });

      return row;
    });

    const csv = Papa.unparse(rows, { quotes: false, delimiter: ",", header: true, newline: "\r\n" });
    const stamp = new Date().toISOString().replace(/[:]/g, "-").split(".")[0];
    const filename = `Attendance_${selYear}-${selMonth + 1}_${stamp}.csv`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, filename);
  };

  // ---------- loading UI (hooks already declared above) ----------
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-yellow-500 rounded-full" />
      </div>
    );
  }

  // ---------- helpers used in rendering ----------
  const buildAttendMap = (item) => {
    const map = {};
    item.attendanceRecords?.forEach((record) => {
      record.attendance?.forEach((a) => {
        map[a.date.split("T")[0]] = a.status;
      });
    });
    return map;
  };

  // multi-select helpers
  const toggleSelectTeacher = (id) => {
    setSelectedTeacherIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const selectAllShown = () => {
    setSelectedTeacherIds(filteredTeacherOptions.map((t) => t._id));
  };
  const clearSelection = () => setSelectedTeacherIds([]);

  // submit handler for modal
  const handleModalSubmit = () => {
    if (!modalDate || !modalStatus) {
      alert("Please select date and status.");
      return;
    }
    if (modalMode === "specific" && selectedTeacherIds.length === 0) {
    //   alert("Please select at least one teacher.");
    toast.error("Please select at least one teacher. ");
      return;
    }

    const payload = {
      date: modalDate,
      status: modalStatus,
      applyTo: modalMode, // 'all' or 'specific'
    };

    if (modalMode === "specific") payload.teachers = selectedTeacherIds;
    updateMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen md:w-[82vw] w-[99vw] bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 sm:px-8 py-8 text-gray-800 font-['Inter']">
      {/* Header Section */}
      <div className=" md:flex items-center md: flex-row justify-between items-start mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-500">
            Attendance — {monthName} {selectedYear}
          </span>
        </h2>

        <div className="flex items-center justify-end md:justify-normal gap-3">
          {/* Update Attendance Button */}
      
          <button
            onClick={() => {
              setModalOpen(true);
              setModalMode("all");
              setModalDate("");
              setModalStatus("");
              setSelectedTeacherIds([]);
            }}
            className="px-3 py-2 flex gap-1 items-center cursor-pointer rounded-md  bg-[image:var(--gradient-primary)] shadow hover:scale-105 transition"
          >
                <FaEdit />
            Update Attendance
          </button>

          {/* Export */}
          <button
            onClick={() => handleExportAttendance(teachers, selectedMonth, selectedYear)}
            className="flex items-center cursor-pointer gap-1 px-4 py-2 rounded-md text-sm font-medium bg-[image:var(--gradient-primary)] shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <FaFileExport /> Export Report
          </button>
        </div>
      </div>

      {/* Filters + legend (unchanged) */}
      <div className="md:flex gap-3 justify-between w-full mb-6">
        <div className="flex gap-2 mb-2">
          <select className="border border-gray-300 px-3 py-2 rounded-md" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <select className="border border-gray-300 px-3 py-2 rounded-md" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3 mb-6 text-xs sm:text-sm text-gray-700">
          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm"><Star className="w-4 h-4 text-yellow-500" /> Holiday</span>
          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm"><Check className="w-4 h-4 text-green-500" /> Present</span>
          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm"><Clock className="w-4 h-4 text-orange-500" /> Late</span>
          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm"><X className="w-4 h-4 text-red-500" /> Absent</span>
          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm"><Plane className="w-4 h-4 text-blue-500" /> On Leave</span>
          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm"><StarHalf className="w-4 h-4 text-blue-500" /> On Half Day</span>
        </div>
      </div>

      {/* Search + Limit */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search teachers"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          autoFocus
          className="border px-3 py-2 border-gray-300 rounded-md mb-2"
          style={{ width: "200px" }}
        />
        <div className="flex items-center gap-2">
          <select
            className="border px-3 py-2 border-gray-300 rounded-md mb-2"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            {[10, 20, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white/80 h-[70vh] backdrop-blur-md rounded-xl border border-slate-200 shadow-lg overflow-x-auto overflow-y-auto">
        <table className="min-w-[900px] w-full text-xs sm:text-sm border-collapse">
          <thead className="bg-gradient-to-r from-slate-100 to-slate-200 sticky top-0 z-10">
            <tr className="text-gray-700">
              <th className="text-left px-4 py-3 font-semibold text-sm">Teachers</th>
              {daysInMonth.map(({ day, weekday, isToday }) => (
                <th key={day} className={`text-center px-2 py-2 rounded-md ${isToday ? "bg-blue-100 font-bold text-blue-700 shadow-inner" : "text-gray-600"}`}>
                  <div>{day}</div>
                  <div className="text-[10px] text-gray-400">{weekday}</div>
                </th>
              ))}
              <th className="text-center px-2 py-2 font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((item) => {
              const attendMap = buildAttendMap(item);
              const totalPresent = Object.values(attendMap).filter((v) => v === "Present").length;
              return (
                <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 text-sm">{item?.name || "Unknown"}</div>
                    <div className="text-[11px] text-gray-500">{item?.email}</div>
                  </td>

                  {daysInMonth.map((d) => (
                    <td
                      key={d.dateString}
                      className="text-center px-2 py-2 cursor-pointer hover:scale-105 transition"
                    //   onClick={() => updateMutation.mutate({ teacherId: item._id, date: d.dateString, status: "Present" })}
                    >
                      {statusIcon(attendMap[d.dateString])}
                    </td>
                  ))}

                  <td className="text-center font-semibold text-gray-800 bg-slate-50">{totalPresent}/{daysInMonth.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1} className="px-3 py-1 border cursor-pointer rounded-md hover:bg-gray-100 disabled:opacity-50">Prev</button>
        <div className="text-sm text-gray-600">Page {currentpage} of {totalPages}</div>
        <button onClick={() => setPage((prev) => Math.min((prev + 1), totalPages))} disabled={page === totalPages} className="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-100 disabled:opacity-50">Next</button>
      </div>

      {/* ---------- MODAL ---------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 relative">
            <button onClick={() => setModalOpen(false)} className="absolute cursor-pointer top-3 right-3 text-gray-500 hover:text-gray-800">✕</button>
            <h3 className="text-xl font-semibold mb-4">Update Attendance</h3>

            {/* Date + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600">Select Date</label>
                <input type="date" className="mt-2 border px-3 py-2 rounded w-full" value={modalDate} onChange={(e) => setModalDate(e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-gray-600">Select Status</label>
                <select className="mt-2 border px-3 py-2 rounded w-full" value={modalStatus} onChange={(e) => setModalStatus(e.target.value)}>
                  <option value="">-- Choose status --</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Leave">Leave</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </div>
            </div>

            {/* Mode buttons */}
            <div className="flex gap-3 items-center mb-4">
              <button onClick={() => setModalMode("all")} className={`px-4 py-2 cursor-pointer rounded ${modalMode === "all" ? "bg-yellow-500 text-white" : "bg-gray-100"}`}>All</button>
              <button onClick={() => setModalMode("specific")} className={`px-4 py-2 cursor-pointer rounded ${modalMode === "specific" ? "bg-yellow-500 text-white" : "bg-gray-100"}`}>Specific</button>

              {/* show how many missing for chosen date */}
              {modalDate && (
                <div className="ml-auto text-sm text-gray-600">
                  Missing for {modalDate}: <strong>{missingForDate.length}</strong>
                </div>
              )}
            </div>

            {/* If specific → show multi-select */}
            {modalMode === "specific" && (
              <div className="mb-4">
                <div className="flex gap-2 items-center mb-2">
                  <input type="text" placeholder="Search teacher..." className="border px-3 py-2 rounded w-full" value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} />
                  <button onClick={selectAllShown} className="px-3  py-2 bg-gray-100 cursor-pointer rounded"> All</button>
                  <button onClick={clearSelection} className="px-3 py-2 bg-gray-100 cursor-pointer rounded">Clear</button>
                </div>

                <div className="max-h-44 overflow-auto border rounded p-2">
                  {filteredTeacherOptions.map((t) => (
                    <label key={t._id} className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded">
                      <input type="checkbox" checked={selectedTeacherIds.includes(t._id)} onChange={() => toggleSelectTeacher(t._id)} />
                      <div>
                        <div className="text-sm font-medium">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded cursor-pointer bg-gray-200">Cancel</button>
              <button onClick={handleModalSubmit} disabled={!modalDate || !modalStatus || (modalMode === "specific" && selectedTeacherIds.length === 0)} className="px-4 py-2 rounded bg-yellow-500 cursor-pointer text-white">
            {updateMutation.isPending?"Applying...":"Apply"}    
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
