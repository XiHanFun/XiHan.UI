import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { sortableAnatomy, sortableKeyboard } from '@xihan-ui/headless'

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

function press(index: number, clientY: number) {
  return ({ doc }: RawStepContext): void => {
    handleAt(doc, index).dispatchEvent(
      new PointerEvent('pointerdown', { clientX: 0, clientY, button: 0, bubbles: true, cancelable: true }),
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

export const sortableSuite: ConformanceSuite = {
  component: 'sortable',
  anatomy: sortableAnatomy,
  keyboard: sortableKeyboard,
  fixture: {
    part: 'root',
    children: [itemNode('a', '甲'), itemNode('b', '乙'), itemNode('c', '丙'), { part: 'live-region' }],
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
          },
        },
      },
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
