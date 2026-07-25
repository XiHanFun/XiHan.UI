// 提交规范：Conventional Commits。scope-enum 为手写数组（不再脚本生成，见 §16）。
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        // —— 库包 ——
        'core',
        'machine',
        'system',
        'theme',
        'motion',
        'behavior',
        'headless',
        'styled',
        'vue',
        'wc',
        'react',
        'blazor',
        'ai',
        'markdown',
        'i18n',
        'icons',
        'pro',
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
        'docs',
        'benchmark',
        // —— 跨切 ——
        'repo',
        'tokens',
        'a11y',
        'test',
      ],
    ],
    // 允许空 scope（如 repo 级变更）
    'scope-empty': [0],
  },
}
