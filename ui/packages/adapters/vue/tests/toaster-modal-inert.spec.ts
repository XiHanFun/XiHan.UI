// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhToastCloseTrigger, XhToasterGroup, XhToasterRoot, XhToastRoot, XhToastTitle } from '../src'

/**
 * 模态浮层给 body 的其它直接子元素打 inert 让背景失活，通知却画在遮罩之上：
 * 被一并罩住就成了看得见、点不动、读屏也跳过。判据钉的是通知子树带着豁免标记逃出 inert。
 *
 * jsdom 不实现 inert，hideOutside 走 `el.inert = true`，落成 expando 属性。
 */

function inertOf(el: Element): boolean {
  return (el as unknown as { inert?: boolean }).inert === true
}

/** 自己或任一祖先被 inert：inert 沿子树生效，只看节点自己不够。 */
function inertInChain(el: Element | null): boolean {
  for (let node: Element | null = el; node; node = node.parentElement) {
    if (inertOf(node))
      return true
  }
  return false
}

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

const teardown: Array<() => void> = []

afterEach(() => {
  for (const fn of teardown.splice(0)) fn()
  document.body.innerHTML = ''
})

/** 通知队列单独挂一个应用，根节点直接落在 body 下——豁免标记要生效就得落在 body 的直接子元素上。 */
function mountToaster(): HTMLElement {
  const app = createApp({
    setup: () => () =>
      h(XhToasterRoot, { defaultToasts: [{ id: 'n1', title: '已保存' }] }, {
        default: () => [
          h(XhToasterGroup, null, {
            default: ({ toast }: { toast: { id: string, title?: string } }) => [
              h(XhToastRoot, { id: toast.id, title: toast.title }, () => [
                h(XhToastTitle),
                h(XhToastCloseTrigger, () => '✕'),
              ]),
            ],
          }),
        ],
      }),
  })
  app.mount(document.body)
  teardown.push(() => app.unmount())
  return document.querySelector<HTMLElement>('[data-scope="toaster"][data-part="root"]')!
}

/** 打开一个模态对话框，它会给 body 下其余直接子元素施加 inert。 */
function mountModal(): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhDialogRoot, { defaultOpen: true }, {
        default: () => [h(XhDialogContent, null, () => [h(XhDialogTitle, null, () => '模态')])],
      }),
  })
  app.mount(host)
  teardown.push(() => {
    app.unmount()
    host.remove()
  })
}

describe('模态打开时的通知队列', () => {
  it('背景被 inert 罩住，通知子树逃出来', async () => {
    const toasterRoot = mountToaster()
    const background = document.createElement('div')
    background.id = 'background'
    document.body.appendChild(background)
    mountModal()
    await tick()

    expect(inertOf(background)).toBe(true)
    expect(inertOf(toasterRoot)).toBe(false)
    expect(inertInChain(document.querySelector('[data-scope="toast"][data-part="close-trigger"]'))).toBe(false)
  })
})
