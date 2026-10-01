// 跑马灯（Web Components）的 root 内联样式：元素只写自己的速度与实测长度两条变量，
// 作者写在 root 上的内联样式（限宽、自定的一份长度）原样保留；速度改了只换那一条，撤了只撤那一条。
// 限宽落成的窗宽与换算出的一圈时长只有真实浏览器量得出来。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface XhMarqueeHost extends HTMLElement {
  updateComplete: Promise<unknown>
}

defineXhElements()

/** 作者在 root 上自定的一份长度（像素）：皮肤以它为准，不用实测值，一圈时长因此算得出来。 */
const AUTHOR_SPAN = 300

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

/** 等实测长度写回根上：尺寸观察器在布局之后回调，再等元素把这一轮接完。 */
async function settle(element: XhMarqueeHost): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await new Promise(resolve => requestAnimationFrame(resolve))
    await element.updateComplete
  }
}

async function mount(): Promise<{ element: XhMarqueeHost, root: HTMLElement, content: HTMLElement }> {
  host = document.createElement('div')
  host.innerHTML = `
    <xh-marquee speed="50">
      <div data-xh-part="root" style="max-inline-size: 20rem; --xh-marquee-span: ${AUTHOR_SPAN}">
        <div data-xh-part="content">通知：系统将于今晚进行维护，届时部分功能暂不可用</div>
      </div>
    </xh-marquee>`
  document.body.append(host)
  const element = host.querySelector<XhMarqueeHost>('xh-marquee')!
  await settle(element)
  return {
    element,
    root: element.querySelector<HTMLElement>('[data-part="root"]')!,
    content: element.querySelector<HTMLElement>('[data-part="content"]')!,
  }
}

/** 20rem 换成像素：按根字号算，不假设缺省 16px。 */
function maxInline(): number {
  return 20 * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
}

/** 一圈的时长（秒）：铺一份时走两倍长度，长度取作者自定的那份。 */
function duration(content: HTMLElement): number {
  return Number.parseFloat(getComputedStyle(content).animationDuration)
}

describe('xh-marquee 的 root 内联样式', () => {
  it('作者写在 root 上的限宽与长度留着，元素自己的速度与实测长度照样写上', async () => {
    const { root, content } = await mount()
    expect(root.style.maxInlineSize).toBe('20rem')
    expect(root.style.getPropertyValue('--xh-marquee-span').trim()).toBe(String(AUTHOR_SPAN))
    expect(root.getBoundingClientRect().width).toBeCloseTo(maxInline(), 0)
    expect(root.style.getPropertyValue('--xh-marquee-speed')).toBe('50')
    expect(Number(root.style.getPropertyValue('--xh-_marquee-measured-span'))).toBeGreaterThan(0)
    expect(duration(content)).toBeCloseTo(2 * AUTHOR_SPAN / 50, 3)
  })

  it('速度改了只换那一条，撤了只撤那一条，作者的样式始终不动', async () => {
    const { element, root, content } = await mount()
    element.setAttribute('speed', '100')
    await settle(element)
    expect(root.style.getPropertyValue('--xh-marquee-speed')).toBe('100')
    expect(duration(content)).toBeCloseTo(2 * AUTHOR_SPAN / 100, 3)
    expect(root.style.maxInlineSize).toBe('20rem')

    element.removeAttribute('speed')
    await settle(element)
    expect(root.style.getPropertyValue('--xh-marquee-speed')).toBe('')
    // 速度退回皮肤缺省的每秒 60 像素
    expect(duration(content)).toBeCloseTo(2 * AUTHOR_SPAN / 60, 3)
    expect(root.style.maxInlineSize).toBe('20rem')
    expect(root.style.getPropertyValue('--xh-marquee-span').trim()).toBe(String(AUTHOR_SPAN))
    expect(root.getBoundingClientRect().width).toBeCloseTo(maxInline(), 0)
  })
})
