
import React, { useState, useMemo } from "react";
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

export default function StudentPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [viewData, setViewData] = useState([]);
  const [classFilter, setClassFilter] = useState(""); // ✅ filter state
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [errors, setErrors] = useState({});
  const debouncedSearch = useDebounce(globalFilter, 500);

  // ✅ Fetch classes (for filter)
  const { data: classData, isLoading: classLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: () => apiGet(apiPath.classes), // make sure apiPath.getClasses is your class endpoint
  });

  // ✅ Fetch students
  const { data: studentsData, isLoading, isFetching, error } = useQuery({
    queryKey: [
      "students",
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearch,
      classFilter,
      academicYearFilter,
    ],
    queryFn: () =>
      apiGet(apiPath.getStudents, {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch,
        classId: classFilter || undefined, // pass classId if selected
      }),
  });

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

  // --- Table Columns ---
  const columns = useMemo(
    () => [
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
        cell: ({ row }) => row.original.classId?.name || "N/A",
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

        <div className="flex items-center justify-between w-full md:items-center gap-4">
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
          <button
            onClick={() => navigate("/admin/students/create")}
            className="px-4 py-2 bg-[image:var(--gradient-primary)] rounded-lg hover:bg-yellow-500 transition"
          >
            Add Student
          </button>
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
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Table */}
      <div className="overflow-x-auto w-[98vw] md:w-[80vw]">
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
