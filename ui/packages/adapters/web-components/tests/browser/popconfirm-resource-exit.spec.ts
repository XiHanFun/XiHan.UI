import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function mount(): HTMLElement {
  host = document.createElement('div')
  host.innerHTML = `<xh-popconfirm open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">删除</button>
      <div data-xh-part="positioner"><div data-xh-part="content">
        确定删除？
        <button data-xh-part="cancel-trigger">取消</button>
        <button data-xh-part="confirm-trigger">确定</button>
      </div></div>
    </div>
  </xh-popconfirm>`
  document.body.append(host)
  return host.firstElementChild as HTMLElement
}

afterEach(() => {
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe('wc popconfirm 真实退场资源', () => {
  it('有限动画完成前保留 Layer，逻辑关闭立即失活，完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-popconfirm-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='popconfirm'][data-part='content'][data-state='closed'] {
        animation: test-popconfirm-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const element = mount()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    element.setAttribute('open', 'false')
    await settle()
    const content = document.querySelector<HTMLElement>("[data-scope='popconfirm'][data-part='content']")!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    const animation = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-popconfirm-exit')
    expect(animation).toBeDefined()
    animation!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
