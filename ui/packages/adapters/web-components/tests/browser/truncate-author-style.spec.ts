// 文本截断（Web Components）的 root 内联样式：元素只写自己的那一条行数自定义属性，
// 作者写在 root 上的内联样式（限宽一类）原样保留；行数改了只换那一条。
// 限宽落成的盒宽与裁行的计算值只有真实浏览器量得出来。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface XhTruncateHost extends HTMLElement {
  updateComplete: Promise<unknown>
  lines?: number
}

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function settle(element: XhTruncateHost): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await Promise.resolve()
    await element.updateComplete
  }
}

async function mount(): Promise<{ element: XhTruncateHost, root: HTMLElement }> {
  host = document.createElement('div')
  host.innerHTML = `
    <xh-truncate lines="2">
      <div data-xh-part="root" style="max-inline-size: 20rem">${'一段放不进两行的说明文字，'.repeat(20)}</div>
    </xh-truncate>`
  document.body.append(host)
  const element = host.querySelector<XhTruncateHost>('xh-truncate')!
  await settle(element)
  return { element, root: element.querySelector<HTMLElement>('[data-part="root"]')! }
}

/** 20rem 换成像素：按根字号算，不假设缺省 16px。 */
function maxInline(): number {
  return 20 * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
}

describe('xh-truncate 的 root 内联样式', () => {
  it('作者写在 root 上的限宽留着，元素自己的行数照样写上', async () => {
    const { root } = await mount()
    expect(root.style.maxInlineSize).toBe('20rem')
    expect(root.getBoundingClientRect().width).toBeCloseTo(maxInline(), 0)
    expect(root.style.getPropertyValue('--xh-_truncate-lines')).toBe('2')
    expect(getComputedStyle(root).getPropertyValue('-webkit-line-clamp')).toBe('2')
  })

  it('行数改了只换行数那一条，作者的样式始终不动', async () => {
    const { element, root } = await mount()
    element.lines = 3
    await settle(element)
    expect(root.style.getPropertyValue('--xh-_truncate-lines')).toBe('3')
    expect(getComputedStyle(root).getPropertyValue('-webkit-line-clamp')).toBe('3')
    expect(root.style.maxInlineSize).toBe('20rem')
    expect(root.getBoundingClientRect().width).toBeCloseTo(maxInline(), 0)
  })
})
