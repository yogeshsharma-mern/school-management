
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReusableTable from "../components/Table";
import Modal from "../components/Modal";
import InputField from "../components/InputField";
import { apiGet, apiPost, apiPut, apiDelete } from "../api/apiFetch";
import apiPath from "../api/apiPath";
import useDebounce from "../hooks/useDebounce";
import toast from "react-hot-toast";
import Loader from "../components/Loading";
import { RiAddBoxFill, RiImageEditLine } from "react-icons/ri";
import { FaRegEye } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import ToggleButton from "../components/ToggleButton";
import ConfirmBox from "../components/ConfirmBox";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { FaFileExport } from "react-icons/fa";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";
import { Typography } from "@mui/material";
import { Box } from "@mui/material";
import { useEffect } from "react";

export default function Subject() {
    const queryClient = useQueryClient();

    // Table state
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [columnFilters, setColumnFilters] = useState([]);
    const [viewModal, setViewModal] = useState(false);
    const [viewData, setViewData] = useState([]);
    
    // FIX 1: Initialize as null instead of '1st'
    const [selectedClassId, setSelectedClassId] = useState(null);
    
    const collapsed = useSelector((state) => state.ui.sidebarCollapsed);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({ 
        name: "", 
        code: "", 
        description: "", 
        credits: "" 
    });
    const [errors, setErrors] = useState({});
    const debouncedSearch = useDebounce(globalFilter, 500);

    // Confirmbox state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Fetch classes for dropdown
    const { 
        data: classesData, 
        isLoading: classesLoading, 
        isError: classesError 
    } = useQuery({
        queryKey: ["classes"],
        queryFn: () => apiGet(`${apiPath.classesByNames}` || "/api/admins/classes"),
    });

// FIX 2: Process classes data properly (SAFE & STABLE)
const classes = useMemo(() => {
  if (!classesData?.results) return [];

  const raw = classesData.results;

  // Case 1: Backend already returns array
  if (Array.isArray(raw)) {
    return raw.filter((c) => typeof c === "string");
  }

  // Case 2: Backend returns object → convert to array
  if (typeof raw === "object") {
    return Object.values(raw).filter((c) => typeof c === "string");
  }

  return [];
}, [classesData]);


//     useEffect(() => {
//     return () => {
//         // Invalidate all queries
//         queryClient.invalidateQueries();
        
//         // Optional: Cancel any ongoing requests
//         queryClient.cancelQueries();
//     };
// }, [queryClient]);

    // FIX 3: Set initial class when classes load
    useEffect(() => {
        if (classes.length > 0 && !selectedClassId) {
            setSelectedClassId(classes[0]); // Set to first available class
        }
    }, [classes, selectedClassId]);

    // Fetch subjects for selected class
    const { 
        data: subjectsData, 
        isLoading: subjectsLoading, 
        isFetching: subjectsFetching, 
        error: subjectsError 
    } = useQuery({
        queryKey: [
            "subjects",
            selectedClassId, // This triggers the query when selectedClassId changes
            pagination.pageIndex,
            pagination.pageSize,
            debouncedSearch,
        ],
        // FIX 4: Only enable the query when a class is selected
        enabled: !!selectedClassId,
        queryFn: () =>
            apiGet(`${apiPath.getSubjectsByClassname}/${selectedClassId}`, {
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                name: debouncedSearch,
            }),
    });

    console.log("Selected Class:", selectedClassId);
    console.log("Subjects Data:", subjectsData);
    console.log("Available Classes:", classes);

    const toggleMutation = useMutation({
        mutationFn: ({ id, status }) =>
            apiPut(`${apiPath.ToggleSubject}/${id}`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
            toast.success("Status updated successfully");
        },
    });

    // Mutation for create/update subject
    const subjectMutation = useMutation({
        mutationFn: (subjectObj) => {
            if (editingClass) {
                return apiPut(`${apiPath.updateSubject}/${editingClass._id}`, subjectObj);
            }
            return apiPost(apiPath.createSubject, subjectObj);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
            if (editingClass) {
                toast.success(data.message || "Subject updated successfully 🎉");
            } else {
                toast.success(data.message || "Subject created successfully 🎉");
            }
            setIsModalOpen(false);
            setEditingClass(null);
            setFormData({ name: "", code: "", description: "", credits: "" });
        },
        onError: (error) => {
            const errorMessage =
                error?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        },
    });

    // Delete subject mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => apiDelete(`${apiPath.deleteSubject}/${id}`),
        onSuccess: (data) => {
            toast.success(data.message || "Subject deleted successfully 🗑️");
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
        },
        onError: (error) => {
            const errorMessage =
                error?.response?.data?.message || "Failed to delete subject. Please try again ❌";
            toast.error(errorMessage);
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        switch (name) {
            case "name":
                newValue = value.replace(/[^A-Za-z\s,]/g, "");
                break;
            case "code":
                newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                break;
            default:
                newValue = value;
        }

        setFormData((prev) => ({ ...prev, [name]: newValue }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };
    const noSubjectsFound =
  selectedClassId &&
  !subjectsLoading &&
  !subjectsFetching &&
  subjectsData &&
  Array.isArray(subjectsData.results) &&
  subjectsData.results.length === 0;

 const handleExportCSV = () => {
        try {
            const docs = subjectsData?.results || [];



            if (!docs.length) {
                toast.error("No data to export");
                return;
            }

            const rows = docs.map((subject, idx) => {
                const formatDate = (dateStr) => {
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
                
                const statusNorm = subject?.status === true || subject?.status === "active" 
                    ? "Active" 
                    : "Inactive";

                return {
                    "S No.": idx + 1,
                    "Subject Name": subject?.name || "",
                    "Subject Code": subject?.code || "",
                    "Description": subject?.description || "",
                    "Status": statusNorm,
                    "Created At": formatDate(subject?.createdAt),
                    "Updated At": formatDate(subject?.updatedAt),
                };
            });

            const csv = Papa.unparse(rows, {
                quotes: false,
                delimiter: ",",
                header: true,
                newline: "\r\n",
            });

            const stamp = new Date().toISOString().replace(/[:]/g, "-").split(".")[0];
            const filename = `Subjects_${selectedClassId || 'All'}_${stamp}.csv`;

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            saveAs(blob, filename);

            toast.success("CSV exported successfully ✅");
        } catch (err) {
            console.error(err);
            toast.error("Failed to export CSV ❌");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.name) newErrors.name = "Subject name is required";
        if (!formData.code) newErrors.code = "Code is required";
        if (!/^[A-Z]{2,4}[0-9]{2,3}$/.test(formData.code)) {
            newErrors.code = "Invalid subject code format (example: PHY101)";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        subjectMutation.mutate({
            name: formData.name.trim(),
            code: formData.code.trim(),
            description: formData.description.trim(),
            className: selectedClassId,
        });
    };

    const columns = useMemo(
        () => [
            {
                header: "S No.",
                cell: ({ row }) => row.index + 1,
            },
            { accessorKey: "name", header: "Subject Name" },
            { accessorKey: "code", header: "Code" },
            {
                header: "Status",
                accessorKey: "status",
                cell: ({ row }) => {
                    const subject = row.original;
                    
                    const handleToggle = () => {
                        toggleMutation.mutate({
                            id: subject._id,
                            status: subject.status === "active" ? "inactive" : "active",
                        });
                    };

                    return (
                        <div className="flex items-center gap-2">
                            <ToggleButton
                                isActive={subject.status === "active"}
                                onToggle={handleToggle}
                                disabled={toggleMutation.isLoading}
                            />
                        </div>
                    );
                },
            },
            {
                accessorKey: "description",
                header: "Description",
                cell: ({ getValue }) =>
                    getValue()
                        ? getValue().length > 50
                            ? getValue().substring(0, 50) + "..."
                            : getValue()
                        : "N/A",
            },
            {
                header: "Actions",
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const subject = row.original;
                                setEditingClass(subject);
                                setFormData({
                                    name: subject.name || "",
                                    code: subject.code || "",
                                    description: subject.description || "",
                                });
                                setIsModalOpen(true);
                            }}
                            className="text-yellow-400 text-[20px] cursor-pointer hover:text-yellow-500"
                        >
                            <RiImageEditLine />
                        </button>
                        <button 
                            onClick={() => {
                                setViewModal(true);
                                setViewData(row.original);
                            }}
                            className="text-green-600 cursor-pointer text-[20px] hover:text-green-700"
                        >
                            <FaRegEye />
                        </button>
                        <button
                            onClick={() => {
                                setDeleteId(row.original._id);
                                setConfirmOpen(true);
                            }}
                        >
                            <AiFillDelete className="text-red-500 text-[20px] cursor-pointer" />
                        </button>
                    </div>
                ),
            },
        ],
        [toggleMutation, deleteMutation]
    );

    const tableData = useMemo(() => subjectsData?.results || [], [subjectsData]);
    const totalPages = subjectsData?.totalPages || 1;

    // Loading state for classes
    if (classesLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader size={40} />
            </div>
        );
    }

    // Error state for classes
    if (classesError) {
        return (
            <div className="p-6 text-red-500">
                Failed to load classes. Please try again.
            </div>
        );
    }
      if (subjectsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-opacity-70 z-[99999]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }



    return (
        <div>
            <Modal 
                isOpen={viewModal} 
                title="Subject Details" 
                onClose={() => setViewModal(false)}
            >
                {viewData && (
                    <div className="space-y-2">
                        <p><strong>Subject Name:</strong> {viewData.name}</p>
                        <p><strong>Code:</strong> {viewData.code}</p>
                        <p><strong>Description:</strong> {viewData.description}</p>
                        <p><strong>Status:</strong> {viewData.status || "N/A"}</p>
                    </div>
                )}
            </Modal>

            <div className="flex p-6 justify-between items-center cursor-pointer mb-4">
                <h1 className="text-2xl font-bold">Subjects</h1>
                <div className="flex gap-2 text-[12px] md:text-[14px] items-center">
                    <button
                        onClick={handleExportCSV}
                        disabled={!selectedClassId || !subjectsData?.results?.length}
                        className="px-4 flex gap-1 items-center py-2 bg-[image:var(--gradient-primary)] rounded-lg cursor-pointer hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaFileExport />
                        Export CSV
                    </button>
                    <button
                        onClick={() => {
                            setEditingClass(null);
                            setFormData({ name: "", code: "", description: "" });
                            setIsModalOpen(true);
                        }}
                        disabled={!selectedClassId}
                        className="px-4 flex items-center gap-1 py-2 bg-[image:var(--gradient-primary)] cursor-pointer rounded-lg hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RiAddBoxFill />
                        Add Subject
                    </button>
                </div>
            </div>

            {/* Class Selector */}
            <div className="ml-4 mb-4">
                <Box>
                    <Typography variant="subtitle2" className="text-gray-500 mb-1">
                        Select Class
                    </Typography>
                    <select
                        className="border border-indigo-300 rounded-xl px-4 py-2 w-64"
                        value={selectedClassId || "1st"}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                        <option value="">-- Select a class --</option>
                        {classes.map((className, index) => (
                            <option key={index} value={className}>
                                {String (className)}
                            </option>
                        ))}
                    </select>
                </Box>
            </div>

            {/* FIX 5: Show message when no class is selected */}
            {/* {!selectedClassId ? (
                <div className="p-6 text-center text-gray-500">
                    Please select a class to view subjects
                </div>
            ) : (
                <div
                    className={`
                        overflow-x-auto transition-all duration-300 w-[98vw]
                        ${collapsed ? "md:w-[95vw]" : "md:w-[80vw]"}
                    `}
                >
                    <ReusableTable
                        columns={columns}
                        data={tableData}
                        paginationState={pagination}
                        setPaginationState={setPagination}
                        sortingState={sorting}
                        setSortingState={setSorting}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        columnFilters={columnFilters}
                        setColumnFilters={setColumnFilters}
                        totalCount={totalPages || 1}
                        tablePlaceholder="Search subjects..."
                        error={subjectsError}
                        isError={!!subjectsError}
                        fetching={subjectsFetching}
                        loading={subjectsLoading}
                    />
                </div>
            )} */}
            {!selectedClassId ? (
  <div className="p-6 text-center text-gray-500">
    Please select a class to view subjects
  </div>
) : noSubjectsFound ? (
  <div
    className="ml-6"
  >
    <p className="text-gray-500 text-lg font-medium">
      ❌ No subject found for this class
    </p>
  </div>
) : (
  <div
    className={`
      overflow-x-auto transition-all duration-300 w-[98vw]
      ${collapsed ? "md:w-[95vw]" : "md:w-[80vw]"}
    `}
  >
    <ReusableTable
      columns={columns}
      data={tableData}
      paginationState={pagination}
      setPaginationState={setPagination}
      sortingState={sorting}
      setSortingState={setSorting}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
      columnFilters={columnFilters}
      setColumnFilters={setColumnFilters}
      totalCount={totalPages || 1}
      tablePlaceholder="Search subjects..."
      error={subjectsError}
      isError={!!subjectsError}
      fetching={subjectsFetching}
      loading={subjectsLoading}
    />
  </div>
)}


            {/* Confirm Delete Modal */}
            <ConfirmBox 
                message="Are you sure you want to delete this subject? This action cannot be undone." 
                isOpen={confirmOpen} 
                onCancel={() => setConfirmOpen(false)}
                onConfirm={() => {
                    if (deleteId) {
                        deleteMutation.mutate(deleteId);
                        setConfirmOpen(false);
                    }
                }}
                loading={deleteMutation.isLoading} 
            />

            {/* Add/Edit Subject Modal */}
            <Modal
                isOpen={isModalOpen}
                title={editingClass ? "Edit Subject" : "Add Subject"}
                onClose={() => setIsModalOpen(false)}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject Name <span className="text-red-500">*</span>
                        </label>
                        <InputField
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Physics, Math, Chemistry"
                            error={errors.name}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Code <span className="text-red-500">*</span>
                        </label>
                        <InputField
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="PHY101"
                            error={errors.code}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Format: 2-4 uppercase letters followed by 2-3 numbers (e.g., MATH101, PHY101)
                        </p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <InputField
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Subject description..."
                            error={errors.description}
                        />
                    </div>
                    
                    {selectedClassId && (
                        <div className="text-sm text-gray-600">
                            This subject will be added to: <strong>{selectedClassId}</strong>
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        disabled={subjectMutation.isLoading || !selectedClassId}
                        className="w-full cursor-pointer bg-[image:var(--gradient-primary)] text-white py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {subjectMutation.isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader size={20} />
                                <span>{editingClass ? "Updating..." : "Creating..."}</span>
                            </div>
                        ) : (
                            editingClass ? "Update Subject" : "Add Subject"
                        )}
                    </button>
                </form>
            </Modal>
        </div>
    );
}