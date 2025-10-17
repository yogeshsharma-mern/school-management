import { useState } from "react";
import { apiPost, apiGet } from "../api/apiFetch";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import apiPath from "../api/apiPath";
import { useQuery } from "@tanstack/react-query";
import { SettingsSuggestOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import { BsCloudUpload } from "react-icons/bs";
import { Edit, School } from "@mui/icons-material";
// import Select from "@mui/material";
import Select from "react-select";
import { FaPlusCircle } from "react-icons/fa";
import { useEffect } from "react";



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
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Divider,
  Tooltip,
  CircularProgress,
} from "@mui/material";

export default function CreateStudentPage() {
  const navigate = useNavigate();

  const [student, setStudent] = useState({
    name: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    email: "",
    password: "",
    phone: "",
    address: { street: "", city: "", state: "", zip: "", country: "" },
    parents: [
      { name: "", occupation: "", phone: "", email: "" },
      { name: "", occupation: "", phone: "", email: "" },
    ],
    guardian: { name: "", relation: "", occupation: "", phone: "", email: "" },
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

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
  const [previews, setPreviews] = useState({
    profilePic: null,
    aadharFront: null,
    aadharBack: null,
    marksheets: [],
    certificates: [],
  });
    const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
    const [formData, setFormData] = useState({
      academicYear: `${currentYear}-${nextYear}`,
      feeHeads: [
        { type: "Tuition Fee", amount: 0, isOptional: false },
        { type: "Exam Fee", amount: 0, isOptional: false },
      ],
      totalAmount: 0,
    });
     console.log("formdata",formData);
      const addFeeHead = () =>
    setFormData({
      ...formData,
      feeHeads: [...formData.feeHeads, { type: "", amount: 0, isOptional: false }],
    });
      const removeFeeHead = (index) =>
    setFormData({
      ...formData,
      feeHeads: formData.feeHeads.filter((_, i) => i !== index),
    });
    const [editData, setEditData] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showSecondParent, setShowSecondParent] = useState(false);

  const { data: classes = [], isLoading, isError } = useQuery({
    queryKey: ["classesForStudent"],
    queryFn: () => apiGet(apiPath.classes),
  });
const classOptions = (() => {
  if (!classes?.results?.docs) return [];

  const uniqueMap = new Map();

  classes.results.docs.forEach((cls) => {
    // Extract base class name (e.g., "10th" from "10th A" or "10th-B")
    const baseName = cls.name.split(" ")[0].trim();

    if (!uniqueMap.has(baseName)) {
      uniqueMap.set(baseName, {
        value: baseName, // or cls.classIdentifier if consistent
        label: baseName,
      });
    }
  });

  return Array.from(uniqueMap.values());
})();

  const selectedClassLabel =
    classOptions.find((cls) => cls.value === selectedClass)?.label || "N/A";

  // get fees structure
  const { data: feesData, isLoading: feesLoading } = useQuery({
    queryKey: ["feesStructuredata", selectedClass],
    queryFn: () =>
      apiGet(`${apiPath.getFeesStructure}?classIdentifier=${selectedClass}`),
    enabled: !!selectedClass,
  });
  useEffect(() => {
  if (feesData?.results) {
    // Example response: { feeHeads: [...], totalAmount: 5000, academicYear: "2025-2026" }
    const fetched = feesData.results;

    setFormData((prev) => ({
      ...prev,
      feeHeads: fetched.feeHeads || prev.feeHeads,
      totalAmount: fetched.totalAmount || 0,
      academicYear: fetched.academicYear || prev.academicYear,
    }));
  }
}, [feesData]);

console.log("feesdata",feesData);
  const steps = ["Personal Details", "Parent & Guardian", "Academic & Documents", "Fees Details"];

  // --- Handle Input Changes ---
  const handleChange = (e, parentIndex = null, section = null) => {
    const { name, value, type, checked } = e.target;

    // ✅ Block numbers and special characters for 'name' fields
    const isNameField = name.toLowerCase().includes("name");
    const sanitizedValue = isNameField ? value.replace(/[^A-Za-z\s]/g, "") : value;

    if (parentIndex !== null) {
      const updatedParents = [...student.parents];
      updatedParents[parentIndex][name] = sanitizedValue;
      setStudent({ ...student, parents: updatedParents });
      setErrors((prev) => ({
        ...prev,
        [`parent_${parentIndex}_${name}`]: "",
      }));
    } else if (section) {
      setStudent({
        ...student,
        [section]: { ...student[section], [name]: sanitizedValue },
      });
      setErrors((prev) => ({
        ...prev,
        [`${section}_${name}`]: "",
      }));
    } else if (type === "checkbox") {
      setStudent({ ...student, [name]: checked });
    } else {
      setStudent({ ...student, [name]: sanitizedValue });
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const handleFeeHeadChange = (index, field, value) => {
    const newHeads = [...formData.feeHeads];
    newHeads[index][field] = value;
    setFormData({ ...formData, feeHeads: newHeads });
  };
    const handleEdit = () => {
    const data = feesData?.results;
    if (!data) return;

    setEditData(data);
    setFormData({
      academicYear: data.academicYear || `${currentYear}-${nextYear}`,
      feeHeads: data.feeHeads || [
        { type: "Tuition Fee", amount: 0, isOptional: false },
        { type: "Exam Fee", amount: 0, isOptional: false },
      ],
      totalAmount: data.totalAmount || 0,
    });
    setIsModalOpen(true);
  };


  // --- Handle File Upload ---
  // const handleFileUpload = (e, field, section = null) => {
  //   const inputFiles = e.target.files;
  //   if (!inputFiles || inputFiles.length === 0) return;

  //   // Multiple files (marksheets, certificates)
  //   if (["marksheets", "certificates"].includes(field)) {
  //     const files = Array.from(inputFiles).slice(0, 5);
  //     setStudent(prev => ({
  //       ...prev,
  //       documents: {
  //         ...prev.documents,
  //         [field]: files,
  //       },
  //     }));
  //     setPreviews(prev => ({
  //       ...prev,
  //       [field]: files.map(f => URL.createObjectURL(f)),
  //     }));
  //   } 
  //   // Single files inside documents section
  //   else if (section === "documents") {
  //     const file = inputFiles[0];
  //     setStudent(prev => ({
  //       ...prev,
  //       documents: { ...prev.documents, [field]: file },
  //     }));
  //     setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
  //   } 
  //   // Single file outside documents
  //   else {
  //     const file = inputFiles[0];
  //     setStudent(prev => ({ ...prev, [field]: file }));
  //     setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
  //   }
  // };
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

    // if (activeStep === 0) {
    //   if (!student.name.trim()) {
    //     newErrors.name = "Name is required";
    //   } else if (!/^[A-Za-z\s]+$/.test(student.name)) {
    //     newErrors.name = "Name must not contain numbers or special characters";
    //   }
    //   if (!student.dob) newErrors.dob = "Date of Birth is required";
    //   if (!student.gender) newErrors.gender = "Gender is required";
    //   if (!student.bloodGroup) newErrors.bloodGroup = "Blood group is required";
    //   if (!student.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email))
    //     newErrors.email = "Valid email is required";
    //   if (!student.password || student.password.length < 6)
    //     newErrors.password = "Password must be at least 6 characters";
    //   if (!student.phone || student.phone.replace(/\D/g, "").length < 10)
    //     newErrors.phone = "Valid phone number required";
    //   if (!student.documents || !student.documents.profilePic) {
    //     newErrors.documents = { ...(newErrors.documents || {}), profilePic: "Profile picture is required" };
    //   }
    // }

    // else if (activeStep === 1) {
    //   student.parents.forEach((parent, i) => {
    //     if (!parent.name)
    //       newErrors[`parent_${i}_name`] = "Parent name is required";
    //     if (!parent.occupation)
    //       newErrors[`parent_${i}_occupation`] = "Occupation required";
    //     if (!parent.phone)
    //       newErrors[`parent_${i}_phone`] = "Phone is required";
    //     if (parent.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent.email))
    //       newErrors[`parent_${i}_email`] = "Enter valid email";
    //   });

    //   if (!student.emergencyContact.name)
    //     newErrors.emergencyContact_name = "Contact name required";
    //   if (!student.emergencyContact.relation)
    //     newErrors.emergencyContact_relation = "Relation required";
    //   if (!student.emergencyContact.phone)
    //     newErrors.emergencyContact_phone = "Phone required";
    //   if (!student.emergencyContact.address)
    //     newErrors.emergencyContact_address = "Address required";
    // }

    // else if (activeStep === 2) {
    //   if (!student.classId) newErrors.classId = "Class is required";
    //   if (!student.academicYear) newErrors.academicYear = "Academic year is required";

    //   if (!student.documents?.aadharFront) {
    //     newErrors.aadharFront = "Aadhar front is required";
    //   }

    //   if (!student.documents?.aadharBack) {
    //     newErrors.aadharBack = "Aadhar back is required";
    //   }
    // }

    setErrors(newErrors);
    console.log("Validation errors:", newErrors); // helpful for debugging
    return Object.keys(newErrors).length === 0;
  };


  const nextStep = () => {
    if (validateStep()) setActiveStep(prev => prev + 1);
  };

  const prevStep = () => setActiveStep(prev => prev - 1);


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validateStep()) return;

  //   try {
  //     const formData = new FormData();

  //     // Add JSON fields
  //     ["address", "parents", "guardian", "emergencyContact"].forEach((key) => {
  //       formData.append(key, JSON.stringify(student[key]));
  //     });

  //     // ✅ Corrected document handling
  //     Object.entries(student.documents).forEach(([key, value]) => {
  //       if (!value) return;

  //       if (Array.isArray(value)) {
  //         value.forEach((file) => {
  //           formData.append(key, file); // no [0]
  //         });
  //       } else if (value instanceof File) {
  //         formData.append(key, value);
  //       }
  //     });

  //     // Add remaining primitive fields
  //     [
  //       "name",
  //       "dob",
  //       "gender",
  //       "bloodGroup",
  //       "email",
  //       "password",
  //       "phone",
  //       "classId",
  //       "academicYear",
  //       "physicalDisability",
  //       "disabilityDetails",
  //     ].forEach((key) => {
  //       formData.append(key, student[key]);
  //     });

  //     // For debugging
  //     for (let [key, value] of formData.entries()) {
  //       console.log(key, value);
  //     }

  //     const res = await apiPost(apiPath.studentReg, formData);
  //     // console.log("res student created",res);
  //     if (res.success == true)
  //       toast.success("Student created successfully ✅");
  //     navigate(-1);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error(err?.response?.data?.message || "Failed to add student ❌");
  //   }
  // };
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateStep()) return;

  try {
    const formDataObj = new FormData();

    // Add nested JSON fields
    ["address", "parents", "guardian", "emergencyContact"].forEach((key) => {
      formDataObj.append(key, JSON.stringify(student[key]));
    });

    // ✅ Document uploads
    Object.entries(student.documents).forEach(([key, value]) => {
      if (!value) return;
      if (Array.isArray(value)) {
        value.forEach((file) => formDataObj.append(key, file));
      } else if (value instanceof File) {
        formDataObj.append(key, value);
      }
    });

    // ✅ Add primitive student fields
    [
      "name",
      "dob",
      "gender",
      "bloodGroup",
      "email",
      "password",
      "phone",
      "classId",
      "academicYear",
      "physicalDisability",
      "disabilityDetails",
    ].forEach((key) => {
      formDataObj.append(key, student[key]);
    });

    // ✅ Add Fee Structure data together
    formDataObj.append("feeStructureId", feesData?.results?._id || "");
    formDataObj.append(
      "appliedFeeHeads",
      JSON.stringify(
        formData.feeHeads.map((f) => ({
          type: f.type,
          amount: Number(f.amount),
        }))
      )
    );
    formDataObj.append("discounts", 0);

    // 🧾 For debugging
    for (let [key, value] of formDataObj.entries()) {
      console.log(key, value);
    }

    // ✅ Send single combined payload
    const res = await apiPost(apiPath.studentReg, formDataObj);

    if (res.success) {
      toast.success("Student with fees created successfully ✅");
      navigate(-1);
    }
  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Failed to add student ❌");
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
        Add Student
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
              inputProps={{
                max: new Date(Date.now() - 86400000).toISOString().split("T")[0], // 🔒 only before today
              }}
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
              {/* <label className="block text-gray-600 font-medium mb-1">Phone</label> */}
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
            <div className="w-full max-w-xs ">
              <label className="block text-gray-700 font-semibold mb-2">Profile Picture</label>

              <div className="relative">
                {/* Upload Box */}
                <label
                  htmlFor="profilePic"
                  className="flex flex-col items-center w-full justify-center w-full py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors bg-gray-50"
                >
                  {previews.profilePic ? (
                    <img
                      src={previews.profilePic}
                      alt="preview"
                      className=" rounded-full w-[100px] h-[100px] object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <BsCloudUpload size={20} className="mx-auto text-blue-500" />
                      <span className="text-sm">Click  to upload</span>
                    </div>
                  )}
                  <input
                    id="profilePic"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handleFileUpload(e, "profilePic", "documents");
                      setErrors((prev) => ({
                        ...prev,
                        documents: {
                          ...(prev.documents || {}),
                          profilePic: "",
                        },
                      }));
                    }}
                  />
                </label>

                {/* Remove button */}
                {previews.profilePic && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviews((p) => ({ ...p, profilePic: null }));
                      setStudent((s) => ({
                        ...s,
                        documents: { ...s.documents, profilePic: null },
                      }));
                    }}
                    className="absolute cursor-pointer -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Error Message */}
              {errors?.documents?.profilePic && (
                <p className="text-red-500 text-sm mt-1">{errors.documents.profilePic}</p>
              )}
            </div>

          </div>
        )}

        {/* Step 2 */}
        {activeStep === 1 && (
          <div className="space-y-8">
            {/* --- Parent Details --- */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Parent Details</h2>

                <div className="flex gap-2">
                  {student.parents.length < 2 && (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() =>
                        setStudent((prev) => ({
                          ...prev,
                          parents: [...prev.parents, { name: "", occupation: "", phone: "", email: "" }],
                        }))
                      }
                    >
                      + Add Parent
                    </Button>
                  )}
                  {student.parents.length > 1 && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() =>
                        setStudent((prev) => ({
                          ...prev,
                          parents: prev.parents.slice(0, -1),
                        }))
                      }
                    >
                      🗑 Remove Parent
                    </Button>
                  )}
                </div>
              </div>

              {student.parents.map((parent, index) => (
                <div
                  key={index}
                  className="grid md:grid-cols-2 gap-6 mb-6 bg-white p-5 rounded-xl border border-gray-200"
                >
                  <TextField
                    fullWidth
                    name="name"
                    label={`Parent ${index + 1} Name`}
                    value={parent.name}
                    onChange={(e) => handleChange(e, index)}
                    error={!!errors[`parent_${index}_name`]}
                    helperText={errors[`parent_${index}_name`]}
                  />
                  <TextField
                    fullWidth
                    name="occupation"
                    label="Occupation"
                    value={parent.occupation}
                    onChange={(e) => handleChange(e, index)}
                    error={!!errors[`parent_${index}_occupation`]}
                    helperText={errors[`parent_${index}_occupation`]}
                  />
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    value={parent.email}
                    onChange={(e) => handleChange(e, index)}
                    error={!!errors[`parent_${index}_email`]}
                    helperText={errors[`parent_${index}_email`]}
                  />
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Phone</label>
                    <PhoneInput
                      country="in"
                      enableSearch
                      value={parent.phone}
                      onChange={(phone) => {
                        const updatedParents = [...student.parents];
                        updatedParents[index].phone = phone;
                        setStudent({ ...student, parents: updatedParents });
                        setErrors((prev) => ({
                          ...prev,
                          [`parent_${index}_phone`]: "",
                        }));
                      }}
                      inputClass="w-full p-3 rounded-lg border border-gray-300"
                    />
                    {errors[`parent_${index}_phone`] && (
                      <p className="text-red-500 text-sm">{errors[`parent_${index}_phone`]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* --- Guardian Details --- */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Guardian Details</h2>
              <div className="grid md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-gray-200">
                {["name", "relation", "occupation", "email"].map((field) => (
                  <TextField
                    key={field}
                    fullWidth
                    name={field}
                    label={`Guardian ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                    value={student.guardian[field]}
                    onChange={(e) => handleChange(e, null, "guardian")}
                    error={!!errors[`guardian_${field}`]}
                    helperText={errors[`guardian_${field}`]}
                  />
                ))}
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Phone</label>
                  <PhoneInput
                    country="in"
                    enableSearch
                    value={student.guardian.phone}
                    onChange={(phone) => {
                      setStudent({
                        ...student,
                        guardian: { ...student.guardian, phone },
                      });
                      setErrors((prev) => ({ ...prev, guardian_phone: "" }));
                    }}
                    inputClass="w-full p-3 rounded-lg border border-gray-300"
                  />
                  {errors.guardian_phone && (
                    <p className="text-red-500 text-sm">{errors.guardian_phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* --- Emergency Contact --- */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h2>
              <div className="grid md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-gray-200">
                {["name", "relation", "address"].map((field) => (
                  <TextField
                    key={field}
                    fullWidth
                    name={field}
                    label={`Emergency Contact ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                    value={student.emergencyContact[field]}
                    onChange={(e) => handleChange(e, null, "emergencyContact")}
                    error={!!errors[`emergencyContact_${field}`]}
                    helperText={errors[`emergencyContact_${field}`]}
                  />
                ))}
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Phone</label>
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
                    inputClass="w-full p-3 rounded-lg border border-gray-300"
                  />
                  {errors.emergencyContact_phone && (
                    <p className="text-red-500 text-sm">{errors.emergencyContact_phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Step 3 */}
        {activeStep === 2 && (
          <div className="space-y-8">
            {/* --- Academic Info --- */}


            {/* --- Disability Section --- */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
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
                      onChange={(e) => {
                        handleFileUpload(e, side, "documents");
                        setErrors((prev) => ({ ...prev, [side]: "" })); // ✅ clears top-level error
                      }}
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
            <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
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
            </div>

            {/* --- Certificate Upload --- */}
            <div className="bg-[var(--color-neutral)] p-6 rounded-2xl shadow-sm border border-gray-100">
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
            </div>

          </div>
        )}
        {/* step 4 */}
        {
          activeStep === 3 && (
            <div className="space-y-8">
              <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
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
                      const selectedId = e.target.value;
                      const selectedClassObj = classes?.results?.docs?.find(
                        (cls) => cls._id === selectedId
                      );

                      // classId = id (for backend)
                      // selectedClass = class name (for fetching fees)
                      setStudent({ ...student, classId: selectedId });
                      setSelectedClass(selectedClassObj?.name || "");
                    }}
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
                    {Array.from({ length: 1 }).map((_, i) => {
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
              </div>
                 <form
                         onSubmit={(e) => {
                           e.preventDefault();
                           const tuition = formData.feeHeads.find((f) => f.type === "Tuition Fee");
                           const exam = formData.feeHeads.find((f) => f.type === "Exam Fee");
               
                           if (!tuition?.amount || !exam?.amount) {
                             toast.error("Tuition Fee and Exam Fee are required!");
                             return;
                           }
                           handleSubmit(e);
                         }}
                         className="space-y-4"
                       >
                         {/* Academic Year */}
                         {/* <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                           <input
                             type="text"
                             value={formData.academicYear}
                             readOnly
                             className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-sm text-gray-700 cursor-not-allowed"
                           />
                         </div> */}
               
                         {/* Fee Heads */}
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Fee Heads</label>
               
                           {formData.feeHeads.map((head, index) => {
                             const feeTypeOptions = [
                               { value: "Tuition Fee", label: "Tuition Fee" },
                               { value: "Exam Fee", label: "Exam Fee" },
                               { value: "Transport Fee", label: "Transport Fee" },
                               { value: "Miscellaneous", label: "Miscellaneous" },
                             ];
                             const selectedTypes = formData.feeHeads.map((f) => f.type);
                             const availableOptions = feeTypeOptions.map((opt) => ({
                               ...opt,
                               isDisabled: selectedTypes.includes(opt.value) && opt.value !== head.type,
                             }));
                             const isMandatory = head.type === "Tuition Fee" || head.type === "Exam Fee";
               
                             return (
                               <div key={index} className="flex flex-wrap items-center gap-3 border p-3 rounded-md mb-2 bg-yellow-50 shadow-sm hover:shadow-md transition-shadow">
                                 <div className="w-full sm:w-[260px]">
                                   <Select
                                     options={availableOptions}
                                     value={head.type ? { value: head.type, label: head.type } : null}
                                     placeholder="Select Fee Type"
                                     onChange={(opt) => handleFeeHeadChange(index, "type", opt?.value || "")}
                                     isDisabled={isMandatory}
                                   />
                                 </div>
               
                                 <input
                                   type="number"
                                   placeholder="Amount"
                                   value={head.amount}
                                   onChange={(e) => handleFeeHeadChange(index, "amount", Number(e.target.value))}
                                   className="w-full sm:w-[140px] border border-gray-300 rounded-md px-2 py-1 text-xs"
                                 />
               
                                 <label className="flex items-center gap-1 text-sm w-auto">
                                   <input
                                     type="checkbox"
                                     checked={head.isOptional}
                                     onChange={(e) => handleFeeHeadChange(index, "isOptional", e.target.checked)}
                                     disabled={isMandatory}
                                   />
                                   Optional
                                 </label>
               
                                 {!isMandatory && (
                                   <button
                                     type="button"
                                     onClick={() => removeFeeHead(index)}
                                     className="text-red-500 hover:text-red-700 text-xs"
                                   >
                                     ✕
                                   </button>
                                 )}
                               </div>
                             );
                           })}
               
                           {formData.feeHeads.length < 4 && (
                             <Button
                               variant="outlined"
                               startIcon={<FaPlusCircle />}
                               onClick={addFeeHead}
                               className="text-yellow-700 border-yellow-400 hover:bg-yellow-100 mt-2"
                             >
                               Add Optional Fee
                             </Button>
                           )}
                         </div>
               
                         {/* Save / Cancel */}
                       
                       </form>
            </div>
          )
        }
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
              // variant="contained"
              style={{ backgroundColor: "#4caf50", color: "white" }}
              className="px-6 py-2 rounded-lg hover:bg-green-600 cursor-pointer"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
