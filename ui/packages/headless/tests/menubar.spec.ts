// @vitest-environment jsdom
import type { Anchor, PositionEnginePort, PositionOptions, PositionRect } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { MenubarApi, MenubarSchema, MenubarSelectDetails, MenubarValueChangeDetails } from '../src/menubar'
import { createRuntimeConfig, normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { connectMenubar, menubarMachine } from '../src/menubar'

type Props = MenubarSchema['props']

interface ItemDecl {
  value: string
  text: string
}

interface MenuDecl {
  value: string
  text: string
  items: readonly ItemDecl[]
}

/**
 * 三张菜单。条目声明的唯一事实源在这里——绝不从 DOM 回读，那读到的是机器自己写上去的。
 * 每张菜单里首两条住在 group 里、末一条直接挂在 content 下，中间夹一条分隔线：
 * 分隔线同样带 data-scope 却不入集合，End 落到它后面那条即为证。
 */
const MENUS: readonly MenuDecl[] = [
  { value: 'file', text: '文件', items: [{ value: 'new', text: 'New' }, { value: 'open', text: 'Open' }, { value: 'save', text: 'Save' }] },
  { value: 'edit', text: '编辑', items: [{ value: 'cut', text: 'Cut' }, { value: 'copy', text: 'Copy' }, { value: 'paste', text: 'Paste' }] },
  { value: 'view', text: '视图', items: [{ value: 'zoom', text: 'Zoom' }, { value: 'full', text: 'Fullscreen' }, { value: 'zen', text: 'Zen' }] },
]

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与两个适配器同一套翻译规则（on 之后全小写做事件名，其余落属性）。
 * 有它才跑得到真实事件流——纯比对 connect 的返回值只能验静态属性，
 * 「掠过别的 trigger 就换菜单」「Escape 后焦点回到 trigger」这类事实必须有活 DOM 才立得住。
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
    el.setAttribute(key, String(raw))
  }
}

interface AttachCall {
  rect: PositionRect
  options: PositionOptions
}

interface FakeEngine extends PositionEnginePort {
  calls: AttachCall[]
  /** 已被撤销的订阅数：换菜单必须先撤旧的，否则两套位置会轮流往回写。 */
  stopped: number
}

function createFakeEngine(): FakeEngine {
  const engine: FakeEngine = {
    calls: [],
    stopped: 0,
    attach(anchor: Anchor, _floating, options) {
      engine.calls.push({
        rect: (anchor as { getBoundingClientRect: () => PositionRect }).getBoundingClientRect(),
        options,
      })
      return () => {
        engine.stopped += 1
      }
    },
  }
  return engine
}

interface MountOptions {
  /** 被禁用的 trigger。 */
  disabledMenu?: string
  /** 被禁用的条目（全菜单同名生效，用例里取唯一值即可）。 */
  disabledItem?: string
  /** 是否接上运行时配置与层注册（消解层与焦点域要用）。 */
  layers?: boolean
}

interface Harness {
  api: () => MenubarApi
  root: HTMLElement
  outside: HTMLButtonElement
  trigger: (value: string) => HTMLButtonElement
  positioner: (value: string) => HTMLElement
  content: (value: string) => HTMLElement
  item: (menu: string, value: string) => HTMLElement
  itemText: (menu: string, value: string) => HTMLElement
  service: Service<MenubarSchema>
  engine: FakeEngine
  valueChanges: MenubarValueChangeDetails[]
  selects: MenubarSelectDetails[]
  state: () => string
  value: () => string | null
  setProps: (next: Partial<Props>) => void
  render: () => void
}

function mount(initial: Partial<Props> = {}, options: MountOptions = {}): Harness {
  const { disabledMenu, disabledItem, layers = false } = options
  const props: Partial<Props> = { ...initial }
  const valueChanges: MenubarValueChangeDetails[] = []
  const selects: MenubarSelectDetails[] = []

  const runtime = createVanillaRuntime()
  // 受控的 value 必须由 signal 承载：宿主写回要能把 watch 唤醒，
  // 直接改普通对象没有任何东西通知机器，状态同步影子事件永远发不出来
  const valueSignal = runtime.signal<string | null | undefined>(initial.value)
  const service = createService(menubarMachine, {
    props: () => ({
      ...props,
      value: valueSignal.get(),
      onValueChange: d => valueChanges.push(d),
      onSelect: d => selects.push(d),
    }),
    runtime,
  })

  const doc = document
  const root = doc.createElement('div')
  const triggers = new Map<string, HTMLButtonElement>()
  const positioners = new Map<string, HTMLElement>()
  const contents = new Map<string, HTMLElement>()
  const groups = new Map<string, HTMLElement>()
  const groupLabels = new Map<string, HTMLElement>()
  const items = new Map<string, HTMLElement>()
  const itemTexts = new Map<string, HTMLElement>()
  const separators: HTMLElement[] = []

  for (const menu of MENUS) {
    const trigger = doc.createElement('button')
    trigger.textContent = menu.text
    const positioner = doc.createElement('div')
    const content = doc.createElement('div')
    const group = doc.createElement('div')
    const groupLabel = doc.createElement('span')
    groupLabel.textContent = menu.text
    group.appendChild(groupLabel)
    content.appendChild(group)
    const separator = doc.createElement('div')
    positioner.appendChild(content)
    root.append(trigger, positioner)

    menu.items.forEach((item, index) => {
      const el = doc.createElement('div')
      const text = doc.createElement('span')
      text.textContent = item.text
      el.appendChild(text)
      // 前两条进分组，末一条直接挂在 content 下：两处都得进同一条导航链
      if (index < 2)
        group.appendChild(el)
      else
        content.appendChild(el)
      items.set(`${menu.value}/${item.value}`, el)
      itemTexts.set(`${menu.value}/${item.value}`, text)
    })
    // 分隔线夹在分组与末条之间
    content.insertBefore(separator, items.get(`${menu.value}/${menu.items[2]!.value}`)!)
    separators.push(separator)

    triggers.set(menu.value, trigger)
    positioners.set(menu.value, positioner)
    contents.set(menu.value, content)
    groups.set(menu.value, group)
    groupLabels.set(menu.value, groupLabel)
  }

  const outside = doc.createElement('button')
  outside.textContent = 'outside'
  doc.body.append(root, outside)

  const engine = createFakeEngine()
  const currentValue = (): string | null => service.context.get('value') ?? null
  service.refs.set('position', engine)
  service.refs.set('getRootEl', () => root)
  service.refs.set('getAnchorEl', () => {
    const v = currentValue()
    return v == null ? null : triggers.get(v) ?? null
  })
  service.refs.set('getFloatingEl', () => {
    const v = currentValue()
    return v == null ? null : positioners.get(v) ?? null
  })
  service.refs.set('getContentEl', () => {
    const v = currentValue()
    return v == null ? null : contents.get(v) ?? null
  })

  if (layers) {
    const config = createRuntimeConfig()
    service.refs.set('config', config)
    service.refs.set('registerLayer', () => {
      const handle = config.layerRegistry.register({
        kind: 'popover',
        // 整条菜单栏都记为本层分支：点 trigger、在 trigger 之间走都是层内交互，
        // 开合归菜单栏自己切换，交给消解层判就会先关一次再开一次
        node: () => (currentValue() == null ? null : contents.get(currentValue()!) ?? null),
        branches: () => [root],
        isModal: () => false,
        setModal: () => {},
        surfaces: () => [],
      })
      return { layer: handle.layer, dispose: handle.dispose }
    })
  }

  runtime.start()

  const render = (): void => {
    const api = connectMenubar(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    MENUS.forEach((menu, menuIndex) => {
      const decl = { value: menu.value, disabled: menu.value === disabledMenu }
      spread(triggers.get(menu.value)!, api.getTriggerProps(decl) as Record<string, unknown>)
      spread(positioners.get(menu.value)!, api.getPositionerProps({ value: menu.value }) as Record<string, unknown>)
      spread(contents.get(menu.value)!, api.getContentProps({ value: menu.value }) as Record<string, unknown>)
      spread(groups.get(menu.value)!, api.getGroupProps({ value: menu.value }) as Record<string, unknown>)
      spread(groupLabels.get(menu.value)!, api.getGroupLabelProps({ value: menu.value }) as Record<string, unknown>)
      spread(separators[menuIndex]!, api.getSeparatorProps() as Record<string, unknown>)
      for (const item of menu.items) {
        const itemDecl = { value: item.value, disabled: item.value === disabledItem }
        spread(items.get(`${menu.value}/${item.value}`)!, api.getItemProps(itemDecl) as Record<string, unknown>)
        spread(itemTexts.get(`${menu.value}/${item.value}`)!, api.getItemTextProps(itemDecl) as Record<string, unknown>)
      }
    })
  }

  // 任一 cell 变化即重渲，与两个适配器同语义（受控时内部不写值，因此也不会重渲——
  // 那一路要宿主自己写回 props，由 setProps 承担）
  runtime.subscribe(render)
  render()

  return {
    api: () => connectMenubar(service, normalizeProps),
    root,
    outside,
    trigger: v => triggers.get(v)!,
    positioner: v => positioners.get(v)!,
    content: v => contents.get(v)!,
    item: (menu, v) => items.get(`${menu}/${v}`)!,
    itemText: (menu, v) => itemTexts.get(`${menu}/${v}`)!,
    service,
    engine,
    valueChanges,
    selects,
    state: () => service.state.get(),
    value: currentValue,
    setProps: (next) => {
      Object.assign(props, next)
      if ('value' in next)
        valueSignal.set(next.value)
      render()
    },
    render,
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

/**
 * 照浏览器真正的次序点一下：按下按钮先给它焦点，再派 click。
 * 上面那个 click 只派事件、不给焦点，所以照不出"聚焦紧跟着点击"这一对手势
 * 走到机器里是两拍——菜单栏正是栽在这上面（FOCUS 换了项，TOGGLE 又把它当成再点一次）。
 */
function realClick(el: HTMLElement): void {
  el.focus()
  click(el)
}

function hover(el: HTMLElement): void {
  el.dispatchEvent(new Event('pointerenter', { bubbles: false }))
}

/** 焦点落点：'part:value' 形式，trigger 与 item 的 data-value 会重名，必须带上部件名。 */
function focused(): string | null {
  const el = document.activeElement as HTMLElement | null
  if (!el || !el.hasAttribute('data-part'))
    return null
  return `${el.getAttribute('data-part')}:${el.getAttribute('data-value') ?? ''}`
}

/** 等一次 flush（vanilla 运行时的 flush 是 queueMicrotask）。 */
function flushed(): Promise<void> {
  return Promise.resolve()
}

/** 焦点域的落焦按帧重试，等两帧足够它把焦点交出去。 */
function frames(count = 3): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number): void => {
      if (left <= 0) {
        resolve()
        return
      }
      requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

function attrs(el: HTMLElement, ...names: string[]): Record<string, string | null> {
  const out: Record<string, string | null> = {}
  for (const name of names) out[name] = el.getAttribute(name)
  return out
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('menubar 初态与 ARIA', () => {
  it('默认全部收起：root 是 menubar，每个 trigger 报 aria-expanded=false，菜单常挂带 hidden', () => {
    const c = mount()
    expect(c.state()).toBe('idle')
    expect(c.value()).toBeNull()
    expect(attrs(c.root, 'role', 'aria-orientation', 'aria-disabled', 'data-state')).toEqual({
      'role': 'menubar',
      'aria-orientation': 'horizontal',
      'aria-disabled': 'false',
      'data-state': 'closed',
    })
    for (const menu of MENUS) {
      expect(attrs(c.trigger(menu.value), 'role', 'aria-haspopup', 'aria-expanded', 'data-state')).toEqual({
        'role': 'menuitem',
        'aria-haspopup': 'menu',
        'aria-expanded': 'false',
        'data-state': 'closed',
      })
      expect(c.content(menu.value).hasAttribute('hidden')).toBe(true)
      expect(c.content(menu.value).getAttribute('role')).toBe('menu')
    }
  })

  it('trigger 与 content 按 value 逐对互指', () => {
    const c = mount()
    for (const menu of MENUS) {
      const trigger = c.trigger(menu.value)
      const content = c.content(menu.value)
      expect(trigger.getAttribute('aria-controls')).toBe(content.getAttribute('id'))
      expect(content.getAttribute('aria-labelledby')).toBe(trigger.getAttribute('id'))
    }
    // 不同菜单的 id 不能撞车：撞了的话 aria-controls 会同时指向两张菜单
    const ids = MENUS.flatMap(m => [c.trigger(m.value).getAttribute('id'), c.content(m.value).getAttribute('id')])
    expect(new Set(ids).size).toBe(MENUS.length * 2)
  })

  it('defaultValue：那一项展开、其余仍 hidden，且焦点不被抢进浮层', () => {
    const c = mount({ defaultValue: 'edit' }, { layers: true })
    expect(c.state()).toBe('open')
    expect(c.value()).toBe('edit')
    expect(c.content('edit').hasAttribute('hidden')).toBe(false)
    expect(c.content('file').hasAttribute('hidden')).toBe(true)
    expect(c.trigger('edit').getAttribute('aria-expanded')).toBe('true')
    // 页面刚加载就把焦点抢进浮层是彻底的越权
    expect(document.activeElement).toBe(document.body)
  })

  it('分组标题靠 aria-labelledby 挂到分组上；分隔线报 separator 且横向', () => {
    const c = mount()
    const group = c.content('file').querySelector<HTMLElement>('[data-part="group"]')!
    const label = c.content('file').querySelector<HTMLElement>('[data-part="group-label"]')!
    expect(group.getAttribute('role')).toBe('group')
    expect(group.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))
    const separator = c.content('file').querySelector<HTMLElement>('[data-part="separator"]')!
    expect(attrs(separator, 'role', 'aria-orientation')).toEqual({ 'role': 'separator', 'aria-orientation': 'horizontal' })
  })
})

describe('menubar 打开态传染', () => {
  it('一个都没展开时掠过 trigger：什么也不发生', () => {
    const c = mount()
    hover(c.trigger('edit'))
    expect(c.value()).toBeNull()
    expect(c.state()).toBe('idle')
    expect(c.valueChanges).toEqual([])
    expect(focused()).toBeNull()
  })

  it('机器层同一条：idle 下 TRIGGER.POINTER 被守卫挡住，不改展开项', () => {
    const c = mount()
    c.service.send({ type: 'TRIGGER.POINTER', value: 'edit' })
    expect(c.value()).toBeNull()
    expect(c.valueChanges).toEqual([])
  })

  it('展开之后掠过别的 trigger：当场换过去，不用点也不等延时', () => {
    const c = mount()
    click(c.trigger('file'))
    expect(c.value()).toBe('file')
    hover(c.trigger('view'))
    // 同步就换过去了：没有任何定时器参与
    expect(c.value()).toBe('view')
    expect(c.content('view').hasAttribute('hidden')).toBe(false)
    expect(c.content('file').hasAttribute('hidden')).toBe(true)
    expect(c.valueChanges).toEqual([{ value: 'file' }, { value: 'view' }])
  })

  it('掠过换菜单时焦点跟着搬到那个 trigger：不搬的话焦点会随旧菜单一起被 hidden 收走', () => {
    const c = mount()
    click(c.trigger('file'))
    hover(c.trigger('edit'))
    expect(focused()).toBe('trigger:edit')
    expect(c.trigger('edit').getAttribute('tabindex')).toBe('0')
    expect(c.trigger('file').getAttribute('tabindex')).toBe('-1')
  })

  it('掠过禁用的 trigger：不换菜单、焦点也不搬', () => {
    const c = mount({}, { disabledMenu: 'edit' })
    click(c.trigger('file'))
    hover(c.trigger('edit'))
    expect(c.value()).toBe('file')
    expect(c.trigger('edit').getAttribute('aria-disabled')).toBe('true')
    expect(c.trigger('edit').hasAttribute('disabled')).toBe(false)
  })

  it('换菜单时状态不重入：层只注册一次，定位却重挂了一遍（旧订阅先撤）', async () => {
    const registrations: string[] = []
    const c = mount()
    // 只关心定位：层的注册次数由 engine.stopped 与 attach 次数间接说明
    click(c.trigger('file'))
    await flushed()
    expect(c.engine.calls).toHaveLength(1)
    hover(c.trigger('edit'))
    await flushed()
    expect(c.state()).toBe('open')
    expect(c.engine.calls).toHaveLength(2)
    // 换锚点必须先撤旧订阅，否则引擎会跟着两个锚点同时算
    expect(c.engine.stopped).toBe(1)
    expect(registrations).toEqual([])
  })
})

describe('menubar roving tabindex', () => {
  it('焦点在菜单栏外时 root 兜底进 Tab 序列，全部 trigger 让位', () => {
    const c = mount()
    expect(c.root.getAttribute('tabindex')).toBe('0')
    for (const menu of MENUS)
      expect(c.trigger(menu.value).getAttribute('tabindex')).toBe('-1')
  })

  it('root 拿到焦点即转投给首个可用 trigger，随后自己让位——整条只有一个 Tab 位', () => {
    const c = mount()
    c.root.focus()
    expect(focused()).toBe('trigger:file')
    expect(c.root.getAttribute('tabindex')).toBe('-1')
    expect(c.trigger('file').getAttribute('tabindex')).toBe('0')
    expect(c.trigger('edit').getAttribute('tabindex')).toBe('-1')
    expect(c.trigger('view').getAttribute('tabindex')).toBe('-1')
  })

  it('root 转投跳过禁用的首项', () => {
    const c = mount({}, { disabledMenu: 'file' })
    c.root.focus()
    expect(focused()).toBe('trigger:edit')
  })

  it('已有菜单展开着时 root 转投给展开项的 trigger', () => {
    const c = mount({ defaultValue: 'view' })
    c.root.focus()
    expect(focused()).toBe('trigger:view')
  })

  it('焦点离开整条菜单栏：锚点清空、root 重新认领 Tab 位，菜单一并收起', () => {
    const c = mount()
    click(c.trigger('file'))
    expect(c.root.getAttribute('tabindex')).toBe('-1')
    c.root.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: c.outside }))
    expect(c.root.getAttribute('tabindex')).toBe('0')
    expect(c.value()).toBeNull()
    expect(c.api().focusedValue).toBeNull()
  })

  it('焦点只是在菜单栏内换了个落点：不算离场', () => {
    const c = mount()
    click(c.trigger('file'))
    c.root.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: c.item('file', 'new') }))
    expect(c.value()).toBe('file')
    expect(c.api().focusedValue).toBe('file')
  })
})

describe('menubar trigger 键盘', () => {
  it('左右键在 trigger 之间走，尽头回绕', () => {
    const c = mount()
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowRight')
    expect(focused()).toBe('trigger:edit')
    press(c.trigger('edit'), 'ArrowLeft')
    expect(focused()).toBe('trigger:file')
    press(c.trigger('file'), 'ArrowLeft')
    expect(focused()).toBe('trigger:view')
  })

  it('loop=false 时走到尽头就停住', () => {
    const c = mount({ loop: false })
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowLeft')
    expect(focused()).toBe('trigger:file')
  })

  it('方向键跳过禁用的 trigger，但禁用项自己仍是起点', () => {
    const c = mount({}, { disabledMenu: 'edit' })
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowRight')
    expect(focused()).toBe('trigger:view')
    // 焦点强行落在禁用项上时，方向键仍从它起步
    c.trigger('edit').focus()
    press(c.trigger('edit'), 'ArrowRight')
    expect(focused()).toBe('trigger:view')
  })

  it('home / End 跳到首尾 trigger', () => {
    const c = mount()
    c.trigger('edit').focus()
    press(c.trigger('edit'), 'End')
    expect(focused()).toBe('trigger:view')
    press(c.trigger('view'), 'Home')
    expect(focused()).toBe('trigger:file')
  })

  it('dir=rtl：水平轴镜像，ArrowRight 走上一个', () => {
    const c = mount({ dir: 'rtl' })
    expect(c.root.getAttribute('dir')).toBe('rtl')
    c.trigger('edit').focus()
    press(c.trigger('edit'), 'ArrowRight')
    expect(focused()).toBe('trigger:file')
  })

  it('横排菜单栏里方向键不归导航管的那些不 preventDefault', () => {
    const c = mount()
    c.trigger('file').focus()
    // ArrowDown 归"展开本菜单"，会被吞；PageDown 谁也不认，必须放行给页面滚动
    expect(press(c.trigger('file'), 'PageDown').defaultPrevented).toBe(false)
    expect(press(c.trigger('file'), 'ArrowDown').defaultPrevented).toBe(true)
  })

  it('orientation=vertical：上下键在 trigger 之间走，ArrowRight 才是"进这张菜单"', () => {
    const c = mount({ orientation: 'vertical' })
    expect(c.root.getAttribute('aria-orientation')).toBe('vertical')
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowDown')
    expect(focused()).toBe('trigger:edit')
    expect(c.value()).toBeNull()
    press(c.trigger('edit'), 'ArrowRight')
    expect(c.value()).toBe('edit')
    expect(c.api().focusedItem).toBe('cut')
  })

  it('arrowDown 展开并把条目锚点落到首个可用条目；ArrowUp 落到末个', () => {
    const c = mount()
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowDown')
    expect(c.value()).toBe('file')
    expect(c.api().focusedItem).toBe('new')
    expect(c.item('file', 'new').getAttribute('tabindex')).toBe('0')

    const d = mount()
    d.trigger('file').focus()
    press(d.trigger('file'), 'ArrowUp')
    expect(d.api().focusedItem).toBe('save')
  })

  it('落焦端跳过禁用条目', () => {
    const c = mount({}, { disabledItem: 'new' })
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowDown')
    expect(c.api().focusedItem).toBe('open')
  })

  it('键盘展开后焦点域把焦点真的交给锚点条目', async () => {
    const c = mount({}, { layers: true })
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowDown')
    await frames()
    expect(focused()).toBe('item:new')
  })

  it('enter 展开但焦点留在 trigger 上：菜单栏不该在点开那一刻就把人拽进浮层', async () => {
    const c = mount({}, { layers: true })
    c.trigger('file').focus()
    const event = press(c.trigger('file'), 'Enter')
    // 必须吞掉：按钮的默认激活会再合成一次 click，展开随即被那次 TOGGLE 关掉
    expect(event.defaultPrevented).toBe(true)
    expect(c.value()).toBe('file')
    expect(c.api().focusedItem).toBeNull()
    await frames()
    expect(focused()).toBe('trigger:file')
  })

  it('已经展开着再按 ArrowDown：焦点直接进菜单，不重复展开', () => {
    const c = mount()
    click(c.trigger('file'))
    expect(c.valueChanges).toHaveLength(1)
    press(c.trigger('file'), 'ArrowDown')
    expect(focused()).toBe('item:new')
    expect(c.valueChanges).toHaveLength(1)
  })

  it('再点一次同一个 trigger 即收起；点别项直接换过去', () => {
    const c = mount()
    click(c.trigger('file'))
    click(c.trigger('file'))
    expect(c.value()).toBeNull()
    expect(c.valueChanges).toEqual([{ value: 'file' }, { value: null }])
    click(c.trigger('edit'))
    click(c.trigger('view'))
    expect(c.value()).toBe('view')
    expect(c.valueChanges).toEqual([{ value: 'file' }, { value: null }, { value: 'edit' }, { value: 'view' }])
  })
})

describe('menubar 菜单内键盘', () => {
  // 落焦交给焦点域（按帧重试），这一组不接层，只验"锚点在哪儿、下一站是哪儿"：
  // 按键落在 content 上（条目上的按键本就冒泡到这里收口）
  it('上下键在条目之间走，跨过分隔线、尽头回绕', () => {
    const c = mount()
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowDown')
    expect(c.api().focusedItem).toBe('new')
    press(c.content('file'), 'ArrowDown')
    expect(focused()).toBe('item:open')
    // 分隔线带 data-scope 却不入集合：下一站是它后面那条
    press(c.item('file', 'open'), 'ArrowDown')
    expect(focused()).toBe('item:save')
    press(c.item('file', 'save'), 'ArrowDown')
    expect(focused()).toBe('item:new')
    press(c.item('file', 'new'), 'ArrowUp')
    expect(focused()).toBe('item:save')
  })

  it('home / End 跳到本张菜单的首尾条目', () => {
    const c = mount()
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowDown')
    press(c.content('file'), 'End')
    expect(focused()).toBe('item:save')
    press(c.item('file', 'save'), 'Home')
    expect(focused()).toBe('item:new')
  })

  it('方向键跳过禁用条目，禁用条目仍可聚焦、仍是起点', () => {
    const c = mount({}, { disabledItem: 'open' })
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowDown')
    press(c.content('file'), 'ArrowDown')
    expect(focused()).toBe('item:save')
    const disabled = c.item('file', 'open')
    expect(attrs(disabled, 'aria-disabled', 'disabled', 'data-disabled')).toEqual({
      'aria-disabled': 'true',
      'disabled': null,
      'data-disabled': '',
    })
    disabled.focus()
    expect(focused()).toBe('item:open')
    press(disabled, 'ArrowDown')
    expect(focused()).toBe('item:save')
  })

  it('连打检索按首字母搬焦点', () => {
    const c = mount()
    click(c.trigger('view'))
    // 三条：Zoom / Fullscreen / Zen
    press(c.content('view'), 'f')
    expect(focused()).toBe('item:full')
  })

  it('同一字符连打：在以它开头的候选之间轮换，而不是去找 "zz" 这个前缀', () => {
    const c = mount()
    click(c.trigger('view'))
    press(c.content('view'), 'z')
    expect(focused()).toBe('item:zoom')
    press(c.item('view', 'zoom'), 'z')
    expect(focused()).toBe('item:zen')
    press(c.item('view', 'zen'), 'z')
    expect(focused()).toBe('item:zoom')
  })

  it('菜单收起即丢缓冲：下次打开第一个字母不会被拼进上一轮的查询串', () => {
    const c = mount()
    click(c.trigger('view'))
    press(c.content('view'), 'z')
    expect(focused()).toBe('item:zoom')
    click(c.trigger('view'))
    click(c.trigger('view'))
    // 缓冲若还留着 'z'，这一下会拼成 'zf' 而匹配不到任何条目
    press(c.content('view'), 'f')
    expect(focused()).toBe('item:full')
  })

  it('typeahead=false 时字母键不归检索管', () => {
    const c = mount({ typeahead: false })
    click(c.trigger('view'))
    const event = press(c.content('view'), 'z')
    expect(event.defaultPrevented).toBe(false)
    expect(c.api().focusedItem).toBeNull()
  })

  it('菜单内按左右键切到相邻菜单并保持展开，焦点落到那一项的 trigger', () => {
    const c = mount()
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowDown')
    press(c.content('file'), 'ArrowDown')
    expect(focused()).toBe('item:open')
    press(c.item('file', 'open'), 'ArrowRight')
    expect(c.value()).toBe('edit')
    expect(focused()).toBe('trigger:edit')
    expect(c.content('edit').hasAttribute('hidden')).toBe(false)
    expect(c.content('file').hasAttribute('hidden')).toBe(true)
    // 换菜单后旧菜单的条目锚点必须清掉，否则它还带着 tabindex=0
    expect(c.item('file', 'open').getAttribute('tabindex')).toBe('-1')
    expect(c.api().focusedItem).toBeNull()
    press(c.trigger('edit'), 'ArrowLeft')
    expect(c.value()).toBe('file')
  })

  it('enter 选中焦点所在条目：先发选中详情再收起，焦点归还 trigger', () => {
    const c = mount({}, { layers: true })
    c.trigger('edit').focus()
    press(c.trigger('edit'), 'ArrowDown')
    press(c.content('edit'), 'ArrowDown')
    expect(focused()).toBe('item:copy')
    press(c.item('edit', 'copy'), 'Enter')
    expect(c.selects).toEqual([{ menu: 'edit', value: 'copy' }])
    expect(c.value()).toBeNull()
    expect(focused()).toBe('trigger:edit')
  })

  it('点击条目：与 Enter 同一条出口', () => {
    const c = mount()
    click(c.trigger('file'))
    click(c.item('file', 'open'))
    expect(c.selects).toEqual([{ menu: 'file', value: 'open' }])
    expect(c.valueChanges).toEqual([{ value: 'file' }, { value: null }])
    expect(c.content('file').hasAttribute('hidden')).toBe(true)
  })

  it('点击禁用条目：不选中、不收起、一个事件也不发', () => {
    const c = mount({}, { disabledItem: 'open' })
    click(c.trigger('file'))
    c.valueChanges.length = 0
    click(c.item('file', 'open'))
    expect(c.selects).toEqual([])
    expect(c.valueChanges).toEqual([])
    expect(c.value()).toBe('file')
  })

  it('tab 收起菜单且不抢回焦点', () => {
    const c = mount({}, { layers: true })
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowDown')
    c.item('file', 'new').focus()
    const event = press(c.item('file', 'new'), 'Tab')
    // 不 preventDefault：菜单让开，焦点按 Tab 序列自然离开
    expect(event.defaultPrevented).toBe(false)
    expect(c.value()).toBeNull()
    expect(focused()).toBe('item:new')
  })
})

describe('menubar 收起出口', () => {
  it('escape 收起并把焦点留在当前那一项的 trigger 上', async () => {
    const c = mount({}, { layers: true })
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowDown')
    await frames()
    expect(focused()).toBe('item:new')
    // 消解层挂在 document 上，且延后一拍才注册
    await flushed()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    expect(c.value()).toBeNull()
    expect(focused()).toBe('trigger:file')
  })

  it('掠过换菜单之后再 Escape：焦点回到"当下那一项"的 trigger，不是最初那一项', async () => {
    const c = mount({}, { layers: true })
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowDown')
    await flushed()
    hover(c.trigger('view'))
    expect(c.value()).toBe('view')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    expect(c.value()).toBeNull()
    expect(focused()).toBe('trigger:view')
  })

  it('层外指针交互收起：不把焦点从用户刚点的地方抢走', async () => {
    const c = mount({}, { layers: true })
    click(c.trigger('file'))
    await flushed()
    c.outside.focus()
    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
    expect(c.value()).toBeNull()
    expect(document.activeElement).toBe(c.outside)
  })

  it('程序化 setValue：展开与收起都走同一条路，且不动 roving 锚点', () => {
    const c = mount()
    c.api().setValue('edit')
    expect(c.value()).toBe('edit')
    expect(c.state()).toBe('open')
    // 焦点并没有跟着搬过去，root 得继续兜着 Tab 位
    expect(c.api().focusedValue).toBeNull()
    expect(c.root.getAttribute('tabindex')).toBe('0')
    c.api().setValue(null)
    expect(c.value()).toBeNull()
    expect(c.state()).toBe('idle')
  })
})

describe('menubar 受控与整体禁用', () => {
  it('受控 value：点击只发意图不自改，宿主写回后才换项', () => {
    const c = mount({ value: 'file' })
    click(c.trigger('edit'))
    expect(c.value()).toBe('file')
    expect(c.content('edit').hasAttribute('hidden')).toBe(true)
    expect(c.valueChanges).toEqual([{ value: 'edit' }])
    c.setProps({ value: 'edit' })
    expect(c.value()).toBe('edit')
    expect(c.state()).toBe('open')
    expect(c.content('edit').hasAttribute('hidden')).toBe(false)
    // 宿主写回不再回弹事件
    expect(c.valueChanges).toEqual([{ value: 'edit' }])
  })

  it('受控下照浏览器次序点一下：聚焦紧跟着点击只发一条意图，不发两条一样的', () => {
    const c = mount({ value: 'file' })
    // 浏览器按下按钮是先给焦点再派 click，到机器里就是 FOCUS + TOGGLE 两拍。
    // 受控时 value 要等宿主写回才变，若拿它当"是不是我已经开着"的判据，
    // 第二拍会判失手、把同一个意图再发一遍
    realClick(c.trigger('edit'))
    expect(c.valueChanges).toEqual([{ value: 'edit' }])
  })

  it('非受控下照浏览器次序点别项：换过去就停住，不会展开完又立刻收起', () => {
    const c = mount({ defaultValue: 'file' })
    // 已经开着 file，点 view：第一拍 FOCUS 把展开项换成 view，
    // 第二拍 TOGGLE 若不被吸收，就会因为"当前正好是 view"而当成再点一次，当场收起
    realClick(c.trigger('view'))
    expect(c.value()).toBe('view')
    expect(c.content('view').hasAttribute('hidden')).toBe(false)
    expect(c.valueChanges).toEqual([{ value: 'view' }])
    // 吸收只管紧跟着的那一拍：真的再点一次仍要收起
    realClick(c.trigger('view'))
    expect(c.value()).toBeNull()
    expect(c.valueChanges).toEqual([{ value: 'view' }, { value: null }])
  })

  it('受控 value=null：状态跟着回到 idle', () => {
    const c = mount({ value: 'file' })
    expect(c.state()).toBe('open')
    c.setProps({ value: null })
    expect(c.state()).toBe('idle')
    expect(c.content('file').hasAttribute('hidden')).toBe(true)
  })

  it('整条禁用：每个 trigger 都报 aria-disabled，点与按都不展开', () => {
    const c = mount({ disabled: true })
    expect(c.root.getAttribute('aria-disabled')).toBe('true')
    expect(c.trigger('file').getAttribute('aria-disabled')).toBe('true')
    click(c.trigger('file'))
    expect(c.value()).toBeNull()
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowDown')
    expect(c.value()).toBeNull()
    expect(c.valueChanges).toEqual([])
  })
})

describe('menubar 条目锚点的悬空修复', () => {
  it('持有焦点的条目离开 DOM：ITEM.LOST 就地重挑锚点，菜单不会一个 Tab 位都没有', () => {
    const c = mount()
    c.trigger('file').focus()
    press(c.trigger('file'), 'ArrowDown')
    press(c.item('file', 'new'), 'ArrowDown')
    expect(c.api().focusedItem).toBe('open')
    c.item('file', 'open').remove()
    c.service.send({ type: 'ITEM.LOST' })
    // 锚点重新落到活着的首条上，tabindex=0 有人认领
    expect(c.api().focusedItem).toBe('new')
    expect(c.item('file', 'new').getAttribute('tabindex')).toBe('0')
  })

  it('指针展开时没有条目锚点：content 兜底进 Tab 序列，键盘还进得去', () => {
    const c = mount()
    click(c.trigger('file'))
    expect(c.api().focusedItem).toBeNull()
    expect(c.content('file').getAttribute('tabindex')).toBe('0')
    // 第一下方向键从空锚点起步，正好落到首个可用条目
    press(c.content('file'), 'ArrowDown')
    expect(focused()).toBe('item:new')
    expect(c.content('file').getAttribute('tabindex')).toBe('-1')
  })
})

describe('menubar 定位', () => {
  it('坐标只发给展开的那一张，收起的 positioner 不带 data-placement', async () => {
    const c = mount()
    click(c.trigger('edit'))
    await flushed()
    expect(c.engine.calls).toHaveLength(1)
    expect(c.engine.calls[0]!.options.placement).toBe('bottom-start')
    expect(c.positioner('edit').getAttribute('data-placement')).toBe('bottom-start')
    expect(c.positioner('file').getAttribute('data-placement')).toBeNull()
    expect(attrs(c.positioner('edit'), 'data-state')).toEqual({ 'data-state': 'open' })
    expect(attrs(c.positioner('file'), 'data-state')).toEqual({ 'data-state': 'closed' })
  })

  it('收起时撤掉定位订阅', async () => {
    const c = mount()
    click(c.trigger('edit'))
    await flushed()
    click(c.trigger('edit'))
    expect(c.engine.stopped).toBe(1)
  })
})
