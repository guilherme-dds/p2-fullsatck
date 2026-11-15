import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// O React roda em http://localhost:5173 e repassa (proxy) tudo que começa
// com /backend para o Laravel na VM. Assim navegador e servidor ficam na
// "mesma origem": o cookie de sessão funciona e o token CSRF é aceito.
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
