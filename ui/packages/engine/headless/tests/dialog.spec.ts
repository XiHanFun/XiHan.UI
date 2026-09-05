// @vitest-environment jsdom
// 末段的消解开关要真 DOM：机器把 config/registerLayer/getContentEl 塞进 refs 后，
// trackOverlay 才会装配消解层。前面的纯逻辑用例在 jsdom 下照跑。
import type { Service } from '@xihan-ui/core'
import type { DialogOpenChangeDetails, DialogSchema } from '../src'
import { createRuntimeConfig, createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectDialog, dialogMachine } from '../src'

function makeService(props: DialogSchema['props'] = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(dialogMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

describe('dialogMachine', () => {
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
})

describe('connectDialog', () => {
  it('content 的 role / aria-modal / aria-labelledby / data-state', () => {
    const s = makeService()
    const content = connectDialog(s, normalizeProps).getContentProps() as Record<string, unknown>
    expect(content.role).toBe('dialog')
    expect(content['aria-modal']).toBe('true')
    expect(content['data-scope']).toBe('dialog')
    expect(content['data-part']).toBe('content')
    expect(content['data-state']).toBe('closed')
    expect(typeof content['aria-labelledby']).toBe('string')
  })

  it('alertdialog role + 非模态显式 aria-modal="false"', () => {
    const content = connectDialog(makeService({ role: 'alertdialog', modal: false }), normalizeProps).getContentProps() as Record<string, unknown>
    expect(content.role).toBe('alertdialog')
    // 省略与显式 false 在读屏那里不是一回事：前者是"没说"，后者是"明确说了不是模态"
    expect(content['aria-modal']).toBe('false')
  })

  it('trigger 的 aria-haspopup / aria-expanded / aria-controls', () => {
    const s = makeService({ defaultOpen: true })
    const trigger = connectDialog(s, normalizeProps).getTriggerProps() as Record<string, unknown>
    expect(trigger['aria-haspopup']).toBe('dialog')
    expect(trigger['aria-expanded']).toBe('true')
    expect(trigger['aria-controls']).toBe(connectDialog(s, normalizeProps).getContentProps().id)
  })

  it('setOpen 驱动状态；closeTrigger aria-label 取 translations', () => {
    const s = makeService()
    const api = connectDialog(s, normalizeProps)
    api.setOpen(true)
    expect(s.state.get()).toBe('open')

    const close = connectDialog(makeService({ translations: { close: '关闭' } }), normalizeProps).getCloseTriggerProps() as Record<string, unknown>
    expect(close['aria-label']).toBe('关闭')
  })
})

// —— 展开期的两个消解开关：Escape 与层外交互 ——

interface DismissHarness {
  service: Service<DialogSchema>
  content: HTMLElement
  /** 铺在内容之外的定位层；宿主结构里点空白就落在它上面，是层外交互的实际来路。 */
  positioner: HTMLElement
  /** 收到的每一次 onOpenChange，按先后排列。 */
  changes: DialogOpenChangeDetails[]
  /** 宿主改 prop：机器下一次读到的就是新值。 */
  setProps: (patch: DialogSchema['props']) => void
  stop: () => void
}

const live: DismissHarness[] = []

function makeDismissHarness(initial: DialogSchema['props'] = {}): DismissHarness {
  // 浮层落点的结构照适配器：遮罩与定位层并排，内容住在定位层里
  const portal = document.createElement('div')
  const backdrop = document.createElement('div')
  const positioner = document.createElement('div')
  const content = document.createElement('div')
  content.tabIndex = -1
  positioner.append(content)
  portal.append(backdrop, positioner)
  document.body.append(portal)

  const config = createRuntimeConfig()
  const changes: DialogOpenChangeDetails[] = []

  let props: DialogSchema['props'] = { ...initial, onOpenChange: d => changes.push(d) }
  const runtime = createVanillaRuntime()
  const service = createService(dialogMachine, { props: () => props, runtime })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'modal',
    node: () => content,
    branches: () => [],
    isModal: () => props.modal ?? true,
    setModal: () => {},
    surfaces: () => [backdrop],
  }))
  service.refs.set('getContentEl', () => content)
  runtime.start()

  const harness: DismissHarness = {
    service,
    content,
    positioner,
    changes,
    setProps: (patch) => {
      props = { ...props, ...patch }
    },
    // 停运行时即拆掉所有效应，消解层与层注册一并撤销
    stop: () => runtime.stop(),
  }
  live.push(harness)
  return harness
}

/** 展开并等到消解层的监听器注册上（它延后一拍，避开打开自己的那次交互）。 */
async function open(h: DismissHarness): Promise<void> {
  h.service.send({ type: 'OPEN' })
  await new Promise(resolve => setTimeout(resolve, 0))
}

function press(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}

function pointerDown(el: HTMLElement): void {
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 }))
}

function focusIn(el: HTMLElement): void {
  el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
}

describe('dialog 展开期的消解开关', () => {
  afterEach(() => {
    for (const h of live.splice(0)) h.stop()
    document.body.innerHTML = ''
  })

  it('缺省下 Escape 关闭，回调报 esc', async () => {
    const h = makeDismissHarness()
    await open(h)
    press(h.content, 'Escape')
    expect(h.service.state.get()).toBe('closed')
    expect(h.changes).toEqual([{ open: true }, { open: false, reason: 'esc' }])
  })

  it('展开之后把 closeOnEscape 改成 false：Escape 不再关，改回 true 又关得掉', async () => {
    const h = makeDismissHarness()
    await open(h)

    // 开着的时候才改：走的是宿主在展开途中锁住弹窗这条路
    h.setProps({ closeOnEscape: false })
    press(h.content, 'Escape')
    expect(h.service.state.get()).toBe('open')
    expect(h.changes).toEqual([{ open: true }])

    h.setProps({ closeOnEscape: true })
    press(h.content, 'Escape')
    expect(h.service.state.get()).toBe('closed')
    expect(h.changes).toEqual([{ open: true }, { open: false, reason: 'esc' }])
  })

  it('缺省（模态）下点内容之外关闭，回调报 interact-outside', async () => {
    const h = makeDismissHarness()
    await open(h)
    pointerDown(h.positioner)
    expect(h.service.state.get()).toBe('closed')
    expect(h.changes).toEqual([{ open: true }, { open: false, reason: 'interact-outside' }])
  })

  it('展开之后把 closeOnInteractOutside 改成 false：点层外不再关，改回 true 又关得掉', async () => {
    const h = makeDismissHarness()
    await open(h)

    h.setProps({ closeOnInteractOutside: false })
    pointerDown(h.positioner)
    expect(h.service.state.get()).toBe('open')
    expect(h.changes).toEqual([{ open: true }])

    h.setProps({ closeOnInteractOutside: true })
    pointerDown(h.positioner)
    expect(h.service.state.get()).toBe('closed')
    expect(h.changes.at(-1)).toEqual({ open: false, reason: 'interact-outside' })
  })

  it('焦点落到层外这一路同样归 closeOnInteractOutside 管', async () => {
    const h = makeDismissHarness({ closeOnInteractOutside: false })
    await open(h)
    focusIn(h.positioner)
    expect(h.service.state.get()).toBe('open')

    h.setProps({ closeOnInteractOutside: true })
    focusIn(h.positioner)
    expect(h.service.state.get()).toBe('closed')
    expect(h.changes.at(-1)).toEqual({ open: false, reason: 'interact-outside' })
  })

  it('没显式给开关时缺省回落 modal：非模态点层外不关', async () => {
    const h = makeDismissHarness({ modal: false })
    await open(h)
    pointerDown(h.positioner)
    expect(h.service.state.get()).toBe('open')
    expect(h.changes).toEqual([{ open: true }])
  })

  it('alertdialog 压过显式开关：点层外一律不关，Escape 仍归 closeOnEscape 管', async () => {
    const h = makeDismissHarness({ role: 'alertdialog', closeOnInteractOutside: true })
    await open(h)
    pointerDown(h.positioner)
    expect(h.service.state.get()).toBe('open')

    press(h.content, 'Escape')
    expect(h.service.state.get()).toBe('closed')
  })
})
