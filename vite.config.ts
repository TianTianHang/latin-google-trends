import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import { viteMockServe } from "vite-plugin-mock";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  console.log(env)
  return {
    plugins: [
      react(),
      viteMockServe({
        mockPath: "src/mock",
        enable: true,
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)), //配置别名
      },
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_BASE_API, // 后端服务地址
          changeOrigin: true, // 修改源，避免跨域
          rewrite: (path) => path.replace(/^\/api/, ""), // 去掉路径中的 /api 部分
          secure: true
        },
      },
    },
  };
});
