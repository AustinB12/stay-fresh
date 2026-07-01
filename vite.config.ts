import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(() => {
	return {
		plugins: [
			react(),
			tailwindcss(),
			VitePWA({
				registerType: 'autoUpdate',
				injectRegister: 'auto',
				includeAssets: ['apper.svg', 'maskable-icon.svg'],
				manifest: {
					name: 'Stay Fresh',
					short_name: 'Stay Fresh',
					description:
						'Keep track of everything in your fridge, pantry, and freezer.',
					theme_color: '#16a34a',
					background_color: '#fafafa',
					display: 'standalone',
					orientation: 'portrait',
					start_url: '/',
					scope: '/',
					icons: [
						{
							src: 'apper.svg',
							sizes: 'any',
							type: 'image/svg+xml',
							purpose: 'any',
						},
						{
							src: 'maskable-icon.svg',
							sizes: 'any',
							type: 'image/svg+xml',
							purpose: 'maskable',
						},
					],
				},
				workbox: {
					globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
					navigateFallbackDenylist: [/^\/auth/],
					runtimeCaching: [
						{
							urlPattern: ({ url }) =>
								url.origin === 'https://world.openfoodfacts.org',
							handler: 'NetworkFirst',
							options: {
								cacheName: 'openfoodfacts-cache',
								expiration: {
									maxEntries: 50,
									maxAgeSeconds: 60 * 60 * 24 * 7,
								},
							},
						},
						{
							urlPattern: ({ url }) => url.pathname.includes('/storage/v1/'),
							handler: 'CacheFirst',
							options: {
								cacheName: 'supabase-images-cache',
								expiration: {
									maxEntries: 100,
									maxAgeSeconds: 60 * 60 * 24 * 30,
								},
							},
						},
					],
				},
			}),
		],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
	}
})
