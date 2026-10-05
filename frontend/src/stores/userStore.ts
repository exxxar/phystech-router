import { defineStore } from 'pinia';
import { authService } from '@/services/authService';
import type { User } from '@/types';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null as User | null,
        loading: false,
        error: null as string | null,
    }),
    actions: {
        async load() {
            this.loading = true;
            try { this.user = await authService.getUser(); }
            catch (e: any) { this.error = e.message; }
            finally { this.loading = false; }
        },
        async update(patch: Partial<User>) {
            if (!this.user) return;
            this.user = { ...this.user, ...patch };
            await authService.updateUser(this.user);
        },
    },
});