import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/music/', // Set base for GitHub Pages (.../music/)
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        post: resolve(__dirname, 'post/index.html')
      }
    }
  }
})
