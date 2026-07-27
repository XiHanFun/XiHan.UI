import type { ConformanceSuite } from '../conformance/types'
import { switchAnatomy, switchKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/switch/'

export const switchSuite: ConformanceSuite = {
  component: 'switch',
  anatomy: switchAnatomy,
  keyboard: switchKeyboard,
  fixture: { part: 'root', tag: 'button' },
  cases: [
    {
      // Space / Enter 切换由平台的按钮激活行为负责，我们不自己接这两个键。
      // 该守的就是"它确实是原生 <button type=button>"——不是的话平台不会替我们翻键。
      name: 'Space / Enter 切换：角色节点是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['switch.kbd.toggle'],
      steps: [nativeActivation('switch', 'root')],
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
