// @vitest-environment jsdom
// 树上三个对读屏隐藏的把手（箭头与两个勾选框）：指针不得把焦点落在它们身上，
// 否则焦点停在 aria-hidden 的节点里；勾选把手还要把焦点交给所在的那一行。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTreeBranch,
  XhTreeBranchCheckbox,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemCheckbox,
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
        { collection, selectionMode: 'multiple', defaultExpandedValue: ['dir'] },
        () => [
          h(XhTreeTree, null, () => [
            h(XhTreeBranch, { value: 'dir' }, () => [
              h(XhTreeBranchControl, null, () => [
                h(XhTreeBranchTrigger),
                h(XhTreeBranchCheckbox),
                h(XhTreeBranchText, () => '目录'),
              ]),
              h(XhTreeBranchContent, null, () => [
                h(XhTreeItem, { value: 'leaf' }, () => [
                  h(XhTreeItemCheckbox),
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

describe('树上 aria-hidden 把手的焦点归属', () => {
  it('三个把手都对读屏隐藏且不进 Tab 序列', async () => {
    const host = mount()
    await tick()
    for (const name of ['branch-trigger', 'branch-checkbox', 'item-checkbox']) {
      const el = part(host, name)
      expect(el.getAttribute('aria-hidden')).toBe('true')
      expect(el.getAttribute('tabindex')).toBe('-1')
    }
  })

  it('指针按下被拦掉，焦点不会停在 aria-hidden 的把手上', async () => {
    const host = mount()
    await tick()
    for (const name of ['branch-trigger', 'branch-checkbox', 'item-checkbox']) {
      const el = part(host, name)
      expect(pointerDown(el)).toBe(true)
      expect(document.activeElement).not.toBe(el)
    }
  })

  it('点勾选把手后，焦点落在所在的那一行', async () => {
    const host = mount()
    await tick()

    const itemBox = part(host, 'item-checkbox')
    pointerDown(itemBox)
    itemBox.click()
    await tick()
    expect(document.activeElement).toBe(part(host, 'item'))

    const branchBox = part(host, 'branch-checkbox')
    pointerDown(branchBox)
    branchBox.click()
    await tick()
    expect(document.activeElement).toBe(part(host, 'branch'))
  })
})
