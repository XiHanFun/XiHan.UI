import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { sliderAnatomy, sliderKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/slider/'
const APG_KBD = `${APG}#keyboardinteraction`
const APG_MULTI = 'https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/'

const HIDDEN_INPUT = '[data-scope="slider"][data-part="hidden-input"]'

function findPart(doc: Document, name: string, index = 0): HTMLElement {
  const el = doc.querySelectorAll<HTMLElement>(`[data-scope="slider"][data-part="${name}"]`)[index]
  if (!el)
    throw new Error(`找不到 ${name}[${index}] 部件`)
  return el
}

/**
 * jsdom 不做布局，getBoundingClientRect 恒是 0×0——几何那边会当成"轨道还没就位"原地不动，
 * 拖动因此一步也走不出来。摆一个 200px 宽的轨道，坐标与值才有得换算。
 * 两个适配器都把这份矩形交给同一台机器，桩打在真实节点上、对两侧一视同仁。
 */
function layoutTrack(doc: Document): void {
  const track = findPart(doc, 'track')
  track.getBoundingClientRect = (): DOMRect => ({
    x: 0,
    y: 0,
    width: 200,
    height: 10,
    top: 0,
    left: 0,
    right: 200,
    bottom: 10,
    toJSON: () => ({}),
  }) as DOMRect
}

function pressControl(doc: Document, clientX: number): void {
  findPart(doc, 'control').dispatchEvent(
    new PointerEvent('pointerdown', { clientX, clientY: 5, button: 0, bubbles: true, cancelable: true }),
  )
}

// 拖动途中的指针事件挂在文档上（手可以拖出轨道甚至拖出窗口），因此派在 document 上
function movePointer(doc: Document, clientX: number): void {
  doc.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY: 5, bubbles: true }))
}

function releasePointer(doc: Document): void {
  doc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}

/** name/value/disabled 里只有 name 进得了归一化快照（value 只落 DOM property），表单出口只能直接读 DOM。 */
function assertHiddenInputs(doc: Document, expected: readonly (readonly [string, string, boolean])[]): void {
  const actual = [...doc.querySelectorAll<HTMLInputElement>(HIDDEN_INPUT)].map(el => [el.name, el.value, el.disabled] as const)
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(`隐藏输入的 name/value/disabled 不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

/** 拇指的下标是作者写的声明；单滑块省略即默认 0，多滑块要逐个写明。 */
function thumbNode(index?: number): FixtureNode {
  return {
    part: 'thumb',
    attrs: index == null ? undefined : { index: String(index) },
    // 表单影子由作者写在拇指里：下标跟着所在的拇指走，不必另外声明
    children: [{ part: 'hidden-input', tag: 'input' }],
  }
}

/** 双滑块变体：两个拇指各自写明自己是第几个（单滑块可以省，默认 0）。 */
function twoThumbs(): FixtureNode {
  return {
    part: 'root',
    children: [
      { part: 'label', tag: 'label', text: '价格区间' },
      {
        part: 'control',
        children: [
          { part: 'track', children: [{ part: 'range' }] },
          thumbNode(0),
          thumbNode(1),
        ],
      },
    ],
  }
}

export const sliderSuite: ConformanceSuite = {
  component: 'slider',
  anatomy: sliderAnatomy,
  keyboard: sliderKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'label', tag: 'label', text: '音量' },
      {
        part: 'control',
        children: [
          { part: 'track', children: [{ part: 'range' }] },
          thumbNode(),
        ],
      },
    ],
  },
  cases: [
    {
      name: '默认：拇指是 role=slider，四个 aria-value* 与朝向、名字都写全',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { defaultValue: [40], min: 10, max: 90, name: 'volume' },
      initial: {
        order: ['root', 'label', 'control', 'track', 'range', 'thumb', 'hidden-input'],
        counts: { 'root': 1, 'label': 1, 'control': 1, 'track': 1, 'range': 1, 'thumb': 1, 'hidden-input': 1 },
        parts: {
          'root': {
            'data-orientation': 'horizontal',
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
            'data-dragging': null,
          },
          'label': { id: '@self' },
          'thumb': {
            'role': 'slider',
            'aria-valuemin': '10',
            'aria-valuemax': '90',
            'aria-valuenow': '40',
            // 没给格式化函数就不写：读屏退回念 aria-valuenow
            'aria-valuetext': null,
            'aria-orientation': 'horizontal',
            'aria-labelledby': '@part(label)',
            // 显式 false：省略是"没说"，读屏对两者的处理并不一样
            'aria-disabled': 'false',
            'tabindex': '0',
            'data-index': '0',
          },
          'hidden-input': { 'type': 'hidden', 'name': 'volume', 'data-index': '0', 'disabled': null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '输入的 value 是 property，进不了归一化快照',
          run: ({ doc }) => assertHiddenInputs(doc, [['volume', '40', false]]),
        },
      ],
    },
    {
      name: '方向键按 step 推动；上下与左右同义（水平轨道、ltr）',
      spec: { apg: APG_KBD },
      covers: ['slider.kbd.increment', 'slider.kbd.decrement'],
      props: { defaultValue: [50], step: 5 },
      steps: [
        { kind: 'focus', part: 'thumb' },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { thumb: { 'aria-valuenow': '55' } } } },
        { kind: 'key', key: 'ArrowUp', expect: { parts: { thumb: { 'aria-valuenow': '60' } } } },
        { kind: 'key', key: 'ArrowLeft', expect: { parts: { thumb: { 'aria-valuenow': '55' } } } },
        { kind: 'key', key: 'ArrowDown', expect: { parts: { thumb: { 'aria-valuenow': '50' } } } },
        {
          kind: 'raw',
          why: '表单出口跟着键盘走，value 是 property 只能直接读',
          run: ({ doc }) => assertHiddenInputs(doc, [['', '50', false]]),
        },
      ],
    },
    {
      name: 'PageUp / PageDown 走 largeStep，未指定时是 step 的 10 倍',
      spec: { apg: APG_KBD },
      covers: ['slider.kbd.large-increment', 'slider.kbd.large-decrement'],
      props: { defaultValue: [0], step: 1 },
      steps: [
        { kind: 'focus', part: 'thumb' },
        { kind: 'key', key: 'PageUp', expect: { parts: { thumb: { 'aria-valuenow': '10' } } } },
        { kind: 'key', key: 'PageDown', expect: { parts: { thumb: { 'aria-valuenow': '0' } } } },
      ],
    },
    {
      name: 'Home / End 取端点',
      spec: { apg: APG_KBD },
      covers: ['slider.kbd.min', 'slider.kbd.max'],
      props: { defaultValue: [50], min: 10, max: 90 },
      steps: [
        { kind: 'focus', part: 'thumb' },
        { kind: 'key', key: 'End', expect: { parts: { thumb: { 'aria-valuenow': '90' } } } },
        { kind: 'key', key: 'Home', expect: { parts: { thumb: { 'aria-valuenow': '10' } } } },
      ],
    },
    {
      name: '贴住边界：越界的那一步停在端点，不回绕',
      spec: { apg: APG },
      props: { defaultValue: [98], step: 5 },
      steps: [
        { kind: 'focus', part: 'thumb' },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { thumb: { 'aria-valuenow': '100' } } } },
        // 已经贴着 max 还按：不该越过去，更不该回绕到 min
        { kind: 'key', key: 'ArrowRight', expect: { parts: { thumb: { 'aria-valuenow': '100' } } } },
      ],
    },
    {
      name: 'RTL 只对调左右两键：语义恒是"朝 max 走一格"',
      spec: { apg: APG_KBD },
      props: { defaultValue: [50], dir: 'rtl' },
      steps: [
        { kind: 'focus', part: 'thumb' },
        // 从右往左排版时，屏幕向左才是朝 max
        { kind: 'key', key: 'ArrowLeft', expect: { parts: { thumb: { 'aria-valuenow': '51' } } } },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { thumb: { 'aria-valuenow': '50' } } } },
        // 上下两键不受 dir 影响
        { kind: 'key', key: 'ArrowUp', expect: { parts: { thumb: { 'aria-valuenow': '51' } } } },
      ],
    },
    {
      name: '竖直轨道：aria-orientation 跟着换，屏幕向上仍是朝 max',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { defaultValue: [50], orientation: 'vertical' },
      initial: {
        parts: {
          root: { 'data-orientation': 'vertical' },
          thumb: { 'aria-orientation': 'vertical' },
        },
      },
      steps: [
        { kind: 'focus', part: 'thumb' },
        { kind: 'key', key: 'ArrowUp', expect: { parts: { thumb: { 'aria-valuenow': '51' } } } },
        { kind: 'key', key: 'ArrowDown', expect: { parts: { thumb: { 'aria-valuenow': '50' } } } },
      ],
    },
    {
      name: 'getValueText：给了格式化函数才写 aria-valuetext',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { defaultValue: [30], getValueText: (d: { value: number }) => `${d.value} 分贝` },
      initial: { parts: { thumb: { 'aria-valuetext': '30 分贝', 'aria-valuenow': '30' } } },
      steps: [
        { kind: 'focus', part: 'thumb' },
        { kind: 'key', key: 'ArrowUp', expect: { parts: { thumb: { 'aria-valuetext': '31 分贝' } } } },
      ],
    },
    {
      name: '按下轨道即跳到落点，随后跟着指针走，松手收尾',
      spec: { apg: APG },
      props: { defaultValue: [0] },
      steps: [
        {
          kind: 'raw',
          why: '拖动是"按下—移动—松手"三件事，harness 的步骤表达不了；轨道矩形也要先摆出来',
          run: ({ doc }) => {
            layoutTrack(doc)
            pressControl(doc, 100) // 200px 轨道的正中
            movePointer(doc, 150)
          },
          expect: {
            parts: {
              thumb: { 'aria-valuenow': '75', 'data-dragging': '' },
              root: { 'data-dragging': '' },
            },
            // 按下的同时焦点转投到被抓住的拇指上：松手就能接着用方向键微调
            activeElement: { part: 'thumb', exact: true },
          },
        },
        {
          kind: 'raw',
          why: '松手同样是原始指针事件',
          run: ({ doc }) => releasePointer(doc),
          expect: {
            parts: {
              thumb: { 'aria-valuenow': '75', 'data-dragging': null },
              root: { 'data-dragging': null },
            },
          },
        },
        {
          kind: 'raw',
          why: '松手后监听器该撤干净，再动指针值不能跟；value 是 property 只能直接读',
          run: ({ doc }) => {
            movePointer(doc, 20)
            assertHiddenInputs(doc, [['', '75', false]])
          },
          // 上面那句是同步读，适配器还没重渲，泄漏的监听器不一定露馅；
          // 这条期望在本步冲刷之后才比，值真被拖走了就在这里炸
          expect: { parts: { thumb: { 'aria-valuenow': '75' } } },
        },
      ],
    },
    {
      name: 'disabled：推不动、退出 Tab 序列，且不吞按键',
      spec: { apg: APG },
      props: { defaultValue: [30], disabled: true, name: 'volume' },
      initial: {
        parts: {
          root: { 'data-disabled': '' },
          // 禁用即不可聚焦（与原生 input[type=range] 一致），tabindex 整个不写
          thumb: { 'aria-disabled': 'true', 'tabindex': null, 'data-disabled': '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 照常规写法这一步是空转：focus 落不到没有 tabindex 的节点上，
          // 按键因此派到 body，把守卫整个删掉用例照样绿。只有直接往拇指上派事件才碰得到。
          why: '禁用的拇指不可聚焦，focus/key 步骤都会落空，必须直接派发',
          run: ({ doc }) => {
            const thumb = findPart(doc, 'thumb')
            const arrow = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
            thumb.dispatchEvent(arrow)
            // 推不动就不能吞键：这一下该留给页面滚动
            if (arrow.defaultPrevented)
              throw new Error('禁用状态下不该拦截方向键')
            layoutTrack(doc)
            pressControl(doc, 180)
          },
          expect: { parts: { thumb: { 'aria-valuenow': '30' } } },
        },
        {
          kind: 'raw',
          why: '禁用的控件不该提交出值，disabled 只落 DOM property',
          run: ({ doc }) => assertHiddenInputs(doc, [['volume', '30', true]]),
        },
      ],
    },
    {
      name: 'readOnly：值推不动，但仍在 Tab 序列里、仍被读屏念得到',
      spec: { apg: APG },
      props: { defaultValue: [30], readOnly: true },
      initial: {
        parts: {
          // 与 disabled 的差别就在这里：仍有 tabindex，aria-disabled 仍是 false
          root: { 'data-readonly': '' },
          thumb: { 'tabindex': '0', 'aria-disabled': 'false', 'data-readonly': '' },
        },
      },
      steps: [
        { kind: 'focus', part: 'thumb' },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { thumb: { 'aria-valuenow': '30' } } } },
        {
          kind: 'raw',
          why: '只读控件仍要能聚焦，这是它与禁用的分界',
          run: ({ doc }) => {
            if (doc.activeElement !== findPart(doc, 'thumb'))
              throw new Error('只读的拇指仍应可聚焦')
          },
        },
      ],
    },
    {
      name: '受控 value：宿主不写回则值纹丝不动，回调照发',
      spec: { apg: APG },
      props: { value: [20], step: 1 },
      steps: [
        { kind: 'focus', part: 'thumb' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            // 受控下"界面没有自作主张"正是要验的东西
            parts: { thumb: { 'aria-valuenow': '20' } },
            events: [{ type: 'value-change', detail: { value: [21] } }],
          },
        },
        {
          kind: 'setProps',
          props: { value: [70] },
          expect: { parts: { thumb: { 'aria-valuenow': '70' } } },
        },
      ],
    },
    {
      name: '双滑块：各自的 aria 区间被邻居挡住，端点也只走到邻居为止',
      spec: { apg: APG_MULTI },
      fixture: twoThumbs,
      props: { defaultValue: [20, 80], name: 'price' },
      initial: {
        order: ['root', 'label', 'control', 'track', 'range', 'thumb[0]', 'hidden-input[0]', 'thumb[1]', 'hidden-input[1]'],
        counts: { 'thumb': 2, 'hidden-input': 2 },
        parts: {
          thumb: [
            { 'aria-valuenow': '20', 'aria-valuemin': '0', 'aria-valuemax': '80', 'data-index': '0' },
            { 'aria-valuenow': '80', 'aria-valuemin': '20', 'aria-valuemax': '100', 'data-index': '1' },
          ],
        },
      },
      steps: [
        { kind: 'focus', part: 'thumb[0]' },
        {
          kind: 'key',
          key: 'End',
          // 顶到邻居身上就停住：越过去会让"第 0 个滑块"突然变成右边那个，焦点与值就此错位
          expect: { parts: { thumb: [{ 'aria-valuenow': '80' }, { 'aria-valuenow': '80' }] } },
        },
        {
          kind: 'key',
          key: 'Home',
          expect: { parts: { thumb: [{ 'aria-valuenow': '0' }, { 'aria-valuenow': '80' }] } },
        },
        {
          kind: 'raw',
          why: '两份表单影子同名 append，值只落 DOM property',
          run: ({ doc }) => assertHiddenInputs(doc, [['price', '0', false], ['price', '80', false]]),
        },
      ],
    },
    {
      name: '双滑块按下轨道：抓的是离落点最近的那个，焦点跟着转过去',
      spec: { apg: APG_MULTI },
      fixture: twoThumbs,
      props: { defaultValue: [20, 80] },
      steps: [
        {
          kind: 'raw',
          why: '指针落点与最近拇指的配对只能用真实坐标演',
          run: ({ doc }) => {
            layoutTrack(doc)
            pressControl(doc, 180) // 落在 90，离 80 更近
            releasePointer(doc)
          },
          expect: {
            parts: { thumb: [{ 'aria-valuenow': '20' }, { 'aria-valuenow': '90' }] },
            activeElement: { part: 'thumb[1]', exact: true },
          },
        },
        {
          kind: 'raw',
          why: '同上，换到另一端再验一次配对没写死',
          run: ({ doc }) => {
            pressControl(doc, 20) // 落在 10，离 20 更近
            releasePointer(doc)
          },
          expect: {
            parts: { thumb: [{ 'aria-valuenow': '10' }, { 'aria-valuenow': '90' }] },
            activeElement: { part: 'thumb[0]', exact: true },
          },
        },
      ],
    },
  ],
}
