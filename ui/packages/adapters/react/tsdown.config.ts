import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  unbundle: true,
  entry: {
    index: 'src/index.ts',
    backgrounds: 'src/backgrounds.tsx',
    behavior: 'src/behavior.ts',
    sound: 'src/sound.ts',
  },
  neverBundle: ['react', 'react-dom', 'react/jsx-runtime'],
})
