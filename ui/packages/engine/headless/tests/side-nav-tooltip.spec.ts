// @vitest-environment jsdom
// 图标栏里的名称提示：一台内嵌的 Tooltip 机器按受控跑，悬停延时、接替窗口与提示组全随 Tooltip；
// 侧栏只记对着哪一行、开没开，只在落成图标栏时、只对只剩图标的行开。
import type { SideNavNode, SideNavSchema } from '../src/side-nav'
import type { TooltipSchema } from '../src/tooltip'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connectSideNav, sideNavMachine, sideNavTooltipProps } from '../src/side-nav'
import { tooltipMachine } from '../src/tooltip'

type Props = SideNavSchema['props']
type Attrs = Record<string, unknown>
type Handlers = Record<string, (event?: unknown) => void>

/** Tooltip 的内建缺省：悬停进入到展开 700ms、移出到收起 300ms、接替窗口 300ms。 */
const OPEN_DELAY = 700
const CLOSE_DELAY = 300

const COLLECTION: SideNavNode[] = [
  { value: 'home', label: '工作台', href: '#home' },
  { value: 'logs', label: '操作日志', href: '#logs' },
  { value: 'user', label: '用户管理', children: [{ value: 'user-list', label: '用户列表', href: '#user-list' }] },
]

let stops: Array<() => void> = []

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  stops.forEach(stop => stop())
  stops = []
  vi.useRealTimers()
})

function mount(initial: Partial<Props> = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<Props>>({ collection: COLLECTION, collapsed: true, ...initial })
  const nav = createService(sideNavMachine, { props: () => props.get(), runtime })
  const hint = createService<TooltipSchema>(tooltipMachine, { props: () => sideNavTooltipProps(nav), runtime })
  runtime.start()
  stops.push(() => runtime.stop())
  const api = () => connectSideNav(nav, normalizeProps, hint)
  const link = (value: string) => api().getLinkProps({ value }) as unknown as Handlers
  const trigger = (value: string) => api().getBranchTriggerProps({ value }) as unknown as Handlers
  return {
    api,
    hint,
    link,
    trigger,
    open: () => hint.state.matches('visible'),
    content: () => api().getTooltipContentProps() as Attrs,
    setProps: (next: Partial<Props>) => props.set({ ...props.get(), ...next }),
  }
}

/** 让宿主提交与「等过渡播完」的那一轮跑完：jsdom 里没有过渡，即刻落定。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++)
    await vi.advanceTimersByTimeAsync(0)
}

describe('side-nav 图标栏名称提示', () => {
  it('指针停在只剩图标的叶子上：等够 Tooltip 的开延时才显示，文字是这一行的标签', () => {
    const nav = mount()
    nav.link('home').onPointerenter!()
    vi.advanceTimersByTime(OPEN_DELAY - 1)
    expect(nav.open()).toBe(false)
    vi.advanceTimersByTime(1)
    expect(nav.open()).toBe(true)
    expect(nav.api().tooltipText).toBe('工作台')
    expect(nav.content()['data-state']).toBe('open')
    expect(nav.content().hidden).toBeUndefined()
  })

  it('提示对读屏隐藏，不当 role=tooltip；链接也不经 aria-describedby 再念一遍', () => {
    const nav = mount()
    nav.link('home').onFocus!()
    expect(nav.content()['aria-hidden']).toBe(true)
    expect(nav.content().role).toBeUndefined()
    expect(nav.link('home')['aria-describedby']).toBeUndefined()
  })

  it('聚焦立即显示、不走延时；失焦即收', () => {
    const nav = mount()
    nav.link('logs').onFocus!()
    expect(nav.open()).toBe(true)
    expect(nav.api().tooltipText).toBe('操作日志')
    nav.link('logs').onBlur!()
    expect(nav.open()).toBe(false)
  })

  it('移出即进收起等待；等待里停到下一片叶子上，提示不收、原地改对着新的一行', () => {
    const nav = mount()
    nav.link('home').onPointerenter!()
    vi.advanceTimersByTime(OPEN_DELAY)
    nav.link('home').onPointerleave!()
    vi.advanceTimersByTime(CLOSE_DELAY - 1)
    nav.link('logs').onPointerenter!()
    vi.advanceTimersByTime(CLOSE_DELAY)
    expect(nav.open()).toBe(true)
    expect(nav.api().tooltipText).toBe('操作日志')
  })

  it('刚收起不到接替窗口：停到另一片叶子上直接显示、不播进场', () => {
    const nav = mount()
    nav.link('home').onFocus!()
    nav.link('home').onBlur!()
    nav.link('logs').onPointerenter!()
    vi.advanceTimersByTime(0)
    expect(nav.open()).toBe(true)
    expect(nav.content()['data-instant']).toBe('')
  })

  it('按下即收，让位给真正的操作', () => {
    const nav = mount()
    nav.link('home').onFocus!()
    nav.link('home').onPointerDown!({ pointerType: 'mouse', button: 0 })
    expect(nav.open()).toBe(false)
  })

  it('还在等开延时时按 Escape：撤销等待，不显示', () => {
    const nav = mount()
    nav.link('home').onPointerenter!()
    // 按键派到一个真实节点上：导航那一段要从 currentTarget 往上找侧栏根
    const row = document.createElement('a')
    row.addEventListener('keydown', nav.link('home').onKeydown! as EventListener)
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    vi.advanceTimersByTime(OPEN_DELAY * 2)
    expect(nav.open()).toBe(false)
  })

  it('弹出分支的触发按钮不显示提示：它的面板自己就是去处', () => {
    const nav = mount()
    nav.trigger('user').onFocus!()
    expect(nav.open()).toBe(false)
  })

  it('collapsedPopout 关掉的纯图标栏里，分支行同样只剩图标，显示提示', () => {
    const nav = mount({ collapsedPopout: false })
    nav.trigger('user').onFocus!()
    expect(nav.open()).toBe(true)
    expect(nav.api().tooltipText).toBe('用户管理')
  })

  it('平铺时行文字都在，不显示提示', () => {
    const nav = mount({ collapsed: false })
    nav.link('home').onFocus!()
    nav.link('home').onPointerenter!()
    vi.advanceTimersByTime(OPEN_DELAY * 2)
    expect(nav.open()).toBe(false)
  })

  it('折叠开关翻回平铺：开着的提示随之收起；再折回来不因旧账自己露面', async () => {
    const nav = mount()
    nav.link('home').onFocus!()
    expect(nav.open()).toBe(true)
    nav.setProps({ collapsed: false })
    await settle()
    expect(nav.open()).toBe(false)
    nav.setProps({ collapsed: true })
    await settle()
    expect(nav.open()).toBe(false)
  })

  it('贴在行尾一侧：ltr 在右、rtl 在左；尺寸随侧栏', () => {
    const ltr = mount({ size: 'sm' })
    const rtl = mount({ dir: 'rtl' })
    expect(ltr.hint.prop('placement')).toBe('right')
    expect(ltr.hint.prop('size')).toBe('sm')
    expect(rtl.hint.prop('placement')).toBe('left')
    expect(rtl.hint.prop('dir')).toBe('rtl')
  })

  it('没交内嵌提示机时取提示部件直接报错', () => {
    const runtime = createVanillaRuntime()
    const nav = createService(sideNavMachine, { props: () => ({ collection: COLLECTION, collapsed: true }), runtime })
    runtime.start()
    stops.push(() => runtime.stop())
    expect(() => connectSideNav(nav, normalizeProps).getTooltipContentProps()).toThrow(/名称提示/)
  })
})
