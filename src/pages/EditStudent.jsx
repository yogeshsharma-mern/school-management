

import { useEffect, useState } from "react";
import { apiPost, apiGet, apiPut } from "../api/apiFetch";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import apiPath from "../api/apiPath";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { SettingsSuggestOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import { FaPlusCircle } from "react-icons/fa";
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
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Select from "react-select";
import countryList from "react-select-country-list";
const countries = countryList().getData();


export default function CreateStudentPage() {
  const [selectedClass, setSelectedClass] = useState(null);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
  const [previews, setPreviews] = useState({
    profilePic: null,
    aadharFront: null,
    aadharBack: null,
    marksheets: [],
    certificates: [],
  });

  // console.log("profileppic", previews.profilePic);
  // console.log("studentinfo", student);
  const states = [
    { value: "Rajasthan", label: "Maharashtra" },
    // { value: "Karnataka", label: "Karnataka" },
    // { value: "Tamil Nadu", label: "Tamil Nadu" },
    { value: "Delhi", label: "Delhi" },
    { value: "Gujarat", label: "Gujarat" },
  ];

  const [showSecondParent, setShowSecondParent] = useState(false);
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { data: classes = [], isLoading, isError: err } = useQuery({
    queryKey: ["classesForStudent"],
    queryFn: () => apiGet(apiPath.activeClasses),
  });
  const { data: studentData, isFetching, isError } = useQuery({
    queryKey: ["student", id],
    queryFn: () => apiGet(`${apiPath.getParticularStudent}/${id}`),
    enabled: !!id, // only fetch if id exists
  });

  // Update state whenever query data changes
  useEffect(() => {
    if (!studentData?.results?.length) return;

    const s = studentData.results[0];
    // console.log("s",s)
    setStudent(prev => ({
      ...prev,
      ...s,
      dob: s.dob ? s.dob.split("T")[0] : "",
      admissionDate: s.admissionDate ? s.admissionDate.split("T")[0] : "",
      address: s.address || prev.address,
      guardian: s.guardian || prev.guardian,
      emergencyContact: s.emergencyContact || prev.emergencyContact,
      parents: s.parentDetails?.length ? s.parentDetails : prev.parents,
      documents: {
        ...prev.documents,
        profilePic: s.profilePic || null,
        aadharFront: s.aadharFront || null,
        aadharBack: s.aadharBack || null,
        certificates: s.certificates || [],
        marksheets: s.marksheets || [],
      },
      classId: s.enrollmentDetails?.[0]?.class || "",

      academicYear: s.enrollmentDetails?.[0]?.academicYear || "",
    }));

    setPreviews({
      profilePic: s.profilePic ? `${s.profilePic}` : null,
      aadharFront: s.aadharFront ? `${s.aadharFront}` : null,
      aadharBack: s.aadharBack ? `${s.aadharBack}` : null,
      certificates: s.certificates?.map(c => (c.fileUrl ? c.fileUrl : c)) || [],
      marksheets: s.marksheets?.map(c => (c.fileUrl ? c.fileUrl : c)) || [],
    });

    // ✅ set selectedClass from classId so fees query triggers
    if (s.classId) {
      setSelectedClass(s?.enrollmentDetails[0].classInfo?.name);
    }
  }, [studentData]);


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

  // console.log("query data", studentData, "loading:", isFetching, "error:", err);

  // console.log("studentdata", studentData);

  const steps = ["Personal Details", "Parent & Guardian", "Academic & Documents", "Class & Fee Structure"];

  // --- Handle Input Changes ---
  // const handleChange = (e, parentIndex = null, section = null) => {
  //   const { name, value, type, checked } = e.target;
  //   if (parentIndex !== null) {
  //     const updatedParents = [...student.parents];
  //     updatedParents[parentIndex][name] = value;
  //     setStudent({ ...student, parents: updatedParents });
  //     setErrors((prev) => ({
  //       ...prev,
  //       [`parent_${parentIndex}_${name}`]: "",
  //     }));
  //   } else if (section) {
  //     setStudent({
  //       ...student,
  //       [section]: { ...student[section], [name]: value },
  //     });
  //     setErrors((prev) => ({
  //       ...prev,
  //       [`${section}_${name}`]: "",
  //     }));
  //   } else if (type === "checkbox") {
  //     setStudent({ ...student, [name]: checked });
  //   } else {
  //     setStudent({ ...student, [name]: value });
  //     setErrors((prev) => ({ ...prev, [name]: "" }));
  //   }
  // };
  // const handleChange = (e, parentIndex = null, section = null) => {
  //   const { name, value, type, checked } = e.target;

  //   if (parentIndex !== null) {
  //     // For parents
  //     const updatedParents = [...student.parents];
  //     updatedParents[parentIndex][name] = value;
  //     setStudent({ ...student, parents: updatedParents });
  //     setErrors((prev) => ({
  //       ...prev,
  //       [`parent_${parentIndex}_${name}`]: "",
  //     }));
  //   }
  //   else if (section) {
  //     // For nested objects like address, guardian, emergencyContact
  //     setStudent({
  //       ...student,
  //       [section]: { ...student[section], [name]: value },
  //     });
  //     setErrors((prev) => ({
  //       ...prev,
  //       [`${section}_${name}`]: "",
  //     }));
  //   }
  //   else if (type === "checkbox") {
  //     setStudent({ ...student, [name]: checked });
  //   }
  //   else {
  //     setStudent({ ...student, [name]: value });
  //     setErrors((prev) => ({ ...prev, [name]: "" }));
  //   }
  // };

  const handleChange = (e, parentIndex = null, section = null) => {
    const { name, value, type, checked } = e.target;
    let sanitizedValue = value;

    // ✅ Disallow numbers/symbols in City
    if (name === "city") {
      sanitizedValue = value.replace(/[^A-Za-z\s]/g, ""); // only letters & spaces
    }

    // ✅ Disallow letters/symbols in ZIP Code
    if (name === "zip") {
      sanitizedValue = value.replace(/\D/g, ""); // only digits allowed
    }

    // ✅ Common name fields (for parents, guardians, etc.)
    const isNameField = name.toLowerCase().includes("name") && name !== "username";
    if (isNameField && name !== "city") {
      sanitizedValue = sanitizedValue.replace(/[^A-Za-z\s]/g, ""); // only alphabets
    }

    if (parentIndex !== null) {
      // 👪 For parents array fields
      const updatedParents = [...student.parents];
      updatedParents[parentIndex][name] = sanitizedValue;
      setStudent({ ...student, parents: updatedParents });

      setErrors((prev) => ({
        ...prev,
        [`parent_${parentIndex}_${name}`]: "",
      }));
    }
    else if (section) {
      // 🏠 For nested objects (address, guardian, emergencyContact, etc.)
      setStudent({
        ...student,
        [section]: { ...student[section], [name]: sanitizedValue },
      });

      setErrors((prev) => ({
        ...prev,
        [`${section}_${name}`]: "",
      }));
    }
    else if (type === "checkbox") {
      setStudent({ ...student, [name]: checked });
    }
    else {
      // 🔤 For all other direct fields
      setStudent({ ...student, [name]: sanitizedValue });
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // --- Handle File Upload ---
  const handleFileUpload = (e, field, section = null) => {
    const inputFiles = e.target.files;
    if (!inputFiles || inputFiles.length === 0) return;

    if (["marksheets", "certificates"].includes(field)) {
      // Combine existing files with new files, but limit to 5
      const existingFiles = student.documents[field] || [];
      const combinedFiles = [...Array.from(inputFiles), ...existingFiles];
      // console.log("combined files", combinedFiles);
      const filesToSet = combinedFiles.slice(0, 5); // max 5
      setStudent(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: filesToSet,
        },
      }));

      setPreviews(prev => ({
        ...prev,
        [field]: filesToSet.map(f => f instanceof File ? URL.createObjectURL(f) : f.fileUrl ? `${f.fileUrl}` : `${f}`),
      }));
    }
    else if (section === "documents") {
      const file = inputFiles[0];
      setStudent(prev => ({
        ...prev,
        documents: { ...prev.documents, [field]: file },
      }));
      setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
    else {
      const file = inputFiles[0];
      setStudent(prev => ({ ...prev, [field]: file }));
      setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };
  const { data: feesData, isLoading: feesLoading } = useQuery({
    queryKey: ["feesStructuredata", selectedClass],
    queryFn: () =>
      apiGet(`${apiPath.getFeesStructure}?classIdentifier=${selectedClass}`),
    enabled: !!selectedClass,
  });
  // 🔄 Sync fees data into formData whenever it changes
  // console.log("feedata",feesData);
  useEffect(() => {
    if (feesData?.success && feesData?.results?.feeHeads?.length) {
      setFormData(prev => ({
        ...prev,
        feeStructureId: feesData.results._id, // ✅ store the structure id
        feeHeads: feesData.results.feeHeads.map(f => ({
          type: f.type,
          amount: f.amount || 0,
          isOptional: f.isOptional || false,
        })),
      }));
    } else if (selectedClass) {
      setFormData(prev => ({
        ...prev,
        feeStructureId: null,
        feeHeads: [],
      }));
    }
  }, [feesData, selectedClass]);




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

  // --- Validation Function ---
  const validateStep = () => {
    const newErrors = {};
    // if (activeStep === 0) {
    //     if (!student.name.trim()) {
    //       newErrors.name = "Name is required";
    //     } else if (!/^[A-Za-z\s]+$/.test(student.name)) {
    //       newErrors.name = "Name must not contain numbers or special characters";
    //     }

    //     // ✅ Date of Birth validation with age restriction (3-25 years)
    //     if (!student.dob) {
    //       newErrors.dob = "Date of Birth is required";
    //     } else {
    //       const dob = new Date(student.dob);
    //       const today = new Date();

    //       // Calculate age
    //       let age = today.getFullYear() - dob.getFullYear();
    //       const monthDiff = today.getMonth() - dob.getMonth();

    //       if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    //         age--;
    //       }

    //       // Check age range
    //       if (age < 3) {
    //         newErrors.dob = "Student must be at least 3 years old";
    //       } else if (age > 25) {
    //         newErrors.dob = "Student age should not exceed 25 years";
    //       }

    //       // Optionally, you can also check if dob is not in the future
    //       if (dob > today) {
    //         newErrors.dob = "Date of Birth cannot be in the future";
    //       }
    //     }

    //     // Rest of your validation...
    //     if (!student.gender) newErrors.gender = "Gender is required";
    //     if (!student.bloodGroup) newErrors.bloodGroup = "Blood group is required";
    //     // ... rest of the validation code
    //   }
    if (activeStep === 0) {
      if (!student.name) newErrors.name = "Name is required";
      if (!student.dob) {
        newErrors.dob = "Date of Birth is required";
      } else {
        const dob = new Date(student.dob);
        const today = new Date();

        // Calculate age
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }

        // Check age range
        if (age < 3) {
          newErrors.dob = "Student must be at least 3 years old";
        } else if (age > 25) {
          newErrors.dob = "Student age should not exceed 25 years";
        }

        // Optionally, you can also check if dob is not in the future
        if (dob > today) {
          newErrors.dob = "Date of Birth cannot be in the future";
        }
      }
      if (!student.gender) newErrors.gender = "Gender is required";
      if (!student.bloodGroup) newErrors.bloodGroup = "Blood group is required";
      if (!student.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email))
        newErrors.email = "Valid email is required";
      // if (!student.password || student.password.length < 6)
      //   newErrors.password = "Password must be at least 6 characters";
      if (!student.phone || student.phone.replace(/\D/g, "").length < 10)
        newErrors.phone = "Valid phone number required";
      if (!student.documents.profilePic) {
        if (!newErrors.documents) newErrors.documents = {};
        newErrors.documents.profilePic = "Profile picture is required";
      }
      // if (!student.address.city.trim()) {
      //   newErrors.address.city = "City is required";
      // } else if (!/^[A-Za-z\s]+$/.test(student.address.city)) {
      //   newErrors.address.city = "City must contain only letters";
      // }

      // if (!student.address.zip.trim()) {
      //   newErrors.address.zip = "ZIP code is required";
      // } else if (!/^\d+$/.test(student.address.zip)) {
      //   newErrors.address.zip = "ZIP code must contain only numbers";
      // }

    }




    else if (activeStep === 1) {
      student.parents.forEach((parent, i) => {
        if (!parent.name)
          newErrors[`parent_${i}_name`] = "Parent name is required";
        if (!parent.occupation)
          newErrors[`parent_${i}_occupation`] = "Occupation required";
        if (!parent.phone)
          newErrors[`parent_${i}_phone`] = "Phone is required";
        if (parent.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent.email))
          newErrors[`parent_${i}_email`] = "Enter valid email";
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
      if (!student.academicYear) newErrors.academicYear = "Academic year is required";

      // Document validation
      if (!student.documents.aadharFront)
        newErrors.aadharFront = "Aadhaar front is required";
      if (!student.documents.aadharBack)
        newErrors.aadharBack = "Aadhaar back is required";
    }

    setErrors(newErrors);
    // console.log("Validation errors:", newErrors); // helpful for debugging
    return Object.keys(newErrors).length === 0;
  };


  const nextStep = () => {
    if (validateStep()) setActiveStep(prev => prev + 1);
  };

  const prevStep = () => setActiveStep(prev => prev - 1);

  // --- Submit ---
  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     if (!validateStep()) return;

  //     try {
  //       const formData = new FormData();

  //       // Add JSON fields
  //       ["address", "parents", "guardian", "emergencyContact"].forEach(key => {
  //         formData.append(key, JSON.stringify(student[key]));
  //       });

  //       // Add documents
  //       Object.keys(student.documents).forEach(docKey => {
  //         const file = student.documents[docKey];
  //         if (!file) return;

  //         if (Array.isArray(file)) {
  //           file.forEach((f, idx) => formData.append(`${docKey}[${idx}]`, f));
  //         } else if (file instanceof File) {
  //           formData.append(docKey, file);
  //         }
  //       });

  //       // Add remaining fields
  //       ["name", "dob", "gender", "bloodGroup", "email", "password", "phone", "classId", "academicYear", "physicalDisability", "disabilityDetails"].forEach(key => {
  //         formData.append(key, student[key]);
  //       });
  // // console.log("formdata",formData)
  //       await apiPost(apiPath.studentReg,formData);
  //       toast.success("Student created successfully ✅");
  //       navigate(-1);
  //     } catch (err) {
  //       console.error(err);
  //       toast.error("Failed to create student ❌");
  //     }
  //   };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validateStep()) return;

  //   try {
  //     const formData = new FormData();

  //     // 🔹 Add simple primitive fields
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

  //     // 🔹 Add nested JSON fields
  //     ["address", "parents", "guardian", "emergencyContact"].forEach((key) => {
  //       formData.append(key, JSON.stringify(student[key]));
  //     });

  //     // 🔹 Add document fields (handle both files & URLs)
  //     Object.entries(student.documents).forEach(([key, value]) => {

  //       if (!value) return;
  //       if (Array.isArray(value)) {
  //         value.forEach(item => {
  //           if (item instanceof File) {
  //             formData.append(key, item); // new file → binary
  //           } else if (item && typeof item === "object" && item.fileUrl) {
  //             formData.append(key, "null"); // existing file → null placeholder
  //           } else {
  //             formData.append(key, "null"); // fallback
  //           }
  //         });
  //       }
  //       else {
  //         if (value instanceof File) {
  //           formData.append(key, value);
  //         } else if (typeof value === "string") {
  //           formData.append(key, null);
  //         }
  //       }
  //     });

  //     // 🔹 Debug — check payload
  //     for (let [key, val] of formData.entries()) {
  //       // console.log("entries>>>>",
  //         formData.entries()
  //       );
  //     }

  //     // 🔹 Call API (you can switch this depending on edit/create)
  //     if (student._id) {
  //       const res = await apiPut(`${apiPath.updateStudent}/${student._id}`, formData);
  //       // // console.log("responsestudent",res);
  //       if (res.success === true) {
  //         toast.success(res.message);
  //       }

  //     } else {
  //       const res = await apiPost(apiPath.studentReg, formData);
  //       if (res.success === true) {
  //         toast.success(res.message);
  //       }

  //     }

  //     navigate(-1);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Something went wrong ❌");
  //   }
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      const formDataToSend = new FormData();

      // 🔹 Add simple fields
      [
        "name", "dob", "gender", "bloodGroup", "email", "password", "phone",
        "classId", "academicYear", "physicalDisability", "disabilityDetails",
      ].forEach((key) => {
        formDataToSend.append(key, student[key]);
      });

      // 🔹 Add nested objects
      ["address", "parents", "guardian", "emergencyContact"].forEach((key) => {
        formDataToSend.append(key, JSON.stringify(student[key]));
      });

      // 🔹 Add documents
      Object.entries(student.documents).forEach(([key, value]) => {
        if (!value) return;
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item instanceof File) {
              formDataToSend.append(key, item);
            }
          });
        } else if (value instanceof File) {
          formDataToSend.append(key, value);
        }
      });

      // ✅ Add fee structure info
      if (formData.feeStructureId)
        formDataToSend.append("feeStructureId", formData.feeStructureId);

      if (formData.feeHeads?.length)
        formDataToSend.append("appliedFeeHeads", JSON.stringify(formData.feeHeads));

      // 🔹 API call
      const res = student._id
        ? await apiPut(`${apiPath.updateStudent}/${student._id}`, formDataToSend)
        : await apiPost(apiPath.studentReg, formDataToSend);
console.log("res",res);
      if (res.success) {
        toast.success(res.message || "Student saved successfully ✅");
        navigate(-1);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message);
    }
  };



  return (
    <div className="max-w-6xl mx-auto md:p-8 p-4 bg-[var(--color-)] rounded-2xl shadow-xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 cursor-pointer px-4 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        {isEditMode ? "Edit Student" : "Create Student"}
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
            {/* <TextField
              fullWidth
              type="date"
              name="dob"
              value={student.dob}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              label="Date of Birth"
              error={!!errors.dob}
              helperText={errors.dob}
            /> */}
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
                max: new Date(Date.now() - 86400000 * 365 * 3).toISOString().split("T")[0], // Max: yesterday
                min: new Date(Date.now() - 86400000 * 365 * 25 - 86400000).toISOString().split("T")[0], // Min: 25 years ago (yesterday)
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
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleFileUpload(e, "profilePic", "documents");
                  setErrors((prev) => ({ ...prev, profilePic: "" }))
                }}
              />
              {errors?.documents?.profilePic && (
                <p className="text-red-500 text-sm">{errors.documents.profilePic}</p>
              )}
              {previews.profilePic && (
                <img
                  src={previews.profilePic}
                  alt={previews.profilePic || "Profile Preview"}
                  className="mt-2 w-24 h-24 rounded-full object-cover"
                />
              )}


            </div>
            <div> <TextField
              fullWidth
              name="street"
              label="Street"
              value={student.address.street}
              onChange={(e) => handleChange(e, null, "address")}
            /></div>
            <div>
              <TextField
                fullWidth
                name="city"
                label="City"
                value={student.address.city}
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
                    label={`Emergency Contact ${field.charAt(0).toUpperCase() + field.slice(1)}`}
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
                      accept="image/*"
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
                        <img
                          src={previews[side]}
                          alt={side}
                          className="w-40 h-28 object-cover rounded-lg shadow"
                        />
                      ) : (
                        <>
                          <div className="w-12 h-12 mb-2 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            +
                          </div>
                          <p className="text-gray-500 text-sm">
                            Click or drag to upload
                          </p>
                        </>
                      )}
                    </label>

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
                  {previews.marksheets.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative group border rounded-lg overflow-hidden shadow hover:scale-105 transition-transform duration-200"
                    >
                      <img
                        src={src}
                        alt={`marksheet-${idx}`}
                        className="w-full h-32 object-cover"
                      />
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
                  {previews.certificates.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative group border rounded-lg overflow-hidden shadow hover:scale-105 transition-transform duration-200"
                    >
                      <img
                        src={src}
                        alt={`certificate-${idx}`}
                        className="w-full h-32 object-cover"
                      />
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

                        {formData.feeHeads.length < 4 && (
                          <Button
                            // variant="contained"
                            style={{ background: "var(--gradient-primary)", color: "black" }}
                            startIcon={<FaPlusCircle />}
                            onClick={addFeeHead}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg mt-3 shadow-md"
                          >
                            Add Optional Fee
                          </Button>
                        )}
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
            <button
              type="submit"
              className="p-2 cursor-pointer bg-[image:var(--gradient-primary)] rounded-md"
            // style={{ backgroundColor: isEditMode ? "#f3c621ff" : "#4caf50", color: "black" }}
            >
              {isEditMode ? "Update" : "Submit"}
            </button>

          )}
        </div>
      </form>
    </div>
  );
}

