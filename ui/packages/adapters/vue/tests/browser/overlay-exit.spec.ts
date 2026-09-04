// 退场动画只能在真实浏览器里验：jsdom 不把样式表里的 animation 简写算进
// getComputedStyle（animationName 恒为空串），退场探测那条路在 jsdom 里天然走不到。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhDatePickerCalendar,
  XhDatePickerContent,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhImageViewerContent,
  XhImageViewerRoot,
} from '../../src'
// 皮肤要一起加载：这里查的就是皮肤给出的 animationName 与 display
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

/** 挂一棵受控展开的浮层，返回控制展开的 ref。 */
function mount(render: (open: boolean) => ReturnType<typeof h>): Ref<boolean> {
  const open = ref(true)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => () => render(open.value) })
  app.mount(host)
  return open
}

function part(scope: string, name: string): HTMLElement | null {
  return document.querySelector(`[data-scope='${scope}'][data-part='${name}']`)
}

/** 等两拍：presence 的 watcher 是 flush: 'post'，要等渲染队列排空之后才跑。 */
async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
}

/** 等一次自己的 animationend，超时即放弃（返回 false）。 */
function animationEnd(el: HTMLElement, timeout = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeout, false)
    el.addEventListener('animationend', (e) => {
      if (e.target !== el)
        return
      clearTimeout(timer)
      resolve(true)
    }, { once: true })
  })
}

describe('dialog 退场', () => {
  it('收起后 content 留在 DOM 里，并且真的在播退场动画', async () => {
    const open = mount(value => h(XhDialogRoot, { open: value }, {
      default: () => h(XhDialogContent, null, { default: () => h(XhDialogTitle, null, () => '标题') }),
    }))
    await settle()

    const content = part('dialog', 'content')
    expect(content, '展开时 content 应在 DOM 里').not.toBeNull()

    open.value = false
    await settle()

    const closing = part('dialog', 'content')
    expect(closing, '退场动画播完之前 content 不能被卸载').not.toBeNull()
    // 这条是本次回归的靶心：皮肤若给 content 补了 [hidden]{display:none}，
    // 元素不生成盒子、动画不启动，退场探测直接放弃租约，动画一帧都播不出来
    expect(getComputedStyle(closing!).display, 'content 收起态不能是 display:none').not.toBe('none')
    expect(getComputedStyle(closing!).animationName).toBe('xh-dialog-out')
  })

  it('遮罩同时在播淡出', async () => {
    const open = mount(value => h(XhDialogRoot, { open: value }, {
      default: () => h(XhDialogContent, null, { default: () => h(XhDialogTitle, null, () => '标题') }),
    }))
    await settle()

    open.value = false
    await settle()

    const backdrop = part('dialog', 'backdrop')
    expect(backdrop).not.toBeNull()
    expect(getComputedStyle(backdrop!).animationName).toBe('xh-fade-out')
  })

  it('动画结束后才卸载', async () => {
    const open = mount(value => h(XhDialogRoot, { open: value }, {
      default: () => h(XhDialogContent, null, { default: () => h(XhDialogTitle, null, () => '标题') }),
    }))
    await settle()

    open.value = false
    await settle()

    const closing = part('dialog', 'content')!
    expect(await animationEnd(closing), '退场动画应当真的结束一次').toBe(true)
    await settle()

    expect(part('dialog', 'content'), '动画结束后应当卸载').toBeNull()
  })

  it('退场中途重新展开不留残骸', async () => {
    const open = mount(value => h(XhDialogRoot, { open: value }, {
      default: () => h(XhDialogContent, null, { default: () => h(XhDialogTitle, null, () => '标题') }),
    }))
    await settle()

    open.value = false
    await settle()
    open.value = true
    await settle()

    expect(document.querySelectorAll('[data-scope=\'dialog\'][data-part=\'content\']')).toHaveLength(1)
    expect(getComputedStyle(part('dialog', 'content')!).animationName).toBe('xh-dialog-in')
  })
})

describe('image-viewer 退场', () => {
  it('收起后 content 留在 DOM 里并在播淡出', async () => {
    const open = mount(value => h(XhImageViewerRoot, { open: value, items: [{ src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' }] }, {
      default: () => h(XhImageViewerContent),
    }))
    await settle()

    const content = part('image-viewer', 'content')
    expect(content, '展开时 content 应在 DOM 里').not.toBeNull()

    open.value = false
    await settle()

    const closing = part('image-viewer', 'content')
    expect(closing, '退场动画播完之前 content 不能被卸载').not.toBeNull()
    expect(getComputedStyle(closing!).display, 'content 收起态不能是 display:none').not.toBe('none')
    expect(getComputedStyle(closing!).animationName).toBe('xh-fade-out')
  })
})

describe('date-picker 退场', () => {
  /** 两张日历并排的面板：content 靠 :has 认出第二张才横排。 */
  function mountRange(): Ref<boolean> {
    return mount(value => h(XhDatePickerRoot, { open: value }, {
      default: () => [
        h(XhDatePickerPositioner, null, () => [
          h(XhDatePickerContent, null, () => [
            h(XhDatePickerCalendar),
            h(XhDatePickerCalendar),
          ]),
        ]),
      ],
    }))
  }

  it('展开时两张日历横排', async () => {
    mountRange()
    await settle()
    expect(getComputedStyle(part('date-picker', 'content')!).display).toBe('flex')
  })

  it('退场那一帧仍横排：收起会给 content 打 hidden，横排规则不能跟着失配', async () => {
    const open = mountRange()
    await settle()

    open.value = false
    await settle()

    const closing = part('date-picker', 'content')
    expect(closing, '退场动画播完之前 content 不能被卸载').not.toBeNull()
    expect(getComputedStyle(closing!).display, '退场帧若退回 block，两张日历会竖着堆起来闪一下').toBe('flex')
  })
})
