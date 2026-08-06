// @vitest-environment jsdom
import type { SelectValueChangeDetails } from '@xihan-ui/headless'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import {
  XhSelectContent,
  XhSelectItem,
  XhSelectItemText,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from '../src'

const VALUES = ['apple', 'banana', 'cherry'] as const
const TEXT: Record<string, string> = { apple: 'Apple', banana: 'Banana', cherry: 'Cherry' }

beforeEach(() => {
  // jsdom 无 matchMedia，桩掉供 RuntimeConfig.reducedMotion 使用
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

interface MountedSelect {
  /** 'update:value' 收到的载荷，按派发先后。 */
  updates: string[][]
  /** 'value-change' 收到的载荷，按派发先后。 */
  changes: SelectValueChangeDetails[]
  unmount: () => void
}

function mountSelect(multiple: boolean): MountedSelect {
  const updates: string[][] = []
  const changes: SelectValueChangeDetails[] = []
  const Harness = defineComponent({
    setup() {
      return () => h(XhSelectRoot, {
        'multiple': multiple,
        'name': 'fruit',
        'placeholder': '请选择',
        'onUpdate:value': (value: string[]) => { updates.push(value) },
        'onValueChange': (details: SelectValueChangeDetails) => { changes.push(details) },
      }, {
        default: () => [
          h(XhSelectTrigger, null, { default: () => h(XhSelectValueText) }),
          h(XhSelectPositioner, null, {
            default: () => h(XhSelectContent, null, {
              default: () => VALUES.map(v => h(XhSelectItem, { key: v, value: v }, {
                default: () => h(XhSelectItemText, null, { default: () => TEXT[v] }),
              })),
            }),
          }),
        ],
      })
    },
  })
  const w = mount(Harness, { attachTo: document.body })
  return { updates, changes, unmount: () => w.unmount() }
}

function part(name: string, extra = ''): string {
  return `[data-scope="select"][data-part="${name}"]${extra}`
}

function triggerEl(): HTMLElement {
  return document.body.querySelector<HTMLElement>(part('trigger'))!
}

function itemEl(value: string): HTMLElement {
  return document.body.querySelector<HTMLElement>(part('item', `[data-value="${value}"]`))!
}

function hiddenSelectEl(): HTMLSelectElement {
  return document.body.querySelector<HTMLSelectElement>(part('hidden-select'))!
}

/** 事件经「机器写 context → 重渲」两段才落到 DOM 上。 */
async function flush(): Promise<void> {
  await nextTick()
  await nextTick()
}

async function open(): Promise<void> {
  triggerEl().click()
  await flush()
}

describe('xhSelect v-model 出口', () => {
  it('单选点条目：update:value 收到 ["apple"]，不是裸串 "apple"', async () => {
    const s = mountSelect(false)
    await flush()
    await open()

    itemEl('apple').click()
    await flush()

    expect(s.updates).toHaveLength(1)
    expect(Array.isArray(s.updates[0])).toBe(true)
    expect(s.updates[0]).toEqual(['apple'])

    // 单选的表单出口不开 multiple，select.value 即那一项
    expect(hiddenSelectEl().multiple).toBe(false)
    expect(hiddenSelectEl().value).toBe('apple')

    s.unmount()
  })

  it('多选连点两项：载荷依次是 ["apple"] 与 ["apple","cherry"]', async () => {
    const s = mountSelect(true)
    await flush()
    await open()

    itemEl('apple').click()
    await flush()
    itemEl('cherry').click()
    await flush()

    expect(s.updates).toEqual([['apple'], ['apple', 'cherry']])

    s.unmount()
  })

  it('多选点已选项：载荷是取消后的集合', async () => {
    const s = mountSelect(true)
    await flush()
    await open()

    itemEl('apple').click()
    await flush()
    itemEl('cherry').click()
    await flush()
    itemEl('apple').click()
    await flush()

    expect(s.updates).toEqual([['apple'], ['apple', 'cherry'], ['cherry']])

    s.unmount()
  })

  it('value-change 的载荷是 { value: string[] } 对象，与 update:value 的裸值分工不同', async () => {
    const s = mountSelect(true)
    await flush()
    await open()

    itemEl('banana').click()
    await flush()
    itemEl('cherry').click()
    await flush()

    expect(s.changes).toEqual([{ value: ['banana'] }, { value: ['banana', 'cherry'] }])
    expect(s.changes.map(d => d.value)).toEqual(s.updates)

    s.unmount()
  })

  it('多选下隐藏 select 开原生 multiple，每个选中值一个 selected 选项', async () => {
    const s = mountSelect(true)
    await flush()
    await open()

    itemEl('apple').click()
    await flush()
    itemEl('cherry').click()
    await flush()

    const el = hiddenSelectEl()
    // multiple 必须在 option 插入前就位，否则只有最后一个 selected 留得住
    expect(el.multiple).toBe(true)
    expect(el.getAttribute('multiple')).not.toBeNull()
    expect([...el.selectedOptions].map(o => o.value)).toEqual(['apple', 'cherry'])
    // 打底的空串选项不参与提交
    expect([...el.options].map(o => o.value)).toEqual(['', 'apple', 'cherry'])

    s.unmount()
  })
})
