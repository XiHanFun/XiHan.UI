import { defineConfig } from 'vitest/config'

// 本包单测跑 v8 覆盖率，统计口径只算 src 下的实现文件。
// 排除的四类是无可执行语句的声明与元数据文件：桶文件、解剖表、元信息、类型声明。
// 阈值待后续按实测定，现在只出报告不判红。
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.ts'],
      exclude: ['**/index.ts', '**/*.anatomy.ts', '**/*.meta.ts', '**/*.types.ts'],
    },
  },
})
