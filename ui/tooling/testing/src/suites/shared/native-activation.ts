import type { StepWithExpect } from '../../conformance/types'

/**
 * 核对部件确实是原生 `<button type="button">`。
 * Enter/Space 的激活由平台完成，jsdom 不做这层翻译，直接发按键验不到东西；漏了 type
 * 则按钮落在 form 里会变成 submit。
 */
export function nativeActivation(scope: string, part: string): StepWithExpect {
  return {
    kind: 'raw',
    why: 'Enter/Space 靠原生按钮的激活行为，jsdom 不翻译按键；该守的是"它确实是原生按钮"',
    run: ({ doc }) => {
      const el = doc.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)
      if (!el)
        throw new Error(`找不到 ${scope} 的 ${part} 部件`)
      if (el.tagName !== 'BUTTON')
        throw new Error(`${scope}.${part} 必须是原生 <button>（Enter/Space 的激活由平台负责），实际是 <${el.tagName.toLowerCase()}>`)
      if (el.getAttribute('type') !== 'button')
        throw new Error(`${scope}.${part} 缺 type="button"：落在 form 里会变成 submit，Enter 会直接提交表单`)
    },
  }
}

/** roving tabindex：整组只留一个 Tab 停靠点，没有锚点条目时由容器兜底（tabindex=0）。 */
export function singleTabStop(scope: string, itemPart: string, containerPart: string): StepWithExpect {
  return {
    kind: 'raw',
    why: 'Tab 停靠点的数目是跨节点的计数，逐个部件的属性期望表达不了',
    run: ({ doc }) => {
      const items = [...doc.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${itemPart}"]`)]
      const container = doc.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${containerPart}"]`)
      const stops = items.filter(el => el.getAttribute('tabindex') === '0')
      const containerStop = container?.getAttribute('tabindex') === '0'
      if (stops.length > 1)
        throw new Error(`${scope} 组内有 ${stops.length} 个 Tab 停靠点，应当只有一个`)
      if (stops.length === 0 && !containerStop)
        throw new Error(`${scope} 组内一个 Tab 停靠点都没有，且容器也没兜底——键盘再也进不来`)
      if (stops.length === 1 && containerStop)
        throw new Error(`${scope} 已有锚点条目占着 Tab 位，容器不该再占一个`)
    },
  }
}
