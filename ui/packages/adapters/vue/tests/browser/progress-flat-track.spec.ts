// 进度条的轨道与文字：线形轨道厚 sm / md / lg = 3 / 4 / 8px、两端全圆，轨道取 fill-3 级中性填充（环形同），
// 已完成的那段按语气取实色；环心文字 12px 次级色。厚度与计算色只有真实 Chromium 量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhProgress } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

async function mount(props: Record<string, unknown>, label?: string): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '400px'
  document.body.append(host)
  app = createApp({ render: () => h(XhProgress, { 'aria-label': '进度', 'value': 40, ...props }, label == null ? undefined : () => label) })
  app.mount(host)
  await nextTick()
}

function one(name: string): Element {
  const element = host!.querySelector(`[data-scope='progress'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 progress/${name}`)
  return element
}

/** 颜色令牌在夹具里解到的值。 */
function token(name: string, scope: Element = host!): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  scope.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('线形轨道', () => {
  it.each([['sm', 3], [undefined, 4], ['lg', 8]] as const)('%s 档厚 %ipx，两端全圆', async (size, px) => {
    await mount({ size })
    const track = one('track') as HTMLElement
    expect(track.getBoundingClientRect().height).toBe(px)
    expect(getComputedStyle(track).borderTopLeftRadius).toBe('9999px')
  })

  it('轨道取 fill-3 级中性填充，已完成的那段取品牌色', async () => {
    await mount({})
    expect(getComputedStyle(one('track')).backgroundColor).toBe(token('--xh-bg-subtle-hover'))
    expect(getComputedStyle(one('range')).backgroundColor).toBe(token('--xh-bg-brand'))
  })

  it.each(['success', 'warning', 'danger'] as const)('%s 语气的填充取语气实色，轨道仍是中性', async (tone) => {
    await mount({ tone })
    const root = one('root')
    expect(getComputedStyle(one('range')).backgroundColor).toBe(token(`--xh-color-${tone}-600`))
    expect(getComputedStyle(one('track')).backgroundColor).toBe(token('--xh-bg-subtle-hover', root))
  })
})

describe('环形', () => {
  it('轨道描边取 fill-3 级中性填充，环心文字 12px 次级色', async () => {
    await mount({ variant: 'circle' }, '40%')
    expect(getComputedStyle(one('track')).stroke).toBe(token('--xh-bg-subtle-hover'))
    const label = getComputedStyle(one('label'))
    expect(label.fontSize).toBe('12px')
    expect(label.color).toBe(token('--xh-fg-muted'))
  })
})
