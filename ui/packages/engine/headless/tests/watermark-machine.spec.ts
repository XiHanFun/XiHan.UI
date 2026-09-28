// @vitest-environment jsdom
//
// watermark 的机器：地址形式的图片先取回转成内联图片再印；防篡改把被删掉的根节点原位放回、被改的属性与图样变量改回；
// 停机后不再盯；全屏档在根上投影 data-fullscreen。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { WatermarkProps } from '../src/watermark'
import { createService, normalizeProps, onDiagnostic, resetDiagnostics } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connectWatermark, watermarkMachine } from '../src/watermark'

type Dict = Record<string, unknown>

const diagnostics: DiagnosticRecord[] = []

beforeEach(() => {
  resetDiagnostics()
  diagnostics.length = 0
  onDiagnostic(record => void diagnostics.push(record))
})

afterEach(() => {
  resetDiagnostics()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

/** 与适配器同一种写法：属性逐条落，style 串整段写。 */
function paint(el: HTMLElement, props: Dict): void {
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined)
      el.removeAttribute(key)
    else
      el.setAttribute(key, String(value))
  }
}

function mount(props: WatermarkProps) {
  const runtime = createVanillaRuntime()
  const root = document.createElement('div')
  const before = document.createElement('p')
  const after = document.createElement('p')
  document.body.append(before, root, after)
  const service = createService(watermarkMachine, { runtime, props: () => props })
  service.refs.set('getRootEl', () => root)
  const api = () => connectWatermark(service, normalizeProps)
  paint(root, api().getRootProps() as Dict)
  runtime.start()
  return { root, before, after, api, stop: () => runtime.stop() }
}

async function tick(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('水印 · 防篡改', () => {
  it('抹掉内联的图样变量：改回当下 props 算出的值', async () => {
    const w = mount({ text: '曦寒' })
    await tick()
    const image = w.root.style.getPropertyValue('--xh-watermark-image')
    expect(image).toContain('data:image/svg+xml')
    w.root.style.removeProperty('--xh-watermark-image')
    w.root.removeAttribute('style')
    await tick()
    expect(w.root.style.getPropertyValue('--xh-watermark-image').trim()).toBe(image.trim())
    expect(w.root.style.getPropertyValue('--xh-watermark-tile')).not.toBe('')
    w.stop()
  })

  it('改写解剖与状态属性：改回来', async () => {
    const w = mount({ text: '曦寒' })
    await tick()
    w.root.setAttribute('data-state', 'empty')
    w.root.removeAttribute('data-scope')
    w.root.setAttribute('data-part', 'content')
    await tick()
    expect(w.root.getAttribute('data-state')).toBe('ready')
    expect(w.root.getAttribute('data-scope')).toBe('watermark')
    expect(w.root.getAttribute('data-part')).toBe('root')
    w.stop()
  })

  it('删掉根节点：原位放回，前后兄弟不变', async () => {
    const w = mount({ text: '曦寒' })
    await tick()
    w.root.remove()
    await tick()
    expect(w.root.isConnected).toBe(true)
    expect(w.root.previousSibling).toBe(w.before)
    expect(w.root.nextSibling).toBe(w.after)
    w.stop()
  })

  it('停机后不再盯：正常卸载不被当成篡改', async () => {
    const w = mount({ text: '曦寒' })
    await tick()
    w.stop()
    w.root.remove()
    w.root.removeAttribute('data-state')
    await tick()
    expect(w.root.isConnected).toBe(false)
  })

  it('全屏档在根上投影 data-fullscreen，改掉同样恢复', async () => {
    const w = mount({ text: '曦寒', fullscreen: true })
    expect(w.api().fullscreen).toBe(true)
    await tick()
    expect(w.root.getAttribute('data-fullscreen')).toBe('')
    w.root.removeAttribute('data-fullscreen')
    await tick()
    expect(w.root.getAttribute('data-fullscreen')).toBe('')
    w.stop()
  })
})

describe('水印 · 地址形式的图片', () => {
  /** jsdom 不取图也不画 canvas：替身让 Image 按需成功或失败，canvas 交回一张固定的 PNG。 */
  function stubImage(outcome: 'load' | 'error'): void {
    class FakeImage {
      crossOrigin = ''
      naturalWidth = 200
      naturalHeight = 100
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      current = ''
      get src(): string {
        return this.current
      }

      set src(value: string) {
        this.current = value
        queueMicrotask(() => (outcome === 'load' ? this.onload?.() : this.onerror?.()))
      }
    }
    vi.stubGlobal('Image', FakeImage)
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: () => {} } as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,AAAA')
  }

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('取回之前只印文字；取回后转成内联图片进图样', async () => {
    stubImage('load')
    const w = mount({ text: '曦寒', image: 'https://example.test/logo.png' })
    expect(decodeURIComponent(w.api().image)).not.toContain('<image')
    await tick()
    expect(decodeURIComponent(w.api().image)).toContain('<image href="data:image/png;base64,AAAA"')
    w.stop()
  })

  it('取不回（跨域未放行、地址失效）：这张图不印，报一条诊断，文字照印', async () => {
    stubImage('error')
    const w = mount({ text: '曦寒', image: '/missing.png' })
    await tick()
    expect(decodeURIComponent(w.api().image)).not.toContain('<image')
    expect(w.api().state).toBe('ready')
    expect(diagnostics.some(d => d.scope === 'watermark' && /Access-Control-Allow-Origin/.test(d.message))).toBe(true)
    w.stop()
  })

  it('canvas 被污染时 toDataURL 抛错，同样按取不回处理', async () => {
    stubImage('load')
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(() => {
      throw new DOMException('Tainted canvases may not be exported.', 'SecurityError')
    })
    const w = mount({ text: '曦寒', image: 'https://cross.test/logo.png' })
    await tick()
    expect(decodeURIComponent(w.api().image)).not.toContain('<image')
    expect(diagnostics.some(d => d.scope === 'watermark')).toBe(true)
    w.stop()
  })

  it('javascript: 之类的协议一概不收，也不去取', () => {
    const load = vi.fn()
    vi.stubGlobal('Image', class {
      current = ''
      get src(): string {
        return this.current
      }

      set src(value: string) {
        this.current = value
        load(value)
      }
    })
    const w = mount({ text: '曦寒', image: 'javascript:alert(1)' })
    expect(load).not.toHaveBeenCalled()
    expect(diagnostics.some(d => d.scope === 'watermark')).toBe(true)
    w.stop()
  })
})

describe('水印 · 取回的是哪一张', () => {
  it('image 换了就作废上一次取回', async () => {
    const srcs: string[] = []
    vi.stubGlobal('Image', class {
      onload: (() => void) | null = null
      naturalWidth = 10
      naturalHeight = 10
      current = ''
      get src(): string {
        return this.current
      }

      set src(value: string) {
        this.current = value
        srcs.push(value)
        queueMicrotask(() => this.onload?.())
      }
    })
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: () => {} } as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,BBBB')
    const runtime = createVanillaRuntime()
    const props = runtime.signal<WatermarkProps>({ text: '曦寒', image: '/a.png' })
    const service = createService(watermarkMachine, { runtime, props: () => props.get() })
    runtime.start()
    props.set({ text: '曦寒', image: '/b.png' })
    await tick()
    expect(srcs).toEqual(['/a.png', '/b.png'])
    expect(decodeURIComponent(connectWatermark(service, normalizeProps).image)).toContain('BBBB')
    runtime.stop()
    vi.unstubAllGlobals()
  })
})
