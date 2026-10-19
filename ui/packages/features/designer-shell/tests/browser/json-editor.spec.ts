// JSON 编辑框在真实 Chromium 与组件皮肤下：编辑框铺满对话框宽、等宽字体、不折行；用指针点问题列表的一条，光标选中那个值，
// 编辑框滚到那一行看得见的位置；375 宽的窄屏下对话框不出横向溢出；没有 wc.* 诊断，axe 也没有违规。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { JsonValue } from '@xihan-ui/core/json'
import type { DesignerIssueItem, XhDesignerJsonEditorElement } from '../../src'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

let element: XhDesignerJsonEditorElement | undefined

afterEach(async () => {
  element?.remove()
  element = undefined
  await page.viewport(1280, 800)
})

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 等进场动画播完：缩放会改量出来的位置。 */
async function settle(): Promise<void> {
  await frames()
  const finite = document.getAnimations().filter(animation => animation.effect?.getComputedTiming().endTime !== Infinity)
  await Promise.all(finite.map(animation => animation.finished.catch(() => {})))
  await frames()
}

/** 八十个节点，第六十一个没有标签。 */
const doc: JsonValue = { nodes: Array.from({ length: 80 }, (_, index) => ({ id: `n${index}`, label: index === 60 ? '' : `Node ${index}` })) }

function requireLabels(value: JsonValue): DesignerIssueItem[] {
  const nodes = (value as { nodes?: { label?: string }[] }).nodes ?? []
  return nodes.flatMap((node, index) => node.label === '' ? [{ issue: { code: 'required', path: ['nodes', index, 'label'] }, message: `Node ${index} needs a label` }] : [])
}

async function open(): Promise<XhDesignerJsonEditorElement> {
  element = document.createElement('xh-designer-json-editor')
  element.value = doc
  element.validate = requireLabels
  document.body.append(element)
  element.show()
  await element.updateComplete
  await settle()
  return element
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="designer-json-editor"][data-part="${name}"]`)!
}

function area(): HTMLTextAreaElement {
  return part('input').querySelector('textarea')!
}

describe('<xh-designer-json-editor>', () => {
  it('编辑框铺满对话框宽、等宽字体、不折行；指针点一条问题，光标选中那个值，那一行滚进可见范围；没有 wc.* 诊断，axe 没有违规', async () => {
    const records: DiagnosticRecord[] = []
    resetDiagnostics()
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    setDiagnosticsConsoleOutput(false)
    const off = onDiagnostic(record => void records.push(record))
    try {
      await open()
      const textarea = area()
      // 打开后落焦在编辑框，光标在开头，不全选：整份文档被选中时一敲键就没了
      expect([document.activeElement, textarea.selectionStart, textarea.selectionEnd]).toEqual([textarea, 0, 0])
      const body = document.querySelector<HTMLElement>('[data-scope="dialog"][data-part="body"]')!
      const style = getComputedStyle(body)
      const inner = body.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight)
      expect(Math.abs(part('input').querySelector<HTMLElement>('[data-scope="text-field"][data-part="root"]')!.getBoundingClientRect().width - inner)).toBeLessThanOrEqual(1)
      const probe = document.createElement('span')
      probe.style.fontFamily = 'var(--xh-font-family-mono)'
      document.body.append(probe)
      expect([getComputedStyle(textarea).fontFamily, getComputedStyle(textarea).whiteSpace]).toEqual([getComputedStyle(probe).fontFamily, 'pre'])
      probe.remove()
      expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight)
      expect(textarea.scrollTop).toBe(0)
      await userEvent.click(part('issues').querySelector<HTMLElement>('button[data-part="issue"]')!)
      const text = textarea.value
      const start = text.indexOf('""')
      expect([document.activeElement, textarea.selectionStart, textarea.selectionEnd]).toEqual([textarea, start, start + 2])
      const line = text.slice(0, start).split('\n').length
      const lineHeight = Number.parseFloat(getComputedStyle(textarea).lineHeight)
      const top = (line - 1) * lineHeight
      expect(top).toBeGreaterThanOrEqual(textarea.scrollTop)
      expect(top + lineHeight).toBeLessThanOrEqual(textarea.scrollTop + textarea.clientHeight)
      expect(records.filter(record => record.code.startsWith('wc.')).map(record => record.code)).toEqual([])
      await expectNoAxeViolations(document.querySelector<HTMLElement>('[data-scope="dialog"][data-part="content"]')!)
    }
    finally {
      off()
      resetDiagnostics()
    }
  })

  it('375 宽的窄屏下对话框不出横向溢出，底边的钮都在对话框里', async () => {
    await page.viewport(375, 700)
    await open()
    const content = document.querySelector<HTMLElement>('[data-scope="dialog"][data-part="content"]')!
    expect(content.scrollWidth).toBeLessThanOrEqual(content.clientWidth)
    const box = content.getBoundingClientRect()
    for (const name of ['format', 'copy', 'cancel', 'apply']) {
      const rect = part(name).querySelector('button')!.getBoundingClientRect()
      expect([rect.left >= box.left - 1, rect.right <= box.right + 1], name).toEqual([true, true])
    }
  })
})
