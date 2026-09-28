import xihanUi from '@xihan-ui/eslint-config'

export default xihanUi(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/generated/**',
      'pnpm-lock.yaml',
    ],
  },
  {
    // 组件说明（*.doc.md）里的代码块会原样进文档站，给使用者复制走：按文档站的写法核对
    // （双引号、带分号），与 docs/eslint.config.js 同一套，同一段代码不在两边来回改
    files: ['**/*.doc.md/**'],
    rules: {
      'style/quotes': ['error', 'double', { avoidEscape: true }],
      'style/semi': ['error', 'always'],
    },
  },
)
