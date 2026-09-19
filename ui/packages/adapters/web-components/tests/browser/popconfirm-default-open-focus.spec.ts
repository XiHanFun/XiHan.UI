import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  await Promise.resolve()
}

function mount(): HTMLElement {
  host = document.createElement('div')
  host.innerHTML = `<xh-popconfirm default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">删除</button>
      <div data-xh-part="positioner"><div data-xh-part="content">
        <p data-xh-part="title">确定删除？</p>
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

describe('wc popconfirm default-open 初始焦点', () => {
  // 焦点域在首轮渲染前就把焦点放到了取消按钮上；首轮渲染把 positioner 搬进 portal 壳，
  // 节点摘下再插回会失焦，非模态浮层不会再拉回来。物理搬迁必须替它保住焦点。
  it('positioner 搬进 portal 后焦点仍在取消按钮上', async () => {
    const element = mount()
    const cancel = element.querySelector<HTMLButtonElement>('[data-xh-part="cancel-trigger"]')!
    await settle()
    await settle()

    const positioner = document.querySelector<HTMLElement>('[data-scope=\'popconfirm\'][data-part=\'positioner\']')!
    expect(positioner.parentElement?.hasAttribute('data-xh-portal-shell')).toBe(true)
    expect(document.activeElement).toBe(cancel)
  })
})
