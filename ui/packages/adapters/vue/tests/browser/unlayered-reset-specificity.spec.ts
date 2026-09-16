// 无层产物 index.unlayered.css 的级联只按特指度竞争。Family Recipe 的根规则
// （[data-xh-action-control]，(0,1,0)）在产物里排在 reset 段之前；reset 若仍是
// (0,1,0)，其 `font: inherit` 就以源序压掉配方的三档字号——文档站 Button 无论 sm/md/lg
// 全是 16px，而有层产物、门禁与单测全绿。这里在引入无层产物的舞台上直接量计算字号。
//
// 判据是级联算出的取值，只有真实浏览器算得出来：jsdom 不解析样式表里的 var() 与继承。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhButton, XhButtonLabel } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles/index.unlayered.css'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

/** 把控件字号令牌解析成与 getComputedStyle 同格式的像素值。 */
function resolveFontSize(token: string): string {
  const probe = document.createElement('span')
  probe.style.fontSize = `var(${token})`
  host!.append(probe)
  const value = getComputedStyle(probe).fontSize
  probe.remove()
  return value
}

describe('无层产物里的 reset 特指度', () => {
  it.each([
    { size: 'sm' as const, token: '--xh-control-font-sm' },
    { size: 'md' as const, token: '--xh-control-font-md' },
    { size: 'lg' as const, token: '--xh-control-font-lg' },
  ])('action Control $size 档字号在 reset 的 font: inherit 之后仍生效', ({ size, token }) => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({ setup: () => () => h(XhButton, { size }, () => h(XhButtonLabel, null, () => 'Action')) })
    app.mount(host)

    const button = host.querySelector<HTMLButtonElement>(`[data-xh-action-control][data-xh-action-size='${size}']`)
    if (!button)
      throw new Error('找不到 Action Control')
    const expected = resolveFontSize(token)
    expect(expected).not.toBe('')
    expect(getComputedStyle(button).fontSize, `${size} 档字号被 reset 压回继承值`).toBe(expected)
  })
})
