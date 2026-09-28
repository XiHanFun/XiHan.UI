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
  it('卡片走 sheet 三件套：elevated 底 + 1px 描边 + 落影；指示符 md 档', async () => {
    notify = createNotificationService()
    notify.success('已保存', { description: '内容已同步到云端', duration: 0 })
    await tick()
    const item = part('item')
    const style = getComputedStyle(item)

    expect(style.backgroundColor).toBe(tokenColor('--xh-material-elevated-bg'))
    expect(style.borderTopColor).toBe(tokenColor('--xh-material-elevated-border'))
    expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(style.boxShadow).not.toBe('none')
    expect(resolvedLength(item, 'var(--xh-icon-size)')).toBe(resolvedLength(item, 'var(--xh-glyph-size-md)'))
    expect(getComputedStyle(part('item-title')).fontWeight).toBe('600')
    expect(getComputedStyle(part('item-description')).color).toBe(tokenColor('--xh-fg-muted'))
  })

  it('叉走 icon ghost sm：32px 正方盒钉在右上角、静息透明无影，悬停底跟着语气走', async () => {
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
    expect(rect.width).toBe(32)
    expect(rect.height).toBe(32)
    expect(rect.right).toBeLessThanOrEqual(itemRect.right)
    expect(rect.top).toBeGreaterThanOrEqual(itemRect.top)
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.boxShadow).toBe('none')
    expect(style.color).toBe(tokenColor('--xh-fg-muted'))
    expect(getComputedStyle(close, '::before').width).toBe('16px')

    await userEvent.hover(close)
    await expect.poll(() => getComputedStyle(close).backgroundColor).toBe(tokenColor('--xh-_tone-subtle', item))
    expect(getComputedStyle(close).color).toBe(tokenColor('--xh-fg-default'))
  })

  it('操作钮走 text outline sm：透明底 + 中性控件描边、32px 高，不随语气，悬停落白面阶梯的 100', async () => {
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
