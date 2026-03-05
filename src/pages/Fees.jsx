// import React, { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import Select from "react-select";
// import ConfirmBox from "../components/ConfirmBox";
// import {
//   Card, CardContent, CardHeader,
//   Typography,
//   Button,
//   IconButton,
//   Divider,
//   Tooltip,
//   CircularProgress,
//   TextField,
// } from "@mui/material";
// import { Edit, School } from "@mui/icons-material";
// import toast from "react-hot-toast";

// import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "../api/apiFetch";
// import apiPath from "../api/apiPath";
// import Modal from "../components/Modal";
// import ToggleButton from "../components/ToggleButton";
// import { useEffect } from "react";
// const customSelectStyles = {
//   control: (provided, state) => ({
//     ...provided,
//     minHeight: "56px",
//     height: "56px",
//     borderColor: state.isFocused ? "#1976d2" : "#e5e7eb",
//     boxShadow: state.isFocused ? "0 0 0 2px rgba(25, 118, 210, 0.2)" : "none",
//     "&:hover": { borderColor: "#1976d2" },
//     borderRadius: "8px",
//     fontSize: "0.95rem",
//     backgroundColor: state.isDisabled ? "#f9fafb" : "white",
//     cursor: state.isDisabled ? "not-allowed" : "pointer",
//   }),
//   valueContainer: (provided) => ({
//     ...provided,
//     height: "56px",
//     padding: "0 12px",
//   }),
//   input: (provided) => ({
//     ...provided,
//     margin: "0",
//     padding: "0",
//   }),
//   indicatorsContainer: (provided) => ({
//     ...provided,
//     height: "56px",
//   }),
//   placeholder: (provided) => ({
//     ...provided,
//     color: "#9ca3af",
//   }),
//   menu: (provided) => ({
//     ...provided,
//     borderRadius: "8px",
//     boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
//     zIndex: 9999,
//   }),
//   menuPortal: (provided) => ({
//     ...provided,
//     zIndex: 9999,
//   }),
//   option: (provided, state) => ({
//     ...provided,
//     backgroundColor: state.isSelected
//       ? "#1976d2"
//       : state.isFocused
//         ? "#e8f0fe"
//         : "white",
//     color: state.isSelected ? "white" : "#1f2937",
//     cursor: "pointer",
//     padding: "10px 12px",
//     fontSize: "0.95rem",
//     "&:active": {
//       backgroundColor: "#1565c0",
//     },
//   }),
// };
// export default function FeesStructure() {
//   const queryClient = useQueryClient();
//   const [selectedClass, setSelectedClass] = useState(null);
//   console.log("selectedclass", selectedClass);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editData, setEditData] = useState(null);
//   const [confirmModal, setConfirmModal] = useState(false);
//   const [deleteId, setDeleteId] = useState(null);

//   const currentYear = new Date().getFullYear();
//   const nextYear = currentYear + 1;

//   const [formData, setFormData] = useState({
//     academicYear: ``,
//     feeHeads: [
//       { type: "Tuition Fee", amount: 0, isOptional: false },
//       { type: "Exam Fee", amount: 0, isOptional: false },
//     ],
//     totalAmount: 0,
//   });
//   console.log("formdata", formData);
//   // Fetch classes
//   const { data: classData, isLoading: classLoading } = useQuery({
//     queryKey: ["classesdata"],
//     queryFn: () => apiGet(apiPath.classes),
//   });

//   // Fetch fees structure
//   useEffect(() => {
//     if (!selectedClass && classData?.results?.docs?.length) {
//       const firstClass = classData.results.docs[0];
// console.log("firstclass",firstClass);
//       setSelectedClass(firstClass._id);
//     }
//   }, [classData]);
//   const { data: feesData, isLoading: feesLoading } = useQuery({
//     queryKey: ["feesStructure", selectedClass],
//     queryFn: () =>
//       apiGet(`${apiPath.getFeesStructure}?classIdentifier=${selectedClass}`),
//     enabled: !!selectedClass,
//   });
//   const { data: academicSessions, isLoading: loading, error } = useQuery({
//     queryKey: ['academicSessionsssss', selectedClass],
//     queryFn: () => apiGet(apiPath.getAcademicSessions)
//   });

//   const formatDate = (isoDate) => {
//     if (!isoDate) return "";
//     return new Date(isoDate).toISOString().slice(0, 10);
//   };
//   const academicYearOptions = academicSessions?.results?.map(session => ({
//     value: session.academicSession,
//     label: session.academicSession,   // what user sees
//   }));
//   useEffect(() => {
//     if (!feesData?.results) return;

//     const data = feesData.results;

//     setFormData(prev => ({
//       ...prev,
//       academicYear: data.academicYear || "",
//       feeHeads: data.feeHeads || prev.feeHeads,
//       totalAmount: data.totalAmount || 0,
//     }));

//   }, [feesData]);
//   console.log("academicYearOptions", academicYearOptions);

//   // Mutations
//   const mutation = useMutation({
//     mutationFn: async (payload) => {
//       if (editData) return apiPut(`${apiPath.updateFeesStructure}/${editData._id}`, payload);
//       return apiPost(apiPath.createFeesStructure, payload);
//     },
//     onSuccess: (data) => {
//       queryClient.invalidateQueries(["feesStructure", selectedClass]);
//       toast.success(data.message || "Fees structure saved successfully");
//       setIsModalOpen(false);
//       setEditData(null);
//       resetForm();
//     },
//     onError: (error) => toast.error(error?.response?.data?.message || "Something went wrong"),
//   });

//   // FIXED: Delete Mutation with optimistic updates
//   const deleteMutation = useMutation({
//     mutationFn: async (id) => apiDelete(`${apiPath.deleteFeesStructure}/${id}`),

//     onMutate: async (id) => {
//       // Cancel any outgoing refetches
//       await queryClient.cancelQueries(["feesStructure", selectedClass]);

//       // Snapshot the previous value
//       const previousData = queryClient.getQueryData(["feesStructure", selectedClass]);

//       // Optimistically update to remove the data
//       queryClient.setQueryData(["feesStructure", selectedClass], (old) => {
//         if (!old) return old;
//         return {
//           ...old,
//           results: null // Set results to null immediately
//         };
//       });

//       return { previousData };
//     },

//     onSuccess: (data) => {
//       // Force refresh of selected class's fees
//       queryClient.invalidateQueries(["feesStructure", selectedClass]);
//       // Also invalidate all feesStructure queries
//       queryClient.invalidateQueries({ queryKey: ["feesStructure"] });
//       toast.success(data?.message || "Fees structure deleted successfully");
//       setConfirmModal(false);
//     },

//     onError: (err, id, context) => {
//       // Rollback to previous data on error
//       if (context?.previousData) {
//         queryClient.setQueryData(["feesStructure", selectedClass], context.previousData);
//       }
//       toast.error(err?.response?.data?.message || "Delete failed");
//       setConfirmModal(false);
//     },

//     onSettled: () => {
//       // Always refetch after mutation settles
//       queryClient.invalidateQueries(["feesStructure", selectedClass]);
//     }
//   });

//   const toggleMutation = useMutation({
//     mutationFn: async ({ id, newStatus }) =>
//       apiPatch(`${apiPath.feestoggleFeesStructure}/${id}`, { status: newStatus }),
//     onSuccess: (data) => {
//       queryClient.invalidateQueries(["feesStructure", selectedClass]),
//         toast.success(data.message || "Status updated successfully");
//     }
//   });

//   const resetForm = () =>
//     setFormData({
//       academicYear: "",
//       feeHeads: [
//         { type: "Tuition Fee", amount: 0, isOptional: false },
//         { type: "Exam Fee", amount: 0, isOptional: false },
//       ],
//       totalAmount: 0,
//     });

//   const handleEdit = () => {
//     const data = feesData?.results;
//     if (!data) return;

//     setEditData(data);
//     setFormData({
//       academicYear: data.academicYear || `${currentYear}-${nextYear}`,
//       feeHeads: data.feeHeads || [
//         { type: "Tuition Fee", amount: 0, isOptional: false },
//         { type: "Exam Fee", amount: 0, isOptional: false },
//       ],
//       totalAmount: data.totalAmount || 0,
//     });
//     setIsModalOpen(true);
//   };

//   const handleAdd = () => {
//     resetForm();
//     setEditData(null);
//     setIsModalOpen(true);
//   };

//   const handleFeeHeadChange = (index, field, value) => {
//     const newHeads = [...formData.feeHeads];
//     newHeads[index][field] = value;
//     setFormData({ ...formData, feeHeads: newHeads });
//   };

//   const addFeeHead = () =>
//     setFormData({
//       ...formData,
//       feeHeads: [...formData.feeHeads, { type: "", amount: 0, isOptional: false }],
//     });

//   const removeFeeHead = (index) =>
//     setFormData({
//       ...formData,
//       feeHeads: formData.feeHeads.filter((_, i) => i !== index),
//     });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const totalAmount = formData.feeHeads.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
//     mutation.mutate({ ...formData, classIdentifier: selectedClass, totalAmount });
//   };

//   // Deduplicate class list (ignore section)
//   const classOptions = (() => {
//     if (!classData?.results?.docs) return [];

//     const uniqueMap = new Map();

//     classData.results.docs.forEach((cls) => {
//       console.log("cls", cls);
//       // Extract base class name (e.g., "10th" from "10th A" or "10th-B")
//       const baseName = cls.name.split(" ")[0].trim();

//       if (!uniqueMap.has(cls._id)) {
//         uniqueMap.set(baseName, {
//           value: cls._id, // or cls.classIdentifier if consistent
//           label: baseName,
//         });
//       }
//     });

//     return Array.from(uniqueMap.values());
//   })();

//   console.log("classoptions", classOptions);

//   const selectedClassLabel =
//     classOptions?.find((cls) => cls?.value === selectedClass)?.label || "N/A";

//   // Check if we should show the fees structure or empty state
//   const showFeesStructure = feesData?.results && !deleteMutation.isSuccess;

//   return (
//     <div className="p-8 min-h-screen">
//       <Typography
//         variant="h5"
//         align="center"
//         gutterBottom
//         className="text-black font-extrabold drop-shadow-md"
//       >
//         🏫 Fees Structure Management
//       </Typography>

//       <div className="max-w-4xl mx-auto mt-10">
//         {/* Class Selector */}
//         <div className="mb-6">
//           <label className="block text-gray-800 mb-2 font-medium">Select Class</label>
//           <Select
//             options={classOptions}
//             isLoading={classLoading}
//             placeholder="Choose class..."
//             value={classOptions.find(opt => opt.value === selectedClass)}
//             onChange={(opt) => {
//               console.log("opt", opt);
//               setSelectedClass(opt?.value || null);
//               // Reset delete state when changing class
//               deleteMutation.reset();
//             }}
//             className="shadow-md z-[99999] rounded-md"
//             theme={(theme) => ({
//               ...theme,
//               colors: {
//                 ...theme.colors,
//                 primary25: "#fef08a", // light yellow on hover
//                 primary: "#facc15",
//                 // main yellow (border, selected)
//               },
//             })}
//           />
//         </div>

//         {/* Fees Structure Display */}
//         {feesLoading || deleteMutation.isPending ? (
//           <div className="text-center py-10">
//             <div className="h-[10vh] inset-0 flex items-center justify-center bg-opacity-70 z-50">
//               <CircularProgress
//                 size={48}
//                 sx={{ color: '#facc15' }}
//               />
//             </div>
//             <p className="mt-2 text-gray-600">
//               {deleteMutation.isPending ? "Deleting fees structure..." : "Loading fees structure..."}
//             </p>
//           </div>
//         ) : showFeesStructure ? (
//           <Card className="shadow-2xl border border-yellow-300 rounded-xl">
//             <CardHeader
//               title={
//                 <div className="flex items-center gap-2 text-yellow-800 font-bold">
//                   <School fontSize="large" />
//                   <Typography variant="h6">{selectedClassLabel}</Typography>
//                 </div>
//               }
//               action={
//                 <div className="flex items-center gap-3">
//                   <Tooltip title="Edit Fees Structure">
//                     <IconButton
//                       onClick={handleEdit}
//                       className="text-yellow-700"
//                       disabled={deleteMutation.isPending}
//                     >
//                       <Edit />
//                     </IconButton>
//                   </Tooltip>
//                   <Tooltip title="Delete Fees Structure">
//                     <IconButton
//                       onClick={() => {
//                         if (feesData?.results?._id) {
//                           setDeleteId(feesData.results._id);
//                           setConfirmModal(true);
//                         }
//                       }}
//                       className="text-red-500"
//                       disabled={deleteMutation.isPending}
//                     >
//                       {deleteMutation.isPending ? (
//                         <CircularProgress size={20} />
//                       ) : (
//                         "🗑️"
//                       )}
//                     </IconButton>
//                   </Tooltip>
//                 </div>
//               }
//             />
//             <Divider />
//             <CardContent>
//               {/* <Typography className="mb-4 text-gray-700 font-medium">
//                 Academic Year: <b>{feesData.results.academicYear}</b>
//               </Typography> */}
//               {/* <TextField
//                 fullWidth
//                 name="academicYear"
//                 label="Academic Year"
//                 value={formatAcademicSession(feesData?.results?.academicYear) || ""}
//                 disabled   // ✅ LOCKED
//                 InputProps={{ readOnly: true }}  // extra safety
//                 helperText={
//                   sessionLoading
//                     ? "Loading academic session..."
//                     : "Academic session from school settings"
//                 }
//               /> */}
//               <Select
//                 options={academicYearOptions}
//                 styles={customSelectStyles}
//                 className="mb-3"
//                 placeholder="Select Academic Year"
//                 value={academicYearOptions?.find(
//                   opt => opt.value === formData.academicYear
//                 )}
//                 isDisabled={true}
//                 onChange={(selected) => {
//                   setFormData(prev => ({
//                     ...prev,
//                     academicYear: selected.value,
//                   }));
//                 }}
//               />

//               <div className="bg-yellow-50 p-4 rounded-xl shadow-inner">
//                 {feesData.results.feeHeads.map((head, idx) => (
//                   <div
//                     key={idx}
//                     className="flex flex-wrap justify-between items-center p-3 mb-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
//                   >
//                     <Typography className="w-1/3 font-semibold text-black">{head.type}</Typography>
//                     <Typography className="w-1/3 text-center text-gray-600">₹{head.amount}</Typography>
//                     <Typography
//                       className={`w-1/3 text-right font-medium ${head.isOptional ? "text-blue-500" : "text-green-600"
//                         }`}
//                     >
//                       {head.isOptional ? "Optional" : "Mandatory"}
//                     </Typography>
//                   </div>
//                 ))}
//               </div>

//               {/* Total + Toggle */}
//               <div className="flex justify-between items-center mt-6 bg-yellow-100 p-3 rounded-lg shadow-md">
//                 <Typography variant="h6" className="text-yellow-900 font-bold">
//                   Total: ₹{feesData.results.totalAmount}
//                 </Typography>

//                 <div className="flex items-center gap-3">
//                   <Typography className="text-gray-700 text-sm font-medium">
//                     {feesData.results.status === "active" ? "Active" : "Inactive"}
//                   </Typography>
//                   <ToggleButton
//                     isActive={feesData.results.status === "active"}
//                     onToggle={() =>
//                       toggleMutation.mutate({
//                         id: feesData.results._id,
//                         newStatus: feesData.results.status === "active" ? "inactive" : "active",
//                       })
//                     }
//                     disabled={toggleMutation.isPending || deleteMutation.isPending}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="text-center text-gray-600 mt-10">
//             {deleteMutation.isSuccess ? (
//               <div className="flex flex-col items-center gap-4 py-8">
//                 <div className="text-green-600 text-xl flex items-center gap-2">
//                   <span className="text-2xl">✓</span>
//                   <span>Fees structure deleted successfully</span>
//                 </div>
//                 <button
//                   onClick={() => {
//                     // Reset the mutation state and refetch
//                     deleteMutation.reset();
//                     queryClient.invalidateQueries(["feesStructure", selectedClass]);
//                   }}
//                   className="text-yellow-700 underline font-semibold hover:text-yellow-900"
//                 >
//                   Refresh View
//                 </button>
//               </div>
//             ) : (
//               <>
//                 No fees structure found.
//                 {selectedClass && (
//                   <button
//                     onClick={handleAdd}
//                     className="text-yellow-700 underline font-semibold ml-2 hover:text-yellow-900"
//                   >
//                     Add New
//                   </button>
//                 )}
//               </>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editData ? "Edit Fees Structure" : "Add Fees Structure"}>
//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             const tuition = formData.feeHeads.find((f) => f.type === "Tuition Fee");
//             const exam = formData.feeHeads.find((f) => f.type === "Exam Fee");

//             if (!tuition?.amount || !exam?.amount) {
//               toast.error("Tuition Fee and Exam Fee are required!");
//               return;
//             }
//             handleSubmit(e);
//           }}
//           className="space-y-4"
//         >
//           {/* Academic Year */}
//           <div>
//             {/* <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
//             <input
//               type="text"
//               value={formatAcademicSession(formData.academicYear)}
//               readOnly
//               className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-sm text-gray-700 cursor-not-allowed"
//             /> */}
//             <Select
//               options={academicYearOptions}
//               styles={customSelectStyles}
//               placeholder="Select Academic Year"
//               value={academicYearOptions?.find(
//                 opt => opt.value === formData.academicYear
//               )}
//               onChange={(selected) => {
//                 setFormData(prev => ({
//                   ...prev,
//                   academicYear: selected.value,   // EXACT payload format
//                 }));
//               }}
//             />

//           </div>

//           {/* Fee Heads */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Fee Heads</label>

// {formData.feeHeads.map((head, index) => {
//   const feeTypeOptions = [
//     { value: "Tuition Fee", label: "Tuition Fee" },
//     { value: "Exam Fee", label: "Exam Fee" },
//     { value: "Transport Fee", label: "Transport Fee" },
//     { value: "Miscellaneous", label: "Miscellaneous" },
//   ];
//   const selectedTypes = formData.feeHeads.map((f) => f.type);
//   const availableOptions = feeTypeOptions.map((opt) => ({
//     ...opt,
//     isDisabled: selectedTypes.includes(opt.value) && opt.value !== head.type,
//   }));
//   const isMandatory = head.type === "Tuition Fee" || head.type === "Exam Fee";

//   return (
//     <div key={index} className="flex flex-wrap items-center gap-3 border p-3 rounded-md mb-2 bg-yellow-50 text-black shadow-sm hover:shadow-md transition-shadow">
//       <div className="w-full sm:w-[260px]">
//         <Select
//           options={availableOptions}
//           value={head.type ? { value: head.type, label: head.type } : null}
//           placeholder="Select Fee Type"
//           onChange={(opt) => handleFeeHeadChange(index, "type", opt?.value || "")}
//           isDisabled={isMandatory}
//           className="text-black"
//         />
//       </div>

//       <input
//         type="number"
//         placeholder="Enter 6-digit amount"
//         value={head.amount}
//         onChange={(e) => {
//           const value = e.target.value;

//           // ✅ Allow only up to 6 digits
//           if (value.length > 6) {
//             toast.error("Fee amount cannot exceed 6 digits");
//             return;
//           }

//           // ✅ Allow only numeric input
//           if (!/^\d*$/.test(value)) return;

//           handleFeeHeadChange(index, "amount", Number(value));
//         }}
//         className="w-full sm:w-[140px] border border-gray-300 rounded-md px-2 py-1 text-xs"
//         required
//       />

//       {!isMandatory && (
//         <button
//           type="button"
//           onClick={() => removeFeeHead(index)}
//           className="text-red-500 hover:text-red-700 text-xs"
//         >
//           ✕
//         </button>
//       )}
//     </div>
//   );
// })}
//           </div>

//           {/* Save / Cancel */}
//           <div className="flex justify-end gap-3 pt-4">
//             <Button onClick={() => setIsModalOpen(false)} variant="outlined" color="inherit">
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               variant="contained"
//               disabled={mutation.isPending}
//               sx={{
//                 '--gradient-primary': 'linear-gradient(to right, #facc15, #eab308)',
//                 background: 'var(--gradient-primary)',
//                 color: '#333',
//               }}
//             >
//               {mutation.isPending ? "Saving..." : "Save"}
//             </Button>
//           </div>
//         </form>
//       </Modal>

//       {/* FIXED: Confirm Box with proper handlers */}
//       <ConfirmBox
//         isOpen={confirmModal}
//         title="Confirm Deletion"
//         message="Are you sure you want to delete this fees structure? This action cannot be undone."
//         onConfirm={() => {
//           // Only pass the handler, don't close modal here
//           deleteMutation.mutate(deleteId);
//         }}
//         onCancel={() => {
//           setConfirmModal(false);
//           setDeleteId(null);
//         }}
//         loading={deleteMutation.isPending}
//       />
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import ConfirmBox from "../components/ConfirmBox";
import {
  Card, CardContent, CardHeader,
  Typography,
  Button,
  IconButton,
  Divider,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Edit, School } from "@mui/icons-material";
import toast from "react-hot-toast";

import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "../api/apiFetch";
import apiPath from "../api/apiPath";
import Modal from "../components/Modal";
import ToggleButton from "../components/ToggleButton";

/* ================= SELECT STYLES (UNCHANGED) ================= */

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "56px",
    height: "56px",
    borderColor: state.isFocused ? "#1976d2" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(25, 118, 210, 0.2)" : "none",
    "&:hover": { borderColor: "#1976d2" },
    borderRadius: "8px",
    fontSize: "0.95rem",
  }),
};

/* ================= COMPONENT ================= */

export default function FeesStructure() {
  const queryClient = useQueryClient();

  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    acadmicSessionId: "",
    feeHeads: [
      { type: "Tuition Fee", amount: 0, isOptional: false },
      { type: "Exam Fee", amount: 0, isOptional: false },
    ],
  });

  /* ================= FETCH CLASSES ================= */

  const { data: classData, isLoading: classLoading } = useQuery({
    queryKey: ["classesdata"],
    queryFn: () => apiGet(apiPath.classes),
  });

  // ✅ IMPORTANT: value = cls.name (classIdentifier)
  const classOptions = (() => {
    if (!classData?.results?.docs) return [];

    const uniqueMap = new Map();

    classData.results.docs.forEach((cls) => {
      const baseName = cls.name.split(" ")[0].trim();
      if (!uniqueMap.has(baseName)) {
        uniqueMap.set(baseName, {
          value: baseName, // ✅ send class name
          label: baseName,
        });
      }
    });

    return Array.from(uniqueMap.values());
  })();

  useEffect(() => {
    if (!selectedClass && classOptions.length) {
      setSelectedClass(classOptions[0].value);
    }
  }, [classOptions]);

  /* ================= FETCH FEE STRUCTURE ================= */

  const { data: feesData, isLoading: feesLoading } = useQuery({
    queryKey: ["feesStructure", selectedClass],
    queryFn: () =>
      apiGet(`${apiPath.getFeesStructure}?classIdentifier=${selectedClass}`),
    enabled: !!selectedClass,
  });

  /* ================= FETCH ACADEMIC SESSIONS ================= */

  const { data: academicSessions } = useQuery({
    queryKey: ["academicSessions"],
    queryFn: () => apiGet(apiPath.getAcademicSessions),
  });
  // console.log("academicSessionyogesh",academicSessions);
  // const currentAcademicYear ="hello";
  const academicYearOptions =
    academicSessions?.results?.map((session) => ({
      value: session._id, // ✅ backend expects this
      label: session.academicSession,
    })) || [];

  /* ================= MAP EDIT DATA ================= */

  useEffect(() => {
    if (feesData?.results) {
      const data = feesData.results;

      setFormData({
        acadmicSessionId: data.acadmicSessionId || "",
        feeHeads: data.feeHeads || [],
      });
    } else {
      // ✅ VERY IMPORTANT
      resetForm();
      setEditData(null);
    }
  }, [feesData, selectedClass]);

  /* ================= MUTATIONS ================= */

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (editData)
        return apiPut(`${apiPath.updateFeesStructure}/${editData._id}`, payload);

      return apiPost(apiPath.createFeesStructure, payload);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries(["feesStructure", selectedClass]);

      toast.success(data?.message || "Fees structure saved successfully");

      setIsModalOpen(false);
      setEditData(null);

      // ✅ IMPORTANT — RESET FORM AFTER CREATE
      resetForm();
    },

    onError: (error) =>
      toast.error(error?.response?.data?.message || "Something went wrong"),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      apiDelete(`${apiPath.deleteFeesStructure}/${id}`),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["feesStructure", selectedClass]);
      toast.success(data?.message || "Fees structure deleted successfully");
      setConfirmModal(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, newStatus }) =>
      apiPatch(`${apiPath.feestoggleFeesStructure}/${id}`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries(["feesStructure", selectedClass]);
    },
  });

  /* ================= SUBMIT ================= */

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Convert amount to number before sending
    const cleanedFeeHeads = formData.feeHeads.map((head) => ({
      ...head,
      amount: Number(head.amount),   // 🔥 FIX HERE
    }));

    const totalAmount = cleanedFeeHeads.reduce(
      (acc, curr) => acc + Number(curr.amount || 0),
      0
    );

    const payload = {
      classIdentifier: selectedClass,
      acadmicSessionId: formData.acadmicSessionId,
      feeHeads: cleanedFeeHeads,      // ✅ send cleaned array
      totalAmount,
      status: "active",
    };

    mutation.mutate(payload);
  };

  /* ================= FEE HEAD HANDLERS ================= */
  const resetForm = () => {
    setFormData({
      acadmicSessionId: "",
      feeHeads: [
        { type: "Tuition Fee", amount: 0, isOptional: false },
        { type: "Exam Fee", amount: 0, isOptional: false },
      ],
    });
  };
  const handleFeeHeadChange = (index, field, value) => {
    const newHeads = [...formData.feeHeads];
    newHeads[index][field] = value;
    setFormData({ ...formData, feeHeads: newHeads });
  };

  const addFeeHead = () =>
    setFormData({
      ...formData,
      feeHeads: [...formData.feeHeads, { type: "", amount: 0, isOptional: false }],
    });

  const removeFeeHead = (index) =>
    setFormData({
      ...formData,
      feeHeads: formData.feeHeads.filter((_, i) => i !== index),
    });

  /* ================= UI (UNCHANGED) ================= */

  const selectedClassLabel =
    classOptions?.find((cls) => cls?.value === selectedClass)?.label || "N/A";

  const showFeesStructure = feesData?.results;

  return (
    <div className="p-8 min-h-screen">
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        className="text-black font-extrabold drop-shadow-md"
      >
        🏫 Fees Structure Management
      </Typography>

      <div className="max-w-4xl mx-auto mt-10">

        {/* CLASS SELECTOR */}
        <div className="mb-6">
          <label className="block text-gray-800 mb-2 font-medium">
            Select Class
          </label>
          <Select
            options={classOptions}
            isLoading={classLoading}
            value={classOptions.find(opt => opt.value === selectedClass)}
            onChange={(opt) => {
              setSelectedClass(opt?.value || null);

              // ✅ clear previous form data immediately
              resetForm();
              setEditData(null);
              deleteMutation.reset();
            }}
            className="shadow-md z-[99999] rounded-md"
          />
        </div>

        {/* DISPLAY SECTION */}
        {feesLoading ? (
          <div className="text-center py-10">
            <CircularProgress size={48} sx={{ color: '#facc15' }} />
          </div>
        ) : showFeesStructure ? (
          <Card className="shadow-2xl border border-yellow-300 rounded-xl">
            <CardHeader
              title={
                <div className="flex items-center gap-2 text-yellow-800 font-bold">
                  <School fontSize="large" />
                  <Typography variant="h6">{selectedClassLabel}</Typography>
                </div>
              }
              action={
                <div className="flex items-center gap-3">
                  <Tooltip title="Edit Fees Structure">
                    <IconButton onClick={() => {
                      setEditData(feesData.results);
                      setIsModalOpen(true);
                    }}>
                      <Edit />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete Fees Structure">
                    <IconButton
                      onClick={() => {
                        setDeleteId(feesData.results._id);
                        setConfirmModal(true);
                      }}
                    >
                      🗑️
                    </IconButton>
                  </Tooltip>
                </div>
              }
            />
            <Divider />
            <CardContent>

              {/* Academic Session Display */}
              <Select
                options={academicYearOptions}
                styles={customSelectStyles}
                className="mb-3"
                value={academicYearOptions.find(
                  opt => opt.value === formData.acadmicSessionId
                )}
                isDisabled
              />

              {/* Fee Heads */}
              {/* <div className="bg-yellow-50 p-4 rounded-xl shadow-inner">
                {feesData.results.feeHeads.map((head, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap justify-between items-center p-3 mb-2 rounded-lg bg-white shadow-sm"
                  >
                    <Typography className="w-1/3 font-semibold">
                      {head.type}
                    </Typography>
                    <Typography className="w-1/3 text-center">
                      ₹{head.amount}
                    </Typography>
                    <Typography className="w-1/3 text-right">
                      {head.isOptional ? "Optional" : "Mandatory"}
                    </Typography>
                  </div>
                ))}
              </div> */}


              {formData.feeHeads.map((head, index) => {
                const feeTypeOptions = [
                  { value: "Tuition Fee", label: "Tuition Fee" },
                  { value: "Exam Fee", label: "Exam Fee" },
                  { value: "Transport Fee", label: "Transport Fee" },
                  { value: "Miscellaneous", label: "Miscellaneous" },
                ];
                const selectedTypes = formData.feeHeads.map((f) => f.type);
                const availableOptions = feeTypeOptions.map((opt) => ({
                  ...opt,
                  isDisabled: selectedTypes.includes(opt.value) && opt.value !== head.type,
                }));
                const isMandatory = head.type === "Tuition Fee" || head.type === "Exam Fee";

                return (
                  <div key={index} className="flex flex-wrap items-center gap-3 border p-3 rounded-md mb-2 bg-yellow-50 text-black shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-full sm:w-[260px]">
                      <Select
                        options={availableOptions}
                        value={head.type ? { value: head.type, label: head.type } : null}
                        placeholder="Select Fee Type"
                        disabled
                        onChange={(opt) => handleFeeHeadChange(index, "type", opt?.value || "")}
                        isDisabled={isMandatory}
                        className="text-black"
                      />
                    </div>

                    <input
                      type="number"
                      placeholder="Enter 6-digit amount"
                      value={head.amount}
                      disabled
                      onChange={(e) => {
                        const value = e.target.value;
                        // ✅ Allow only up to 6 digits
                        if (value.length > 6) {
                          toast.error("Fee amount cannot exceed 6 digits");
                          return;
                        }

                        // ✅ Allow only numeric input
                        if (!/^\d*$/.test(value)) return;

                        handleFeeHeadChange(index, "amount", Number(value));
                      }}
                      className="w-full sm:w-[140px] border border-gray-300 rounded-md px-2 py-1 text-xs"
                      required
                    />

                    {!isMandatory && (
                      <button
                        type="button"
                        onClick={() => removeFeeHead(index)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Total + Toggle */}
              <div className="flex justify-between items-center mt-6 bg-yellow-100 p-3 rounded-lg shadow-md">
                <Typography variant="h6" className="font-bold">
                  Total: ₹{feesData.results.totalAmount}
                </Typography>

                <ToggleButton
                  isActive={feesData.results.status === "active"}
                  onToggle={() =>
                    toggleMutation.mutate({
                      id: feesData.results._id,
                      newStatus: feesData.results.status === "active" ? "inactive" : "active",
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center text-gray-600 mt-10">
            No fees structure found.
            {selectedClass && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-yellow-700 underline font-semibold ml-2"
              >
                Add New
              </button>
            )}
          </div>
        )}
      </div>

      {/* MODAL (UNCHANGED UI) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editData ? "Edit Fees Structure" : "Add Fees Structure"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          <Select
            options={academicYearOptions}
            styles={customSelectStyles}
            value={academicYearOptions.find(
              opt => opt.value === formData.acadmicSessionId
            )}
            onChange={(selected) =>
              setFormData(prev => ({
                ...prev,
                acadmicSessionId: selected.value,
              }))
            }
          />

          {formData.feeHeads.map((head, index) => (
            <div key={index} className="flex flex-wrap items-center gap-3 border p-3 rounded-md mb-2 bg-yellow-50">

              <input
                value={head.type}
                onChange={(e) =>
                  handleFeeHeadChange(index, "type", e.target.value)
                }
              />

              <input
                type="number"
                value={head.amount}
                onChange={(e) =>
                  handleFeeHeadChange(index, "amount", e.target.value)
                }
              />

              <button type="button" onClick={() => removeFeeHead(index)}>
                ✕
              </button>
            </div>
          ))}

          <div className="flex justify-end gap-4 items-center mt-4">
            <Button onClick={() => setIsModalOpen(false)} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button sx={{
              '--gradient-primary': 'linear-gradient(to right, #facc15, #eab308)',
              background: 'var(--gradient-primary)',
              color: '#333',
            }} type="submit" variant="contained">
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmBox
        isOpen={confirmModal}
        title="Confirm Deletion"
        message="Are you sure you want to delete this fees structure?"
        onConfirm={() => deleteMutation.mutate(deleteId)}
        onCancel={() => setConfirmModal(false)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}