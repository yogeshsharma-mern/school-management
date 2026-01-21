import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  IconButton,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PhoneInput from "react-phone-input-2";
import Select from "react-select";
import ToggleButton from "../components/ToggleButton";
import "react-phone-input-2/lib/material.css";
import { apiPut, apiGet, apiPatch, apiDelete, apiPost } from "../api/apiFetch";
import apiPath from "../api/apiPath";
import { useEffect } from "react";
import toast from "react-hot-toast";
// import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.example.com";

const stateOptions = [
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Delhi", label: "Delhi" },
  { value: "Karnataka", label: "Karnataka" },
];
// Fetch classes

const countryOptions = [
  { value: "India", label: "India" },
  { value: "USA", label: "USA" },
  { value: "UK", label: "UK" },
];

export default function SchoolSettings() {
  const queryClient = useQueryClient();
  const [schoolData, setSchoolData] = useState({
    schoolName: "",
    status: "inactive",
    tollFree: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    contact: {
      phone: "",
      email: "",
      website: "",
    },
    schoolTiming: {
      startTime: "09:00",
      endTime: "15:00",
    },
    periods: {
      totalPeriods: "",
      periodDuration: "",
      breakDuration: "",
      lunchBreak: {
        isEnabled: false,
        time: "",
        duration: "",
      },
    },
    academicSession: {
      startDate: "",
      endDate: "",
      currentSession: "",
    },
    about: {
      title: "",
      keyStats: [],
      image: null, // 👈 File ONLY
    },
    faqs: [], // array of { question, answer }
    banner: [], // array of URLs
    gallery: [], // array of URLs
    socialLinks: [
      {
        platform: "",
        url: "",
        logo: null, // 👈 File object
      }
    ], // array of URLs
    schoolLogo: null,
    marks: []
  });
  const [urlErrors, setUrlErrors] = useState([]);
  const [aboutImagePreview, setAboutImagePreview] = useState(null);

  // console.log("urlerrors", urlErrors);
  const [logoPreview, setLogoPreview] = useState(null);
  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    return isoDate.split("T")[0]; // "2025-10-13"
  };
  const classesQuery = useQuery({
    queryKey: ["classes"],
    queryFn: () => apiGet(`${apiPath.classesByNames}` || "/api/admins/classes"),
  });
  const classOptions = Object.values(classesQuery?.data?.results || []).map((cls) => ({
    label: cls,
    value: cls,
  }));
  console.log("classoptions", classOptions);
  const selected = schoolData.marks.map(m => m.className);
  console.log("selected", selected)
  console.log("classoptions", classOptions);
  const availableOptions = classOptions.filter(
    opt => !selected.includes(opt.value)
  );

  console.log("available ooptions", availableOptions);

  const { data: studentData, isLoading } = useQuery({
    queryKey: ["school-settings"],
    queryFn: () => apiGet(apiPath.SchoolSettings) // only fetch if id exists
  });
  // console.log("first", studentData);

  useEffect(() => {
    if (!studentData?.results) return;
    const s = studentData.results;
    console.log("s", s);

    const formatDateForInput = (isoDate) =>
      isoDate ? isoDate.split("T")[0] : "";

    setSchoolData({
      schoolName: s.schoolName || "",
      status: s.status || "inactive",
      tollFree: s.tollFree || "",
      address: {
        street: s.address?.street || "",
        city: s.address?.city || "",
        state: s.address?.state || "",
        zip: s.address?.zip || "",
        country: s.address?.country || "",
      },
      contact: {
        phone: s.contact?.phone || "",
        email: s.contact?.email || "",
        website: s.contact?.website || "",
      },
      schoolTiming: {
        startTime: s.schoolTiming?.startTime || "09:00",
        endTime: s.schoolTiming?.endTime || "15:00",
      },
      periods: {
        totalPeriods: s.periods?.totalPeriods || "",
        periodDuration: s.periods?.periodDuration || "",
        breakDuration: s.periods?.breakDuration || "",
        lunchBreak: {
          isEnabled: s.periods?.lunchBreak?.isEnabled || false,
          time: s.periods?.lunchBreak?.time || "",
          duration: s.periods?.lunchBreak?.duration || "",
        },
      },
      academicSession: {
        startDate: formatDateForInput(s.academicSession?.startDate),
        endDate: formatDateForInput(s.academicSession?.endDate),
        currentSession: s.academicSession?.currentSession || "",
      },
      // about: {
      //   title: s.aboutUs?.title || "",
      //   keyStats: Array.isArray(s.aboutUs?.keyStats)
      //     ? s.aboutUs.keyStats
      //     : s.aboutUs?.keyStats
      //       ? s.aboutUs.keyStats.split("|").map(v => v.trim())
      //       : [],
      //   image: null, // 👈 only set when user uploads
      // },


      faqs: s.faqs || [],
      banner: s.banner || [],
      gallery: s.gallery || [],
      socialLinks: Array.isArray(s.socialLinks)
        ? s.socialLinks.map(link => ({
          platform: link.platform || "",
          url: link.url || "",
          logo: link.socialLogos || null, // 👈 URL string
        }))
        : [{ platform: "", url: "", logo: null }],


      // schoolLogo: null,
      marks: s.marks || [],
    });

    if (s.schoolLogo) setLogoPreview(s.schoolLogo);
  }, [studentData]);
  // if (s.aboutUs?.image) {
  //   setAboutImagePreview(
  //     s.aboutUs.image.startsWith("http")
  //       ? s.aboutUs.image
  //       : `${import.meta.env.VITE_API_BASE_URL}${s.aboutUs.image}`
  //   );
  // }
  useEffect(() => {
  const { lunchBreak } = schoolData.periods;

  if (!lunchBreak.isEnabled) return;

  const autoTime = calculateAutoLunchTime(schoolData);
  if (!autoTime) return;

  if (autoTime !== lunchBreak.time) {
    handleChange("periods.lunchBreak.time", autoTime);
  }
}, [
  schoolData.periods.totalPeriods,
  schoolData.periods.periodDuration,
  schoolData.periods.breakDuration,
  schoolData.schoolTiming.startTime,
  schoolData.periods.lunchBreak.isEnabled,
]);
useEffect(() => {
  if (!schoolData.periods.lunchBreak.isEnabled) return;

  const options = getPossibleLunchTimes(schoolData);
  const exists = options.some(
    o => o.value === schoolData.periods.lunchBreak.time
  );

  if (!exists && options.length) {
    handleChange("periods.lunchBreak.time", options[0].value);
  }
}, [
  schoolData.periods.totalPeriods,
  schoolData.periods.periodDuration,
  schoolData.periods.breakDuration,
  schoolData.schoolTiming.startTime,
]);

  const addSocial = () => {
    setSchoolData(prev => ({
      ...prev,
      socialLinks: [
        ...(Array.isArray(prev.socialLinks) ? prev.socialLinks : []),
        { platform: "", url: "", logo: null },
      ],
    }));

    setUrlErrors(prev => [...prev, ""]);
  };



  const removeSocial = (index) => {
    setSchoolData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));

    setUrlErrors(prev => prev.filter((_, i) => i !== index));
  };


  const handleSocialChange = (index, field, value) => {
    const trimmedValue = field === "url" ? value.trim() : value;

    // 🔹 Update socialLinks safely
    setSchoolData(prev => {
      // console.log("prev",prev);
      const updated = [...prev.socialLinks];
      updated[index] = {
        ...updated[index],
        [field]: trimmedValue,
      };
      return { ...prev, socialLinks: updated };
    });

    // 🔹 URL validation (onChange)
    if (field === "url") {
      const urlPattern =
        /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/;

      setUrlErrors(prev => {
        const errors = [...prev];
        errors[index] =
          trimmedValue && !urlPattern.test(trimmedValue)
            ? "Please enter a valid URL"
            : "";
        return errors;
      });
    }
  };

  const getSocialLogoPreview = (logo) => {
    if (!logo) return "";

    // New upload
    if (logo instanceof File) {
      return URL.createObjectURL(logo);
    }

    // Existing image URL from backend
    if (typeof logo === "string") {
      return logo.startsWith("http")
        ? logo
        : `${API_BASE}${logo}`;
    }

    return "";
  };

  // const handleUrlChange = (e, index) => {
  //   const value = e.target.value.trim();
  //   const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/;

  //   // Validate the current field
  //   const newErrors = [...urlErrors];
  //   // console.log("newErrors", newErrors);
  //   if (value && !urlPattern.test(value)) {
  //     newErrors[index] = "Please enter a valid URL (e.g. https://example.com)";
  //   } else {
  //     newErrors[index] = "";
  //   }
  //   setUrlErrors(newErrors);

  //   // Update the array of URLs
  //   handleChange(
  //     "socialUrl",
  //     schoolData.socialUrl.map((u, i) => (i === index ? value : u))
  //   );
  // };

  // POST / PUT Save
  const mutation = useMutation({
    mutationFn: (formData) => {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      return studentData?.results
        ? apiPut(apiPath.updateSchoolSettings, formData, config)
        : apiPost(apiPath.createSchoolSettings, formData, config);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["school-settings"]);
      toast.success(data.message || "Settings saved successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    }
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (bannerId) =>
      apiDelete(`${apiPath.deleteBannerImage}/${bannerId}`),

    onSuccess: (data, bannerId) => {
      toast.success(data.message || "Banner deleted");

      // UI se bhi remove
      setSchoolData((prev) => ({
        ...prev,
        banner: prev.banner.filter((b) => b._id !== bannerId),
      }));

      // fresh data chahiye ho to
      queryClient.invalidateQueries(["school-settings"]);
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
  });


  const handleDeleteBanner = (img, index) => {
    // 🟢 Agar new uploaded file hai (File object) → sirf local remove
    if (img instanceof File) {
      handleChange(
        "banner",
        schoolData.banner.filter((_, i) => i !== index)
      );
      return;
    }

    // 🔴 Existing banner (server wala) → API call
    if (img?._id) {
      deleteBannerMutation.mutate(img._id);
    }
  };


  // PATCH Reset Defaults
  const resetMutation = useMutation({
    mutationFn: async () => apiPatch(apiPath.resetSchoolSettings),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["school-settings"])
      toast.success(data.message || "Settings reset to defaults");
    },
  });
  const getImagePreview = (img) => {
    if (img instanceof File || img instanceof Blob)
      return URL.createObjectURL(img);

    if (typeof img?.image === "string")
      return img.image.startsWith("http")
        ? img.image
        : `${import.meta.env.VITE_API_BASE_URL}${img.image}`;

    return "";
  };

const getPossibleLunchTimes = (data) => {
  const { schoolTiming, periods } = data;

  if (
    !schoolTiming.startTime ||
    !periods.totalPeriods ||
    !periods.periodDuration
  ) {
    return [];
  }

  const totalPeriods = Number(periods.totalPeriods);
  const periodDuration = Number(periods.periodDuration);
  const breakDuration = Number(periods.breakDuration || 0);

  let current = timeToMinutes(schoolTiming.startTime);
  const options = [];

  for (let i = 1; i < totalPeriods; i++) {
    // finish period
    current += periodDuration;

    options.push({
      label: `After Period ${i} (${minutesToTime(current)})`,
      value: minutesToTime(current),
    });

    // add break before next period
    current += breakDuration;
  }

  return options;
};

  const generateSessionOptions = (startDate, endDate) => {
    if (!startDate || !endDate) return [];

    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();

    if (startYear > endYear) return [];

    const session = `${startYear}-${endYear}`;
    return [{ value: session, label: session }];
  };

  // Helper to get currentSession default value
  const getCurrentSessionValue = (session) => {
    return session
      ? { value: session, label: session }
      : null;
  };


  // Nested state updater
  const handleChange = (path, value) => {
    console.log("path", path);
    console.log("value", value);
    setSchoolData((prev) => {
      console.log("prev", prev);
      const newData = { ...prev };
      // console.log("prev",...prev);
      // console.log("newData",newData);
      const keys = path.split(".");
      //schoolname
      // console.log("keys.length",keys.length)
      let temp = newData;
      // console.log("temp",temp);
      for (let i = 0; i < keys.length - 1; i++) temp = temp[keys[i]];

      // Validation for school timing (08:00 - 16:00)
      if (keys[0] === "schoolTiming") {
        const time = value;
        const [h, m] = time.split(":").map(Number);
        if (h < 7 || h > 16) return prev; // ignore invalid
      }

      // Validation for lunch duration <= 60
      if (path === "periods.lunchBreak.duration" && Number(value) > 60) return prev;

      // Prevent negative values for periods/duration
      if (["periods.totalPeriods", "periods.periodDuration", "periods.breakDuration"].includes(path) && Number(value) < 0) return prev;

      temp[keys[keys.length - 1]] = value;


      return newData;
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // ✅ Basic fields
    formData.append("schoolName", schoolData.schoolName);
    formData.append("status", schoolData.status);
    formData.append("tollFree", schoolData.tollFree);
    formData.append("address", JSON.stringify(schoolData.address));
    formData.append("contact", JSON.stringify(schoolData.contact));
    formData.append("schoolTiming", JSON.stringify(schoolData.schoolTiming));
    formData.append("periods", JSON.stringify(schoolData.periods));
    formData.append("academicSession", JSON.stringify(schoolData.academicSession));
    // Text fields only
    // formData.append(
    //   "aboutUs",
    //   JSON.stringify({
    //     title: schoolData.about.title,
    //     keyStats: schoolData.about.keyStats,
    //   })
    // );

    // Image file separately
    // if (schoolData.about.image instanceof File) {
    //   formData.append("aboutImage", schoolData.about.image);
    // }

    formData.append("faqs", JSON.stringify(schoolData.faqs));
    formData.append(
      "socialLinks",
      JSON.stringify(
        schoolData.socialLinks.map(({ platform, url }) => ({
          platform,
          url,
        }))
      )
    )
    schoolData.socialLinks.forEach((item, index) => {
      if (item.logo) {
        formData.append(`socialLogos[${index}]`, item.logo);
      }
    });
    formData.append("marks", JSON.stringify(schoolData.marks));


    // ✅ Files
    (schoolData.banner || []).forEach((file) => {
      if (file instanceof File) {
        formData.append("banner", file);
      }
    });

    // (schoolData.gallery || []).forEach((file) => {
    //   if (file instanceof File) {
    //     formData.append("gallery", file);
    //   }
    // });

    if (schoolData.schoolLogo instanceof File) {
      formData.append("schoolLogo", schoolData.schoolLogo);
    }


if (!validatePeriodsAgainstSchoolTime(schoolData)) {
  toast.error("Please fix school timing and periods");
  return;
}
    // ✅ Submit using mutation
    mutation.mutate(formData);
  };
const timeToMinutes = (time) => {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

    const runPeriodsValidation = () => {
  validatePeriodsAgainstSchoolTime(schoolData);
};
const getSchoolTotalMinutes = (data) => {
  const start = timeToMinutes(data.schoolTiming.startTime);
  const end = timeToMinutes(data.schoolTiming.endTime);
  return end - start;
};
const validateSchoolTiming = (start, end) => {
  const diff = timeToMinutes(end) - timeToMinutes(start);

  if (diff <= 0) {
    toast.error("End time must be after start time");
    return false;
  }

  return true;
};
const calculateAutoLunchTime = (data) => {
  const { schoolTiming, periods } = data;

  if (
    !periods.totalPeriods ||
    !periods.periodDuration ||
    !schoolTiming.startTime
  ) {
    return "";
  }

  const totalPeriods = Number(periods.totalPeriods);
  const periodDuration = Number(periods.periodDuration);
  const breakDuration = Number(periods.breakDuration || 0);

  const lunchAfterPeriod = Math.floor(totalPeriods / 2);

  let current = timeToMinutes(schoolTiming.startTime);

  for (let i = 1; i <= lunchAfterPeriod; i++) {
    // finish period
    current += periodDuration;

    // ❌ no break before lunch
    if (i === lunchAfterPeriod) break;

    // add break
    current += breakDuration;
  }

  return minutesToTime(current);
};

const validatePeriodsAgainstSchoolTime = (data, silent = false) => {
  const { schoolTiming, periods } = data;

  // ⛔ timing missing
  if (!schoolTiming.startTime || !schoolTiming.endTime) return true;

  const schoolMinutes =
    timeToMinutes(schoolTiming.endTime) -
    timeToMinutes(schoolTiming.startTime);

  if (schoolMinutes <= 0) {
    if (!silent) toast.error("Invalid school timing");
    return false;
  }

  // ⛔ required fields missing
  if (!periods.totalPeriods || !periods.periodDuration) return true;

  const totalPeriods = Number(periods.totalPeriods);
  const periodDuration = Number(periods.periodDuration);
  const breakDuration = Number(periods.breakDuration || 0); // ✅ DEFAULT 0

const breakCount = getEffectiveBreakCount(
  totalPeriods,
  periods.lunchBreak.isEnabled
);

let totalUsedMinutes =
  totalPeriods * periodDuration +
  breakCount * breakDuration;

  // 🍱 Lunch
  if (periods.lunchBreak.isEnabled) {
    if (!periods.lunchBreak.duration) return true;
    totalUsedMinutes += Number(periods.lunchBreak.duration);
  }

  if (totalUsedMinutes > schoolMinutes) {
    if (!silent)
      toast.error(
        `Total time (${totalUsedMinutes} min) exceeds school timing (${schoolMinutes} min)`
      );
    return false;
  }

  if (totalUsedMinutes < schoolMinutes) {
    if (!silent)
      toast.error(
        `Total time (${totalUsedMinutes} min) is less than school timing (${schoolMinutes} min)`
      );
    return false;
  }

  return true;
};
const getUsedMinutes = (data) => {
  const { periods } = data;

  if (!periods.totalPeriods || !periods.periodDuration) return 0;

  const totalPeriods = Number(periods.totalPeriods);
  const periodDuration = Number(periods.periodDuration);
  const breakDuration = Number(periods.breakDuration || 0);

  const breakCount = getEffectiveBreakCount(
    totalPeriods,
    periods.lunchBreak.isEnabled
  );

  let total =
    totalPeriods * periodDuration +
    breakCount * breakDuration;

  if (periods.lunchBreak.isEnabled && periods.lunchBreak.duration) {
    total += Number(periods.lunchBreak.duration);
  }

  return total;
};

const getEffectiveBreakCount = (totalPeriods, lunchEnabled) => {
  if (totalPeriods <= 1) return 0;

  // lunch enabled → 2 breaks removed
  if (lunchEnabled) {
    return Math.max(totalPeriods - 2, 0);
  }

  // lunch disabled → normal breaks
  return Math.max(totalPeriods - 1, 0);
};

const getTimingStatus = (data) => {
  const used = getUsedMinutes(data);
  const school = getSchoolTotalMinutes(data);

  if (!used || !school) return { color: "text.secondary", msg: "" };

  if (used > school) {
    return {
      color: "error.main",
      msg: `Over by ${used - school} min`,
    };
  }

  if (used < school) {
    return {
      color: "warning.main",
      msg: `Short by ${school - used} min`,
    };
  }

  return {
    color: "success.main",
    msg: "Perfect match",
  };
};



  if (isLoading)
    return (
      // <Box display="flex" justifyContent="center" mt={8}>
      //   <CircularProgress />
      // </Box>
      <div className="h-[70vh] inset-0 flex items-center justify-center  bg-opacity-70 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );

  return (
    <Box className="p-6 w-[100vw] md:w-auto" >
      <Typography
        className="text-black font-bold tracking-wide"
        variant="h5"
        align="center"
        gutterBottom
      >
        🏫 School Settings
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* Basic Info + Status */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                {/* <TextField
                  label="School Name"
                  value={schoolData.schoolName || ""}
                  onChange={(e) => handleChange("schoolName", e.target.value)}
                  fullWidth
                /> */}
                <TextField
                  label="School Name"
                  value={schoolData.schoolName || ""}
                  onChange={(e) => {
                    const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // allow letters and spaces
                    handleChange("schoolName", onlyLetters);
                  }}
                  fullWidth
                />

              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Status
                </Typography>
                <ToggleButton
                  isActive={schoolData.status}
                  onToggle={() =>
                    handleChange(
                      "status",
                      schoolData.status === "active" ? "inactive" : "active"
                    )
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📞 Contact Info
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <PhoneInput
                  country={"in"}
                  value={schoolData.contact.phone || ""}
                  onChange={(phone) => handleChange("contact.phone", phone)}
                  inputStyle={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Email"
                  value={schoolData.contact.email || ""}
                  onChange={(e) => handleChange("contact.email", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Website"
                  value={schoolData.contact.website || ""}
                  onChange={(e) => {
                    const input = e.target.value.trim();

                    // ✅ Allow only letters, digits, dots, hyphens, slashes, and colons
                    const clean = input.replace(/[^a-zA-Z0-9\-._:/]/g, "");

                    handleChange("contact.website", clean);
                  }}
                  fullWidth
                  placeholder="https://www.example.com"
                />

              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Address */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📍 Address
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Street"
                  value={schoolData.address.street || ""}
                  onChange={(e) => {
                    // allow letters, numbers, and spaces only
                    const cleanValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, "");
                    handleChange("address.street", cleanValue);
                  }}
                  fullWidth
                />

              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  value={schoolData.address.city || ""}
                  onChange={(e) => {
                    const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // allow only letters and spaces
                    handleChange("address.city", onlyLetters);
                  }}
                  fullWidth
                />

              </Grid>
              <Grid item xs={12} sm={6}>
                <Select
                  options={stateOptions}
                  value={stateOptions.find((s) => s.value === schoolData.address.state)}
                  onChange={(option) => handleChange("address.state", option.value)}
                  menuPortalTarget={document.body} // ✅ renders dropdown at body level
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // ✅ ensures visible on top
                    menu: (base) => ({ ...base, zIndex: 9999 }),       // optional double safety
                  }}
                />

              </Grid>
              <Grid item xs={12} sm={6}>
                <Select
                  options={countryOptions}
                  value={countryOptions.find(
                    (c) => c.value === schoolData.address.country
                  )}
                  menuPortalTarget={document.body} // ✅ renders dropdown at body level
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // ✅ ensures visible on top
                    menu: (base) => ({ ...base, zIndex: 9999 }),       // optional double safety
                  }}
                  onChange={(option) =>
                    handleChange("address.country", option.value)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="ZIP"
                  value={schoolData.address.zip || ""}
                  onChange={(e) => {
                    // Allow only numbers and limit to 6 digits
                    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
                    handleChange("address.zip", onlyDigits);
                  }}
                  fullWidth
                />

              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* School Timing */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ⏰ School Timing
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
  type="time"
  label="Start Time"
  value={schoolData.schoolTiming.startTime}
  onChange={(e) => {
    const newStart = e.target.value;
    const end = schoolData.schoolTiming.endTime;
    if (end && !validateSchoolTiming(newStart, end)) return;
    handleChange("schoolTiming.startTime", newStart);
  }}
  fullWidth
  InputLabelProps={{ shrink: true }}
/>

              </Grid>
              <Grid item xs={12} sm={6}>
              <TextField
  type="time"
  label="End Time"
  value={schoolData.schoolTiming.endTime}
  onChange={(e) => {
    const newEnd = e.target.value;
    const start = schoolData.schoolTiming.startTime;
    if (start && !validateSchoolTiming(start, newEnd)) return;
    handleChange("schoolTiming.endTime", newEnd);
  }}
  fullWidth
  InputLabelProps={{ shrink: true }}
/>

              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Periods */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📘 Periods
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
              <TextField
  type="number"
  label="Total Periods"
  value={schoolData.periods.totalPeriods || ""}
  onChange={(e) => {
    const value = e.target.value;
    if (value === "" || (Number(value) >= 1 && Number(value) <= 10)) {
      handleChange("periods.totalPeriods", value);
    }
  }}
  onBlur={runPeriodsValidation}
  fullWidth
/>


              </Grid>
              <Grid item xs={12} sm={4}>
               <TextField
  type="number"
  label="Period Duration (min)"
  value={schoolData.periods.periodDuration || ""}
  onChange={(e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    handleChange("periods.periodDuration", value);
  }}
  onBlur={runPeriodsValidation}
  fullWidth
/>


              </Grid>
              <Grid item xs={12} sm={4}>
              <TextField
  type="number"
  label="Break Duration (min)"
  value={schoolData.periods.breakDuration || ""}
  onChange={(e) => {
    const value = e.target.value;
    if (Number(value) > 30) {
      toast.error("Break duration cannot exceed 30 minutes");
      return;
    }
    handleChange("periods.breakDuration", value);
  }}
  onBlur={runPeriodsValidation}
  fullWidth
/>

              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
  checked={schoolData.periods.lunchBreak.isEnabled || false}
  onChange={(e) => {
    handleChange("periods.lunchBreak.isEnabled", e.target.checked);
    setTimeout(runPeriodsValidation, 0);
  }}
/>

                  }
                  label="Enable Lunch Break"
                />
              </Grid>
              {schoolData.periods.lunchBreak.isEnabled && (
                <>
                  <Grid item xs={12} sm={6}>
                  <Select
  options={getPossibleLunchTimes(schoolData)}
  value={getPossibleLunchTimes(schoolData).find(
    o => o.value === schoolData.periods.lunchBreak.time
  )}
  onChange={(opt) =>
    handleChange("periods.lunchBreak.time", opt.value)
  }
  placeholder="Select Lunch Time"
  menuPortalTarget={document.body}
  styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  }}
/>

                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="number"
                      label="Lunch Duration (min)"
                      value={schoolData.periods.lunchBreak.duration || ""}
                      onChange={(e) =>
                        handleChange("periods.lunchBreak.duration", e.target.value)
                      }
                      fullWidth
                    />
                  </Grid>
                </>
              )}
            </Grid>
            {(() => {
  const used = getUsedMinutes(schoolData);
  const school = getSchoolTotalMinutes(schoolData);
  const status = getTimingStatus(schoolData);

  if (!used || !school) return null;

  return (
    <Typography
      variant="body2"
      sx={{ color: status.color, fontWeight: 600, marginTop: 2 }}
    >
      Used: {used} min / School: {school} min — {status.msg}
    </Typography>
  );
})()}
          </CardContent>




        </Card>
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Class-wise Marks
            </Typography>

            {(schoolData.marks || []).map((item, index) => (
              <Box
                key={index}
                display="flex"
                gap={2}
                alignItems="center"
                mb={2}
              // pr={3}
              >
                {/* Class Name */}
                <Select
                  options={availableOptions}
                  value={classOptions.find(
                    (opt) => opt.value === item.className
                  )}
                  onChange={(option) =>
                    handleChange(`marks.${index}.className`, option.value)
                  }
                  placeholder="Select Class"
                  menuPortalTarget={document.body}
                  styles={{
                    control: (base) => ({
                      ...base,
                      width: 150,          // 👈 yahan width badhao
                      minWidth: 150,
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />


                {/* Per Subject Marks */}
                {/* <TextField
                  type="number"
                  label="Per Subject Marks"
                  value={item.perSubjectMarks}
                  onChange={(e) =>
                    handleChange(`marks.${index}.perSubjectMarks`, e.target.value)
                  }
                  inputProps={{ min: 0, max: 100 }}
                  fullWidth
                /> */}
                <TextField
                  type="number"
                  label="Per Subject Marks"
                  value={item.perSubjectMarks}
                  onChange={(e) => {
                    let value = e.target.value;

                    // ❌ empty allow
                    if (value === "") {
                      handleChange(`marks.${index}.perSubjectMarks`, "");
                      return;
                    }

                    // ❌ only digits
                    value = value.replace(/\D/g, "");

                    // ❌ max 3 digits
                    if (value.length > 3) return;

                    const num = Number(value);

                    // ❌ max 100
                    if (num > 100) {
                      toast.error("Marks cannot be more than 100");
                      return;
                    }

                    handleChange(`marks.${index}.perSubjectMarks`, value);
                  }}
                  inputProps={{
                    min: 0,
                    max: 100,
                  }}
                  fullWidth
                />


                {/* Delete */}
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() =>
                    handleChange(
                      "marks",
                      schoolData.marks.filter((_, i) => i !== index)
                    )
                  }
                >
                  ✕
                </Button>
              </Box>
            ))}

            {/* Add New Class */}
            <Button
              variant="outlined"
              onClick={() =>
                handleChange("marks", [
                  ...(schoolData.marks || []),
                  { className: "", perSubjectMarks: "" },
                ])
              }
            >
              ➕ Add Class Marks
            </Button>
          </CardContent>
        </Card>

        {/* // Add this snippet inside your <form> before the buttons section */}
        {/* Academic Session */}
        {/* Academic Session */}
        {/* Academic Session */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎓 Academic Session
            </Typography>
            <Grid container spacing={2}>
              {/* Start Date */}
              <Grid item xs={12} sm={4}>
                <TextField
                  type="date"
                  label="Start Date"
                  value={schoolData.academicSession.startDate || ""}
                  onChange={(e) => {
                    handleChange("academicSession.startDate", e.target.value);
                    handleChange("academicSession.currentSession", "");
                  }}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ height: 55 }}
                  required
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={12} sm={4}>
                <TextField
                  type="date"
                  label="End Date"
                  value={schoolData.academicSession.endDate || ""}
                  onChange={(e) => {
                    handleChange("academicSession.endDate", e.target.value);
                    handleChange("academicSession.currentSession", "");
                  }}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ height: 55 }}
                  required
                />
              </Grid>

              {/* Current Session */}
              <Grid item xs={12} sm={4}>
                <Select

                  options={generateSessionOptions(
                    schoolData.academicSession.startDate,
                    schoolData.academicSession.endDate
                  )}

                  value={getCurrentSessionValue(
                    schoolData.academicSession.currentSession
                  )}

                  onChange={(option) =>
                    handleChange("academicSession.currentSession", option.value)
                  }
                  menuPortalTarget={document.body} // ✅ renders dropdown at body level
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // ✅ ensures visible on top
                    menu: (base) => ({ ...base, zIndex: 9999 }),       // optional double safety
                  }}

                  placeholder="Select Current Session"

                />
                {!schoolData.academicSession.currentSession && (
                  <Typography variant="body2" color="error" mt={1}>
                    Current Session is required.
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>




        {/* School Logo */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🏫 School Logo
            </Typography>
            <Button style={{ background: "var(--gradient-primary)", color: "black" }} component="label">
              Upload Logo
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleChange("schoolLogo", file);
                    setLogoPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </Button>
            {logoPreview && (
              <Box mt={2}>
                <img
                  src={logoPreview}
                  alt="Preview"
                  style={{ width: 120, height: 120, borderRadius: 12 }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
        {/* Toll-Free Number */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ☎️ Toll-Free Number
            </Typography>
            <TextField
              fullWidth
              label="Toll-Free Number"
              value={schoolData.tollFree || ""}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ""); // only digits allowed

                if (value.length > 11) {
                  toast.error("Toll-free number must be 11 digits only");
                  value = value.slice(0, 11); // limit to 11 digits
                }

                handleChange("tollFree", value);
              }}
              inputProps={{ maxLength: 11 }}
            />
          </CardContent>
        </Card>

        {/* About Section */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            {/* <Typography variant="h6" gutterBottom>
              🏫 About School
            </Typography> */}
            {/* <TextField
              fullWidth
              label="Title"
              value={schoolData.about?.title || ""}
              onChange={(e) => {
                const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // allow only letters & spaces
                handleChange("about.title", onlyLetters);
              }}
              sx={{ mb: 2 }}
            /> */}

            {/* <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description / Key Info"
              value={(schoolData.about?.keyStats || []).join("\n")}
              onChange={(e) =>
                handleChange("about.keyStats", e.target.value.split("\n"))
              }
              helperText="Each line will be treated as a separate key point."
            /> */}
            <Box>
              {/* <Typography variant="subtitle1" fontWeight={600} mb={1}>
    🖼️ About Section Image
  </Typography> */}

              {/* Upload / Preview Card */}

            </Box>


            {aboutImagePreview && (
              <Box mt={2}>
                <img
                  src={aboutImagePreview}
                  alt="About Preview"
                  style={{
                    width: 220,
                    height: 130,
                    objectFit: "cover",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                  }}
                />
              </Box>
            )}

          </CardContent>
        </Card>

        {/* FAQs Section */}
        {/* FAQs Section */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ❓ Frequently Asked Questions
            </Typography>

            {(schoolData.faqs || []).map((faq, index) => (
              <Box
                key={index}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  p: 4,
                  mb: 2,
                  background: "#fafafa",
                  position: "relative",

                }}
              >
                {/* ❌ Remove Button */}
                <Button
                  size="small"
                  color="error"
                  onClick={() =>
                    handleChange(
                      "faqs",
                      schoolData.faqs.filter((_, i) => i !== index)
                    )
                  }
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    minWidth: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    fontSize: "16px",
                    lineHeight: "1",
                    fontWeight: "bold",
                  }}
                >
                  ✕
                </Button>

                <TextField
                  fullWidth
                  label={`Question ${index + 1}`}
                  value={faq.question}
                  onChange={(e) =>
                    handleChange(`faqs.${index}.question`, e.target.value)
                  }
                  sx={{ mb: 1 }}
                />

                <TextField
                  fullWidth
                  label={`Answer ${index + 1}`}
                  value={faq.answer}
                  onChange={(e) =>
                    handleChange(`faqs.${index}.answer`, e.target.value)
                  }
                  multiline
                  minRows={2}
                />
              </Box>
            ))}

            {/* ➕ Add FAQ button */}
            <Button
              variant="outlined"
              onClick={() =>
                handleChange("faqs", [
                  ...(schoolData.faqs || []),
                  { question: "", answer: "" },
                ])
              }
            >
              ➕ Add FAQ
            </Button>
          </CardContent>
        </Card>


        {/* Banner Images */}
        {/* Banner Images */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🖼️ Banner Images
            </Typography>

            <Button
              variant="contained"
              component="label"
              sx={{ background: "var(--gradient-primary)", color: "black", mb: 2 }}
            >
              Upload Banner
              <input
                hidden
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  handleChange("banner", [
                    ...(schoolData.banner || []),
                    ...files, // can stay as File objects
                  ]);
                }}
              />
            </Button>

            <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
              {(schoolData.banner || []).map((img, idx) => {
                const preview = getImagePreview(img);
                return (
                  <Box
                    key={idx}
                    position="relative"
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 2,
                    }}
                  >
                    <img
                      src={preview}
                      alt={`Banner ${idx}`}
                      width="100%"
                      height="100%"
                      style={{ objectFit: "cover" }}
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteBanner(img, idx)}


                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        minWidth: 28,
                        height: 28,
                        borderRadius: "50%",
                        fontSize: 14,
                        background: "white",
                        "&:hover": { background: "#ffebee" },
                      }}
                    >
                      ✕
                    </Button>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>


        {/* Gallery Images */}
        {/* Gallery Images */}
        {/* <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🖼️ Gallery Images
            </Typography>

            <Button
              variant="contained"
              component="label"
              sx={{ background: "var(--gradient-primary)", color: "black", mb: 2 }}
            >
              Upload Gallery
              <input
                hidden
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  handleChange("gallery", [...(schoolData.gallery || []), ...files]);
                }}
              />
            </Button>

            <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
              {(schoolData.gallery || []).map((img, idx) => {
                const preview = getImagePreview(img);
                return (
                  <Box
                    key={idx}
                    position="relative"
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 2,
                    }}
                  >
                    <img
                      src={preview}
                      alt={`Gallery ${idx}`}
                      width="100%"
                      height="100%"
                      style={{ objectFit: "cover" }}
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() =>
                        handleChange(
                          "gallery",
                          schoolData.gallery.filter((_, i) => i !== idx)
                        )
                      }
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        minWidth: 28,
                        height: 28,
                        borderRadius: "50%",
                        fontSize: 14,
                        background: "white",
                        "&:hover": { background: "#ffebee" },
                      }}
                    >
                      ✕
                    </Button>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card> */}


        {/* Social URLs */}
        {/* Social URLs */}
<div className="overflow-auto">
<div className="overflow-auto">
  <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        🌐 Social Media Links
      </Typography>

      {(schoolData.socialLinks || []).map((item, index) => {
        const preview = getSocialLogoPreview(item.logo);

        return (
          <Box
            key={index}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr", // Mobile: single column
                sm: "1fr 1fr", // Tablet: 2 columns
                md: "160px 1fr 90px auto", // Desktop: 4 columns (original)
              },
              gap: { xs: 1.5, sm: 2 }, // Responsive gap
              alignItems: "center",
              mb: 2,
              p: { xs: 1.5, sm: 2 }, // Responsive padding
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              backgroundColor: "#fafafa",
            }}
          >
            {/* Platform Name */}
            <TextField
              label="Platform"
              placeholder="Facebook"
              value={item.platform}
              onChange={(e) =>
                handleSocialChange(index, "platform", e.target.value)
              }
              fullWidth
              sx={{
                gridColumn: {
                  xs: "span 1", // Mobile: full width
                  sm: "span 1", // Tablet: first column
                  md: "span 1", // Desktop: first column
                }
              }}
            />

            {/* URL */}
            <TextField
              fullWidth
              label="Profile URL"
              placeholder="https://facebook.com/yourpage"
              value={item.url}
              onChange={(e) =>
                handleSocialChange(index, "url", e.target.value)
              }
              error={Boolean(urlErrors[index])}
              helperText={urlErrors[index]}
              sx={{
                gridColumn: {
                  xs: "span 1", // Mobile: full width
                  sm: "span 1", // Tablet: second column
                  md: "span 1", // Desktop: second column
                }
              }}
            />

            {/* Logo Preview - Hidden on mobile, shown on tablet+ */}
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "1px solid #ddd",
                display: { xs: "none", sm: "flex" }, // Hidden on mobile
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                background: "#fff",
                justifySelf: { sm: "center", md: "auto" }, // Center on tablet
                gridColumn: {
                  sm: "span 1", // Tablet: third column
                  md: "span 1", // Desktop: third column
                }
              }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No Logo
                </Typography>
              )}
            </Box>

            {/* Actions - Hidden on mobile, shown on tablet+ */}
            <Box 
              display="flex" 
              gap={1}
              sx={{
                display: { xs: "none", sm: "flex" }, // Hidden on mobile
                gridColumn: {
                  sm: "span 1", // Tablet: fourth column
                  md: "span 1", // Desktop: fourth column
                },
                justifyContent: {
                  sm: "flex-start", // Tablet+: align left
                }
              }}
            >
              <Button
                variant="outlined"
                component="label"
                size="small"
                fullWidth={false}
              >
                {item.logo ? "Change" : "Upload"}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleSocialChange(index, "logo", e.target.files[0])
                  }
                />
              </Button>

              <IconButton
                color="error"
                onClick={() => removeSocial(index)}
                sx={{
                  ml: 1
                }}
              >
                ✕
              </IconButton>
            </Box>

            {/* Mobile View - Logo and Actions in a row (Only shown on mobile) */}
            <Box
              sx={{
                display: { xs: "flex", sm: "none" }, // Only show on mobile
                gridColumn: "span 1",
                gap: 2,
                alignItems: "center",
                mt: 1,
                pt: 1,
                borderTop: "1px solid #e0e0e0",
              }}
            >
              {/* Mobile Logo Preview */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid #ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  background: "#fff",
                  flexShrink: 0,
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary" fontSize="0.6rem">
                    No Logo
                  </Typography>
                )}
              </Box>

              {/* Mobile Upload Button */}
              <Button
                variant="outlined"
                component="label"
                size="small"
                sx={{ flex: 1 }}
              >
                {item.logo ? "Change Logo" : "Upload Logo"}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleSocialChange(index, "logo", e.target.files[0])
                  }
                />
              </Button>

              <IconButton
                color="error"
                onClick={() => removeSocial(index)}
                size="small"
              >
                ✕
              </IconButton>
            </Box>
          </Box>
        );
      })}

      <Button variant="outlined" onClick={addSocial} sx={{ mt: 2 }}>
        ➕ Add Social Link
      </Button>
    </CardContent>
  </Card>
</div>
</div>


        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => resetMutation.mutate()}
          >
            Reset Defaults
          </Button>
          <Button
            type="submit"
            // variant="contained"
            style={{ background: "var(--gradient-primary)", color: "black" }}
            // color="primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}





