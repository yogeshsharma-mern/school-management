
import React, { useState } from "react";
import { useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  TextField,
  Typography,
  Stack,
  Chip,
  IconButton,
} from "@mui/material";
import { Add, Delete, Save } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";

import apiPath from "../api/apiPath";
import { apiGet, apiPost, apiPut,apiDelete } from "../api/apiFetch";

/* ================= HELPERS ================= */

const createEmptyCounter = () => ({
  label: "",
  value: "",
});

const emptyForm = {
  story: { title: "", description: "" },
  vision: { title: "", description: "" },
  mission: { title: "", description: "" },
  counters: [createEmptyCounter()],
};

/* ================= COMPONENT ================= */

const AdminAboutUs = () => {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]); // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // string[]
  const [deletingImageId, setDeletingImageId] = useState(null);
  console.log("imagePreviews",imagePreviews);

  /* ================= FETCH ================= */

const { data, isPending } = useQuery({
  queryKey: ["about-us"],
  queryFn: () => apiGet(apiPath.GetAboutSection),
});
const validateForm = () => {
  const newErrors = {};

  if (!form.story.title.trim())
    newErrors.storyTitle = "Story title is required";

  if (!form.story.description.trim())
    newErrors.storyDescription = "Story description is required";

  if (!form.vision.title.trim())
    newErrors.visionTitle = "Vision title is required";

  if (!form.vision.description.trim())
    newErrors.visionDescription = "Vision description is required";

  if (!form.mission.title.trim())
    newErrors.missionTitle = "Mission title is required";

  if (!form.mission.description.trim())
    newErrors.missionDescription = "Mission description is required";

  form.counters.forEach((c, i) => {
    if (!c.label.trim())
      newErrors[`counterLabel${i}`] = "Label is required";

    if (!c.value)
      newErrors[`counterValue${i}`] = "Value is required";
    // else if (isNaN(c.value))
    //   newErrors[`counterValue${i}`] = "Value must be a number";
  });

  if (!aboutId && imagePreviews.length === 0)
    newErrors.images = "At least one image is required";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
console.log("data",data)
useEffect(() => {
  if (!data?.results) return;

  setForm({
    story: {
      title: data.results.story?.title || "",
      description: data.results.story?.description || "",
    },
    vision: {
      title: data.results.vision?.title || "",
      description: data.results.vision?.description || "",
    },
    mission: {
      title: data.results.mission?.title || "",
      description: data.results.mission?.description || "",
    },
    counters: data.results.counters?.length
      ? data.results.counters.map((c) => ({ ...c }))
      : [createEmptyCounter()],
  });

  // ✅ ALWAYS SET IMAGE PREVIEWS
  setImagePreviews(
    (data.results.story?.images || []).map((img) => ({
      _id: img._id,
      url: img.imageUrl,
    }))
  );

}, [data]);


const aboutId = data?.results?._id || null;


  /* ================= HANDLERS ================= */

const handleChange = (section, field, value) => {
  setForm((prev) => ({
    ...prev,
    [section]: { ...prev[section], [field]: value },
  }));

  // 🔥 Remove error for that specific field
  const errorKey =
    section === "story"
      ? field === "title"
        ? "storyTitle"
        : "storyDescription"
      : `${section}${field.charAt(0).toUpperCase() + field.slice(1)}`;

  setErrors((prev) => {
    const updated = { ...prev };
    delete updated[errorKey];
    return updated;
  });
};

const handleCounterChange = (index, field, value) => {
  setForm((prev) => ({
    ...prev,
    counters: prev.counters.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    ),
  }));

  const errorKey =
    field === "label"
      ? `counterLabel${index}`
      : `counterValue${index}`;

  setErrors((prev) => {
    const updated = { ...prev };
    delete updated[errorKey];
    return updated;
  });
};

  const addCounter = () => {
    setForm((prev) => ({
      ...prev,
      counters: [...prev.counters, createEmptyCounter()],
    }));
  };

  const removeCounter = (index) => {
    setForm((prev) => ({
      ...prev,
      counters: prev.counters.filter((_, i) => i !== index),
    }));
  };

  /* ================= FORMDATA ================= */

  const buildFormData = () => {
    const fd = new FormData();

    fd.append("story[title]", form.story.title);
    fd.append("story[description]", form.story.description);

    fd.append("vision[title]", form.vision.title);
    fd.append("vision[description]", form.vision.description);

    fd.append("mission[title]", form.mission.title);
    fd.append("mission[description]", form.mission.description);

    form.counters.forEach((c, i) => {
      fd.append(`counters[${i}][label]`, c.label);
      fd.append(`counters[${i}][value]`, c.value);
    });

    images.forEach((img) => fd.append("images", img));

    return fd;
  };

  /* ================= SAVE ================= */
const deleteImageMutation = useMutation({
  mutationFn: (imageId) =>
    apiDelete(apiPath.deleteAboutUsImages, {
      imageIds: [imageId],
    }),

  onMutate: (imageId) => {
    setDeletingImageId(imageId);   // 🔥 start loader
  },

  onSuccess: () => {
    toast.success("Image deleted successfully");
    queryClient.invalidateQueries(["about-us"]);
  },

  onError: (error) => {
    toast.error(
      error?.response?.data?.message || "Failed to delete image"
    );
  },

  onSettled: () => {
    setDeletingImageId(null);   // 🔥 stop loader
  },
});
const saveMutation = useMutation({
  mutationFn: async () => {
    const fd = buildFormData();

    if (aboutId) {
      console.log("UPDATE API CALLED");
      return apiPut(apiPath.updateAboutSection,fd);
    } else {
      console.log("CREATE API CALLED");
      return apiPost(apiPath.createAboutUsSection, fd);
    }
  },
  onSuccess: () => {
    toast.success("About Us saved successfully");
    queryClient.invalidateQueries(["about-us"]);
    setImages([]);
  },
  onError: (err) => {
    console.error(err);
    toast.error("Save failed");
  },
});
const resetMutation = useMutation({
  mutationFn: async () => {
    if (!aboutId) {
      throw new Error("No About data to reset");
    }
    return apiDelete(apiPath.aboutinfoDelete);
  },
  onSuccess: () => {
    toast.success("About Us reset successfully");

    // reset UI
    setForm(emptyForm);
    setImages([]);
    setImagePreviews([]);

    // refetch backend state
    queryClient.invalidateQueries(["about-us"]);
  },
  onError: (err) => {
    console.error(err);
    toast.error("Reset failed");
  },
});


  /* ================= UI ================= */

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Toaster />

      {/* HEADER */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800}>
          About Us
        </Typography>
        <Typography color="text.secondary">
          Manage story, vision, mission & highlights
        </Typography>
      </Box>

      {/* CORE INFO */}
      <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4 }}>
        <CardHeader title="Core Information" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Story Title"
                 error={!!errors.storyTitle}
                fullWidth
                value={form.story.title}
                onChange={(e) =>
                  handleChange("story", "title", e.target.value)
                }
                sx={{ mb: 2 }}
              />
              <TextField
  label="Story Description"
  multiline
  rows={4}
  fullWidth
  value={form.story.description}
  error={!!errors.storyDescription}
  helperText={errors.storyDescription}
  onChange={(e) =>
    handleChange("story", "description", e.target.value)
  }
/>
            </Grid>

            {["vision", "mission"].map((key) => (
              <Grid item xs={12} md={6} key={key}>
               <TextField
  label={`${key.charAt(0).toUpperCase() + key.slice(1)} Title`}
  fullWidth
  value={form[key].title}
  error={!!errors[`${key}Title`]}
  helperText={errors[`${key}Title`]}
  onChange={(e) =>
    handleChange(key, "title", e.target.value)
  }
  sx={{ mb: 2 }}
/>

<TextField
  label={`${key.charAt(0).toUpperCase() + key.slice(1)} Description`}
  multiline
  rows={4}
  fullWidth
  value={form[key].description}
  error={!!errors[`${key}Description`]}
  helperText={errors[`${key}Description`]}
  onChange={(e) =>
    handleChange(key, "description", e.target.value)
  }
/>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* COUNTERS */}
      <Card sx={{ mb: 4, borderRadius: 4 }}>
        <CardHeader
          title="Key Highlights"
          action={
            <Button startIcon={<Add />} onClick={addCounter}>
              Add Counter
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            {form.counters.map((c, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Card sx={{ p: 3, borderRadius: 3 }}>
                  <IconButton
                    size="small"
                    color="error"
                    sx={{ float: "right" }}
                    onClick={() => removeCounter(i)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>

                 <TextField
  label="Label"
  fullWidth
  value={c.label}
  error={!!errors[`counterLabel${i}`]}
  helperText={errors[`counterLabel${i}`]}
  onChange={(e) =>
    handleCounterChange(i, "label", e.target.value)
  }
  sx={{ mb: 2 }}
/>

<TextField
  label="Value"
  fullWidth
  value={c.value}
  error={!!errors[`counterValue${i}`]}
  helperText={errors[`counterValue${i}`]}
  onChange={(e) =>
    handleCounterChange(i, "value", e.target.value)
  }
/>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* IMAGES */}
      <Card sx={{ mb: 4, borderRadius: 4 }}>
        <CardHeader title="About Images" />
        <CardContent>
          <Button component="label" startIcon={<Add />}>
            Upload Images
            <input
              hidden
              type="file"
              multiple
              accept="image/*"
             onChange={(e) => {
  const files = Array.from(e.target.files);

  setImages((prev) => [...prev, ...files]);
  setImagePreviews((prev) => [
    ...prev,
    ...files.map((f) => URL.createObjectURL(f)),
  ]);

  // 🔥 remove image error
  setErrors((prev) => {
    const updated = { ...prev };
    delete updated.images;
    return updated;
  });
}}
            />
          </Button>
          {errors.images && (
  <Typography color="error" variant="body2" mt={1}>
    {errors.images}
  </Typography>
)}

          {imagePreviews.length > 0 && (
            <Grid container spacing={2} mt={2}>
             {imagePreviews.map((src, i) => (
  <Grid item xs={6} sm={3} key={i}>
    <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden" }}>
      
    <img
  src={src.url || src}
  alt="preview"
  style={{
    width: "100%",
    height: 140,
    objectFit: "cover",
    opacity:
      deletingImageId === src?._id ? 0.5 : 1, // fade effect
  }}
/>

      {aboutId && (
        <IconButton
          size="small"
          color="error"
          sx={{
            position: "absolute",
            top: 5,
            right: 5,
            backgroundColor: "#fff",
          }}
          onClick={() => {
            if (src?._id) {
              deleteImageMutation.mutate(src._id);
            } else {
              setImagePreviews((prev) =>
                prev.filter((_, index) => index !== i)
              );
              setImages((prev) =>
                prev.filter((_, index) => index !== i)
              );
            }
          }}
        >
          <Delete fontSize="small" />
        </IconButton>
      )}
    </Box>
  </Grid>
))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* SAVE */}
      {/* <Box textAlign="right">
        <Button
          size="large"
          startIcon={<Save />}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            backgroundImage: "var(--gradient-primary)",
            color: "#000",
            fontWeight: 700,
          }}
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isLoading}
        >
          Save About Us
        </Button>

      </Box> */}
      <Box textAlign="right" display="flex" justifyContent="flex-end" gap={2}>
  {aboutId && (
    <Button
      size="large"
      color="error"
      variant="outlined"
      startIcon={<Delete />}
      onClick={() => {
        if (window.confirm("Are you sure you want to reset About Us?")) {
          resetMutation.mutate();
        }
      }}
      disabled={resetMutation.isPending}
    >
      Reset
    </Button>
  )}

  <Button
    size="large"
    startIcon={<Save />}
    sx={{
      px: 4,
      py: 1.5,
      borderRadius: 3,
      backgroundImage: "var(--gradient-primary)",
      color: "#000",
      fontWeight: 700,
    }}
onClick={() => {
  if (!validateForm()) return;
  saveMutation.mutate();
}}
    disabled={saveMutation.isPending || isPending}
  >
    Save About Us
  </Button>
</Box>

    </Container>
  );
};

export default AdminAboutUs;
// import React, { useState } from "react";
// import { useEffect } from "react";
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Container,
//   Grid,
//   TextField,
//   Typography,
//   IconButton,
//   Paper,
//   Avatar,
//   alpha,
//   useTheme,
//   Stack,
//   LinearProgress,
//   Chip,
// } from "@mui/material";
// import { 
//   Add, 
//   Delete, 
//   Save,
//   Image as ImageIcon,
//   BusinessCenter,
//   Visibility,
//   Flag,
//   Timeline,
//   CloudUpload,
//   Close,
//   InsertPhoto,
//   Collections,
// } from "@mui/icons-material";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { Toaster, toast } from "react-hot-toast";

// import apiPath from "../api/apiPath";
// import { apiGet, apiPost, apiPut, apiDelete } from "../api/apiFetch";

// /* ================= HELPERS ================= */

// const createEmptyCounter = () => ({
//   label: "",
//   value: "",
// });

// const emptyForm = {
//   story: { title: "", description: "" },
//   vision: { title: "", description: "" },
//   mission: { title: "", description: "" },
//   counters: [createEmptyCounter()],
// };

// /* ================= MAIN COMPONENT ================= */

// const AdminAboutUs = () => {
//   const theme = useTheme();
//   const queryClient = useQueryClient();

//   const [form, setForm] = useState(emptyForm);
//   const [images, setImages] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [uploadProgress, setUploadProgress] = useState({});

//   // Professional yellow theme
//   const yellow = {
//     50: '#fefce8',
//     100: '#fef9c3',
//     200: '#fef08a',
//     300: '#fde047',
//     400: '#facc15',
//     500: '#eab308', // Sophisticated yellow
//     600: '#ca8a04',
//     700: '#a16207',
//     800: '#854d0e',
//     900: '#713f12',
//   };

//   /* ================= FETCH ================= */

//   const { data, isPending } = useQuery({
//     queryKey: ["about-us"],
//     queryFn: () => apiGet(apiPath.GetAboutSection),
//   });

//   useEffect(() => {
//     if (!data?.results) return;

//     setForm({
//       story: {
//         title: data.results.story?.title || "",
//         description: data.results.story?.description || "",
//       },
//       vision: {
//         title: data.results.vision?.title || "",
//         description: data.results.vision?.description || "",
//       },
//       mission: {
//         title: data.results.mission?.title || "",
//         description: data.results.mission?.description || "",
//       },
//       counters: data.results.counters?.length
//         ? data.results.counters.map((c) => ({ ...c }))
//         : [createEmptyCounter()],
//     });

//     if (data.results.story?.images?.length) {
//       setImagePreviews(data.results.story.images);
//     }
//   }, [data]);

//   const aboutId = data?.results?._id || null;

//   /* ================= HANDLERS ================= */

//   const handleChange = (section, field, value) => {
//     setForm((prev) => ({
//       ...prev,
//       [section]: { ...prev[section], [field]: value },
//     }));
//   };

//   const handleCounterChange = (index, field, value) => {
//     setForm((prev) => ({
//       ...prev,
//       counters: prev.counters.map((c, i) =>
//         i === index ? { ...c, [field]: value } : c
//       ),
//     }));
//   };

//   const addCounter = () => {
//     setForm((prev) => ({
//       ...prev,
//       counters: [...prev.counters, createEmptyCounter()],
//     }));
//   };

//   const removeCounter = (index) => {
//     setForm((prev) => ({
//       ...prev,
//       counters: prev.counters.filter((_, i) => i !== index),
//     }));
//   };

//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files);
//     const newImages = [...images, ...files];
//     const newPreviews = [
//       ...imagePreviews,
//       ...files.map((f) => URL.createObjectURL(f)),
//     ];
    
//     // Simulate upload progress for demo
//     files.forEach((file, index) => {
//       const fileId = Date.now() + index;
//       setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
//       // Simulate progress
//       const interval = setInterval(() => {
//         setUploadProgress(prev => {
//           const currentProgress = prev[fileId] || 0;
//           if (currentProgress >= 100) {
//             clearInterval(interval);
//             return prev;
//           }
//           return { ...prev, [fileId]: currentProgress + 10 };
//         });
//       }, 100);
//     });
    
//     setImages(newImages);
//     setImagePreviews(newPreviews);
//     toast.success(`${files.length} image(s) added`);
//   };

//   const removeImage = (index) => {
//     setImagePreviews((prev) => prev.filter((_, i) => i !== index));
//     setImages((prev) => prev.filter((_, i) => i !== index));
//     toast.success("Image removed");
//   };

//   /* ================= FORMDATA ================= */

//   const buildFormData = () => {
//     const fd = new FormData();

//     fd.append("story[title]", form.story.title);
//     fd.append("story[description]", form.story.description);

//     fd.append("vision[title]", form.vision.title);
//     fd.append("vision[description]", form.vision.description);

//     fd.append("mission[title]", form.mission.title);
//     fd.append("mission[description]", form.mission.description);

//     form.counters.forEach((c, i) => {
//       fd.append(`counters[${i}][label]`, c.label);
//       fd.append(`counters[${i}][value]`, c.value);
//     });

//     images.forEach((img) => fd.append("images", img));

//     return fd;
//   };

//   /* ================= SAVE ================= */

//   const saveMutation = useMutation({
//     mutationFn: async () => {
//       const fd = buildFormData();
//       return aboutId 
//         ? apiPut(apiPath.updateAboutSection, fd)
//         : apiPost(apiPath.createAboutUsSection, fd);
//     },
//     onSuccess: () => {
//       toast.success("Changes saved successfully");
//       queryClient.invalidateQueries(["about-us"]);
//       setImages([]);
//     },
//     onError: () => {
//       toast.error("Failed to save changes");
//     },
//   });

//   const resetMutation = useMutation({
//     mutationFn: () => apiDelete(apiPath.aboutinfoDelete),
//     onSuccess: () => {
//       toast.success("Reset successful");
//       setForm(emptyForm);
//       setImages([]);
//       setImagePreviews([]);
//       queryClient.invalidateQueries(["about-us"]);
//     },
//     onError: () => {
//       toast.error("Reset failed");
//     },
//   });

//   /* ================= UI ================= */

//   const SectionCard = ({ title, icon: Icon, children, action }) => (
//     <Card 
//       sx={{ 
//         mb: 3, 
//         borderRadius: 2,
//         border: '1px solid',
//         borderColor: alpha(yellow[200], 0.5),
//         boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
//         overflow: 'hidden',
//       }}
//     >
//       <Box 
//         sx={{ 
//           px: 3, 
//           py: 2, 
//           bgcolor: alpha(yellow[50], 0.7),
//           borderBottom: '1px solid',
//           borderColor: alpha(yellow[200], 0.5),
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//         }}
//       >
//         <Stack direction="row" spacing={1.5} alignItems="center">
//           <Avatar 
//             sx={{ 
//               bgcolor: yellow[500], 
//               width: 36, 
//               height: 36,
//               color: '#000',
//             }}
//           >
//             <Icon sx={{ fontSize: 20 }} />
//           </Avatar>
//           <Typography variant="subtitle1" fontWeight={600}>
//             {title}
//           </Typography>
//         </Stack>
//         {action}
//       </Box>
//       <CardContent sx={{ p: 3 }}>
//         {children}
//       </CardContent>
//     </Card>
//   );

//   // Professional Image Upload Component
//   const ImageUploadSection = () => (
//     <Box>
//       {/* Modern Upload Area */}
//       <Paper
//         variant="outlined"
//         sx={{
//           border: `2px dashed ${alpha(yellow[400], 0.5)}`,
//           borderRadius: 2,
//           bgcolor: alpha(yellow[50], 0.5),
//           transition: 'all 0.2s ease',
//           '&:hover': {
//             borderColor: yellow[500],
//             bgcolor: alpha(yellow[100], 0.5),
//           },
//         }}
//       >
//         <Box
//           component="label"
//           sx={{
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             py: 4,
//             px: 2,
//             cursor: 'pointer',
//           }}
//         >
//           <input
//             hidden
//             type="file"
//             multiple
//             accept="image/*"
//             onChange={handleImageUpload}
//           />
          
//           <Box
//             sx={{
//               width: 64,
//               height: 64,
//               borderRadius: '50%',
//               bgcolor: alpha(yellow[500], 0.1),
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               mb: 2,
//             }}
//           >
//             <CloudUpload sx={{ fontSize: 32, color: yellow[600] }} />
//           </Box>
          
//           <Typography variant="h6" fontWeight={600} color={yellow[800]} gutterBottom>
//             Upload Images
//           </Typography>
          
//           <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
//             Drag and drop or click to browse
//           </Typography>
          
//           <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
//             Supported formats: JPG, PNG, GIF (Max 10MB each)
//           </Typography>

//           <Button
//             variant="outlined"
//             size="small"
//             startIcon={<Collections />}
//             sx={{
//               mt: 2,
//               borderColor: yellow[400],
//               color: yellow[700],
//               '&:hover': {
//                 borderColor: yellow[600],
//                 bgcolor: alpha(yellow[500], 0.04),
//               },
//             }}
//           >
//             Choose Files
//           </Button>
//         </Box>
//       </Paper>

//       {/* Image Gallery Grid */}
//       {imagePreviews.length > 0 && (
//         <Box sx={{ mt: 3 }}>
//           <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
//             <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
//               Gallery ({imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''})
//             </Typography>
//             <Button
//               size="small"
//               color="error"
//               onClick={() => {
//                 setImagePreviews([]);
//                 setImages([]);
//                 toast.success('All images removed');
//               }}
//               sx={{ textTransform: 'none' }}
//             >
//               Clear all
//             </Button>
//           </Stack>

//           <Grid container spacing={2}>
//             {imagePreviews.map((src, index) => (
//               <Grid item xs={6} sm={4} md={3} key={index}>
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     position: 'relative',
//                     borderRadius: 2,
//                     overflow: 'hidden',
//                     border: '1px solid',
//                     borderColor: alpha(yellow[300], 0.5),
//                     transition: 'transform 0.2s ease',
//                     '&:hover': {
//                       transform: 'translateY(-2px)',
//                       boxShadow: `0 8px 16px ${alpha(yellow[500], 0.2)}`,
//                       '& .image-overlay': {
//                         opacity: 1,
//                       },
//                     },
//                   }}
//                 >
//                                   <Box
//                     sx={{
//                       position: 'relative',
//                       paddingTop: '100%', // 1:1 Aspect ratio
//                     }}
//                   >
//                     <img
//                       src={src}
//                       alt={`Gallery ${index + 1}`}
//                       style={{
//                         position: 'absolute',
//                         top: 0,
//                         left: 0,
//                         width: '100%',
//                         height: '100%',
//                         objectFit: 'cover',
//                       }}
//                     />
                    
//                     {/* Hover Overlay */}
//                     <Box
//                       className="image-overlay"
//                       sx={{
//                         position: 'absolute',
//                         top: 0,
//                         left: 0,
//                         right: 0,
//                         bottom: 0,
//                         bgcolor: alpha('#000', 0.5),
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         opacity: 0,
//                         transition: 'opacity 0.2s ease',
//                       }}
//                     >
//                       <Stack direction="row" spacing={1}>
//                         <IconButton
//                           size="small"
//                           onClick={() => removeImage(index)}
//                           sx={{
//                             bgcolor: 'error.main',
//                             color: 'white',
//                             '&:hover': {
//                               bgcolor: 'error.dark',
//                               transform: 'scale(1.1)',
//                             },
//                           }}
//                         >
//                           <Delete fontSize="small" />
//                         </IconButton>
//                       </Stack>
//                     </Box>

//                     {/* Image Type Badge */}
//                     <Chip
//                       label="JPG"
//                       size="small"
//                       sx={{
//                         position: 'absolute',
//                         top: 8,
//                         left: 8,
//                         bgcolor: alpha(yellow[500], 0.9),
//                         color: '#000',
//                         fontSize: '0.625rem',
//                         height: 20,
//                         '& .MuiChip-label': { px: 1 },
//                       }}
//                     />
//                   </Box>

//                   {/* Image Info */}
//                   <Box
//                     sx={{
//                       p: 1,
//                       bgcolor: alpha(yellow[50], 0.9),
//                       borderTop: '1px solid',
//                       borderColor: alpha(yellow[300], 0.5),
//                     }}
//                   >
//                     <Typography variant="caption" display="block" noWrap>
//                       Image {index + 1}
//                     </Typography>
//                   </Box>
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>
//         </Box>
//       )}

//       {/* Empty State */}
//       {imagePreviews.length === 0 && (
//         <Box
//           sx={{
//             mt: 3,
//             p: 4,
//             borderRadius: 2,
//             bgcolor: alpha(yellow[50], 0.3),
//             border: '1px solid',
//             borderColor: alpha(yellow[200], 0.5),
//             textAlign: 'center',
//           }}
//         >
//           <InsertPhoto sx={{ fontSize: 48, color: alpha(yellow[600], 0.5), mb: 1 }} />
//           <Typography color="text.secondary" variant="body2">
//             No images uploaded yet
//           </Typography>
//         </Box>
//       )}
//     </Box>
//   );

//   return (
//     <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
//       <Container maxWidth="lg">
//         <Toaster position="top-right" />

//         {/* Header */}
//         <Box sx={{ mb: 4 }}>
//           <Typography variant="h4" fontWeight={600} color={yellow[800]} gutterBottom>
//             About Us Editor
//           </Typography>
//           <Typography color="text.secondary" variant="body2">
//             Manage your company story, vision, mission and gallery
//           </Typography>
//         </Box>

//         {/* Main Content */}
//         <Grid container spacing={3}>
//           {/* Story Section */}
//           <Grid item xs={12}>
//             <SectionCard title="Our Story" icon={BusinessCenter}>
//               <Grid container spacing={2.5}>
//                 <Grid item xs={12}>
//                   <TextField
//                     label="Story Title"
//                     fullWidth
//                     size="small"
//                     value={form.story.title}
//                     onChange={(e) => handleChange("story", "title", e.target.value)}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         '&:hover fieldset': {
//                           borderColor: yellow[400],
//                         },
//                         '&.Mui-focused fieldset': {
//                           borderColor: yellow[600],
//                         },
//                       },
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={12}>
//                   <TextField
//                     label="Story Description"
//                     multiline
//                     rows={4}
//                     fullWidth
//                     size="small"
//                     value={form.story.description}
//                     onChange={(e) => handleChange("story", "description", e.target.value)}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         '&:hover fieldset': {
//                           borderColor: yellow[400],
//                         },
//                         '&.Mui-focused fieldset': {
//                           borderColor: yellow[600],
//                         },
//                       },
//                     }}
//                   />
//                 </Grid>
//               </Grid>
//             </SectionCard>
//           </Grid>

//           {/* Vision & Mission */}
//           <Grid item xs={12} md={6}>
//             <SectionCard title="Our Vision" icon={Visibility}>
//               <Grid container spacing={2.5}>
//                 <Grid item xs={12}>
//                   <TextField
//                     label="Vision Title"
//                     fullWidth
//                     size="small"
//                     value={form.vision.title}
//                     onChange={(e) => handleChange("vision", "title", e.target.value)}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         '&:hover fieldset': {
//                           borderColor: yellow[400],
//                         },
//                       },
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={12}>
//                   <TextField
//                     label="Vision Description"
//                     multiline
//                     rows={3}
//                     fullWidth
//                     size="small"
//                     value={form.vision.description}
//                     onChange={(e) => handleChange("vision", "description", e.target.value)}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         '&:hover fieldset': {
//                           borderColor: yellow[400],
//                         },
//                       },
//                     }}
//                   />
//                 </Grid>
//               </Grid>
//             </SectionCard>
//           </Grid>

//           <Grid item xs={12} md={6}>
//             <SectionCard title="Our Mission" icon={Flag}>
//               <Grid container spacing={2.5}>
//                 <Grid item xs={12}>
//                   <TextField
//                     label="Mission Title"
//                     fullWidth
//                     size="small"
//                     value={form.mission.title}
//                     onChange={(e) => handleChange("mission", "title", e.target.value)}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         '&:hover fieldset': {
//                           borderColor: yellow[400],
//                         },
//                       },
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={12}>
//                   <TextField
//                     label="Mission Description"
//                     multiline
//                     rows={3}
//                     fullWidth
//                     size="small"
//                     value={form.mission.description}
//                     onChange={(e) => handleChange("mission", "description", e.target.value)}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 1.5,
//                         '&:hover fieldset': {
//                           borderColor: yellow[400],
//                         },
//                       },
//                     }}
//                   />
//                 </Grid>
//               </Grid>
//             </SectionCard>
//           </Grid>

//           {/* Key Highlights */}
//           <Grid item xs={12}>
//             <SectionCard 
//               title="Key Highlights" 
//               icon={Timeline}
//               action={
//                 <Button
//                   size="small"
//                   variant="contained"
//                   startIcon={<Add />}
//                   onClick={addCounter}
//                   sx={{
//                     bgcolor: yellow[500],
//                     color: '#000',
//                     '&:hover': {
//                       bgcolor: yellow[600],
//                     },
//                     textTransform: 'none',
//                     boxShadow: 'none',
//                   }}
//                 >
//                   Add Counter
//                 </Button>
//               }
//             >
//               <Grid container spacing={2}>
//                 {form.counters.map((counter, index) => (
//                   <Grid item xs={12} sm={6} md={4} key={index}>
//                     <Paper
//                       variant="outlined"
//                       sx={{
//                         p: 2,
//                         borderRadius: 2,
//                         borderColor: alpha(yellow[400], 0.5),
//                         position: 'relative',
//                         transition: 'all 0.2s ease',
//                         '&:hover': {
//                           borderColor: yellow[600],
//                           boxShadow: `0 4px 12px ${alpha(yellow[500], 0.15)}`,
//                         },
//                       }}
//                     >
//                       <IconButton
//                         size="small"
//                         onClick={() => removeCounter(index)}
//                         sx={{
//                           position: 'absolute',
//                           top: 4,
//                           right: 4,
//                           color: 'error.main',
//                           '&:hover': {
//                             bgcolor: alpha(theme.palette.error.main, 0.1),
//                           },
//                         }}
//                       >
//                         <Delete fontSize="small" />
//                       </IconButton>
                      
//                       <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
//                         Counter #{index + 1}
//                       </Typography>
                      
//                       <Grid container spacing={1.5}>
//                         <Grid item xs={12}>
//                           <TextField
//                             label="Label"
//                             size="small"
//                             fullWidth
//                             value={counter.label}
//                             onChange={(e) => handleCounterChange(index, "label", e.target.value)}
//                             sx={{
//                               '& .MuiOutlinedInput-root': {
//                                 borderRadius: 1.5,
//                                 fontSize: '0.875rem',
//                               },
//                             }}
//                           />
//                         </Grid>
//                         <Grid item xs={12}>
//                           <TextField
//                             label="Value"
//                             size="small"
//                             fullWidth
//                             value={counter.value}
//                             onChange={(e) => handleCounterChange(index, "value", e.target.value)}
//                             sx={{
//                               '& .MuiOutlinedInput-root': {
//                                 borderRadius: 1.5,
//                                 fontSize: '0.875rem',
//                               },
//                             }}
//                           />
//                         </Grid>
//                       </Grid>
//                     </Paper>
//                   </Grid>
//                 ))}
//               </Grid>
//             </SectionCard>
//           </Grid>

//           {/* Professional Image Upload Section */}
//           <Grid item xs={12}>
//             <SectionCard title="Image Gallery" icon={ImageIcon}>
//               <ImageUploadSection />
//             </SectionCard>
//           </Grid>

//           {/* Actions */}
//           <Grid item xs={12}>
//             <Box 
//               sx={{ 
//                 display: 'flex', 
//                 justifyContent: 'flex-end', 
//                 gap: 2,
//                 pt: 2,
//                 borderTop: '1px solid',
//                 borderColor: alpha(yellow[200], 0.5),
//               }}
//             >
//               {aboutId && (
//                 <Button
//                   variant="outlined"
//                   color="error"
//                   startIcon={<Delete />}
//                   onClick={() => {
//                     if (window.confirm("Reset all changes?")) {
//                       resetMutation.mutate();
//                     }
//                   }}
//                   disabled={resetMutation.isPending}
//                   size="medium"
//                   sx={{ 
//                     borderRadius: 1.5,
//                     textTransform: 'none',
//                     px: 3,
//                   }}
//                 >
//                   Reset Changes
//                 </Button>
//               )}
              
//               <Button
//                 variant="contained"
//                 startIcon={<Save />}
//                 onClick={() => saveMutation.mutate()}
//                 disabled={saveMutation.isPending || isPending}
//                 size="medium"
//                 sx={{ 
//                   borderRadius: 1.5,
//                   bgcolor: yellow[500],
//                   color: '#000',
//                   '&:hover': { 
//                     bgcolor: yellow[600],
//                   },
//                   '&.Mui-disabled': { 
//                     bgcolor: alpha(yellow[500], 0.3),
//                   },
//                   textTransform: 'none',
//                   px: 4,
//                   py: 1,
//                   fontWeight: 500,
//                 }}
//               >
//                 {saveMutation.isPending ? "Saving..." : "Save Changes"}
//               </Button>
//             </Box>
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   );
// };

// export default AdminAboutUs;