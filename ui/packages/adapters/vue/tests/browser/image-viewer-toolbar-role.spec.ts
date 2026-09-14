// 看片浮层底部那条控件带：它对读屏报什么角色，与键盘上真正拿得到的走位必须是同一件事。
//
// 判据要的是真实焦点与真实按键：Tab 序列、方向键落在谁身上，两样 jsdom 都演不出来
// （jsdom 没有 Tab 序列，也不按 tabindex 排序）。所以这一份放在浏览器态：
// 一、那条带报的是 role=group：一组有名字的控件，不承诺条内方向键走位。
// 二、条里每颗钮各占一个 Tab 位，Tab 一颗一颗往下走——这正是 group 的承诺，
//     换成 toolbar 就得只占一位，两者不能同时为真。
// 三、焦点停在条里的钮上时，左右方向键与 Home/End 仍然翻页：
//     这是看片的主交互，条内走位一旦接管这四个键，它就从这七颗钮上消失。
import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhImageViewerCloseTrigger,
  XhImageViewerContent,
  XhImageViewerCounter,
  XhImageViewerFlipHorizontalTrigger,
  XhImageViewerFlipVerticalTrigger,
  XhImageViewerImage,
  XhImageViewerNextTrigger,
  XhImageViewerPrevTrigger,
  XhImageViewerResetTrigger,
  XhImageViewerRoot,
  XhImageViewerRotateLeftTrigger,
  XhImageViewerRotateRightTrigger,
  XhImageViewerToolbar,
  XhImageViewerTrigger,
  XhImageViewerViewport,
  XhImageViewerZoomInTrigger,
  XhImageViewerZoomOutTrigger,
} from '../../src'
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

// 一张 1×1 的透明 gif，取图立刻完成，不去外面拿资源
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const COLLECTION = [
  { src: PIXEL, alt: '第一张' },
  { src: PIXEL, alt: '第二张' },
  { src: PIXEL, alt: '第三张' },
]

/** 工具条里那七颗钮，按皮肤给的排布顺序。 */
const TOOL_PARTS = [
  'zoom-in-trigger',
  'zoom-out-trigger',
  'rotate-left-trigger',
  'rotate-right-trigger',
  'flip-horizontal-trigger',
  'flip-vertical-trigger',
  'reset-trigger',
] as const

/**
 * 摆一台看片浮层，组合照皮肤给的那一份：
 * 翻页钮与计数、关闭钮浮在视口四边，工具条只装七颗变换钮。
 */
function mount(): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhImageViewerRoot, { collection: COLLECTION, defaultOpen: true }, () => [
      h(XhImageViewerTrigger, () => '看图'),
      h(XhImageViewerContent, () => [
        h(XhImageViewerViewport, () => h(XhImageViewerImage)),
        h(XhImageViewerPrevTrigger),
        h(XhImageViewerNextTrigger),
        h(XhImageViewerCounter),
        h(XhImageViewerToolbar, () => [
          h(XhImageViewerZoomInTrigger),
          h(XhImageViewerZoomOutTrigger),
          h(XhImageViewerRotateLeftTrigger),
          h(XhImageViewerRotateRightTrigger),
          h(XhImageViewerFlipHorizontalTrigger),
          h(XhImageViewerFlipVerticalTrigger),
          h(XhImageViewerResetTrigger),
        ]),
        h(XhImageViewerCloseTrigger),
      ]),
    ]),
  })
  app.mount(host)
}

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='image-viewer'][data-part='${name}']`)
  if (!el)
    throw new Error(`没有 ${name} 这个部件`)
  return el
}

/** 当前焦点落在哪个部件上；不在这台浮层里得 null。 */
function focusedPart(): string | null {
  const el = document.activeElement as HTMLElement | null
  if (!el || el.getAttribute('data-scope') !== 'image-viewer')
    return null
  return el.getAttribute('data-part')
}

/** 计数部件报的「第几张」。 */
function shownIndex(): string | null {
  return part('counter').getAttribute('data-index')
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
}

describe('看片浮层的控件带：报的角色与拿得到的走位一致', () => {
  it('那条带报 role=group，不报 toolbar', async () => {
    mount()
    await settle()
    const toolbar = part('toolbar')
    // 报 toolbar 就等于承诺「整条只占一个 Tab 位、条内方向键走位」，这台没有实现那套；
    // group 只承诺「这是一组有名字的控件」，与下面两条实测到的走位对得上
    expect(toolbar.getAttribute('role')).toBe('group')
    // 名字无条件发：不发的话读屏念到的只是页面上一堆散落的钮
    expect(toolbar.getAttribute('aria-label')).toBe('Image tools')
  })

  it('条里每颗钮各占一个 Tab 位，Tab 一颗一颗往下走', async () => {
    mount()
    await settle()
    part(TOOL_PARTS[0]).focus()
    expect(focusedPart()).toBe(TOOL_PARTS[0])

    // 条内七颗钮全部留在 Tab 序列里：走完这一串要按满六下
    const walked: (string | null)[] = []
    for (let i = 1; i < TOOL_PARTS.length; i++) {
      await userEvent.tab()
      walked.push(focusedPart())
    }
    expect(walked).toEqual([...TOOL_PARTS.slice(1)])
  })

  it('焦点停在条里的钮上时，左右方向键仍然翻页', async () => {
    mount()
    await settle()
    const anchor = part('rotate-left-trigger')
    anchor.focus()
    expect(shownIndex()).toBe('1')

    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expect(shownIndex()).toBe('2')
    // 翻页不动焦点：连按方向键能一路翻下去，手不用离开这颗钮
    expect(focusedPart()).toBe('rotate-left-trigger')

    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expect(shownIndex()).toBe('3')

    await userEvent.keyboard('{ArrowLeft}')
    await settle()
    expect(shownIndex()).toBe('2')
    expect(focusedPart()).toBe('rotate-left-trigger')
  })

  it('焦点停在条里的钮上时，Home/End 直达首末张', async () => {
    mount()
    await settle()
    const anchor = part('flip-vertical-trigger')
    anchor.focus()

    await userEvent.keyboard('{End}')
    await settle()
    expect(shownIndex()).toBe('3')
    expect(focusedPart()).toBe('flip-vertical-trigger')

    await userEvent.keyboard('{Home}')
    await settle()
    expect(shownIndex()).toBe('1')
    expect(focusedPart()).toBe('flip-vertical-trigger')
  })
})
