import type { ConformanceSuite } from '@xihan-ui/testing'
import { drawerAnatomy, drawerKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from '@xihan-ui/testing'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'

/**
 * WC 专属 drawer 规格。
 *
 * 与 dialog 同因单开一份：Light DOM 下 content 由作者写、常驻在那儿，关闭态靠
 * data-state=closed 与 positioner 的 hidden 收起；Vue 版则走退场租约，播完动画整棵卸载。
 * 共享套件按"卸载"写断言，在这边一条都对不上。
 *
 * 抽屉相对 dialog 只多一个 side，因此这里重点验它：root 与 content 都要标出滑出边，
 * 其余（ARIA 接线、焦点进出、受控、Escape）与 dialog 同构，各留一条守住不回归。
 */
export const wcDrawerSuite: ConformanceSuite = {
  component: 'drawer',
  anatomy: drawerAnatomy,
  keyboard: drawerKeyboard,
  fixture: {
    // 显式写出 root：data-side 与 data-state 都落在它身上，样式靠这两个决定
    // 抽屉从哪条边滑进来。dialog 的 WC fixture 没有这一层，因为它没有 side
    part: 'root',
    tag: 'div',
    children: [
      { part: 'trigger', tag: 'button', text: '打开' },
      { part: 'backdrop', tag: 'div' },
      {
        part: 'positioner',
        tag: 'div',
        children: [
          {
            part: 'content',
            tag: 'div',
            children: [
              { part: 'title', tag: 'h2', text: '标题' },
              { part: 'description', tag: 'p', text: '描述' },
              { tag: 'button', text: '确认', attrs: { 'data-testid': 'confirm' } },
              { part: 'close-trigger', tag: 'button', text: '关闭' },
            ],
          },
        ],
      },
    ],
  },
  cases: [
    {
      // Enter / Space 由平台的按钮激活行为翻成 click，我们不自己接这两个键
      name: 'Enter / Space 打开：trigger 是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['drawer.kbd.open-on-trigger'],
      steps: [nativeActivation('drawer', 'trigger')],
    },
    {
      name: '初始关闭：content 常驻、data-state=closed，滑出边默认 right',
      spec: { apg: APG },
      initial: {
        counts: { content: 1, trigger: 1 },
        parts: {
          trigger: { 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'data-state': 'closed', 'aria-controls': '@part(content)' },
          content: { 'data-state': 'closed', 'role': 'dialog', 'data-side': 'right' },
          positioner: { 'data-state': 'closed' },
        },
      },
    },
    {
      // side 是抽屉相对 dialog 唯一的新语义：样式靠它决定从哪一边滑进来，
      // 落不到 DOM 上的话四个方向长得一模一样
      name: 'side=left：root 与 content 同步标出滑出边',
      spec: { apg: APG },
      props: { side: 'left' },
      initial: {
        parts: {
          root: { 'data-side': 'left' },
          content: { 'data-side': 'left' },
        },
      },
    },
    {
      name: '点击 trigger 打开：ARIA 接线完整，root 与 content 同步转 open',
      spec: { apg: `${APG}#roles_states_properties` },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'open' } },
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: {
                'role': 'dialog',
                'aria-modal': 'true',
                'tabindex': '-1',
                'data-state': 'open',
                'aria-labelledby': '@part(title)',
                'aria-describedby': '@part(description)',
              },
              positioner: { 'data-state': 'open' },
            },
          },
        },
      ],
    },
    {
      name: '打开后焦点移入 content 内首个可聚焦元素',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' }, expect: { activeElement: { part: 'content', exact: false } } },
      ],
    },
    {
      name: 'Escape 关闭：data-state 回 closed 且焦点归还 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['drawer.kbd.escape'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' } },
        { kind: 'key', key: 'Escape' },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'closed' } },
          expect: { parts: { trigger: { 'data-state': 'closed' }, positioner: { 'data-state': 'closed' } } },
        },
        { kind: 'settle', until: { activeElement: 'trigger' }, expect: { activeElement: 'trigger' } },
      ],
    },
    {
      name: '点击 close-trigger 关闭：data-state 回 closed，trigger 归位',
      spec: { apg: APG },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' } },
        { kind: 'click', part: 'close-trigger' },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'closed' } },
          expect: { parts: { trigger: { 'aria-expanded': 'false', 'data-state': 'closed' } } },
        },
      ],
    },
    {
      // 非模态时 aria-modal 要显式说 false，而不是省略：省略是"没说"，
      // 读屏对"没说"和"明确说了不是"处理不同
      name: '非模态抽屉：aria-modal 显式为 false，焦点照样进 content',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { modal: false },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'content' },
          expect: { parts: { content: { 'aria-modal': 'false' } } },
        },
      ],
    },
  ],
}
