// 引导气泡的 M4 sheet 三件套、三颗动作钮的形态矩阵与分页点的形状：边界由描边承担而不是只靠影分层，
// 下一步是品牌实心、上一步中性描边、跳过无壳。这几件只有真实浏览器量得出来：jsdom 不算样式，
// 描边色、底色与圆角都要皮肤真的加载进来才有计算值。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTourArrow,
  XhTourBackdrop,
  XhTourCloseTrigger,
  XhTourContent,
  XhTourDescription,
  XhTourNextTrigger,
  XhTourPositioner,
  XhTourPrevTrigger,
  XhTourProgressDot,
  XhTourProgressIndicator,
  XhTourRoot,
  XhTourSkipTrigger,
  XhTourSpotlight,
  XhTourTitle,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const TRANSPARENT = 'rgba(0, 0, 0, 0)'

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

function part(name: string, index = 0): HTMLElement {
  const el = document.querySelectorAll<HTMLElement>(`[data-scope='tour'][data-part='${name}']`)[index]
  if (!el)
    throw new Error(`tour 的 ${name} 不在文档里`)
  return el
}

/** 挂一份三步引导：首步锚定页面上的真实元素，含全部四颗按钮与分页点。 */
function mount(): void {
  host = document.createElement('div')
  host.innerHTML = '<button id="tour-material-target">目标</button>'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTourRoot, {
      open: true,
      defaultValue: 1,
      steps: [
        { id: 'a', target: '#tour-material-target', title: '第一站', description: '这里是目标' },
        { id: 'b', target: '#tour-material-target', title: '第二站', description: '还是目标' },
        { id: 'c', target: null, title: '结束', description: '就这些' },
      ],
    }, () => [
      h(XhTourBackdrop),
      h(XhTourSpotlight),
      h(XhTourPositioner, null, () => [
        h(XhTourContent, null, () => [
          h(XhTourArrow),
          h(XhTourTitle),
          h(XhTourDescription),
          h(XhTourProgressIndicator, null, () => [0, 1, 2].map(index => h(XhTourProgressDot, { index }))),
          h(XhTourPrevTrigger, null, () => '上一步'),
          h(XhTourNextTrigger, null, () => '下一步'),
          h(XhTourSkipTrigger, null, () => '跳过'),
          h(XhTourCloseTrigger),
        ]),
      ]),
    ]),
  })
  app.mount(host)
}

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
  delete document.documentElement.dataset.theme
})

describe('tour 的 M4 sheet 气泡与 Action Control 动作钮', () => {
  it.each(['light', 'dark'] as const)('%s：气泡有 1px 非透明描边、不透明底与 M4 投影，箭头同色', async (theme) => {
    document.documentElement.dataset.theme = theme
    mount()
    await settle()

    const content = getComputedStyle(part('content'))
    expect(content.borderTopWidth).toBe('1px')
    expect(content.borderTopStyle).toBe('solid')
    expect(content.borderTopColor).not.toBe(TRANSPARENT)
    // 不透明底：末位 alpha 不是 0，也不是半透明 tint
    expect(content.backgroundColor).not.toBe(TRANSPARENT)
    expect(content.backgroundColor).not.toMatch(/\/ 0\.\d/)
    expect(content.boxShadow).toContain('2px 4px')
    expect(content.boxShadow).toContain('32px 64px')

    const arrow = getComputedStyle(part('arrow'))
    expect(arrow.backgroundColor).toBe(content.backgroundColor)
    expect(arrow.borderTopColor).toBe(content.borderTopColor)
  })

  it('下一步品牌实心、上一步中性描边、跳过无壳透明；关闭钮是 ghost 正方盒', async () => {
    mount()
    await settle()

    const next = part('next-trigger')
    expect(next.getAttribute('data-xh-action-variant')).toBe('solid')
    const nextStyle = getComputedStyle(next)
    expect(nextStyle.backgroundColor).not.toBe(TRANSPARENT)
    expect(nextStyle.borderTopColor).toBe(TRANSPARENT)
    // 三颗同高：sm 档（standard 密度 --xh-control-h-sm = 32px）
    expect(nextStyle.height).toBe('32px')

    const prev = part('prev-trigger')
    expect(prev.getAttribute('data-xh-action-variant')).toBe('outline')
    const prevStyle = getComputedStyle(prev)
    expect(prevStyle.backgroundColor).toBe(TRANSPARENT)
    expect(prevStyle.borderTopWidth).toBe('1px')
    expect(prevStyle.borderTopColor).not.toBe(TRANSPARENT)
    expect(prevStyle.height).toBe('32px')

    const skip = part('skip-trigger')
    expect(skip.getAttribute('data-xh-action-variant')).toBe('ghost')
    const skipStyle = getComputedStyle(skip)
    expect(skipStyle.backgroundColor).toBe(TRANSPARENT)
    expect(skipStyle.borderTopColor).toBe(TRANSPARENT)
    expect(skipStyle.height).toBe('32px')

    const close = part('close-trigger')
    expect(close.getAttribute('data-xh-action-profile')).toBe('icon')
    const closeStyle = getComputedStyle(close)
    expect(closeStyle.width).toBe('32px')
    expect(closeStyle.height).toBe('32px')
    expect(closeStyle.backgroundColor).toBe(TRANSPARENT)
  })

  it('分页点：未到与走过的是 8px 正圆，当前那颗拉成 20px 胶囊', async () => {
    mount()
    await settle()

    const done = getComputedStyle(part('progress-dot', 0))
    expect(done.width).toBe('8px')
    expect(done.height).toBe('8px')
    // circle 档：半径不小于半边长
    expect(Number.parseFloat(done.borderTopLeftRadius)).toBeGreaterThanOrEqual(4)

    const current = getComputedStyle(part('progress-dot', 1))
    expect(current.width).toBe('20px')
    expect(current.height).toBe('8px')
    expect(Number.parseFloat(current.borderTopLeftRadius)).toBeGreaterThanOrEqual(4)
  })

  it('说明文字走说明档 13px，滚动面自己收住滚动', async () => {
    mount()
    await settle()

    const description = getComputedStyle(part('description'))
    expect(description.fontSize).toBe('13px')
    expect(description.overscrollBehaviorY).toBe('contain')
  })
})
