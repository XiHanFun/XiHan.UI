// 有层产物 index.css 与无层产物 index.unlayered.css 必须算出同一套计算样式。
//
// 有层产物里皮肤靠特指度压过 Family Recipe（皮肤 (0,4,0) > 配方 (0,3,0)）；无层产物为了压住宿主
// 正文规则把配方抬到与皮肤同档，同档只剩源序竞争——配方一旦排在皮肤之后，皮肤对配方物理属性
// （outline / border-color / background）的直接覆盖就被反超，而单测、门禁与有层产物全绿。
// InputGroup 正是这样在无层产物里叠出第二圈焦点环。这里把同一份 DOM 分别装进只引其中一份
// 产物的 iframe，逐元素比对计算值，任何一处不一致都报出元素路径与属性。
//
// 判据是级联算出的取值，只有真实浏览器算得出来：jsdom 不解析样式表里的 var() 与层。
import type { App, VNode } from 'vue'
import layeredUrl from '@xihan-ui/styles/index.css?url'
import unlayeredUrl from '@xihan-ui/styles/index.unlayered.css?url'
import tokensUrl from '@xihan-ui/tokens/tokens.css?url'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhButton,
  XhButtonLabel,
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
  XhInputGroupItem,
  XhInputGroupRoot,
  XhMenuContent,
  XhMenuItem,
  XhMenuItemText,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSub,
  XhMenuSubTrigger,
  XhMenuTrigger,
  XhSelectRoot,
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchIndicator,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from '../../src'

/** 两份产物按同名入口解析，路径由包的 exports 给出；tokens 两边都单独带上，与皮肤 @import 的那份同源。 */
const SHEETS = {
  layered: layeredUrl,
  unlayered: unlayeredUrl,
} as const

type Sheet = keyof typeof SHEETS

/** 逐元素比对的属性集：皮肤对配方的直接覆盖都落在这些物理属性上。 */
const PROPERTIES = [
  'outline-width',
  'outline-style',
  'outline-color',
  'outline-offset',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'background-color',
  'color',
  'font-weight',
  'font-size',
  'box-shadow',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'opacity',
  'cursor',
] as const

interface Fixture {
  name: string
  render: () => VNode
  /** 挂载后、序列化前的交互（打开子层一类），产出的 data 属性随 DOM 一并带进 iframe。 */
  prepare?: (host: HTMLElement) => Promise<void>
  /** 两个 iframe 里都要聚焦的元素；不聚焦就不写。 */
  focus?: string
}

let app: App | null = null
let host: HTMLElement | null = null
const frames: HTMLIFrameElement[] = []

afterEach(async () => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  for (const frame of frames)
    frame.remove()
  frames.length = 0
  app = null
  host = null
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
})

function textField(label: string): VNode {
  return h(XhTextFieldRoot, { placeholder: label }, () => [
    h(XhTextFieldControl, null, () => [
      h(XhTextFieldInput, { 'aria-label': label }),
    ]),
  ])
}

const FIXTURES: Fixture[] = [
  {
    name: 'input-group',
    render: () => h(XhInputGroupRoot, null, () => [
      h(XhInputGroupItem, null, () => '@'),
      textField('用户名'),
    ]),
    focus: '[data-scope="input-group"] input',
  },
  {
    name: 'side-nav',
    render: () => h(XhSideNavRoot, {
      collection: [
        { value: 'home', label: '首页' },
        { value: 'user', label: '用户', children: [{ value: 'user-list', label: '列表' }, { value: 'user-role', label: '角色' }] },
      ],
      defaultValue: 'user-role',
      defaultExpandedValue: ['user'],
    }, () => h(XhSideNavList, null, () => [
      h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'home' }, () => h(XhSideNavLinkText, null, () => '首页'))),
      h(XhSideNavBranch, { value: 'user' }, () => [
        h(XhSideNavBranchTrigger, null, () => [h(XhSideNavBranchText, null, () => '用户'), h(XhSideNavBranchIndicator)]),
        h(XhSideNavBranchContent, null, () => [
          h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'user-list' }, () => h(XhSideNavLinkText, null, () => '列表'))),
          h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'user-role' }, () => h(XhSideNavLinkText, null, () => '角色'))),
        ]),
      ]),
    ])),
  },
  {
    name: 'select',
    render: () => h(XhSelectRoot, {
      collection: [
        { value: 'alpha', label: 'Alpha' },
        { value: 'beta', label: 'Beta' },
        { value: 'gamma', label: 'Gamma', disabled: true },
      ],
      defaultOpen: true,
      defaultValue: 'alpha',
    }),
  },
  {
    name: 'menu',
    render: () => h(XhMenuRoot, { defaultOpen: true }, () => [
      h(XhMenuTrigger, null, () => '打开'),
      h(XhMenuPositioner, null, () => h(XhMenuContent, { style: { inlineSize: '220px' } }, () => [
        h(XhMenuItem, { value: 'copy' }, () => h(XhMenuItemText, null, () => '复制')),
        h(XhMenuItem, { value: 'blocked', disabled: true }, () => h(XhMenuItemText, null, () => '不可用')),
        h(XhMenuSub, { value: 'more', openOnHover: false }, () => [
          h(XhMenuSubTrigger, null, () => '更多'),
          h(XhMenuPositioner, null, () => h(XhMenuContent, null, () => [
            h(XhMenuItem, { value: 'more-a' }, () => h(XhMenuItemText, null, () => '子项')),
          ])),
        ]),
      ])),
    ]),
    prepare: async () => {
      const more = document.querySelector<HTMLElement>('[data-scope="menu"][data-part="item"][data-value="more"]')!
      await userEvent.click(more)
      await nextTick()
      await nextTick()
      expect(more.hasAttribute('data-in-path')).toBe(true)
    },
  },
  {
    name: 'tabs-line',
    render: () => h(XhTabsRoot, { defaultValue: 'overview', variant: 'line' }, () => [
      h(XhTabsList, null, () => [
        h(XhTabsTrigger, { value: 'overview' }, () => '概览'),
        h(XhTabsTrigger, { value: 'analysis' }, () => '分析'),
      ]),
    ]),
  },
  {
    name: 'checkbox-group',
    render: () => h(XhCheckboxGroupRoot, { defaultValue: ['mail'] }, () => [
      h(XhCheckboxGroupLabel, null, () => '通知'),
      h(XhCheckboxGroupItem, { value: 'mail' }, () => [
        h(XhCheckboxGroupIndicator),
        h(XhCheckboxGroupItemText, null, () => '邮件'),
      ]),
      h(XhCheckboxGroupItem, { value: 'sms' }, () => [
        h(XhCheckboxGroupIndicator),
        h(XhCheckboxGroupItemText, null, () => '短信'),
      ]),
    ]),
  },
  {
    name: 'button',
    render: () => h('div', [
      h(XhButton, { variant: 'solid' }, () => h(XhButtonLabel, null, () => '实心')),
      h(XhButton, { variant: 'outline' }, () => h(XhButtonLabel, null, () => '描边')),
    ]),
  },
]

/** 用 Vue 挂出真实 DOM 与 connect 写下的全部属性，连同浮层落点一起序列化成一份静态标记。 */
async function serialize(fixture: Fixture): Promise<string> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: fixture.render })
  app.mount(host)
  await nextTick()
  await nextTick()
  await fixture.prepare?.(host)
  const portal = document.getElementById('xh-portal-root')
  return `<div id="stage">${host.innerHTML}</div>${portal?.outerHTML ?? ''}`
}

/** 把同一份标记装进只引一份产物的 iframe；等样式表真正装载完再交出文档。 */
async function stage(markup: string, sheet: Sheet): Promise<Document> {
  const frame = document.createElement('iframe')
  frame.style.cssText = 'width: 960px; height: 600px; border: 0'
  document.body.append(frame)
  frames.push(frame)
  const doc = frame.contentDocument
  if (!doc)
    throw new Error('iframe 没有文档')
  doc.documentElement.setAttribute('data-theme', 'light')
  doc.documentElement.setAttribute('dir', 'ltr')
  doc.documentElement.setAttribute('lang', 'zh-CN')

  const loaded: Promise<void>[] = []
  for (const href of [tokensUrl, SHEETS[sheet]]) {
    const link = doc.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    loaded.push(new Promise((resolve, reject) => {
      link.addEventListener('load', () => resolve())
      link.addEventListener('error', () => reject(new Error(`样式表装不上：${href}`)))
    }))
    doc.head.append(link)
  }
  // 比对的是稳定态：过渡与动画在两边都掐掉，免得采到中间帧
  const still = doc.createElement('style')
  still.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }'
  doc.head.append(still)
  doc.body.style.margin = '0'
  doc.body.innerHTML = markup
  await Promise.all(loaded)
  return doc
}

/** 元素在文档里的定位：scope / part 优先，其余按标签与序号。 */
function describeElement(element: Element): string {
  const parts: string[] = []
  let node: Element | null = element
  while (node && node !== node.ownerDocument.body) {
    const scope = node.getAttribute('data-scope')
    const part = node.getAttribute('data-part')
    let label = node.tagName.toLowerCase()
    if (scope && part)
      label = `${scope}/${part}`
    else if (node.hasAttribute('data-xh-field-chrome'))
      label = `${label}[data-xh-field-chrome]`
    const siblings = node.parentElement ? [...node.parentElement.children] : []
    if (siblings.length > 1)
      label += `:nth-child(${siblings.indexOf(node) + 1})`
    parts.unshift(label)
    node = node.parentElement
  }
  return parts.join(' > ')
}

interface Snapshot {
  path: string
  values: Record<string, string>
}

/** 聚焦目标后逐元素采样。焦点只能停在一个文档里，两份产物依次采，采完再比。 */
function snapshot(doc: Document, focus?: string): Snapshot[] {
  if (focus) {
    const target = doc.querySelector<HTMLElement>(focus)
    if (!target)
      throw new Error(`iframe 里找不到要聚焦的 ${focus}`)
    target.focus()
    if (doc.activeElement !== target || !target.matches(':focus'))
      throw new Error(`${focus} 没有拿到焦点`)
  }
  const view = doc.defaultView!
  return [...doc.body.querySelectorAll('*')].map((element) => {
    const computed = view.getComputedStyle(element)
    const values: Record<string, string> = {}
    for (const property of PROPERTIES)
      values[property] = computed.getPropertyValue(property)
    return { path: describeElement(element), values }
  })
}

/** 两份采样逐元素逐属性比对，报出全部差异。 */
function diff(layered: Snapshot[], unlayered: Snapshot[]): string[] {
  const problems: string[] = []
  if (layered.length !== unlayered.length)
    problems.push(`元素数不一致：有层 ${layered.length}，无层 ${unlayered.length}`)
  const count = Math.min(layered.length, unlayered.length)
  for (let i = 0; i < count; i++) {
    const a = layered[i]!
    const b = unlayered[i]!
    for (const property of PROPERTIES) {
      if (a.values[property] !== b.values[property])
        problems.push(`${a.path} · ${property}：有层 ${a.values[property]}，无层 ${b.values[property]}`)
    }
  }
  return problems
}

/** 在该文档的主题下把令牌解析成与 getComputedStyle 同格式的值。 */
function resolveToken(doc: Document, token: string, property: 'outline-width' | 'outline-color'): string {
  const probe = doc.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  probe.style.outlineStyle = 'solid'
  doc.body.append(probe)
  const value = doc.defaultView!.getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return value
}

describe('有层与无层产物计算样式一致', () => {
  it.each(FIXTURES.map(fixture => [fixture.name, fixture] as const))('%s 在两份产物下逐元素计算值相同', async (_name, fixture) => {
    const markup = await serialize(fixture)
    const layered = snapshot(await stage(markup, 'layered'), fixture.focus)
    const unlayered = snapshot(await stage(markup, 'unlayered'), fixture.focus)
    expect(layered.length).toBeGreaterThan(0)
    expect(diff(layered, unlayered)).toEqual([])
  })

  it.each(['layered', 'unlayered'] as const)('input-group 聚焦时只有组壳画环，内嵌字段外壳不画（%s）', async (sheet) => {
    const markup = await serialize(FIXTURES[0]!)
    const doc = await stage(markup, sheet)
    const input = doc.querySelector<HTMLInputElement>('[data-scope="input-group"] input')!
    input.focus()
    const root = doc.querySelector<HTMLElement>('[data-scope="input-group"][data-part="root"]')!
    const control = root.querySelector<HTMLElement>('[data-xh-field-chrome]')!
    expect(root.matches(':focus-within')).toBe(true)

    const view = doc.defaultView!
    const rootStyle = view.getComputedStyle(root)
    expect(rootStyle.outlineStyle).toBe('solid')
    expect(rootStyle.outlineWidth).toBe(resolveToken(doc, '--xh-ring-width', 'outline-width'))
    expect(rootStyle.outlineColor).toBe(resolveToken(doc, '--xh-ring-focus', 'outline-color'))
    expect(view.getComputedStyle(control).outlineStyle, '内嵌字段外壳叠出了第二圈焦点环').toBe('none')
  })
})
