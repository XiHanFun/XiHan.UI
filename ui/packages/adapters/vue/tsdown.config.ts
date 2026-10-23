import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  unbundle: true,
  entry: {
    index: 'src/index.ts',
    backgrounds: 'src/backgrounds.ts',
    behavior: 'src/behavior.ts',
    locale: 'src/locale.ts',
    plugin: 'src/plugin.ts',
    resolver: 'src/resolver.ts',
    sound: 'src/sound.ts',
  },
})
