// 水印（Web Components）的 root 内联样式：元素只写自己的图样与步距两条变量，
// 作者写在 root 上的内联样式（限宽一类）原样保留；文字改了只换那两条，没有可印的文字时只撤那两条。
// 限宽落成的盒宽与印子那层遮罩的计算值只有真实浏览器量得出来。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface XhWatermarkHost extends HTMLElement {
  updateComplete: Promise<unknown>
}

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function settle(element: XhWatermarkHost): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await Promise.resolve()
    await element.updateComplete
  }
}

async function mount(): Promise<{ element: XhWatermarkHost, root: HTMLElement }> {
  host = document.createElement('div')
  host.innerHTML = `
    <xh-watermark text="曦寒">
      <div data-xh-part="root" style="max-inline-size: 20rem">
        <div data-xh-part="content">仅供内部评审的一段正文</div>
      </div>
    </xh-watermark>`
  document.body.append(host)
  const element = host.querySelector<XhWatermarkHost>('xh-watermark')!
  await settle(element)
  return { element, root: element.querySelector<HTMLElement>('[data-part="root"]')! }
}

/** 20rem 换成像素：按根字号算，不假设缺省 16px。 */
function maxInline(): number {
  return 20 * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
}

/** 印子那层伪元素上落定的遮罩图。 */
function mask(root: HTMLElement): string {
  return getComputedStyle(root, '::after').maskImage
}

describe('xh-watermark 的 root 内联样式', () => {
  it('作者写在 root 上的限宽留着，元素自己的图样与步距照样写上', async () => {
    const { root } = await mount()
    expect(root.style.maxInlineSize).toBe('20rem')
    expect(root.getBoundingClientRect().width).toBeCloseTo(maxInline(), 0)
    expect(root.style.getPropertyValue('--xh-watermark-image')).toContain('data:image/svg+xml')
    expect(root.style.getPropertyValue('--xh-watermark-tile')).toMatch(/^\d+px \d+px$/)
    expect(mask(root)).toContain('data:image/svg+xml')
  })

  it('文字改了只换图样那两条，文字撤了只撤那两条，作者的样式始终不动', async () => {
    const { element, root } = await mount()
    const before = root.style.getPropertyValue('--xh-watermark-image')
    element.setAttribute('text', '曦寒前端组件库')
    await settle(element)
    expect(root.style.getPropertyValue('--xh-watermark-image')).not.toBe(before)
    expect(root.style.maxInlineSize).toBe('20rem')

    element.removeAttribute('text')
    await settle(element)
    expect(root.getAttribute('data-state')).toBe('empty')
    expect(root.style.getPropertyValue('--xh-watermark-image')).toBe('')
    expect(root.style.getPropertyValue('--xh-watermark-tile')).toBe('')
    expect(root.style.maxInlineSize).toBe('20rem')
    expect(root.getBoundingClientRect().width).toBeCloseTo(maxInline(), 0)
  })
})
