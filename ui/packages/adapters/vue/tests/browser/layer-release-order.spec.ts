// 开着的下拉、从外面点开抽屉：按下那一刻下拉逻辑收起，层还留在栈里播退场；同一次点击打开的抽屉压在它上面，
// 下拉播完退场后从抽屉下面释放。抽屉不开在下拉里，这样的释放顺序是正常的，层级栈不报 core.layer.dispose-not-top。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { App } from 'vue'
import { DIAGNOSTIC_CODES, getLayerRegistry, onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhDrawerContent, XhDrawerRoot, XhDrawerTitle, XhDrawerTrigger, XhTreeSelectRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const fields = [{ value: 'order', label: '订单', children: [{ value: 'no', label: '订单号' }, { value: 'date', label: '下单日期' }] }]

let app: App | null = null
let host: HTMLElement | null = null
let stop: (() => void) | null = null

afterEach(() => {
  stop?.()
  app?.unmount()
  host?.remove()
  stop = null
  app = null
  host = null
})

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++) {
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

describe('层级栈的释放顺序（Vue）', () => {
  it('开着的树选择、从外面点开抽屉：下拉收起后从抽屉下面释放，不报诊断', async () => {
    const records: DiagnosticRecord[] = []
    stop = onDiagnostic(record => void records.push(record))
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => [
        h(XhTreeSelectRoot, { 'collection': fields, 'searchable': true, 'aria-label': '字段' }),
        h(XhDrawerRoot, null, () => [
          h(XhDrawerTrigger, null, () => '模板设置'),
          h(XhDrawerContent, null, () => h(XhDrawerTitle, null, () => '模板设置')),
        ]),
      ],
    })
    app.mount(host)
    await settle()
    const registry = getLayerRegistry(document)

    await userEvent.click(host.querySelector<HTMLElement>('[data-scope="tree-select"][data-part="trigger"]')!)
    await settle()
    expect(registry.list()).toHaveLength(1)
    const select = registry.top()

    await userEvent.click(host.querySelector<HTMLElement>('[data-scope="drawer"][data-part="trigger"]')!)
    // 抽屉入栈时下拉的层还在播退场
    await expect.poll(() => registry.list().length).toBe(2)
    expect(registry.list()[0]).toBe(select)
    await expect.poll(() => registry.list().length).toBe(1)
    expect(registry.top()).not.toBe(select)
    expect(document.querySelector('[data-scope="drawer"][data-part="content"]')?.getAttribute('data-state')).toBe('open')
    expect(records.filter(record => record.code === DIAGNOSTIC_CODES.layerDisposeNotTop)).toEqual([])
  })
})
