// @vitest-environment jsdom
//
// 通知的卡片跑的是 toast 那台机器，但它的文案该跟着通知走。
// 两侧的配置桶名都由机器名推出过一阵子，于是「改通知那颗叉的读屏名」会连所有轻提示一起改，
// 反过来「只改 toast 桶」又会静默漏掉通知——两道相关门禁都放行，只能靠用例钉住。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  provideXhConfig,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemTitle,
  XhToastCloseTrigger,
  XhToastRoot,
  XhToastTitle,
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

/** 一棵子树里同时挂一张通知卡与一条轻提示，配置里两个桶各给一份不同的文案。 */
function mountBoth(): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup() {
      provideXhConfig({
        translations: {
          toast: { close: '关掉这条提示' },
          notification: { close: '关掉这条通知' },
        },
      })
      return () => [
        h(XhNotificationItem, { id: 'n', title: '有新的审批', duration: 0 }, () => [
          h(XhNotificationItemTitle),
          h(XhNotificationItemCloseTrigger),
        ]),
        h(XhToastRoot, { id: 't', title: '已保存', duration: 0 }, () => [
          h(XhToastTitle),
          h(XhToastCloseTrigger),
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

function labelOf(scope: string, part: string): string | null {
  return document.querySelector(`[data-scope="${scope}"][data-part="${part}"]`)?.getAttribute('aria-label') ?? null
}

describe('通知卡片与轻提示的文案桶', () => {
  it('各读各的桶，不串味', async () => {
    mountBoth()
    await tick()
    expect(labelOf('notification', 'item-close-trigger')).toBe('关掉这条通知')
    expect(labelOf('toast', 'close-trigger')).toBe('关掉这条提示')
  })
})
