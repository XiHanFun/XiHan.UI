// 同一个页面里 Vue 与 Web Components 的浮层共用一个层级栈：谁后打开谁在上面，焦点与 Esc 只作用在最上层；
// 对话框打开之后再开另一端的 popover、菜单与提示，它们压在对话框之上。
import type { App } from 'vue'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { defineXhElements } from '../../../web-components/src/define'
import {
  provideXhConfig,
  XhDialogBody,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhMenuRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

beforeAll(() => defineXhElements())

const apps: App[] = []
let host: HTMLElement | null = null

afterEach(() => {
  for (const app of apps.splice(0)) app.unmount()
  host?.remove()
  host = null
})

async function settle(): Promise<void> {
  await nextTick()
  for (let i = 0; i < 4; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

type XhElement = HTMLElement & { open?: boolean, updateComplete: Promise<unknown> }

/** 浮层内容所在定位层的 z-index。 */
function layerOf(content: Element): number {
  const positioner = content.closest('[data-part="positioner"]') ?? content
  return Number(getComputedStyle(positioner).zIndex)
}

/** 元素中心那一点命中的是不是它自己（或它里面的节点）。 */
function isOnTop(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
  return hit !== null && element.contains(hit)
}

function mountVue(target: Element, render: () => ReturnType<typeof h>): void {
  const app = createApp({ render })
  app.mount(target)
  apps.push(app)
}

const WC_DIALOG = `<xh-dialog data-test="wc-dialog">
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner"><div data-xh-part="content">
    <h2 data-xh-part="title">内层</h2>
    <button type="button" data-test="wc-confirm">确定</button>
    <div data-test="vue-mount"></div>
  </div></div>
</xh-dialog>`

const WC_OVERLAYS = `
  <xh-popover placement="bottom-start" data-test="wc-popover">
    <button data-xh-part="trigger">浮层</button>
    <div data-xh-part="positioner"><div data-xh-part="content"><button type="button" data-test="wc-popover-target">浮层里的按钮</button></div></div>
  </xh-popover>
  <xh-menu data-test="wc-menu">
    <button data-xh-part="trigger">操作</button>
    <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="item" value="new" data-test="wc-menu-target">新建文件</div></div></div>
  </xh-menu>
  <xh-tooltip data-test="wc-tooltip">
    <button data-xh-part="trigger">保存</button>
    <div data-xh-part="positioner"><div data-xh-part="content" data-test="wc-tooltip-target">写入草稿箱</div></div>
  </xh-tooltip>`

function vueDialog(body: () => ReturnType<typeof h>): ReturnType<typeof h> {
  return h(XhDialogRoot, { defaultOpen: true }, () => h(XhDialogContent, { 'data-test': 'vue-content' }, () => [
    h(XhDialogTitle, null, () => '外层'),
    h(XhDialogBody, null, body),
  ]))
}

function vueContent(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-test="vue-content"]')!
}

function wcContent(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="dialog"][data-part="content"]:has([data-test="wc-confirm"])')!
}

/** 打开一个 WC 对话框：受控写法，作者按 open-change 回写 open。 */
async function openWcDialog(dialog: XhElement): Promise<void> {
  await dialog.updateComplete
  dialog.addEventListener('open-change', (event) => {
    dialog.open = (event as CustomEvent<{ open: boolean }>).detail.open
  })
  dialog.open = true
  await dialog.updateComplete
  await settle()
}

async function mountWcDialog(): Promise<XhElement> {
  host = document.createElement('div')
  host.innerHTML = WC_DIALOG
  document.body.append(host)
  const dialog = host.querySelector<XhElement>('[data-test="wc-dialog"]')!
  await openWcDialog(dialog)
  return dialog
}

describe('vue 对话框里开 Web Components 对话框', () => {
  it('后开的 WC 对话框在上面，焦点在它里面，Esc 只关它', async () => {
    host = document.createElement('div')
    document.body.append(host)
    mountVue(host, () => vueDialog(() => h('div', { innerHTML: WC_DIALOG })))
    await settle()
    const inner = document.querySelector<XhElement>('[data-test="wc-dialog"]')!
    await openWcDialog(inner)

    expect(layerOf(wcContent())).toBeGreaterThan(layerOf(vueContent()))
    expect(isOnTop(document.querySelector('[data-test="wc-confirm"]')!)).toBe(true)
    expect(wcContent().contains(document.activeElement)).toBe(true)
    // 外层的焦点域不抢：Tab 两下仍在内层
    await userEvent.tab()
    await userEvent.tab()
    expect(wcContent().contains(document.activeElement)).toBe(true)

    await userEvent.keyboard('{Escape}')
    await settle()
    expect(inner.open).toBe(false)
    expect(vueContent().getAttribute('data-state')).toBe('open')
  })
})

describe('vue 那份配置锁着布局里的滚动容器，WC 对话框锁页面', () => {
  /** 应用经 provideXhConfig 给了 scrollRoot，WC 元素读的全局配置没给：外层锁滚动容器、里层锁页面。 */
  async function mountWithScrollRoot(): Promise<{ inner: XhElement, trigger: HTMLElement }> {
    host = document.createElement('div')
    host.innerHTML = '<div data-test="scroller" style="block-size: 300px; overflow: auto"><div style="block-size: 2000px"></div></div>'
    document.body.append(host)
    const scroller = host.querySelector<HTMLElement>('[data-test="scroller"]')!
    const mount = document.createElement('div')
    host.append(mount)
    const Shell = defineComponent({
      setup() {
        provideXhConfig({ scrollRoot: () => scroller })
        return () => vueDialog(() => h('div', {
          innerHTML: WC_DIALOG.replace('<div data-xh-part="backdrop">', '<button type="button" data-xh-part="trigger" data-test="wc-trigger">设置</button><div data-xh-part="backdrop">'),
        }))
      },
    })
    const app = createApp(Shell)
    app.mount(mount)
    apps.push(app)
    await settle()
    const inner = document.querySelector<XhElement>('[data-test="wc-dialog"]')!
    await inner.updateComplete
    return { inner, trigger: document.querySelector<HTMLElement>('[data-test="wc-trigger"]')! }
  }

  it('经 open 打开：WC 对话框在上面、焦点在里面，Esc 只关它', async () => {
    const { inner } = await mountWithScrollRoot()
    await openWcDialog(inner)
    expect(layerOf(wcContent())).toBeGreaterThan(layerOf(vueContent()))
    expect(isOnTop(document.querySelector('[data-test="wc-confirm"]')!)).toBe(true)
    expect(wcContent().contains(document.activeElement)).toBe(true)
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(inner.open).toBe(false)
    expect(vueContent().getAttribute('data-state')).toBe('open')
  })

  it('点触发钮打开：打开后一直开着，不被外层收回', async () => {
    const { inner, trigger } = await mountWithScrollRoot()
    await userEvent.click(trigger)
    await settle()
    await new Promise(resolve => setTimeout(resolve, 300))
    expect(wcContent().getAttribute('data-state')).toBe('open')
    expect(isOnTop(document.querySelector('[data-test="wc-confirm"]')!)).toBe(true)
    expect(inner.open).not.toBe(false)
  })
})

describe('对话框与里面缺省展开的浮层同一刻打开', () => {
  it('vue 对话框里缺省展开的 Vue popover：浮层先登记也排在上面，Esc 先关浮层', async () => {
    host = document.createElement('div')
    document.body.append(host)
    mountVue(host, () => vueDialog(() => h(XhPopoverRoot, { defaultOpen: true }, () => [
      h(XhPopoverTrigger, null, () => '浮层'),
      h(XhPopoverPositioner, null, () => h(XhPopoverContent, { 'data-test': 'vue-popover' }, () => h('button', { 'type': 'button', 'data-test': 'vue-popover-target' }, '浮层里的按钮'))),
    ])))
    await settle()
    const popover = document.querySelector<HTMLElement>('[data-test="vue-popover"]')!
    expect(layerOf(popover)).toBeGreaterThan(layerOf(vueContent()))
    expect(isOnTop(document.querySelector('[data-test="vue-popover-target"]')!)).toBe(true)

    popover.querySelector<HTMLElement>('[data-test="vue-popover-target"]')!.focus()
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(document.querySelector('[data-test="vue-popover"]')?.getAttribute('data-state') ?? 'closed').not.toBe('open')
    expect(vueContent().getAttribute('data-state')).toBe('open')
  })

  it('vue 对话框里缺省展开的 WC popover：浮层先登记也排在上面，Esc 先关浮层', async () => {
    host = document.createElement('div')
    document.body.append(host)
    mountVue(host, () => vueDialog(() => h('div', {
      innerHTML: `<xh-popover default-open placement="bottom-start" data-test="wc-popover">
        <button data-xh-part="trigger">浮层</button>
        <div data-xh-part="positioner"><div data-xh-part="content"><button type="button" data-test="wc-popover-target">浮层里的按钮</button></div></div>
      </xh-popover>`,
    })))
    await settle()
    const overlay = document.querySelector<XhElement>('[data-test="wc-popover"]')!
    await overlay.updateComplete
    await settle()
    const target = document.querySelector<HTMLElement>('[data-test="wc-popover-target"]')!
    expect(layerOf(target.closest('[data-part="content"]')!)).toBeGreaterThan(layerOf(vueContent()))
    expect(isOnTop(target)).toBe(true)

    target.focus()
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(target.closest('[data-part="content"]')?.getAttribute('data-state')).not.toBe('open')
    expect(vueContent().getAttribute('data-state')).toBe('open')
  })
})

describe('web Components 对话框里开 Vue 对话框', () => {
  it('后开的 Vue 对话框在上面，焦点在它里面，Esc 只关它', async () => {
    const outer = await mountWcDialog()
    mountVue(document.querySelector('[data-test="vue-mount"]')!, () => vueDialog(() => h('button', { 'type': 'button', 'data-test': 'vue-confirm' }, '确定')))
    await settle()

    expect(layerOf(vueContent())).toBeGreaterThan(layerOf(wcContent()))
    expect(isOnTop(document.querySelector('[data-test="vue-confirm"]')!)).toBe(true)
    expect(vueContent().contains(document.activeElement)).toBe(true)
    await userEvent.tab()
    await userEvent.tab()
    expect(vueContent().contains(document.activeElement)).toBe(true)

    await userEvent.keyboard('{Escape}')
    await settle()
    expect(document.querySelector('[data-test="vue-content"]')?.getAttribute('data-state') ?? 'closed').not.toBe('open')
    expect(outer.open).toBe(true)
  })
})

describe('对话框打开之后再开的非模态浮层压在对话框之上', () => {
  it('vue 对话框里逐个打开 WC popover、菜单与提示', async () => {
    host = document.createElement('div')
    document.body.append(host)
    mountVue(host, () => vueDialog(() => h('div', { innerHTML: WC_OVERLAYS })))
    await settle()
    const dialogLayer = layerOf(vueContent())
    for (const kind of ['popover', 'menu', 'tooltip']) {
      const overlay = document.querySelector<XhElement>(`[data-test="wc-${kind}"]`)!
      await overlay.updateComplete
      overlay.open = true
      await overlay.updateComplete
      await settle()
      const target = document.querySelector<HTMLElement>(`[data-test="wc-${kind}-target"]`)!
      expect(layerOf(target.closest('[data-part="content"]') ?? target), kind).toBeGreaterThan(dialogLayer)
      expect(isOnTop(target), kind).toBe(true)
      overlay.open = false
      await overlay.updateComplete
      await settle()
    }
  })

  it('wC 对话框里逐个打开 Vue popover、菜单与提示', async () => {
    await mountWcDialog()
    const which = ref<'popover' | 'menu' | 'tooltip' | null>(null)
    mountVue(document.querySelector('[data-test="vue-mount"]')!, () => h('div', [
      h(XhPopoverRoot, { open: which.value === 'popover' }, () => [
        h(XhPopoverTrigger, null, () => '浮层'),
        h(XhPopoverPositioner, null, () => h(XhPopoverContent, null, () => h('button', { 'type': 'button', 'data-test': 'vue-popover-target' }, '浮层里的按钮'))),
      ]),
      h(XhMenuRoot, { open: which.value === 'menu', collection: [{ value: 'new', label: '新建文件' }] }),
      h(XhTooltipRoot, { open: which.value === 'tooltip' }, () => [
        h(XhTooltipTrigger, null, () => '保存'),
        h(XhTooltipPositioner, null, () => h(XhTooltipContent, { 'data-test': 'vue-tooltip-target' }, () => '写入草稿箱')),
      ]),
    ]))
    await settle()
    const dialogLayer = layerOf(wcContent())
    for (const kind of ['popover', 'menu', 'tooltip'] as const) {
      which.value = kind
      await settle()
      const target = kind === 'menu'
        ? document.querySelector<HTMLElement>('[data-scope="menu"][data-part="item"]')!
        : document.querySelector<HTMLElement>(`[data-test="vue-${kind}-target"]`)!
      expect(layerOf(target.closest('[data-part="content"]') ?? target), kind).toBeGreaterThan(dialogLayer)
      expect(isOnTop(target), kind).toBe(true)
      which.value = null
      await settle()
    }
  })
})
