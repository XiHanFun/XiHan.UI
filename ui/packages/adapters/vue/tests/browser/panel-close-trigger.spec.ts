// 面板角上的关闭钮：七处的叉同一把尺，聚焦与按下的长相由悬停那一档推出来，不另开覆盖槽。
//
// 叉取 --xh-glyph-size-xs（12px），比控件内图标低一档：钮是 sm 档，按随档字形取 16px 的叉
// 在小气泡与提示条里比标题还抢眼。聚焦 = 透明底 + 悬停字色，按下 = 换底 + 悬停字色；
// 作者改悬停字色，聚焦与按下跟着走，没有第二套槽可写。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhAlertCloseTrigger,
  XhAlertContent,
  XhAlertRoot,
  XhAlertTitle,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogHeader,
  XhDialogRoot,
  XhDialogTitle,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerHeader,
  XhDrawerRoot,
  XhDrawerTitle,
  XhFloatingPanelBody,
  XhFloatingPanelCloseTrigger,
  XhFloatingPanelContent,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
  XhTourCloseTrigger,
  XhTourContent,
  XhTourPositioner,
  XhTourRoot,
  XhTourTitle,
} from '../../src'

import { tokenLength } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Scope = 'alert' | 'dialog' | 'drawer' | 'floating-panel' | 'popover' | 'tour'

const RED = 'rgb(255, 0, 0)'
const GREEN = 'rgb(0, 128, 0)'
const TRANSPARENT = 'rgba(0, 0, 0, 0)'

let app: App | null = null
let host: HTMLElement | null = null
const written: string[] = []

const RENDER: Record<Scope, () => VNode> = {
  'alert': () => h(XhAlertRoot, { closable: true }, () => [
    h(XhAlertContent, null, () => h(XhAlertTitle, null, () => '同步完成')),
    h(XhAlertCloseTrigger, { 'aria-label': '关闭' }),
  ]),
  'dialog': () => h(XhDialogRoot, { open: true }, () => h(XhDialogContent, null, () => [
    h(XhDialogHeader, null, () => h(XhDialogTitle, null, () => '发布确认')),
    h(XhDialogCloseTrigger, { 'aria-label': '关闭' }),
  ])),
  'drawer': () => h(XhDrawerRoot, { open: true }, () => h(XhDrawerContent, null, () => [
    h(XhDrawerHeader, null, () => h(XhDrawerTitle, null, () => '设置')),
    h(XhDrawerCloseTrigger, { 'aria-label': '关闭' }),
  ])),
  'floating-panel': () => h(XhFloatingPanelRoot, { defaultOpen: true }, () => h(XhFloatingPanelPositioner, null, () =>
    h(XhFloatingPanelContent, null, () => [
      h(XhFloatingPanelHeader, null, () => [h(XhFloatingPanelTitle, null, () => '调试面板'), h(XhFloatingPanelCloseTrigger)]),
      h(XhFloatingPanelBody, null, () => '辅助信息'),
    ]))),
  'popover': () => h(XhPopoverRoot, { open: true }, () => [
    h(XhPopoverTrigger, null, () => '打开'),
    h(XhPopoverPositioner, null, () => h(XhPopoverContent, null, () => [
      h(XhPopoverTitle, null, () => '同步设置'),
      h(XhPopoverCloseTrigger, { 'aria-label': '关闭' }),
    ])),
  ]),
  'tour': () => h(XhTourRoot, { open: true, steps: [{ id: 'a', target: '#panel-close-target', title: '第一站' }] }, () =>
    h(XhTourPositioner, null, () => h(XhTourContent, null, () => [h(XhTourTitle), h(XhTourCloseTrigger)]))),
}

function closeTrigger(scope: Scope): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='close-trigger']`)
  if (!element)
    throw new Error(`找不到 ${scope}/close-trigger`)
  return element
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  await nextTick()
  document.getAnimations().forEach(animation => animation.effect?.getComputedTiming().endTime !== Infinity && animation.finish())
}

async function mount(scope: Scope): Promise<HTMLElement> {
  host = document.createElement('div')
  host.innerHTML = '<button id="panel-close-target" style="margin: 160px">目标</button>'
  document.body.append(host)
  app = createApp({ render: RENDER[scope] })
  app.mount(host)
  await settle()
  return closeTrigger(scope)
}

/** 槽写在根上：关闭钮可能经 Portal 挂到 body 下，挂在宿主上的槽够不着它。 */
function writeSlot(name: string, value: string): void {
  document.documentElement.style.setProperty(name, value)
  written.push(name)
}

async function keyboardFocus(element: HTMLElement): Promise<void> {
  // 先按一下 Tab 让文档进入键盘模态，element.focus() 才命中 :focus-visible
  await userEvent.keyboard('{Tab}')
  element.focus()
  await settle()
  expect(element.matches(':focus-visible')).toBe(true)
}

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  for (const name of written.splice(0))
    document.documentElement.style.removeProperty(name)
  document.body.innerHTML = ''
})

describe('面板角上的关闭钮', () => {
  it.each(['alert', 'dialog', 'drawer', 'floating-panel', 'popover', 'tour'] as const)('%s：皮肤画的兜底叉取 12px', async (scope) => {
    const close = await mount(scope)
    const glyph = getComputedStyle(close, '::before')
    const xs = `${tokenLength('--xh-glyph-size-xs')}px`
    expect(glyph.width).toBe(xs)
    expect(glyph.height).toBe(xs)
  })

  it.each(['dialog', 'drawer', 'popover'] as const)('%s：聚焦是透明底 + 悬停字色，旧的聚焦覆盖槽不再生效', async (scope) => {
    writeSlot(`--xh-${scope}-close-fg-hover`, GREEN)
    writeSlot(`--xh-${scope}-close-fg-focus`, RED)
    writeSlot(`--xh-${scope}-close-bg-focus`, RED)
    const close = await mount(scope)
    await keyboardFocus(close)
    await expect.poll(() => getComputedStyle(close).color).toBe(GREEN)
    await expect.poll(() => getComputedStyle(close).backgroundColor).toBe(TRANSPARENT)
  })

  it('floating-panel：按下的字色就是悬停字色，旧的按下字色槽不再生效', async () => {
    writeSlot('--xh-floating-panel-action-fg-hover', GREEN)
    writeSlot('--xh-floating-panel-action-fg-active', RED)
    const close = await mount('floating-panel')
    // 按下态由属性表出（指针按住时连接层投影的那一位），直接写上它量样式
    close.setAttribute('data-pressed', '')
    await expect.poll(() => getComputedStyle(close).color).toBe(GREEN)
  })
})
