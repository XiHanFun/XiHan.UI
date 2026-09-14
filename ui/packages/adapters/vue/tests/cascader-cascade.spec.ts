// @vitest-environment jsdom
// cascader 的级联勾选接线：值是路径集合，级联按尾值走原语、收敛后映射回完整路径。
import type { CascaderLevel } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderItem,
  XhCascaderItemText,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
} from '../src'

const CATALOG = [
  {
    value: 'digital',
    label: '数码',
    children: [
      {
        value: 'phone',
        label: '手机',
        children: [
          { value: 'ios', label: 'iOS' },
          { value: 'android', label: 'Android' },
        ],
      },
    ],
  },
  { value: 'other', label: '其他' },
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
  defaultValue?: string[][]
}

function mountCascader(opts: MountOptions = {}): { value: () => string[][] } {
  const value = ref<string[][]>(opts.defaultValue ?? [])
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhCascaderRoot, {
        'collection': CATALOG,
        'multiple': true,
        'cascade': true,
        'checkedStrategy': opts.checkedStrategy,
        'defaultOpen': true,
        'value': value.value,
        'onUpdate:value': (v: string[][]) => {
          value.value = v
        },
      }, {
        default: ({ levels }: { levels: CascaderLevel[] }) => [
          h(XhCascaderTrigger),
          h(XhCascaderPositioner, null, () => [
            h(XhCascaderContent, null, () => levels.map(lv =>
              h(XhCascaderColumn, { key: lv.level, level: lv.level }, () => lv.items.map(node =>
                h(XhCascaderItem, { key: node.value, value: node.value }, () => [
                  h(XhCascaderItemText, null, () => node.label),
                ]))))),
          ]),
        ],
      }),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return { value: () => value.value }
}

function itemEl(value: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-part="item"][data-value="${value}"]`)
  if (!el)
    throw new Error(`找不到条目 ${value}`)
  return el
}

describe('cascader cascade', () => {
  it('点分支整枝传导，默认只收叶路径', async () => {
    const t = mountCascader()
    await tick()
    itemEl('digital').click()
    await tick()
    expect(t.value().map(p => p.join('/')).sort()).toEqual(['digital/phone/android', 'digital/phone/ios'])
  })

  it('parent 策略收敛成最高整枝路径', async () => {
    const t = mountCascader({ checkedStrategy: 'parent' })
    await tick()
    itemEl('digital').click()
    await tick()
    expect(t.value().map(p => p.join('/'))).toEqual(['digital'])
  })

  it('部分勾中：分支条目 aria-checked=mixed + data-state=indeterminate', async () => {
    mountCascader({ defaultValue: [['digital', 'phone', 'ios']] })
    await tick()
    expect(itemEl('digital').getAttribute('aria-checked')).toBe('mixed')
    expect(itemEl('digital').getAttribute('data-state')).toBe('indeterminate')
    expect(itemEl('digital').getAttribute('aria-selected')).toBe('false')
  })

  it('整枝已勾再点分支即整枝卸掉', async () => {
    const t = mountCascader({ defaultValue: [['digital', 'phone', 'ios'], ['digital', 'phone', 'android']] })
    await tick()
    expect(itemEl('digital').getAttribute('aria-checked')).toBe('true')
    itemEl('digital').click()
    await tick()
    expect(t.value()).toEqual([])
  })
})
