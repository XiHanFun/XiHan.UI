// 轻提示与通知卡片的退场由根节点上真实的退场动画决定：进入 dismissing 后等它播完才收起。
import { setMotionOverride } from '@xihan-ui/motion'
import { act } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { createNotificationService, createToastService } from '../../src'
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

function card(scope: 'toast' | 'notification'): HTMLElement | null {
  const part = scope === 'toast' ? 'root' : 'item'
  return document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${part}']`)
}

/** 停在 dismissing 的那张卡片上的退场动画暂停，期间不收起；手动放完才离场。 */
async function holdsUntilExitFinishes(scope: 'toast' | 'notification', name: string, duration?: number): Promise<void> {
  await expect.poll(() => card(scope)?.dataset.state).toBe('dismissing')
  const el = card(scope)!
  const [exit] = el.getAnimations().filter(animation => (animation as CSSAnimation).animationName === name)
  expect(exit, name).toBeDefined()
  if (duration !== undefined)
    expect(exit!.effect?.getComputedTiming().endTime).toBe(duration)
  exit!.pause()
  await new Promise(resolve => setTimeout(resolve, 500))
  expect(el.dataset.state).toBe('dismissing')

  act(() => exit!.finish())
  await expect.poll(() => card(scope)?.dataset.state ?? 'removed').not.toBe('dismissing')
}

describe('轻提示与通知卡片的退场', () => {
  it('轻提示到点后停在 dismissing，直到退场动画播完', async () => {
    const toast = createToastService()
    dispose = () => toast.dispose()
    act(() => void toast.success('已保存', { duration: 80 }))
    await holdsUntilExitFinishes('toast', 'xh-toast-out')
  })

  it('通知卡片到点后停在 dismissing，直到退场动画播完', async () => {
    const notify = createNotificationService()
    dispose = () => notify.dispose()
    act(() => void notify.success('已保存', { duration: 80 }))
    await holdsUntilExitFinishes('notification', 'xh-sheet-out')
  })

  it('减弱动效下退场只剩 120ms 淡出，照样等它播完', async () => {
    // 与视觉环境控制器一致：JS 覆盖与根上的 data-motion 同时置为减弱
    setMotionOverride('reduce')
    document.documentElement.dataset.motion = 'reduce'
    const toast = createToastService()
    dispose = () => toast.dispose()
    act(() => void toast.success('已保存', { duration: 80 }))
    await holdsUntilExitFinishes('toast', 'xh-toast-out', 120)
  })
})
