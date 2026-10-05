import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [
            vue(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['icons/*.png'],
                manifest: false,
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                    runtimeCaching: [
                        {
                            urlPattern: /^https?:\/\/.*\/api\/.*/i,
                            handler: 'NetworkFirst',
                            options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 } },
                        },
                    ],
                },
            }),
        ],
        resolve: {
            alias: { '@': path.resolve(__dirname, 'src') },
        },
        define: {
            __APP_ENV__: JSON.stringify(env.VITE_API_URL),
        },
    };
});