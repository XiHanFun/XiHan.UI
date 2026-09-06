import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  unbundle: true,
  entry: {
    index: 'src/index.ts',
    behavior: 'src/behavior.ts',
  },
  neverBundle: ['react', 'react-dom', 'react/jsx-runtime'],
})
