// 面包屑的折叠路径：元素按 max-items 收起中间层，紧跟在被收起层后面的分隔符由皮肤一并收起；
// 展开后省略位收起，它后面的分隔符同样收起。路径里任何时候都不该出现两个挨着的分隔符，
// 省略位触发器不写内容时皮肤画一枚字形。可见性与字形尺寸只有真实 Chromium 算得出。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface Updatable extends HTMLElement {
  updateComplete: Promise<unknown>
}

async function settle(): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    for (const element of document.querySelectorAll<Updatable>('xh-breadcrumb'))
      await element.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

afterEach(() => {
  document.body.innerHTML = ''
})

const LEVELS = ['首页', '文档', '指南', '组件', '面包屑']

async function mount(): Promise<HTMLElement> {
  const items = LEVELS.map((label, i) => {
    const last = i === LEVELS.length - 1
    const item = `<li data-xh-part="item"><a data-xh-part="link" ${last ? 'current' : `href="#/${i}"`}>${label}</a></li>`
    const ellipsis = i === 0
      ? '<li data-xh-part="separator"></li><li data-xh-part="ellipsis"><button data-xh-part="ellipsis-trigger"></button></li>'
      : ''
    return last ? item : `${item}${ellipsis}<li data-xh-part="separator"></li>`
  }).join('')
  document.body.innerHTML = `<xh-breadcrumb max-items="3"><nav data-xh-part="root"><ol data-xh-part="list">${items}</ol></nav></xh-breadcrumb>`
  await settle()
  return document.querySelector<HTMLElement>('[data-scope="breadcrumb"][data-part="list"]')!
}

/** 列表里此刻画得出来的子项，按部件名记。 */
function visibleSequence(list: HTMLElement): string[] {
  return [...list.children]
    .filter(child => getComputedStyle(child).display !== 'none')
    .map(child => (child as HTMLElement).dataset.part === 'item' ? child.textContent ?? '' : (child as HTMLElement).dataset.part ?? '')
}

describe('wc breadcrumb 折叠路径', () => {
  it('收起中间层时，被收起层后面的分隔符一并收起：首层 / 省略位 / 末两层', async () => {
    const list = await mount()
    expect(visibleSequence(list)).toEqual(['首页', 'separator', 'ellipsis', 'separator', '组件', 'separator', '面包屑'])
  })

  it('触发器不写内容时皮肤画一枚与文字同高的字形', async () => {
    await mount()
    const trigger = document.querySelector<HTMLElement>('[data-scope="breadcrumb"][data-part="ellipsis-trigger"]')!
    const glyph = getComputedStyle(trigger, '::before')
    expect(glyph.content).toBe('""')
    expect(Number.parseFloat(glyph.inlineSize)).toBeGreaterThan(0)
    expect(trigger.getBoundingClientRect().width).toBeGreaterThan(0)
  })

  it('展开后省略位与它后面的分隔符都收起，路径里没有挨着的分隔符', async () => {
    const list = await mount()
    const trigger = list.querySelector<HTMLButtonElement>('[data-part="ellipsis-trigger"]')!
    trigger.focus()
    trigger.click()
    await settle()
    expect(visibleSequence(list)).toEqual(['首页', 'separator', '文档', 'separator', '指南', 'separator', '组件', 'separator', '面包屑'])
    expect(document.activeElement?.textContent).toBe('文档')
  })
})
