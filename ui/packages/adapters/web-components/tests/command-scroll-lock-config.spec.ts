// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { setXhConfig } from '../src/config'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement {
  updateComplete: Promise<unknown>
}

interface CommandElement extends Updatable {
  open?: boolean
}

interface ConfigElement extends Updatable {
  scrollRoot?: () => HTMLElement | null
}

const commandMarkup = `<xh-command>
  <div data-xh-part="root">
    <button data-xh-part="trigger">打开</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="content">
      <input data-xh-part="input" />
      <div data-xh-part="list"></div>
    </div>
  </div>
</xh-command>`

async function settle(element: Updatable): Promise<void> {
  await element.updateComplete
  await element.updateComplete
}

async function open(command: CommandElement): Promise<void> {
  await settle(command)
  command.open = true
  await settle(command)
}

afterEach(() => {
  setXhConfig({})
  document.body.innerHTML = ''
  document.body.style.cssText = ''
  document.documentElement.style.cssText = ''
})

describe('xh-command 的 scrollRoot 配置', () => {
  it('模态打开时读取全局 scrollRoot，不把页面当作隐式目标', async () => {
    const host = document.createElement('div')
    host.innerHTML = `<div id="global" style="overflow: auto"></div>${commandMarkup}`
    const scroller = host.querySelector<HTMLElement>('#global')!
    setXhConfig({ scrollRoot: () => scroller })
    document.body.append(host)
    const command = host.querySelector<CommandElement>('xh-command')!

    await open(command)

    expect(scroller.style.overflow).toBe('hidden')
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('最近的 xh-config scrollRoot 压过全局配置', async () => {
    const host = document.createElement('div')
    host.innerHTML = `<div id="global" style="overflow: auto"></div>
      <xh-config id="scope">
        <div id="local" style="overflow: auto"></div>
        ${commandMarkup}
      </xh-config>`
    const globalScroller = host.querySelector<HTMLElement>('#global')!
    const localScroller = host.querySelector<HTMLElement>('#local')!
    const scope = host.querySelector<ConfigElement>('#scope')!
    setXhConfig({ scrollRoot: () => globalScroller })
    scope.scrollRoot = () => localScroller
    document.body.append(host)
    await settle(scope)
    const command = host.querySelector<CommandElement>('xh-command')!

    await open(command)

    expect(localScroller.style.overflow).toBe('hidden')
    expect(globalScroller.style.overflow).not.toBe('hidden')
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})
