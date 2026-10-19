// 开着的下拉、从外面点开抽屉：按下那一刻下拉逻辑收起，层还留在栈里播退场；同一次点击打开的抽屉压在它上面，
// 下拉播完退场后从抽屉下面释放。抽屉不开在下拉里，这样的释放顺序是正常的，层级栈不报 core.layer.dispose-not-top。
// 第二条把下拉和打开抽屉的按钮都放进模态对话框：栈是对话框、下拉、抽屉，下拉从中间释放（Web Components）。
import type { DiagnosticRecord } from '@xihan-ui/core'
import { DIAGNOSTIC_CODES, getLayerRegistry, onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const fields = [{ value: 'order', label: '订单', children: [{ value: 'no', label: '订单号' }, { value: 'date', label: '下单日期' }] }]

const DRAWER = `
  <xh-drawer>
    <div data-xh-part="root">
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content"><h2 data-xh-part="title">模板设置</h2><button type="button">保存</button></div>
      </div>
    </div>
  </xh-drawer>`

let stop: (() => void) | null = null

afterEach(() => {
  stop?.()
  stop = null
  document.body.replaceChildren()
})

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 挂好树选择与抽屉，按钮点下去打开抽屉；返回诊断记录。 */
async function mount(markup: string): Promise<DiagnosticRecord[]> {
  const records: DiagnosticRecord[] = []
  stop = onDiagnostic(record => void records.push(record))
  document.body.innerHTML = markup
  const select = document.querySelector('xh-tree-select') as HTMLElement & { collection: unknown, updateComplete: Promise<unknown> }
  select.collection = fields
  const drawer = document.querySelector('xh-drawer') as HTMLElement & { open: boolean }
  document.querySelector('[data-open-drawer]')!.addEventListener('click', () => {
    drawer.open = true
  })
  await select.updateComplete
  await settle()
  return records
}

async function openSelectThenDrawer(): Promise<void> {
  const registry = getLayerRegistry(document)
  const before = registry.list().length
  await userEvent.click(document.querySelector<HTMLElement>('[data-scope="tree-select"][data-part="trigger"]')!)
  await settle()
  expect(registry.list()).toHaveLength(before + 1)
  const select = registry.top()

  await userEvent.click(document.querySelector<HTMLElement>('[data-open-drawer]')!)
  // 抽屉入栈时下拉的层还在播退场：压在它上面
  await expect.poll(() => registry.list().length).toBe(before + 2)
  expect(registry.list()[before]).toBe(select)
  await expect.poll(() => registry.list().length).toBe(before + 1)
  expect(registry.list()).not.toContain(select)
  expect(document.querySelector('[data-scope="drawer"][data-part="content"]')?.getAttribute('data-state')).toBe('open')
}

describe('层级栈的释放顺序（Web Components）', () => {
  it('开着的树选择、从外面点开抽屉：下拉收起后从抽屉下面释放，不报诊断', async () => {
    const records = await mount(`
      <button type="button" data-open-drawer>模板设置</button>
      <xh-tree-select searchable aria-label="字段"></xh-tree-select>
      ${DRAWER}`)
    await openSelectThenDrawer()
    expect(records.filter(record => record.code === DIAGNOSTIC_CODES.layerDisposeNotTop)).toEqual([])
  })

  it('下拉与按钮都在模态对话框里：栈是对话框、下拉、抽屉，下拉从中间释放也不报', async () => {
    const records = await mount(`
      <xh-dialog default-open>
        <div data-xh-part="root">
          <div data-xh-part="backdrop"></div>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <h2 data-xh-part="title">编辑模板</h2>
              <button type="button" data-open-drawer>模板设置</button>
              <xh-tree-select searchable aria-label="字段"></xh-tree-select>
            </div>
          </div>
        </div>
      </xh-dialog>
      ${DRAWER}`)
    const registry = getLayerRegistry(document)
    await expect.poll(() => registry.list().length).toBe(1)
    await openSelectThenDrawer()
    expect(registry.list()).toHaveLength(2)
    expect(records.filter(record => record.code === DIAGNOSTIC_CODES.layerDisposeNotTop)).toEqual([])
  })
})
