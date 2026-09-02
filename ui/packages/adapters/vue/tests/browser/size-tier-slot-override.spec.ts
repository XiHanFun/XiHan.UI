// 尺寸档与使用者槽的先后：档位声明不许挡在使用者槽前面。
// 组件把档值直接写进公开槽、或直接写成终值时，作者在祖先上设的覆盖会被 root 自己那条声明打败，
// 改了没反应也不报错。每条都量两侧——该跟着覆盖走的走了，同组件里不相干的那一项没被牵连。
// 只有真实浏览器算得出来：jsdom 不解析样式表里的 var() 与继承，getComputedStyle 恒是空串。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhAvatarGroupRoot,
  XhAvatarRoot,
  XhIcon,
  XhMarkdownStreamContent,
  XhMarkdownStreamRoot,
  XhToolCallName,
  XhToolCallRoot,
  XhToolCallTrigger,
} from '../../src'
// 皮肤与令牌要一起加载：这里查的就是皮肤按槽算出来的值
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => teardown())

/** 挂一棵树。宿主上的属性是使用者那一侧的写法：覆盖槽写在 style 上。 */
async function mount(render: () => VNode, attrs: Record<string, string> = {}): Promise<void> {
  host = document.createElement('div')
  for (const [name, value] of Object.entries(attrs))
    host.setAttribute(name, value)
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function teardown(): void {
  app?.unmount()
  app = null
  host?.remove()
  host = null
}

/** 取第 index 个同名部件的计算值。 */
function styleOf(scope: string, part: string, prop: string, index = 0): string {
  const list = host?.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='${part}']`)
  const el = list?.[index]
  if (!el)
    throw new Error(`挂载树里没有第 ${index} 个 ${scope} 的 ${part}`)
  return getComputedStyle(el).getPropertyValue(prop)
}

// —— 一、markdown-stream 的字号与块间距各自能调 —— //

function markdownStream(props: Record<string, unknown>): VNode {
  return h(XhMarkdownStreamRoot, props, () => [h(XhMarkdownStreamContent)])
}

async function markdownStreamStyle(
  props: Record<string, unknown>,
  style?: string,
): Promise<{ fontSize: string, gap: string }> {
  await mount(() => markdownStream(props), style ? { style } : {})
  const measured = {
    fontSize: styleOf('markdown-stream', 'root', 'font-size'),
    gap: styleOf('markdown-stream', 'content', 'row-gap'),
  }
  teardown()
  return measured
}

describe('流式正文的尺寸档', () => {
  it('三档各是各的字号与块间距', async () => {
    const tiers = [
      await markdownStreamStyle({ size: 'sm' }),
      await markdownStreamStyle({ size: 'md' }),
      await markdownStreamStyle({ size: 'lg' }),
    ]

    expect(new Set(tiers.map(t => t.fontSize)).size).toBe(3)
    expect(new Set(tiers.map(t => t.gap)).size).toBe(3)
  })

  it('作者设了字号，写了档位的那一份也跟着走，块间距不受牵连', async () => {
    const tier = await markdownStreamStyle({ size: 'lg' })
    const overridden = await markdownStreamStyle({ size: 'lg' }, '--xh-markdown-stream-font-size: 29px')

    expect(overridden.fontSize).toBe('29px')
    expect(tier.fontSize).not.toBe('29px')
    expect(overridden.gap).toBe(tier.gap)
  })

  it('作者设了块间距，写了档位的那一份也跟着走，字号不受牵连', async () => {
    const tier = await markdownStreamStyle({ size: 'sm' })
    const overridden = await markdownStreamStyle({ size: 'sm' }, '--xh-markdown-stream-gap: 7px')

    expect(overridden.gap).toBe('7px')
    expect(tier.gap).not.toBe('7px')
    expect(overridden.fontSize).toBe(tier.fontSize)
  })
})

// —— 二、tool-call 的字号与内衬各自能调 —— //

function toolCall(props: Record<string, unknown>): VNode {
  return h(
    XhToolCallRoot,
    { phase: 'output-available', ...props },
    () => [h(XhToolCallTrigger, null, () => [h(XhToolCallName, null, () => 'read_file')])],
  )
}

async function toolCallStyle(
  props: Record<string, unknown>,
  style?: string,
): Promise<{ fontSize: string, px: string }> {
  await mount(() => toolCall(props), style ? { style } : {})
  const measured = {
    fontSize: styleOf('tool-call', 'trigger', 'font-size'),
    px: styleOf('tool-call', 'trigger', 'padding-left'),
  }
  teardown()
  return measured
}

describe('工具调用卡的尺寸档', () => {
  it('三档各是各的字号与内衬', async () => {
    const tiers = [
      await toolCallStyle({ size: 'sm' }),
      await toolCallStyle({ size: 'md' }),
      await toolCallStyle({ size: 'lg' }),
    ]

    expect(new Set(tiers.map(t => t.fontSize)).size).toBe(3)
    expect(new Set(tiers.map(t => t.px)).size).toBe(3)
  })

  it('作者设了字号，写了档位的那一份也跟着走，内衬不受牵连', async () => {
    const tier = await toolCallStyle({ size: 'lg' })
    const overridden = await toolCallStyle({ size: 'lg' }, '--xh-tool-call-font-size: 23px')

    expect(overridden.fontSize).toBe('23px')
    expect(tier.fontSize).not.toBe('23px')
    expect(overridden.px).toBe(tier.px)
  })
})

// —— 三、图标的直径与描边各自能调 —— //

async function iconStyle(
  props: Record<string, unknown>,
  style?: string,
): Promise<{ size: string, stroke: string }> {
  await mount(() => h(XhIcon, props), style ? { style } : {})
  const measured = {
    size: styleOf('icon', 'root', 'width'),
    stroke: styleOf('icon', 'root', 'stroke-width'),
  }
  teardown()
  return measured
}

describe('图标的尺寸档与描边档', () => {
  it('三档直径、三档描边各是各的', async () => {
    const sizes = [
      (await iconStyle({ size: 'sm' })).size,
      (await iconStyle({})).size,
      (await iconStyle({ size: 'lg' })).size,
    ]
    const strokes = [
      (await iconStyle({ weight: 'light' })).stroke,
      (await iconStyle({})).stroke,
      (await iconStyle({ weight: 'bold' })).stroke,
    ]

    expect(new Set(sizes).size).toBe(3)
    expect(new Set(strokes).size).toBe(3)
  })

  it('作者设了直径，写了档位的那一枚也跟着走，描边不受牵连', async () => {
    const tier = await iconStyle({ size: 'lg', weight: 'bold' })
    const overridden = await iconStyle({ size: 'lg', weight: 'bold' }, '--xh-icon-size: 27px')

    expect(overridden.size).toBe('27px')
    expect(tier.size).not.toBe('27px')
    expect(overridden.stroke).toBe(tier.stroke)
  })

  it('作者设了描边，写了档位的那一枚也跟着走，直径不受牵连', async () => {
    const tier = await iconStyle({ size: 'sm', weight: 'bold' })
    const overridden = await iconStyle({ size: 'sm', weight: 'bold' }, '--xh-icon-stroke: 3px')

    expect(overridden.stroke).toBe('3px')
    expect(tier.stroke).not.toBe('3px')
    expect(overridden.size).toBe(tier.size)
  })
})

// —— 四、头像组下发的直径管得住组里每一枚 —— //

/** 一组头像：第 0 枚不写档位，第 1 枚自己写了 sm。 */
function avatarGroup(groupProps: Record<string, unknown>): VNode {
  return h(XhAvatarGroupRoot, groupProps, () => [
    h(XhAvatarRoot, { key: 'plain' }),
    h(XhAvatarRoot, { key: 'small', size: 'sm' }),
  ])
}

async function avatarGroupWidths(
  groupProps: Record<string, unknown>,
  style?: string,
): Promise<{ plain: string, small: string }> {
  await mount(() => avatarGroup(groupProps), style ? { style } : {})
  const measured = {
    plain: styleOf('avatar', 'root', 'width', 0),
    small: styleOf('avatar', 'root', 'width', 1),
  }
  teardown()
  return measured
}

describe('头像组里的直径', () => {
  it('组换档时整排齐平，自己写了 sm 的那一枚也跟着组走', async () => {
    const large = await avatarGroupWidths({ size: 'lg' })
    const small = await avatarGroupWidths({ size: 'sm' })

    expect(large.small).toBe(large.plain)
    expect(small.small).toBe(small.plain)
    expect(large.plain).not.toBe(small.plain)
  })

  it('作者调组的直径，组里每一枚都跟着', async () => {
    const overridden = await avatarGroupWidths({ size: 'lg' }, '--xh-avatar-group-size: 53px')

    expect(overridden.plain).toBe('53px')
    expect(overridden.small).toBe('53px')
  })

  it('单独摆的头像取不到组的槽，仍按自己的档走', async () => {
    await mount(() => h('div', null, [
      h(XhAvatarRoot, { key: 'sm', size: 'sm' }),
      h(XhAvatarRoot, { key: 'lg', size: 'lg' }),
    ]))
    const sm = styleOf('avatar', 'root', 'width', 0)
    const lg = styleOf('avatar', 'root', 'width', 1)

    expect(sm).not.toBe(lg)
  })

  it('作者直接设直径槽，写了档位的那一枚也跟着走，圆角不受牵连', async () => {
    await mount(() => h(XhAvatarRoot, { size: 'sm' }))
    const tierRadius = styleOf('avatar', 'root', 'border-top-left-radius')
    const tierWidth = styleOf('avatar', 'root', 'width')
    teardown()

    await mount(() => h(XhAvatarRoot, { size: 'sm' }), { style: '--xh-avatar-size: 33px' })
    expect(styleOf('avatar', 'root', 'width')).toBe('33px')
    expect(tierWidth).not.toBe('33px')
    expect(styleOf('avatar', 'root', 'border-top-left-radius')).toBe(tierRadius)
  })
})
