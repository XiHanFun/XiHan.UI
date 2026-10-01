// 浮动按钮（Web Components）的 root 内联样式：元素只写自己的那几条几何自定义属性，
// 作者写在 root 上的内联样式（文档示例里的 position: static）原样保留；位置换了形态时，
// 上一帧写过、这一帧不再给的那几条撤掉。计算样式只有真实浏览器量得出来。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface XhFloatButtonHost extends HTMLElement {
  updateComplete: Promise<unknown>
  position?: unknown
}

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function settle(element: XhFloatButtonHost): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await Promise.resolve()
    await element.updateComplete
  }
}

async function mount(): Promise<{ element: XhFloatButtonHost, root: HTMLElement }> {
  host = document.createElement('div')
  host.innerHTML = `
    <xh-float-button>
      <div data-xh-part="root" style="position: static">
        <button data-xh-part="trigger"></button>
        <div data-xh-part="list"></div>
      </div>
    </xh-float-button>`
  document.body.append(host)
  const element = host.querySelector<XhFloatButtonHost>('xh-float-button')!
  await settle(element)
  return { element, root: element.querySelector<HTMLElement>('[data-part="root"]')! }
}

describe('xh-float-button 的 root 内联样式', () => {
  it('作者写在 root 上的 position: static 留着，元素自己的贴边距离照样写上', async () => {
    const { root } = await mount()
    expect(root.style.position).toBe('static')
    expect(getComputedStyle(root).position).toBe('static')
    expect(root.style.getPropertyValue('--xh-_float-button-offset')).toBe('24px')
  })

  it('位置从一点换成贴边：坐标那两条撤掉、比例写上，作者的样式始终不动', async () => {
    const { element, root } = await mount()
    element.position = { x: 40, y: 60 }
    await settle(element)
    expect(root.style.getPropertyValue('--xh-_float-button-x')).toBe('40px')
    element.position = { edge: 'inline-end', ratio: 0.5 }
    await settle(element)
    expect(root.style.getPropertyValue('--xh-_float-button-x')).toBe('')
    expect(root.style.getPropertyValue('--xh-_float-button-ratio')).toBe('0.5')
    expect(root.style.position).toBe('static')
  })
})
