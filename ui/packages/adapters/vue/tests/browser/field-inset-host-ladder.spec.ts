// 字段内动作钮（field-inset ghost）的悬停 / 按下面按盒当前铺的底取阶梯：描边档的盒缺省是白底（--xh-bg-field
// 与承载面同色），钮走白底阶梯 100 → 200；淡底档的盒没聚焦时铺着淡底，钮走淡底承载阶梯 200 → 300；任何档聚焦后
// 都是白色承载面。ghost 形态的字段静息透明，仍按白底阶梯。判据是悬停后的计算底色，jsdom 不算级联。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTextFieldClearTrigger, XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from '../../src'
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

async function mount(props: Record<string, unknown> = {}): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 24px'
  document.body.append(host)
  const render = (): VNode => h(XhTextFieldRoot, { defaultValue: 'XiHan', clearable: true, ...props }, () => [
    h(XhTextFieldControl, null, () => [
      h(XhTextFieldInput, { 'aria-label': '名称' }),
      h(XhTextFieldClearTrigger),
    ]),
  ])
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function resolve(value: string): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = value
  host!.append(probe)
  const out = getComputedStyle(probe).backgroundColor
  probe.remove()
  return out
}

function clear(): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='text-field'][data-part='clear-trigger']`)!
}

describe('字段内动作钮的承载面阶梯', () => {
  it('描边档字段没聚焦：盒是白底，悬停取 --xh-bg-subtle、按下取 --xh-bg-subtle-hover', async () => {
    await mount()
    await userEvent.hover(clear())
    await expect.poll(() => getComputedStyle(clear()).backgroundColor).toBe(resolve('var(--xh-bg-subtle)'))
    await pressPointer(clear())
    await expect.poll(() => getComputedStyle(clear()).backgroundColor).toBe(resolve('var(--xh-bg-subtle-hover)'))
  })

  it('淡底档字段没聚焦：盒铺淡底，悬停取 --xh-bg-subtle-hover、按下取 --xh-bg-subtle-active', async () => {
    await mount({ variant: 'subtle' })
    await userEvent.hover(clear())
    await expect.poll(() => getComputedStyle(clear()).backgroundColor).toBe(resolve('var(--xh-bg-subtle-hover)'))
    await pressPointer(clear())
    await expect.poll(() => getComputedStyle(clear()).backgroundColor).toBe(resolve('var(--xh-bg-subtle-active)'))
  })

  it('淡底档字段聚焦后：盒是白色承载面，悬停回到 --xh-bg-subtle', async () => {
    await mount({ variant: 'subtle' })
    host!.querySelector<HTMLInputElement>('input')!.focus()
    await userEvent.hover(clear())
    await expect.poll(() => getComputedStyle(clear()).backgroundColor).toBe(resolve('var(--xh-bg-subtle)'))
  })

  it('ghost 形态的字段静息透明：悬停仍按白底阶梯取 --xh-bg-subtle', async () => {
    await mount({ variant: 'ghost' })
    await userEvent.hover(clear())
    await expect.poll(() => getComputedStyle(clear()).backgroundColor).toBe(resolve('var(--xh-bg-subtle)'))
  })
})
