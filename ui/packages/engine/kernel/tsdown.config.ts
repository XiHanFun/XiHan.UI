import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  unbundle: true,
  entry: {
    'index': 'src/index.ts',
    'skin-check': 'src/diagnostics/skin-check.ts',
    'deprecations': 'src/diagnostics/deprecations.ts',
    'metadata': 'src/metadata.ts',
  },
})
