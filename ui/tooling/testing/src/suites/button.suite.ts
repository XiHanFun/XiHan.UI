import type { ConformanceSuite } from '../conformance/types'
import { buttonAnatomy, buttonKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

export const buttonSuite: ConformanceSuite = {
  component: 'button',
  anatomy: buttonAnatomy,
  keyboard: buttonKeyboard,
  fixture: { part: 'root', tag: 'button', children: [{ text: '按钮' }] },
  cases: [
    {
      // Enter / Space 激活由平台的按钮激活行为负责，我们不自己接这两个键。
      // 该守的就是"它确实是原生 <button type=button>"——不是的话平台不会替我们翻键。
      name: 'Enter / Space 激活：角色节点是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['button.kbd.activate'],
      steps: [nativeActivation('button', 'root')],
    },
    {
      name: '默认：type=button，单一 root，无禁用/加载态',
      spec: { apg: APG },
      initial: {
        order: ['root'],
        counts: { root: 1, label: 0 },
        parts: {
          root: {
            'type': 'button',
            'disabled': null,
            'aria-disabled': null,
            'data-state': null,
            'data-disabled': null,
            'data-loading': null,
          },
        },
      },
    },
    {
      name: 'variant/size/type 属性接线到 data-* 与原生 type',
      spec: { apg: APG },
      props: { variant: 'solid', size: 'sm', type: 'submit' },
      initial: {
        parts: { root: { 'type': 'submit', 'data-variant': 'solid', 'data-size': 'sm' } },
      },
    },
    {
      name: 'disabled：原生 disabled + data-state=disabled，不上 aria-disabled',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { disabled: true },
      initial: {
        parts: {
          root: {
            'disabled': '',
            'data-disabled': '',
            'data-state': 'disabled',
            'aria-disabled': null,
            'data-loading': null,
          },
        },
      },
    },
    {
      name: 'loading：aria-disabled=true + data-state=loading，不上原生 disabled（保留焦点）',
      spec: { apg: APG },
      props: { loading: true },
      initial: {
        parts: {
          root: {
            'aria-disabled': 'true',
            'data-loading': '',
            'data-state': 'loading',
            'disabled': null,
          },
        },
      },
    },
  ],
}
