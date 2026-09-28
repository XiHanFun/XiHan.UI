// 表单错误摘要的退场：jsdom 没有动画，看不出摘要是不是播完才藏起。
// 改完最后一处错误时，摘要先淡出（途中仍占位、条目文案不变、不可交互），播完才写 hidden。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhFormErrorSummary, XhFormErrorSummaryItem, XhFormFieldGroup, XhFormRoot, XhFormSubmitTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.documentElement.style.removeProperty('--xh-motion-duration-exit')
})

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='form'][data-part='${name}']`)!
}

function frames(count: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number): void => {
      if (left <= 0)
        resolve()
      else
        requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

describe('form 错误摘要退场', () => {
  it('改完最后一处错误：摘要先淡出、文案不变，播完才藏起', async () => {
    document.documentElement.style.setProperty('--xh-motion-duration-exit', '400ms')
    const errors = ref<Record<string, string>>({ email: '邮箱不能为空' })
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      setup: () => () => h(XhFormRoot, {
        errors: errors.value,
        validate: () => errors.value,
        onErrorsChange: ({ errors: next }: { errors: Record<string, string> }) => {
          errors.value = next
        },
      }, () => [
        h(XhFormErrorSummary, null, {
          default: ({ errorCount }: { errorCount: number }) => [
            h('p', { class: 'count' }, `共 ${errorCount} 处`),
            h(XhFormErrorSummaryItem, { name: 'email' }, {
              default: ({ error }: { error?: string }) => error ?? '',
            }),
          ],
        }),
        h(XhFormFieldGroup, { name: 'email' }, () => h('input')),
        h(XhFormSubmitTrigger, null, () => '提交'),
      ]),
    })
    app.mount(host)
    await nextTick()

    part('submit-trigger').click()
    await nextTick()
    const summary = part('error-summary')
    expect(summary.hidden).toBe(false)
    await Promise.all(summary.getAnimations().map(animation => animation.finished))

    errors.value = {}
    await nextTick()
    await frames(4)
    // 退场途中：还占位、在淡出，条数与条目文案仍是改完之前那一版，不可交互
    expect(summary.hidden).toBe(false)
    expect(summary.dataset.state).toBe('idle')
    expect(summary.inert).toBe(true)
    expect(Number(getComputedStyle(summary).opacity)).toBeLessThan(1)
    expect(summary.querySelector('.count')!.textContent).toBe('共 1 处')
    const item = part('error-summary-item')
    expect(item.hidden).toBe(false)
    expect(item.textContent).toBe('邮箱不能为空')

    await Promise.all(summary.getAnimations().map(animation => animation.finished))
    await nextTick()
    await nextTick()
    expect(summary.hidden).toBe(true)
    expect(summary.inert).toBe(false)
  })
})
