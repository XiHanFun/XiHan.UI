// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhDialogTrigger, XhDrawerContent, XhDrawerRoot, XhDrawerTitle, XhDrawerTrigger } from '../src'

/**
 * 外层模态浮层给 body 的其它直接子元素打 inert 让背景失活；内层浮层 Teleport 到 body
 * 之后也是 body 的直接子元素，会被外层的 MutationObserver 一并打上 inert——看得见、点不动。
 * 判据钉的是：栈中位于自己之上的层不受自己的 inert 管辖。
 *
 * jsdom 不实现 inert，hideOutside 走 `el.inert = true`，落成 expando 属性。
 */

function inertOf(el: Element): boolean {
  return (el as unknown as { inert?: boolean }).inert === true
}

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

/** 找到包住指定标题文本的那个 positioner。 */
function positionerOf(scope: string, title: string): HTMLElement {
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="positioner"]`))
  const hit = all.find(p => p.textContent?.includes(title))
  if (!hit)
    throw new Error(`没找到标题为「${title}」的 ${scope} positioner`)
  return hit
}

interface Mounted {
  background: HTMLElement
  openInner: () => Promise<void>
  unmount: () => void
}

function mountNested(kind: 'dialog' | 'drawer'): Mounted {
  const [Root, Content, Title, Trigger] = kind === 'dialog'
    ? [XhDialogRoot, XhDialogContent, XhDialogTitle, XhDialogTrigger]
    : [XhDrawerRoot, XhDrawerContent, XhDrawerTitle, XhDrawerTrigger]

  const background = document.createElement('div')
  background.id = 'background'
  background.textContent = '背景内容'
  document.body.appendChild(background)

  const host = document.createElement('div')
  document.body.appendChild(host)

  const app = createApp({
    setup: () => () =>
      h(Root, { defaultOpen: true }, {
        default: () => [
          h(Content, null, () => [
            h(Title, null, () => '甲层'),
            h(Root, { defaultOpen: false }, {
              default: () => [
                h(Trigger, { id: 'inner-trigger' }, () => '打开内层'),
                h(Content, null, () => [
                  h(Title, null, () => '乙层'),
                  h('button', { id: 'inner-button' }, '内层按钮'),
                ]),
              ],
            }),
          ]),
        ],
      }),
  })
  app.mount(host)

  return {
    background,
    async openInner() {
      document.querySelector<HTMLElement>('#inner-trigger')?.click()
      await tick()
    },
    unmount() {
      app.unmount()
      host.remove()
      background.remove()
    },
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe.each(['dialog', 'drawer'] as const)('%s 套自己', (kind) => {
  it('内层打开后不被外层 inert 罩死，外层反过来被内层罩住', async () => {
    const m = mountNested(kind)
    try {
      await tick()
      expect(inertOf(m.background)).toBe(true)

      await m.openInner()
      const inner = positionerOf(kind, '乙层')
      const outer = positionerOf(kind, '甲层')

      expect(inertOf(inner)).toBe(false)
      expect(document.querySelector('#inner-button')?.closest('[inert]')).toBe(null)
      // 内层在栈顶：外层反过来要被内层的 hideOutside 罩住
      expect(inertOf(outer)).toBe(true)
    }
    finally {
      m.unmount()
    }
  })
})
