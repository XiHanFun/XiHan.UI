// @vitest-environment jsdom
// 仅图标按钮的缺名提醒读挂载后的根节点：children 里一段视觉隐藏的文字、写在根上的 aria-label 都算名字。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { ReactNode } from 'react'
import { DIAGNOSTIC_CODES, onDiagnostic, setDiagnosticsDedupe } from '@xihan-ui/core'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
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

async function mount(node: ReactNode): Promise<void> {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(node)
  })
  cleanups.push(() => act(() => root.unmount()))
  await act(settle)
}

const icon = <svg aria-hidden="true" />

describe('仅图标的 XhButton：可及名', () => {
  it('只有图标：报 button.missing-name', async () => {
    await mount(<XhButton iconOnly>{icon}</XhButton>)
    expect(missing()).toBe(1)
  })

  it('children 里一段视觉隐藏的文字就算有名字', async () => {
    await mount(
      <XhButton iconOnly>
        {icon}
        <XhVisuallyHidden>删除</XhVisuallyHidden>
      </XhButton>,
    )
    expect(missing()).toBe(0)
  })

  it('根上写了 aria-label 也算有名字', async () => {
    await mount(<XhButton iconOnly aria-label="删除">{icon}</XhButton>)
    expect(missing()).toBe(0)
  })
})
