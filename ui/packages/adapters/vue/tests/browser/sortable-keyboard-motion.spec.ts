// 键盘重排：被拖那一项逐格挪时与让位的邻项同一段一起滑，不是它瞬跳、邻项在滑；
// 取消时各项从此刻的位置滑回原位，不瞬间回位。过渡与动画在不在跑只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

async function frames(count = 1): Promise<void> {
  await nextTick()
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'inline-size: 240px'
  document.body.append(host)
  const ids = ref(['a', 'b', 'c', 'd'])
  app = createApp({
    render: () => h(XhSortableRoot, {
      'ids': ids.value,
      'onUpdate:ids': (next: string[]) => (ids.value = next),
    }, () => ids.value.map(id => h(XhSortableItem, { key: id, itemId: id, style: 'block-size: 40px; box-sizing: border-box' }, () => [h(XhSortableItemDragTrigger, { itemId: id }), id]))),
  })
  app.mount(host)
  await frames(2)
}

function item(id: string): HTMLElement {
  return [...host!.querySelectorAll<HTMLElement>('[data-part="item"]')].find(el => el.textContent === id)!
}

/** 把手：键盘拾起、挪位与放下都从它进。 */
function handle(id: string): HTMLElement {
  return item(id).querySelector<HTMLElement>('[data-part="item-drag-trigger"]')!
}

/** 节点上在跑的 translate 过渡或换位动画。 */
function moving(el: Element): string[] {
  return el.getAnimations().map(a => (a instanceof CSSTransition ? a.transitionProperty : a instanceof CSSAnimation ? a.animationName : 'glide')).filter(name => name === 'translate' || name === 'glide')
}

describe('sortable 键盘重排', () => {
  it('被拖那一项逐格挪时与让位的邻项一起滑', async () => {
    await mount()
    handle('a').focus()
    await userEvent.keyboard(' ')
    await frames(1)
    await userEvent.keyboard('{ArrowDown}')
    await frames(1)
    expect(moving(item('a')), '被拖那一项').toContain('translate')
    expect(moving(item('b')), '让位的邻项').toContain('translate')
  })

  it('取消：各项从此刻的位置滑回原位', async () => {
    await mount()
    handle('a').focus()
    await userEvent.keyboard(' ')
    await frames(1)
    await userEvent.keyboard('{ArrowDown}')
    await frames(1)
    await Promise.all([item('a'), item('b')].flatMap(el => el.getAnimations()).map(a => a.finished.catch(() => undefined)))
    await userEvent.keyboard('{Escape}')
    await frames(1)
    expect(moving(item('a')).length, '被拖那一项滑回').toBeGreaterThan(0)
    expect(moving(item('b')).length, '邻项滑回').toBeGreaterThan(0)
  })
})
