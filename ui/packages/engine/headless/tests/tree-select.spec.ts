// @vitest-environment jsdom
import type { RuntimeConfig } from '@xihan-ui/kernel'
import type { VanillaRuntime } from '@xihan-ui/machine/vanilla'
import type { TreeNode } from '../src/tree'
import type { TreeSelectApi, TreeSelectSchema } from '../src/tree-select'
import { createCounterIdGenerator, createRuntimeConfig, createScope, normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectTreeSelect, treeSelectMachine } from '../src/tree-select'

type Props = TreeSelectSchema['props']

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
const BOOLEAN_ATTRS = new Set(['disabled', 'hidden', 'readonly', 'required'])
// 隐藏输入的 value 只能走 DOM property：与 WC 侧的 spreader 同一套规则
const PROP_KEYS = new Set(['value'])

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，布尔属性 toggle，value 落 property）。
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
    if (key === 'style')
      continue
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    if (PROP_KEYS.has(key)) {
      (el as unknown as Record<string, unknown>)[key] = raw
      continue
    }
    if (BOOLEAN_ATTRS.has(key)) {
      el.toggleAttribute(key, Boolean(raw))
      continue
    }
    el.setAttribute(key, String(raw))
  }
}

interface BranchEls {
  branch: HTMLElement
  control: HTMLElement
  trigger: HTMLElement
  indicator: HTMLElement
  text: HTMLElement
  content: HTMLElement
}

interface ItemEls {
  item: HTMLElement
  text: HTMLElement
  indicator: HTMLElement
}

interface Harness {
  api: () => TreeSelectApi
  root: HTMLElement
  trigger: HTMLButtonElement
  valueText: HTMLElement
  clear: HTMLButtonElement
  content: HTMLElement
  treeEl: HTMLElement
  /** 作者放在树上方的搜索框，用来钉住落点不被 Tab 序列探测抢走。 */
  searchBox: HTMLInputElement
  hiddenInput: HTMLInputElement
  branch: (value: string) => BranchEls
  item: (value: string) => ItemEls
  /** 节点元素：分支取 branch，叶子取 item。 */
  node: (value: string) => HTMLElement
  /** 摘掉一个叶子（模拟调用方换数据）。 */
  removeItem: (value: string) => void
  /** 适配器才发得出的 DOM 事实（如节点卸载带走了焦点），测试里直接送给机器。 */
  send: (event: TreeSelectSchema['event']) => void
  setProps: (next: Partial<Props>) => void
  render: () => void
  state: () => string
  value: () => string[]
  expanded: () => string[]
  focused: () => string | null
  returnFocus: () => boolean
}

const runtimes: VanillaRuntime[] = []

function mount(initial: Partial<Props> = {}): Harness {
  const doc = document
  const runtime = createVanillaRuntime()
  runtimes.push(runtime)
  // props 挂在 signal 上：布尔态受控（open）靠 watch 里的 track 回写，
  // 而 track 只在有值真的变过时才复查——直接改一个普通对象，宿主的写回就被静默吞掉了
  const props = runtime.signal<Partial<Props>>({ collection: COLLECTION, ...initial })
  // 作者标记镜像的是机器手上的那份 collection：两边不同源的话，
  // 摊平算出来的可见行在 DOM 里一个也找不到，用例会假绿
  const collection = props.get().collection!

  const idGen = createCounterIdGenerator()
  const scope = createScope(null, idGen)

  const root = doc.createElement('div')
  const label = doc.createElement('span')
  label.textContent = '目录'
  const trigger = doc.createElement('button')
  const valueText = doc.createElement('span')
  const indicator = doc.createElement('span')
  const clear = doc.createElement('button')
  trigger.append(valueText, indicator)
  const positioner = doc.createElement('div')
  const content = doc.createElement('div')
  const treeEl = doc.createElement('div')
  const hiddenInput = doc.createElement('input')
  // 作者常在树上方放一个搜索框（docs 的过滤示例即如此）。它排在树前面，
  // 焦点域若把落点交给 Tab 序列探测就会先撞上它——用例据此钉住「落点是树而不是它」
  const searchBox = doc.createElement('input')
  searchBox.type = 'search'
  content.append(searchBox, treeEl)
  positioner.appendChild(content)
  root.append(hiddenInput, label, trigger, clear, positioner)

  const branches = new Map<string, BranchEls>()
  const items = new Map<string, ItemEls>()

  // 作者标记镜像 collection：分支裹着自己的 branch-content，子层长在里面。
  // 箭头与勾选标记都带字形且排在文本前面——真实皮肤就是这么长的，
  // 连打检索若去读节点 textContent 会当场被它们挡住
  const build = (nodes: readonly TreeNode[], host: HTMLElement): void => {
    for (const node of nodes) {
      const text = doc.createElement('span')
      text.textContent = node.label ?? node.value
      const indicatorEl = doc.createElement('span')
      indicatorEl.textContent = '✓'
      if (Array.isArray(node.children)) {
        const branch = doc.createElement('div')
        const control = doc.createElement('div')
        const branchTrigger = doc.createElement('span')
        branchTrigger.textContent = '▸'
        const branchContent = doc.createElement('div')
        control.append(branchTrigger, indicatorEl, text)
        branch.append(control, branchContent)
        host.appendChild(branch)
        branches.set(node.value, {
          branch,
          control,
          trigger: branchTrigger,
          indicator: indicatorEl,
          text,
          content: branchContent,
        })
        build(node.children, branchContent)
        continue
      }
      const item = doc.createElement('div')
      item.append(indicatorEl, text)
      host.appendChild(item)
      items.set(node.value, { item, text, indicator: indicatorEl })
    }
  }
  build(collection, treeEl)
  doc.body.appendChild(root)

  const service = createService(treeSelectMachine, { props: () => props.get(), runtime, scope })

  const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'popover',
    node: () => content,
    // trigger 记为本层分支：点它算层内交互，开合交给 trigger 自己切换
    branches: () => [trigger],
    isModal: () => false,
    setModal: () => {},
    surfaces: () => [],
  }))
  service.refs.set('getAnchorEl', () => trigger)
  service.refs.set('getFloatingEl', () => positioner)
  service.refs.set('getContentEl', () => content)

  const render = (): void => {
    const api = connectTreeSelect(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(label, api.getLabelProps() as Record<string, unknown>)
    spread(trigger, api.getTriggerProps() as Record<string, unknown>)
    spread(valueText, api.getValueTextProps() as Record<string, unknown>)
    valueText.textContent = api.displayText
    spread(indicator, api.getIndicatorProps() as Record<string, unknown>)
    spread(clear, api.getClearTriggerProps() as Record<string, unknown>)
    spread(positioner, api.getPositionerProps() as Record<string, unknown>)
    spread(content, api.getContentProps() as Record<string, unknown>)
    spread(treeEl, api.getTreeProps() as Record<string, unknown>)
    spread(hiddenInput, api.getHiddenInputProps() as Record<string, unknown>)
    for (const [value, b] of branches) {
      const node = { value }
      spread(b.branch, api.getBranchProps(node) as Record<string, unknown>)
      spread(b.control, api.getBranchControlProps(node) as Record<string, unknown>)
      spread(b.trigger, api.getBranchTriggerProps(node) as Record<string, unknown>)
      spread(b.indicator, api.getBranchIndicatorProps(node) as Record<string, unknown>)
      spread(b.text, api.getBranchTextProps(node) as Record<string, unknown>)
      spread(b.content, api.getBranchContentProps(node) as Record<string, unknown>)
    }
    for (const [value, i] of items) {
      const node = { value }
      spread(i.item, api.getItemProps(node) as Record<string, unknown>)
      spread(i.text, api.getItemTextProps(node) as Record<string, unknown>)
      spread(i.indicator, api.getItemIndicatorProps(node) as Record<string, unknown>)
    }
  }

  runtime.start()
  // 任一 cell 变化即重渲，与两个适配器同语义（受控时内部不写值，因此也不会重渲——
  // 那一路要宿主自己写回 props，由 setProps 承担）
  runtime.subscribe(render)
  render()

  return {
    api: () => connectTreeSelect(service, normalizeProps),
    root,
    trigger: trigger as HTMLButtonElement,
    valueText,
    clear: clear as HTMLButtonElement,
    content,
    treeEl,
    searchBox: searchBox as HTMLInputElement,
    hiddenInput: hiddenInput as HTMLInputElement,
    branch: v => branches.get(v)!,
    item: v => items.get(v)!,
    node: v => branches.get(v)?.branch ?? items.get(v)!.item,
    removeItem: (v) => {
      items.get(v)!.item.remove()
      items.delete(v)
      render()
    },
    send: event => service.send(event),
    setProps: (next) => {
      props.set({ ...props.get(), ...next })
      render()
    },
    render,
    state: () => service.state.get(),
    value: () => service.context.get('value'),
    expanded: () => service.context.get('expandedValue'),
    focused: () => service.context.get('focusedValue'),
    returnFocus: () => service.context.get('returnFocus'),
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

/** 当下持有焦点的元素，按键一律从它发出（键盘处理器在 tree 上收口，靠冒泡）。 */
function active(): HTMLElement {
  return (document.activeElement as HTMLElement | null) ?? document.body
}

function focusedValue(): string | null {
  return document.activeElement?.getAttribute('data-value') ?? null
}

/** flush 在 vanilla 运行时是 queueMicrotask；消解层的监听器注册还要过一个 setTimeout。 */
function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/** 焦点域的挂载聚焦排在 requestAnimationFrame 上，最多重试三帧。 */
function settle(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 80))
}

afterEach(() => {
  for (const runtime of runtimes.splice(0)) runtime.stop()
  document.body.innerHTML = ''
})

describe('treeSelectMachine 开合与受控', () => {
  it('默认收起，defaultOpen 决定初态', () => {
    expect(mount().state()).toBe('closed')
    expect(mount({ defaultOpen: true }).state()).toBe('open')
  })

  it('点 trigger 开合并通知；收起态 content 带 hidden、展开后摘掉', () => {
    const onOpenChange = vi.fn()
    const h = mount({ onOpenChange })
    expect(h.content.hasAttribute('hidden')).toBe(true)
    expect(h.trigger.getAttribute('aria-expanded')).toBe('false')

    click(h.trigger)
    expect(h.state()).toBe('open')
    expect(h.content.hasAttribute('hidden')).toBe(false)
    expect(h.trigger.getAttribute('aria-expanded')).toBe('true')
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: true })

    click(h.trigger)
    expect(h.state()).toBe('closed')
    expect(h.content.hasAttribute('hidden')).toBe(true)
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: false })
  })

  it('受控 open：点 trigger 只发意图不自改状态，宿主写回后才转移', () => {
    const onOpenChange = vi.fn()
    const h = mount({ open: false, onOpenChange })
    click(h.trigger)
    expect(h.state()).toBe('closed')
    expect(onOpenChange).toHaveBeenCalledWith({ open: true })

    h.setProps({ open: true })
    expect(h.state()).toBe('open')
    // 宿主写回不是新的用户意图，不再发一次
    expect(onOpenChange).toHaveBeenCalledTimes(1)
  })
})

describe('选中值与显示文本', () => {
  it('裸串是单选简写，内部一律归一成数组', () => {
    expect(mount({ defaultValue: 'index' }).value()).toEqual(['index'])
    expect(mount({ defaultValue: ['index', 'dom'], multiple: true }).value()).toEqual(['index', 'dom'])
    expect(mount().value()).toEqual([])
  })

  it('显示文本取 collection 的 label：藏在收起分支里的选中值照样报得出名字', () => {
    // dom 在 src/utils 里，两层都没展开，DOM 上那个节点此刻是 hidden 的
    const h = mount({ defaultValue: 'dom', placeholder: '请选择' })
    expect(h.api().valueText).toBe('Dom')
    expect(h.api().displayText).toBe('Dom')
    expect(h.valueText.getAttribute('data-placeholder')).toBeNull()
  })

  it('无选中时显示 placeholder，并把 data-placeholder 打在 trigger 与 value-text 上', () => {
    const h = mount({ placeholder: '请选择' })
    expect(h.api().valueText).toBeNull()
    expect(h.api().displayText).toBe('请选择')
    expect(h.trigger.getAttribute('data-placeholder')).toBe('')
    expect(h.valueText.getAttribute('data-placeholder')).toBe('')
  })

  it('多选把多个 label 连成一串', () => {
    const h = mount({ multiple: true, defaultValue: ['index', 'license'] })
    expect(h.api().displayText).toBe('Index, License')
  })

  it('label 缺省退回 value', () => {
    const h = mount({ collection: [{ value: 'bare' }], defaultValue: 'bare' })
    expect(h.api().displayText).toBe('bare')
  })

  it('setValue 单选截断到一个、多选去重：公开 API 造不出 UI 造不出的选中集合', () => {
    const single = mount()
    single.api().setValue(['index', 'license'])
    expect(single.value()).toEqual(['index'])

    const multi = mount({ multiple: true })
    multi.api().setValue(['index', 'index', 'license'])
    expect(multi.value()).toEqual(['index', 'license'])
  })

  it('表单出口：name 缺省即不参与提交，值按逗号拼成一串，整控件禁用则不提交', () => {
    const h = mount({ multiple: true, defaultValue: ['index', 'license'] })
    expect(h.hiddenInput.getAttribute('type')).toBe('hidden')
    expect(h.hiddenInput.getAttribute('name')).toBeNull()
    expect(h.hiddenInput.value).toBe('index,license')

    h.setProps({ name: 'dir' })
    expect(h.hiddenInput.getAttribute('name')).toBe('dir')
    h.setProps({ disabled: true })
    expect(h.hiddenInput.hasAttribute('disabled')).toBe(true)
  })
})

describe('展开集合（复用 Tree 的摊平模型）', () => {
  it('可见行随展开集合变：收起分支的整棵子树一行不出', () => {
    const h = mount()
    expect(h.api().visibleNodes.map(r => r.value)).toEqual(['src', 'docs', 'license'])
    h.api().expand('src')
    expect(h.api().visibleNodes.map(r => r.value))
      .toEqual(['src', 'index', 'utils', 'readme', 'docs', 'license'])
    h.api().expand('utils')
    expect(h.api().visibleNodes.map(r => r.value))
      .toEqual(['src', 'index', 'utils', 'dom', 'math', 'readme', 'docs', 'license'])
    h.api().collapse('src')
    // utils 仍在展开集合里，但它的父收起了：整棵子树照样一行不出
    expect(h.api().visibleNodes.map(r => r.value)).toEqual(['src', 'docs', 'license'])
  })

  it('展开态同步到 branch-content 的 hidden 与分支的 aria-expanded', () => {
    const h = mount()
    expect(h.branch('src').content.hasAttribute('hidden')).toBe(true)
    expect(h.branch('src').branch.getAttribute('aria-expanded')).toBe('false')
    h.api().expand('src')
    expect(h.branch('src').content.hasAttribute('hidden')).toBe(false)
    expect(h.branch('src').branch.getAttribute('aria-expanded')).toBe('true')
  })

  it('受控 expandedValue：宿主不写回则纹丝不动', () => {
    const onExpandedChange = vi.fn()
    const h = mount({ expandedValue: [], onExpandedChange })
    h.api().expand('src')
    expect(h.expanded()).toEqual([])
    expect(onExpandedChange).toHaveBeenCalledWith({ value: ['src'] })
    h.setProps({ expandedValue: ['src'] })
    expect(h.api().isExpanded('src')).toBe(true)
  })
})

describe('展开那一刻的焦点落点', () => {
  it('无选中、指针打开：不落锚点，Tab 位由树容器兜底', async () => {
    const h = mount()
    h.trigger.focus()
    click(h.trigger)
    await settle()
    expect(h.api().focusedValue).toBeNull()
    expect(h.treeEl.getAttribute('tabindex')).toBe('0')
  })

  it('无选中、指针打开：落点是树而不是浮层里排在它前面的搜索框', async () => {
    const h = mount()
    h.trigger.focus()
    click(h.trigger)
    await settle()
    // 焦点域若把落点交给 Tab 序列探测，按文档序先撞上的就是搜索框；
    // 而键盘处理器挂在树上，落到搜索框上方向键就此失灵
    expect(document.activeElement).toBe(h.treeEl)
    expect(document.activeElement).not.toBe(h.searchBox)
    press(active(), 'ArrowDown')
    expect(h.focused()).toBe('src')
  })

  it('无选中、键盘打开：落到首个可见行', async () => {
    const h = mount()
    h.trigger.focus()
    press(h.trigger, 'Enter')
    await settle()
    expect(h.focused()).toBe('src')
    expect(focusedValue()).toBe('src')
  })

  it('有选中且可见：落到选中行', async () => {
    const h = mount({ defaultValue: 'license' })
    h.trigger.focus()
    click(h.trigger)
    await settle()
    expect(h.focused()).toBe('license')
    expect(focusedValue()).toBe('license')
  })

  it('选中值藏在收起的分支里：它聚不了焦，退回首个可停留行', async () => {
    const h = mount({ defaultValue: 'dom' })
    h.trigger.focus()
    click(h.trigger)
    await settle()
    expect(h.focused()).toBe('src')
  })

  it('trigger 上的 ArrowUp/ArrowDown 展开并把落点交给方向意图', async () => {
    const down = mount({ defaultExpandedValue: ['src'], defaultValue: 'index' })
    down.trigger.focus()
    const event = press(down.trigger, 'ArrowDown')
    expect(event.defaultPrevented).toBe(true)
    await settle()
    // index 的下一可见行是 utils
    expect(down.focused()).toBe('utils')

    const up = mount({ defaultExpandedValue: ['src'], defaultValue: 'index' })
    up.trigger.focus()
    press(up.trigger, 'ArrowUp')
    await settle()
    expect(up.focused()).toBe('src')
  })

  it('trigger 上的 Enter 与空格都吞键：按钮默认激活会再合成一次 click 把浮层反手关掉', () => {
    const enter = mount()
    enter.trigger.focus()
    expect(press(enter.trigger, 'Enter').defaultPrevented).toBe(true)
    expect(enter.state()).toBe('open')

    const space = mount()
    space.trigger.focus()
    expect(press(space.trigger, ' ').defaultPrevented).toBe(true)
    expect(space.state()).toBe('open')
  })
})

describe('树内键盘导航', () => {
  async function open(initial: Partial<Props> = {}): Promise<Harness> {
    const h = mount(initial)
    h.trigger.focus()
    // 键盘打开才预落锚点：方向键、确认键与连打检索都要有起点
    press(h.trigger, 'Enter')
    await settle()
    return h
  }

  // 浮层壳自带内边距又可被点中（tabindex=-1）：焦点歇在它身上时按键从壳发出，
  // 里层的树收不到——键盘必须收在壳上
  it('焦点歇在浮层壳上：方向键、检索与确认键照样进得去树', async () => {
    const h = mount({ defaultExpandedValue: ['src'] })
    h.trigger.focus()
    click(h.trigger)
    await settle()
    // 点在壳的内边距上就是这个效果
    h.content.focus()
    expect(document.activeElement).toBe(h.content)

    expect(press(active(), 'ArrowDown').defaultPrevented).toBe(true)
    expect(focusedValue()).toBe('src')
    press(active(), 'l')
    expect(focusedValue()).toBe('license')
    expect(press(active(), 'Enter').defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['license'])
  })

  it('上下键走可见行，禁用行跳过，loop 默认关所以首尾不回绕', async () => {
    const h = await open({ defaultExpandedValue: ['src'] })
    expect(focusedValue()).toBe('src')
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('index')
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('utils')
    // readme 禁用，直接跨过去
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('docs')
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('license')
    // 末行不回绕
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('license')
    press(active(), 'Home')
    expect(focusedValue()).toBe('src')
    press(active(), 'ArrowUp')
    expect(focusedValue()).toBe('src')
    press(active(), 'End')
    expect(focusedValue()).toBe('license')
    // 走了这一圈，展开与选中都不该动
    expect(h.expanded()).toEqual(['src'])
    expect(h.value()).toEqual([])
  })

  it('loop 打开后首尾回绕', async () => {
    await open({ loop: true })
    press(active(), 'ArrowUp')
    expect(focusedValue()).toBe('license')
    press(active(), 'ArrowDown')
    expect(focusedValue()).toBe('src')
  })

  it('右键展开、再右键进子层；左键收起、再左键回父层；叶子与根层上不吞键', async () => {
    const h = await open()
    expect(press(active(), 'ArrowRight').defaultPrevented).toBe(true)
    expect(h.expanded()).toEqual(['src'])
    // 展开只改展开态，焦点留在分支上
    expect(focusedValue()).toBe('src')

    press(active(), 'ArrowRight')
    expect(focusedValue()).toBe('index')
    // 叶子上的右键什么都不做，也不吞键
    expect(press(active(), 'ArrowRight').defaultPrevented).toBe(false)
    expect(focusedValue()).toBe('index')

    press(active(), 'ArrowLeft')
    expect(focusedValue()).toBe('src')
    press(active(), 'ArrowLeft')
    expect(h.expanded()).toEqual([])
    expect(focusedValue()).toBe('src')
    // 根层的行没有父，什么也不做
    expect(press(active(), 'ArrowLeft').defaultPrevented).toBe(false)
  })

  it('dir=rtl 把左右键整体对调', async () => {
    const h = await open({ dir: 'rtl' })
    press(active(), 'ArrowLeft')
    expect(h.expanded()).toEqual(['src'])
    press(active(), 'ArrowRight')
    expect(h.expanded()).toEqual([])
  })

  it('* 展开与焦点行同一父级的全部分支，别层不动；同级无可展开时不吞键', async () => {
    const h = await open()
    expect(press(active(), '*').defaultPrevented).toBe(true)
    // 根层的 src 与 docs 一起开；utils 在下一层，不归这一下管
    expect(h.expanded()).toEqual(['src', 'docs'])
    expect(press(active(), '*').defaultPrevented).toBe(false)
  })

  it('连打检索绕一圈搬焦点，只动焦点不改选中也不展开', async () => {
    const h = await open({ defaultExpandedValue: ['src'] })
    press(active(), 'd')
    expect(focusedValue()).toBe('docs')
    expect(h.value()).toEqual([])
    expect(h.expanded()).toEqual(['src'])
  })

  it('检索取字取的是 collection 的 label：节点里还挂着箭头与勾选标记，读 textContent 一个也匹配不上', async () => {
    const h = await open({ defaultExpandedValue: ['src'] })
    press(active(), 'End')
    expect(focusedValue()).toBe('license')
    // src 那一行的 textContent 是「▸✓Source…」，以字形开头；按 label 才命中 Source
    press(active(), 's')
    expect(focusedValue()).toBe('src')
    expect(h.value()).toEqual([])
  })

  it('连打检索跳过禁用行', async () => {
    await open({ defaultExpandedValue: ['src'] })
    press(active(), 'r')
    // readme 禁用，'r' 没有别的命中项，焦点保持原状
    expect(focusedValue()).toBe('src')
  })
})

describe('选中', () => {
  async function open(initial: Partial<Props> = {}): Promise<Harness> {
    const h = mount(initial)
    h.trigger.focus()
    // 键盘打开才预落锚点：方向键、确认键与连打检索都要有起点
    press(h.trigger, 'Enter')
    await settle()
    return h
  }

  it('enter 选中焦点行：单选替换并收起浮层，焦点归还 trigger', async () => {
    const onValueChange = vi.fn()
    const h = await open({ defaultExpandedValue: ['src'], onValueChange })
    press(active(), 'ArrowDown')
    expect(press(active(), 'Enter').defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['index'])
    expect(onValueChange).toHaveBeenCalledWith({ value: ['index'] })
    expect(h.state()).toBe('closed')
    expect(h.returnFocus()).toBe(true)
    expect(h.api().displayText).toBe('Index')
    await settle()
    expect(document.activeElement).toBe(h.trigger)
  })

  it('空格与 Enter 同义', async () => {
    const h = await open({ defaultExpandedValue: ['src'] })
    press(active(), 'ArrowDown')
    expect(press(active(), ' ').defaultPrevented).toBe(true)
    expect(h.value()).toEqual(['index'])
    expect(h.state()).toBe('closed')
  })

  it('多选：确认键切换而不是替换，浮层不收起、焦点留在树里', async () => {
    const h = await open({ multiple: true, defaultExpandedValue: ['src'] })
    press(active(), 'ArrowDown')
    press(active(), 'Enter')
    expect(h.value()).toEqual(['index'])
    expect(h.state()).toBe('open')
    expect(focusedValue()).toBe('index')

    press(active(), 'ArrowDown')
    press(active(), 'Enter')
    expect(h.value()).toEqual(['index', 'utils'])
    // 再按一次就取消掉
    press(active(), 'Enter')
    expect(h.value()).toEqual(['index'])
    expect(h.state()).toBe('open')
  })

  it('单选按两下同一行不会把控件点空', async () => {
    const h = await open()
    press(active(), 'Enter')
    expect(h.value()).toEqual(['src'])
    h.trigger.focus()
    click(h.trigger)
    await settle()
    press(active(), 'Enter')
    expect(h.value()).toEqual(['src'])
  })

  it('禁用行确认键不认，但它仍可聚焦、仍是方向键起点', async () => {
    const h = await open({ defaultExpandedValue: ['src'] })
    h.item('readme').item.focus()
    expect(h.focused()).toBe('readme')
    press(active(), 'Enter')
    expect(h.value()).toEqual([])
    expect(h.state()).toBe('open')
    press(active(), 'ArrowUp')
    expect(focusedValue()).toBe('utils')
  })

  it('点叶子：单选选中并收起（收起顺带丢掉焦点锚点）', async () => {
    const h = await open({ defaultExpandedValue: ['src'] })
    click(h.item('index').item)
    expect(h.value()).toEqual(['index'])
    expect(h.state()).toBe('closed')
    expect(h.focused()).toBeNull()
  })

  it('点叶子先把焦点交给这一行：多选不收起，锚点看得见', async () => {
    const h = await open({ multiple: true, defaultExpandedValue: ['src'] })
    click(h.item('index').item)
    expect(h.focused()).toBe('index')
    expect(focusedValue()).toBe('index')
    expect(h.state()).toBe('open')
  })

  it('点分支行只选中不切展开态；点箭头只切展开态且不冒泡成一次点行', async () => {
    const h = await open({ multiple: true })
    click(h.branch('src').control)
    expect(h.value()).toEqual(['src'])
    expect(h.expanded()).toEqual([])

    click(h.branch('src').trigger)
    expect(h.expanded()).toEqual(['src'])
    // 箭头掐断了冒泡：选中集合没被再切一遍
    expect(h.value()).toEqual(['src'])
  })

  it('点禁用叶子改不动选中值', async () => {
    const h = await open({ defaultExpandedValue: ['src'], defaultValue: 'index' })
    click(h.item('readme').item)
    expect(h.value()).toEqual(['index'])
  })

  it('受控 value：点条目只发通知不自改选中态，宿主写回后才切换', async () => {
    const onValueChange = vi.fn()
    const h = await open({ value: 'src', onValueChange })
    click(h.item('license').item)
    expect(h.value()).toEqual(['src'])
    expect(onValueChange).toHaveBeenCalledWith({ value: ['license'] })
    h.setProps({ value: 'license' })
    expect(h.value()).toEqual(['license'])
    expect(h.api().displayText).toBe('License')
  })
})

describe('收起的出口', () => {
  it('tab 收起浮层且不吞键，焦点不归还 trigger', async () => {
    const h = mount()
    h.trigger.focus()
    click(h.trigger)
    await settle()
    const event = press(active(), 'Tab')
    expect(event.defaultPrevented).toBe(false)
    expect(h.state()).toBe('closed')
    expect(h.returnFocus()).toBe(false)
  })

  it('escape 收起浮层，选中值与展开集合都不变，焦点归还 trigger', async () => {
    const h = mount({ defaultExpandedValue: ['src'], defaultValue: 'index' })
    h.trigger.focus()
    click(h.trigger)
    await settle()
    // 消解层的监听器延后一拍注册（免得开自己的那次交互立刻把自己关掉）
    await tick()

    press(active(), 'Escape')
    expect(h.state()).toBe('closed')
    expect(h.value()).toEqual(['index'])
    expect(h.expanded()).toEqual(['src'])
    expect(h.returnFocus()).toBe(true)
    await settle()
    expect(document.activeElement).toBe(h.trigger)
  })

  it('收起即丢焦点锚点与连打缓冲：下次展开的第一个字母不会被拼进上一轮的查询串', async () => {
    const h = mount({ defaultExpandedValue: ['src'] })
    h.trigger.focus()
    click(h.trigger)
    await settle()
    press(active(), 'd')
    expect(focusedValue()).toBe('docs')
    click(h.trigger)
    expect(h.focused()).toBeNull()

    h.trigger.focus()
    click(h.trigger)
    await settle()
    // 缓冲若没清，这一下会变成查询串 "di"，'index' 就再也命中不了
    press(active(), 'i')
    expect(focusedValue()).toBe('index')
  })
})

describe('roving tabindex', () => {
  function tabStops(): string[] {
    return [...document.querySelectorAll<HTMLElement>('[data-scope="tree-select"]')]
      .filter(el => el.getAttribute('tabindex') === '0')
      .map(el => el.getAttribute('data-part')!)
  }

  it('收起态整个控件只有 trigger 一个停靠点，节点与树容器都退出 Tab 序列', () => {
    const h = mount({ defaultValue: 'license' })
    expect(tabStops()).toEqual([])
    expect(h.treeEl.getAttribute('tabindex')).toBe('-1')
    expect(h.node('license').getAttribute('tabindex')).toBe('-1')
    // trigger 是原生 button，本就在 Tab 序列里，不靠 tabindex 表达
    expect(h.trigger.getAttribute('tabindex')).toBeNull()
  })

  it('展开后只有锚点节点认领 tabindex=0，树容器让位', async () => {
    const h = mount({ defaultValue: 'license' })
    h.trigger.focus()
    click(h.trigger)
    await settle()
    expect(tabStops()).toEqual(['item'])
    expect(h.node('license').getAttribute('tabindex')).toBe('0')
    expect(h.treeEl.getAttribute('tabindex')).toBe('-1')
  })

  it('锚点藏进收起的分支后不再认领 Tab 位，树容器接手兜底', async () => {
    const h = mount({ defaultExpandedValue: ['src'] })
    h.trigger.focus()
    click(h.trigger)
    await settle()
    // 指针打开不预落锚点：第一按落到首行，第二按才走到它的子节点
    press(active(), 'ArrowDown')
    expect(h.focused()).toBe('src')
    press(active(), 'ArrowDown')
    expect(h.focused()).toBe('index')
    expect(h.node('index').getAttribute('tabindex')).toBe('0')

    // 收起 src：index 仍在 DOM 里但已 hidden，聚不了焦
    h.api().collapse('src')
    expect(h.api().focusedValue).toBeNull()
    expect(h.node('index').getAttribute('tabindex')).toBe('-1')
    expect(h.treeEl.getAttribute('tabindex')).toBe('0')
  })

  it('锚点节点被移出 DOM：就地重挑一个，Tab 位不至于空掉', async () => {
    const h = mount({ defaultExpandedValue: ['src'] })
    h.trigger.focus()
    click(h.trigger)
    await settle()
    // 指针打开不预落锚点：第一按落到首行，第二按才走到它的子节点
    press(active(), 'ArrowDown')
    expect(h.focused()).toBe('src')
    press(active(), 'ArrowDown')
    expect(h.focused()).toBe('index')

    // 节点被移出 DOM 时浏览器不派 focusout，适配器替它如实上报
    h.removeItem('index')
    h.send({ type: 'NODE.LOST' })
    // 锚点没重挑的话它会一直指着 index：没有节点认领 tabindex=0，方向键也失去起点
    expect(h.focused()).toBe('src')
    expect(h.node('src').getAttribute('tabindex')).toBe('0')
    expect(h.treeEl.getAttribute('tabindex')).toBe('-1')
  })
})

describe('禁用与只读', () => {
  it('整控件禁用：trigger 用原生 disabled，节点一律 aria-disabled，浮层展不开', () => {
    const h = mount({ disabled: true, defaultExpandedValue: ['src'] })
    expect(h.trigger.hasAttribute('disabled')).toBe(true)
    expect(h.node('src').getAttribute('aria-disabled')).toBe('true')
    // 集合节点绝不输出原生 disabled：那样就不可聚焦、也不派 click
    expect(h.node('src').hasAttribute('disabled')).toBe(false)
    expect(h.treeEl.getAttribute('aria-disabled')).toBe('true')
    // 原生 disabled 的按钮上 click 会被激活行为短路，这里直接走处理器验守卫
    click(h.branch('src').control)
    expect(h.state()).toBe('closed')
    expect(h.value()).toEqual([])
  })

  it('只读：浮层照常展开、分支照常展开收起，但选中值改不动、也清不掉', async () => {
    const h = mount({ readOnly: true, defaultValue: 'license' })
    expect(h.trigger.hasAttribute('disabled')).toBe(false)
    expect(h.trigger.getAttribute('aria-readonly')).toBe('true')
    h.trigger.focus()
    click(h.trigger)
    await settle()
    expect(h.state()).toBe('open')
    // 焦点落在选中的 license 上，先走回首行那个分支
    press(active(), 'Home')
    expect(focusedValue()).toBe('src')

    press(active(), 'ArrowRight')
    expect(h.expanded()).toEqual(['src'])
    press(active(), 'Enter')
    expect(h.value()).toEqual(['license'])
    click(h.branch('docs').control)
    expect(h.value()).toEqual(['license'])
    expect(h.api().canClear).toBe(false)
  })
})

describe('清空按钮', () => {
  it('无选中时按不动，有选中时清空并把焦点还给 trigger', () => {
    const onValueChange = vi.fn()
    const h = mount({ defaultValue: 'license', onValueChange })
    expect(h.api().canClear).toBe(true)
    expect(h.clear.hasAttribute('disabled')).toBe(false)

    click(h.clear)
    expect(h.value()).toEqual([])
    expect(onValueChange).toHaveBeenLastCalledWith({ value: [] })
    expect(document.activeElement).toBe(h.trigger)
    // 清完就按不动了：原生 disabled 的按钮连 click 都不派发
    expect(h.api().canClear).toBe(false)
    expect(h.clear.hasAttribute('disabled')).toBe(true)
  })

  it('按下指针不把焦点从 trigger 挪走', () => {
    const h = mount({ defaultValue: 'license' })
    h.trigger.focus()
    const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 })
    h.clear.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })
})

describe('aRIA 契约', () => {
  it('trigger 是 combobox：aria-haspopup=tree、aria-controls 指向 role=tree 的那个部件', () => {
    const h = mount()
    expect(h.trigger.getAttribute('role')).toBe('combobox')
    expect(h.trigger.getAttribute('aria-haspopup')).toBe('tree')
    expect(h.trigger.getAttribute('aria-controls')).toBe(h.treeEl.id)
    expect(h.treeEl.id).not.toBe('')
    expect(h.treeEl.getAttribute('role')).toBe('tree')
    // 名字 = 标签 + 当前值：只指 label 的话读屏永远念不出用户选了什么
    expect(h.trigger.getAttribute('aria-labelledby')).toBe(`${h.root.querySelector('[data-part="label"]')!.id} ${h.valueText.id}`)
  })

  it('复选与否显式说出来，不靠省略表达', () => {
    expect(mount().treeEl.getAttribute('aria-multiselectable')).toBe('false')
    expect(mount({ multiple: true }).treeEl.getAttribute('aria-multiselectable')).toBe('true')
  })

  it('层级三件套取自 collection，不从 DOM 嵌套深度反推', () => {
    const h = mount()
    const dom = h.node('dom')
    expect(dom.getAttribute('aria-level')).toBe('3')
    expect(dom.getAttribute('aria-posinset')).toBe('1')
    expect(dom.getAttribute('aria-setsize')).toBe('2')
    expect(h.node('license').getAttribute('aria-level')).toBe('1')
    expect(h.node('license').getAttribute('aria-posinset')).toBe('3')
    // 叶子不报 aria-expanded：那是「能展开却没展开」的意思
    expect(h.node('license').hasAttribute('aria-expanded')).toBe(false)
    // children 给了空数组也算分支，它要报 aria-expanded
    expect(h.node('docs').getAttribute('aria-expanded')).toBe('false')
  })

  it('选中与未选中都显式输出 aria-selected；分支的可及名字取 collection 的 label', () => {
    const h = mount({ defaultValue: 'license' })
    expect(h.node('license').getAttribute('aria-selected')).toBe('true')
    expect(h.node('index').getAttribute('aria-selected')).toBe('false')
    expect(h.node('src').getAttribute('aria-label')).toBe('Source')
  })

  it('清空按钮与展开箭头都退出 Tab 序列，也不进可及树', () => {
    const h = mount({ defaultValue: 'license' })
    expect(h.clear.getAttribute('tabindex')).toBe('-1')
    expect(h.clear.getAttribute('aria-hidden')).toBe('true')
    expect(h.branch('src').trigger.getAttribute('tabindex')).toBe('-1')
    expect(h.branch('src').trigger.getAttribute('aria-hidden')).toBe('true')
  })
})
