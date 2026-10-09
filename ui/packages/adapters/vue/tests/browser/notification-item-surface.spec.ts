// Notification 卡片的 sheet 三件套与两颗 Action Control 钮依赖真实计算样式、布局与伪类。
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { nextTick } from 'vue'
import { createNotificationService } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Service = ReturnType<typeof createNotificationService>
let notify: Service | null = null

/** 等卡片渲染并跑完入场动画：进场是位移 + scale，量盒必须在它落定之后。 */
async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
  const item = document.querySelector<HTMLElement>(`[data-scope='notification'][data-part='item']`)
  // 只等有尽头的：加载中那枚环是无限循环，等它就永远等不完
  if (item) {
    await Promise.all(item.getAnimations({ subtree: true })
      .filter(animation => Number.isFinite(Number(animation.effect?.getComputedTiming().endTime)))
      .map(animation => animation.finished))
  }
}

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='notification'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 notification/${name}`)
  return element
}

/** 在某个部件里把令牌解析成这台浏览器上的最终颜色，用来与各态取值对账。 */
function tokenColor(token: string, scope: HTMLElement = document.body): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  scope.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function resolvedLength(scope: HTMLElement, value: string): number {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;inline-size:${value}`
  scope.append(probe)
  const resolved = probe.getBoundingClientRect().width
  probe.remove()
  return resolved
}

afterEach(async () => {
  notify?.dispose()
  notify = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('通知卡片的表面与两颗钮', () => {
  it('卡片走 sheet 三件套：elevated 底 + 1px 描边 + 单层落影，缺省宽 300px、四边内衬 20px、浮层圆角', async () => {
    notify = createNotificationService()
    notify.success('已保存', { description: '内容已同步到云端', duration: 0 })
    await tick()
    const item = part('item')
    const style = getComputedStyle(item)

    expect(style.backgroundColor).toBe(tokenColor('--xh-material-elevated-bg'))
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderTopColor).toBe(tokenColor('--xh-material-elevated-border'))
    expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(style.boxShadow).toContain('0px 4px 12px')
    expect(style.borderRadius).toBe('4px')
    expect(item.getBoundingClientRect().width).toBe(300)
    expect(item.getBoundingClientRect().width).toBe(resolvedLength(item, 'var(--xh-overlay-notification-w)'))
    expect(style.paddingTop).toBe('20px')
    expect(style.paddingBottom).toBe('20px')
    expect(style.paddingLeft).toBe('20px')
    expect(style.paddingRight).toBe('20px')
    // 卡片里作者塞的图标仍按 Feedback 指示符的 md 档；左列那枚类型字形另取 24px
    expect(resolvedLength(item, 'var(--xh-icon-size)')).toBe(resolvedLength(item, 'var(--xh-glyph-size-md)'))
    expect(getComputedStyle(part('item-indicator'), '::after').width).toBe('24px')
  })

  it('标题取面板标题令牌、正文色，与 24px 字形首行对齐；正文 14px 正文色', async () => {
    notify = createNotificationService()
    notify.success('已保存', { description: '内容已同步到云端', duration: 0 })
    await tick()
    const item = part('item')
    const title = getComputedStyle(part('item-title'))
    const description = getComputedStyle(part('item-description'))

    expect(title.fontSize).toBe(`${resolvedLength(item, 'var(--xh-text-heading-3-size)')}px`)
    expect(title.color).toBe(tokenColor('--xh-fg-default'))
    const weight = document.createElement('span')
    weight.style.fontWeight = 'var(--xh-text-heading-3-weight)'
    item.append(weight)
    expect(title.fontWeight).toBe(getComputedStyle(weight).fontWeight)
    weight.remove()
    expect(description.fontSize).toBe('14px')
    expect(description.color).toBe(tokenColor('--xh-fg-default'))
    const indicator = part('item-indicator').getBoundingClientRect()
    const titleRect = part('item-title').getBoundingClientRect()
    expect(indicator.top + indicator.height / 2).toBeCloseTo(titleRect.top + titleRect.height / 2, 0)
  })

  it('叉走 icon ghost sm：正方盒距上、右各 12px，叉 12px，静息透明无影，悬停底跟着语气走', async () => {
    notify = createNotificationService()
    notify.success('已保存', { duration: 0 })
    await tick()
    const item = part('item')
    const close = part('item-close-trigger')
    const rect = close.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    const style = getComputedStyle(close)

    expect(close.dataset.xhActionProfile).toBe('icon')
    expect(close.dataset.xhActionVariant).toBe('ghost')
    expect(rect.width).toBe(resolvedLength(item, 'var(--xh-control-h-sm)'))
    expect(rect.height).toBe(resolvedLength(item, 'var(--xh-control-h-sm)'))
    // 绝对定位从卡片的内沿量起：1px 描边以内再让 12px
    expect(itemRect.right - 1 - rect.right).toBeCloseTo(12, 0)
    expect(rect.top - itemRect.top - 1).toBeCloseTo(12, 0)
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.boxShadow).toBe('none')
    expect(style.color).toBe(tokenColor('--xh-fg-muted'))
    expect(getComputedStyle(close, '::before').width).toBe('12px')

    await userEvent.hover(close)
    await expect.poll(() => getComputedStyle(close).backgroundColor).toBe(tokenColor('--xh-_tone-subtle', item))
    expect(getComputedStyle(close).color).toBe(tokenColor('--xh-fg-default'))
  })

  it('操作钮走 text outline sm：透明底 + 中性控件描边、与 sm 档控件等高，不随语气，悬停落白面阶梯的 100', async () => {
    notify = createNotificationService()
    notify.success('已保存', { duration: 0, actionLabel: '查看' })
    await tick()
    const item = part('item')
    const action = part('item-action-trigger')
    const style = getComputedStyle(action)

    expect(action.dataset.xhActionProfile).toBe('text')
    expect(action.dataset.xhActionVariant).toBe('outline')
    expect(action.getBoundingClientRect().height).toBe(resolvedLength(item, 'var(--xh-control-h-sm)'))
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.borderTopColor).toBe(tokenColor('--xh-border-control'))
    expect(style.color).toBe(tokenColor('--xh-fg-default'))
    expect(style.boxShadow).toBe('none')
    expect(style.fontWeight).toBe('500')

    await userEvent.hover(action)
    await expect.poll(() => getComputedStyle(action).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(getComputedStyle(action).borderTopColor).toBe(tokenColor('--xh-border-control-hover'))
  })
})

describe('通知卡片的加载指示', () => {
  it('加载中画的是与 Spinner 环档同一副加载环：轨道中性、起始边语气色，转起来，语气字形让位', async () => {
    notify = createNotificationService()
    notify.create({ title: '正在上传', loading: true, tone: 'info', duration: 0 })
    await tick()
    const indicator = part('item-indicator')
    const ring = getComputedStyle(indicator, '::before')
    expect(ring.maskImage).toBe('none')
    expect(ring.borderTopStyle).toBe('solid')
    expect(ring.borderTopLeftRadius).toBe('50%')
    expect(ring.borderRightColor).toBe(tokenColor('--xh-border-default'))
    expect(ring.borderTopColor).toBe(getComputedStyle(indicator).color)
    expect(ring.animationName).toBe('xh-spin')
    expect(ring.animationPlayState).toBe('running')
    expect(ring.opacity).toBe('1')
    expect(getComputedStyle(indicator, '::after').opacity).toBe('0')
  })

  it('加载落定时环淡出、语气字形淡入，同一格里交叉淡变', async () => {
    notify = createNotificationService()
    const id = notify.create({ title: '正在上传', loading: true, tone: 'info', duration: 0 })
    await tick()
    const indicator = part('item-indicator')
    notify.update(id, { loading: false, tone: 'success', title: '已上传' })
    await expect.poll(() => part('item').hasAttribute('data-loading')).toBe(false)
    const fades = (): Animation[] => indicator.getAnimations({ subtree: true })
      .filter(a => (a as CSSTransition).transitionProperty === 'opacity')
    expect(fades().map(a => (a.effect as KeyframeEffect).pseudoElement)).toEqual(expect.arrayContaining(['::before', '::after']))
    await Promise.all(fades().map(a => a.finished))
    expect(getComputedStyle(indicator, '::before').opacity).toBe('0')
    expect(getComputedStyle(indicator, '::after').opacity).toBe('1')
    expect(getComputedStyle(indicator, '::after').maskImage).not.toBe('none')
  })
})

describe('通知卡片的长正文', () => {
  it('正文有上限：长文在正文里竖滚，卡片不被撑到整屏高，标题与操作钮留在卡片上', async () => {
    notify = createNotificationService()
    const body = Array.from({ length: 80 }, (_, i) => `第 ${i + 1} 条公告正文，内容较长，用来把通知卡片撑高。`).join('')
    notify.info('系统公告', { description: body, duration: 0, actionLabel: '查看全文' })
    await tick()
    const description = part('item-description')
    const cap = resolvedLength(description, 'var(--xh-viewport-h-md)')
    expect(description.getBoundingClientRect().height).toBeLessThanOrEqual(cap + 0.5)
    expect(description.scrollHeight).toBeGreaterThan(description.clientHeight)
    expect(getComputedStyle(description).overflowY).toBe('auto')
    expect(getComputedStyle(description).overscrollBehaviorY).toBe('contain')
    // 整张卡片落在视口里：标题在顶、操作钮在底，都看得到
    const item = part('item').getBoundingClientRect()
    expect(item.top).toBeGreaterThanOrEqual(0)
    expect(item.bottom).toBeLessThanOrEqual(window.innerHeight)
  })
})
