// @vitest-environment jsdom
//
// 卡片的状态机叫 notification-item，文案却在 notification 那一桶：配置桶名若由机器名推出，
// 「改通知那颗叉的读屏名」就会静默落空。卡片与轻提示是同一种卡片的两种预设，读的是同一个桶。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  provideXhConfig,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
  XhNotificationItemTitle,
} from '../src'

const teardown: Array<() => void> = []

afterEach(() => {
  for (const fn of teardown.splice(0)) fn()
  document.body.innerHTML = ''
})

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

/** 一棵子树里同时挂一张卡片与一条轻提示，配置里只在通知那一桶给文案。 */
function mountBoth(): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup() {
      provideXhConfig({
        translations: {
          notification: { close: '关掉这条通知' },
        },
      })
      return () => [
        h(XhNotificationItem, { id: 'n', title: '有新的审批', duration: 0 }, () => [
          h(XhNotificationItemTitle),
          h(XhNotificationItemCloseTrigger),
        ]),
        h(XhNotificationItem, { id: 't', preset: 'toast', title: '已保存', duration: 0 }, () => [
          h(XhNotificationItemContent, null, () => h(XhNotificationItemTitle)),
          h(XhNotificationItemCloseTrigger),
        ]),
      ]
    },
  })
  app.mount(host)
  teardown.push(() => {
    app.unmount()
    host.remove()
  })
}

function labels(): Array<string | null> {
  return [...document.querySelectorAll('[data-scope="notification"][data-part="item-close-trigger"]')]
    .map(el => el.getAttribute('aria-label'))
}

describe('通知卡片的文案桶', () => {
  it('两种预设都读 notification 那一桶', async () => {
    mountBoth()
    await tick()
    expect(labels()).toEqual(['关掉这条通知', '关掉这条通知'])
  })
})
