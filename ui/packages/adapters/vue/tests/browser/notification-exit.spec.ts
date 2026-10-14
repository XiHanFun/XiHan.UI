// 通知卡片的退场由卡片上真实的退场动画决定：进入 dismissing 后等它播完才收起。
// 逐条排开的卡片退场只淡出（xh-fade-out），叠放的一摞（轻提示预设的缺省）走带层深的 xh-notification-stack-out。
import { setMotionOverride } from '@xihan-ui/motion'
import { afterEach, describe, expect, it } from 'vitest'
import { createNotificationService } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let dispose: (() => void) | null = null
let observer: MutationObserver | null = null

afterEach(() => {
  observer?.disconnect()
  observer = null
  dispose?.()
  dispose = null
  setMotionOverride(null)
  delete document.documentElement.dataset.motion
  document.body.innerHTML = ''
})

function card(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='notification'][data-part='item']`)
}

/** 卡片 data-state 翻成 dismissing 时就地暂停名为 name 的退场动画；返回的函数停止观察并交出暂停住的那条。 */
function holdExitAnimation(name: string): () => Animation | undefined {
  let held: Animation | undefined
  const current = new MutationObserver(() => {
    const el = card()
    if (held || el?.dataset.state !== 'dismissing')
      return
    held = el.getAnimations().find(animation => (animation as CSSAnimation).animationName === name)
    held?.pause()
  })
  current.observe(document.body, { subtree: true, attributeFilter: ['data-state'] })
  observer = current
  return () => {
    current.disconnect()
    return held
  }
}

/** 弹出卡片，到点后停在 dismissing：退场动画在翻转那一刻暂停，期间不收起；手动放完才离场。 */
async function holdsUntilExitFinishes(name: string, show: () => void, duration?: number): Promise<void> {
  const held = holdExitAnimation(name)
  show()
  await expect.poll(() => card()?.dataset.state).toBe('dismissing')
  const el = card()!
  const exit = held()
  expect(exit, name).toBeDefined()
  if (duration !== undefined)
    expect(exit!.effect?.getComputedTiming().endTime).toBe(duration)
  await new Promise(resolve => setTimeout(resolve, 500))
  expect(el.dataset.state).toBe('dismissing')

  exit!.finish()
  await expect.poll(() => card()?.dataset.state ?? 'removed').not.toBe('dismissing')
}

describe('通知卡片的退场', () => {
  it('轻提示预设叠成一摞：到点后停在 dismissing，直到带层深的退场动画播完', async () => {
    const toast = createNotificationService({ preset: 'toast' })
    dispose = () => toast.dispose()
    await holdsUntilExitFinishes('xh-notification-stack-out', () => toast.success('已保存', { duration: 80 }))
  })

  it('卡片预设逐条排开：到点后停在 dismissing，直到淡出退场播完', async () => {
    const notify = createNotificationService()
    dispose = () => notify.dispose()
    await holdsUntilExitFinishes('xh-fade-out', () => notify.success('已保存', { duration: 80 }))
  })

  it('减弱动效下退场只剩 120ms 淡出，照样等它播完', async () => {
    // 与视觉环境控制器一致：JS 覆盖与根上的 data-motion 同时置为减弱
    setMotionOverride('reduce')
    document.documentElement.dataset.motion = 'reduce'
    const toast = createNotificationService({ preset: 'toast' })
    dispose = () => toast.dispose()
    await holdsUntilExitFinishes('xh-notification-stack-out', () => toast.success('已保存', { duration: 80 }), 120)
  })
})
