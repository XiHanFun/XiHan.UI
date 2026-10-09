import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhButton,
  XhDialogBody,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogFooter,
  XhDialogHeader,
  XhDialogRoot,
  XhDialogTitle,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
  document.querySelector<HTMLElement>(`[data-scope='dialog'][data-part='content']`)
    ?.getAnimations()
    .forEach(animation => animation.finish())
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='dialog'][data-part='${name}']`)!
}

/** 在定位层里放一个探针，按面板所在的主题解出某个令牌。 */
function resolved(prop: 'color' | 'font-size' | 'font-weight' | 'box-shadow', token: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(prop, `var(${token})`)
  part('positioner').append(probe)
  const value = getComputedStyle(probe).getPropertyValue(prop)
  probe.remove()
  return value
}

/** 内容盒的行向起止：面板边框以内。 */
function paddingBox(element: HTMLElement): { left: number, right: number, top: number } {
  const rect = element.getBoundingClientRect()
  const style = getComputedStyle(element)
  return {
    left: rect.left + Number.parseFloat(style.borderLeftWidth),
    right: rect.right - Number.parseFloat(style.borderRightWidth),
    top: rect.top + Number.parseFloat(style.borderTopWidth),
  }
}

function mount(open: Ref<boolean> = ref(true), variant: 'blur' | 'opaque' = 'blur'): void {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhDialogRoot, { open: open.value, variant }, () =>
      h(XhDialogContent, null, () => [
        h(XhDialogHeader, null, () => h(XhDialogTitle, null, () => '发布确认')),
        h(XhDialogBody, null, () => h(XhDialogDescription, null, () => '发布后所有人可见。')),
        h(XhDialogFooter, null, () => h(XhButton, null, () => '发布')),
        h(XhDialogCloseTrigger, { 'aria-label': '关闭' }),
      ])),
  })
  app.mount(host)
}

function mountLight(): void {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhDialogRoot, { open: true }, () =>
      h(XhDialogContent, null, () => [
        h(XhDialogTitle, null, () => '确认发布'),
        h(XhDialogDescription, null, () => '发布后所有人可见。'),
        h(XhDialogCloseTrigger, { 'aria-label': '关闭' }),
      ])),
  })
  app.mount(host)
}

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  delete document.documentElement.dataset.theme
  delete document.documentElement.dataset.contrast
  delete document.documentElement.dataset.motion
  delete document.documentElement.dataset.density
  document.documentElement.removeAttribute('dir')
})

describe('dialog 的实体 sheet 面', () => {
  it.each(['light', 'dark'] as const)('%s：面就是实体 sheet——1px 描边、不透明底、单层投影，不叠渐变与顶光', async (theme) => {
    document.documentElement.dataset.theme = theme
    mount()
    await settle()

    const content = getComputedStyle(part('content'))
    const backdrop = getComputedStyle(part('backdrop'))
    expect(content.borderTopWidth).toBe('1px')
    expect(content.borderRadius).toBe('4px')
    expect(content.backgroundImage).toBe('none')
    expect(content.backgroundColor).toBe(resolved('color', '--xh-bg-surface'))
    expect(content.backdropFilter).toBe('none')
    expect(content.boxShadow).toBe(resolved('box-shadow', '--xh-material-elevated-shadow'))
    expect(content.boxShadow).not.toBe('none')
    expect(backdrop.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(backdrop.backdropFilter).toContain('blur(12px)')
  })

  it('三段：头 48px、头尾各一条贴边的 1px 内部分隔线，内衬头横 20、正文纵 24 横 20、尾纵 16 横 20', async () => {
    mount()
    await settle()

    const box = paddingBox(part('content'))
    const header = part('header')
    const body = getComputedStyle(part('body'))
    const footer = getComputedStyle(part('footer'))
    const headerStyle = getComputedStyle(header)
    const subtle = resolved('color', '--xh-border-subtle')

    expect(header.getBoundingClientRect().height).toBeCloseTo(48, 0)
    expect(headerStyle.paddingLeft).toBe('20px')
    expect(headerStyle.paddingRight).toBe('20px')
    expect(headerStyle.borderBottomWidth).toBe('1px')
    expect(headerStyle.borderBottomColor).toBe(subtle)
    // 分隔线贴着面板两侧的边，不被面板内衬缩进
    expect(header.getBoundingClientRect().left).toBeCloseTo(box.left, 0)
    expect(header.getBoundingClientRect().right).toBeCloseTo(box.right, 0)
    expect(part('footer').getBoundingClientRect().left).toBeCloseTo(box.left, 0)
    expect(footer.borderTopWidth).toBe('1px')
    expect(footer.borderTopColor).toBe(subtle)
    expect(body.paddingTop).toBe('24px')
    expect(body.paddingBottom).toBe('24px')
    expect(body.paddingLeft).toBe('20px')
    expect(body.paddingRight).toBe('20px')
    expect(footer.paddingTop).toBe('16px')
    expect(footer.paddingBottom).toBe('16px')
    expect(footer.paddingLeft).toBe('20px')
    expect(footer.paddingRight).toBe('20px')
  })

  it('标题取页面级面板标题令牌、正文色；关闭钮叉 12px，距右 16px、在头部居中', async () => {
    mount()
    await settle()

    const title = getComputedStyle(part('title'))
    expect(title.fontSize).toBe(resolved('font-size', '--xh-text-heading-3-size'))
    expect(title.fontWeight).toBe(resolved('font-weight', '--xh-text-heading-3-weight'))
    expect(title.color).toBe(resolved('color', '--xh-fg-default'))

    const close = part('close-trigger')
    const glyph = getComputedStyle(close, '::before')
    expect(glyph.width).toBe('12px')
    expect(glyph.height).toBe('12px')
    const box = paddingBox(part('content'))
    const closeRect = close.getBoundingClientRect()
    const headerRect = part('header').getBoundingClientRect()
    expect(box.right - closeRect.right).toBeCloseTo(16, 0)
    expect(closeRect.top + closeRect.height / 2).toBeCloseTo(headerRect.top + headerRect.height / 2, 0)
  })

  it('紧凑密度下头部随控件档收到 44px', async () => {
    document.documentElement.dataset.density = 'compact'
    mount()
    await settle()

    expect(part('header').getBoundingClientRect().height).toBeCloseTo(44, 0)
  })

  it('rtl 下关闭钮落在行尾那一侧（左边），距边仍是 16px', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    mount()
    await settle()

    const box = paddingBox(part('content'))
    expect(part('close-trigger').getBoundingClientRect().left - box.left).toBeCloseTo(16, 0)
  })

  it('不分三段时标题行与关闭钮仍落在同一条 48px 头部带的中线上', async () => {
    mountLight()
    await settle()

    const box = paddingBox(part('content'))
    const titleRect = part('title').getBoundingClientRect()
    const closeRect = part('close-trigger').getBoundingClientRect()
    expect(titleRect.top + titleRect.height / 2).toBeCloseTo(box.top + 24, 0)
    expect(closeRect.top + closeRect.height / 2).toBeCloseTo(box.top + 24, 0)
    expect(titleRect.left - box.left).toBeCloseTo(20, 0)
  })

  it('高对比与减弱动效保留实体边界，撤掉光学效果，进出场只剩淡变', async () => {
    document.documentElement.dataset.contrast = 'more'
    document.documentElement.dataset.motion = 'reduce'
    // 挂载即开的那一次属于首帧、不播进场；量的是挂载之后打开的这一次
    const open = ref(false)
    mount(open)
    await nextTick()
    open.value = true
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))

    const content = getComputedStyle(part('content'))
    const backdrop = getComputedStyle(part('backdrop'))
    expect(content.borderTopWidth).toBe('1px')
    expect(content.backdropFilter).toBe('none')
    expect(content.boxShadow).toBe('none')
    expect(backdrop.backdropFilter).toBe('none')
    // 减弱动效下进出场只剩 120ms 淡变：位移与缩放幅度归零，animation 本身保留，退场生命周期照常可观察。
    expect(content.animationDuration).toBe('0.12s')
    expect(backdrop.animationDuration).toBe('0.12s')
  })
})
