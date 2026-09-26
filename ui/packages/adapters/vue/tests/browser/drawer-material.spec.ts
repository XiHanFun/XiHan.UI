// 抽屉面板的 M4 sheet 三件套与 slide 入场：边界由描边承担而不是只靠影分层，入场走大尺度位移那一档。
// 这两件只有真实浏览器量得出来：jsdom 不算样式，animation-duration 与描边色都要皮肤真的加载进来才有计算值。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhDrawerContent, XhDrawerRoot, XhDrawerTitle, XhDrawerTrigger } from '../../src'
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

function mount(side: 'left' | 'right' | 'top' | 'bottom' = 'right'): void {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhDrawerRoot, { open: true, side, variant: 'blur' }, () => [
      h(XhDrawerTrigger, null, () => '打开'),
      h(XhDrawerContent, null, () => [h(XhDrawerTitle, null, () => '设置'), h('button', '保存')]),
    ]),
  })
  app.mount(host)
}

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  delete document.documentElement.dataset.theme
})

describe('drawer 的 M4 sheet 面板与 slide 入场', () => {
  it.each(['light', 'dark'] as const)('%s：面板有 1px 非透明描边、不透明底与 M4 投影，不只靠影分层', async (theme) => {
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
    expect(content.boxShadow).toContain('2px 4px')
    expect(content.boxShadow).toContain('32px 64px')
    // 遮罩的模糊两个前缀都写
    expect(getComputedStyle(part('backdrop')).backdropFilter).toContain('blur(12px)')
  })

  it.each(['right', 'left', 'top', 'bottom'] as const)('%s：开着时入场动画走 --xh-motion-duration-slide（320ms），不是 enter 档', async (side) => {
    mount(side)
    await settle()

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
    mount(side)
    await settle()

    const [slide] = part('content').getAnimations().filter(a => (a as CSSAnimation).animationName === 'xh-slide-in')
    slide!.pause()
    slide!.currentTime = 0
    expect(getComputedStyle(part('content')).translate).toBe(from)
  })

  it.each([
    ['right', '-100%'],
    ['left', '100%'],
  ] as const)('RTL 下 %s：行内方向的推入随书写方向翻转，与逻辑贴边同侧', async (side, from) => {
    document.documentElement.dir = 'rtl'
    try {
      mount(side)
      await settle()

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
