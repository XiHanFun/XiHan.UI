import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  unbundle: true,
  entry: {
    index: 'src/index.ts',
    // 内建语言包：整张文案表一份一种语言，不进主入口
    locale: 'src/locale/index.ts',
  },
})
