// 标签输入的控件是一行控件高的框：一枚标签装进去框不长高，标签多了按行长高，行数由宽度定。
// 框里的每一枚标签都是库里的 tag（data-scope="tag"）：样子归 tag.css，档位跟着控件的 size 走，
// 三档 22 / 26 / 30 装进控件的 28 / 32 / 40 里；删除钮就是 tag 的 close-trigger；
// 光标走到标签上的反白画在 tag 的 root 上；就地编辑框与它换掉的标签一样高。
// 只有真实浏览器量得出来：框高、标签的顶边、算出来的颜色都是布局与级联的结果，jsdom 不排版。
import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { App, VNode } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTagCloseTrigger,
  XhTagLabel,
  XhTagRoot,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemInput,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const SIZES: Size[] = ['sm', 'md', 'lg']

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

interface MountOptions {
  size?: Size
  variant?: ControlVariant
  tone?: Tone
  disabled?: boolean
  readOnly?: boolean
  editable?: boolean
  tags?: string[]
  /** 栏宽；换行的行数只由它与标签数决定 */
  width?: number
}

/** 没给的入参不落到 props 上：根组件的布尔 prop 显式传 undefined 会被当成 false。 */
function given(opts: MountOptions): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of ['size', 'variant', 'tone', 'disabled', 'readOnly', 'editable'] as const) {
    if (opts[key] !== undefined)
      out[key] = opts[key]
  }
  return out
}

async function mount(render: () => VNode, width = 320): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = `inline-size: ${width}px`
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

/** 在一条定宽的栏里挂一个标签输入，标签由值渲染出来；编辑框常挂。 */
async function mountTags(opts: MountOptions = {}): Promise<void> {
  const tags = opts.tags ?? ['标签']
  await mount(() => h(XhTagsInputRoot, { defaultValue: tags, ...given(opts) }, {
    default: (bag: { value: string[] }) => h(XhTagsInputControl, null, () => [
      ...bag.value.map(t => h(XhTagsInputItem, { key: t, value: t }, () => [
        h(XhTagsInputItemPreview, null, () => [
          h(XhTagsInputItemText, null, () => t),
          h(XhTagsInputItemDeleteTrigger),
        ]),
        h(XhTagsInputItemInput),
      ])),
      h(XhTagsInputInput),
    ]),
  }), opts.width)
}

/** 一枚独立的 tag，与框里的那枚对数。 */
async function mountLoneTag(size: Size | undefined): Promise<void> {
  await mount(() => h(XhTagRoot, { size, variant: 'subtle', closable: true }, () => [
    h(XhTagLabel, null, () => '标签'),
    h(XhTagCloseTrigger),
  ]))
}

function part(name: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='tags-input'][data-part='${name}']`)
  if (!el)
    throw new Error(`挂载树里没有 tags-input 的 ${name}`)
  return el
}

const ITEM = `[data-scope='tags-input'][data-part='item']`
const TAG = (name: string): string => `[data-scope='tag'][data-part='${name}']`

/** 条目里的标签（tag 的 root），文档序。 */
function pills(): HTMLElement[] {
  return Array.from(host?.querySelectorAll<HTMLElement>(`${ITEM} > ${TAG('root')}`) ?? [])
}

function tagPart(name: string, index = 0): HTMLElement {
  const el = host?.querySelectorAll<HTMLElement>(`${ITEM} ${TAG(name)}`)[index]
  if (!el)
    throw new Error(`挂载树里没有第 ${index} 枚标签的 ${name}`)
  return el
}

/** 令牌当下解析成多少像素。密度换档时这个数跟着变，用例不写死。 */
function tokenPx(name: string): number {
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;visibility:hidden;block-size:var(${name})`
  document.body.append(probe)
  const px = probe.getBoundingClientRect().height
  probe.remove()
  return px
}

/** 一个 CSS 颜色值在这个页面里解析成什么，用它与 getComputedStyle 的输出对拍。 */
function resolveColor(value: string, within: HTMLElement = document.body): string {
  const probe = document.createElement('span')
  probe.style.color = value
  within.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function height(el: HTMLElement): number {
  return el.getBoundingClientRect().height
}

/** 按竖向中线把行里的东西分成几行（行内居中对齐，同一行的中线相同），每行取最高的那个：行高由它定。 */
function rowHeights(els: HTMLElement[]): number[] {
  const rows = new Map<number, number>()
  for (const el of els) {
    const rect = el.getBoundingClientRect()
    const middle = Math.round(rect.top + rect.height / 2)
    rows.set(middle, Math.max(rows.get(middle) ?? 0, rect.height))
  }
  return [...rows.values()]
}

/** 焦点在输入框上，退格一下：光标走到最后一枚标签上。 */
async function highlightLast(): Promise<void> {
  const input = part('input') as HTMLInputElement
  input.focus()
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }))
  await nextTick()
  await nextTick()
}

describe('标签输入的框：一行控件高，标签多了按行长', () => {
  it.each(SIZES)('%s 档：装一枚标签时框仍是本档的控件高', async (size) => {
    await mountTags({ size })

    expect(height(part('control'))).toBe(tokenPx(`--xh-control-h-${size}`))
  })

  it('不写档位就是 md 档', async () => {
    await mountTags()

    expect(height(part('control'))).toBe(tokenPx('--xh-control-h-md'))
  })

  it.each(SIZES)('%s 档：标签换行时按行长高，行距取控件档的间距，每行的高由行里最高的那个定', async (size) => {
    await mountTags({ size, tags: Array.from({ length: 8 }, (_, i) => `标签${i + 1}`) })
    const control = part('control')
    const style = getComputedStyle(control)
    const rows = rowHeights([...pills(), part('input')])
    const rowGap = Number.parseFloat(style.rowGap)
    const chrome = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
      + Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth)

    expect(rows.length).toBeGreaterThan(1)
    expect(rowGap).toBe(tokenPx(`--xh-control-gap-${size}`))
    expect(height(control)).toBe(rows.reduce((sum, row) => sum + row, 0) + (rows.length - 1) * rowGap + chrome)
  })

  it('长标签在框里截断，不把框撑破：标签不宽过框的内容区，省略号落在 tag 的 label 上', async () => {
    await mountTags({ tags: ['一个特别特别特别特别特别特别特别特别特别特别特别特别特别特别长的标签'] })
    const control = part('control')
    const pill = pills()[0]!
    const label = tagPart('label')
    const inner = control.clientWidth
      - Number.parseFloat(getComputedStyle(control).paddingLeft)
      - Number.parseFloat(getComputedStyle(control).paddingRight)

    expect(pill.getBoundingClientRect().width).toBeLessThanOrEqual(inner)
    expect(label.scrollWidth).toBeGreaterThan(label.clientWidth)
    expect(getComputedStyle(label).textOverflow).toBe('ellipsis')
  })
})

describe('框里的标签就是库里的 tag', () => {
  it.each(SIZES)('%s 档：标签的高、字号与独立的同档 tag 逐字相同，删除钮同尺寸', async (size) => {
    await mountTags({ size })
    const hosted = {
      height: height(pills()[0]!),
      fontSize: getComputedStyle(pills()[0]!).fontSize,
      close: tagPart('close-trigger').getBoundingClientRect().height,
    }
    app?.unmount()
    host?.remove()
    await mountLoneTag(size)
    const root = host!.querySelector<HTMLElement>(TAG('root'))!
    const lone = {
      height: height(root),
      fontSize: getComputedStyle(root).fontSize,
      close: host!.querySelector<HTMLElement>(TAG('close-trigger'))!.getBoundingClientRect().height,
    }

    expect(hosted).toEqual(lone)
    expect(hosted.close).toBe(tokenPx('--xh-control-indicator-size'))
  })

  it('三档标签的高是 22 / 26 / 30，比同档控件矮一截，装进去框不长高', async () => {
    const heights: number[] = []
    for (const size of SIZES) {
      await mountTags({ size })
      heights.push(height(pills()[0]!))
      expect(height(pills()[0]!)).toBeLessThan(tokenPx(`--xh-control-h-${size}`))
      app?.unmount()
      host?.remove()
    }

    expect(heights).toEqual([22, 26, 30])
  })

  it('形态按控件的面派：缺省与 outline / ghost 控件里是淡底标签，subtle 控件里是描边标签', async () => {
    await mountTags({ tags: ['甲'] })
    const plain = getComputedStyle(pills()[0]!)
    expect(pills()[0]!.getAttribute('data-variant')).toBe('subtle')
    expect(plain.backgroundColor).toBe(resolveColor('var(--xh-bg-subtle)'))
    expect(plain.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    app?.unmount()
    host?.remove()

    await mountTags({ tags: ['甲'], variant: 'subtle' })
    const outlined = getComputedStyle(pills()[0]!)
    expect(pills()[0]!.getAttribute('data-variant')).toBe('outline')
    expect(outlined.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(outlined.borderTopColor).toBe(resolveColor('var(--xh-border-default)'))
  })

  it('删除钮是 tag 的 close-trigger：不占 Tab 位，按它删掉这一枚，焦点留在输入框', async () => {
    await mountTags({ tags: ['甲', '乙'] })
    const close = tagPart('close-trigger', 1)
    expect(close.getAttribute('tabindex')).toBe('-1')
    expect(close.getAttribute('aria-label')).toBe('Delete 乙')

    part('input').focus()
    await userEvent.click(close)
    await nextTick()
    await nextTick()

    expect(pills().map(el => el.textContent)).toEqual(['甲'])
    expect(document.activeElement).toBe(part('input'))
  })

  it('tags-input 根上的 --xh-tag-close-size 覆盖槽对框里每枚标签的删除钮生效', async () => {
    await mountTags({ tags: ['甲', '乙'] })
    part('root').style.setProperty('--xh-tag-close-size', '30px')

    for (const i of [0, 1]) {
      const rect = tagPart('close-trigger', i).getBoundingClientRect()
      expect([rect.width, rect.height]).toEqual([30, 30])
    }
  })
})

describe('光标走到标签上：反白落在 tag 的 root 上', () => {
  it('反白的底是语气强调色、字是配对的前景色，删除钮的字跟着换；没走到的那枚不变', async () => {
    await mountTags({ tags: ['甲', '乙'] })
    const before = getComputedStyle(pills()[1]!).backgroundColor
    await highlightLast()

    const items = Array.from(host!.querySelectorAll<HTMLElement>(ITEM))
    expect(items.map(el => el.hasAttribute('data-highlighted'))).toEqual([false, true])
    // 状态标记只落在本组件的 item 上，tag 的 root 不带
    expect(pills()[1]!.hasAttribute('data-highlighted')).toBe(false)

    const lit = getComputedStyle(pills()[1]!)
    expect(lit.backgroundColor).toBe(resolveColor('var(--xh-bg-brand)'))
    expect(lit.color).toBe(resolveColor('var(--xh-fg-on-brand)'))
    expect(lit.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(tagPart('close-trigger', 1)).color).toBe(resolveColor('var(--xh-fg-on-brand)'))
    expect(getComputedStyle(pills()[0]!).backgroundColor).toBe(before)
  })

  it('写了语气时反白取那族的实心底与配对前景', async () => {
    await mountTags({ tags: ['甲'], tone: 'danger' })
    await highlightLast()
    const root = part('root')

    const lit = getComputedStyle(pills()[0]!)
    expect(lit.backgroundColor).toBe(resolveColor('var(--xh-_tone)', root))
    expect(lit.color).toBe(resolveColor('var(--xh-_tone-on)', root))
  })

  it('反白不改标签的高：底换了，框仍是一行控件高', async () => {
    await mountTags({ tags: ['甲'] })
    const before = height(pills()[0]!)
    await highlightLast()

    expect(height(pills()[0]!)).toBe(before)
    expect(height(part('control'))).toBe(tokenPx('--xh-control-h-md'))
  })
})

describe('禁用与只读', () => {
  it('禁用：整枚标签置灰、删除钮留位且原生 disabled', async () => {
    await mountTags({ tags: ['甲'], disabled: true })
    const pill = pills()[0]!
    const close = tagPart('close-trigger') as HTMLButtonElement

    expect(pill.getAttribute('data-disabled')).toBe('')
    expect(getComputedStyle(pill).backgroundColor).toBe(resolveColor('var(--xh-bg-muted)'))
    expect(getComputedStyle(pill).color).toBe(resolveColor('var(--xh-fg-disabled)'))
    expect(close.disabled).toBe(true)
    expect(getComputedStyle(close).display).not.toBe('none')
  })

  it('只读：标签不置灰、宽高与常态逐字相同，删除钮留位、原生 disabled 且字色置灰', async () => {
    await mountTags({ tags: ['甲'] })
    const plain = {
      rect: pills()[0]!.getBoundingClientRect().toJSON() as Record<string, number>,
      bg: getComputedStyle(pills()[0]!).backgroundColor,
      fg: getComputedStyle(pills()[0]!).color,
    }
    app?.unmount()
    host?.remove()

    await mountTags({ tags: ['甲'], readOnly: true })
    const pill = pills()[0]!
    const close = tagPart('close-trigger') as HTMLButtonElement

    expect(pill.hasAttribute('data-disabled')).toBe(false)
    expect([pill.getBoundingClientRect().width, pill.getBoundingClientRect().height]).toEqual([plain.rect.width, plain.rect.height])
    expect(getComputedStyle(pill).backgroundColor).toBe(plain.bg)
    expect(getComputedStyle(pill).color).toBe(plain.fg)
    expect(close.disabled).toBe(true)
    expect(getComputedStyle(close).display).not.toBe('none')
    expect(getComputedStyle(close).color).toBe(resolveColor('var(--xh-fg-disabled)'))
  })
})

describe('就地编辑：编辑框与它换掉的标签一样高', () => {
  it.each(SIZES)('%s 档：双击进编辑态，tag 的 root 收起、编辑框露出，编辑框与标签同高，框的高度不跳', async (size) => {
    await mountTags({ size, tags: ['甲'], editable: true, width: 480 })
    const pill = pills()[0]!
    const pillHeight = height(pill)
    const controlHeight = height(part('control'))
    // 双击是进编辑，不是选字
    expect(getComputedStyle(pill).userSelect).toBe('none')

    pill.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
    await nextTick()
    await nextTick()

    const edit = part('item-input')
    expect(getComputedStyle(pill).display).toBe('none')
    expect(pill.getAttribute('data-state')).toBe('closed')
    expect(edit.hidden).toBe(false)
    expect(height(edit)).toBe(pillHeight)
    expect(height(part('control'))).toBe(controlHeight)
  })
})
