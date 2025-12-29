
import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReusableTable from "../components/Table";
import Modal from "../components/Modal";
import InputField from "../components/InputField";
import { apiGet, apiPut } from "../api/apiFetch";
import apiPath from "../api/apiPath";
import useDebounce from "../hooks/useDebounce";
import toast from "react-hot-toast";
import { RiImageEditLine } from "react-icons/ri";
import { FaRegEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import * as XLSX from "xlsx";
import Select from "react-select";
import { apiPost } from "../api/apiFetch";
import { FaPlusCircle } from "react-icons/fa";
import { FaFileExport } from "react-icons/fa";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { LiaFileImportSolid } from "react-icons/lia";
import { FaDownload } from "react-icons/fa6";
import { IoAddCircle } from "react-icons/io5";
import { CgImport } from "react-icons/cg";
import { RiImportFill } from "react-icons/ri";
import { useSelector } from "react-redux";
import {
  InputAdornment,
  IconButton,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";

// import Modal from "../components/Modal";
// import toast from "react-hot-toast";


export default function StudentPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [showModel, setShowModal] = useState(false);
  const [classId, setClassId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [academicYear, setAcademicYear] = useState(null);
  console.log("classid", classId);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [viewData, setViewData] = useState([]);
  const [classFilter, setClassFilter] = useState(""); // ✅ filter state
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [errors, setErrors] = useState({});
  const debouncedSearch = useDebounce(globalFilter, 500);
  const currentYear = new Date().getFullYear();
    const collapsed = useSelector((state) => state.ui.sidebarCollapsed);
  const nextYear = currentYear + 1;
  const [formData, setFormData] = useState({
    academicYear: `${currentYear}-${nextYear}`,
    feeHeads: [
      { type: "Tuition Fee", amount: 0 },
      { type: "Exam Fee", amount: 0 },
    ],
    totalAmount: 0,
  });
  // 🔹 Import Mutation
  const importMutation = useMutation({
    mutationFn: async (formData) =>
      apiPost(apiPath.importStudents, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: (res) => {
      const { summary } = res || {};

      // ✅ Base success message
      toast.success(res.message || "Students imported successfully ✅");

      // ✅ Show success/failure summary in a single toast
      if (summary) {
        toast(
          `📊 Import Summary:\nTotal: ${summary.total}\n✅ Success: ${summary.success}\n❌ Failed: ${summary.failed}\nSuccess Rate: ${summary.successRate}`,
          {
            icon: "📦",
            duration: 6000,
          }
        );
      }

      // ✅ Refresh table and reset form
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setShowModal(false);
      setSelectedFile(null);
      setClassId(null);
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || "Import failed ❌");
    },
  });
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
  // 🔹 Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".csv")) {
      toast.error("Please upload a valid Excel file (.csv)");
      return;
    }
    setSelectedFile(file);
  };

  // 🔹 Handle import submit
  // 🔹 Handle import submit
  const handleImportSubmit = (e) => {
    e.preventDefault();

    // === Validation checks ===
    if (!classId) {
      toast.error("Please select a class!");
      return;
    }
    if (!academicYear) {
      toast.error("please select academic year");
      return;
    }

    if (!feesData?.results?._id) {
      toast.error("Fee structure not found! Please ensure one exists for this class.");
      return;
    }

    if (!selectedFile) {
      toast.error("Please upload an Excel/CSV file!");
      return;
    }

    if (!academicYear) {
      toast.error("Please select an academic year!");
      return;
    }

    // === Prepare FormData ===
    const formData = new FormData();
    formData.append("classId", classId);
    formData.append("csvfile", selectedFile);
    formData.append("feeStructureId", feesData?.results?._id);
    formData.append("academicYear", academicYear);

    importMutation.mutate(formData);
  };




  // ✅ Fetch classes (for filter)
  const { data: classData, isLoading: classLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: () => apiGet(apiPath.activeClasses), // make sure apiPath.getClasses is your class endpoint
  });
  const classOptions = classData?.results?.docs?.map((cls) => ({
    value: cls._id,
    label: cls.name
  })) || [];
  console.log("classdata", classData);
  const selectedClasss = classData?.results?.docs?.find(
    (item) => item._id === classId
  );

  const className = selectedClasss ? `${selectedClasss.name}` : "N/A";


  const { data: feesData, isLoading: feesLoading } = useQuery({
    queryKey: ["feesStructuredata", classId],
    queryFn: () =>
      apiGet(`${apiPath.getFeesStructure}?classIdentifier=${className}`),
    enabled: !!classId,
  });
  useEffect(() => {
    if (feesData?.results) {
      // Example response: { feeHeads: [...], totalAmount: 5000, academicYear: "2025-2026" }
      const fetched = feesData.results;

      setFormData((prev) => ({
        ...prev,
        feeHeads: fetched.feeHeads || prev.feeHeads,
        totalAmount: fetched.totalAmount || 0,
        academicYear: fetched.academicYear || prev.academicYear,
      }));
    }
  }, [feesData]);
  // ✅ Fetch students
  // const { data: studentsData, isLoading, isFetching, error } = useQuery({
  //   queryKey: [
  //     "students",
  //     pagination.pageIndex,
  //     pagination.pageSize,
  //     debouncedSearch,
  //     classFilter,
  //     academicYearFilter,
  //   ],
  //   queryFn: () =>
  //     apiGet(apiPath.getStudents, {
  //       page: pagination.pageIndex + 1,
  //       limit: pagination.pageSize,
  //       search: debouncedSearch,
  //       classId: classFilter || undefined, // pass classId if selected
  //     }),
  // });
  const {
  data: studentsData,
  isLoading,
  isFetching,
  error,
} = useQuery({
  queryKey: [
    "students",
    classFilter || "all",   // 👈 important for caching
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
    academicYearFilter,
  ],
  queryFn: () => {
    // 🔹 URL decide karo
    const url = classFilter
      ? `${apiPath.getStudents}/${classFilter}` // /students/:id
      : apiPath.getStudents;                   // /students (all)

    return apiGet(url, {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearch || undefined,
      academicYear: academicYearFilter || undefined,
    });
  },
});

  const handleExportCSV = () => {
    try {
      const docs = studentsData?.results?.docs || [];

      if (!docs.length) {
        toast.error("No data to export");
        return;
      }

      // 👉 Map your table rows to a flat CSV-friendly shape
      const rows = docs.map((cls, idx) => {
  const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 01-12
  const day = String(date.getDate()).padStart(2, "0"); // 01-31
  return `${year}/${month}/${day}`; // → "2013/02/05"
};
        
        // status ko normalize: true/'active' -> Active else Inactive
        const statusNorm =
          cls?.status === true || cls?.status === "active" ? "Active" : "Inactive";

        // subjects: string[] ya null
        //   const subjects =
        //     Array.isArray(cls?.classTeacher?.subjectsHandled) ? cls?.classTeacher?.subjectsHandled?.map((c)=>c?.subjectName).join(", ") : "N/A";

        return {
          
          // "S No.": idx + 1,
          // "Subject Name": cls?.name || "",
          // Description: cls?.description || "",
          // code: cls?.code ?? 0,
          // Status: statusNorm,
          // "Created At": formatDate(cls?.createdAt),
          // "Updated At": formatDate(cls?.updatedAt),
          "Name": cls?.name,
          "email": cls?.email,           // e.g., 10th
          "phone": cls?.phone,    
          "classname":cls?.className,     // e.g., A
         "dob": formatDate(cls?.dob),
          "gender": cls?.gender,
          "bloodGroup": cls?.bloodGroup,          // Male/Female/Other
          "parent1Name": cls?.parents[0]?.name,             // 2025-11-10 or 10/11/2025
          "parent1Occupation": cls?.parents[0]?.occupation,
          "parent1Phone": cls?.parents[0]?.phone,
          "parent1Email": cls?.parents[0]?.email,    // active/inactive (optional)
          "parent2Name": cls?.parents[1]?.name,
          "parent2Email": cls?.parents[1]?.email,
          "guardianName": cls?.guardian?.name,
          "guardianRelation": cls?.guardian?.relation,
          "guardianOccupation": cls?.guardian?.occupation,
          "guardianPhone": cls?.guardian?.phone,
          "emergencyContactName": cls?.emergencyContact?.name,
          "emergencyContactRelation": cls?.emergencyContact?.relation,
          "emergencyContactPhone": cls?.emergencyContact?.phone,
          "street": cls?.address?.street,
          "city": cls?.address?.city,
          "state": cls?.address?.state,
          "zip": cls?.address?.zip,
          "country": cls?.address?.country,
          "aadharFront": cls?.aadharFront,
          "aadharBack": cls?.aadharBack,
          // "discounts": "",
          // "feeHeads": ""

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
      const filename = `students${stamp}.csv`;

      // 👉 Trigger download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      saveAs(blob, filename);

      toast.success("CSV exported successfully ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export CSV ❌");
    }
  };
  // --- DELETE MUTATION ---
  const deleteMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      apiPut(`${apiPath.studentDelete}/${id}`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student deleted successfully ✅");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete student ❌");
    },
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({
    id: null,
    name: "",
    reason: "",
  });

  const openDeleteModal = (student) => {
    setDeleteTarget({ id: student._id, name: student.name, reason: "" });
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget.reason) {
      toast.error("Please provide a reason for deletion");
      return;
    }
    deleteMutation.mutate({ id: deleteTarget.id, reason: deleteTarget.reason });
    setDeleteModalOpen(false);
  };
  const downloadStudentTemplate = () => {
    // Columns you want the admin to fill
    const templateRows = [
      {
        "name": "john",
        "email": "john@gmail.com",           // e.g., 10th
        "phone": "9876543210",         // e.g., A
        "dob": "2004/10/08",
        "gender": "Male",
        "bloodGroup": "A+",          // Male/Female/Other
        "parent1Name": "Doe",             // 2025-11-10 or 10/11/2025
        "parent1Occupation": "doctor",
        "parent1Phone": "8767673647",
        "parent1Email": "doe@gmail.coom",    // active/inactive (optional)
        "parent2Name": "Fiza",
        "parent2Occupation":"teacher",
        "parent2Phone":"9867867567",
        "parent2Email": "fiza@gmail.com",
        "guardianName": "amily",
        "guardianRelation": "sister",
        "guardianOccupation": "teacher",
        "guardianPhone": "9867463546",
        "emergencyContactName": "honey",
        "emergencyContactRelation": "brother",
        "emergencyContactPhone": "9867475748",
        "street": "first",
        "city": "jaipur",
        "state": "Rajasthan",
        "zip": "304040",
        "country": "India",
         "class":"1st",
        "aadharFront": "",
        "aadharBack": "",
 



      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateRows, { skipHeader: false });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StudentsTemplate");
    XLSX.writeFile(wb, "Students_Template.csv",{bookType:"csv"});
  };


  // --- Table Columns ---
  const columns = useMemo(
    () => [
      {
        header: "S No.",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "profilePic",
        header: "Profile Pic",
        cell: ({ row }) => (
          <img
            src={`${row.original.profilePic}` || "/default-avatar.png"}
            alt={row.original.name}
            className="w-10 h-10 rounded-full object-cover border"
          />
        ),
      },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "gender", header: "Gender" },
      { accessorKey: "bloodGroup", header: "Blood Group" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      {
        accessorKey: "classId.name",
        header: "Class Name",
        cell: ({ row }) => row.original?.className || "N/A",
      },
      { accessorKey: "academicYear", header: "Academic Year" },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/admin/students/edit/${row.original._id}`)}
              className="text-yellow-400 text-[20px] hover:text-yellow-500"
            >
              <RiImageEditLine />
            </button>

            <button
              onClick={() => navigate(`/admin/students/${row.original._id}`)}
              className="text-green-600 text-[20px] hover:text-green-700"
            >
              <FaRegEye />
            </button>

            <button
              onClick={() => openDeleteModal(row.original)}
              className="text-red-600 text-[20px] hover:text-red-700"
            >
              <MdDelete />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const tableData = useMemo(
    () => studentsData?.results?.docs || [],
    [studentsData]
  );
  const totalPages = studentsData?.results?.totalPages || 1;

  return (
    <div>
      {/* Header + Filters */}
      <div className="flex p-6 justify-between items-center mb-4 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Students</h1>

        <div className="md:flex items-center justify-between w-full md:items-center gap-4">
          {/* ✅ Class Filter Dropdown */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            disabled={classLoading}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
          >
            <option value="">All Classes</option>
            {classData?.results?.docs?.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}  {cls.section}
              </option>
            ))}
          </select>

          {/* Add Student Button */}

          <div className="grid mt-2 grid-cols-2 text-[10px] md:text-[14px] md:flex gap-3">
            {/* Template download (optional but recommended) */}
          
            <Modal isOpen={showModel} title="Import Students (Excel)" onClose={() => setShowModal(false)}>
              <form onSubmit={handleImportSubmit} className="space-y-5">
                {/* <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Class <span className="text-red-500">*</span>
      </label>
      <Select
        name="classId"
        options={classOptions}
        onChange={(selected) => setClassId(selected.value)}
        placeholder="Select Class *"
      />
    </div> */}
                <div className="space-y-8">
                  {/* === Academic Information === */}
                  <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Academic Information
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-gray-200">
                      {/* Class Dropdown */}
                      <TextField
                        select
                        fullWidth
                        name="classId"
                        label="Select Class"
                        value={classId}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          // setErrors((prev) => ({ ...prev, classId: "" }));

                          setClassId(selectedId)


                          // setStudent({ ...student, classId: selectedId });
                          // setSelectedClass(selectedClassObj?.name || "");
                        }}
                      // error={!!errors.classId}
                      // helperText={errors.classId}
                      >
                        <MenuItem value="">Select Class</MenuItem>
                        {classData?.results?.docs?.map((cls) => (
                          <MenuItem key={cls._id} value={cls._id}>
                            {cls.name} {cls.section}
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Academic Year */}
                      <TextField
                        select
                        fullWidth
                        name="academicYear"
                        label="Academic Year"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                      >
                        {Array.from({ length: 5 }).map((_, i) => {
                          const currentYear = new Date().getFullYear();
                          const startYear = currentYear - i;
                          const endYear = startYear + 1;
                          const yearString = `${startYear}-${endYear}`;
                          return (
                            <MenuItem key={yearString} value={yearString}>
                              {yearString}
                            </MenuItem>
                          );
                        })}
                      </TextField>

                    </div>
                  </div>

                  {/* === Form Section === */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const tuition = formData.feeHeads.find(
                        (f) => f.type === "Tuition Fee"
                      );
                      const exam = formData.feeHeads.find((f) => f.type === "Exam Fee");

                      if (!tuition?.amount || !exam?.amount) {
                        toast.error("Tuition Fee and Exam Fee are required!");
                        return;
                      }

                      handleSubmit(e);
                    }}
                    className="space-y-4"
                  >
                    {classId && (
                      <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                        <label className="block text-lg font-semibold text-gray-700 mb-4">
                          Fee Heads
                        </label>

                        {/* 🌀 Loader */}
                        {feesLoading ? (
                          <div className="flex items-center gap-2 text-gray-600 text-sm bg-gray-50 p-3 rounded-md border border-gray-200">
                            <svg
                              className="animate-spin h-4 w-4 text-yellow-500"
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
                                d="M4 12a8 8 0 018-8v8z"
                              ></path>
                            </svg>
                            Fetching fee structure...
                          </div>
                        ) : !feesData?.success || !feesData?.results?.feeHeads?.length ? (
                          // ❌ Not found
                          <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200 flex items-center gap-2">
                            ❗ No fee structure found for this class. Please add one first.
                          </div>
                        ) : (
                          // ✅ Show fee heads if found
                          <>
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
                                isDisabled:
                                  selectedTypes.includes(opt.value) &&
                                  opt.value !== head.type,
                              }));

                              const isMandatory =
                                head.type === "Tuition Fee" || head.type === "Exam Fee";

                              return (
                                <div
                                  key={index}
                                  className="flex flex-wrap items-center gap-4 border border-gray-200 p-4 rounded-lg mb-3  shadow-sm hover:shadow-md transition-shadow transform hover:-translate-y-1"
                                >
                                  <div className="w-full sm:w-[260px]">
                                    <Select
                                      options={availableOptions}
                                      value={
                                        head.type
                                          ? { value: head.type, label: head.type }
                                          : null
                                      }
                                      placeholder="Select Fee Type"
                                      onChange={(opt) =>
                                        handleFeeHeadChange(index, "type", opt?.value || "")
                                      }
                                      isDisabled={isMandatory}
                                    />
                                  </div>

                                  <input
                                    type="number"
                                    placeholder="Amount"
                                    value={head.amount}
                                    onChange={(e) =>
                                      handleFeeHeadChange(
                                        index,
                                        "amount",
                                        Number(e.target.value)
                                      )
                                    }
                                    className="w-full sm:w-[140px] border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                  />
                                  {/*     
                                  <label className="flex items-center gap-2 text-sm w-auto">
                                    <input
                                      type="checkbox"
                                      checked={head.isOptional}
                                      onChange={(e) =>
                                        handleFeeHeadChange(
                                          index,
                                          "isOptional",
                                          e.target.checked
                                        )
                                      }
                                      disabled={isMandatory}
                                      className="h-4 w-4 text-yellow-500 cursor-pointer border-gray-300 rounded focus:ring-yellow-300"
                                    />
                                    Optional
                                  </label> */}

                                  {!isMandatory && (
                                    <button
                                      type="button"
                                      onClick={() => removeFeeHead(index)}
                                      className="text-red-500 hover:text-red-700 cursor-pointer text-sm font-medium transition-colors"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              );
                            })}

                            {/* {formData.feeHeads.length < 4 && (
                              <Button
                                // variant="contained"
                                style={{ background: "var(--gradient-primary)", color: "black" }}
                                startIcon={<FaPlusCircle />}
                                onClick={addFeeHead}
                                className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg mt-3 shadow-md"
                              >
                                Add Optional Fee
                              </Button>
                            )} */}
                          </>
                        )}
                      </div>
                    )}
                  </form>
                </div>

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
                  disabled={importMutation.isLoading}
                  className="w-full flex gap-1 justify-center  items-center bg-[image:var(--gradient-primary)]  py-2 rounded-lg  cursor-pointer transition"
                >
                  <FaFileExport />

                  {importMutation.isLoading ? "Importing..." : "Start Import"}
                </button>
              </form>
            </Modal>


            {/* Excel Import */}
            <label onClick={() => setShowModal(true)} className="px-3 flex gap-1 items-center md:justify-center py-2 rounded-md bg-[image:var(--gradient-primary)]  cursor-pointer">
          <RiImportFill />



              Import Students (Excel)

            </label>
            <button
              onClick={handleExportCSV}
              className="px-4 flex gap-1 items-center py-2 px-4 py-2 bg-[image:var(--gradient-primary)]  rounded-lg cursor-pointer hover:bg-blue-700 transition"
            >
              <FaFileExport />

              Export CSV
            </button>
              <button
              onClick={downloadStudentTemplate}
              className="px-3 flex gap-1 items-center md:justify-center py-2 rounded-md bg-[image:var(--gradient-primary)]   cursor-pointer"
            >
              <FaDownload />

              Download Format
            </button>
            <button
              onClick={() => navigate("/admin/students/create")}
              className="px-4 flex gap-1 items-center cursor-pointer md:justify-center py-2 bg-[image:var(--gradient-primary)] rounded-lg hover:bg-yellow-500 transition"
            >
              <IoAddCircle />
              Add Student
            </button>
            
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        title={`Delete ${deleteTarget.name}?`}
        onClose={() => setDeleteModalOpen(false)}
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this student?</p>
          <InputField
            label="Reason for deletion"
            name="reason"
            value={deleteTarget.reason}
            onChange={(e) =>
              setDeleteTarget((prev) => ({ ...prev, reason: e.target.value }))
            }
          />
          <div className="flex justify-end gap-2">
         <button
  type="button"
  onClick={confirmDelete}
  disabled={deleteMutation.isLoading}
  className={`w-full flex items-center cursor-pointer justify-center gap-2 
    bg-[image:var(--gradient-primary)] py-2 rounded-lg transition
    ${deleteMutation.isLoading ? "opacity-75 cursor-not-allowed" : ""}
  `}
>
  {deleteMutation.isLoading ? "Deleting..." : "Delete"}
</button>


          </div>
        </div>
      </Modal>

      {/* Table */}
      <div className={`
  overflow-x-auto transition-all duration-300 w-[98vw]
  ${collapsed ? "md:w-[95vw]" : "md:w-[80vw]"}
`}>
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
          tablePlaceholder="Search students..."
          error={error}
          isError={!!error}
          loading={isLoading}
          fetching={isFetching}
        />
      </div>
    </div>
  );
}
