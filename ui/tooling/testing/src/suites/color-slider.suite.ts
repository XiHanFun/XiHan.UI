import type { ConformanceSuite } from '../conformance/types'
import { colorSliderAnatomy, colorSliderKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/slider/'
const APG_KBD = `${APG}#keyboardinteraction`

const HIDDEN_INPUT = '[data-scope="color-slider"][data-part="hidden-input"]'

function findPart(doc: Document, name: string): HTMLElement {
  const el = doc.querySelector<HTMLElement>(`[data-scope="color-slider"][data-part="${name}"]`)
  if (!el)
    throw new Error(`找不到 ${name} 部件`)
  return el
}

/**
 * jsdom 不做布局，getBoundingClientRect 恒是 0×0——几何那边会当成"轨道还没就位"原地不动。
 * 摆一个 200px 宽的轨道，坐标与值才有得换算。
 */
function layoutTrack(doc: Document): void {
  const track = findPart(doc, 'track')
  track.getBoundingClientRect = (): DOMRect => ({
    x: 0,
    y: 0,
    width: 200,
    height: 12,
    top: 0,
    left: 0,
    right: 200,
    bottom: 12,
    toJSON: () => ({}),
  }) as DOMRect
}

function pressControl(doc: Document, clientX: number): void {
  findPart(doc, 'control').dispatchEvent(
    new PointerEvent('pointerdown', { clientX, clientY: 6, button: 0, bubbles: true, cancelable: true }),
  )
}

function movePointer(doc: Document, clientX: number): void {
  doc.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY: 6, bubbles: true }))
}

function releasePointer(doc: Document): void {
  doc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}

/** 内联样式进不了归一化快照：轨道渐变与拇指的颜色槽只能直接读 DOM。渐变里的颜色按 CSSOM 归一后的写法比（hsl → rgb，不透明的 rgba → rgb）。 */
function assertStyle(doc: Document, part: string, prop: string, expected: string): void {
  const actual = findPart(doc, part).style.getPropertyValue(prop)
  if (actual !== expected)
    throw new Error(`${part} 的 ${prop} 不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

/** 表单出口的 value 只落 DOM property，同样只能直接读。 */
function assertHiddenInput(doc: Document, expected: readonly [string, string, boolean]): void {
  const el = doc.querySelector<HTMLInputElement>(HIDDEN_INPUT)
  const actual = el ? [el.name, el.value, el.disabled] : null
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(`隐藏输入的 name/value/disabled 不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

export const colorSliderSuite: ConformanceSuite = {
  component: 'color-slider',
  anatomy: colorSliderAnatomy,
  keyboard: colorSliderKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'label', tag: 'label', text: '色相' },
      {
        part: 'control',
        children: [
          { part: 'track' },
          { part: 'thumb', children: [{ part: 'value-text', tag: 'span' }, { part: 'hidden-input', tag: 'input' }] },
        ],
      },
    ],
  },
  cases: [
    {
      name: '默认推色相：拇指是 role=slider，区间 0-360、带单位的播报、名字挂到标签上',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { defaultValue: '#00ff00', name: 'accent' },
      initial: {
        order: ['root', 'label', 'control', 'track', 'thumb', 'value-text', 'hidden-input'],
        counts: { 'root': 1, 'label': 1, 'control': 1, 'track': 1, 'thumb': 1, 'value-text': 1, 'hidden-input': 1 },
        parts: {
          'root': {
            'data-channel': 'hue',
            'data-orientation': 'horizontal',
            'data-value': '#00ff00',
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
            'data-dragging': null,
          },
          'label': { id: '@self' },
          'thumb': {
            'role': 'slider',
            'aria-valuemin': '0',
            'aria-valuemax': '360',
            'aria-valuenow': '120',
            'aria-valuetext': '120°',
            'aria-label': 'Hue',
            'aria-labelledby': '@part(label)',
            'aria-orientation': 'horizontal',
            'aria-disabled': 'false',
            'tabindex': '0',
            'data-channel': 'hue',
          },
          'value-text': { 'aria-hidden': 'true' },
          'hidden-input': { type: 'hidden', name: 'accent', disabled: null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '渐变、拇指颜色与表单出口的值都是内联样式或 property，进不了归一化快照',
          run: ({ doc }) => {
            assertStyle(doc, 'track', 'background-image', 'linear-gradient(to right, rgb(255, 0, 0), rgb(255, 255, 0), rgb(0, 255, 0), rgb(0, 255, 255), rgb(0, 0, 255), rgb(255, 0, 255), rgb(255, 0, 0))')
            assertStyle(doc, 'thumb', '--xh-_color-slider-thumb-color', 'rgba(0, 255, 0, 1)')
            assertStyle(doc, 'thumb', 'inset-inline-start', '33.33%')
            assertHiddenInput(doc, ['accent', '#00ff00', false])
          },
        },
      ],
    },
    {
      name: '方向键按 step 推本通道，值串按 hex 重写并发 value-change',
      spec: { apg: APG_KBD },
      covers: ['color-slider.kbd.increment', 'color-slider.kbd.decrement'],
      props: { defaultValue: '#00ff00', channel: 'brightness' },
      initial: { parts: { thumb: { 'aria-valuenow': '100', 'aria-valuemax': '100', 'aria-valuetext': '100%' } } },
      steps: [
        { kind: 'focus', part: 'thumb' },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            parts: { thumb: { 'aria-valuenow': '99' }, root: { 'data-value': '#00fc00' } },
            // 载荷带着整份工作色：串是有损的，灰度处色相只能从这里拿
            events: [{ type: 'value-change', detail: { value: '#00fc00', hsva: { h: 120, s: 100, v: 99, a: 1 } } }],
          },
        },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { thumb: { 'aria-valuenow': '100' }, root: { 'data-value': '#00ff00' } } } },
      ],
    },
    {
      name: 'PageUp / PageDown 走十格，Home / End 取端点；越界停在端点不回绕',
      spec: { apg: APG_KBD },
      covers: ['color-slider.kbd.large-increment', 'color-slider.kbd.large-decrement', 'color-slider.kbd.min', 'color-slider.kbd.max'],
      props: { defaultValue: '#ff0000' },
      steps: [
        { kind: 'focus', part: 'thumb' },
        { kind: 'key', key: 'PageUp', expect: { parts: { thumb: { 'aria-valuenow': '10' } } } },
        { kind: 'key', key: 'PageDown', expect: { parts: { thumb: { 'aria-valuenow': '0' } } } },
        { kind: 'key', key: 'PageDown', expect: { parts: { thumb: { 'aria-valuenow': '0' } } } },
        { kind: 'key', key: 'End', expect: { parts: { thumb: { 'aria-valuenow': '360' } } } },
        { kind: 'key', key: 'Home', expect: { parts: { thumb: { 'aria-valuenow': '0' } } } },
      ],
    },
    {
      name: '透明度那一路：区间 0-100、值串带第四对、轨道从全透明走到实色',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { defaultValue: '#ff000080', channel: 'alpha' },
      initial: {
        parts: {
          root: { 'data-channel': 'alpha' },
          thumb: { 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '50', 'aria-valuetext': '50%', 'aria-label': 'Alpha', 'data-channel': 'alpha' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '渐变是内联样式',
          run: ({ doc }) => assertStyle(doc, 'track', 'background-image', 'linear-gradient(to right, rgba(255, 0, 0, 0), rgb(255, 0, 0))'),
        },
        { kind: 'focus', part: 'thumb' },
        { kind: 'key', key: 'End', expect: { parts: { thumb: { 'aria-valuenow': '100' }, root: { 'data-value': '#ff0000' } } } },
      ],
    },
    {
      name: '红绿蓝走 0-255，format 决定写回的写法',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { defaultValue: 'rgba(10, 20, 30, 1)', channel: 'green', format: 'rgba' },
      initial: {
        parts: { thumb: { 'aria-valuemin': '0', 'aria-valuemax': '255', 'aria-valuenow': '20', 'aria-valuetext': '20', 'aria-label': 'Green' } },
      },
      steps: [
        { kind: 'focus', part: 'thumb' },
        { kind: 'key', key: 'PageUp', expect: { parts: { thumb: { 'aria-valuenow': '30' }, root: { 'data-value': 'rgba(10, 30, 30, 1)' } } } },
      ],
    },
    {
      name: 'RTL 只对调左右两键，轨道渐变跟着掉头',
      spec: { apg: APG_KBD },
      props: { defaultValue: '#ff0000', channel: 'brightness', dir: 'rtl' },
      steps: [
        {
          kind: 'raw',
          why: '渐变方向是内联样式',
          run: ({ doc }) => assertStyle(doc, 'track', 'background-image', 'linear-gradient(to left, rgb(0, 0, 0), rgb(255, 0, 0))'),
        },
        { kind: 'focus', part: 'thumb' },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { thumb: { 'aria-valuenow': '99' } } } },
        { kind: 'key', key: 'ArrowLeft', expect: { parts: { thumb: { 'aria-valuenow': '100' } } } },
      ],
    },
    {
      name: '竖直轨道：aria-orientation 跟着换，渐变自下而上，拇指按 block-end 定位',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { defaultValue: '#ff0000', channel: 'saturation', orientation: 'vertical' },
      initial: {
        parts: {
          root: { 'data-orientation': 'vertical' },
          thumb: { 'aria-orientation': 'vertical', 'aria-valuenow': '100' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '渐变与拇指定位是内联样式',
          run: ({ doc }) => {
            assertStyle(doc, 'track', 'background-image', 'linear-gradient(to top, rgb(255, 255, 255), rgb(255, 0, 0))')
            assertStyle(doc, 'thumb', 'inset-block-end', '100%')
          },
        },
        { kind: 'focus', part: 'thumb' },
        { kind: 'key', key: 'ArrowDown', expect: { parts: { thumb: { 'aria-valuenow': '99' } } } },
      ],
    },
    {
      name: '按下轨道即跳到落点，随后跟着指针走，松手收尾',
      spec: { apg: APG },
      props: { defaultValue: '#000000', channel: 'brightness' },
      steps: [
        {
          kind: 'raw',
          why: '拖动是"按下—移动—松手"三件事，harness 的步骤表达不了；轨道矩形也要先摆出来',
          run: ({ doc }) => {
            layoutTrack(doc)
            pressControl(doc, 100)
            movePointer(doc, 150)
          },
          expect: {
            parts: {
              thumb: { 'aria-valuenow': '75', 'data-dragging': '' },
              root: { 'data-dragging': '', 'data-value': '#bfbfbf' },
            },
            activeElement: { part: 'thumb', exact: true },
          },
        },
        {
          kind: 'raw',
          why: '松手同样是原始指针事件',
          run: ({ doc }) => releasePointer(doc),
          // value-change-end 不在三端 harness 的公开事件登记里，收尾通知由 headless 单测覆盖
          expect: { parts: { thumb: { 'data-dragging': null }, root: { 'data-dragging': null } } },
        },
      ],
    },
    {
      name: '受控：推动只发意图，宿主不写回值就不动；写回后拇指跟着走',
      spec: { apg: APG },
      props: { value: '#ff0000' },
      steps: [
        { kind: 'focus', part: 'thumb' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: { thumb: { 'aria-valuenow': '0' }, root: { 'data-value': '#ff0000' } },
            events: [{ type: 'value-change', detail: { value: '#ff0400', hsva: { h: 1, s: 100, v: 100, a: 1 } } }],
          },
        },
        { kind: 'setProps', props: { value: '#ffff00' }, expect: { parts: { thumb: { 'aria-valuenow': '60' } } } },
      ],
    },
    {
      name: '禁用：拇指退出 Tab 序列、方向键推不动、表单出口不提交；只读留 Tab 位但同样推不动',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { defaultValue: '#ff0000', disabled: true, name: 'accent' },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'thumb': { 'aria-disabled': 'true', 'tabindex': null, 'data-disabled': '' },
          'hidden-input': { disabled: '' },
        },
      },
      steps: [
        { kind: 'setProps', props: { disabled: false, readOnly: true }, expect: { parts: { thumb: { 'tabindex': '0', 'data-readonly': '' }, root: { 'data-readonly': '' } } } },
        { kind: 'focus', part: 'thumb' },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { thumb: { 'aria-valuenow': '0' } }, events: [] } },
      ],
    },
  ],
}
