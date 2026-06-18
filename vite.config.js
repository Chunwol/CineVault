import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

// 배포: GitHub Pages 프로젝트 사이트 (https://chunwol.github.io/CineVault/)
// 빌드 시에만 base를 하위 경로로, 개발 서버는 루트로 둔다.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/CineVault/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    open: false,
  },
  build: {
    outDir: 'dist',
  },
}));
