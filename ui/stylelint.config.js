import xihanStylelint from '@xihan-ui/stylelint-config'

/** @type {import('stylelint').Config} */
export default {
  ...xihanStylelint,
  ignoreFiles: ['**/dist/**', '**/node_modules/**', 'packages/icons/**'],
}
