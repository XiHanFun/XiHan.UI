// 抽屉面板的 sheet 三件套、三段排版与 slide 入场：边界由描边承担而不是只靠影分层，入场走大尺度位移那一档。
// 这两件只有真实浏览器量得出来：jsdom 不算样式，animation-duration 与描边色都要皮肤真的加载进来才有计算值。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhButton,
  XhDrawerBody,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerFooter,
  XhDrawerHeader,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='drawer'][data-part='${name}']`)!
}

function mount(side: 'left' | 'right' | 'top' | 'bottom' = 'right', open = ref(true)): void {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhDrawerRoot, { open: open.value, side, variant: 'blur' }, () => [
      h(XhDrawerTrigger, null, () => '打开'),
      h(XhDrawerContent, null, () => [h(XhDrawerTitle, null, () => '设置'), h('button', '保存')]),
    ]),
  })
  app.mount(host)
}

function mountSections(): void {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhDrawerRoot, { open: true }, () => [
      h(XhDrawerTrigger, null, () => '打开'),
      h(XhDrawerContent, null, () => [
        h(XhDrawerHeader, null, () => h(XhDrawerTitle, null, () => '设置')),
        h(XhDrawerBody, null, () => h('p', { style: 'margin: 0' }, '正文')),
        h(XhDrawerFooter, null, () => h(XhButton, null, () => '保存')),
        h(XhDrawerCloseTrigger, { 'aria-label': '关闭' }),
      ]),
    ]),
  })
  app.mount(host)
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

/** 面板边框以内的盒。 */
function paddingBox(element: HTMLElement): { left: number, right: number, top: number } {
  const rect = element.getBoundingClientRect()
  const style = getComputedStyle(element)
  return {
    left: rect.left + Number.parseFloat(style.borderLeftWidth),
    right: rect.right - Number.parseFloat(style.borderRightWidth),
    top: rect.top + Number.parseFloat(style.borderTopWidth),
  }
}

/** 挂载时收着、挂载之后再打开：挂载即开的那一次属于首帧，不播入场。 */
async function mountThenOpen(side: 'left' | 'right' | 'top' | 'bottom'): Promise<void> {
  const open = ref(false)
  mount(side, open)
  await settle()
  open.value = true
  await settle()
}

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  delete document.documentElement.dataset.theme
  delete document.documentElement.dataset.density
})

describe('drawer 的 M4 sheet 面板与 slide 入场', () => {
  it.each(['light', 'dark'] as const)('%s：面板有 1px 非透明描边、不透明底与单层 sheet 投影，不只靠影分层', async (theme) => {
    document.documentElement.dataset.theme = theme
    mount()
    await settle()

    const content = getComputedStyle(part('content'))
    expect(content.borderTopWidth).toBe('1px')
    expect(content.borderTopStyle).toBe('solid')
    expect(content.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
    // 不透明底：末位 alpha 不是 0，也不是半透明 tint
    expect(content.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(content.backgroundColor).not.toMatch(/\/ 0\.\d/)
    expect(content.backgroundImage).toBe('none')
    expect(content.boxShadow).toBe(resolved('box-shadow', '--xh-material-elevated-shadow'))
    expect(content.boxShadow).not.toBe('none')
    // 遮罩的模糊两个前缀都写
    expect(getComputedStyle(part('backdrop')).backdropFilter).toContain('blur(12px)')
  })

  it.each(['right', 'left', 'top', 'bottom'] as const)('%s：贴边面四角都不取圆角', async (side) => {
    mount(side)
    await settle()

    const content = getComputedStyle(part('content'))
    expect(content.borderTopLeftRadius).toBe('0px')
    expect(content.borderTopRightRadius).toBe('0px')
    expect(content.borderBottomLeftRadius).toBe('0px')
    expect(content.borderBottomRightRadius).toBe('0px')
  })

  it('三段：头 48px、头尾各一条贴边的 1px 内部分隔线，内衬横 16、正文纵 12、尾纵 16', async () => {
    mountSections()
    await settle()

    const box = paddingBox(part('content'))
    const header = part('header')
    const headerStyle = getComputedStyle(header)
    const body = getComputedStyle(part('body'))
    const footer = getComputedStyle(part('footer'))
    const subtle = resolved('color', '--xh-border-subtle')

    expect(header.getBoundingClientRect().height).toBeCloseTo(48, 0)
    expect(headerStyle.paddingLeft).toBe('16px')
    expect(headerStyle.paddingRight).toBe('16px')
    expect(headerStyle.borderBottomWidth).toBe('1px')
    expect(headerStyle.borderBottomColor).toBe(subtle)
    expect(header.getBoundingClientRect().left).toBeCloseTo(box.left, 0)
    expect(header.getBoundingClientRect().right).toBeCloseTo(box.right, 0)
    expect(body.paddingTop).toBe('12px')
    expect(body.paddingBottom).toBe('12px')
    expect(body.paddingLeft).toBe('16px')
    expect(footer.paddingTop).toBe('16px')
    expect(footer.paddingBottom).toBe('16px')
    expect(footer.paddingLeft).toBe('16px')
    expect(footer.borderTopWidth).toBe('1px')
    expect(footer.borderTopColor).toBe(subtle)
    expect(part('footer').getBoundingClientRect().left).toBeCloseTo(box.left, 0)
  })

  it('标题取页面级面板标题令牌、正文色；关闭钮叉 12px，距右 16px、在头部居中', async () => {
    mountSections()
    await settle()

    const title = getComputedStyle(part('title'))
    expect(title.fontSize).toBe(resolved('font-size', '--xh-text-heading-3-size'))
    expect(title.fontWeight).toBe(resolved('font-weight', '--xh-text-heading-3-weight'))
    expect(title.color).toBe(resolved('color', '--xh-fg-default'))

    const close = part('close-trigger')
    const glyph = getComputedStyle(close, '::before')
    expect(glyph.width).toBe('12px')
    const box = paddingBox(part('content'))
    const closeRect = close.getBoundingClientRect()
    const headerRect = part('header').getBoundingClientRect()
    expect(box.right - closeRect.right).toBeCloseTo(16, 0)
    expect(closeRect.top + closeRect.height / 2).toBeCloseTo(headerRect.top + headerRect.height / 2, 0)
  })

  it('紧凑密度下头部随控件档收到 44px', async () => {
    document.documentElement.dataset.density = 'compact'
    mountSections()
    await settle()

    expect(part('header').getBoundingClientRect().height).toBeCloseTo(44, 0)
  })

  it('不分三段时标题行与关闭钮落在顶上 48px 头部带的中线上', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhDrawerRoot, { open: true }, () => [
        h(XhDrawerTrigger, null, () => '打开'),
        h(XhDrawerContent, null, () => [
          h(XhDrawerTitle, null, () => '设置'),
          h(XhDrawerCloseTrigger, { 'aria-label': '关闭' }),
        ]),
      ]),
    })
    app.mount(host)
    await settle()

    const box = paddingBox(part('content'))
    const titleRect = part('title').getBoundingClientRect()
    const closeRect = part('close-trigger').getBoundingClientRect()
    expect(titleRect.top + titleRect.height / 2).toBeCloseTo(box.top + 24, 0)
    expect(closeRect.top + closeRect.height / 2).toBeCloseTo(box.top + 24, 0)
    expect(titleRect.left - box.left).toBeCloseTo(16, 0)
  })

  it.each(['right', 'left', 'top', 'bottom'] as const)('%s：开着时入场动画走 --xh-motion-duration-slide（320ms），不是 enter 档', async (side) => {
    await mountThenOpen(side)

    // 第一段是整幅位移，第二段是并列的淡变（缺省档两端都是不透明）
    const content = getComputedStyle(part('content'))
    expect(content.animationName.split(', ')).toEqual(['xh-slide-in', 'xh-slide-fade-in'])
    expect(content.animationDuration.split(', ')[0]).toBe('0.32s')
  })

  it.each([
    ['right', '100%'],
    ['left', '-100%'],
    ['top', '0px -100%'],
    ['bottom', '0px 100%'],
  ] as const)('%s：入场首帧从所贴的那条边外整幅推入', async (side, from) => {
    await mountThenOpen(side)

    const [slide] = part('content').getAnimations().filter(a => (a as CSSAnimation).animationName === 'xh-slide-in')
    slide!.pause()
    slide!.currentTime = 0
    expect(getComputedStyle(part('content')).translate).toBe(from)
  })

  it.each([
    ['right', '-100%'],
    ['left', '100%'],
  ] as const)('从右到左（RTL）下 %s：行内方向的推入随书写方向翻转，与逻辑贴边同侧', async (side, from) => {
    document.documentElement.dir = 'rtl'
    try {
      await mountThenOpen(side)

      const [slide] = part('content').getAnimations().filter(a => (a as CSSAnimation).animationName === 'xh-slide-in')
      slide!.pause()
      slide!.currentTime = 0
      expect(getComputedStyle(part('content')).translate).toBe(from)
    }
    finally {
      document.documentElement.removeAttribute('dir')
    }
  })

  it('触发器与关闭钮接了 Action Control：触发器 outline 描边盒，关闭钮 ghost 正方盒', async () => {
    mount()
    await settle()

    const trigger = getComputedStyle(part('trigger'))
    expect(part('trigger').getAttribute('data-xh-action-variant')).toBe('outline')
    expect(trigger.borderTopWidth).toBe('1px')
    expect(trigger.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
    // 展开期间触发器压住不弹起：open 与家族 hover 同档中性，底是 --xh-bg-subtle 而不是透明
    expect(trigger.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
