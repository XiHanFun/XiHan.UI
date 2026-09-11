// 退场动画只能在真实浏览器里验：jsdom 不把样式表里的 animation 简写算进
// getComputedStyle（animationName 恒为空串），退场探测那条路在 jsdom 里天然走不到。
//
// Light DOM 下节点归作者，收起靠内联 display——所以这里查的是「退场期间 display 没被写死」。
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
// 皮肤要一起加载：这里查的就是皮肤给出的 animationName
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

/** 按最小合规结构手写一棵 Light DOM，返回宿主元素。 */
function mount(html: string): HTMLElement {
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  return host.firstElementChild as HTMLElement
}

function part(scope: string, name: string): HTMLElement | null {
  return document.querySelector(`[data-scope='${scope}'][data-part='${name}']`)
}

/** 让自定义元素跑完这一轮更新。 */
async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
}

function animationEnd(el: HTMLElement, timeout = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeout, false)
    el.addEventListener('animationend', (e) => {
      if (e.target !== el)
        return
      clearTimeout(timer)
      resolve(true)
    }, { once: true })
  })
}

const DIALOG = `
  <xh-dialog open>
    <button data-xh-part="trigger">开</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">标题</h2>
      </div>
    </div>
  </xh-dialog>
`

describe.each(['dialog', 'drawer'] as const)('wc %s 的行为资源退出合同', (scope) => {
  function installLongExit(): void {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-exit-fade { from { opacity: 1 } to { opacity: 0 } }
      @keyframes test-exit-move { from { translate: 0 0 } to { translate: 0 8px } }
      @keyframes test-exit-shine { from { outline-color: transparent } to { outline-color: transparent } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'] {
        animation: test-exit-fade 60s linear forwards, test-exit-move 60s linear forwards, test-exit-shine 60s linear infinite;
      }
      [data-scope='${scope}'][data-part='backdrop'][data-state='closed'] { animation: test-exit-fade 60s linear forwards }
    `
    document.body.append(style)
  }
  function finite(node: HTMLElement): Animation[] {
    return node.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
  }
  function fixture(): HTMLElement {
    return mount(`<xh-${scope} open><div${scope === 'drawer' ? ' data-xh-part="root"' : ''}>
      <button data-xh-part="trigger">打开</button><div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner"><div data-xh-part="content"><h2 data-xh-part="title">标题</h2><button>内部</button></div></div>
    </div></xh-${scope}>`)
  }

  it('内容全部有限动画和遮罩完成前保留失活与滚动约束', async () => {
    installLongExit()
    const outside = document.createElement('button')
    document.body.append(outside)
    const element = fixture()
    const completed: number[] = []
    element.addEventListener('exit-complete', () => completed.push(getLayerRegistry(document).list().length))
    await settle()
    element.setAttribute('open', 'false')
    await settle()
    const content = part(scope, 'content')!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    const action = content.querySelector('button')!
    action.focus()
    expect(document.activeElement).not.toBe(action)
    expect(outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    const animations = finite(content)
    expect(animations).toHaveLength(2)
    animations[0]!.finish()
    await settle()
    expect(completed).toEqual([])
    animations[1]!.finish()
    await settle()
    expect(completed).toEqual([])
    for (const animation of finite(part(scope, 'backdrop')!)) animation.finish()
    await settle()
    expect(completed).toEqual([0])
    expect(outside.inert).toBe(false)
    expect(content.style.display).toBe('none')
  })

  it('重开废弃旧完成，卸载立即撤销模态资源', async () => {
    installLongExit()
    const element = fixture()
    const completed: number[] = []
    element.addEventListener('exit-complete', () => completed.push(getLayerRegistry(document).list().length))
    await settle()
    element.setAttribute('open', 'false')
    await settle()
    const old = finite(part(scope, 'content')!)
    element.setAttribute('open', 'true')
    await settle()
    for (const animation of old) animation.cancel()
    await settle()
    expect(part(scope, 'content')!.inert).toBe(false)
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    expect(completed).toEqual([])
    element.setAttribute('open', 'false')
    await settle()
    element.remove()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(completed).toEqual([])
  })
})

const IMAGE_VIEWER = `
  <xh-image-viewer open>
    <button data-xh-part="trigger">开</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content"><img data-xh-part="image"><button>内部</button></div>
    </div>
  </xh-image-viewer>
`

describe('wc image-viewer 的行为资源退出合同', () => {
  it('内容和遮罩均完成退出租约前保留模态资源', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-image-viewer-exit { from { opacity: 1 } to { opacity: 0 } }
      @keyframes test-image-viewer-move { from { translate: 0 0 } to { translate: 0 8px } }
      [data-scope='image-viewer'][data-part='content'][data-state='closed'] {
        animation: test-image-viewer-exit 60s linear forwards, test-image-viewer-move 60s linear forwards;
      }
      [data-scope='image-viewer'][data-part='backdrop'][data-state='closed'] {
        animation: test-image-viewer-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const outside = document.createElement('button')
    document.body.append(outside)
    const element = mount(IMAGE_VIEWER)
    await settle()

    element.setAttribute('open', 'false')
    await settle()
    const content = part('image-viewer', 'content')!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')

    const finite = content.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
    expect(finite).toHaveLength(2)
    finite[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    finite[1]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    for (const animation of part('image-viewer', 'backdrop')!.getAnimations()) animation.finish()
    await settle()

    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(outside.inert).toBe(false)
    expect(content.style.display).toBe('none')
  })
})

describe('wc tour 的退出资源', () => {
  it('气泡、遮罩与聚光灯全部完成前保留 Layer，但不接入 Tour 没有的背景资源', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-tour-exit { from { opacity: 1 } to { opacity: 0 } }
      @keyframes test-tour-move { from { translate: 0 0 } to { translate: 0 8px } }
      [data-scope='tour'][data-part='content'][data-state='closed'] {
        animation: test-tour-exit 60s linear forwards, test-tour-move 60s linear forwards;
      }
      [data-scope='tour'][data-part='backdrop'][data-state='closed'],
      [data-scope='tour'][data-part='spotlight'][data-state='closed'] {
        animation: test-tour-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const target = document.createElement('button')
    target.id = 'tour-exit-target'
    document.body.append(target)
    const element = mount(`
      <xh-tour open>
        <div data-xh-part="root"></div>
        <div data-xh-part="backdrop"></div>
        <div data-xh-part="spotlight"></div>
        <div data-xh-part="positioner"><div data-xh-part="content"><h2 data-xh-part="title">第一步</h2></div></div>
      </xh-tour>
    `)
    const tour = element as HTMLElement & { steps: Array<{ id: string, target: string, title: string }> }
    tour.steps = [
      { id: 'one', target: '#tour-exit-target', title: '第一步' },
    ]
    await settle()
    expect(part('tour', 'content')!.style.display).not.toBe('none')
    expect(part('tour', 'spotlight')!.hasAttribute('hidden')).toBe(false)

    element.setAttribute('open', 'false')
    await settle()
    const content = part('tour', 'content')!
    const backdrop = part('tour', 'backdrop')!
    const spotlight = part('tour', 'spotlight')!
    expect(content.getAttribute('data-state')).toBe('closed')
    expect(getComputedStyle(content).animationName).toContain('test-tour-exit')
    expect(getComputedStyle(content).display).not.toBe('none')
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(target.inert).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')

    const finite = (node: HTMLElement): Animation[] => node.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
    const contentAnimations = finite(content)
    expect(contentAnimations).toHaveLength(2)
    contentAnimations[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    contentAnimations[1]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    for (const animation of finite(backdrop)) animation.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    for (const animation of finite(spotlight)) animation.finish()
    await settle()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await settle()

    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(content.style.display).toBe('none')
  })
})

describe('wc dialog 退场', () => {
  it('收起后 content 不立刻被写成 display:none，而是在播退场动画', async () => {
    const el = mount(DIALOG)
    await settle()

    const content = part('dialog', 'content')!
    expect(content, '展开时 content 应已接线').not.toBeNull()
    expect(content.style.display).not.toBe('none')

    el.setAttribute('open', 'false')
    await settle()

    // 这条是本次回归的靶心：收起此前跟着 open 同帧写内联 display:none，
    // 元素当场不生成盒子，退场动画一帧都播不出来
    expect(content.style.display, '退场动画播完之前不能写 display:none').not.toBe('none')
    expect(getComputedStyle(content).animationName).toBe('xh-dialog-out')
  })

  it('遮罩同时在播淡出', async () => {
    const el = mount(DIALOG)
    await settle()

    el.setAttribute('open', 'false')
    await settle()

    const backdrop = part('dialog', 'backdrop')!
    expect(backdrop.style.display).not.toBe('none')
    expect(getComputedStyle(backdrop).animationName).toBe('xh-fade-out')
  })

  it('动画结束后才真的收起', async () => {
    const el = mount(DIALOG)
    await settle()

    const content = part('dialog', 'content')!
    el.setAttribute('open', 'false')
    await settle()

    expect(await animationEnd(content), '退场动画应当真的结束一次').toBe(true)
    await settle()

    expect(content.style.display, '动画结束后应当收起').toBe('none')
  })

  it('退场中途重新展开，收起不会迟到落下来', async () => {
    const el = mount(DIALOG)
    await settle()

    const content = part('dialog', 'content')!
    el.setAttribute('open', 'false')
    await settle()
    el.setAttribute('open', '')
    await settle()

    expect(content.style.display).not.toBe('none')
    expect(getComputedStyle(content).animationName).toBe('xh-dialog-in')

    // 再等一段，确认前一次退场的收尾没有把已经重新展开的面板收掉
    await new Promise(resolve => setTimeout(resolve, 400))
    expect(content.style.display, '重新展开后不该被上一轮退场收起').not.toBe('none')
  })

  it('退场中途元素离场：立刻收起，不留在页面上', async () => {
    const el = mount(DIALOG)
    await settle()

    const content = part('dialog', 'content')!
    el.setAttribute('open', 'false')
    await settle()
    el.remove()
    await settle()

    expect(content.style.display, '离场时必须强制结清').toBe('none')
  })
})

const POPOVER = `
  <xh-popover open>
    <button data-xh-part="trigger">开</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">标题</h2>
      </div>
    </div>
  </xh-popover>
`

describe('wc popover 退场', () => {
  it('收起后 content 不立刻被写成 display:none，而是在播退场动画', async () => {
    const el = mount(POPOVER)
    await settle()

    const content = part('popover', 'content')!
    expect(content, '展开时 content 应已接线').not.toBeNull()
    expect(content.style.display).not.toBe('none')

    el.setAttribute('open', 'false')
    await settle()
    expect(content.style.display, '退场动画播完之前不能写 display:none').not.toBe('none')
    expect(getComputedStyle(content).animationName).toBe('xh-pop-out')
  })

  it('动画结束后才真的收起', async () => {
    const el = mount(POPOVER)
    await settle()

    const content = part('popover', 'content')!
    el.setAttribute('open', 'false')
    await settle()

    expect(await animationEnd(content), '退场动画应当真的结束一次').toBe(true)
    await settle()

    expect(content.style.display, '动画结束后应当收起').toBe('none')
  })

  it('退场中途重新展开，收起不会迟到落下来', async () => {
    const el = mount(POPOVER)
    await settle()

    const content = part('popover', 'content')!
    el.setAttribute('open', 'false')
    await settle()
    el.setAttribute('open', '')
    await settle()

    expect(content.style.display).not.toBe('none')
    expect(getComputedStyle(content).animationName).toBe('xh-overlay-pop-in')
  })
})

const TOOLTIP = `
  <xh-tooltip open>
    <button data-xh-part="trigger">锚</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">提示</div>
    </div>
  </xh-tooltip>
`

describe('wc tooltip 退场', () => {
  it('收起时在播退场，播完才真收', async () => {
    const el = mount(TOOLTIP)
    await settle()

    const content = part('tooltip', 'content')!
    expect(content.style.display).not.toBe('none')

    el.setAttribute('open', 'false')
    await settle()

    expect(content.style.display, '退场动画播完之前不能写 display:none').not.toBe('none')
    expect(getComputedStyle(content).animationName).toBe('xh-overlay-slide-out')

    expect(await animationEnd(content), '退场动画应当真的结束一次').toBe(true)
    await settle()
    expect(content.style.display, '动画结束后应当收起').toBe('none')
  })
})

const FLOATING_PANEL = `
  <xh-floating-panel open>
    <button data-xh-part="trigger">开</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="header">
          <h2 data-xh-part="title">面板</h2>
        </div>
        <div data-xh-part="body">正文</div>
      </div>
    </div>
  </xh-floating-panel>
`

describe('wc floating-panel 退场', () => {
  it('收起后 positioner 不立刻被写成 display:none，而是在播退场动画', async () => {
    const el = mount(FLOATING_PANEL)
    await settle()

    const positioner = part('floating-panel', 'positioner')!
    expect(positioner, '展开时 positioner 应已接线').not.toBeNull()
    expect(positioner.style.display).not.toBe('none')

    el.setAttribute('open', 'false')
    await settle()

    // 面板整棵子树都在 positioner 底下：它一收就不生成盒子，退场动画一帧都播不出来
    expect(positioner.style.display, '退场动画播完之前不能写 display:none').not.toBe('none')
    expect(getComputedStyle(positioner).animationName).toBe('xh-pop-out')
  })

  it('动画结束后才真的收起', async () => {
    const el = mount(FLOATING_PANEL)
    await settle()

    const positioner = part('floating-panel', 'positioner')!
    el.setAttribute('open', 'false')
    await settle()

    expect(await animationEnd(positioner), '退场动画应当真的结束一次').toBe(true)
    await settle()

    expect(positioner.style.display, '动画结束后应当收起').toBe('none')
  })

  it('退场中途重新展开，收起不会迟到落下来', async () => {
    const el = mount(FLOATING_PANEL)
    await settle()

    const positioner = part('floating-panel', 'positioner')!
    el.setAttribute('open', 'false')
    await settle()
    el.setAttribute('open', '')
    await settle()

    expect(positioner.style.display).not.toBe('none')
    expect(getComputedStyle(positioner).animationName).toBe('xh-pop-in')

    await new Promise(resolve => setTimeout(resolve, 400))
    expect(positioner.style.display, '重新展开后不该被上一轮退场收起').not.toBe('none')
  })

  it('退场中途元素离场：立刻收起，不留在页面上', async () => {
    const el = mount(FLOATING_PANEL)
    await settle()

    const positioner = part('floating-panel', 'positioner')!
    el.setAttribute('open', 'false')
    await settle()
    el.remove()
    await settle()

    expect(positioner.style.display, '离场时必须强制结清').toBe('none')
  })
})
