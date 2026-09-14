import type { StepWithExpect } from '../../conformance/types'

/**
 * 在禁用部件上直接派发 click 事件，用于验 connect 里的禁用守卫。
 * 不能用 `click` 步骤：`el.click()` 在禁用控件上被激活行为短路、事件不派发，断言恒绿。
 */
export function dispatchClickOnDisabled(scope: string, part: string, expect: StepWithExpect['expect']): StepWithExpect {
  return {
    kind: 'raw',
    why: '禁用控件上 el.click() 会被激活行为短路、事件不派发，断言恒成立；必须直接派发才验得到守卫',
    run: ({ doc }) => {
      // part 可写成 name[i]，下标须拆出来，拼进选择器会永远选不中
      const matched = /^([a-z-]+)\[(\d+)\]$/.exec(part)
      const name = matched ? matched[1]! : part
      const index = matched ? Number(matched[2]) : 0
      const el = doc.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)[index]
      if (!el)
        throw new Error(`找不到 ${scope} 的 ${part} 部件`)
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    },
    expect,
  }
}
