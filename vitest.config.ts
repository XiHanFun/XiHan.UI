import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  
  test: {
    globals: true,
    environment: 'jsdom',
    
    // 测试覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/tests/**',
        '**/demos/**',
        '**/*.config.*',
        '**/internal/**',
        '**/playground/**'
      ],
      // 覆盖率阈值 - V1.0 目标为 80%
      thresholds: {
        lines: 70,        // 当前 70%，逐步提升到 80%
        functions: 70,
        branches: 65,
        statements: 70
      }
    },
    
    // 包含的测试文件
    include: [
      'packages/**/tests/**/*.spec.{ts,tsx}',
      'packages/**/__tests__/**/*.{test,spec}.{ts,tsx}'
    ],
    
    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.cache',
      '**/internal/**',
      '**/playground/**'
    ],
    
    // 测试超时时间
    testTimeout: 10000,
    
    // 测试钩子超时时间
    hookTimeout: 10000,
    
    // 设置隔离环境
    isolate: true,
    
    // 线程设置
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    
    // 监听模式排除
    watchExclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**'
    ],
    
    // 报告器
    reporters: ['verbose'],
    
    // 设置别名
    alias: {
      '@xihan-ui/components': resolve(__dirname, './ui/packages/components/src'),
      '@xihan-ui/themes': resolve(__dirname, './ui/packages/themes/src'),
      '@xihan-ui/hooks': resolve(__dirname, './ui/packages/hooks/src'),
      '@xihan-ui/utils': resolve(__dirname, './ui/packages/utils/src'),
      '@xihan-ui/icons': resolve(__dirname, './ui/packages/icons/src'),
      '@xihan-ui/constants': resolve(__dirname, './ui/packages/constants/src'),
      '@xihan-ui/directives': resolve(__dirname, './ui/packages/directives/src'),
      '@xihan-ui/plugins': resolve(__dirname, './ui/packages/plugins/src'),
      '@xihan-ui/locales': resolve(__dirname, './ui/packages/locales/src')
    }
  },
  
  resolve: {
    alias: {
      '@xihan-ui/components': resolve(__dirname, './ui/packages/components/src'),
      '@xihan-ui/themes': resolve(__dirname, './ui/packages/themes/src'),
      '@xihan-ui/hooks': resolve(__dirname, './ui/packages/hooks/src'),
      '@xihan-ui/utils': resolve(__dirname, './ui/packages/utils/src'),
      '@xihan-ui/icons': resolve(__dirname, './ui/packages/icons/src'),
      '@xihan-ui/constants': resolve(__dirname, './ui/packages/constants/src'),
      '@xihan-ui/directives': resolve(__dirname, './ui/packages/directives/src'),
      '@xihan-ui/plugins': resolve(__dirname, './ui/packages/plugins/src'),
      '@xihan-ui/locales': resolve(__dirname, './ui/packages/locales/src')
    }
  }
})
