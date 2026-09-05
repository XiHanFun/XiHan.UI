// @vitest-environment jsdom
import type { TreeApi, TreeNode, TreeSchema } from '../src/tree'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectTree, flattenTree, indexTree, treeMachine } from '../src/tree'

type Props = TreeSchema['props']

/**
 * 一棵有深度的树：src 下面还套着 utils，readme 禁用（导航与检索都跳过它，
 * 但它仍可聚焦、仍是导航起点），docs 的 children 是空数组——「暂时没有子项的目录」
 * 也得算分支，否则它就报不出 aria-expanded。
 * label 用拉丁字母，连打检索按首字母匹配得上。
 */
const COLLECTION: TreeNode[] = [
  {
    value: 'src',
    label: 'Source',
    children: [
      { value: 'index', label: 'Index' },
      {
        value: 'utils',
        label: 'Utils',
        children: [
          { value: 'dom', label: 'Dom' },
          { value: 'math', label: 'Math' },
        ],
      },
      { value: 'readme', label: 'Readme', disabled: true },
    ],
  },
  { value: 'docs', label: 'Docs', children: [] },
  { value: 'license', label: 'License' },
]

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，其余落属性）。
 * 有它才跑得到真实事件流——纯粹比对 connect 的返回值只能验静态属性，
 * 「按键落到哪一行上」这类事实必须有活 DOM 才立得住。
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

interface BranchEls {
  value: string
  branch: HTMLElement
  control: HTMLElement
  trigger: HTMLElement
  indicator: HTMLElement
  text: HTMLElement
  content: HTMLElement
}

interface ItemEls {
  value: string
  item: HTMLElement
  text: HTMLElement
  indicator: HTMLElement
}

interface Harness {
  api: () => TreeApi
  root: HTMLElement
  label: HTMLElement
  treeEl: HTMLElement
  branch: (value: string) => BranchEls
  item: (value: string) => ItemEls
  /** 节点元素：分支取 branch，叶子取 item。 */
  node: (value: string) => HTMLElement
  setProps: (next: Partial<Props>) => void
  render: () => void
  expanded: () => string[]
  selected: () => string[]
}

function mount(initial: Partial<Props> = {}): Harness {
  const props: Partial<Props> = { collection: COLLECTION, ...initial }
  // 作者标记镜像的是机器手上的那份 collection：两边不同源的话，
  // 摊平算出来的可见行在 DOM 里一个也找不到，用例会假绿
  const collection = props.collection!
  const runtime = createVanillaRuntime()
  const service = createService(treeMachine, { props: () => props, runtime })
  runtime.start()

  const doc = document
  const root = doc.createElement('div')
  const label = doc.createElement('span')
  label.textContent = '文件'
  const treeEl = doc.createElement('div')
  root.append(label, treeEl)

  const branches = new Map<string, BranchEls>()
  const items = new Map<string, ItemEls>()

  // 作者标记镜像 collection：分支裹着自己的 branch-content，子层长在里面。
  // 箭头与勾选标记都带字形且排在文本前面——真实皮肤就是这么长的，
  // 连打检索若去读节点 textContent 会当场被它们挡住
  const build = (nodes: readonly TreeNode[], host: HTMLElement): void => {
    for (const node of nodes) {
      const text = doc.createElement('span')
      text.textContent = node.label ?? node.value
      const indicator = doc.createElement('span')
      indicator.textContent = '✓'
      if (Array.isArray(node.children)) {
        const branch = doc.createElement('div')
        const control = doc.createElement('div')
        const trigger = doc.createElement('span')
        trigger.textContent = '▸'
        const content = doc.createElement('div')
        control.append(trigger, indicator, text)
        branch.append(control, content)
        host.appendChild(branch)
        branches.set(node.value, { value: node.value, branch, control, trigger, indicator, text, content })
        build(node.children, content)
        continue
      }
      const item = doc.createElement('div')
      item.append(indicator, text)
      host.appendChild(item)
      items.set(node.value, { value: node.value, item, text, indicator })
    }
  }
  build(collection, treeEl)
  doc.body.appendChild(root)

  const render = (): void => {
    const api = connectTree(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(label, api.getLabelProps() as Record<string, unknown>)
    spread(treeEl, api.getTreeProps() as Record<string, unknown>)
    for (const b of branches.values()) {
      const node = { value: b.value }
      spread(b.branch, api.getBranchProps(node) as Record<string, unknown>)
      spread(b.control, api.getBranchControlProps(node) as Record<string, unknown>)
      spread(b.trigger, api.getBranchTriggerProps(node) as Record<string, unknown>)
      spread(b.indicator, api.getBranchIndicatorProps(node) as Record<string, unknown>)
      spread(b.text, api.getBranchTextProps(node) as Record<string, unknown>)
      spread(b.content, api.getBranchContentProps(node) as Record<string, unknown>)
    }
    for (const i of items.values()) {
      const node = { value: i.value }
      spread(i.item, api.getItemProps(node) as Record<string, unknown>)
      spread(i.text, api.getItemTextProps(node) as Record<string, unknown>)
      spread(i.indicator, api.getItemIndicatorProps(node) as Record<string, unknown>)
    }
  }

  // 任一 cell 变化即重渲，与两个适配器同语义（受控时内部不写值，因此也不会重渲——
  // 那一路要宿主自己写回 props，由 setProps 承担）
  runtime.subscribe(render)
  render()

  return {
    api: () => connectTree(service, normalizeProps),
    root,
    label,
    treeEl,
    branch: v => branches.get(v)!,
    item: v => items.get(v)!,
    node: v => branches.get(v)?.branch ?? items.get(v)!.item,
    setProps: (next) => {
      Object.assign(props, next)
      render()
    },
    render,
    expanded: () => service.context.get('expandedValue'),
    selected: () => service.context.get('selection'),
  }
}

/** 合成事件默认 cancelable=false，那样 preventDefault 是空操作、defaultPrevented 永远为假。 */
function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

function click(el: HTMLElement, init: MouseEventInit = {}): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }))
}

function focused(): string | null {
  return document.activeElement?.getAttribute('data-value') ?? null
}

function tabStops(): string[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="tree"]')]
    .filter(el => el.getAttribute('tabindex') === '0')
    .map(el => el.getAttribute('data-part')!)
}

/** 当下持有焦点的节点，按键一律从它发出（键盘处理器在 tree 容器上收口，靠冒泡）。 */
function active(): HTMLElement {
  return (document.activeElement as HTMLElement | null) ?? document.body
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('flattenTree 摊平成可见行', () => {
  it('空树摊出空序列', () => {
    expect(flattenTree([], [])).toEqual([])
    expect(flattenTree([], ['src'])).toEqual([])
  })

  it('全折叠：只剩根层，层级三件套按根层算', () => {
    const rows = flattenTree(COLLECTION, [])
    expect(rows.map(r => r.value)).toEqual(['src', 'docs', 'license'])
    expect(rows.map(r => r.level)).toEqual([1, 1, 1])
    expect(rows.map(r => r.posInSet)).toEqual([1, 2, 3])
    expect(rows.map(r => r.setSize)).toEqual([3, 3, 3])
    expect(rows.map(r => r.parent)).toEqual([null, null, null])
  })

  it('只有展开的分支才把子节点算进去', () => {
    expect(flattenTree(COLLECTION, ['src']).map(r => r.value))
      .toEqual(['src', 'index', 'utils', 'readme', 'docs', 'license'])
    // utils 展开了但它的父 src 没展开：整棵子树一行不出
    expect(flattenTree(COLLECTION, ['utils']).map(r => r.value))
      .toEqual(['src', 'docs', 'license'])
  })

  it('深层嵌套：子层紧跟父行，层级与同层序号逐层重算', () => {
    const rows = flattenTree(COLLECTION, ['src', 'utils'])
    expect(rows.map(r => r.value)).toEqual(['src', 'index', 'utils', 'dom', 'math', 'readme', 'docs', 'license'])
    expect(rows.map(r => r.level)).toEqual([1, 2, 2, 3, 3, 2, 1, 1])
    // dom/math 是 utils 的两个子项，同层总数是 2 而不是整棵树的行数
    expect(rows.filter(r => r.parent === 'utils').map(r => [r.posInSet, r.setSize])).toEqual([[1, 2], [2, 2]])
    expect(rows.find(r => r.value === 'readme')!.posInSet).toBe(3)
    expect(rows.find(r => r.value === 'readme')!.setSize).toBe(3)
    expect(rows.find(r => r.value === 'dom')!.indexPath).toEqual([0, 1, 0])
  })

  it('禁用节点照样是可见行：禁用不等于隐藏，它还得当方向键的起点', () => {
    const rows = flattenTree(COLLECTION, ['src'])
    const readme = rows.find(r => r.value === 'readme')
    expect(readme?.disabled).toBe(true)
    expect(rows.some(r => r.value === 'readme')).toBe(true)
  })

  it('children 给了空数组即为分支：它要报 aria-expanded，不能被当成叶子', () => {
    const docs = flattenTree(COLLECTION, []).find(r => r.value === 'docs')!
    expect(docs.branch).toBe(true)
    expect(docs.expanded).toBe(false)
    expect(flattenTree(COLLECTION, ['docs']).find(r => r.value === 'docs')!.expanded).toBe(true)
    // 展开一个空分支不会凭空多出行
    expect(flattenTree(COLLECTION, ['docs']).map(r => r.value)).toEqual(['src', 'docs', 'license'])
  })

  it('叶子恒不展开：展开集合里混进叶子值或不存在的值都不影响结果', () => {
    const rows = flattenTree(COLLECTION, ['license', 'ghost'])
    expect(rows.map(r => r.value)).toEqual(['src', 'docs', 'license'])
    expect(rows.find(r => r.value === 'license')!.expanded).toBe(false)
  })

  it('label 缺省退回 value，禁用缺省为 false', () => {
    const rows = flattenTree([{ value: 'bare' }], [])
    expect(rows[0]!.label).toBe('bare')
    expect(rows[0]!.disabled).toBe(false)
    expect(rows[0]!.branch).toBe(false)
  })

  it('自引用的畸形数据不会无限递归：祖先链上的值不再下潜', () => {
    const loop: TreeNode = { value: 'a', label: 'A', children: [] }
    loop.children!.push({ value: 'b', label: 'B', children: [loop] })
    const rows = flattenTree([loop], ['a', 'b'])
    expect(rows.map(r => r.value)).toEqual(['a', 'b', 'a'])
    // 第二个 a 是环的接口：它自己出现了一行，但不再往下摊
    expect(rows[2]!.level).toBe(3)
  })
})

describe('indexTree 全树索引', () => {
  it('收起分支里的节点照样有元信息：它们仍在 DOM 里，属性还得照发', () => {
    const index = indexTree(COLLECTION)
    expect([...index.keys()]).toEqual(['src', 'index', 'utils', 'dom', 'math', 'readme', 'docs', 'license'])
    expect(index.get('math')).toMatchObject({ level: 3, posInSet: 2, setSize: 2, parent: 'utils', branch: false })
    expect(index.get('utils')).toMatchObject({ level: 2, branch: true, parent: 'src' })
  })

  it('value 重复时以先出现的为准，取元信息是确定的', () => {
    const index = indexTree([
      { value: 'dup', label: 'First' },
      { value: 'dup', label: 'Second' },
    ])
    expect(index.get('dup')!.label).toBe('First')
  })
})

describe('treeMachine 展开与选中', () => {
  it('展开：expand/collapse/toggle 各自到位，重复展开不重复通知', () => {
    const onExpandedValueChange = vi.fn()
    const h = mount({ onExpandedValueChange })
    h.api().expand('src')
    expect(h.expanded()).toEqual(['src'])
    h.api().expand('src')
    expect(onExpandedValueChange).toHaveBeenCalledTimes(1)
    h.api().expand('docs')
    expect(h.expanded()).toEqual(['src', 'docs'])
    h.api().collapse('src')
    expect(h.expanded()).toEqual(['docs'])
    h.api().setExpandedValue(['src', 'src', 'utils'])
    expect(h.expanded()).toEqual(['src', 'utils'])
  })

  it('单选：选中即替换，同一个再选一次仍选中（点两下不该把树点空）', () => {
    const h = mount({ defaultSelection: ['license'] })
    h.api().select('docs')
    expect(h.selected()).toEqual(['docs'])
    h.api().select('docs')
    expect(h.selected()).toEqual(['docs'])
    // 公开 API 造不出 UI 造不出的选中集合
    h.api().setSelection(['docs', 'license'])
    expect(h.selected()).toEqual(['docs'])
  })

  it('复选：select 切换增删，setSelection 去重', () => {
    const h = mount({ multiple: true })
    h.api().select('docs')
    h.api().select('license')
    expect(h.selected()).toEqual(['docs', 'license'])
    h.api().select('docs')
    expect(h.selected()).toEqual(['license'])
    h.api().setSelection(['docs', 'docs', 'license'])
    expect(h.selected()).toEqual(['docs', 'license'])
  })

  it('受控：内部值纹丝不动，回调照发；宿主写回后才生效', () => {
    const onExpandedValueChange = vi.fn()
    const onSelectionChange = vi.fn()
    const h = mount({ expandedValue: ['src'], selection: ['license'], onExpandedValueChange, onSelectionChange })
    h.api().collapse('src')
    h.api().select('docs')
    expect(h.expanded()).toEqual(['src'])
    expect(h.selected()).toEqual(['license'])
    expect(onExpandedValueChange).toHaveBeenCalledWith({ value: [] })
    expect(onSelectionChange).toHaveBeenCalledWith({ value: ['docs'] })
    h.setProps({ expandedValue: [], selection: ['docs'] })
    expect(h.expanded()).toEqual([])
    expect(h.selected()).toEqual(['docs'])
  })

  it('同一份集合重复写入不重复通知：数组按元素比，不看引用', () => {
    const onSelectionChange = vi.fn()
    const h = mount({ multiple: true, defaultSelection: ['docs'], onSelectionChange })
    h.api().setSelection(['docs'])
    expect(onSelectionChange).not.toHaveBeenCalled()
    h.api().setSelection(['docs', 'license'])
    expect(onSelectionChange).toHaveBeenCalledTimes(1)
  })
})

describe('connectTree 属性输出', () => {
  it('tree 是 role=tree：aria-multiselectable / aria-disabled / 标题关联都显式给出', () => {
    const h = mount()
    expect(h.treeEl.getAttribute('role')).toBe('tree')
    // 省略与显式 false 不是一回事：前者是"没说"，后者是"明确说了不是多选"
    expect(h.treeEl.getAttribute('aria-multiselectable')).toBe('false')
    expect(h.treeEl.getAttribute('aria-disabled')).toBe('false')
    expect(h.treeEl.getAttribute('aria-labelledby')).toBe(h.label.id)
    expect(mount({ multiple: true }).treeEl.getAttribute('aria-multiselectable')).toBe('true')
  })

  it('叶子与分支都是 treeitem，层级三件套取自 collection 而不是 DOM 深度', () => {
    const h = mount({ defaultExpandedValue: ['src', 'utils'] })
    const src = h.branch('src').branch
    expect(src.getAttribute('role')).toBe('treeitem')
    expect(src.getAttribute('aria-level')).toBe('1')
    expect(src.getAttribute('aria-posinset')).toBe('1')
    expect(src.getAttribute('aria-setsize')).toBe('3')
    expect(src.getAttribute('aria-expanded')).toBe('true')

    const math = h.item('math').item
    expect(math.getAttribute('role')).toBe('treeitem')
    expect(math.getAttribute('aria-level')).toBe('3')
    expect(math.getAttribute('aria-posinset')).toBe('2')
    expect(math.getAttribute('aria-setsize')).toBe('2')
    // 叶子不报 aria-expanded：那是"能展开却没展开"的意思
    expect(math.hasAttribute('aria-expanded')).toBe(false)
  })

  it('收起分支里的节点照样拿到层级属性：它们只是收起，没被卸载', () => {
    const h = mount()
    const dom = h.item('dom').item
    expect(dom.getAttribute('aria-level')).toBe('3')
    expect(dom.getAttribute('aria-setsize')).toBe('2')
  })

  it('选中与禁用两态都显式给出，且绝不输出原生 disabled', () => {
    const h = mount({ defaultExpandedValue: ['src'], defaultSelection: ['index'] })
    const index = h.item('index').item
    const readme = h.item('readme').item
    expect(index.getAttribute('aria-selected')).toBe('true')
    expect(index.getAttribute('data-selected')).toBe('')
    expect(readme.getAttribute('aria-selected')).toBe('false')
    expect(readme.getAttribute('aria-disabled')).toBe('true')
    expect(readme.getAttribute('data-disabled')).toBe('')
    expect(readme.hasAttribute('disabled')).toBe(false)
    expect(index.getAttribute('aria-disabled')).toBe('false')
  })

  it('分支显式带 aria-label：名字从内容算会把整棵子树的文字念进去', () => {
    const h = mount()
    expect(h.branch('src').branch.getAttribute('aria-label')).toBe('Source')
    // 叶子的内容就是它自己的文本，不必也不该覆盖
    expect(h.item('license').item.hasAttribute('aria-label')).toBe(false)
  })

  it('branch-content 是 role=group，收起时 data-state=closed、展开时翻成 open', () => {
    const h = mount()
    const content = h.branch('src').content
    expect(content.getAttribute('role')).toBe('group')
    expect(content.getAttribute('data-state')).toBe('closed')
    h.api().expand('src')
    expect(content.getAttribute('data-state')).toBe('open')
  })

  it('展开箭头退出可及树与 Tab 序列：它只是重复了分支自己的语义', () => {
    const trigger = mount().branch('src').trigger
    expect(trigger.getAttribute('aria-hidden')).toBe('true')
    expect(trigger.getAttribute('tabindex')).toBe('-1')
  })

  it('整棵树禁用：所有节点转 aria-disabled，root/tree 带禁用标记', () => {
    const h = mount({ disabled: true, defaultExpandedValue: ['src'] })
    expect(h.root.getAttribute('data-disabled')).toBe('')
    expect(h.treeEl.getAttribute('aria-disabled')).toBe('true')
    expect(h.item('index').item.getAttribute('aria-disabled')).toBe('true')
    expect(h.branch('src').branch.getAttribute('aria-disabled')).toBe('true')
  })
})

/**
 * 排布方向的两条来源：节点上的 childrenOrientation，与树级 leafOrientation 加结构判据。
 * 两条给的答案在这棵树上处处相反，谁说了算一看便知。
 */
const MARKED: TreeNode[] = [
  {
    value: 'system',
    label: 'System',
    // 子节点全是分支，结构判据判它竖排
    childrenOrientation: 'horizontal',
    children: [
      {
        value: 'user',
        label: 'User',
        children: [
          { value: 'user:add', label: 'Add' },
          { value: 'user:del', label: 'Del' },
        ],
      },
      {
        value: 'role',
        label: 'Role',
        // 子节点全是叶子，结构判据判它跟树级走
        childrenOrientation: 'vertical',
        children: [
          { value: 'role:grant', label: 'Grant' },
          { value: 'role:revoke', label: 'Revoke' },
        ],
      },
    ],
  },
]

describe('子层排布方向', () => {
  const orientationOf = (h: Harness, value: string): string | null =>
    h.branch(value).content.getAttribute('data-orientation')

  it('节点标记优先于结构判据', () => {
    const h = mount({ collection: MARKED })
    expect(orientationOf(h, 'system')).toBe('horizontal')
    // 没标的分支照旧走结构判据加树级值
    expect(orientationOf(h, 'user')).toBe('vertical')
  })

  it('标记 vertical 压得过树级 horizontal', () => {
    const h = mount({ collection: MARKED, leafOrientation: 'horizontal' })
    expect(orientationOf(h, 'role')).toBe('vertical')
    // 同一层里没标的那个仍吃树级值
    expect(orientationOf(h, 'user')).toBe('horizontal')
  })

  it('根层不受节点标记影响，恒竖排', () => {
    const h = mount({ collection: MARKED, leafOrientation: 'horizontal' })
    expect(h.treeEl.getAttribute('data-orientation')).toBe('vertical')
    expect(h.root.getAttribute('data-orientation')).toBe('vertical')
  })
})

describe('roving tabindex', () => {
  it('焦点在树外：容器兜底占 Tab 位，节点全部退出', () => {
    const h = mount()
    expect(h.treeEl.getAttribute('tabindex')).toBe('0')
    expect(tabStops()).toEqual(['tree'])
  })

  it('有选中值时锚点节点认领 Tab 位；焦点进树后容器让位，只剩节点这一个停靠点', () => {
    const h = mount({ defaultSelection: ['license'] })
    expect(h.item('license').item.getAttribute('tabindex')).toBe('0')
    h.treeEl.focus()
    // 焦点落在选中节点上，不是首行
    expect(focused()).toBe('license')
    expect(h.treeEl.getAttribute('tabindex')).toBe('-1')
    expect(tabStops()).toEqual(['item'])
  })

  it('选中值藏在收起的分支里：它不可聚焦，容器必须继续兜底', () => {
    // 判据若只看"选中集合非空"，锚点会落在一个收起的节点上：
    // 它认领了 tabindex=0 而实际不可聚焦，容器又让了位 → 整棵树零个停靠点
    const h = mount({ defaultSelection: ['dom'] })
    expect(h.item('dom').item.getAttribute('tabindex')).toBe('-1')
    expect(h.treeEl.getAttribute('tabindex')).toBe('0')
    // 没有任何节点认领 Tab 位，全靠容器兜着
    expect(tabStops()).toEqual(['tree'])
    // 展开到它之后才轮得到它认领
    h.api().setExpandedValue(['src', 'utils'])
    expect(h.item('dom').item.getAttribute('tabindex')).toBe('0')
  })

  it('选中值不在树里时容器仍兜底：否则整棵树一个 Tab 停靠点都没有', () => {
    const h = mount({ selection: ['ghost'] })
    expect(h.treeEl.getAttribute('tabindex')).toBe('0')
    expect(tabStops()).toEqual(['tree'])
  })

  it('焦点锚点被收起后投影成空，容器立刻回到兜底位', () => {
    const h = mount({ defaultExpandedValue: ['src'] })
    h.item('index').item.focus()
    expect(h.api().focusedValue).toBe('index')
    expect(tabStops()).toEqual(['item'])
    // 宿主收起了 src：index 随子树一起收起，再也不可聚焦
    h.api().collapse('src')
    expect(h.api().focusedValue).toBeNull()
    expect(tabStops()).toEqual(['tree'])
  })

  it('无选中时焦点进树落首个可停留行', () => {
    const h = mount()
    h.treeEl.focus()
    expect(focused()).toBe('src')
  })

  it('焦点离开树即清锚点，容器重新兜底；树内部挪动不算离场', () => {
    const h = mount()
    h.treeEl.focus()
    expect(h.treeEl.getAttribute('tabindex')).toBe('-1')
    h.node('src').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: h.node('docs') }))
    expect(h.api().focusedValue).toBe('src')
    h.node('src').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
    expect(h.api().focusedValue).toBeNull()
    expect(tabStops()).toEqual(['tree'])
  })

  it('持有焦点的节点被移出 DOM：不补报离场就零个 Tab 停靠点', () => {
    // 浏览器不会为"被移除的节点带走了焦点"派 focusout（Chrome 如此），机器读不到这件事。
    // 两个适配器因此都在节点离场时补报 TREE.BLUR —— 这条用例钉的正是"不补报会怎样"
    const h = mount()
    h.treeEl.focus()
    h.node('src').remove()
    h.render()
    expect(h.api().focusedValue).toBe('src')
    expect(tabStops()).toEqual([])
    h.treeEl.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
    expect(tabStops()).toEqual(['tree'])
  })
})

describe('上下方向键在可见行上走', () => {
  it('收起的子树一行不算：src 的下一行是 docs，不是 index', () => {
    const h = mount()
    h.treeEl.focus()
    expect(focused()).toBe('src')
    press(active(), 'ArrowDown')
    expect(focused()).toBe('docs')
    press(active(), 'ArrowDown')
    expect(focused()).toBe('license')
  })

  it('展开之后子行进入序列，深层子树按层展开逐行接上', () => {
    const h = mount({ defaultExpandedValue: ['src', 'utils'] })
    h.treeEl.focus()
    const walk: string[] = []
    for (let i = 0; i < 7; i++) {
      press(active(), 'ArrowDown')
      walk.push(focused()!)
    }
    // readme 禁用被跳过
    expect(walk).toEqual(['index', 'utils', 'dom', 'math', 'docs', 'license', 'license'])
  })

  it('禁用行跳过，但它仍可聚焦、仍是方向键起点', () => {
    const h = mount({ defaultExpandedValue: ['src'] })
    h.item('readme').item.focus()
    expect(focused()).toBe('readme')
    press(active(), 'ArrowUp')
    expect(focused()).toBe('utils')
  })

  it('loop 默认关：首尾不回绕；显式打开才回绕', () => {
    const h = mount()
    h.treeEl.focus()
    press(active(), 'ArrowUp')
    expect(focused()).toBe('src')
    press(active(), 'End')
    expect(focused()).toBe('license')
    press(active(), 'ArrowDown')
    expect(focused()).toBe('license')

    const looped = mount({ loop: true })
    looped.treeEl.focus()
    press(active(), 'ArrowUp')
    expect(focused()).toBe('license')
  })

  it('home / End 到可见序的端点，不是原始树的端点', () => {
    const h = mount({ defaultExpandedValue: ['src', 'utils'] })
    h.treeEl.focus()
    press(active(), 'End')
    expect(focused()).toBe('license')
    press(active(), 'Home')
    expect(focused()).toBe('src')
  })

  it('方向键只搬焦点，不改展开也不改选中', () => {
    const h = mount({ defaultExpandedValue: ['src'] })
    h.treeEl.focus()
    press(active(), 'ArrowDown')
    expect(focused()).toBe('index')
    expect(h.expanded()).toEqual(['src'])
    expect(h.selected()).toEqual([])
    expect(h.item('index').item.getAttribute('data-highlighted')).toBe('')
  })

  it('带 Ctrl 的方向键归浏览器与读屏，树不接', () => {
    const h = mount()
    h.treeEl.focus()
    const event = press(active(), 'End', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(focused()).toBe('src')
  })
})

describe('左右方向键：层级操作', () => {
  it('右键在收起的分支上展开，再按一次进入首个子节点', () => {
    const h = mount()
    h.treeEl.focus()
    const opened = press(active(), 'ArrowRight')
    expect(opened.defaultPrevented).toBe(true)
    expect(h.expanded()).toEqual(['src'])
    // 展开只改展开态，焦点留在分支上
    expect(focused()).toBe('src')
    press(active(), 'ArrowRight')
    expect(focused()).toBe('index')
  })

  it('右键在叶子上什么都不做，也就绝不吞掉这个键', () => {
    const h = mount()
    h.treeEl.focus()
    press(active(), 'End')
    expect(focused()).toBe('license')
    const event = press(active(), 'ArrowRight')
    expect(event.defaultPrevented).toBe(false)
    expect(focused()).toBe('license')
  })

  it('左键在展开的分支上收起，在收起的分支与叶子上跳回父节点', () => {
    const h = mount({ defaultExpandedValue: ['src', 'utils'] })
    h.item('dom').item.focus()
    press(active(), 'ArrowLeft')
    expect(focused()).toBe('utils')
    // utils 还开着：这一下是收起，不是再往上跳
    press(active(), 'ArrowLeft')
    expect(h.expanded()).toEqual(['src'])
    expect(focused()).toBe('utils')
    // 收起了才跳父
    press(active(), 'ArrowLeft')
    expect(focused()).toBe('src')
  })

  it('左键在根层的行上什么都不做', () => {
    const h = mount()
    h.treeEl.focus()
    const event = press(active(), 'ArrowLeft')
    expect(event.defaultPrevented).toBe(false)
    expect(focused()).toBe('src')
  })

  it('禁用的分支展不开也收不起，这个键就不归树管；但焦点照样进得去它的子层', () => {
    const collection: TreeNode[] = [
      { value: 'locked', label: 'Locked', disabled: true, children: [{ value: 'kid', label: 'Kid' }] },
      { value: 'free', label: 'Free' },
    ]
    const h = mount({ collection })
    h.branch('locked').branch.focus()
    expect(focused()).toBe('locked')
    const blocked = press(active(), 'ArrowRight')
    expect(blocked.defaultPrevented).toBe(false)
    expect(h.expanded()).toEqual([])

    // 宿主自己把它展开：收起这一路同样不归树管
    h.api().expand('locked')
    const stuck = press(h.branch('locked').branch, 'ArrowLeft')
    expect(stuck.defaultPrevented).toBe(false)
    expect(h.expanded()).toEqual(['locked'])
    // 搬焦点不是对节点的操作，禁用分支的子层照样进得去
    press(h.branch('locked').branch, 'ArrowRight')
    expect(focused()).toBe('kid')
  })

  it('dir=rtl 把左右键整体对调', () => {
    const h = mount({ dir: 'rtl' })
    h.treeEl.focus()
    press(active(), 'ArrowLeft')
    expect(h.expanded()).toEqual(['src'])
    press(active(), 'ArrowRight')
    expect(h.expanded()).toEqual([])
  })
})

describe('* 展开同级分支', () => {
  it('只展开与焦点行同一父级的分支，别层不动', () => {
    const h = mount()
    h.treeEl.focus()
    const event = press(active(), '*')
    expect(event.defaultPrevented).toBe(true)
    // 根层的两个分支一起开；utils 是下一层，不归这一下管
    expect(h.expanded()).toEqual(['src', 'docs'])
    press(active(), 'ArrowDown')
    press(active(), 'ArrowDown')
    expect(focused()).toBe('utils')
    press(active(), '*')
    expect(h.expanded()).toEqual(['src', 'docs', 'utils'])
  })

  it('同级已经全展开时什么也没发生，这个键就不该被吞掉', () => {
    const h = mount({ defaultExpandedValue: ['src', 'docs'] })
    h.treeEl.focus()
    const event = press(active(), '*')
    expect(event.defaultPrevented).toBe(false)
    expect(h.expanded()).toEqual(['src', 'docs'])
  })
})

describe('确认键与点击', () => {
  it('叶子：Enter / Space 选中并替换原有选中', () => {
    const h = mount({ defaultExpandedValue: ['src'] })
    h.item('index').item.focus()
    const event = press(active(), 'Enter')
    expect(event.defaultPrevented).toBe(true)
    expect(h.selected()).toEqual(['index'])
    press(active(), 'ArrowDown')
    press(active(), ' ')
    expect(h.selected()).toEqual(['utils'])
  })

  it('分支上的确认键顺带切换展开态；expandOnClick 关掉后只选中', () => {
    const h = mount()
    h.treeEl.focus()
    press(active(), 'Enter')
    expect(h.selected()).toEqual(['src'])
    expect(h.expanded()).toEqual(['src'])
    press(active(), 'Enter')
    expect(h.expanded()).toEqual([])

    const fixed = mount({ expandOnClick: false })
    fixed.treeEl.focus()
    press(active(), 'Enter')
    expect(fixed.selected()).toEqual(['src'])
    expect(fixed.expanded()).toEqual([])
  })

  it('复选：确认键切换而不是替换', () => {
    const h = mount({ multiple: true, defaultExpandedValue: ['src'] })
    h.item('index').item.focus()
    press(active(), 'Enter')
    press(active(), 'ArrowDown')
    press(active(), 'Enter')
    expect(h.selected()).toEqual(['index', 'utils'])
    press(active(), 'Enter')
    expect(h.selected()).toEqual(['index'])
  })

  it('焦点停在禁用行上时确认键不认', () => {
    const h = mount({ defaultExpandedValue: ['src'] })
    h.item('readme').item.focus()
    press(active(), 'Enter')
    expect(h.selected()).toEqual([])
  })

  it('点叶子：选中并把焦点交给这一行', () => {
    const h = mount({ defaultExpandedValue: ['src'] })
    click(h.item('index').item)
    expect(h.selected()).toEqual(['index'])
    expect(focused()).toBe('index')
  })

  it('点分支行：选中 + 切展开，焦点落在 branch 上而不是行容器上', () => {
    const h = mount()
    click(h.branch('src').control)
    expect(h.selected()).toEqual(['src'])
    expect(h.expanded()).toEqual(['src'])
    expect(focused()).toBe('src')
    click(h.branch('src').control)
    expect(h.expanded()).toEqual([])
  })

  it('expandOnClick=false 时点行只选中', () => {
    const h = mount({ expandOnClick: false })
    click(h.branch('src').control)
    expect(h.selected()).toEqual(['src'])
    expect(h.expanded()).toEqual([])
  })

  it('点展开箭头只切展开、不选中，且不把"点行"再跑一遍', () => {
    // 不掐断冒泡的话展开态一次点击会被切两回，等于没切
    const h = mount()
    click(h.branch('src').trigger)
    expect(h.expanded()).toEqual(['src'])
    expect(h.selected()).toEqual([])
    expect(focused()).toBe('src')
    click(h.branch('src').trigger)
    expect(h.expanded()).toEqual([])
  })

  it('禁用节点点不动', () => {
    const h = mount({ defaultExpandedValue: ['src'], defaultSelection: ['index'] })
    click(h.item('readme').item)
    expect(h.selected()).toEqual(['index'])
  })

  it('整棵树禁用：键盘与点击都改不了展开与选中，焦点也落不进节点', () => {
    const h = mount({ disabled: true })
    h.treeEl.focus()
    expect(focused()).toBeNull()
    press(h.treeEl, 'ArrowDown')
    expect(focused()).toBeNull()
    click(h.branch('src').control)
    click(h.branch('src').trigger)
    click(h.item('license').item)
    expect(h.expanded()).toEqual([])
    expect(h.selected()).toEqual([])
  })
})

describe('连打检索', () => {
  it('按 label 首字母在可见行上搬焦点，不改选中也不展开', () => {
    const h = mount()
    h.treeEl.focus()
    const event = press(active(), 'l')
    expect(event.defaultPrevented).toBe(true)
    expect(focused()).toBe('license')
    expect(h.selected()).toEqual([])
    expect(h.expanded()).toEqual([])
  })

  it('取的是 collection 的 label 而不是节点 textContent', () => {
    const h = mount({ defaultExpandedValue: ['src'] })
    // 分支节点裹着整棵子树，前头还挂着箭头与勾选标记：它的 textContent 是
    // "▸✓Source✓Index▸✓Utils✓Readme"，一个 S 都轮不到打头；叶子同样被勾选标记挡住。
    // 按 textContent 检索这两行都命中不了，只有按 collection 里的 label 才对得上
    expect(h.branch('src').branch.textContent!.startsWith('S')).toBe(false)
    expect(h.item('index').item.textContent!.startsWith('I')).toBe(false)
    h.item('license').item.focus()
    press(active(), 's')
    expect(focused()).toBe('src')
  })

  it('走不进收起的子树：dom 不可见时敲 d 只会命中 docs', () => {
    const h = mount()
    h.treeEl.focus()
    press(active(), 'd')
    expect(focused()).toBe('docs')
  })

  it('跳过禁用行：敲 r 落不到 readme 上', () => {
    const h = mount({ defaultExpandedValue: ['src'] })
    h.treeEl.focus()
    press(active(), 'r')
    expect(focused()).toBe('src')
  })

  it('缓冲区非空时空格算词中间的字符，不当确认键', () => {
    const h = mount()
    h.treeEl.focus()
    press(active(), 'd')
    expect(focused()).toBe('docs')
    press(active(), ' ')
    // 查询串变成 "d "，匹配不上任何行：焦点不动、更不该把 docs 选中或展开
    expect(h.selected()).toEqual([])
    expect(h.expanded()).toEqual([])
  })

  it('typeahead 关掉后可打印字符一律放行，空格恒是确认键', () => {
    const h = mount({ typeahead: false })
    h.treeEl.focus()
    const event = press(active(), 'l')
    expect(event.defaultPrevented).toBe(false)
    expect(focused()).toBe('src')
    press(active(), ' ')
    expect(h.selected()).toEqual(['src'])
  })

  it('焦点离开树即丢缓冲：下次进来第一个字母不会被拼进上一轮', () => {
    const h = mount()
    h.treeEl.focus()
    press(active(), 'd')
    expect(focused()).toBe('docs')
    h.node('docs').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
    h.treeEl.focus()
    // 缓冲若没清，这一下的查询串会是 "dl"，谁也匹配不上
    press(active(), 'l')
    expect(focused()).toBe('license')
  })
})

describe('范围选', () => {
  it('按住 Shift 选中锚点到这一节点那一段，按屏幕上的可见序取', () => {
    const h = mount({ multiple: true, defaultExpandedValue: ['src'] })
    // 可见序：src / index / utils / readme / docs / license
    h.api().select('index')
    h.api().select('docs', { extend: true })
    // readme 是禁用节点，占着顺序位置但不被选进去
    expect(h.selected()).toEqual(['index', 'utils', 'readme', 'docs'])
  })

  it('折叠起来的子节点不在可见序里，一段选不到它们', () => {
    const h = mount({ multiple: true })
    // 全折叠时可见序只有三个根
    h.api().select('src')
    h.api().select('license', { extend: true })
    expect(h.selected()).toEqual(['src', 'docs', 'license'])
  })

  it('锚点不动、且能收缩——每一下都从基线重算', () => {
    const h = mount({ multiple: true })
    h.api().select('src')
    h.api().select('license', { extend: true })
    expect(h.selected()).toEqual(['src', 'docs', 'license'])
    h.api().select('docs', { extend: true })
    expect(h.selected()).toEqual(['src', 'docs'])
  })

  it('那一段并进先前勾的，不清掉它们', () => {
    const h = mount({ multiple: true })
    h.api().select('license')
    h.api().select('src')
    h.api().select('docs', { extend: true })
    expect(h.selected()).toEqual(['license', 'src', 'docs'])
  })

  it('单选不认范围选', () => {
    const h = mount()
    h.api().select('src')
    h.api().select('license', { extend: true })
    expect(h.selected()).toEqual(['license'])
  })

  it('级联那一路不接范围选：勾一个本来就带一片，再叠一段会难以预料', () => {
    const h = mount({ multiple: true, cascade: true, defaultExpandedValue: ['src'] })
    h.api().select('index')
    const before = h.selected()
    h.api().select('docs', { extend: true })
    // 走的是级联的普通切换，不是范围选
    expect(h.selected()).not.toEqual([...before, 'utils', 'readme', 'docs'])
  })

  it('还没有锚点时退化成普通的切换', () => {
    const h = mount({ multiple: true })
    h.api().select('docs', { extend: true })
    expect(h.selected()).toEqual(['docs'])
  })
})
