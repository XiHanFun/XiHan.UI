// 三档状态的皮肤取值：「当前项」的槽名、「在途」的转圈、「只读」的观感，以及轻提示的严重度字形。
//
// 判据全是级联算出来的取值与伪元素上的取值，只有真实浏览器算得出来：
// jsdom 不解析样式表里的 var() 与继承，也不给伪元素，getComputedStyle 恒是空串。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
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
  XhClipboardCopyTrigger,
  XhClipboardRoot,
  XhDownloadTrigger,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNotificationItem,
  XhNotificationItemContent,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTrigger,
  XhSwitch,
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
const afterOf = (el: HTMLElement, prop: string): string => getComputedStyle(el, '::after').getPropertyValue(prop)

/** 在宿主里把令牌解析成与 getComputedStyle 同格式的颜色值。 */
function resolveColor(token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  host!.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

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
  it('下载钮取数在途：环压在钮正中、等一个 micro 才淡入，文字同刻淡出留位，外框不位移', async () => {
    // 永不落定的取数函数把状态钉在 preparing 上
    await mount(() => h(XhDownloadTrigger, { data: () => new Promise<string>(() => {}) }, () => '导出'))
    const root = part('download-trigger', 'root')
    const width = root.getBoundingClientRect().width
    const foreground = styleOf(root, 'color')
    expect(root.getAttribute('data-xh-loading-ring')).toBe('overlay')
    // 不在途时环停着、看不见
    expect(beforeOf(root, 'animation-play-state')).toBe('paused')
    expect(beforeOf(root, 'opacity')).toBe('0')

    await userEvent.click(root)
    await nextTick()
    expect(root.getAttribute('data-state')).toBe('preparing')
    expect(styleOf(root, 'cursor')).toBe('progress')
    expect(root.getBoundingClientRect().width).toBeCloseTo(width, 4)
    expect(beforeOf(root, 'animation-name')).toBe('xh-spin')
    expect(beforeOf(root, 'animation-play-state')).toBe('running')
    expect(beforeOf(root, 'transition-delay')).toBe('0.12s')
    expect(Number.parseFloat(beforeOf(root, 'width'))).toBeGreaterThan(0)
    expect(beforeOf(root, 'border-top-color')).toBe(foreground)
    await expect.poll(() => Number.parseFloat(beforeOf(root, 'opacity'))).toBeGreaterThan(0.9)
    await expect.poll(() => styleOf(root, 'color')).toBe('rgba(0, 0, 0, 0)')
    expect(root.getBoundingClientRect().width).toBeCloseTo(width, 4)
  })

  it('下载钮的转圈时长认使用者槽', async () => {
    await mount(() => h(XhDownloadTrigger, { data: () => new Promise<string>(() => {}) }, () => '导出'))
    setSlot('--xh-download-trigger-loading-duration', '3s')
    const root = part('download-trigger', 'root')
    await userEvent.click(root)
    await nextTick()
    expect(beforeOf(root, 'animation-duration').split(',')[0]!.trim()).toBe('3s')
  })

  it('复制钮写入在途：环压在钮正中、等一个 micro 才淡入，文字同刻淡出留位；退出不等', async () => {
    await mount(() => h(XhClipboardRoot, { value: 'xh' }, () => [
      h(XhClipboardControl, null, () => [h(XhClipboardCopyTrigger, null, () => '复制')]),
    ]))
    const trigger = part('clipboard', 'copy-trigger')
    const width = trigger.getBoundingClientRect().width
    const foreground = styleOf(trigger, 'color')
    expect(trigger.getAttribute('data-xh-loading-ring')).toBe('overlay')
    // 写剪贴板要真实权限，headless 下拿不到；这一档皮肤只认属性，直接把连接层在途时发的几位摆上去
    const busy = (on: boolean): void => {
      part('clipboard', 'root').setAttribute('data-state', on ? 'copying' : 'idle')
      trigger.setAttribute('data-state', on ? 'copying' : 'idle')
      for (const name of ['aria-busy', 'aria-disabled'])
        on ? trigger.setAttribute(name, 'true') : trigger.removeAttribute(name)
      trigger.toggleAttribute('data-loading', on)
    }
    busy(true)
    expect(styleOf(trigger, 'cursor')).toBe('progress')
    expect(beforeOf(trigger, 'animation-name')).toBe('xh-spin')
    expect(beforeOf(trigger, 'transition-delay')).toBe('0.12s')
    expect(beforeOf(trigger, 'border-top-color')).toBe(foreground)
    await expect.poll(() => Number.parseFloat(beforeOf(trigger, 'opacity'))).toBeGreaterThan(0.9)
    await expect.poll(() => styleOf(trigger, 'color')).toBe('rgba(0, 0, 0, 0)')
    expect(trigger.getBoundingClientRect().width).toBeCloseTo(width, 4)
    busy(false)
    expect(beforeOf(trigger, 'transition-delay')).toBe('0s')
    await expect.poll(() => styleOf(trigger, 'color')).toBe(foreground)
    await expect.poll(() => beforeOf(trigger, 'opacity')).toBe('0')
  })

  it('确认钮挂起：环压在钮正中、等一个 micro 才淡入，确认文案同刻淡出留位；落定不等', async () => {
    await mount(() => h(XhPopconfirmRoot, { open: true }, () => [
      h(XhPopconfirmTrigger, null, () => '删'),
      h(XhPopconfirmPositioner, null, () => [
        h(XhPopconfirmContent, null, () => [h(XhPopconfirmConfirmTrigger, null, () => '确认')]),
      ]),
    ]))
    // 浮层进场带一段缩放，量宽要等它播完
    await settled()
    const trigger = part('popconfirm', 'confirm-trigger')
    const width = trigger.getBoundingClientRect().width
    const foreground = styleOf(trigger, 'color')
    expect(trigger.getAttribute('data-xh-loading-ring')).toBe('overlay')
    // 挂起由宿主返回的 Promise 决定；这一档皮肤只认属性，直接把连接层挂起时发的几位摆上去
    const pending = (on: boolean): void => {
      for (const name of ['aria-busy', 'aria-disabled'])
        on ? trigger.setAttribute(name, 'true') : trigger.removeAttribute(name)
      trigger.toggleAttribute('data-loading', on)
    }
    pending(true)
    expect(beforeOf(trigger, 'animation-name')).toBe('xh-spin')
    expect(beforeOf(trigger, 'position')).toBe('absolute')
    expect(beforeOf(trigger, 'transition-delay')).toBe('0.12s')
    expect(beforeOf(trigger, 'border-top-color')).toBe(foreground)
    await expect.poll(() => Number.parseFloat(beforeOf(trigger, 'opacity'))).toBeGreaterThan(0.9)
    await expect.poll(() => styleOf(trigger, 'color')).toBe('rgba(0, 0, 0, 0)')
    expect(trigger.getBoundingClientRect().width).toBeCloseTo(width, 4)
    pending(false)
    expect(beforeOf(trigger, 'transition-delay')).toBe('0s')
    await expect.poll(() => styleOf(trigger, 'color')).toBe(foreground)
  })

  it('复制钮的转圈时长认使用者槽', async () => {
    setSlot('--xh-clipboard-loading-duration', '3s')
    await mount(() => h(XhClipboardRoot, { value: 'xh' }, () => [
      h(XhClipboardControl, null, () => [h(XhClipboardCopyTrigger, null, () => '复制')]),
    ]))
    expect(beforeOf(part('clipboard', 'copy-trigger'), 'animation-duration')).toBe('3s')
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
      APPROVAL({ loading: true }),
      APPROVAL({ scopes: [{ value: 'write', required: true }] }),
    ])
    // 底色走 micro 档过渡，中途读到的是插值
    await settled()

    const live = part('approval', 'approve-trigger', 0)
    const loading = part('approval', 'approve-trigger', 1)
    const gated = part('approval', 'approve-trigger', 2)

    // 两种情形在 aria 上是同一位，光看它分不出该等还是该去补勾
    expect(loading.getAttribute('aria-disabled')).toBe('true')
    expect(gated.getAttribute('aria-disabled')).toBe('true')

    // 在途保持能按时的底色，只有闸门没过才置灰
    expect(styleOf(loading, 'background-color')).toBe(styleOf(live, 'background-color'))
    expect(styleOf(gated, 'background-color')).not.toBe(styleOf(live, 'background-color'))

    // 环走加载环配方：只在在途那一行转、露面，且真占了一格盒子；不在途的那一行停着、看不见
    const busyRow = part('approval', 'footer', 1)
    const idleRow = part('approval', 'footer', 0)
    expect(busyRow.hasAttribute('data-xh-loading-ring')).toBe(true)
    expect(beforeOf(busyRow, 'animation-name')).toBe('xh-spin')
    expect(beforeOf(busyRow, 'animation-iteration-count')).toBe('infinite')
    expect(beforeOf(busyRow, 'animation-play-state')).toBe('running')
    expect(beforeOf(busyRow, 'border-top-width')).toBe(beforeOf(busyRow, 'border-right-width'))
    expect(beforeOf(busyRow, 'opacity')).toBe('1')
    expect(Number.parseFloat(beforeOf(busyRow, 'width'))).toBeGreaterThan(0)
    expect(beforeOf(idleRow, 'animation-play-state')).toBe('paused')
    expect(beforeOf(idleRow, 'opacity')).toBe('0')

    // 指针同样分档，只是它在触屏上不存在，所以不能是唯一通道
    expect(styleOf(loading, 'cursor')).toBe('progress')
    expect(styleOf(part('approval', 'deny-trigger', 1), 'cursor')).toBe('progress')
    expect(styleOf(gated, 'cursor')).toBe('not-allowed')
  })

  it('转圈时长认使用者槽', async () => {
    setSlot('--xh-approval-loading-duration', '3s')
    await mount(() => APPROVAL({ loading: true }))
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

// —— 轻提示预设的语气：色相之外还有字形这条通道 ——

describe('轻提示预设的语气字形', () => {
  const TOAST = (props: Record<string, unknown>): unknown =>
    h(XhNotificationItem, { ...props, preset: 'toast', duration: 0 }, () => [
      h(XhNotificationItemContent, null, () => h(XhNotificationItemTitle, null, () => '一句话')),
    ])

  it('四档各画一枚不同的字形，行首那一格真占了指示符那么大', async () => {
    const marks: string[] = []
    for (const tone of ['info', 'success', 'warning', 'danger']) {
      await mount(() => TOAST({ tone }))
      const root = part('notification', 'item')
      expect(root.getAttribute('data-tone')).toBe(tone)
      const mask = afterOf(root, 'mask-image')
      expect(mask).not.toBe('none')
      marks.push(mask)
      expect(afterOf(root, 'opacity')).toBe('1')
      expect(Number.parseFloat(beforeOf(root, 'width'))).toBeGreaterThan(0)
      expect(afterOf(root, 'width')).toBe(beforeOf(root, 'width'))
    }
    expect(new Set(marks).size).toBe(4)
  })

  it('加载中画的是与 Spinner 环档同一副加载环：一整圈轨道色、起始边语气色，转起来；语气位不受它影响', async () => {
    await mount(() => TOAST({ loading: true, tone: 'success' }))
    const root = part('notification', 'item')
    expect(root.getAttribute('data-tone')).toBe('success')
    expect(root.hasAttribute('data-loading')).toBe(true)
    // 转的是环，不是遮罩出来的箭头字形
    expect(beforeOf(root, 'mask-image')).toBe('none')
    expect(beforeOf(root, 'border-top-style')).toBe('solid')
    expect(beforeOf(root, 'border-top-left-radius')).toBe('50%')
    expect(beforeOf(root, 'border-right-color')).toBe(resolveColor('--xh-border-default'))
    // 起始边与语气字形同一个颜色
    expect(beforeOf(root, 'border-top-color')).toBe(afterOf(root, 'background-color'))
    expect(beforeOf(root, 'border-top-color')).not.toBe(beforeOf(root, 'border-right-color'))
    expect(beforeOf(root, 'animation-name')).toBe('xh-spin')
    expect(beforeOf(root, 'animation-iteration-count')).toBe('infinite')
    expect(beforeOf(root, 'animation-play-state')).toBe('running')
    expect(beforeOf(root, 'opacity')).toBe('1')
    // 语气字形让位
    expect(afterOf(root, 'opacity')).toBe('0')
  })

  it('加载落定时环淡出、语气字形淡入，两者在同一格里交叉淡变；环停在当前角度淡出', async () => {
    let loading = true
    await mount(() => TOAST({ loading, tone: 'success' }))
    const root = part('notification', 'item')
    // 卡片在台上转过一帧：过渡要有变化之前的样式才起得来
    await new Promise(resolve => requestAnimationFrame(resolve))
    expect(beforeOf(root, 'opacity')).toBe('1')
    loading = false
    app!._instance!.proxy!.$forceUpdate()
    await expect.poll(() => root.hasAttribute('data-loading')).toBe(false)
    const fades = root.getAnimations({ subtree: true })
      .filter(a => (a as CSSTransition).transitionProperty === 'opacity')
      .map(a => (a.effect as KeyframeEffect).pseudoElement)
    expect(fades).toContain('::before')
    expect(fades).toContain('::after')
    expect(beforeOf(root, 'animation-play-state')).toBe('paused')
    await settled()
    expect(beforeOf(root, 'opacity')).toBe('0')
    expect(afterOf(root, 'opacity')).toBe('1')
  })

  it('渲染了指示符部件：兜底让位给它，它的字形按卡片上的语气换，加载中同样画环', async () => {
    const WITH_INDICATOR = (props: Record<string, unknown>): unknown =>
      h(XhNotificationItem, { ...props, preset: 'toast', duration: 0 }, () => [
        h(XhNotificationItemIndicator),
        h(XhNotificationItemContent, null, () => h(XhNotificationItemTitle, null, () => '一句话')),
      ])
    const marks: string[] = []
    for (const tone of ['info', 'success', 'warning', 'danger']) {
      await mount(() => WITH_INDICATOR({ tone }))
      expect(beforeOf(part('notification', 'item'), 'content')).toBe('none')
      expect(afterOf(part('notification', 'item'), 'content')).toBe('none')
      marks.push(afterOf(part('notification', 'item-indicator'), 'mask-image'))
    }
    expect(new Set(marks).size).toBe(4)

    await mount(() => WITH_INDICATOR({ tone: 'success', loading: true }))
    const indicator = part('notification', 'item-indicator')
    expect(beforeOf(indicator, 'animation-name')).toBe('xh-spin')
    expect(beforeOf(indicator, 'border-top-left-radius')).toBe('50%')
    expect(beforeOf(indicator, 'opacity')).toBe('1')
    expect(afterOf(indicator, 'opacity')).toBe('0')
  })

  it('减弱动效下环停下并整圈换成点线，淡入淡出照常', async () => {
    document.documentElement.dataset.motion = 'reduce'
    try {
      await mount(() => TOAST({ loading: true, tone: 'success' }))
      const root = part('notification', 'item')
      expect(beforeOf(root, 'animation-name')).toBe('none')
      expect(beforeOf(root, 'border-top-style')).toBe('dotted')
      expect(beforeOf(root, 'transition-property')).toBe('opacity')
    }
    finally {
      delete document.documentElement.dataset.motion
    }
  })

  it('字形与环的颜色留了使用者槽', async () => {
    setSlot('--xh-notification-indicator-fg', RED)
    await mount(() => TOAST({ tone: 'success' }))
    expect(afterOf(part('notification', 'item'), 'background-color')).toBe(RED)
    await mount(() => TOAST({ tone: 'success', loading: true }))
    expect(beforeOf(part('notification', 'item'), 'border-top-color')).toBe(RED)
  })
})
