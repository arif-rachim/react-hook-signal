/// <reference types="vitest" />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
/// https://vitejs.dev/config/

export default defineConfig({
  plugins: [dts({rollupTypes:true,outDir:'./dist'})],
  build: {
    lib: {
      entry: './src/main.ts',
      name: 'ReactHookSignal',
      fileName: 'react-hook-signal',
    },
    minify:false,
    rollupOptions: {
      // Optional: Configure Rollup for library building
      external: ['react', 'react-dom','signal-polyfill'], // Externalize React dependencies
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  test : {
    globals:true,
    environment: 'jsdom',
  },
})
