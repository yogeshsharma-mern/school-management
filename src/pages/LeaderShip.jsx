import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast, Toaster } from 'react-hot-toast';
import apiPath from '../api/apiPath';
import { apiGet, apiPost, apiDelete, apiPut } from '../api/apiFetch';
import { FaUserTie } from 'react-icons/fa';

// Validation schema
const validateForm = (data) => {
    const errors = {};

    if (!data.name?.trim()) {
        errors.name = 'Full Name is required';
    } else if (data.name.length < 2) {
        errors.name = 'Full Name must be at least 2 characters';
    }

    if (!data.designation) {
        errors.designation = 'Designation is required';
    }

    if (!data.department) {
        errors.department = 'Department is required';
    }

    if (!data.experience?.trim()) {
        errors.experience = 'Experience is required';
    } else if (!/^\d+\+?\s*(?:years?|yrs?)?$/i.test(data.experience.trim())) {
        errors.experience = 'Please enter valid experience (e.g., 15+ Years)';
    }

    if (data.qualification && data.qualification.length > 200) {
        errors.qualification = 'Qualification is too long (max 200 characters)';
    }

    return errors;
};

// Designation options
const designationOptions = [
    { value: 'Principal', label: 'Principal' },
    { value: 'Director', label: 'Director' },
    { value: 'Head Master', label: 'Head Master' },
    { value: 'Vice principal', label: 'Vice Principal' },
    //   { value: 'dean', label: 'Dean' },
];

// Department options
const departmentOptions = [
    { value: 'Administration', label: 'Administration' },
    { value: 'Academics', label: 'Academics' },
    //   { value: 'Research', label: 'Research' },
    //   { value: 'Student_affairs', label: 'Student Affairs' },
    //   { value: 'finance', label: 'Finance' },
    //   { value: 'human_resources', label: 'Human Resources' },
];

// Custom Select Component
const SelectField = ({ label, value, onChange, options, error, required = false, placeholder = "Select..." }) => {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                value={value}
                onChange={onChange}
                className={`
          w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          transition-all duration-200 ${error ? 'border-red-500' : 'border-gray-300'}
          bg-white text-gray-900 placeholder-gray-500
        `}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

// Profile Photo Upload Component
const ProfilePhotoUpload = ({ photoUrl, onPhotoChange, isLoading }) => {
    const [preview, setPreview] = useState(null);

    // ✅ sync when editing
    React.useEffect(() => {
        if (!photoUrl) {
            setPreview(null);
            return;
        }

        // If photoUrl is File → create object URL
        if (photoUrl instanceof File) {
            const objectUrl = URL.createObjectURL(photoUrl);
            setPreview(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
        }

        // If photoUrl is string (URL from backend)
        setPreview(photoUrl);
    }, [photoUrl]);


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            onPhotoChange(file);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                    {preview ? (
                        <img src={preview} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}
                </div>

                {!isLoading && (
                    <label className="absolute  bottom-0 right-0 bg-yellow-500 text-white p-2 rounded-full cursor-pointer">
                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                        📷
                    </label>
                )}
            </div>
        </div>
    );
};


// Leader Form Modal Component
const LeaderFormModal = ({ isOpen, onClose, leader = null, onSave }) => {
    const [formData, setFormData] = useState({
        profilephoto: null,
        name: '',
        designation: '',
        department: '',
        experience: '',
        qualification: '',
    });

    const [errors, setErrors] = useState({});

    // Initialize form when modal opens or leader changes
    React.useEffect(() => {
        if (leader) {
            setFormData({
                profilephoto: leader.profilephoto || null,
                name: leader.name || '',

                // ✅ normalize for select fields
                designation: leader.designation || '',
                department: leader.department || '',

                experience: leader.experience?.toString() || '',
                qualification: leader.qualification || '',
            });
        } else {
            setFormData({
                profilephoto: null,
                name: '',
                designation: '',
                department: '',
                experience: '',
                qualification: '',
            });
        }

        setErrors({});
    }, [leader, isOpen]);


    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error('Please fix the errors in the form', {
                duration: 4000,
                position: 'top-right',
                icon: '⚠️',
            });
            return;
        }

        onSave(formData, leader?._id);
    };

    const handleReset = () => {
        if (leader) {
            setFormData({
                profilephoto: leader.profilephoto || '',
                name: leader.name || '',
                designation: leader.designation || '',
                department: leader.department || '',
                experience: leader.experience || '',
                qualification: leader.qualification || '',
            });
        } else {
            setFormData({
                profilephoto: '',
                name: '',
                designation: '',
                department: '',
                experience: '',
                qualification: '',
            });
        }
        setErrors({});
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {leader ? 'Edit Leader' : 'Add New Leader'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="md:flex gap-8">
                        {/* Left Column - Photo */}
                        <div className="md:w-1/3 mb-6 md:mb-0">
                            <ProfilePhotoUpload
                                photoUrl={formData.profilephoto}
                                onPhotoChange={(photo) => handleChange('profilephoto', photo)}
                                isLoading={false}
                            />
                        </div>

                        {/* Right Column - Form */}
                        <div className="md:w-2/3">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className={`
                      w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                      transition-all duration-200 ${errors.name ? 'border-red-500' : 'border-gray-300'}
                    `}
                                        placeholder="Enter full name"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Designation */}
                                    <SelectField
                                        label="Designation"
                                        value={formData.designation}
                                        onChange={(e) => handleChange('designation', e.target.value)}
                                        options={designationOptions}
                                        error={errors.designation}
                                        required
                                        placeholder="Select Designation"
                                    />

                                    {/* Department */}
                                    <SelectField
                                        label="Department"
                                        value={formData.department}
                                        onChange={(e) => handleChange('department', e.target.value)}
                                        options={departmentOptions}
                                        error={errors.department}
                                        required
                                        placeholder="Select Department"
                                    />
                                </div>

                                {/* Experience */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Experience <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.experience}
                                        onChange={(e) => handleChange('experience', e.target.value)}
                                        className={`
                      w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                      transition-all duration-200 ${errors.experience ? 'border-red-500' : 'border-gray-300'}
                    `}
                                        placeholder="e.g., 15+ Years"
                                    />
                                    {errors.experience && (
                                        <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">Format: 10+ Years, 5 Years, 20+ Yrs</p>
                                </div>

                                {/* Qualification (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Qualification <span className="text-gray-400 text-sm">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={formData.qualification}
                                        onChange={(e) => handleChange('qualification', e.target.value)}
                                        rows="2"
                                        className={`
                      w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                      transition-all duration-200 resize-none ${errors.qualification ? 'border-red-500' : 'border-gray-300'}
                    `}
                                        placeholder="e.g., Ph.D. in Education, M.Ed., etc."
                                    />
                                    {errors.qualification && (
                                        <p className="text-red-500 text-sm mt-1">{errors.qualification}</p>
                                    )}
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Maximum 200 characters</span>
                                        <span>{formData.qualification.length}/200</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 cursor-pointer py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="px-4 py-2 bg-gray-100 cursor-pointer text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white cursor-pointer bg-[image:var(--gradient-primary)] rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        {leader ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Leader Card Component
const LeaderCard = ({ leader, onEdit, onDelete }) => {
    const getDesignationLabel = (value) => {
        const option = designationOptions.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    const getDepartmentLabel = (value) => {
        const option = departmentOptions.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
            <div className="p-6">
                <div className="flex items-start space-x-4">
                    {/* Profile Photo */}
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                            {leader.profilephoto ? (
                                <img
                                    src={leader.profilephoto}
                                    alt={leader.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
                                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Leader Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {leader.name}
                                </h3>
                                <p className="text-sm text-blue-600 font-medium mt-1">
                                    {getDesignationLabel(leader.designation)}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onEdit(leader)}
                                    className="text-blue-600 cursor-pointer hover:text-blue-800 p-1 transition-colors"
                                    title="Edit"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onDelete(leader._id)}
                                    className="text-red-600 cursor-pointer hover:text-red-800 p-1 transition-colors"
                                    title="Delete"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span>{getDepartmentLabel(leader.department)}</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{leader.experience}</span>
                            </div>

                            {leader.qualification && (
                                <div className="flex items-start text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                    </svg>
                                    <span className="line-clamp-2">{leader.qualification}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Empty State Component
const EmptyState = () => (
    <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Leaders Yet</h3>
        <p className="text-gray-500 mb-6">Get started by adding your first leader profile.</p>
    </div>
);

// Main Component
const LeadersManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLeader, setEditingLeader] = useState(null);
    const queryClient = useQueryClient();

    // Fetch all leaders
    const { data: leadersData = [], isLoading: isLoadingLeaders } = useQuery({
        queryKey: ['leaders'],
        queryFn: () => apiGet(apiPath.getAllLeaders),
        onError: (error) => {
            toast.error(error?.response?.data?.message, {
                duration: 4000,
                position: 'top-right',
            });
        }
    });
    let leaders = leadersData?.results || [];
    const buildFormData = (data) => {
        const fd = new FormData();

        fd.append('name', data.name);
        fd.append('designation', data.designation);
        fd.append('department', data.department);
        fd.append('experience', data.experience);
        fd.append('qualification', data.qualification || '');

        // ✅ CORRECT FIELD NAME
        if (data.profilephoto instanceof File) {
            fd.append('profilephoto', data.profilephoto);
        }

        return fd;
    };


    // Create leader mutation
    const createLeaderMutation = useMutation({
        mutationFn: (data) => apiPost(apiPath.createLeader, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['leaders']);
            toast.success('Leader created successfully!', {
                duration: 4000,
                position: 'top-right',
                icon: '✅',
            });
            setIsModalOpen(false);
            setEditingLeader(null);
        },
        onError: (error) => {
            toast.error(error?.responnse?.data?.message || 'Failed to create leader', {
                duration: 4000,
                position: 'top-right',
                icon: '❌',
            });
        },
    });

    // Update leader mutation
    const updateLeaderMutation = useMutation({
        mutationFn: ({ id, data }) => apiPut(`${apiPath.updateLeaderInfo}/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['leaders']);
            toast.success('Leader updated successfully!', {
                duration: 4000,
                position: 'top-right',
                icon: '✅',
            });
            setIsModalOpen(false);
            setEditingLeader(null);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to update leader', {
                duration: 4000,
                position: 'top-right',
                icon: '❌',
            });
        },
    });

    // Delete leader mutation
    const deleteLeaderMutation = useMutation({
        mutationFn: (id) => apiDelete(`${apiPath?.deleteLeaderInfo}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['leaders']);
            toast.success('Leader deleted successfully!', {
                duration: 4000,
                position: 'top-right',
                icon: '✅',
            });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete leader', {
                duration: 4000,
                position: 'top-right',
                icon: '❌',
            });
        },
    });

    const handleCreateClick = () => {
        setEditingLeader(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (leader) => {
        setEditingLeader(leader);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id) => {
        if (window.confirm('Are you sure you want to delete this leader?')) {
            deleteLeaderMutation.mutate(id);
        }
    };

    const handleSaveLeader = (data, id = null) => {
        const formData = buildFormData(data);

        if (id) {
            updateLeaderMutation.mutate({ id, data: formData });
        } else {
            createLeaderMutation.mutate(formData);
        }
    };


    const isLoading = createLeaderMutation.isLoading || updateLeaderMutation.isLoading;

    //   if (isLoadingLeaders) {
    //     return (
    //       <div className="h-[85vh] bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
    //         <div className="text-center">
    //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
    //           <p className="mt-4 text-gray-600">Loading Leaders...</p>
    //         </div>
    //       </div>
    //     );
    //   }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
            <Toaster />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Leaders Management</h1>
                        <p className="text-gray-600 mt-2">Manage your institution's leadership team</p>
                    </div>
                    <button
                        onClick={handleCreateClick}
                        disabled={isLoading}
                        className="mt-4 sm:mt-0 px-6 py-3 bg-[image:var(--gradient-primary)]  cursor-pointer text-black text-sm rounded-lg font-medium  transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg> */}
                        <FaUserTie size={15} />
                        <span>Add New Leader</span>
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Leaders</p>
                                <p className="text-2xl font-bold text-gray-900">{leaders.length}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Principals</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {leaders.filter(l => l.designation === 'principal').length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Directors</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {leaders.filter(l => l.designation === 'director').length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Academics</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {leaders.filter(l => l.department === 'academics').length}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaders Grid */}
                {leaders.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leaders.map((leader) => (
                            <LeaderCard
                                key={leader._id}
                                leader={leader}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
                )}

                {/* Modal */}
                <LeaderFormModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingLeader(null);
                    }}
                    leader={editingLeader}
                    onSave={handleSaveLeader}
                />
            </div>
        </div>
    );
};

export default LeadersManagement;