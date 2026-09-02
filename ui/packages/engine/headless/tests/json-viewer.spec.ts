/**
 * 行是按数据摊出来的，键盘导航又要在事件那一刻现查活 DOM，纯逻辑环境里演不出来。
 *
 * @vitest-environment jsdom
 */

import type { JsonViewerApi, JsonViewerNode, JsonViewerSchema } from '../src/json-viewer'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  connectJsonViewer,
  flattenJson,
  jsonChildPath,
  jsonExpandedPathsToDepth,
  jsonValueText,
  jsonValueType,
  jsonViewerMachine,
  JSON_VIEWER_ROOT_PATH as ROOT,
} from '../src/json-viewer'

type Props = JsonViewerSchema['props']

/** 演示数据：六种类型齐全，另有一层嵌套、一个空对象与一个数组。 */
const VALUE = {
  name: 'xihan',
  count: 3,
  ok: true,
  nothing: null,
  tags: ['a', 'b'],
  nested: { deep: { leaf: 1 } },
  empty: {},
}

/** 路径拼接，用例里按键名找行。 */
function path(...keys: readonly string[]): string {
  return keys.reduce<string>((acc, key) => jsonChildPath(acc, key), ROOT)
}

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与两个适配器同一套翻译规则（on 之后全小写做事件名，其余落属性）。
 * 有它才跑得到真实事件流——只比对 connect 的返回值验不出「按键落到哪一行上」。
 */
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
    el.setAttribute(key, String(raw))
  }
}

interface RowEls {
  /** 行的根节点：分支是 branch，叶子是 item。 */
  host: HTMLElement
  itemKey?: HTMLElement
  itemValue?: HTMLElement
  control?: HTMLElement
  trigger?: HTMLElement
  indicator?: HTMLElement
  text?: HTMLElement
  preview?: HTMLElement
  content?: HTMLElement
}

interface Harness {
  api: () => JsonViewerApi
  root: HTMLElement
  treeEl: HTMLElement
  row: (value: string) => RowEls
  has: (value: string) => boolean
  setProps: (next: Partial<Props>) => void
  expanded: () => string[]
}

function makeRow(doc: Document, node: JsonViewerNode): RowEls {
  if (node.branch) {
    const host = doc.createElement('div')
    const control = doc.createElement('div')
    const trigger = doc.createElement('span')
    const indicator = doc.createElement('span')
    trigger.appendChild(indicator)
    const preview = doc.createElement('span')
    control.appendChild(trigger)
    let text: HTMLElement | undefined
    if (node.key != null) {
      text = doc.createElement('span')
      control.appendChild(text)
    }
    control.appendChild(preview)
    host.appendChild(control)
    const content = doc.createElement('div')
    return { host, control, trigger, indicator, text, preview, content }
  }
  const host = doc.createElement('div')
  let itemKey: HTMLElement | undefined
  if (node.key != null) {
    itemKey = doc.createElement('span')
    host.appendChild(itemKey)
  }
  const itemValue = doc.createElement('span')
  host.appendChild(itemValue)
  return { host, itemKey, itemValue }
}

/** 只在顺序不对时才动 DOM：把持有焦点的那个节点原地留住。 */
function reconcile(container: HTMLElement, wanted: readonly HTMLElement[]): void {
  let cursor = container.firstChild
  for (const el of wanted) {
    if (cursor === el) {
      cursor = el.nextSibling
      continue
    }
    container.insertBefore(el, cursor)
  }
  while (cursor) {
    const next = cursor.nextSibling
    container.removeChild(cursor)
    cursor = next
  }
}

function mount(initial: Partial<Props> = {}): Harness {
  const props: Partial<Props> = { value: VALUE, ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(jsonViewerMachine, { props: () => props, runtime })
  runtime.start()

  const doc = document
  const root = doc.createElement('div')
  const treeEl = doc.createElement('div')
  root.appendChild(treeEl)
  doc.body.appendChild(root)

  // 行元素按路径缓存：形状没变就复用，展开一层不会把已有的行重建一遍
  const cache = new Map<string, { shape: string, els: RowEls }>()

  const render = (): void => {
    const api = connectJsonViewer(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(treeEl, api.getTreeProps() as Record<string, unknown>)

    const children = new Map<string | null, JsonViewerNode[]>()
    for (const node of api.visibleNodes) {
      const list = children.get(node.parent)
      if (list)
        list.push(node)
      else
        children.set(node.parent, [node])
    }

    const paint = (container: HTMLElement, nodes: readonly JsonViewerNode[]): void => {
      const wanted: HTMLElement[] = []
      for (const node of nodes) {
        const shape = `${node.branch}|${node.key != null}`
        let entry = cache.get(node.value)
        if (!entry || entry.shape !== shape) {
          entry = { shape, els: makeRow(doc, node) }
          cache.set(node.value, entry)
        }
        const els = entry.els
        const ref = { value: node.value }
        if (node.branch) {
          spread(els.host, api.getBranchProps(ref) as Record<string, unknown>)
          spread(els.control!, api.getBranchControlProps(ref) as Record<string, unknown>)
          spread(els.trigger!, api.getBranchTriggerProps(ref) as Record<string, unknown>)
          spread(els.indicator!, api.getBranchIndicatorProps(ref) as Record<string, unknown>)
          if (els.text)
            spread(els.text, api.getBranchTextProps(ref) as Record<string, unknown>)
          spread(els.preview!, api.getPreviewProps(ref) as Record<string, unknown>)
          els.preview!.textContent = api.previewText(node)
          if (api.isExpanded(node.value)) {
            spread(els.content!, api.getBranchContentProps(ref) as Record<string, unknown>)
            // 已经挂着就别再 appendChild：那是一次真的移除再插入，焦点若在子层里会掉回 body
            if (els.content!.parentNode !== els.host)
              els.host.appendChild(els.content!)
            paint(els.content!, children.get(node.value) ?? [])
          }
          else {
            els.content!.remove()
          }
        }
        else {
          spread(els.host, api.getItemProps(ref) as Record<string, unknown>)
          if (els.itemKey) {
            spread(els.itemKey, api.getItemKeyProps(ref) as Record<string, unknown>)
            els.itemKey.textContent = node.key ?? ''
          }
          spread(els.itemValue!, api.getItemValueProps(ref) as Record<string, unknown>)
          els.itemValue!.textContent = api.valueText(node)
        }
        wanted.push(els.host)
      }
      reconcile(container, wanted)
    }

    paint(treeEl, children.get(null) ?? [])
  }

  runtime.subscribe(render)
  render()

  return {
    api: () => connectJsonViewer(service, normalizeProps),
    root,
    treeEl,
    row: value => cache.get(value)!.els,
    has: value => [...treeEl.querySelectorAll('[data-value]')].some(el => el.getAttribute('data-value') === value),
    setProps: (next) => {
      Object.assign(props, next)
      render()
    },
    // 读解析后的那一份：context 里 null 表示「还没人碰过，按当下的数据现算」
    expanded: () => connectJsonViewer(service, normalizeProps).expandedValue,
  }
}

/** 合成事件默认 cancelable=false，那样 preventDefault 是空操作、defaultPrevented 永远为假。 */
function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

function focusedPath(): string | null {
  return document.activeElement?.getAttribute('data-value') ?? null
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('json 摊平', () => {
  it('六种类型各自成标签，JSON 之外的值归到最接近的那一档', () => {
    expect(jsonValueType('a')).toBe('string')
    expect(jsonValueType(1)).toBe('number')
    expect(jsonValueType(10n)).toBe('number')
    expect(jsonValueType(true)).toBe('boolean')
    expect(jsonValueType(null)).toBe('null')
    expect(jsonValueType(undefined)).toBe('null')
    expect(jsonValueType([])).toBe('array')
    expect(jsonValueType({})).toBe('object')
  })

  it('字符串带引号，好让 "12" 与 12 在没有颜色时也分得开', () => {
    expect(jsonValueText('12')).toBe('"12"')
    expect(jsonValueText(12)).toBe('12')
    expect(jsonValueText(null)).toBe('null')
    expect(jsonValueText(undefined)).toBe('undefined')
  })

  it('maxStringLength 只截字符串，引号留在外面', () => {
    expect(jsonValueText('abcdef', 3)).toBe('"abc…"')
    expect(jsonValueText('abc', 3)).toBe('"abc"')
  })

  it('顶层没给值就是空视图，一行也不摊', () => {
    expect(flattenJson(undefined)).toEqual([])
    expect(flattenJson(undefined, { expanded: [ROOT] })).toEqual([])
    // 只有顶层缺席才算空视图：成员位置上的 undefined 是一个真实的值，照常摊成一行
    const rows = flattenJson({ a: undefined }, { expanded: [ROOT] })
    expect(rows.map(r => [r.key, r.text])).toEqual([[null, ''], ['a', 'undefined']])
    // 顶层 null 是一个值，不是缺席
    expect(flattenJson(null).map(r => r.text)).toEqual(['null'])
  })

  it('根行恒在，收起时只有它一行', () => {
    const rows = flattenJson(VALUE)
    expect(rows.map(r => r.value)).toEqual([ROOT])
    expect(rows[0]).toMatchObject({ key: null, type: 'object', branch: true, count: 7, level: 1, parent: null })
  })

  it('展开的分支才摊出子行，路径逐层拼出来', () => {
    const rows = flattenJson(VALUE, { expanded: [ROOT] })
    expect(rows.map(r => r.value)).toEqual([
      ROOT,
      path('name'),
      path('count'),
      path('ok'),
      path('nothing'),
      path('tags'),
      path('nested'),
      path('empty'),
    ])
    // 同层三件套逐层重算
    expect(rows[1]).toMatchObject({ key: 'name', level: 2, posInSet: 1, setSize: 7, parent: ROOT, text: '"xihan"' })
  })

  it('空对象不当分支：展开它一行也看不到，箭头是白给的', () => {
    const rows = flattenJson(VALUE, { expanded: [ROOT] })
    const empty = rows.find(r => r.key === 'empty')!
    expect(empty).toMatchObject({ branch: false, type: 'object', text: '{}', count: 0 })
  })

  it('数组下标当键名，逐项摊开', () => {
    const rows = flattenJson(VALUE, { expanded: [ROOT, path('tags')] })
    const tags = rows.filter(r => r.parent === path('tags'))
    expect(tags.map(r => [r.key, r.text])).toEqual([['0', '"a"'], ['1', '"b"']])
  })

  it('循环引用摊到就停，标成 [Circular] 而不是无限递归', () => {
    const cyclic: Record<string, unknown> = { name: 'a' }
    cyclic.self = cyclic
    const rows = flattenJson(cyclic, { expanded: [ROOT, path('self')] })
    const self = rows.find(r => r.key === 'self')!
    expect(self).toMatchObject({ circular: true, branch: false, text: '[Circular]' })
    expect(rows).toHaveLength(3)
  })

  it('同一个对象出现在两条不相干的分支里不算环，照样摊开', () => {
    const shared = { leaf: 1 }
    const rows = flattenJson({ a: shared, b: shared }, { expanded: [ROOT, path('a'), path('b')] })
    expect(rows.filter(r => r.key === 'leaf')).toHaveLength(2)
    expect(rows.every(r => !r.circular)).toBe(true)
  })

  it('maxItems 折掉多余成员并补一行占位，占位算进同层总数', () => {
    const rows = flattenJson({ list: [1, 2, 3, 4, 5] }, { expanded: [ROOT, path('list')], maxItems: 2 })
    const kids = rows.filter(r => r.parent === path('list'))
    expect(kids.map(r => r.key)).toEqual(['0', '1', null])
    expect(kids.at(-1)).toMatchObject({ truncated: true, count: 3, posInSet: 3, setSize: 3, type: 'array' })
    expect(kids[0]!.setSize).toBe(3)
  })

  it('sortKeys 只排对象键，数组顺序不动', () => {
    const rows = flattenJson({ b: 1, a: 2, list: ['y', 'x'] }, {
      expanded: [ROOT, path('list')],
      sortKeys: true,
    })
    expect(rows.filter(r => r.parent === ROOT).map(r => r.key)).toEqual(['a', 'b', 'list'])
    expect(rows.filter(r => r.parent === path('list')).map(r => r.text)).toEqual(['"y"', '"x"'])
  })

  it('键里的点号不会把两条路径拼成同一个串', () => {
    const rows = flattenJson({ 'a': { b: 1 }, 'a.b': 2 }, { expanded: [ROOT, path('a')] })
    const paths = rows.map(r => r.value)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('按层数算初始展开集合：depth 只展开层级号不超过它的分支', () => {
    expect(jsonExpandedPathsToDepth(VALUE, 1)).toEqual([ROOT])
    expect(jsonExpandedPathsToDepth(VALUE, 2)).toEqual([ROOT, path('tags'), path('nested')])
    expect(jsonExpandedPathsToDepth(VALUE, 0)).toEqual([])
  })
})

describe('jsonViewerMachine 展开集合', () => {
  it('不给 defaultExpandedValue 时按 defaultExpandedDepth 现算', () => {
    expect(mount().expanded()).toEqual([ROOT])
    expect(mount({ defaultExpandedDepth: 2 }).expanded()).toEqual([ROOT, path('tags'), path('nested')])
    expect(mount({ defaultExpandedDepth: 0 }).expanded()).toEqual([])
  })

  it('value 晚于挂载才到，初始展开集合按到手的数据现算', () => {
    // 自定义元素常是先升级、再由脚本写 .value：挂载那一刻冻结下来的一份是空的
    const h = mount({ value: undefined })
    expect(h.api().visibleNodes).toEqual([])
    expect(h.expanded()).toEqual([])
    h.setProps({ value: VALUE })
    expect(h.expanded()).toEqual([ROOT])
    expect(h.has(path('name'))).toBe(true)
  })

  it('碰过一次展开集合之后就不再跟着数据走', () => {
    const h = mount()
    h.api().collapse(ROOT)
    h.setProps({ value: { other: { deep: 1 } } })
    expect(h.expanded()).toEqual([])
  })

  it('给了 defaultExpandedValue 就以它为准，层数不再参与', () => {
    expect(mount({ defaultExpandedValue: [path('tags')], defaultExpandedDepth: 3 }).expanded())
      .toEqual([path('tags')])
  })

  it('切换、展开、收起与整体改写各走各的事件', () => {
    const h = mount({ defaultExpandedValue: [] })
    h.api().expand(ROOT)
    expect(h.expanded()).toEqual([ROOT])
    // 已经展开的再展一次不重复入集
    h.api().expand(ROOT)
    expect(h.expanded()).toEqual([ROOT])
    h.api().toggle(ROOT)
    expect(h.expanded()).toEqual([])
    h.api().setExpandedValue([ROOT, ROOT, path('tags')])
    expect(h.expanded()).toEqual([ROOT, path('tags')])
    h.api().collapse(ROOT)
    expect(h.expanded()).toEqual([path('tags')])
  })

  it('受控 expandedValue：点击只发意图，宿主不写回就纹丝不动', () => {
    const changes: string[][] = []
    const h = mount({ expandedValue: [], onExpandedChange: d => changes.push(d.value) })
    click(h.row(ROOT).control!)
    expect(h.expanded()).toEqual([])
    expect(changes).toEqual([[ROOT]])
    h.setProps({ expandedValue: [ROOT] })
    expect(h.row(ROOT).host.getAttribute('aria-expanded')).toBe('true')
    expect(h.has(path('name'))).toBe(true)
  })
})

describe('connectJsonViewer ARIA 与层级', () => {
  it('树是 role=tree 且自带名字，行是 treeitem，层级三件套取自摊平结果', () => {
    const h = mount()
    expect(h.treeEl.getAttribute('role')).toBe('tree')
    expect(h.treeEl.getAttribute('aria-label')).toBe('JSON')
    const rootRow = h.row(ROOT).host
    expect(rootRow.getAttribute('role')).toBe('treeitem')
    expect(rootRow.getAttribute('aria-level')).toBe('1')
    expect(rootRow.getAttribute('aria-expanded')).toBe('true')
    // 分支裹着整棵子层，名字必须显式给，否则读屏会把所有子孙的文字念一遍
    expect(rootRow.getAttribute('aria-label')).toBe('root')

    const name = h.row(path('name')).host
    expect(name.getAttribute('aria-level')).toBe('2')
    expect(name.getAttribute('aria-posinset')).toBe('1')
    expect(name.getAttribute('aria-setsize')).toBe('7')
    // 叶子不报 aria-expanded：那是「能展开却没展开」的意思
    expect(name.getAttribute('aria-expanded')).toBeNull()
    // 也不另给 aria-label：那会盖掉值本身，只剩键名念得出来
    expect(name.getAttribute('aria-label')).toBeNull()
    expect(name.textContent).toBe('name"xihan"')
  })

  it('每一行带 data-value-type，六种值形态各自可上色', () => {
    const h = mount()
    const typeOf = (p: string): string | null => h.row(p).host.getAttribute('data-value-type')
    expect(typeOf(path('name'))).toBe('string')
    expect(typeOf(path('count'))).toBe('number')
    expect(typeOf(path('ok'))).toBe('boolean')
    expect(typeOf(path('nothing'))).toBe('null')
    expect(typeOf(path('tags'))).toBe('array')
    expect(typeOf(path('nested'))).toBe('object')
  })

  it('收起摘要按容器类型分两句，成员数写在里面；它只给眼睛看', () => {
    const h = mount()
    expect(h.row(path('tags')).preview!.textContent).toBe('[…] 2')
    expect(h.row(path('nested')).preview!.textContent).toBe('{…} 1')
    // 括号加省略号念出来只有噪音，这个部件对读屏隐藏
    expect(h.row(path('tags')).preview!.getAttribute('aria-hidden')).toBe('true')
  })

  it('收起的分支把成员数折进可及名字，展开之后交还给子行的 aria-setsize', () => {
    const h = mount()
    const tags = h.row(path('tags')).host
    expect(tags.getAttribute('aria-label')).toBe('tags, 2 items')
    // 单数不写成 1 items
    expect(h.row(path('nested')).host.getAttribute('aria-label')).toBe('nested, 1 item')
    h.api().expand(path('tags'))
    expect(h.row(path('tags')).host.getAttribute('aria-label')).toBe('tags')
  })

  it('展开箭头不进 Tab 序列也不接可编程焦点：它是 aria-hidden 的', () => {
    const h = mount()
    const trigger = h.row(path('tags')).trigger!
    expect(trigger.getAttribute('aria-hidden')).toBe('true')
    expect(trigger.getAttribute('tabindex')).toBeNull()
  })

  it('文案逐句可换：树名、根名、看得见的摘要与读屏用的那一句各走各的', () => {
    const h = mount({
      translations: {
        tree: '数据',
        root: '根',
        arrayPreview: count => `数组 ${count} 项`,
        collapsedBranchLabel: (name, count) => `${name}，共 ${count} 项`,
      },
    })
    expect(h.treeEl.getAttribute('aria-label')).toBe('数据')
    // 根行展开着，名字里不带成员数
    expect(h.row(ROOT).host.getAttribute('aria-label')).toBe('根')
    expect(h.row(path('tags')).preview!.textContent).toBe('数组 2 项')
    expect(h.row(path('tags')).host.getAttribute('aria-label')).toBe('tags，共 2 项')
    // 没覆盖的那句仍走内建英文
    expect(h.row(path('nested')).preview!.textContent).toBe('{…} 1')
  })

  it('截断占位行念得出还剩多少项', () => {
    const h = mount({ value: { list: [1, 2, 3, 4, 5] }, maxItems: 2, defaultExpandedDepth: 2 })
    const rest = h.row(`${path('list')}[…]`)
    expect(rest.itemValue!.textContent).toBe('… 3 more')
    expect(rest.host.getAttribute('data-truncated')).toBe('')
  })

  it('三轴只落在 root 上，子部件不重复标注', () => {
    const h = mount({ size: 'sm' })
    expect(h.root.getAttribute('data-size')).toBe('sm')
    expect(h.treeEl.getAttribute('data-size')).toBeNull()
  })
})

describe('connectJsonViewer roving tabindex', () => {
  it('焦点在树外时整棵树只有容器一个 Tab 停靠点', () => {
    const h = mount()
    expect(h.treeEl.getAttribute('tabindex')).toBe('0')
    const stops = [...h.treeEl.querySelectorAll('[tabindex="0"]')]
    expect(stops).toHaveLength(0)
  })

  it('焦点进容器即转投给首行，此后容器让位', () => {
    const h = mount()
    h.treeEl.focus()
    h.treeEl.dispatchEvent(new FocusEvent('focus', { bubbles: false }))
    expect(focusedPath()).toBe(ROOT)
    expect(h.treeEl.getAttribute('tabindex')).toBe('-1')
    expect(h.row(ROOT).host.getAttribute('tabindex')).toBe('0')
  })

  it('焦点行随分支收起而消失时锚点投影成空，容器重新兜底', () => {
    const h = mount()
    h.row(path('name')).host.focus()
    expect(h.api().focusedValue).toBe(path('name'))
    h.api().collapse(ROOT)
    expect(h.api().focusedValue).toBeNull()
    expect(h.treeEl.getAttribute('tabindex')).toBe('0')
  })

  it('焦点离开树后锚点留着，Tab 回来落回上次那一行，高亮跟着焦点走', () => {
    const h = mount()
    const name = h.row(path('name')).host
    name.focus()
    expect(name.getAttribute('data-highlighted')).toBe('')
    h.treeEl.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }))
    expect(h.api().focusedValue).toBe(path('name'))
    expect(h.api().isFocusWithin).toBe(false)
    // Tab 位留在原地，容器不再兜底
    expect(name.getAttribute('tabindex')).toBe('0')
    expect(h.treeEl.getAttribute('tabindex')).toBe('-1')
    expect(name.getAttribute('data-highlighted')).toBeNull()
  })

  it('焦点从树外再进来时落回锚点，而不是回到首行', () => {
    const h = mount()
    h.row(path('nothing')).host.focus()
    h.treeEl.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }))
    document.body.focus()
    h.treeEl.dispatchEvent(new FocusEvent('focus', { bubbles: false }))
    expect(focusedPath()).toBe(path('nothing'))
  })
})

describe('connectJsonViewer 方向键导航', () => {
  it('上下键走可见行，收起的子层一行不算，默认不回绕', () => {
    const h = mount()
    h.row(ROOT).host.focus()
    press(h.row(ROOT).host, 'ArrowDown')
    expect(focusedPath()).toBe(path('name'))
    press(document.activeElement as HTMLElement, 'ArrowUp')
    expect(focusedPath()).toBe(ROOT)
    // 首行不回绕
    press(document.activeElement as HTMLElement, 'ArrowUp')
    expect(focusedPath()).toBe(ROOT)
    press(document.activeElement as HTMLElement, 'End')
    // tags 与 nested 都收着，末行是 empty
    expect(focusedPath()).toBe(path('empty'))
    press(document.activeElement as HTMLElement, 'ArrowDown')
    expect(focusedPath()).toBe(path('empty'))
    press(document.activeElement as HTMLElement, 'Home')
    expect(focusedPath()).toBe(ROOT)
  })

  it('loop 打开后首尾相接', () => {
    const h = mount({ loop: true })
    h.row(ROOT).host.focus()
    press(h.row(ROOT).host, 'ArrowUp')
    expect(focusedPath()).toBe(path('empty'))
  })

  it('展开之后子行进入序列', () => {
    const h = mount({ defaultExpandedValue: [ROOT, path('tags')] })
    h.row(path('tags')).host.focus()
    press(h.row(path('tags')).host, 'ArrowDown')
    expect(focusedPath()).toBe(path('tags', '0'))
  })

  it('带 Ctrl/Meta/Alt 的组合一概不归树管', () => {
    const h = mount()
    h.row(ROOT).host.focus()
    const event = press(h.row(ROOT).host, 'ArrowDown', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(focusedPath()).toBe(ROOT)
  })

  it('带 Shift 的方向键与确认键也不归树管，但 * 不受连坐', () => {
    const h = mount({ defaultExpandedValue: [ROOT] })
    const tags = h.row(path('tags')).host
    tags.focus()
    expect(press(tags, 'ArrowDown', { shiftKey: true }).defaultPrevented).toBe(false)
    expect(focusedPath()).toBe(path('tags'))
    expect(press(tags, 'ArrowRight', { shiftKey: true }).defaultPrevented).toBe(false)
    expect(h.expanded()).not.toContain(path('tags'))
    expect(press(tags, 'Enter', { shiftKey: true }).defaultPrevented).toBe(false)
    expect(h.expanded()).not.toContain(path('tags'))
    // '*' 在多数键盘布局上就得按住 Shift 才打得出来，守卫不能把它一起挡掉
    press(tags, '*', { shiftKey: true })
    expect(h.expanded()).toContain(path('tags'))
  })
})

describe('connectJsonViewer 层级键', () => {
  it('右键展开、再右键进子层；左键收起、再左键回父层', () => {
    const h = mount({ defaultExpandedValue: [ROOT] })
    const tags = h.row(path('tags')).host
    tags.focus()
    press(tags, 'ArrowRight')
    expect(h.expanded()).toContain(path('tags'))
    // 展开只改展开态，焦点留在分支上
    expect(focusedPath()).toBe(path('tags'))
    press(document.activeElement as HTMLElement, 'ArrowRight')
    expect(focusedPath()).toBe(path('tags', '0'))
    // 叶子上的右键什么都不做，也不吞键
    const onLeaf = press(document.activeElement as HTMLElement, 'ArrowRight')
    expect(onLeaf.defaultPrevented).toBe(false)
    // 叶子上的左键回父层
    press(document.activeElement as HTMLElement, 'ArrowLeft')
    expect(focusedPath()).toBe(path('tags'))
    press(document.activeElement as HTMLElement, 'ArrowLeft')
    expect(h.expanded()).not.toContain(path('tags'))
    expect(focusedPath()).toBe(path('tags'))
  })

  it('根行上的左键什么都不做，也不吞键', () => {
    const h = mount({ defaultExpandedValue: [] })
    h.row(ROOT).host.focus()
    const event = press(h.row(ROOT).host, 'ArrowLeft')
    expect(event.defaultPrevented).toBe(false)
  })

  it('确认键切换分支展开态；叶子上不吞键，空格还要留给页面滚动', () => {
    const h = mount()
    h.row(ROOT).host.focus()
    press(h.row(ROOT).host, 'Enter')
    expect(h.expanded()).toEqual([])
    press(h.row(ROOT).host, ' ')
    expect(h.expanded()).toEqual([ROOT])

    const leaf = h.row(path('name')).host
    leaf.focus()
    expect(press(leaf, 'Enter').defaultPrevented).toBe(false)
    expect(press(leaf, ' ').defaultPrevented).toBe(false)
  })

  it('* 展开与焦点行同一父级的全部分支，别层不动', () => {
    const h = mount()
    h.row(path('tags')).host.focus()
    press(h.row(path('tags')).host, '*')
    expect(h.expanded()).toEqual([ROOT, path('tags'), path('nested')])
    // 同级已经全展开，这个键不吞
    expect(press(document.activeElement as HTMLElement, '*').defaultPrevented).toBe(false)
  })

  it('dir=rtl 把左右键整体对调', () => {
    const h = mount({ dir: 'rtl' })
    h.row(path('tags')).host.focus()
    press(h.row(path('tags')).host, 'ArrowLeft')
    expect(h.expanded()).toContain(path('tags'))
    press(h.row(path('tags')).host, 'ArrowRight')
    expect(h.expanded()).not.toContain(path('tags'))
  })

  it('没传 dir 时从 DOM 现读：整页 rtl 也认得出来', () => {
    const h = mount()
    h.root.setAttribute('dir', 'rtl')
    // jsdom 不为 direction 做继承计算，readDirection 会退回最近一处显式声明
    h.row(path('tags')).host.focus()
    press(h.row(path('tags')).host, 'ArrowLeft')
    expect(h.expanded()).toContain(path('tags'))
  })
})

describe('connectJsonViewer 点击', () => {
  it('点分支行切展开态，焦点落到分支上', () => {
    const h = mount()
    click(h.row(path('tags')).control!)
    expect(h.expanded()).toContain(path('tags'))
    expect(focusedPath()).toBe(path('tags'))
  })

  it('点箭头只切一次：冒泡被掐断，点行那一路不会再跑一遍', () => {
    const h = mount()
    click(h.row(path('tags')).trigger!)
    expect(h.expanded()).toContain(path('tags'))
    click(h.row(path('tags')).trigger!)
    expect(h.expanded()).not.toContain(path('tags'))
  })

  it('点叶子只把焦点交给这一行，展开集合不动', () => {
    const h = mount()
    const before = h.expanded()
    click(h.row(path('name')).host)
    expect(focusedPath()).toBe(path('name'))
    expect(h.expanded()).toEqual(before)
  })
})
