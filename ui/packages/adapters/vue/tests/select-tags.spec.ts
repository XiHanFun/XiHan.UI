// @vitest-environment jsdom
// select 多选标签形态：api 的 tags 受 maxTagCount 截断（缺省 3）、余数进 overflowCount，
// XhSelectOverflowTag 把余数显示成 +N；XhSelectItemDeleteTrigger 点按摘掉所在标签的选中值，禁用时不动。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhSelectContent,
  XhSelectItem,
  XhSelectItemDeleteTrigger,
  XhSelectItemText,
  XhSelectList,
  XhSelectOverflowTag,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTag,
  XhSelectTagList,
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
  { value: 'd', label: '丁' },
]

interface SlotBag {
  tags: Array<{ value: string, label: string }>
  overflowCount: number
  overflowText: string
}

/** 触发器里摆标签行（纯展示 + overflow-tag），触发器外再摆一排带删除钮的标签。 */
function mountSelect(props: Record<string, unknown> = {}): { change: ReturnType<typeof vi.fn>, bag: () => SlotBag, host: HTMLElement } {
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
            h(XhSelectTrigger, null, () => h(XhSelectTagList, null, () => [
              ...bag.tags.map(t => h(XhSelectTag, { key: t.value, value: t.value }, () => t.label)),
              h(XhSelectOverflowTag),
            ])),
            ...bag.tags.map(t => h(XhSelectTag, { key: t.value, value: t.value }, () => [
              t.label,
              h(XhSelectItemDeleteTrigger, () => '✕'),
            ])),
            h(XhSelectPositioner, null, () => [
              h(XhSelectContent, null, () => h(XhSelectList, null, () => COLLECTION.map(o =>
                h(XhSelectItem, { key: o.value, value: o.value }, () => [h(XhSelectItemText, () => o.label)]),
              ))),
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
  return { change, bag: () => latest!, host }
}

/** 触发器外那枚带删除钮的标签。 */
function tagEl(host: HTMLElement, v: string): HTMLElement {
  const hit = host.querySelector<HTMLElement>(`[data-scope="select"][data-part="tag"][data-value="${v}"]:has([data-part="item-delete-trigger"])`)
  if (!hit)
    throw new Error(`找不到标签 ${v}`)
  return hit
}

function partEl(host: HTMLElement, name: string): HTMLElement {
  const hit = host.querySelector<HTMLElement>(`[data-scope="select"][data-part="${name}"]`)
  if (!hit)
    throw new Error(`找不到部件 ${name}`)
  return hit
}

describe('select 多选标签', () => {
  it('不给 maxTagCount：最多摆 3 枚，第 4 个起折进 overflowCount', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b', 'c', 'd'] })
    await tick()
    expect(m.bag().tags.map(t => t.value)).toEqual(['a', 'b', 'c'])
    expect(m.bag().overflowCount).toBe(1)
    expect(m.bag().overflowText).toBe('+1')
  })

  it('选中不超过 3 项时一枚都不折：overflow-tag 带 hidden、文字为空', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b', 'c'] })
    await tick()
    expect(m.bag().overflowCount).toBe(0)
    expect(m.bag().overflowText).toBe('')
    expect(partEl(m.host, 'overflow-tag').hidden).toBe(true)
    expect(partEl(m.host, 'overflow-tag').textContent).toBe('')
    expect(partEl(m.host, 'tag-list').hidden).toBe(false)
  })

  it('overflow-tag 显示 +N 并带 data-count', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b', 'c', 'd'], maxTagCount: 1 })
    await tick()
    expect(partEl(m.host, 'overflow-tag').hidden).toBe(false)
    expect(partEl(m.host, 'overflow-tag').textContent).toBe('+3')
    expect(partEl(m.host, 'overflow-tag').getAttribute('data-count')).toBe('3')
  })

  it('maxTagCount 为 0：一枚标签都不摆，只剩 +N；文字走 translations.overflowTag', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b'], maxTagCount: 0, translations: { overflowTag: (count: number) => `还有 ${count} 项` } })
    await tick()
    expect(m.bag().tags).toEqual([])
    expect(partEl(m.host, 'overflow-tag').textContent).toBe('还有 2 项')
  })

  it('无选中时 tag-list 带 hidden，选中后去掉', async () => {
    const m = mountSelect({ defaultValue: [] })
    await tick()
    expect(partEl(m.host, 'tag-list').hidden).toBe(true)
    partEl(m.host, 'trigger').click()
    await tick()
    // 浮层被搬到 portal 落点，不在宿主子树里
    document.querySelector<HTMLElement>('[data-scope="select"][data-part="item"][data-value="a"]')!.click()
    await tick()
    expect(partEl(m.host, 'tag-list').hidden).toBe(false)
    expect(m.bag().tags.map(t => t.value)).toEqual(['a'])
  })

  it('禁用时 tag-list 与 overflow-tag 都标 data-disabled', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b', 'c', 'd'], disabled: true })
    await tick()
    expect(partEl(m.host, 'tag-list').hasAttribute('data-disabled')).toBe(true)
    expect(partEl(m.host, 'overflow-tag').hasAttribute('data-disabled')).toBe(true)
  })

  it('tags 与 value 同序取 collection 文本；maxTagCount 截断、余数进 overflowCount', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b', 'c'], maxTagCount: 2 })
    await tick()
    expect(m.bag().tags).toEqual([{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }])
    expect(m.bag().overflowCount).toBe(1)
  })

  it('点删除钮摘掉那个值；可及名走 deleteItem', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b'], translations: { deleteItem: (label: string) => `移除${label}` } })
    await tick()
    const remove = tagEl(m.host, 'a').querySelector<HTMLElement>('[data-part="item-delete-trigger"]')!
    expect(remove.getAttribute('aria-label')).toBe('移除甲')
    remove.click()
    await tick()
    expect(m.change).toHaveBeenCalledWith({ value: ['b'] })
  })

  it('禁用时删除钮不动', async () => {
    const m = mountSelect({ defaultValue: ['a'], disabled: true })
    await tick()
    tagEl(m.host, 'a').querySelector<HTMLElement>('[data-part="item-delete-trigger"]')!.click()
    await tick()
    expect(m.change).not.toHaveBeenCalled()
  })

  it('只读时删除钮同样不动', async () => {
    const m = mountSelect({ defaultValue: ['a'], readOnly: true })
    await tick()
    tagEl(m.host, 'a').querySelector<HTMLElement>('[data-part="item-delete-trigger"]')!.click()
    await tick()
    expect(m.change).not.toHaveBeenCalled()
  })
})
