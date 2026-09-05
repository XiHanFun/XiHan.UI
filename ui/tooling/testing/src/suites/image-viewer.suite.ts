import type { ImageViewerItem } from '@xihan-ui/headless'
import type { ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { imageViewerAnatomy, imageViewerKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'

/** 三张图：翻页、回绕与两端直达都要至少三张才分得清。alt 同时是 content 的可及名。 */
export const IMAGE_VIEWER_ITEMS: readonly ImageViewerItem[] = [
  { src: 'data:image/svg+xml,a', alt: '第一张' },
  { src: 'data:image/svg+xml,b', alt: '第二张' },
  { src: 'data:image/svg+xml,c', alt: '第三张' },
]

/** 每个用例都带上同一份清单；没有它打开也只有空视口。 */
export function imageViewerProps(extra: Readonly<Record<string, unknown>> = {}): Readonly<Record<string, unknown>> {
  return { collection: IMAGE_VIEWER_ITEMS, ...extra }
}

/** content 里的内容：视口、计数与工具条。工具条第一个按钮是打开后焦点的落点。 */
export const IMAGE_VIEWER_CONTENT_CHILDREN: readonly FixtureNode[] = [
  { part: 'viewport', children: [{ part: 'image', tag: 'img' }] },
  { part: 'counter' },
  {
    part: 'toolbar',
    children: [
      { part: 'prev-trigger', tag: 'button' },
      { part: 'next-trigger', tag: 'button' },
      { part: 'zoom-in-trigger', tag: 'button' },
      { part: 'zoom-out-trigger', tag: 'button' },
      { part: 'reset-trigger', tag: 'button' },
      { part: 'close-trigger', tag: 'button' },
    ],
  },
]

/** 打开并等焦点进入 content。 */
export function openImageViewer(): readonly StepWithExpect[] {
  return [
    { kind: 'click', part: 'trigger' },
    { kind: 'settle', until: { activeElement: 'content' } },
  ]
}

/** 当前是第几张：计数器的 data-index 与 content 的可及名一起核。 */
export function imageViewerAtIndex(index: number): NonNullable<StepWithExpect['expect']> {
  return {
    parts: {
      counter: { 'data-index': String(index + 1), 'data-count': String(IMAGE_VIEWER_ITEMS.length) },
      content: { 'aria-label': IMAGE_VIEWER_ITEMS[index]!.alt! },
    },
  }
}

// backdrop / positioner 由 content 组件内部装配，不作为独立 fixture 节点；
// 采集器仍会从 document 抓到它们。
export const imageViewerSuite: ConformanceSuite = {
  component: 'image-viewer',
  anatomy: imageViewerAnatomy,
  keyboard: imageViewerKeyboard,
  fixture: {
    children: [
      { part: 'trigger', text: '看大图' },
      { part: 'content', children: IMAGE_VIEWER_CONTENT_CHILDREN },
    ],
  },
  cases: [
    {
      // Enter / Space 由平台的按钮激活行为翻成 click，我们不自己接这两个键；
      // "click 后打开并把焦点移入 content"由本套件其它用例验
      name: 'Enter / Space 打开：trigger 是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      props: imageViewerProps(),
      covers: ['image-viewer.kbd.open-on-trigger'],
      steps: [nativeActivation('image-viewer', 'trigger')],
    },
    {
      name: '初始关闭：仅 trigger 在 DOM，content 不渲染',
      spec: { apg: APG },
      props: imageViewerProps(),
      initial: {
        order: ['trigger'],
        counts: { content: 0, backdrop: 0, positioner: 0 },
        parts: {
          trigger: {
            'type': 'button',
            'aria-haspopup': 'dialog',
            'aria-expanded': 'false',
            'data-state': 'closed',
          },
        },
      },
    },
    {
      name: '点击 trigger 打开：content 挂载，对话框语义与工具条接线完整',
      spec: { apg: `${APG}#roles_states_properties` },
      props: imageViewerProps(),
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { present: 'content' },
          expect: {
            counts: { content: 1, backdrop: 1, positioner: 1 },
            parts: {
              // content 挂载后 aria-controls 才解析得到对象
              'trigger': { 'aria-expanded': 'true', 'aria-controls': '@part(content)', 'data-state': 'open' },
              'backdrop': { 'aria-hidden': 'true', 'data-state': 'open', 'hidden': null },
              'positioner': { 'data-state': 'open', 'data-positioned': '', 'hidden': null },
              'content': {
                'id': '@self',
                'role': 'dialog',
                'aria-modal': 'true',
                'tabindex': '-1',
                'data-state': 'open',
                'hidden': null,
                // 当前图的 alt 就是对话框的名字
                'aria-label': '第一张',
              },
              'viewport': { 'data-state': 'open', 'data-dragging': null },
              'image': { 'data-state': 'open', 'data-dragging': null },
              'toolbar': { 'role': 'toolbar', 'aria-label': 'Image tools', 'data-state': 'open' },
              'counter': { 'aria-live': 'polite', 'data-index': '1', 'data-count': '3', 'data-state': 'open' },
              'prev-trigger': { 'type': 'button', 'aria-label': 'Previous image', 'disabled': null, 'data-disabled': null },
              'next-trigger': { 'type': 'button', 'aria-label': 'Next image', 'disabled': null, 'data-disabled': null },
              'zoom-in-trigger': { 'type': 'button', 'aria-label': 'Zoom in', 'disabled': null },
              'zoom-out-trigger': { 'type': 'button', 'aria-label': 'Zoom out', 'disabled': null },
              'reset-trigger': { 'type': 'button', 'aria-label': 'Reset' },
              'close-trigger': { 'type': 'button', 'aria-label': 'Close' },
            },
          },
        },
      ],
    },
    {
      name: '打开后焦点落在 content 内首个可聚焦元素（工具条第一个按钮）',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: imageViewerProps(),
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'content' },
          expect: { activeElement: { part: 'prev-trigger', exact: true } },
        },
      ],
    },
    {
      name: '点击 close-trigger 关闭：content 卸载，trigger 归位',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: imageViewerProps(),
      steps: [
        ...openImageViewer(),
        { kind: 'click', part: 'close-trigger' },
        {
          kind: 'settle',
          until: { absent: 'content' },
          expect: {
            order: ['trigger'],
            counts: { content: 0 },
            parts: { trigger: { 'aria-expanded': 'false', 'data-state': 'closed' } },
          },
        },
      ],
    },
    {
      name: 'Escape 关闭：content 卸载且焦点归还 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: imageViewerProps(),
      covers: ['image-viewer.kbd.escape'],
      steps: [
        ...openImageViewer(),
        { kind: 'key', key: 'Escape' },
        {
          kind: 'settle',
          until: { absent: 'content' },
          expect: {
            counts: { content: 0 },
            parts: { trigger: { 'data-state': 'closed' } },
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'trigger' },
          expect: { activeElement: 'trigger' },
        },
      ],
    },
    {
      name: 'closeOnEscape=false：Escape 不关，焦点留在 content 内',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: imageViewerProps({ closeOnEscape: false }),
      covers: ['image-viewer.kbd.escape'],
      steps: [
        ...openImageViewer(),
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            counts: { content: 1 },
            parts: { content: { 'data-state': 'open' }, trigger: { 'data-state': 'open' } },
            activeElement: { part: 'prev-trigger', exact: true },
          },
        },
      ],
    },
    {
      name: '左右方向键翻页，到头回绕；计数与可及名跟着走',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: imageViewerProps(),
      covers: ['image-viewer.kbd.prev', 'image-viewer.kbd.next'],
      steps: [
        ...openImageViewer(),
        { kind: 'key', key: 'ArrowRight', expect: imageViewerAtIndex(1) },
        { kind: 'key', key: 'ArrowRight', expect: imageViewerAtIndex(2) },
        // 最后一张再往后：回绕到第一张
        { kind: 'key', key: 'ArrowRight', expect: imageViewerAtIndex(0) },
        // 第一张再往前：回绕到最后一张
        { kind: 'key', key: 'ArrowLeft', expect: imageViewerAtIndex(2) },
        { kind: 'key', key: 'ArrowLeft', expect: imageViewerAtIndex(1) },
      ],
    },
    {
      name: 'Home / End 直达两端',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: imageViewerProps(),
      covers: ['image-viewer.kbd.first', 'image-viewer.kbd.last'],
      steps: [
        ...openImageViewer(),
        { kind: 'key', key: 'End', expect: imageViewerAtIndex(2) },
        { kind: 'key', key: 'Home', expect: imageViewerAtIndex(0) },
        { kind: 'key', key: 'ArrowRight', expect: imageViewerAtIndex(1) },
        { kind: 'key', key: 'Home', expect: imageViewerAtIndex(0) },
        { kind: 'key', key: 'End', expect: imageViewerAtIndex(2) },
      ],
    },
    {
      name: 'loop=false：两端停住，对应翻页按钮禁用；Home / End 不受影响',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: imageViewerProps({ loop: false }),
      covers: ['image-viewer.kbd.prev', 'image-viewer.kbd.next', 'image-viewer.kbd.first', 'image-viewer.kbd.last'],
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'content' },
          expect: {
            parts: {
              'prev-trigger': { 'disabled': '', 'data-disabled': '' },
              'next-trigger': { 'disabled': null, 'data-disabled': null },
            },
          },
        },
        { kind: 'key', key: 'ArrowLeft', expect: imageViewerAtIndex(0) },
        {
          kind: 'key',
          key: 'End',
          expect: {
            ...imageViewerAtIndex(2),
            parts: {
              ...imageViewerAtIndex(2).parts,
              'prev-trigger': { 'disabled': null, 'data-disabled': null },
              'next-trigger': { 'disabled': '', 'data-disabled': '' },
            },
          },
        },
        { kind: 'key', key: 'ArrowRight', expect: imageViewerAtIndex(2) },
        { kind: 'key', key: 'Home', expect: imageViewerAtIndex(0) },
      ],
    },
    {
      name: '受控 open：点击只发 open-change 不自改 DOM，父写回 open 后才打开',
      spec: { adr: 'controlled-uncontrolled' },
      props: imageViewerProps({ open: false }),
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            counts: { content: 0 },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'setProps', props: { open: true } },
        {
          kind: 'settle',
          until: { present: 'content' },
          expect: {
            counts: { content: 1 },
            parts: { content: { 'data-state': 'open' } },
          },
        },
      ],
    },
    {
      name: '受控 index：方向键不自改下标，父写回后才换图',
      spec: { adr: 'controlled-uncontrolled' },
      props: imageViewerProps({ index: 0 }),
      steps: [
        ...openImageViewer(),
        { kind: 'key', key: 'ArrowRight', expect: imageViewerAtIndex(0) },
        { kind: 'setProps', props: { index: 2 }, expect: imageViewerAtIndex(2) },
      ],
    },
  ],
}
