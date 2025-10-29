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


// export default function ClassPage() {
//     const queryClient = useQueryClient();

//     // Table state
//     const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
//     const [sorting, setSorting] = useState([]);
//     const [globalFilter, setGlobalFilter] = useState("");
//     const [columnFilters, setColumnFilters] = useState([]);
//     const [viewModal, setViewModal] = useState(false);
//     const [viewData, setViewData] = useState([]); const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
//     const [salaryForm, setSalaryForm] = useState({
//         teacherId: "",
//         month: "",
//         leaves: "",
//     });
//     const [salaryErrors, setSalaryErrors] = useState({});


//     // Modal state
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingClass, setEditingClass] = useState(null);
//     const [formData, setFormData] = useState({ name: "", code: "", description: "", credits: "" });
//     const [errors, setErrors] = useState({});
//     const debouncedSearch = useDebounce(globalFilter, 500);
//     // Fetch classes
//     const { data: TeacherSalary, isLoading, isFetching, error, isError } = useQuery({
//         queryKey: ["TeacherSalary", pagination.pageIndex, pagination.pageSize, debouncedSearch],
//         queryFn: () => apiGet(apiPath.TeacherSalary, {
//             page: pagination.pageIndex + 1,  // backend usually 1-indexed
//             limit: pagination.pageSize,
//             name: debouncedSearch,
//         }),
//     });
//     console.log("teacherdatafdfdf", TeacherSalary)
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
//             console.log("data", data);
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
//             console.log("error", error);
//             // Show server error message if available
//             const errorMessage =
//                 error?.response?.data?.message || "Something went wrong. Please try again.";
//             toast.error(errorMessage);
//         },
//     });

//     // Salary mutation
// const salaryMutation = useMutation({
//   mutationFn: (payload) => apiPost(apiPath.GenerateTeacherSalary, payload),
//   onSuccess: (data) => {
//     toast.success(data?.message || "Salary generated successfully 🎉");
//     queryClient.invalidateQueries({ queryKey: ["TeacherSalary"] });
//     setIsSalaryModalOpen(false);
//     setSalaryForm({ teacherId: "", month: "", leaves: "" });
//   },
//   onError: (error) => {
//     toast.error(error?.response?.data?.message || "Failed to generate salary ❌");
//   },
// });

// // Handle salary form changes
// const handleSalaryChange = (e) => {
//   const { name, value } = e.target;
//   setSalaryForm((prev) => ({ ...prev, [name]: value }));
//   setSalaryErrors((prev) => ({ ...prev, [name]: "" }));
// };

// // Handle salary form submit
// const handleSalarySubmit = (e) => {
//   e.preventDefault();
//   const errs = {};
//   if (!salaryForm.teacherId) errs.teacherId = "Teacher is required";
//   if (!salaryForm.month) errs.month = "Month is required";
//   if (salaryForm.leaves === "") errs.leaves = "Leaves are required";

//   if (Object.keys(errs).length > 0) {
//     setSalaryErrors(errs);
//     return;
//   }

//   salaryMutation.mutate(salaryForm);
// };



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
//         if (!/^[A-Z]{3,4}[0-9]{2,3}$/.test(formData.code)) {
//             newErrors.code = "Invalid subject code format (example: PHY101)";
//         }

//         if (Object.keys(newErrors).length > 0) {
//             setErrors(newErrors);
//             return;
//         }

//         classMutation.mutate({
//             name: formData.name.trim(),
//             code: formData.code.trim(),
//             // description: formData.description.trim(),
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
// const columns = useMemo(
//   () => [
//     { accessorKey: "TEACHER_NAME", header: "Teacher Name" },
//     { accessorKey: "MONTH", header: "Month" },
//     { accessorKey: "BASE_SALARY", header: "Base Salary" },
//     { accessorKey: "WORKING_DAYS", header: "Working Days" },
//     { accessorKey: "LEAVES", header: "Leaves" },
//     { accessorKey: "PER_DAY_SALARY", header: "Per Day Salary" },
//     { accessorKey: "DEDUCTIONS", header: "Deductions" },
//     { accessorKey: "FINAL_SALARY", header: "Final Salary" },
//     {
//       accessorKey: "STATUS",
//       header: "Status",
//       cell: ({ getValue }) => {
//         const status = getValue();
//         return (
//           <span
//             className={`px-3 py-1 text-sm font-semibold rounded-full ${
//               status === "Paid"
//                 ? "bg-green-100 text-green-700"
//                 : "bg-yellow-100 text-yellow-700"
//             }`}
//           >
//             {status}
//           </span>
//         );
//       },
//     },
    
//     {
//       accessorKey: "LOGIN_URL",
//       header: "Login URL",
//       cell: ({ getValue }) => (
//         <a
//           href={getValue()}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-blue-500 hover:underline"
//         >
//           View
//         </a>
//       ),
//     },
//     <div className="flex p-6 justify-between items-center cursor-pointer mb-4">
//   <h1 className="text-2xl font-bold">Teachers Salary</h1>
//   <button
//     onClick={() => setIsSalaryModalOpen(true)}
//     className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg shadow-md transition"
//   >
//     + Add Salary
//   </button>
// </div>

    
//   ],
//   []
// );




//     const tableData = useMemo(() => TeacherSalary?.results?.salaries || [], [TeacherSalary]);
//     console.log("Teacherdataaaa", tableData);

//     const totalPages = TeacherSalary?.results?.totalPages || 1;




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
//             <Modal
//   isOpen={isSalaryModalOpen}
//   title="Generate Teacher Salary"
//   onClose={() => setIsSalaryModalOpen(false)}
// >
//   <form onSubmit={handleSalarySubmit} className="space-y-4">
//     {/* Teacher ID */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         Teacher ID <span className="text-red-500">*</span>
//       </label>
//       <InputField
//         name="teacherId"
//         value={salaryForm.teacherId}
//         onChange={handleSalaryChange}
//         placeholder="Enter Teacher ID"
//         error={salaryErrors.teacherId}
//       />
//     </div>

//     {/* Month */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         Month <span className="text-red-500">*</span>
//       </label>
//       <InputField
//         name="month"
//         value={salaryForm.month || new Date().toLocaleString("default", { month: "long", year: "numeric" })}
//         onChange={handleSalaryChange}
//         placeholder="October 2025"
//         error={salaryErrors.month}
//       />
//     </div>

//     {/* Leaves */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         Leaves <span className="text-red-500">*</span>
//       </label>
//       <InputField
//         name="leaves"
//         type="number"
//         value={salaryForm.leaves}
//         onChange={handleSalaryChange}
//         placeholder="0"
//         error={salaryErrors.leaves}
//       />
//     </div>

//     <button
//       type="submit"
//       disabled={salaryMutation.isLoading}
//       className="w-full bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
//     >
//       {salaryMutation.isLoading ? "Generating..." : "Generate Salary"}
//     </button>
//   </form>
// </Modal>

//             <div className="flex p-6 justify-between items-center cursor-pointer mb-4">
//                 <h1 className="text-2xl font-bold">Teachers Salary</h1>
//                 {/* <button
//                     onClick={() => {
//                         setEditingClass(null);
//                         setFormData({ name: "", section: "", subjects: "" });
//                         setIsModalOpen(true);
//                     }}
//                     className="px-4 py-2 bg-yellow-400 cursor-pointer  rounded-lg hover:bg-yellow-500 cursor-pointer transition"
//                 >
//                     Add Subject
//                 </button> */}
//             </div>
//             <div className="overflow-x-auto  realtive w-[90vw] md:w-[80vw]">


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
//                     tablePlaceholder="Search teacher salary..."
//                     error={error}
//                     isError={error}
//                     fetching={isFetching}
//                     loading={isLoading}


//                 />

//             </div>
//             {/* Modal for create/edit */}
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
//                         className="w-full cursor-pointer bg-yellow-500 text-white py-2 rounded-lg transition"
//                     >
//                         {classMutation.isLoading && <Loader size={20} />} {/* inline loader */}
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
import { FaRegEye } from "react-icons/fa";

export default function TeacherSalaryPage() {
  const queryClient = useQueryClient();

  // State
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);

  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [salaryForm, setSalaryForm] = useState({
    teacherId: "",
    month: "",
    leaves: "",
  });
  const [salaryErrors, setSalaryErrors] = useState({});

  const debouncedSearch = useDebounce(globalFilter, 500);

  // ✅ Fetch Teacher Salary List
  const { data: TeacherSalary, isLoading, isFetching, error } = useQuery({
    queryKey: ["TeacherSalary", pagination.pageIndex, pagination.pageSize, debouncedSearch],
    queryFn: () =>
      apiGet(apiPath.TeacherSalary, {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        name: debouncedSearch,
      }),
  });

  // ✅ Salary Mutation (Generate Salary)
  const salaryMutation = useMutation({
    mutationFn: (payload) => apiPost(apiPath.GenerateTeacherSalary, payload),
    onSuccess: (data) => {
      toast.success(data?.message || "Salary generated successfully 🎉");
      queryClient.invalidateQueries({ queryKey: ["TeacherSalary"] });
      setIsSalaryModalOpen(false);
      setSalaryForm({ teacherId: "", month: "", leaves: "" });
      setSelectedTeacher(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to generate salary ❌");
    },
  });

  // ✅ Handle Salary Change
  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    setSalaryForm((prev) => ({ ...prev, [name]: value }));
    setSalaryErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Submit Salary Form
  const handleSalarySubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!salaryForm.month) errs.month = "Month is required";
    if (salaryForm.leaves === "") errs.leaves = "Leaves are required";

    if (Object.keys(errs).length > 0) {
      setSalaryErrors(errs);
      return;
    }

    salaryMutation.mutate({
      teacherId: selectedTeacher?._id,
      month: salaryForm.month,
      leaves: salaryForm.leaves,
    });
  };

  // ✅ Table Columns
  const columns = useMemo(
    () => [
      { accessorKey: "TEACHER_NAME", header: "Teacher Name" },
      { accessorKey: "MONTH", header: "Month" },
      { accessorKey: "BASE_SALARY", header: "Base Salary" },
      { accessorKey: "WORKING_DAYS", header: "Working Days" },
      { accessorKey: "LEAVES", header: "Leaves" },
      { accessorKey: "PER_DAY_SALARY", header: "Per Day Salary" },
      { accessorKey: "DEDUCTIONS", header: "Deductions" },
      { accessorKey: "FINAL_SALARY", header: "Final Salary" },
      {
        accessorKey: "STATUS",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                status === "Paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "ACTION",
        header: "Actions",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="flex gap-3 items-center">
              <FaRegEye
                className="text-blue-500 cursor-pointer"
                title="View Details"
                onClick={() => toast(`Teacher: ${rowData.TEACHER_NAME}`)}
              />
              {rowData.STATUS !== "Paid" && (
                <button
                  onClick={() => {
                    setSelectedTeacher(rowData);
                    setIsSalaryModalOpen(true);
                    setSalaryForm({
                      teacherId: rowData._id,
                      month: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
                      leaves: "",
                    });
                  }}
                  className="px-3 cursor-pointer py-1 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
                >
                  + Add Salary
                </button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const tableData = useMemo(() => TeacherSalary?.results?.salaries || [], [TeacherSalary]);
  const totalPages = TeacherSalary?.results?.totalPages || 1;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Teachers Salary</h1>
      </div>

      {/* Table */}
     <div className="overflow-x-auto w-[90vw] md:w-[80vw]">
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
          totalCount={totalPages}
          tablePlaceholder="Search teacher"
          error={error}
          isError={!!error}
          fetching={isFetching}
          loading={isLoading}
        />
      </div>

      {/* Salary Modal */}
      <Modal
        isOpen={isSalaryModalOpen}
        title={`Generate Salary for ${selectedTeacher?.TEACHER_NAME || ""}`}
        onClose={() => {
          setIsSalaryModalOpen(false);
          setSelectedTeacher(null);
        }}
      >
        <form onSubmit={handleSalarySubmit} className="space-y-4">
          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month <span className="text-red-500">*</span>
            </label>
            <InputField
              name="month"
              value={
                salaryForm.month ||
                new Date().toLocaleString("default", { month: "long", year: "numeric" })
              }
              onChange={handleSalaryChange}
              placeholder="October 2025"
              error={salaryErrors.month}
            />
          </div>

          {/* Leaves */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leaves <span className="text-red-500">*</span>
            </label>
            <InputField
              name="leaves"
              type="number"
              value={salaryForm.leaves}
              onChange={handleSalaryChange}
              placeholder="0"
              error={salaryErrors.leaves}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={salaryMutation.isLoading}
            className="w-full bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
          >
            {salaryMutation.isLoading ? "Generating..." : "Generate Salary"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
