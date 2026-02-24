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
import { useEffect, useRef, useLayoutEffect } from "react";
import { Country, State, City } from "country-state-city";

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "56px",
    height: "56px",
    borderColor: state.isFocused ? "#1976d2" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(25, 118, 210, 0.2)" : "none",
    "&:hover": { borderColor: "#1976d2" },
    borderRadius: "8px",
    fontSize: "0.95rem",
    backgroundColor: state.isDisabled ? "#f9fafb" : "white",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: "56px",
    padding: "0 12px",
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
    color: "#9ca3af",
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    zIndex: 9999,
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#1976d2"
      : state.isFocused
        ? "#e8f0fe"
        : "white",
    color: state.isSelected ? "white" : "#1f2937",
    cursor: "pointer",
    padding: "10px 12px",
    fontSize: "0.95rem",
    "&:active": {
      backgroundColor: "#1565c0",
    },
  }),
};
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
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Divider,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import countryList from "react-select-country-list";
import ScrollToTop from "../ScrollToTop";
const countries = countryList().getData();


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
      // { name: "", occupation: "", phone: "", email: "" },
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feeStructureFound, setFeeStructureFound] = useState(false);
  const [loadingFeeHeads, setLoadingFeeHeads] = useState(false);
  const [previews, setPreviews] = useState({
    profilePic: null,
    aadharFront: null,
    aadharBack: null,
    marksheets: [],
    certificates: [],
  });
  const states = [
    { value: "Rajasthan", label: "Rajasthan" },
    // { value: "Karnataka", label: "Karnataka" },
    // { value: "Tamil Nadu", label: "Tamil Nadu" },
    { value: "Delhi", label: "Delhi" },
    { value: "Gujarat", label: "Gujarat" },
  ];
  const formTopRef = useRef(null);

  useLayoutEffect(() => {
    const scrollToTop = () => {
      if (formTopRef.current) {
        formTopRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToTop, 100);

    return () => clearTimeout(timeoutId);
  }, [activeStep]);




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
    queryFn: () => apiGet(apiPath.activeClasses),
  });
  const { data: academicSessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ["current-academic-session"],
    queryFn: () => apiGet(apiPath.currentSession),
  });
  const currentSession =
    academicSessionData?.results?.academicSession?.currentSession || "";
  console.log("currentSession", currentSession);
  const formatAcademicSession = (session) => {
    if (!session || session.length < 21) return session;

    // ✅ Extract exact dates using substring (safe)
    const start = session.substring(0, 10);
    const end = session.substring(11, 21);

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      if (isNaN(date)) return dateStr;

      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };
  useEffect(() => {
    if (!currentSession) return;

    setStudent(prev => ({
      ...prev,
      academicYear: currentSession,
    }));
  }, [currentSession]);

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

  const steps = ["Personal Details", "Parent & Guardian", "Academic & Documents", "Fees Details"];

  // --- Handle Input Changes ---
  const handleChange = (e, parentIndex = null, section = null) => {
    const { name, value, type, checked } = e.target;

    // ✅ Block numbers and special characters for 'name' fields
    let sanitizedValue = value;

    // ✅ Prevent numbers in "city" field
    if (name === "city") {
      sanitizedValue = value.replace(/[^A-Za-z\s]/g, ""); // only letters & spaces
    }

    // ✅ Prevent text in ZIP field (allow only digits)
    // ✅ ZIP: allow only digits AND max 6 digits
    if (name === "zip") {
      sanitizedValue = value
        .replace(/\D/g, "")   // remove non-digits
        .slice(0, 6);         // limit to 6 digits
    }


    // ✅ Block numbers and special characters for 'name' fields (like parent name, guardian name)
    const isNameField = name.toLowerCase().includes("name") && name !== "username";
    if (isNameField && name !== "city") {
      sanitizedValue = sanitizedValue.replace(/[^A-Za-z\s]/g, "");
    }

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
  const countryOptions = Country.getAllCountries().map(country => ({
    value: country.isoCode,
    label: country.name,
  }));

  const stateOptions = student.address.country
    ? State.getStatesOfCountry(student.address.country).map(state => ({
      value: state.isoCode,
      label: state.name,
    }))
    : [];

  const cityOptions = (student.address.country && student.address.state)
    ? City.getCitiesOfState(student.address.country, student.address.state).map(city => ({
      value: city.name,
      label: city.name,
    }))
    : [];


  // const handleFileUpload = (e, field, section = null) => {
  //   const inputFiles = e.target.files;
  //   if (!inputFiles || inputFiles.length === 0) return;

  //   if (["marksheets", "certificates"].includes(field)) {
  //     const newFiles = Array.from(inputFiles);
  //     setStudent(prev => {
  //       const updatedFiles = [...(prev.documents[field] || []), ...newFiles].slice(0, 5);
  //       return {
  //         ...prev,
  //         documents: {
  //           ...prev.documents,
  //           [field]: updatedFiles,
  //         },
  //       };
  //     });
  //     setPreviews(prev => {
  //       const updatedPreviews = [
  //         ...(prev[field] || []),
  //         ...newFiles.map(f => URL.createObjectURL(f)),
  //       ].slice(0, 5);
  //       return { ...prev, [field]: updatedPreviews };
  //     });
  //   } else if (section === "documents") {
  //     const file = inputFiles[0];
  //     setStudent(prev => ({
  //       ...prev,
  //       documents: { ...prev.documents, [field]: file },
  //     }));
  //     setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
  //   } else {
  //     const file = inputFiles[0];
  //     setStudent(prev => ({ ...prev, [field]: file }));
  //     setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
  //   }

  //   // 🔧 Reset the input value so the same files can be re-selected if needed
  //   e.target.value = "";
  // };

  // --- Validation Function ---
  const handleFileUpload = (e, field, section = null) => {
    const inputFiles = e.target.files;
    if (!inputFiles || inputFiles.length === 0) return;

    // ----------------------------
    // MULTIPLE FILE UPLOAD (marksheets, certificates)
    // ----------------------------
    if (["marksheets", "certificates"].includes(field)) {
      const newFiles = Array.from(inputFiles);

      setStudent(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: [...(prev.documents[field] || []), ...newFiles].slice(0, 5),
        },
      }));

      setPreviews(prev => ({
        ...prev,
        [field]: [
          ...(prev[field] || []),
          ...newFiles.map(file => ({
            url: URL.createObjectURL(file),
            type: file.type,
          })),
        ].slice(0, 5),
      }));
    }

    // ----------------------------
    // SINGLE FILE - documents section
    // ----------------------------
    else if (section === "documents") {
      const file = inputFiles[0];

      setStudent(prev => ({
        ...prev,
        documents: { ...prev.documents, [field]: file },
      }));

      setPreviews(prev => ({
        ...prev,
        [field]: {
          url: URL.createObjectURL(file),
          type: file.type,
        },
      }));
    }

    // ----------------------------
    // NORMAL SINGLE FILE (profilePic, aadhar)
    // ----------------------------
    else {
      const file = inputFiles[0];

      setStudent(prev => ({ ...prev, [field]: file }));

      setPreviews(prev => ({
        ...prev,
        [field]: {
          url: URL.createObjectURL(file),
          type: file.type,
        },
      }));
    }

    e.target.value = "";
  };


  const validateStep = () => {
    const newErrors = {};
    if (activeStep === 0) {
      /* ---------------- Name ---------------- */
      if (!student.name.trim()) {
        newErrors.name = "Name is required";
      } else if (!/^[A-Za-z\s]+$/.test(student.name)) {
        newErrors.name = "Name must not contain numbers or special characters";
      }

      /* ---------------- DOB ---------------- */
      if (!student.dob) {
        newErrors.dob = "Date of Birth is required";
      } else {
        const dob = new Date(student.dob);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

        if (dob > today) {
          newErrors.dob = "Date of Birth cannot be in the future";
        } else if (age < 3) {
          newErrors.dob = "Student must be at least 3 years old";
        } else if (age > 25) {
          newErrors.dob = "Student age should not exceed 25 years";
        }
      }

      /* ---------------- Gender & Blood ---------------- */
      if (!student.gender) newErrors.gender = "Gender is required";
      if (!student.bloodGroup) newErrors.bloodGroup = "Blood group is required";

      /* ---------------- Email ---------------- */
      if (!student.email) {
        newErrors.email = "Email is required";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)
      ) {
        newErrors.email = "Enter a valid email address";
      }

      /* ---------------- Password ---------------- */
      if (!student.password) {
        newErrors.password = "Password is required";
      } else if (student.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      /* ---------------- Phone ---------------- */
      if (!student.phone) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\d{10,15}$/.test(student.phone.replace(/\D/g, ""))) {
        newErrors.phone = "Enter a valid phone number";
      }

      /* ---------------- Address ---------------- */
      newErrors.address = {};

      if (!student.address?.street?.trim()) {
        newErrors.address.street = "Street is required";
      }

      if (!student.address?.city?.trim()) {
        newErrors.address.city = "City is required";
      } else if (!/^[A-Za-z\s]+$/.test(student.address.city)) {
        newErrors.address.city = "City must contain only letters";
      }

      if (!student.address?.state) {
        newErrors.address.state = "State is required";
      }

      const zip = String(student.address?.zip || "").trim();

      if (!zip) {
        newErrors.address.zip = "ZIP code is required";
      } else if (!/^\d{5,6}$/.test(zip)) {
        newErrors.address.zip = "Enter a valid ZIP code";
      }


      if (!student.address?.country) {
        newErrors.address.country = "Country is required";
      }

      // Clean empty address object
      if (Object.keys(newErrors.address).length === 0) {
        delete newErrors.address;
      }
    }
    else if (activeStep === 1) {
      student.parents.forEach((parent, i) => {
        if (!parent.name)
          newErrors[`parent_${i}_name`] = "Parent name is required";
        if (!parent.occupation)
          newErrors[`parent_${i}_occupation`] = "Occupation required";
        if (!parent.phone)
          newErrors[`parent_${i}_phone`] = "Phone is required";
        if (!parent.email) {
          newErrors[`parent_${i}_email`] = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent.email)) {
          newErrors[`parent_${i}_email`] = "Enter valid email";
        }
      });

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

      if (!student.documents?.aadharFront) {
        newErrors.aadharFront = "Aadhar front is required";
      }

      if (!student.documents?.aadharBack) {
        newErrors.aadharBack = "Aadhar back is required";
      }
    }
    else if (activeStep === 3) {
      if (!student.classId) newErrors.classId = "Class is required";
      if (!student.academicYear) newErrors.academicYear = "Academic year is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const nextStep = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setActiveStep(prev => prev - 1);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      setIsSubmitting(true);
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
        // // console.log(key, value);
      }

      // ✅ Send single combined payload
      const res = await apiPost(apiPath.studentReg, formDataObj);

      if (res.success) {
        toast.success(res.message);
        navigate(-1);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to add student ❌");
    } finally {
      setIsSubmitting(false);
    }
  };






  return (
    <div ref={formTopRef} className="max-w-[100vw  mx-auto md:p-8 p-2 bg-[var(--color-)] rounded-2xl shadow-xl">

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

      {/* Auto-scroll to top when step changes */}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Step 1 */}
        {activeStep === 0 && (
          <div className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <TextField
                  fullWidth
                  label="Full Name *"
                  name="name"
                  value={student.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  type="date"
                  name="dob"
                  value={student.dob}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  label="Date of Birth *"
                  error={!!errors.dob}
                  helperText={errors.dob}
                  inputProps={{
                    max: new Date(Date.now() - 86400000 * 365 * 3).toISOString().split("T")[0],
                    min: new Date(Date.now() - 86400000 * 365 * 25 - 86400000).toISOString().split("T")[0],
                  }}
                  variant="outlined"
                />
                <TextField
                  select
                  fullWidth
                  name="gender"
                  label="Gender *"
                  value={student.gender}
                  onChange={(e) => {
                    setStudent({ ...student, gender: e.target.value });
                    setErrors((prev) => ({ ...prev, gender: "" }));
                  }}
                  error={!!errors.gender}
                  helperText={errors.gender}
                  variant="outlined"
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
                  label="Blood Group *"
                  value={student.bloodGroup}
                  onChange={(e) => {
                    setStudent({ ...student, bloodGroup: e.target.value });
                    setErrors((prev) => ({ ...prev, bloodGroup: "" }));
                  }}
                  error={!!errors.bloodGroup}
                  helperText={errors.bloodGroup}
                  variant="outlined"
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                    <MenuItem key={bg} value={bg}>
                      {bg}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <TextField
                  fullWidth
                  type="email"
                  name="email"
                  label="Email *"
                  value={student.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  name="password"
                  label="Password *"
                  value={student.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    country="in"
                    enableSearch
                    value={student.phone}
                    onChange={(phone) => {
                      setStudent({ ...student, phone });
                      setErrors((p) => ({ ...p, phone: "" }));
                    }}
                    inputClass="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span>⚠️</span> {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Country */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={countryOptions}
                    styles={customSelectStyles}
                    value={countryOptions.find(c => c.value === student.address.country) || null}
                    onChange={(selected) => {
                      setStudent(prev => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          country: selected?.value || "",
                          state: "",
                          city: "",
                        },
                      }));
                      setErrors(prev => ({
                        ...prev,
                        address: { ...prev.address, country: "" }
                      }));
                    }}
                    placeholder="Select Country"
                    className="w-full"
                    isClearable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    menuShouldBlockScroll={true}
                  />
                  {errors.address?.country && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span>⚠️</span> {errors.address.country}
                    </p>
                  )}
                </div>

                {/* State */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={stateOptions}
                    styles={customSelectStyles}
                    value={stateOptions.find(s => s.value === student.address.state) || null}
                    onChange={(selected) => {
                      setStudent(prev => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          state: selected?.value || "",
                          city: "",
                        },
                      }));
                      setErrors(prev => ({
                        ...prev,
                        address: { ...prev.address, state: "" }
                      }));
                    }}
                    placeholder={!student.address.country ? "Select Country First" : "Select State"}
                    isDisabled={!student.address.country}
                    className="w-full"
                    isClearable
                    isLoading={!stateOptions.length && !!student.address.country}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    menuShouldBlockScroll={true}
                  />
                  {errors.address?.state && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span>⚠️</span> {errors.address.state}
                    </p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={cityOptions}
                    styles={customSelectStyles}
                    value={cityOptions.find(c => c.value === student.address.city) || null}
                    onChange={(selected) => {
                      setStudent(prev => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          city: selected?.value || "",
                        },
                      }));
                      setErrors(prev => ({
                        ...prev,
                        address: { ...prev.address, city: "" }
                      }));
                    }}
                    placeholder={!student.address.state ? "Select State First" : "Select City"}
                    isDisabled={!student.address.state}
                    className="w-full"
                    isClearable
                    isLoading={!cityOptions.length && !!student.address.state}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    menuShouldBlockScroll={true}
                  />
                  {errors.address?.city && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <span>⚠️</span> {errors.address.city}
                    </p>
                  )}
                </div>

                {/* ZIP Code */}
                <div className="space-y-2">
                  <TextField
                    fullWidth
                    name="zip"
                    label="ZIP / Postal Code *"
                    value={student.address.zip}
                    onChange={(e) => {
                      handleChange(e, null, "address");
                      setErrors((prev) => ({
                        ...prev,
                        address: { ...(prev.address || {}), zip: "" },
                      }));
                    }}
                    error={!!errors.address?.zip}
                    helperText={errors.address?.zip}
                    variant="outlined"
                    placeholder="Enter ZIP code"
                    InputProps={{
                      className: "bg-white",
                    }}
                  />
                </div>

                {/* Street Address */}
                <div className="md:col-span-2">
                  <TextField
                    fullWidth
                    name="street"
                    label="Street Address *"
                    value={student.address.street}
                    onChange={(e) => {
                      handleChange(e, null, "address");
                      setErrors((prev) => ({
                        ...prev,
                        address: { ...(prev.address || {}), street: "" },
                      }));
                    }}
                    error={!!errors.address?.street}
                    helperText={errors.address?.street}
                    variant="outlined"
                    multiline
                    rows={2}
                    placeholder="House number, street name, landmark, etc."
                    InputProps={{
                      className: "bg-white",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Profile Picture Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                Profile Picture
              </h3>
              <div className="grid md:grid-cols-1 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-gray-700 font-medium mb-3">
                    Profile Picture <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col items-center">
                    <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 transition-colors duration-200">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">Click to upload</p>
                      <p className="text-xs text-gray-500">JPG, PNG, GIF up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          handleFileUpload(e, "profilePic", "documents");
                          setErrors((prev) => ({
                            ...prev,
                            documents: { ...prev.documents, profilePic: "" },
                          }));
                        }}
                      />
                    </label>
                    {errors?.documents?.profilePic && (
                      <p className="text-red-500 text-sm mt-2">{errors.documents.profilePic}</p>
                    )}
                    {previews.profilePic && (
                      <div className="mt-4 relative">
                        {previews.profilePic.type === "application/pdf" ? (
                          <embed
                            src={previews.profilePic.url}
                            type="application/pdf"
                            className="w-24 h-24 rounded-full border-2 border-gray-300 shadow-sm"
                          />
                        ) : (
                          <img
                            src={previews.profilePic.url}
                            alt="preview"
                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setPreviews((p) => ({ ...p, profilePic: null }));
                            setStudent((s) => ({
                              ...s,
                              documents: { ...s.documents, profilePic: null },
                            }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                    label={`Parent ${index + 1} Name *`}
                    value={parent.name}
                    onChange={(e) => handleChange(e, index)}
                    error={!!errors[`parent_${index}_name`]}
                    helperText={errors[`parent_${index}_name`]}
                  />
                  <TextField
                    fullWidth
                    name="occupation"
                    label="Occupation *"
                    value={parent.occupation}
                    onChange={(e) => handleChange(e, index)}
                    error={!!errors[`parent_${index}_occupation`]}
                    helperText={errors[`parent_${index}_occupation`]}
                  />
                  <TextField
                    fullWidth
                    name="email"
                    label="Email *"
                    value={parent.email}
                    onChange={(e) => handleChange(e, index)}
                    error={!!errors[`parent_${index}_email`]}
                    helperText={errors[`parent_${index}_email`]}
                  />
                  <div>
                    {/* <label className="block text-gray-600 font-medium mb-1">Phone</label> */}
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
                  {/* <label className="block text-gray-600 font-medium mb-1">Phone</label> */}
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
                    label={`Emergency Contact ${field.charAt(0).toUpperCase() + field.slice(1)} *`}
                    value={student.emergencyContact[field]}
                    onChange={(e) => handleChange(e, null, "emergencyContact")}
                    error={!!errors[`emergencyContact_${field}`]}
                    helperText={errors[`emergencyContact_${field}`]}
                  />
                ))}
                <div>
                  {/* <label className="block text-gray-600 font-medium mb-1">Phone</label> */}
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
          <div className="space-y-10">
            <ScrollToTop /> {/* Auto-scroll on route change */}

            {/* 🧠 Disability Section */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Special Information
              </h2>
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
                  className="mt-4"
                />
              )}
            </div>

            {/* 🪪 Aadhaar Upload */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span>Upload Aadhaar Card</span>
                <span className="text-sm text-gray-500">(Front & Back)</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {["aadharFront", "aadharBack"].map((side) => (
                  <div
                    key={side}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-yellow-400 transition relative"
                  >
                    <label className="block text-gray-700 font-medium mb-2">
                      {side === "aadharFront" ? "Aadhaar Front" : "Aadhaar Back"}{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        handleFileUpload(e, side, "documents");
                        setErrors((prev) => ({ ...prev, [side]: "" }));
                      }}
                      className="hidden"
                      id={side}
                    />

                    <label
                      htmlFor={side}
                      className="cursor-pointer flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-yellow-50 transition"
                    >
                      {previews[side] ? (
                        previews[side].type === "application/pdf" ? (
                          <embed
                            src={previews[side].url}
                            type="application/pdf"
                            className="w-40 h-28 rounded-lg shadow border"
                          />
                        ) : (
                          <img
                            src={previews[side].url}
                            alt={side}
                            className="w-40 h-28 object-cover rounded-lg shadow"
                          />
                        )
                      ) : (
                        <>
                          <div className="w-12 h-12 mb-2 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            +
                          </div>
                          <p className="text-gray-500 text-sm">Click or drag to upload</p>
                        </>
                      )}
                    </label>

                    {/* Delete button */}
                    {previews[side] && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviews((p) => ({ ...p, [side]: null }));
                          setStudent((s) => ({
                            ...s,
                            documents: { ...s.documents, [side]: null },
                          }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                      >
                        ✕
                      </button>
                    )}

                    {/* Error message */}
                    {errors[side] && (
                      <p className="text-red-500 text-sm mt-2">{errors[side]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 📄 Marksheets Upload */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Upload Marksheets (Max 5)
              </h2>

              <label
                htmlFor="marksheets"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-yellow-400 cursor-pointer bg-gray-50 hover:bg-yellow-50 transition"
              >
                <div className="text-gray-500 text-sm text-center">
                  Click or drag files here
                </div>
              </label>

              <input
                id="marksheets"
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(e) => handleFileUpload(e, "marksheets")}
                className="hidden"
              />

              {previews.marksheets?.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                  {previews.marksheets.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative group border rounded-lg overflow-hidden shadow hover:scale-105 transition-transform duration-200"
                    >
                      {/* IMAGE OR PDF PREVIEW */}
                      {file.type === "application/pdf" ? (
                        <embed
                          src={file.url}
                          type="application/pdf"
                          className="w-full h-32 border rounded-md"
                        />
                      ) : (
                        <img
                          src={file.url}
                          alt={`marksheet-${idx}`}
                          className="w-full h-32 object-cover"
                        />
                      )}

                      {/* DELETE BUTTON */}
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const updatedFiles = student.documents.marksheets.filter(
                            (_, i) => i !== idx
                          );
                          const updatedPreviews = previews.marksheets.filter(
                            (_, i) => i !== idx
                          );
                          setStudent((prev) => ({
                            ...prev,
                            documents: { ...prev.documents, marksheets: updatedFiles },
                          }));
                          setPreviews((prev) => ({
                            ...prev,
                            marksheets: updatedPreviews,
                          }));
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>



            {/* 🏅 Certificates Upload */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Upload Certificates (Max 5)
              </h2>

              <label
                htmlFor="certificates"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-yellow-400 cursor-pointer bg-gray-50 hover:bg-yellow-50 transition"
              >
                <div className="text-gray-500 text-sm text-center">
                  Click or drag files here
                </div>
              </label>

              <input
                id="certificates"
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(e) => handleFileUpload(e, "certificates")}
                className="hidden"
              />

              {previews.certificates?.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                  {previews.certificates.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative group border rounded-lg overflow-hidden shadow hover:scale-105 transition-transform duration-200"
                    >
                      {/* IMAGE OR PDF PREVIEW */}
                      {file.type === "application/pdf" ? (
                        <embed
                          src={file.url}
                          type="application/pdf"
                          className="w-full h-32 border rounded-md"
                        />
                      ) : (
                        <img
                          src={file.url}
                          alt={`certificate-${idx}`}
                          className="w-full h-32 object-cover"
                        />
                      )}

                      {/* DELETE BUTTON */}
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const updatedFiles = student.documents.certificates.filter(
                            (_, i) => i !== idx
                          );
                          const updatedPreviews = previews.certificates.filter(
                            (_, i) => i !== idx
                          );

                          setStudent((prev) => ({
                            ...prev,
                            documents: {
                              ...prev.documents,
                              certificates: updatedFiles,
                            },
                          }));

                          setPreviews((prev) => ({
                            ...prev,
                            certificates: updatedPreviews,
                          }));
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
              {/* === Academic Information === */}
              <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Academic Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-gray-200">
                  {/* Class Dropdown */}
                  <TextField
                    select
                    fullWidth
                    name="classId"
                    label="Select Class"
                    value={student.classId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setErrors((prev) => ({ ...prev, classId: "" }));

                      const selectedClassObj = classes?.results?.docs?.find(
                        (cls) => cls._id === selectedId
                      );


                      setStudent({ ...student, classId: selectedId });
                      setSelectedClass(selectedClassObj?.name || "");
                    }}
                    error={!!errors.classId}
                    helperText={errors.classId}
                  >
                    <MenuItem value="">Select Class</MenuItem>
                    {classes?.results?.docs?.map((cls) => (
                      <MenuItem key={cls._id} value={cls._id}>
                        {cls.name} {cls.section}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Academic Year */}
                  <TextField
                    fullWidth
                    name="academicYear"
                    label="Academic Year"
                    value={formatAcademicSession(student.academicYear) || ""}
                    disabled   // ✅ LOCKED
                    InputProps={{ readOnly: true }}  // extra safety
                    helperText={
                      sessionLoading
                        ? "Loading academic session..."
                        : "Academic session from school settings"
                    }
                  />
                </div>
              </div>

              {/* === Form Section === */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const tuition = formData.feeHeads.find(
                    (f) => f.type === "Tuition Fee"
                  );
                  const exam = formData.feeHeads.find((f) => f.type === "Exam Fee");

                  if (!tuition?.amount || !exam?.amount) {
                    toast.error("Tuition Fee and Exam Fee are required!");
                    return;
                  }

                  handleSubmit(e);
                }}
                className="space-y-4"
              >
                {selectedClass && (
                  <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                    <label className="block text-lg font-semibold text-gray-700 mb-4">
                      Fee Heads
                    </label>

                    {/* 🌀 Loader */}
                    {feesLoading ? (
                      <div className="flex items-center gap-2 text-gray-600 text-sm bg-gray-50 p-3 rounded-md border border-gray-200">
                        <svg
                          className="animate-spin h-4 w-4 text-yellow-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                        Fetching fee structure...
                      </div>
                    ) : !feesData?.success || !feesData?.results?.feeHeads?.length ? (
                      // ❌ Not found
                      <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200 flex items-center gap-2">
                        ❗ No fee structure found for this class. Please add one first.
                      </div>
                    ) : (
                      // ✅ Show fee heads if found
                      <>
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
                            isDisabled:
                              selectedTypes.includes(opt.value) &&
                              opt.value !== head.type,
                          }));

                          const isMandatory =
                            head.type === "Tuition Fee" || head.type === "Exam Fee";

                          return (
                            <div
                              key={index}
                              className="flex flex-wrap items-center gap-4 border border-gray-200 p-4 rounded-lg mb-3  shadow-sm hover:shadow-md transition-shadow transform hover:-translate-y-1"
                            >
                              <div className="w-full sm:w-[260px]">
                                <Select
                                  options={availableOptions}
                                  value={
                                    head.type
                                      ? { value: head.type, label: head.type }
                                      : null
                                  }
                                  placeholder="Select Fee Type"
                                  onChange={(opt) =>
                                    handleFeeHeadChange(index, "type", opt?.value || "")
                                  }
                                  isDisabled={isMandatory}
                                />
                              </div>

                              <input
                                type="number"
                                placeholder="Amount"
                                value={head.amount}
                                onChange={(e) =>
                                  handleFeeHeadChange(
                                    index,
                                    "amount",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full sm:w-[140px] border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                              />

                              <label className="flex items-center gap-2 text-sm w-auto">
                                <input
                                  type="checkbox"
                                  checked={head.isOptional}
                                  onChange={(e) =>
                                    handleFeeHeadChange(
                                      index,
                                      "isOptional",
                                      e.target.checked
                                    )
                                  }
                                  disabled={isMandatory}
                                  className="h-4 w-4 text-yellow-500 cursor-pointer border-gray-300 rounded focus:ring-yellow-300"
                                />
                                Optional
                              </label>

                              {!isMandatory && (
                                <button
                                  type="button"
                                  onClick={() => removeFeeHead(index)}
                                  className="text-red-500 hover:text-red-700 cursor-pointer text-sm font-medium transition-colors"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {/* {formData.feeHeads.length < 4 && (
                          <Button
                            // variant="contained"
                            style={{ background: "var(--gradient-primary)", color: "black" }}
                            startIcon={<FaPlusCircle />}
                            onClick={addFeeHead}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg mt-3 shadow-md"
                          >
                            Add Optional Fee
                          </Button>
                        )} */}
                      </>
                    )}
                  </div>
                )}
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
              sx={{
                '--gradient-primary': 'linear-gradient(to right, #facc15, #eab308)',
                background: 'var(--gradient-primary)',
                color: '#333',
              }}
              onClick={nextStep}
            >
              Next
            </Button>
          ) : (
            // <button
            //   type="submit"
            //   // variant="contained"
            //   // style={{ backgroundColor: "#f4f14fff", color: "black" }}
            //   className="px-6 py-2 bg-[image:var(--gradient-primary)] rounded-lg hover:bg-green-600 cursor-pointer"
            // >
            //   Submit
            // </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-2
    ${isSubmitting
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-[image:var(--gradient-primary)] hover:bg-green-600"
                }
  `}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>

          )}
        </div>
      </form>
    </div>
  );
}




