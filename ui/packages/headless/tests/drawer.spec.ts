// @vitest-environment jsdom
import type { RuntimeConfig } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
// 直接指到组件目录：drawer 尚未接进 src/index.ts（统一接线由别处做），
// 从子路径进也保证这份用例接的是本组件自己的实现。
import type { DrawerSchema, DrawerSide } from '../src/drawer'
import { createCounterIdGenerator, createRuntimeConfig, createScope, normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connectDrawer, drawerMachine } from '../src/drawer'

function makeService(props: DrawerSchema['props'] = {}): Service<DrawerSchema> {
  const runtime = createVanillaRuntime()
  const service = createService(drawerMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

function attrs(api: ReturnType<typeof connectDrawer>, part: 'root' | 'content'): Record<string, unknown> {
  const get = part === 'root' ? api.getRootProps : api.getContentProps
  return get() as Record<string, unknown>
}

describe('drawerMachine 状态转移', () => {
  it('默认 closed，defaultOpen 决定初态', () => {
    expect(makeService().state.get()).toBe('closed')
    expect(makeService({ defaultOpen: true }).state.get()).toBe('open')
  })

  it('oPEN / CLOSE / TOGGLE 转移', () => {
    const s = makeService()
    s.send({ type: 'OPEN' })
    expect(s.state.get()).toBe('open')
    s.send({ type: 'CLOSE' })
    expect(s.state.get()).toBe('closed')
    s.send({ type: 'TOGGLE' })
    expect(s.state.get()).toBe('open')
    s.send({ type: 'TOGGLE' })
    expect(s.state.get()).toBe('closed')
  })

  it('side 只是展示 prop：改它不引起任何状态转移', () => {
    const s = makeService({ defaultOpen: true, side: 'left' })
    expect(s.state.get()).toBe('open')
    expect(connectDrawer(s, normalizeProps).side).toBe('left')
  })

  it('受控 open：用户事件只发意图不自改状态，宿主写回后才跟随', () => {
    const runtime = createVanillaRuntime()
    const open = runtime.signal(false)
    const seen: boolean[] = []
    const service = createService(drawerMachine, {
      props: () => ({ open: open.get(), onOpenChange: (d: { open: boolean }) => seen.push(d.open) }),
      runtime,
    })
    runtime.start()

    service.send({ type: 'TOGGLE' })
    // 受控：状态纹丝不动，只把意图报出去
    expect(service.state.get()).toBe('closed')
    expect(seen).toEqual([true])

    // 宿主写回 → watch 派发影子事件 → 状态跟上，且不再重复通知
    open.set(true)
    expect(service.state.get()).toBe('open')
    expect(seen).toEqual([true])

    open.set(false)
    expect(service.state.get()).toBe('closed')
  })
})

describe('connectDrawer 属性输出', () => {
  it('side 缺省为 right，root 与 content 都带 data-side', () => {
    const api = connectDrawer(makeService(), normalizeProps)
    expect(api.side).toBe('right')
    expect(attrs(api, 'root')['data-side']).toBe('right')
    expect(attrs(api, 'content')['data-side']).toBe('right')
  })

  it.each<DrawerSide>(['top', 'right', 'bottom', 'left'])('side=%s 同步落到 root 与 content', (side) => {
    const api = connectDrawer(makeService({ side }), normalizeProps)
    expect(api.side).toBe(side)
    expect(attrs(api, 'root')['data-side']).toBe(side)
    expect(attrs(api, 'content')['data-side']).toBe(side)
  })

  it('root 带 anatomy 标记与 data-state，开合都跟着走', () => {
    const s = makeService()
    const closed = attrs(connectDrawer(s, normalizeProps), 'root')
    expect(closed['data-scope']).toBe('drawer')
    expect(closed['data-part']).toBe('root')
    expect(closed['data-state']).toBe('closed')

    s.send({ type: 'OPEN' })
    expect(attrs(connectDrawer(s, normalizeProps), 'root')['data-state']).toBe('open')
  })

  it('content 收起态自带 hidden：不指望作者一定写了 positioner', () => {
    const s = makeService()
    // 只有 root + content 的最小合规结构下，这一句是唯一能把抽屉收起来的东西
    expect(attrs(connectDrawer(s, normalizeProps), 'content').hidden).toBe(true)
    s.send({ type: 'OPEN' })
    expect(attrs(connectDrawer(s, normalizeProps), 'content').hidden).toBeUndefined()
  })

  it('content 的 role / aria 接线；非模态显式 aria-modal="false"', () => {
    const s = makeService()
    const content = attrs(connectDrawer(s, normalizeProps), 'content')
    expect(content.role).toBe('dialog')
    expect(content['aria-modal']).toBe('true')
    expect(content.tabindex).toBe(-1)
    expect(typeof content['aria-labelledby']).toBe('string')
    expect(typeof content['aria-describedby']).toBe('string')

    // 省略与显式 false 在读屏那里不是一回事：前者是"没说"，后者是"明确说了不是模态"
    const plain = attrs(connectDrawer(makeService({ modal: false, role: 'alertdialog' }), normalizeProps), 'content')
    expect(plain['aria-modal']).toBe('false')
    expect(plain.role).toBe('alertdialog')
  })

  it('trigger 的 aria-haspopup / aria-expanded / aria-controls 指向 content', () => {
    const s = makeService({ defaultOpen: true })
    const api = connectDrawer(s, normalizeProps)
    const trigger = api.getTriggerProps() as Record<string, unknown>
    expect(trigger['aria-haspopup']).toBe('dialog')
    expect(trigger['aria-expanded']).toBe('true')
    expect(trigger['aria-controls']).toBe(api.getContentProps().id)
    expect(trigger.type).toBe('button')
  })

  it('setOpen 驱动状态；close-trigger 的 aria-label 取 translations', () => {
    const s = makeService()
    connectDrawer(s, normalizeProps).setOpen(true)
    expect(s.state.get()).toBe('open')
    // 已是该状态时不重复发事件
    connectDrawer(s, normalizeProps).setOpen(true)
    expect(s.state.get()).toBe('open')

    const close = connectDrawer(makeService({ translations: { close: '关闭' } }), normalizeProps)
      .getCloseTriggerProps() as Record<string, unknown>
    expect(close['aria-label']).toBe('关闭')
  })
})

// —— 展开期的副作用：焦点域、背景失活、层栈 ——
// 这一段要真 DOM，因此单独走 jsdom：机器把 config/registerLayer/getContentEl 塞进 refs 后，
// trackOverlay 的每一条装配都能在这里被观察到。

interface DomHarness {
  service: Service<DrawerSchema>
  config: RuntimeConfig
  trigger: HTMLButtonElement
  content: HTMLElement
  inner: HTMLButtonElement
  outside: HTMLElement
  /** 宿主把 content 提交进 DOM 之前，getContentEl 一律返回 null。 */
  commit: () => void
  stop: () => void
}

function makeDomHarness(props: DrawerSchema['props'] = {}): DomHarness {
  const outside = document.createElement('div')
  outside.textContent = '页面正文'
  document.body.appendChild(outside)

  const host = document.createElement('div')
  const trigger = document.createElement('button')
  const content = document.createElement('div')
  content.tabIndex = -1
  const inner = document.createElement('button')
  inner.textContent = '确认'
  content.appendChild(inner)
  host.append(trigger, content)
  document.body.appendChild(host)

  const idGen = createCounterIdGenerator()
  const scope = createScope(document.body, idGen)
  const config = createRuntimeConfig({ scope, idGenerator: idGen })

  const runtime = createVanillaRuntime()
  const service = createService(drawerMachine, { props: () => props, runtime })

  // 宿主提交 DOM 之前 content 取不到——Vue 要等 presence 的 post 观察者，
  // WC 要等首次 wire 认出角色节点。这里如实复现那一拍的空窗。
  let committed = false
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'modal',
    node: () => (committed ? content : null),
    branches: () => [],
    isModal: () => props.modal ?? true,
    setModal: () => {},
    surfaces: () => [],
  }))
  service.refs.set('presence', null)
  service.refs.set('getContentEl', () => (committed ? content : null))
  service.refs.set('getTriggerEl', () => trigger)
  service.refs.set('branches', () => [])
  runtime.start()

  return {
    service,
    config,
    trigger,
    content,
    inner,
    outside,
    commit: () => {
      committed = true
    },
    stop: () => runtime.stop(),
  }
}

/** 等到 flush（微任务）跑完。 */
const microtask = (): Promise<void> => Promise.resolve()
/** 等到 rAF 队列跑完一轮：焦点重试与焦点归还都排在这里。 */
const frame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()))

describe('drawerMachine 展开期副作用', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it('层只在展开期间入栈，关上即出栈', () => {
    const h = makeDomHarness()
    expect(h.config.layerRegistry.list()).toHaveLength(0)
    h.service.send({ type: 'OPEN' })
    expect(h.config.layerRegistry.list()).toHaveLength(1)
    h.service.send({ type: 'CLOSE' })
    expect(h.config.layerRegistry.list()).toHaveLength(0)
    h.stop()
  })

  it('非模态照样把焦点移进 content，关闭后归还 trigger', async () => {
    const h = makeDomHarness({ modal: false })
    h.trigger.focus()
    expect(document.activeElement).toBe(h.trigger)

    h.service.send({ type: 'OPEN' })
    h.commit()
    // 容器晚一拍就位，焦点域会在随后的帧里重试
    await frame()
    // 焦点域若被塞进 if (modal)，这里焦点还停在 trigger 上——非模态抽屉的键盘用户
    // 就此进不去面板。这条断言正是那道守卫。
    expect(document.activeElement).toBe(h.inner)

    h.service.send({ type: 'CLOSE' })
    await frame()
    expect(document.activeElement).toBe(h.trigger)
    h.stop()
  })

  it('模态下背景失活推迟到宿主提交之后才挂', async () => {
    const h = makeDomHarness({ modal: true })
    h.service.send({ type: 'OPEN' })
    // 进入 open 的这一刻 content 还没提交：同步取 targets 只会取到空数组
    expect(h.outside.inert).toBeFalsy()

    h.commit()
    await microtask()
    // 少了 flush 推迟，这里会永远是假——背景就此再也不 inert
    expect(h.outside.inert).toBeTruthy()

    h.service.send({ type: 'CLOSE' })
    expect(h.outside.inert).toBeFalsy()
    h.stop()
  })

  it('提交前就关上：推迟的那一拍不给已关闭的抽屉补挂背景失活', async () => {
    const h = makeDomHarness({ modal: true })
    h.service.send({ type: 'OPEN' })
    h.service.send({ type: 'CLOSE' })
    h.commit()
    await microtask()
    // 存活标志挡住了排在效应拆除之后才跑的 flush 回调
    expect(h.outside.inert).toBeFalsy()
    h.stop()
  })

  it('非模态不失活背景：抽屉旁边的页面仍可交互', async () => {
    const h = makeDomHarness({ modal: false })
    h.service.send({ type: 'OPEN' })
    h.commit()
    await microtask()
    expect(h.outside.inert).toBeFalsy()
    h.stop()
  })

  it('alertdialog 的初始焦点落在 content 容器本身，不预选按钮', async () => {
    const h = makeDomHarness({ role: 'alertdialog' })
    h.service.send({ type: 'OPEN' })
    h.commit()
    await frame()
    expect(document.activeElement).toBe(h.content)
    h.stop()
  })
})
