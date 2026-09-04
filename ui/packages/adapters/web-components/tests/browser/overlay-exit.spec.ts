// 退场动画只能在真实浏览器里验：jsdom 不把样式表里的 animation 简写算进
// getComputedStyle（animationName 恒为空串），退场探测那条路在 jsdom 里天然走不到。
//
// Light DOM 下节点归作者，收起靠内联 display——所以这里查的是「退场期间 display 没被写死」。
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
    expect(getComputedStyle(content).animationName).toBe('xh-pop-out')

    expect(await animationEnd(content), '退场动画应当真的结束一次').toBe(true)
    await settle()
    expect(content.style.display, '动画结束后应当收起').toBe('none')
  })
})
