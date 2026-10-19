// @vitest-environment jsdom
// tree 的级联勾选接线：点分支整枝传导、半选三态、收敛策略。算法本身在 behavior 包已有判据，
// 这里只验组件层接对了。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeItem,
  XhTreeItemText,
  XhTreeRoot,
  XhTreeTree,
} from '../src'

const COLLECTION = [
  {
    value: 'east',
    label: '华东',
    children: [
      { value: 'sh', label: '上海' },
      { value: 'hz', label: '杭州' },
    ],
  },
]

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

function mountTree(opts: { checkedStrategy?: 'all' | 'parent' | 'child', defaultValue?: string[] } = {}): { value: () => string[] } {
  const selected = ref<string[]>(opts.defaultValue ?? [])
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhTreeRoot, {
        'collection': COLLECTION,
        'selectionMode': 'multiple',
        'cascade': true,
        'checkedStrategy': opts.checkedStrategy,
        'defaultExpandedValue': ['east'],
        'selection': selected.value,
        'onUpdate:selection': (v: string[]) => {
          selected.value = v
        },
      }, () => [
        h(XhTreeTree, null, () => [
          h(XhTreeBranch, { value: 'east' }, () => [
            h(XhTreeBranchControl, null, () => [h(XhTreeBranchText, null, () => '华东')]),
            h(XhTreeBranchContent, null, () => [
              h(XhTreeItem, { value: 'sh' }, () => [h(XhTreeItemText, null, () => '上海')]),
              h(XhTreeItem, { value: 'hz' }, () => [h(XhTreeItemText, null, () => '杭州')]),
            ]),
          ]),
        ]),
      ]),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return { value: () => selected.value }
}

function nodeEl(value: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-value="${value}"]`)
  if (!el)
    throw new Error(`找不到节点 ${value}`)
  return el
}

describe('tree cascade', () => {
  it('点分支整枝传导，默认只收叶', async () => {
    const t = mountTree()
    await tick()
    nodeEl('east').querySelector<HTMLElement>('[data-part="branch-control"]')!.click()
    await tick()
    expect(t.value().sort()).toEqual(['hz', 'sh'])
  })

  it('parent 策略收敛成整枝', async () => {
    const t = mountTree({ checkedStrategy: 'parent' })
    await tick()
    nodeEl('east').querySelector<HTMLElement>('[data-part="branch-control"]')!.click()
    await tick()
    expect(t.value()).toEqual(['east'])
  })

  it('部分勾中：分支 aria-checked=mixed + data-indeterminate', async () => {
    mountTree({ defaultValue: ['sh'] })
    await tick()
    expect(nodeEl('east').getAttribute('aria-checked')).toBe('mixed')
    expect(nodeEl('east').querySelector('[data-part="branch-control"]')!.hasAttribute('data-indeterminate')).toBe(true)
  })

  it('子全勾分支报 aria-checked=true', async () => {
    mountTree({ defaultValue: ['sh', 'hz'] })
    await tick()
    expect(nodeEl('east').getAttribute('aria-checked')).toBe('true')
  })
})
