// 三档状态的皮肤取值：「当前项」的槽名、「在途」的转圈、「只读」的观感，以及轻提示的严重度字形。
//
// 判据全是级联算出来的取值与伪元素上的取值，只有真实浏览器算得出来：
// jsdom 不解析样式表里的 var() 与继承，也不给伪元素，getComputedStyle 恒是空串。
import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
  XhApprovalApproveTrigger,
  XhApprovalDenyTrigger,
  XhApprovalFooter,
  XhApprovalRoot,
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhClipboardControl,
  XhClipboardRoot,
  XhClipboardTrigger,
  XhDownloadTrigger,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhSwitch,
  XhToastRoot,
  XhToastTitle,
} from '../../src'
// 皮肤与令牌一起加载：这里查的就是皮肤算出来的取值
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 三个一望即知不出自任何令牌的取值，用来分辨「覆盖生效」与「退回缺省」。 */
const RED = 'rgb(255, 0, 0)'
const LIME = 'rgb(0, 255, 0)'
const BLUE = 'rgb(0, 0, 255)'

let app: App | null = null
let host: HTMLElement | null = null
const overridden: string[] = []

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  for (const name of overridden.splice(0))
    document.documentElement.style.removeProperty(name)
})

/** 覆盖写在根元素上，与使用者真实的写法（`:root { --xh-…: … }`）同一层。 */
function setSlot(name: string, value: string): void {
  document.documentElement.style.setProperty(name, value)
  overridden.push(name)
}

async function mount(render: () => unknown): Promise<void> {
  app?.unmount()
  host?.remove()
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => () => render() as never })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(scope: string, name: string, index = 0): HTMLElement {
  const all = document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
  const el = all[index]
  if (!el)
    throw new Error(`没有第 ${index} 个 ${scope}/${name} 节点`)
  return el
}

/** 等颜色过渡跑完再读：micro 档 120ms，中途读到的是插值。 */
const settled = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 300))

const styleOf = (el: HTMLElement, prop: string): string => getComputedStyle(el).getPropertyValue(prop)
const beforeOf = (el: HTMLElement, prop: string): string => getComputedStyle(el, '::before').getPropertyValue(prop)

// —— 当前项：三家的前景与字重都走 -<部件>-fg-current / -<部件>-font-weight-current ——

function currentTrio(): unknown {
  return [
    h(XhAnchorRoot, { value: 'here' }, () => [
      h(XhAnchorList, null, () => [h(XhAnchorItem, null, () => [h(XhAnchorLink, { value: 'here' }, () => '锚点当前节')])]),
    ]),
    h(XhBreadcrumbRoot, null, () => [
      h(XhBreadcrumbList, null, () => [h(XhBreadcrumbItem, null, () => [h(XhBreadcrumbLink, { current: true }, () => '面包屑当前页')])]),
    ]),
    h(XhNavigationMenuRoot, null, () => [
      h(XhNavigationMenuList, null, () => [h(XhNavigationMenuItem, { value: 'nav' }, () => [h(XhNavigationMenuLink, { current: true }, () => '导航当前页')])]),
    ]),
  ]
}

describe('「当前项」的三家槽名收成同一副构词', () => {
  it('三个新名各自改得动自己那一家的前景色与字重', async () => {
    await mount(currentTrio)
    expect(part('anchor', 'link').hasAttribute('data-current')).toBe(true)
    expect(part('breadcrumb', 'link').hasAttribute('data-current')).toBe(true)
    expect(part('navigation-menu', 'link').hasAttribute('data-current')).toBe(true)

    setSlot('--xh-anchor-link-fg-current', RED)
    setSlot('--xh-breadcrumb-link-fg-current', LIME)
    setSlot('--xh-navigation-menu-link-fg-current', BLUE)
    setSlot('--xh-anchor-link-font-weight-current', '800')
    setSlot('--xh-breadcrumb-link-font-weight-current', '800')
    setSlot('--xh-navigation-menu-link-font-weight-current', '800')
    // 前景色走 micro 档过渡（120ms），中途读到的是插值不是终值
    await settled()

    expect(styleOf(part('anchor', 'link'), 'color')).toBe(RED)
    expect(styleOf(part('breadcrumb', 'link'), 'color')).toBe(LIME)
    expect(styleOf(part('navigation-menu', 'link'), 'color')).toBe(BLUE)
    expect(styleOf(part('anchor', 'link'), 'font-weight')).toBe('800')
    expect(styleOf(part('breadcrumb', 'link'), 'font-weight')).toBe('800')
    expect(styleOf(part('navigation-menu', 'link'), 'font-weight')).toBe('800')
  })

  it('四个旧名已删：设了它们，当前项一动不动', async () => {
    await mount(currentTrio)
    const anchorBefore = styleOf(part('anchor', 'link'), 'color')
    const anchorWeight = styleOf(part('anchor', 'link'), 'font-weight')
    const crumbBefore = styleOf(part('breadcrumb', 'link'), 'color')
    const crumbWeight = styleOf(part('breadcrumb', 'link'), 'font-weight')

    setSlot('--xh-anchor-link-fg-active', RED)
    setSlot('--xh-anchor-link-font-weight-active', '800')
    setSlot('--xh-breadcrumb-current-fg', LIME)
    setSlot('--xh-breadcrumb-current-font-weight', '800')

    expect(styleOf(part('anchor', 'link'), 'color')).toBe(anchorBefore)
    expect(styleOf(part('anchor', 'link'), 'font-weight')).toBe(anchorWeight)
    expect(styleOf(part('breadcrumb', 'link'), 'color')).toBe(crumbBefore)
    expect(styleOf(part('breadcrumb', 'link'), 'font-weight')).toBe(crumbWeight)
  })
})

// —— 在途：触屏上没有指针，光换 cursor 等于零反馈 ——

describe('取数与写入在途的转圈', () => {
  it('下载钮取数在途：指针之外另有一枚转起来的圆环', async () => {
    // 永不落定的取数函数把状态钉在 preparing 上
    await mount(() => h(XhDownloadTrigger, { data: () => new Promise<string>(() => {}) }, () => '导出'))
    const root = part('download-trigger', 'root')
    expect(beforeOf(root, 'animation-name')).toBe('none')

    await userEvent.click(root)
    await nextTick()
    expect(root.getAttribute('data-state')).toBe('preparing')
    expect(styleOf(root, 'cursor')).toBe('progress')
    expect(beforeOf(root, 'animation-name')).toBe('xh-download-trigger-rotate')
    expect(beforeOf(root, 'animation-iteration-count')).toBe('infinite')
    // 圆环真占了一格盒子，不是零尺寸的空规则
    expect(Number.parseFloat(beforeOf(root, 'width'))).toBeGreaterThan(0)
    expect(beforeOf(root, 'border-top-color')).toBe(styleOf(root, 'color'))
  })

  it('下载钮的转圈时长认使用者槽', async () => {
    await mount(() => h(XhDownloadTrigger, { data: () => new Promise<string>(() => {}) }, () => '导出'))
    setSlot('--xh-download-trigger-loading-duration', '3s')
    const root = part('download-trigger', 'root')
    await userEvent.click(root)
    await nextTick()
    expect(beforeOf(root, 'animation-duration')).toBe('3s')
  })

  it('复制钮写入在途：转圈接上了，此前那道裸 opacity 已经不在', async () => {
    await mount(() => h(XhClipboardRoot, { value: 'xh' }, () => [
      h(XhClipboardControl, null, () => [h(XhClipboardTrigger, null, () => '复制')]),
    ]))
    const trigger = part('clipboard', 'trigger')
    // 写剪贴板要真实权限，headless 下拿不到；这一档皮肤本来就只认属性，直接把状态摆上去
    trigger.setAttribute('data-state', 'copying')
    expect(styleOf(trigger, 'cursor')).toBe('progress')
    expect(styleOf(trigger, 'opacity')).toBe('1')
    expect(beforeOf(trigger, 'animation-name')).toBe('xh-clipboard-rotate')
    expect(Number.parseFloat(beforeOf(trigger, 'width'))).toBeGreaterThan(0)
  })
})

// —— 判定闸门的在途：此前与「必选项没勾满」共用一档灰，两种情形长得一模一样 ——

describe('判定闸门在途的那一档', () => {
  const APPROVAL = (props: Record<string, unknown>): unknown =>
    h(XhApprovalRoot, props, () => [
      h(XhApprovalFooter, null, () => [
        h(XhApprovalDenyTrigger, null, () => '拒绝'),
        h(XhApprovalApproveTrigger, null, () => '批准'),
      ]),
    ])

  it('在途转一枚圆环，两颗钮不再借用「按不动」那档灰', async () => {
    await mount(() => [
      APPROVAL({}),
      APPROVAL({ busy: true }),
      APPROVAL({ scopes: [{ value: 'write', required: true }] }),
    ])
    // 底色走 micro 档过渡，中途读到的是插值
    await settled()

    const live = part('approval', 'approve-trigger', 0)
    const busy = part('approval', 'approve-trigger', 1)
    const gated = part('approval', 'approve-trigger', 2)

    // 两种情形在 aria 上是同一位，光看它分不出该等还是该去补勾
    expect(busy.getAttribute('aria-disabled')).toBe('true')
    expect(gated.getAttribute('aria-disabled')).toBe('true')

    // 在途保持能按时的底色，只有闸门没过才置灰
    expect(styleOf(busy, 'background-color')).toBe(styleOf(live, 'background-color'))
    expect(styleOf(gated, 'background-color')).not.toBe(styleOf(live, 'background-color'))

    // 圆环只在在途那一格转，且真占了一格盒子
    const busyRow = part('approval', 'footer', 1)
    expect(beforeOf(busyRow, 'animation-name')).toBe('xh-approval-rotate')
    expect(beforeOf(busyRow, 'animation-iteration-count')).toBe('infinite')
    expect(Number.parseFloat(beforeOf(busyRow, 'width'))).toBeGreaterThan(0)
    expect(beforeOf(part('approval', 'footer', 0), 'animation-name')).toBe('none')

    // 指针同样分档，只是它在触屏上不存在，所以不能是唯一通道
    expect(styleOf(busy, 'cursor')).toBe('progress')
    expect(styleOf(part('approval', 'deny-trigger', 1), 'cursor')).toBe('progress')
    expect(styleOf(gated, 'cursor')).toBe('not-allowed')
  })

  it('转圈时长认使用者槽', async () => {
    setSlot('--xh-approval-loading-duration', '3s')
    await mount(() => APPROVAL({ busy: true }))
    expect(beforeOf(part('approval', 'footer'), 'animation-duration')).toBe('3s')
  })
})

// —— 只读：按不动的开关此前与按得动的一模一样 ——

describe('开关的只读观感', () => {
  it('只读：不摆手型、选中档换中性底、滑块收掉浮起的投影', async () => {
    await mount(() => [
      h(XhSwitch, { defaultChecked: true }),
      h(XhSwitch, { defaultChecked: true, readOnly: true }),
    ])
    const live = part('switch', 'root', 0)
    const readOnly = part('switch', 'root', 1)
    expect(readOnly.hasAttribute('data-readonly')).toBe(true)

    expect(styleOf(live, 'cursor')).toBe('pointer')
    expect(styleOf(readOnly, 'cursor')).toBe('default')
    expect(styleOf(readOnly, 'background-color')).not.toBe(styleOf(live, 'background-color'))
    expect(styleOf(part('switch', 'thumb', 1), 'box-shadow')).toBe('none')
    expect(styleOf(part('switch', 'thumb', 0), 'box-shadow')).not.toBe('none')
    // 只读不是禁用：不压透明度，值仍要读得清
    expect(styleOf(readOnly, 'opacity')).toBe('1')
  })

  it('只读那两档都留了使用者槽', async () => {
    setSlot('--xh-switch-bg-checked-readonly', RED)
    setSlot('--xh-switch-thumb-shadow-readonly', `0 0 0 2px ${LIME}`)
    await mount(() => h(XhSwitch, { defaultChecked: true, readOnly: true }))
    expect(styleOf(part('switch', 'root'), 'background-color')).toBe(RED)
    expect(styleOf(part('switch', 'thumb'), 'box-shadow')).toContain(LIME)
  })
})

// —— 轻提示的严重度：此前只有色相一条通道 ——

describe('轻提示的严重度字形', () => {
  const TOAST = (type: string): unknown =>
    h(XhToastRoot, { type: type as never, duration: 0 }, () => [h(XhToastTitle, null, () => '一句话')])

  it('四档各画一枚不同的字形，行首那一格真占了指示符那么大', async () => {
    const marks: string[] = []
    for (const type of ['info', 'success', 'warning', 'error']) {
      await mount(() => TOAST(type))
      const root = part('toast', 'root')
      expect(root.getAttribute('data-severity')).toBe(type)
      const mask = beforeOf(root, 'mask-image')
      expect(mask).not.toBe('none')
      marks.push(mask)
      expect(Number.parseFloat(beforeOf(root, 'width'))).toBeGreaterThan(0)
    }
    expect(new Set(marks).size).toBe(4)
  })

  it('loading 那一档转起来，且颜色不随语气跑到红绿上', async () => {
    await mount(() => TOAST('loading'))
    const root = part('toast', 'root')
    expect(root.getAttribute('data-tone')).toBe('neutral')
    expect(beforeOf(root, 'animation-name')).toBe('xh-toast-spin')
    expect(beforeOf(root, 'animation-iteration-count')).toBe('infinite')
  })

  it('字形的颜色留了使用者槽', async () => {
    setSlot('--xh-toast-icon-fg', RED)
    await mount(() => TOAST('success'))
    expect(beforeOf(part('toast', 'root'), 'background-color')).toBe(RED)
  })
})
