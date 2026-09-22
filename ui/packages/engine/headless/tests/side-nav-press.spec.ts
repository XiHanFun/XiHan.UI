// @vitest-environment jsdom
import type { SideNavSchema } from '../src/side-nav'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectSideNav, sideNavMachine } from '../src/side-nav'

type Props = SideNavSchema['props']

/** 两条分支各带一片叶子，doc-b 禁用；guide 是顶层叶子。 */
const COLLECTION = [
  { value: 'products', label: 'Products', children: [{ value: 'product-a', label: 'Product A' }] },
  { value: 'docs', label: 'Docs', children: [{ value: 'doc-a', label: 'Doc A' }, { value: 'doc-b', label: 'Doc B', disabled: true }] },
  { value: 'guide', label: 'Guide' },
]

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/** 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，其余落属性）。 */
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

interface Harness {
  send: (event: SideNavSchema['event']) => void
  state: () => string
  link: (value: string) => HTMLElement
  trigger: (value: string) => HTMLElement
  setProps: (next: Partial<Props>) => void
  value: () => string | null
  expanded: () => string[]
}

/** 只挂两类可按入口：链接行与分支行，按压通道只落在它们身上。 */
function mount(initial: Partial<Props> = {}): Harness {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<Props>>({ collection: COLLECTION, ...initial })
  const service = createService(sideNavMachine, { props: () => props.get(), runtime })
  runtime.start()

  const root = document.createElement('nav')
  const links = new Map<string, HTMLElement>()
  const triggers = new Map<string, HTMLElement>()
  for (const node of COLLECTION) {
    if (node.children) {
      const trigger = document.createElement('button')
      root.appendChild(trigger)
      triggers.set(node.value, trigger)
      for (const child of node.children) {
        const link = document.createElement('a')
        root.appendChild(link)
        links.set(child.value, link)
      }
      continue
    }
    const link = document.createElement('a')
    root.appendChild(link)
    links.set(node.value, link)
  }
  document.body.appendChild(root)

  const render = (): void => {
    const api = connectSideNav(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    for (const [value, el] of triggers)
      spread(el, api.getBranchTriggerProps({ value }) as Record<string, unknown>)
    for (const [value, el] of links)
      spread(el, api.getLinkProps({ value }) as Record<string, unknown>)
  }
  runtime.subscribe(render)
  render()

  return {
    send: event => service.send(event),
    state: () => service.state.get(),
    link: v => links.get(v)!,
    trigger: v => triggers.get(v)!,
    setProps: (next) => {
      props.set({ ...props.get(), ...next })
      render()
    },
    value: () => service.context.get('value'),
    expanded: () => service.context.get('expandedValue'),
  }
}

function keyDown(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}
function keyUp(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }))
}
function touch(el: HTMLElement, type: 'pointerdown' | 'pointerup' | 'pointercancel'): void {
  el.dispatchEvent(new PointerEvent(type, { pointerType: 'touch', bubbles: true, cancelable: true, button: 0 }))
}
function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}
const pressed = (el: HTMLElement): boolean => el.hasAttribute('data-pressed')

/** 六件全走一遍：keydown / keyup、Enter 后失焦、触屏按下 / 取消 / 抬起、鼠标不走这一路。 */
function cycle(el: HTMLElement): void {
  expect(pressed(el)).toBe(false)
  keyDown(el, ' ')
  expect(pressed(el)).toBe(true)
  keyUp(el, ' ')
  expect(pressed(el)).toBe(false)
  keyDown(el, 'Enter')
  expect(pressed(el)).toBe(true)
  el.dispatchEvent(new FocusEvent('blur'))
  expect(pressed(el)).toBe(false)
  touch(el, 'pointerdown')
  expect(pressed(el)).toBe(true)
  touch(el, 'pointercancel')
  expect(pressed(el)).toBe(false)
  touch(el, 'pointerdown')
  expect(pressed(el)).toBe(true)
  touch(el, 'pointerup')
  expect(pressed(el)).toBe(false)
  el.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', bubbles: true, cancelable: true, button: 0 }))
  expect(pressed(el)).toBe(false)
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('按压通道：Space / Enter 与触屏按住投影 data-pressed，链接行与分支行按 value 分开记', () => {
  it('链接行：六件全程；当前页（aria-current）与按压互相独立；另一条入口的 keyup 不把它松开', () => {
    const h = mount({ defaultValue: 'guide' })
    const guide = h.link('guide')
    expect(guide.getAttribute('aria-current')).toBe('page')
    cycle(guide)
    keyDown(guide, ' ')
    expect(pressed(guide)).toBe(true)
    expect(guide.getAttribute('aria-current')).toBe('page')
    keyUp(h.link('doc-a'), ' ')
    keyUp(h.trigger('docs'), ' ')
    expect(pressed(guide)).toBe(true)
    keyUp(guide, ' ')
    expect(pressed(guide)).toBe(false)
    // 没被选中的链接同样接：按压不要求当前页
    cycle(h.link('doc-a'))
    expect(h.value()).toBe('guide')
  })

  it('分支行：六件全程，展开语义照旧由这一次按键的 click 承担；与同值的链接分开认', () => {
    const h = mount()
    const docs = h.trigger('docs')
    cycle(docs)
    keyDown(docs, 'Enter')
    expect(pressed(docs)).toBe(true)
    // 原生按钮的 Enter 在 keydown 即合成 click：展开翻转，按压面仍在
    click(docs)
    expect(h.expanded()).toEqual(['docs'])
    expect(pressed(docs)).toBe(true)
    keyUp(docs, 'Enter')
    expect(pressed(docs)).toBe(false)
  })

  it('不进：禁用入口不进；整个侧栏禁用时两类都不进', () => {
    const h = mount()
    const docB = h.link('doc-b')
    keyDown(docB, ' ')
    touch(docB, 'pointerdown')
    expect(pressed(docB)).toBe(false)
    const g = mount({ disabled: true })
    keyDown(g.link('guide'), ' ')
    touch(g.trigger('docs'), 'pointerdown')
    expect(pressed(g.link('guide'))).toBe(false)
    expect(pressed(g.trigger('docs'))).toBe(false)
  })

  it('弹出面板收起即松开：面板里按住 Enter 选中叶子后面板随之收起，不会再来 keyup，按压面由机器收', () => {
    const h = mount({ collapsed: true })
    h.send({ type: 'POPOUT.OPEN', value: 'docs', focus: 'none' })
    expect(h.state()).toBe('popout')
    const docA = h.link('doc-a')
    keyDown(docA, 'Enter')
    expect(pressed(docA)).toBe(true)
    // 命令入口的 Enter 走原生激活：click 落选中并收面板
    click(docA)
    expect(h.state()).toBe('idle')
    expect(h.value()).toBe('doc-a')
    expect(pressed(docA)).toBe(false)
  })

  it('按住途中整个侧栏转入禁用：按压面由机器自己收，不等 keyup', () => {
    const h = mount()
    const guide = h.link('guide')
    keyDown(guide, 'Enter')
    expect(pressed(guide)).toBe(true)
    h.setProps({ disabled: true })
    expect(pressed(guide)).toBe(false)
  })
})

describe('逐条语气', () => {
  it('链接行与分支入口都投影本层的 tone，且不向下传导', () => {
    const h = mount({
      collection: [
        { value: 'products', label: 'Products', children: [{ value: 'product-a', label: 'Product A' }] },
        { value: 'docs', label: 'Docs', tone: 'danger', children: [{ value: 'doc-a', label: 'Doc A' }, { value: 'doc-b', label: 'Doc B', disabled: true }] },
        { value: 'guide', label: 'Guide' },
      ],
    })
    expect(h.trigger('docs').getAttribute('data-tone')).toBe('danger')
    expect(h.trigger('products').hasAttribute('data-tone')).toBe(false)
    // 不向下传导：danger 分支下的叶子仍是中性档
    expect(h.link('doc-a').hasAttribute('data-tone')).toBe(false)
    expect(h.link('guide').hasAttribute('data-tone')).toBe(false)
  })
})
