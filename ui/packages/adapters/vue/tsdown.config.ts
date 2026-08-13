import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  unbundle: true,
  entry: {
    index: 'src/index.ts',
    backgrounds: 'src/backgrounds.ts',
    sound: 'src/sound.ts',
  },
})
