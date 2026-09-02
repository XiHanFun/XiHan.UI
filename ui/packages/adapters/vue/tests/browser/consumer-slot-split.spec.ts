// 使用者槽的分工：一个槽只管一件事，调它不牵连别处；组件自己的声明也不许把使用者的入口写死。
// 每条都量两侧——该跟着变的变了，不该被牵连的一点没动。
// 只有真实浏览器算得出来：jsdom 不解析样式表里的 var() 与继承，getComputedStyle 恒是空串。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhButton,
  XhButtonGroup,
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
  XhNavigationMenuViewport,
  XhToggleGroupItem,
  XhToggleGroupRoot,
  XhTypographyRoot,
  XhTypographyText,
} from '../../src'
// 皮肤与令牌要一起加载：这里查的就是皮肤按槽算出来的值
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => teardown())

/** 挂一棵树。宿主上的属性是使用者那一侧的写法：覆盖槽写在 style 上，语气区域写成 data-tone。 */
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

/** 取第 index 个同名部件的计算值；属性名写私有槽也行。 */
function styleOf(scope: string, part: string, prop: string, index = 0): string {
  const list = host?.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='${part}']`)
  const el = list?.[index]
  if (!el)
    throw new Error(`挂载树里没有第 ${index} 个 ${scope} 的 ${part}`)
  return getComputedStyle(el).getPropertyValue(prop)
}

/**
 * 令牌本身解析成的计算值。
 * 令牌写的是 rem 与 oklch，部件量出来的是 px 与 rgb，两者比不了；
 * 拿一个只声明该属性的探针元素过一遍，两边就落在同一套单位上。
 */
function tokenAs(prop: string, token: string, tone?: string): string {
  // 语气槽只在语气容器里才有值，探针要连着那层容器一起挂
  const wrap = document.createElement('div')
  if (tone != null)
    wrap.dataset.tone = tone
  const probe = document.createElement('div')
  probe.style.setProperty(prop, `var(${token})`)
  wrap.append(probe)
  document.body.append(wrap)
  const value = getComputedStyle(probe).getPropertyValue(prop)
  wrap.remove()
  return value
}

// —— 一、toggle-group 接语气轴 —— //

const OPTIONS = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
]

function toggleGroup(props: Record<string, unknown> = {}): VNode {
  return h(
    XhToggleGroupRoot,
    { collection: OPTIONS, value: 'day', ...props },
    () => OPTIONS.map(node => h(XhToggleGroupItem, { key: node.value, value: node.value }, () => node.label)),
  )
}

/** 选中段（第 0 个）与未选中段（第 1 个）的底色。 */
async function toggleGroupBg(props: Record<string, unknown>, attrs: Record<string, string> = {}): Promise<{ on: string, off: string }> {
  await mount(() => toggleGroup(props), attrs)
  const measured = {
    on: styleOf('toggle-group', 'item', 'background-color', 0),
    off: styleOf('toggle-group', 'item', 'background-color', 1),
  }
  teardown()
  return measured
}

describe('toggle-group 的语气轴', () => {
  it('三族语气各换一族颜色，未选中的段一动不动', async () => {
    const plain = await toggleGroupBg({})
    const danger = await toggleGroupBg({ tone: 'danger' })
    const success = await toggleGroupBg({ tone: 'success' })

    const on = [plain.on, danger.on, success.on]
    expect(new Set(on).size, `选中段量出来是 ${JSON.stringify(on)}`).toBe(3)
    // 未选中的段本来就是中性底，换语气不该碰它
    expect(danger.off).toBe(plain.off)
    expect(success.off).toBe(plain.off)
  })

  it('落在语气区域里跟着变，与自己写 tone 同值', async () => {
    const plain = await toggleGroupBg({})
    const ambient = await toggleGroupBg({}, { 'data-tone': 'danger' })
    const declared = await toggleGroupBg({ tone: 'danger' })

    expect(ambient.on).not.toBe(plain.on)
    expect(ambient.on).toBe(declared.on)
    expect(ambient.off).toBe(plain.off)
  })

  it('条目圆角槽带 item 段，不带段的旧名照样调得动', async () => {
    const corner = 'border-top-left-radius'
    await mount(() => toggleGroup())
    const fallback = styleOf('toggle-group', 'item', corner, 0)
    teardown()

    await mount(() => toggleGroup(), { style: '--xh-toggle-group-item-radius: 11px' })
    expect(styleOf('toggle-group', 'item', corner, 0)).toBe('11px')
    teardown()

    await mount(() => toggleGroup(), { style: '--xh-toggle-group-radius: 13px' })
    expect(styleOf('toggle-group', 'item', corner, 0)).toBe('13px')
    teardown()

    // 新名在外：两个都写时以带段的那个为准
    await mount(() => toggleGroup(), { style: '--xh-toggle-group-item-radius: 11px; --xh-toggle-group-radius: 13px' })
    expect(styleOf('toggle-group', 'item', corner, 0)).toBe('11px')

    expect(fallback).not.toBe('11px')
    expect(fallback).not.toBe('13px')
  })
})

// —— 二、button-group 不再把使用者的圆角槽写成 0 —— //

function buttonGroup(): VNode {
  return h(XhButtonGroup, null, () => [
    h(XhButton, null, () => '左'),
    h(XhButton, null, () => '中'),
    h(XhButton, null, () => '右'),
  ])
}

describe('按钮组里的圆角', () => {
  it('不设覆盖槽时中间段仍是直角', async () => {
    await mount(() => buttonGroup())
    expect(styleOf('button', 'root', 'border-top-left-radius', 1)).toBe('0px')
  })

  it('使用者设了圆角，进了组仍然生效', async () => {
    await mount(() => buttonGroup(), { style: '--xh-button-radius: 999px' })
    expect(styleOf('button', 'root', 'border-top-left-radius', 1)).toBe('999px')
  })

  it('组两端的圆角仍归组的槽管，改它不动中间段', async () => {
    await mount(() => buttonGroup(), { style: '--xh-button-group-radius: 17px' })
    expect(styleOf('button', 'root', 'border-top-left-radius', 0)).toBe('17px')
    expect(styleOf('button', 'root', 'border-top-left-radius', 1)).toBe('0px')
  })

  it('组外的按钮不受牵连', async () => {
    await mount(() => h('div', null, [buttonGroup(), h(XhButton, null, () => '单独一枚')]))
    const alone = styleOf('button', 'root', 'border-top-left-radius', 3)
    expect(alone).not.toBe('0px')
  })
})

// —— 三、navigation-menu 的面板与外壳各有各的内衬 —— //

function navigationMenu(): VNode {
  return h(XhNavigationMenuRoot, { value: 'product' }, () => [
    h(XhNavigationMenuList, null, () => [
      h(XhNavigationMenuItem, null, () => [
        h(XhNavigationMenuTrigger, { value: 'product' }, () => '产品'),
        h(XhNavigationMenuContent, { value: 'product' }, () => '面板内容'),
      ]),
    ]),
    h(XhNavigationMenuViewport, null, () => '外壳内容'),
  ])
}

async function navPadding(style?: string): Promise<{ content: string, viewport: string }> {
  await mount(() => navigationMenu(), style ? { style } : {})
  const measured = {
    content: styleOf('navigation-menu', 'content', 'padding-top'),
    viewport: styleOf('navigation-menu', 'viewport', 'padding-top'),
  }
  teardown()
  return measured
}

describe('导航菜单的面板内衬', () => {
  it('两种面板形态的内衬缺省就不同', async () => {
    const base = await navPadding()
    expect(base.content).not.toBe(base.viewport)
  })

  it('两处能各调各的，差值调得开', async () => {
    const both = await navPadding('--xh-navigation-menu-content-p: 3px; --xh-navigation-menu-viewport-p: 21px')
    expect(both.content).toBe('3px')
    expect(both.viewport).toBe('21px')
  })

  it('只调外壳时面板不动', async () => {
    const base = await navPadding()
    const only = await navPadding('--xh-navigation-menu-viewport-p: 21px')
    expect(only.viewport).toBe('21px')
    expect(only.content).toBe(base.content)
  })

  it('只写旧名时两处仍一起走', async () => {
    const legacy = await navPadding('--xh-navigation-menu-content-p: 3px')
    expect(legacy.content).toBe('3px')
    expect(legacy.viewport).toBe('3px')
  })
})

// —— 四、typography 的次要文字与语气文字各有各的槽 —— //

const TONES = ['brand', 'neutral', 'success', 'warning', 'danger', 'info'] as const

function typography(): VNode {
  return h(XhTypographyRoot, null, () => [
    h(XhTypographyText, { variant: 'muted' }, () => '次要文字'),
    ...TONES.map(tone => h(XhTypographyText, { key: tone, tone }, () => tone)),
  ])
}

/** 第 0 个是 muted 档，其后六个依次是六族语气。 */
async function typographyColors(style?: string): Promise<{ muted: string, tones: string[] }> {
  await mount(() => typography(), style ? { style } : {})
  const measured = {
    muted: styleOf('typography', 'text', 'color', 0),
    tones: TONES.map((_, i) => styleOf('typography', 'text', 'color', i + 1)),
  }
  teardown()
  return measured
}

describe('行内文字的两档前景色', () => {
  it('调淡次要文字，六族语气一个不动', async () => {
    const base = await typographyColors()
    const dimmed = await typographyColors('--xh-typography-text-fg-muted: rgb(1, 2, 3)')

    expect(dimmed.muted).toBe('rgb(1, 2, 3)')
    expect(dimmed.tones).toEqual(base.tones)
    // 六族本来就该各是各的色，这条把「全塌成同一个值」挡在外面
    expect(new Set(base.tones).size).toBe(TONES.length)
  })

  it('调语气文字，次要文字一动不动', async () => {
    const base = await typographyColors()
    const recolored = await typographyColors('--xh-typography-text-fg-tone: rgb(4, 5, 6)')

    expect(recolored.tones).toEqual(TONES.map(() => 'rgb(4, 5, 6)'))
    expect(recolored.muted).toBe(base.muted)
  })

  it('只写旧名时两档仍一起走', async () => {
    const legacy = await typographyColors('--xh-typography-text-fg: rgb(7, 8, 9)')
    expect(legacy.muted).toBe('rgb(7, 8, 9)')
    expect(legacy.tones).toEqual(TONES.map(() => 'rgb(7, 8, 9)'))
  })
})

// —— 五、什么都不写时，四处的落点还是原来那个令牌 —— //
// 上面四组都是「新名在外、旧名在内、令牌垫底」的多级兜底。兜底链但凡接错一环，
// 缺省渲染就会悄悄换个值。这一组把每一处的缺省逐个钉到它该落的那个令牌上。

describe('缺省落点', () => {
  it('按钮：单独一枚是控件圆角，组内中间段是直角', async () => {
    await mount(() => h('div', null, [buttonGroup(), h(XhButton, null, () => '单独一枚')]))
    expect(styleOf('button', 'root', 'border-top-left-radius', 3)).toBe(tokenAs('border-top-left-radius', '--xh-shape-control'))
    expect(styleOf('button', 'root', 'border-top-left-radius', 1)).toBe('0px')
  })

  it('开关组：首段圆角是控件圆角，选中段底色是品牌底', async () => {
    await mount(() => toggleGroup())
    expect(styleOf('toggle-group', 'item', 'border-top-left-radius', 0)).toBe(tokenAs('border-top-left-radius', '--xh-shape-control'))
    expect(styleOf('toggle-group', 'item', 'background-color', 0)).toBe(tokenAs('background-color', '--xh-bg-brand'))
  })

  it('导航菜单：面板内衬一档，外壳内衬两档', async () => {
    await mount(() => navigationMenu())
    expect(styleOf('navigation-menu', 'content', 'padding-top')).toBe(tokenAs('padding-top', '--xh-space-1'))
    expect(styleOf('navigation-menu', 'viewport', 'padding-top')).toBe(tokenAs('padding-top', '--xh-space-2'))
  })

  it('行内文字：次要档是次要前景色，语气档是语气前景色', async () => {
    await mount(() => typography())
    expect(styleOf('typography', 'text', 'color', 0)).toBe(tokenAs('color', '--xh-fg-muted'))
    for (const tone of TONES) {
      expect(styleOf('typography', 'text', 'color', 1 + TONES.indexOf(tone)), `${tone} 档`)
        .toBe(tokenAs('color', '--xh-_tone-fg', tone))
    }
  })
})
