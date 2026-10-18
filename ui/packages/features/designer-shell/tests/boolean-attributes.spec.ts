// @vitest-environment jsdom
// 设计器零件的布尔 attribute 与库内元素同一个三态转换器：不写交给缺省、显式 "false" 为假、其余为真。
import { BOOLEAN_CONVERTER } from '@xihan-ui/web-components/authoring'
import { describe, expect, it } from 'vitest'
import { DESIGNER_SHELL_ELEMENTS } from '../src/define'

interface DeclaredClass {
  readonly name: string
  readonly observedAttributes: string[]
  readonly elementProperties: Map<string, { type?: unknown, converter?: unknown }>
}

const classes = Object.values(DESIGNER_SHELL_ELEMENTS) as unknown as DeclaredClass[]

describe('设计器零件的布尔 attribute 三态', () => {
  it('不再用原生布尔的 type: Boolean，布尔属性都用 authoring 导出的转换器', () => {
    // 先读 observedAttributes 让属性声明定稿
    for (const ctor of classes)
      void ctor.observedAttributes
    const native = classes.flatMap(ctor => [...ctor.elementProperties].filter(([, options]) => options.type === Boolean).map(([name]) => `${ctor.name}.${name}`))
    expect(native).toEqual([])
    const shared = classes.flatMap(ctor => [...ctor.elementProperties].filter(([, options]) => options.converter === BOOLEAN_CONVERTER).map(([name]) => `${ctor.name}.${name}`))
    expect(shared).toHaveLength(12)
  })
})
