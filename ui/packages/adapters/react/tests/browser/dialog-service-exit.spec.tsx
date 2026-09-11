import { setMotionOverride } from '@xihan-ui/motion'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDialogService } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let service: ReturnType<typeof createDialogService> | null = null
let style: HTMLStyleElement | null = null

async function flush(): Promise<void> {
  for (let count = 0; count < 4; count++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
  await new Promise(resolve => requestAnimationFrame(resolve))
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

beforeEach(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true))
afterEach(() => {
  act(() => service?.dispose())
  service = null
  style?.remove()
  style = null
  setMotionOverride(null)
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('命令对话框真实退出队列', () => {
  it('600ms 退场完成前不推进，重复关闭也不跳过下一项', async () => {
    installLongExit()
    let first!: Promise<boolean>
    act(() => {
      service = createDialogService()
      first = service.confirm({ title: '第一问' })
      void service.confirm({ title: '第二问' })
      void service.confirm({ title: '第三问' })
    })
    await expect.poll(title).toBe('第一问')

    await act(async () => {
      const cancel = cancelButton()
      cancel.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      cancel.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    await expect(first).resolves.toBe(false)
    await flush()

    const animations = closingAnimations()
    expect(animations).toHaveLength(2)
    expect(animations.map(animation => animation.effect?.getComputedTiming().endTime)).toEqual([600, 600])
    animations.forEach(animation => animation.pause())
    await new Promise(resolve => setTimeout(resolve, 320))
    expect(title()).toBe('第一问')

    await act(async () => {
      animations.forEach(animation => animation.finish())
      await Promise.resolve()
    })
    await flush()
    await expect.poll(title).toBe('第二问')
    expect(document.body.textContent).not.toContain('第三问')
  })

  it('减动效时不等待仍在 CSS 中声明的 600ms 动画', async () => {
    installLongExit()
    setMotionOverride('reduce')
    let first!: Promise<boolean>
    act(() => {
      service = createDialogService()
      first = service.confirm({ title: '第一问' })
      void service.confirm({ title: '第二问' })
    })
    await expect.poll(title).toBe('第一问')

    await act(async () => {
      cancelButton().dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    await expect(first).resolves.toBe(false)
    await flush()
    expect(title()).toBe('第二问')
  })
})
