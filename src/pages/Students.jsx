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

export default function StudentPage() {
  const queryClient = useQueryClient();
const navigate =useNavigate();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [viewData, setViewData] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  
  const [errors, setErrors] = useState({});
  const debouncedSearch = useDebounce(globalFilter, 500);

  // Fetch students
  const { data: studentsData, isLoading, isFetching, error } = useQuery({
    queryKey: ["students", pagination.pageIndex, pagination.pageSize, debouncedSearch,  classFilter,
        academicYearFilter],
    queryFn: () =>
      apiGet(apiPath.getStudents, {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch,
      }),
  });




  // Inside StudentPage component

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
      // { accessorKey: "dob", header: "DOB" },
      { accessorKey: "gender", header: "Gender" },
      { accessorKey: "bloodGroup", header: "Blood Group" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "name", header: "Class Name" },
      { accessorKey: "academicYear", header: "Academic Year" },
      // {
      //   header: "Parent / Guardian",
      //   cell: ({ row }) => {
      //     const student = row.original;
      //     const parent = student.parents?.[0];
      //     const guardian = student.guardian;
      //     return parent ? `${parent.name} (${parent.phone})` : guardian ? `${guardian.name} (${guardian.phone})` : "N/A";
      //   },
      // },
    {
  header: "Actions",
  cell: ({ row }) => (
    <div className="flex gap-2">
      <button
       onClick={() => navigate(`/admin/students/edit/${row.original._id}`)}
        className="text-yellow-400 text-[20px] cursor-pointer hover:text-yellow-500"
      >
        <RiImageEditLine />
      </button>

      <button
        onClick={() => navigate(`/admin/students/${row.original._id}`)}
        className="text-green-600 text-[20px] cursor-pointer hover:text-green-700"
      >
        <FaRegEye />
      </button>

      <button
        onClick={() => openDeleteModal(row.original)}
        className="text-red-600 text-[20px] cursor-pointer hover:text-red-700"
      >
       <MdDelete />
      </button>
    </div>
  ),
}

    ],
    []
  );

  const tableData = useMemo(() => studentsData?.results?.docs || [], [studentsData]);
  const totalPages = studentsData?.results?.totalPages || 1;

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

      {/* Create / Edit Modal */}
      {/* <Modal isOpen={isModalOpen} title={editingStudent ? "Edit Student" : "Create Student"} onClose={() => setIsModalOpen(false)}>
        <form  className="space-y-4 overflow-y-auto max-h-[70vh]">
          <InputField label="Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
          <InputField label="DOB" name="dob" type="date" value={formData.dob} onChange={handleChange} error={errors.dob} />
          <InputField label="Gender" name="gender" value={formData.gender} onChange={handleChange} error={errors.gender} />
          <InputField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} error={errors.bloodGroup} />
          <InputField label="Email" name="email" value={formData.email} onChange={handleChange} error={errors.email} />
          <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} />
          <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} />

          <h3 className="font-semibold mt-2">Address</h3>
          {["street","city","state","zip","country"].map(field => (
            <InputField key={field} label={field.charAt(0).toUpperCase() + field.slice(1)} name={field} value={formData.address[field]} onChange={(e) => handleChange(e,"address")} />
          ))}

          <h3 className="font-semibold mt-2">Parents</h3>
          {formData.parents.map((parent, idx) => (
            <div key={idx} className="space-y-1">
              <InputField label={`Parent ${idx+1} Name`} name="name" value={parent.name} onChange={(e) => handleChange(e, idx, "parent")} />
              <InputField label={`Parent ${idx+1} Occupation`} name="occupation" value={parent.occupation} onChange={(e) => handleChange(e, idx, "parent")} />
              <InputField label={`Parent ${idx+1} Phone`} name="phone" value={parent.phone} onChange={(e) => handleChange(e, idx, "parent")} />
              <InputField label={`Parent ${idx+1} Email`} name="email" value={parent.email} onChange={(e) => handleChange(e, idx, "parent")} />
            </div>
          ))}

          <h3 className="font-semibold mt-2">Guardian</h3>
          {["name","relation","occupation","phone"].map(field => (
            <InputField key={field} label={field.charAt(0).toUpperCase() + field.slice(1)} name={field} value={formData.guardian[field]} onChange={(e) => handleChange(e,"guardian")} />
          ))}

          <h3 className="font-semibold mt-2">Emergency Contact</h3>
          {["name","relation","phone","address"].map(field => (
            <InputField key={field} label={field.charAt(0).toUpperCase() + field.slice(1)} name={field} value={formData.emergencyContact[field]} onChange={(e) => handleChange(e,"emergencyContact")} />
          ))}

          <InputField label="Class ID" name="classId" value={formData.classId} onChange={handleChange} />
          <InputField label="Academic Year" name="academicYear" value={formData.academicYear} onChange={handleChange} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.physicalDisability} onChange={(e) => setFormData(prev => ({...prev, physicalDisability: e.target.checked}))} />
            Physical Disability
          </label>
          {formData.physicalDisability && (
            <InputField label="Disability Details" name="disabilityDetails" value={formData.disabilityDetails} onChange={handleChange} />
          )}

          <button type="submit" disabled={studentMutation.isLoading} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
            {studentMutation.isLoading ? "Saving..." : editingStudent ? "Update Student" : "Create Student"}
          </button>
        </form>
      </Modal> */}

      <div className="flex p-6 justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Students</h1>
        <button
   onClick={()=>navigate("/admin/students/create")}
          className="px-4 py-2 bg-yellow-400 rounded-lg hover:bg-yellow-500 cursor-pointer transition"
        >
          Add Student
        </button>
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

      <div className="overflow-x-auto  w-[90vw] md:w-[80vw]">
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
        {/* {(isLoading || isFetching) && <Loader />} */}
      </div>
    </div>
  );
}
