import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base:'/tc39-signal-proposal-react/',
  plugins: [react()]
})
