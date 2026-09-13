/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 input group visual 相关行为。

import type { App, VNode } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhInputGroupItem,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function field(label: string): VNode {
  return h(XhTextFieldRoot, { placeholder: label }, () => [
    h(XhTextFieldControl, null, () => [
      h(XhTextFieldInput, { 'aria-label': label }),
    ]),
  ])
}

function group(id: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-testid='${id}'][data-scope='input-group'][data-part='root']`)!
}

function control(id: string): HTMLElement {
  return group(id).querySelector<HTMLElement>('[data-xh-field-chrome]')!
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h('div', { style: 'display:flex;gap:16px' }, [
      h(XhInputGroupRoot, { 'data-testid': 'primary' }, () => [
        h(XhInputGroupItem, null, () => '@'),
        field('主要表面'),
      ]),
      h(XhInputGroupRoot, { 'data-testid': 'secondary', 'variant': 'secondary' }, () => [
        h(XhInputGroupItem, null, () => '@'),
        field('次级表面'),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('input-group 单一输入表面', () => {
  it('primary 保留悬浮面，secondary 降低强调且子控件不重复绘制表面', async () => {
    await mount()

    const primary = getComputedStyle(group('primary'))
    const secondary = getComputedStyle(group('secondary'))
    const primaryControl = getComputedStyle(control('primary'))
    const item = getComputedStyle(group('primary').querySelector('[data-part="item"]')!)

    expect(primary.boxShadow).not.toBe('none')
    expect(secondary.boxShadow).toBe('none')
    expect(secondary.backgroundColor).not.toBe(primary.backgroundColor)
    expect(group('secondary').getAttribute('data-variant')).toBe('secondary')
    expect(getComputedStyle(group('primary'), '::before').borderTopWidth).not.toBe('0px')
    expect(primaryControl.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(primaryControl.boxShadow).toBe('none')
    expect(item.backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('hover 与键盘焦点只更新组的外表面，不改变控件几何', async () => {
    await mount()
    const root = group('primary')
    const input = root.querySelector<HTMLInputElement>('input')!
    const before = root.getBoundingClientRect()
    const restBackground = getComputedStyle(root).backgroundColor

    await userEvent.hover(root)
    expect(getComputedStyle(root).backgroundColor).not.toBe(restBackground)

    await userEvent.keyboard('{Tab}')
    input.focus()
    expect(root.matches(':focus-within')).toBe(true)
    expect(getComputedStyle(root).outlineStyle).toBe('solid')
    expect(getComputedStyle(control('primary')).outlineStyle).toBe('none')

    const after = root.getBoundingClientRect()
    expect(after.width).toBe(before.width)
    expect(after.height).toBe(before.height)
  })
})
