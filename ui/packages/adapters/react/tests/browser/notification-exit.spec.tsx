// 通知卡片的退场由卡片上真实的退场动画决定：进入 dismissing 后等它播完才收起。
// 逐条排开的一摞走 xh-sheet-out，叠放的一摞（轻提示预设的缺省）走带层深的 xh-notification-stack-out。
import { setMotionOverride } from '@xihan-ui/motion'
import { act } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { createNotificationService } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let dispose: (() => void) | null = null

afterEach(() => {
  act(() => dispose?.())
  dispose = null
  setMotionOverride(null)
  delete document.documentElement.dataset.motion
  document.body.innerHTML = ''
})

function card(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='notification'][data-part='item']`)
}

/** 停在 dismissing 的那张卡片上的退场动画暂停，期间不收起；手动放完才离场。 */
async function holdsUntilExitFinishes(name: string, duration?: number): Promise<void> {
  await expect.poll(() => card()?.dataset.state).toBe('dismissing')
  const el = card()!
  const [exit] = el.getAnimations().filter(animation => (animation as CSSAnimation).animationName === name)
  expect(exit, name).toBeDefined()
  if (duration !== undefined)
    expect(exit!.effect?.getComputedTiming().endTime).toBe(duration)
  exit!.pause()
  await new Promise(resolve => setTimeout(resolve, 500))
  expect(el.dataset.state).toBe('dismissing')

  act(() => exit!.finish())
  await expect.poll(() => card()?.dataset.state ?? 'removed').not.toBe('dismissing')
}

describe('通知卡片的退场', () => {
  it('轻提示预设叠成一摞：到点后停在 dismissing，直到带层深的退场动画播完', async () => {
    const toast = createNotificationService({ preset: 'toast' })
    dispose = () => toast.dispose()
    act(() => void toast.success('已保存', { duration: 80 }))
    await holdsUntilExitFinishes('xh-notification-stack-out')
  })

  it('卡片预设逐条排开：到点后停在 dismissing，直到面板退场动画播完', async () => {
    const notify = createNotificationService()
    dispose = () => notify.dispose()
    act(() => void notify.success('已保存', { duration: 80 }))
    await holdsUntilExitFinishes('xh-sheet-out')
  })

  it('减弱动效下退场只剩 120ms 淡出，照样等它播完', async () => {
    // 与视觉环境控制器一致：JS 覆盖与根上的 data-motion 同时置为减弱
    setMotionOverride('reduce')
    document.documentElement.dataset.motion = 'reduce'
    const toast = createNotificationService({ preset: 'toast' })
    dispose = () => toast.dispose()
    act(() => void toast.success('已保存', { duration: 80 }))
    await holdsUntilExitFinishes('xh-notification-stack-out', 120)
  })
})
