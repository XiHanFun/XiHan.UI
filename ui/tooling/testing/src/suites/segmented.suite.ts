import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { segmentedAnatomy, segmentedKeyboard } from '@xihan-ui/headless'
import { nativeActivation, singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/'

const HIDDEN_INPUT = '[data-scope="segmented"][data-part="hidden-input"]'

/** name/value 是表单出口，value 只落 DOM property、不进归一化快照，只能直接读 DOM。 */
function assertHiddenInput(doc: Document, name: string | null, value: string): void {
  const el = doc.querySelector<HTMLInputElement>(HIDDEN_INPUT)
  if (!el)
    throw new Error('找不到 segmented 的 hidden-input 部件')
  const actualName = el.getAttribute('name')
  if (actualName !== name)
    throw new Error(`隐藏输入的 name 不符：期望 ${JSON.stringify(name)}，实际 ${JSON.stringify(actualName)}`)
  if (el.value !== value)
    throw new Error(`隐藏输入提交的值不符：期望 ${JSON.stringify(value)}，实际 ${JSON.stringify(el.value)}`)
}

/** 三段全部放开：默认夹具里中间那段禁用，左右键各走哪边就分不出来了。 */
function allEnabled(base: FixtureNode): FixtureNode {
  return {
    ...base,
    children: base.children?.map(node =>
      node.part === 'item' && node.attrs?.value === 'week' ? { ...node, attrs: { value: 'week' } } : node,
    ),
  }
}

// 指示器排在段之前：它绝对定位，靠文档序让段压在它上面。
// 中间那段用 aria-disabled 表达禁用（不是原生 disabled），导航时被跳过但仍可聚焦。
export const segmentedSuite: ConformanceSuite = {
  component: 'segmented',
  anatomy: segmentedAnatomy,
  keyboard: segmentedKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'indicator', tag: 'span' },
      { part: 'item', tag: 'button', attrs: { value: 'day' }, children: [{ part: 'item-text', tag: 'span', text: '日' }] },
      { part: 'item', tag: 'button', attrs: { value: 'week', disabled: '' }, children: [{ part: 'item-text', tag: 'span', text: '周' }] },
      { part: 'item', tag: 'button', attrs: { value: 'month' }, children: [{ part: 'item-text', tag: 'span', text: '月' }] },
      { part: 'hidden-input', tag: 'input' },
    ],
  },
  cases: [
    {
      name: 'roving tabindex：整组只有一个 Tab 停靠点，无锚点时容器兜底',
      spec: { apg: APG },
      covers: ['segmented.kbd.tab'],
      steps: [singleTabStop('segmented', 'item', 'root')],
    },
    {
      name: '默认：root 是 radiogroup，段是 radio 且未选中也显式报 false；指示器无选中项时收起',
      spec: { apg: `${APG}#roles_states_properties` },
      initial: {
        order: [
          'root',
          'indicator',
          'item[0]',
          'item-text[0]',
          'item[1]',
          'item-text[1]',
          'item[2]',
          'item-text[2]',
          'hidden-input',
        ],
        counts: { 'root': 1, 'indicator': 1, 'item': 3, 'item-text': 3, 'hidden-input': 1 },
        parts: {
          'root': {
            'role': 'radiogroup',
            'aria-orientation': 'horizontal',
            'aria-readonly': 'false',
            'aria-invalid': 'false',
            'aria-required': 'false',
            'data-orientation': 'horizontal',
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
            'data-required': null,
            'data-block': null,
            'tabindex': '0',
          },
          'item': [
            {
              'type': 'button',
              'role': 'radio',
              'aria-checked': 'false',
              'aria-disabled': 'false',
              'data-value': 'day',
              'data-state': 'unchecked',
              'data-disabled': null,
              'tabindex': '-1',
              // 集合条目绝不输出原生 disabled
              'disabled': null,
            },
            {
              'aria-checked': 'false',
              'aria-disabled': 'true',
              'data-value': 'week',
              'data-disabled': '',
              'disabled': null,
            },
            {
              'aria-checked': 'false',
              'aria-disabled': 'false',
              'data-value': 'month',
              'disabled': null,
            },
          ],
          'item-text': [
            { 'data-state': 'unchecked' },
            { 'data-state': 'unchecked', 'data-disabled': '' },
            { 'data-state': 'unchecked' },
          ],
          // 指示器是纯装饰，对读屏隐藏；一段都没选中时收起来不占位
          'indicator': { 'aria-hidden': 'true', 'hidden': '', 'data-value': null },
          'hidden-input': { type: 'hidden', name: null },
        },
        activeElement: null,
      },
    },
    {
      name: '有选中：选中段独占 Tab 位，指示器认领当前值',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { defaultValue: 'day' },
      initial: {
        parts: {
          'item': [
            { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
            { 'aria-checked': 'false', 'tabindex': '-1' },
            { 'aria-checked': 'false', 'tabindex': '-1' },
          ],
          'item-text': [{ 'data-state': 'checked' }, { 'data-state': 'unchecked' }, { 'data-state': 'unchecked' }],
          'indicator': { 'data-value': 'day' },
        },
      },
    },
    {
      name: '点击一段：选中翻真、锚点随焦点迁移，派发 value-change',
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
            events: [{ type: 'value-change', detail: { value: 'day' } }],
          },
        },
      ],
    },
    {
      name: '方向键四个都走：跳过禁用段、尽头回绕，焦点跟着选中走',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['segmented.kbd.next', 'segmented.kbd.prev'],
      props: { defaultValue: 'day' },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false', 'tabindex': '-1' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
              ],
            },
            activeElement: { part: 'item[2]', exact: true },
            events: [{ type: 'value-change', detail: { value: 'month' } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false' },
              ],
            },
            activeElement: { part: 'item[0]', exact: true },
            events: [{ type: 'value-change', detail: { value: 'day' } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true', 'data-state': 'checked' },
              ],
            },
            activeElement: { part: 'item[2]', exact: true },
            events: [{ type: 'value-change', detail: { value: 'month' } }],
          },
        },
      ],
    },
    {
      name: 'Home / End：一步走到首末可停留段并选中它',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['segmented.kbd.first', 'segmented.kbd.last'],
      props: { defaultValue: 'month' },
      steps: [
        { kind: 'focus', part: 'item[2]' },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            events: [{ type: 'value-change', detail: { value: 'day' } }],
          },
        },
        {
          kind: 'key',
          key: 'End',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            events: [{ type: 'value-change', detail: { value: 'month' } }],
          },
        },
      ],
    },
    {
      name: 'Enter / Space 靠原生按钮的激活行为，段必须是 <button type="button">',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction' },
      covers: ['segmented.kbd.select'],
      steps: [nativeActivation('segmented', 'item')],
    },
    {
      name: '不归导航管的键一律放行：容器不吞 Space',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'raw',
          why: '归一化快照没有 defaultPrevented 通道，只能直接看事件对象',
          run: ({ doc }) => {
            const item = doc.querySelector<HTMLElement>('[data-scope="segmented"][data-part="item"]')!
            const e = new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true })
            item.dispatchEvent(e)
            if (e.defaultPrevented)
              throw new Error('容器把 Space 吞掉了：原生按钮的激活与页面滚动会跟着一起没')
          },
        },
      ],
    },
    {
      name: '受控 value：点击只发意图不自改 DOM，父写回后才切选中',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: 'day' },
      steps: [
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '-1' },
                { 'aria-checked': 'false' },
                // 焦点锚点已迁到末段，但选中值仍由父持有
                { 'aria-checked': 'false', 'data-state': 'unchecked', 'tabindex': '0' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: 'month' } }],
          },
        },
        { kind: 'setProps', props: { value: 'month' } },
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
      name: '整组 disabled：段全部 aria-disabled，点击与方向键都不改选中',
      spec: { apg: APG },
      props: { disabled: true, defaultValue: 'day' },
      steps: [
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              root: { 'data-disabled': '' },
              item: [
                { 'aria-checked': 'true', 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null },
                { 'aria-disabled': 'true', 'data-disabled': '' },
                { 'aria-checked': 'false', 'aria-disabled': 'true', 'data-disabled': '' },
              ],
            },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: { item: [{ 'aria-checked': 'true' }, { 'aria-checked': 'false' }, { 'aria-checked': 'false' }] },
            events: [],
          },
        },
      ],
    },
    {
      name: '只读：点不动也用方向键改不动值，但段不禁用、焦点照常移',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { readOnly: true, defaultValue: 'day' },
      steps: [
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              root: { 'aria-readonly': 'true', 'data-readonly': '' },
              item: [
                { 'aria-checked': 'true', 'aria-disabled': 'false' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false', 'data-readonly': '' },
              ],
            },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            // 焦点从末段再往右会绕回首段，值一路不动
            parts: { item: [{ 'aria-checked': 'true' }, { 'aria-checked': 'false' }, { 'aria-checked': 'false' }] },
            events: [],
          },
        },
      ],
    },
    {
      name: 'dir=rtl：左右键语义对调，上下键不受影响',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['segmented.kbd.next', 'segmented.kbd.prev'],
      fixture: allEnabled,
      props: { dir: 'rtl', defaultValue: 'day' },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { activeElement: { part: 'item[1]', exact: true }, events: [{ type: 'value-change', detail: { value: 'week' } }] },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [{ type: 'value-change', detail: { value: 'day' } }] },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { activeElement: { part: 'item[1]', exact: true }, events: [{ type: 'value-change', detail: { value: 'week' } }] },
        },
      ],
    },
    {
      name: 'name 给定：整组一份隐藏输入，提交的就是当前选中值',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { name: 'range', defaultValue: 'day' },
      initial: {
        counts: { 'hidden-input': 1 },
        parts: { 'hidden-input': { type: 'hidden', name: 'range', disabled: null } },
      },
      steps: [
        {
          kind: 'raw',
          why: 'value 是表单出口却只落 DOM property，不进归一化快照，只能直接读 DOM',
          run: ({ doc }) => assertHiddenInput(doc, 'range', 'day'),
        },
        {
          kind: 'click',
          part: 'item[2]',
          expect: { events: [{ type: 'value-change', detail: { value: 'month' } }] },
        },
        {
          kind: 'raw',
          why: '选中值迁移后要直接读 DOM，才验得到表单提交的是新值',
          run: ({ doc }) => assertHiddenInput(doc, 'range', 'month'),
        },
      ],
    },
    {
      name: '三轴与 block 原样透传到 data-*，缺省档不输出',
      spec: { apg: APG },
      props: { tone: 'success', size: 'lg', block: true, orientation: 'vertical' },
      initial: {
        parts: {
          root: {
            'data-tone': 'success',
            'data-size': 'lg',
            'data-block': '',
            'aria-orientation': 'vertical',
            'data-orientation': 'vertical',
          },
        },
      },
    },
  ],
}
