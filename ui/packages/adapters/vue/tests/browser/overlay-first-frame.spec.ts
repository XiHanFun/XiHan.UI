// 浮层的首帧：挂载时已经打开的浮层（defaultOpen，或受控 open 的初值为 true）直接呈现，
// content 与带进场的遮罩、聚光框都不播进场；第一次收起照常播退场，之后每一次打开照常进场。
// 动画是否在播只有真实浏览器量得出来：jsdom 不跑 CSS 动画。
import type { App, Ref, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemText,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuTrigger,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhDrawerContent,
  XhDrawerRoot,
  XhDrawerTitle,
  XhMenuContent,
  XhMenuItem,
  XhMenuItemText,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
  XhPopconfirmContent,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTrigger,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
  XhSelectContent,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhTreeSelectContent,
  XhTreeSelectItem,
  XhTreeSelectItemText,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 开合的两种给法：受控 open 的初值，或非受控 defaultOpen。 */
interface OpenProps {
  open?: boolean
  defaultOpen?: boolean
}

interface Case {
  /** 带进场的部件：挂载即开时都不该在播动画。第一个是 content，重开后它上面该播 enter */
  parts: string[]
  enter: string
  render: (props: OpenProps) => VNode
  /** 进场不落在部件本身、而落在它的子节点上时，从部件取真正要量的那几个节点 */
  targets?: (el: HTMLElement) => Element[]
}

const FRUITS = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
]

const CASES: Record<string, Case> = {
  'popover': {
    parts: ['content'],
    enter: 'xh-overlay-pop-in',
    render: props => h(XhPopoverRoot, props, () => [
      h(XhPopoverTrigger, null, () => '打开'),
      h(XhPopoverPositioner, null, () => h(XhPopoverContent, null, () => h(XhPopoverTitle, null, () => '标题'))),
    ]),
  },
  'popconfirm': {
    parts: ['content'],
    enter: 'xh-overlay-pop-in',
    render: props => h(XhPopconfirmRoot, props, () => [
      h(XhPopconfirmTrigger, null, () => '删除'),
      h(XhPopconfirmPositioner, null, () => h(XhPopconfirmContent, null, () => '确定删除？')),
    ]),
  },
  'menu': {
    parts: ['content'],
    enter: 'xh-overlay-slide-in',
    render: props => h(XhMenuRoot, props, () => [
      h(XhMenuTrigger, null, () => '打开'),
      h(XhMenuPositioner, null, () => h(XhMenuContent, null, () => FRUITS.map(node =>
        h(XhMenuItem, { key: node.value, value: node.value }, () => h(XhMenuItemText, null, () => node.label)),
      ))),
    ]),
  },
  'context-menu': {
    parts: ['content'],
    enter: 'xh-overlay-slide-in',
    render: props => h(XhContextMenuRoot, props, () => [
      h(XhContextMenuTrigger, null, () => '右键这块区域'),
      h(XhContextMenuPositioner, null, () => h(XhContextMenuContent, null, () => FRUITS.map(node =>
        h(XhContextMenuItem, { key: node.value, value: node.value }, () => h(XhContextMenuItemText, null, () => node.label)),
      ))),
    ]),
  },
  'select': {
    parts: ['content'],
    enter: 'xh-overlay-slide-in',
    render: props => h(XhSelectRoot, props, () => [
      h(XhSelectTrigger, null, () => h(XhSelectValueText)),
      h(XhSelectPositioner, null, () => h(XhSelectContent, null, () => h(XhSelectList, null, () => FRUITS.map(node =>
        h(XhSelectItem, { key: node.value, value: node.value }, () => h(XhSelectItemText, null, () => node.label)),
      )))),
    ]),
  },
  'combobox': {
    parts: ['content'],
    enter: 'xh-overlay-slide-in',
    render: props => h(XhComboboxRoot, { ...props, collection: FRUITS }, () => [
      h(XhComboboxControl, null, () => h(XhComboboxInput)),
      h(XhComboboxPositioner, null, () => h(XhComboboxContent, null, () => FRUITS.map(node =>
        h(XhComboboxItem, { key: node.value, value: node.value }, () => h(XhComboboxItemText, null, () => node.label)),
      ))),
    ]),
  },
  'tree-select': {
    parts: ['content'],
    enter: 'xh-overlay-slide-in',
    render: props => h(XhTreeSelectRoot, { ...props, collection: FRUITS }, () => [
      h(XhTreeSelectTrigger, null, () => h(XhTreeSelectValueText)),
      h(XhTreeSelectPositioner, null, () => h(XhTreeSelectContent, null, () => h(XhTreeSelectTree, null, () => FRUITS.map(node =>
        h(XhTreeSelectItem, { key: node.value, value: node.value }, () => h(XhTreeSelectItemText, null, () => node.label)),
      )))),
    ]),
  },
  'dialog': {
    parts: ['content', 'backdrop'],
    enter: 'xh-sheet-in',
    render: props => h(XhDialogRoot, props, () => h(XhDialogContent, null, () => h(XhDialogTitle, null, () => '标题'))),
  },
  'drawer': {
    parts: ['content', 'backdrop'],
    enter: 'xh-slide-in',
    render: props => h(XhDrawerRoot, props, () => h(XhDrawerContent, null, () => h(XhDrawerTitle, null, () => '设置'))),
  },
}

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

function mount(render: () => VNode): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

function part(scope: string, name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 ${scope}/${name}`)
  return element
}

/** 节点上正在播的 CSS 动画名（不含过渡）。 */
function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

/** 部件真正要量的节点：缺省就是部件本身。 */
function probes(c: Case, scope: string, name: string): Element[] {
  const el = part(scope, name)
  return c.targets ? c.targets(el) : [el]
}

/** 等节点上的 CSS 动画全部播完。 */
async function finished(els: Element[]): Promise<void> {
  await Promise.all(els.flatMap(el => el.getAnimations()).map(animation => animation.finished.catch(() => undefined)))
}

describe.each(Object.entries(CASES))('%s 挂载即开', (scope, c) => {
  it('受控 open 初值为 true：带进场的部件都不播动画', async () => {
    mount(() => c.render({ open: true }))
    await settle()
    for (const name of c.parts) {
      for (const el of probes(c, scope, name))
        expect(running(el), `${scope}/${name}`).toEqual([])
    }
  })

  it('defaultOpen：带进场的部件都不播动画', async () => {
    mount(() => c.render({ defaultOpen: true }))
    await settle()
    for (const name of c.parts) {
      for (const el of probes(c, scope, name))
        expect(running(el), `${scope}/${name}`).toEqual([])
    }
  })

  it('第一次收起照常播退场，再打开照常播进场', async () => {
    const open: Ref<boolean> = ref(true)
    mount(() => c.render({ open: open.value }))
    await settle()
    const first = probes(c, scope, c.parts[0]!)

    open.value = false
    await settle()
    expect(first.flatMap(running).length, '收起播退场').toBeGreaterThan(0)
    await finished(first)
    await settle()

    open.value = true
    await settle()
    expect(probes(c, scope, c.parts[0]!).flatMap(running)).toContain(c.enter)
  })
})
