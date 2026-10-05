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
 * 模态浮层给 body 的其它直接子元素打 aria-hidden 让背景对读屏隐藏，通知却画在遮罩之上：
 * 被一并藏起就成了看得见、读屏却跳过。判据钉的是通知子树带着豁免标记逃出背景失活。
 */

function hiddenOf(el: Element): boolean {
  return el.getAttribute('aria-hidden') === 'true'
}

/** 自己或任一祖先被藏起：aria-hidden 沿子树生效，只看节点自己不够。 */
function hiddenInChain(el: Element | null): boolean {
  for (let node: Element | null = el; node; node = node.parentElement) {
    if (hiddenOf(node))
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

/** 打开一个模态对话框，它会给 body 下其余直接子元素打 aria-hidden。 */
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
  it('背景被藏起，通知子树逃出来', async () => {
    const root = mountNotifications()
    const background = document.createElement('div')
    background.id = 'background'
    document.body.appendChild(background)
    mountModal()
    await tick()

    expect(hiddenOf(background)).toBe(true)
    expect(hiddenOf(root)).toBe(false)
    expect(hiddenInChain(document.querySelector('[data-scope="notification"][data-part="item-close-trigger"]'))).toBe(false)
  })

  // 组件形态与服务档两条路都得逃得出来：服务档的那一摞由服务自己的宿主渲染
  it('轻提示预设的服务渲染的那一摞同样逃出背景失活', async () => {
    const toast = createNotificationService({ preset: 'toast' })
    toast.success('已保存')
    await tick()
    mountModal()
    await tick()

    const group = document.querySelector<HTMLElement>('[data-scope="notification"][data-part="group"]')!
    expect(hiddenInChain(group)).toBe(false)
    toast.dispose()
  })
})
