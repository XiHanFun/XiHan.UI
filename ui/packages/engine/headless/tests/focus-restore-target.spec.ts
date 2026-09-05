// @vitest-environment jsdom
// 关掉浮层之后焦点回到触发器。
//
// 焦点域默认按「创建前谁持有焦点」归还，指针入口下这个快照并不可靠：各平台对
// 「点按按钮给不给焦点」的处理不一致，快照可能是 body。这里就按那种情形建场景——
// 展开之前焦点停在 body 上，关掉之后必须落在 trigger 上，而不是留在 body。
import { createRuntimeConfig, normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectDialog, dialogMachine } from '../src/dialog'
import { connectDrawer, drawerMachine } from '../src/drawer'
import { connectImageViewer, imageViewerMachine } from '../src/image-viewer'
import { popoverMachine } from '../src/popover'

interface Harness {
  open: () => void
  close: () => void
  trigger: HTMLButtonElement
  content: HTMLElement
  stop: () => void
}

const live: Harness[] = []

afterEach(() => {
  for (const h of live.splice(0)) h.stop()
  document.body.innerHTML = ''
})

/** 等 n 帧：焦点域的归还排在拆除之后的 rAF 上。 */
async function frames(n = 2): Promise<void> {
  for (let i = 0; i < n; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

/** 触发器在文档流里，浮层住在另一棵子树上，与适配器的 portal 结构一致。 */
function dom() {
  const trigger = document.createElement('button')
  trigger.textContent = '打开'
  const portal = document.createElement('div')
  const positioner = document.createElement('div')
  const content = document.createElement('div')
  content.tabIndex = -1
  const inner = document.createElement('button')
  inner.textContent = '里面'
  content.append(inner)
  positioner.append(content)
  portal.append(positioner)
  document.body.append(trigger, portal)
  return { trigger, content, positioner }
}

/** 取 connect 给 trigger 落的 id，机器按同一个 id 找归还落点。 */
function triggerId(props: unknown): string {
  return String((props as Record<string, unknown>).id)
}

function dialogHarness(): Harness {
  const { trigger, content } = dom()
  const config = createRuntimeConfig()
  const runtime = createVanillaRuntime()
  const service = createService(dialogMachine, { props: () => ({}), runtime })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'modal',
    node: () => content,
    branches: () => [],
    isModal: () => true,
    setModal: () => {},
    surfaces: () => [],
  }))
  service.refs.set('getContentEl', () => content)
  runtime.start()
  trigger.id = triggerId(connectDialog(service, normalizeProps).getTriggerProps())

  const h: Harness = {
    open: () => service.send({ type: 'OPEN' }),
    close: () => service.send({ type: 'CLOSE' }),
    trigger,
    content,
    stop: () => runtime.stop(),
  }
  live.push(h)
  return h
}

function drawerHarness(): Harness {
  const { trigger, content } = dom()
  const config = createRuntimeConfig()
  const runtime = createVanillaRuntime()
  const service = createService(drawerMachine, { props: () => ({}), runtime })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'modal',
    node: () => content,
    branches: () => [],
    isModal: () => true,
    setModal: () => {},
    surfaces: () => [],
  }))
  service.refs.set('getContentEl', () => content)
  runtime.start()
  trigger.id = triggerId(connectDrawer(service, normalizeProps).getTriggerProps())

  const h: Harness = {
    open: () => service.send({ type: 'OPEN' }),
    close: () => service.send({ type: 'CLOSE' }),
    trigger,
    content,
    stop: () => runtime.stop(),
  }
  live.push(h)
  return h
}

function popoverHarness(): Harness {
  const { trigger, content, positioner } = dom()
  const config = createRuntimeConfig()
  const runtime = createVanillaRuntime()
  const service = createService(popoverMachine, { props: () => ({}), runtime })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'popover',
    node: () => content,
    branches: () => [],
    isModal: () => false,
    setModal: () => {},
    surfaces: () => [],
  }))
  service.refs.set('getAnchorEl', () => trigger)
  service.refs.set('getFloatingEl', () => positioner)
  service.refs.set('getContentEl', () => content)
  service.refs.set('getInitialFocusEl', () => null)
  runtime.start()

  const h: Harness = {
    open: () => service.send({ type: 'OPEN' }),
    close: () => service.send({ type: 'CLOSE' }),
    trigger,
    content,
    stop: () => runtime.stop(),
  }
  live.push(h)
  return h
}

function imageViewerHarness(): Harness {
  const { trigger, content } = dom()
  const config = createRuntimeConfig()
  const runtime = createVanillaRuntime()
  const service = createService(imageViewerMachine, {
    props: () => ({ collection: [{ src: 'a.png' }, { src: 'b.png' }] }),
    runtime,
  })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'modal',
    node: () => content,
    branches: () => [],
    isModal: () => true,
    setModal: () => {},
    surfaces: () => [],
  }))
  service.refs.set('getContentEl', () => content)
  runtime.start()
  trigger.id = triggerId(connectImageViewer(service, normalizeProps).getTriggerProps())

  const h: Harness = {
    open: () => service.send({ type: 'OPEN' }),
    close: () => service.send({ type: 'CLOSE' }),
    trigger,
    content,
    stop: () => runtime.stop(),
  }
  live.push(h)
  return h
}

/** 展开、确认焦点已进浮层、再关掉。 */
async function openThenClose(h: Harness): Promise<void> {
  expect(document.activeElement).toBe(document.body)
  h.open()
  await frames(2)
  expect(h.content.contains(document.activeElement)).toBe(true)
  h.close()
  await frames(2)
}

describe('关掉浮层后焦点回到触发器', () => {
  it('dialog：指针展开时快照是 body，关掉后焦点仍落回 trigger', async () => {
    const h = dialogHarness()
    await openThenClose(h)
    expect(document.activeElement).toBe(h.trigger)
  })

  it('drawer：指针展开时快照是 body，关掉后焦点仍落回 trigger', async () => {
    const h = drawerHarness()
    await openThenClose(h)
    expect(document.activeElement).toBe(h.trigger)
  })

  it('popover：指针展开时快照是 body，关掉后焦点仍落回锚点', async () => {
    const h = popoverHarness()
    await openThenClose(h)
    expect(document.activeElement).toBe(h.trigger)
  })

  it('image-viewer：指针展开时快照是 body，关掉后焦点仍落回 trigger', async () => {
    const h = imageViewerHarness()
    await openThenClose(h)
    expect(document.activeElement).toBe(h.trigger)
  })

  it('显式落点盖过创建前的快照：展开前焦点在别处，关掉后也回 trigger', async () => {
    const h = dialogHarness()
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    h.open()
    await frames(2)
    h.close()
    await frames(2)
    expect(document.activeElement).toBe(h.trigger)
  })

  it('trigger 已经离场时回落到展开前的焦点持有者', async () => {
    const h = dialogHarness()
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    h.open()
    await frames(2)
    h.trigger.remove()
    h.close()
    await frames(2)
    expect(document.activeElement).toBe(outside)
  })
})
