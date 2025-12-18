
import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiUploadCloud, FiTrash2, FiPlus, FiCheck, FiX,
  FiEdit2, FiSave, FiImage, FiFolderPlus
} from "react-icons/fi";
import { MdPhotoLibrary, MdCategory } from "react-icons/md";
import { TbEdit } from "react-icons/tb";
import { mockApi } from "../services/api";
import ToggleButton from "../components/ToggleButton";
import ConfirBox from "../components/ConfirmBox";
import toast from "react-hot-toast";


export default function AdminGalleryUpload() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState(null);
  const [delteImageModal,setDeleteImagemodal] = useState(false);
  const [deleteCategoryModal,setCategoryModal]= useState(false);
  console.log("activecategory", activeCategory);
  console.log("activecategory", activeCategory);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [catId,setCatId]= useState(null);
  const [deleteImageId,setDeleteImageId]= useState(null);
  const [catImageId,setCatImageId] = useState(null);
  const [description, setDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  console.log("editingcategory", editingCategory);
  const [editingImage, setEditingImage] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [localPreviews, setLocalPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileRef = useRef(null);

  // Fetch Categories with React Query
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ["categoriessss"],
    queryFn: mockApi.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  const categoryList = categories?.results?.data || [];
  console.log("categories", categories);
  console.log("categoryList", categoryList)
  // Auto-select first category
  useEffect(() => {
    if (categoryList.length > 0 && !activeCategory) {
      setActiveCategory(categoryList[0]);
    }
  }, [categories, activeCategory]);

  // Fetch Images for active category
  const {
    data: images = [],
    isLoading: imagesLoading,
    refetch: refetchImages
  } = useQuery({
    queryKey: ["imagesssss", activeCategory?._id],
    queryFn: () => activeCategory ? mockApi.getImages(activeCategory._id) : [],
    enabled: !!activeCategory,
  });
  const imagesList = images?.results?.images || [];

  // Create New Category Mutation
  const createCategory = useMutation({
    mutationFn: (payload) => mockApi.createCategory(payload),

    onMutate: async ({ name, description, status }) => {
      await queryClient.cancelQueries(["categories"]);

      const previous = queryClient.getQueryData(["categories"]);

      const optimistic = {
        id: `temp_${Date.now()}`,
        name,
        description,
        status,
      };

      // FIXED SHAPE
      queryClient.setQueryData(["categories"], (old) => ({
        ...old,
        results: {
          ...old?.results,
          data: [...(old?.results?.data || []), optimistic]
        }
      }));

      return { previous };
    },

    onError: (err, newCat, context) => {
      queryClient.setQueryData(["categories"], context.previous);
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      setShowAddCategory(false);
      setNewCategory("");
      setDescription("");
      setIsActive(true);
    },
  });



  // Update Category Mutation
  const updateCategory = useMutation({
    mutationFn: ({ id, name, description, status }) => mockApi.updateCategory(id, { name, description, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
    },
  });

  // Delete Category Mutation
  // const deleteCategory = useMutation({
  //   mutationFn: (id) => mockApi.deleteCategory(id),
  //   onSuccess: (res) => {
  //     queryClient.invalidateQueries({ queryKey: ["categories"] });
  //     if (activeCategory && activeCategory.id === id) {
  //       setActiveCategory(categories[0] || null);
  //              toast.success(res.message);
  //     setCategoryModal(false);
 
  //     }
  //   },
  // });
const deleteCategory = useMutation({
  mutationFn: (id) => mockApi.deleteCategory(id),

  onSuccess: (res, id) => {
    queryClient.invalidateQueries({ queryKey: ["categoriessss"] });

    // Reset active category if deleted
    if (activeCategory?._id === id) {
      setActiveCategory(null);
    }

    toast.success(res?.message || "Category deleted successfully");
    setCategoryModal(false); // ✅ CLOSE MODAL
  },

  onError: (error) => {
    toast.error(
      error?.response?.data?.message || "Failed to delete category"
    );
    setCategoryModal(false); // optional: still close modal
  },
});

  // Upload Images Mutation
  // Upload Images Mutation - FIXED VERSION
  // Upload Images Mutation - FIXED to prevent duplicates
  const uploadMutation = useMutation({
    mutationFn: ({ categoryId, files }) =>
      mockApi.uploadImages(categoryId, files),

    onMutate: async ({ categoryId, files }) => {
      // Create optimistic images with unique temp IDs
      const optimisticImages = files.map((file, index) => ({
        _id: `opt_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`, // Unique ID
        fileUrl: URL.createObjectURL(file),
        title: file.name.split('.')[0],
        originalName: file.name,
        type: file.type.split('/')[1],
        uploaded_at: new Date().toISOString(),
        isOptimistic: true,
        tempId: true // Mark as temporary
      }));

      // Get current cache
      const currentCache = queryClient.getQueryData(["imagesssss", categoryId]) || {};
      const currentImages = currentCache.results?.images || [];

      // Check for duplicates before adding
      const existingIds = new Set(currentImages.map(img => img._id));
      const newOptimisticImages = optimisticImages.filter(img => !existingIds.has(img._id));

      if (newOptimisticImages.length === 0) {
        console.warn("All images already exist in cache");
        return { categoryId, addedImages: [] };
      }

      // Update cache
      queryClient.setQueryData(["imagesssss", categoryId], {
        ...currentCache,
        results: {
          ...currentCache.results,
          images: [...currentImages, ...newOptimisticImages]
        }
      });

      return {
        categoryId,
        addedImages: newOptimisticImages,
        previousCache: currentCache
      };
    },

    onSuccess: (response, variables, context) => {
      console.log("Upload success response:", response);

      const uploadedImages = response?.results?.images || [];

      if (uploadedImages.length === 0) {
        console.warn("No images in response");
        // Remove optimistic images if no response
        if (context?.addedImages?.length > 0) {
          const currentCache = queryClient.getQueryData(["images", variables.categoryId]) || {};
          const currentImages = currentCache.results?.images || [];

          const finalImages = currentImages.filter(img =>
            !context.addedImages.some(opt => opt._id === img._id)
          );

          queryClient.setQueryData(["images", variables.categoryId], {
            ...currentCache,
            results: {
              ...currentCache.results,
              images: finalImages
            }
          });
        }
        return;
      }

      // Replace optimistic images with real ones
      if (context?.addedImages?.length > 0) {
        const currentCache = queryClient.getQueryData(["images", variables.categoryId]) || {};
        const currentImages = currentCache.results?.images || [];

        // Create a map of originalName to uploaded image for matching
        const uploadedMap = new Map();
        uploadedImages.forEach(img => {
          if (img.originalName) {
            uploadedMap.set(img.originalName, img);
          }
        });

        // Filter out optimistic images and add real ones
        const finalImages = currentImages
          .filter(img => !img.isOptimistic) // Remove all optimistic
          .concat(uploadedImages) // Add uploaded images
          .filter((img, index, self) =>
            // Remove duplicates by _id
            index === self.findIndex(t => t._id === img._id)
          );

        queryClient.setQueryData(["images", variables.categoryId], {
          ...currentCache,
          results: {
            ...currentCache.results,
            images: finalImages
          }
        });
      }

      // Complete progress
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        Object.keys(newProgress).forEach(key => {
          newProgress[key] = 100;
        });
        return newProgress;
      });

      // Clear previews after delay
      setTimeout(() => {
        setLocalPreviews([]);
        setUploadProgress({});
      }, 1000);
    },

    onError: (error, variables, context) => {
      console.error("Upload error:", error);

      // Remove only the optimistic images we added
      if (context?.addedImages?.length > 0) {
        const currentCache = queryClient.getQueryData(["images", variables.categoryId]) || {};
        const currentImages = currentCache.results?.images || [];

        const addedIds = new Set(context.addedImages.map(img => img._id));
        const finalImages = currentImages.filter(img => !addedIds.has(img._id));

        queryClient.setQueryData(["images", variables.categoryId], {
          ...currentCache,
          results: {
            ...currentCache.results,
            images: finalImages
          }
        });
      }

      // Reset progress
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        Object.keys(newProgress).forEach(key => {
          newProgress[key] = 0;
        });
        return newProgress;
      });

      alert(`Upload failed: ${error.message}`);
    }
  });


  // Delete Image Mutation
  const deleteImage = useMutation({
    mutationFn: ({ categoryId, imageId }) =>
      mockApi.deleteImage({ categoryId, imageId }),

    onMutate: async ({ imageId }) => {
      await queryClient.cancelQueries({
        queryKey: ["images", activeCategory._id],
      });

      const previousImages = queryClient.getQueryData([
        "images",
        activeCategory._id,
      ]);

      queryClient.setQueryData(["images", activeCategory._id], (old) =>
        old?.results?.images
          ? {
            ...old,
            results: {
              ...old.results,
              images: old.results.images.filter((img) => img._id !== imageId),
            },
          }
          : old
      );

      return { previousImages };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["images", activeCategory._id],
        context.previousImages
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["images", activeCategory._id]);
      setDeleteImagemodal(false);
      queryClient.invalidateQueries(["categories"]);
    },
  });



  // Update Image Mutation
  const updateImage = useMutation({
    mutationFn: ({ id, updates }) => mockApi.updateImage(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["images", activeCategory.slug] });

      const previousImages = queryClient.getQueryData(["images", activeCategory.slug]);

      queryClient.setQueryData(["images", activeCategory.slug], old =>
        old.map(img => img.id === id ? { ...img, ...updates } : img)
      );

      return { previousImages };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["images", activeCategory.slug], context.previousImages);
    },
    onSuccess: () => {
      setEditingImage(null);
    },
  });

  // File handling functions
  const handleFiles = (fileList) => {
    if (!fileList || fileList.length === 0 || !activeCategory) return;

    const files = Array.from(fileList);

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      alert('Please select valid image files (max 10MB each)');
      return;
    }

    // Create local previews
    const previews = validFiles.map((file, index) => ({
      id: `preview_${Date.now()}_${index}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      progress: 0,
    }));

    setLocalPreviews(previews);

    // Simulate upload progress
    previews.forEach((preview, index) => {
      const interval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [preview.id]: Math.min((prev[preview.id] || 0) + 10, 90)
        }));
      }, 100);

      setTimeout(() => clearInterval(interval), 1000);
    });

    // Upload files
    uploadMutation.mutate({
      categoryId: activeCategory._id,
      files: validFiles
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!activeCategory) {
      alert('Please select a category first');
      return;
    }
    handleFiles(e.dataTransfer.files);
  };

  const removeLocalPreview = (id) => {
    setLocalPreviews(prev => prev.filter(x => x.id !== id));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setEditingCategory(null);
    setEditingImage(null);
  };

  return (
    <div className="min-h-screen w-[100vw] md:w-auto bg-gradient-to-br from-gray-50 to-white p-4 md:p-8">
      {
        deleteCategoryModal && 
        (
          <ConfirBox isOpen={deleteCategoryModal} message="If you delete this category, all your images in this category will be remove." onConfirm={()=>deleteCategory.mutate(catId)} onCancel={()=>setCategoryModal(false)}/>
        )
      }
      {
        delteImageModal && 
        (
          <ConfirBox isOpen={delteImageModal} message="you want to delete this image" onConfirm={() =>
  deleteImage.mutate({
    categoryId: catImageId,
    imageId: deleteImageId
  })
}
 onCancel={()=>setDeleteImagemodal(false)}/>
        )
      }
    
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 shadow-lg">
              <MdPhotoLibrary size={34} className="text-yellow-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Gallery Admin Dashboard</h1>
              <p className="text-gray-600 text-sm">Organize and manage your photo gallery with ease</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddCategory(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[image:var(--gradient-primary)] text-black font-sm cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <FiFolderPlus size={18} />
              <span>New Category</span>
            </button>

            <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-amber-200 bg-white text-gray-700 font-medium shadow-md hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 cursor-pointer">
              <FiUploadCloud className="text-amber-600" />
              <span>Quick Upload</span>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="mb-8 ">
          <div className="flex items-center gap-3 mb-4">
            <MdCategory className="text-amber-600" />
            <h2 className="text-xl font-bold text-gray-800">Categories</h2>
            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
              {categoryList.length} total
            </span>
          </div>

          {categoriesLoading ? (
            <div className="flex gap-3 overflow-x-auto py-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="px-6 py-3 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 animate-pulse min-w-[120px]" />
              ))}
            </div>
          ) : categoriesError ? (
            <div className="text-red-600 p-4 bg-red-50 rounded-xl">
              Failed to load categories
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="inline-flex ml-3 gap-3 items-center min-w-full">
                {categoryList.map((cat) => (

                  <div key={cat.id} className="relative group">
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      className={`px-6 py-4 rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-3 
                        ${activeCategory?._id === cat._id
                          ? 'bg-[image:var(--gradient-primary)]  text-white scale-105'
                          : 'bg-white text-gray-700 border-2 border-amber-100 hover:border-amber-300 '
                        }`}
                    >
                      <div className={`p-2 rounded-lg ${activeCategory?.id === cat.id ? 'bg-white/20' : 'bg-amber-100'}`}>
                        <FiImage className={activeCategory?.id === cat.id ? 'text-black' : 'text-amber-600'} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm text-black">{cat.name}</div>
                        <div className={`text-xs  ${activeCategory?.id === cat.id ? 'text-black/70' : 'text-gray-500'}`}>
                          {cat.count} images
                        </div>
                      </div>
                    </button>

                    {/* Edit/Delete buttons on hover */}
                    <div className="absolute right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCategory(cat);
                          }}
                          className="p-1.5  text-blue-500 cursor-pointer rounded-lg "
                        >
                          <FiEdit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoryModal(true);
                            setCatId(cat._id);
                            // e.stopPropagation();
                            // if (window.confirm(`Delete category "${cat.name}"? This will also delete all images in this category.`)) {
                            //   deleteCategory.mutate(cat._id);
                            // }
                          }}
                          className="p-1.5  text-red-600 cursor-pointer  rounded-lg "
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DRAG & DROP UPLOAD ZONE */}
        {activeCategory && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`mb-10 rounded-2xl p-6 border-2 transition-all duration-300 backdrop-blur-sm
              ${dragOver
                ? 'border-dashed border-amber-400 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 shadow-inner'
                : 'border-dashed border-amber-200 bg-white/80 '
              }`}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${dragOver ? 'bg-amber-200' : 'bg-amber-100'}`}>
                  <FiUploadCloud size={32} className={dragOver ? 'text-amber-700' : 'text-amber-600'} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    Upload to <span className="text-amber-600">{activeCategory.name}</span>
                  </p>
                  <p className="text-gray-600 text-sm">
                    Drag & drop images here, or click to browse. Max 10MB per image.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <label className="px-5 py-3 rounded-xl text-black font-semibold border border-gray-200  hover:scale-105 transition-all duration-200 cursor-pointer">
                  Browse Files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handleFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </label>
                {localPreviews.length > 0 && (
                  <button
                    onClick={() => {
                      setLocalPreviews([]);
                      setUploadProgress({});
                    }}
                    className="px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {uploadMutation.isLoading && (
              <div className="mt-6">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
                    style={{ width: '70%' }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">Uploading images... Please wait</p>
              </div>
            )}

            {/* Local Previews */}
            {localPreviews.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-gray-800 mb-4">Uploading ({localPreviews.length} files)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {localPreviews.map((preview) => (
                    <div key={preview.id} className="relative rounded-xl overflow-hidden bg-white shadow-lg group">
                      <div className="aspect-square relative">
                        <img
                          src={preview.url}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                        {/* Progress overlay */}
                        {uploadProgress[preview.id] > 0 && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="text-white text-sm font-bold">
                              {uploadProgress[preview.id]}%
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-2 bg-gradient-to-r from-gray-50 to-white">
                        <p className="text-xs font-medium text-gray-800 truncate">
                          {preview.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(preview.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>

                      <button
                        onClick={() => removeLocalPreview(preview.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-transform"
                      >
                        <FiX className="text-red-500" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* IMAGES GRID */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeCategory ? `${activeCategory.name} Images` : 'Gallery Images'}
              {activeCategory && (
                <span className="ml-3 text-amber-600 text-lg">
                  ({imagesList.length} images)
                </span>
              )}
            </h2>

            {activeCategory && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiImage />
                <span>Click on images to edit details</span>
              </div>
            )}
          </div>

          {!activeCategory ? (
            <div className="text-center py-16 rounded-3xl border-3 border-dashed border-amber-100 bg-gradient-to-br from-amber-50/50 to-white/50">
              <div className="p-4 rounded-full bg-amber-100 inline-flex mb-4">
                <MdPhotoLibrary size={48} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Category</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Choose a category from above to view and manage images, or create a new category to get started.
              </p>
            </div>
          ) : imagesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl aspect-square" />
                  <div className="h-4 bg-gray-200 rounded mt-3" />
                  <div className="h-3 bg-gray-200 rounded mt-2 w-2/3" />
                </div>
              ))}
            </div>
          ) : imagesList.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border-3 border-dashed border-amber-100 bg-gradient-to-br from-amber-50/50 to-white/50">
              <div className="p-4 rounded-full bg-amber-100 inline-flex mb-4">
                <FiImage size={48} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Images Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                This category is empty. Upload some images using the drag & drop area above.
              </p>
              <label className="px-5 py-2.5 rounded-xl bg-[image:var(--gradient-primary)] text-white font-medium shadow-lg hover:shadow-xl inline-flex items-center gap-2 cursor-pointer">
                <FiUploadCloud />
                Upload First Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {imagesList.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-2xl overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={img.fileUrl}
                      alt={img.type}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        {editingImage?._id === img._id ? (
                          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3">
                            <input
                              type="text"
                              value={editingImage.title}
                              onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                              className="w-full px-3 py-2 border border-amber-200 rounded-lg mb-2"
                              placeholder="Image title"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  updateImage.mutate({
                                    id: img._id,
                                    updates: { title: editingImage.title }
                                  });
                                }}
                                className="flex-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingImage(null)}
                                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-white font-semibold truncate">{img.title}</p>
                              <p className="text-white/80 text-xs">
                                {new Date(img.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {/* <button
                                onClick={() => setEditingImage(img)}
                                className="p-2 bg-white/90 rounded-lg hover:bg-white hover:scale-110 transition-transform"
                                title="Edit"
                              >
                                <TbEdit className="text-blue-600" />
                              </button> */}
                              <button
                                onClick={() => {
                                  setDeleteImagemodal(true);
                                  setDeleteImageId(img._id);
                                  setCatImageId(activeCategory._id);
                                  // if (window.confirm('Delete this image?')) {
                                  //   deleteImage.mutate({
                                  //     categoryId: activeCategory._id,
                                  //     imageId: img._id
                                  //   });
                                  // }
                                }}
                                className="p-2 bg-white/90 cursor-pointer rounded-lg hover:bg-white hover:scale-110 transition-transform"
                                title="Delete"
                              >
                                <FiTrash2 className="text-red-600" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-[image:var(--gradient-primary)] text-white text-xs font-semibold rounded-full">
                        {activeCategory.name}
                      </span>
                    </div>
                  </div>

                  {/* Bottom info (visible always) */}
                  {/* <div className="p-4 border-t border-amber-50">
                    <p className="font-medium text-gray-800 truncate">{img.title}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        {new Date(img.uploaded_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingImage(img)}
                          className="text-xs text-amber-600 hover:text-amber-700"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div> */}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ADD CATEGORY MODAL */}
        {showAddCategory && (
          <div className="fixed inset-0 bg-black/30  flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-white to-amber-50 rounded-3xl p-6 shadow-2xl animate-scaleIn">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100">
                    <FiFolderPlus className="text-amber-600" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Create New Category</h3>
                </div>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., Cultural Fest, Science Exhibition"
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 mb-4"
              // onKeyDown={(e) => {
              //   if (e.key === 'Enter' && newCategory.trim()) {
              //     createCategory.mutate(newCategory);
              //   }
              // }}
              />

              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="description"
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 mb-4"
              // onKeyDown={(e) => {
              //   if (e.key === 'Enter' && newCategory.trim()) {
              //     createCategory.mutate(newCategory);
              //   }
              // }}
              />
              <div className="flex justify-end mb-2">
                <ToggleButton
                  isActive={isActive}
                  onToggle={() => setIsActive(!isActive)}
                  disabled={createCategory.isLoading}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="px-5 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => createCategory.mutate({
                    name: newCategory,
                    description,
                    status: isActive ? "active" : "inactive",
                  })}
                  disabled={!newCategory.trim() || createCategory.isLoading}
                  className={`px-5 py-2.5 cursor-pointer rounded-xl font-medium transition-all duration-200 flex items-center gap-2
                    ${!newCategory.trim() || createCategory.isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[image:var(--gradient-primary)] text-white shadow-lg hover:shadow-xl hover:scale-105'
                    }`}
                >
                  {createCategory.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      Create Category
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT CATEGORY MODAL */}
        {editingCategory && (
          <div className="fixed inset-0 bg-black/70  flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-gradient-to-b from-white to-blue-50 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-100">
                    <FiEdit2 className="text-yellow-600" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Edit Category</h3>
                </div>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <input
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 mb-4"
              />
              <input
                value={editingCategory.description}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 mb-4"
              />
              <div className="flex justify-end mb-2">
                <ToggleButton
                  isActive={editingCategory.status === "active"}
                  onToggle={() =>
                    setEditingCategory({
                      ...editingCategory,
                      status: editingCategory.status === "active" ? "inactive" : "active",
                    })
                  }
                />

              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingCategory(null)}
                  className="px-5 cursor-pointer py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateCategory.mutate({
                    id: editingCategory._id,
                    name: editingCategory.name,
                    description: editingCategory.description,
                    status: editingCategory.status,
                  })}
                  disabled={updateCategory.isLoading}
                  className="px-5 py-2.5 rounded-xl cursor-pointer bg-[image:var(--gradient-primary)] text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  {updateCategory.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GLOBAL LOADING OVERLAY */}
      {(createCategory.isLoading || updateCategory.isLoading || deleteCategory.isLoading) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-500 border-t-transparent" />
            <p className="text-gray-700 font-medium">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Add some custom CSS for animations
const styles = `
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scaleIn {
  animation: scaleIn 0.2s ease-out;
}
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);