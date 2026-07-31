import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  entry: { index: 'src/index.ts', a11y: 'src/a11y/index.ts', position: 'src/position/index.ts' },
})
