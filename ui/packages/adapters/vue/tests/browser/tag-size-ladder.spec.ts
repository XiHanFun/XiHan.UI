// 标签三档的阶梯：逐档钉住根的高、字号、内边距与关闭钮的边长。
// 皮肤里三档只换几个私有槽，槽一改，同一排标签的高矮就换了；这里量的是真实浏览器算出来的盒，
// 一档一档对数，任何一档悄悄涨缩都在这里露头。jsdom 不排版，getBoundingClientRect 恒零，只能在浏览器里量。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from '../../src'
// 皮肤与令牌要一起加载：这里查的就是皮肤按槽算出来的值
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Tier = 'sm' | 'md' | 'lg'

const TIERS: Tier[] = ['sm', 'md', 'lg']

/** 逐档的登记值：根的高（px）、字号、竖向与横向内边距、关闭钮的边长。 */
interface TierSpec {
  /** 根的高，有没有关闭钮都是这个数 */
  height: number
  fontSize: string
  py: string
  px: string
  /** 关闭钮的边长 */
  close: number
}

const LADDER: Record<Tier, TierSpec> = {
  sm: { height: 22, fontSize: '12px', py: '2px', px: '6px', close: 16 },
  md: { height: 26, fontSize: '13px', py: '4px', px: '8px', close: 16 },
  lg: { height: 30, fontSize: '14px', py: '4px', px: '12px', close: 16 },
}

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

async function mount(render: () => VNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

/** 一枚标签：size 不传即缺省档；closable 时带上关闭钮。 */
function tag(size: Tier | undefined, closable: boolean): VNode {
  const children = [h(XhTagLabel, null, () => '标签')]
  if (closable)
    children.push(h(XhTagCloseTrigger))
  return h(XhTagRoot, { size, closable, variant: 'subtle' }, () => children)
}

function part(name: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='tag'][data-part='${name}']`)
  if (!el)
    throw new Error(`挂载树里没有 tag 的 ${name}`)
  return el
}

interface Measured {
  height: number
  fontSize: string
  py: string
  px: string
  close: number | null
}

async function measure(size: Tier | undefined, closable: boolean): Promise<Measured> {
  await mount(() => tag(size, closable))
  const root = part('root')
  const style = getComputedStyle(root)
  const close = closable ? part('close-trigger').getBoundingClientRect() : null
  const measured: Measured = {
    height: root.getBoundingClientRect().height,
    fontSize: style.fontSize,
    py: style.paddingTop,
    px: style.paddingLeft,
    close: close ? close.height : null,
  }
  expect(style.paddingBottom).toBe(measured.py)
  expect(style.paddingRight).toBe(measured.px)
  if (close)
    expect(close.width).toBe(close.height)
  app?.unmount()
  host?.remove()
  return measured
}

describe('标签的尺寸阶梯', () => {
  it.each(TIERS)('%s 档：只有文字时的高、字号与内边距', async (tier) => {
    const spec = LADDER[tier]
    const measured = await measure(tier, false)

    expect(measured.height).toBe(spec.height)
    expect(measured.fontSize).toBe(spec.fontSize)
    expect(measured.py).toBe(spec.py)
    expect(measured.px).toBe(spec.px)
  })

  it.each(TIERS)('%s 档：带关闭钮时与只有文字时一样高，关闭钮的边长随档走', async (tier) => {
    const spec = LADDER[tier]
    const measured = await measure(tier, true)

    expect(measured.height).toBe(spec.height)
    expect(measured.close).toBe(spec.close)
  })

  it('不写档位就是 md 档', async () => {
    const plain = await measure(undefined, false)
    const closable = await measure(undefined, true)

    expect(plain.height).toBe(LADDER.md.height)
    expect(plain.fontSize).toBe(LADDER.md.fontSize)
    expect(closable.height).toBe(LADDER.md.height)
    expect(closable.close).toBe(LADDER.md.close)
  })

  it('三档的高严格递增，台阶一样宽', async () => {
    const heights: number[] = []
    for (const tier of TIERS)
      heights.push((await measure(tier, true)).height)
    const [sm, md, lg] = heights as [number, number, number]

    expect(sm).toBeLessThan(md)
    expect(md).toBeLessThan(lg)
    expect(md - sm).toBe(lg - md)
  })

  it('compact 密度下三档随指示符档各收一号，台阶仍一样宽', async () => {
    const heights: number[] = []
    for (const tier of TIERS) {
      host = document.createElement('div')
      host.dataset.density = 'compact'
      document.body.append(host)
      app = createApp({ setup: () => () => tag(tier, true) })
      app.mount(host)
      await nextTick()
      await nextTick()
      heights.push(part('root').getBoundingClientRect().height)
      expect(part('close-trigger').getBoundingClientRect().height).toBe(14)
      app.unmount()
      host.remove()
    }

    expect(heights).toEqual([20, 24, 28])
  })

  it('嵌套密度作用域重新解析关闭钮别名，宽松子树不继承紧凑尺寸', async () => {
    await mount(() => h('div', { 'data-density': 'compact' }, [
      tag('md', true),
      h('div', { 'data-density': 'comfortable' }, [tag('md', true)]),
    ]))
    const closeTriggers = host!.querySelectorAll<HTMLElement>('[data-scope=tag][data-part=close-trigger]')
    expect(closeTriggers).toHaveLength(2)
    expect(closeTriggers[0]!.getBoundingClientRect().height).toBe(14)
    expect(closeTriggers[1]!.getBoundingClientRect().height).toBe(16)
  })

  it('作者把字号调得比行框还大，行框跟着字走，文字不被 label 的截断剪掉上下沿', async () => {
    host = document.createElement('div')
    host.style.cssText = '--xh-tag-font-size: 24px'
    document.body.append(host)
    app = createApp({ setup: () => () => tag('md', true) })
    app.mount(host)
    await nextTick()
    await nextTick()
    const label = part('label').getBoundingClientRect()
    const close = part('close-trigger').getBoundingClientRect()
    const root = part('root').getBoundingClientRect()

    expect(getComputedStyle(part('root')).fontSize).toBe('24px')
    expect(label.height).toBeGreaterThanOrEqual(24)
    expect(close.height).toBe(LADDER.md.close)
    expect(root.height).toBe(label.height + 2 * Number.parseFloat(LADDER.md.py) + 2)
  })

  it('md 档带关闭钮放进 md 档控件的行高里不撑高', async () => {
    await mount(() => h(
      'div',
      { style: 'display:inline-flex;align-items:center;block-size:var(--xh-control-h-md)' },
      [tag('md', true)],
    ))
    const control = host!.firstElementChild as HTMLElement
    const tagHeight = part('root').getBoundingClientRect().height

    expect(control.getBoundingClientRect().height).toBe(32)
    expect(tagHeight).toBeLessThanOrEqual(32)
  })
})
