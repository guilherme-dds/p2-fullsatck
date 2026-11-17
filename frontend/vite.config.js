import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_BACKEND_URL || 'http://192.168.56.10:8000'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/backend': {
          target: backend,
          changeOrigin: true,
          rewrite: (caminho) => caminho.replace(/^\/backend/, ''),
        },
      },
    },
  }
})
