import type { ConformanceSuite } from '../conformance/types'
import { radioGroupAnatomy, radioGroupKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/'

// indicator 由 item 内部装配，不作为独立 fixture 节点；采集器仍会抓到它。
// 条目 b 用 aria-disabled 表达禁用（不是原生 disabled），导航时被跳过但仍可聚焦。
export const radioGroupSuite: ConformanceSuite = {
  component: 'radio-group',
  anatomy: radioGroupAnatomy,
  keyboard: radioGroupKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'label', text: '尺寸' },
      { part: 'item', attrs: { value: 'a' }, children: [{ part: 'item-text', text: 'A' }] },
      { part: 'item', attrs: { value: 'b', disabled: '' }, children: [{ part: 'item-text', text: 'B' }] },
      { part: 'item', attrs: { value: 'c' }, children: [{ part: 'item-text', text: 'C' }] },
    ],
  },
  cases: [
    {
      name: '初始无选中：容器 tabindex=0 兜底进 Tab 序列，条目全 -1 且 aria-checked 显式 false',
      spec: { apg: `${APG}#roles_states_properties` },
      initial: {
        order: [
          'root',
          'label',
          'item[0]',
          'indicator[0]',
          'item-text[0]',
          'item[1]',
          'indicator[1]',
          'item-text[1]',
          'item[2]',
          'indicator[2]',
          'item-text[2]',
        ],
        counts: { 'root': 1, 'label': 1, 'item': 3, 'item-text': 3, 'indicator': 3 },
        parts: {
          'root': {
            'role': 'radiogroup',
            'aria-labelledby': '@part(label)',
            'aria-orientation': 'vertical',
            'data-orientation': 'vertical',
            'data-disabled': null,
            'tabindex': '0',
          },
          'item': [
            {
              'role': 'radio',
              'aria-checked': 'false',
              'aria-disabled': 'false',
              'data-value': 'a',
              'data-state': 'unchecked',
              'data-disabled': null,
              'tabindex': '-1',
              // 集合条目绝不输出原生 disabled
              'disabled': null,
            },
            {
              'role': 'radio',
              'aria-checked': 'false',
              'aria-disabled': 'true',
              'data-value': 'b',
              'data-state': 'unchecked',
              'data-disabled': '',
              'tabindex': '-1',
              'disabled': null,
            },
            {
              'role': 'radio',
              'aria-checked': 'false',
              'aria-disabled': 'false',
              'data-value': 'c',
              'data-state': 'unchecked',
              'tabindex': '-1',
              'disabled': null,
            },
          ],
          'indicator': [
            { 'aria-hidden': 'true', 'data-state': 'unchecked' },
            { 'aria-hidden': 'true', 'data-state': 'unchecked' },
            { 'aria-hidden': 'true', 'data-state': 'unchecked' },
          ],
          'item-text': [
            { 'data-state': 'unchecked' },
            { 'data-state': 'unchecked', 'data-disabled': '' },
            { 'data-state': 'unchecked' },
          ],
        },
        activeElement: null,
      },
    },
    {
      name: '有选中：选中条目 tabindex=0；焦点在组外时容器仍兜底 0（锚点失效也进得来）',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { defaultValue: 'a' },
      initial: {
        parts: {
          // 容器的 tabindex 只看焦点在不在组内，不看有没有选中：
          // 受控值不在选项里/条目被删时没有条目会认领 0，容器必须兜底，否则整组键盘不可达。
          // 焦点进组后容器让位 -1（见"焦点从组外落到容器"用例）。
          'root': { tabindex: '0' },
          'item': [
            { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
            { 'aria-checked': 'false', 'data-state': 'unchecked', 'tabindex': '-1' },
            { 'aria-checked': 'false', 'data-state': 'unchecked', 'tabindex': '-1' },
          ],
          'indicator': [{ 'data-state': 'checked' }, { 'data-state': 'unchecked' }, { 'data-state': 'unchecked' }],
          'item-text': [{ 'data-state': 'checked' }, { 'data-state': 'unchecked' }, { 'data-state': 'unchecked' }],
        },
      },
    },
    {
      name: '点击条目选中：aria-checked 翻真、锚点随焦点迁移，派发 value-change',
      spec: { apg: `${APG}#roles_states_properties` },
      steps: [
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: {
              root: { tabindex: '-1' },
              item: [
                { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
              ],
            },
            activeElement: { part: 'item[0]', exact: true },
            events: [{ type: 'value-change', detail: { value: 'a' } }],
          },
        },
      ],
    },
    {
      name: '方向键切换选中并跳过禁用条目，走到尽头回绕',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['radio-group.kbd.next', 'radio-group.kbd.prev'],
      steps: [
        { kind: 'click', part: 'item[0]' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false', 'tabindex': '-1' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
                { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
              ],
            },
            activeElement: { part: 'item[2]', exact: true },
            events: [{ type: 'value-change', detail: { value: 'c' } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
              ],
            },
            activeElement: { part: 'item[0]', exact: true },
            events: [{ type: 'value-change', detail: { value: 'a' } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false', 'tabindex': '-1' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
              ],
            },
            activeElement: { part: 'item[2]', exact: true },
            events: [{ type: 'value-change', detail: { value: 'c' } }],
          },
        },
      ],
    },
    {
      name: '焦点从组外落到容器：转投首个可停留条目，Space 选中它',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['radio-group.kbd.select'],
      steps: [
        {
          kind: 'focus',
          part: 'root',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false', 'tabindex': '0' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
              ],
            },
            activeElement: { part: 'item[0]', exact: true },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true', 'data-state': 'checked' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: 'a' } }],
          },
        },
      ],
    },
    {
      name: '受控 value：点击只发 value-change 不自改 DOM，父写回 value 后才切选中',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: 'a' },
      steps: [
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '-1' },
                { 'aria-checked': 'false' },
                // 焦点锚点已迁到 item[2]，但选中值仍由父持有
                { 'aria-checked': 'false', 'data-state': 'unchecked', 'tabindex': '0' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: 'c' } }],
          },
        },
        { kind: 'setProps', props: { value: 'c' } },
        {
          kind: 'settle',
          until: { attr: { part: 'item[2]', name: 'aria-checked', value: 'true' } },
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false', 'data-state': 'unchecked' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true', 'data-state': 'checked' },
              ],
            },
          },
        },
      ],
    },
    {
      name: '禁用条目：点击不选中不派发，焦点仍可落上去并成为导航起点',
      spec: { apg: `${APG}#roles_states_properties` },
      steps: [
        {
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false', 'aria-disabled': 'true', 'data-state': 'unchecked', 'tabindex': '0' },
                { 'aria-checked': 'false' },
              ],
            },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
              ],
            },
            activeElement: { part: 'item[2]', exact: true },
            events: [{ type: 'value-change', detail: { value: 'c' } }],
          },
        },
      ],
    },
    {
      name: '整组 disabled：条目全部 aria-disabled，点击与方向键都不改选中',
      spec: { apg: APG },
      props: { disabled: true },
      steps: [
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: {
              root: { 'data-disabled': '' },
              item: [
                { 'aria-checked': 'false', 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null },
                { 'aria-checked': 'false', 'aria-disabled': 'true', 'data-disabled': '' },
                { 'aria-checked': 'false', 'aria-disabled': 'true', 'data-disabled': '' },
              ],
            },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false' },
              ],
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '横排：aria-orientation 转 horizontal，上下键与左右键同样切换',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { orientation: 'horizontal' },
      steps: [
        { kind: 'click', part: 'item[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: {
              root: { 'aria-orientation': 'horizontal', 'data-orientation': 'horizontal' },
              item: [
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true', 'data-state': 'checked' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: 'c' } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true', 'data-state': 'checked' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: 'a' } }],
          },
        },
      ],
    },
  ],
}
