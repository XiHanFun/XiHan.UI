import type { ConformanceSuite } from '../conformance/types'
import { checkboxAnatomy, checkboxKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/'

export const checkboxSuite: ConformanceSuite = {
  component: 'checkbox',
  anatomy: checkboxAnatomy,
  keyboard: checkboxKeyboard,
  fixture: { part: 'root', tag: 'button' },
  cases: [
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
      name: 'disabled：原生 disabled + data-disabled，点击不切换、不派发',
      spec: { apg: APG },
      props: { disabled: true },
      steps: [
        {
          kind: 'click',
          part: 'root',
          expect: {
            parts: { root: { 'disabled': '', 'data-disabled': '', 'aria-checked': 'false', 'data-state': 'unchecked' } },
            events: [],
          },
        },
      ],
    },
  ],
}
