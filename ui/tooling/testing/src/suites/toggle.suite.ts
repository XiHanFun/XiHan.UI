import type { ConformanceSuite } from '../conformance/types'
import { toggleAnatomy, toggleKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

export const toggleSuite: ConformanceSuite = {
  component: 'toggle',
  anatomy: toggleAnatomy,
  keyboard: toggleKeyboard,
  fixture: { part: 'root', tag: 'button', children: [{ text: 'B' }] },
  cases: [
    {
      // Space / Enter 切换由平台的按钮激活行为负责，我们不自己接这两个键。
      // 该守的就是"它确实是原生 <button type=button>"——不是的话平台不会替我们翻键。
      name: 'Space / Enter 切换：角色节点是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['toggle.kbd.toggle'],
      steps: [nativeActivation('toggle', 'root')],
    },
    {
      name: '初始未按下：type=button、aria-pressed=false、data-state=off',
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
