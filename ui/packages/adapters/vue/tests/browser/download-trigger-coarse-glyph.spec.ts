// 粗指针下没写内容的下载钮：兜底字形画在根的 ::after 上，热区由皮肤挪到 ::before；
// 家族 text 档的热区规则却仍落在同一个 ::after 上——皮肤只写了字形的尺寸与 mask，定位、44px 下限与
// -50% 平移都从家族漏进来，字形被拎出行内流、盒撑到 44px 高，按钮自己随之收窄 20px。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhDownloadTrigger } from '../../src'
import { coarsePointer, finePointer, pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  await finePointer()
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 80px'
  document.body.append(host)
  app = createApp({ render: () => h(XhDownloadTrigger, { 'data-testid': 'download', 'data': 'hi', 'fileName': 'a.txt' }) })
  app.mount(host)
  await nextTick()
  const root = host.querySelector<HTMLElement>('[data-testid=\'download\'][data-part=\'root\']')
  if (!root)
    throw new Error('缺少 download-trigger 根')
  expect(root.matches(':empty')).toBe(true)
  return root
}

describe('粗指针下的下载钮兜底字形', () => {
  it('字形留在行内流里、盒等于字形尺寸，按钮宽度与细指针一致；热区由 ::before 给', async () => {
    const root = await mount()
    const fine = root.getBoundingClientRect()
    const fineGlyph = pseudoBox(root, '::after')
    expect(fineGlyph.width).toBe(20)
    expect(fineGlyph.height).toBe(20)

    await coarsePointer()
    const coarse = root.getBoundingClientRect()
    const glyph = getComputedStyle(root, '::after')
    const box = pseudoBox(root, '::after')
    const observed = `::after position=${glyph.position} min-block-size=${glyph.minBlockSize} translate=${glyph.translate} box=${JSON.stringify(box)} root fine=${fine.width}×${fine.height} coarse=${coarse.width}×${coarse.height}`
    expect(glyph.position, observed).toBe('static')
    expect(box.width, observed).toBe(20)
    expect(box.height, observed).toBe(20)
    expect(coarse.width, observed).toBe(fine.width)
    expect(coarse.height, observed).toBe(fine.height)

    const target = pseudoBox(root, '::before')
    expect(target.height).toBeGreaterThanOrEqual(44)
    expect(Math.abs(target.centerX - (coarse.left + coarse.width / 2))).toBeLessThanOrEqual(1)
    expect(Math.abs(target.centerY - (coarse.top + coarse.height / 2))).toBeLessThanOrEqual(1)
  })
})
