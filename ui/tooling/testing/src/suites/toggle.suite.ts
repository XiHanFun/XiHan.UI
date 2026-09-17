import type { ConformanceSuite } from '../conformance/types'
import { toggleAnatomy, toggleKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'
import { heldPress, heldPressIgnored } from './shared/press-channel'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

export const toggleSuite: ConformanceSuite = {
  component: 'toggle',
  anatomy: toggleAnatomy,
  keyboard: toggleKeyboard,
  fixture: { part: 'root', tag: 'button', children: [{ text: 'B' }] },
  cases: [
    {
      // Space / Enter 由平台的按钮激活行为翻成 click，组件不自己接这两个键；这里守它确实是原生 button[type=button]
      name: 'Space / Enter 切换：角色节点是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['toggle.kbd.toggle'],
      steps: [nativeActivation('toggle', 'root')],
    },
    {
      name: 'Space / Enter 按住与触屏按下：root 投影 data-pressed，与 aria-pressed 的开关态无关',
      spec: { adr: 'press-channel' },
      covers: ['toggle.kbd.press'],
      steps: [
        heldPress('toggle', 'root'),
        // 按住面撤下后开关态没被碰过：keydown / keyup 不经平台激活，jsdom 不翻成 click
        { kind: 'settle', until: { attr: { part: 'root', name: 'data-pressed', value: null } }, expect: { parts: { root: { 'aria-pressed': 'false' } } } },
      ],
    },
    {
      name: 'disabled：按住不进入按压面',
      spec: { adr: 'press-channel' },
      props: { disabled: true },
      steps: [heldPressIgnored('toggle', 'root', '禁用时不接受按压')],
    },
    {
      name: '初始未按下：type=button、aria-pressed=false、data-state=off，形态缺省显式落 subtle',
      spec: { apg: APG },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'type': 'button',
            'aria-pressed': 'false',
            'data-state': 'off',
            'data-disabled': null,
            'data-pressed': null,
            'data-xh-action-control': '',
            'data-xh-action-profile': 'text',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'md',
            'data-xh-action-variant': 'subtle',
            'data-variant': 'subtle',
          },
        },
      },
    },
    {
      name: 'solid：未按下投 ghost、按下投 solid（只在按下时品牌实心），data-variant 始终 solid',
      spec: { adr: 'action-control-family' },
      props: { variant: 'solid' },
      initial: {
        parts: { root: { 'data-variant': 'solid', 'data-xh-action-variant': 'ghost' } },
      },
      steps: [
        {
          kind: 'click',
          part: 'root',
          expect: {
            parts: { root: { 'data-state': 'on', 'data-variant': 'solid', 'data-xh-action-variant': 'solid' } },
          },
        },
      ],
    },
    {
      name: '图标与尺寸映射到动作控件视觉角色',
      spec: { adr: 'action-control-family' },
      props: { iconOnly: true, size: 'lg' },
      initial: {
        parts: {
          root: {
            'data-xh-action-profile': 'icon',
            'data-xh-action-size': 'lg',
          },
        },
      },
    },
    {
      name: '点击按下：aria-pressed=true、data-state=on，派发 pressed-change',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        {
          kind: 'click',
          part: 'root',
          expect: {
            parts: {
              root: { 'aria-pressed': 'true', 'data-state': 'on' },
            },
            events: [{ type: 'pressed-change', detail: { pressed: true } }],
          },
        },
      ],
    },
    {
      name: '受控 pressed：点击只发 pressed-change 不自改 DOM，父写回后才变',
      spec: { adr: 'controlled-uncontrolled' },
      props: { pressed: false },
      steps: [
        {
          kind: 'click',
          part: 'root',
          expect: {
            parts: { root: { 'aria-pressed': 'false', 'data-state': 'off' } },
            events: [{ type: 'pressed-change', detail: { pressed: true } }],
          },
        },
        { kind: 'setProps', props: { pressed: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'on' } },
          expect: { parts: { root: { 'aria-pressed': 'true' } } },
        },
      ],
    },
    {
      name: 'disabled：原生 disabled + data-disabled，点击不切换、不派发',
      spec: { apg: APG },
      props: { disabled: true },
      steps: [
        { kind: 'click', part: 'root' },
        dispatchClickOnDisabled('toggle', 'root', {
          parts: { root: { 'disabled': '', 'data-disabled': '', 'aria-pressed': 'false', 'data-state': 'off' } },
          events: [],
        }),
      ],
    },
  ],
}
