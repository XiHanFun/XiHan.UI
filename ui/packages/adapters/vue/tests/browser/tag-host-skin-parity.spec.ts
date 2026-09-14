// 套了 tag 的三处宿主（tag-group / tags-input / select）里，标签画出来必须与独立渲染的同轴 tag 逐值相同：
// 三轴从宿主传下去只换 tag 的档，宿主自己的皮肤不再给标签任何一条会改变静息态的规则；
// 不写形态 / 尺寸与写缺省值画得一样；tag.css 的 --xh-tag-* 覆盖槽写在宿主根上对标签照样生效。
// 只有真实浏览器量得出来：算出来的颜色、内衬、圆角、字号与关闭钮的命中区都是级联与布局的结果。
import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { TagVariant } from '@xihan-ui/headless'
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
  XhSelectOverflowTag,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTag,
  XhSelectTagList,
  XhSelectTrigger,
  XhSelectValueText,
  XhTagCloseTrigger,
  XhTagGroupRoot,
  XhTagLabel,
  XhTagRoot,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function teardown(): void {
  app?.unmount()
  app = null
  host?.remove()
  host = null
}

afterEach(teardown)

async function mount(render: () => VNode, style = ''): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = `inline-size: 480px; ${style}`
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

/** 一枚标签画出来的样子：静息态的颜色、盒、字与关闭钮命中区。宽高随文字变，不采。 */
const PAINT_PROPS = [
  'background-color',
  'color',
  'border-top-color',
  'border-top-width',
  'border-top-left-radius',
  'padding-top',
  'padding-left',
  'font-size',
  'font-weight',
  'line-height',
  'column-gap',
  'box-shadow',
] as const

interface Look extends Record<string, string> {}

const TAG = (name: string): string => `[data-scope='tag'][data-part='${name}']`

function lookOf(root: HTMLElement): Look {
  const cs = getComputedStyle(root)
  const out: Look = {}
  for (const prop of PAINT_PROPS)
    out[prop] = cs.getPropertyValue(prop)
  out.height = String(root.getBoundingClientRect().height)
  const close = root.querySelector<HTMLElement>(TAG('close-trigger'))
  out.closeHeight = close ? String(close.getBoundingClientRect().height) : ''
  return out
}

interface TagProps {
  variant?: TagVariant
  tone?: Tone
  size?: Size
}

/** 独立渲染一枚带关闭钮的 tag，读它画出来的样子：宿主里的标签得与它逐值一样。 */
async function loneTag(props: TagProps): Promise<Look> {
  const probe = document.createElement('div')
  document.body.append(probe)
  const ref = createApp({
    setup: () => () => h(XhTagRoot, { closable: true, ...props }, () => [h(XhTagLabel, null, () => 'Vue'), h(XhTagCloseTrigger)]),
  })
  ref.mount(probe)
  await nextTick()
  const look = lookOf(probe.querySelector<HTMLElement>(TAG('root'))!)
  ref.unmount()
  probe.remove()
  return look
}

/** 没给的入参不落到 props 上：显式传 undefined 会盖掉组件自己的缺省判定。 */
function given<T extends object>(opts: T): Partial<T> {
  const out: Partial<T> = {}
  for (const key of Object.keys(opts) as (keyof T)[]) {
    if (opts[key] !== undefined)
      out[key] = opts[key]
  }
  return out
}

/** 七个 --xh-tag-* 覆盖槽一起写在宿主根的外层，逐个量它们是不是真落到了标签上。 */
const SLOT_STYLE = [
  '--xh-tag-bg: rgb(1, 2, 3)',
  '--xh-tag-fg: rgb(4, 5, 6)',
  '--xh-tag-px: 17px',
  '--xh-tag-radius: 3px',
  '--xh-tag-gap: 9px',
  '--xh-tag-font-size: 19px',
  '--xh-tag-close-size: 30px',
].join(';')

function expectSlotsApplied(root: HTMLElement, withClose: boolean): void {
  const cs = getComputedStyle(root)
  expect(cs.backgroundColor).toBe('rgb(1, 2, 3)')
  expect(cs.color).toBe('rgb(4, 5, 6)')
  expect(cs.paddingLeft).toBe('17px')
  expect(cs.borderTopLeftRadius).toBe('3px')
  expect(cs.columnGap).toBe('9px')
  expect(cs.fontSize).toBe('19px')
  if (withClose) {
    const rect = root.querySelector<HTMLElement>(TAG('close-trigger'))!.getBoundingClientRect()
    expect([rect.width, rect.height]).toEqual([30, 30])
  }
}

// —— tag 自己 ——

describe('独立的 tag', () => {
  it('不写 variant 与 size：与写 subtle 与 md 画得逐值一样', async () => {
    const plain = await loneTag({})
    expect(await loneTag({ variant: 'subtle', size: 'md' })).toEqual(plain)
  })
})

// —— tag-group ——

interface GroupProps extends TagProps {}

const GROUP_ITEMS = [{ value: 'vue', label: 'Vue' }, { value: 'react', label: 'React' }]

async function mountGroup(props: GroupProps = {}, style = ''): Promise<void> {
  await mount(() => h(XhTagGroupRoot, { collection: GROUP_ITEMS, deletable: true, ...given(props) }), style)
}

function groupTags(): HTMLElement[] {
  return Array.from(host!.querySelectorAll<HTMLElement>(`[data-scope='tag-group'][data-part='list'] > ${TAG('root')}`))
}

describe('tag-group 里的标签就是独立的 tag', () => {
  it('不写 variant 与 size：与写 subtle 与 md 画得逐值一样', async () => {
    await mountGroup()
    const plain = groupTags().map(lookOf)
    teardown()
    await mountGroup({ variant: 'subtle', size: 'md' })
    expect(groupTags().map(lookOf)).toEqual(plain)
  })

  it.each<GroupProps>([
    {},
    { variant: 'outline' },
    { variant: 'solid' },
    { variant: 'subtle', tone: 'danger' },
    { variant: 'outline', tone: 'danger' },
    { variant: 'solid', tone: 'success' },
    { size: 'sm' },
    { size: 'lg', tone: 'info', variant: 'subtle' },
  ])('组上写 %o：每一枚与独立渲染的同轴 tag 逐值一样', async (props) => {
    await mountGroup(props)
    const expected = await loneTag(props)
    for (const tag of groupTags())
      expect(lookOf(tag), tag.textContent ?? '').toEqual(expected)
  })

  it('语气真的落了色：写了语气的淡底标签与没写语气的底色不同', async () => {
    await mountGroup({ variant: 'subtle' })
    const plain = lookOf(groupTags()[0]!)['background-color']
    teardown()
    await mountGroup({ variant: 'subtle', tone: 'danger' })
    expect(lookOf(groupTags()[0]!)['background-color']).not.toBe(plain)
  })

  it('--xh-tag-* 覆盖槽写在组的外层，每一枚标签与摘除钮跟着变；格子的间距照抄标签的', async () => {
    await mountGroup({}, SLOT_STYLE)
    for (const tag of groupTags())
      expectSlotsApplied(tag, true)
    const cell = host!.querySelector<HTMLElement>(`[data-scope='tag-group'][data-part='cell']`)!
    expect(getComputedStyle(cell).columnGap).toBe('9px')
  })
})

// —— tags-input ——

interface TagsInputProps {
  variant?: ControlVariant
  tone?: Tone
  size?: Size
}

async function mountTagsInput(props: TagsInputProps = {}, style = ''): Promise<void> {
  await mount(() => h(XhTagsInputRoot, { defaultValue: ['Vue', 'React'], ...given(props) }, {
    default: (bag: { value: string[] }) => h(XhTagsInputControl, null, () => [
      ...bag.value.map(t => h(XhTagsInputItem, { key: t, value: t }, () => [
        h(XhTagsInputItemPreview, null, () => [h(XhTagsInputItemText, null, () => t), h(XhTagsInputItemDeleteTrigger)]),
      ])),
      h(XhTagsInputInput),
    ]),
  }), style)
}

function tagsInputTags(): HTMLElement[] {
  return Array.from(host!.querySelectorAll<HTMLElement>(`[data-scope='tags-input'][data-part='item'] > ${TAG('root')}`))
}

describe('tags-input 里的标签就是独立的 tag', () => {
  it('不写 variant 与 size：与写 outline 与 md 画得逐值一样，ghost 也一样', async () => {
    await mountTagsInput()
    const plain = tagsInputTags().map(lookOf)
    teardown()
    await mountTagsInput({ variant: 'outline', size: 'md' })
    expect(tagsInputTags().map(lookOf)).toEqual(plain)
    teardown()
    await mountTagsInput({ variant: 'ghost' })
    expect(tagsInputTags().map(lookOf)).toEqual(plain)
  })

  // 形态按控件的面派：subtle 控件里是描边标签，其余含缺省是淡底标签；语气与尺寸原样传下去
  it.each<[TagsInputProps, TagProps]>([
    [{}, { variant: 'subtle' }],
    [{ tone: 'danger' }, { variant: 'subtle', tone: 'danger' }],
    [{ variant: 'subtle' }, { variant: 'outline' }],
    [{ variant: 'subtle', tone: 'danger' }, { variant: 'outline', tone: 'danger' }],
    [{ size: 'sm', tone: 'info' }, { variant: 'subtle', size: 'sm', tone: 'info' }],
    [{ size: 'lg' }, { variant: 'subtle', size: 'lg' }],
  ])('控件写 %o：每一枚与独立渲染的 tag %o 逐值一样', async (props, tagProps) => {
    await mountTagsInput(props)
    const expected = await loneTag(tagProps)
    for (const tag of tagsInputTags())
      expect(lookOf(tag), tag.textContent ?? '').toEqual(expected)
  })

  it('语气真的落了色：写了语气的控件里标签底色与没写语气的不同', async () => {
    await mountTagsInput()
    const plain = lookOf(tagsInputTags()[0]!)['background-color']
    teardown()
    await mountTagsInput({ tone: 'danger' })
    expect(lookOf(tagsInputTags()[0]!)['background-color']).not.toBe(plain)
  })

  it('--xh-tag-* 覆盖槽写在 tags-input 根的外层，每一枚标签与删除钮跟着变', async () => {
    await mountTagsInput({}, SLOT_STYLE)
    for (const tag of tagsInputTags())
      expectSlotsApplied(tag, true)
  })
})

// —— select ——

const OPTIONS = Array.from({ length: 6 }, (_, i) => ({ value: `v${i + 1}`, label: `选项${i + 1}` }))

async function mountSelect(style = ''): Promise<void> {
  await mount(() => h(XhSelectRoot, {
    collection: OPTIONS,
    multiple: true,
    placeholder: '请选择',
    defaultValue: OPTIONS.slice(0, 5).map(o => o.value),
  }, {
    default: (bag: { tags: Array<{ value: string, label: string }> }) => [
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
        h(XhSelectContent, null, () => h(XhSelectList, null, () => OPTIONS.map(o =>
          h(XhSelectItem, { key: o.value, value: o.value }, () => [h(XhSelectItemText, () => o.label)]),
        ))),
      ]),
    ],
  }), style)
}

function selectTags(): HTMLElement[] {
  return Array.from(host!.querySelectorAll<HTMLElement>(`[data-scope='select'][data-part='tag-list'] > ${TAG('root')}`))
}

describe('select 触发器里的标签就是独立的 tag', () => {
  it('--xh-tag-* 覆盖槽写在 select 根的外层，每一枚标签与 +N 的内衬、圆角、间距与字号跟着变', async () => {
    await mountSelect(SLOT_STYLE)
    const tags = selectTags()
    expect(tags.length).toBeGreaterThan(1)
    for (const tag of tags)
      expectSlotsApplied(tag, false)
  })
})
