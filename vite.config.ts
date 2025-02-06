import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath } from 'url'
import { viteMockServe } from 'vite-plugin-mock'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteMockServe({
      mockPath: 'src/mock',
      enable: true,
    })
  ],
  resolve:{
    alias:{
        '@': fileURLToPath(new URL("./src", import.meta.url))//配置别名
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // 后端服务地址
        changeOrigin: true,  // 修改源，避免跨域
        rewrite: (path) => path.replace(/^\/api/, ''), // 去掉路径中的 /api 部分
      },
    },
  },
})
