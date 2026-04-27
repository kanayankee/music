import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  // Detect if we're on Netlify or building for a local root preview
  const isNetlify = process.env.NETLIFY === 'true'
  const base = isNetlify ? '/' : '/music/'

  return {
    base: base,
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          post: resolve(__dirname, 'post/index.html')
        }
      }
    }
  }
})
