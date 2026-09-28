import type { RawStepContext, StepWithExpect } from '../../conformance/types'

// 面板手势（对话框拖动、抽屉改尺）的共用步骤：位移与尺寸写在内联样式的私有槽里，
// 三端序列化 style 属性的写法各不相同，只能按槽取值比对。

/** 断言某个部件内联样式里某个私有槽的取值。 */
export function expectInlineSlot(scope: string, part: string, slot: string, value: string, why: string): StepWithExpect {
  return {
    kind: 'raw',
    why,
    run: ({ doc }: RawStepContext) => {
      const el = doc.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)
      if (!el)
        throw new Error(`找不到 ${scope}/${part}`)
      const actual = el.style.getPropertyValue(slot).trim()
      if (actual !== value)
        throw new Error(`${scope}/${part} 的 ${slot} 应为 ${JSON.stringify(value)}，实际 ${JSON.stringify(actual)}`)
    },
  }
}

/** 断言焦点没有落在某个部件上，且落在带 data-testid 的那个节点上。 */
export function expectFocusSkips(scope: string, part: string, testid: string): StepWithExpect {
  return {
    kind: 'raw',
    why: '初始焦点要越过拖动把手落到第一个真正的控件上；把手与控件都不是同一个部件，只能按节点比对',
    run: ({ doc }: RawStepContext) => {
      const active = doc.activeElement as HTMLElement | null
      if (active?.matches(`[data-scope="${scope}"][data-part="${part}"]`))
        throw new Error(`初始焦点落在了 ${scope}/${part} 上`)
      if (active?.getAttribute('data-testid') !== testid)
        throw new Error(`初始焦点应在 data-testid=${testid} 上，实际在 ${active?.outerHTML.slice(0, 80) ?? 'null'}`)
    },
  }
}
