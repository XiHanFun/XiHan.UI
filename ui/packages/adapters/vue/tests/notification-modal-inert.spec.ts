// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  createNotificationService,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemTitle,
  XhNotificationRoot,
} from '../src'

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

/** 背景失活等浮层第一帧上屏之后才施加：两层 requestAnimationFrame，与 headless 的 afterNextPaint 同一口径 */
async function afterPaint(): Promise<void> {
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
}

const teardown: Array<() => void> = []

afterEach(() => {
  for (const fn of teardown.splice(0)) fn()
  document.body.innerHTML = ''
})

/** 通知队列单独挂一个应用，根节点直接落在 body 下——豁免标记要生效就得落在 body 的直接子元素上。 */
function mountNotifications(): HTMLElement {
  const app = createApp({
    setup: () => () =>
      h(XhNotificationRoot, { defaultItems: [{ id: 'n1', title: '有新的审批' }] }, {
        default: () => [
          h(XhNotificationGroup, null, {
            default: ({ item }: { item: { id: string, title?: string } }) => [
              h(XhNotificationItem, { id: item.id, title: item.title }, () => [
                h(XhNotificationItemTitle),
                h(XhNotificationItemCloseTrigger),
              ]),
            ],
          }),
        ],
      }),
  })
  app.mount(document.body)
  teardown.push(() => app.unmount())
  return document.querySelector<HTMLElement>('[data-scope="notification"][data-part="root"]')!
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
    const root = mountNotifications()
    const background = document.createElement('div')
    background.id = 'background'
    document.body.appendChild(background)
    mountModal()
    await tick()
    await afterPaint()

    expect(inertOf(background)).toBe(true)
    expect(inertOf(root)).toBe(false)
    expect(inertInChain(document.querySelector('[data-scope="notification"][data-part="item-close-trigger"]'))).toBe(false)
  })

  // 组件形态与服务档两条路都得逃得出来：服务档的那一摞由服务自己的宿主渲染
  it('轻提示预设的服务渲染的那一摞同样逃出 inert', async () => {
    const toast = createNotificationService({ preset: 'toast' })
    toast.success('已保存')
    await tick()
    mountModal()
    await tick()

    const group = document.querySelector<HTMLElement>('[data-scope="notification"][data-part="group"]')!
    expect(inertInChain(group)).toBe(false)
    toast.dispose()
  })
})
