import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import { viteMockServe } from "vite-plugin-mock";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  console.log(env);
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
          target: "https://trends.918113.top", // 后端服务地址
          changeOrigin: true, // 修改源，避免跨域
          rewrite: (path) => path.replace(/^\/api/, ""), // 去掉路径中的 /api 部分
          secure: false,
        },
      },
    },
    // prevent vite from obscuring rust errors
    clearScreen: false,
    envPrefix: [
      "VITE_",
      "TAURI_PLATFORM",
      "TAURI_ARCH",
      "TAURI_FAMILY",
      "TAURI_PLATFORM_VERSION",
      "TAURI_PLATFORM_TYPE",
      "TAURI_DEBUG",
    ],
    build: {
      // Tauri uses Chromium on Windows and WebKit on macOS and Linux
      target:
        process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
      // don't minify for debug builds
      minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
      // 为调试构建生成源代码映射 (sourcemap)
      sourcemap: !!process.env.TAURI_DEBUG,
    },
  };
});
