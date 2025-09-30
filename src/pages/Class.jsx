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

export default function ClassPage() {
  const queryClient = useQueryClient();

  // Table state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({ name: "", section: "", subjects: "" });
  const [errors, setErrors] = useState({});
  const debouncedSearch = useDebounce(globalFilter, 500);
  // Fetch classes
  const { data: classesData, isLoading, isFetching } = useQuery({
    queryKey: ["classes", pagination.pageIndex, pagination.pageSize, debouncedSearch],
    queryFn: () => apiGet(apiPath.classes, {
      page: pagination.pageIndex + 1,  // backend usually 1-indexed
      limit: pagination.pageSize,
      search: debouncedSearch,
    }),
  });

  // Mutation for create/update class
  const classMutation = useMutation({
    mutationFn: (classObj) => {
      if (editingClass) {
        return apiPut(`${apiPath.updateClass}/${editingClass._id}`, classObj);
      }
      return apiPost(apiPath.createClassess, classObj);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });

      if (editingClass) {
        toast.success("Class updated successfully ✅");
      } else {
        toast.success("Class created successfully 🎉");
      }

      setIsModalOpen(false);
      setEditingClass(null);
      setFormData({ name: "", section: "" });
    },
    onError: (error) => {
      // Show server error message if available
      const errorMessage =
        error?.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
    },
  });


  // Delete class mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/admins/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;
    if (name === "section") {
      newValue = value.toUpperCase(); // auto enforce uppercase
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const validClasses = [
      "Prep", // or "Pre-primary"
      "1st", "2nd", "3rd", "4th", "5th", "6th",
      "7th", "8th", "9th", "10th", "11th", "12th"
    ];
    // Class name validation (only letters, numbers, spaces, max 20 chars)
    if (!formData.name) {
      newErrors.name = "Class name is required";
    } else if (!validClasses.includes(formData.name.trim())) {
      newErrors.name = "Invalid class name. Must be Prep or 1st to 12th";
    }

    // Section validation (must be A, B, C, or D)
    if (!formData.section) {
      newErrors.section = "Section is required";
    } else if (!/^[A-D]$/.test(formData.section)) {
      newErrors.section = "Section must be A, B, C, or D (capital letter)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    classMutation.mutate({
      name: formData.name.trim(),
      section: formData.section.trim(),
      // subjects: formData.subjects.split(",").map((s) => s.trim()),
    });
  };


  //   {
  //                 "_id": "68d4f6f3f969f85ab73c9a32",
  //                 "name": "12th",
  //                 "section": "A",
  //                 "studentCount": 10,
  //                 "classIdentifier": "9b1deb4d-3b7d-4c2e-9f3e-2d3f1a2b4c5d",
  //                 "classTeacher": {
  //                     "_id": "68d6465b5982bd19f22c4a51",
  //                     "name": "Ravi Kumar",
  //                     "email": "8833ashusoni@gmail.com",
  //                     "department": "Mathematics",
  //                     "specialization": "Algebra"
  //                 }
  const columns = useMemo(
    () => [
      // { accessorKey: "_id", header: "ID" },
      { accessorKey: "name", header: "Class" },
      { accessorKey: "section", header: "Section" },
      { accessorKey: "studentCount", header: "Students" },

      {
        header: "Teacher Name",
        accessorFn: (row) => row.classTeacher?.name || "N/A",
      },
      {
        header: "Teacher Email",
        accessorFn: (row) => row.classTeacher?.email || "N/A",
      },
      {
        header: "Teacher Department",
        accessorFn: (row) => row.classTeacher?.department || "N/A",
      },
      {
        header: "Teacher Specialization",
        accessorFn: (row) => row.classTeacher?.specialization || "N/A",
      },

      {
        accessorKey: "subjects",
        header: "Subjects",
        cell: ({ getValue }) => (getValue() ? getValue().join(", ") : "N/A"),
      },

      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => {
                const cls = row.original;
                setEditingClass(cls);
                setFormData({
                  name: cls.name,
                  section: cls.section,
                  // subjects: cls.subjects?.join(", ") || "",
                });
                setIsModalOpen(true);
              }}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
            {/* <button
            onClick={() => deleteMutation.mutate(row.original._id)} // ✅ use _id instead of id
            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button> */}
          </div>
        ),
      },
    ],
    [deleteMutation]
  );


  const tableData = useMemo(() => classesData?.results?.docs || [], [classesData]);
  console.log("classdata", classesData)

  const totalPages = classesData?.results?.totalPages || 1;


  return (
    <div>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Classes</h1>
        <button
          onClick={() => {
            setEditingClass(null);
            setFormData({ name: "", section: "", subjects: "" });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-yellow-400 cursor-pointer rounded-lg hover:bg-yellow-400 transition"
        >
          Create Class
        </button>
      </div>
      <div className="overflow-x-auto  realtive w-[90vw] md:w-[80vw]">

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
          tablePlaceholder="Search classes..."
        />
        {(isLoading || isFetching) && <Loader />}
      </div>
      {/* Modal for create/edit */}
      <Modal
        isOpen={isModalOpen}
        title={editingClass ? "Edit Class" : "Create Class"}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Class Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="11th"
            error={errors.name}
          />
          <InputField
            label="Section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            placeholder="A"
            error={errors.section}
          />
          {/* <InputField
            label="Subjects"
            name="subjects"
            value={formData.subjects}
            onChange={handleChange}
            placeholder="Math, Science, English"
            error={errors.subjects}
          /> */}
          <button
            type="submit"
            disabled={classMutation.isLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {classMutation.isLoading ? "Saving..." : editingClass ? "Update Class" : "Create Class"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
