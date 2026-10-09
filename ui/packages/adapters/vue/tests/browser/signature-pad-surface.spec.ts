// SignaturePad 画布按字段外壳的规则自绘：静息字段淡底 + 控件描边，悬停描边升 border-strong，
// 落笔换承载面 + 聚焦描边，校验失败铺 4% 失效色淡底。计算样式只有真实浏览器量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhSignaturePadControl, XhSignaturePadPath, XhSignaturePadRoot } from '../../src'
import { pressPointer, releasePointerAway } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  await releasePointerAway()
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(props: Record<string, unknown> = {}): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 24px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhSignaturePadRoot, { style: { inlineSize: '300px' }, ...props }, () => [
      h(XhSignaturePadControl, null, () => [h(XhSignaturePadPath)]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  return host.querySelector<HTMLElement>(`[data-scope='signature-pad'][data-part='control']`)!
}

function resolve(value: string, property = 'background-color'): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  host!.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

describe('签名画布的字段外壳', () => {
  it('静息铺字段淡底 + 控件描边；悬停描边升 border-strong、底不变', async () => {
    const control = await mount()
    expect(getComputedStyle(control).backgroundColor).toBe(resolve('var(--xh-bg-field)'))
    expect(getComputedStyle(control).borderTopColor).toBe(resolve('var(--xh-border-control)', 'color'))
    await userEvent.hover(control)
    await expect.poll(() => getComputedStyle(control).borderTopColor).toBe(resolve('var(--xh-border-strong)', 'color'))
    expect(getComputedStyle(control).backgroundColor).toBe(resolve('var(--xh-bg-field)'))
  })

  it('落笔时换承载面 + 聚焦描边', async () => {
    const control = await mount()
    await pressPointer(control)
    await expect.poll(() => control.hasAttribute('data-drawing')).toBe(true)
    await expect.poll(() => getComputedStyle(control).backgroundColor).toBe(resolve('var(--xh-bg-surface)'))
    await expect.poll(() => getComputedStyle(control).borderTopColor).toBe(resolve('var(--xh-border-control-focus)', 'color'))
  })

  it('校验失败铺 4% 失效色淡底 + 失效描边', async () => {
    const control = await mount({ invalid: true })
    expect(getComputedStyle(control).backgroundColor).toBe(resolve('color-mix(in oklab, var(--xh-border-invalid) 4%, transparent)'))
    expect(getComputedStyle(control).borderTopColor).toBe(resolve('var(--xh-border-invalid)', 'color'))
  })
})
