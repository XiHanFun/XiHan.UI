import type { ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { checkboxGroupAnatomy, checkboxGroupKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/'

const ITEM = '[data-scope="checkbox-group"][data-part="item"]'
const HIDDEN_INPUT = '[data-scope="checkbox-group"][data-part="item-hidden-input"]'
const ROOT = '[data-scope="checkbox-group"][data-part="root"]'

/**
 * 复选框组与单选组正相反：组内有几个条目就该有几个 Tab 停靠点，容器自己不占位。
 * 少一个都意味着某个复选框键盘够不着；容器多占一个则会停在一个什么也选不了的地方。
 * 这是跨节点的计数，逐个部件的属性期望表达不了。
 */
const everyItemIsTabStop: StepWithExpect = {
  kind: 'raw',
  why: 'Tab 停靠点的数目是跨节点的计数，逐个部件的属性期望表达不了',
  run: ({ doc }) => {
    const items = [...doc.querySelectorAll<HTMLElement>(ITEM)]
    const stops = items.filter(el => el.getAttribute('tabindex') === '0')
    if (items.length === 0)
      throw new Error('fixture 里一个条目都没有，这条断言等于空跑')
    if (stops.length !== items.length)
      throw new Error(`checkbox-group 有 ${items.length} 个条目却只有 ${stops.length} 个 Tab 停靠点：复选框组不做 roving tabindex`)
    const root = doc.querySelector<HTMLElement>(ROOT)
    if (root?.hasAttribute('tabindex'))
      throw new Error('容器不该占 Tab 位：条目已各自占位，容器再占一个会停在选不了任何东西的地方')
  },
}

/** name/value/checked 都不进归一化快照（后两者只落 DOM property），表单出口只能直接读 DOM。 */
function assertHiddenInputs(doc: Document, expected: readonly (readonly [string, string, boolean])[]): void {
  const actual = [...doc.querySelectorAll<HTMLInputElement>(HIDDEN_INPUT)].map(el => [el.name, el.value, el.checked] as const)
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(`隐藏输入的 name/value/checked 不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

/** 把默认 fixture 里禁用的 b 放开，用来演"三项全勾"这类需要全组可用的场景。 */
function allEnabled(base: FixtureNode): FixtureNode {
  return {
    ...base,
    children: base.children?.map(node =>
      node.part === 'item' && node.attrs?.value === 'b' ? { ...node, attrs: { value: 'b' } } : node,
    ),
  }
}

// item-hidden-input 由 item 内部装配，不作为独立 fixture 节点；采集器仍会抓到它。
// 条目 b 用 aria-disabled 表达禁用（不是原生 disabled），点不动但仍可聚焦、仍占 Tab 位。
export const checkboxGroupSuite: ConformanceSuite = {
  component: 'checkbox-group',
  anatomy: checkboxGroupAnatomy,
  keyboard: checkboxGroupKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'label', text: '配料' },
      { part: 'trigger' },
      {
        part: 'item',
        attrs: { value: 'a' },
        children: [{ part: 'item-control' }, { part: 'item-text', text: 'A' }],
      },
      {
        part: 'item',
        attrs: { value: 'b', disabled: '' },
        children: [{ part: 'item-control' }, { part: 'item-text', text: 'B' }],
      },
      {
        part: 'item',
        attrs: { value: 'c' },
        children: [{ part: 'item-control' }, { part: 'item-text', text: 'C' }],
      },
    ],
  },
  cases: [
    {
      name: 'Tab 停靠点：每一项各占一个，容器不占（与单选组正相反）',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['checkbox-group.kbd.tab'],
      steps: [everyItemIsTabStop],
    },
    {
      name: '初始无选中：root 是 role=group，条目全 aria-checked=false，trigger 报 none',
      spec: { apg: `${APG}#wai-ariaroles,states,andproperties` },
      props: { itemValues: ['a', 'b', 'c'] },
      initial: {
        order: [
          'root',
          'label',
          'trigger',
          'item[0]',
          'item-hidden-input[0]',
          'item-control[0]',
          'item-text[0]',
          'item[1]',
          'item-hidden-input[1]',
          'item-control[1]',
          'item-text[1]',
          'item[2]',
          'item-hidden-input[2]',
          'item-control[2]',
          'item-text[2]',
        ],
        counts: {
          'root': 1,
          'label': 1,
          'trigger': 1,
          'item': 3,
          'item-control': 3,
          'item-text': 3,
          'item-hidden-input': 3,
        },
        parts: {
          'root': {
            'role': 'group',
            'aria-labelledby': '@part(label)',
            'data-orientation': 'vertical',
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
            // 容器不占 Tab 位：条目各自占位（见上一个用例）
            'tabindex': null,
            // role=group 不接受 aria-orientation，写上去是无效 ARIA
            'aria-orientation': null,
          },
          'trigger': {
            'role': 'checkbox',
            'aria-checked': 'false',
            'aria-disabled': 'false',
            'aria-readonly': 'false',
            'data-state': 'none',
            'tabindex': '0',
            'disabled': null,
          },
          'item': [
            {
              'role': 'checkbox',
              'aria-checked': 'false',
              'aria-disabled': 'false',
              'aria-readonly': 'false',
              'aria-invalid': 'false',
              'data-value': 'a',
              'data-state': 'unchecked',
              'data-disabled': null,
              'tabindex': '0',
              // 集合条目绝不输出原生 disabled
              'disabled': null,
            },
            {
              'role': 'checkbox',
              'aria-checked': 'false',
              'aria-disabled': 'true',
              'data-value': 'b',
              'data-state': 'unchecked',
              'data-disabled': '',
              // 禁用条目照样占 Tab 位：aria-disabled 的条目仍要能被聚焦、被读出来
              'tabindex': '0',
              'disabled': null,
            },
            {
              'role': 'checkbox',
              'aria-checked': 'false',
              'aria-disabled': 'false',
              'data-value': 'c',
              'data-state': 'unchecked',
              'tabindex': '0',
              'disabled': null,
            },
          ],
          'item-control': [
            { 'aria-hidden': 'true', 'data-state': 'unchecked' },
            { 'aria-hidden': 'true', 'data-state': 'unchecked', 'data-disabled': '' },
            { 'aria-hidden': 'true', 'data-state': 'unchecked' },
          ],
          'item-text': [
            // 文本是条目可及名的来源，绝不能对读屏隐藏
            { 'data-state': 'unchecked', 'aria-hidden': null },
            { 'data-state': 'unchecked', 'data-disabled': '', 'aria-hidden': null },
            { 'data-state': 'unchecked', 'aria-hidden': null },
          ],
          // 隐藏输入与 item 相反：单体输入用原生 disabled，禁用项不该提交出值
          'item-hidden-input': [
            { 'type': 'checkbox', 'aria-hidden': 'true', 'tabindex': '-1', 'data-state': 'unchecked', 'disabled': null },
            { 'type': 'checkbox', 'aria-hidden': 'true', 'tabindex': '-1', 'data-state': 'unchecked', 'disabled': '' },
            { 'type': 'checkbox', 'aria-hidden': 'true', 'tabindex': '-1', 'data-state': 'unchecked', 'disabled': null },
          ],
        },
        activeElement: null,
      },
    },
    {
      name: '点击条目：各选各的，多项可同时选中，再点即取消',
      spec: { apg: `${APG}#wai-ariaroles,states,andproperties` },
      steps: [
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: {
              'item': [
                { 'aria-checked': 'true', 'data-state': 'checked' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false' },
              ],
              'item-control': [{ 'data-state': 'checked' }, { 'data-state': 'unchecked' }, { 'data-state': 'unchecked' }],
              'item-text': [{ 'data-state': 'checked' }, { 'data-state': 'unchecked' }, { 'data-state': 'unchecked' }],
            },
            activeElement: { part: 'item[0]', exact: true },
            events: [{ type: 'value-change', detail: { value: ['a'] } }],
          },
        },
        {
          // 第二项不会顶掉第一项
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true', 'data-state': 'checked' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: ['a', 'c'] } }],
          },
        },
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false', 'data-state': 'unchecked' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: ['c'] } }],
          },
        },
      ],
    },
    {
      name: 'Space 翻转聚焦条目',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['checkbox-group.kbd.toggle'],
      steps: [
        { kind: 'focus', part: 'item[2]', expect: { activeElement: { part: 'item[2]', exact: true }, events: [] } },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true', 'data-state': 'checked' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: ['c'] } }],
          },
        },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { item: [{ 'aria-checked': 'false' }, { 'aria-checked': 'false' }, { 'aria-checked': 'false' }] },
            events: [{ type: 'value-change', detail: { value: [] } }],
          },
        },
      ],
    },
    {
      name: '禁用条目：点击与 Space 都不选中，Space 还要放行给页面滚动；焦点仍可落上去',
      spec: { apg: `${APG}#wai-ariaroles,states,andproperties` },
      steps: [
        {
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false', 'aria-disabled': 'true', 'data-state': 'unchecked' },
                { 'aria-checked': 'false' },
              ],
            },
            activeElement: { part: 'item[1]', exact: true },
            events: [],
          },
        },
        {
          kind: 'raw',
          why: '归一化快照没有 defaultPrevented 通道，只能直接看事件对象：禁用条目吞掉 Space 会连页面滚动一起吞掉',
          run: ({ doc }) => {
            const item = doc.querySelectorAll<HTMLElement>(ITEM)[1]!
            const e = new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true })
            item.dispatchEvent(e)
            if (e.defaultPrevented)
              throw new Error('禁用条目上的 Space 被 preventDefault')
          },
        },
      ],
    },
    {
      name: '整组 disabled：条目全部 aria-disabled，点击与 trigger 都改不动',
      spec: { apg: APG },
      props: { disabled: true, itemValues: ['a', 'b', 'c'] },
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
              trigger: { 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null },
            },
            events: [],
          },
        },
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              item: [{ 'aria-checked': 'false' }, { 'aria-checked': 'false' }, { 'aria-checked': 'false' }],
              trigger: { 'aria-checked': 'false' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '只读：可聚焦、读得出，但点不动也按不动',
      spec: { apg: `${APG}#wai-ariaroles,states,andproperties` },
      props: { readOnly: true, defaultValue: ['a'] },
      steps: [
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              root: { 'data-readonly': '', 'data-disabled': null },
              item: [
                { 'aria-checked': 'true', 'aria-readonly': 'true' },
                { 'aria-checked': 'false', 'aria-readonly': 'true' },
                { 'aria-checked': 'false', 'aria-readonly': 'true' },
              ],
              trigger: { 'aria-readonly': 'true', 'aria-disabled': 'true' },
            },
            // 只读条目仍要能被聚焦，读屏才读得到当前值
            activeElement: { part: 'item[2]', exact: true },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { item: [{ 'aria-checked': 'true' }, { 'aria-checked': 'false' }, { 'aria-checked': 'false' }] },
            events: [],
          },
        },
      ],
    },
    {
      name: 'invalid：校验标记落到每个条目的 aria-invalid（role=group 接不住它）',
      spec: { apg: `${APG}#wai-ariaroles,states,andproperties` },
      props: { invalid: true },
      initial: {
        parts: {
          root: { 'data-invalid': '', 'aria-invalid': null },
          item: [
            { 'aria-invalid': 'true' },
            { 'aria-invalid': 'true' },
            { 'aria-invalid': 'true' },
          ],
        },
      },
    },
    {
      name: '横排：只换 data-orientation，不产出 aria-orientation',
      spec: { apg: APG },
      props: { orientation: 'horizontal' },
      initial: {
        parts: {
          root: { 'data-orientation': 'horizontal', 'aria-orientation': null },
        },
      },
    },
    {
      name: '受控 value：点击只发 value-change 不自改 DOM，父写回 value 后才切选中',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: ['a'] },
      steps: [
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true', 'data-state': 'checked' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false', 'data-state': 'unchecked' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: ['a', 'c'] } }],
          },
        },
        { kind: 'setProps', props: { value: ['a', 'c'] } },
        {
          kind: 'settle',
          until: { attr: { part: 'item[2]', name: 'aria-checked', value: 'true' } },
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true', 'data-state': 'checked' },
              ],
            },
          },
        },
      ],
    },
    {
      name: 'trigger 全选：勾上全部可用条目，禁用项不受影响；再点一次整批取消',
      spec: { apg: `${APG}#wai-ariaroles,states,andproperties` },
      props: { itemValues: ['a', 'b', 'c'] },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true', 'data-state': 'checked' },
                // 禁用条目点不动，全选也不该替用户勾上
                { 'aria-checked': 'false', 'data-state': 'unchecked' },
                { 'aria-checked': 'true', 'data-state': 'checked' },
              ],
              // 还差一个 b，因此仍是"半选"而不是"全选"
              trigger: { 'aria-checked': 'mixed', 'data-state': 'some' },
            },
            events: [{ type: 'value-change', detail: { value: ['a', 'c'] } }],
          },
        },
        {
          // 半选态下再点一次整批取消：判据不是全集是否都勾上了
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false' },
              ],
              trigger: { 'aria-checked': 'false', 'data-state': 'none' },
            },
            events: [{ type: 'value-change', detail: { value: [] } }],
          },
        },
      ],
    },
    {
      name: 'trigger 上按 Space 与点击等效',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['checkbox-group.kbd.toggle-all'],
      props: { itemValues: ['a', 'b', 'c'] },
      steps: [
        { kind: 'focus', part: 'trigger', expect: { activeElement: { part: 'trigger', exact: true }, events: [] } },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: {
              item: [{ 'aria-checked': 'true' }, { 'aria-checked': 'false' }, { 'aria-checked': 'true' }],
              trigger: { 'aria-checked': 'mixed' },
            },
            events: [{ type: 'value-change', detail: { value: ['a', 'c'] } }],
          },
        },
      ],
    },
    {
      name: '声明了全集：三项全勾时 trigger 从 mixed 转 true',
      spec: { apg: `${APG}#wai-ariaroles,states,andproperties` },
      fixture: allEnabled,
      props: { itemValues: ['a', 'b', 'c'], defaultValue: ['a'] },
      initial: {
        parts: { trigger: { 'aria-checked': 'mixed', 'data-state': 'some' } },
      },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              item: [{ 'aria-checked': 'true' }, { 'aria-checked': 'true' }, { 'aria-checked': 'true' }],
              trigger: { 'aria-checked': 'true', 'data-state': 'all' },
            },
            events: [{ type: 'value-change', detail: { value: ['a', 'b', 'c'] } }],
          },
        },
      ],
    },
    {
      name: '未声明全集：勾满也只报 mixed，绝不谎报全选',
      spec: { apg: `${APG}#wai-ariaroles,states,andproperties` },
      fixture: allEnabled,
      steps: [
        {
          // connect 在渲染期不许读 DOM，作者没给 itemValues 时只能停在 mixed
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              item: [{ 'aria-checked': 'true' }, { 'aria-checked': 'true' }, { 'aria-checked': 'true' }],
              trigger: { 'aria-checked': 'mixed', 'data-state': 'some' },
            },
            events: [{ type: 'value-change', detail: { value: ['a', 'b', 'c'] } }],
          },
        },
      ],
    },
    {
      name: 'name 给定：每个条目内一份隐藏原生 checkbox，同名多值随表单提交',
      spec: { apg: `${APG}#wai-ariaroles,states,andproperties` },
      props: { name: 'topping', defaultValue: ['a'] },
      initial: {
        counts: { 'item-hidden-input': 3 },
        parts: {
          'item-hidden-input': [
            { 'type': 'checkbox', 'aria-hidden': 'true', 'tabindex': '-1', 'data-state': 'checked', 'name': 'topping' },
            { 'type': 'checkbox', 'aria-hidden': 'true', 'tabindex': '-1', 'data-state': 'unchecked', 'disabled': '' },
            { 'type': 'checkbox', 'aria-hidden': 'true', 'tabindex': '-1', 'data-state': 'unchecked' },
          ],
        },
      },
      steps: [
        {
          kind: 'raw',
          why: 'name/value/checked 是表单出口却都不进归一化快照（后两者只落 DOM property），只能直接读 DOM',
          run: ({ doc }) => assertHiddenInputs(doc, [['topping', 'a', true], ['topping', 'b', false], ['topping', 'c', false]]),
        },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              'item-hidden-input': [
                { 'data-state': 'checked' },
                { 'data-state': 'unchecked' },
                { 'data-state': 'checked' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: ['a', 'c'] } }],
          },
        },
        {
          kind: 'raw',
          why: 'checked 只落 DOM property，取消勾选尤其要直接读 DOM——removeAttribute 关不掉已经写过的 property',
          run: ({ doc }) => assertHiddenInputs(doc, [['topping', 'a', true], ['topping', 'b', false], ['topping', 'c', true]]),
        },
        {
          kind: 'click',
          part: 'item[0]',
          expect: { events: [{ type: 'value-change', detail: { value: ['c'] } }] },
        },
        {
          kind: 'raw',
          why: '取消勾选是 checked 这条路上最容易静默失效的一步，单独再读一次 DOM',
          run: ({ doc }) => assertHiddenInputs(doc, [['topping', 'a', false], ['topping', 'b', false], ['topping', 'c', true]]),
        },
      ],
    },
  ],
}
