
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
  const [images, setImages] = useState([]); // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // string[]

  /* ================= FETCH ================= */

const { data, isLoading } = useQuery({
  queryKey: ["about-us"],
  queryFn: () => apiGet(apiPath.GetAboutSection),
});

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

  if (data.results.story?.images?.length) {
    setImagePreviews(data.results.story.images);
  }
}, [data]);


const aboutId = data?.results?._id || null;


  /* ================= HANDLERS ================= */

  const handleChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleCounterChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      counters: prev.counters.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
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
                    onChange={(e) =>
                      handleCounterChange(i, "label", e.target.value)
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Value"
                    fullWidth
                    value={c.value}
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
              }}
            />
          </Button>

          {imagePreviews.length > 0 && (
            <Grid container spacing={2} mt={2}>
              {imagePreviews.map((src, i) => (
                <Grid item xs={6} sm={3} key={i}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 3,
                    }}
                  >
                    <img
                      src={src}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: 140,
                        objectFit: "cover",
                      }}
                    />
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
      disabled={resetMutation.isLoading}
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
    onClick={() => saveMutation.mutate()}
    disabled={saveMutation.isLoading || isLoading}
  >
    Save About Us
  </Button>
</Box>

    </Container>
  );
};

export default AdminAboutUs;
