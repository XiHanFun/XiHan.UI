import { setMotionOverride } from '@xihan-ui/motion'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createDialogService } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let service: ReturnType<typeof createDialogService> | null = null
let style: HTMLStyleElement | null = null

async function flush(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

function installLongExit(): void {
  style = document.createElement('style')
  style.textContent = `
    @keyframes dialog-service-test-exit { from { opacity: 1 } to { opacity: 0 } }
    [data-scope='dialog'][data-state='closed']:is([data-part='content'], [data-part='backdrop']) {
      animation: dialog-service-test-exit 600ms linear forwards !important;
    }
  `
  document.head.append(style)
}

function title(): string | null {
  return document.querySelector(`[data-scope='dialog'][data-part='title']`)?.textContent ?? null
}

function cancelButton(): HTMLButtonElement {
  return document.querySelectorAll<HTMLButtonElement>(`[data-scope='dialog'][data-part='footer'] button`)[0]!
}

function closingAnimations(): Animation[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='dialog'][data-state='closed']:is([data-part='content'], [data-part='backdrop'])`)]
    .flatMap(node => node.getAnimations())
    .filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
}

afterEach(() => {
  service?.dispose()
  service = null
  style?.remove()
  style = null
  setMotionOverride(null)
  delete document.documentElement.dataset.motion
  document.body.innerHTML = ''
})

describe('命令对话框真实退出队列', () => {
  it('600ms 退场完成前不推进，重复关闭也不跳过下一项', async () => {
    installLongExit()
    service = createDialogService()
    const first = service.confirm({ title: '第一问' })
    void service.confirm({ title: '第二问' })
    void service.confirm({ title: '第三问' })
    await expect.poll(title).toBe('第一问')

    const cancel = cancelButton()
    cancel.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    cancel.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await expect(first).resolves.toBe(false)
    await flush()

    const animations = closingAnimations()
    expect(animations).toHaveLength(2)
    expect(animations.map(animation => animation.effect?.getComputedTiming().endTime)).toEqual([600, 600])
    animations.forEach(animation => animation.pause())
    await new Promise(resolve => setTimeout(resolve, 320))
    expect(title()).toBe('第一问')

    animations.forEach(animation => animation.finish())
    await flush()
    await expect.poll(title).toBe('第二问')
    expect(document.body.textContent).not.toContain('第三问')
  })

  it('减弱动效下退场只剩 120ms 淡出，队列等它播完才推进', async () => {
    // 与视觉环境控制器一致：JS 覆盖与根上的 data-motion 同时置为减弱
    setMotionOverride('reduce')
    document.documentElement.dataset.motion = 'reduce'
    service = createDialogService()
    const first = service.confirm({ title: '第一问' })
    void service.confirm({ title: '第二问' })
    await expect.poll(title).toBe('第一问')

    cancelButton().dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await expect(first).resolves.toBe(false)
    await flush()

    const animations = closingAnimations()
    expect(animations).toHaveLength(2)
    expect(animations.map(animation => animation.effect?.getComputedTiming().endTime)).toEqual([120, 120])
    animations.forEach(animation => animation.pause())
    await new Promise(resolve => setTimeout(resolve, 200))
    expect(title()).toBe('第一问')

    animations.forEach(animation => animation.finish())
    await flush()
    await expect.poll(title).toBe('第二问')
  })
})
