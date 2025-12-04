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
import ToggleButton from "../components/ToggleButton";
import { IoIosAddCircleOutline } from "react-icons/io";
import Select from "react-select";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { FaFileExport } from "react-icons/fa";
import { useSelector } from "react-redux";




export default function ClassPage() {
  const queryClient = useQueryClient();

  // Table state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [addclassTeacherModal,setClassTeacherModal] = useState(false);
  const [selectedTeacher,setSelectedTeacher] = useState(null);
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed);
  // console.log("selectedteacher",selectedTeacher);


  const handleteacherChange=(item)=>
  {
// // console.log("item",item.value);
setSelectedTeacher(item.value);
  }
  const handleExportCSV = () => {
  try {
    const docs = classesData?.results?.docs || [];

    if (!docs.length) {
      toast.error("No data to export");
      return;
    }

    // 👉 Map your table rows to a flat CSV-friendly shape
    const rows = docs.map((cls, idx) => {
      // status ko normalize: true/'active' -> Active else Inactive
      const statusNorm =
        cls?.status === true || cls?.status === "active" ? "Active" : "Inactive";

      // subjects: string[] ya null
      const subjects =
        Array.isArray(cls?.classTeacher?.subjectsHandled) ? cls?.classTeacher?.subjectsHandled?.map((c)=>c?.subjectName).join(", ") : "N/A";

      return {
        "S No.": idx + 1,
        Class: cls?.name || "",
        Section: cls?.section || "",
        Students: cls?.studentCount ?? 0,
        Status: statusNorm,
        "Teacher Name": cls?.classTeacher?.name || "N/A",
        "Teacher Email": cls?.classTeacher?.email || "N/A",
        "Teacher Specialization": cls?.classTeacher?.specialization || "N/A",
        // "Class Timing": cls?.startTime && cls?.endTime ? `${cls.startTime} - ${cls.endTime}` : "N/A",
        Subjects: subjects,
        "Class ID": cls?._id || "",
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
    const filename = `Classes_${stamp}.csv`;

    // 👉 Trigger download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, filename);

    toast.success("CSV exported successfully ✅");
  } catch (err) {
    console.error(err);
    toast.error("Failed to export CSV ❌");
  }
};

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
    const { data: TeachersData, isLoading:teacherLoading, isFetching:teacherFetching, error :err} = useQuery({
    queryKey: ["teachersssss"],
    queryFn: () =>
      apiGet(apiPath.getTeachers),
  });
// console.log("teacherdata",TeachersData);
// Get all teacher IDs already assigned as class teachers
const assignedTeacherIds = classesData?.results?.docs
  ?.filter(cls => cls.classTeacher?._id)
  ?.map(cls => cls.classTeacher._id) || [];

// Filter teachers who are NOT already assigned
const availableTeachers = TeachersData?.results?.docs?.filter(
  teacher => !assignedTeacherIds.includes(teacher._id)
);

const teacherOptions = availableTeachers?.map((t) => ({
  value: t._id,
  label: t.name,
}));


const assignClassTeacherMutation = useMutation({
  mutationFn: (payload) => apiPost(apiPath.AddClassTeacher, payload),
  onSuccess: (data) => {
    toast.success(data.message || "Class teacher assigned successfully!");
    queryClient.invalidateQueries({ queryKey: ["classes"] });
    queryClient.invalidateQueries({ queryKey: ["teacherss"] });
    setClassTeacherModal(false);
    setSelectedTeacher(null);
  },
  onError: (error) => {
    toast.error(error?.response?.data?.message || "Failed to assign class teacher.");
  },
});
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

  if (name === "section") {
    newValue = value.toUpperCase(); // auto uppercase

    // Real-time validation
    if (!/^[A-D]$/.test(newValue) && newValue !== "") {
      setErrors((prev) => ({ ...prev, section: "Section must be A, B, C, or D" }));
    } else {
      setErrors((prev) => ({ ...prev, section: "" }));
    }
  }

  setFormData((prev) => ({ ...prev, [name]: newValue }));

  // Clear other errors
  if (name !== "section") {
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }
};


  // Handle submit
const handleSubmit = (e) => {
  e.preventDefault();
  const newErrors = {};
  const validClasses = [
    "Prep", "1st", "2nd", "3rd", "4th", "5th", "6th",
    "7th", "8th", "9th", "10th", "11th", "12th",
  ];

  // Class name validation
  if (!formData.name) newErrors.name = "Class name is required";
  else if (!validClasses.includes(formData.name.trim()))
    newErrors.name = "Invalid class name. Must be Prep or 1st to 12th ";

  // Section validation (only A-D)
  if (!formData.section) newErrors.section = "Section is required";
  else if (!/^[A-D]$/.test(formData.section))
    newErrors.section = "Section must be A, B, C, or D";

  // Start/End time validation
  // if (!formData.startTime) newErrors.startTime = "Start time is required";
  // if (!formData.endTime) newErrors.endTime = "End time is required";

  // if (formData.startTime && formData.endTime) {
  //   const start = formData.startTime.split(":").map(Number); // [HH, MM]
  //   const end = formData.endTime.split(":").map(Number);
  //   const startMinutes = start[0] * 60 + start[1];
  //   const endMinutes = end[0] * 60 + end[1];

  //   if (endMinutes <= startMinutes) {
  //     newErrors.endTime = "End time must be after start time";
  //   }
  // }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // Submit mutation
  classMutation.mutate({
    name: formData.name.trim(),
    section: formData.section.trim(),
    // startTime: formatTo12Hour(formData.startTime),
    // endTime: formatTo12Hour(formData.endTime),
  });
};



  // Mutation for create/update class
  const classMutation = useMutation({
    mutationFn: (classObj) => {
      if (editingClass) return apiPut(`${apiPath.updateClass}/${editingClass._id}`, classObj);
      return apiPost(apiPath.createClassess, classObj);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success(editingClass ? data.message : data.message);
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
      {
                header: "S No.",
                cell: ({ row }) => row.index + 1,
            },
      { accessorKey: "name", header: "Class" },
      { accessorKey: "section", header: "Section" },
      { accessorKey: "studentCount", header: "Students" },
      {
  header: "Status",
  accessorKey: "isActive", // backend field
  cell: ({ row }) => {
    const cls = row.original;

    // mutation for toggling active/inactive
    const toggleMutation = useMutation({
      mutationFn: (newStatus) =>
        apiPut(`${apiPath.clssToggle}/${cls._id}`, { status: newStatus }),
      onSuccess: (data) =>{queryClient.invalidateQueries({ queryKey: ["classes"]      });
      toast.success(data.message || "Status updated successfully ✅");},
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to update status ❌");
      },
    });

    const handleToggle = () =>{
      const newStatus = cls.status === "active" ? false : true;
      toggleMutation.mutate(newStatus);
    }

    return (
      <ToggleButton
        isActive={cls.status}
        onToggle={handleToggle}
        disabled={toggleMutation.isLoading}
      />
    );
  },
},
      { header: "Teacher Name", accessorFn: (row) => row.classTeacher?.name || "N/A" },
      { header: "Teacher Email", accessorFn: (row) => row.classTeacher?.email || "N/A" },
      // { header: "Teacher Department", accessorFn: (row) => row.classTeacher?.department || "N/A" },
      // { header: "Teacher Specialization", accessorFn: (row) => row.classTeacher?.specialization || "N/A" },
      // {
      //   header: "Class Timing",
      //   accessorFn: (row) =>
      //     row.startTime && row.endTime
      //       ? `${row.startTime} - ${row.endTime}`
      //       : "N/A",
      // },
  {
  accessorKey: "classTeacher.subjectsHandled",
  header: "Subjects",
  cell: ({ getValue }) => {
    const subjects = getValue();
    if (!subjects || subjects.length === 0) return "N/A";
    return subjects.map((s) => s.subjectName).join(", ");
  },
  }
,
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
                  <button
              // onClick={() => openDeleteModal(row.original)}
            onClick={() => {
  const cls = row.original;
  setEditingClass(cls);
  setClassTeacherModal(true);
}}

              className="text-blue-600 cursor-pointer text-[20px] hover:text-blue-700"
              title="Delete"
            >
             <IoIosAddCircleOutline />
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
      <div className="flex justify-between p-6 text-[12px] md:text-[14px] items-center mb-4">
        <h1 className="text-2xl font-bold">Classes</h1>
        {/* <button
          onClick={() => {
            setEditingClass(null);
            setFormData({ name: "", section: "", startTime: "", endTime: "" });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-[image:var(--gradient-primary)] cursor-pointer rounded-lg hover:bg-yellow-400 transition"
        >
          Add Class
        </button> */}

  <div className="flex gap-3">
    <button
      onClick={handleExportCSV}
      className="px-4 flex gap-1 items-center py-2 px-4 py-2 bg-[image:var(--gradient-primary)]  rounded-lg cursor-pointer hover:bg-blue-700 transition"
    >
      <FaFileExport />

      Export CSV
    </button>

    <button
      onClick={() => {
        setEditingClass(null);
        setFormData({ name: "", section: "", startTime: "", endTime: "" });
        setIsModalOpen(true);
      }}
      className="px-4 py-2 bg-[image:var(--gradient-primary)] cursor-pointer rounded-lg hover:opacity-90 transition"
    >
      Add Class
    </button>
  </div>
        
      </div>

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
          totalCount={totalPages || 1}
          tablePlaceholder="Search classes..."
          fetching={isFetching}
          loading={isLoading}
          error={error}
          isError={error}
        />
        {(isLoading || isFetching) && <Loader />}
      </div>
<Modal isOpen={addclassTeacherModal} title="Add Class Teacher" onClose={()=>
  {
    setClassTeacherModal(false)
  }
}>
       <Select
              options={teacherOptions}
              // value={head.type ? { value: head.type, label: head.type } : null}
              placeholder="Select Teachers"
              // onChange={(opt) => handleFeeHeadChange(index, "type", opt?.value || "")}
              onChange={handleteacherChange}
              // value={setSelectedTeacher}
              // isDisabled={isMandatory}
              // className="rounded-md"
            />
          <button
  className="bg-yellow-500 py-2 px-4 rounded-md mt-4 ml-auto block cursor-pointer"
  disabled={assignClassTeacherMutation.isLoading}
  onClick={() => {
    if (!selectedTeacher) {
      toast.error("Please select a teacher first!");
      return;
    }

    if (!editingClass?._id) {
      toast.error("No class selected for assignment!");
      return;
    }

    assignClassTeacherMutation.mutate({
      teacherId: selectedTeacher,
      classId: editingClass._id,
    });
  }}
>
  {assignClassTeacherMutation.isLoading ? "Assigning..." : "Submit"}
</button>

</Modal>
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingClass ? "Edit Class" : "Add Class"}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
      <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Class Name <span className="text-red-500">*</span>
  </label>
  <InputField
    name="name"
    value={formData.name}
    onChange={handleChange}
    placeholder="11th"
    error={errors.name}
  />
</div>
       
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
    Section <span className="text-red-500">*</span>
    </label>
           <InputField
            name="section"
            value={formData.section}
            onChange={handleChange}
            placeholder="A"
            error={errors.section}
          />
         </div>

          <div className="flex gap-4">
            <div className="flex-1">
              {/* <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                name="startTime"
                className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2 text-gray-700"
                value={formData.startTime}
                onChange={handleChange}
              />
              {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime}</p>} */}
            </div>

            <div className="flex-1">
              {/* <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                name="endTime"
                className="mt-1 w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2 text-gray-700"
                value={formData.endTime}
                onChange={handleChange}
              />
              {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime}</p>} */}
            </div>
          </div>

          <button
            type="submit"
            disabled={classMutation.isLoading}
            className="w-full cursor-pointer bg-[image:var(--gradient-primary)] text-white py-2 rounded-lg  transition"
          >
            {classMutation.isLoading ? "Saving..." : editingClass ? "Update Class" : "Add Class"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
