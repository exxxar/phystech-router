import { defineStore } from 'pinia';

const KEY = 'settings';

export interface Settings {
    theme: 'light' | 'dark';
    language: 'ru' | 'en';
    notifications: boolean;
    geolocation: boolean;
    keepHistory: boolean;
}

const defaults: Settings = {
    theme: 'light',
    language: 'ru',
    notifications: true,
    geolocation: true,
    keepHistory: true,
};

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        settings: { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') } as Settings,
    }),
    actions: {
        update(patch: Partial<Settings>) {
            this.settings = { ...this.settings, ...patch };
            localStorage.setItem(KEY, JSON.stringify(this.settings));
            document.documentElement.setAttribute('data-theme', this.settings.theme);
        },
        reset() {
            this.settings = { ...defaults };
            localStorage.setItem(KEY, JSON.stringify(this.settings));
        },
    },
});