// @vitest-environment jsdom
// 仅图标按钮的缺名提醒读挂载后的根节点：插槽里一段视觉隐藏的文字、作者写在根上的 aria-label 都算名字。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { VNodeChild } from 'vue'
import { DIAGNOSTIC_CODES, onDiagnostic, setDiagnosticsDedupe } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhButton, XhVisuallyHidden } from '../src'

const records: DiagnosticRecord[] = []
const cleanups: Array<() => void> = []

beforeEach(() => {
  records.length = 0
  setDiagnosticsDedupe(false)
  cleanups.push(onDiagnostic(record => void records.push(record)), () => setDiagnosticsDedupe(true))
})

/** 等机器的挂载后检查跑完：它排在宿主提交 DOM 之后。 */
async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => setTimeout(resolve, 0))
}

const missing = (): number => records.filter(r => r.code === DIAGNOSTIC_CODES.buttonMissingName).length

afterEach(() => {
  for (const dispose of cleanups.splice(0).reverse()) dispose()
  document.body.innerHTML = ''
})

async function mount(attrs: Record<string, unknown>, children: () => VNodeChild): Promise<void> {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({ render: () => h(XhButton, { iconOnly: true, ...attrs }, children) })
  app.mount(host)
  cleanups.push(() => app.unmount())
  await settle()
}

const icon = (): VNodeChild => h('svg', { 'aria-hidden': 'true' })

describe('仅图标的 XhButton：可及名', () => {
  it('只有图标：报 button.missing-name', async () => {
    await mount({}, () => [icon()])
    expect(missing()).toBe(1)
  })

  it('插槽里一段视觉隐藏的文字就算有名字', async () => {
    await mount({}, () => [icon(), h(XhVisuallyHidden, null, () => '删除')])
    expect(missing()).toBe(0)
  })

  it('根上写了 aria-label 也算有名字', async () => {
    await mount({ 'aria-label': '删除' }, () => [icon()])
    expect(missing()).toBe(0)
  })
})
