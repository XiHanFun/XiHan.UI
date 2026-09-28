// 披露内容的挂卸：unmountOnExit 要等收起动画真正播完才卸，播放期间内容仍在、退场看得见。
// jsdom 不播动画，animationend 何时到只有真实浏览器说了算。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhCollapsibleContent, XhCollapsibleRoot, XhCollapsibleTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function part(name: string): HTMLElement {
  const element = host!.querySelector<HTMLElement>(`[data-scope="collapsible"][data-part="${name}"]`)
  if (!element)
    throw new Error(`缺少 collapsible 部件：${name}`)
  return element
}

async function mount(props: Record<string, unknown>): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhCollapsibleRoot, props, () => [
      h(XhCollapsibleTrigger, null, () => '切换'),
      h(XhCollapsibleContent, null, () => h('p', { 'data-testid': 'body' }, '明细')),
    ]),
  })
  app.mount(host)
  await nextTick()
}

describe('collapsible 内容挂卸', () => {
  it('lazyMount：首屏不挂内容，第一次展开才挂', async () => {
    await mount({ lazyMount: true })
    expect(host!.querySelector('[data-testid="body"]')).toBeNull()
    part('trigger').click()
    await nextTick()
    expect(host!.querySelector('[data-testid="body"]')).not.toBeNull()
  })

  it('unmountOnExit：收起动画播放期间内容仍在，播完才卸下，content 节点留在原地', async () => {
    await mount({ unmountOnExit: true, defaultOpen: true })
    expect(host!.querySelector('[data-testid="body"]')).not.toBeNull()
    part('trigger').click()
    await nextTick()
    // 收起刚开始：退场动画正在播，内容还挂着
    expect(part('content').getAttribute('data-state')).toBe('closed')
    expect(host!.querySelector('[data-testid="body"]')).not.toBeNull()
    await expect.poll(() => host!.querySelector('[data-testid="body"]'), { timeout: 2000 }).toBeNull()
    expect(part('content').style.display).toBe('none')
  })
})
