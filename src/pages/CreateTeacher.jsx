import { useState } from "react";
import { apiPost, apiGet } from "../api/apiFetch";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import apiPath from "../api/apiPath";
import { useQuery } from "@tanstack/react-query";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Select from "react-select";
import countryList from "react-select-country-list";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";


import {
    InputAdornment,
    IconButton,
    TextField,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Button,
    Stepper,
    Step,
    StepLabel,
    Grid,
    Paper,
    Tooltip,
    Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: "56px", // Match MUI TextField height
        height: "56px",
        borderColor: state.isFocused ? "#1976d2" : "#c8cbbfff",
        boxShadow: state.isFocused ? "0 0 0 1px #1976d2" : "none",
        "&:hover": { borderColor: "#1976d2" },
        borderRadius: "8px",
        fontSize: "0.95rem",
    }),
    valueContainer: (provided) => ({
        ...provided,
        height: "56px",
        padding: "0 8px",
    }),
    input: (provided) => ({
        ...provided,
        margin: "0",
        padding: "0",
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: "56px",
    }),
    placeholder: (provided) => ({
        ...provided,
        color: "#757575",
    }),
};
export default function CreateTeacherPage() {
    const navigate = useNavigate();
    const qualificationOptions = [
        { value: "B.Ed", label: "B.Ed" },
        { value: "M.Ed", label: "M.Ed" },
        { value: "PhD", label: "PhD" },
    ];

    const specializationOptions = [
        { value: "Mathematics", label: "Mathematics" },
        { value: "Physics", label: "Physics" },
        { value: "Computer Science", label: "Computer Science" },
    ];

    const classOptions = [
        { value: "1", label: "Class 1" },
        { value: "2", label: "Class 2" },
        { value: "3", label: "Class 3" },
    ];
    const countries = countryList().getData();
    const states = [
        { value: "Rajasthan", label: "Maharashtra" },
        // { value: "Karnataka", label: "Karnataka" },
        // { value: "Tamil Nadu", label: "Tamil Nadu" },
        { value: "Delhi", label: "Delhi" },
        { value: "Gujarat", label: "Gujarat" },
    ];
    const [student, setStudent] = useState({
        name: "",
        dob: "",
        gender: "",
        bloodGroup: "",
        email: "",
        password: "",
        phone: "",
        address: { street: "", city: "", state: "", zip: "", country: "" },
        designation: "",
        qualifications: [],
        specialization: [],
        experience: 0,
        dateOfJoining: "",
        classes: [],
        subjectsHandled: [
            {
                subjectName: "",
                subjectCode: "",
                classId: ""           // Class ID
            }
        ],

        salaryInfo: {
            basic: 0,
            allowances: 0,
            deductions: 0,
            netSalary: 0
        },
        // parents: [
        //     { name: "", occupation: "", phone: "", email: "" },
        //     { name: "", occupation: "", phone: "", email: "" },
        // ],
        // guardian: { name: "", relation: "", occupation: "", phone: "", email: "" },
        emergencyContact: { name: "", relation: "", phone: "", address: "" },
        classId: "",
        academicYear: "",
        physicalDisability: false,
        disabilityDetails: "",
        documents: {
            profilePic: null,
            aadharFront: null,
            aadharBack: null,
            marksheets: [],
            certificates: [],
        },
    });
    console.log("student", student);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [previews, setPreviews] = useState({
        profilePic: null,
        aadharFront: null,
        aadharBack: null,
        marksheets: [],
        certificates: [],
    });



    const { data: classes = [], isLoading, isError } = useQuery({
        queryKey: ["classesForStudent"],
        queryFn: () => apiGet(apiPath.classes),
    });
    const { data: subjects = [], isLoading: isload, isError: iserr } = useQuery({
        queryKey: ["subjectForTeacher"],
        queryFn: () => apiGet(apiPath.getSubjects),
    });
    console.log("subjects", subjects);
    console.log("classess", classes);
    const steps = ["Personal Details", "Professional Information", "Academic & Documents"];

    // --- Handle Input Changes ---
    const handleChange = (e, parentIndex = null, section = null) => {
        const { name, value, type, checked } = e.target;
        if (parentIndex !== null) {
            const updatedParents = [...student.parents];
            updatedParents[parentIndex][name] = value;
            setStudent({ ...student, parents: updatedParents });
            setErrors((prev) => ({
                ...prev,
                [`parent_${parentIndex}_${name}`]: "",
            }));
        } else if (section) {
            setStudent({
                ...student,
                [section]: { ...student[section], [name]: value },
            });
            setErrors((prev) => ({
                ...prev,
                [`${section}_${name}`]: "",
            }));
        } else if (type === "checkbox") {
            setStudent({ ...student, [name]: checked });
        } else {
            setStudent({ ...student, [name]: value });
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };


    const handleFileUpload = (e, field, section = null) => {
        const inputFiles = e.target.files;
        if (!inputFiles || inputFiles.length === 0) return;

        if (["marksheets", "certificates"].includes(field)) {
            const newFiles = Array.from(inputFiles);
            setStudent(prev => {
                const updatedFiles = [...(prev.documents[field] || []), ...newFiles].slice(0, 5);
                return {
                    ...prev,
                    documents: {
                        ...prev.documents,
                        [field]: updatedFiles,
                    },
                };
            });
            setPreviews(prev => {
                const updatedPreviews = [
                    ...(prev[field] || []),
                    ...newFiles.map(f => URL.createObjectURL(f)),
                ].slice(0, 5);
                return { ...prev, [field]: updatedPreviews };
            });
        } else if (section === "documents") {
            const file = inputFiles[0];
            setStudent(prev => ({
                ...prev,
                documents: { ...prev.documents, [field]: file },
            }));
            setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
        } else {
            const file = inputFiles[0];
            setStudent(prev => ({ ...prev, [field]: file }));
            setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
        }

        // 🔧 Reset the input value so the same files can be re-selected if needed
        e.target.value = "";
    };

    // --- Validation Function ---
    const validateStep = () => {
        const newErrors = {};

        if (activeStep === 0) {
            // if (!student.name) newErrors.name = "Name is required";
            // if (!student.dob) newErrors.dob = "Date of Birth is required";
            // if (!student.gender) newErrors.gender = "Gender is required";
            // if (!student.bloodGroup) newErrors.bloodGroup = "Blood group is required";
            // if (!student.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email))
            //     newErrors.email = "Valid email is required";
            // if (!student.password || student.password.length < 6)
            //     newErrors.password = "Password must be at least 6 characters";
            // if (!student.phone || student.phone.replace(/\D/g, "").length < 10)
            //     newErrors.phone = "Valid phone number required";
            // if(!student.address.street) newErrors.address_street="Street is required";
            // if(!student.address.city) newErrors.address_city="City is required";
            // if(!student.address.state) newErrors.address_state="State is required";
            // if(!student.address.zip) newErrors.address_zip="ZIP is required";
            // if(!student.address.country) newErrors.address_country="Country is required";
            // if (!student.documents.profilePic) {
            //     if (!newErrors.documents) newErrors.documents = {};
            //     newErrors.documents.profilePic = "Profile picture is required";
            // }

        }

        else if (activeStep === 1) {
            if (!student.designation) newErrors.designation = "Designation is required";
            if (student.qualifications.length === 0)
                newErrors.qualifications = "At least one qualification is required";
            if (student.specialization.length === 0)
                newErrors.specialization = "At least one specialization is required";
            if (!student.experience || isNaN(student.experience) || student.experience < 0)
                newErrors.experience = "Valid experience is required";
            if (!student.dateOfJoining) newErrors.dateOfJoining = "Date of joining is required";
            if (student.classes.length === 0)
                newErrors.classes = "At least one class must be assigned";
            if (student.subjectsHandled.length === 0)
                newErrors.subjectsHandled = "At least one subject must be assigned";
            else {

                student.subjectsHandled.forEach((subj, i) => {
                    if (!subj.subjectName) newErrors[`subjectName_${i}`] = "Subject name is required";
                    if (!subj.subjectCode) newErrors[`subjectCode_${i}`] = "Subject code is required";
                    if (!subj.classId) newErrors[`classId_${i}`] = "Class is required"
                });

            }
            if (!student.salaryInfo.basic || isNaN(student.salaryInfo.basic) || student.salaryInfo.basic < 0)
                newErrors.basic = "Basic salary is required";
            if (student.salaryInfo.allowances === "" || isNaN(student.salaryInfo.allowances) || student.salaryInfo.allowances < 0)
                newErrors.allowances = "Allowances must be 0 or more";
            if (student.salaryInfo.deductions === "" || isNaN(student.salaryInfo.deductions) || student.salaryInfo.deductions < 0)
                newErrors.deductions = "Deductions must be 0 or more";
            if (student.salaryInfo.deductions > (Number(student.salaryInfo.basic) + Number(student.salaryInfo.allowances)))
                newErrors.deductions = "Deductions cannot exceed Basic + Allowances";
            if (student.salaryInfo.netSalary !== (Number(student.salaryInfo.basic) + Number(student.salaryInfo.allowances) - Number(student.salaryInfo.deductions)))


                // student.parents.forEach((parent, i) => {
                //     if (!parent.name)
                //         newErrors[`parent_${i}_name`] = "Parent name is required";
                //     if (!parent.occupation)
                //         newErrors[`parent_${i}_occupation`] = "Occupation required";
                //     if (!parent.phone)
                //         newErrors[`parent_${i}_phone`] = "Phone is required";
                //     if (parent.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent.email))
                //         newErrors[`parent_${i}_email`] = "Enter valid email";
                // });

                if (!student.emergencyContact.name)
                    newErrors.emergencyContact_name = "Contact name required";
            if (!student.emergencyContact.relation)
                newErrors.emergencyContact_relation = "Relation required";
            if (!student.emergencyContact.phone)
                newErrors.emergencyContact_phone = "Phone required";
            if (!student.emergencyContact.address)
                newErrors.emergencyContact_address = "Address required";
        }

        else if (activeStep === 2) {
            // if (!student.classId) newErrors.classId = "Class is required";
            // if (!student.academicYear) newErrors.academicYear = "Academic year is required";

            // Document validation
            if (!student.documents.aadharFront)
                newErrors.aadharFront = "Aadhaar front is required";
            if (!student.documents.aadharBack)
                newErrors.aadharBack = "Aadhaar back is required";
        }

        setErrors(newErrors);
        console.log("Validation errors:", newErrors); // helpful for debugging
        return Object.keys(newErrors).length === 0;
    };


    const nextStep = () => {
        if (validateStep()) setActiveStep(prev => prev + 1);
    };

    const prevStep = () => setActiveStep(prev => prev - 1);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep()) return;

        try {
            const formData = new FormData();

            // Add JSON fields
            ["address", "emergencyContact"].forEach((key) => {
                formData.append(key, JSON.stringify(student[key]));
            });

            // ✅ Corrected document handling
            Object.entries(student.documents).forEach(([key, value]) => {
                if (!value) return;

                if (Array.isArray(value)) {
                    value.forEach((file) => {
                        formData.append(key, file); // no [0]
                    });
                } else if (value instanceof File) {
                    formData.append(key, value);
                }
            });

            //       designation: "",
            // qualifications: [],
            // specialization: [],
            // experience: 0,
            // dateOfJoining: "",
            // classes: [],
            // subjectsHandled: [
            //     {
            //         subjectName: "",
            //         subjectCode: "",
            //         classId: ""           // Class ID
            //     }
            // ],

            // salaryInfo: {
            //     basic: 0,
            //     allowances: 0,
            //     deductions: 0,
            //     netSalary: 0
            // },
            // Add remaining primitive fields
     [
  "name",
  "dob",
  "gender",
  "bloodGroup",
  "email",
  "password",
  "phone",
  "classes",
  "physicalDisability",
  "disabilityDetails",
  "designation",
  "specialization",
  "qualifications",
  "experience",
  "dateOfJoining",
  "salaryInfo",
  "subjectsHandled",
].forEach((key) => {
  const value = student[key];
  
  // Arrays/objects should be JSON.stringified
  if (Array.isArray(value) || typeof value === "object") {
    formData.append(key, JSON.stringify(value));
  } else {
    formData.append(key, value);
  }
});


            // For debugging
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            await apiPost(apiPath.createTeacher, formData);
            toast.success("Student created successfully ✅");
            navigate(-1);
        } catch (err) {
            console.error(err);
            toast.error("Failed to create student ❌");
        }
    };

    return (
        <div className="max-w-6xl mx-auto md:p-8 p-3 bg-[var(--color-)] rounded-2xl shadow-xl">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 cursor-pointer px-4 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
                ← Back
            </button>

            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
                Create Teacher
            </h1>

            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                {/* Step 1 */}
                {activeStep === 0 && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={student.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                        <TextField
                            fullWidth
                            type="date"
                            name="dob"
                            value={student.dob}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            label="Date of Birth"
                            error={!!errors.dob}
                            helperText={errors.dob}
                        />
                        <TextField
                            select
                            fullWidth
                            name="gender"
                            label="Gender"
                            value={student.gender}
                            // onChange={handleChange}
                            //              onChange={(e)=>
                            // //         {
                            // //           setStudent({...student,gender:e.target.value});
                            // //           setErrors((prev)=>({...prev,gender:""}));
                            // //         }
                            onChange={(e) => {
                                setStudent({ ...student, gender: e.target.value });
                                setErrors((prev) => ({ ...prev, gender: "" }))
                            }
                            }
                            error={!!errors.gender}
                            helperText={errors.gender}
                        >
                            <MenuItem value="">Select Gender</MenuItem>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                        <TextField
                            select
                            fullWidth
                            name="bloodGroup"
                            label="Blood Group"
                            value={student.bloodGroup}
                            // onChange={handleChange}
                            onChange={(e) => {
                                setStudent({ ...student, bloodGroup: e.target.value });
                                setErrors((prev) => ({ ...prev, bloodGroup: "" }))
                            }
                            }
                            error={!!errors.bloodGroup}
                            helperText={errors.bloodGroup}
                        >
                            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                                <MenuItem key={bg} value={bg}>
                                    {bg}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            type="email"
                            name="email"
                            label="Email"
                            value={student.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                        <TextField
                            fullWidth
                            type={showPassword ? "text" : "password"}
                            name="password"
                            label="Password"
                            value={student.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            helperText={errors.password}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <div>
                            <label className="block text-gray-600 font-medium mb-1">Phone</label>
                            <PhoneInput
                                country="in"
                                enableSearch
                                value={student.phone}
                                onChange={(phone) =>
                                    setStudent({ ...student, phone }) ||
                                    setErrors((p) => ({ ...p, phone: "" }))
                                }
                                inputClass="w-full p-3 rounded-lg border border-gray-300"
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm">{errors.phone}</p>
                            )}
                        </div>
   

                        <div> <TextField
                            fullWidth
                            name="street"
                            label="Street"
                            value={student.address.street}
                            onChange={(e) => handleChange(e, null, "address")}
                            error={!!errors.address_street}
                            helperText={errors.address_street}
                        /></div>
                        <div>
                            <TextField
                                fullWidth
                                name="city"
                                label="City"
                                value={student.address.city}
                                error={!!errors.address_city}
                                helperText={errors.address_city}
                                onChange={(e) => handleChange(e, null, "address")}
                            />
                        </div>
                        <div>
                            <Select
                                name="state"
                                options={states}
                                value={states.find(s => s.value === student.address.state)}
                                onChange={(selected) =>
                                    setStudent((prev) => ({
                                        ...prev,
                                        address: { ...prev.address, state: selected.value },
                                    }))
                                }
                                placeholder="Select State"
                            />
                        </div>
                        <div>
                            <TextField
                                fullWidth
                                name="zip"
                                label="ZIP Code"
                                value={student.address.zip}
                                onChange={(e) => handleChange(e, null, "address")}
                                error={!!errors.address_zip}
                                helperText={errors.address_zip}
                            />

                        </div>
                        <div>
                            <Select
                                name="country"
                                options={countries}
                                value={countries.find(c => c.label === student.address.country)}
                                onChange={(selected) =>
                                    setStudent((prev) => ({
                                        ...prev,
                                        address: { ...prev.address, country: selected.label },
                                    }))
                                }

                                placeholder="Select Country"
                            />
                        </div>
                        {/* --- Disability Section --- */}
                        <div className="bg-gray-50 p-1 rounded-2xl shadow-sm border border-gray-100">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={student.physicalDisability}
                                        onChange={(e) =>
                                            setStudent({
                                                ...student,
                                                physicalDisability: e.target.checked,
                                            })
                                        }
                                        name="physicalDisability"
                                    />
                                }
                                label="Physical Disability"
                            />
                            {student.physicalDisability && (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    name="disabilityDetails"
                                    label="Disability Details"
                                    value={student.disabilityDetails}
                                    onChange={handleChange}
                                    className="mt-3"
                                />
                            )}
                        </div>
                                        <div className="bg-white p-3 w-full rounded-2xl shadow-md border border-gray-200 mx-auto">
  <label className="block text-gray-700 font-semibold mb-3">
    Profile Picture
  </label>

  {/* File Upload Button */}
  <label className="flex items-center justify-center w-ful p-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors duration-200">
    <div className="text-center">
      <p className="text-gray-500 mb-2">Click to upload</p>
      <p className="text-gray-400 text-sm">(JPG, PNG, GIF)</p>
    </div>
    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        handleFileUpload(e, "profilePic", "documents");
        setErrors((prev) => ({ ...prev, profilePic: "" }));
      }}
    />
  </label>

  {/* Error Message */}
  {errors?.documents?.profilePic && (
    <p className="text-red-500 text-sm mt-2">{errors.documents.profilePic}</p>
  )}

  {/* Image Preview */}
  {previews.profilePic && (
    <div className="mt-4 flex justify-center">
      <img
        src={previews.profilePic}
        alt="preview"
        className="w-28 h-28 rounded-full object-cover border border-gray-300 shadow-sm"
      />
    </div>
  )}
</div>
                    </div>
                )}

                {/* Step 2 */}
                {activeStep === 1 && (
                    <div className="space-y-10">

                        {/* TEACHER DETAILS */}

                        <Paper elevation={3} className="p-8 rounded-3xl">
                            {/* Section Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                                    👩‍🏫 Teacher Profile
                                </h2>
                                <span className="text-sm text-gray-500">Provide designation and expertise</span>
                            </div>

                            <Grid container spacing={3} alignItems="center">
                                {/* Designation */}
                                <Grid item xs={12} sm={6}>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Designation
                                    </label>
                                    <TextField
                                        fullWidth
                                        size="medium"
                                        name="designation"
                                        placeholder="Enter designation"
                                        value={student.designation}
                                        onChange={handleChange}
                                        error={!!errors.designation}
                                        helperText={errors.designation}
                                        InputProps={{
                                            style: { height: "56px", borderRadius: "8px" },
                                        }}
                                    />
                                </Grid>

                                {/* Qualifications */}
                                <Grid item xs={12} sm={6}>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Qualifications
                                    </label>
                                    <Select
                                        isMulti
                                        options={qualificationOptions}
                                        styles={customSelectStyles}
                                        classNamePrefix="select"
                                        placeholder="Select qualifications..."
                                        value={student.qualifications.map((q) => ({ value: q, label: q }))}
                                        onChange={(selected) =>
                                            setStudent({
                                                ...student,
                                                qualifications: selected.map((s) => s.value),
                                            })
                                        }
                                    />
                                    {errors.qualifications && (
                                        <p className="text-red-500 text-sm mt-1">{errors.qualifications}</p>
                                    )}
                                </Grid>

                                {/* Specialization */}
                                <Grid item xs={12} sm={6}>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Specialization
                                    </label>
                                    <Select
                                        isMulti
                                        options={specializationOptions}
                                        styles={customSelectStyles}
                                        classNamePrefix="select"
                                        placeholder="Select specialization..."
                                        value={student.specialization.map((s) => ({ value: s, label: s }))}
                                        onChange={(selected) =>
                                            setStudent({
                                                ...student,
                                                specialization: selected.map((s) => s.value),
                                            })
                                        }

                                    />
                                    {errors.qualifications && (
                                        <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
                                    )}
                                </Grid>

                                {/* Experience */}
                                <Grid item xs={12} sm={3}>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Experience (Years)
                                    </label>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        name="experience"
                                        value={student.experience}
                                        onChange={handleChange}
                                        error={!!errors.experience}
                                        helperText={errors.experience}
                                        InputProps={{
                                            style: { height: "56px", borderRadius: "8px" },
                                        }}
                                    />
                                </Grid>

                                {/* Date of Joining */}
                                <Grid item xs={12} sm={3}>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Date of Joining
                                    </label>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        name="dateOfJoining"
                                        InputLabelProps={{ shrink: true }}
                                        value={student.dateOfJoining}
                                        onChange={handleChange}
                                        error={!!errors.dateOfJoining}
                                        helperText={errors.dateOfJoining}
                                        InputProps={{
                                            style: { height: "56px", borderRadius: "8px" },
                                        }}
                                    />
                                </Grid>

                                {/* Classes */}
                                <Grid item xs={12}>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Classes Assigned
                                    </label>
                                    <Select
                                        isMulti
                                        placeholder="Select classes..."
                                        classNamePrefix="select"
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                minHeight: "56px",
                                                borderRadius: "8px",
                                                borderColor: state.isFocused ? "#1976d2" : "#d1d5db",
                                                boxShadow: state.isFocused ? "0 0 0 2px rgba(25,118,210,0.1)" : "none",
                                                "&:hover": { borderColor: "#1976d2" },
                                            }),
                                        }}
                                        options={classes?.results?.docs.map((cls) => ({
                                            value: cls._id,
                                            label: cls.name,
                                        }))}
                                        value={student.classes.map((clsId) => {
                                            const found = classes?.results?.docs.find((cls) => cls._id === clsId);
                                            return found ? { value: found._id, label: found.name } : null;
                                        })}
                                        onChange={(selected) =>
                                            setStudent({
                                                ...student,
                                                classes: selected ? selected.map((s) => s.value) : [],
                                            })
                                        }

                                    />
                                    {errors.classes && (
                                        <p className="text-red-500 text-sm mt-1">{errors.classes}</p>
                                    )}
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* SUBJECTS HANDLED */}
                        <Paper elevation={3} className="p-8 rounded-3xl">
                            {/* Section Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                                        📚 Subjects Handled
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Add the subjects this teacher is responsible for
                                    </p>
                                </div>

                                <Tooltip title="Add new subject">
                                    <IconButton
                                        color="primary"
                                        onClick={() =>
                                            setStudent({
                                                ...student,
                                                subjectsHandled: [
                                                    ...student.subjectsHandled,
                                                    { subjectName: "", subjectCode: "", classId: "" },
                                                ],
                                            })
                                        }
                                    >
                                        <AddCircleOutline fontSize="large" />
                                    </IconButton>
                                </Tooltip>
                            </div>

                            {/* Subjects List */}
                            {student.subjectsHandled.map((subject, index) => (
                                <Paper
                                    key={index}
                                    elevation={1}
                                    className="p-6 mb-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-lg font-semibold text-gray-700">
                                            Subject {index + 1}
                                        </h3>
                                        {student.subjectsHandled.length > 1 && (
                                            <Tooltip title="Remove subject">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => {
                                                        const updated = [...student.subjectsHandled];
                                                        updated.splice(index, 1);
                                                        setStudent({ ...student, subjectsHandled: updated });
                                                    }}
                                                >
                                                    <DeleteOutline />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </div>

                                    <Grid container spacing={3} alignItems="center">
                                        {/* Subject Name */}
                                        <Grid item xs={12} sm={4}>
                                            <Select
                                                key={index}
                                                placeholder="Select subject..."
                                                classNamePrefix="select"
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: "56px",
                                                        borderRadius: "8px",
                                                        borderColor: state.isFocused ? "#1976d2" : "#d1d5db",
                                                        boxShadow: state.isFocused ? "0 0 0 2px rgba(25,118,210,0.1)" : "none",
                                                        "&:hover": { borderColor: "#1976d2" },
                                                    }),
                                                }}
                                                options={subjects?.results?.docs.map((subj) => ({
                                                    value: subj._id,
                                                    label: subj.name,
                                                }))}

                                                value={
                                                    subject.subjectName
                                                        ? {
                                                            value: subject.subjectName,
                                                            label: subjects?.results?.docs.find(
                                                                (subj) => subj._id === subject.subjectName
                                                            )?.name,
                                                        }
                                                        : null
                                                }

                                                onChange={(selected) => {
                                                    const foundSubject = subjects?.results?.docs.find(
                                                        (subj) => subj._id === selected?.value
                                                    );

                                                    const updatedSubjects = [...student.subjectsHandled];
                                                    updatedSubjects[index] = {
                                                        ...updatedSubjects[index],
                                                        subjectName: selected?.value || "",
                                                        subjectCode: foundSubject?.code || "", // 🔹 Auto-fill subject code
                                                    };

                                                    setStudent({
                                                        ...student,
                                                        subjectsHandled: updatedSubjects,
                                                    });
                                                }}
                                            />

                                        </Grid>

                                        {/* Subject Code */}
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="Subject Code"
                                                value={subject.subjectCode}
                                                disabled
                                                onChange={(e) => {
                                                    const updated = [...student.subjectsHandled];
                                                    updated[index].subjectCode = e.target.value;
                                                    setStudent({ ...student, subjectsHandled: updated });
                                                }}
                                                InputProps={{
                                                    style: { height: "56px", borderRadius: "8px" },
                                                }}
                                            />
                                        </Grid>


                                        {/* Class */}
                                        <Grid item xs={12} sm={4}>
                                            <Select
                                                key={index}
                                                placeholder="Select class..."
                                                classNamePrefix="select"
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: "56px",
                                                        borderRadius: "8px",
                                                        borderColor: state.isFocused ? "#1976d2" : "#d1d5db",
                                                        boxShadow: state.isFocused ? "0 0 0 2px rgba(25,118,210,0.1)" : "none",
                                                        "&:hover": { borderColor: "#1976d2" },
                                                    }),
                                                }}
                                                options={classes?.results?.docs.map((cls) => ({
                                                    value: cls._id,
                                                    label: cls.name,
                                                }))}
                                                value={
                                                    subject.classId
                                                        ? { value: subject.classId, label: classes?.results?.docs.find((cls) => cls._id === subject.classId)?.name }
                                                        : null
                                                }
                                                onChange={(selected) => {
                                                    const updatedSubjects = [...student.subjectsHandled]; // copy array
                                                    updatedSubjects[index] = {
                                                        ...updatedSubjects[index], // copy existing object
                                                        classId: selected.value,   // update classId
                                                    };
                                                    setStudent({
                                                        ...student,
                                                        subjectsHandled: updatedSubjects, // set updated array
                                                    });
                                                }}
                                            />

                                        </Grid>
                                    </Grid>

                                    {index !== student.subjectsHandled.length - 1 && (
                                        <Divider className="mt-6" />
                                    )}
                                </Paper>
                            ))}
                        </Paper>

                        {/* SALARY INFO */}
                     {/* SALARY INFO */}
<Paper elevation={3} className="p-8 rounded-3xl">
  <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
    💰 Salary Details
  </h2>

  <Grid container spacing={3}>
    {["basic", "allowances", "deductions"].map((field) => (
      <Grid item xs={12} sm={3} key={field}>
        <TextField
          fullWidth
          type="number"
          name={field}
          label={field.replace(/^\w/, (c) => c.toUpperCase())}
          value={student.salaryInfo[field]}
          onChange={(e) => {
            const { name, value } = e.target;
            const updatedSalary = {
              ...student.salaryInfo,
              [name]: parseFloat(value) || 0,
            };

            // 🔹 Auto-calculate net salary
            const { basic = 0, allowances = 0, deductions = 0 } = updatedSalary;
            updatedSalary.netSalary = basic + allowances - deductions;

            setStudent({
              ...student,
              salaryInfo: updatedSalary,
            });
          }}
          InputProps={{
            style: { height: "56px", borderRadius: "8px" },
          }}
        />
      </Grid>
    ))}

    {/* Auto-calculated Net Salary */}
    <Grid item xs={12} sm={3}>
      <TextField
        fullWidth
        type="number"
        name="netSalary"
        label="Net Salary (Auto)"
        value={student.salaryInfo.netSalary || 0}
        InputProps={{
          readOnly: true,
          style: { height: "56px", borderRadius: "8px", backgroundColor: "#f9fafb" },
        }}
      />
    </Grid>
  </Grid>
</Paper>


                        {/* EMERGENCY CONTACT */}
                        <Paper elevation={3} className="p-8 rounded-3xl">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                🚨 Emergency Contact
                            </h2>
                            <Grid container spacing={3}>
                                {["name", "relation", "address"].map((field) => (
                                    <Grid item xs={12} sm={4} key={field}>
                                        <TextField
                                            fullWidth
                                            name={field}
                                            label={`Emergency ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                                            value={student.emergencyContact[field]}
                                            onChange={(e) => handleChange(e, null, "emergencyContact")}
                                            error={!!errors[`emergencyContact_${field}`]}
                                            helperText={errors[`emergencyContact_${field}`]}
                                        />
                                    </Grid>
                                ))}
                                <Grid item xs={12} sm={4} className="flex gap-2">
                                    {/* <label className="block text-gray-700 font-medium mb-2">Phone</label> */}
                                    <PhoneInput
                                        country="in"
                                        enableSearch
                                        value={student.emergencyContact.phone}
                                        onChange={(phone) => {
                                            setStudent({
                                                ...student,
                                                emergencyContact: { ...student.emergencyContact, phone },
                                            });
                                            setErrors((prev) => ({ ...prev, emergencyContact_phone: "" }));
                                        }}
                                        containerClass="w-full"
                                        inputClass="!w-full !h-[56px] !pl-[60px] !pr-3 !text-gray-800 !border !border-gray-300 !rounded-lg focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-100 !shadow-none !text-base"
                                        buttonClass="!border-none !bg-transparent !p-0 !absolute !top-[2px] !left-[6px]"
                                        searchClass="!p-2 !rounded-lg !border !border-gray-300"
                                        dropdownClass="!rounded-lg !shadow-md"
                                        placeholder="Enter phone number"
                                    />
                                    <div>

                                    </div>
                                    {errors.emergencyContact_phone && (
                                        <p className="text-red-500  text-xs mt-1">
                                            {errors.emergencyContact_phone}
                                        </p>
                                    )}
                                </Grid>
                            </Grid>
                        </Paper>
                    </div>
                )}




                {/* Step 3 */}
                {activeStep === 2 && (
                    <div className="space-y-8">
                        {/* --- Academic Info --- */}
                        {/* <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Academic Information</h2>

                            <div className="grid md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-gray-200">
                                <TextField
                                    select
                                    fullWidth
                                    name="classId"
                                    label="Select Class"
                                    value={student.classId}
                                    // onChange={handleChange}
                                    onChange={(e) => {
                                        setStudent({ ...student, classId: e.target.value });

                                    }
                                    }
                                    error={!!errors.classId}
                                    helperText={errors.classId}
                                >
                                    <MenuItem value="">Select Class</MenuItem>
                                    {classes?.results?.docs?.map((cls) => (
                                        <MenuItem key={cls._id} value={cls._id}>
                                            {cls.name}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    select
                                    fullWidth
                                    name="academicYear"
                                    label="Academic Year"
                                    value={student.academicYear}
                                    onChange={(e) => {
                                        setStudent({ ...student, academicYear: e.target.value });
                                        setErrors((prev) => ({ ...prev, academicYear: "" }));
                                    }}
                                    error={!!errors.academicYear}
                                    helperText={errors.academicYear}
                                >
                                    {Array.from({ length: 5 }).map((_, i) => {
                                        const startYear = new Date().getFullYear() + i;
                                        const endYear = startYear + 1;
                                        const yearString = `${startYear}-${endYear}`;
                                        return (
                                            <MenuItem key={yearString} value={yearString}>
                                                {yearString}
                                            </MenuItem>
                                        );
                                    })}
                                </TextField>
                            </div>
                        </div> */}



                        {/* --- Aadhaar Card Upload --- */}
                        <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Aadhaar Card Upload</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {["aadharFront", "aadharBack"].map((side) => (
                                    <div key={side} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                        <label className="block text-gray-700 font-medium mb-2">
                                            {side === "aadharFront" ? "Aadhaar Front" : "Aadhaar Back"} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, side, "documents")}
                                        />
                                        {errors[side] && (
                                            <p className="text-red-500 text-sm mt-1">{errors[side]}</p>
                                        )}
                                        {previews[side] && (
                                            <div className="mt-3 relative inline-block">
                                                <img
                                                    src={previews[side]}
                                                    alt={side}
                                                    className="w-40 h-28 object-cover rounded-lg shadow"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPreviews((p) => ({ ...p, [side]: null }));
                                                        setStudent((s) => ({
                                                            ...s,
                                                            documents: { ...s.documents, [side]: null },
                                                        }));
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* --- marksheets Upload --- */}
                        {/* <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">marksheets Upload (Max 5)</h2>
                            <input
                                type="file"
                                multiple
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileUpload(e, "marksheets")}
                                className="mb-4"
                            />


                            {previews.marksheets?.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                                    {previews.marksheets.map((src, idx) => (
                                        <div
                                            key={idx}
                                            className="relative group border rounded-lg overflow-hidden shadow hover:scale-105 transition-transform duration-200"
                                        >
                                            <img
                                                src={src}
                                                alt={`marksheets-${idx}`}
                                                className="w-full h-32 object-cover"
                                            />
                                            <button
                                                type="button"
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    const updatedFiles = student.documents.marksheets.filter((_, i) => i !== idx);
                                                    const updatedPreviews = previews.marksheets.filter((_, i) => i !== idx);
                                                    setStudent((prev) => ({
                                                        ...prev,
                                                        documents: { ...prev.documents, marksheets: updatedFiles },
                                                    }));
                                                    setPreviews((prev) => ({ ...prev, marksheets: updatedPreviews }));
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div> */}

                        {/* --- Certificate Upload --- */}
                        {/* <div className="bg-[var(--color-neutral)] p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Certificates Upload (Max 5)</h2>
                            <input
                                type="file"
                                multiple
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileUpload(e, "certificates")}
                                className="mb-4"
                            />

                            {previews.certificates?.length > 0 && (
                                <div className="flex flex-wrap gap-4 mt-2">
                                    {previews.certificates.map((src, idx) => (
                                        <div
                                            key={idx}
                                            className="relative w-32 h-32 group border rounded-lg overflow-hidden shadow hover:scale-105 transition-transform duration-200"
                                        >
                                            <img
                                                src={src}
                                                alt={`Certificate-${idx}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    const updatedFiles = student.documents.certificates.filter((_, i) => i !== idx);
                                                    const updatedPreviews = previews.certificates.filter((_, i) => i !== idx);
                                                    setStudent((prev) => ({
                                                        ...prev,
                                                        documents: { ...prev.documents, certificates: updatedFiles },
                                                    }));
                                                    setPreviews((prev) => ({ ...prev, certificates: updatedPreviews }));
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div> */}

                    </div>
                )}


                {/* Navigation */}
                <div className="flex justify-between pt-6">
                    {activeStep > 0 && (
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={prevStep}
                        >
                            Back
                        </Button>
                    )}
                    {activeStep < steps.length - 1 ? (
                        <Button
                            type="button"
                            variant="contained"
                            style={{ backgroundColor: "#ffeb3b", color: "#000" }}
                            onClick={nextStep}
                        >
                            Next
                        </Button>
                    ) : (
                        <button
                            type="submit"
                            className="p-2 rounded cursor-pointer"
                            // variant="contained"
                            style={{ backgroundColor: "#4caf50", color: "white" }}
                        >
                            Submit
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
