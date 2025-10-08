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

export default function ClassPage() {
  const queryClient = useQueryClient();

  // Table state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    startTime: "",
    endTime: "",
  });
  const [errors, setErrors] = useState({});
  const debouncedSearch = useDebounce(globalFilter, 500);

  // Fetch classes
  const { data: classesData, isLoading, isFetching, error, isError } = useQuery({
    queryKey: ["classes", pagination.pageIndex, pagination.pageSize, debouncedSearch],
    queryFn: () =>
      apiGet(apiPath.classes, {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        name: debouncedSearch,
      }),
  });
console.log("classdata",classesData)
  // Convert 24h -> 12h for API
  const formatTo12Hour = (time) => {
    if (!time) return "";
    let [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  // Convert 12h -> 24h for input
  const formatTo24Hour = (time12h) => {
    if (!time12h) return "";
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "section") newValue = value.toUpperCase();
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const validClasses = [
      "Prep", "1st", "2nd", "3rd", "4th", "5th", "6th",
      "7th", "8th", "9th", "10th", "11th", "12th",
    ];

    if (!formData.name) newErrors.name = "Class name is required";
    else if (!validClasses.includes(formData.name.trim()))
      newErrors.name = "Invalid class name. Must be Prep or 1st to 12th";

    if (!formData.section) newErrors.section = "Section is required";
    else if (!/^[A-D]$/.test(formData.section))
      newErrors.section = "Section must be A, B, C, or D";

    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    classMutation.mutate({
      name: formData.name.trim(),
      section: formData.section.trim(),
      startTime: formatTo12Hour(formData.startTime),
      endTime: formatTo12Hour(formData.endTime),
    });
  };

  // Mutation for create/update class
  const classMutation = useMutation({
    mutationFn: (classObj) => {
      if (editingClass) return apiPut(`${apiPath.updateClass}/${editingClass._id}`, classObj);
      return apiPost(apiPath.createClassess, classObj);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success(editingClass ? "Class updated successfully ✅" : "Class created successfully 🎉");
      setIsModalOpen(false);
      setEditingClass(null);
      setFormData({ name: "", section: "", startTime: "", endTime: "" });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
    },
  });

  // Delete class mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/admins/classes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["classes"] }),
  });

  // Table columns
  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Class" },
      { accessorKey: "section", header: "Section" },
      { accessorKey: "studentCount", header: "Students" },
      { header: "Teacher Name", accessorFn: (row) => row.classTeacher?.name || "N/A" },
      { header: "Teacher Email", accessorFn: (row) => row.classTeacher?.email || "N/A" },
      { header: "Teacher Department", accessorFn: (row) => row.classTeacher?.department || "N/A" },
      { header: "Teacher Specialization", accessorFn: (row) => row.classTeacher?.specialization || "N/A" },
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
                  startTime: formatTo24Hour(cls.startTime || "09:00 AM"),
                  endTime: formatTo24Hour(cls.endTime || "03:30 PM"),
                });
                setIsModalOpen(true);
              }}
              className="text-[20px] text-yellow-400"
            >
              <RiImageEditLine />
            </button>
          </div>
        ),
      },
    ],
    [deleteMutation]
  );

  const tableData = useMemo(() => classesData?.results?.docs || [], [classesData]);
  const totalPages = classesData?.results?.totalPages || 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Classes</h1>
        <button
          onClick={() => {
            setEditingClass(null);
            setFormData({ name: "", section: "", startTime: "", endTime: "" });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-yellow-400 cursor-pointer rounded-lg hover:bg-yellow-400 transition"
        >
          Create Class
        </button>
      </div>

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
          totalCount={totalPages || 1}
          tablePlaceholder="Search classes..."
          fetching={isFetching}
          loading={isLoading}
          error={error}
          isError={error}
        />
        {(isLoading || isFetching) && <Loader />}
      </div>

      {/* Modal */}
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

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                name="startTime"
                className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2 text-gray-700"
                value={formData.startTime}
                onChange={handleChange}
              />
              {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime}</p>}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                name="endTime"
                className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2 text-gray-700"
                value={formData.endTime}
                onChange={handleChange}
              />
              {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime}</p>}
            </div>
          </div>

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
