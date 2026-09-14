// @vitest-environment jsdom
// select 多选标签形态：api 的 tags 受 maxTagCount 截断（缺省 3）、余数进 overflowCount，
// XhSelectOverflowTag 把余数显示成 +N；XhSelectItemDeleteTrigger 渲的是所在标签那份 tag 的 close-trigger，
// 点按摘掉所在标签的选中值，禁用时留位、原生 disabled，只读时点了不动。
// 每枚标签与 +N 都是库里 tag 的 root（data-scope="tag"）：语气、尺寸与禁用从 select 传下去，形态按控件的面派；
// 触发器里的不渲关闭钮；只有文字的标签替它包一层 tag 的 label，作者自己写了节点就原样放行。
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

const TAG_ROOT = '[data-scope="tag"][data-part="root"]'
const CLOSE_TRIGGER = '[data-scope="tag"][data-part="close-trigger"]'

/** 触发器外那枚带删除钮的标签。 */
function tagEl(host: HTMLElement, v: string): HTMLElement {
  const hit = host.querySelector<HTMLElement>(`${TAG_ROOT}[data-value="${v}"]:has(${CLOSE_TRIGGER})`)
  if (!hit)
    throw new Error(`找不到标签 ${v}`)
  return hit
}

/** 触发器外那枚标签里的删除钮：就是 tag 的 close-trigger。 */
function deleteTriggerEl(host: HTMLElement, v: string): HTMLButtonElement {
  return tagEl(host, v).querySelector<HTMLButtonElement>(CLOSE_TRIGGER)!
}

/** 触发器里的标签，文档序。 */
function triggerTags(host: HTMLElement): HTMLElement[] {
  return [...host.querySelectorAll<HTMLElement>(`[data-scope="select"][data-part="tag-list"] > ${TAG_ROOT}:not([data-count])`)]
}

/** +N 那一枚：也是 tag 的 root，另带 data-count。 */
function overflowEl(host: HTMLElement): HTMLElement {
  const hit = host.querySelector<HTMLElement>(`${TAG_ROOT}[data-count]`)
  if (!hit)
    throw new Error('找不到 +N 那一枚')
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
    expect(overflowEl(m.host).hidden).toBe(true)
    expect(overflowEl(m.host).getAttribute('data-state')).toBe('closed')
    expect(overflowEl(m.host).textContent).toBe('')
    expect(partEl(m.host, 'tag-list').hidden).toBe(false)
  })

  it('overflow-tag 显示 +N 并带 data-count', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b', 'c', 'd'], maxTagCount: 1 })
    await tick()
    expect(overflowEl(m.host).hidden).toBe(false)
    expect(overflowEl(m.host).getAttribute('data-state')).toBe('open')
    expect(overflowEl(m.host).textContent).toBe('+3')
    expect(overflowEl(m.host).getAttribute('data-count')).toBe('3')
    // +N 的文字落在 tag 的 label 里
    expect(overflowEl(m.host).querySelector('[data-scope="tag"][data-part="label"]')?.textContent).toBe('+3')
  })

  it('maxTagCount 为 0：一枚标签都不摆，只剩 +N；文字走 translations.overflowTag', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b'], maxTagCount: 0, translations: { overflowTag: (count: number) => `还有 ${count} 项` } })
    await tick()
    expect(m.bag().tags).toEqual([])
    expect(overflowEl(m.host).textContent).toBe('还有 2 项')
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

  it('禁用时 tag-list、每枚标签与 +N 都标 data-disabled', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b', 'c', 'd'], disabled: true })
    await tick()
    expect(partEl(m.host, 'tag-list').hasAttribute('data-disabled')).toBe(true)
    expect(overflowEl(m.host).hasAttribute('data-disabled')).toBe(true)
    for (const tag of triggerTags(m.host))
      expect(tag.hasAttribute('data-disabled')).toBe(true)
  })

  it('触发器里每枚标签与 +N 都是 tag 的 root：不可关闭、展示态、带 data-value', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b', 'c', 'd'] })
    await tick()
    const tags = triggerTags(m.host)
    expect(tags.map(t => t.getAttribute('data-value'))).toEqual(['a', 'b', 'c'])
    for (const tag of [...tags, overflowEl(m.host)]) {
      expect(tag.getAttribute('data-scope')).toBe('tag')
      expect(tag.getAttribute('data-part')).toBe('root')
      expect(tag.getAttribute('data-state')).toBe('open')
      expect(tag.hidden).toBe(false)
      expect(tag.querySelector('[data-part="close-trigger"]')).toBeNull()
    }
    // 标签行里没有本组件自己画的标签部件
    expect(m.host.querySelector('[data-scope="select"][data-part="tag"], [data-scope="select"][data-part="overflow-tag"]')).toBeNull()
  })

  it('tone / size 由 select 传到每枚标签与 +N 上；不写就不带', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b', 'c', 'd'], tone: 'success', size: 'sm' })
    await tick()
    for (const tag of [...triggerTags(m.host), overflowEl(m.host)]) {
      expect(tag.getAttribute('data-tone')).toBe('success')
      expect(tag.getAttribute('data-size')).toBe('sm')
    }
    const g = mountSelect({ defaultValue: ['a', 'b', 'c', 'd'] })
    await tick()
    for (const tag of [...triggerTags(g.host), overflowEl(g.host)]) {
      expect(tag.hasAttribute('data-tone')).toBe(false)
      expect(tag.hasAttribute('data-size')).toBe(false)
    }
  })

  // 标签的形态按控件的面派，恒有值：控件缺省即 outline，两者的标签必须一样；
  // 画布面（outline / ghost / 缺省）摆淡底标签，淡底面（subtle）摆描边标签
  it.each<[string | undefined, string]>([
    [undefined, 'subtle'],
    ['outline', 'subtle'],
    ['ghost', 'subtle'],
    ['subtle', 'outline'],
  ])('select variant=%s：每枚标签与 +N 的 data-variant 是 %s', async (variant, expected) => {
    const m = mountSelect({ defaultValue: ['a', 'b', 'c', 'd'], variant })
    await tick()
    for (const tag of [...triggerTags(m.host), overflowEl(m.host)])
      expect(tag.getAttribute('data-variant')).toBe(expected)
  })

  it('只有文字的标签替它包一层 tag 的 label；作者自己写了节点就原样放行', async () => {
    const m = mountSelect({ defaultValue: ['a'] })
    await tick()
    const [plain] = triggerTags(m.host)
    expect(plain!.children).toHaveLength(1)
    expect(plain!.firstElementChild!.getAttribute('data-scope')).toBe('tag')
    expect(plain!.firstElementChild!.getAttribute('data-part')).toBe('label')
    expect(plain!.firstElementChild!.textContent).toBe('甲')
    // 触发器外那枚里夹着删除钮：文字直接落在 root 上，不补 label
    const mixed = tagEl(m.host, 'a')
    expect(mixed.querySelector('[data-part="label"]')).toBeNull()
    expect(mixed.firstChild?.nodeType).toBe(Node.TEXT_NODE)
  })

  it('tags 与 value 同序取 collection 文本；maxTagCount 截断、余数进 overflowCount', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b', 'c'], maxTagCount: 2 })
    await tick()
    expect(m.bag().tags).toEqual([{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }])
    expect(m.bag().overflowCount).toBe(1)
  })

  it('删除钮就是 tag 的 close-trigger：本组件不再有自己的删除钮部件；可及名走 deleteItem，点按摘掉那个值', async () => {
    const m = mountSelect({ defaultValue: ['a', 'b'], translations: { deleteItem: (label: string) => `移除${label}` } })
    await tick()
    const remove = deleteTriggerEl(m.host, 'a')
    expect(remove.tagName).toBe('BUTTON')
    expect(remove.getAttribute('type')).toBe('button')
    expect(remove.getAttribute('aria-label')).toBe('移除甲')
    // 可摘：留在原地、可按
    expect([remove.hidden, remove.disabled, remove.hasAttribute('data-disabled')]).toEqual([false, false, false])
    expect(m.host.querySelector('[data-scope="select"][data-part="item-delete-trigger"]')).toBeNull()
    remove.click()
    await tick()
    expect(m.change).toHaveBeenCalledWith({ value: ['b'] })
  })

  it('缺省可及名是 Delete + 标签文字', async () => {
    const m = mountSelect({ defaultValue: ['a'] })
    await tick()
    expect(deleteTriggerEl(m.host, 'a').getAttribute('aria-label')).toBe('Delete 甲')
  })

  it('禁用时删除钮留位、原生 disabled 且标 data-disabled，点了不动', async () => {
    const m = mountSelect({ defaultValue: ['a'], disabled: true })
    await tick()
    const remove = deleteTriggerEl(m.host, 'a')
    expect([remove.hidden, remove.disabled, remove.hasAttribute('data-disabled')]).toEqual([false, true, true])
    remove.click()
    await tick()
    expect(m.change).not.toHaveBeenCalled()
  })

  it('只读时标签不置灰，点删除钮不动', async () => {
    const m = mountSelect({ defaultValue: ['a'], readOnly: true })
    await tick()
    expect(tagEl(m.host, 'a').hasAttribute('data-disabled')).toBe(false)
    deleteTriggerEl(m.host, 'a').click()
    await tick()
    expect(m.change).not.toHaveBeenCalled()
  })
})
