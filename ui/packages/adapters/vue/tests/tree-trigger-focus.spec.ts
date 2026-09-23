// @vitest-environment jsdom
// 树上对读屏隐藏的展开箭头：指针不得把焦点落在它身上，否则焦点停在 aria-hidden 的节点里。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemText,
  XhTreeRoot,
  XhTreeTree,
} from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

const collection = [
  { value: 'dir', label: '目录', children: [{ value: 'leaf', label: '叶子' }] },
]

function mount(): HTMLElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(
        XhTreeRoot,
        { collection, multiple: true, defaultExpandedValue: ['dir'] },
        () => [
          h(XhTreeTree, null, () => [
            h(XhTreeBranch, { value: 'dir' }, () => [
              h(XhTreeBranchControl, null, () => [
                h(XhTreeBranchTrigger),
                h(XhTreeBranchText, () => '目录'),
              ]),
              h(XhTreeBranchContent, null, () => [
                h(XhTreeItem, { value: 'leaf' }, () => [
                  h(XhTreeItemText, () => '叶子'),
                ]),
              ]),
            ]),
          ]),
        ],
      ),
  })
  app.mount(host)
  cleanup.push(() => app.unmount())
  return host
}

function part(host: HTMLElement, name: string): HTMLElement {
  return host.querySelector<HTMLElement>(`[data-scope="tree"][data-part="${name}"]`)!
}

/** 模拟真实指针按下：默认动作没被拦就把焦点落到该节点上。 */
function pointerDown(el: HTMLElement): boolean {
  const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 })
  el.dispatchEvent(event)
  if (!event.defaultPrevented)
    el.focus()
  return event.defaultPrevented
}

describe('树上 aria-hidden 箭头的焦点归属', () => {
  it('展开箭头对读屏隐藏且不进 Tab 序列', async () => {
    const host = mount()
    await tick()
    const el = part(host, 'branch-trigger')
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(el.getAttribute('tabindex')).toBe('-1')
  })

  it('指针按下被拦掉，焦点不会停在 aria-hidden 的箭头上', async () => {
    const host = mount()
    await tick()
    const el = part(host, 'branch-trigger')
    expect(pointerDown(el)).toBe(true)
    expect(document.activeElement).not.toBe(el)
  })
})
