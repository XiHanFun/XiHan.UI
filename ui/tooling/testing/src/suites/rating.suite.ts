import type { AttrExpectation, ConformanceSuite, FixtureNode } from '../conformance/types'
import { ratingAnatomy, ratingKeyboard } from '@xihan-ui/headless'
import { singleTabStop } from './shared/native-activation'

// 评分带对外报 radiogroup，角色与键盘契约对齐 radio 模式；半档是评分自己的约定。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/'
const APG_KBD = `${APG}#keyboardinteraction`
const APG_ARIA = `${APG}#roles_states_properties`

const SCOPE = '[data-scope="rating"]'
const COUNT = 5

/** 一颗星的 fixture 节点，序号即条目身份。 */
const star = (value: number): FixtureNode => ({ part: 'item', attrs: { value: String(value) } })

function findPart(doc: Document, name: string, index = 0): HTMLElement {
  const el = doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="${name}"]`)[index]
  if (!el)
    throw new Error(`找不到 ${name}[${index}] 部件`)
  return el
}

/** 表单影子提交的是 DOM property，进不了快照，直接读。 */
function expectSubmitted(doc: Document, want: string, why: string): void {
  const got = (findPart(doc, 'hidden-input') as HTMLInputElement).value
  if (got !== want)
    throw new Error(`${why}：表单影子期望提交 "${want}"，实际 "${got}"`)
}

/** required 不进归一化快照，直接读 DOM。 */
function expectRequired(doc: Document, want: boolean, why: string): void {
  const got = (findPart(doc, 'hidden-input') as HTMLInputElement).required
  if (got !== want)
    throw new Error(`${why}：表单影子 required 期望 ${want}，实际 ${got}`)
}

/**
 * 直接往节点上派按键，返回这一下有没有被吞掉。
 * 禁用态整条带子退出 Tab 序列，按键必须派到节点本身；事件显式 cancelable 才验得出 preventDefault。
 */
function pressOn(el: HTMLElement, key: string): boolean {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  el.dispatchEvent(e)
  return e.defaultPrevented
}

/**
 * 指针划过第 index 颗星（0 起）。
 * jsdom 不做布局，要演半颗星须显式给出这颗星的宽度与落点。
 */
function hoverStar(doc: Document, index: number, geometry?: { offsetX: number, width: number }): void {
  const el = findPart(doc, 'item', index)
  const e = new PointerEvent('pointermove', { bubbles: true })
  if (geometry) {
    Object.defineProperty(el, 'clientWidth', { value: geometry.width, configurable: true })
    Object.defineProperty(e, 'offsetX', { value: geometry.offsetX, configurable: true })
  }
  el.dispatchEvent(e)
}

/** 指针离开评分带；pointerleave 不冒泡，只能派在 control 自己身上。 */
function leaveControl(doc: Document, type: 'pointerleave' | 'pointercancel'): void {
  findPart(doc, 'control').dispatchEvent(new PointerEvent(type, { bubbles: type === 'pointercancel' }))
}

/**
 * 五颗星的期望：pattern 逐颗描述点亮情况（'●' 全亮 / '◐' 半亮 / '○' 不亮），
 * checked 是 aria-checked 的落点（1 起，0 表示还没评）。
 */
function stars(pattern: string, checked: number): AttrExpectation[] {
  return [...pattern].map((c, i) => ({
    'aria-checked': i + 1 === checked ? 'true' : 'false',
    'data-highlighted': c === '○' ? null : '',
    'data-half': c === '◐' ? '' : null,
  }))
}

export const ratingSuite: ConformanceSuite = {
  component: 'rating',
  anatomy: ratingAnatomy,
  keyboard: ratingKeyboard,
  // control 是 role=radiogroup 的星星带，星星写在它里面；表单影子是根下的兄弟节点。
  fixture: {
    part: 'root',
    children: [
      { part: 'label', text: '评分' },
      {
        part: 'control',
        children: Array.from({ length: COUNT }, (_, i) => star(i + 1)),
      },
      { part: 'hidden-input', tag: 'input' },
    ],
  },
  cases: [
    {
      name: '默认未评分：control 是 radiogroup，每颗星报得出自己是第几颗、一共几颗',
      spec: { apg: APG_ARIA },
      props: { name: 'score' },
      initial: {
        order: ['root', 'label', 'control', 'item[0]', 'item[1]', 'item[2]', 'item[3]', 'item[4]', 'hidden-input'],
        counts: { 'root': 1, 'label': 1, 'control': 1, 'item': COUNT, 'hidden-input': 1 },
        parts: {
          'root': { 'data-empty': '', 'data-disabled': null, 'data-readonly': null },
          'label': { id: '@self' },
          'control': {
            'role': 'radiogroup',
            'aria-labelledby': '@part(label)',
            // 星星恒是一条横排，上下键照样接
            'aria-orientation': 'horizontal',
            // 三个 aria 布尔显式给出 false，不省略
            'aria-disabled': 'false',
            'aria-readonly': 'false',
            'aria-required': 'false',
            // 一颗星都没评，无锚点，Tab 位由容器兜底
            'tabindex': '0',
            'data-disabled': null,
            'data-readonly': null,
          },
          'item': Array.from({ length: COUNT }, (_, i) => ({
            'role': 'radio',
            'aria-posinset': String(i + 1),
            'aria-setsize': String(COUNT),
            'aria-checked': 'false',
            'aria-disabled': 'false',
            'data-value': String(i + 1),
            'data-state': 'unchecked',
            'data-highlighted': null,
            'data-half': null,
            'tabindex': '-1',
            // 集合条目不输出原生 disabled
            'disabled': null,
          })),
          // 表单影子对键盘与读屏都不存在
          'hidden-input': {
            'type': 'text',
            'name': 'score',
            'tabindex': '-1',
            'aria-hidden': 'true',
            'readonly': null,
            'disabled': null,
          },
        },
        activeElement: null,
      },
      steps: [
        {
          kind: 'raw',
          why: '表单影子的 value 与 required 都进不了归一化快照',
          run: ({ doc }) => {
            // 一颗都没评时提交空串而不是 "0"，否则 required 拦不住
            expectSubmitted(doc, '', '一颗星都没评时')
            expectRequired(doc, false, '没声明 required 时')
          },
        },
      ],
    },
    {
      name: '评过分：aria-checked 只落在承载它的那颗星，前几颗点亮，root 不再是空态',
      spec: { apg: APG_ARIA },
      props: { defaultValue: 3, name: 'score', required: true },
      initial: {
        parts: {
          'root': { 'data-empty': null },
          'control': { 'aria-required': 'true' },
          'item': stars('●●●○○', 3),
          // 锚点跟当前值走，第 3 颗占 Tab 位
          'item[2]': { 'tabindex': '0', 'data-state': 'checked' },
          'item[1]': { 'tabindex': '-1', 'data-state': 'unchecked' },
          // 未声明只读时不写 readonly
          'hidden-input': { readonly: null, disabled: null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '表单影子的 value 与 required 都进不了归一化快照',
          run: ({ doc }) => {
            expectSubmitted(doc, '3', '评了 3 分时')
            expectRequired(doc, true, '声明了 required 时')
          },
        },
      ],
    },
    {
      name: 'roving tabindex：整条带子只有一个 Tab 停靠点，无锚点时容器兜底并转投首颗',
      spec: { apg: APG_KBD },
      covers: ['rating.kbd.tab'],
      steps: [
        singleTabStop('rating', 'item', 'control'),
        {
          kind: 'focus',
          part: 'control',
          expect: {
            parts: {
              'control': { tabindex: '-1' },
              'item[0]': { tabindex: '0' },
              'item[1]': { tabindex: '-1' },
            },
            // 焦点从带外落到容器时转投首颗星
            activeElement: { part: 'item[0]', exact: true },
            events: [],
          },
        },
        singleTabStop('rating', 'item', 'control'),
        {
          kind: 'blur',
          expect: {
            parts: {
              'control': { tabindex: '0' },
              'item[0]': { tabindex: '-1' },
            },
            activeElement: null,
            events: [],
          },
        },
      ],
    },
    {
      name: '方向键走一档：上/右加、下/左减，焦点跟着落到承载新值的那颗星上',
      spec: { apg: APG_KBD },
      covers: ['rating.kbd.increment', 'rating.kbd.decrement'],
      props: { defaultValue: 2 },
      steps: [
        { kind: 'focus', part: 'control', expect: { activeElement: { part: 'item[1]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: { item: stars('●●●○○', 3) },
            // 值动了焦点跟着走
            activeElement: { part: 'item[2]', exact: true },
            events: [{ type: 'value-change', detail: { value: 3 } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: { item: stars('●●●●○', 4) },
            activeElement: { part: 'item[3]', exact: true },
            events: [{ type: 'value-change', detail: { value: 4 } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            parts: { item: stars('●●●○○', 3) },
            activeElement: { part: 'item[2]', exact: true },
            events: [{ type: 'value-change', detail: { value: 3 } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: { item: stars('●●○○○', 2) },
            activeElement: { part: 'item[1]', exact: true },
            events: [{ type: 'value-change', detail: { value: 2 } }],
          },
        },
        {
          kind: 'raw',
          why: '表单影子的 value 只落 DOM property，键盘走过一圈后要直接读才验得到提交的是新值',
          run: ({ doc }) => expectSubmitted(doc, '2', '加两档再减两档后'),
        },
      ],
    },
    {
      name: 'Home / End 取两端；到顶到底再按都停住，不越界也不回绕',
      spec: { apg: APG_KBD },
      covers: ['rating.kbd.min', 'rating.kbd.max'],
      props: { defaultValue: 3 },
      steps: [
        { kind: 'focus', part: 'control' },
        {
          kind: 'key',
          key: 'End',
          expect: {
            parts: { item: stars('●●●●●', 5) },
            activeElement: { part: 'item[4]', exact: true },
            events: [{ type: 'value-change', detail: { value: 5 } }],
          },
        },
        {
          // 已满分再按：不越界也不回绕，值没动就不报变化
          kind: 'key',
          key: 'ArrowRight',
          expect: { parts: { item: stars('●●●●●', 5) }, events: [] },
        },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            parts: { item: stars('●○○○○', 1) },
            activeElement: { part: 'item[0]', exact: true },
            events: [{ type: 'value-change', detail: { value: 1 } }],
          },
        },
        {
          // 下界是一档而不是 0（0 表示还没评）
          kind: 'key',
          key: 'ArrowLeft',
          expect: { parts: { item: stars('●○○○○', 1) }, events: [] },
        },
      ],
    },
    {
      name: 'dir=rtl：左右两键对调，上下两键不受影响',
      spec: { apg: APG_KBD },
      covers: ['rating.kbd.increment', 'rating.kbd.decrement'],
      props: { defaultValue: 3, dir: 'rtl' },
      steps: [
        { kind: 'focus', part: 'control', expect: { activeElement: { part: 'item[2]', exact: true } } },
        {
          // 从右往左排版时，屏幕向右是往回走
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: { item: stars('●●○○○', 2) },
            activeElement: { part: 'item[1]', exact: true },
            events: [{ type: 'value-change', detail: { value: 2 } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            parts: { item: stars('●●●○○', 3) },
            activeElement: { part: 'item[2]', exact: true },
            events: [{ type: 'value-change', detail: { value: 3 } }],
          },
        },
        {
          // 上下键固定为往上变大，与文字方向无关
          kind: 'key',
          key: 'ArrowUp',
          expect: { parts: { item: stars('●●●●○', 4) }, events: [{ type: 'value-change', detail: { value: 4 } }] },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { parts: { item: stars('●●●○○', 3) }, events: [{ type: 'value-change', detail: { value: 3 } }] },
        },
      ],
    },
    {
      name: '悬停只改点亮范围：真实值与 aria-checked 纹丝不动，指针离开即复位',
      spec: { apg: APG_ARIA },
      props: { defaultValue: 1 },
      steps: [
        {
          kind: 'raw',
          why: 'apply-step 没有 hover 步骤类型，指针划过只能直接派发',
          run: ({ doc }) => hoverStar(doc, 3),
          expect: {
            // 前四颗跟着预览亮起，aria-checked 仍在第 1 颗
            parts: { item: stars('●●●●○', 1) },
            // 预览不落值，不报值变化
            events: [],
          },
        },
        {
          kind: 'raw',
          why: '预览有没有偷偷写进真实值，只有表单影子说了算（value 只落 DOM property）',
          run: ({ doc }) => expectSubmitted(doc, '1', '悬停预览期间'),
        },
        {
          kind: 'raw',
          why: '指针离开评分带同样只能直接派发；pointerleave 不冒泡，要派在 control 自己身上',
          run: ({ doc }) => leaveControl(doc, 'pointerleave'),
          expect: { parts: { item: stars('●○○○○', 1) }, events: [] },
        },
        {
          kind: 'raw',
          why: '指针被系统抢走（滑动手势）是另一条收尾出口，同样要演一遍',
          run: ({ doc }) => {
            hoverStar(doc, 4)
            leaveControl(doc, 'pointercancel')
          },
          expect: { parts: { item: stars('●○○○○', 1) }, events: [] },
        },
      ],
    },
    {
      name: 'allowHalf：一档变成半颗，承载半档的那颗星既点亮又带 data-half',
      spec: { apg: APG_ARIA },
      props: { defaultValue: 2, allowHalf: true },
      initial: { parts: { item: stars('●●○○○', 2) } },
      steps: [
        { kind: 'focus', part: 'control', expect: { activeElement: { part: 'item[1]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            // 半档没有独立的 radio，aria-checked 落在承载它的那一颗上
            parts: { 'item': stars('●●◐○○', 3), 'item[2]': { 'data-state': 'checked' } },
            activeElement: { part: 'item[2]', exact: true },
            events: [{ type: 'value-change', detail: { value: 2.5 } }],
          },
        },
        {
          kind: 'raw',
          why: '表单影子的 value 只落 DOM property',
          run: ({ doc }) => expectSubmitted(doc, '2.5', '从 2 加一档（半颗）后'),
        },
        {
          // 再走一档补满这颗星，半亮标记收回
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: { item: stars('●●●○○', 3) },
            activeElement: { part: 'item[2]', exact: true },
            events: [{ type: 'value-change', detail: { value: 3 } }],
          },
        },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            // allowHalf 打开时最小档也是半颗
            parts: { item: stars('◐○○○○', 1) },
            activeElement: { part: 'item[0]', exact: true },
            events: [{ type: 'value-change', detail: { value: 0.5 } }],
          },
        },
        {
          kind: 'raw',
          why: 'apply-step 没有 hover 步骤类型，指针划过只能直接派发',
          // 落在第 5 颗左半边：宽 20 的星，落点 4 即前半
          run: ({ doc }) => hoverStar(doc, 4, { offsetX: 4, width: 20 }),
          expect: {
            // 预览到 4.5：前四颗全亮，第 5 颗半亮；aria-checked 仍跟着真实值 0.5
            parts: { item: stars('●●●●◐', 1) },
            events: [],
          },
        },
      ],
    },
    {
      name: 'readOnly：仍可聚焦、仍被读屏念得到，只是改不动，也不给悬停预览',
      spec: { apg: APG_ARIA },
      props: { defaultValue: 2, readOnly: true },
      initial: {
        parts: {
          'root': { 'data-readonly': '', 'data-disabled': null },
          'control': {
            // 只读仍留一个 Tab 位
            'tabindex': '0',
            'aria-readonly': 'true',
            'aria-disabled': 'false',
            'data-readonly': '',
            'data-disabled': null,
          },
          'item[1]': { 'tabindex': '0', 'aria-disabled': 'false', 'data-readonly': '', 'aria-checked': 'true' },
          // readonly 随 prop 走，不恒为真
          'hidden-input': { readonly: '', disabled: null },
        },
      },
      steps: [
        {
          kind: 'focus',
          part: 'control',
          // 只读的评分带仍可聚焦
          expect: { activeElement: { part: 'item[1]', exact: true } },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { parts: { item: stars('●●○○○', 2) }, events: [] },
        },
        {
          kind: 'raw',
          why: '"改不动就别吞键"没有快照通道，只能直接看事件对象；合成事件必须显式 cancelable，否则这条断言永真',
          run: ({ doc }) => {
            if (pressOn(findPart(doc, 'control'), 'End'))
              throw new Error('只读状态下不该拦截 End：这一下该留给页面')
            expectSubmitted(doc, '2', '只读时按键之后')
          },
        },
        {
          kind: 'raw',
          why: '悬停同样要直接派发；只读时预览等于在说"点这儿就能改"，而此刻改不动',
          run: ({ doc }) => hoverStar(doc, 4),
          expect: { parts: { item: stars('●●○○○', 2) }, events: [] },
        },
      ],
    },
    {
      name: 'disabled：整条带子退出 Tab 序列，键盘与指针一概不认，也不吞键',
      spec: { apg: APG_ARIA },
      props: { defaultValue: 2, disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '', 'data-readonly': null },
          'control': {
            // 禁用不可聚焦，不写 tabindex
            'tabindex': null,
            'aria-disabled': 'true',
            'aria-readonly': 'false',
            'data-disabled': '',
          },
          'item': Array.from({ length: COUNT }, () => ({
            'aria-disabled': 'true',
            'data-disabled': '',
            'tabindex': null,
            // 条目走 aria-disabled，不用原生 disabled
            'disabled': null,
          })),
          // 单体输入用原生 disabled，禁用时不提交值
          'hidden-input': { disabled: '' },
        },
      },
      steps: [
        {
          kind: 'focus',
          part: 'control',
          // 没有 tabindex，焦点落不上去
          expect: { activeElement: null },
        },
        {
          kind: 'raw',
          why: '禁用态下 focus/key/click 步骤全是空转（焦点落不上去、按键派到 body、激活行为被短路），把守卫删掉照样绿；只有直接派发才碰得到守卫',
          run: ({ doc }) => {
            const control = findPart(doc, 'control')
            for (const key of ['ArrowRight', 'ArrowUp', 'Home', 'End']) {
              if (pressOn(control, key))
                throw new Error(`禁用状态下不该拦截 ${key}：推不动就不能吞键`)
            }
            const last = findPart(doc, 'item', 4)
            last.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
            last.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }))
          },
          expect: {
            // 值没动，也没有星因指针划过而亮起
            parts: { item: stars('●●○○○', 2) },
            events: [],
          },
        },
        {
          kind: 'raw',
          why: 'value 与 disabled 的实际生效面都在 DOM property 上，只能直接读',
          run: ({ doc }) => {
            expectSubmitted(doc, '2', '禁用态被硬派了键盘与指针事件之后')
            if (!(findPart(doc, 'hidden-input') as HTMLInputElement).disabled)
              throw new Error('禁用的评分不该提交出值，表单影子必须是原生 disabled')
          },
        },
      ],
    },
    {
      name: '受控 value：宿主不写回则界面不自作主张，宿主翻转后 UI 跟着走',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: 2 },
      steps: [
        { kind: 'focus', part: 'control', expect: { activeElement: { part: 'item[1]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            // 受控下界面不自行改值
            parts: { item: stars('●●○○○', 2) },
            // 值没写回，焦点留在第 2 颗上
            activeElement: { part: 'item[1]', exact: true },
            events: [{ type: 'value-change', detail: { value: 3 } }],
          },
        },
        {
          kind: 'setProps',
          props: { value: 4 },
          expect: {
            parts: {
              'item': stars('●●●●○', 4),
              // 锚点跟焦点走，不跟值走
              'item[1]': { tabindex: '0' },
              'item[3]': { tabindex: '-1' },
            },
            events: [],
          },
        },
        {
          kind: 'raw',
          why: '宿主写回后表单提交的也得是新值，value 只落 DOM property',
          run: ({ doc }) => expectSubmitted(doc, '4', '宿主把受控值翻到 4 之后'),
        },
      ],
    },
  ],
}
