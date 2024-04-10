import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './lib/react-hook-signal.tsx',
      name: 'ReactHookSignal',
      fileName: 'react-hook-signal'
    }
  }
})
