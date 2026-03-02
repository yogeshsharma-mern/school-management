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
import Modal from "./Modal";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LocationMarker } from "../components/LocationMarker";
import { FlyToLocation } from "../components/FlyToLocation.js";
import FixMapResize from "./FixMapResize.js";
// import Select from "react-select";
import { Country, State, City } from "country-state-city";
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    // minHeight: "56px",
    height: "56px",
    borderColor: state.isFocused ? "#1976d2" : "#e5e7eb",
    boxShadow: state.isFocused
      ? "0 0 0 2px rgba(25, 118, 210, 0.2)"
      : "none",
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

  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),

  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    borderRadius: "8px",
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
  }),
};
// import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.example.com";


export default function SchoolSettings() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
const [academicYearFilter, setAcademicYearFilter] = useState(null);
  // console.log(
  //   "academicYearFilter",academicYearFilter
  // );
  const [formData, setFormData] = useState({
    name: "",
    section: ""
  });
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
  // console.log("schooldata", schoolData);
  const [locationData, setLocationData] = useState({
    latitude: "",
    longitude: "",
    radiusMeters: 1000,
    search: "",
  });
  const [urlErrors, setUrlErrors] = useState([]);
  const [aboutImagePreview, setAboutImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [cordinateModalOpen, setCordinateModalOpen] = useState(false);
  const [schoolId, setSchoolId] = useState(null);
  // console.log("schoolId", schoolId);
  const addMarksRow = () => {
    if (!classOptions.length) {
      toast.error("No class found. Please add the class first.");
      return;
    }

    setSchoolData(prev => ({
      ...prev,
      marks: [
        ...prev.marks,
        {
          className: "",
          halfYearlyMarks: "",
          finalYearMarks: "",
        }
      ]
    }));
  };
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

  // console.log("classoptions", classOptions);
  const selected = schoolData.marks.map(m => m.className);
  // console.log("selected", selected)
  // console.log("classoptions", classOptions);
  const availableOptions = classOptions.filter(
    opt => !selected.includes(opt.value)
  );

  // console.log("available ooptions", availableOptions);

  const { data: studentData, isLoading } = useQuery({
    queryKey: ["school-settings", academicYearFilter],
    queryFn: () => apiGet(apiPath.SchoolSettings, { currentSession: academicYearFilter }),
    enabled:academicYearFilter !==null,
    staleTime:0, // only fetch if id exists
     cacheTime: 0,
  });
  // console.log("first", studentData);
  const { data: cordinatesData, isLoading: cordiLoading } = useQuery({
    queryKey: ["school-coordinates"],
    queryFn: () => apiGet(`${apiPath.getCordinates}`)
  });
  const { data: academicSessions, isLoading: loading, error } = useQuery({
    queryKey: ['academicSessions'],
    queryFn: () => apiGet(apiPath.getAcademicSessions)
  });

  console.log("academicsessionyogesh",academicSessions);
  const currentSession = academicSessions?.results?.filter((session)=>session.status==='active');
  console.log("currentSession",currentSession);
  // console.log("academicSessions",academicSessions);
  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    return new Date(isoDate).toISOString().slice(0, 10);
  };
  const academicYearOptionss = academicSessions?.results?.map(session => ({
    value: session.academicSession,
    label: session.academicSession,   // what user sees
  }));
  const academicYearOptions = academicSessions?.results?.map(session => ({
    value: session,   // ✅ FULL OBJECT (critical)
    label: session.academicSession,
  }));

  // console.log("academicyearoptions", academicYearOptions);
  // console.log("cordinatesdata", cordinatesData);
  useEffect(() => {
    if (!cordinatesData?.results) return;

    const results = cordinatesData.results;

    // Check if coordinates exist and are valid
    if (results.location?.coordinates && Array.isArray(results.location.coordinates) && results.location.coordinates.length === 2) {
      const [lng, lat] = results.location.coordinates;

      // Validate that lat and lng are numbers
      if (!isNaN(lat) && !isNaN(lng)) {
        setLocationData(prev => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
          radiusMeters: results.radiusInMeters || 1000,
        }));
      }
    } else {
      // Set default coordinates if none exist (India gate coordinates as fallback)
      setLocationData(prev => ({
        ...prev,
        latitude: "28.6139",
        longitude: "77.2090",
        radiusMeters: 1000,
      }));
    }
  }, [cordinatesData]);
  useEffect(() => {
  if (!academicSessions?.results?.length) return;

  const active = academicSessions.results.find(
    (session) => session.status === "active"
  );

  // ✅ Only set if filter is null (first load only)
  if (active && academicYearFilter === null) {
    setAcademicYearFilter(active.academicSession);
  }
}, [academicSessions]);
  useEffect(() => {
    if (!studentData?.results) return;
    const s = studentData.results;
    // console.log("s", s);
    setSchoolId(s._id);
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
        currentSession: s.academicSession.currentSession || "",
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
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocationData(prev => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        }));

        toast.success("Location detected ✅");
      },
      (error) => {
        toast.error("Location access denied ❌");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };
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

  const calculateAcademicSession = (startDate, endDate) => {
    if (!startDate || !endDate) return "";

    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();

    if (isNaN(startYear) || isNaN(endYear)) return "";

    return `${startDate}-${endDate}`;
  };
  useEffect(() => {
    const { startDate, endDate, currentSession } = schoolData.academicSession;
    // console.log("third",schoolData.academicSession);

    if (!startDate || !endDate) return;

    const session = calculateAcademicSession(startDate, endDate);

    if (session !== schoolData.academicSession.currentSession) {
      handleChange("academicSession.currentSession", currentSession);
    }
  }, [
    schoolData.academicSession.startDate,
    schoolData.academicSession.endDate,
  ]);

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
  const countryOptions = Country.getAllCountries().map(country => ({
    value: country.isoCode,
    label: country.name,
  }));

  const stateOptions = schoolData.address.country
    ? State.getStatesOfCountry(schoolData.address.country).map(state => ({
      value: state.isoCode,
      label: state.name,
    }))
    : [];

  const cityOptions =
    schoolData.address.country && schoolData.address.state
      ? City.getCitiesOfState(
        schoolData.address.country,
        schoolData.address.state
      ).map(city => ({
        value: city.name,
        label: city.name,
      }))
      : [];
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
        ? apiPut(`${apiPath.updateSchoolSettings}/${schoolId}`, formData, config)
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
  const saveLocationMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId) throw new Error("SchoolId missing");

      // Validate coordinates
      const lat = Number(locationData.latitude);
      const lng = Number(locationData.longitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error("Invalid coordinates");
      }

      const payload = {
        latitude: lat,
        longitude: lng,
        radiusMeters: Number(locationData.radiusMeters),
      };

      // 🔹 Decide POST vs PUT
      if (!cordinatesData?.results) {
        return apiPost(apiPath.addSchoolLocation, {
          schoolId,
          ...payload,
        });
      } else {
        return apiPut(`${apiPath.updateSchoolLocation}/${schoolId}/location`, payload);
      }
    },
    onSuccess: () => {
      toast.success("Location saved successfully ✅");
      queryClient.invalidateQueries({ queryKey: ["school-coordinates"] });
      setCordinateModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save location ❌");
    },
  });
  const searchLocation = async () => {
    if (!locationData.search) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${locationData.search}`
    );

    const data = await res.json();

    if (!data.length) {
      toast.error("Location not found");
      return;
    }

    const { lat, lon } = data[0];

    setLocationData(prev => ({
      ...prev,
      latitude: Number(lat),
      longitude: Number(lon),
    }));
  };
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
  const createClassMutation = useMutation({
    mutationFn: (payload) =>
      apiPost(apiPath.createClassess, payload),

    onSuccess: (data) => {
      toast.success(data.message || "Class created successfully");

      queryClient.invalidateQueries(["classes"]);

      setIsModalOpen(false);
      setFormData({ name: "", section: "" });
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create class");
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
    // console.log("path", path);
    // console.log("value", value);
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
  const handleMarksChange = (index, field, value) => {
    setSchoolData(prev => ({
      ...prev,
      marks: prev.marks.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      )
    }));
  };
  const validateMarks = () => {
    if (!schoolData.marks.length) {
      toast.error("Please add at least one class marks");
      return false;
    }

    for (let mark of schoolData.marks) {
      if (!mark.className) {
        toast.error("Class is required");
        return false;
      }

      if (!mark.halfYearlyMarks) {
        toast.error("Half yearly marks required");
        return false;
      }

      if (!mark.finalYearMarks) {
        toast.error("Final yearly marks required");
        return false;
      }
    }

    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateMarks()) return;
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
    <>

      <Box className="p-6 w-[100vw] md:w-auto" >
        <Typography
          className="text-black font-bold tracking-wide"
          variant="h5"
          align="center"
          gutterBottom
        >
          🏫 School Settings
        </Typography>
        <div className="flex gap-3 items-center justify-end mb-3">
          <button onClick={() => setCordinateModalOpen(true)} className="bg-[image:var(--gradient-primary)] cursor-pointer py-2 px-3 rounded ">Add Cordinates</button>
          <select
            value={academicYearFilter}
            onChange={(e) => setAcademicYearFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
          >
            <option value="">All Academic Years</option>

            {academicYearOptionss?.map((year, i) => (
              <option key={i} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
        {!studentData?.results ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center">
            <Typography variant="h6" gutterBottom>
              No School Data Found
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Please select an academic year or create school settings.
            </Typography>
          </div>
        ) : (
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
                  {/* <Grid item xs={12} sm={6}>
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
                </Grid> */}
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
                  {/* <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    value={schoolData.address.city || ""}
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // allow only letters and spaces
                      handleChange("address.city", onlyLetters);
                    }}
                    fullWidth
                  />

                </Grid> */}
                  {/* <Grid item xs={12} sm={6}>
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

                </Grid> */}
                  <Grid item xs={12} sm={6}>
                    <Select
                      options={countryOptions}
                      styles={customSelectStyles}
                      value={
                        countryOptions.find(c => c.value === schoolData.address.country) || null
                      }
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                      onChange={(selected) =>
                        handleChange("address.country", selected?.value || "")
                      }
                      placeholder="Select Country"
                      isClearable
                    />

                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Select
                      options={stateOptions}
                      styles={customSelectStyles}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"

                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999, height: "23px" }) }}
                      value={
                        stateOptions.find(s => s.value === schoolData.address.state) || null
                      }
                      onChange={(selected) =>
                        handleChange("address.state", selected?.value || "")
                      }
                      placeholder={
                        schoolData.address.country ? "Select State" : "Select Country First"
                      }
                      isDisabled={!schoolData.address.country}
                      isClearable
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Select
                      options={cityOptions}
                      styles={customSelectStyles}
                      value={
                        cityOptions.find(c => c.value === schoolData.address.city) || null
                      }
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                      onChange={(selected) =>
                        handleChange("address.city", selected?.value || "")
                      }
                      placeholder={
                        schoolData.address.state ? "Select City" : "Select State First"
                      }
                      isDisabled={!schoolData.address.state}
                      isClearable
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
            <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4 }}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography variant="h6" fontWeight={600}>
                    📊 Class-wise Marks
                  </Typography>

                  <Box display="flex" gap={2}>
                    {/* Always show Add Class */}
                    <Button
                      variant="outlined"
                      onClick={() => setIsModalOpen(true)}
                      sx={{
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      + Add Class
                    </Button>

                    {/* Add Class Marks only if classes exist */}
                    {classOptions.length > 0 && (
                      <Button
                        variant="contained"
                        onClick={addMarksRow}
                        sx={{
                          borderRadius: 3,
                          textTransform: "none",
                          backgroundImage: "var(--gradient-primary)",
                          color: "#000",
                          fontWeight: 600,
                        }}
                      >
                        + Add Class Marks
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* ❌ NO CLASS FOUND MESSAGE */}
                {classOptions.length === 0 && (
                  <Typography color="error" mb={2}>
                    No class found. You have to add the class first.
                  </Typography>
                )}

                {/* MARKS LIST */}
                {schoolData.marks.map((item, index) => (
                  <Card key={index} sx={{ mb: 2, p: 2, borderRadius: 3 }}>
                    <Box display="flex" gap={2} flexWrap="wrap">

                      {/* Class Select */}
                      <Box sx={{ minWidth: 180 }}>
                        <Select
                          options={availableOptions}
                          value={classOptions.find(
                            (opt) => opt.value === item.className
                          )}
                          onChange={(option) =>
                            handleMarksChange(index, "className", option?.value || "")
                          }
                          placeholder="Select Class"
                          menuPortalTarget={document.body}
                          styles={{
                            ...customSelectStyles,
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 99999,   // 🔥 increase this
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 99999,   // 🔥 increase this
                            }),
                          }}
                        />
                      </Box>

                      {/* Half Yearly */}
                      <TextField
                        label="Half Yearly"
                        type="number"
                        value={item.halfYearlyMarks}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (Number(value) > 100) return;
                          handleMarksChange(index, "halfYearlyMarks", Number(value));
                        }}
                        sx={{ width: 150 }}
                      />

                      {/* Final Year */}
                      <TextField
                        label="Final Year"
                        type="number"
                        value={item.finalYearMarks}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (Number(value) > 100) return;
                          handleMarksChange(index, "finalYearMarks", Number(value));
                        }}
                        sx={{ width: 150 }}
                      />

                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() =>
                          setSchoolData(prev => ({
                            ...prev,
                            marks: prev.marks.filter((_, i) => i !== index)
                          }))
                        }
                      >
                        ✕
                      </Button>
                    </Box>
                  </Card>
                ))}
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
                  {/* <Grid item xs={12} sm={4}>
                  <TextField
                    type="date"
                    label="Start Date"
                    value={schoolData.academicSession.startDate || ""}
                    onChange={(e) => {
                      handleChange("academicSession.startDate", e.target.value);
                      // handleChange("academicSession.currentSession", "");
                    }}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{ height: 55 }}
                    required
                  />
                </Grid> */}

                  {/* End Date */}
                  {/* <Grid item xs={12} sm={4}>
                  <TextField
                    type="date"
                    label="End Date"
                    value={schoolData.academicSession.endDate || ""}
                    onChange={(e) => {
                      handleChange("academicSession.endDate", e.target.value);
                      // handleChange("academicSession.currentSession", "");
                    }}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{ height: 55 }}
                    required
                  />
                </Grid> */}
                  <Select
                    options={academicYearOptions}
                    styles={customSelectStyles}
                    placeholder="Select Academic Year"
                    menuPortalTarget={document.body}     // ✅ CRITICAL FIX
                    menuPosition="fixed"                 // ✅ prevents clipping
                    value={academicYearOptions?.find(opt => {
                      // const sessionValue = schoolData.academicSession.currentSession;

                      // if (typeof sessionValue !== "string" || sessionValue.length < 21)
                      //   return false;

                      // const start = sessionValue.substring(0, 10);
                      // const end = sessionValue.substring(11, 21);

                      // const optStart = formatDateForInput(opt.value.startDate);
                      // const optEnd = formatDateForInput(opt.value.endDate);

                      // return optStart === start && optEnd === end;
                      // console.log("opt",opt);
                      // console.log("schooldataopt",schoolData.academicSession.currentSession)

                      return opt?.value?.academicSession === schoolData?.academicSession?.currentSession
                    })}
                    onChange={(selected) => {
                      const session = selected.value;
                      // console.log("session6789",session);

                      const formattedStart = formatDateForInput(session.startDate);
                      const formattedEnd = formatDateForInput(session.endDate);

                      setSchoolData(prev => ({
                        ...prev,
                        academicSession: {
                          startDate: formattedStart,
                          endDate: formattedEnd,
                          currentSession: `${session?.academicSession}`, // ✅ FIXED
                        }
                      }));
                    }}
                  />
                  {/* Current Session */}
                  {/* <Grid item xs={12} sm={4}>
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
                </Grid> */}
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
        )}
      </Box>
      <Modal
        isOpen={cordinateModalOpen}
        onClose={() => setCordinateModalOpen(false)}
        title="Add School Coordinates"
      >
        <div className="space-y-5">
          {/* Header Decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-t-lg"></div>

          {/* Detect Current Location */}
          <button
            type="button"
            onClick={detectCurrentLocation}
            className="w-full bg-[image:var(--gradient-primary)] text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span className="text-lg">📍</span>
            <span>Use Current Location</span>
          </button>

          {/* Coordinates with yellow accents */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-700 ml-1">Coordinates</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Latitude"
                  value={locationData.latitude}
                  onChange={(e) =>
                    setLocationData(prev => ({ ...prev, latitude: e.target.value }))
                  }
                  className="w-full border-2 border-yellow-200 focus:border-yellow-400 rounded-xl px-4 py-3 outline-none transition-all duration-200 bg-yellow-50/30 focus:bg-white shadow-sm"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500">°</span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  placeholder="Longitude"
                  value={locationData.longitude}
                  onChange={(e) =>
                    setLocationData(prev => ({ ...prev, longitude: e.target.value }))
                  }
                  className="w-full border-2 border-yellow-200 focus:border-yellow-400 rounded-xl px-4 py-3 outline-none transition-all duration-200 bg-yellow-50/30 focus:bg-white shadow-sm"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500">°</span>
              </div>
            </div>
          </div>

          {/* Radius with yellow theme */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-700 ml-1">Radius (meters)</label>
            <div className="relative">
              <input
                type="number"
                placeholder="Enter radius in meters"
                value={locationData.radiusMeters}
                onChange={(e) =>
                  setLocationData(prev => ({ ...prev, radiusMeters: e.target.value }))
                }
                className="w-full border-2 border-yellow-200 focus:border-yellow-400 rounded-xl px-4 py-3 outline-none transition-all duration-200 bg-yellow-50/30 focus:bg-white shadow-sm"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500 font-medium">m</span>
            </div>
          </div>

          {/* Save Button with yellow gradient */}
          <button
            type="button"
            onClick={() => {
              if (saveLocationMutation.isPending) return;
              saveLocationMutation.mutate();
            }}
            disabled={saveLocationMutation.isPending}
            className="w-full bg-[image:var(--gradient-primary)]  text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4"
          >
            {saveLocationMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving Location...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>✨</span>
                <span>Save Location</span>
                <span>✨</span>
              </div>
            )}
          </button>

          {/* Decorative yellow elements */}
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse delay-75"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse delay-150"></div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isModalOpen}
        title="Add Class"
        onClose={() => {
          setIsModalOpen(false);
          setFormErrors({});
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();

            const newErrors = {};
            const validClasses = [
              "Prep", "1st", "2nd", "3rd", "4th", "5th", "6th",
              "7th", "8th", "9th", "10th", "11th", "12th",
            ];

            // Class Name validation
            if (!formData.name.trim()) {
              newErrors.name = "Class name is required";
            } else if (!validClasses.includes(formData.name.trim())) {
              newErrors.name =
                "Invalid class name. Must be Prep or 1st to 12th";
            }

            // Section validation
            if (!formData.section.trim()) {
              newErrors.section = "Section is required";
            } else if (!/^[A-D]$/.test(formData.section.trim())) {
              newErrors.section =
                "Section must be A, B, C, or D";
            }

            setFormErrors(newErrors);

            if (Object.keys(newErrors).length > 0) {
              return;
            }

            createClassMutation.mutate({
              name: formData.name.trim(),
              section: formData.section.trim(),
            });
          }}
          className="space-y-4"
        >
          <TextField
            label="Class Name"
            fullWidth
            value={formData.name}
            error={!!formErrors.name}
            helperText={formErrors.name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
          />

          <TextField
            label="Section"
            fullWidth
            sx={{ mt: 2 }}
            value={formData.section}
            error={!!formErrors.section}
            helperText={formErrors.section}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                section: e.target.value.toUpperCase(),
              }))
            }
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={createClassMutation.isPending}
            sx={{
              mt: 3,
              backgroundImage: "var(--gradient-primary)",
              color: "black",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            {createClassMutation.isPending
              ? "Saving..."
              : "Add Class"}
          </Button>
        </form>
      </Modal>
    </>
  );
}





