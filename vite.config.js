import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// 构建 admin 入口：打包 decap-cms-app + React + Node 内置模块 polyfill（crypto/buffer）
export default defineConfig({
  plugins: [nodePolyfills({
    globals: { Buffer: true, global: true, process: true },
  })],
  build: {
    lib: {
      entry: 'admin/admin.mjs',
      name: 'DecapCmsAdmin',
      formats: ['iife'],
      fileName: () => 'admin.js',
    },
    outDir: 'admin/bundle',
    emptyOutDir: true,
    cssCodeSplit: false,
  },
});
