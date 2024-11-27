import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
        '/api': {
            target: 'http://0.0.0.0:8000', // URL de tu servidor backend
            changeOrigin: true, // Cambia el origen a coincidir con el backend
            rewrite: (path) => path.replace(/^\/api/, '/api'), // Reescribe las rutas
        },
    },
},
})
