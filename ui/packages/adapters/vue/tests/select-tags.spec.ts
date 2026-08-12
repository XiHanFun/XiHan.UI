// @vitest-environment jsdom
// select 多选标签形态：api 的 tags 受 maxTagCount 截断、余数进 overflowCount；
// XhSelectTagRemove 点按摘掉所在标签的选中值，禁用时不动。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhSelectContent,
  XhSelectItem,
  XhSelectItemText,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTag,
  XhSelectTagRemove,
  XhSelectTrigger,
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

const COLLECTION = [
  { value: 'a', label: '甲' },
  { value: 'b', label: '乙' },
  { value: 'c', label: '丙' },
]

interface SlotBag {
  tags: Array<{ value: string, label: string }>
  overflowCount: number
}

function mountSelect(props: Record<string, unknown> = {}): { change: ReturnType<typeof vi.fn>, bag: () => SlotBag } {
  const change = vi.fn()
  let latest: SlotBag | undefined
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhSelectRoot, { 'collection': COLLECTION, 'multiple': true, 'onValue-change': change, ...props }, {
        default: (bag: SlotBag) => {
          latest = bag
          return [
            h(XhSelectTrigger),
            ...bag.tags.map(t => h(XhSelectTag, { key: t.value, value: t.value }, () => [
              t.label,
              h(XhSelectTagRemove, () => '✕'),
            ])),
            h(XhSelectPositioner, null, () => [
              h(XhSelectContent, null, () => COLLECTION.map(o =>
                h(XhSelectItem, { key: o.value, value: o.value }, () => [h(XhSelectItemText, () => o.label)]),
              )),
            ]),
          ]
        },
      }),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return { change, bag: () => latest! }
}

function tagEl(v: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(`[data-scope="select"][data-part="tag"][data-value="${v}"]`)
  if (!hit)
    throw new Error(`找不到标签 ${v}`)
  return hit
}

describe('select 多选标签', () => {
  it('tags 与 value 同序取 collection 文本；maxTagCount 截断、余数进 overflowCount', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b', 'c'], maxTagCount: 2 })
    await tick()
    expect(m.bag().tags).toEqual([{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }])
    expect(m.bag().overflowCount).toBe(1)
  })

  it('点删除钮摘掉那个值；可及名走 removeTag 模板', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b'], translations: { removeTag: '移除{label}' } })
    await tick()
    const remove = tagEl('a').querySelector<HTMLElement>('[data-part="tag-remove"]')!
    expect(remove.getAttribute('aria-label')).toBe('移除甲')
    remove.click()
    await tick()
    expect(m.change).toHaveBeenCalledWith({ value: ['b'] })
  })

  it('禁用时删除钮不动', async () => {
    const m = mountSelect({ defaultValue: ['a'], disabled: true })
    await tick()
    tagEl('a').querySelector<HTMLElement>('[data-part="tag-remove"]')!.click()
    await tick()
    expect(m.change).not.toHaveBeenCalled()
  })
})
