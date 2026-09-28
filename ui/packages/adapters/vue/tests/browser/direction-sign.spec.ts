// 书写方向的符号 --xh-direction-sign：就近的 dir 属性决定、靠继承传到子树。
// rtl 里局部写回 ltr 的子树跟着翻回，再套一层 rtl 又翻过去；密度等轴的边界不会把它重置。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function sign(el: Element): string {
  return getComputedStyle(el).getPropertyValue('--xh-direction-sign').trim()
}

describe('--xh-direction-sign', () => {
  it('没写 dir 时为 1，rtl 子树为 -1，就近的 dir 生效', () => {
    host = document.createElement('div')
    host.innerHTML = `
      <div data-id="plain"></div>
      <div dir="rtl">
        <div data-id="rtl"></div>
        <div data-density="comfortable"><div data-id="rtl-density"></div></div>
        <div dir="ltr">
          <div data-id="ltr-in-rtl"></div>
          <div dir="RTL"><div data-id="rtl-in-ltr-in-rtl"></div></div>
        </div>
        <div dir="auto"><div data-id="auto-in-rtl"></div></div>
      </div>`
    document.body.append(host)
    const at = (id: string): Element => host!.querySelector(`[data-id='${id}']`)!
    expect(sign(at('plain'))).toBe('1')
    expect(sign(at('rtl'))).toBe('-1')
    expect(sign(at('rtl-density'))).toBe('-1')
    expect(sign(at('ltr-in-rtl'))).toBe('1')
    expect(sign(at('rtl-in-ltr-in-rtl'))).toBe('-1')
    expect(sign(at('auto-in-rtl'))).toBe('-1')
  })
})
