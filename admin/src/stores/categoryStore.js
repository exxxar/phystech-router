import { defineStore } from 'pinia';
import { categoryService } from '@/services/category.service';

export const useCategoryStore = defineStore('categories', {
    state: () => ({ items: [], loading: false }),
    actions: {
        async fetchCategories() {
            this.loading = true;
            try { this.items = await categoryService.getAll(); }
            finally { this.loading = false; }
        },
        async createCategory(data) { return await categoryService.create(data); },
        async updateCategory(id, data) { return await categoryService.update(id, data); },
        async deleteCategory(id) {
            await categoryService.delete(id);
            this.items = this.items.filter(c => c.id !== id);
        }
    }
});