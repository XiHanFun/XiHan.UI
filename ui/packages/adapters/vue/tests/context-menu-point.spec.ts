// @vitest-environment jsdom
// 右键菜单钉在坐标上：受控 open 打开时锚点仍是 (0,0)，坐标要经 openAt 交进去。
// collection 代铺那条路没有默认插槽，所以命令由根 expose 出来。
import type { ContextMenuNode } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhContextMenuRoot } from '../src'

const COLLECTION: ContextMenuNode[] = [
  { value: 'close', label: '关闭' },
  { value: 'close-others', label: '关闭其它' },
]

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

function mountMenu(): { rootRef: { value: unknown }, open: { value: boolean } } {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const rootRef = ref<unknown>(null)
  const open = ref(false)
  const app = createApp({
    setup: () => () =>
      h(XhContextMenuRoot, {
        'ref': (el: unknown) => { rootRef.value = el },
        'collection': COLLECTION,
        'open': open.value,
        'onUpdate:open': (next: boolean) => { open.value = next },
      }, { trigger: () => [h('span', '锚点')] }),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return { rootRef, open }
}

function positioner(): HTMLElement {
  return document.querySelector('[data-scope=\'context-menu\'][data-part=\'positioner\']') as HTMLElement
}

describe('右键菜单的锚点坐标', () => {
  it('根把 openAt / setOpen 暴露出来，collection 那条路也够得到', async () => {
    const { rootRef } = mountMenu()
    await nextTick()

    const api = rootRef.value as { openAt?: unknown, setOpen?: unknown }
    expect(typeof api.openAt).toBe('function')
    expect(typeof api.setOpen).toBe('function')
  })

  it('openAt 给的坐标落到定位层上', async () => {
    const { rootRef, open } = mountMenu()
    await nextTick()

    ;(rootRef.value as { openAt: (x: number, y: number) => void }).openAt(120, 240)
    await nextTick()
    await nextTick()

    expect(open.value).toBe(true)
    expect(positioner().style.getPropertyValue('left')).toBe('120px')
    expect(positioner().style.getPropertyValue('top')).toBe('240px')
  })
})
