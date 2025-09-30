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
    const [viewModal, setViewModal] = useState(false);
    const [viewData, setViewData] = useState([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({ name: "", code: "", description: "", credits: "" });
    const [errors, setErrors] = useState({});
    const debouncedSearch = useDebounce(globalFilter, 500);
    // Fetch classes
    const { data: classesData, isLoading, isFetching } = useQuery({
        queryKey: ["classes", pagination.pageIndex, pagination.pageSize, debouncedSearch],
        queryFn: () => apiGet(apiPath.getSubjects, {
            page: pagination.pageIndex + 1,  // backend usually 1-indexed
            limit: pagination.pageSize,
            search: debouncedSearch,
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subjects"] });

            if (editingClass) {
                toast.success("Subject updated successfully ✅");
            } else {
                toast.success("Subject created successfully 🎉");
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

        switch (name) {
            case "name":
                // Allow only letters, spaces, and comma
                newValue = value.replace(/[^a-zA-Z ,]/g, "");
                break;
            case "credits":
                // Allow only numbers
                newValue = value.replace(/[^0-9]/g, "");
                break;
            default:
                newValue = value; // code & description can accept anything
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
        if (!formData.name) {
            newErrors.name = "Subject name is required";
        }
        if (!formData.code) {
            newErrors.code = "Credits are required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
        }

        classMutation.mutate({
            name: formData.name.trim(),
            code: formData.code.trim(),
            description: formData.description.trim(),
            credits: formData.credits.trim()
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
            { accessorKey: "name", header: "Subject Name" },
            { accessorKey: "code", header: "Code" },
            { accessorKey: "credits", header: "Credits" },
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
                                    name: course.name,
                                    code: course.code,
                                    credits: course.credits,
                                    description: course.description,
                                });
                                setIsModalOpen(true);
                            }}
                            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Edit
                        </button>
                        <button onClick={() => {
                            setViewModal(true),
                                setViewData(row.original)
                        }
                        } className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            View
                        </button>
                        {/* Uncomment if you want delete button */}
                        {/* <button
            onClick={() => deleteMutation.mutate(row.original._id)}
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
                            <p><strong>Credits:</strong> {viewData.credits}</p>
                            <p><strong>Description:</strong> {viewData.description}</p>
                        </div>
                    )
                }
            </Modal>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Subjects</h1>
                <button
                    onClick={() => {
                        setEditingClass(null);
                        setFormData({ name: "", section: "", subjects: "" });
                        setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-yellow-400  rounded-lg hover:bg-yellow-500 cursor-pointer transition"
                >
                    Create Subject
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
                    tablePlaceholder="Search subjects..."
                />
                {(isLoading || isFetching) && <Loader />}
            </div>
            {/* Modal for create/edit */}
            <Modal
                isOpen={isModalOpen}
                title={editingClass ? "Edit Class" : "Create Subject"}
                onClose={() => setIsModalOpen(false)}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label="Subject Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="physics, math, chem"
                        error={errors.name}
                    />
                    <InputField
                        label="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="PHY101"
                        error={errors.code}
                    />
                    <InputField
                        label="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Example...."
                        error={errors.description}
                    />
                    <InputField
                        label="credits"
                        name="credits"
                        value={formData.credits}
                        onChange={handleChange}
                        placeholder="4"
                        error={errors.credits}
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
