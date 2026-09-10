// 多选把选中项摆成标签时，触发器是一行控件：标签越选越多，盒不许被撑高，也不许让标签冲出盒外。
// 摆不下的折成 +N 那一枚；行还是装不下时各枚标签缩短带省略号，+N 始终看得见。
// 标签与 +N 都是库里的 tag（data-scope="tag"）：样子归 tag.css，档位跟着控件的 size 走，
// tag.css 的覆盖槽写在 select 的根上照样生效。
//
// 只有真实浏览器量得出来：盒高、标签的右缘与盒的右缘都是布局结果，jsdom 不排版。
import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectList,
  XhSelectOverflowTag,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTag,
  XhSelectTagList,
  XhSelectTrigger,
  XhSelectValueText,
  XhTagRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function teardown() {
  app?.unmount()
  host?.remove()
  app = null
  host = null
}

afterEach(() => teardown())

interface Bag {
  tags: Array<{ value: string, label: string }>
}

const OPTIONS = Array.from({ length: 40 }, (_, i) => ({ value: `v${i + 1}`, label: `选项${i + 1}` }))
const LONG_OPTIONS = Array.from({ length: 6 }, (_, i) => ({ value: `l${i + 1}`, label: `很长很长的选项名称第${i + 1}个` }))

type SizeTier = Size

interface MountOptions {
  maxTagCount?: number
  options?: typeof OPTIONS
  size?: SizeTier
  variant?: ControlVariant
  tone?: Tone
  style?: string
}

/** 没给的入参不落到 props 上：根组件的这几个 prop 声明了 default，显式传 undefined 过不了类型。 */
function given(opts: MountOptions): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of ['maxTagCount', 'size', 'variant', 'tone'] as const) {
    if (opts[key] !== undefined)
      out[key] = opts[key]
  }
  return out
}

/** 在一条定宽的栏里挂一个多选：触发器里摆标签行，选中前 picked 项。 */
async function mountTags(picked: number, width: number, opts: MountOptions = {}): Promise<void> {
  const options = opts.options ?? OPTIONS
  host = document.createElement('div')
  host.style.cssText = `inline-size: ${width}px;${opts.style ?? ''}`
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhSelectRoot, {
      collection: options,
      multiple: true,
      placeholder: '请选择',
      defaultValue: options.slice(0, picked).map(o => o.value),
      ...given(opts),
    }, {
      default: (bag: Bag) => [
        h(XhSelectControl, null, () => [
          h(XhSelectTrigger, null, () => [
            h(XhSelectValueText),
            h(XhSelectTagList, null, () => [
              ...bag.tags.map(t => h(XhSelectTag, { key: t.value, value: t.value }, () => t.label)),
              h(XhSelectOverflowTag),
            ]),
            h(XhSelectIndicator),
          ]),
        ]),
        h(XhSelectPositioner, null, () => [
          h(XhSelectContent, null, () => h(XhSelectList, null, () => options.map(o =>
            h(XhSelectItem, { key: o.value, value: o.value }, () => [h(XhSelectItemText, () => o.label), h(XhSelectItemIndicator)]),
          ))),
        ]),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(name: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='select'][data-part='${name}']`)
  if (!el)
    throw new Error(`挂载树里没有 ${name}`)
  return el
}

const TAG_ROOT = `[data-scope='tag'][data-part='root']`

/** 触发器里的标签（不含 +N），文档序。 */
function tags(): HTMLElement[] {
  return Array.from(host?.querySelectorAll<HTMLElement>(`[data-scope='select'][data-part='tag-list'] > ${TAG_ROOT}:not([data-count])`) ?? [])
}

/** +N 那一枚：也是 tag 的 root，另带 data-count。 */
function overflowTag(): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`${TAG_ROOT}[data-count]`)
  if (!el)
    throw new Error('挂载树里没有 +N 那一枚')
  return el
}

/** 标签文字所在的 label：截断落在这一层。 */
function labelOf(tag: HTMLElement): HTMLElement {
  const el = tag.querySelector<HTMLElement>(`[data-scope='tag'][data-part='label']`)
  if (!el)
    throw new Error(`标签 ${tag.textContent} 里没有 label`)
  return el
}

/** 令牌当下解析成多少像素。 */
function tokenPx(name: string): number {
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;visibility:hidden;block-size:var(${name})`
  document.body.append(probe)
  const px = probe.getBoundingClientRect().height
  probe.remove()
  return Math.round(px)
}

const rect = (el: HTMLElement) => el.getBoundingClientRect()

describe('多选标签：盒高不随标签数变', () => {
  it('0、3、10、30 枚都是一行控件高', async () => {
    const h = tokenPx('--xh-control-h-md')
    for (const picked of [0, 3, 10, 30]) {
      await mountTags(picked, 320)
      expect(Math.round(rect(part('control')).height), `${picked} 枚`).toBe(h)
      teardown()
    }
  })
})

describe('多选标签：不给 maxTagCount 时最多摆 3 枚，其余折成 +N', () => {
  it('选中 10 项：标签行里 3 枚标签 + 一枚 +7', async () => {
    await mountTags(10, 320)
    expect(tags()).toHaveLength(3)
    const overflow = overflowTag()
    expect(overflow.hidden).toBe(false)
    expect(overflow.textContent).toBe('+7')
    expect(rect(overflow).width).toBeGreaterThan(0)
  })

  it('选中 3 项：一枚都不折，+N 收起不留空位', async () => {
    await mountTags(3, 320)
    expect(tags()).toHaveLength(3)
    const overflow = overflowTag()
    expect(overflow.hidden).toBe(true)
    expect(getComputedStyle(overflow).display).toBe('none')
  })

  /** 标签行、每枚标签与 +N 的右缘都不越过盒的右缘。 */
  function expectInsideControl(label: string): void {
    const control = rect(part('control'))
    expect(rect(part('tag-list')).right, `${label}：标签行`).toBeLessThanOrEqual(control.right)
    expect(rect(overflowTag()).right, `${label}：+N`).toBeLessThanOrEqual(control.right)
    for (const tag of tags())
      expect(rect(tag).right, `${label}：${tag.textContent}`).toBeLessThanOrEqual(control.right)
  }

  it('320px 栏里 10 枚、30 枚都不冲出盒：标签行与 +N 的右缘都在盒的右缘之内', async () => {
    for (const picked of [10, 30]) {
      await mountTags(picked, 320)
      expectInsideControl(`${picked} 枚`)
      teardown()
    }
  })

  it('三枚长标签在 192px 的最小盒里也不冲出盒', async () => {
    await mountTags(6, 192, { options: LONG_OPTIONS })
    expectInsideControl('长标签')
  })

  it('展开箭头留在盒里，不被标签挤出去', async () => {
    await mountTags(30, 320)
    const control = rect(part('control'))
    const indicator = rect(part('indicator'))
    expect(indicator.right).toBeLessThanOrEqual(control.right)
    expect(indicator.left).toBeGreaterThan(rect(part('tag-list')).right - 1)
  })
})

describe('多选标签：行装不下时标签各自缩短，+N 不缩', () => {
  it('192px 的最小盒里三枚长标签的 label 都带省略号，+N 完整可见', async () => {
    await mountTags(6, 192, { options: LONG_OPTIONS })
    const control = rect(part('control'))
    for (const tag of tags()) {
      const label = labelOf(tag)
      expect(getComputedStyle(label).textOverflow).toBe('ellipsis')
      expect(label.scrollWidth, tag.textContent ?? '').toBeGreaterThan(label.clientWidth)
      expect(rect(tag).width).toBeGreaterThan(0)
    }
    const overflow = overflowTag()
    const overflowLabel = labelOf(overflow)
    expect(overflowLabel.scrollWidth).toBeLessThanOrEqual(overflowLabel.clientWidth)
    expect(rect(overflow).right).toBeLessThanOrEqual(control.right)
    expect(overflow.textContent).toBe('+3')
  })

  it('装得下时标签一枚都不缩', async () => {
    await mountTags(3, 600)
    for (const tag of tags()) {
      const label = labelOf(tag)
      expect(label.scrollWidth, tag.textContent ?? '').toBeLessThanOrEqual(label.clientWidth)
    }
  })
})

describe('多选标签：标签行与占位文字不同屏', () => {
  it('无选中：标签行 hidden，value-text 显示占位文字', async () => {
    await mountTags(0, 320)
    expect(part('tag-list').hidden).toBe(true)
    expect(getComputedStyle(part('tag-list')).display).toBe('none')
    expect(getComputedStyle(part('value-text')).display).not.toBe('none')
    expect(part('value-text').textContent).toBe('请选择')
  })

  it('有选中：标签行露面，value-text 让位但仍在 DOM 里给可及名', async () => {
    await mountTags(2, 320)
    expect(part('tag-list').hidden).toBe(false)
    expect(getComputedStyle(part('value-text')).display).toBe('none')
    expect(part('value-text').textContent).toBe('选项1, 选项2')
    expect(part('trigger').getAttribute('aria-labelledby')).toContain(part('value-text').id)
  })
})

describe('多选标签：maxTagCount 显式给定', () => {
  it('给 5 就摆 5 枚，第 6 个起折', async () => {
    await mountTags(10, 600, { maxTagCount: 5 })
    expect(tags()).toHaveLength(5)
    expect(overflowTag().textContent).toBe('+5')
  })
})

/** 独立渲染一枚同档的 tag，量它的高：控件里的标签得与它逐像素一样高。 */
function referenceTagHeight(size: SizeTier | undefined): number {
  const probe = document.createElement('div')
  document.body.append(probe)
  const ref = createApp({ setup: () => () => h(XhTagRoot, { size }, () => '参照') })
  ref.mount(probe)
  const height = rect(probe.querySelector<HTMLElement>(TAG_ROOT)!).height
  ref.unmount()
  probe.remove()
  return height
}

describe('多选标签：档位跟着控件走', () => {
  // 缺省档不写 size：标签上也不该出现 data-size，两边都落在各自的缺省档
  it.each<[SizeTier | undefined, string]>([
    ['sm', '--xh-control-h-sm'],
    [undefined, '--xh-control-h-md'],
    ['md', '--xh-control-h-md'],
    ['lg', '--xh-control-h-lg'],
  ])('size=%s：每枚标签与 +N 是同档的 tag，与独立渲染的同档 tag 一样高，且不高过盒的内侧', async (size, controlToken) => {
    await mountTags(10, 600, { size })
    const control = part('control')
    expect(Math.round(rect(control).height)).toBe(tokenPx(controlToken))
    const inner = control.clientHeight
    const expected = referenceTagHeight(size)
    for (const tag of [...tags(), overflowTag()]) {
      expect(tag.getAttribute('data-size'), tag.textContent ?? '').toBe(size ?? null)
      expect(rect(tag).height, tag.textContent ?? '').toBeCloseTo(expected, 0)
      expect(rect(tag).height, tag.textContent ?? '').toBeLessThanOrEqual(inner)
    }
  })
})

describe('多选标签：tag.css 的覆盖槽在 select 里照样生效', () => {
  it('--xh-tag-bg / --xh-tag-fg 写在外层，每枚标签与 +N 的底色与字色跟着变', async () => {
    await mountTags(10, 600, { style: '--xh-tag-bg: rgb(1, 2, 3); --xh-tag-fg: rgb(4, 5, 6);' })
    for (const tag of [...tags(), overflowTag()]) {
      expect(getComputedStyle(tag).backgroundColor, tag.textContent ?? '').toBe('rgb(1, 2, 3)')
      expect(getComputedStyle(tag).color, tag.textContent ?? '').toBe('rgb(4, 5, 6)')
    }
  })
})

/** 一枚标签画出来的三样颜色：底、字、边。 */
interface Paint {
  bg: string
  fg: string
  border: string
}

function paintOf(el: HTMLElement): Paint {
  const cs = getComputedStyle(el)
  return { bg: cs.backgroundColor, fg: cs.color, border: cs.borderTopColor }
}

/** 独立渲染一枚 tag，读它画出来的颜色：控件里的标签得与它逐值一样。 */
function referenceTagPaint(variant: 'subtle' | 'outline', tone?: Tone): Paint {
  const probe = document.createElement('div')
  document.body.append(probe)
  const ref = createApp({ setup: () => () => h(XhTagRoot, tone ? { variant, tone } : { variant }, () => '参照') })
  ref.mount(probe)
  const paint = paintOf(probe.querySelector<HTMLElement>(TAG_ROOT)!)
  ref.unmount()
  probe.remove()
  return paint
}

describe('多选标签：形态按控件的面派，语气在标签上有落点', () => {
  // 控件缺省即 outline；outline / ghost 的面是画布色或透明，标签摆淡底档
  it.each<ControlVariant | undefined>([undefined, 'outline', 'ghost'])('variant=%s + tone=danger：每枚标签与 +N 画得与独立的 subtle+danger tag 一样，语气真的落了色', async (variant) => {
    await mountTags(10, 600, { variant, tone: 'danger' })
    const expected = referenceTagPaint('subtle', 'danger')
    const plain = referenceTagPaint('subtle')
    // 语气要看得出来：与没写语气的同档 tag 底色不同
    expect(expected.bg).not.toBe(plain.bg)
    for (const tag of [...tags(), overflowTag()]) {
      expect(tag.getAttribute('data-variant'), tag.textContent ?? '').toBe('subtle')
      expect(paintOf(tag), tag.textContent ?? '').toEqual(expected)
    }
  })

  it('不写 variant 与写 outline：盒画得一样，标签也画得一样', async () => {
    await mountTags(10, 600, { tone: 'danger' })
    const boxDefault = paintOf(part('control'))
    const tagDefault = paintOf(tags()[0]!)
    teardown()
    await mountTags(10, 600, { variant: 'outline', tone: 'danger' })
    expect(paintOf(part('control'))).toEqual(boxDefault)
    expect(paintOf(tags()[0]!)).toEqual(tagDefault)
  })

  it('subtle 控件的面已是淡底：标签摆描边档，画得与独立的 outline+danger tag 一样，且底不与盒同色', async () => {
    await mountTags(10, 600, { variant: 'subtle', tone: 'danger' })
    const expected = referenceTagPaint('outline', 'danger')
    const box = paintOf(part('control'))
    for (const tag of [...tags(), overflowTag()]) {
      expect(tag.getAttribute('data-variant'), tag.textContent ?? '').toBe('outline')
      expect(paintOf(tag), tag.textContent ?? '').toEqual(expected)
      // 描边档的边就是标签的轮廓，得画出来
      expect(paintOf(tag).border, tag.textContent ?? '').not.toBe('rgba(0, 0, 0, 0)')
    }
    // 标签的轮廓与盒的面不是同一个颜色，摆在盒里看得见
    expect(expected.border).not.toBe(box.bg)
  })
})
