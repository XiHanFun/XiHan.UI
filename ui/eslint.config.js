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
)
