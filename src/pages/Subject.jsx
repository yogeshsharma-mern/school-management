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
import { AiFillDelete } from "react-icons/ai";
import ToggleButton from "../components/ToggleButton";
import ConfirmBox from "../components/ConfirmBox";



export default function ClassPage() {
    const queryClient = useQueryClient();

    // Table state
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [columnFilters, setColumnFilters] = useState([]);
    const [viewModal, setViewModal] = useState(false);
    const [viewData, setViewData] = useState([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({ name: "", code: "", description: "", credits: "" });
    // console.log("formdata",formData);
    const [errors, setErrors] = useState({});
    const debouncedSearch = useDebounce(globalFilter, 500);

    //confirmbox state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    // Fetch classes
    const { data: classesData, isLoading, isFetching, error, isError } = useQuery({
        queryKey: ["subjects", pagination.pageIndex, pagination.pageSize, debouncedSearch],
        queryFn: () => apiGet(apiPath.getSubjects, {
            page: pagination.pageIndex + 1,  // backend usually 1-indexed
            limit: pagination.pageSize,
            name: debouncedSearch,
        }),
    });

    // Mutation for create/update class
    const classMutation = useMutation({
        mutationFn: (subjectObj) => {
            if (editingClass) {
                return apiPut(`${apiPath.updateSubject}/${editingClass._id}`, subjectObj);
            }
            return apiPost(apiPath.createSubject, subjectObj);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
            // console.log("data", data);
            if (editingClass) {
                toast.success(data.message || "Subject updated successfully 🎉");
            } else {
                toast.success(data.message || "Subject created successfully 🎉");
            }

            setIsModalOpen(false);
            setEditingClass(null);
            setFormData({ name: "", code: "", description: "" });
        },
        onError: (error) => {
            // console.log("error", error);
            // Show server error message if available
            const errorMessage =
                error?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        },
    });


    // Delete class mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => apiDelete(`${apiPath.deleteSubject}/${id}`),
        onSuccess: (data) => {
            toast.success(data.message || "Subject deleted successfully 🗑️");
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
        },
        onError: (error) => {
            const errorMessage =
                error?.response?.data?.message || "Failed to delete subject. Please try again ❌";
            toast.error(errorMessage);
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        switch (name) {
            case "name":
                // Only letters, spaces, commas
                newValue = value.replace(/[^A-Za-z\s,]/g, "");
                break;

            case "code":
                // Only letters and numbers
                newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                break;


            default:
                newValue = value;
        }

        setFormData((prev) => ({ ...prev, [name]: newValue }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };






    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        // const validClasses = [
        //   "Prep", // or "Pre-primary"
        //   "1st", "2nd", "3rd", "4th", "5th", "6th",
        //   "7th", "8th", "9th", "10th", "11th", "12th"
        // ];
        // Class name validation (only letters, numbers, spaces, max 20 chars)
        // if (!formData.name) {
        //   newErrors.name = "Class name is required";
        // } else if (!validClasses.includes(formData.name.trim())) {
        //   newErrors.name = "Invalid class name. Must be Prep or 1st to 12th";
        // }

        // Section validation (must be A, B, C, or D)
        // if (!formData.section) {
        //   newErrors.section = "Section is required";
        // } else if (!/^[A-D]$/.test(formData.section)) {
        //   newErrors.section = "Section must be A, B, C, or D (capital letter)";
        // }

        // if (Object.keys(newErrors).length > 0) {
        //   setErrors(newErrors);
        //   return;
        // }
        if (!formData.name) newErrors.name = "Subject name is required";
        if (!formData.code) newErrors.code = "Code is required";
        if (!/^[A-Z]{3,4}[0-9]{2,3}$/.test(formData.code)) {
            newErrors.code = "Invalid subject code format (example: PHY101)";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        classMutation.mutate({
            name: formData.name.trim(),
            code: formData.code.trim(),
            description: formData.description.trim(),
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
    //   {
    //                 "_id": "68da554b2c4e5098395dcf4b",
    //                 "name": "Physics",
    //                 "code": "PHY101",
    //                 "description": "Fundamentals of classical and modern physics including mechanics, electricity, and magnetism.",
    //                 "credits": 4,
    //                 "createdAt": "2025-09-29T09:45:47.041Z",
    //                 "updatedAt": "2025-09-29T09:45:47.041Z",
    //                 "__v": 0
    //             }
    const columns = useMemo(
        () => [
            {
                header: "S No.",
                cell: ({ row }) => row.index + 1,
            },
            { accessorKey: "name", header: "Subject Name" },
            { accessorKey: "code", header: "Code" },
            // { accessorKey: "credits", header: "Credits" },
            {
                header: "Status",
                accessorKey: "isActive",
                cell: ({ row }) => {
                    const subject = row.original;
                    // console.log("subject", subject);
                    // Mutation for toggling active/inactive
                    const toggleMutation = useMutation({
                        mutationFn: (newStatus) =>
                            apiPut(`${apiPath.ToggleSubject}/${subject._id}`, { status: newStatus }),
                        onSuccess: (data) => {
                            toast.success(data.message || "Status updated successfully 🎉");
                            queryClient.invalidateQueries({ queryKey: ["subjects"] });

                        },
                        onError: (err) => {
                            toast.error(err?.response?.data?.message || "Failed to update status ❌");
                        },
                    });

                    // const handleToggle = () => toggleMutation.mutate(!subject.isActive);
                    const handleToggle = () => {

                        const newStatus = subject.status === "active" ? false : true;
                        toggleMutation.mutate(newStatus);
                    }

                    return (
                        <div className="flex items-center gap-2">
                            <ToggleButton
                                isActive={subject.status}
                                onToggle={handleToggle}
                                disabled={toggleMutation.isLoading}
                            />
                            {/* <span
          className={`text-sm font-medium ${
            subject.status ==="active"? "text-green-600" : "text-red-600"
          }`}
        >
          {subject.status==="active" ? "Active" : "Inactive"}
        </span> */}
                        </div>
                    );
                },
            },

            {
                accessorKey: "description",
                header: "Description",
                cell: ({ getValue }) =>
                    getValue()
                        ? getValue().length > 50
                            ? getValue().substring(0, 50) + "..." // truncate long text
                            : getValue()
                        : "N/A",
            },
            {
                header: "Actions",
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const course = row.original;
                                setEditingClass(course);
                                setFormData({
                                    name: course.name || "",
                                    code: course.code || "",
                                    credits: course.credits?.toString() || "",
                                    description: course.description || "",
                                });
                                setIsModalOpen(true);
                            }}
                            className=" text-yellow-400 text-[20px] cursor-pointer  hover:text-yellow-500"
                        >
                            <RiImageEditLine />
                        </button>
                        <button onClick={() => {
                            setViewModal(true),
                                setViewData(row.original)
                        }
                        } className=" text-green-600 cursor-pointer  text-[20px] hover:text-green-700"
                        >
                            <FaRegEye />
                        </button>
                        {/* Uncomment if you want delete button */}
                        {/* <button
                            onClick={() => deleteMutation.mutate(row.original._id)}
                        // className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            <AiFillDelete className="text-red-500 text-[20px] cursor-pointer" />
                        </button> */}
                        <button
                            onClick={() => {
                                setDeleteId(row.original._id);
                                setConfirmOpen(true);
                            }}
                        // className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            <AiFillDelete className="text-red-500 text-[20px] cursor-pointer" />
                        </button>
                    </div>
                ),
            },
        ],
        [deleteMutation]
    );



    const tableData = useMemo(() => classesData?.results?.docs || [], [classesData]);
    // console.log("classdata", classesData)

    const totalPages = classesData?.results?.totalPages || 1;




    return (
        <div>
            <Modal isOpen={viewModal} title="Subject Details" onClose={() => {
                setViewModal(false)
            }
            } >
                {
                    viewData &&
                    (
                        <div className="space-y-2">
                            <p><strong>Subject Name:</strong> {viewData.name}</p>
                            <p><strong>Code:</strong> {viewData.code}</p>
                            {/* <p><strong>Credits:</strong> {viewData.credits}</p> */}
                            <p><strong>Description:</strong> {viewData.description}</p>
                        </div>
                    )
                }
            </Modal>
            <div className="flex p-6 justify-between items-center cursor-pointer mb-4">
                <h1 className="text-2xl font-bold">Subjects</h1>
                <button
                    onClick={() => {
                        setEditingClass(null);
                        setFormData({ name: "", section: "", subjects: "" });
                        setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[image:var(--gradient-primary)] cursor-pointer  rounded-lg hover:bg-yellow-500 cursor-pointer transition"
                >
                    Add Subject
                </button>
            </div>
            <div className="overflow-x-auto  realtive w-[98vw] md:w-[80vw]">


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
                    tablePlaceholder="Search subjects..."
                    error={error}
                    isError={error}
                    fetching={isFetching}
                    loading={isLoading}


                />

            </div>
            {/* Modal for create/edit */}
            <ConfirmBox   message="Are you sure you want to delete this subject? This action cannot be undone." isOpen={confirmOpen} onCancel={() => {
                setConfirmOpen(false)
            }
            } onConfirm={() => {
                if (deleteId) {
                    deleteMutation.mutate(deleteId);
                    setConfirmOpen(false);
                }
            }}
                loading={deleteMutation.isLoading} />
            <Modal
                isOpen={isModalOpen}
                title={editingClass ? "Edit Subject" : "Add Subject"}
                onClose={() => setIsModalOpen(false)}
            >

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject Name <span className="text-red-500">*</span>
                    </label>
                    <InputField
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="physics, math, chem"
                        error={errors.name}
                    />
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code <span className="text-red-500">*</span>
                    </label>
                    <InputField
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="PHY101"
                        error={errors.code}
                    />
                    <InputField
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Example...."
                        error={errors.description}
                    />
                    {/* <InputField
                        label="credits"
                        name="credits"
                        value={formData.credits}
                        onChange={handleChange}
                        placeholder="4"
                    error={errors.credits}
                    /> */}
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
                        className="w-full cursor-pointer bg-[image:var(--gradient-primary)] text-white py-2 rounded-lg transition"
                    >
                        {classMutation.isLoading && <Loader size={20} />} {/* inline loader */}
                        {editingClass
                            ? classMutation.isLoading
                                ? "Updating..."
                                : "Update Subject"
                            : classMutation.isLoading
                                ? "Creating..."
                                : "Add Subject"}

                    </button>
                </form>
            </Modal>
        </div>
    );
}
