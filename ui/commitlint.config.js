// 提交规范：Conventional Commits。scope-enum 为手写数组。
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 提示级：历史上组件名（dialog / code-block / virtualizer）也常用作 scope，
    // 硬拦会把大量正常提交挡在门外。类型与格式仍是 error（继承自 config-conventional）。
    'scope-enum': [
      1,
      'always',
      [
        // —— 库包（与 packages/ 下的包名一一对应）——
        'kernel',
        'machine',
        'behavior',
        'motion',
        'position',
        'code-highlight',
        'headless',
        'tokens',
        'styles',
        'icons',
        'backgrounds',
        'chat-stream',
        'markdown',
        'sound',
        'animations',
        'vue',
        'web-components',
        // —— 工程 ——
        'tooling',
        'build',
        'eslint-config',
        'stylelint-config',
        'tsconfig',
        'scripts',
        'ci',
        'deps',
        'release',
        // —— 应用 ——
        'playground',
        'benchmark',
        // —— 跨切 ——
        'repo',
        'a11y',
        'test',
      ],
    ],
    // 允许空 scope（如 repo 级变更）
    'scope-empty': [0],
  },
}
