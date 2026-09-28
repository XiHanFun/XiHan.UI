import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { sortableAnatomy, sortableKeyboard } from '@xihan-ui/headless'
import { heldPress, heldPressIgnored } from './shared/press-channel'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/'

function rect(x: number, y: number, width: number, height: number): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  } as DOMRect
}

/**
 * jsdom 不排版，getBoundingClientRect 恒是 0×0——落点判据要比较各项中心，
 * 全是 0 就永远判不出越过了谁。摆一列每项 100px 高的矩形，两个适配器共用同一份桩。
 */
const LAYOUT_WHY = 'jsdom 不排版，落点判据没有几何可比；矩形打在真实节点上，对两个适配器一视同仁'

function layout({ doc }: RawStepContext): void {
  const items = [...doc.querySelectorAll<HTMLElement>('[data-scope="sortable"][data-part="item"]')]
  items.forEach((el, i) => {
    el.getBoundingClientRect = (): DOMRect => rect(0, i * 100, 200, 100)
  })
  const root = doc.querySelector<HTMLElement>('[data-scope="sortable"][data-part="root"]')
  if (root)
    root.getBoundingClientRect = (): DOMRect => rect(0, 0, 200, items.length * 100)
}

function handleAt(doc: Document, index: number): HTMLElement {
  const el = doc.querySelectorAll<HTMLElement>('[data-scope="sortable"][data-part="item-drag-trigger"]')[index]
  if (!el)
    throw new Error(`找不到 item-drag-trigger[${index}]`)
  return el
}

function press(index: number, clientY: number, pointerType = 'mouse') {
  return ({ doc }: RawStepContext): void => {
    handleAt(doc, index).dispatchEvent(
      new PointerEvent('pointerdown', { clientX: 0, clientY, button: 0, pointerType, bubbles: true, cancelable: true }),
    )
  }
}

// 跟手的指针事件挂在文档上（手可以拖出容器），因此派在 document 上
function move(clientY: number) {
  return ({ doc }: RawStepContext): void => {
    doc.dispatchEvent(new PointerEvent('pointermove', { clientX: 0, clientY, bubbles: true }))
  }
}

function release({ doc }: RawStepContext): void {
  doc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}

/** 一项 = 外壳 + 手柄，两个适配器共用这份声明。 */
function itemNode(id: string, text: string): FixtureNode {
  return {
    part: 'item',
    attrs: { 'item-id': id },
    children: [{ part: 'item-drag-trigger', tag: 'button', attrs: { 'item-id': id }, text: '⠿' }],
    text,
  }
}

const GROUP_WHY = '夹具只能挂一个根组件：同组的第二个列表摆进第一个列表的 root 里，两者的项按最近的 root 各归各'

/**
 * 同组的第二个列表（B，两项 d / e）。Vue 与 React 侧是同一组件的 root 部件；WC 侧要有自己的 <xh-sortable> 宿主，
 * ids 按元素的属性写法写成逗号串。
 */
function groupedFixture(base: FixtureNode): FixtureNode {
  const listB: FixtureNode[] = [itemNode('d', '丁'), itemNode('e', '戊'), { part: 'drop-indicator' }, { part: 'live-region' }]
  return {
    ...base,
    children: [
      ...(base.children ?? []),
      { part: 'root', only: ['vue', 'react'], attrs: { 'ids': ['d', 'e'], 'group': 'board', 'list-id': 'B' }, children: listB },
      { tag: 'xh-sortable', only: ['wc'], attrs: { 'ids': 'd,e', 'group': 'board', 'list-id': 'B' }, children: [{ part: 'root', children: listB }] },
    ],
  }
}

/**
 * 看板的几何：A 列（外层）在 x 0..200，B 列在 x 300..500，每项 200×100。
 * 各项按最近的 root 归列：B 的 root 在 DOM 里嵌在 A 的 root 里，几何上是并排的两列。
 */
function groupLayout({ doc }: RawStepContext): void {
  const roots = [...doc.querySelectorAll<HTMLElement>('[data-scope="sortable"][data-part="root"]')]
  roots.forEach((root, column) => {
    const x = column * 300
    const items = [...root.querySelectorAll<HTMLElement>('[data-scope="sortable"][data-part="item"]')]
      .filter(el => el.parentElement?.closest('[data-scope="sortable"][data-part="root"]') === root)
    items.forEach((el, i) => {
      el.getBoundingClientRect = (): DOMRect => rect(x, i * 100, 200, 100)
    })
    root.getBoundingClientRect = (): DOMRect => rect(x, 0, 200, 300)
  })
}

function pressAt(index: number, clientX: number, clientY: number) {
  return ({ doc }: RawStepContext): void => {
    handleAt(doc, index).dispatchEvent(
      new PointerEvent('pointerdown', { clientX, clientY, button: 0, pointerType: 'mouse', bubbles: true, cancelable: true }),
    )
  }
}

function moveTo(clientX: number, clientY: number) {
  return ({ doc }: RawStepContext): void => {
    doc.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: true }))
  }
}

/** 把 a 放进 B 第 1 位之后，两个列表各自的新顺序。 */
const TRANSFER_A_TO_B1 = { id: 'a', fromList: 'A', toList: 'B', from: 0, to: 1, fromIds: ['b', 'c'], toIds: ['d', 'a', 'e'] }

export const sortableSuite: ConformanceSuite = {
  component: 'sortable',
  anatomy: sortableAnatomy,
  keyboard: sortableKeyboard,
  fixture: {
    part: 'root',
    children: [itemNode('a', '甲'), itemNode('b', '乙'), itemNode('c', '丙'), { part: 'drop-indicator' }, { part: 'live-region' }],
  },
  cases: [
    {
      name: '默认：root 是 group，项带身份与下标，手柄声明自己可排序',
      spec: { apg: APG },
      props: { ids: ['a', 'b', 'c'] },
      initial: {
        counts: { 'root': 1, 'item': 3, 'item-drag-trigger': 3, 'live-region': 1 },
        parts: {
          'root': {
            // group 而不是 list：播报区（role=status）就在容器里，list 只许有 listitem 子节点。
            // 方向也不经 ARIA 表达——list/group 都不支持 aria-orientation
            'role': 'group',
            'aria-orientation': null,
            'data-orientation': 'vertical',
            'data-dragging': null,
            'data-disabled': null,
          },
          'item[0]': { 'data-value': 'a', 'data-index': '0', 'data-dragging': null },
          'item[2]': { 'data-value': 'c', 'data-index': '2' },
          'item-drag-trigger[0]': {
            'role': 'button',
            'aria-roledescription': 'sortable',
            // 显式 false：省略是「没说」，读屏对两者的处理并不一样
            'aria-disabled': 'false',
            'aria-pressed': 'false',
            'tabindex': '0',
            // 把手接 Action Control 家族：icon ghost 档、xs 正方盒、常显
            'data-xh-action-control': '',
            'data-xh-action-profile': 'icon',
            'data-xh-action-variant': 'ghost',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'xs',
          },
        },
      },
    },
    {
      name: '落点线：拾起时不在场，挪一格后落到目标项那条缝上，落下即撤',
      spec: { apg: APG },
      props: { ids: ['a', 'b', 'c'] },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        { kind: 'focus', part: 'item-drag-trigger' },
        // 落点还在起点那一位，没有缝可指
        { kind: 'key', key: ' ', expect: { parts: { 'drop-indicator': { hidden: '' } } } },
        {
          kind: 'key',
          key: 'ArrowDown',
          // 落点与起点不同一位，线露面；具体坐标写在内联样式里，不同适配器的序列化各不相同
          expect: { parts: { 'drop-indicator': { 'hidden': null, 'aria-hidden': 'true' } } },
        },
        { kind: 'key', key: ' ', expect: { parts: { 'drop-indicator': { hidden: '' } } } },
      ],
    },
    {
      name: '空格拾起，方向键挪一格，空格落下',
      spec: { apg: APG },
      covers: ['sortable.kbd.pickup', 'sortable.kbd.next', 'sortable.kbd.drop'],
      props: { ids: ['a', 'b', 'c'] },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        { kind: 'focus', part: 'item-drag-trigger' },
        {
          kind: 'key',
          key: ' ',
          expect: { parts: { 'item-drag-trigger[0]': { 'aria-pressed': 'true' }, 'root': { 'data-dragging': '' } } },
        },
        { kind: 'key', key: 'ArrowDown' },
        {
          kind: 'key',
          key: ' ',
          expect: {
            parts: { 'item-drag-trigger[0]': { 'aria-pressed': 'false' }, 'root': { 'data-dragging': null } },
            events: [{ type: 'sort', detail: { from: 0, to: 1, id: 'a', ids: ['b', 'a', 'c'] } }],
          },
        },
      ],
    },
    {
      name: '往前挪用反方向键；已在首位时不动，也不回绕',
      spec: { apg: APG },
      covers: ['sortable.kbd.prev'],
      props: { ids: ['a', 'b', 'c'] },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        { kind: 'focus', part: 'item-drag-trigger' },
        { kind: 'key', key: ' ' },
        // 第 0 项已经在首位，再往前也出不去
        { kind: 'key', key: 'ArrowUp' },
        // 位置没变，落下时不该发排序
        { kind: 'key', key: ' ', expect: { events: [] } },
      ],
    },
    {
      name: 'Escape 取消：顺序不变，手柄回到未按下态',
      spec: { apg: APG },
      covers: ['sortable.kbd.cancel'],
      props: { ids: ['a', 'b', 'c'] },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        { kind: 'focus', part: 'item-drag-trigger' },
        { kind: 'key', key: ' ' },
        { kind: 'key', key: 'ArrowDown' },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { 'item-drag-trigger[0]': { 'aria-pressed': 'false' }, 'root': { 'data-dragging': null } },
            events: [],
          },
        },
      ],
    },
    {
      name: '没走够激活距离的那一下算点击，不进拖动也不排序',
      spec: { apg: APG },
      props: { ids: ['a', 'b', 'c'] },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        { kind: 'raw', why: '指针按下要带真实坐标，按键步骤造不出', run: press(0, 50) },
        { kind: 'raw', why: '只挪 2px，不到激活距离', run: move(52), expect: { parts: { root: { 'data-dragging': null } } } },
        { kind: 'raw', why: '抬手收尾', run: release, expect: { events: [] } },
      ],
    },
    {
      name: '指针拖过一项的中心即换位',
      spec: { apg: APG },
      props: { ids: ['a', 'b', 'c'] },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        { kind: 'raw', why: '指针按下要带真实坐标，按键步骤造不出', run: press(0, 50) },
        { kind: 'raw', why: '拖过第 1 项的中心（150）', run: move(210), expect: { parts: { root: { 'data-dragging': '' } } } },
        {
          kind: 'raw',
          why: '抬手提交',
          run: release,
          expect: { events: [{ type: 'sort', detail: { from: 0, to: 1, id: 'a', ids: ['b', 'a', 'c'] } }] },
        },
      ],
    },
    {
      name: '触屏按住：手柄投影 data-pressed，抬起或指针取消撤下，按住本身不进拖动；键盘那一下在 keydown 即拾起，不留按住帧',
      spec: { adr: 'press-channel' },
      covers: ['sortable.kbd.press'],
      props: { ids: ['a', 'b', 'c'] },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        // Space / Enter 在 keydown 即拾起转拖动、按压面随即撤下，键盘那一路没有可见的按住帧，只验触屏
        heldPress('sortable', 'item-drag-trigger', { keyboardHost: null }),
        {
          kind: 'settle',
          until: { attr: { part: 'item-drag-trigger[0]', name: 'data-pressed', value: null } },
          expect: { parts: { 'root': { 'data-dragging': null }, 'item-drag-trigger[0]': { 'data-pressed': null, 'aria-pressed': 'false' } }, events: [] },
        },
        { kind: 'focus', part: 'item-drag-trigger' },
        {
          kind: 'raw',
          why: '按住的中间帧要拆开派才看得见：拾起那一下 keydown 之后按压面已被机器撤下',
          run: async ({ doc, flush }: RawStepContext) => {
            const handle = handleAt(doc, 0)
            handle.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
            await flush()
            if (handle.hasAttribute('data-pressed'))
              throw new Error('拾起转拖动那一下不该留着 data-pressed：拖动中的回执是 data-dragging')
            handle.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }))
          },
          expect: { parts: { 'item-drag-trigger[0]': { 'aria-pressed': 'true', 'data-pressed': null }, 'root': { 'data-dragging': '' } } },
        },
        { kind: 'key', key: 'Escape', expect: { parts: { 'root': { 'data-dragging': null }, 'item-drag-trigger[0]': { 'aria-pressed': 'false' } }, events: [] } },
      ],
    },
    {
      name: '触屏走够激活距离升级成拖动：按压面随即撤下，拖动中的回执只剩 data-dragging',
      spec: { adr: 'press-channel' },
      props: { ids: ['a', 'b', 'c'] },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        { kind: 'raw', why: '触屏按下要带真实坐标与 pointerType，按键步骤造不出', run: press(0, 50, 'touch'), expect: { parts: { 'item-drag-trigger[0]': { 'data-pressed': '' }, 'root': { 'data-dragging': null } } } },
        { kind: 'raw', why: '拖过第 1 项的中心（150）', run: move(210), expect: { parts: { 'item-drag-trigger[0]': { 'data-pressed': null, 'data-dragging': '' }, 'root': { 'data-dragging': '' } } } },
        {
          kind: 'raw',
          why: '抬手提交',
          run: release,
          expect: { parts: { 'item-drag-trigger[0]': { 'data-pressed': null } }, events: [{ type: 'sort', detail: { from: 0, to: 1, id: 'a', ids: ['b', 'a', 'c'] } }] },
        },
      ],
    },
    {
      name: 'disabled：手柄 aria-disabled，按住不进入按压面',
      spec: { adr: 'press-channel' },
      props: { ids: ['a', 'b', 'c'], disabled: true },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        heldPressIgnored('sortable', 'item-drag-trigger', '禁用时手柄 aria-disabled，不接受按压'),
      ],
    },
    {
      name: '入组：另一条轴上的键在相邻列表间挪，目标列表的根报 data-drop，放下由源列表发 transfer',
      spec: { apg: APG },
      covers: ['sortable.kbd.next-list', 'sortable.kbd.prev-list'],
      fixture: groupedFixture,
      props: { ids: ['a', 'b', 'c'], group: 'board', listId: 'A' },
      steps: [
        { kind: 'raw', why: GROUP_WHY, run: groupLayout },
        { kind: 'focus', part: 'item-drag-trigger' },
        { kind: 'key', key: ' ', expect: { parts: { 'root[0]': { 'data-dragging': '' }, 'root[1]': { 'data-drop': null } } } },
        // 竖排列表的组横着排：右键挪进下一个列表，那边的根报落进里面、落点线露面，这边的线收起
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { parts: { 'root[1]': { 'data-drop': 'inside', 'data-dragging': null }, 'drop-indicator[0]': { hidden: '' }, 'drop-indicator[1]': { hidden: null } } },
        },
        // 左键挪回源列表：那边撤掉让位
        { kind: 'key', key: 'ArrowLeft', expect: { parts: { 'root[1]': { 'data-drop': null }, 'drop-indicator[1]': { hidden: '' } } } },
        // 已是组里第一个列表：再往左不动，也不回绕
        { kind: 'key', key: 'ArrowLeft', expect: { parts: { 'root[1]': { 'data-drop': null } } } },
        { kind: 'key', key: 'ArrowRight' },
        { kind: 'key', key: 'ArrowDown' },
        {
          kind: 'key',
          key: ' ',
          expect: {
            parts: { 'root[0]': { 'data-dragging': null }, 'root[1]': { 'data-drop': null } },
            events: [{ type: 'transfer', detail: TRANSFER_A_TO_B1 }],
          },
        },
      ],
    },
    {
      name: '入组：Escape 取消时目标列表撤掉让位，一个事件都不发',
      spec: { apg: APG },
      covers: ['sortable.kbd.cancel'],
      fixture: groupedFixture,
      props: { ids: ['a', 'b', 'c'], group: 'board', listId: 'A' },
      steps: [
        { kind: 'raw', why: GROUP_WHY, run: groupLayout },
        { kind: 'focus', part: 'item-drag-trigger' },
        { kind: 'key', key: ' ' },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { 'root[1]': { 'data-drop': 'inside' } } } },
        { kind: 'key', key: 'Escape', expect: { parts: { 'root[0]': { 'data-dragging': null }, 'root[1]': { 'data-drop': null } }, events: [] } },
      ],
    },
    {
      name: '入组：指针把一项拖进别的列表，松手落在中心判出的那一位',
      spec: { apg: APG },
      fixture: groupedFixture,
      props: { ids: ['a', 'b', 'c'], group: 'board', listId: 'A' },
      steps: [
        { kind: 'raw', why: GROUP_WHY, run: groupLayout },
        { kind: 'raw', why: '指针按下要带真实坐标，按键步骤造不出', run: pressAt(0, 100, 50) },
        {
          kind: 'raw',
          why: '中心拖到 (400, 150)：进了 B 列，越过 d 的中心、没越过 e 的',
          run: moveTo(400, 150),
          expect: { parts: { 'root[0]': { 'data-dragging': '' }, 'root[1]': { 'data-drop': 'inside' } } },
        },
        { kind: 'raw', why: '抬手提交', run: release, expect: { parts: { 'root[1]': { 'data-drop': null } }, events: [{ type: 'transfer', detail: TRANSFER_A_TO_B1 }] } },
      ],
    },
    {
      name: 'disabled：手柄不可聚焦，按下也不进拖动',
      spec: { apg: APG },
      props: { ids: ['a', 'b', 'c'], disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'item-drag-trigger[0]': { 'aria-disabled': 'true', 'tabindex': null },
        },
      },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        { kind: 'raw', why: '指针按下要带真实坐标，按键步骤造不出', run: press(0, 50) },
        { kind: 'raw', why: '拖过中心也不该动', run: move(210), expect: { parts: { root: { 'data-dragging': null } } } },
        { kind: 'raw', why: '抬手收尾', run: release, expect: { events: [] } },
      ],
    },
  ],
}
