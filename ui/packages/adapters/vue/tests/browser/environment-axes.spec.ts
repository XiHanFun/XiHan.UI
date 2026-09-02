// 三条环境轴上的皮肤取值：高对比（forced-colors）、打印（print）、移动视口的安全区。
//
// 三档都不是常态渲染，开发机上一个像素都看不出差别，只有把浏览器真切到那一档才验得了：
// 这里经 CDP 的 Emulation.setEmulatedMedia 切档，再读级联算出来的取值。
// jsdom 不解析样式表里的 var() 与继承，getComputedStyle 恒是空串，这几条只能落在浏览器态。
//
// 节点直接按 data-scope / data-part 手搭：皮肤的选择器只认这两个属性与状态属性，
// 与是哪个适配器渲出来的无关，手搭的结构与组件渲出来的结构在选择器眼里一模一样。
import { cdp } from '@vitest/browser/context'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
// 皮肤与令牌一起加载：这里查的就是皮肤算出来的取值
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

/** 把一段标记挂进文档，返回它的根。 */
function mount(html: string): HTMLElement {
  host?.remove()
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  return host
}

function styleOf(selector: string): CSSStyleDeclaration {
  const node = host?.querySelector(selector)
  if (!node)
    throw new Error(`没有找到 ${selector}`)
  return getComputedStyle(node)
}

/** 切到某一档媒体；features 为空即切回常态。 */
async function emulate(options: { media?: string, features?: { name: string, value: string }[] }): Promise<void> {
  await cdp().send('Emulation.setEmulatedMedia', {
    media: options.media ?? '',
    features: options.features ?? [],
  })
}

/** 让系统占住四周各一段，env(safe-area-inset-*) 随之给出这几个值；四边给 0 即让回来。 */
async function emulateSafeArea(insets: { top: number, bottom: number, left: number, right: number }): Promise<void> {
  await cdp().send('Emulation.setSafeAreaInsetsOverride' as never, { insets } as never)
}

afterEach(async () => {
  host?.remove()
  host = null
  await emulate({})
  await emulateSafeArea({ top: 0, bottom: 0, left: 0, right: 0 })
})

describe('高对比档', () => {
  beforeEach(async () => {
    await emulate({ features: [{ name: 'forced-colors', value: 'active' }] })
  })

  it('强档与轻档各画一圈环，两档的线型与粗细都不同', () => {
    mount(`
      <div data-scope="menu" data-part="item" data-highlighted></div>
      <div data-scope="menu" data-part="item" data-selected></div>
      <div data-scope="menu" data-part="item"></div>
    `)
    const light = styleOf('[data-highlighted]')
    const strong = styleOf('[data-selected]')
    const plain = styleOf('[data-part="item"]:not([data-highlighted]):not([data-selected])')

    expect(light.outlineStyle).toBe('dashed')
    expect(light.outlineWidth).toBe('1px')
    expect(strong.outlineStyle).toBe('solid')
    expect(strong.outlineWidth).toBe('2px')
    // 环往内收，不占版面也不压到相邻条目上
    expect(light.outlineOffset).toBe('-1px')
    expect(strong.outlineOffset).toBe('-2px')
    // 没有状态的那一条一圈都不画
    expect(plain.outlineStyle).toBe('none')
  })

  it('定位层里那张面补一圈实边——阴影在这一档被丢弃', () => {
    mount(`
      <div data-scope="popover" data-part="positioner">
        <div data-scope="popover" data-part="content"></div>
      </div>
    `)
    const content = styleOf('[data-part="content"]')
    expect(content.borderTopStyle).toBe('solid')
    expect(content.borderTopWidth).toBe('1px')
  })

  it('铺满视口的定位层与遮罩自己不画环', () => {
    mount(`
      <div data-scope="dialog" data-part="positioner" data-state="open"></div>
      <div data-scope="dialog" data-part="backdrop" data-state="open"></div>
      <div data-scope="menu" data-part="item" data-state="open"></div>
    `)
    expect(styleOf('[data-part="positioner"]').outlineStyle).toBe('none')
    expect(styleOf('[data-part="backdrop"]').outlineStyle).toBe('none')
    // 展开路径上的条目照画
    expect(styleOf('[data-part="item"]').outlineStyle).toBe('solid')
  })

  it('只读控件改画虚线边，与能改的控件分得开', () => {
    // 描边取自 root 上声明的私有槽，缺了 root 那一层整条 border 会在计算值阶段失效
    mount(`
      <div data-scope="text-field" data-part="root">
        <div data-scope="text-field" data-part="control" data-readonly></div>
        <div data-scope="text-field" data-part="control"></div>
      </div>
    `)
    expect(styleOf('[data-readonly]').borderTopStyle).toBe('dashed')
    expect(styleOf('[data-part="control"]:not([data-readonly])').borderTopStyle).toBe('solid')
  })

  it('新增行与删除行的两条通道各自还在：一实一虚', () => {
    mount(`
      <div data-scope="diff-view" data-part="row" data-change="added"></div>
      <div data-scope="diff-view" data-part="row" data-change="removed"></div>
    `)
    expect(styleOf('[data-change="added"]').outlineStyle).toBe('solid')
    expect(styleOf('[data-change="removed"]').outlineStyle).toBe('dashed')
  })

  it('画的就是颜色的那几处退出强制着色，并各补一圈系统描边', () => {
    mount(`
      <div data-scope="color-picker" data-part="area"></div>
      <div data-scope="heatmap" data-part="root"><div data-scope="heatmap" data-part="cell"></div></div>
    `)
    expect(styleOf('[data-scope="color-picker"][data-part="area"]').forcedColorAdjust).toBe('none')
    const cell = styleOf('[data-part="cell"]')
    expect(cell.forcedColorAdjust).toBe('none')
    expect(cell.outlineStyle).toBe('solid')
  })

  it('常态下这几条一条都不生效', async () => {
    await emulate({})
    mount(`
      <div data-scope="menu" data-part="item" data-selected></div>
      <div data-scope="text-field" data-part="root">
        <div data-scope="text-field" data-part="control" data-readonly></div>
      </div>
    `)
    expect(styleOf('[data-selected]').outlineStyle).toBe('none')
    expect(styleOf('[data-readonly]').borderTopStyle).toBe('solid')
  })
})

describe('打印档', () => {
  beforeEach(async () => {
    await emulate({ media: 'print' })
  })

  it('热度档位改画成边框的粗细，档位越高边越厚', () => {
    mount(`
      <div data-scope="heatmap" data-part="root">
        <div data-scope="heatmap" data-part="cell" data-level="0"></div>
        <div data-scope="heatmap" data-part="cell" data-level="1"></div>
        <div data-scope="heatmap" data-part="cell" data-level="2"></div>
        <div data-scope="heatmap" data-part="cell" data-level="3"></div>
        <div data-scope="heatmap" data-part="cell" data-level="4"></div>
      </div>
    `)
    const widths = [0, 1, 2, 3, 4].map(level => Number.parseFloat(styleOf(`[data-level="${level}"]`).borderTopWidth))
    // 逐档递增，且最高档正好是半个格宽（格宽 10px），整格填满
    for (let i = 1; i < widths.length; i++)
      expect(widths[i]).toBeGreaterThan(widths[i - 1])
    expect(widths[0]).toBe(1)
    expect(widths[4]).toBe(5)
    // 边算在尺寸里，格子大小一点不变
    expect(styleOf('[data-level="4"]').inlineSize).toBe(styleOf('[data-level="0"]').inlineSize)
  })

  it('标出来的那几行改画一圈内收的实边', () => {
    mount(`
      <div data-scope="code-view" data-part="root">
        <div data-scope="code-view" data-part="line" data-highlighted></div>
        <div data-scope="code-view" data-part="line"></div>
      </div>
    `)
    const marked = styleOf('[data-highlighted]')
    expect(marked.outlineStyle).toBe('solid')
    expect(marked.outlineWidth).toBe('2px')
    expect(marked.outlineOffset).toBe('-2px')
    expect(styleOf('[data-part="line"]:not([data-highlighted])').outlineStyle).toBe('none')
  })

  it('常态下这两条一条都不生效', async () => {
    await emulate({})
    mount(`
      <div data-scope="heatmap" data-part="root">
        <div data-scope="heatmap" data-part="cell" data-level="4"></div>
      </div>
      <div data-scope="code-view" data-part="root">
        <div data-scope="code-view" data-part="line" data-highlighted></div>
      </div>
    `)
    expect(styleOf('[data-level="4"]').borderTopWidth).toBe('0px')
    expect(styleOf('[data-part="line"][data-highlighted]').outlineStyle).toBe('none')
  })
})

describe('安全区', () => {
  it('系统没让出任何一段时，贴边就是贴边槽本来的取值', () => {
    mount(`<div data-scope="toast" data-part="group"></div>`)
    const group = styleOf('[data-part="group"]')
    // --xh-space-6 = 24px；env() 在没有安全区的视口上恒为 0，max() 取的是贴边槽那一头
    expect(group.paddingTop).toBe('24px')
    expect(group.paddingBottom).toBe('24px')
    expect(group.paddingLeft).toBe('24px')
    expect(group.paddingRight).toBe('24px')
  })

  it('系统占住的那一段比贴边宽时，贴边让到它外面', async () => {
    // 四周各占一段：上下比贴边宽，左右比贴边窄
    await emulateSafeArea({ top: 47, bottom: 59, left: 13, right: 17 })
    mount(`
      <div data-scope="toast" data-part="group"></div>
      <div data-scope="notification" data-part="group"></div>
      <div data-scope="back-top" data-part="root"></div>
      <div data-scope="loading-bar" data-part="root"></div>
    `)
    const toast = styleOf('[data-scope="toast"][data-part="group"]')
    // 上下让到系统那一段外面；左右两段都比 24px 窄，贴边槽那一头仍然赢
    expect(toast.paddingTop).toBe('47px')
    expect(toast.paddingBottom).toBe('59px')
    expect(toast.paddingLeft).toBe('24px')
    expect(toast.paddingRight).toBe('24px')

    const notification = styleOf('[data-scope="notification"][data-part="group"]')
    expect(notification.paddingTop).toBe('47px')
    expect(notification.paddingBottom).toBe('59px')

    // 贴边 --xh-space-8 = 32px，底部那一段 59px 更宽
    expect(styleOf('[data-scope="back-top"][data-part="root"]').bottom).toBe('59px')
    // 顶部进度条整条让到状态栏下面
    expect(styleOf('[data-scope="loading-bar"][data-part="root"]').top).toBe('47px')
  })

  it('行内轴两侧同取较宽的那一段，RTL 下不会翻错边', async () => {
    // 只有物理左边被占住，且比贴边宽
    await emulateSafeArea({ top: 0, bottom: 0, left: 40, right: 0 })
    mount(`
      <div data-scope="toast" data-part="group"></div>
      <div data-scope="back-top" data-part="root"></div>
    `)
    const toast = styleOf('[data-scope="toast"][data-part="group"]')
    expect(toast.paddingLeft).toBe('40px')
    expect(toast.paddingRight).toBe('40px')
    // 贴边 32px 被那 40px 顶开
    expect(styleOf('[data-scope="back-top"][data-part="root"]').right).toBe('40px')
  })

  it('局部容器里的抽屉不让位，铺满视口的那一档才让', async () => {
    await emulateSafeArea({ top: 47, bottom: 59, left: 0, right: 0 })
    mount(`
      <div data-scope="drawer" data-part="content"></div>
      <div data-scope="drawer" data-part="content" data-contained></div>
    `)
    const full = styleOf('[data-scope="drawer"][data-part="content"]:not([data-contained])')
    expect(full.paddingTop).toBe('47px')
    expect(full.paddingBottom).toBe('59px')
    const contained = styleOf('[data-contained]')
    expect(contained.paddingTop).not.toBe('47px')
    expect(contained.paddingBottom).not.toBe('59px')
  })

  it('浮动按钮四个角，各让各那条边', async () => {
    await emulateSafeArea({ top: 47, bottom: 59, left: 40, right: 0 })
    mount(`
      <div data-scope="float-button" data-part="root" data-placement="top-start"></div>
      <div data-scope="float-button" data-part="root" data-placement="bottom-end"></div>
    `)
    const topStart = styleOf('[data-placement="top-start"]')
    const bottomEnd = styleOf('[data-placement="bottom-end"]')
    // 贴边槽缺省 --xh-space-6 = 24px
    expect(topStart.top).toBe('47px')
    expect(topStart.left).toBe('40px')
    expect(bottomEnd.bottom).toBe('59px')
    // 行内轴两侧同取较宽的那一段：右边没被占住，左边那 40px 照样把它顶开
    expect(bottomEnd.right).toBe('40px')
  })

  it('看图时那四件悬浮件贴的是屏幕边，四条边逐条让位', async () => {
    await emulateSafeArea({ top: 47, bottom: 59, left: 40, right: 0 })
    mount(`
      <div data-scope="image-viewer" data-part="content">
        <div data-scope="image-viewer" data-part="toolbar"></div>
        <div data-scope="image-viewer" data-part="counter"></div>
        <div data-scope="image-viewer" data-part="prev-trigger"></div>
        <div data-scope="image-viewer" data-part="next-trigger"></div>
        <div data-scope="image-viewer" data-part="close-trigger"></div>
      </div>
    `)
    expect(styleOf('[data-part="toolbar"]').bottom).toBe('59px')
    expect(styleOf('[data-part="counter"]').top).toBe('47px')
    expect(styleOf('[data-part="prev-trigger"]').left).toBe('40px')
    expect(styleOf('[data-part="next-trigger"]').right).toBe('40px')
    const close = styleOf('[data-part="close-trigger"]')
    expect(close.top).toBe('47px')
    expect(close.right).toBe('40px')
  })

  it('贴边那几条声明都真解析了：写坏时会整条失效退回 0', () => {
    mount(`
      <div data-scope="back-top" data-part="root"></div>
      <div data-scope="loading-bar" data-part="root"></div>
    `)
    const backTop = styleOf('[data-scope="back-top"][data-part="root"]')
    // --xh-space-8 = 32px；声明若因 env() 不认而整条失效，这里会读到 auto
    expect(backTop.bottom).toBe('32px')
    expect(backTop.right).toBe('32px')
    expect(styleOf('[data-scope="loading-bar"][data-part="root"]').top).toBe('0px')
  })
})
