// @vitest-environment jsdom
import type { MachineSchema } from '@xihan-ui/core'
import type { ReactiveControllerHost } from '../src/reactive'
import { setup } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { XhReactiveElement } from '../src/reactive'
import { createLitRuntime } from '../src/runtime/lit-runtime'
import { MachineController } from '../src/runtime/machine-controller'

interface ToggleSchema extends MachineSchema {
  props: Record<string, never>
  context: { pressed: boolean }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'off' | 'on'
  event: { type: 'TOGGLE' }
  tag: never
  guard: never
  action: 'toggle'
  effect: never
}

const { createMachine } = setup<ToggleSchema>()
const toggleMachine = createMachine({
  name: 'toggle',
  context: ({ cell }) => ({ pressed: cell(() => ({ defaultValue: false })) }),
  initialState: () => 'off',
  states: {
    off: { on: { TOGGLE: { target: 'on', actions: ['toggle'] } } },
    on: { on: { TOGGLE: { target: 'off', actions: ['toggle'] } } },
  },
  implementations: {
    actions: { toggle: ({ context }) => context.set('pressed', p => !p) },
  },
})

class XhToggleTest extends XhReactiveElement {
  readonly ctrl = new MachineController(this, toggleMachine, () => ({}))
  protected override createRenderRoot(): HTMLElement {
    return this
  }

  protected override updated(): void {
    this.dataset.state = this.ctrl.service.state.get()
    this.dataset.pressed = String(this.ctrl.service.context.get('pressed'))
  }
}
customElements.define('xh-toggle-test', XhToggleTest)

describe('machineController + createLitRuntime', () => {
  it('机器状态经 cell 驱动元素重渲，send 后状态与 context 反映到 DOM', async () => {
    const el = document.createElement('xh-toggle-test') as XhToggleTest
    document.body.appendChild(el)
    await el.updateComplete
    expect(el.dataset.state).toBe('off')
    expect(el.dataset.pressed).toBe('false')

    el.ctrl.service.send({ type: 'TOGGLE' })
    await el.updateComplete
    expect(el.dataset.state).toBe('on')
    expect(el.dataset.pressed).toBe('true')

    el.ctrl.service.send({ type: 'TOGGLE' })
    await el.updateComplete
    expect(el.dataset.state).toBe('off')
    expect(el.dataset.pressed).toBe('false')

    el.remove()
    expect(el.ctrl.service.getStatus()).toBe('Stopped')
  })

  it('元素在 DOM 中移动（重连）：机器从 initialState 重建，二次断开正确停机', async () => {
    const el = document.createElement('xh-toggle-test') as XhToggleTest
    document.body.appendChild(el)
    await el.updateComplete
    el.ctrl.service.send({ type: 'TOGGLE' })
    await el.updateComplete
    expect(el.ctrl.service.state.get()).toBe('on')
    const first = el.ctrl.service

    // 移动：断开再接回
    el.remove()
    expect(first.getStatus()).toBe('Stopped')
    document.body.appendChild(el)
    await el.updateComplete

    // 重建：新机器，从 initialState=off 起（状态不跨移动保留），context 一并重置
    expect(el.ctrl.service).not.toBe(first)
    expect(el.ctrl.service.state.get()).toBe('off')
    expect(el.ctrl.service.context.get('pressed')).toBe(false)

    // 二次断开：正确停机（BUG 回归——旧实现会卡在 Started）
    el.remove()
    expect(el.ctrl.service.getStatus()).toBe('Stopped')
  })
})

function fakeHost(): ReactiveControllerHost {
  return {
    addController: () => {},
    removeController: () => {},
    requestUpdate: () => {},
    updateComplete: Promise.resolve(true),
  }
}

// 受控值由宿主直接写入，不经过 cell.set；版本号必须按值拉取比对才察觉得到。
// 推送式计数（只在 set/notify 自增）会让 track 在本适配器静默失效，
// 而 Vue 运行时是拉取式——两端语义必须一致，否则同一台机器跨适配器行为分叉。
describe('createLitRuntime cell 版本号', () => {
  it('受控值被外部改写时 version 递增', () => {
    const runtime = createLitRuntime(fakeHost())
    let controlled = 'a'
    const c = runtime.cell<string>(() => ({ value: controlled }))
    const v0 = c.version()
    controlled = 'b'
    expect(c.get()).toBe('b')
    expect(c.version()).not.toBe(v0)
  })

  it('值未变时 version 不动，track 不误触发', () => {
    const runtime = createLitRuntime(fakeHost())
    const c = runtime.cell<string>(() => ({ defaultValue: 'a' }))
    expect(c.version()).toBe(c.version())
  })

  it('外部改写受控值后 runTrackers 触发依赖该 cell 的 tracker', () => {
    const runtime = createLitRuntime(fakeHost())
    let controlled = 'a'
    const c = runtime.cell<string>(() => ({ value: controlled }))
    let fired = 0
    runtime.track([() => c.version()], () => {
      fired += 1
    })

    runtime.runTrackers()
    expect(fired).toBe(0)

    controlled = 'b'
    runtime.runTrackers()
    expect(fired).toBe(1)

    runtime.runTrackers()
    expect(fired).toBe(1)
  })
})
