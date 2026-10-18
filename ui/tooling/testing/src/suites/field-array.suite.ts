import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { fieldArrayAnatomy, fieldArrayKeyboard } from '@xihan-ui/headless'
import { heldPress, heldPressIgnored } from './shared/press-channel'

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
          { part: 'item-delete-trigger', tag: 'button' },
        ],
      },
    ],
  }
}

const addTrigger: FixtureNode = { part: 'add-trigger', tag: 'button', text: '新增一行' }

const COLUMNS = [{ id: 'date', label: '日期' }, { id: 'amount', label: '金额' }]

/** 表格排布的一行：行头、每列一格、把手格。 */
function tableRow(index: number): FixtureNode {
  return {
    part: 'item',
    attrs: { index: String(index) },
    children: [
      { part: 'item-label', text: String(index + 1) },
      ...COLUMNS.map(column => ({ part: 'item-cell', attrs: { value: column.id }, text: `${column.label} ${index + 1}` })),
      { part: 'item-action', children: [{ part: 'item-delete-trigger', tag: 'button' }] },
    ],
  }
}

/** 表格排布：表头与各行放在 table 部件里，新增把手仍是根的最后一个子节点。 */
function tableFixture(base: FixtureNode): FixtureNode {
  return {
    ...base,
    children: [
      {
        part: 'table',
        children: [
          { part: 'header', children: COLUMNS.map(column => ({ part: 'column-header', attrs: { value: column.id } })) },
          ...Array.from({ length: ROWS }, (_, i) => tableRow(i)),
        ],
      },
      addTrigger,
    ],
  }
}

/** 某一行的把手：把手带着作者声明的行下标，按它选到那一行的。 */
function handle(part: string, index: number): string {
  return `[data-scope="field-array"][data-part="${part}"][data-index="${index}"]`
}

/** 一行的部件在文档里的顺序。 */
function rowOrder(index: number): string[] {
  return [
    `item[${index}]`,
    `item-content[${index}]`,
    `item-action[${index}]`,
    `move-up-trigger[${index}]`,
    `move-down-trigger[${index}]`,
    `item-delete-trigger[${index}]`,
  ]
}

export const fieldArraySuite: ConformanceSuite = {
  component: 'field-array',
  anatomy: fieldArrayAnatomy,
  keyboard: fieldArrayKeyboard,
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
          // 三颗行内把手是只有字形的离散动作钮：Action Control icon ghost 档，xs 正方盒，常显
          'move-up-trigger[1]': {
            'hidden': '',
            'aria-disabled': 'true',
            'data-xh-action-control': '',
            'data-xh-action-profile': 'icon',
            'data-xh-action-variant': 'ghost',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'xs',
          },
          'move-down-trigger[1]': {
            'hidden': '',
            'aria-disabled': 'true',
            'data-xh-action-control': '',
            'data-xh-action-profile': 'icon',
            'data-xh-action-variant': 'ghost',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'xs',
          },
          'item-delete-trigger[1]': {
            'type': 'button',
            'hidden': null,
            'data-index': '1',
            'aria-disabled': 'false',
            'data-disabled': null,
            // 把手里只有一个叉，行号只能由名字带出来
            'aria-label': 'Remove row 2 of 3',
            'data-xh-action-control': '',
            'data-xh-action-profile': 'icon',
            'data-xh-action-variant': 'ghost',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'xs',
          },
          // 新增把手装的是一句话，名字取它自己的内容，组件不写 aria-label 去盖掉它；
          // 它是带文案的动作钮：text outline 档（中性描边，虚线由皮肤给），高一个控件
          'add-trigger': {
            'type': 'button',
            'aria-disabled': 'false',
            'aria-label': null,
            'data-xh-action-control': '',
            'data-xh-action-profile': 'text',
            'data-xh-action-variant': 'outline',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'md',
          },
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
          'item-delete-trigger': ROWS,
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
      name: 'movable：拖动把手只接指针，不占 Tab 位、对读屏隐藏；行带上拖动换序认的项标识（行 key）；不换序时收起',
      spec: { apg: APG },
      props: { defaultValue: ['甲', '乙', '丙'], movable: true },
      fixture: base => ({
        ...base,
        children: [
          ...Array.from({ length: ROWS }, (_, i) => ({
            ...row(i),
            children: [
              { part: 'item-content', text: `第 ${i + 1} 行` },
              { part: 'item-action', children: [{ part: 'item-drag-trigger', tag: 'button' }, { part: 'item-delete-trigger', tag: 'button' }] },
            ],
          })),
          addTrigger,
        ],
      }),
      initial: {
        parts: {
          'root': { 'data-dragging': null },
          'item[0]': { 'data-value': 'row-0', 'data-dragging': null },
          'item[2]': { 'data-value': 'row-2' },
          'item-drag-trigger[0]': {
            'hidden': null,
            'tabindex': '-1',
            'aria-hidden': 'true',
            'type': 'button',
            'data-disabled': null,
            'data-xh-action-control': '',
            'data-xh-action-profile': 'icon',
            'data-xh-action-variant': 'ghost',
            'data-xh-action-size': 'xs',
          },
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
            events: [{ type: 'value-change', detail: { value: ['甲', '乙', '丙', '丁'], mutation: { type: 'insert', index: 3 } } }],
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
            events: [{ type: 'value-change', detail: { value: ['甲', null], mutation: { type: 'insert', index: 1 } } }],
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
          'item-delete-trigger[0]': { 'aria-disabled': 'true', 'disabled': null, 'data-disabled': '' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'item-delete-trigger[0]',
          expect: { events: [], activeElement: { part: 'item-delete-trigger[0]', exact: true } },
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
          part: 'item-delete-trigger[2]',
          expect: { events: [{ type: 'value-change', detail: { value: ['甲', '乙'], mutation: { type: 'remove', index: 2 } } }] },
        },
        {
          // 被点的那个把手随行离场，不接住的话焦点会掉到 body 上
          kind: 'settle',
          until: { activeElement: 'item-delete-trigger[1]' },
          expect: { activeElement: { part: 'item-delete-trigger[1]', exact: true } },
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
          part: 'item-delete-trigger',
          expect: { events: [{ type: 'value-change', detail: { value: [], mutation: { type: 'remove', index: 0 } } }] },
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
          expect: { events: [{ type: 'value-change', detail: { value: ['乙', '甲', '丙'], mutation: { type: 'move', from: 1, to: 0 } } }] },
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
          expect: { events: [{ type: 'value-change', detail: { value: ['乙', '甲', '丙'], mutation: { type: 'move', from: 0, to: 1 } } }] },
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
          part: 'item-delete-trigger[0]',
          expect: {
            events: [{ type: 'value-change', detail: { value: ['乙', '丙'], mutation: { type: 'remove', index: 0 } } }],
            // 名字里的总行数还是 3：宿主没写回，组件就没有自作主张
            parts: { 'item-delete-trigger[0]': { 'aria-label': 'Remove row 1 of 3' } },
          },
        },
        {
          kind: 'setProps',
          props: { value: ['乙', '丙'] },
          expect: {
            parts: { 'item-delete-trigger[0]': { 'aria-label': 'Remove row 1 of 2' } },
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
          'item-delete-trigger[0]': { 'aria-disabled': 'true', 'disabled': null },
          'move-down-trigger[0]': { 'aria-disabled': 'true', 'disabled': null },
        },
      },
      steps: [
        { kind: 'click', part: 'add-trigger', expect: { events: [] } },
        { kind: 'click', part: 'item-delete-trigger[0]', expect: { events: [] } },
        { kind: 'click', part: 'move-down-trigger[0]', expect: { events: [] } },
      ],
    },
    {
      name: 'Space / Enter 按住与触屏按下：四类把手投影 data-pressed，抬起、失焦或指针取消撤下；按住本身不加行、不删行、不换序',
      spec: { adr: 'press-channel' },
      covers: ['field-array.kbd.press'],
      props: { defaultValue: ['甲', '乙', '丙'], movable: true },
      steps: [
        heldPress('field-array', 'add-trigger'),
        heldPress('field-array', 'item-delete-trigger', { selector: handle('item-delete-trigger', 1) }),
        // 首行上不去、末行下不来：换序把手各取按得动的那一行
        heldPress('field-array', 'move-up-trigger', { selector: handle('move-up-trigger', 1) }),
        heldPress('field-array', 'move-down-trigger', { selector: handle('move-down-trigger', 1) }),
        {
          kind: 'settle',
          until: { attr: { part: 'move-down-trigger[1]', name: 'data-pressed', value: null } },
          expect: {
            counts: { item: 3 },
            parts: {
              'add-trigger': { 'data-pressed': null },
              'item-delete-trigger[1]': { 'data-pressed': null },
              'move-up-trigger[1]': { 'data-pressed': null },
              'move-down-trigger[1]': { 'data-pressed': null },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '按不动的把手不进入按压面：到上限的新增、到下限的删除、首行上移与末行下移都是 aria-disabled',
      spec: { adr: 'press-channel' },
      props: { defaultValue: ['甲', '乙', '丙'], movable: true, min: 3, max: 3 },
      steps: [
        heldPressIgnored('field-array', 'add-trigger', '到 max 的新增把手 aria-disabled，不接受按压'),
        heldPressIgnored('field-array', 'item-delete-trigger', '到 min 的删除把手 aria-disabled，不接受按压', { selector: handle('item-delete-trigger', 0) }),
        heldPressIgnored('field-array', 'move-up-trigger', '首行的上移把手 aria-disabled，不接受按压', { selector: handle('move-up-trigger', 0) }),
        heldPressIgnored('field-array', 'move-down-trigger', '末行的下移把手 aria-disabled，不接受按压', { selector: handle('move-down-trigger', 2) }),
      ],
    },
    {
      name: 'disabled / readOnly：四类把手全部 aria-disabled，按住不进入按压面',
      spec: { adr: 'press-channel' },
      props: { defaultValue: ['甲', '乙', '丙'], movable: true, disabled: true },
      steps: [
        heldPressIgnored('field-array', 'add-trigger', '禁用时新增把手 aria-disabled，不接受按压'),
        heldPressIgnored('field-array', 'item-delete-trigger', '禁用时删除把手 aria-disabled，不接受按压', { selector: handle('item-delete-trigger', 1) }),
        heldPressIgnored('field-array', 'move-up-trigger', '禁用时上移把手 aria-disabled，不接受按压', { selector: handle('move-up-trigger', 1) }),
        heldPressIgnored('field-array', 'move-down-trigger', '禁用时下移把手 aria-disabled，不接受按压', { selector: handle('move-down-trigger', 1) }),
      ],
    },
    {
      name: 'readOnly：行数改不动，四类把手同样不进入按压面',
      spec: { adr: 'press-channel' },
      props: { defaultValue: ['甲', '乙', '丙'], movable: true, readOnly: true },
      steps: [
        heldPressIgnored('field-array', 'add-trigger', '只读时新增把手 aria-disabled，不接受按压'),
        heldPressIgnored('field-array', 'item-delete-trigger', '只读时删除把手 aria-disabled，不接受按压', { selector: handle('item-delete-trigger', 1) }),
        heldPressIgnored('field-array', 'move-up-trigger', '只读时上移把手 aria-disabled，不接受按压', { selector: handle('move-up-trigger', 1) }),
        heldPressIgnored('field-array', 'move-down-trigger', '只读时下移把手 aria-disabled，不接受按压', { selector: handle('move-down-trigger', 1) }),
      ],
    },
    {
      name: 'translations：作者给的文案盖过内置文案，行号照样带出来',
      spec: { apg: APG },
      props: {
        defaultValue: ['甲', '乙', '丙'],
        movable: true,
        translations: {
          deleteItem: (index: number, count: number) => `删除第 ${index} 行，共 ${count} 行`,
          moveUpTrigger: (index: number) => `把第 ${index} 行往上挪`,
          moveDownTrigger: (index: number) => `把第 ${index} 行往下挪`,
        },
      },
      initial: {
        parts: {
          'item-delete-trigger[1]': { 'aria-label': '删除第 2 行，共 3 行' },
          'move-up-trigger[1]': { 'aria-label': '把第 2 行往上挪' },
          'move-down-trigger[1]': { 'aria-label': '把第 2 行往下挪' },
        },
      },
    },
    {
      name: '表格排布：table 部件 role=table、aria-rowcount 算上表头；表头第 1 行，数据行从第 2 行起；行头 rowheader，格与把手格 cell；根仍不带角色',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/table/' },
      props: { defaultValue: ['甲', '乙', '丙'], layout: 'table', columns: COLUMNS },
      fixture: tableFixture,
      initial: {
        order: [
          'root',
          'table',
          'header',
          'column-header[0]',
          'column-header[1]',
          ...Array.from({ length: ROWS }, (_, i) => [
            `item[${i}]`,
            `item-label[${i}]`,
            `item-cell[${i * 2}]`,
            `item-cell[${i * 2 + 1}]`,
            `item-action[${i}]`,
            `item-delete-trigger[${i}]`,
          ]).flat(),
          'add-trigger',
        ],
        parts: {
          'root': { 'role': null, 'data-layout': 'table' },
          'table': { 'role': 'table', 'aria-rowcount': '4', 'data-layout': 'table' },
          'header': { 'role': 'row', 'aria-rowindex': '1', 'hidden': null },
          'column-header[1]': { 'role': 'columnheader', 'data-value': 'amount', 'hidden': null },
          'item[0]': { 'role': 'row', 'aria-rowindex': '2', 'data-layout': 'table' },
          'item[2]': { 'role': 'row', 'aria-rowindex': '4' },
          'item-label[1]': { 'role': 'rowheader', 'data-index': '1' },
          'item-cell[3]': { 'role': 'cell', 'data-index': '1', 'data-value': 'amount' },
          'item-action[1]': { 'role': 'cell', 'data-index': '1' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'item-delete-trigger[2]',
          expect: {
            events: [{ type: 'value-change', detail: { value: ['甲', '乙'], mutation: { type: 'remove', index: 2 } } }],
            parts: { table: { 'aria-rowcount': '3' } },
          },
        },
      ],
    },
    {
      name: '列表排布（缺省）下写了表格部件：table 不带角色，表头与列头收起，行与格不带行号',
      spec: { apg: APG },
      props: { defaultValue: ['甲', '乙', '丙'], columns: COLUMNS },
      fixture: tableFixture,
      initial: {
        parts: {
          'table': { 'role': null, 'aria-rowcount': null, 'data-layout': 'list' },
          'header': { role: null, hidden: '' },
          'column-header[0]': { role: null, hidden: '' },
          'item[0]': { 'role': null, 'aria-rowindex': null },
          'item-label[0]': { role: null },
          'item-cell[0]': { 'role': null, 'data-value': 'date' },
          'item-action[0]': { role: null },
        },
      },
    },
    {
      name: '作者不写结构（列表排布）：三端都照 fieldArrayStructure 铺出每行的行号、内容格与把手，最后是新增钮；点删除钮摘掉那一行',
      spec: { apg: APG },
      fixture: (): FixtureNode => ({ part: 'root', defaultStructure: true }),
      props: { defaultValue: ['甲', '乙'], movable: true },
      initial: {
        order: [
          'root',
          ...Array.from({ length: 2 }, (_, i) => [
            `item[${i}]`,
            `item-label[${i}]`,
            `item-content[${i}]`,
            `item-action[${i}]`,
            `item-drag-trigger[${i}]`,
            `move-up-trigger[${i}]`,
            `move-down-trigger[${i}]`,
            `item-delete-trigger[${i}]`,
          ]).flat(),
          'add-trigger',
        ],
        parts: {
          'item[1]': { 'data-index': '1' },
          'item-delete-trigger[1]': { 'aria-label': 'Remove row 2 of 2' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '行号与新增钮的文字不进属性快照',
          run: ({ doc }) => {
            const labels = [...doc.querySelectorAll('[data-scope="field-array"][data-part="item-label"]')].map(el => el.textContent)
            if (labels.join('|') !== '1|2')
              throw new Error(`行号期望 [1,2]，实际 [${labels.join(',')}]`)
            const add = doc.querySelector('[data-scope="field-array"][data-part="add-trigger"]')?.textContent
            if (add !== 'Add row')
              throw new Error(`新增钮期望显示 "Add row"，实际 ${JSON.stringify(add)}`)
          },
        },
        {
          kind: 'click',
          part: 'item-delete-trigger[0]',
          expect: {
            events: [{ type: 'value-change', detail: { value: ['乙'], mutation: { type: 'remove', index: 0 } } }],
            counts: { 'item': 1, 'item-content': 1 },
          },
        },
      ],
    },
    {
      name: '作者不写结构（表格排布）：表格本体里是表头与各行，行里每列一格；角色与行号照表格排布',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/table/' },
      fixture: (): FixtureNode => ({ part: 'root', defaultStructure: true }),
      // 表格的名字由作者给：不在字段里时宿主上的 aria-label 转给表格本体
      props: { defaultValue: ['甲', '乙'], layout: 'table', columns: COLUMNS, ariaLabel: '费用明细' },
      initial: {
        order: [
          'root',
          'table',
          'header',
          'column-header[0]',
          'column-header[1]',
          ...Array.from({ length: 2 }, (_, i) => [
            `item[${i}]`,
            `item-label[${i}]`,
            `item-cell[${i * 2}]`,
            `item-cell[${i * 2 + 1}]`,
            `item-action[${i}]`,
            `item-delete-trigger[${i}]`,
          ]).flat(),
          'add-trigger',
        ],
        counts: { 'item-content': 0 },
        parts: {
          'table': { 'role': 'table', 'aria-rowcount': '3' },
          'column-header[1]': { 'role': 'columnheader', 'data-value': 'amount' },
          'item[1]': { 'role': 'row', 'aria-rowindex': '3' },
          'item-label[0]': { role: 'rowheader' },
          'item-cell[1]': { 'role': 'cell', 'data-value': 'amount' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '列头的文字不进属性快照',
          run: ({ doc }) => {
            const headers = [...doc.querySelectorAll('[data-scope="field-array"][data-part="column-header"]')].map(el => el.textContent)
            const want = COLUMNS.map(column => column.label)
            if (headers.join('|') !== want.join('|'))
              throw new Error(`列头期望 [${want.join(',')}]，实际 [${headers.join(',')}]`)
          },
        },
      ],
    },
  ],
}
