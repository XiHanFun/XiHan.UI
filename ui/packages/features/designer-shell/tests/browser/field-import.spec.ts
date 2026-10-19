// 导入字段对话框在真实 Chromium 与组件皮肤下：在输入框里键入 JSON 后预览表铺出字段，表头与各行的列对齐、下级按层级缩进；
// 一行里 Tab 依次经过勾选框、显示名、类型与内容，空格勾掉一行后导入的字段里没有它；axe 没有违规。
import type { DesignerFieldImportDetail, DesignerFieldImportEventMap, XhDesignerFieldImportElement } from '../../src'
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

let element: XhDesignerFieldImportElement | undefined

afterEach(() => {
  element?.remove()
  element = undefined
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

async function until(check: () => boolean, message = '期望的状态'): Promise<void> {
  const start = performance.now()
  while (!check()) {
    if (performance.now() - start > 2000)
      throw new Error(`等了 2 秒仍没到${message}`)
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

async function open(): Promise<XhDesignerFieldImportElement> {
  element = document.createElement('xh-designer-field-import')
  element.contents = ['text', 'image', 'barcode', 'qrcode']
  document.body.append(element)
  element.show()
  await element.updateComplete
  await settle()
  return element
}

function rows(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="designer-field-import"][data-part="row"]')]
}

function cellOf(row: HTMLElement, name: string): HTMLElement {
  return row.querySelector<HTMLElement>(`[data-scope="designer-field-import"][data-part="${name}"]`)!
}

describe('导入字段对话框', () => {
  it('键入 JSON 后铺出字段：表头与各行四列对齐，下级按层级缩进', async () => {
    const dialog = await open()
    const textarea = document.querySelector<HTMLTextAreaElement>('[data-scope="designer-field-import"][data-part="input"] textarea')!
    await userEvent.click(textarea)
    await userEvent.fill(textarea, '{ "no": "SO-001", "items": [{ "sku": "A1", "qty": 2 }] }')
    await dialog.updateComplete
    await until(() => rows().length === 5, '铺出表头与四行')
    await frames()
    const [head, ...body] = rows()
    const columns = (row: HTMLElement): number[] => [...row.children].map(cell => Math.round(cell.getBoundingClientRect().left))
    for (const row of body)
      expect(columns(row)).toEqual(columns(head!))
    const nameLeft = (name: string): number => body.find(row => cellOf(row, 'name').textContent === name)!.querySelector<HTMLElement>('[data-part="name"]')!.getBoundingClientRect().left
    expect(nameLeft('sku') - nameLeft('items')).toBeGreaterThan(8)
    expect(nameLeft('no')).toBe(nameLeft('items'))
    const table = document.querySelector<HTMLElement>('[data-scope="designer-field-import"][data-part="preview"]')!
    expect(table.scrollWidth).toBeLessThanOrEqual(table.clientWidth + 1)
    await expectNoAxeViolations(document.querySelector<HTMLElement>('[data-scope="dialog"][data-part="content"]')!)
  })

  it('一行里 Tab 依次经过勾选框、显示名、类型与内容；空格勾掉一行，导入的字段里没有它', async () => {
    const dialog = await open()
    const seen: DesignerFieldImportDetail[] = []
    dialog.addEventListener('fields-import', event => seen.push((event as DesignerFieldImportEventMap['fields-import']).detail))
    const textarea = document.querySelector<HTMLTextAreaElement>('[data-scope="designer-field-import"][data-part="input"] textarea')!
    await userEvent.click(textarea)
    await userEvent.fill(textarea, '{ "a": 1, "b": "x" }')
    await until(() => rows().length === 3, '铺出两行')
    const first = rows()[1]!
    const include = cellOf(first, 'include').querySelector<HTMLElement>('button')!
    include.focus()
    const stops: (string | null)[] = []
    for (let i = 0; i < 3; i++) {
      await userEvent.keyboard('{Tab}')
      stops.push(document.activeElement?.closest('[data-scope="designer-field-import"][data-part]')?.getAttribute('data-part') ?? null)
    }
    expect(stops).toEqual(['label', 'type', 'content'])
    include.focus()
    await userEvent.keyboard(' ')
    await dialog.updateComplete
    await userEvent.click(document.querySelector<HTMLElement>('[data-scope="designer-field-import"][data-part="import"] button')!)
    expect(seen.map(detail => detail.fields.map(field => field.name))).toEqual([['b']])
  })
})
