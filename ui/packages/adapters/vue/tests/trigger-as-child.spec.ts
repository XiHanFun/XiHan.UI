import { resetDiagnostics } from '@xihan-ui/core'
// @vitest-environment jsdom
// 触发器的 asChild：借用作者的节点当触发器，不再自己渲染 <button> 包裹。
// 元素子节点整套属性都拿；组件子节点保留自己的解剖标记只拿接线属性；
// 子节点数不对明确抛错；定位锚点拿到的是真实元素。
// 两个触发器叠在同一颗按钮上（气泡 + 浮层）也是一种合法用法，靠属性直通把两套接线合上去。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Comment, createApp, defineComponent, Fragment, h, nextTick, Text } from 'vue'
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
import { mergeIntoChild } from '../src/runtime/as-child'
import { mergePartProps } from '../src/runtime/merge-props'

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

  // 同名处理器串起来依次跑，作者的排在部件的前面。三条路都是同一个先后：
  // 不开 asChild 写在部件上、开 asChild 写在子节点上、开 asChild 写在部件上。
  // 先后一旦跟着写法反转，作者在一种写法里拦得住的事在另一种写法里拦不住，而两边看着是同一个 prop。
  it('不开 asChild、作者写在部件上：作者先跑、部件后跑', async () => {
    const seen: string[] = []
    mount(() => h(XhDialogRoot, { onOpenChange: () => seen.push('部件') }, () => [
      h(XhDialogTrigger, { onClick: () => seen.push('作者') }, () => '打开'),
      h(XhDialogContent, () => '内容'),
    ]))
    await tick()

    el('[data-scope="dialog"][data-part="trigger"]').click()
    await tick()
    expect(seen).toEqual(['作者', '部件'])
  })

  it('开 asChild、作者写在子节点上：作者先跑、部件后跑', async () => {
    const seen: string[] = []
    mount(() => h(XhDialogRoot, { onOpenChange: () => seen.push('部件') }, () => [
      h(XhDialogTrigger, { asChild: true }, () => h('button', { onClick: () => seen.push('作者') }, '打开')),
      h(XhDialogContent, () => '内容'),
    ]))
    await tick()

    el('[data-scope="dialog"][data-part="trigger"]').click()
    await tick()
    expect(seen).toEqual(['作者', '部件'])
  })

  it('开 asChild、作者写在部件上：先后与另外两条路相同', async () => {
    const seen: string[] = []
    mount(() => h(XhDialogRoot, { onOpenChange: () => seen.push('部件') }, () => [
      h(XhDialogTrigger, { asChild: true, onClick: () => seen.push('作者') }, () => h('button', null, '打开')),
      h(XhDialogContent, () => '内容'),
    ]))
    await tick()

    el('[data-scope="dialog"][data-part="trigger"]').click()
    await tick()
    expect(seen).toEqual(['作者', '部件'])
  })

  it('作者写在部件上的普通值仍然盖过部件的，class 两边都留', async () => {
    mount(() => h(XhDialogRoot, null, () => [
      h(XhDialogTrigger, { 'class': 'mine', 'type': 'submit', 'aria-label': '我的名字' }, () => '打开'),
      h(XhDialogContent, () => '内容'),
    ]))
    await tick()

    const trigger = el('[data-scope="dialog"][data-part="trigger"]')
    expect(trigger.getAttribute('type')).toBe('submit')
    expect(trigger.getAttribute('aria-label')).toBe('我的名字')
    expect(trigger.classList.contains('mine')).toBe(true)
    // 部件的接线属性没被顺手丢掉
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
  })

  it('子节点不是恰好一个时抛错，合法 Fragment 仍可组合', () => {
    for (const children of [undefined, [], [h('span', 'a'), h('span', 'b')]])
      expect(() => mergeIntoChild(children, {}, 'dialog')).toThrow(/dialog asChild 需要恰好一个可挂载子节点/)
    expect(mergeIntoChild([h(Fragment, [h('button', '唯一节点')])], {}, 'dialog').type).toBe('button')
  })

  it.each(['可见文本', '0', '42'])('拒绝与唯一元素并列的文本节点：%s', (text) => {
    expect(() => mergeIntoChild([h(Text, text), h('button')], {}, 'dialog')).toThrow(/不能包含非空文本/)
    expect(() => mergeIntoChild([h(Fragment, [h(Text, text), h('button')])], {}, 'dialog')).toThrow(/不能包含非空文本/)
  })

  it.each(['可见文本', 0, 42])('拒绝 Fragment 内未经归一化的可见内容：%s', (text) => {
    expect(() => mergeIntoChild([h(Fragment, [text, h('button')])], {}, 'dialog')).toThrow(/不能包含非空文本/)
  })

  it('空白、注释与条件占位不影响唯一组合宿主', () => {
    const child = mergeIntoChild([h(Fragment, [
      h(Text, ' \n\t'),
      h(Comment, '条件占位'),
      ' ',
      false,
      true,
      null,
      undefined,
      h('button'),
    ])], {}, 'dialog')
    expect(child.type).toBe('button')
  })

  it.each(['默认部件', '组合部件', '组合子节点'] as const)('%s 的作者取消点击后不打开对话框', async (location) => {
    const seen: string[] = []
    const cancel = (event: MouseEvent) => {
      seen.push('作者')
      event.preventDefault()
    }
    mount(() => h(XhDialogRoot, { onOpenChange: () => seen.push('部件') }, () => [
      h(XhDialogTrigger, {
        asChild: location !== '默认部件',
        onClick: location === '组合子节点' ? undefined : cancel,
      }, () => location === '默认部件'
        ? '打开'
        : h('button', {
            type: 'button',
            onClick: location === '组合子节点' ? cancel : undefined,
          }, '打开')),
    ]))
    await tick()
    el('[data-scope="dialog"][data-part="trigger"]').click()
    await tick()
    expect(seen).toEqual(['作者'])
    expect(el('[data-scope="dialog"][data-part="trigger"]').getAttribute('aria-expanded')).toBe('false')
  })

  it('组合子节点取消键盘事件后保留其余作者处理器，跳过部件动作', async () => {
    const seen: string[] = []
    mount(() => mergeIntoChild([h('button', {
      onKeydown: [
        (event: KeyboardEvent) => {
          seen.push('取消')
          event.preventDefault()
        },
        () => seen.push('作者记录'),
      ],
    }, '操作')], { onKeydown: () => seen.push('部件') }, 'dialog'))
    await tick()
    el('button').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    expect(seen).toEqual(['取消', '作者记录'])
  })

  it('作者 stopImmediatePropagation 仍阻止后续同节点处理器', async () => {
    const seen: string[] = []
    mount(() => h('button', mergePartProps({ onClick: () => seen.push('部件') }, {
      onClick: [
        (event: MouseEvent) => {
          seen.push('作者')
          event.stopImmediatePropagation()
        },
        () => seen.push('作者后续'),
      ],
    }), '操作'))
    await tick()
    el('button').click()
    expect(seen).toEqual(['作者'])
  })

  it('普通多参数回调仍将全部参数交给作者和部件', () => {
    const author = vi.fn()
    const internal = vi.fn()
    const detail = { source: '作者' }
    const merged = mergePartProps({ onValueChange: internal }, { onValueChange: author })
    for (const handler of merged.onValueChange as Array<(...args: unknown[]) => void>)
      handler('新值', detail)
    expect(author).toHaveBeenCalledWith('新值', detail)
    expect(internal).toHaveBeenCalledWith('新值', detail)
  })

  it('部件处理器数组仍遵循 Vue 的 stopImmediatePropagation', async () => {
    const seen: string[] = []
    mount(() => h('button', mergePartProps({
      onClick: [
        (event: MouseEvent) => {
          seen.push('部件')
          event.stopImmediatePropagation()
        },
        () => seen.push('部件后续'),
      ],
    }, { onClick: () => seen.push('作者') }), '操作'))
    await tick()
    el('button').click()
    expect(seen).toEqual(['作者', '部件'])
  })
})
