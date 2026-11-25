// @vitest-environment jsdom
// <xh-aspect-ratio> 的 ratio 特性按 CSS 的 <ratio> 读：HTML 里写不出 16 / 9 这样的表达式，
// 分数写法要读成同一个数；读不出数的交给 connect 按缺省 1 处理，不把 NaN 写进样式。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElement } from '../src/define'
import { XhAspectRatioElement } from '../src/elements/aspect-ratio'

defineXhElement('xh-aspect-ratio', XhAspectRatioElement)

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function render(attrs: string): Promise<XhAspectRatioElement> {
  host = document.createElement('div')
  host.innerHTML = `<xh-aspect-ratio ${attrs}><div data-xh-part="root"><div>画面</div></div></xh-aspect-ratio>`
  document.body.appendChild(host)
  const el = host.firstElementChild as XhAspectRatioElement
  await el.updateComplete
  return el
}

/** root 上写给皮肤的私有槽。 */
function slotOf(el: Element): string {
  return el.querySelector<HTMLElement>('[data-xh-part="root"]')!.style.getPropertyValue('--xh-_aspect-ratio')
}

describe('xh-aspect-ratio 的 ratio 特性', () => {
  it('缺席与空串都是没给：落到缺省 1', async () => {
    expect(slotOf(await render(''))).toBe('1')
    expect(slotOf(await render('ratio=""'))).toBe('1')
  })

  it('单个数原样读', async () => {
    const el = await render('ratio="1.5"')
    expect(el.ratio).toBe(1.5)
    expect(slotOf(el)).toBe('1.5')
  })

  it('分数写法读成宽 ÷ 高，斜杠两侧有没有空格都一样', async () => {
    expect((await render('ratio="16/9"')).ratio).toBe(16 / 9)
    expect((await render('ratio="16 / 9"')).ratio).toBe(16 / 9)
    expect(slotOf(await render('ratio="4/3"'))).toBe(String(4 / 3))
  })

  it('读不出数的按缺省 1：多个斜杠、非数字、除以 0', async () => {
    expect(slotOf(await render('ratio="16/9/2"'))).toBe('1')
    expect(slotOf(await render('ratio="宽"'))).toBe('1')
    expect(slotOf(await render('ratio="16/0"'))).toBe('1')
  })

  it('改特性当场重算；经 property 直接给数同样生效', async () => {
    const el = await render('ratio="1"')
    el.setAttribute('ratio', '21/9')
    await el.updateComplete
    expect(slotOf(el)).toBe(String(21 / 9))
    el.ratio = 2
    await el.updateComplete
    expect(slotOf(el)).toBe('2')
  })
})
