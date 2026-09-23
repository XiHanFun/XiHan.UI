// 菜单栏自绘的状态字形——标记位的盒、盒里兜底的勾与带子菜单条目行尾的展开 chevron——是指示符，不是控件内图标：
// 它们同属 --xh-control-indicator-* 一族，条目上由家族按档下发的 --xh-icon-size 只管作者放进条目里的图标。
// 此前三者都读 --xh-icon-size（md 20px）：20 的标记位盒、20 的勾与 20 的 chevron 比同一行 16px 的指示符档大一圈，
// compact 下指示符收到 14 时它们仍是 20。两档密度一起量：指示符档 comfortable 16 / compact 14，作者图标两档都恒 20。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhIcon,
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemIndicator,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSub,
  XhMenubarSubTrigger,
  XhMenubarTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
} from '../../src'
import { pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  delete document.documentElement.dataset.density
  app = null
  host = null
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
})

function item(value: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='item'][data-value='${value}']`)
  if (!element)
    throw new Error(`缺少 menubar 条目：${value}`)
  return element
}

function indicatorOf(value: string): HTMLElement {
  const element = item(value).querySelector<HTMLElement>('[data-scope=\'menubar\'][data-part=\'item-indicator\']')
  if (!element)
    throw new Error(`条目 ${value} 缺少 item-indicator`)
  return element
}

function authorIcon(label: string): ReturnType<typeof h> {
  return h(XhIcon, { label }, { default: () => h('path', { d: 'M4 12h16' }) })
}

async function mount(density: 'comfortable' | 'compact'): Promise<void> {
  document.documentElement.dataset.density = density
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    // copy：标记位里塞作者的 XhIcon（与盒同尺）；paste：空标记位，皮肤画兜底的勾；
    // cut：作者图标直接放进条目（不在标记位里，仍按家族下发的 --xh-icon-size 20）；more：带子菜单，行尾画 chevron
    render: () => h(XhMenubarRoot, null, () => [
      h(XhMenubarTrigger, { value: 'edit' }, () => '编辑'),
      h(XhMenubarPositioner, { value: 'edit' }, () => h(XhMenubarContent, { style: { inlineSize: '220px' } }, () => [
        h(XhMenubarItem, { value: 'copy' }, () => [
          h(XhMenubarItemIndicator, null, () => authorIcon('标记位图标')),
          h(XhMenubarItemText, null, () => '复制'),
        ]),
        h(XhMenubarItem, { value: 'paste' }, () => [
          h(XhMenubarItemIndicator),
          h(XhMenubarItemText, null, () => '粘贴'),
        ]),
        h(XhMenubarItem, { value: 'cut' }, () => [
          authorIcon('条目图标'),
          h(XhMenubarItemText, null, () => '剪切'),
        ]),
        h(XhMenubarSub, { value: 'more', openOnHover: false }, () => [
          h(XhMenubarSubTrigger, null, () => '更多'),
          h(XhMenuPositioner, null, () => h(XhMenuContent, null, () => [
            h(XhMenuItem, { value: 'more-a' }, () => '子项'),
          ])),
        ]),
      ])),
    ]),
  })
  app.mount(host)
  await nextTick()
  await userEvent.click(document.querySelector<HTMLElement>('[data-scope=\'menubar\'][data-part=\'trigger\'][data-value=\'edit\']')!)
  await nextTick()
  await nextTick()
  // 浮层有 slide-in 进场，播放期间整块被 translate 了一段小数像素，经变换矩阵量到的矩形带浮点噪声
  // （16 → 16.0000038，整套并行跑时更常撞上）；等它跑完再量
  await Promise.all(
    document.getAnimations().map(animation => animation.finished.catch(() => undefined)),
  )
}

function indicatorSize(): number {
  const value = Number.parseFloat(getComputedStyle(item('copy')).getPropertyValue('--xh-control-indicator-size'))
  expect([14, 16]).toContain(value)
  return value
}

/** 盒是两轴居中的容器：唯一的行内字形落在盒中心 */
function expectCenteredBox(box: HTMLElement): void {
  const style = getComputedStyle(box)
  expect(['flex', 'inline-flex', 'grid', 'inline-grid']).toContain(style.display)
  expect(style.alignItems).toBe('center')
  if (style.display.endsWith('grid'))
    expect(style.justifyItems).toBe('center')
  else
    expect(style.justifyContent).toBe('center')
}

describe.each(['comfortable', 'compact'] as const)('菜单栏自绘状态字形按指示符档取尺（%s）', (density) => {
  it('标记位的盒等于 --xh-control-indicator-size，不读家族按档下发的 --xh-icon-size', async () => {
    await mount(density)
    const indicator = indicatorSize()
    for (const value of ['copy', 'paste']) {
      const box = indicatorOf(value)
      const rect = box.getBoundingClientRect()
      const observed = `${value} item-indicator 盒 ${rect.width}×${rect.height}`
      expect(rect.width, observed).toBe(indicator)
      expect(rect.height, observed).toBe(indicator)
      expectCenteredBox(box)
    }
  })

  it('空标记位里皮肤画的勾与盒同边长：行尾标记不是勾选格，不取 × 0.75', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const box = indicatorOf('paste')
    expect(box.childNodes.length, '空标记位才由皮肤画兜底的勾').toBe(0)
    const style = getComputedStyle(box, '::before')
    expect(style.maskImage, '兜底字形是勾').not.toBe('none')
    const check = pseudoBox(box, '::before')
    const observed = `paste::before ${style.width}×${style.height} 盒 ${box.getBoundingClientRect().width}×${box.getBoundingClientRect().height}`
    expect(check.width, observed).toBe(indicator)
    expect(check.height, observed).toBe(indicator)
  })

  it('作者塞进标记位里的 XhIcon 与盒同尺，随指示符档换档', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const box = indicatorOf('copy')
    expect(Number.parseFloat(getComputedStyle(box).getPropertyValue('--xh-icon-size'))).toBe(indicator)
    const svg = box.querySelector<HTMLElement>('[data-scope=\'icon\'][data-part=\'root\']')!
    const rect = svg.getBoundingClientRect()
    expect(rect.width, `标记位图标 ${rect.width}×${rect.height}`).toBe(indicator)
    expect(rect.height, `标记位图标 ${rect.width}×${rect.height}`).toBe(indicator)
  })

  it('带子菜单条目行尾的 chevron 等于 --xh-control-indicator-size，装得进条目行高', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const more = item('more')
    expect(more.getAttribute('aria-haspopup')).toBe('menu')
    const chevron = pseudoBox(more, '::after')
    const style = getComputedStyle(more, '::after')
    const observed = `more::after ${style.width}×${style.height} 条目 ${more.getBoundingClientRect().width}×${more.getBoundingClientRect().height}`
    expect(chevron.width, observed).toBe(indicator)
    expect(chevron.height, observed).toBe(indicator)
    expect(chevron.height, observed).toBeLessThanOrEqual(more.getBoundingClientRect().height)
  })

  it('作者直接放进条目里的图标仍按家族下发的 --xh-icon-size（md 20px）取尺，不随指示符档变', async () => {
    await mount(density)
    const cut = item('cut')
    expect(Number.parseFloat(getComputedStyle(cut).getPropertyValue('--xh-icon-size'))).toBe(20)
    const svg = cut.querySelector<HTMLElement>('[data-scope=\'icon\'][data-part=\'root\']')!
    const rect = svg.getBoundingClientRect()
    expect(rect.width, `条目图标 ${rect.width}×${rect.height}`).toBe(20)
    expect(rect.height, `条目图标 ${rect.width}×${rect.height}`).toBe(20)
  })
})
