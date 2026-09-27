// @vitest-environment jsdom
//
// 作者把完整路径逐层写成部件、在首层之后放一个装着触发器的省略位：元素按 max-items 收起中间层，
// 按下触发器放出全部层级、省略位收起，焦点落到第一条展开出来的链接。
import { beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

beforeEach(() => {
  document.body.innerHTML = ''
})

async function settle(el: Updatable): Promise<void> {
  await el.updateComplete
  await el.updateComplete
  await new Promise(r => setTimeout(r, 0))
  await el.updateComplete
}

const LEVELS = ['首页', '文档', '指南', '组件', '面包屑']

function mount(attrs: string): Updatable {
  const host = document.createElement('div')
  const items = LEVELS.map((label, i) => {
    const link = i === LEVELS.length - 1
      ? `<a data-xh-part="link" current>${label}</a>`
      : `<a data-xh-part="link" href="#/${i}">${label}</a>`
    const item = `<li data-xh-part="item">${link}</li>`
    const ellipsis = i === 0
      ? '<li data-xh-part="separator"></li><li data-xh-part="ellipsis"><button data-xh-part="ellipsis-trigger"></button></li>'
      : ''
    return i < LEVELS.length - 1 ? `${item}${ellipsis}<li data-xh-part="separator"></li>` : item
  }).join('')
  host.innerHTML = `<xh-breadcrumb ${attrs}><nav data-xh-part="root"><ol data-xh-part="list">${items}</ol></nav></xh-breadcrumb>`
  document.body.appendChild(host)
  return host.querySelector('xh-breadcrumb') as Updatable
}

function hiddenLevels(el: HTMLElement): string[] {
  return [...el.querySelectorAll<HTMLElement>('[data-xh-part="item"]')]
    .filter(item => item.hidden)
    .map(item => item.textContent ?? '')
}

describe('xh-breadcrumb 折叠与展开', () => {
  it('按 max-items 收起中间层，省略位与触发器在场', async () => {
    const el = mount('max-items="3"')
    await settle(el)
    expect(hiddenLevels(el)).toEqual(['文档', '指南'])
    const ellipsis = el.querySelector<HTMLElement>('[data-xh-part="ellipsis"]')!
    expect(ellipsis.hidden).toBe(false)
    expect(ellipsis.hasAttribute('aria-hidden')).toBe(false)
    expect(el.querySelector('[data-xh-part="ellipsis-trigger"]')!.getAttribute('aria-label')).toBe('Show full path')
  })

  it('按下触发器放出全部层级，省略位收起，焦点落到第一条展开出来的链接', async () => {
    const el = mount('max-items="3"')
    await settle(el)
    const trigger = el.querySelector<HTMLButtonElement>('[data-xh-part="ellipsis-trigger"]')!
    trigger.focus()
    trigger.click()
    await settle(el)
    expect(hiddenLevels(el)).toEqual([])
    expect(el.querySelector<HTMLElement>('[data-xh-part="ellipsis"]')!.hidden).toBe(true)
    expect(document.activeElement).toBe(el.querySelectorAll('[data-xh-part="link"]')[1])
  })

  it('不写 max-items 时一层都不收起', async () => {
    const el = mount('')
    await settle(el)
    expect(hiddenLevels(el)).toEqual([])
  })
})
