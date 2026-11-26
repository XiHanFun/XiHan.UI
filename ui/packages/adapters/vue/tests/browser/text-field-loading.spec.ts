// TextField 的在途指示：盒里输入框之后一枚加载环，直径取控件内图标档、不撑高盒子；
// 撤掉在途即收起。几何、伪元素的环与动画状态只能在真实 Chromium 中验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhTextFieldRoot } from '../../src'
import { tokenLength } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null
const loading = ref(true)

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='text-field'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到部件 ${name}`)
  return element
}

async function mountField(props: Record<string, unknown> = {}): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 24px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTextFieldRoot, { label: '搜索', defaultValue: '曦寒', loading: loading.value, ...props }),
  })
  app.mount(host)
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  loading.value = true
})

describe('文本字段的在途指示', () => {
  it('环坐在盒里输入框之后，直径取控件内图标档，盒高不变', async () => {
    await mountField()
    const control = part('control')
    const input = part('input')
    const ring = part('loading')
    const glyph = tokenLength('--xh-glyph-size-md')
    expect(control.getBoundingClientRect().height).toBe(tokenLength('--xh-control-h-md'))
    const r = ring.getBoundingClientRect()
    expect(r.width).toBe(glyph)
    expect(r.height).toBe(glyph)
    // 在盒里、排在输入框之后，垂直居中
    const c = control.getBoundingClientRect()
    expect(r.left).toBeGreaterThanOrEqual(input.getBoundingClientRect().right)
    expect(r.right).toBeLessThanOrEqual(c.right)
    expect(r.top + r.height / 2).toBeCloseTo(c.top + c.height / 2, 0)
  })

  it('环由加载环配方画在 ::before 上，在途时转着；输入框报 aria-busy、照常可聚焦', async () => {
    await mountField()
    const before = getComputedStyle(part('loading'), '::before')
    expect(before.borderTopStyle).toBe('solid')
    expect(before.animationName).toBe('xh-spin')
    expect(before.animationPlayState).toBe('running')
    const input = part('input') as HTMLInputElement
    expect(input.getAttribute('aria-busy')).toBe('true')
    input.focus()
    expect(document.activeElement).toBe(input)
  })

  it('撤掉在途即收起：环不再占位，输入框收回那一截宽度', async () => {
    await mountField()
    const busyWidth = part('input').getBoundingClientRect().width
    loading.value = false
    await nextTick()
    expect(document.querySelector(`[data-scope='text-field'][data-part='loading']`)).toBeNull()
    expect(part('input').getBoundingClientRect().width).toBeGreaterThan(busyWidth)
    expect(part('input').hasAttribute('aria-busy')).toBe(false)
  })

  it('尺寸档跟着走：sm / lg 的环取各自的图标档', async () => {
    await mountField({ size: 'sm' })
    expect(part('loading').getBoundingClientRect().width).toBe(tokenLength('--xh-glyph-size-sm'))
    app?.unmount()
    host?.remove()
    await mountField({ size: 'lg' })
    expect(part('loading').getBoundingClientRect().width).toBe(tokenLength('--xh-glyph-size-lg'))
  })
})
