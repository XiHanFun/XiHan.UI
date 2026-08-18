// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../src'

/**
 * 对话框里再开一层浮层，按一次 Escape 只该关掉最上面那层。
 * 消解层按层栈仲裁 Escape，浮层不入栈就轮不到它表态：
 * 同一次按键走到 document 捕获相时栈顶仍是对话框，整个对话框连同里面填的内容一起被关掉。
 */

interface Mounted {
  host: HTMLElement
  unmount: () => void
}

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

function state(selector: string): string | null {
  return document.querySelector(selector)?.getAttribute('data-state') ?? null
}

/** 从某个节点按下 Escape，与真实浏览器一致：事件从焦点所在处冒泡到 document。 */
function pressEscapeAt(el: HTMLElement): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
}

function mount(render: () => unknown): Mounted {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ setup: () => () => render() })
  app.mount(host)
  return {
    host,
    unmount() {
      app.unmount()
      host.remove()
    },
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('对话框内浮层的 escape 仲裁', () => {
  it('tooltip 展开时按 Escape：只收起提示，对话框仍开着', async () => {
    const m = mount(() =>
      h(XhDialogRoot, { defaultOpen: true }, {
        default: () => [
          h(XhDialogContent, null, () => [
            h(XhDialogTitle, null, () => '标题'),
            h(XhTooltipRoot, null, {
              default: () => [
                h(XhTooltipTrigger, null, () => '带提示的按钮'),
                h(XhTooltipPositioner, null, {
                  default: () => [h(XhTooltipContent, null, () => '提示文字')],
                }),
              ],
            }),
          ]),
        ],
      }),
    )
    try {
      await tick()
      expect(state('[data-scope="dialog"][data-part="content"]')).toBe('open')

      // 聚焦即展开，不走悬停延时
      const trigger = document.querySelector<HTMLElement>('[data-scope="tooltip"][data-part="trigger"]')!
      trigger.dispatchEvent(new FocusEvent('focus'))
      await tick()
      expect(state('[data-scope="tooltip"][data-part="content"]')).toBe('open')

      pressEscapeAt(trigger)
      await tick()
      // 对话框先断言：它若被一并关掉，整棵子树连同 tooltip 一起没了，后一条会退化成"找不到节点"
      expect(state('[data-scope="dialog"][data-part="content"]')).toBe('open')
      expect(state('[data-scope="tooltip"][data-part="content"]')).toBe('closed')
    }
    finally {
      m.unmount()
    }
  })

  it('navigation-menu 面板展开时按 Escape：只收起面板，对话框仍开着', async () => {
    const m = mount(() =>
      h(XhDialogRoot, { defaultOpen: true }, {
        default: () => [
          h(XhDialogContent, null, () => [
            h(XhDialogTitle, null, () => '标题'),
            h(XhNavigationMenuRoot, null, {
              default: () => [
                h(XhNavigationMenuList, null, () => [
                  h(XhNavigationMenuItem, null, () => [
                    h(XhNavigationMenuTrigger, { value: 'products' }, () => '产品'),
                    h(XhNavigationMenuContent, { value: 'products' }, () => [
                      h(XhNavigationMenuLink, { href: '/a' }, () => '条目'),
                    ]),
                  ]),
                ]),
              ],
            }),
          ]),
        ],
      }),
    )
    try {
      await tick()
      const trigger = document.querySelector<HTMLElement>('[data-scope="navigation-menu"][data-part="trigger"]')!
      trigger.click()
      await tick()
      expect(state('[data-scope="navigation-menu"][data-part="content"]')).toBe('open')

      pressEscapeAt(trigger)
      await tick()
      expect(state('[data-scope="dialog"][data-part="content"]')).toBe('open')
      expect(state('[data-scope="navigation-menu"][data-part="content"]')).toBe('closed')
    }
    finally {
      m.unmount()
    }
  })
})
