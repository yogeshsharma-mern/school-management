import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReusableTable from "../components/Table";
import Modal from "../components/Modal";
import InputField from "../components/InputField";
import { apiGet, apiPost, apiPut, apiDelete } from "../api/apiFetch";
import apiPath from "../api/apiPath";
import useDebounce from "../hooks/useDebounce";
import toast from "react-hot-toast";
import { RiImageEditLine } from "react-icons/ri";
import { FaRegEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { FaFileExport } from "react-icons/fa";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { IoIosAddCircle } from "react-icons/io";
import * as XLSX from "xlsx";
import { FaDownload } from "react-icons/fa6";
import { useSelector } from "react-redux";


export default function StudentPage() {
  const queryClient = useQueryClient();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewData, setViewData] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed);

  const debouncedSearch = useDebounce(globalFilter, 500);

  // Fetch students
  const { data: classes = [], isLoading: classesloadiing, isError } = useQuery({
    queryKey: ["classesForStudent"],
    queryFn: () => apiGet(apiPath.classes),
  });
  const { data: subjects = [], isLoading: isloading, isError: iserr } = useQuery({
    queryKey: ["subjectForTeacher"],
    queryFn: () => apiGet(apiPath.getSubjects),
  });
  const { data: studentsData, isLoading, isFetching, error } = useQuery({
    queryKey: ["teachers", pagination.pageIndex, pagination.pageSize, debouncedSearch, classFilter,
      academicYearFilter],
    queryFn: () =>
      apiGet(apiPath.getTeachers, {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch,
      }),
  });
  const downloadStudentTemplate = () => {
    // Columns you want the admin to fill
    const templateRows = [
      {
        employeeId: "EMP-1001",
        name: "John Doe",
        email: "john.doe@school.com",
        phone: "9876543210",
        dob: "03/15/1980",          // Use YYYY/MM/DD format
        gender: "Male",
        maritalStatus: "Married",   // Married / Single / Divorced / Widowed
        street: "45 MG Road",
        city: "Delhi",
        state: "Delhi",
        zip: "110001",
        country: "India",
        bloodGroup: "B+",           // A+, A-, B+, B-, AB+, AB-, O+, O-
        physicalDisability: "FALSE",     // TRUE / FALSE
        disabilityDetails: "",           // Leave empty if FALSE
        designation: "Mathematics Teacher",
        qualifications: "M.Sc Mathematics;B.Ed", // separate with semicolon
        specialization: "Mathematics",
        experience: "15",                 // in years
        dateOfJoining: "06/01/2015",
        classes: "10th-C,12th-B",         // comma separated  
        subjects: "science,sanskrit",     // comma separated
        basicSalary: "75000",
        allowances: "15000",
        deductions: "8000",
        netSalary: "82000",
        emergencyContactName: "Seema Sharma",
        emergencyContactRelation: "Spouse",
        emergencyContactPhone: "9876543211",
        emergencyContactAddress: "45 MG Road, Delhi",

      }
    ];


    const ws = XLSX.utils.json_to_sheet(templateRows, { skipHeader: false });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TeacherTemplate");
    XLSX.writeFile(wb, "Teachers.csv", { bookType: "csv" });
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
          console.log("year", year);
          const month = String(date.getMonth() + 1) // 01-12
          const day = String(date.getDate()).padStart(2, "0"); // 01-31
          return `${year}/${month}/${day}`; // → "2013/02/05"
        };
        console.log("format?????????", formatDate(cls?.dob));

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
        const subjects =
          Array.isArray(cls?.subjectsHandled) && cls.subjectsHandled.length > 0
            ? cls.subjectsHandled
              .map(
                (s) =>
                  `${s?.subjectName || "N/A"}${s?.subjectCode ? ` (${s.subjectCode})` : ""
                  }`
              )
              .join(", ")
            : "N/A";

        // subjects: string[] ya null
        //   const subjects =
        //     Array.isArray(cls?.classTeacher?.subjectsHandled) ? cls?.classTeacher?.subjectsHandled?.map((c)=>c?.subjectName).join(", ") : "N/A";
        return {
          "Name": cls?.name || "",
          "email": cls?.email || "",
          "phone": cls?.phone || "",
          "dob": formatDate(cls?.dob),
          "gender": cls?.gender || "",
          "bloodGroup": cls?.bloodGroup || "",
          "designation": cls?.designation || "",
          "specialization": Array.isArray(cls?.specialization)
            ? cls.specialization.join(", ")
            : "",
          "qualifications": Array.isArray(cls?.qualifications)
            ? cls.qualifications.join(", ")
            : "",
          "experience (years)": cls?.experience ?? "",
          "dateOfJoining": formatDate(cls?.dateOfJoining),
          "subjectsHandled": subjects,
          "salary_basic": cls?.salaryInfo?.basic ?? "",
          "salary_allowances": cls?.salaryInfo?.allowances ?? "",
          "salary_deductions": cls?.salaryInfo?.deductions ?? "",
          "salary_net": cls?.salaryInfo?.netSalary ?? "",
          "street": cls?.address?.street || "",
          "city": cls?.address?.city || "",
          "state": cls?.address?.state || "",
          "zip": cls?.address?.zip || "",
          "country": cls?.address?.country || "",
          "aadharFront": cls?.aadharFront?.fileUrl || "",
          "aadharBack": cls?.aadharBack?.fileUrl || "",
          "emergencyContactName": cls?.emergencyContact?.name || "",
          "emergencyContactRelation": cls?.emergencyContact?.relation || "",
          "emergencyContactPhone": cls?.emergencyContact?.phone || "",
          "status": cls?.status,
          "createdAt": formatcreatedandupdated(cls?.createdAt),
          "updatedAt": formatcreatedandupdated(cls?.updatedAt),
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
  const importMutation = useMutation({
    mutationFn: async (formData) =>
      apiPost(apiPath.importTeacher, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: (res) => {
      const { summary } = res || {};

      // ✅ Base success message
      toast.success(res.message || "Students imported successfully ✅");
         queryClient.invalidateQueries(["teachers"]);
      
      setModalOpen(false);

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
    formData.append("csvfile", selectedFile);
    importMutation.mutate(formData);
  };
  // Mutation for create/update student
  // const studentMutation = useMutation({
  //   mutationFn: (studentObj) => {
  //     if (editingStudent) return apiPut(`${apiPath.updateStudent}/${editingStudent._id}`, studentObj);
  //     return apiPost(apiPath.createStudent, studentObj);
  //   },

  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["students"] });
  //     toast.success(editingStudent ? "Student updated successfully ✅" : "Student created successfully 🎉");
  //     setIsModalOpen(false);
  //     setEditingStudent(null);
  //     setFormData({
  //       name: "",
  //       dob: "",
  //       gender: "",
  //       bloodGroup: "",
  //       email: "",
  //       password: "",
  //       phone: "",
  //       address: { street: "", city: "", state: "", zip: "", country: "" },
  //       parents: [{ name: "", occupation: "", phone: "", email: "" }, { name: "", occupation: "", phone: "", email: "" }],
  //       guardian: { name: "", relation: "", occupation: "", phone: "" },
  //       emergencyContact: { name: "", relation: "", phone: "", address: "" },
  //       classId: "",
  //       academicYear: "",
  //       physicalDisability: false,
  //       disabilityDetails: ""
  //     });
  //   },
  //   onError: (error) => {
  //     const errorMessage = error?.response?.data?.message || "Something went wrong.";
  //     toast.error(errorMessage);
  //   },
  // });


  // Inside StudentPage component

  // --- DELETE MUTATION ---
  const deleteMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      apiPut(`${apiPath.deleteTeacher}/${id}`, { reason }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success(data.message || "Student deleted successfully ✅");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete student ❌");
    },
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: null, name: "", reason: "" });

  // --- HANDLE DELETE ---
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

  // Table columns
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
            src={`${row.original.profilePic?.fileUrl}` || "/default-avatar.png"}
            alt={row.original.name}
            className="w-10 h-10 rounded-full object-cover border"
          />
        ),
      },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "gender", header: "Gender" },
      // { accessorKey: "bloodGroup", header: "Blood Group" },
      // { accessorKey: "department", header: "Department" },
      // { accessorKey: "designation", header: "Designation" },
      // {
      //   accessorKey: "experience",
      //   header: "Experience (Years)",
      //   cell: ({ row }) => `${row.original.experience || 0} yrs`,
      // },
      {
        accessorKey: "dateOfJoining",
        header: "Joining Date",
        cell: ({ row }) =>
          new Date(row.original.dateOfJoining).toLocaleDateString(),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${row.original.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-600"
              }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/admin/teachers/edit/${row.original._id}`)}
              className="text-yellow-500 text-[20px] hover:text-yellow-600"
              title="Edit"
            >
              <RiImageEditLine />
            </button>

            <button
              onClick={() => navigate(`/admin/teachers/${row.original._id}`)}
              className="text-green-600 cursor-pointer text-[20px] hover:text-green-700"
              title="View"
            >
              <FaRegEye />
            </button>

            <button
              onClick={() => openDeleteModal(row.original)}
              className="text-red-600 cursor-pointer text-[20px] hover:text-red-700"
              title="Delete"
            >
              <MdDelete />
            </button>

          </div>
        ),
      },
    ],
    []
  );


  const tableData = useMemo(() => studentsData?.results?.docs || [], [studentsData]);
  const totalPages = studentsData?.results?.pagination?.totalPages || 1;

  return (
    <div>
      {/* View Modal */}
      <Modal isOpen={viewModal} title="Student Details" onClose={() => setViewModal(false)}>
        {viewData && (
          <div className="space-y-2">
            <p><strong>Name:</strong> {viewData.name}</p>
            <p><strong>DOB:</strong> {viewData.dob}</p>
            <p><strong>Gender:</strong> {viewData.gender}</p>
            <p><strong>Blood Group:</strong> {viewData.bloodGroup}</p>
            <p><strong>Email:</strong> {viewData.email}</p>
            <p><strong>Phone:</strong> {viewData.phone}</p>
            <p><strong>Address:</strong> {`${viewData.address?.street}, ${viewData.address?.city}, ${viewData.address?.state}, ${viewData.address?.zip}, ${viewData.address?.country}`}</p>
            <p><strong>Parents:</strong> {viewData.parents?.map(p => `${p.name} (${p.phone})`).join(", ")}</p>
            <p><strong>Guardian:</strong> {viewData.guardian ? `${viewData.guardian.name} (${viewData.guardian.phone})` : "N/A"}</p>
            <p><strong>Emergency Contact:</strong> {viewData.emergencyContact ? `${viewData.emergencyContact.name} (${viewData.emergencyContact.phone})` : "N/A"}</p>
            <p><strong>Class:</strong> {viewData.classId}</p>
            <p><strong>Academic Year:</strong> {viewData.academicYear}</p>
            <p><strong>Disability:</strong> {viewData.physicalDisability ? viewData.disabilityDetails : "No"}</p>
          </div>
        )}
      </Modal>



      <div className="md:flex p-6 justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Teachers</h1>
        <div className="md:flex grid grid-cols-2 text-[11px] md:text-[14px] gap-2">
          <button
            // onClick={handleExportCSV}
            onClick={() => setModalOpen(true)}
            className="px-4 flex gap-1 items-center text-center py-2 px-4 py-2 bg-[image:var(--gradient-primary)]  rounded-lg cursor-pointer hover:bg-blue-700 transition"
          >
            <FaFileExport />

            Import CSV
          </button>
          <button
            onClick={downloadStudentTemplate}
            className="px-3 flex gap-1 items-center md:justify-center py-2 rounded-md bg-[image:var(--gradient-primary)]   cursor-pointer"
          >
            <FaDownload />

            Download Format
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 flex gap-1 items-center py-2 px-4 py-2 bg-[image:var(--gradient-primary)]  rounded-lg cursor-pointer hover:bg-blue-700 transition"
          >
            <FaFileExport />

            Export CSV
          </button>



          <button
            onClick={() => navigate("/admin/teachers/create")}
            className="px-4 py-2 flex gap-1 items-center bg-[image:var(--gradient-primary)] rounded-lg hover:bg-yellow-500 cursor-pointer transition"
          >
            <IoIosAddCircle />
            Add Teacher
          </button>


        </div>
      </div>
      <Modal isOpen={deleteModalOpen} title={`Delete ${deleteTarget.name}?`} onClose={() => setDeleteModalOpen(false)}>
        <div className="space-y-4">
          <p>Are you sure you want to delete this student?</p>
          <InputField
            label="Reason for deletion"
            name="reason"
            value={deleteTarget.reason}
            onChange={(e) => setDeleteTarget(prev => ({ ...prev, reason: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-300 cursor-pointer rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white cursor-pointer rounded hover:bg-red-700"
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Details For Excel Import" >
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
            className="w-full mt-8 flex gap-1 justify-center  items-center bg-[image:var(--gradient-primary)]  py-2 rounded-lg  cursor-pointer transition"
          >
            <FaFileExport />

            {/* {importMutation.isLoading ? "Importing..." : "Start Import"} */}
            Start Import
          </button>
        </form>
      </Modal>
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
          tablePlaceholder="Search teachers..."
          error={error}
          isError={!!error}
          loading={isLoading}
          fetching={isFetching}
        />
      </div>
    </div>
  );
}
