// @vitest-environment jsdom
// 对话框全屏：判据与皮肤在别处，这里核自定义元素这一侧——fullscreen 属性进了机器，标记落在作者写的定位层与面板上。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface DialogHost extends HTMLElement {
  updateComplete: Promise<unknown>
}

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(el: DialogHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="dialog"][data-part="${name}"]`)!
}

describe('xh-dialog 的 fullscreen', () => {
  it('写成属性：标记落在 positioner 与 content 上，开着拖动也不带拖动标记；撤掉属性标记随之撤下', async () => {
    document.body.innerHTML = `
      <xh-dialog default-open fullscreen panel-draggable>
        <div data-xh-part="backdrop"></div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <h2 data-xh-part="title">编辑报表</h2>
          </div>
        </div>
      </xh-dialog>`
    const el = document.querySelector('xh-dialog') as DialogHost
    await settle(el)

    expect(part('positioner').hasAttribute('data-fullscreen')).toBe(true)
    expect(part('content').hasAttribute('data-fullscreen')).toBe(true)
    expect(part('content').hasAttribute('data-draggable')).toBe(false)

    el.removeAttribute('fullscreen')
    await settle(el)
    expect(part('positioner').hasAttribute('data-fullscreen')).toBe(false)
    expect(part('content').hasAttribute('data-fullscreen')).toBe(false)
    expect(part('content').hasAttribute('data-draggable')).toBe(true)
  })
})
