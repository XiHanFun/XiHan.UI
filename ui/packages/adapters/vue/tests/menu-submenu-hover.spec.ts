// @vitest-environment jsdom
// 真实三级菜单悬停链：Portal 化的后代浮层仍属于祖先的悬停区域。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSub,
  XhMenuSubTrigger,
  XhMenuTrigger,
} from '../src'

const OPEN_DELAY = 0
const CLOSE_DELAY = 20

let cleanup: Array<() => void> = []

afterEach(async () => {
  for (const fn of cleanup) fn()
  cleanup = []
  await settle()
  document.body.innerHTML = ''
})

async function settle(delay = 0): Promise<void> {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, delay))
  await nextTick()
  await nextTick()
}

function pointer(
  target: EventTarget,
  type: 'pointerenter' | 'pointerleave' | 'pointermove',
  relatedTarget: EventTarget | null = null,
): void {
  target.dispatchEvent(new PointerEvent(type, {
    bubbles: false,
    pointerType: 'mouse',
    relatedTarget,
  }))
}

function byValue(value: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(`[data-scope="menu"][data-part="item"][data-value="${value}"]`)
  if (!hit)
    throw new Error(`找不到菜单条目 ${value}`)
  return hit
}

function contentOf(value: string): HTMLElement {
  const hit = byValue(value).closest<HTMLElement>('[data-scope="menu"][data-part="content"]')
  if (!hit)
    throw new Error(`找不到 ${value} 所属的菜单内容`)
  return hit
}

function mountThreeLevels(): { select: ReturnType<typeof vi.fn> } {
  const select = vi.fn()
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () => h(XhMenuRoot, { onSelect: select }, () => [
      h(XhMenuTrigger, () => '文件操作'),
      h(XhMenuPositioner, null, () => h(XhMenuContent, null, () => [
        h(XhMenuItem, { value: 'open' }, () => '打开'),
        h(XhMenuSub, {
          value: 'share',
          hoverOpenDelay: OPEN_DELAY,
          hoverCloseDelay: CLOSE_DELAY,
        }, () => [
          h(XhMenuSubTrigger, () => '发送到…'),
          h(XhMenuPositioner, null, () => h(XhMenuContent, null, () => [
            h(XhMenuItem, { value: 'share-email' }, () => '邮件'),
            h(XhMenuSub, {
              value: 'share-im',
              hoverOpenDelay: OPEN_DELAY,
              hoverCloseDelay: CLOSE_DELAY,
            }, () => [
              h(XhMenuSubTrigger, () => '即时通讯…'),
              h(XhMenuPositioner, null, () => h(XhMenuContent, null, () => [
                h(XhMenuItem, { value: 'share-wecom' }, () => '企业微信'),
                h(XhMenuItem, { value: 'share-dingtalk' }, () => '钉钉'),
              ])),
            ]),
          ])),
        ]),
      ])),
    ]),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return { select }
}

async function openThroughHover(): Promise<{
  share: HTMLElement
  im: HTMLElement
  middle: HTMLElement
  leaf: HTMLElement
}> {
  document.querySelector<HTMLElement>('[data-scope="menu"][data-part="trigger"]')!.click()
  await settle()
  const share = byValue('share')
  pointer(share, 'pointerenter')
  await settle(1)
  expect(share.getAttribute('aria-expanded')).toBe('true')

  const im = byValue('share-im')
  pointer(im, 'pointerenter')
  await settle(1)
  expect(im.getAttribute('aria-expanded')).toBe('true')
  return {
    share,
    im,
    middle: contentOf('share-email'),
    leaf: contentOf('share-wecom'),
  }
}

describe('menu 三级 Portal 悬停树', () => {
  it('移入三级并在其中移动时祖先不关闭，回到二级后只收三级', async () => {
    mountThreeLevels()
    const { share, im, middle, leaf } = await openThroughHover()

    // 真实浏览器里二、三级是两个 body Portal：跨过去会让二级 content 收到 leave。
    pointer(middle, 'pointerleave', leaf)
    pointer(leaf, 'pointerenter', middle)
    byValue('share-wecom').focus()
    pointer(byValue('share-dingtalk'), 'pointermove')
    await settle(CLOSE_DELAY + 5)
    expect(share.getAttribute('aria-expanded')).toBe('true')
    expect(im.getAttribute('aria-expanded')).toBe('true')

    pointer(leaf, 'pointerleave', byValue('share-email'))
    pointer(middle, 'pointerenter', leaf)
    byValue('share-email').focus()
    await settle(CLOSE_DELAY + 5)
    expect(share.getAttribute('aria-expanded')).toBe('true')
    expect(im.getAttribute('aria-expanded')).toBe('false')
    byValue('share-email').click()
    await settle()
  })

  it('三级末项点击仍按叶到根关闭整链并只上报一次选择', async () => {
    const { select } = mountThreeLevels()
    const { middle, leaf } = await openThroughHover()
    pointer(middle, 'pointerleave', leaf)
    pointer(leaf, 'pointerenter', middle)
    byValue('share-dingtalk').click()
    await settle()

    expect(select).toHaveBeenCalledTimes(1)
    expect(select).toHaveBeenCalledWith({ value: 'share-dingtalk' })
    expect(byValue('share').getAttribute('aria-expanded')).toBe('false')
    expect(byValue('share-im').getAttribute('aria-expanded')).toBe('false')
  })

  it('三级键盘路径保持逐层进入、逐层返回与 Escape 只收顶层', async () => {
    mountThreeLevels()
    document.querySelector<HTMLElement>('[data-scope="menu"][data-part="trigger"]')!.click()
    await settle()
    const share = byValue('share')
    share.focus()
    share.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
    await settle()
    const im = byValue('share-im')
    im.focus()
    im.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
    await settle()
    expect(im.getAttribute('aria-expanded')).toBe('true')

    const leaf = contentOf('share-wecom')
    leaf.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }))
    await settle()
    expect(im.getAttribute('aria-expanded')).toBe('false')
    expect(share.getAttribute('aria-expanded')).toBe('true')

    middleEscape(contentOf('share-email'))
    await settle()
    expect(share.getAttribute('aria-expanded')).toBe('false')
    expect(document.querySelector<HTMLElement>('[data-scope="menu"][data-part="trigger"]')!.getAttribute('aria-expanded')).toBe('true')
  })
})

function middleEscape(content: HTMLElement): void {
  content.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
}
