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
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaFileExport } from "react-icons/fa";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { IoIosAddCircle } from "react-icons/io";


export default function StudentPage() {
  const queryClient = useQueryClient();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [viewData, setViewData] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [errors, setErrors] = useState({});
  const debouncedSearch = useDebounce(globalFilter, 500);

  // Fetch students
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
  console.log("year",year);
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
              `${s?.subjectName || "N/A"}${
                s?.subjectCode ? ` (${s.subjectCode})` : ""
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
      { accessorKey: "bloodGroup", header: "Blood Group" },
      // { accessorKey: "department", header: "Department" },
      { accessorKey: "designation", header: "Designation" },
      {
        accessorKey: "experience",
        header: "Experience (Years)",
        cell: ({ row }) => `${row.original.experience || 0} yrs`,
      },
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



      <div className="flex p-6 justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Teachers</h1>
<div className="flex gap-2">
         
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

      <div className="overflow-x-auto  w-[98vw] md:w-[80vw]">
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
