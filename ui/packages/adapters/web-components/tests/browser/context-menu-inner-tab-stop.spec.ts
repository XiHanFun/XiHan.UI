// 触发区包着自带 Tab 位的画布（设计器的做法）：真实键盘从起点 Tab 一下直接落到画布，触发区不再多停一下；
// 画布上按 Shift+F10 展开菜单，Esc 关掉后焦点回到画布；触发区里只有文字时照旧自带 Tab 位。
import type { XhContextMenuElement } from '../../src/elements/context-menu'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(content: string): Promise<void> {
  document.body.innerHTML = `
    <div style="inline-size: 360px">
      <button type="button" data-test-start>起点</button>
      <xh-context-menu>
        <div slot="trigger">${content}</div>
      </xh-context-menu>
      <button type="button" data-test-end>终点</button>
    </div>
  `
  const menu = document.querySelector<XhContextMenuElement>('xh-context-menu')!
  menu.collection = [{ value: 'copy', label: '复制' }, { value: 'paste', label: '粘贴' }]
  await menu.updateComplete
  await settle()
}

const CANVAS = '<div tabindex="0" aria-label="画布" data-test-canvas style="block-size: 120px">销售额 ¥217,664 占比 8.8%</div>'

function el(selector: string): HTMLElement {
  return document.querySelector<HTMLElement>(selector)!
}

function trigger(): HTMLElement {
  return el('[data-scope="context-menu"][data-part="trigger"]')
}

describe('xh-context-menu 触发区里已有 Tab 位', () => {
  it('从起点 Tab 一下直接落到画布，再 Tab 一下到终点；Shift + Tab 原路回去', async () => {
    await mount(CANVAS)
    expect(trigger().hasAttribute('tabindex')).toBe(false)
    el('[data-test-start]').focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(el('[data-test-canvas]'))
    await userEvent.tab()
    expect(document.activeElement).toBe(el('[data-test-end]'))
    await userEvent.tab({ shift: true })
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(el('[data-test-start]'))
  })

  it('画布上按 Shift + F10 展开、焦点落到首条；Esc 关掉后焦点回到画布', async () => {
    await mount(CANVAS)
    el('[data-test-start]').focus()
    await userEvent.tab()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await settle()
    const first = el('[data-scope="context-menu"][data-part="item"][data-value="copy"]')
    expect(document.activeElement).toBe(first)
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(el('[data-scope="context-menu"][data-part="content"]').hidden).toBe(true)
    expect(document.activeElement).toBe(el('[data-test-canvas]'))
  })

  it('选中条目关掉后焦点同样回到画布', async () => {
    await mount(CANVAS)
    const picked: string[] = []
    el('xh-context-menu').addEventListener('select', event => picked.push((event as CustomEvent<{ value: string }>).detail.value))
    el('[data-test-canvas]').focus()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await settle()
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await settle()
    expect(picked).toEqual(['paste'])
    expect(document.activeElement).toBe(el('[data-test-canvas]'))
  })

  it('触发区里只有文字：照旧自带 Tab 位，Esc 后焦点回到触发区', async () => {
    await mount('右键这块区域')
    el('[data-test-start]').focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(trigger())
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await settle()
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(document.activeElement).toBe(trigger())
  })
})
