import type { ConformanceSuite } from '@xihan-ui/testing'
import { imageViewerAnatomy, imageViewerKeyboard } from '@xihan-ui/headless'
import { IMAGE_VIEWER_CONTENT_CHILDREN, imageViewerAtIndex, imageViewerProps, nativeActivation, openImageViewer } from '@xihan-ui/testing'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'

/**
 * WC 专属 image-viewer 规格。
 *
 * 与 dialog 同因单开一份：Light DOM 下 backdrop / positioner / content 都由作者写、常驻在那儿，
 * 关闭态靠 hidden 与 data-state=closed 收起；Vue 版则关闭即整棵卸载。
 * 共享套件按"卸载"写的断言在这边对不上；翻页、两端直达、受控与 Escape 的步骤与共享套件同一份。
 */
export const wcImageViewerSuite: ConformanceSuite = {
  component: 'image-viewer',
  anatomy: imageViewerAnatomy,
  keyboard: imageViewerKeyboard,
  fixture: {
    tag: 'div',
    children: [
      { part: 'trigger', tag: 'button', text: '看大图' },
      { part: 'backdrop', tag: 'div' },
      {
        part: 'positioner',
        tag: 'div',
        children: [{ part: 'content', tag: 'div', children: IMAGE_VIEWER_CONTENT_CHILDREN }],
      },
    ],
  },
  cases: [
    {
      // Enter / Space 由平台的按钮激活行为翻成 click，我们不自己接这两个键
      name: 'Enter / Space 打开：trigger 是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      props: imageViewerProps(),
      covers: ['image-viewer.kbd.open-on-trigger'],
      steps: [nativeActivation('image-viewer', 'trigger')],
    },
    {
      name: '初始关闭：content 常驻、data-state=closed，三层都带 hidden',
      spec: { apg: APG },
      props: imageViewerProps(),
      initial: {
        counts: { trigger: 1, backdrop: 1, positioner: 1, content: 1 },
        parts: {
          trigger: { 'type': 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'data-state': 'closed' },
          backdrop: { 'aria-hidden': 'true', 'data-state': 'closed', 'hidden': '' },
          positioner: { 'data-state': 'closed', 'hidden': '' },
          content: { 'role': 'dialog', 'data-state': 'closed', 'hidden': '' },
        },
      },
    },
    {
      name: '点击 trigger 打开：三层去掉 hidden，对话框语义与工具条接线完整',
      spec: { apg: `${APG}#roles_states_properties` },
      props: imageViewerProps(),
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'open' } },
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'true', 'data-state': 'open' },
              'backdrop': { 'aria-hidden': 'true', 'data-state': 'open', 'hidden': null },
              'positioner': { 'data-state': 'open', 'data-positioned': '', 'hidden': null },
              'content': {
                'id': '@self',
                'role': 'dialog',
                'aria-modal': 'true',
                'tabindex': '-1',
                'data-state': 'open',
                'hidden': null,
                'aria-label': '第一张',
              },
              'viewport': { 'data-state': 'open', 'data-panning': null },
              'image': { 'data-state': 'open', 'data-panning': null },
              'toolbar': { 'role': 'toolbar', 'aria-label': 'Image preview', 'data-state': 'open' },
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
      name: '点击 close-trigger 关闭：三层复位 hidden，trigger 归位',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: imageViewerProps(),
      steps: [
        ...openImageViewer(),
        { kind: 'click', part: 'close-trigger' },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'closed' } },
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed' },
              backdrop: { hidden: '' },
              positioner: { hidden: '' },
              content: { hidden: '' },
            },
          },
        },
      ],
    },
    {
      name: 'Escape 关闭：data-state 回 closed 且焦点归还 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: imageViewerProps(),
      covers: ['image-viewer.kbd.escape'],
      steps: [
        ...openImageViewer(),
        { kind: 'key', key: 'Escape' },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'closed' } },
          expect: { parts: { trigger: { 'data-state': 'closed' }, positioner: { 'data-state': 'closed', 'hidden': '' } } },
        },
        { kind: 'settle', until: { activeElement: 'trigger' }, expect: { activeElement: 'trigger' } },
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
            parts: { content: { 'data-state': 'open', 'hidden': null }, trigger: { 'data-state': 'open' } },
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
        { kind: 'key', key: 'ArrowRight', expect: imageViewerAtIndex(0) },
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
            parts: { content: { 'data-state': 'closed', 'hidden': '' } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'setProps', props: { open: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'open' } },
          expect: { parts: { content: { 'data-state': 'open', 'hidden': null } } },
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
