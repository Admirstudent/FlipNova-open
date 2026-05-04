import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            '/create-checkout-session': 'http://localhost:4500'
        }
    },
    resolve: {
        dedupe: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            'react/jsx-dev-runtime',
            'use-sync-external-store'   // <-- extra safety for React 18 leftovers
        ],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    }
    // optimizeDeps.exclude removed entirely
})