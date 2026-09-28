// 审批要求写理由：空着就按拒绝，焦点落到备注框，描边换成无效色；写上理由后描边回到控件色。
// 描边色与焦点只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhApprovalDenyTrigger, XhApprovalFooter, XhApprovalNote, XhApprovalRoot, XhApprovalTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

/**
 * 等备注框描边的过渡走完再量。只等它自己的过渡：页面上还有常驻的无限循环动画
 * （加载环配方的转圈停在 paused，从不结束），等整页动画会一直等下去。
 */
function settled(note: HTMLElement): Promise<unknown> {
  return Promise.all(note.getAnimations().filter(animation => animation instanceof CSSTransition).map(animation => animation.finished))
}

/** 把一个令牌解析成计算后的颜色，用来与描边比对。 */
function resolve(token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

describe('approval 要求写理由', () => {
  it('空着按拒绝：焦点到备注框、描边换无效色；写上理由后回到控件色', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhApprovalRoot, { requireReason: true }, () => [
        h(XhApprovalTitle, null, () => '要删分支'),
        h(XhApprovalNote),
        h(XhApprovalFooter, null, () => h(XhApprovalDenyTrigger, null, () => '拒绝')),
      ]),
    })
    app.mount(host)
    await nextTick()

    const note = host.querySelector<HTMLInputElement>('[data-part="note"]')!
    const deny = host.querySelector<HTMLButtonElement>('[data-part="deny-trigger"]')!
    expect(getComputedStyle(note).borderTopColor).toBe(resolve('--xh-border-control'))
    deny.click()
    await nextTick()
    expect(document.activeElement).toBe(note)
    await settled(note)
    expect(getComputedStyle(note).borderTopColor).toBe(resolve('--xh-border-invalid'))
    // 焦点环压在描边外面：聚焦时无效也要看得出，环换成无效色
    expect(getComputedStyle(note).outlineColor).toBe(resolve('--xh-ring-invalid'))

    note.value = '分支上还有没合的提交'
    note.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    await settled(note)
    expect(getComputedStyle(note).borderTopColor).toBe(resolve('--xh-border-control'))
  })
})
