// 树族分支箭头的朝向随书写方向：收起时指向行尾（ltr 朝右、rtl 朝左），展开时统一朝下。
// 方向按就近的 dir 走——rtl 页面里局部写回 ltr 的树按 ltr 朝向，不被外层的 rtl 翻过去。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

/** 旋转角度（deg），none 记作 0 */
function angle(el: HTMLElement): number {
  const value = getComputedStyle(el).rotate
  return value === 'none' ? 0 : Number.parseFloat(value)
}

describe.each(['tree', 'tree-select'] as const)('%s 分支箭头朝向', (scope) => {
  function mount(): Record<string, HTMLElement> {
    const chevron = (id: string, state: 'open' | 'closed'): string =>
      `<span data-id="${id}" data-scope="${scope}" data-part="branch-indicator" data-state="${state}"></span>`
    host = document.createElement('div')
    host.innerHTML = `
      <div dir="ltr">${chevron('ltr-closed', 'closed')}${chevron('ltr-open', 'open')}</div>
      <div dir="rtl">
        ${chevron('rtl-closed', 'closed')}${chevron('rtl-open', 'open')}
        <div dir="ltr">${chevron('nested-closed', 'closed')}${chevron('nested-open', 'open')}</div>
      </div>`
    document.body.append(host)
    for (const el of host.querySelectorAll<HTMLElement>('[data-part]'))
      el.style.transition = 'none'
    return Object.fromEntries([...host.querySelectorAll<HTMLElement>('[data-id]')].map(el => [el.dataset.id!, el]))
  }

  it('收起指向行尾、展开朝下，rtl 里局部写回 ltr 的按 ltr 走', () => {
    const at = mount()
    expect(angle(at['ltr-closed']!)).toBe(0)
    expect(angle(at['ltr-open']!)).toBe(90)
    expect(angle(at['rtl-closed']!)).toBe(180)
    expect(angle(at['rtl-open']!)).toBe(90)
    expect(angle(at['nested-closed']!)).toBe(0)
    expect(angle(at['nested-open']!)).toBe(90)
  })
})
