import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.OLLAMA_MODEL': JSON.stringify(env.OLLAMA_MODEL || 'gemma3:4b-it-qat'),
      'process.env.OLLAMA_API_URL': JSON.stringify(env.OLLAMA_API_URL || 'http://localhost:11434/api/generate')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    }
  };
});
