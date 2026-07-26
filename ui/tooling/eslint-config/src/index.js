// @xihan-ui/eslint-config —— 在 @antfu/eslint-config 之上做最小定制。
// 边界（layers）门禁由 dependency-cruiser 负责（见 .dependency-cruiser.cjs）；
// 此处只保留 antfu 基线 + 若干项目约定。
import antfu from '@antfu/eslint-config'

/**
 * @param {import('@antfu/eslint-config').OptionsConfig} [options]
 * @param {...any} userConfigs
 */
export default function xihanUi(options = {}, ...userConfigs) {
  return antfu(
    {
      type: 'lib',
      vue: true,
      typescript: true,
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: false,
      },
      ...options,
    },
    {
      rules: {
        // 库分发禁止 console（保留 warn/error）
        'no-console': ['warn', { allow: ['warn', 'error'] }],
      },
    },
    {
      // 工程脚本与 .mjs CLI：允许 console/process，放宽风格
      files: ['**/*.mjs', 'tooling/**', '*.config.*', 'apps/**/vite.config.*'],
      rules: {
        'no-console': 'off',
        'node/prefer-global/process': 'off',
        'style/max-statements-per-line': 'off',
        'ts/explicit-function-return-type': 'off',
        'jsdoc/require-returns-description': 'off',
        'jsdoc/require-property-description': 'off',
      },
    },
    {
      // catalog 有意按类别分组注释（非字母序）且前瞻声明整套依赖栈
      files: ['pnpm-workspace.yaml'],
      rules: {
        'yaml/sort-keys': 'off',
        'pnpm/yaml-no-unused-catalog-item': 'off',
      },
    },
    {
      // foundation 层必须框架无关：core/machine/behavior/headless/system 不得 import 任何框架库
      // （含 import type——框架特定代码一律放各适配器包 vue/wc/...）。这是"框架无关"的机读门禁。
      files: ['packages/{core,machine,behavior,headless,system}/src/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [{
            group: [
              'vue',
              '@vue/*',
              'react',
              'react-dom',
              'react/*',
              'react-dom/*',
              'preact',
              'preact/*',
              'svelte',
              'svelte/*',
              'solid-js',
              'solid-js/*',
              'lit',
              'lit/*',
              'lit-html',
              'lit-element',
              '@lit/*',
              '@lit-labs/*',
              '@angular/*',
            ],
            message: 'foundation 层必须框架无关：不得 import 框架库；框架特定代码放对应适配器包（@xihan-ui/vue、@xihan-ui/wc 等）。',
          }],
        }],
      },
    },
    ...userConfigs,
  )
}
