// @vitest-environment jsdom
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import {
  provideXhConfig,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from '../src'

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => setTimeout(resolve, 0))
  await nextTick()
}

async function mountPopover(modal: boolean): Promise<HTMLElement> {
  host = document.createElement('div')
  host.innerHTML = '<div data-test="scroller" style="overflow: auto"></div><div data-test="mount"></div>'
  document.body.append(host)
  const scroller = host.querySelector<HTMLElement>('[data-test="scroller"]')!
  const Shell = defineComponent({
    setup() {
      provideXhConfig({ scrollRoot: () => scroller })
      return () => h(XhPopoverRoot, { modal, open: true }, () => [
        h(XhPopoverTrigger, null, () => '订阅设置'),
        h(XhPopoverPositioner, null, () => [
          h(XhPopoverContent, null, () => [h(XhPopoverTitle, null, () => '订阅设置')]),
        ]),
      ])
    },
  })
  app = createApp(Shell)
  app.mount(host.querySelector<HTMLElement>('[data-test="mount"]')!)
  await settle()
  return scroller
}

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.getElementById('xh-portal-root')?.remove()
  document.body.style.cssText = ''
  document.documentElement.style.cssText = ''
})

// 宿主把滚动搬进内容容器时 body 本身不滚，锁 body 是空操作：模态浮层要锁的是配置给的那一层
describe('popover 的 scrollRoot 配置', () => {
  it('模态打开时锁配置给的滚动容器，不锁页面', async () => {
    const scroller = await mountPopover(true)

    expect(scroller.style.overflow).toBe('hidden')
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('非模态不加锁', async () => {
    const scroller = await mountPopover(false)

    expect(scroller.style.overflow).toBe('auto')
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})
