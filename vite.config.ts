import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(), 
        tailwindcss(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
          manifest: {
            name: 'Disha Maps Pro',
            short_name: 'Disha',
            description: 'Advanced AI-powered spatial intelligence and navigation mesh.',
            theme_color: '#020617',
            background_color: '#020617',
            display: 'standalone',
            orientation: 'portrait',
            icons: [
              {
                src: 'https://picsum.photos/seed/disha-192/192/192',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'https://picsum.photos/seed/disha-512/512/512',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'https://picsum.photos/seed/disha-512/512/512',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/mt1\.google\.com\/vt\/lyrs=m&x=\{x\}&y=\{y\}&z=\{z\}/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-maps-tiles',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
            ],
          },
        }),
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
