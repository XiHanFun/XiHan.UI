// 高对比档（forced-colors: active）里皮肤画的字形不许消失。
//
// 皮肤里的兜底字形是伪元素上的一块底色、再用 mask 挖出形状：底色取 currentColor 或某支前景令牌。
// 这一档里系统把 background-color 统一换成 Canvas——字形与它所在的面同色，整块不见了，
// 关闭钮、翻页钮、展开箭头、选中对号只剩一个空按钮。
// 伪元素退出强制换色（forced-color-adjust: none）后读 currentColor 也不行：读到的是被系统换掉之前的作者色。
// 只有「退出强制换色 + 直接写系统色关键字」可靠，而且要按字形所在的面在这一档里的实际底色选：
// 按钮面上 ButtonText、页面与字段上 CanvasText、悬停 / 按下涂成 Highlight 的面上 HighlightText、禁用 GrayText。
//
// 断言不列选择器：把每个组件的一致性套件夹具（连同各用例的 props 与结构变体）真挂出来，
// 扫出所有用 mask 画、由底色填充的伪元素，逐个比它的底色与它身下那块面的实际底色。
// 触发器里写了文字的夹具另挂一份「去掉文字、改写 aria-label」的变体，:empty 才画的兜底字形才会露面。
// 夹具渲不出来的几处字形由 EXTRA 表另挂真组件补上；末尾一条核对扫到的字形覆盖了 COVERED 表。
import type { ConformanceSuite, FixtureNode } from '@xihan-ui/testing'
import type { App, VNode } from 'vue'
import { allSuites, attachHost } from '@xihan-ui/testing'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
  XhDownloadTrigger,
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSub,
  XhMenubarSubTrigger,
  XhMenubarTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSub,
  XhMenuSubTrigger,
  XhMenuTrigger,
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
  XhNavigationMenuTriggerIndicator,
} from '../../src'
import { createVueHarness } from '../harness'
import { hoverPointer, movePointerAway } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/**
 * 禁用时不退成 GrayText 的字形：它画的就是取值本身，禁用了也得与另一档分得开。
 * 键是「scope:part::伪元素」，值写清为什么。
 */
const DISABLED_KEEPS_ROLE: Record<string, string> = {
  'rating:item::after': '填满的星就是评分值，禁用时仍要与空星（GrayText）分得开',
}

/**
 * 扫到的字形至少覆盖这些：夹具或 EXTRA 表改动后某枚字形不再露面，这里会先红，
 * 免得断言在一个空集合上恒绿。
 */
const COVERED: readonly string[] = [
  'accordion:indicator::before',
  'alert:close-trigger::before',
  'back-top:trigger::before',
  'breadcrumb:ellipsis-trigger::before',
  'breadcrumb:separator::before',
  'calendar-picker:next-trigger::before',
  'calendar-picker:next-year-trigger::before',
  'calendar-picker:prev-trigger::before',
  'calendar-picker:prev-year-trigger::before',
  'calendar-range-picker:next-trigger::before',
  'calendar-range-picker:next-year-trigger::before',
  'calendar-range-picker:prev-trigger::before',
  'calendar-range-picker:prev-year-trigger::before',
  'carousel:autoplay-trigger::before',
  'carousel:next-trigger::before',
  'carousel:prev-trigger::before',
  'cascader:clear-trigger::before',
  'cascader:indicator::before',
  'cascader:item::after',
  'checkbox-group:indicator::before',
  'checkbox-group:select-all-trigger::after',
  'checkbox:indicator::before',
  'citation:dismiss-trigger::before',
  'citation:next-trigger::before',
  'citation:prev-trigger::before',
  'code-view:line-fold-trigger::before',
  'collapsible:indicator::before',
  'color-field:clear-trigger::before',
  'color-swatch-picker:indicator::after',
  'combobox:clear-trigger::before',
  'combobox:item-indicator::before',
  'combobox:trigger::before',
  'context-menu:item-indicator::before',
  'date-field:clear-trigger::before',
  'date-picker:clear-trigger::before',
  'date-picker:trigger::before',
  'date-range-picker:clear-trigger::before',
  'date-range-picker:trigger::before',
  'dialog:close-trigger::before',
  'diff-view:comment-trigger::before',
  'download-trigger:root::after',
  'drawer:close-trigger::before',
  'editable:cancel-trigger::before',
  'editable:edit-trigger::before',
  'editable:submit-trigger::before',
  'field-array:item-delete-trigger::before',
  'field-array:move-down-trigger::before',
  'field-array:move-up-trigger::before',
  'file-upload:clear-trigger::before',
  'file-upload:item-delete-trigger::before',
  'float-button:trigger::before',
  'floating-panel:close-trigger::before',
  'floating-panel:window-state-trigger::before',
  'hierarchy-chart:path-item::before',
  'image-viewer:close-trigger::before',
  'image-viewer:flip-horizontal-trigger::before',
  'image-viewer:flip-vertical-trigger::before',
  'image-viewer:next-trigger::before',
  'image-viewer:prev-trigger::before',
  'image-viewer:rotate-left-trigger::before',
  'image-viewer:rotate-right-trigger::before',
  'image-viewer:zoom-in-trigger::before',
  'image-viewer:zoom-out-trigger::before',
  'json-viewer:branch-indicator::before',
  'listbox:item-indicator::before',
  'log:scroll-to-end-trigger::before',
  'marquee:autoplay-trigger::before',
  'menu:item::after',
  'menubar:item-indicator::before',
  'menubar:item::after',
  'message-feed:scroll-to-end-trigger::before',
  'navigation-menu:branch-indicator::before',
  'navigation-menu:trigger-indicator::before',
  'notification:item-close-trigger::before',
  'notification:item-indicator::after',
  'number-field:decrement-trigger::before',
  'number-field:increment-trigger::before',
  'pagination:ellipsis-trigger::before',
  'pagination:first-trigger::before',
  'pagination:last-trigger::before',
  'pagination:next-trigger::before',
  'pagination:prev-trigger::before',
  'password-input:visibility-trigger::before',
  'popover:close-trigger::before',
  'prompt-input:submit-trigger::before',
  'question-flow:item-indicator::before',
  'question-flow:next-trigger::before',
  'question-flow:prev-trigger::before',
  'rating:item::after',
  'rating:item::before',
  'reasoning:indicator::before',
  'select:clear-trigger::before',
  'select:indicator::before',
  'select:item-indicator::before',
  'side-nav:branch-indicator::before',
  'statistic:trend::before',
  'steps:indicator::before',
  'table:column-visibility-trigger::before',
  'table:expand-trigger::before',
  'table:row-select-trigger::before',
  'table:select-all-trigger::before',
  'table:sort-trigger::before',
  'tabs:close-trigger::before',
  'tag-group:item-indicator::before',
  'tag:close-trigger::before',
  'tags-input:clear-trigger::before',
  'text-field:clear-trigger::before',
  'time-field:clear-trigger::before',
  'time-picker:clear-trigger::before',
  'time-picker:trigger::before',
  'time-range-picker:clear-trigger::before',
  'time-range-picker:item::after',
  'time-range-picker:trigger::before',
  'tool-call:indicator::before',
  'toolbar:overflow-trigger::before',
  'tour:close-trigger::before',
  'transfer:item-checkbox::before',
  'transfer:select-all-trigger::after',
  'transfer:to-source-trigger::before',
  'transfer:to-target-trigger::before',
  'tree-select:branch-error::before',
  'tree-select:branch-indicator::before',
  'tree-select:branch-trigger::before',
  'tree-select:clear-trigger::before',
  'tree-select:indicator::before',
  'tree:branch-indicator::before',
  'tree:branch-trigger::before',
  'tree:item-indicator::before',
  'watermark:root::after',
]

/**
 * 禁用档要真正核到 GrayText 的字形：它们静息时收起（按需显示的动作钮），只在悬停宿主那一遍露面。
 * 同一枚字形在启用的夹具里扫到就能让 COVERED 过，禁用的那份漏扫了也不会红，这里单独再核一张。
 */
const DISABLED_COVERED: readonly string[] = [
  'number-field:decrement-trigger::before',
  'number-field:increment-trigger::before',
]

/** 夹具渲不出来的字形：直接挂真组件。 */
const EXTRA: ReadonlyArray<{ name: string, render: () => VNode }> = [
  {
    name: 'accordion 标题栏里的展开箭头',
    render: () => h(XhAccordionRoot, { defaultValue: ['one'] }, () => ['one', 'two'].map(value =>
      h(XhAccordionItem, { key: value, value }, () => [
        h(XhAccordionHeader, () => h(XhAccordionTrigger, () => [value, h(XhAccordionIndicator)])),
        h(XhAccordionContent, () => `${value} 的正文`),
      ]),
    )),
  },
  {
    name: 'download-trigger 不写文字时的兜底下载字形',
    render: () => h(XhDownloadTrigger, { 'data': 'hi', 'fileName': 'a.txt', 'aria-label': '下载' }),
  },
  {
    name: 'breadcrumb 层级之间的分隔箭头',
    render: () => h(XhBreadcrumbRoot, null, () => h(XhBreadcrumbList, null, () => [
      h(XhBreadcrumbItem, null, () => h(XhBreadcrumbLink, { href: '#home' }, () => '首页')),
      h(XhBreadcrumbSeparator),
      h(XhBreadcrumbItem, null, () => h(XhBreadcrumbLink, { href: '#docs', current: true }, () => '文档')),
    ])),
  },
  {
    name: 'navigation-menu 顶层入口的展开箭头',
    render: () => h(XhNavigationMenuRoot, null, () => h(XhNavigationMenuList, null, () => [
      h(XhNavigationMenuItem, null, () => [
        h(XhNavigationMenuTrigger, { value: 'products' }, () => ['产品', h(XhNavigationMenuTriggerIndicator, { value: 'products' })]),
        h(XhNavigationMenuContent, { value: 'products' }, () => h(XhNavigationMenuLink, { href: '#overview' }, () => '产品概览')),
      ]),
    ])),
  },
  {
    name: 'menu 子菜单入口的行尾箭头',
    render: () => h(XhMenuRoot, { defaultOpen: true }, () => [
      h(XhMenuTrigger, null, () => '打开'),
      h(XhMenuPositioner, null, () => h(XhMenuContent, null, () => [
        h(XhMenuItem, { value: 'copy' }, () => '复制'),
        h(XhMenuSub, { value: 'more', openOnHover: false }, () => [
          h(XhMenuSubTrigger, null, () => '更多'),
          h(XhMenuPositioner, null, () => h(XhMenuContent, null, () => h(XhMenuItem, { value: 'more-a' }, () => '子项'))),
        ]),
      ])),
    ]),
  },
  {
    name: 'menubar 子菜单入口的行尾箭头',
    render: () => h(XhMenubarRoot, { defaultValue: 'file' }, () => [
      h(XhMenubarTrigger, { value: 'file' }, () => '文件'),
      h(XhMenubarPositioner, { value: 'file' }, () => h(XhMenubarContent, { value: 'file' }, () => [
        h(XhMenubarItem, { value: 'new' }, () => '新建'),
        h(XhMenubarSub, { value: 'share', openOnHover: false }, () => [
          h(XhMenubarSubTrigger, () => '发送到…'),
          h(XhMenubarPositioner, null, () => h(XhMenubarContent, null, () => h(XhMenubarItem, { value: 'mail' }, () => '邮件'))),
        ]),
      ])),
    ]),
  },
]

const harness = createVueHarness()
const found = new Set<string>()
/** 扫到时所在动作控件正禁用着的字形。 */
const foundDisabled = new Set<string>()
let freeze: HTMLStyleElement | null = null

beforeAll(async () => {
  // 过渡压掉：悬停后读到的是终态底色，不是 Canvas 到 Highlight 途中的插值
  freeze = document.createElement('style')
  freeze.textContent = '*, *::before, *::after { transition: none !important; }'
  document.head.append(freeze)
  await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
})

afterAll(async () => {
  freeze?.remove()
  await movePointerAway()
  await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'none' }] })
})

/** 系统色关键字在当前调色板里的实际取值。 */
function system(keyword: string): string {
  const probe = document.createElement('span')
  probe.style.color = keyword
  probe.style.setProperty('forced-color-adjust', 'none')
  document.body.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

type Rgba = [number, number, number, number]

function parse(color: string): Rgba {
  const m = /rgba?\(([^)]+)\)/.exec(color)
  if (!m)
    throw new Error(`读不懂的颜色：${color}`)
  const [r = 0, g = 0, b = 0, a = 1] = m[1]!.split(/[\s,/]+/).filter(Boolean).map(Number)
  return [r, g, b, a]
}

function format([r, g, b]: Rgba): string {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

/** 把半透明的一层叠到下面那层上。 */
function over(top: Rgba, bottom: Rgba): Rgba {
  const a = top[3]
  return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1]
}

/**
 * 字形身下那块面的实际底色：::after 先看同一节点上垫着的 ::before 实心面（色板勾下面那枚圆），
 * 再从宿主节点往上逐层叠，直到一层不透明的底；一路都透明就落在页面的 Canvas 上。
 */
function backdropOf(host: HTMLElement, pseudo: '::before' | '::after'): string {
  const layers: Rgba[] = []
  if (pseudo === '::after') {
    const under = getComputedStyle(host, '::before')
    const mask = under.maskImage || under.getPropertyValue('-webkit-mask-image')
    if (under.content !== 'none' && under.content !== 'normal' && under.display !== 'none' && mask === 'none')
      layers.push(parse(under.backgroundColor))
  }
  for (let node: HTMLElement | null = host; node; node = node.parentElement)
    layers.push(parse(getComputedStyle(node).backgroundColor))
  let color = parse(system('Canvas'))
  for (const layer of layers.reverse()) {
    if (layer[3] > 0)
      color = over(layer, color)
  }
  return format(color)
}

interface Glyph {
  key: string
  host: HTMLElement
  pseudo: '::before' | '::after'
}

function keyOf(host: HTMLElement, pseudo: string): string {
  return `${host.getAttribute('data-scope')}:${host.getAttribute('data-part')}${pseudo}`
}

/** 页面上所有用 mask 画、由底色填充的伪元素字形。 */
function glyphs(): Glyph[] {
  const out: Glyph[] = []
  for (const host of document.querySelectorAll<HTMLElement>('[data-scope][data-part]')) {
    for (const pseudo of ['::before', '::after'] as const) {
      const style = getComputedStyle(host, pseudo)
      if (style.content === 'none' || style.content === 'normal' || style.display === 'none')
        continue
      const mask = style.maskImage || style.getPropertyValue('-webkit-mask-image')
      if (!mask.includes('url(') || style.backgroundImage !== 'none')
        continue
      out.push({ key: keyOf(host, pseudo), host, pseudo })
    }
  }
  return out
}

/**
 * 字形此刻画没画出来：没勾上的对号这类按状态藏起来的字形（自己或祖先 opacity 为 0、visibility 隐藏、
 * 故意把前景写成透明），颜色看不见，这一刻不断言。
 */
function drawn(glyph: Glyph): boolean {
  const style = getComputedStyle(glyph.host, glyph.pseudo)
  if (parse(style.backgroundColor)[3] === 0 || Number(style.opacity) === 0 || style.visibility !== 'visible')
    return false
  for (let node: HTMLElement | null = glyph.host; node; node = node.parentElement) {
    if (Number(getComputedStyle(node).opacity) === 0)
      return false
  }
  return true
}

/** 一枚字形在当前状态下的问题；没有问题返回 null。 */
function problemOf(glyph: Glyph, state: string): string | null {
  const fill = getComputedStyle(glyph.host, glyph.pseudo).backgroundColor
  const backdrop = backdropOf(glyph.host, glyph.pseudo)
  const label = `${glyph.key}（${state}）`
  const color = format(parse(fill))
  if (color === backdrop)
    return `${label} 底色 ${color} 与身下的面同色，字形消失`
  if (backdrop === format(parse(system('Highlight'))) && color !== format(parse(system('HighlightText'))))
    return `${label} 落在 Highlight 面上却取了 ${color}，应取 HighlightText`
  const control = glyph.host.closest('[data-xh-action-control]')
  if (control?.hasAttribute('data-disabled') && !(glyph.key in DISABLED_KEEPS_ROLE) && color !== format(parse(system('GrayText'))))
    return `${label} 所在的动作控件禁用了却取了 ${color}，应取 GrayText`
  return null
}

/** 记下扫到并核过的字形；所在动作控件禁用着的另记一份。 */
function record(glyph: Glyph): void {
  found.add(glyph.key)
  if (glyph.host.closest('[data-xh-action-control]')?.hasAttribute('data-disabled'))
    foundDisabled.add(glyph.key)
}

/**
 * 按需显示的动作钮（data-xh-action-display="hover-focus"）静息时收起，指针落到它的宿主
 * （data-xh-action-owner）上才露面；钮禁用了照样露面。不是这种钮返回 null。
 */
function revealOwner(glyph: Glyph): HTMLElement | null {
  const owner = glyph.host.closest('[data-xh-action-display="hover-focus"]')?.closest<HTMLElement>('[data-xh-action-owner]')
  if (!owner)
    return null
  const rect = owner.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0 ? owner : null
}

/** 字形跟着哪个可交互的面换色：动作控件或集合条目，禁用的不算。 */
function interactiveHost(glyph: Glyph): HTMLElement | null {
  const host = glyph.host.closest<HTMLElement>('[data-xh-action-control], [data-xh-collection-item]')
  if (!host || host.matches('[data-disabled], [aria-disabled="true"]'))
    return null
  const rect = host.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0 ? host : null
}

/** 有限时长的进场直接落到终态：浮层淡入的第一帧 opacity 还是 0，字形会被当成没画。 */
function finishAnimations(): void {
  for (const animation of document.getAnimations()) {
    if (Number.isFinite(animation.effect?.getComputedTiming().endTime as number))
      animation.finish()
  }
}

/**
 * 静息一遍、悬停宿主一遍、逐个悬停一遍，收集当前页面上字形的问题。
 * 同一枚字形在一个组件的各份夹具里只悬停一次（hovered 记着），悬停的面与夹具无关；
 * 悬停宿主那一遍不去重：钮禁用与否随夹具变，每份都要露出来核。
 */
async function inspect(label: string, hovered: Set<string>): Promise<string[]> {
  finishAnimations()
  const problems: string[] = []
  const list = glyphs()
  const concealed: Glyph[] = []
  for (const glyph of list) {
    if (!drawn(glyph)) {
      if (revealOwner(glyph))
        concealed.push(glyph)
      continue
    }
    record(glyph)
    const problem = problemOf(glyph, `${label} · 静息`)
    if (problem)
      problems.push(problem)
  }
  // 静息时收起的按需显示钮：指针落在宿主上、不碰钮本身，钮露出静息面再核一遍。
  // 禁用的钮只在这一遍露面，GrayText 那一支只有这里核得到
  for (const glyph of concealed) {
    const owner = revealOwner(glyph)
    if (!owner || !glyph.host.isConnected)
      continue
    await hoverPointer(owner)
    if (!drawn(glyph)) {
      problems.push(`${glyph.key}（${label} · 悬停宿主）宿主悬停后仍没露面`)
      continue
    }
    record(glyph)
    const problem = problemOf(glyph, `${label} · 悬停宿主`)
    if (problem)
      problems.push(problem)
  }
  for (const glyph of list) {
    const host = interactiveHost(glyph)
    if (!host || hovered.has(glyph.key) || !glyph.host.isConnected)
      continue
    await hoverPointer(host)
    if (!drawn(glyph))
      continue
    hovered.add(glyph.key)
    const problem = problemOf(glyph, `${label} · 悬停`)
    if (problem)
      problems.push(problem)
  }
  await movePointerAway()
  return problems
}

/** 触发器与指示器里的文字挪进 aria-label：兜底字形只在部件为空时画。 */
function emptied(node: FixtureNode): FixtureNode {
  if (node.part && /(?:trigger|indicator)$/.test(node.part) && node.text && !node.children)
    return { ...node, text: undefined, attrs: { ...node.attrs, 'aria-label': node.text } }
  return node.children ? { ...node, children: node.children.map(emptied) } : node
}

interface Variant {
  label: string
  props: Record<string, unknown>
  tree: FixtureNode
}

/** 缺省夹具与各用例的 props / 结构变体（去重），每份再配一份去掉文字的。 */
function variants(suite: ConformanceSuite): Variant[] {
  const out: Variant[] = [{ label: '缺省', props: { ...suite.defaultProps }, tree: suite.fixture }]
  const seen = new Set([JSON.stringify(out[0]!.props)])
  for (const c of suite.cases) {
    if (!c.props && !c.fixture)
      continue
    const props = { ...suite.defaultProps, ...c.props }
    const key = c.fixture ? `${JSON.stringify(props)}#${c.name}` : JSON.stringify(props)
    if (seen.has(key))
      continue
    seen.add(key)
    out.push({ label: c.name, props, tree: c.fixture ? c.fixture(suite.fixture) : suite.fixture })
  }
  return out.flatMap(v => [v, { ...v, label: `${v.label} · 去掉文字`, tree: emptied(v.tree) }])
}

describe('高对比档里皮肤画的字形不消失', () => {
  for (const suite of allSuites) {
    it(`${suite.component}：字形的底色与身下的面分得开，悬停到 Highlight 上取 HighlightText，禁用取 GrayText`, async () => {
      const problems: string[] = []
      const hovered = new Set<string>()
      for (const variant of variants(suite)) {
        await harness.mount({ component: suite.component, props: variant.props, tree: variant.tree })
        await harness.flush()
        problems.push(...await inspect(variant.label, hovered))
        await harness.unmount()
      }
      expect(problems).toEqual([])
    })
  }

  for (const extra of EXTRA) {
    it(extra.name, async () => {
      const host = document.createElement('div')
      attachHost(host)
      const app: App = createApp({ render: extra.render })
      app.mount(host)
      await nextTick()
      await nextTick()
      // 浮层要等定位层算完第一帧才露面
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      try {
        expect(await inspect(extra.name, new Set())).toEqual([])
      }
      finally {
        app.unmount()
        host.remove()
      }
    })
  }

  it('扫到的字形覆盖了登记的每一枚', () => {
    expect(COVERED.filter(key => !found.has(key))).toEqual([])
  })

  it('静息时收起的按需显示钮在禁用档也露出来核过', () => {
    expect(DISABLED_COVERED.filter(key => !foundDisabled.has(key))).toEqual([])
  })
})
