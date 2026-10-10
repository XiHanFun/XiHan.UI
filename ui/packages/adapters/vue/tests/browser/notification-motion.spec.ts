// 通知的进退场与补位：叠成一摞的轻提示与逐条排开的卡片。
// 关键帧的起点、补位的时机与离场替身都要真实的样式计算与动画时间线，只有 Chromium 量得出来；
// 摞是 fixed 定位面，套一层固定视口的 iframe，把服务的宿主容器指进去。
import type { NotificationServiceOptions } from '../../src'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createNotificationService } from '../../src'
import { closeFrame, openFrame } from './viewport-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let dispose: (() => void) | null = null

afterEach(() => {
  dispose?.()
  dispose = null
  closeFrame()
})

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
}

const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

function setup(options: Omit<NotificationServiceOptions, 'target'>, dir: 'ltr' | 'rtl' = 'ltr') {
  const doc = openFrame(414, 640)
  doc.documentElement.dir = dir
  const target = doc.createElement('div')
  doc.body.append(target)
  const service = createNotificationService({ ...options, target })
  dispose = () => service.dispose()
  const items = (): HTMLElement[] => [...doc.querySelectorAll<HTMLElement>('[data-scope="notification"][data-part="item"]')]
  const live = (): HTMLElement[] => items().filter(el => !el.hidden && el.dataset.state !== 'closed')
  const ghosts = (): HTMLElement[] => items().filter(el => el.dataset.state === 'closed')
  const titled = (title: string): HTMLElement => {
    const el = live().find(item => item.querySelector('[data-part="item-title"]')?.textContent === title)
    if (!el)
      throw new Error(`找不到「${title}」那一条`)
    return el
  }
  return { doc, service, items, live, ghosts, titled }
}

function animationNames(el: HTMLElement): string[] {
  return el.getAnimations().map(animation => (animation as CSSAnimation).animationName)
}

/** 停在某条关键帧的起点读计算样式：起点那一帧的位移就是进场从哪里出发。 */
function startOf(el: HTMLElement, name: string): [number, number] {
  const animation = el.getAnimations().find(a => (a as CSSAnimation).animationName === name)
  if (!animation)
    throw new Error(`没在播 ${name}，在播的是 ${animationNames(el).join(', ') || '无'}`)
  animation.pause()
  animation.currentTime = 0
  // 计算样式里的 translate 保留百分比：按自身的宽高折成像素
  const [x = '0', y = '0'] = getComputedStyle(el).translate.split(/\s+/)
  const rect = el.getBoundingClientRect()
  const px = (value: string, base: number): number =>
    value.endsWith('%') ? Number.parseFloat(value) / 100 * base : Number.parseFloat(value) || 0
  return [px(x, el.offsetWidth || rect.width), px(y, el.offsetHeight || rect.height)]
}

function token(el: HTMLElement, name: string): number {
  return Number.parseFloat(el.ownerDocument.defaultView!.getComputedStyle(el).getPropertyValue(name))
}

describe('叠成一摞的轻提示', () => {
  it('进场只从叠放外沿推进来一小段（distance-lg），不是整张卡高', async () => {
    const { service, titled } = setup({ preset: 'toast' })
    service.success('已发布', { duration: 0 })
    await tick()
    const item = titled('已发布')
    const travel = token(item, '--xh-motion-distance-lg')
    expect(travel).toBeGreaterThan(0)
    const [, y] = startOf(item, 'xh-notification-stack-in')
    expect(Math.abs(y)).toBeCloseTo(travel, 0)
    expect(Math.abs(y)).toBeLessThan(item.getBoundingClientRect().height)
  })

  it('最前那条开始退场的那一刻，后面那条当场补成最前，与它的退场同时走', async () => {
    const { service, titled } = setup({ preset: 'toast' })
    service.warning('配额即将用尽', { duration: 0 })
    service.success('已发布', { duration: 0 })
    await tick()
    await wait(300)
    const front = titled('已发布')
    const behind = titled('配额即将用尽')
    expect(behind.dataset.stackIndex).toBe('1')
    front.querySelector<HTMLElement>('[data-part="item-close-trigger"]')!.click()
    await tick()
    // 它还在台上播退场，后面那条已经补到最前，不等它收起
    expect(front.dataset.state).toBe('dismissing')
    expect(front.isConnected && !front.hidden).toBe(true)
    expect(behind.dataset.stackIndex).toBe('0')
    expect(behind.hasAttribute('data-frontmost')).toBe(true)
    // 退场的那条压在补上来的那条上面淡出
    expect(Number(front.style.zIndex)).toBeGreaterThan(Number(behind.style.zIndex))
  })

  it('后层到时先走的那条原地淡出，不沿叠放方向从前面那张底下穿过去', async () => {
    const { service, titled } = setup({ preset: 'toast' })
    service.warning('配额即将用尽', { duration: 400 })
    service.success('已发布', { duration: 0 })
    await tick()
    const behind = titled('配额即将用尽')
    for (let i = 0; i < 40 && behind.dataset.state !== 'dismissing'; i++)
      await wait(25)
    expect(behind.dataset.state).toBe('dismissing')
    expect(animationNames(behind)).toContain('xh-fade-out')
    expect(animationNames(behind)).not.toContain('xh-notification-stack-out')
  })

  it('自己播完退场的那条被移出队列时不再放替身：只退场一次，不闪回来重播', async () => {
    const { service, ghosts, titled } = setup({ preset: 'toast' })
    service.warning('配额即将用尽', { duration: 0 })
    service.success('已发布', { duration: 0 })
    await tick()
    await wait(300)
    titled('已发布').querySelector<HTMLElement>('[data-part="item-close-trigger"]')!.click()
    const seen: number[] = []
    const until = performance.now() + 500
    while (performance.now() < until) {
      seen.push(ghosts().length)
      await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
    }
    expect(Math.max(...seen)).toBe(0)
  })

  it('满三条再来一条：被挤掉的那条在原处留替身淡出，播完就撤，最新那条照样上到最前', async () => {
    const { service, live, ghosts, titled } = setup({ preset: 'toast' })
    for (let i = 1; i <= 3; i++)
      service.warning(`警告 ${i}`, { duration: 0 })
    await tick()
    await wait(300)
    service.success('已发布', { duration: 0 })
    await tick()
    expect(ghosts()).toHaveLength(1)
    expect(animationNames(ghosts()[0]!)).toContain('xh-fade-out')
    expect(titled('已发布').hasAttribute('data-frontmost')).toBe(true)
    await wait(500)
    expect(ghosts()).toHaveLength(0)
    expect(live()).toHaveLength(3)
  })
})

describe('逐条排开的卡片', () => {
  it.each(['ltr', 'rtl'] as const)('%s：贴行尾的卡片从行尾整宽推入、边推边淡入', async (dir) => {
    const { service, titled } = setup({ preset: 'card', placement: 'bottom-end' }, dir)
    service.info('已同步', { duration: 0 })
    await tick()
    const card = titled('已同步')
    expect(animationNames(card)).toEqual(expect.arrayContaining(['xh-slide-in', 'xh-slide-fade-in']))
    const [x, y] = startOf(card, 'xh-slide-in')
    const width = card.getBoundingClientRect().width
    expect(Math.abs(x)).toBeCloseTo(width, 0)
    expect(Math.sign(x)).toBe(dir === 'ltr' ? 1 : -1)
    expect(y).toBe(0)
  })

  it('快速连发撞上上限挤出：还在推入的那张跟着换位一起挪，不原地一跳、不叠到上一张上', async () => {
    const { service, titled } = setup({ preset: 'card', placement: 'top-start' })
    for (let i = 1; i <= 5; i++)
      service.info(`第 ${i} 条`, { duration: 0 })
    await tick()
    await wait(400)
    service.info('第 6 条', { duration: 0 })
    await tick()
    await wait(40)
    const sixth = titled('第 6 条')
    const before = sixth.getBoundingClientRect().top
    // 第 7 条挤掉最上面那张：其余几张整体上移一格，第 6 张这时还在推入
    service.info('第 7 条', { duration: 0 })
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
    const after = sixth.getBoundingClientRect().top
    const step = titled('第 3 条').getBoundingClientRect().height
    expect(Math.abs(after - before)).toBeLessThan(step / 4)
  })

  it.each([
    ['bottom-end', 1],
    ['top-start', 5],
  ] as const)('%s：新卡跟着整列一起换位，任何一帧都不叠到前一张上', async (placement, filled) => {
    const { service, live } = setup({ preset: 'card', placement })
    for (let i = 1; i <= filled; i++)
      service.info(`第 ${i} 条`, { duration: 0 })
    await tick()
    await wait(400)
    // 贴底：新卡把整列往上推；贴顶：满员时挤掉最上面那张、整列往上收
    service.info('新来的', { duration: 0 })
    let overlap = 0
    const until = performance.now() + 300
    while (performance.now() < until) {
      const rects = live().map(el => el.getBoundingClientRect()).sort((a, b) => a.top - b.top)
      for (let i = 1; i < rects.length; i++)
        overlap = Math.max(overlap, rects[i - 1]!.bottom - rects[i]!.top)
      await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
    }
    expect(overlap).toBeLessThanOrEqual(1)
  })

  it('居中贴顶的卡片从顶边整高推入', async () => {
    const { service, titled } = setup({ preset: 'card', placement: 'top' })
    service.info('已同步', { duration: 0 })
    await tick()
    const card = titled('已同步')
    const [x, y] = startOf(card, 'xh-slide-in')
    expect(x).toBe(0)
    expect(y).toBeCloseTo(-card.getBoundingClientRect().height, 0)
  })

  it('退场只淡出，不往回推：空位由换位收拢', async () => {
    const { service, ghosts, titled } = setup({ preset: 'card', placement: 'bottom-end' })
    service.info('已同步', { duration: 0 })
    await tick()
    await wait(300)
    const card = titled('已同步')
    card.querySelector<HTMLElement>('[data-part="item-close-trigger"]')!.click()
    await tick()
    expect(card.dataset.state).toBe('dismissing')
    expect(animationNames(card)).toEqual(['xh-fade-out'])
    // 播完被移出队列时不再放替身重播一遍
    const seen: number[] = []
    const until = performance.now() + 500
    while (performance.now() < until) {
      seen.push(ghosts().length)
      await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
    }
    expect(Math.max(...seen)).toBe(0)
  })
})
