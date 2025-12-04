import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "../api/apiFetch";
import apiPath from "../api/apiPath";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { RiImportFill } from "react-icons/ri";
import Modal from "../components/Modal";
import { FaFileExport } from "react-icons/fa";
import { FaDownload } from "react-icons/fa6";
import Papa from "papaparse";
import { saveAs } from "file-saver";

import {
    CalendarDays,
    Loader2,
    PlusCircle,
    Trash2,
    Pencil,
    X,
} from "lucide-react";
const predefinedHolidays = [
    "New Year's Day",
    "Makar Sankranti",
    "Republic Day",
    "Holi",
    "Good Friday",
    "Easter",
    "Eid al-Fitr",
    "Eid al-Adha",
    "Independence Day",
    "Ganesh Chaturthi",
    "Dussehra",
    "Diwali",
    "Christmas",
];
export default function CalendarPage() {
    const queryClient = useQueryClient();
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [form, setForm] = useState({ title: "", description: "" });
    const [showConfirm, setShowConfirm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deletedId, setDeleteId] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);


    // ✅ Fetch holidays
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["holidays", selectedMonth, selectedYear],
        queryFn: () =>
            apiGet(`${apiPath.getHolidays}?month=${selectedMonth}&year=${selectedYear}`),
    });
    const importMutation = useMutation({
        mutationFn: async (formData) =>
            apiPost(apiPath.importCalander, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            }),
        onSuccess: (res) => {
            const summary = res?.results?.summary;

            // Base success message
            toast.success(res?.message || "Holidays imported successfully ✅");

            // Show success/failure summary
            if (summary) {
                toast(
                    `📊 Import Summary:
Total Records: ${summary.totalProcessed}
✅ Successfully Created: ${summary.successCount}
⚠️ Duplicates: ${summary.duplicateCount}
❌ Errors: ${summary.errorCount}`,
                    {
                        icon: "📦",
                        duration: 6000,
                    }
                );
            }

            // Refresh table and reset form
            queryClient.invalidateQueries({ queryKey: ["eventcalender"] });
            setShowModal(false);
            setSelectedFile(null);
            setClassId(null);
        },

        onError: (err) => {
            toast.error(err?.response?.data?.message || "Import failed ❌");
        },

    });
    const holidays = data?.results || [];
    const handleImportSubmit = (e) => {
        e.preventDefault();

        // === Validation checks ===


        // if (!academicYear) {
        //   toast.error("please select academic year");
        //   return;
        // }

        // if (!feesData?.results?._id) {
        //   toast.error("Fee structure not found! Please ensure one exists for this class.");
        //   return;
        // }

        if (!selectedFile) {
            toast.error("Please upload an Excel/CSV file!");
            return;
        }

        // if (!academicYear) {
        //   toast.error("Please select an academic year!");
        //   return;
        // }

        // === Prepare FormData ===
        const formData = new FormData();
        formData.append("file", selectedFile);
        importMutation.mutate(formData);
    };
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith(".csv") && !file.name.endsWith(".csv")) {
            toast.error("Please upload a valid Excel file (.csv)");
            return;
        }
        setSelectedFile(file);
    };
    // ✅ Generate calendar days
    const daysInMonth = useMemo(() => {
        const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
        const lastDay = new Date(selectedYear, selectedMonth, 0);
        const totalDays = lastDay.getDate();
        const blanks = Array.from({ length: firstDay.getDay() }, () => null);
        const days = Array.from({ length: totalDays }, (_, i) => i + 1);
        return [...blanks, ...days];
    }, [selectedMonth, selectedYear]);

    const getHolidayForDate = (day) => {
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return holidays.find((h) => h.date === dateStr);
    };

    const addOrUpdateMutation = useMutation({
        mutationFn: (payload) =>
            editId
                ? apiPut(`${apiPath.holidaysUpdate}/${editId}`, payload)
                : apiPost(apiPath.holidays, payload),
        onSuccess: (res) => {
            toast.success(editId ? res?.message : res?.message);
            setShowModal(false);
            setForm({ title: "", description: "" });
            setEditId(null);
            queryClient.invalidateQueries(["holidays"]);
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Error saving holiday ❌");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => apiDelete(`${apiPath.holidaysDelete}/${id}`),
        onSuccess: (res) => {
            toast.success(res.message);
            setShowModal(false);
            queryClient.invalidateQueries(["holidays"]);
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Delete failed ❌");
        },
    });

    const handleDateClick = (day) => {
        const date = new Date(selectedYear, selectedMonth - 1, day);
        const iso = `${date.getFullYear()}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
        const existing = getHolidayForDate(day);

        setForm(existing ? { title: existing.title, description: existing.description } : { title: "", description: "" });
        setEditId(existing?._id || null);
        setSelectedDate({ iso, weekday, display: day });
        setShowModal(true);
    };
    const downloadStudentTemplate = () => {
        // Columns you want the admin to fill
        const templateRows = [
            {
                date: "10/02/2024",
                day: "Wednesday",
                title: "Mahatma Gandhi Jayanti",
                description: "Birth anniversary of Mahatma Gandhi",
            }
        ];


        const ws = XLSX.utils.json_to_sheet(templateRows, { skipHeader: false });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "CalenderTemplate");
     XLSX.writeFile(wb, "Calender.csv", { bookType: "csv" });

    };
    const handleExportCSV = () => {
        try {
            const docs = data?.results || [];

            if (!docs.length) {
                toast.error("No data to export");
                return;
            }

            // 👉 Map your table rows to a flat CSV-friendly shape
            const rows = docs.map((item, idx) => {
                const formatDate = (dateString) => {
                    if (!dateString) return "";
                    const date = new Date(dateString);
                    const year = date.getFullYear();
                    console.log("year", year);
                    const month = String(date.getMonth() + 1) // 01-12
                    const day = String(date.getDate()).padStart(2, "0"); // 01-31
                    return `${year}/${month}/${day}`; // → "2013/02/05"
                };


                const formatcreatedandupdated = (dateStr) => {
                    if (!dateStr) return "N/A";
                    const date = new Date(dateStr);
                    return date.toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                };


                // status ko normalize: true/'active' -> Active else Inactive
                // const subjects =
                //   Array.isArray(cls?.subjectsHandled) && cls.subjectsHandled.length > 0
                //     ? cls.subjectsHandled
                //       .map(
                //         (s) =>
                //           `${s?.subjectName || "N/A"}${s?.subjectCode ? ` (${s.subjectCode})` : ""
                //           }`
                //       )
                //       .join(", ")
                //     : "N/A";

                // subjects: string[] ya null
                //   const subjects =
                //     Array.isArray(cls?.classTeacher?.subjectsHandled) ? cls?.classTeacher?.subjectsHandled?.map((c)=>c?.subjectName).join(", ") : "N/A";
                return {
                    "date": item?.date || "",
                    "day": item?.day || "",
                    "title": item?.title || "",
                    "description": item?.description,
                    "createdAt": formatcreatedandupdated(item?.createdAt),
                    "updatedAt": formatcreatedandupdated(item?.updatedAt),
                };

            });

            // 👉 Convert JSON → CSV
            const csv = Papa.unparse(rows, {
                quotes: false,        // har field ke around quotes nahi
                delimiter: ",",       // default comma
                header: true,         // header row include
                newline: "\r\n",      // windows/mac friendly new lines
            });

            // 👉 File name with date
            const stamp = new Date().toISOString().replace(/[:]/g, "-").split(".")[0]; // 2025-11-10T12-34-56
            const filename = `teachers${stamp}.csv`;

            // 👉 Trigger download
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            saveAs(blob, filename);

            toast.success("CSV exported successfully ✅");
        } catch (err) {
            console.error(err);
            toast.error("Failed to export CSV ❌");
        }
    };
    const handleSave = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return toast.error("Title is required!");

        const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString("default", { month: "long" });
        const payload = {
            year: selectedYear,
            month: monthName,
            date: selectedDate.iso,
            day: selectedDate.weekday,
            title: form.title,
            description: form.description,
        };
        addOrUpdateMutation.mutate(payload);
    };

    const handleDelete = (id) => {
        deleteMutation.mutate(id);
    };

    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString("default", { month: "long" });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-4 sm:px-6 py-10 text-gray-800">
            <Modal isOpen={openModal} onClose={() => setOpenModal(false)} title="Import Excel File" >
                <form
                    onSubmit={handleImportSubmit}
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload Excel File <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="w-full border border-gray-300 p-2 rounded-md cursor-pointer"
                        />
                        {selectedFile && (
                            <p className="text-xs mt-1 text-gray-500">
                                Selected: {selectedFile.name}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        // disabled={importMutation.isLoading}
                        className="w-full mt-2  flex gap-1 justify-center  items-center bg-[image:var(--gradient-primary)]  py-2 rounded-lg  cursor-pointer transition"
                    >
                        <FaFileExport />

                        {/* {importMutation.isLoading ? "Importing..." : "Start Import"} */}
                        Start Import
                    </button>
                </form>
            </Modal>
            <div className="flex items-center text-[10px] md:text-[14px] gap-3 w-full mb-3 justify-end">
                <button
                    //                  date: "10/02/2024",
                    // day: "Wednesday",
                    // title: "Mahatma Gandhi Jayanti",
                    // description: "Birth anniversary of Mahatma Gandhi",
                    onClick={downloadStudentTemplate}
                    className="px-3 flex gap-1 items-center md:justify-center py-2 rounded-md bg-[image:var(--gradient-primary)]   cursor-pointer"
                >
                    <FaDownload />

                    Download Format
                </button>
                <button
                    onClick={() => setOpenModal(true)}
                    className="px-3 flex gap-1     items-center justify-end py-2 rounded-md  bg-[image:var(--gradient-primary)] cursor-pointer "
                >
                    <RiImportFill />
                    Import  (Excel)
                </button>
                <button
                    onClick={handleExportCSV}
                    className="px-4 flex gap-1 items-center py-2 px-4 py-2 bg-[image:var(--gradient-primary)]  rounded-lg cursor-pointer hover:bg-blue-700 transition"
                >
                    <FaFileExport />

                    Export CSV
                </button>
            </div>
            <div className="max-w-7xl mx-auto backdrop-blur-2xl bg-white/40 border border-white/60 shadow-2xl rounded-3xl p-6 sm:p-10 transition-all">

                {/* Header */}
                <div className="sticky top-0 z-20 bg-white/40 backdrop-blur-md flex flex-col sm:flex-row justify-between items-center mb-8 rounded-2xl py-4 px-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <CalendarDays className="w-7 h-7 text-yellow-500" />
                        <h2 className="text-3xl font-semibold bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent">
                            {monthName} {selectedYear}
                        </h2>
                    </div>

                    <div className="flex gap-3 mt-3 sm:mt-0">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="rounded-xl px-3 py-2 bg-white/70 border border-gray-300 focus:ring-2 focus:ring-yellow-400"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="rounded-xl px-3 py-2 bg-white/70 border border-gray-300 focus:ring-2 focus:ring-yellow-400"
                        >
                            {Array.from({ length: 5 }, (_, i) => {
                                const y = now.getFullYear() - 2 + i;
                                return <option key={y} value={y}>{y}</option>;
                            })}
                        </select>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                        <div key={d} className="uppercase text-xs sm:text-sm font-semibold text-gray-600 tracking-wide">
                            {d}
                        </div>
                    ))}

                    {isLoading || isFetching ? (
                        <div className="col-span-7 flex justify-center py-10">
                            <Loader2 className="animate-spin text-yellow-500 w-8 h-8" />
                        </div>
                    ) : (
                        daysInMonth.map((day, idx) => {
                            if (!day) return <div key={idx} className="h-16 sm:h-20" />;
                            const holiday = getHolidayForDate(day);
                            const isToday =
                                day === now.getDate() &&
                                selectedMonth === now.getMonth() + 1 &&
                                selectedYear === now.getFullYear();

                            return (
                                <div
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    className={`relative cursor-pointer h-16 sm:h-24 rounded-2xl border shadow-sm flex flex-col items-center justify-center transition-all duration-200 
                    ${holiday
                                            ? "bg-gradient-to-br from-yellow-100/80 to-yellow-50/60 border-yellow-300 text-yellow-800 hover:shadow-md"
                                            : isToday
                                                ? "bg-gradient-to-br from-blue-100/80 to-blue-50/60 border-blue-300 text-blue-700 font-bold hover:shadow-md"
                                                : "bg-white/50 border-gray-200 hover:bg-gray-50/60 text-gray-700"}`}
                                >
                                    <span className="text-base sm:text-lg">{day}</span>
                                    {holiday && (
                                        <div className="absolute bottom-1 text-[10px] sm:text-xs text-yellow-700 font-medium w-full truncate px-1">
                                            🎉 {holiday.title}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
                {/* Holiday List */}
                <div className="mt-12">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        {/* <ConfirmBox isOpen={showConfirm} title="Are you sure you want to delete this calender event?" message="If you delete it. It will be permanent delete on student and teacher panel!" onConfirm={()=>handleDelete()} onCancel={()=>setShowConfirm(false)}/> */}

                        🌸 Holiday Summary
                    </h3>
                    {holidays.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">No holidays this month 🎯</p>
                    ) : (
                        <ul className="space-y-3">
                            {holidays.map((holiday) => (
                                <li
                                    key={holiday._id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/60 border border-yellow-200 shadow-sm hover:shadow-md p-4 rounded-2xl transition-all"
                                >
                                    <div>
                                        <p className="text-yellow-700 font-semibold text-sm">
                                            {holiday.title}
                                        </p>
                                        <p className="text-gray-600 text-xs">{holiday.description}</p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2 sm:mt-0 text-sm">
                                        <span className="text-gray-700">
                                            {holiday.date} ({holiday.day})
                                        </span>
                                        <button
                                            onClick={() => handleDateClick(Number(holiday.date.split("-")[2]))}
                                            className="text-blue-500 cursor-pointer hover:text-blue-700"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            //   onClick={() => handleDelete(holiday._id)}
                                            onClick={() => {
                                                setShowConfirm(true);
                                                setDeleteId(holiday._id);
                                            }}
                                            className="text-red-500 cursor-pointer hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 animate-fadeIn">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 w-[90%] sm:w-[450px] border border-gray-200 relative transform transition-all scale-100 hover:scale-[1.02]">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
                            {editId ? "Update Holiday" : "Add Holiday"} –{" "}
                            <span className="text-yellow-600">{selectedDate?.iso}</span>
                        </h3>
                        {/* <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onKeyDown={(e) => {
                                        // Allow control keys (Backspace, Tab, Delete, Arrow keys)
                                        if (
                                            e.key === "Backspace" ||
                                            e.key === "Tab" ||
                                            e.key === "Delete" ||
                                            e.key === "ArrowLeft" ||
                                            e.key === "ArrowRight"
                                        ) {
                                            return;
                                        }

                                        // Block anything that is NOT an alphabet or space
                                        if (!/^[a-zA-Z.\s]$/.test(e.key)) {
                                            e.preventDefault();
                                            setNoteError("Only alphabets are allowed");
                                        } else {
                                            setNoteError(""); // Clear error if valid key
                                        }
                                    }}

                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, title: e.target.value }))
                                    }
                                    placeholder="e.g. Independence Day"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, description: e.target.value }))
                                    }
                                    onKeyDown={(e) => {
                                        // Allow control keys (Backspace, Tab, Delete, Arrow keys)
                                        if (
                                            e.key === "Backspace" ||
                                            e.key === "Tab" ||
                                            e.key === "Delete" ||
                                            e.key === "ArrowLeft" ||
                                            e.key === "ArrowRight"
                                        ) {
                                            return;
                                        }

                                        // Block anything that is NOT an alphabet or space
                                        if (!/^[a-zA-Z.\s]$/.test(e.key)) {
                                            e.preventDefault();
                                            setNoteError("Only alphabets are allowed");
                                        } else {
                                            setNoteError(""); // Clear error if valid key
                                        }
                                    }}

                                    placeholder="e.g. National celebration day."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                {editId && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(editId)}
                                        className="px-4 py-2 bg-red-500 cursor-pointer text-white rounded-lg hover:bg-red-600 flex items-center gap-1"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={addOrUpdateMutation.isLoading}
                                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-400 text-white cursor-pointer rounded-lg flex items-center gap-1 hover:opacity-90"
                                >
                                    {addOrUpdateMutation.isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <PlusCircle className="w-4 h-4" />
                                    )}
                                    {editId ? (addOrUpdateMutation.isPending ? "Update" : "Updating") : (addOrUpdateMutation.isPending ? "Saving" : "Save")}
                                </button>
                            </div>
                        </form> */}
                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Holiday Dropdown + Input */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Holiday Title <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <input
                                        type="text"
                                        list="holidayList"
                                        value={form.title}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, title: e.target.value }))
                                        }
                                        placeholder="Select or type holiday name"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                                    />

                                    {/* Dropdown Options */}
                                    <datalist id="holidayList">
                                        {predefinedHolidays.map((holiday, index) => (
                                            <option key={index} value={holiday} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            {/* Description Field */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, description: e.target.value }))
                                    }
                                    placeholder="e.g. National celebration day."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3">
                                {editId && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(editId)}
                                        className="px-4 py-2 bg-red-500 cursor-pointer text-white rounded-lg hover:bg-red-600 flex items-center gap-1"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={addOrUpdateMutation.isLoading}
                                    className="px-4 py-2 bg-[image:var(--gradient-primary)]  cursor-pointer rounded-lg flex items-center gap-1 hover:opacity-90"
                                >
                                    {addOrUpdateMutation.isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <PlusCircle className="w-4 h-4" />
                                    )}
                                    {editId
                                        ? addOrUpdateMutation.isPending
                                            ? "Update"
                                            : "Updating"
                                        : addOrUpdateMutation.isPending
                                            ? "Saving"
                                            : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/20  z-50">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 w-[90%] sm:w-[400px] border border-gray-200 relative animate-fadeIn">

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center mb-3">
                            Are you sure you want to delete this holiday?
                        </h3>

                        {/* Message */}
                        <p className="text-sm text-gray-600 text-center mb-6">
                            Once deleted, this holiday will be permanently removed from all panels.
                        </p>

                        {/* Buttons */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium transition cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    handleDelete(deletedId);
                                    setShowConfirm(false);
                                }}
                                disabled={deleteMutation.isLoading}
                                className={`px-4 py-2 rounded-lg font-medium text-white cursor-pointer flex items-center gap-2 transition ${deleteMutation.isLoading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 shadow-md"
                                    }`}
                            >
                                {deleteMutation.isLoading ? (
                                    <>
                                        <svg
                                            className="w-4 h-4 animate-spin text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            ></path>
                                        </svg>
                                        Deleting...
                                    </>
                                ) : (
                                    "Confirm Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

