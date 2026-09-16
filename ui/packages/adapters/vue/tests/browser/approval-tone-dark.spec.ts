// 批准钮的实心面在亮暗两态都得是作者打的语气色，授权行折行时两行之间得有正文行距。
//
// 家族的深色 solid 规则 `[data-theme='dark'] … [data-xh-action-variant='solid']:is(:not([data-tone]), [data-tone='brand'])`
// 只看触发器自身的 data-tone：连接层只把语气投在根上时，暗色下这条规则把桥接槽整个改写成品牌色，
// 亮色语气色、暗色品牌蓝——jsdom 不解析层叠里的属性选择器，只有真实浏览器量得出来。
// 行高同理：row 档在家族那层落成单行档 1.0，皮肤写回正文行高这件事只有 computed 值能证。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalFooter,
  XhApprovalGroup,
  XhApprovalItem,
  XhApprovalItemIndicator,
  XhApprovalItemText,
  XhApprovalRoot,
  XhApprovalTitle,
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
  delete document.documentElement.dataset.theme
})

function mount(render: () => VNode): void {
  host = document.createElement('div')
  // 令过渡即时完成：换主题那一下会起一段底色过渡，这里断言的是稳定态，不是过渡中间帧
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
}

function part(name: string): HTMLElement {
  const element = host?.querySelector<HTMLElement>(`[data-scope='approval'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 ${name}`)
  return element
}

/** 把令牌解析成与 getComputedStyle 同格式的颜色值，避免直接比对带 var() 链的自定义属性。 */
function resolveColor(token: string): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  host!.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

function mountGate(): void {
  mount(() => h(XhApprovalRoot, { tone: 'danger', scopes: [{ value: 'read', label: '读文件' }] }, () => [
    h(XhApprovalTitle, null, () => '要写文件'),
    h(XhApprovalGroup, null, () => [
      h(XhApprovalItem, { scopeValue: 'read' }, () => [
        h(XhApprovalItemIndicator, { scopeValue: 'read' }),
        h(XhApprovalItemText, { scopeValue: 'read' }, () => '一条长到会折行的授权说明，折行之后两行之间要有正文行距，不能贴在一起'),
      ]),
    ]),
    h(XhApprovalFooter, null, () => [
      h(XhApprovalApproveTrigger, null, () => '批准'),
      h(XhApprovalDenyTrigger, null, () => '拒绝'),
    ]),
  ]))
}

describe('approval：语气与行高', () => {
  it('批准钮的实心面亮暗两态都是语气色，不落回品牌色', () => {
    mountGate()
    const approve = part('approve-trigger')
    expect(approve.dataset.tone).toBe('danger')
    expect(part('deny-trigger').dataset.tone).toBeUndefined()

    const light = getComputedStyle(approve).backgroundColor
    expect(light).toBe(resolveColor('--xh-color-danger-600'))
    expect(light).not.toBe(resolveColor('--xh-bg-brand'))

    document.documentElement.dataset.theme = 'dark'
    const dark = getComputedStyle(approve).backgroundColor
    expect(dark).toBe(light)
    expect(dark).not.toBe(resolveColor('--xh-action-brand-solid'))
  })

  it('授权行走正文行高，不吃家族的单行档', () => {
    mountGate()
    const item = part('item')
    const style = getComputedStyle(item)
    const leading = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--xh-leading-normal'))
    expect(leading).toBeGreaterThan(1)
    expect(Number.parseFloat(style.lineHeight)).toBeCloseTo(Number.parseFloat(style.fontSize) * leading, 1)
    expect(Number.parseFloat(getComputedStyle(part('item-text')).lineHeight)).toBeCloseTo(Number.parseFloat(style.lineHeight), 1)
  })
})
