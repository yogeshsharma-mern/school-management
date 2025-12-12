// services/api.js - Mock API service
import apiPath from "../api/apiPath";
import { apiGet,apiPost,apiPut,apiDelete } from "../api/apiFetch";
const MOCK_CATEGORIES = [
  { id: '1', name: 'Events', slug: 'events', count: 5 },
  { id: '2', name: 'Sports', slug: 'sports', count: 3 },
  { id: '3', name: 'Farewell Party', slug: 'farewell-party', count: 8 },
];

let mockImages = {
  'events': [
    { id: 'img1', url: 'https://picsum.photos/300/200?random=1', title: 'Annual Meet', uploaded_at: '2025-11-15' },
    { id: 'img2', url: 'https://picsum.photos/300/200?random=2', title: 'Conference', uploaded_at: '2025-11-10' },
  ],
  'sports': [
    { id: 'img3', url: 'https://picsum.photos/300/200?random=3', title: 'Football Match', uploaded_at: '2025-11-05' },
  ],
  'farewell-party': [
    { id: 'img4', url: 'https://picsum.photos/300/200?random=4', title: 'Senior Farewell', uploaded_at: '2025-10-28' },
  ]
};

export const mockApi = {
  // Category operations
  getCategories: async () => {
    // await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    // return MOCK_CATEGORIES;
    return apiGet(apiPath.galleryCategories || "/api/admins/gallery/categories");
  },

  createCategory: async ({name,description,status}) => {
    // await new Promise(resolve => setTimeout(resolve, 300));
    // const newCategory = {
    //   id: `cat_${Date.now()}`,
    //   name,
    //   slug: name.toLowerCase().replace(/\s+/g, '-'),
    //   count: 0
    // };
    // MOCK_CATEGORIES.push(newCategory);
    // mockImages[newCategory.slug] = [];
    // return newCategory;
    return apiPost(apiPath.createCategorySetting || "/api/admins/gallery/categories", { name, description, status});
  },

  updateCategory: async (id, updates) => {
    // await new Promise(resolve => setTimeout(resolve, 300));
    // const index = MOCK_CATEGORIES.findIndex(cat => cat.id === id);
    // if (index > -1) {
    //   MOCK_CATEGORIES[index] = { ...MOCK_CATEGORIES[index], ...updates };
    //   return MOCK_CATEGORIES[index];
    // }
    // throw new Error('Category not found');
    return apiPut(`${apiPath.updateCategorySetting || "/api/admins/gallery/categories"}/${id}`, updates);
  },

  deleteCategory: async (id) => {
    console.log("id",id)
    // await new Promise(resolve => setTimeout(resolve, 300));
    // const index = MOCK_CATEGORIES.findIndex(cat => cat.id === id);
    // if (index > -1) {
    //   const deleted = MOCK_CATEGORIES.splice(index, 1)[0];
    //   delete mockImages[deleted.slug];
    //   return deleted;
    // }
    // throw new Error('Category not found');
    return apiDelete(`${apiPath.deleteCategorySettings || "/api/admins/gallery/categories"}/${id}`);
  },

  // Image operations
  getImages: async (categoryId) => {
    // await new Promise(resolve => setTimeout(resolve, 300));
    // return mockImages[categorySlug] || [];
  return apiGet(`${apiPath.gallerySettingGetImages || "/api/admins/gallery/categories"}/${categoryId}`);
  },

  uploadImages: async (categoryId, files) => {
    // await new Promise(resolve => setTimeout(resolve, 500));
    // const newImages = files.map((file, index) => ({
    //   id: `img_${Date.now()}_${index}`,
    //   url: URL.createObjectURL(file), // In real app, this would be server URL
    //   title: file.name.split('.')[0],
    //   uploaded_at: new Date().toISOString(),
    // }));
    
    // if (!mockImages[categorySlug]) mockImages[categorySlug] = [];
    // mockImages[categorySlug].push(...newImages);
    // return newImages;
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    // formData.append('category', categorySlug);
    return apiPost(`${apiPath.uploadImageGallery }/${categoryId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateImage: async (id, updates) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    for (const category in mockImages) {
      const index = mockImages[category].findIndex(img => img.id === id);
      if (index > -1) {
        mockImages[category][index] = { ...mockImages[category][index], ...updates };
        return mockImages[category][index];
      }
    }
    throw new Error('Image not found');
  },

  deleteImage: async ({categoryId,imageId}) => {
    // await new Promise(resolve => setTimeout(resolve, 300));
    // for (const category in mockImages) {
    //   const index = mockImages[category].findIndex(img => img.id === id);
    //   if (index > -1) {
    //     return mockImages[category].splice(index, 1)[0];
    //   }
    // }
    // throw new Error('Image not found');
    const payload = {
      imageIds:[imageId]
    }
    return apiDelete(`${apiPath.GallerySettingDeleteImage}/${categoryId}`,  payload);
  }
};