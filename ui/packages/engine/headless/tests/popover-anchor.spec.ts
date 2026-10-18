// @vitest-environment jsdom
// popover 的 anchor：外部锚点顶替 trigger 定位，展开期间在它身上写读屏属性，收起或换锚点时还原。
import type { Anchor, DiagnosticRecord, PositionEnginePort } from '@xihan-ui/core'
import type { PopoverSchema } from '../src'
import {
  createService,
  DIAGNOSTIC_CODES,
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsDedupe,
  setDiagnosticsLevel,
} from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { popoverMachine } from '../src'

type Props = PopoverSchema['props']

let diagnostics: DiagnosticRecord[] = []

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
  setDiagnosticsDedupe(false)
  diagnostics = []
  onDiagnostic(record => void diagnostics.push(record))
})

afterEach(() => {
  resetDiagnostics()
  document.body.replaceChildren()
})

function button(text: string): HTMLButtonElement {
  const el = document.createElement('button')
  el.textContent = text
  document.body.append(el)
  return el
}

function make(initial: Props, options: { trigger?: HTMLElement } = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(popoverMachine, { props: () => props.get(), runtime })
  const anchors: Anchor[] = []
  let stopped = 0
  const engine: PositionEnginePort = {
    attach(anchor) {
      anchors.push(anchor)
      return () => {
        stopped += 1
      }
    },
  }
  const floating = document.createElement('div')
  document.body.append(floating)
  service.refs.set('position', engine)
  service.refs.set('getFloatingEl', () => floating)
  service.refs.set('getAnchorEl', () => options.trigger ?? null)
  runtime.start()
  return {
    anchors,
    stop: () => runtime.stop(),
    stopped: () => stopped,
    setProps: (next: Partial<Props>) => props.set(prev => ({ ...prev, ...next })),
    contentId: service.scope.ids('popover', 'content').content,
  }
}

const settle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

describe('popover · anchor', () => {
  it('展开期间外部锚点带 aria-haspopup / aria-expanded / aria-controls，收起还原成原先的值', () => {
    const anchor = button('页面设置')
    anchor.setAttribute('aria-expanded', 'false')
    const t = make({ open: false, anchor })
    expect(anchor.hasAttribute('aria-haspopup')).toBe(false)
    t.setProps({ open: true })
    expect(anchor.getAttribute('aria-haspopup')).toBe('dialog')
    expect(anchor.getAttribute('aria-expanded')).toBe('true')
    expect(anchor.getAttribute('aria-controls')).toBe(t.contentId)
    t.setProps({ open: false })
    expect(anchor.getAttribute('aria-expanded')).toBe('false')
    expect(anchor.hasAttribute('aria-haspopup')).toBe(false)
    expect(anchor.hasAttribute('aria-controls')).toBe(false)
  })

  it('展开中换锚点：旧锚点还原，新锚点写上，定位撤掉旧订阅改挂新锚点', async () => {
    const first = button('工具栏里的命令')
    const second = button('更多')
    const t = make({ open: true, anchor: first })
    await settle()
    expect(t.anchors).toEqual([first])
    t.setProps({ anchor: second })
    expect(first.hasAttribute('aria-expanded')).toBe(false)
    expect(second.getAttribute('aria-expanded')).toBe('true')
    await settle()
    expect(t.anchors).toEqual([first, second])
    expect(t.stopped()).toBe(1)
  })

  it('给了 anchor 就不取 trigger；没给 anchor 时照旧锚在 trigger 上', async () => {
    const trigger = button('打开')
    const anchor = button('外部')
    const withAnchor = make({ defaultOpen: true, anchor }, { trigger })
    const plain = make({ defaultOpen: true }, { trigger })
    await settle()
    expect(withAnchor.anchors).toEqual([anchor])
    expect(plain.anchors).toEqual([trigger])
    // trigger 上的读屏属性归 connect，这里不写
    expect(trigger.hasAttribute('aria-controls')).toBe(false)
  })

  it('既没有 anchor 也没有 trigger：展开时报 overlay.missing-anchor，不挂定位', async () => {
    const t = make({ defaultOpen: true })
    await settle()
    expect(t.anchors).toEqual([])
    expect(diagnostics.map(record => record.code)).toContain(DIAGNOSTIC_CODES.overlayMissingAnchor)
  })

  it('服务停机即还原锚点上的属性', () => {
    const anchor = button('外部')
    const t = make({ defaultOpen: true, anchor })
    expect(anchor.getAttribute('aria-expanded')).toBe('true')
    t.stop()
    expect(anchor.hasAttribute('aria-expanded')).toBe(false)
  })
})
