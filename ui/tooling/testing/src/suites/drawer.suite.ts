import type { ConformanceSuite } from '../conformance/types'
import { drawerAnatomy, drawerKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'

// 抽屉 = 贴边渲染的对话框：ARIA 与键盘契约逐条相同，多出来的只有 side。
// backdrop / positioner 由 content 组件内部装配，不作为独立 fixture 节点；
// 采集器仍会从 document 抓到它们。
export const drawerSuite: ConformanceSuite = {
  component: 'drawer',
  anatomy: drawerAnatomy,
  keyboard: drawerKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'trigger', text: '打开' },
      {
        part: 'content',
        children: [
          { part: 'title', text: '标题' },
          { part: 'description', text: '描述' },
          { tag: 'button', text: '确认', attrs: { 'data-testid': 'confirm' } },
          { part: 'close-trigger', tag: 'button', text: '关闭' },
        ],
      },
    ],
  },
  cases: [
    {
      name: 'contained：遮罩与定位层改按容器画，三处角色节点一起报 data-contained',
      spec: { apg: APG },
      props: { contained: true, defaultOpen: true },
      initial: {
        parts: {
          backdrop: { 'data-contained': '' },
          positioner: { 'data-contained': '' },
          content: { 'data-contained': '' },
        },
      },
    },
    {
      name: '不给 contained 时一个属性都不写出来，浮层照旧铺满视口',
      spec: { apg: APG },
      props: { defaultOpen: true },
      initial: {
        parts: {
          backdrop: { 'data-contained': null },
          positioner: { 'data-contained': null },
          content: { 'data-contained': null },
        },
      },
    },
    {
      // Enter / Space 由平台的按钮激活行为翻成 click，我们不自己接这两个键；
      // "click 后打开并把焦点移入 content"由本套件其它用例验
      name: 'Enter / Space 打开：trigger 是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['drawer.kbd.open-on-trigger'],
      steps: [nativeActivation('drawer', 'trigger')],
    },
    {
      name: '初始关闭：root 留在原地并已标出滑出边，content 不渲染',
      spec: { apg: APG, zag: 'drawer.machine#initialState' },
      initial: {
        order: ['root', 'trigger'],
        counts: { content: 0, backdrop: 0 },
        parts: {
          // side 缺省即 right；收起态也要说得出方向
          root: { 'data-side': 'right', 'data-state': 'closed' },
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
      name: '点击 trigger 打开：content 挂载，ARIA 接线完整，root 与 content 同步转 open',
      spec: { apg: `${APG}#roles_states_properties` },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { present: 'content' },
          expect: {
            counts: { content: 1, backdrop: 1, positioner: 1 },
            parts: {
              root: { 'data-state': 'open' },
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: {
                'role': 'dialog',
                'aria-modal': 'true',
                'tabindex': '-1',
                'data-state': 'open',
                'data-side': 'right',
                'aria-labelledby': '@part(title)',
                'aria-describedby': '@part(description)',
              },
            },
          },
        },
      ],
    },
    {
      name: 'side 决定滑出边：root 与 content 始终报同一条边，改 side 两边一起走',
      spec: { apg: APG },
      props: { side: 'left' },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: { parts: { root: { 'data-side': 'left' } } },
        },
        {
          kind: 'settle',
          until: { present: 'content' },
          expect: {
            parts: {
              root: { 'data-side': 'left' },
              // content 被 portal 出去了，写在 root 上的选择器够不着它，它必须自带这条边
              content: { 'data-side': 'left' },
            },
          },
        },
        {
          kind: 'setProps',
          props: { side: 'bottom' },
          expect: {
            parts: {
              root: { 'data-side': 'bottom' },
              content: { 'data-side': 'bottom' },
            },
          },
        },
      ],
    },
    {
      name: '点击 close-trigger 关闭：content 卸载，trigger 归位',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { present: 'content' } },
        { kind: 'click', part: 'close-trigger' },
        {
          kind: 'settle',
          until: { absent: 'content' },
          expect: {
            order: ['root', 'trigger'],
            counts: { content: 0 },
            parts: {
              root: { 'data-state': 'closed' },
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed' },
            },
          },
        },
      ],
    },
    {
      name: '打开：焦点落在 content 内首个可聚焦元素（非 content 容器本身）',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'content' },
          expect: { activeElement: { part: 'content', exact: false } },
        },
      ],
    },
    {
      name: '非模态抽屉：aria-modal 显式为 false，但焦点照样进 content',
      spec: { apg: `${APG}#roles_states_properties` },
      // 焦点域无条件建，只有陷不陷焦点看 modal
      props: { modal: false },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'content' },
          expect: {
            activeElement: { part: 'content', exact: false },
            // 省略与显式 false 在读屏那里不是一回事
            parts: { content: { 'aria-modal': 'false' } },
          },
        },
      ],
    },
    {
      name: 'alertdialog 抽屉：焦点落在 content 容器本身（不预选按钮）',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/' },
      props: { role: 'alertdialog' },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'content' },
          expect: {
            activeElement: { part: 'content', exact: true },
            parts: { content: { role: 'alertdialog' } },
          },
        },
      ],
    },
    {
      name: 'Escape 关闭：content 卸载且焦点归还 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['drawer.kbd.escape'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' } },
        { kind: 'key', key: 'Escape' },
        {
          kind: 'settle',
          until: { absent: 'content' },
          expect: {
            counts: { content: 0 },
            parts: { root: { 'data-state': 'closed' }, trigger: { 'data-state': 'closed' } },
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
      name: '受控 open：点击只发 open-change 不自改 DOM，父写回 open 后才打开',
      spec: { adr: 'controlled-uncontrolled' },
      props: { open: false },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            counts: { content: 0 },
            parts: { root: { 'data-state': 'closed' } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'setProps', props: { open: true } },
        {
          kind: 'settle',
          until: { present: 'content' },
          expect: {
            counts: { content: 1 },
            parts: { root: { 'data-state': 'open' }, content: { 'data-state': 'open' } },
          },
        },
      ],
    },
  ],
}
