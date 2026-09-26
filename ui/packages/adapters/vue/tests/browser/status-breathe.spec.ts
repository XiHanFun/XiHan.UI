// 呼吸的状态点：消息流已发送、等首个片段，与审批待决。
// 钉住：出现时圆点持续呼吸、外扩光环同周期只播 3 轮；减弱动效下两者都停、圆点满不透明度；
// 状态一变就收起（首个片段到了、判定落定）；审批的呼吸点钉在卡片右上角，不占版面。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalRoot,
  XhApprovalStatusIndicator,
  XhApprovalTitle,
  XhMessageFeedItem,
  XhMessageFeedList,
  XhMessageFeedPendingIndicator,
  XhMessageFeedRoot,
  XhMessageFeedViewport,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function mountHost(): HTMLElement {
  host = document.createElement('div')
  host.style.cssText = 'inline-size: 360px'
  document.body.append(host)
  return host
}

describe('消息流：已发送、等首个片段', () => {
  it('submitted 时圆点呼吸、光环只播 3 轮；首个片段到了就收起', async () => {
    const status = ref<'submitted' | 'streaming'>('submitted')
    app = createApp({
      render: () => h(XhMessageFeedRoot, { status: status.value, count: 1 }, () => [
        h(XhMessageFeedViewport, () => [
          h(XhMessageFeedList, () => h(XhMessageFeedItem, { index: 0, value: 'm1', role: 'user' }, () => '帮我写个函数')),
          h(XhMessageFeedPendingIndicator),
        ]),
      ]),
    })
    app.mount(mountHost())
    await nextTick()
    const dot = host!.querySelector<HTMLElement>('[data-scope="message-feed"][data-part="pending-indicator"]')!
    expect(dot.hidden).toBe(false)
    expect(dot.getAttribute('aria-hidden')).toBe('true')
    const style = getComputedStyle(dot)
    expect(style.animationName).toBe('xh-breathe')
    expect(style.animationIterationCount).toBe('infinite')
    expect(getComputedStyle(dot, '::after').animationName).toBe('xh-breathe-halo')
    expect(getComputedStyle(dot, '::after').animationIterationCount).toBe('3')
    // 行首与消息内容对齐。圆点正在呼吸（缩放绕中心），比中心不比边
    const list = host!.querySelector<HTMLElement>('[data-part="list"]')!
    const dotRect = dot.getBoundingClientRect()
    const contentStart = list.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(list).paddingLeft)
    expect(dotRect.left + dotRect.width / 2).toBeCloseTo(contentStart + dot.offsetWidth / 2, 0)

    status.value = 'streaming'
    await nextTick()
    expect(dot.hidden).toBe(true)
    expect(getComputedStyle(dot).display).toBe('none')
  })

  it('减弱动效：圆点停在满不透明度，光环不出现', async () => {
    app = createApp({
      render: () => h(XhMessageFeedRoot, { status: 'submitted' }, () => [
        h(XhMessageFeedViewport, () => [h(XhMessageFeedList), h(XhMessageFeedPendingIndicator)]),
      ]),
    })
    mountHost().dataset.motion = 'reduce'
    app.mount(host!)
    await nextTick()
    const dot = host!.querySelector<HTMLElement>('[data-part="pending-indicator"]')!
    expect(getComputedStyle(dot).animationName).toBe('none')
    expect(getComputedStyle(dot).opacity).toBe('1')
    expect(getComputedStyle(dot, '::after').animationName).toBe('none')
  })
})

describe('审批：待决', () => {
  it('待决时右上角的圆点呼吸，判过即收起', async () => {
    app = createApp({
      render: () => h(XhApprovalRoot, null, () => [
        h(XhApprovalStatusIndicator),
        h(XhApprovalTitle, () => '要写文件'),
        h(XhApprovalApproveTrigger, () => '批准'),
        h(XhApprovalDenyTrigger, () => '拒绝'),
      ]),
    })
    app.mount(mountHost())
    await nextTick()
    const root = host!.querySelector<HTMLElement>('[data-scope="approval"][data-part="root"]')!
    const dot = root.querySelector<HTMLElement>('[data-part="status-indicator"]')!
    expect(dot.hidden).toBe(false)
    expect(dot.getAttribute('aria-hidden')).toBe('true')
    expect(getComputedStyle(dot).animationName).toBe('xh-breathe')
    expect(getComputedStyle(dot, '::after').animationIterationCount).toBe('3')
    // 钉在右上角，不占版面：标题仍从内边距起排。圆点正在呼吸（缩放绕中心），比中心不比边
    const box = root.getBoundingClientRect()
    const rect = dot.getBoundingClientRect()
    const padding = Number.parseFloat(getComputedStyle(root).paddingTop)
    expect(rect.left + rect.width / 2).toBeCloseTo(box.right - 1 - padding - dot.offsetWidth / 2, 0)
    expect(root.querySelector<HTMLElement>('[data-part="title"]')!.getBoundingClientRect().top).toBeCloseTo(box.top + padding + 1, 0)

    root.querySelector<HTMLElement>('[data-part="deny-trigger"]')!.click()
    await nextTick()
    expect(dot.hidden).toBe(true)
  })
})
