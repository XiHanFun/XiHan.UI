import { onDiagnostic, resetDiagnostics } from '@xihan-ui/core'
// @vitest-environment jsdom
// 触发器的 asChild：借用作者的节点当触发器，不再自己渲染 <button> 包裹。
// 元素子节点整套属性都拿；组件子节点保留自己的解剖标记只拿接线属性；
// 子节点数不对退回默认渲染并报诊断；定位锚点拿到的是真实元素。
// 两个触发器叠在同一颗按钮上（气泡 + 浮层）也是一种合法用法，靠属性直通把两套接线合上去。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import {
  XhButton,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTrigger,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
  resetDiagnostics()
})

function mount(render: () => unknown): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ setup: () => render })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

describe('触发器 asChild', () => {
  it('元素子节点：不再多一层 button，触发器属性整套落到子节点上', async () => {
    mount(() => h(XhTooltipRoot, null, () => [
      h(XhTooltipTrigger, { asChild: true }, () => h('span', { class: 'mine' }, '悬停我')),
      h(XhTooltipPositioner, null, () => h(XhTooltipContent, () => '说明')),
    ]))
    await tick()

    const trigger = el('[data-scope="tooltip"][data-part="trigger"]')
    expect(trigger.tagName).toBe('SPAN')
    expect(trigger.classList.contains('mine')).toBe(true)
    // 没有多出来的包裹按钮
    expect(document.querySelector('button[data-scope="tooltip"]')).toBeNull()
  })

  it('组件子节点：保留它自己的解剖标记，只拿接线属性与事件', async () => {
    const onClick = vi.fn()
    mount(() => h(XhPopconfirmRoot, null, () => [
      h(XhPopconfirmTrigger, { asChild: true }, () => h(XhButton, { onClick }, () => '删除')),
      h(XhPopconfirmPositioner, null, () => h(XhPopconfirmContent, null, () => [
        h(XhPopconfirmConfirmTrigger, () => '确定'),
      ])),
    ]))
    await tick()

    // 页面上只有一个按钮承担触发器：既是 XhButton，也带 popconfirm 的接线属性
    const buttons = document.querySelectorAll('button')
    const trigger = buttons[0]!
    expect(trigger.getAttribute('data-scope')).toBe('button')
    expect(trigger.hasAttribute('aria-haspopup') || trigger.hasAttribute('aria-expanded')).toBe(true)
    // 没有 button 套 button
    expect(trigger.querySelector('button')).toBeNull()

    // 作者自己的点击处理器与触发器的开合都生效
    trigger.click()
    await tick()
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(document.querySelector('[data-scope="popconfirm"][data-part="content"]')).not.toBeNull()
  })

  it('定位锚点拿到的是元素本身，即便子节点是组件', async () => {
    let anchorTag = ''
    // 用一个只渲染 <a> 的组件当触发器
    const Link = defineComponent({
      setup: (_, { slots }) => () => h('a', { href: '#' }, slots.default?.()),
    })
    mount(() => h(XhTooltipRoot, null, () => [
      h(XhTooltipTrigger, { asChild: true }, () => h(Link, () => '链接')),
      h(XhTooltipPositioner, null, () => h(XhTooltipContent, () => '说明')),
    ]))
    await tick()

    const trigger = el('a')
    // 触发器的 data-scope 不落到组件子节点上，但接线属性（aria-describedby 一类）要在
    anchorTag = trigger.tagName
    expect(anchorTag).toBe('A')
    trigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }))
    trigger.focus()
    await tick()
    // 能开出来说明 triggerRef 拿到了真实元素（组件实例是定不了位的）
    expect(document.querySelector('[data-scope="tooltip"][data-part="content"]')).not.toBeNull()
  })

  it('两个触发器叠在同一颗按钮上：两台机器各自都开得出来', async () => {
    // 外层气泡走 asChild，把自己的接线合到内层浮层触发器上；
    // 内层照常渲染 <button>，直通属性由 Vue 合进去。整棵树只该有这一颗按钮。
    mount(() => h(XhPopoverRoot, null, () => [
      h(XhTooltipRoot, null, () => [
        h(XhTooltipTrigger, { asChild: true }, () => h(XhPopoverTrigger, { class: 'bell' }, () => '铃铛')),
        h(XhTooltipPositioner, null, () => h(XhTooltipContent, () => '通知')),
      ]),
      h(XhPopoverPositioner, null, () => h(XhPopoverContent, () => '面板')),
    ]))
    await tick()

    expect(document.querySelectorAll('button')).toHaveLength(1)
    const trigger = el('button')
    // 解剖标记归内层那个部件，作者写的 class 也在
    expect(trigger.dataset.scope).toBe('popover')
    expect(trigger.classList.contains('bell')).toBe(true)

    // 悬停开气泡
    trigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }))
    await tick()
    expect(document.querySelector('[data-scope="tooltip"][data-part="content"]')).not.toBeNull()

    // 点击开浮层——两套事件都挂在同一颗按钮上，谁也没把谁挤掉
    trigger.click()
    await tick()
    expect(document.querySelector('[data-scope="popover"][data-part="content"]')).not.toBeNull()
  })

  it('子节点不是恰好一个：报诊断并退回默认的 button 渲染', async () => {
    const seen: string[] = []
    const off = onDiagnostic(record => seen.push(`${record.scope}:${record.message}`))
    cleanup.push(off)

    mount(() => h(XhDialogRoot, null, () => [
      h(XhDialogTrigger, { asChild: true }, () => [h('span', 'a'), h('span', 'b')]),
      h(XhDialogContent, () => '内容'),
    ]))
    await tick()

    const trigger = el('[data-scope="dialog"][data-part="trigger"]')
    expect(trigger.tagName).toBe('BUTTON')
    expect(seen.some(m => m.startsWith('dialog:') && m.includes('asChild'))).toBe(true)
  })
})
