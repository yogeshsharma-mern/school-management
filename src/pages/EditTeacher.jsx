import { useState } from "react";
import { apiPost, apiGet, apiPut } from "../api/apiFetch";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import apiPath from "../api/apiPath";
import { useQuery } from "@tanstack/react-query";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Select from "react-select";
import countryList from "react-select-country-list";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { Country, State, City } from "country-state-city";


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
    const designationDataExample = [
        "Principal",
        "Vice Principal",
        "Headmaster",
        "Headmistress",
        "Senior Teacher",
        "Junior Teacher",
        "Subject Teacher",
        "Assistant Teacher",
        "Pre-Primary Teacher",
        "Primary Teacher",
        "Middle School Teacher",
        "High School Teacher",
        "Maths Teacher",
        "Science Teacher",
        "English Teacher",
        "Computer Teacher",
        "Social Studies Teacher",
        "Physical Education Teacher",
        //   "Art Teacher",
        //   "Music Teacher",
        //   "Dance Teacher",
        //   "Lab Assistant",
    ];
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
        zIndex: 9999, // Increased z-index
        position: "absolute",
    }),
    menuPortal: (provided) => ({
        ...provided,
        zIndex: 9999, // Increased z-index for portal
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
export default function CreateTeacherPage() {
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const qualificationOptions = [
        { value: "B.Ed", label: "B.Ed" },
        { value: "M.Ed", label: "M.Ed" },
        { value: "PhD", label: "PhD" },
    ];

    const specializationOptions = [
        { value: "Mathematics", label: "Mathematics" },
        { value: "Physics", label: "Physics" },
        { value: "Computer Science", label: "Computer Science" },
        { value: "Chemistry", label: "Chemistry" },
        { value: "SST", label: "SST" },
        { value: "English", label: "English" },
        { value: "Hindi", label: "Hindi" },
        { value: "Sanskrit", label: "Sanskrit" },
        { value: "Science", label: "Science" }
    ];
// In your component, define the options:

    const classOptions = [
        { value: "1", label: "Class 1" },
        { value: "2", label: "Class 2" },
        { value: "3", label: "Class 3" },
    ];
    const countries = countryList().getData();
    const states = [
        { value: "Rajasthan", label: "Rajasthan" },
        // { value: "Karnataka", label: "Karnataka" },
        // { value: "Tamil Nadu", label: "Tamil Nadu" },
        { value: "Delhi", label: "Delhi" },
        { value: "Gujarat", label: "Gujarat" },
    ];
    const [teacher, setteacher] = useState({
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
    console.log("teacher", teacher);
    const [errors, setErrors] = useState({});
    // console.log("errors", errors);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedClassSlug, setSelectedClassSlug] = useState(null);
    const [subjectsByClass, setSubjectsByClass] = useState({});

    const [activeStep, setActiveStep] = useState(0);
    const [previews, setPreviews] = useState({
        profilePic: null,
        aadharFront: null,
        aadharBack: null,
        marksheets: [],
        certificates: [],
    });
    const { id } = useParams();



    const { data: classes = [], isLoading, isError } = useQuery({
        queryKey: ["classesForteacher"],
        queryFn: () => apiGet(apiPath.activeClasses),
    });
    const {
        data,
        isLoading: loading,
        isError: error,
    } = useQuery({
        queryKey: ["subjectForTeacher", selectedClassSlug],
        queryFn: () =>
            apiGet(
                `${apiPath.getSubjectByClassnameSectionWise}/${selectedClassSlug}`
            ),
        enabled: !!selectedClassSlug,
    });

    const subjects = data?.results?.subjects || [];

    console.log("subjectssss", subjects);
    const { data: teacherData, isFetching, isError: err } = useQuery({
        queryKey: ["teacher", id],
        queryFn: () => apiGet(`${apiPath.getParticularTeacher}/${id}`),
        enabled: !!id, // only fetch if id exists
    });
    // useEffect(() => {
    //     if (!teacherData?.results) return;

    //     const t = teacherData.results;
    //     // console.log("t", t);

    //     setteacher(prev => ({
    //         ...prev,
    //         ...t,
    //         dob: t.dob ? t.dob.split("T")[0] : "",
    //         dateOfJoining: t.dateOfJoining ? t.dateOfJoining.split("T")[0] : "",

    //         address: t.address || prev.address,
    //         emergencyContact: {
    //             name: t.emergencyContact?.name || "",
    //             relation: t.emergencyContact?.relation || "",
    //             phone: t.emergencyContact?.phone || "",
    //             address: t.emergencyContact?.address || "",
    //         },

    //         qualifications: t.qualifications || prev.qualifications,
    //         specialization: t.specialization || prev.specialization,
    //         classes: t.teachingClasses?.map(cls => cls._id) || prev.classes,
    //         subjectsHandled:
    //             t.subjectsInfo?.map((subj, i) => ({
    //                 subjectName: subj.name,
    //                 subjectCode: subj.code,
    //                 classId: t.teachingClasses?.[i]?._id || "", // ✅ Assign class automatically
    //             })) || prev.subjectsHandled,
    //         salaryInfo: t.salaryInfo || prev.salaryInfo,
    //         physicalDisability: t.physicalDisability || false,

    //         // 🟩 FIX: actually set file URLs in teacher.documents
    //         documents: {
    //             ...prev.documents,
    //             profilePic: t.profilePic ? `${BASE_URL}${t.profilePic}` : null,
    //             aadharFront: t.aadharFront?.fileUrl ? `${BASE_URL}${t.aadharFront}` : null,
    //             aadharBack: t.aadharBack?.fileUrl ? `${BASE_URL}${t.aadharBack.fileUrl}` : null,
    //             certificates:
    //                 t.certificates?.map(c => (c.fileUrl ? `${BASE_URL}${c.fileUrl}` : `${BASE_URL}${c}`)) || [],
    //             marksheets:
    //                 t.marksheets?.map(c => (c.fileUrl ? `${BASE_URL}${c.fileUrl}` : `${BASE_URL}${c}`)) || [],
    //         },
    //     }));

    //     // Previews remain the same
    //     setPreviews({
    //         profilePic: t.profilePic ? `${BASE_URL}${t.profilePic}` : null,
    //         aadharFront: t.aadharFront ? `${BASE_URL}${t.aadharFront}` : null,
    //         aadharBack: t.aadharBack ? `${BASE_URL}${t.aadharBack}` : null,
    //         certificates:
    //             t.certificates?.map(c => (c.fileUrl ? `${BASE_URL}${c.fileUrl}` : `${BASE_URL}${c}`)) || [],
    //         marksheets:
    //             t.marksheets?.map(c => (c.fileUrl ? `${BASE_URL}${c.fileUrl}` : `${BASE_URL}${c}`)) || [],
    //     });
    // }, [teacherData]);
const countryOptions = Country.getAllCountries().map(country => ({
    value: country.isoCode,
    label: country.name,
}));

// These will be computed based on selected country
const stateOptions = teacher.address.country
    ? State.getStatesOfCountry(teacher.address.country).map(state => ({
        value: state.isoCode,
        label: state.name,
    }))
    : [];

const cityOptions = (teacher.address.country && teacher.address.state)
    ? City.getCitiesOfState(teacher.address.country, teacher.address.state).map(city => ({
        value: city.name,
        label: city.name,
    }))
    : [];
     const isPDF = (url) => url?.toLowerCase().endsWith(".pdf");
      const renderPreview = (url) =>
    isPDF(url) ? (
      <iframe
        src={url}
        className="w-full h-40 rounded-lg border"
        title="pdf"
      />
    ) : (
      <img
        src={url}
        className="w-full h-40 object-cover rounded-lg"
        alt="doc"
      />
    );

useEffect(() => {
    if (!teacherData?.results) return;
    const t = teacherData.results;


    console.log("gt", t)

    setteacher(prev => ({
        ...prev,
        ...t,
        dob: t.dob ? t.dob.split("T")[0] : "",
        dateOfJoining: t.dateOfJoining ? t.dateOfJoining.split("T")[0] : "",

        address: {
            street: t.address?.street || "",
            city: t.address?.city || "",
            state: t.address?.state || "", // This will be "RJ" from API
            zip: t.address?.zip || "",
            country: t.address?.country || "", // This will be "IN" from API
        },
        emergencyContact: {
            name: t.emergencyContact?.name || "",
            relation: t.emergencyContact?.relation || "",
            phone: t.emergencyContact?.phone || "",
            address: t.emergencyContact?.address || "",
        },

        qualifications: t.qualifications || prev.qualifications,
        specialization: t.specialization || prev.specialization,
        classes: t.subjectsHandled?.map(cls => cls.classId) || prev.classes,
        subjectsHandled: t.subjectsHandled?.length ? t.subjectsHandled : prev.subjectsHandled,

        salaryInfo: t.salaryInfo || prev.salaryInfo,
        physicalDisability: t.physicalDisability || false,

        documents: {
            ...prev.documents,
            profilePic: t.profilePic ? t.profilePic : null,
            aadharFront: t.aadharFront ? t.aadharFront : null,
            aadharBack: t.aadharBack ? t.aadharBack : null,
            certificates: t.certificates || [],
            marksheets: t.marksheets || [],
        },
    }));

    setPreviews({
        profilePic: t.profilePic || null,
        aadharFront: t.aadharFront || null,
        aadharBack: t.aadharBack || null,
        certificates: t.certificates || [],
        marksheets: t.marksheets || [],
    });
}, [teacherData]);
    // useEffect(() => {
    //     if (!teacher.subjectsHandled?.length) return;

    //     // take first subject's class (or loop if needed)
    //     const classId = teacher.subjectsHandled[0]?.classId;
    //     if (!classId) return;

    //     const foundClass = classes?.results?.docs?.find(
    //         cls => cls._id === classId
    //     );

    //     if (foundClass) {
    //         const slug = `${foundClass.name}-${foundClass.section}`.toLowerCase();
    //         setSelectedClassSlug(slug);
    //     }
    // }, [teacher.subjectsHandled, classes]);

    // console.log("subjects", subjects);
    // console.log("classess", classes);
    useEffect(() => {
        if (!teacher.subjectsHandled?.length || !classes?.results?.docs) return;

        teacher.subjectsHandled.forEach(async (subj) => {
            if (!subj.classId || subjectsByClass[subj.classId]) return;

            const foundClass = classes.results.docs.find(
                cls => cls._id === subj.classId
            );

            if (!foundClass) return;

            const slug = `${foundClass.name}-${foundClass.section}`.toLowerCase();

            const res = await apiGet(
                `${apiPath.getSubjectByClassnameSectionWise}/${slug}`
            );

            setSubjectsByClass(prev => ({
                ...prev,
                [subj.classId]: res?.results?.subjects || [],
            }));
        });
    }, [teacher.subjectsHandled, classes]);


    const steps = ["Personal Details", "Professional Information", "Academic & Documents"];

    // --- Handle Input Changes ---
    // const handleChange = (e, parentIndex = null, section = null) => {
    //     const { name, value, type, checked } = e.target;
    //     if (parentIndex !== null) {
    //         const updatedParents = [...teacher.parents];
    //         updatedParents[parentIndex][name] = value;
    //         setteacher({ ...teacher, parents: updatedParents });
    //         setErrors((prev) => ({
    //             ...prev,
    //             [`parent_${parentIndex}_${name}`]: "",
    //         }));
    //     } else if (section) {
    //         setteacher({
    //             ...teacher,
    //             [section]: { ...teacher[section], [name]: value },
    //         });
    //         setErrors((prev) => ({
    //             ...prev,
    //             [`${section}_${name}`]: "",
    //         }));
    //     } else if (type === "checkbox") {
    //         setteacher({ ...teacher, [name]: checked });
    //     } else {
    //         setteacher({ ...teacher, [name]: value });
    //         setErrors((prev) => ({ ...prev, [name]: "" }));
    //     }
    // };
    // const handleChange = (e, parentIndex = null, section = null) => {
    //     const { name, value, type, checked } = e.target;

    //     if (parentIndex !== null) {
    //         const updatedParents = [...teacher.parents];
    //         updatedParents[parentIndex][name] = value;
    //         setteacher({ ...teacher, parents: updatedParents });
    //         setErrors((prev) => ({
    //             ...prev,
    //             [`parent_${parentIndex}_${name}`]: "",
    //         }));
    //     } else if (section) {
    //         setteacher({
    //             ...teacher,
    //             [section]: { ...teacher[section], [name]: value },
    //         });
    //         setErrors((prev) => ({
    //             ...prev,
    //             [`${section}_${name}`]: "",
    //         }));
    //     } else if (type === "checkbox") {
    //         setteacher({ ...teacher, [name]: checked });
    //         setErrors((prev) => ({ ...prev, [name]: "" }));
    //     } else {
    //         setteacher({ ...teacher, [name]: value });
    //         setErrors((prev) => ({ ...prev, [name]: "" }));
    //     }
    // };

    // const handleChange = (e, parentIndex = null, section = null) => {
    //     const { name, value, type, checked } = e.target;

    //     if (parentIndex !== null) {
    //         setteacher(prev => {
    //             const updatedParents = [...prev.parents];
    //             updatedParents[parentIndex][name] = value;
    //             return { ...prev, parents: updatedParents };
    //         });
    //         setErrors(prev => ({
    //             ...prev,
    //             [`parent_${parentIndex}_${name}`]: "",
    //         }));
    //     }
    //     else if (section) {
    //         setteacher(prev => ({
    //             ...prev,
    //             [section]: { ...prev[section], [name]: value },
    //         }));
    //         setErrors(prev => ({
    //             ...prev,
    //             [`${section}_${name}`]: "",
    //         }));
    //     }
    //     else if (type === "checkbox") {
    //         setteacher(prev => ({ ...prev, [name]: checked }));
    //         setErrors(prev => ({ ...prev, [name]: "" }));
    //     }
    //     else {
    //         // ✅ Special handling for "experience"
    //         if (name === "experience") {
    //             let numericValue = value.replace(/\D/g, ""); // remove non-digits

    //             // Limit to 2 digits
    //             if (numericValue.length > 2) numericValue = numericValue.slice(0, 2);

    //             // Restrict value between 1 and 40
    //             if (numericValue && Number(numericValue) > 40) numericValue = "40";

    //             setteacher({ ...teacher, experience: numericValue });
    //             setErrors((prev) => ({ ...prev, experience: "" }));
    //             return;
    //         }

    //         setteacher({ ...teacher, [name]: value });
    //         setErrors((prev) => ({ ...prev, [name]: "" }));
    //     }
    // };
    const handleChange = (e, parentIndex = null, section = null) => {
        const { name, value, type, checked } = e.target;
        let sanitizedValue = value;

        // ✅ 1. No numbers or special chars in any name field
        if (name.toLowerCase().includes("name")) {
            sanitizedValue = value.replace(/[^A-Za-z\s]/g, ""); // only letters & spaces
        }

        // ✅ 2. Disallow numbers/symbols in City
        if (name === "city") {
            sanitizedValue = value.replace(/[^A-Za-z\s]/g, ""); // only letters & spaces
        }

        // ✅ 3. Disallow letters/symbols in ZIP Code (numbers only)
        if (name === "zip") {
            sanitizedValue = value.replace(/\D/g, ""); // only digits allowed
            // optional: limit to 6 digits (e.g., India)
            if (sanitizedValue.length > 6) sanitizedValue = sanitizedValue.slice(0, 6);
        }

        if (parentIndex !== null) {
            // 👪 For parents array
            setteacher((prev) => {
                const updatedParents = [...prev.parents];
                updatedParents[parentIndex][name] = sanitizedValue;
                return { ...prev, parents: updatedParents };
            });
            setErrors((prev) => ({
                ...prev,
                [`parent_${parentIndex}_${name}`]: "",
            }));
        }
        else if (section) {
            // 🏠 For nested sections like address, emergencyContact, etc.
            setteacher((prev) => ({
                ...prev,
                [section]: { ...prev[section], [name]: sanitizedValue },
            }));
            setErrors((prev) => ({
                ...prev,
                [`${section}_${name}`]: "",
            }));
        }
        else if (type === "checkbox") {
            // ☑️ Checkbox fields
            setteacher((prev) => ({ ...prev, [name]: checked }));
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
        else {
            // 🎓 Special handling for "experience"
            if (name === "experience") {
                let numericValue = value.replace(/\D/g, ""); // remove non-digits

                // Limit to 2 digits
                if (numericValue.length > 2) numericValue = numericValue.slice(0, 2);

                // Restrict value between 1 and 40
                if (numericValue && Number(numericValue) > 40) numericValue = "40";

                setteacher((prev) => ({ ...prev, experience: numericValue }));
                setErrors((prev) => ({ ...prev, experience: "" }));
                return;
            }

            // 🧩 Default field update
            setteacher((prev) => ({ ...prev, [name]: sanitizedValue }));
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleFileUpload = (e, field, section = null) => {
        const inputFiles = e.target.files;
        if (!inputFiles || inputFiles.length === 0) return;

        if (["marksheets", "certificates"].includes(field)) {
            const newFiles = Array.from(inputFiles);
            setteacher(prev => {
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
            setteacher(prev => ({
                ...prev,
                documents: { ...prev.documents, [field]: file },
            }));
            setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
        } else {
            const file = inputFiles[0];
            setteacher(prev => ({ ...prev, [field]: file }));
            setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
        }
        setErrors(prev => ({ ...prev, [field]: "" }));
        // 🔧 Reset the input value so the same files can be re-selected if needed
        e.target.value = "";
    };

    // --- Validation Function ---
    const validateStep = () => {
        const newErrors = {};

        if (activeStep === 0) {
            const today = new Date();
            const dobDate = teacher.dob ? new Date(teacher.dob) : null;

            if (!teacher.name) newErrors.name = "Name is required";

            if (!teacher.dob) {
                newErrors.dob = "Date of Birth is required";
            } else if (dobDate >= today) {
                newErrors.dob = "Date of Birth cannot be today or in the future";
            } else {
                // ✅ Teacher age validation (18-65 years)
                const birthDate = new Date(teacher.dob);
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                // Adjust age if birthday hasn't occurred this year
                const adjustedAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()))
                    ? age - 1
                    : age;

                if (adjustedAge < 18) {
                    newErrors.dob = "Teacher must be at least 18 years old";
                } else if (adjustedAge > 65) {
                    newErrors.dob = "Teacher age should not exceed 65 years";
                }
            }
            if (!teacher.gender) newErrors.gender = "Gender is required";
            if (!teacher.bloodGroup) newErrors.bloodGroup = "Blood group is required";

            if (!teacher.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacher.email))
                newErrors.email = "Valid email is required";

            // if (!teacher.password || teacher.password.length < 6)
            //     newErrors.password = "Password must be at least 6 characters";

            if (!teacher.phone || teacher.phone.replace(/\D/g, "").length < 10)
                newErrors.phone = "Valid phone number required";

            if (!teacher.address.street) newErrors.address_street = "Street is required";
            if (!teacher.address.city) newErrors.address_city = "City is required";
            if (!teacher.address.state) newErrors.address_state = "State is required";
            if (!teacher.address.zip) newErrors.address_zip = "ZIP is required";
            if (!teacher.address.country) newErrors.address_country = "Country is required";

            if (!teacher.documents.profilePic) {
                if (!newErrors.documents) newErrors.documents = {};
                newErrors.documents.profilePic = "Profile picture is required";
            }
        }


        else if (activeStep === 1) {
            if (!teacher.designation) newErrors.designation = "Designation is required";
            if (teacher.qualifications.length === 0)
                newErrors.qualifications = "At least one qualification is required";
            if (teacher.specialization.length === 0)
                newErrors.specialization = "At least one specialization is required";
            if (!teacher.experience || isNaN(teacher.experience) || teacher.experience < 0)
                newErrors.experience = "Valid experience is required";
            if (!teacher.dateOfJoining) newErrors.dateOfJoining = "Date of joining is required";
            if (teacher.classes.length === 0)
                newErrors.classes = "At least one class must be assigned";
            if (teacher.subjectsHandled.length === 0)
                newErrors.subjectsHandled = "At least one subject must be assigned";
            else {

                teacher.subjectsHandled.forEach((subj, i) => {
                    if (!subj.subjectName) newErrors[`subjectName_${i}`] = "Subject name is required";
                    // if (!subj.subjectCode) newErrors[`subjectCode_${i}`] = "Subject code is required";
                    if (!subj.classId) newErrors[`classId_${i}`] = "Class is required"
                });

            }
            if (!teacher.salaryInfo.basic || isNaN(teacher.salaryInfo.basic) || teacher.salaryInfo.basic < 0)
                newErrors.basic = "Basic salary is required";
            if (teacher.salaryInfo.allowances === "" || isNaN(teacher.salaryInfo.allowances) || teacher.salaryInfo.allowances < 0)
                newErrors.allowances = "Allowances must be 0 or more";
            if (teacher.salaryInfo.deductions === "" || isNaN(teacher.salaryInfo.deductions) || teacher.salaryInfo.deductions < 0)
                newErrors.deductions = "Deductions must be 0 or more";
            if (teacher.salaryInfo.deductions > (Number(teacher.salaryInfo.basic) + Number(teacher.salaryInfo.allowances)))
                newErrors.deductions = "Deductions cannot exceed Basic + Allowances";
            // if (teacher.salaryInfo.netSalary !== (Number(teacher.salaryInfo.basic) + Number(teacher.salaryInfo.allowances) - Number(teacher.salaryInfo.deductions)))


                // teacher.parents.forEach((parent, i) => {
                //     if (!parent.name)
                //         newErrors[`parent_${i}_name`] = "Parent name is required";
                //     if (!parent.occupation)
                //         newErrors[`parent_${i}_occupation`] = "Occupation required";
                //     if (!parent.phone)
                //         newErrors[`parent_${i}_phone`] = "Phone is required";
                //     if (parent.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent.email))
                //         newErrors[`parent_${i}_email`] = "Enter valid email";
                // });

                if (!teacher.emergencyContact.name)
                    newErrors.emergencyContact_name = "Contact name required";
            if (!teacher.emergencyContact.relation)
                newErrors.emergencyContact_relation = "Relation required";
            if (!teacher.emergencyContact.phone)
                newErrors.emergencyContact_phone = "Phone required";
            if (!teacher.emergencyContact.address)
                newErrors.emergencyContact_address = "Address required";

        }

        else if (activeStep === 2) {
            // if (!teacher.classId) newErrors.classId = "Class is required";
            // if (!teacher.academicYear) newErrors.academicYear = "Academic year is required";

            // Document validation
            if (
                !teacher.documents.aadharFront &&
                !previews.aadharFront
            ) {
                newErrors.aadharFront = "Aadhaar Front is required";
            }

            if (
                !teacher.documents.aadharBack &&
                !previews.aadharBack
            ) {
                newErrors.aadharBack = "Aadhaar Back is required";
            }

        }

        setErrors(newErrors);
        // console.log("Validation errors:", newErrors); // helpful for debugging
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
                formData.append(key, JSON.stringify(teacher[key]));
            });

            // ✅ Corrected document handling
            Object.entries(teacher.documents).forEach(([key, value]) => {
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
                const value = teacher[key];

                // Arrays/objects should be JSON.stringified
                if (Array.isArray(value) || typeof value === "object") {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value);
                }
            });


            // For debugging
            for (let [key, value] of formData.entries()) {
                // console.log(key, value);
            }

            const res = await apiPut(`${apiPath.updateTeacher}/${teacher._id}`, formData);
            // console.log("respponseeeeeee---------", res);
            toast.success(res.message || "Teacher updated successfully ✅");
            // toast.success("teacher created successfully ✅");
            navigate(-1);
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to update teacher ❌");
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
                Edit Teacher
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
    <div className="space-y-8">
        {/* Personal Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={teacher.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    variant="outlined"
                    className="w-full"
                />

                {/* Date of Birth */}
                <TextField
                    fullWidth
                    type="date"
                    name="dob"
                    value={teacher.dob}
                    onChange={handleChange}
                    label="Date of Birth"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                        max: new Date(
                            new Date().setFullYear(new Date().getFullYear() - 18)
                        ).toISOString().split("T")[0],
                        min: new Date(
                            new Date().setFullYear(new Date().getFullYear() - 65)
                        ).toISOString().split("T")[0],
                    }}
                    error={!!errors.dob}
                    helperText={errors.dob}
                    variant="outlined"
                />

                {/* Gender */}
                <TextField
                    select
                    fullWidth
                    name="gender"
                    label="Gender"
                    value={teacher.gender}
                    onChange={(e) => {
                        setteacher({ ...teacher, gender: e.target.value });
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

                {/* Blood Group */}
                <TextField
                    select
                    fullWidth
                    name="bloodGroup"
                    label="Blood Group"
                    value={teacher.bloodGroup}
                    onChange={(e) => {
                        setteacher({ ...teacher, bloodGroup: e.target.value });
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
                {/* Email */}
                <TextField
                    fullWidth
                    type="email"
                    name="email"
                    label="Email Address"
                    value={teacher.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    variant="outlined"
                />

                {/* Password */}
                <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    name="password"
                    label="Password"
                    value={teacher.password}
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

                {/* Phone */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                        country="in"
                        enableSearch
                        value={teacher.phone}
                        onChange={(phone) => {
                            setteacher({ ...teacher, phone });
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
     {/* Address Information Section */}
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
                value={countryOptions.find(c => c.value === teacher.address.country) || null}
                onChange={(selected) => {
                    setteacher(prev => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            country: selected?.value || "",
                            state: "",
                            city: "",
                        },
                    }));
                    setErrors(prev => ({ ...prev, address_country: "" }));
                }}
                placeholder="Select Country"
                className="w-full"
                isClearable
            />
            {errors.address_country && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.address_country}
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
                value={stateOptions.find(s => s.value === teacher.address.state) || null}
                onChange={(selected) => {
                    setteacher(prev => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            state: selected?.value || "",
                            city: "",
                        },
                    }));
                    setErrors(prev => ({ ...prev, address_state: "" }));
                }}
                placeholder={!teacher.address.country ? "Select Country First" : "Select State"}
                isDisabled={!teacher.address.country}
                className="w-full"
                isClearable
                isLoading={!stateOptions.length && !!teacher.address.country}
            />
            {errors.address_state && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.address_state}
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
                value={cityOptions.find(c => c.value === teacher.address.city) || null}
                onChange={(selected) => {
                    setteacher(prev => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            city: selected?.value || "",
                        },
                    }));
                    setErrors(prev => ({ ...prev, address_city: "" }));
                }}
                placeholder={!teacher.address.state ? "Select State First" : "Select City"}
                isDisabled={!teacher.address.state}
                className="w-full"
                isClearable
                isLoading={!cityOptions.length && !!teacher.address.state}
            />
            {errors.address_city && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.address_city}
                </p>
            )}
        </div>

        {/* ZIP Code */}
        <div className="space-y-2">
            <TextField
                fullWidth
                name="zip"
                label="ZIP / Postal Code"
                value={teacher.address.zip}
                onChange={(e) => handleChange(e, null, "address")}
                error={!!errors.address_zip}
                helperText={errors.address_zip}
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
                label="Street Address"
                value={teacher.address.street}
                onChange={(e) => handleChange(e, null, "address")}
                error={!!errors.address_street}
                helperText={errors.address_street}
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

        {/* Additional Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                Additional Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
                {/* Physical Disability */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={teacher.physicalDisability}
                                onChange={(e) =>
                                    setteacher({
                                        ...teacher,
                                        physicalDisability: e.target.checked,
                                    })
                                }
                                name="physicalDisability"
                                color="primary"
                            />
                        }
                        label={
                            <span className="font-medium text-gray-700">Physical Disability</span>
                        }
                    />
                    {teacher.physicalDisability && (
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            name="disabilityDetails"
                            label="Disability Details"
                            value={teacher.disabilityDetails}
                            onChange={handleChange}
                            variant="outlined"
                            className="mt-3"
                            placeholder="Please provide details about the disability..."
                        />
                    )}
                </div>

                {/* Profile Picture Upload */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-gray-700 font-medium mb-3">
                        Profile Picture
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
                            <div className="mt-4">
                                {previews.profilePic.type?.includes("pdf") ? (
                                    <iframe
                                        src={previews.profilePic.url}
                                        title="profile-preview"
                                        className="w-24 h-24 rounded-full border-2 border-gray-300 shadow-sm"
                                    />
                                ) : (
                                    <img
                                        src={previews.profilePic}
                                        alt="preview"
                                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                                    />
                                )}
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
                                        value={teacher.designation}
                                        onChange={handleChange}
                                        error={!!errors.designation}
                                        helperText={errors.designation}
                                         inputProps={{ list: "designationExample" }}  
                                        InputProps={{
                                            style: { height: "56px", borderRadius: "8px" },
                                        }}
                                        
                                    />
                                     <datalist id="designationExample">
                                        {designationDataExample.map((item, index) => (
                                            <option key={index} value={item} />
                                        ))}
                                    </datalist>
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
                                        value={teacher.qualifications.map((q) => ({ value: q, label: q }))}
                                        onChange={(selected) => {
                                            setteacher({
                                                ...teacher,
                                                qualifications: selected.map((s) => s.value),
                                            });
                                            setErrors((prev) => ({ ...prev, qualifications: "" }));
                                        }


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
                                        value={teacher.specialization.map((s) => ({ value: s, label: s }))}
                                        onChange={(selected) => {


                                            setteacher({
                                                ...teacher,
                                                specialization: selected.map((s) => s.value),
                                            });
                                            setErrors((prev) => ({ ...prev, specialization: "" }));
                                        }
                                        }

                                    />
                                    {errors.specialization && (
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
                                        value={teacher.experience}
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
                                        value={teacher.dateOfJoining}
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
                                            label: `${cls.name} ${cls.section}`,
                                        }))}
                                        value={teacher.classes.map((clsId) => {
                                            const found = classes?.results?.docs.find((cls) => cls._id === clsId);
                                            return found ? { value: found._id, label: `${found.name} ${found.section}` } : null;
                                        })}
                                        onChange={(selected) => {
                                            setteacher({
                                                ...teacher,
                                                classes: selected ? selected.map((s) => s.value) : [],
                                            });
                                            setErrors((prev) => ({ ...prev, classes: "" }));

                                        }

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
                                            setteacher({
                                                ...teacher,
                                                subjectsHandled: [
                                                    ...teacher.subjectsHandled,
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
                            {teacher.subjectsHandled.map((subject, index) => {

                                // ✅ SUBJECTS FOR THIS ROW ONLY
                                const rowSubjects = subjectsByClass[subject.classId] || [];

                                return (
                                    <Paper
                                        key={index}
                                        elevation={1}
                                        className="p-6 mb-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-center mb-5">
                                            <h3 className="text-lg font-semibold text-gray-700">
                                                Subject {index + 1}
                                            </h3>

                                            {teacher.subjectsHandled.length > 1 && (
                                                <Tooltip title="Remove subject">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => {
                                                            const updated = [...teacher.subjectsHandled];
                                                            updated.splice(index, 1);
                                                            setteacher({ ...teacher, subjectsHandled: updated });
                                                        }}
                                                    >
                                                        <DeleteOutline />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </div>

                                        <Grid container spacing={3} alignItems="center">

                                            {/* CLASS SELECT */}
                                            <Grid item xs={12} sm={4}>
                                                <Select
                                                    placeholder="Select class..."
                                                    classNamePrefix="select"
                                                    styles={{
                                                        control: (base, state) => ({
                                                            ...base,
                                                            minHeight: "56px",
                                                            borderRadius: "8px",
                                                            borderColor: errors[`classId_${index}`]
                                                                ? "red"
                                                                : state.isFocused
                                                                    ? "#1976d2"
                                                                    : "#d1d5db",
                                                            boxShadow: state.isFocused
                                                                ? "0 0 0 2px rgba(25,118,210,0.1)"
                                                                : "none",
                                                        }),
                                                    }}
                                                    options={
                                                        classes?.results?.docs
                                                            ?.filter(cls => teacher.classes.includes(cls._id))
                                                            ?.map(cls => ({
                                                                value: cls._id,
                                                                label: `${cls.name} ${cls.section}`,
                                                            }))
                                                    }
                                                    value={
                                                        subject.classId
                                                            ? {
                                                                value: subject.classId,
                                                                label: (() => {
                                                                    const found = classes?.results?.docs.find(
                                                                        cls => cls._id === subject.classId
                                                                    );
                                                                    return found ? `${found.name} ${found.section}` : "";
                                                                })(),
                                                            }
                                                            : null
                                                    }
                                                    onChange={async (selected) => {
                                                        const updated = [...teacher.subjectsHandled];

                                                        updated[index] = {
                                                            ...updated[index],
                                                            classId: selected?.value || "",
                                                            subjectName: "",
                                                            subjectCode: "",
                                                        };

                                                        setteacher({ ...teacher, subjectsHandled: updated });

                                                        const foundClass = classes?.results?.docs.find(
                                                            cls => cls._id === selected?.value
                                                        );

                                                        if (foundClass) {
                                                            const slug = `${foundClass.name}-${foundClass.section}`.toLowerCase();

                                                            const res = await apiGet(
                                                                `${apiPath.getSubjectByClassnameSectionWise}/${slug}`
                                                            );

                                                            setSubjectsByClass(prev => ({
                                                                ...prev,
                                                                [selected.value]: res?.results?.subjects || [],
                                                            }));
                                                        }
                                                    }}
                                                />

                                                {errors[`classId_${index}`] && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {errors[`classId_${index}`]}
                                                    </p>
                                                )}
                                            </Grid>

                                            {/* SUBJECT SELECT */}
                                            <Grid item xs={12} sm={4}>
                                                <Select
                                                    placeholder="Select subject..."
                                                    classNamePrefix="select"
                                                    styles={{
                                                        control: (base, state) => ({
                                                            ...base,
                                                            minHeight: "56px",
                                                            borderRadius: "8px",
                                                            borderColor: errors[`subjectName_${index}`]
                                                                ? "red"
                                                                : state.isFocused
                                                                    ? "#1976d2"
                                                                    : "#d1d5db",
                                                            boxShadow: state.isFocused
                                                                ? "0 0 0 2px rgba(25,118,210,0.1)"
                                                                : "none",
                                                        }),
                                                    }}
                                                    options={
                                                        rowSubjects
                                                            .filter(apiSubject =>
                                                                !teacher.subjectsHandled.some(
                                                                    (handled, i) =>
                                                                        handled.classId === subject.classId &&
                                                                        handled.subjectName === apiSubject.name &&
                                                                        i !== index
                                                                )
                                                            )
                                                            .map(apiSubject => ({
                                                                value: apiSubject._id,
                                                                label: apiSubject.name,
                                                            }))
                                                    }
                                                    value={
                                                        subject.subjectName
                                                            ? {
                                                                value: rowSubjects.find(
                                                                    s => s.name === subject.subjectName
                                                                )?._id,
                                                                label: subject.subjectName,
                                                            }
                                                            : null
                                                    }
                                                    onChange={(selected) => {
                                                        const foundSubject = rowSubjects.find(
                                                            subj => subj._id === selected?.value
                                                        );

                                                        const updated = [...teacher.subjectsHandled];
                                                        updated[index] = {
                                                            ...updated[index],
                                                            subjectName: selected?.label || "",
                                                            subjectCode: foundSubject?.code || "",
                                                        };

                                                        setteacher({ ...teacher, subjectsHandled: updated });
                                                    }}
                                                />

                                                {errors[`subjectName_${index}`] && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {errors[`subjectName_${index}`]}
                                                    </p>
                                                )}
                                            </Grid>

                                            {/* SUBJECT CODE */}
                                            <Grid item xs={12} sm={4}>
                                                <TextField
                                                    fullWidth
                                                    label="Subject Code"
                                                    value={subject.subjectCode || ""}
                                                    disabled
                                                    InputProps={{ style: { height: "56px", borderRadius: "8px" } }}
                                                />
                                            </Grid>
                                        </Grid>

                                        {index !== teacher.subjectsHandled.length - 1 && (
                                            <Divider className="mt-6" />
                                        )}
                                    </Paper>
                                );
                            })}

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
                                            value={teacher.salaryInfo[field]}
                                            onChange={(e) => {
                                                const { name, value } = e.target;
                                                let numericValue = value.replace(/\D/g, ""); // remove non-digit characters

                                                // 🔹 Prevent negative values (ignore '-' input)
                                                if (value.includes("-")) return;

                                                // 🔹 Restrict to 6 digits
                                                if (numericValue.length > 6) numericValue = numericValue.slice(0, 6);

                                                const parsedValue = parseFloat(numericValue) || 0;

                                                const updatedSalary = {
                                                    ...teacher.salaryInfo,
                                                    [name]: parsedValue,
                                                };

                                                // 🔹 Auto-calculate net salary
                                                const { basic = 0, allowances = 0, deductions = 0 } = updatedSalary;
                                                updatedSalary.netSalary = basic + allowances - deductions;

                                                setteacher({
                                                    ...teacher,
                                                    salaryInfo: updatedSalary,
                                                });

                                                // 🔹 Clear error on typing
                                                setErrors((prev) => ({ ...prev, [name]: "" }));
                                            }}

                                            error={!!errors[field]}
                                            helperText={errors[field]}
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
                                        value={teacher.salaryInfo.netSalary || 0}
                                        InputProps={{
                                            readOnly: true,
                                            style: { height: "56px", borderRadius: "8px", backgroundColor: "#f9fafb" },
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            {/* Optional: show overall salary errors */}
                            {errors.salaryInfo && (
                                <p className="text-red-500 text-sm mt-2">{errors.salaryInfo}</p>
                            )}
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
                                            value={teacher.emergencyContact[field]}
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
                                        value={teacher.emergencyContact.phone}
                                        onChange={(phone) => {
                                            setteacher({
                                                ...teacher,
                                                emergencyContact: { ...teacher.emergencyContact, phone },
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
                                    value={teacher.classId}
                                    // onChange={handleChange}
                                    onChange={(e) => {
                                        setteacher({ ...teacher, classId: e.target.value });

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
                                    value={teacher.academicYear}
                                    onChange={(e) => {
                                        setteacher({ ...teacher, academicYear: e.target.value });
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
                        {/* <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
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
                                                        setteacher((s) => ({
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
                        </div> */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-3xl shadow-md border border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                                        🪪 Aadhaar Card Upload
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Upload both sides of the Aadhaar card clearly and ensure details are visible.
                                    </p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 mt-4">
                                {["aadharFront", "aadharBack"].map((side) => (
                                    <div
                                        key={side}
                                        className="relative group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <label className="block text-gray-700 font-medium mb-3">
                                            {side === "aadharFront" ? "Aadhaar Front" : "Aadhaar Back"}{" "}
                                            <span className="text-red-500">*</span>
                                        </label>

                                        {/* Upload box or preview */}
                                        {!previews[side] ? (
                                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl py-10 cursor-pointer hover:border-blue-400 transition"
                                                onClick={() => document.getElementById(`${side}-input`).click()}>
                                                <div className="bg-blue-50 text-blue-500 p-3 rounded-full mb-3 group-hover:bg-blue-100 transition">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-8 w-8"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 12h4m-4 0a4 4 0 01-4-4m0 0H7m6 0a4 4 0 00-4 4" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-600 font-medium">
                                                    Click to upload {side === "aadharFront" ? "Front Side" : "Back Side"}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">Supported: JPG, PNG, PDF (max 2MB)</p>
                                                <input
                                                    id={`${side}-input`}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, side, "documents")}
                                                    className="hidden"
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative mt-2">
                                                {/* <img
                                                    src={previews[side]}
                                                    alt={side}
                                                    className="w-full h-56 object-cover rounded-xl border border-gray-200 shadow-sm"
                                                /> */}
                                              
                  <div  className="border p-3 rounded-lg">
                    {renderPreview(previews[side])}

                    {/* <p className="text-sm mt-2">{ms.exam}</p> */}

                    <button
                      onClick={() =>
                        window.open(previews[side], "_blank")
                      }
                      className="text-blue-600 text-sm"
                    >
                      View
                    </button>
                  </div>
       
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPreviews((p) => ({ ...p, [side]: null }));
                                                        setteacher((s) => ({
                                                            ...s,
                                                            documents: { ...s.documents, [side]: null },
                                                        }));
                                                    }}
                                                    className="absolute top-3 right-3 bg-red-500 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 shadow-sm"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}

                                        {errors[side] && (
                                            <p className="text-red-500 text-sm mt-2">{errors[side]}</p>
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
                                                    const updatedFiles = teacher.documents.marksheets.filter((_, i) => i !== idx);
                                                    const updatedPreviews = previews.marksheets.filter((_, i) => i !== idx);
                                                    setteacher((prev) => ({
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
                                                    const updatedFiles = teacher.documents.certificates.filter((_, i) => i !== idx);
                                                    const updatedPreviews = previews.certificates.filter((_, i) => i !== idx);
                                                    setteacher((prev) => ({
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
                            sx={{
                                // '--gradient-primary': 'linear-gradient(to right, #facc15, #eab308)',
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
                            className="p-2 rounded cursor-pointer"
                            // variant="contained"
                            style={{ background: "var(--gradient-primary)" }}
                        >
                            Submit
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
