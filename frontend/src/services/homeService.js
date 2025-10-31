import apiClient from './apiClient';


export const homeService = {
    async fetchHomepage() {
        const res = await apiClient.get('homepage');
        return res.data.data;
    },
    async fetchBanners() {
        const res = await apiClient.get('home/banners');
        return res.data.data;
    },
    async fetchFlashSale() {
        const res = await apiClient.get('home/flash-sale');
        return res.data.data;
    },
    async fetchCategories() {
        const res = await apiClient.get('home/categories');
        return res.data.data;
    },
    async fetchRootProducts(slug, limit = 12) {
        const res = await apiClient.get(`home/root/${slug}?limit=${limit}`);
        return res.data.data;
    },
};
