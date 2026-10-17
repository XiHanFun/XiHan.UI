// 属性面板的三种复合内建编辑器在真实 Chromium 与组件皮肤下：绑定字段的树选择点开即选、四边在窄面板里排成两列不越界、
// 格式输入框放得进窄面板，三者一起时没有 wc.* 诊断，axe 也没有违规。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { DesignerPropertiesEventMap, XhDesignerPropertiesElement } from '../../src'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

let panel: XhDesignerPropertiesElement | undefined

afterEach(() => {
  panel?.remove()
  panel = undefined
})

describe('属性面板的绑定字段、四边与格式（Chromium）', () => {
  async function mountComposite(): Promise<{ changes: [string, unknown][], row: (path: string) => HTMLElement, diagnostics: () => string[] }> {
    const seen: DiagnosticRecord[] = []
    resetDiagnostics()
    setDiagnosticsConsoleOutput(false)
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    const off = onDiagnostic(record => void seen.push(record))
    panel = document.createElement('xh-designer-properties')
    panel.style.inlineSize = '280px'
    panel.dataFields = [{ name: 'order', kind: 'object', label: 'Order', children: [
      { name: 'no', kind: 'value', label: 'Number' },
      { name: 'buyer', kind: 'object', label: 'Buyer', children: [{ name: 'name', kind: 'value', label: 'Name' }] },
    ] }]
    panel.targets = [{
      kind: 'text',
      id: 'x',
      value: { field: '', padding: { top: 2, right: 2, bottom: 2, left: 2 }, format: { kind: 'number', decimals: 2 } },
      descriptors: [
        { path: ['field'], control: { kind: 'dataField', kinds: ['value'] }, label: 'Field' },
        { path: ['padding'], control: { kind: 'sides', min: 0, unit: 'mm' }, label: 'Padding' },
        { path: ['format'], control: { kind: 'format' }, label: 'Format' },
      ],
    }]
    const changes: [string, unknown][] = []
    panel.addEventListener('property-change', (event) => {
      const { path, value } = (event as DesignerPropertiesEventMap['property-change']).detail
      changes.push([path.join('.'), value])
    })
    document.body.append(panel)
    await panel.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
    off()
    resetDiagnostics()
    return {
      changes,
      row: path => panel!.querySelector<HTMLElement>(`[data-part="property"][data-path="${path}"]`)!,
      diagnostics: () => seen.filter(record => record.code.startsWith('wc.')).map(record => `${record.code} ${record.scope ?? ''}/${record.part ?? ''}`),
    }
  }

  /** 元素的盒没有越出所在的属性行。 */
  function inside(element: Element, row: Element): boolean {
    const box = element.getBoundingClientRect()
    const bounds = row.getBoundingClientRect()
    return box.width > 0 && box.left >= bounds.left - 0.5 && box.right <= bounds.right + 0.5
  }

  it('绑定字段：点开树选择，不能选的对象是禁用的分支，点一个字段写入它的路径', async () => {
    const { changes, row, diagnostics } = await mountComposite()
    expect(diagnostics()).toEqual([])
    await userEvent.click(row('field').querySelector('[data-xh-part="trigger"]')!)
    const items = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('[role="treeitem"]'))
    await expect.poll(() => items().length).toBe(4)
    const order = items().find(item => item.getAttribute('value') === 'order')!
    expect([order.getAttribute('aria-disabled'), order.getAttribute('aria-expanded')]).toEqual(['true', 'true'])
    await userEvent.click(items().find(item => item.getAttribute('value') === 'order.buyer.name')!.querySelector('[data-xh-part="item-text"]')!)
    expect(changes).toEqual([['field', 'order.buyer.name']])
  })

  it('四边：面板窄时四个框排成两列、不越出行；点开关在一个框与四个框之间切换，改一边写入整个对象', async () => {
    const { changes, row } = await mountComposite()
    const padding = row('padding')
    const roots = (): HTMLElement[] => Array.from(padding.querySelectorAll<HTMLElement>('xh-number-field > [data-xh-part="root"]'))
    expect(roots()).toHaveLength(1)
    expect(inside(roots()[0]!, padding)).toBe(true)
    await userEvent.click(padding.querySelector('xh-switch [data-xh-part="text"]')!)
    expect(roots()).toHaveLength(4)
    const [top, right, bottom] = roots().map(root => root.getBoundingClientRect())
    expect([Math.round(top!.top) === Math.round(right!.top), bottom!.top > top!.bottom]).toEqual([true, true])
    for (const root of roots())
      expect(inside(root, padding)).toBe(true)
    const input = roots()[1]!.querySelector('input')!
    expect(input.getAttribute('aria-label')).toBe('Right')
    await userEvent.clear(input)
    await userEvent.type(input, '3')
    expect(changes.at(-1)).toEqual(['padding', { top: 2, right: 3, bottom: 2, left: 2 }])
  })

  it('格式：格式输入框放得进窄面板；三种编辑器一起时 axe 无违规', async () => {
    const { row } = await mountComposite()
    const format = row('format').querySelector('xh-format-input > [data-xh-part="root"]')!
    expect(inside(format, row('format'))).toBe(true)
    await expectNoAxeViolations(panel!)
  })
})
