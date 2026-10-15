import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  entry: {
    index: 'src/index.ts',
    // 文本模板不依赖表达式本体，只用模板的宿主不为解析器与求值器付字节
    template: 'src/template.ts',
  },
})
