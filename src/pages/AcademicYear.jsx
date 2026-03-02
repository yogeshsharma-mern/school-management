import React, { useState } from 'react';
import apiPath from '../api/apiPath';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../api/apiFetch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Select from "react-select";

export default function AcademicYear() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        academicSession: '',
        startDate: '',
        endDate: '',
        status: 'inactive'
    });

    // Generate academic years (current year and previous 4 years)
    const generateAcademicYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 0; i < 5; i++) {
            const year = currentYear - i;
            years.push({
                value: `${year}-${year + 1}`,
                label: `${year}-${year + 1}`
            });
        }
        return years;
    };
    const validateForm = () => {
        const newErrors = {};

        // 1️⃣ Academic Session required
        if (!formData.academicSession) {
            newErrors.academicSession = "Academic session is required";
        }

        // 2️⃣ Start Date required
        if (!formData.startDate) {
            newErrors.startDate = "Start date is required";
        }

        // 3️⃣ End Date required
        if (!formData.endDate) {
            newErrors.endDate = "End date is required";
        }

        if (formData.academicSession && formData.startDate && formData.endDate) {

            const [startYear, endYear] = formData.academicSession.split("-");

            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);

            // 4️⃣ Check start year matches first year
            if (start.getFullYear().toString() !== startYear) {
                newErrors.startDate =
                    `Start date must be in year ${startYear}`;
            }

            // 5️⃣ Check end year matches second year
            if (end.getFullYear().toString() !== endYear) {
                newErrors.endDate =
                    `End date must be in year ${endYear}`;
            }

            // 6️⃣ End must be after start
            if (end <= start) {
                newErrors.endDate =
                    "End date must be after start date";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const academicYearOptions = generateAcademicYears();

    // Custom styles for react-select
    const selectStyles = {
        control: (base) => ({
            ...base,
            borderColor: '#e5e7eb',
            '&:hover': {
                borderColor: '#9ca3af'
            },
            boxShadow: 'none',
            '&:focus': {
                borderColor: '#eab308',
                boxShadow: '0 0 0 2px rgba(234, 179, 8, 0.1)'
            }
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#eab308' : state.isFocused ? '#fef9e7' : 'white',
            color: state.isSelected ? 'white' : '#111827',
            '&:hover': {
                backgroundColor: '#fef9e7'
            }
        })
    };

    // Fetch all academic sessions
    const { data: academicSessions, isLoading, error } = useQuery({
        queryKey: ['academicSessions'],
        queryFn: () => apiGet(apiPath.getAcademicSessions)
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (newData) => apiPost(apiPath.createAcademicSession, newData),
        onSuccess: () => {
            queryClient.invalidateQueries(['academicSessions']);
            closeModal();
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }

    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => apiPut(`${apiPath.updateAcademeicSession}/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['academicSessions']);
            closeModal();
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => apiDelete(`${apiPath.setting.getAcademicSession}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['academicSessions']);
        }
    });

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     console.log("name,value", name, value);
    //     setFormData(prev => ({
    //         ...prev,
    //         [name]: value
    //     }));

    //     if (name === 'startDate' && value) {
    //         const startDate = new Date(value);
    //         console.log("startdate", startDate);

    //         const endDate = new Date(startDate);

    //         endDate.setFullYear(startDate.getFullYear() + 1);
    //         // console.log("enddate",endDate.toISOString());
    //         setFormData(prev => ({
    //             ...prev,
    //             endDate: endDate.toISOString().split('T')[0]
    //         }));
    //     }
    // };
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // ✅ remove error for that field
        setErrors(prev => ({
            ...prev,
            [name]: ""
        }));

        if (name === 'startDate' && value) {
            const startDate = new Date(value);
            const endDate = new Date(startDate);
            endDate.setFullYear(startDate.getFullYear() + 1);

            setFormData(prev => ({
                ...prev,
                endDate: endDate.toISOString().split('T')[0]
            }));
        }
    };
    const handleAcademicSessionSelect = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            academicSession: selectedOption.value
        }));

        setErrors(prev => ({
            ...prev,
            academicSession: ""
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const payload = {
            academicSession: formData.academicSession,
            startDate: formData.startDate,
            endDate: formData.endDate,
            status: formData.status
        };

        if (editingItem) {
            updateMutation.mutate({ id: editingItem._id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            academicSession: item.academicSession,
            startDate: item.startDate.split('T')[0],
            endDate: item.endDate.split('T')[0],
            status: item.status
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this academic year?')) {
            deleteMutation.mutate(id);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setErrors({}); // ✅ clear errors
        setFormData({
            academicSession: '',
            startDate: '',
            endDate: '',
            status: 'inactive'
        });
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            inactive: 'bg-gray-50 text-gray-600 border border-gray-200',
            completed: 'bg-blue-50 text-blue-700 border border-blue-200'
        };
        return badges[status] || 'bg-gray-50 text-gray-600 border border-gray-200';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-yellow-500"></div>
            </div>
        );
    }

    // if (error) {
    //     return (
    //         <div>
    //                 <button
    //                         onClick={openModal}
    //                         className="inline-flex items-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
    //                     >
    //                         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    //                         </svg>
    //                         New Academic Year
    //                     </button>
    //         <div className="min-h-screen bg-gray-50 flex items-center justify-center">

    //             <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
    //                 <p className="text-red-600">Failed to load academic years. Please try again.</p>
    //             </div>
    //         </div>
    //         </div>
    //     );
    // }

    return (
        <>

            {academicSessions?.results?.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    No academic years found.
                </div>
            )}
            <div className="min-h-screen bg-gray-50">
                {/* Simple Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">Academic Years</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage and track academic sessions
                                </p>
                            </div>
                            <button
                                onClick={openModal}
                                className="inline-flex items-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Academic Year
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Years</p>
                                    <p className="text-2xl font-semibold text-gray-900 mt-2">
                                        {academicSessions?.results?.length || 0}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Years</p>
                                    <p className="text-2xl font-semibold text-gray-900 mt-2">
                                        {academicSessions?.results?.filter(item => item.status === 'active').length || 0}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Current Session</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-2">
                                        {academicSessions?.results?.find(item => item.isCurrent)?.academicSession || 'Not set'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th> */}
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {academicSessions?.results?.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.academicSession}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(item.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(item.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadge(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.isCurrent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                          Current
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-gray-600 hover:text-yellow-600 mr-4 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                {/* <button
                                                onClick={() => handleDelete(item._id)}
                                                className="text-gray-600 hover:text-red-600 transition-colors"
                                            >
                                                Delete
                                            </button> */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Modal - Fixed z-index and styling */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            {/* Background overlay */}
                            <div className="fixed inset-0 flex justify-center items-center bg-gray-900/50 transition-opacity"   >

                                {/* Modal panel */}
                                <div className="relative inline-block transform overflow-hidden rounded-xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 lg:w-full lg:max-w-lg w-full sm:align-middle">
                                    {/* Header */}
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {editingItem ? 'Edit Academic Year' : 'Create Academic Year'}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {editingItem ? 'Update the details below' : 'Fill in the information below'}
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="px-6 py-4 space-y-4">
                                            {/* Academic Session */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Academic Session <span className="text-yellow-500">*</span>
                                                </label>
                                                <Select
                                                    options={academicYearOptions}
                                                    onChange={handleAcademicSessionSelect}
                                                    value={academicYearOptions.find(option => option.value === formData.academicSession)}
                                                    placeholder="Select session"
                                                    styles={selectStyles}
                                                // isDisabled={!!editingItem}
                                                />
                                                {errors.academicSession && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors.academicSession}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Start Date */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Start Date <span className="text-yellow-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="startDate"
                                                    value={formData.startDate}
                                                    onChange={handleInputChange}
                                                    // required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 text-sm"
                                                />
                                                {errors.startDate && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors.startDate}
                                                    </p>
                                                )}
                                            </div>

                                            {/* End Date */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    End Date <span className="text-yellow-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="endDate"
                                                    value={formData.endDate}
                                                    onChange={handleInputChange}
                                                    // required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 text-sm"
                                                />
                                                {errors.endDate && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors.endDate}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Status */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Status
                                                </label>
                                                <select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 text-sm"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={createMutation.isLoading || updateMutation.isLoading}
                                                className="px-4 py-2 text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {createMutation.isLoading || updateMutation.isLoading ? (
                                                    <span className="flex items-center">
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-900" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Saving...
                                                    </span>
                                                ) : (
                                                    editingItem ? 'Update' : 'Create'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}