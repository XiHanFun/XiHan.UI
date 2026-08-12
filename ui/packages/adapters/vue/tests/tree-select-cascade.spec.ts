// @vitest-environment jsdom
// tree-select 的级联勾选：点分支整枝传导、半选态三值输出、回显收敛策略。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectContent,
  XhTreeSelectItem,
  XhTreeSelectItemText,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
} from '../src'

const COLLECTION = [
  {
    value: 'user',
    label: '用户管理',
    children: [
      { value: 'user:view', label: '查看' },
      { value: 'user:edit', label: '编辑' },
    ],
  },
  { value: 'audit', label: '审计' },
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

interface MountOptions {
  checkedStrategy?: 'all' | 'parent' | 'child'
  defaultValue?: string[]
}

function mountCascade(opts: MountOptions = {}): { value: () => string[] } {
  const value = ref<string[]>(opts.defaultValue ?? [])
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhTreeSelectRoot, {
        'collection': COLLECTION,
        'multiple': true,
        'cascade': true,
        'checkedStrategy': opts.checkedStrategy,
        'defaultOpen': true,
        'defaultExpandedValue': ['user'],
        'value': value.value,
        'onUpdate:value': (v: string[]) => {
          value.value = v
        },
      }, () => [
        h(XhTreeSelectTrigger),
        h(XhTreeSelectPositioner, null, () => [
          h(XhTreeSelectContent, null, () => [
            h(XhTreeSelectTree, null, () => [
              h(XhTreeSelectBranch, { value: 'user' }, () => [
                h(XhTreeSelectBranchControl, { value: 'user' }, () => [
                  h(XhTreeSelectBranchText, { value: 'user' }, () => '用户管理'),
                ]),
                h(XhTreeSelectBranchContent, { value: 'user' }, () => [
                  h(XhTreeSelectItem, { value: 'user:view' }, () => [h(XhTreeSelectItemText, { value: 'user:view' }, () => '查看')]),
                  h(XhTreeSelectItem, { value: 'user:edit' }, () => [h(XhTreeSelectItemText, { value: 'user:edit' }, () => '编辑')]),
                ]),
              ]),
              h(XhTreeSelectItem, { value: 'audit' }, () => [h(XhTreeSelectItemText, { value: 'audit' }, () => '审计')]),
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
  return { value: () => value.value }
}

function nodeEl(value: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-value="${value}"]`)
  if (!el)
    throw new Error(`找不到节点 ${value}`)
  return el
}

function branchControlEl(value: string): HTMLElement {
  const el = nodeEl(value).querySelector<HTMLElement>(`[data-part="branch-control"]`)
  if (!el)
    throw new Error(`找不到分支行 ${value}`)
  return el
}

describe('tree-select cascade', () => {
  it('点分支整枝传导，默认策略只收叶', async () => {
    const t = mountCascade()
    await tick()
    branchControlEl('user').click()
    await tick()
    expect(t.value().sort()).toEqual(['user:edit', 'user:view'])
  })

  it('parent 策略整组选满收敛成组名', async () => {
    const t = mountCascade({ checkedStrategy: 'parent' })
    await tick()
    branchControlEl('user').click()
    await tick()
    expect(t.value()).toEqual(['user'])
  })

  it('部分勾中：分支 aria-checked=mixed 且带 data-indeterminate', async () => {
    const t = mountCascade({ defaultValue: ['user:view'] })
    await tick()
    const branch = nodeEl('user')
    expect(branch.getAttribute('aria-checked')).toBe('mixed')
    expect(branchControlEl('user').hasAttribute('data-indeterminate')).toBe(true)
    expect(t.value()).toEqual(['user:view'])
  })

  it('子全勾后分支报 aria-checked=true 与 data-selected', async () => {
    mountCascade({ defaultValue: ['user:view', 'user:edit'] })
    await tick()
    expect(nodeEl('user').getAttribute('aria-checked')).toBe('true')
    expect(branchControlEl('user').hasAttribute('data-selected')).toBe(true)
  })

  it('整枝已勾再点分支即整枝卸掉', async () => {
    const t = mountCascade({ defaultValue: ['user:view', 'user:edit'] })
    await tick()
    branchControlEl('user').click()
    await tick()
    expect(t.value()).toEqual([])
  })

  it('叶多次点选与普通多选一致，互不影响别的枝', async () => {
    const t = mountCascade()
    await tick()
    nodeEl('audit').querySelector('[data-part="item-text"]')
    nodeEl('audit').click()
    await tick()
    expect(t.value()).toEqual(['audit'])
    nodeEl('user:view').click()
    await tick()
    expect(t.value().sort()).toEqual(['audit', 'user:view'])
  })
})
