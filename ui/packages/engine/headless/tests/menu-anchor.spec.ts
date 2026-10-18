// @vitest-environment jsdom
// menu 的 anchor：外部锚点顶替 trigger 定位，展开期间在它身上写读屏属性，收起或换锚点时还原；按数据铺设时不铺触发按钮。
import type { Anchor, DiagnosticRecord, PositionEnginePort } from '@xihan-ui/core'
import type { MenuSchema } from '../src'
import {
  createService,
  DIAGNOSTIC_CODES,
  normalizeProps,
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsDedupe,
  setDiagnosticsLevel,
} from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { connectMenu, menuMachine, menuStructure } from '../src'

type Props = MenuSchema['props']
type Dict = Record<string, unknown>

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
  const service = createService(menuMachine, { props: () => props.get(), runtime })
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
    stopped: () => stopped,
    stop: () => runtime.stop(),
    api: () => connectMenu(service, normalizeProps),
    setProps: (next: Partial<Props>) => props.set(prev => ({ ...prev, ...next })),
    contentId: service.scope.ids('menu', 'content').content,
  }
}

const settle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

describe('menu · anchor', () => {
  it('展开期间外部锚点带 aria-haspopup="menu" / aria-expanded / aria-controls，收起还原成原先的值', () => {
    const anchor = button('页码')
    anchor.setAttribute('aria-haspopup', 'true')
    const t = make({ open: false, anchor })
    t.setProps({ open: true })
    expect(anchor.getAttribute('aria-haspopup')).toBe('menu')
    expect(anchor.getAttribute('aria-expanded')).toBe('true')
    expect(anchor.getAttribute('aria-controls')).toBe(t.contentId)
    t.setProps({ open: false })
    expect(anchor.getAttribute('aria-haspopup')).toBe('true')
    expect(anchor.hasAttribute('aria-expanded')).toBe(false)
    expect(anchor.hasAttribute('aria-controls')).toBe(false)
  })

  it('展开中换锚点：旧锚点还原，新锚点写上，定位改挂新锚点', async () => {
    const first = button('页码')
    const second = button('更多')
    const t = make({ open: true, anchor: first })
    await settle()
    t.setProps({ anchor: second })
    expect(first.hasAttribute('aria-expanded')).toBe(false)
    expect(second.getAttribute('aria-expanded')).toBe('true')
    await settle()
    expect(t.anchors).toEqual([first, second])
    expect(t.stopped()).toBe(1)
  })

  it('给了 anchor 就不取 trigger；停机即还原锚点上的属性', async () => {
    const trigger = button('操作')
    const anchor = button('外部')
    const t = make({ defaultOpen: true, anchor }, { trigger })
    await settle()
    expect(t.anchors).toEqual([anchor])
    t.stop()
    expect(anchor.hasAttribute('aria-expanded')).toBe(false)
  })

  it('既没有 anchor 也没有 trigger：展开时报 overlay.missing-anchor', async () => {
    const t = make({ defaultOpen: true })
    await settle()
    expect(t.anchors).toEqual([])
    expect(diagnostics.map(record => record.code)).toContain(DIAGNOSTIC_CODES.overlayMissingAnchor)
  })

  it('写了 anchor 时 content 不再由触发器命名：名字取 translations.content', () => {
    const plain = make({}).api().getContentProps() as Dict
    expect(plain['aria-labelledby']).toBeDefined()
    const anchored = make({ anchor: null }).api().getContentProps() as Dict
    expect(anchored['aria-labelledby']).toBeUndefined()
    const named = make({ anchor: null, translations: { content: '页码' } }).api().getContentProps() as Dict
    expect(named['aria-label']).toBe('页码')
  })

  it('标准结构：anchored 时不铺触发按钮，子菜单的触发条目照旧', () => {
    const model = { collection: [] }
    const parts = (options?: Parameters<typeof menuStructure>[1]): (string | undefined)[] =>
      menuStructure(model, options).map(node => ('part' in node ? node.part : undefined))
    expect(parts()).toEqual(['trigger', 'positioner'])
    expect(parts({ anchored: true })).toEqual(['positioner'])
    expect(parts({ anchored: true, submenu: true, value: 'more' })).toEqual(['trigger', 'positioner'])
  })
})
