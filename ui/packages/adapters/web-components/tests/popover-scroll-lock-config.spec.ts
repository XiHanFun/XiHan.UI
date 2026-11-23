// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { setXhConfig } from '../src/config'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement {
  updateComplete: Promise<unknown>
}

interface PopoverElement extends Updatable {
  open?: boolean
}

interface ConfigElement extends Updatable {
  scrollRoot?: () => HTMLElement | null
}

const popoverMarkup = `<xh-popover modal>
  <button data-xh-part="trigger">订阅设置</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h3 data-xh-part="title">订阅设置</h3>
      <button data-xh-part="close-trigger"></button>
    </div>
  </div>
</xh-popover>`

async function settle(element: Updatable): Promise<void> {
  await element.updateComplete
  await element.updateComplete
}

async function open(popover: PopoverElement): Promise<void> {
  await settle(popover)
  popover.open = true
  await settle(popover)
}

afterEach(() => {
  setXhConfig({})
  document.body.innerHTML = ''
  document.body.style.cssText = ''
  document.documentElement.style.cssText = ''
})

// 宿主把滚动搬进内容容器时 body 本身不滚，锁 body 是空操作：模态浮层要锁的是配置给的那一层
describe('xh-popover 的 scrollRoot 配置', () => {
  it('模态打开时锁全局配置给的滚动容器，不锁页面', async () => {
    const host = document.createElement('div')
    host.innerHTML = `<div id="global" style="overflow: auto"></div>${popoverMarkup}`
    const scroller = host.querySelector<HTMLElement>('#global')!
    setXhConfig({ scrollRoot: () => scroller })
    document.body.append(host)
    const popover = host.querySelector<PopoverElement>('xh-popover')!

    await open(popover)

    expect(scroller.style.overflow).toBe('hidden')
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('最近的 xh-config scrollRoot 压过全局配置', async () => {
    const host = document.createElement('div')
    host.innerHTML = `<div id="global" style="overflow: auto"></div>
      <xh-config id="scope">
        <div id="local" style="overflow: auto"></div>
        ${popoverMarkup}
      </xh-config>`
    const globalScroller = host.querySelector<HTMLElement>('#global')!
    const localScroller = host.querySelector<HTMLElement>('#local')!
    const scope = host.querySelector<ConfigElement>('#scope')!
    setXhConfig({ scrollRoot: () => globalScroller })
    scope.scrollRoot = () => localScroller
    document.body.append(host)
    await settle(scope)
    const popover = host.querySelector<PopoverElement>('xh-popover')!

    await open(popover)

    expect(localScroller.style.overflow).toBe('hidden')
    expect(globalScroller.style.overflow).not.toBe('hidden')
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})
