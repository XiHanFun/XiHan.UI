// Web Components 的通知条目包在 <xh-notification-item> 外壳里，作者增删的是外壳，部件升级后才写上身份：
// 新到、换位与离场替身都要照样认出来。几何与动画时间线只有 Chromium 量得出来。
import { afterEach, describe, expect, it } from 'vitest'
import { createNotificationService } from '../../src/services'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let dispose: (() => void) | null = null

afterEach(() => {
  dispose?.()
  dispose = null
  document.body.innerHTML = ''
})

const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))
const frame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()))

function items(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="notification"][data-part="item"]')]
}
const live = (): HTMLElement[] => items().filter(el => !el.hidden && el.dataset.state !== 'closed')
const ghosts = (): HTMLElement[] => items().filter(el => el.dataset.state === 'closed')

/** 一段时间里逐帧量相邻两张卡片的重叠，返回最大重叠（px）。 */
async function maxOverlap(ms: number): Promise<number> {
  let overlap = 0
  const until = performance.now() + ms
  while (performance.now() < until) {
    const rects = live().map(el => el.getBoundingClientRect()).sort((a, b) => a.top - b.top)
    for (let i = 1; i < rects.length; i++)
      overlap = Math.max(overlap, rects[i - 1]!.bottom - rects[i]!.top)
    await frame()
  }
  return overlap
}

describe('外壳里的通知卡片', () => {
  it.each([
    ['bottom-end', 1],
    ['top-start', 5],
  ] as const)('%s：新卡跟着整列一起换位，任何一帧都不叠到前一张上', async (placement, filled) => {
    const notify = createNotificationService({ placement })
    dispose = () => notify.dispose()
    for (let i = 1; i <= filled; i++)
      notify.info(`第 ${i} 条`, { duration: 0 })
    await wait(500)
    notify.info('新来的', { duration: 0 })
    expect(await maxOverlap(300)).toBeLessThanOrEqual(1)
  })

  it('满员再来一条：被挤掉的那张在原处留替身淡出，播完就撤', async () => {
    const notify = createNotificationService({ placement: 'top-start' })
    dispose = () => notify.dispose()
    for (let i = 1; i <= 5; i++)
      notify.info(`第 ${i} 条`, { duration: 0 })
    await wait(500)
    notify.info('新来的', { duration: 0 })
    await expect.poll(() => ghosts().length).toBe(1)
    expect(ghosts()[0]!.getAnimations().map(a => (a as CSSAnimation).animationName)).toContain('xh-fade-out')
    await expect.poll(() => ghosts().length).toBe(0)
    expect(live()).toHaveLength(5)
  })

  it('自己播完退场的那张被移出队列时不再放替身重播', async () => {
    const notify = createNotificationService()
    dispose = () => notify.dispose()
    notify.info('已同步', { duration: 0 })
    await wait(400)
    live()[0]!.querySelector<HTMLElement>('[data-part="item-close-trigger"]')!.click()
    let seen = 0
    const until = performance.now() + 500
    while (performance.now() < until) {
      seen = Math.max(seen, ghosts().length)
      await frame()
    }
    expect(seen).toBe(0)
  })
})
