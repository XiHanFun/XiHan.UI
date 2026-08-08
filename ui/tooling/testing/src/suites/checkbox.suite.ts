import type { ConformanceSuite } from '../conformance/types'
import { checkboxAnatomy, checkboxKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/'

export const checkboxSuite: ConformanceSuite = {
  component: 'checkbox',
  anatomy: checkboxAnatomy,
  keyboard: checkboxKeyboard,
  // 复选框的名字由作者写在角色节点上：组件不生成文案，也没有承载文案的部件
  fixture: { part: 'root', tag: 'button', attrs: { 'aria-label': '同意条款' } },
  cases: [
    {
      // Space / Enter 由平台的按钮激活行为翻成 click，组件不自己接这两个键；这里守它确实是原生 button[type=button]
      name: 'Space / Enter 切换：角色节点是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['checkbox.kbd.toggle'],
      steps: [nativeActivation('checkbox', 'root')],
    },
    {
      name: '初始未选中：role=checkbox、aria-checked=false、data-state=unchecked',
      spec: { apg: APG },
      initial: {
        order: ['root', 'indicator'],
        counts: { root: 1, indicator: 1 },
        parts: {
          root: {
            'role': 'checkbox',
            'type': 'button',
            'aria-checked': 'false',
            'data-state': 'unchecked',
            'data-disabled': null,
          },
          indicator: { 'data-state': 'unchecked' },
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
              indicator: { 'data-state': 'checked' },
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
      // 一组子项勾了一部分时父项显示半选。半选是外部数据算出来的显示态，
      // 用户切不进去——点它一律走向全选，这是 APG 对父项复选框的约定
      name: '半选：aria-checked=mixed、data-state=indeterminate',
      spec: { apg: APG },
      props: { defaultChecked: 'indeterminate' },
      initial: {
        parts: {
          root: { 'aria-checked': 'mixed', 'data-state': 'indeterminate' },
          indicator: { 'data-state': 'indeterminate' },
        },
      },
    },
    {
      name: '半选点一下走向全选，而不是全不选',
      spec: { apg: APG },
      props: { defaultChecked: 'indeterminate' },
      steps: [
        {
          kind: 'click',
          part: 'root',
          expect: {
            parts: {
              root: { 'aria-checked': 'true', 'data-state': 'checked' },
              indicator: { 'data-state': 'checked' },
            },
            events: [{ type: 'checked-change', detail: { checked: true } }],
          },
        },
      ],
    },
    {
      name: '受控半选：父写回 indeterminate 后显示半选',
      spec: { adr: 'controlled-uncontrolled' },
      props: { checked: false },
      steps: [
        { kind: 'setProps', props: { checked: 'indeterminate' } },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'indeterminate' } },
          expect: { parts: { root: { 'aria-checked': 'mixed' } } },
        },
      ],
    },
    {
      name: 'disabled：原生 disabled + data-disabled，点击不切换、不派发',
      spec: { apg: APG },
      props: { disabled: true },
      steps: [
        { kind: 'click', part: 'root' },
        dispatchClickOnDisabled('checkbox', 'root', {
          parts: { root: { 'disabled': '', 'data-disabled': '', 'aria-checked': 'false', 'data-state': 'unchecked' } },
          events: [],
        }),
      ],
    },
  ],
}
