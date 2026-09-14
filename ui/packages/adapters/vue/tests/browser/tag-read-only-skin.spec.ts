// 标签的只读与禁用在皮肤上是两副样子：只读只锁那颗叉，标签本身照常；禁用连整枚一起置灰。
// 两档都要叉留在原位，标签的宽度不因此跳变。jsdom 不排版也不算级联，只能在浏览器里量。
import type { App, VNode } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from '../../src'
// 皮肤与令牌要一起加载：这里查的就是皮肤按状态算出来的值
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Variant = 'solid' | 'subtle' | 'outline'

const VARIANTS: Variant[] = ['solid', 'subtle', 'outline']

interface Mode {
  disabled?: boolean
  readOnly?: boolean
}

let app: App | null = null
let host: HTMLElement | null = null

/** 指针停回角落那块 fixture，免得它留在上一条用例的节点上。 */
async function park(): Promise<void> {
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
}

afterEach(async () => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  await park()
})

async function mount(render: () => VNode): Promise<void> {
  app?.unmount()
  host?.remove()
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

/** 一枚带关闭钮的标签，按 variant 与状态挂出来。 */
function tag(variant: Variant, mode: Mode): VNode {
  return h(XhTagRoot, { variant, tone: 'brand', closable: true, ...mode }, () => [
    h(XhTagLabel, null, () => '标签'),
    h(XhTagCloseTrigger),
  ])
}

function part(name: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='tag'][data-part='${name}']`)
  if (!el)
    throw new Error(`挂载树里没有 tag 的 ${name}`)
  return el
}

/** 一个 CSS 颜色值在这个页面里解析成什么，用它与 getComputedStyle 的输出对拍。 */
function resolveColor(value: string): string {
  const probe = document.createElement('span')
  probe.style.color = value
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

interface Look {
  rootWidth: number
  rootHeight: number
  rootBg: string
  rootFg: string
  rootDisabled: boolean
  closeDisabled: boolean
  closeDisplay: string
  closeFg: string
  closeCursor: string
}

async function look(variant: Variant, mode: Mode): Promise<Look> {
  await mount(() => tag(variant, mode))
  const root = part('root')
  const close = part('close-trigger') as HTMLButtonElement
  const rootStyle = getComputedStyle(root)
  const closeStyle = getComputedStyle(close)
  const rect = root.getBoundingClientRect()
  return {
    rootWidth: rect.width,
    rootHeight: rect.height,
    rootBg: rootStyle.backgroundColor,
    rootFg: rootStyle.color,
    rootDisabled: root.hasAttribute('data-disabled'),
    closeDisabled: close.disabled,
    closeDisplay: closeStyle.display,
    closeFg: closeStyle.color,
    closeCursor: closeStyle.cursor,
  }
}

describe('标签的只读与禁用', () => {
  it.each(VARIANTS)('%s 档：禁用把整枚置灰，叉留在原位，宽度不跳变', async (variant) => {
    const plain = await look(variant, {})
    const disabled = await look(variant, { disabled: true })

    expect(disabled.rootDisabled).toBe(true)
    expect(disabled.closeDisabled).toBe(true)
    expect(disabled.closeDisplay).not.toBe('none')
    expect(disabled.rootWidth).toBe(plain.rootWidth)
    expect(disabled.rootHeight).toBe(plain.rootHeight)
    // 整枚退成置灰色：底与字都不再是常态那一副
    expect(disabled.rootBg).toBe(resolveColor('var(--xh-bg-muted)'))
    expect(disabled.rootFg).toBe(resolveColor('var(--xh-fg-disabled)'))
    expect(disabled.rootBg).not.toBe(plain.rootBg)
  })

  it.each(VARIANTS)('%s 档：只读只锁那颗叉，标签本身与常态同一副样子，宽度不跳变', async (variant) => {
    const plain = await look(variant, {})
    const readOnly = await look(variant, { readOnly: true })

    expect(readOnly.rootDisabled).toBe(false)
    expect(readOnly.closeDisabled).toBe(true)
    expect(readOnly.closeDisplay).not.toBe('none')
    expect(readOnly.rootWidth).toBe(plain.rootWidth)
    expect(readOnly.rootHeight).toBe(plain.rootHeight)
    // 标签本体不置灰：底与字与常态逐字相同
    expect(readOnly.rootBg).toBe(plain.rootBg)
    expect(readOnly.rootFg).toBe(plain.rootFg)
    // 叉是按不动的：字色退成置灰色，光标是「不可用」
    expect(readOnly.closeFg).toBe(resolveColor('var(--xh-fg-disabled)'))
    expect(readOnly.closeFg).not.toBe(plain.closeFg)
    expect(readOnly.closeCursor).toBe('not-allowed')
    expect(plain.closeCursor).toBe('pointer')
  })

  it('只读与禁用同时在：按禁用那一副画，整枚置灰', async () => {
    const both = await look('subtle', { readOnly: true, disabled: true })
    expect(both.rootDisabled).toBe(true)
    expect(both.closeDisabled).toBe(true)
    expect(both.rootBg).toBe(resolveColor('var(--xh-bg-muted)'))
  })

  it('只读的叉悬停不换底：常态的叉悬停会兑出一层底色，只读的叉压上去仍是透空的', async () => {
    await mount(() => tag('subtle', {}))
    await park()
    const rest = getComputedStyle(part('close-trigger')).backgroundColor
    await userEvent.hover(part('close-trigger'))
    expect(getComputedStyle(part('close-trigger')).backgroundColor).not.toBe(rest)

    await mount(() => tag('subtle', { readOnly: true }))
    await park()
    const restReadOnly = getComputedStyle(part('close-trigger')).backgroundColor
    expect(restReadOnly).toBe(rest)
    await userEvent.hover(part('close-trigger'))
    expect(getComputedStyle(part('close-trigger')).backgroundColor).toBe(restReadOnly)
  })
})
