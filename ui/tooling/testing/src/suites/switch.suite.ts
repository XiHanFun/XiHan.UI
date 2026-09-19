import type { ConformanceSuite } from '../conformance/types'
import { switchAnatomy, switchKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'
import { heldPress, heldPressIgnored } from './shared/press-channel'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/switch/'

export const switchSuite: ConformanceSuite = {
  component: 'switch',
  anatomy: switchAnatomy,
  keyboard: switchKeyboard,
  // 开关的名字由作者写在角色节点上：组件不生成文案，也没有承载文案的部件
  fixture: { part: 'root', tag: 'button', attrs: { 'aria-label': '静音' } },
  cases: [
    {
      // Space / Enter 由平台的按钮激活行为翻成 click，组件不自己接这两个键；这里守它确实是原生 button[type=button]
      name: 'Space / Enter 切换：角色节点是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['switch.kbd.toggle'],
      steps: [nativeActivation('switch', 'root')],
    },
    {
      // 轨道是原生按钮，Space 与 Enter 都是激活键，两键都进按压面；jsdom 不把 keydown / keyup 翻成 click，开关态不动
      name: 'Space / Enter 按住与触屏按下：关着的轨道投影 data-pressed，抬起、失焦或指针取消撤下；与开关态无关',
      spec: { adr: 'press-channel' },
      covers: ['switch.kbd.press'],
      steps: [
        heldPress('switch', 'root'),
        { kind: 'settle', until: { attr: { part: 'root', name: 'data-pressed', value: null } }, expect: { parts: { root: { 'aria-checked': 'false' } } } },
      ],
    },
    {
      name: '开着的轨道同样投影按住面：选中与按压叠加由皮肤派生',
      spec: { adr: 'press-channel' },
      props: { defaultChecked: true },
      steps: [
        heldPress('switch', 'root'),
        { kind: 'settle', until: { attr: { part: 'root', name: 'data-pressed', value: null } }, expect: { parts: { root: { 'aria-checked': 'true' } } } },
      ],
    },
    {
      name: 'disabled / loading / readOnly：按住不进入按压面',
      spec: { adr: 'press-channel' },
      props: { disabled: true },
      steps: [
        heldPressIgnored('switch', 'root', '禁用时不接受按压'),
        { kind: 'setProps', props: { disabled: false, loading: true } },
        heldPressIgnored('switch', 'root', '提交中不接受按压'),
        { kind: 'setProps', props: { loading: false, readOnly: true } },
        heldPressIgnored('switch', 'root', '只读时不接受按压'),
      ],
    },
    {
      name: '初始未选中：role=switch、aria-checked=false、data-state=unchecked',
      spec: { apg: APG },
      initial: {
        order: ['root', 'thumb'],
        counts: { root: 1, thumb: 1 },
        parts: {
          root: {
            'role': 'switch',
            'type': 'button',
            'aria-checked': 'false',
            'data-state': 'unchecked',
            'data-disabled': null,
            'data-pressed': null,
            // 轨道接 Action Control 家族：text 档、outline 形态、常显、字形档随 size（缺省 md）
            'data-xh-action-control': '',
            'data-xh-action-profile': 'text',
            'data-xh-action-variant': 'outline',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'md',
          },
          thumb: { 'data-state': 'unchecked' },
        },
      },
    },
    {
      name: '点击切换为选中：aria-checked=true、data-state=checked，派发 checked-change',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        {
          kind: 'click',
          part: 'root',
          expect: {
            parts: {
              root: { 'aria-checked': 'true', 'data-state': 'checked' },
              thumb: { 'data-state': 'checked' },
            },
            events: [{ type: 'checked-change', detail: { checked: true } }],
          },
        },
      ],
    },
    {
      name: '受控 checked：点击只发 checked-change 不自改 DOM，父写回后才变',
      spec: { adr: 'controlled-uncontrolled' },
      props: { checked: false },
      steps: [
        {
          kind: 'click',
          part: 'root',
          expect: {
            parts: { root: { 'aria-checked': 'false', 'data-state': 'unchecked' } },
            events: [{ type: 'checked-change', detail: { checked: true } }],
          },
        },
        { kind: 'setProps', props: { checked: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'checked' } },
          expect: { parts: { root: { 'aria-checked': 'true' } } },
        },
      ],
    },
    {
      name: 'disabled：原生 disabled + data-disabled，点击不切换、不派发',
      spec: { apg: APG },
      props: { disabled: true },
      steps: [
        { kind: 'click', part: 'root' },
        dispatchClickOnDisabled('switch', 'root', {
          parts: { root: { 'disabled': '', 'data-disabled': '', 'aria-checked': 'false', 'data-state': 'unchecked' } },
          events: [],
        }),
      ],
    },
  ],
}
