// @vitest-environment jsdom

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

const CASES = [
  { tag: 'xh-dialog', scope: 'dialog' },
  { tag: 'xh-drawer', scope: 'drawer' },
] as const

/**
 * 浮层的作者节点一向常驻、收起只隐藏；写进 content 里一个 `<template>` 的内容才按 headless 的判定挂卸：
 * 缺省第一次打开克隆、退场播完撤走，unmount-on-exit="false" 时克隆一次之后常驻。jsdom 没有动画，收起当拍即退场播完。
 * 打开期间定位层被迁到 Portal 落点，查询一律从 document 起。
 */
function mount(tag: string, attrs: string, content: string): Updatable {
  const host = document.createElement('div')
  const panel = `<div data-xh-part="backdrop"></div><div data-xh-part="positioner"><div data-xh-part="content">${content}</div></div>`
  // 抽屉的 root 是必需部件
  host.innerHTML = tag === 'xh-drawer'
    ? `<${tag} ${attrs}><div data-xh-part="root">${panel}</div></${tag}>`
    : `<${tag} ${attrs}>${panel}</${tag}>`
  document.body.appendChild(host)
  return host.querySelector(tag) as Updatable
}

async function setOpen(el: Updatable, open: boolean): Promise<void> {
  el.setAttribute('open', open ? '' : 'false')
  await settle(el)
}

const TEMPLATE = '<template><input data-testid="cloned"><button data-xh-part="close-trigger">关闭</button></template>'

describe.each(CASES)('<$tag> content 里模板内容的挂卸', ({ tag, scope }) => {
  it('缺省：没打开过不克隆，打开即克隆，退场播完撤走，再打开重新克隆一份', async () => {
    const el = mount(tag, 'open="false"', TEMPLATE)
    await settle(el)
    expect(document.querySelector('[data-testid="cloned"]')).toBeNull()

    await setOpen(el, true)
    const first = document.querySelector('[data-testid="cloned"]')
    expect(first).not.toBeNull()

    await setOpen(el, false)
    expect(document.querySelector('[data-testid="cloned"]')).toBeNull()
    // 模板本身留在原处
    expect(document.querySelectorAll('template')).toHaveLength(1)

    await setOpen(el, true)
    const second = document.querySelector('[data-testid="cloned"]')
    expect(second).not.toBeNull()
    expect(second).not.toBe(first)
  })

  it('unmount-on-exit="false"：第一次打开克隆，此后收起也留着，再打开不重新克隆', async () => {
    const el = mount(tag, 'open="false" unmount-on-exit="false"', TEMPLATE)
    await settle(el)
    expect(document.querySelector('[data-testid="cloned"]')).toBeNull()

    await setOpen(el, true)
    const cloned = document.querySelector('[data-testid="cloned"]')
    await setOpen(el, false)
    expect(document.querySelector('[data-testid="cloned"]')).toBe(cloned)
    await setOpen(el, true)
    expect(document.querySelectorAll('[data-testid="cloned"]')).toHaveLength(1)
    expect(document.querySelector('[data-testid="cloned"]')).toBe(cloned)
  })

  it('克隆进来的部件由部件观察器补一轮接上属性', async () => {
    const el = mount(tag, 'open="false"', TEMPLATE)
    await setOpen(el, true)
    const close = document.querySelector<HTMLElement>('[data-xh-part="close-trigger"]')!
    expect(close.getAttribute('data-scope')).toBe(scope)
    expect(close.getAttribute('data-part')).toBe('close-trigger')
  })

  it('没写模板的作者节点始终常驻，不被摘走', async () => {
    const el = mount(tag, 'open="false"', '<input data-testid="author">')
    await settle(el)
    const author = document.querySelector('[data-testid="author"]')
    expect(author).not.toBeNull()
    await setOpen(el, true)
    await setOpen(el, false)
    expect(document.querySelector('[data-testid="author"]')).toBe(author)
  })
})
