import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "./",
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
        "/ollama": {
          target: "http://localhost:11434",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/ollama/, '')
        }
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Only expose PUBLIC keys needed by the frontend Supabase auth client.
      // All secret keys (OpenAI, Upstash, Pinecone, etc.) stay server-side only.
    },
  };
});
