// import React, { useState, useMemo } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import ReusableTable from "../components/Table";
// import Modal from "../components/Modal";
// import InputField from "../components/InputField";
// import { apiGet, apiPost, apiPut, apiDelete } from "../api/apiFetch";
// import apiPath from "../api/apiPath";
// import useDebounce from "../hooks/useDebounce";
// import toast from "react-hot-toast";
// import Loader from "../components/Loading";
// import { RiImageEditLine } from "react-icons/ri";
// import { FaRegEye } from "react-icons/fa";
// import { AiFillDelete } from "react-icons/ai";
// import ToggleButton from "../components/ToggleButton";
// import ConfirmBox from "../components/ConfirmBox";
// import Papa from "papaparse";
// import { saveAs } from "file-saver";
// import { FaFileExport } from "react-icons/fa";
// import * as XLSX from "xlsx";
// import { useSelector } from "react-redux";
// import { Typography } from "@mui/material";
// import { Box } from "@mui/material";
// import { useEffect } from "react";


// // import toast from "react-hot-toast";




// export default function Subject() {
//     const queryClient = useQueryClient();

//     // Table state
//     const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
//     const [sorting, setSorting] = useState([]);
//     const [globalFilter, setGlobalFilter] = useState("");
//     const [columnFilters, setColumnFilters] = useState([]);
//     const [viewModal, setViewModal] = useState(false);
//     const [viewData, setViewData] = useState([]);
//     const [selectedClassId, setSelectedClassId] = useState('1st');
//     console.log("classid", selectedClassId);
//     const collapsed = useSelector((state) => state.ui.sidebarCollapsed);


//     // Modal state
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingClass, setEditingClass] = useState(null);
//     const [formData, setFormData] = useState({ name: "", code: "", description: "", credits: "" });
//     // console.log("formdata",formData);
//     const [errors, setErrors] = useState({});
//     const debouncedSearch = useDebounce(globalFilter, 500);

//     //confirmbox state
//     const [confirmOpen, setConfirmOpen] = useState(false);
//     const [deleteId, setDeleteId] = useState(null);


//     const classesQuery = 
//     useQuery({
//         queryKey: ["classes"],
//         queryFn: () => apiGet(`${apiPath.classesByNames}` || "/api/admins/classes"),
//     });
//     const classes = useMemo(() => {
//         const raw = classesQuery?.data?.results || {};
//         return Object.values(raw);
//     }, [classesQuery?.data]);

//     console.log(
//         "classquery", classes
//     )
// useEffect(() => {
//   if (classes.length > 0 && selectedClassId === null) {
//     setSelectedClassId(classes[0] || '1st');
//   }
// }, [classes, selectedClassId]);

//     console.log(">>>>>>>>>>",classes);
//     console.log("selectedclassidfddd....",selectedClassId);


//     // Fetch classes
//     // const { data: classesData, isLoading, isFetching, error, isError } = useQuery({
//     //     queryKey: ["subjects",selectedClassId, pagination.pageIndex, pagination.pageSize, debouncedSearch],
//     //     enabled: !!selectedClassId, // only run query if class is selected
//     //     queryFn: () => apiGet(`${apiPath.getSubjectsByClassname}/${selectedClassId}`, {
//     //         page: pagination.pageIndex + 1,  // backend usually 1-indexed
//     //         limit: pagination.pageSize,
//     //         name: debouncedSearch,
//     //     }),
//     // });
//     const { data: classesData, isLoading, isFetching, error } = useQuery({
//         queryKey: [
//             "subjects",
//             selectedClassId,
//             pagination.pageIndex,
//             pagination.pageSize,
//             debouncedSearch,
//         ],
//         enabled: !!selectedClassId,   // ✅ FIX
//         queryFn: () =>
//             apiGet(`${apiPath.getSubjectsByClassname}/${selectedClassId}`, {
//                 page: pagination.pageIndex + 1,
//                 limit: pagination.pageSize,
//                 name: debouncedSearch,
//             }),
//     });

//     console.log("subjectdata", classesData);
    
//     // const toggleMutation = useMutation({
//     //     mutationFn: (newStatus) =>
//     //         apiPut(`${apiPath.ToggleSubject}/${subject._id}`, { status: newStatus }),
//     //     onSuccess: (data) => {
//     //         toast.success(data.message || "Status updated successfully 🎉");
//     //         queryClient.invalidateQueries({ queryKey: ["subjects"] });

//     //     },
//     //     onError: (err) => {
//     //         toast.error(err?.response?.data?.message || "Failed to update status ❌");
//     //     },
//     // });
//     const toggleMutation = useMutation({
//         mutationFn: ({ id, status }) =>
//             apiPut(`${apiPath.ToggleSubject}/${id}`, { status }),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ["subjects"] });
//             toast.success("Status updated successfully");
//         },
//     });

//     // Mutation for create/update class
//     const classMutation = useMutation({
//         mutationFn: (subjectObj) => {
//             if (editingClass) {
//                 return apiPut(`${apiPath.updateSubject}/${editingClass._id}`, subjectObj);
//             }
//             return apiPost(apiPath.createSubject, subjectObj);
//         },
//         onSuccess: (data) => {
//             queryClient.invalidateQueries({ queryKey: ["subjects"] });
//             // console.log("data", data);
//             if (editingClass) {
//                 toast.success(data.message || "Subject updated successfully 🎉");
//             } else {
//                 toast.success(data.message || "Subject created successfully 🎉");
//             }

//             setIsModalOpen(false);
//             setEditingClass(null);
//             setFormData({ name: "", code: "", description: "" });
//         },
//         onError: (error) => {
//             // console.log("error", error);
//             // Show server error message if available
//             const errorMessage =
//                 error?.response?.data?.message || "Something went wrong. Please try again.";
//             toast.error(errorMessage);
//         },
//     });



//     // Delete class mutation
//     const deleteMutation = useMutation({
//         mutationFn: (id) => apiDelete(`${apiPath.deleteSubject}/${id}`),
//         onSuccess: (data) => {
//             toast.success(data.message || "Subject deleted successfully 🗑️");
//             queryClient.invalidateQueries({ queryKey: ["subjects"] });
//         },
//         onError: (error) => {
//             const errorMessage =
//                 error?.response?.data?.message || "Failed to delete subject. Please try again ❌";
//             toast.error(errorMessage);
//         },
//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         let newValue = value;

//         switch (name) {
//             case "name":
//                 // Only letters, spaces, commas
//                 newValue = value.replace(/[^A-Za-z\s,]/g, "");
//                 break;

//             case "code":
//                 // Only letters and numbers
//                 newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
//                 break;


//             default:
//                 newValue = value;
//         }

//         setFormData((prev) => ({ ...prev, [name]: newValue }));
//         setErrors((prev) => ({ ...prev, [name]: "" }));
//     };


//     const handleExportCSV = () => {
//         try {
//             const docs = classesData?.results || [];

//             if (!docs.length) {
//                 toast.error("No data to export");
//                 return;
//             }

//             // 👉 Map your table rows to a flat CSV-friendly shape
//             const rows = docs.map((cls, idx) => {
//                 const formatDate = (dateStr) => {
//                     if (!dateStr) return "N/A";
//                     const date = new Date(dateStr);
//                     return date.toLocaleString("en-IN", {
//                         day: "2-digit",
//                         month: "short",
//                         year: "numeric",
//                         hour: "2-digit",
//                         minute: "2-digit",
//                     });
//                 };
//                 // status ko normalize: true/'active' -> Active else Inactive
//                 const statusNorm =
//                     cls?.status === true || cls?.status === "active" ? "Active" : "Inactive";

//                 // subjects: string[] ya null
//                 //   const subjects =
//                 //     Array.isArray(cls?.classTeacher?.subjectsHandled) ? cls?.classTeacher?.subjectsHandled?.map((c)=>c?.subjectName).join(", ") : "N/A";

//                 return {
//                     "S No.": idx + 1,
//                     "Subject Name": cls?.name || "",
//                     Description: cls?.description || "",
//                     code: cls?.code ?? 0,
//                     Status: statusNorm,
//                     "Created At": formatDate(cls?.createdAt),
//                     "Updated At": formatDate(cls?.updatedAt),

//                 };
//             });

//             // 👉 Convert JSON → CSV
//             const csv = Papa.unparse(rows, {
//                 quotes: false,        // har field ke around quotes nahi
//                 delimiter: ",",       // default comma
//                 header: true,         // header row include
//                 newline: "\r\n",      // windows/mac friendly new lines
//             });

//             // 👉 File name with date
//             const stamp = new Date().toISOString().replace(/[:]/g, "-").split(".")[0]; // 2025-11-10T12-34-56
//             const filename = `Subjects_${stamp}.csv`;

//             // 👉 Trigger download
//             const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
//             saveAs(blob, filename);

//             toast.success("CSV exported successfully ✅");
//         } catch (err) {
//             console.error(err);
//             toast.error("Failed to export CSV ❌");
//         }
//     };




//     const handleSubmit = (e) => {
//         e.preventDefault();
//         const newErrors = {};
//         // const validClasses = [
//         //   "Prep", // or "Pre-primary"
//         //   "1st", "2nd", "3rd", "4th", "5th", "6th",
//         //   "7th", "8th", "9th", "10th", "11th", "12th"
//         // ];
//         // Class name validation (only letters, numbers, spaces, max 20 chars)
//         // if (!formData.name) {
//         //   newErrors.name = "Class name is required";
//         // } else if (!validClasses.includes(formData.name.trim())) {
//         //   newErrors.name = "Invalid class name. Must be Prep or 1st to 12th";
//         // }

//         // Section validation (must be A, B, C, or D)
//         // if (!formData.section) {
//         //   newErrors.section = "Section is required";
//         // } else if (!/^[A-D]$/.test(formData.section)) {
//         //   newErrors.section = "Section must be A, B, C, or D (capital letter)";
//         // }

//         // if (Object.keys(newErrors).length > 0) {
//         //   setErrors(newErrors);
//         //   return;
//         // }
//         if (!formData.name) newErrors.name = "Subject name is required";
//         if (!formData.code) newErrors.code = "Code is required";
//         if (!/^[A-Z]{2,4}[0-9]{2,3}$/.test(formData.code)) {
//             newErrors.code = "Invalid subject code format (example: PHY101)";
//         }

//         if (Object.keys(newErrors).length > 0) {
//             setErrors(newErrors);
//             return;
//         }

//         classMutation.mutate({
//             name: formData.name.trim(),
//             code: formData.code.trim(),
//             description: formData.description.trim(),
//             className: selectedClassId,
//             // subjects: formData.subjects.split(",").map((s) => s.trim()),
//         });
//     };


//     //   {
//     //                 "_id": "68d4f6f3f969f85ab73c9a32",
//     //                 "name": "12th",
//     //                 "section": "A",
//     //                 "studentCount": 10,
//     //                 "classIdentifier": "9b1deb4d-3b7d-4c2e-9f3e-2d3f1a2b4c5d",
//     //                 "classTeacher": {
//     //                     "_id": "68d6465b5982bd19f22c4a51",
//     //                     "name": "Ravi Kumar",
//     //                     "email": "8833ashusoni@gmail.com",
//     //                     "department": "Mathematics",
//     //                     "specialization": "Algebra"
//     //                 }
//     //   {
//     //                 "_id": "68da554b2c4e5098395dcf4b",
//     //                 "name": "Physics",
//     //                 "code": "PHY101",
//     //                 "description": "Fundamentals of classical and modern physics including mechanics, electricity, and magnetism.",
//     //                 "credits": 4,
//     //                 "createdAt": "2025-09-29T09:45:47.041Z",
//     //                 "updatedAt": "2025-09-29T09:45:47.041Z",
//     //                 "__v": 0
//     //             }
//     const columns = useMemo(
//         () => [
//             {
//                 header: "S No.",
//                 cell: ({ row }) => row.index + 1,
//             },
//             { accessorKey: "name", header: "Subject Name" },
//             { accessorKey: "code", header: "Code" },
//             // { accessorKey: "credits", header: "Credits" },
//             {
//                 header: "Status",
//                 accessorKey: "isActive",
//                 cell: ({ row }) => {
//                     const subject = row.original;
//                     // console.log("subject", subject);
//                     // Mutation for toggling active/inactive

//                     // const handleToggle = () => toggleMutation.mutate(!subject.isActive);
//                const handleToggle = () => {
//   toggleMutation.mutate({
//     id: subject._id,
//     status: subject.status === "active" ? "inactive" : "active",
//   });
// };


//                     return (
//                         <div className="flex items-center gap-2">
//                             <ToggleButton
//                                 isActive={subject.status}
//                                 onToggle={handleToggle}
//                                 disabled={toggleMutation.isLoading}
//                             />
//                             {/* <span
//           className={`text-sm font-medium ${
//             subject.status ==="active"? "text-green-600" : "text-red-600"
//           }`}
//         >
//           {subject.status==="active" ? "Active" : "Inactive"}
//         </span> */}
//                         </div>
//                     );
//                 },
//             },

//             {
//                 accessorKey: "description",
//                 header: "Description",
//                 cell: ({ getValue }) =>
//                     getValue()
//                         ? getValue().length > 50
//                             ? getValue().substring(0, 50) + "..." // truncate long text
//                             : getValue()
//                         : "N/A",
//             },
//             {
//                 header: "Actions",
//                 cell: ({ row }) => (
//                     <div className="flex gap-2">
//                         <button
//                             onClick={() => {
//                                 const course = row.original;
//                                 setEditingClass(course);
//                                 setFormData({
//                                     name: course.name || "",
//                                     code: course.code || "",
//                                     credits: course.credits?.toString() || "",
//                                     description: course.description || "",
//                                 });
//                                 setIsModalOpen(true);
//                             }}
//                             className=" text-yellow-400 text-[20px] cursor-pointer  hover:text-yellow-500"
//                         >
//                             <RiImageEditLine />
//                         </button>
//                         <button onClick={() => {
//                             setViewModal(true),
//                                 setViewData(row.original)
//                         }
//                         } className=" text-green-600 cursor-pointer  text-[20px] hover:text-green-700"
//                         >
//                             <FaRegEye />
//                         </button>
//                         {/* Uncomment if you want delete button */}
//                         {/* <button
//                             onClick={() => deleteMutation.mutate(row.original._id)}
//                         // className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
//                         >
//                             <AiFillDelete className="text-red-500 text-[20px] cursor-pointer" />
//                         </button> */}
//                         <button
//                             onClick={() => {
//                                 setDeleteId(row.original._id);
//                                 setConfirmOpen(true);
//                             }}
//                         // className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
//                         >
//                             <AiFillDelete className="text-red-500 text-[20px] cursor-pointer" />
//                         </button>
//                     </div>
//                 ),
//             },
//         ],
//         [deleteMutation]
//     );



//     const tableData = useMemo(() => classesData?.results || [], [classesData]);
//     // console.log("classdata", classesData)

// const totalPages = classesData?.totalPages || 1;


//     // ⛔ show loader while classes are loading or class not selected
// if (classesQuery.isLoading) {
//   return (
//     <div className="h-[60vh] flex items-center justify-center">
//       <Loader size={40} />
//     </div>
//   );
// }


//     // ⛔ show error instead of blank screen
//     // if (error) {
//     //     return (
//     //         <div className="p-6 text-red-500">
//     //             Failed to load subjects. Please try again.
//     //         </div>
//     //     );
//     // }



//     return (
//         <div>
//             <Modal isOpen={viewModal} title="Subject Details" onClose={() => {
//                 setViewModal(false)
//             }
//             } >
//                 {
//                     viewData &&
//                     (
//                         <div className="space-y-2">
//                             <p><strong>Subject Name:</strong> {viewData.name}</p>
//                             <p><strong>Code:</strong> {viewData.code}</p>
//                             {/* <p><strong>Credits:</strong> {viewData.credits}</p> */}
//                             <p><strong>Description:</strong> {viewData.description}</p>
//                         </div>
//                     )
//                 }
//             </Modal>
//             <div className="flex p-6 justify-between items-center cursor-pointer mb-4">
//                 <h1 className="text-2xl font-bold">Subjects</h1>

//                 <div className="flex gap-2 text-[12px] md:text-[14px] items-center">
//                     <button
//                         onClick={handleExportCSV}
//                         className="px-4 flex gap-1 items-center py-2 px-4 py-2 bg-[image:var(--gradient-primary)]  rounded-lg cursor-pointer hover:bg-blue-700 transition"
//                     >
//                         <FaFileExport />

//                         Export CSV
//                     </button>
//                     <button
//                         onClick={() => {
//                             setEditingClass(null);
//                             setFormData({ name: "", section: "", subjects: "" });
//                             setIsModalOpen(true);
//                         }}
//                         className="px-4 py-2 bg-[image:var(--gradient-primary)] cursor-pointer  rounded-lg hover:bg-yellow-500 cursor-pointer transition"
//                     >
//                         Add Subject
//                     </button>
//                 </div>

//             </div>
//             <div className="ml-4">
//                 <Box>
//                     <Typography variant="subtitle2" className="text-gray-500">
//                         Select Class
//                     </Typography>
//                     <select
//                         className=" border border-indigo-300 rounded-xl px-4 py-2"
//                         value={selectedClassId || ""}
//                         onChange={(e) => setSelectedClassId(e.target.value)}
//                     >
//                         {Object.entries(classes).map(([key, value]) => (
//                             <option key={key} value={value}>
//                                 {value}
//                             </option>
//                         ))}
//                     </select>
//                 </Box>
//             </div>
//             <div
//                 className={`
//   overflow-x-auto transition-all duration-300 w-[98vw]
//   ${collapsed ? "md:w-[95vw]" : "md:w-[80vw]"}
// `}

//             >

//                 <ReusableTable
//                     columns={columns}
//                     data={tableData}
//                     paginationState={pagination}
//                     setPaginationState={setPagination}
//                     sortingState={sorting}
//                     setSortingState={setSorting}
//                     globalFilter={globalFilter}
//                     setGlobalFilter={setGlobalFilter}
//                     columnFilters={columnFilters}
//                     setColumnFilters={setColumnFilters}
//                     totalCount={totalPages || 1}
//                     tablePlaceholder="Search subjects..."
//                     error={error}
//                     isError={error}
//                     fetching={isFetching}
//                     loading={isLoading}


//                 />

//             </div>
//             {/* Modal for create/edit */}
//             <ConfirmBox message="Are you sure you want to delete this subject? This action cannot be undone." isOpen={confirmOpen} onCancel={() => {
//                 setConfirmOpen(false)
//             }
//             } onConfirm={() => {
//                 if (deleteId) {
//                     deleteMutation.mutate(deleteId);
//                     setConfirmOpen(false);
//                 }
//             }}
//                 loading={deleteMutation.isLoading} />
//             <Modal
//                 isOpen={isModalOpen}
//                 title={editingClass ? "Edit Subject" : "Add Subject"}
//                 onClose={() => setIsModalOpen(false)}
//             >

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Subject Name <span className="text-red-500">*</span>
//                     </label>
//                     <InputField
//                         name="name"
//                         value={formData.name}
//                         onChange={handleChange}
//                         placeholder="physics, math, chem"
//                         error={errors.name}
//                     />
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Code <span className="text-red-500">*</span>
//                     </label>
//                     <InputField
//                         name="code"
//                         value={formData.code}
//                         onChange={handleChange}
//                         placeholder="PHY101"
//                         error={errors.code}
//                     />
//                     <InputField
//                         label="Description"
//                         name="description"
//                         value={formData.description}
//                         onChange={handleChange}
//                         placeholder="Example...."
//                         error={errors.description}
//                     />
//                     {/* <InputField
//                         label="credits"
//                         name="credits"
//                         value={formData.credits}
//                         onChange={handleChange}
//                         placeholder="4"
//                     error={errors.credits}
//                     /> */}
//                     {/* <InputField
//             label="Subjects"
//             name="subjects"
//             value={formData.subjects}
//             onChange={handleChange}
//             placeholder="Math, Science, English"
//             error={errors.subjects}
//           /> */}
//                     <button
//                         type="submit"
//                         disabled={classMutation.isLoading}
//                         className="w-full cursor-pointer bg-[image:var(--gradient-primary)] text-white py-2 rounded-lg transition"
//                     >
//                         {classMutation.isLoading && <Loader size={20} />}

//                         {editingClass
//                             ? classMutation.isLoading
//                                 ? "Updating..."
//                                 : "Update Subject"
//                             : classMutation.isLoading
//                                 ? "Creating..."
//                                 : "Add Subject"}

//                     </button>
//                 </form>
//             </Modal>
//         </div>
//     );
// }
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
import { RiImageEditLine } from "react-icons/ri";
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
                        className="px-4 py-2 bg-[image:var(--gradient-primary)] cursor-pointer rounded-lg hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
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
            {!selectedClassId ? (
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