// @vitest-environment jsdom
// 仅图标按钮的缺名提醒读挂载后的根节点：作者在根里放的视觉隐藏文字、写在根上的 aria-label 都算名字。
import type { DiagnosticRecord } from '@xihan-ui/core'
import { DIAGNOSTIC_CODES, onDiagnostic, setDiagnosticsDedupe } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElement } from '../src/define'
import { XhButtonElement } from '../src/elements/button'
import { XhVisuallyHiddenElement } from '../src/elements/visually-hidden'

defineXhElement('xh-button', XhButtonElement)
defineXhElement('xh-visually-hidden', XhVisuallyHiddenElement)

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

async function mount(rootAttrs: string, inner: string): Promise<void> {
  const host = document.createElement('div')
  host.innerHTML = `<xh-button icon-only><button data-xh-part="root" ${rootAttrs}><svg aria-hidden="true"></svg>${inner}</button></xh-button>`
  document.body.append(host)
  await (host.firstElementChild as XhButtonElement).updateComplete
  await settle()
}

describe('仅图标的 <xh-button>：可及名', () => {
  it('只有图标：报 button.missing-name', async () => {
    await mount('', '')
    expect(missing()).toBe(1)
  })

  it('根里一段视觉隐藏的文字就算有名字', async () => {
    await mount('', '<xh-visually-hidden><span data-xh-part="root">删除</span></xh-visually-hidden>')
    expect(missing()).toBe(0)
  })

  it('根上写了 aria-label 也算有名字', async () => {
    await mount('aria-label="删除"', '')
    expect(missing()).toBe(0)
  })
})
