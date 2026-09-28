// 浮层的首帧：挂载时已经打开的浮层（defaultOpen，或受控 open 的初值为 true）直接呈现，
// content 与带进场的遮罩、聚光框都不播进场；第一次收起照常播退场，之后每一次打开照常进场。
// 动画是否在播只有真实浏览器量得出来：jsdom 不跑 CSS 动画。
import type { App, Ref, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderItem,
  XhCascaderItemText,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerHueSlider,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerTrigger,
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
  XhDatePickerConfirmTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDateRangePickerConfirmTrigger,
  XhDateRangePickerContent,
  XhDateRangePickerControl,
  XhDateRangePickerPositioner,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhDrawerContent,
  XhDrawerRoot,
  XhDrawerTitle,
  XhFloatingPanelContent,
  XhFloatingPanelPositioner,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTitle,
  XhHoverCardTrigger,
  XhImageViewerContent,
  XhImageViewerRoot,
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
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimeRangePickerColumn,
  XhTimeRangePickerColumnGroup,
  XhTimeRangePickerContent,
  XhTimeRangePickerControl,
  XhTimeRangePickerItem,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerRangeSeparator,
  XhTimeRangePickerRoot,
  XhTimeRangePickerSegment,
  XhTimeRangePickerSegmentGroup,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
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
  'hover-card': {
    parts: ['content'],
    enter: 'xh-overlay-pop-in',
    render: props => h(XhHoverCardRoot, props, () => [
      h(XhHoverCardTrigger, null, () => '资料'),
      h(XhHoverCardPositioner, null, () => h(XhHoverCardContent, null, () => h(XhHoverCardTitle, null, () => '标题'))),
    ]),
  },
  'tooltip': {
    parts: ['content'],
    enter: 'xh-overlay-slide-in',
    render: props => h(XhTooltipRoot, props, () => [
      h(XhTooltipTrigger, null, () => '说明'),
      h(XhTooltipPositioner, null, () => h(XhTooltipContent, null, () => '提示内容')),
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
  'cascader': {
    parts: ['content'],
    enter: 'xh-overlay-slide-in',
    render: props => h(XhCascaderRoot, { ...props, collection: FRUITS }, () => [
      h(XhCascaderTrigger, null, () => h(XhCascaderValueText)),
      h(XhCascaderPositioner, null, () => h(XhCascaderContent, null, () => h(XhCascaderColumn, { level: 0 }, () => FRUITS.map(node =>
        h(XhCascaderItem, { key: node.value, value: node.value }, () => h(XhCascaderItemText, null, () => node.label)),
      )))),
    ]),
  },
  'date-picker': {
    parts: ['content'],
    enter: 'xh-overlay-slide-in',
    render: props => h(XhDatePickerRoot, props, () => [
      h(XhDatePickerControl, null, () => h(XhDatePickerSegmentGroup, null, () => h(XhDatePickerSegment, { index: 0 }))),
      h(XhDatePickerPositioner, null, () => h(XhDatePickerContent, null, () => h(XhDatePickerConfirmTrigger, null, () => '确定'))),
    ]),
  },
  'date-range-picker': {
    parts: ['content'],
    enter: 'xh-overlay-slide-in',
    render: props => h(XhDateRangePickerRoot, props, () => [
      h(XhDateRangePickerControl, null, () => [
        h(XhDateRangePickerSegmentGroup, { index: 0 }, () => h(XhDateRangePickerSegment, { index: 0 })),
        h(XhDateRangePickerRangeSeparator),
        h(XhDateRangePickerSegmentGroup, { index: 1 }, () => h(XhDateRangePickerSegment, { index: 0 })),
      ]),
      h(XhDateRangePickerPositioner, null, () => h(XhDateRangePickerContent, null, () => h(XhDateRangePickerConfirmTrigger, null, () => '确定'))),
    ]),
  },
  'time-picker': {
    parts: ['content'],
    enter: 'xh-overlay-slide-in',
    render: props => h(XhTimePickerRoot, { ...props, defaultValue: '09:30' }, () => [
      h(XhTimePickerControl, null, () => h(XhTimePickerSegment, { segment: 'hour' })),
      h(XhTimePickerPositioner, null, () => h(XhTimePickerContent, null, () => h(XhTimePickerColumn, { unit: 'hour' }, () => [
        h(XhTimePickerItem, { value: '09' }),
        h(XhTimePickerItem, { value: '10' }),
      ]))),
    ]),
  },
  'time-range-picker': {
    parts: ['content'],
    enter: 'xh-overlay-slide-in',
    render: props => h(XhTimeRangePickerRoot, props, () => [
      h(XhTimeRangePickerControl, null, () => [
        h(XhTimeRangePickerSegmentGroup, { index: 0 }, () => h(XhTimeRangePickerSegment, { segment: 'hour' })),
        h(XhTimeRangePickerRangeSeparator),
        h(XhTimeRangePickerSegmentGroup, { index: 1 }, () => h(XhTimeRangePickerSegment, { segment: 'hour' })),
      ]),
      h(XhTimeRangePickerPositioner, null, () => h(XhTimeRangePickerContent, null, () => ([0, 1] as const).map(index =>
        h(XhTimeRangePickerColumnGroup, { key: index, index }, () => h(XhTimeRangePickerColumn, { unit: 'hour' }, () => [
          h(XhTimeRangePickerItem, { value: '09' }),
          h(XhTimeRangePickerItem, { value: '10' }),
        ])),
      ))),
    ]),
  },
  'color-picker': {
    parts: ['content'],
    enter: 'xh-overlay-slide-in',
    render: props => h(XhColorPickerRoot, { ...props, defaultValue: '#ff0000' }, () => [
      h(XhColorPickerControl, null, () => h(XhColorPickerTrigger, null, () => '选择颜色')),
      h(XhColorPickerPositioner, null, () => h(XhColorPickerContent, null, () => h(XhColorPickerHueSlider))),
    ]),
  },
  'image-viewer': {
    parts: ['content', 'backdrop'],
    enter: 'xh-fade-in',
    render: props => h(XhImageViewerRoot, { ...props, collection: [{ src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' }] }, () => h(XhImageViewerContent)),
  },
  'floating-panel': {
    parts: ['positioner'],
    enter: 'xh-pop-in',
    render: props => h(XhFloatingPanelRoot, props, () => h(XhFloatingPanelPositioner, null, () => h(XhFloatingPanelContent, null, () => h(XhFloatingPanelTitle, null, () => '面板')))),
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
