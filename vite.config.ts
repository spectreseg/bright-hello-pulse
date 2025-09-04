import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              }
            },
          },
        ]
      },
      includeAssets: ['favicon.ico', 'robots.txt', 'lovable-uploads/*.png'],
      manifest: {
        name: 'Sewanee Food Share',
        short_name: 'FoodShare',
        description: 'Share and find food at Sewanee - The University of the South',
        theme_color: '#8B5CF6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/lovable-uploads/3a3c3b4a-16c4-4156-b27c-44f006547e86.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/3a3c3b4a-16c4-4156-b27c-44f006547e86.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        categories: ['food', 'social', 'education'],
        shortcuts: [
          {
            name: 'Find Food',
            short_name: 'Find',
            description: 'Find food available on campus',
            url: '/find-food',
            icons: [{ src: '/lovable-uploads/3a3c3b4a-16c4-4156-b27c-44f006547e86.png', sizes: '96x96' }]
          },
          {
            name: 'Share Food',
            short_name: 'Share',
            description: 'Share food with the community',
            url: '/share-food',
            icons: [{ src: '/lovable-uploads/3a3c3b4a-16c4-4156-b27c-44f006547e86.png', sizes: '96x96' }]
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
