import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  entry: {
    index: 'src/index.ts',
    locale: 'src/locale/index.ts',
    language: 'src/language.ts',
  },
})
