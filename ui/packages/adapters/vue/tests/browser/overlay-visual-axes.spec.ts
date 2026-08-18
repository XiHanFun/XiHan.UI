// 浮层被搬去 portal 落点之后，视觉轴还落不落得到浮层里的部件上。
// 只有真实浏览器算得出来：jsdom 不解析样式表里的 var() 与继承，getComputedStyle 恒是空串。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderItem,
  XhCascaderItemIndicator,
  XhCascaderItemText,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemIndicator,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuTrigger,
  XhDatePickerConfirmTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerInput,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhMentionContent,
  XhMentionInput,
  XhMentionItem,
  XhMentionItemText,
  XhMentionPositioner,
  XhMentionRoot,
  XhPopselectContent,
  XhPopselectItem,
  XhPopselectItemIndicator,
  XhPopselectItemText,
  XhPopselectPositioner,
  XhPopselectRoot,
  XhPopselectTrigger,
  XhSelectContent,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerInput,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTreeSelectContent,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from '../../src'
// 皮肤与令牌要一起加载：这里查的就是皮肤按视觉轴算出来的值
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 一轮要挂的那套轴。 */
interface Axes {
  size: 'sm' | 'md' | 'lg'
  tone: 'brand' | 'danger' | 'success'
}

interface Case {
  /** 浮层里量哪个部件的哪个属性——它吃尺寸档的私有槽。属性名也可以写私有槽本身 */
  sizePart: string
  sizeProp: string
  /** 页内同档参照：触发器一侧吃同一个私有槽的那个部件 */
  anchorPart?: string
  /** 浮层里量哪个部件的哪个属性——它吃语气档的私有槽 */
  tonePart: string
  toneProp: string
  /** 两台机器合成的组件挂上来就展开会让落焦跑在机器挂载之前，改成挂完再点开 */
  openByClick?: boolean
  render: (axes: Axes) => VNode
}

const FRUITS = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
]

const CASES: Record<string, Case> = {
  'select': {
    sizePart: 'item',
    sizeProp: 'font-size',
    anchorPart: 'trigger',
    tonePart: 'item-indicator',
    toneProp: 'color',
    render: axes => h(XhSelectRoot, { ...axes, open: true, value: ['apple'] }, () => [
      h(XhSelectTrigger, null, () => [h(XhSelectValueText)]),
      h(XhSelectPositioner, null, () => [
        h(XhSelectContent, null, () => [
          h(XhSelectList, null, () => FRUITS.map(node =>
            h(XhSelectItem, { key: node.value, value: node.value }, () => [
              h(XhSelectItemText, null, () => node.label),
              h(XhSelectItemIndicator),
            ]),
          )),
        ]),
      ]),
    ]),
  },

  'combobox': {
    sizePart: 'item',
    sizeProp: 'font-size',
    anchorPart: 'input',
    tonePart: 'item-indicator',
    toneProp: 'color',
    render: axes => h(XhComboboxRoot, { ...axes, open: true, value: ['apple'], collection: FRUITS }, () => [
      h(XhComboboxControl, null, () => [h(XhComboboxInput)]),
      h(XhComboboxPositioner, null, () => [
        h(XhComboboxContent, null, () => FRUITS.map(node =>
          h(XhComboboxItem, { key: node.value, value: node.value }, () => [
            h(XhComboboxItemText, null, () => node.label),
            h(XhComboboxItemIndicator),
          ]),
        )),
      ]),
    ]),
  },

  'cascader': {
    sizePart: 'item',
    sizeProp: 'font-size',
    anchorPart: 'trigger',
    tonePart: 'item-indicator',
    toneProp: 'color',
    render: axes => h(XhCascaderRoot, { ...axes, open: true, collection: FRUITS }, () => [
      h(XhCascaderTrigger, null, () => [h(XhCascaderValueText)]),
      h(XhCascaderPositioner, null, () => [
        h(XhCascaderContent, null, () => [
          h(XhCascaderColumn, { level: 0 }, () => FRUITS.map(node =>
            h(XhCascaderItem, { key: node.value, value: node.value }, () => [
              h(XhCascaderItemText, null, () => node.label),
              h(XhCascaderItemIndicator),
            ]),
          )),
        ]),
      ]),
    ]),
  },

  // 触发区不吃这几个私有槽，只有浮层吃，故没有页内锚点
  'context-menu': {
    sizePart: 'item',
    sizeProp: 'padding-inline-start',
    tonePart: 'item-indicator',
    toneProp: 'color',
    render: axes => h(XhContextMenuRoot, { ...axes, open: true }, () => [
      h(XhContextMenuTrigger, null, () => '右键这块区域'),
      h(XhContextMenuPositioner, null, () => [
        h(XhContextMenuContent, null, () => FRUITS.map(node =>
          h(XhContextMenuItem, { key: node.value, value: node.value }, () => [
            h(XhContextMenuItemIndicator, null, () => '✓'),
            h(XhContextMenuItemText, null, () => node.label),
          ]),
        )),
      ]),
    ]),
  },

  'date-picker': {
    // 浮层里没有任何部件吃尺寸档的私有槽（确认钮的高、内距与字号都钉死在 sm 档），
    // 所以直接量槽本身：轴落到了 positioner 上，槽才换得动
    sizePart: 'positioner',
    sizeProp: '--xh-_date-picker-control-h',
    anchorPart: 'root',
    tonePart: 'confirm-trigger',
    toneProp: 'background-color',
    render: axes => h(XhDatePickerRoot, { ...axes, open: true, showTime: true }, () => [
      h(XhDatePickerControl, null, () => [
        h(XhDatePickerInput, null, () => [h(XhDatePickerSegment, { index: 0 })]),
      ]),
      h(XhDatePickerPositioner, null, () => [
        h(XhDatePickerContent, null, () => [h(XhDatePickerConfirmTrigger, null, () => '确定')]),
      ]),
    ]),
  },

  'mention': {
    sizePart: 'item',
    sizeProp: 'font-size',
    anchorPart: 'input',
    tonePart: 'item',
    toneProp: 'font-size',
    // 候选浮层由输入 @ 触发，没有受控展开这条口子；收起态节点仍在浮层里，取值照样算得出来
    render: axes => h(XhMentionRoot, { ...axes, collection: FRUITS }, () => [
      h(XhMentionInput),
      h(XhMentionPositioner, null, () => [
        h(XhMentionContent, null, () => FRUITS.map(node =>
          h(XhMentionItem, { key: node.value, value: node.value }, () => [
            h(XhMentionItemText, null, () => node.label),
          ]),
        )),
      ]),
    ]),
  },

  'popselect': {
    sizePart: 'item',
    sizeProp: 'font-size',
    anchorPart: 'trigger',
    tonePart: 'item-indicator',
    toneProp: 'color',
    openByClick: true,
    render: axes => h(XhPopselectRoot, { ...axes, value: ['apple'] }, () => [
      h(XhPopselectTrigger, null, () => '选一个'),
      h(XhPopselectPositioner, null, () => [
        h(XhPopselectContent, null, () => FRUITS.map(node =>
          h(XhPopselectItem, { key: node.value, value: node.value }, () => [
            h(XhPopselectItemText, null, () => node.label),
            h(XhPopselectItemIndicator),
          ]),
        )),
      ]),
    ]),
  },

  'time-picker': {
    sizePart: 'item',
    sizeProp: 'padding-inline-start',
    tonePart: 'item',
    toneProp: 'font-size',
    render: axes => h(XhTimePickerRoot, { ...axes, open: true, value: '09:30' }, () => [
      h(XhTimePickerControl, null, () => [h(XhTimePickerInput, { segment: 'hour' })]),
      h(XhTimePickerPositioner, null, () => [
        h(XhTimePickerContent, null, () => [
          h(XhTimePickerColumn, { unit: 'hour' }, () => [
            h(XhTimePickerItem, { value: '09' }),
            h(XhTimePickerItem, { value: '10' }),
          ]),
        ]),
      ]),
    ]),
  },

  'tree-select': {
    sizePart: 'item',
    sizeProp: 'font-size',
    anchorPart: 'trigger',
    tonePart: 'item-indicator',
    toneProp: 'color',
    render: axes => h(XhTreeSelectRoot, { ...axes, open: true, value: ['apple'], collection: FRUITS }, () => [
      h(XhTreeSelectTrigger, null, () => [h(XhTreeSelectValueText)]),
      h(XhTreeSelectPositioner, null, () => [
        h(XhTreeSelectContent, null, () => [
          h(XhTreeSelectTree, null, () => FRUITS.map(node =>
            h(XhTreeSelectItem, { key: node.value, value: node.value }, () => [
              h(XhTreeSelectItemText, null, () => node.label),
              h(XhTreeSelectItemIndicator),
            ]),
          )),
        ]),
      ]),
    ]),
  },
}

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => teardown())

async function mountCase(scope: string, spec: Case, axes: Axes): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => () => spec.render(axes) })
  app.mount(host)
  await nextTick()
  await nextTick()
  if (spec.openByClick) {
    host.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='trigger']`)?.click()
    await nextTick()
    await nextTick()
  }
}

function teardown(): void {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.getElementById('xh-portal-root')?.replaceChildren()
}

/** 浮层已被搬到 portal 落点，所以从那里取，不从挂载树取 */
function inPortal(scope: string, part: string, prop: string): string {
  const portal = document.getElementById('xh-portal-root')
  const el = portal?.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${part}']`)
  if (!el)
    throw new Error(`portal 里没有 ${scope} 的 ${part}`)
  return getComputedStyle(el).getPropertyValue(prop)
}

function inHost(scope: string, part: string, prop: string): string {
  const el = host?.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${part}']`)
  if (!el)
    throw new Error(`挂载树里没有 ${scope} 的 ${part}`)
  return getComputedStyle(el).getPropertyValue(prop)
}

describe('浮层里的视觉轴', () => {
  for (const [scope, spec] of Object.entries(CASES)) {
    it(`${scope}：尺寸档三档各自落到浮层里`, async () => {
      const measured: Record<string, string> = {}
      for (const size of ['sm', 'md', 'lg'] as const) {
        await mountCase(scope, spec, { size, tone: 'brand' })
        measured[size] = inPortal(scope, spec.sizePart, spec.sizeProp)
        if (spec.anchorPart) {
          // 浮层里的取值必须与触发器一侧的同档一模一样
          expect(measured[size], `${size} 档：浮层与页内不同`).toBe(inHost(scope, spec.anchorPart, spec.sizeProp))
        }
        teardown()
      }
      // 断链时三档会一起退到同一个初值，这条把那种情形挡在外面
      expect(new Set(Object.values(measured)).size, `三档量出来是 ${JSON.stringify(measured)}`).toBeGreaterThan(1)
    })

    it(`${scope}：语气换族，浮层里跟着换`, async () => {
      const measured: Record<string, string> = {}
      for (const tone of ['brand', 'danger', 'success'] as const) {
        await mountCase(scope, spec, { size: 'md', tone })
        measured[tone] = inPortal(scope, spec.tonePart, spec.toneProp)
        teardown()
      }
      // 不吃语气的组件三族同值，只要求它别退到初值；吃语气的必须三族分开
      const tonal = spec.toneProp === 'color' || spec.toneProp === 'background-color'
      if (tonal)
        expect(new Set(Object.values(measured)).size, `三族量出来是 ${JSON.stringify(measured)}`).toBe(3)
      else
        expect(new Set(Object.values(measured)).size).toBe(1)
    })
  }
})
