import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import path from 'path'

export default defineConfig({
  plugins: [
    // 自动生成 .d.ts 类型文件，并输出到 dist 目录
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      insertTypesEntry: true
    })
  ],
  build: {
    target: 'es2015', // 确保转译到ES2015以获得更好的兼容性
    // 库模式配置
    lib: {
      // 多入口配置：这是实现你目录结构需求的关键
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'), // 公共入口 -> dist/index.js
        '2d': path.resolve(__dirname, 'src/2d/index.ts'), // 二维入口 -> dist/2d.js
        '3d': path.resolve(__dirname, 'src/3d/index.ts') // 三维入口 -> dist/3d.js
      },
      // 输出格式：推荐同时输出 ES Module (ESM) 和 CommonJS (CJS)
      formats: ['es', 'cjs'],
      // 输出文件名格式
      fileName: (format, entryName) => {
        // 1. 根据打包格式决定后缀
        const ext = format === 'es' ? 'mjs' : 'js'

        // 2. 如果是主入口，直接输出到 dist/index.mjs
        if (entryName === 'index') {
          return `index.${ext}`
        }

        // 3. 如果是子模块，输出到 dist/子模块名/index.mjs
        // 例如：entryName 为 '2d' -> '2d/index.mjs'
        return `${entryName}/index.${ext}`
      }
    },
    rollupOptions: {
      // 外部化依赖：非常重要！
      // 确保 openlayers 和 cesium 不会被打包进你的库中，减小体积
      external: ['ol', 'cesium'],
      output: {
        // 在 UMD 构建模式下为这些外部依赖提供全局变量（如果需要）
        globals: {
          ol: 'Ol',
          cesium: 'Cesium'
        },
        // 保持目录结构（可选，如果你的文件很多）
        preserveModules: false
      }
    },
    // 压缩混淆，生产环境建议开启
    minify: 'esbuild'
  }
})
