import apiClient from "./apiClient";

export const productAdminService = {
    // products
    list: (params) => apiClient.get("/shop/admin/products", { params }).then(r => r.data.data),
    get: (id) => apiClient.get(`/shop/admin/products/${id}`).then(r => r.data.data),
    create: (data) => apiClient.post("/shop/admin/products", data).then(r => r.data.data),
    update: (id, data) => apiClient.put(`/shop/admin/products/${id}`, data).then(r => r.data.data),
    remove: (id) => apiClient.delete(`/shop/admin/products/${id}`).then(r => r.data.data),

    // variants
    listVariants: (pid) => apiClient.get(`/shop/admin/products/${pid}/variants`).then(r => r.data.data),
    createVariant: (pid, data) => apiClient.post(`/shop/admin/products/${pid}/variants`, data).then(r => r.data.data),
    updateVariant: (vid, data) => apiClient.put(`/shop/admin/variants/${vid}`, data).then(r => r.data.data),
    removeVariant: (vid) => apiClient.delete(`/shop/admin/variants/${vid}`).then(r => r.data.data),

    // master
    listCategories: () => apiClient.get("/shop/admin/categories").then(r => r.data.data),
    listAttributes: () => apiClient.get("/shop/admin/attributes").then(r => r.data.data),
    listBrands: () => apiClient.get("/shop/admin/brands").then(r => r.data.data),
    createCategory: (d) => apiClient.post("/shop/admin/categories", d).then(r => r.data.data),
    updateCategory: (id, d) => apiClient.put(`/shop/admin/categories/${id}`, d).then(r => r.data.data),
    deleteCategory: (id) => apiClient.delete(`/shop/admin/categories/${id}`).then(r => r.data.data),
    categoryTree: () => apiClient.get("/shop/admin/categories/tree").then(r => r.data.data),
    createVariantsBulk: (pid, rows) => apiClient.post(`/shop/admin/products/${pid}/variants/bulk`, { rows }).then(r => r.data.data),


    // media
    uploadImages: async (files) => {
        const fd = new FormData();
        for (const f of files) fd.append("images", f);
        const res = await apiClient.post("/shop/admin/media/images", fd, { headers: { "Content-Type": "multipart/form-data" } });
        return res.data.data;
    },
    uploadVideo: async (file) => {
        const fd = new FormData(); fd.append("video", file);
        const res = await apiClient.post("/shop/admin/media/video", fd, { headers: { "Content-Type": "multipart/form-data" } });
        return res.data.data;
    },

    // import
    importExcel: async (file) => {
        const fd = new FormData(); fd.append("file", file);
        const res = await apiClient.post("/shop/admin/products/import", fd, { headers: { "Content-Type": "multipart/form-data" } });
        return res.data.data;
    },

    lowStock: (threshold = 5) => apiClient.get("/shop/admin/inventory/low-stock", { params: { threshold } }).then(r => r.data.data),
};
