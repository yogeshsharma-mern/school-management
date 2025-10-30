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
} from "@mui/material";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PhoneInput from "react-phone-input-2";
import Select from "react-select";
import ToggleButton from "../components/ToggleButton";
import "react-phone-input-2/lib/material.css";
import { apiPut, apiGet, apiPatch, apiDelete, apiPost } from "../api/apiFetch";
import apiPath from "../api/apiPath";
import { useEffect } from "react";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.example.com";

const stateOptions = [
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Delhi", label: "Delhi" },
  { value: "Karnataka", label: "Karnataka" },
];

const countryOptions = [
  { value: "India", label: "India" },
  { value: "USA", label: "USA" },
  { value: "UK", label: "UK" },
];

export default function SchoolSettings() {
  const queryClient = useQueryClient();
  // const [schoolData, setSchoolData] = useState({
  //   schoolName: "",
  //   status: "inactive",
  //   address: { street: "", city: "", state: "", zip: "", country: "" },
  //   contact: { phone: "", email: "", website: "" },
  //   schoolTiming: { startTime: "09:00", endTime: "15:00" },
  //   periods: {
  //     totalPeriods: "",
  //     periodDuration: "",
  //     breakDuration: "",
  //     lunchBreak: { isEnabled: false, time: "", duration: "" },
  //   },
  //   academicSession: { startDate: "", endDate: "", currentSession: "" },
  //   schoolLogo: null,
  // });
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
    },
    faqs: [], // array of { question, answer }
    banner: [], // array of URLs
    gallery: [], // array of URLs
    socialUrl: [], // array of URLs
    schoolLogo: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    return isoDate.split("T")[0]; // "2025-10-13"
  };

  // GET existing settings
  // const { data:schData, isLoading } = useQuery({
  //   queryKey: ["school-settings"],
  //   queryFn: async () => {
  //     const res = await apiGet(apiPath.SchoolSettings);
  //     return res.data.results || {};
  //   },
  //   onSuccess: (data) => {
  //     // console.log("data",data)
  //     setSchoolData(data);
  //     if (data.schoolLogo) setLogoPreview(data.schoolLogo);
  //   },
  // });
  // console.log("schdata",schData);
  const { data: studentData, isLoading } = useQuery({
    queryKey: ["school-settings"],
    queryFn: () => apiGet(apiPath.SchoolSettings) // only fetch if id exists
  });
  console.log("first", studentData);
  // Update state whenever query data changes
  // useEffect(() => {
  //   if (!studentData?.results) return;

  //   const s = studentData.results;

  //   const formatDateForInput = (isoDate) => isoDate ? isoDate.split("T")[0] : "";

  //   setSchoolData({
  //     schoolName: s.schoolName || "",
  //     status: s.status || "inactive",
  //     address: {
  //       street: s.address?.street || "",
  //       city: s.address?.city || "",
  //       state: s.address?.state || "",
  //       zip: s.address?.zip || "",
  //       country: s.address?.country || "",
  //     },
  //     contact: {
  //       phone: s.contact?.phone || "",
  //       email: s.contact?.email || "",
  //       website: s.contact?.website || "",
  //     },
  //     schoolTiming: {
  //       startTime: s.schoolTiming?.startTime || "09:00",
  //       endTime: s.schoolTiming?.endTime || "15:00",
  //     },
  //     periods: {
  //       totalPeriods: s.periods?.totalPeriods || "",
  //       periodDuration: s.periods?.periodDuration || "",
  //       breakDuration: s.periods?.breakDuration || "",
  //       lunchBreak: {
  //         isEnabled: s.periods?.lunchBreak?.isEnabled || false,
  //         time: s.periods?.lunchBreak?.time || "",
  //         duration: s.periods?.lunchBreak?.duration || "",
  //       },
  //     },
  //     academicSession: {
  //       startDate: formatDateForInput(s.academicSession?.startDate),
  //       endDate: formatDateForInput(s.academicSession?.endDate),
  //       currentSession: s.academicSession?.currentSession || "",
  //     },
  //     schoolLogo: null, // keep null, preview handled separately
  //   });

  //   if (s.schoolLogo) setLogoPreview(`${s.schoolLogo}`);

  // }, [studentData]);
  useEffect(() => {
    if (!studentData?.results) return;
    const s = studentData.results;

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
      about: {
        title: s.about?.title || "",
        keyStats: s.about?.keyStats || [],
      },
      faqs: s.faqs || [],
      banner: s.banner || [],
      gallery: s.gallery || [],
      socialUrl: s.socialUrl || [],
      schoolLogo: null,
    });

    if (s.schoolLogo) setLogoPreview(s.schoolLogo);
  }, [studentData]);


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
  });


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
    setSchoolData((prev) => {
      const newData = { ...prev };
      const keys = path.split(".");
      let temp = newData;
      for (let i = 0; i < keys.length - 1; i++) temp = temp[keys[i]];

      // Validation for school timing (08:00 - 16:00)
      if (keys[0] === "schoolTiming") {
        const time = value;
        const [h, m] = time.split(":").map(Number);
        if (h < 8 || h > 16) return prev; // ignore invalid
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
    formData.append("about", JSON.stringify(schoolData.about));
    formData.append("faqs", JSON.stringify(schoolData.faqs));
    formData.append("socialUrl", JSON.stringify(schoolData.socialUrl));

    // ✅ Files
    (schoolData.banner || []).forEach((file) => {
      if (file instanceof File) {
        formData.append("banner", file);
      }
    });

    (schoolData.gallery || []).forEach((file) => {
      if (file instanceof File) {
        formData.append("gallery", file);
      }
    });

    if (schoolData.schoolLogo instanceof File) {
      formData.append("schoolLogo", schoolData.schoolLogo);
    }

    // ✅ Submit using mutation
    mutation.mutate(formData);
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
    <Box className="p-6" >
      <Typography
        className="text-black  font-bold tracking-wide"
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
                <TextField
                  label="School Name"
                  value={schoolData.schoolName || ""}
                  onChange={(e) => handleChange("schoolName", e.target.value)}
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
                  onChange={(e) => handleChange("contact.website", e.target.value)}
                  fullWidth
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
                  onChange={(e) => handleChange("address.street", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  value={schoolData.address.city || ""}
                  onChange={(e) => handleChange("address.city", e.target.value)}
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
                  onChange={(e) => handleChange("address.zip", e.target.value)}
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
                  value={schoolData.schoolTiming.startTime || "09:00"}
                  onChange={(e) =>
                    handleChange("schoolTiming.startTime", e.target.value)
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="time"
                  label="End Time"
                  value={schoolData.schoolTiming.endTime || "15:00"}
                  onChange={(e) =>
                    handleChange("schoolTiming.endTime", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleChange("periods.totalPeriods", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  type="number"
                  label="Period Duration (min)"
                  value={schoolData.periods.periodDuration || ""}
                  onChange={(e) =>
                    handleChange("periods.periodDuration", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  type="number"
                  label="Break Duration (min)"
                  value={schoolData.periods.breakDuration || ""}
                  onChange={(e) =>
                    handleChange("periods.breakDuration", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={schoolData.periods.lunchBreak.isEnabled || false}
                      onChange={(e) =>
                        handleChange(
                          "periods.lunchBreak.isEnabled",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Enable Lunch Break"
                />
              </Grid>
              {schoolData.periods.lunchBreak.isEnabled && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="time"
                      label="Lunch Time"
                      value={schoolData.periods.lunchBreak.time || ""}
                      onChange={(e) =>
                        handleChange("periods.lunchBreak.time", e.target.value)
                      }
                      fullWidth
                      InputLabelProps={{ shrink: true }}
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
            <Button variant="contained" component="label">
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
              onChange={(e) => handleChange("tollFree", e.target.value)}
            />
          </CardContent>
        </Card>

        {/* About Section */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🏫 About School
            </Typography>
            <TextField
              fullWidth
              label="Title"
              value={schoolData.about?.title || ""}
              onChange={(e) => handleChange("about.title", e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description / Key Info"
              value={(schoolData.about?.keyStats || []).join("\n")}
              onChange={(e) =>
                handleChange("about.keyStats", e.target.value.split("\n"))
              }
              helperText="Each line will be treated as a separate key point."
            />
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
              sx={{ backgroundColor: "#1976d2", color: "#fff", mb: 2 }}
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
                      onClick={() =>
                        handleChange(
                          "banner",
                          schoolData.banner.filter((_, i) => i !== idx)
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
        </Card>


        {/* Gallery Images */}
        {/* Gallery Images */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🖼️ Gallery Images
            </Typography>

            <Button
              variant="contained"
              component="label"
              sx={{ backgroundColor: "#1976d2", color: "#fff", mb: 2 }}
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
        </Card>


        {/* Social URLs */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🌐 Social Media Links
            </Typography>
            {(schoolData.socialUrl || []).map((url, index) => (
              <Box key={index} display="flex" gap={2} alignItems="center" mb={1}>
                <TextField
                  fullWidth
                  label={`Social URL ${index + 1}`}
                  value={url}
                  onChange={(e) =>
                    handleChange(
                      "socialUrl",
                      schoolData.socialUrl.map((u, i) =>
                        i === index ? e.target.value : u
                      )
                    )
                  }
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() =>
                    handleChange(
                      "socialUrl",
                      schoolData.socialUrl.filter((_, i) => i !== index)
                    )
                  }
                >
                  ✕
                </Button>
              </Box>
            ))}

            <Button
              variant="outlined"
              onClick={() =>
                handleChange("socialUrl", [...(schoolData.socialUrl || []), ""])
              }
            >
              ➕ Add Link
            </Button>
          </CardContent>
        </Card>

        {/* Buttons */}
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
            variant="contained"
            color="primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
