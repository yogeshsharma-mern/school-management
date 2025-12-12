import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "../api/apiFetch";
import { FiUploadCloud, FiTrash2, FiPlus, FiCheck, FiX } from "react-icons/fi";
import { MdPhotoLibrary } from "react-icons/md";

// AdminGalleryUpload - Yellow / White modern theme
// Single-file React component (Tailwind CSS expected)
export default function AdminGalleryUpload() {
  const queryClient = useQueryClient();

  const [activeCategory, setActiveCategory] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [localPreviews, setLocalPreviews] = useState([]); // previews for current upload session
  const fileRef = useRef(null);

  // Fetch Categories
//   const { data: categories = [] } = useQuery({
//     queryKey: ["categories"],
//     queryFn: () => apiGet("/gallery/categories"),
//   });

const categories= ['Events', 'Sports', 'Farewell Party', 'Cultural Fest', 'Science Exhibition'];

  // ensure first category auto-selected
  useEffect(() => {
    if (categories && categories.length && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories]);

  // Fetch Images for active category
  const { data: images = [], isLoading } = useQuery({
    queryKey: ["images", activeCategory],
    queryFn: () => apiGet(`/gallery?category=${encodeURIComponent(activeCategory)}`),
    enabled: !!activeCategory,
  });

  // Create New Category
  const createCategory = useMutation({
    mutationFn: (payload) => apiPost("/gallery/category", payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["categories"]);
      // If API returns created category name, select it, otherwise use what we sent
      const created = res?.category || newCategory;
      setActiveCategory(created);
      setShowAddCategory(false);
      setNewCategory("");
    },
  });

  // Upload Images
  const uploadMutation = useMutation({
    mutationFn: (formData) => apiPost("/gallery/upload", formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["images", activeCategory]);
      setLocalPreviews([]);
    },
  });

  // Delete Image
  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/gallery/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["images", activeCategory]);
    },
  });

  // Handle file selection or drop
  const handleFiles = (fileList) => {
    if (!fileList || fileList.length === 0 || !activeCategory) return;

    const files = Array.from(fileList);

    // create local previews
    const previews = files.map((f) => ({ id: cryptoRandomId(), file: f, url: URL.createObjectURL(f) }));
    setLocalPreviews((p) => [...p, ...previews]);

    // prepare FormData
    const formData = new FormData();
    formData.append("category", activeCategory);
    files.forEach((file) => formData.append("images", file));

    uploadMutation.mutate(formData);
  };

  const handleUploadInput = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!activeCategory) return;
    handleFiles(e.dataTransfer.files);
  };

  const removeLocalPreview = (id) => {
    setLocalPreviews((p) => p.filter((x) => x.id !== id));
  };

  // small helper to generate id for previews
  function cryptoRandomId() {
    return Math.random().toString(36).slice(2, 9);
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-50 shadow-inner">
              <MdPhotoLibrary size={30} className="text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">Gallery — Admin</h1>
              <p className="text-gray-600 text-sm">Organize photos by category. Yellow & white theme.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddCategory(true)}
              className="inline-flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg bg-[image:var(--gradient-primary)]  text-black shadow transition"
            >
              <FiPlus />
              <span className="">New Category</span>
            </button>

            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-200 bg-white hover:bg-amber-50 cursor-pointer">
              <FiUploadCloud className="text-amber-600" />
              <span className="text-sm text-gray-700">Quick Upload</span>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUploadInput} />
            </label>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="mb-6">
          <div className="overflow-x-auto py-2">
            <div className="inline-flex gap-3 items-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full font-medium transition-shadow whitespace-nowrap shadow-sm
                    ${activeCategory === cat ? 'bg-amber-500 text-white shadow-lg scale-105' : 'bg-white text-gray-800 border border-amber-100 hover:shadow-md'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upload / Dropzone area for selected tab */}
        {activeCategory ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`mb-8 rounded-2xl p-6 border-2 transition-all ${dragOver ? 'border-amber-400 bg-amber-50/50' : 'border-amber-100 bg-white'} shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-amber-100">
                  <FiUploadCloud size={28} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Upload images to <span className="text-amber-600">{activeCategory}</span></p>
                  <p className="text-sm text-gray-600">Drag & drop, or click to select files. You can upload multiple images at once.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="px-4 py-2 rounded-lg bg-amber-500 text-white cursor-pointer">
                  Select Files
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleUploadInput} />
                </label>
                <button
                  onClick={() => { setLocalPreviews([]); if (fileRef.current) fileRef.current.value = null; }}
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Local previews (before/after upload) */}
            {localPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-3">
                {localPreviews.map((p) => (
                  <div key={p.id} className="relative rounded-lg overflow-hidden bg-white shadow">
                    <img src={p.url} alt="preview" className="w-full h-24 object-cover" />
                    <button onClick={() => removeLocalPreview(p.id)} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow">
                      <FiX className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Uploading / status area */}
            <div className="mt-4">
              {uploadMutation.isLoading ? (
                <div className="text-amber-700">Uploading images... please wait.</div>
              ) : uploadMutation.isError ? (
                <div className="text-red-600">Upload failed. Try again.</div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mb-8 p-8 rounded-2xl border border-dashed border-amber-100 text-center text-gray-500">
            Please select or create a category to start uploading images.
          </div>
        )}

        {/* Images grid for active category */}
        <h2 className="text-xl font-bold mb-4">{activeCategory ? `Images — ${activeCategory}` : 'Images'}</h2>

        {activeCategory && isLoading && (
          <div className="text-gray-600 py-6">Loading images...</div>
        )}

        {activeCategory && !isLoading && images.length === 0 && (
          <div className="text-gray-500 py-10 italic">No images uploaded yet for "{activeCategory}"</div>
        )}

        {activeCategory && images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => (
              <div key={img.id} className="rounded-xl overflow-hidden shadow-lg bg-white">
                <div className="relative">
                  <img src={img.url} alt={img.caption || img.id} className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={() => deleteMutation.mutate(img.id)} className="p-2 rounded-md bg-white/90 shadow hover:scale-105">
                      <FiTrash2 className="text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="p-3 border-t border-amber-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 truncate">{img.title || activeCategory}</p>
                      <p className="text-xs text-gray-500">{img.uploaded_at ? new Date(img.uploaded_at).toLocaleDateString() : ''}</p>
                    </div>
                    <div>
                      <button className="text-xs bg-amber-100 px-3 py-1 rounded-full text-amber-700">{activeCategory}</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Category Modal */}
        {showAddCategory && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Create new category</h3>
                <button onClick={() => setShowAddCategory(false)} className="p-2 rounded-full bg-amber-50">
                  <FiX />
                </button>
              </div>

              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Farewell Party"
                className="w-full border px-4 py-2 rounded-lg focus:outline-amber-400 mb-4"
              />

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowAddCategory(false)} className="px-4 py-2 cursor-pointer rounded-lg border">Cancel</button>
                <button
                  onClick={() => createCategory.mutate({ name: newCategory })}
                  disabled={!newCategory.trim()}
                  className={`px-4 py-2 flex items-center cursor-pointer gap-1 rounded-lg text-white ${newCategory.trim() ? 'bg-[image:var(--gradient-primary)] ' : 'bg-amber-200 cursor-not-allowed'}`}
                >
                  <FiCheck /> Create
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
