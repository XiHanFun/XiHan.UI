// @vitest-environment jsdom
import type { TagGroupApi, TagGroupItemDeleteDetails, TagGroupSchema, TagGroupValueChangeDetails } from '../src/tag-group'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectTagGroup, tagGroupItems, tagGroupItemText, tagGroupMachine } from '../src/tag-group'

type Props = TagGroupSchema['props']

const VALUES = ['vue', 'react', 'svelte', 'angular'] as const

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()
const BOOLEAN_ATTRS = new Set(['disabled', 'hidden'])

/** 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，布尔属性 toggle）。 */
function spread(el: HTMLElement, props: Record<string, unknown>): void {
  for (const [key, raw] of Object.entries(props)) {
    if (key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z') {
      const type = key.slice(2).toLowerCase()
      const map = listeners.get(el) ?? new Map<string, EventListener>()
      listeners.set(el, map)
      const prev = map.get(type)
      if (prev)
        el.removeEventListener(type, prev)
      if (typeof raw === 'function') {
        el.addEventListener(type, raw as EventListener)
        map.set(type, raw as EventListener)
      }
      continue
    }
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    if (BOOLEAN_ATTRS.has(key)) {
      el.toggleAttribute(key, Boolean(raw))
      continue
    }
    el.setAttribute(key, String(raw))
  }
}

/** 一枚标签的节点：item 是 tag 的 root，text 是 tag 的 label，del 是 tag 的 close-trigger。 */
interface ItemNodes {
  item: HTMLElement
  cell: HTMLElement
  text: HTMLElement
  del: HTMLButtonElement
}

interface Harness {
  api: () => TagGroupApi
  root: HTMLElement
  list: HTMLElement
  nodes: (value: string) => ItemNodes
  items: () => HTMLElement[]
  setProps: (next: Partial<Props>) => void
  render: () => void
  values: readonly TagGroupValueChangeDetails[]
  deletes: readonly TagGroupItemDeleteDetails[]
}

interface MountOptions {
  /** 这些条目每帧自报禁用，等价于作者写在条目部件上的 disabled 声明。 */
  disabledItems?: readonly string[]
}

const mounted: HTMLElement[] = []

function mount(initial: Partial<Props> = {}, options: MountOptions = {}): Harness {
  const values: TagGroupValueChangeDetails[] = []
  const deletes: TagGroupItemDeleteDetails[] = []
  const props: Partial<Props> = {
    ...initial,
    onValueChange: d => values.push(d),
    onItemDelete: d => deletes.push(d),
  }
  const disabledItems = new Set(options.disabledItems ?? [])
  const runtime = createVanillaRuntime()
  const service = createService(tagGroupMachine, { props: () => props, runtime })
  runtime.start()

  const doc = document
  const root = doc.createElement('div')
  const label = doc.createElement('span')
  const list = doc.createElement('div')
  root.append(label, list)
  doc.body.appendChild(root)
  mounted.push(root)

  const nodes = new Map<string, ItemNodes>()
  for (const v of VALUES) {
    const item = doc.createElement('span')
    const cell = doc.createElement('span')
    const text = doc.createElement('span')
    const del = doc.createElement('button')
    text.textContent = v[0]!.toUpperCase() + v.slice(1)
    cell.append(text, del)
    item.append(cell)
    list.appendChild(item)
    nodes.set(v, { item, cell, text, del })
  }

  const render = (): void => {
    const api = connectTagGroup(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(label, api.getLabelProps() as Record<string, unknown>)
    spread(list, api.getListProps() as Record<string, unknown>)
    for (const [v, n] of nodes) {
      const decl = { value: v, disabled: disabledItems.has(v) || undefined }
      spread(n.item, api.getItemProps(decl) as Record<string, unknown>)
      spread(n.cell, api.getCellProps(decl) as Record<string, unknown>)
      spread(n.text, api.getItemTextProps(decl) as Record<string, unknown>)
      spread(n.del, api.getItemDeleteTriggerProps(decl) as Record<string, unknown>)
    }
  }

  runtime.subscribe(render)
  render()

  return {
    api: () => connectTagGroup(service, normalizeProps),
    root,
    list,
    nodes: v => nodes.get(v)!,
    items: () => tagGroupItems(list),
    setProps: (next) => {
      Object.assign(props, next)
      render()
    },
    render,
    values,
    deletes,
  }
}

afterEach(() => {
  for (const el of mounted) el.remove()
  mounted.length = 0
})

function keydown(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}

describe('条目是 tag 的 root', () => {
  it('getItemProps 产出 tag 的 root，叠上 row 角色、身份、roving tabindex；三轴逐枚透传，没写的轴不出', () => {
    const h = mount({ variant: 'solid', tone: 'success', size: 'lg' })
    const item = h.nodes('vue').item
    expect(item.getAttribute('data-scope')).toBe('tag')
    expect(item.getAttribute('data-part')).toBe('root')
    // 宿主受控 open=true：恒为展示态
    expect(item.getAttribute('data-state')).toBe('open')
    expect(item.hasAttribute('hidden')).toBe(false)
    expect(item.getAttribute('role')).toBe('row')
    expect(item.getAttribute('data-value')).toBe('vue')
    expect(item.getAttribute('tabindex')).toBe('-1')
    expect(item.getAttribute('data-variant')).toBe('solid')
    expect(item.getAttribute('data-tone')).toBe('success')
    expect(item.getAttribute('data-size')).toBe('lg')

    const bare = mount().nodes('vue').item
    expect(bare.hasAttribute('data-variant')).toBe(false)
    expect(bare.hasAttribute('data-tone')).toBe(false)
    expect(bare.hasAttribute('data-size')).toBe(false)
    // 本组件的解剖里不再有 item / item-text / item-delete-trigger
    expect(document.querySelector('[data-scope="tag-group"][data-part="item"]')).toBeNull()
  })

  it('标签文字是 tag 的 label，摘除钮是 tag 的 close-trigger；格子仍是本组件的 gridcell', () => {
    const h = mount()
    const { cell, text, del } = h.nodes('vue')
    expect(cell.getAttribute('data-scope')).toBe('tag-group')
    expect(cell.getAttribute('data-part')).toBe('cell')
    expect(cell.getAttribute('role')).toBe('gridcell')
    expect(text.getAttribute('data-scope')).toBe('tag')
    expect(text.getAttribute('data-part')).toBe('label')
    expect(del.getAttribute('data-scope')).toBe('tag')
    expect(del.getAttribute('data-part')).toBe('close-trigger')
    expect(del.getAttribute('type')).toBe('button')
    expect(del.getAttribute('tabindex')).toBe('-1')
    expect(tagGroupItemText(h.nodes('vue').item)).toBe('Vue')
  })

  it('tagGroupItems 只认 list 直下担 row 的 tag 根：格子里作者塞的独立标签不算，嵌套的标签组互不吞并', () => {
    const h = mount()
    expect(h.items().map(el => el.getAttribute('data-value'))).toEqual([...VALUES])

    // 作者往格子里塞一枚独立的 tag：它没有 row 角色
    const stray = document.createElement('span')
    stray.setAttribute('data-scope', 'tag')
    stray.setAttribute('data-part', 'root')
    h.nodes('vue').cell.appendChild(stray)
    expect(h.items()).toHaveLength(VALUES.length)

    // 嵌套一个标签组：里面的条目归它自己的 list
    const inner = mount()
    h.nodes('react').cell.appendChild(inner.root)
    expect(h.items()).toHaveLength(VALUES.length)
    expect(inner.items()).toHaveLength(VALUES.length)
  })
})

describe('选中与高亮落在 tag 的 root 上', () => {
  it('选中是布尔 data-selected，不再借 data-state；格子同步', () => {
    const h = mount({ selectionMode: 'multiple', defaultValue: ['react'] })
    const vue = h.nodes('vue')
    const react = h.nodes('react')
    expect(react.item.hasAttribute('data-selected')).toBe(true)
    expect(react.cell.hasAttribute('data-selected')).toBe(true)
    expect(react.item.getAttribute('aria-selected')).toBe('true')
    expect(vue.item.hasAttribute('data-selected')).toBe(false)
    expect(vue.item.getAttribute('aria-selected')).toBe('false')
    // data-state 只剩 tag 的 open 族
    expect(react.item.getAttribute('data-state')).toBe('open')
    expect(react.cell.hasAttribute('data-state')).toBe(false)

    vue.item.click()
    expect(h.values.at(-1)).toEqual({ value: ['react', 'vue'] })
    expect(vue.item.hasAttribute('data-selected')).toBe(true)
  })

  it('聚焦一枚即为锚点：data-highlighted 与 tabindex=0 都落在 tag 的 root 上', () => {
    const h = mount()
    const svelte = h.nodes('svelte')
    svelte.item.focus()
    expect(svelte.item.hasAttribute('data-highlighted')).toBe(true)
    expect(svelte.item.getAttribute('tabindex')).toBe('0')
    expect(h.nodes('vue').item.getAttribute('tabindex')).toBe('-1')
    expect(h.list.getAttribute('tabindex')).toBe('-1')
  })
})

describe('摘除钮是 tag 的 close-trigger', () => {
  it('可及名走 translations.deleteItem（缺省 Delete + 标签文字）；整组没开放摘除时收起且禁用', () => {
    const h = mount({ collection: [{ value: 'vue', label: 'Vue.js' }] })
    const del = h.nodes('vue').del
    expect(del.getAttribute('aria-label')).toBe('Delete Vue.js')
    expect(del.hasAttribute('hidden')).toBe(true)
    expect(del.disabled).toBe(true)
    expect(del.hasAttribute('data-disabled')).toBe(true)

    const custom = mount({ deletable: true, translations: { deleteItem: text => `移除${text}` } })
    expect(custom.nodes('react').del.getAttribute('aria-label')).toBe('移除react')
    expect(custom.nodes('react').del.hasAttribute('hidden')).toBe(false)
  })

  it('禁用与只读矩阵由 tag 给：禁用置灰标签并锁钮，只读只锁钮、标签不置灰', () => {
    const disabled = mount({ deletable: true }, { disabledItems: ['react'] })
    expect(disabled.nodes('react').item.hasAttribute('data-disabled')).toBe(true)
    expect(disabled.nodes('react').del.disabled).toBe(true)
    expect(disabled.nodes('react').del.hasAttribute('hidden')).toBe(false)
    expect(disabled.nodes('vue').del.disabled).toBe(false)

    const readOnly = mount({ deletable: true, readOnly: true })
    expect(readOnly.nodes('vue').item.hasAttribute('data-disabled')).toBe(false)
    expect(readOnly.nodes('vue').del.disabled).toBe(true)
    expect(readOnly.nodes('vue').del.hasAttribute('hidden')).toBe(false)
    readOnly.nodes('vue').del.click()
    expect(readOnly.deletes).toEqual([])
  })

  it('点按：报摘除意图；焦点在这一枚里才搬，交给前一枚，前面没有就交给后一枚', () => {
    const h = mount({ deletable: true })
    // 焦点在组外：点叉不把焦点拽进来
    h.nodes('angular').del.click()
    expect(h.deletes).toEqual([{ value: 'angular' }])
    expect(document.activeElement).toBe(document.body)

    // 焦点在这一枚里（叉自己拿着焦点）：搬到前一枚
    h.nodes('svelte').del.focus()
    h.nodes('svelte').del.click()
    expect(h.deletes.at(-1)).toEqual({ value: 'svelte' })
    expect(document.activeElement).toBe(h.nodes('react').item)

    // 首枚前面没有标签：交给后一枚
    h.nodes('vue').item.focus()
    h.nodes('vue').del.click()
    expect(h.deletes.at(-1)).toEqual({ value: 'vue' })
    expect(document.activeElement).toBe(h.nodes('react').item)
  })

  it('主键按下被拦下（不夺焦），右键按下不拦', () => {
    const h = mount({ deletable: true })
    const del = h.nodes('vue').del
    const primary = new PointerEvent('pointerdown', { cancelable: true, button: 0 })
    del.dispatchEvent(primary)
    expect(primary.defaultPrevented).toBe(true)
    const secondary = new PointerEvent('pointerdown', { cancelable: true, button: 2 })
    del.dispatchEvent(secondary)
    expect(secondary.defaultPrevented).toBe(false)
  })

  it('delete 键走同一条摘除路：焦点在末枚时交给前一枚，锚点跟着换', () => {
    const h = mount({ deletable: true })
    h.nodes('angular').item.focus()
    keydown(h.nodes('angular').item, 'Delete')
    expect(h.deletes).toEqual([{ value: 'angular' }])
    expect(document.activeElement).toBe(h.nodes('svelte').item)
    expect(h.api().focusedValue).toBe('svelte')
  })
})
