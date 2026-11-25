// @vitest-environment jsdom
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { ButtonSchema } from '../src'
import { createService, DIAGNOSTIC_CODES, onDiagnostic, setDiagnosticsDedupe } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buttonMachine } from '../src'

const cleanups: Array<() => void> = []
let records: DiagnosticRecord[] = []

beforeEach(() => {
  records = []
  // 每条用例各自判一次，不被前一条的去重吞掉
  setDiagnosticsDedupe(false)
  cleanups.push(onDiagnostic(record => void records.push(record)), () => setDiagnosticsDedupe(true))
})

afterEach(() => {
  for (const dispose of cleanups.splice(0).reverse()) dispose()
  document.body.innerHTML = ''
})

/** 把作者写的按钮标记挂进文档，起一台按钮机器并等它的挂载后检查跑完。 */
async function mount(html: string, props: ButtonSchema['props'] = { iconOnly: true }): Promise<HTMLElement> {
  document.body.innerHTML = html
  const root = document.body.firstElementChild as HTMLElement
  const runtime = createVanillaRuntime()
  const service = createService(buttonMachine, { runtime, props: () => props })
  service.refs.set('getRootEl', () => root)
  runtime.start()
  cleanups.push(() => runtime.stop())
  await Promise.resolve()
  await new Promise(resolve => setTimeout(resolve, 0))
  return root
}

const missing = (): DiagnosticRecord[] => records.filter(r => r.code === DIAGNOSTIC_CODES.buttonMissingName)

describe('仅图标按钮的可及名', () => {
  it('只有 aria-hidden 的图标：报 button.missing-name，指向根节点', async () => {
    const root = await mount('<button><svg aria-hidden="true"></svg></button>')
    expect(missing()).toHaveLength(1)
    expect(missing()[0]!.node).toBe(root)
  })

  it('按钮里一段视觉隐藏的文字就算有名字', async () => {
    await mount('<button><svg aria-hidden="true"></svg><span data-scope="visually-hidden" data-part="root">删除</span></button>')
    expect(missing()).toHaveLength(0)
  })

  it('根上写了 aria-label / aria-labelledby / title 都算有名字', async () => {
    await mount('<button aria-label="删除"><svg aria-hidden="true"></svg></button>')
    await mount('<button aria-labelledby="x"><svg aria-hidden="true"></svg></button>')
    await mount('<button title="删除"><svg aria-hidden="true"></svg></button>')
    expect(missing()).toHaveLength(0)
  })

  it('图标自己带名字（子元素的 aria-label、图片的 alt）也算', async () => {
    await mount('<button><svg role="img" aria-label="删除"></svg></button>')
    await mount('<button><img alt="删除" src=""></button>')
    expect(missing()).toHaveLength(0)
  })

  it('藏在 aria-hidden 里的文字不算', async () => {
    await mount('<button><span aria-hidden="true">×</span></button>')
    expect(missing()).toHaveLength(1)
  })

  it('不是仅图标的按钮不查', async () => {
    await mount('<button><svg aria-hidden="true"></svg></button>', {})
    expect(missing()).toHaveLength(0)
  })
})
