import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { colorSwatchPickerAnatomy, colorSwatchPickerKeyboard } from '@xihan-ui/headless'
import { singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/'

const HIDDEN_INPUT = '[data-scope="color-swatch-picker"][data-part="hidden-input"]'

/** name/value/checked 都不进归一化快照（后两者只落 DOM property），表单出口只能直接读 DOM。 */
function assertHiddenInputs(doc: Document, expected: readonly (readonly [string, string, boolean])[]): void {
  const actual = [...doc.querySelectorAll<HTMLInputElement>(HIDDEN_INPUT)].map(el => [el.name, el.value, el.checked] as const)
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(`隐藏输入的 name/value/checked 不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

const RED = '#ff0000'
const GREEN = '#00ff00'
const BLUE = '#0000ff'

/** 三格全可停留的树：默认树里绿格是禁用的，分左右键各走哪边时要把它放开。 */
function allEnabled(base: FixtureNode): FixtureNode {
  return {
    ...base,
    children: base.children?.map(node =>
      node.part === 'item' && node.attrs?.value === GREEN ? { ...node, attrs: { value: GREEN } } : node,
    ),
  }
}

// hidden-input、swatch 与 indicator 都由 item 内部装配，不作为独立 fixture 节点；采集器仍会抓到它们。
// 绿格用 aria-disabled 表达禁用（不是原生 disabled），导航时被跳过但仍可聚焦。
export const colorSwatchPickerSuite: ConformanceSuite = {
  component: 'color-swatch-picker',
  anatomy: colorSwatchPickerAnatomy,
  keyboard: colorSwatchPickerKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'label', text: '主题色' },
      { part: 'item', attrs: { value: RED } },
      { part: 'item', attrs: { value: GREEN, disabled: '' } },
      { part: 'item', attrs: { value: BLUE } },
    ],
  },
  cases: [
    {
      // 整组只占一个 Tab 位；无锚点时须由容器兜底
      name: 'roving tabindex：整组只有一个 Tab 停靠点，无锚点时容器兜底',
      spec: { apg: APG },
      covers: ['color-swatch-picker.kbd.tab'],
      steps: [singleTabStop('color-swatch-picker', 'item', 'root')],
    },
    {
      name: '初始无选中：容器 tabindex=0 兜底进 Tab 序列，格子全 -1 且 aria-checked 显式 false，名字按文案念颜色串',
      spec: { apg: `${APG}#roles_states_properties` },
      initial: {
        order: [
          'root',
          'label',
          'item[0]',
          'hidden-input[0]',
          'swatch[0]',
          'indicator[0]',
          'item[1]',
          'hidden-input[1]',
          'swatch[1]',
          'indicator[1]',
          'item[2]',
          'hidden-input[2]',
          'swatch[2]',
          'indicator[2]',
        ],
        counts: { 'root': 1, 'label': 1, 'item': 3, 'swatch': 3, 'indicator': 3, 'hidden-input': 3 },
        parts: {
          'root': {
            'role': 'radiogroup',
            'aria-labelledby': '@part(label)',
            'aria-label': 'Color swatches',
            'aria-readonly': 'false',
            'aria-invalid': 'false',
            'aria-required': 'false',
            'data-size': null,
            'data-disabled': null,
            'tabindex': '0',
          },
          'item': [
            {
              'role': 'radio',
              'aria-checked': 'false',
              'aria-disabled': 'false',
              'aria-label': `Color ${RED}`,
              'data-value': RED,
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
              'aria-label': `Color ${GREEN}`,
              'data-value': GREEN,
              'data-state': 'unchecked',
              'data-disabled': '',
              'tabindex': '-1',
              'disabled': null,
            },
            {
              'role': 'radio',
              'aria-checked': 'false',
              'aria-disabled': 'false',
              'aria-label': `Color ${BLUE}`,
              'data-value': BLUE,
              'data-state': 'unchecked',
              'tabindex': '-1',
              'disabled': null,
            },
          ],
          // 色块面是装饰：颜色由家族画，家族属性落在这里
          'swatch': [
            { 'aria-hidden': 'true', 'data-xh-swatch': '', 'data-xh-swatch-size': null, 'data-state': 'unchecked' },
            { 'aria-hidden': 'true', 'data-xh-swatch': '', 'data-state': 'unchecked', 'data-disabled': '' },
            { 'aria-hidden': 'true', 'data-xh-swatch': '', 'data-state': 'unchecked' },
          ],
          'indicator': [
            { 'aria-hidden': 'true', 'data-state': 'unchecked' },
            { 'aria-hidden': 'true', 'data-state': 'unchecked' },
            { 'aria-hidden': 'true', 'data-state': 'unchecked' },
          ],
          // 隐藏输入与 item 相反：单体输入用原生 disabled，禁用格不该提交出值
          'hidden-input': [
            { 'type': 'radio', 'aria-hidden': 'true', 'tabindex': '-1', 'data-state': 'unchecked', 'data-disabled': null, 'disabled': null },
            { 'type': 'radio', 'aria-hidden': 'true', 'tabindex': '-1', 'data-state': 'unchecked', 'data-disabled': '', 'disabled': '' },
            { 'type': 'radio', 'aria-hidden': 'true', 'tabindex': '-1', 'data-state': 'unchecked', 'data-disabled': null, 'disabled': null },
          ],
        },
        activeElement: null,
      },
    },
    {
      name: '有选中：选中格 tabindex=0；焦点在组外时容器仍兜底 0（锚点失效也进得来）',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { defaultValue: RED },
      initial: {
        parts: {
          // 容器的 tabindex 只看焦点在不在组内，不看有没有选中：
          // 没有格子认领 0 时由容器兜底，焦点进组后容器让位 -1。
          root: { tabindex: '0' },
          item: [
            { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
            { 'aria-checked': 'false', 'data-state': 'unchecked', 'tabindex': '-1' },
            { 'aria-checked': 'false', 'data-state': 'unchecked', 'tabindex': '-1' },
          ],
          swatch: [{ 'data-state': 'checked' }, { 'data-state': 'unchecked' }, { 'data-state': 'unchecked' }],
          indicator: [{ 'data-state': 'checked' }, { 'data-state': 'unchecked' }, { 'data-state': 'unchecked' }],
        },
      },
    },
    {
      name: '选中按颜色比不按串比：rgb 写法的红与 #ff0000 那一格是同一个颜色',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { defaultValue: 'rgb(255, 0, 0)' },
      initial: {
        parts: {
          item: [
            { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
            { 'aria-checked': 'false' },
            { 'aria-checked': 'false' },
          ],
        },
      },
    },
    {
      name: '点击格子选中：aria-checked 翻真、锚点随焦点迁移，派发 value-change',
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
              indicator: [{ 'data-state': 'checked' }, { 'data-state': 'unchecked' }, { 'data-state': 'unchecked' }],
            },
            activeElement: { part: 'item[0]', exact: true },
            events: [{ type: 'value-change', detail: { value: RED } }],
          },
        },
      ],
    },
    {
      name: '四个方向键都切换选中并跳过禁用格，走到尽头回绕',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['color-swatch-picker.kbd.next', 'color-swatch-picker.kbd.prev'],
      steps: [
        { kind: 'click', part: 'item[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false', 'tabindex': '-1' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
                { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
              ],
            },
            activeElement: { part: 'item[2]', exact: true },
            events: [{ type: 'value-change', detail: { value: BLUE } }],
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
            events: [{ type: 'value-change', detail: { value: RED } }],
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
            events: [{ type: 'value-change', detail: { value: BLUE } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
              ],
            },
            activeElement: { part: 'item[0]', exact: true },
            events: [{ type: 'value-change', detail: { value: RED } }],
          },
        },
      ],
    },
    {
      name: '焦点从组外落到容器：转投首个可停留格子，Space 选中它',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['color-swatch-picker.kbd.select'],
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
            events: [{ type: 'value-change', detail: { value: RED } }],
          },
        },
      ],
    },
    {
      name: '焦点从组外落到容器：已有选中格时落在选中格上，不是第一个',
      spec: { apg: `${APG}#keyboardinteraction` },
      // 选蓝不选绿：夹具里绿格是 aria-disabled 的，锚点落在禁用格上本来就该退回首个可停留格
      props: { defaultValue: BLUE },
      steps: [
        {
          kind: 'focus',
          part: 'root',
          expect: {
            // APG：焦点进入 radiogroup 时落在已选中的那个，一个都没选中才落第一个
            activeElement: { part: 'item[2]', exact: true },
            parts: {
              item: [
                { 'aria-checked': 'false', 'tabindex': '-1' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
                { 'aria-checked': 'true', 'tabindex': '0', 'data-state': 'checked' },
              ],
            },
            // 落焦不改选中
            events: [],
          },
        },
      ],
    },
    {
      name: '受控 value：点击只发 value-change 不自改 DOM，父写回 value 后才切选中',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: RED },
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
            events: [{ type: 'value-change', detail: { value: BLUE } }],
          },
        },
        { kind: 'setProps', props: { value: BLUE } },
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
      name: '禁用格：点击与 Space 都不选中，Space 还要放行给页面滚动；焦点仍可落上去并成为导航起点',
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
          kind: 'raw',
          why: '归一化快照没有 defaultPrevented 通道，只能直接看事件对象：禁用格吞掉 Space 会连页面滚动一起吞掉',
          run: ({ doc }) => {
            const item = doc.querySelectorAll<HTMLElement>('[data-scope="color-swatch-picker"][data-part="item"]')[1]!
            const e = new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true })
            item.dispatchEvent(e)
            if (e.defaultPrevented)
              throw new Error('禁用格上的 Space 被 preventDefault')
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
              ],
            },
            activeElement: { part: 'item[2]', exact: true },
            events: [{ type: 'value-change', detail: { value: BLUE } }],
          },
        },
      ],
    },
    {
      name: '整组 disabled：格子全部 aria-disabled，点击与方向键都不改选中',
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
              swatch: [{ 'data-disabled': '' }, { 'data-disabled': '' }, { 'data-disabled': '' }],
            },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
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
      name: '只读：方向键照常移焦点但不落值，点击与 Space 都不选中',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { readOnly: true, defaultValue: RED },
      steps: [
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              root: { 'aria-readonly': 'true', 'data-readonly': '' },
              item: [
                { 'aria-checked': 'true', 'data-state': 'checked', 'data-readonly': '', 'tabindex': '-1' },
                { 'aria-checked': 'false', 'data-readonly': '' },
                { 'aria-checked': 'false', 'data-state': 'unchecked', 'data-readonly': '', 'tabindex': '0' },
              ],
            },
            activeElement: { part: 'item[2]', exact: true },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true', 'tabindex': '0' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
              ],
            },
            activeElement: { part: 'item[0]', exact: true },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true', 'tabindex': '-1' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false', 'tabindex': '0' },
              ],
            },
            activeElement: { part: 'item[2]', exact: true },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true' },
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
      name: 'dir=rtl：左右键语义对调，上下键不受影响',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['color-swatch-picker.kbd.next', 'color-swatch-picker.kbd.prev'],
      // 默认树的绿格禁用，从红格出发 next 与 prev 都落到蓝格，分不出左右键各走哪边；
      // 这里把它放开，三格都可停留
      fixture: allEnabled,
      props: { dir: 'rtl' },
      steps: [
        { kind: 'click', part: 'item[0]' },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false', 'tabindex': '-1' },
                { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
              ],
            },
            activeElement: { part: 'item[1]', exact: true },
            events: [{ type: 'value-change', detail: { value: GREEN } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true', 'data-state': 'checked', 'tabindex': '0' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
              ],
            },
            activeElement: { part: 'item[0]', exact: true },
            events: [{ type: 'value-change', detail: { value: RED } }],
          },
        },
        // 上下键走的是竖轴，rtl 不参与，仍是 ArrowDown=下一格 / ArrowUp=上一格
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true', 'data-state': 'checked' },
                { 'aria-checked': 'false' },
              ],
            },
            activeElement: { part: 'item[1]', exact: true },
            events: [{ type: 'value-change', detail: { value: GREEN } }],
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
            activeElement: { part: 'item[0]', exact: true },
            events: [{ type: 'value-change', detail: { value: RED } }],
          },
        },
      ],
    },
    {
      name: 'swatches 给定：格子的名字与禁用从数据里查，部件只报 value',
      spec: { apg: `${APG}#roles_states_properties` },
      fixture: allEnabled,
      props: {
        swatches: [
          { value: RED, label: '品牌红' },
          { value: GREEN, disabled: true },
          { value: BLUE, label: '品牌蓝' },
        ],
      },
      initial: {
        parts: {
          'item': [
            { 'aria-label': '品牌红', 'aria-disabled': 'false' },
            { 'aria-label': `Color ${GREEN}`, 'aria-disabled': 'true', 'data-disabled': '' },
            { 'aria-label': '品牌蓝', 'aria-disabled': 'false' },
          ],
          'hidden-input': [{ disabled: null }, { disabled: '' }, { disabled: null }],
        },
      },
    },
    {
      name: 'translations：整组与每格的读屏名字都可换',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { translations: { group: '主题色', swatch: (value: string) => `颜色 ${value}` } },
      initial: {
        parts: {
          root: { 'aria-label': '主题色' },
          item: [
            { 'aria-label': `颜色 ${RED}` },
            { 'aria-label': `颜色 ${GREEN}` },
            { 'aria-label': `颜色 ${BLUE}` },
          ],
        },
      },
    },
    {
      name: 'size：尺寸同时打到根的组件轴与每格色块面的家族轴上',
      spec: { apg: APG },
      props: { size: 'lg' },
      initial: {
        parts: {
          root: { 'data-size': 'lg' },
          swatch: [
            { 'data-xh-swatch-size': 'lg' },
            { 'data-xh-swatch-size': 'lg' },
            { 'data-xh-swatch-size': 'lg' },
          ],
        },
      },
    },
    {
      name: 'invalid / required：三条都直接落在 radiogroup 上，格子与色块面带 data-invalid',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { invalid: true, required: true },
      initial: {
        parts: {
          root: { 'aria-invalid': 'true', 'aria-required': 'true', 'data-invalid': '', 'data-required': '' },
          item: [{ 'data-invalid': '' }, { 'data-invalid': '' }, { 'data-invalid': '' }],
          swatch: [{ 'data-invalid': '' }, { 'data-invalid': '' }, { 'data-invalid': '' }],
        },
      },
    },
    {
      name: 'name 给定：每格内一份隐藏原生 radio，checked 跟着选中值走',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { name: 'theme', defaultValue: RED },
      initial: {
        counts: { 'hidden-input': 3 },
        parts: {
          'hidden-input': [
            { 'type': 'radio', 'aria-hidden': 'true', 'tabindex': '-1', 'data-state': 'checked' },
            { 'type': 'radio', 'aria-hidden': 'true', 'tabindex': '-1', 'data-state': 'unchecked', 'disabled': '' },
            { 'type': 'radio', 'aria-hidden': 'true', 'tabindex': '-1', 'data-state': 'unchecked' },
          ],
        },
      },
      steps: [
        {
          kind: 'raw',
          why: 'name/value/checked 是表单出口却都不进归一化快照（后两者只落 DOM property），只能直接读 DOM',
          run: ({ doc }) => assertHiddenInputs(doc, [['theme', RED, true], ['theme', GREEN, false], ['theme', BLUE, false]]),
        },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              'hidden-input': [
                { 'data-state': 'unchecked' },
                { 'data-state': 'unchecked' },
                { 'data-state': 'checked' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: BLUE } }],
          },
        },
        {
          kind: 'raw',
          why: 'checked 只落 DOM property，选中值迁移后要直接读 DOM 才验得到表单提交的是新值',
          run: ({ doc }) => assertHiddenInputs(doc, [['theme', RED, false], ['theme', GREEN, false], ['theme', BLUE, true]]),
        },
      ],
    },
  ],
}
