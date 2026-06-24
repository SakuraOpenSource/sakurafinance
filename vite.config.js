import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'element-plus', test: /[\\/]node_modules[\\/]@?element-plus/ },
            { name: 'vue', test: /[\\/]node_modules[\\/]@?vue/ },
          ],
        },
      },
    },
  },
})
