import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { dynamicInputAnatomy, dynamicInputKeyboard } from '@xihan-ui/headless'

// 动态录入不在 APG 的模式清单里：三类把手都是原生 button，规范面落在按钮上。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

const ROWS = 3

/** 一行：内容位 + 把手位（上移、下移、删除）。下标由作者声明，两个适配器读的是同一份声明。 */
function row(index: number): FixtureNode {
  return {
    part: 'item',
    attrs: { index: String(index) },
    children: [
      { part: 'item-content', text: `第 ${index + 1} 行` },
      {
        part: 'item-action',
        children: [
          { part: 'move-up-trigger', tag: 'button', text: '↑' },
          { part: 'move-down-trigger', tag: 'button', text: '↓' },
          { part: 'remove-trigger', tag: 'button', text: '×' },
        ],
      },
    ],
  }
}

const addTrigger: FixtureNode = { part: 'add-trigger', tag: 'button', text: '新增一行' }

/** 一行的部件在文档里的顺序。 */
function rowOrder(index: number): string[] {
  return [
    `item[${index}]`,
    `item-content[${index}]`,
    `item-action[${index}]`,
    `move-up-trigger[${index}]`,
    `move-down-trigger[${index}]`,
    `remove-trigger[${index}]`,
  ]
}

export const dynamicInputSuite: ConformanceSuite = {
  component: 'dynamic-input',
  anatomy: dynamicInputAnatomy,
  keyboard: dynamicInputKeyboard,
  // 行由作者按当前值铺，fixture 就按三行铺；各用例自带与行数对得上的初值
  fixture: {
    part: 'root',
    children: [...Array.from({ length: ROWS }, (_, i) => row(i)), addTrigger],
  },
  cases: [
    {
      name: '缺省：根不写 role；行下标如实落到行内每个部件上；没开换序时两个换序把手收起',
      spec: { apg: APG },
      props: { defaultValue: ['甲', '乙', '丙'] },
      initial: {
        parts: {
          'root': {
            'role': null,
            'data-disabled': null,
            'data-empty': null,
            'data-at-min': null,
            'data-at-max': null,
            'data-movable': null,
          },
          'item[0]': { 'data-index': '0', 'data-first': '', 'data-last': null },
          'item[2]': { 'data-index': '2', 'data-first': null, 'data-last': '' },
          'item-content[1]': { 'data-index': '1' },
          'item-action[1]': { 'data-index': '1' },
          // 换序没开：两个把手收起，且明确报"按不动"
          'move-up-trigger[1]': { 'hidden': '', 'aria-disabled': 'true' },
          'move-down-trigger[1]': { 'hidden': '', 'aria-disabled': 'true' },
          'remove-trigger[1]': {
            'type': 'button',
            'hidden': null,
            'data-index': '1',
            'aria-disabled': 'false',
            'data-disabled': null,
            // 把手里只有一个叉，行号只能由名字带出来
            'aria-label': 'Remove row 2 of 3',
          },
          // 新增把手装的是一句话，名字取它自己的内容，组件不写 aria-label 去盖掉它
          'add-trigger': { 'type': 'button', 'aria-disabled': 'false', 'aria-label': null },
        },
      },
    },
    {
      name: '行的解剖：每一行三个部件各一份，按内容位、把手位、三个把手的文档序排列',
      spec: { apg: APG },
      props: { defaultValue: ['甲', '乙', '丙'] },
      initial: {
        order: ['root', ...Array.from({ length: ROWS }, (_, i) => rowOrder(i)).flat(), 'add-trigger'],
        counts: {
          'root': 1,
          'item': ROWS,
          'item-content': ROWS,
          'item-action': ROWS,
          'move-up-trigger': ROWS,
          'move-down-trigger': ROWS,
          'remove-trigger': ROWS,
          'add-trigger': 1,
        },
      },
    },
    {
      name: 'movable：换序把手露面；首行上不去、末行下不来',
      spec: { apg: APG },
      props: { defaultValue: ['甲', '乙', '丙'], movable: true },
      initial: {
        parts: {
          'root': { 'data-movable': '' },
          'move-up-trigger[0]': {
            'hidden': null,
            'aria-disabled': 'true',
            'data-disabled': '',
            'aria-label': 'Move row 1 of 3 up',
          },
          'move-up-trigger[1]': { 'aria-disabled': 'false', 'data-disabled': null },
          'move-down-trigger[1]': { 'aria-disabled': 'false', 'aria-label': 'Move row 2 of 3 down' },
          'move-down-trigger[2]': { 'aria-disabled': 'true', 'data-disabled': '' },
        },
      },
    },
    {
      name: '点新增：末尾多出一行，对外报一次值变化',
      spec: { apg: APG },
      props: { defaultValue: ['甲', '乙', '丙'], createItem: () => '丁' },
      steps: [
        {
          kind: 'click',
          part: 'add-trigger',
          expect: {
            events: [{ type: 'value-change', detail: { value: ['甲', '乙', '丙', '丁'] } }],
          },
        },
      ],
    },
    {
      name: '不给 createItem 就补一个空位，行数照样长一行',
      spec: { apg: APG },
      props: { defaultValue: ['甲'] },
      fixture: base => ({ ...base, children: [row(0), addTrigger] }),
      steps: [
        {
          kind: 'click',
          part: 'add-trigger',
          expect: {
            events: [{ type: 'value-change', detail: { value: ['甲', null] } }],
          },
        },
      ],
    },
    {
      name: '到 max：新增把手转 aria-disabled 而不是原生 disabled，再点不发事件',
      spec: { apg: APG },
      props: { defaultValue: ['甲', '乙', '丙'], max: 3 },
      initial: {
        parts: {
          'root': { 'data-at-max': '' },
          // 用原生 disabled 的话浏览器根本不派 click，禁用守卫走不到，
          // 而且禁用元素持不住焦点，连按到顶那一下键盘用户会当场丢焦点
          'add-trigger': { 'aria-disabled': 'true', 'disabled': null, 'data-disabled': '' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'add-trigger',
          expect: {
            events: [],
            // 按不动，但焦点仍在它身上
            activeElement: { part: 'add-trigger', exact: true },
          },
        },
      ],
    },
    {
      name: '到 min：删除把手转 aria-disabled 而不是原生 disabled，再点不发事件',
      spec: { apg: APG },
      props: { defaultValue: ['甲', '乙', '丙'], min: 3 },
      initial: {
        parts: {
          'root': { 'data-at-min': '' },
          'remove-trigger[0]': { 'aria-disabled': 'true', 'disabled': null, 'data-disabled': '' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'remove-trigger[0]',
          expect: { events: [], activeElement: { part: 'remove-trigger[0]', exact: true } },
        },
      ],
    },
    {
      name: '删掉末行：值去掉那一项，焦点接给接位的那一行',
      spec: { apg: APG },
      props: { defaultValue: ['甲', '乙', '丙'] },
      steps: [
        {
          kind: 'click',
          part: 'remove-trigger[2]',
          expect: { events: [{ type: 'value-change', detail: { value: ['甲', '乙'] } }] },
        },
        {
          // 被点的那个把手随行离场，不接住的话焦点会掉到 body 上
          kind: 'settle',
          until: { activeElement: 'remove-trigger[1]' },
          expect: { activeElement: { part: 'remove-trigger[1]', exact: true } },
        },
      ],
    },
    {
      name: '删到一行不剩：焦点交回新增把手',
      spec: { apg: APG },
      props: { defaultValue: ['甲'] },
      fixture: base => ({ ...base, children: [row(0), addTrigger] }),
      steps: [
        {
          kind: 'click',
          part: 'remove-trigger',
          expect: { events: [{ type: 'value-change', detail: { value: [] } }] },
        },
        {
          kind: 'settle',
          until: { activeElement: 'add-trigger' },
          expect: {
            activeElement: { part: 'add-trigger', exact: true },
            parts: { root: { 'data-empty': '', 'data-at-min': '' } },
          },
        },
      ],
    },
    {
      name: '上移一行：两项对调，焦点跟着这一行挪到新位置上的同一个把手',
      spec: { apg: APG },
      props: { defaultValue: ['甲', '乙', '丙'], movable: true },
      steps: [
        {
          kind: 'click',
          part: 'move-up-trigger[1]',
          expect: { events: [{ type: 'value-change', detail: { value: ['乙', '甲', '丙'] } }] },
        },
        {
          kind: 'settle',
          until: { activeElement: 'move-up-trigger[0]' },
          expect: { activeElement: { part: 'move-up-trigger[0]', exact: true } },
        },
      ],
    },
    {
      name: '下移一行：与上移对称，焦点落到下移把手的新位置',
      spec: { apg: APG },
      props: { defaultValue: ['甲', '乙', '丙'], movable: true },
      steps: [
        {
          kind: 'click',
          part: 'move-down-trigger[0]',
          expect: { events: [{ type: 'value-change', detail: { value: ['乙', '甲', '丙'] } }] },
        },
        {
          kind: 'settle',
          until: { activeElement: 'move-down-trigger[1]' },
          expect: { activeElement: { part: 'move-down-trigger[1]', exact: true } },
        },
      ],
    },
    {
      name: '受控 value：宿主不写回则界面纹丝不动，回调照发；宿主写回才跟着走',
      spec: { apg: APG },
      props: { value: ['甲', '乙', '丙'] },
      steps: [
        {
          kind: 'click',
          part: 'remove-trigger[0]',
          expect: {
            events: [{ type: 'value-change', detail: { value: ['乙', '丙'] } }],
            // 名字里的总行数还是 3：宿主没写回，组件就没有自作主张
            parts: { 'remove-trigger[0]': { 'aria-label': 'Remove row 1 of 3' } },
          },
        },
        {
          kind: 'setProps',
          props: { value: ['乙', '丙'] },
          expect: {
            parts: { 'remove-trigger[0]': { 'aria-label': 'Remove row 1 of 2' } },
          },
        },
      ],
    },
    {
      name: 'disabled：三类把手全部按不动，点了不发事件',
      spec: { apg: APG },
      props: { defaultValue: ['甲', '乙', '丙'], movable: true, disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'item[0]': { 'data-disabled': '' },
          'add-trigger': { 'aria-disabled': 'true', 'disabled': null },
          'remove-trigger[0]': { 'aria-disabled': 'true', 'disabled': null },
          'move-down-trigger[0]': { 'aria-disabled': 'true', 'disabled': null },
        },
      },
      steps: [
        { kind: 'click', part: 'add-trigger', expect: { events: [] } },
        { kind: 'click', part: 'remove-trigger[0]', expect: { events: [] } },
        { kind: 'click', part: 'move-down-trigger[0]', expect: { events: [] } },
      ],
    },
    {
      name: 'translations：作者给的文案盖过内置文案，行号照样带出来',
      spec: { apg: APG },
      props: {
        defaultValue: ['甲', '乙', '丙'],
        movable: true,
        translations: {
          removeTrigger: (index: number, count: number) => `删除第 ${index} 行，共 ${count} 行`,
          moveUpTrigger: (index: number) => `把第 ${index} 行往上挪`,
          moveDownTrigger: (index: number) => `把第 ${index} 行往下挪`,
        },
      },
      initial: {
        parts: {
          'remove-trigger[1]': { 'aria-label': '删除第 2 行，共 3 行' },
          'move-up-trigger[1]': { 'aria-label': '把第 2 行往上挪' },
          'move-down-trigger[1]': { 'aria-label': '把第 2 行往下挪' },
        },
      },
    },
  ],
}
