import { defineStore } from 'pinia';

export const useNetworkStore = defineStore('network', {
    state: () => ({
        status: (navigator.onLine ? 'online' : 'offline') as 'online' | 'offline',
        lastSync: null as string | null,
    }),
    actions: {
        setStatus(s: 'online' | 'offline') { this.status = s; if (s === 'online') this.lastSync = new Date().toISOString(); },
    },
});