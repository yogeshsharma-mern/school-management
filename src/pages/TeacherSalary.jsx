
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
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Select from "react-select";
export default function TeacherSalaryPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // State
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed);

  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

const [salaryForm, setSalaryForm] = useState({
  teacherId: "",
  month: "",
});

  // console.log("salaryform", salaryForm);
  const [salaryErrors, setSalaryErrors] = useState({});
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  // console.log("currentMonth", currentMonth);
  // console.log("currentyear", currentYear);
  const debouncedSearch = useDebounce(globalFilter, 500);
const formatMonth = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};
const getPreviousMonthsOptions = (count = 2) => {
  const options = [];
  const now = new Date();

  for (let i = 1; i <= count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    const year = date.getFullYear();
    const monthIndex = date.getMonth(); // 0-based
    const monthNumber = String(monthIndex + 1).padStart(2, "0");

    options.push({
      label: `${date.toLocaleString("default", {
        month: "long",
      })} ${year}`, // November 2025
      value: `${year}-${monthNumber}`, // 2025-11
    });
  }

  return options;
};
const monthOptions = useMemo(() => getPreviousMonthsOptions(2), []);
const getLastMonth = () => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

  // ✅ Fetch Teacher Salary List
const { data: TeacherSalary, isLoading, isFetching, error } = useQuery({
  queryKey: [
    "TeacherSalary",
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
  ],
  queryFn: () => {
const formattedMonth = getLastMonth();
    return apiGet(`${apiPath.TeacherSalary}?month=${formattedMonth}`, {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      name: debouncedSearch,
    });
  },
});


  // ✅ Salary Mutation (Generate Salary)
  const salaryMutation = useMutation({
    mutationFn: (payload) => apiPut(apiPath.generateTeacherSalary, payload),
    onSuccess: (data) => {
      toast.success(data?.message || "Salary generated successfully 🎉");
      queryClient.invalidateQueries({ queryKey: ["TeacherSalary"] });
      setIsSalaryModalOpen(false);
      setSalaryForm({ teacherId: "", month: "" });
      setSelectedTeacher(null);
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to generate salary ❌");
    },
  });
  // console.log("salarymutiaton loading",salaryMutation.isPending);
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
    // if (salaryForm.leaves === "") errs.leaves = "Leaves are required";

    if (Object.keys(errs).length > 0) {
      setSalaryErrors(errs);
      return;
    }

    salaryMutation.mutate({
      teacherId: selectedTeacher?._id,
      month: salaryForm.month,
      // leaves: salaryForm.leaves,
    });
  };

  // ✅ Table Columns
  const columns = useMemo(
    () => [
      {
        header: "S No.",
        cell: ({ row }) => row.index + 1,
      },
      { accessorKey: "name", header: "Teacher Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "designation", header: "Designation" },
      { accessorKey: "salaryStatus", header: "Status" },
      { accessorKey: "netSalary", header: "Net Salary" },

      // { accessorKey: "salaryData[0].finalSalary", header: "Final Salary" },
      // { accessorKey: "PER_DAY_SALARY", header: "Per Day Salary" },
      // { accessorKey: "DEDUCTIONS", header: "Deductions" },
      // { accessorKey: "FINAL_SALARY", header: "Final Salary" },
      {
        accessorKey: "salaryData[0].month",
        header: "Month",
        cell: ({ row }) => {
          const month = row.original.salaryData?.[0]?.month || "N/A";
          return month;
        },

      },
      {
        accessorKey: "salaryData[0].finalSalary",
        header: "Paid Salary",
        cell: ({ row }) => {
          const salary = row.original.salaryData?.[0]?.finalSalary || 0;
          return `₹${salary.toLocaleString()}`;
        },
      },
      // {
      //   accessorKey: "STATUS",
      //   header: "Status",
      //   cell: ({ getValue }) => {
      //     const status = getValue();
      //     return (
      //       <span
      //         className={`px-3 py-1 text-sm font-semibold rounded-full ${status === "Paid"
      //             ? "bg-green-100 text-green-700"
      //             : "bg-yellow-100 text-yellow-700"
      //           }`}
      //       >
      //         {status}
      //       </span>
      //     );
      //   },
      // },
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
                // onClick={() => toast(`Teacher: ${rowData.TEACHER_NAME}`)}
                onClick={() => navigate(`/admin/teacher/salary/salaryinfo/${rowData._id}`)}
              />
              {rowData.salaryStatus !== "Paid" && (
                <button
                  onClick={() => {
                    setSelectedTeacher(rowData);
                    setIsSalaryModalOpen(true);
                    setSalaryForm({
                      teacherId: rowData._id,
                   month: getPreviousMonthsOptions(2)[0]?.value || "",
                    });

                  }}
                  className="px-3 cursor-pointer py-1 bg-[image:var(--gradient-primary)] text-black  rounded-lg hover:bg-yellow-500 transition"
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

  const tableData = useMemo(() => TeacherSalary?.results || [], [TeacherSalary]);
  const totalPages = TeacherSalary?.pagination?.totalPages || 1;

  return (
    <div className="md:p-2 p-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Teachers Salary</h1>
      </div>

      {/* Table */}
      <div className={`
  overflow-x-auto transition-all duration-300 w-[98vw]
  ${collapsed ? "md:w-[92vw]" : "md:w-[82vw]"}
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
      <Select
  options={monthOptions}
  value={monthOptions.find(
    (opt) => opt.value === salaryForm.month
  )}
  onChange={(selected) => {
    setSalaryForm((prev) => ({
      ...prev,
      month: selected.value,
    }));
    setSalaryErrors((prev) => ({ ...prev, month: "" }));
  }}
  placeholder="Select Month"
  isSearchable={false}
  className="react-select-container"
  classNamePrefix="react-select"
/>

{salaryErrors.month && (
  <p className="text-red-500 text-sm mt-1">
    {salaryErrors.month}
  </p>
)}


          </div>

          {/* Leaves */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary <span className="text-red-500">*</span>
            </label>
            <InputField
              name="leaves"
              type="number"
              disabled={true}
              value={
                selectedTeacher?.netSalary
                  ? Number(selectedTeacher.netSalary).toFixed(2)
                  : ""
              }
              placeholder="0.00"
              className="bg-gray-100 cursor-not-allowed text-gray-700"
            />

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={salaryMutation.isLoading}
            className="w-full bg-[image:var(--gradient-primary)] cursor-pointer text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
          >
            {salaryMutation.isPending ? "Generating..." : "Generate Salary"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
