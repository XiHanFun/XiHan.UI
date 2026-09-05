import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { resizableAnatomy, resizableKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/'
const APG_KBD = `${APG}#keyboardinteraction`

/**
 * jsdom 不排版，getBoundingClientRect 恒是 0×0——按下那一刻要量的矩形不存在，
 * 拖动一步也走不出来。摆一块 200×100 的盒子，两个适配器共用同一份桩。
 */
const LAYOUT_WHY = 'jsdom 不排版，按下那一刻没有矩形可量；桩打在真实节点上，对两个适配器一视同仁'

function layout({ doc }: RawStepContext): void {
  const root = doc.querySelector<HTMLElement>('[data-scope="resizable"][data-part="root"]')
  if (!root)
    return
  root.getBoundingClientRect = (): DOMRect =>
    ({ x: 100, y: 50, width: 200, height: 100, top: 50, left: 100, right: 300, bottom: 150, toJSON: () => ({}) }) as DOMRect
}

function handleAt(doc: Document, edge: string): HTMLElement {
  const el = doc.querySelector<HTMLElement>(`[data-scope="resizable"][data-part="handle"][data-edge="${edge}"]`)
  if (!el)
    throw new Error(`找不到 ${edge} 把手`)
  return el
}

function press(edge: string, clientX: number, clientY = 0) {
  return ({ doc }: RawStepContext): void => {
    handleAt(doc, edge).dispatchEvent(
      new PointerEvent('pointerdown', { clientX, clientY, button: 0, bubbles: true, cancelable: true }),
    )
  }
}

// 跟手的指针事件挂在文档上（手可以拖出容器），因此派在 document 上
function move(clientX: number, clientY = 0) {
  return ({ doc }: RawStepContext): void => {
    doc.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: true }))
  }
}

function release({ doc }: RawStepContext): void {
  doc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}

/** 八向把手；每个把手用 edge 属性写明自己是哪条边。 */
function handles(): FixtureNode[] {
  return (['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const).map(edge => ({
    part: 'handle',
    tag: 'span',
    attrs: { edge },
  }))
}

export const resizableSuite: ConformanceSuite = {
  component: 'resizable',
  anatomy: resizableAnatomy,
  keyboard: resizableKeyboard,
  fixture: {
    part: 'root',
    children: handles(),
  },
  cases: [
    {
      name: '默认：root 是 group，八向把手各自是分隔条并报出所在轴的尺寸',
      spec: { apg: `${APG}#wai-ariaroles,statesandproperties` },
      props: { defaultDimensions: { width: 200, height: 100 } },
      initial: {
        counts: { root: 1, handle: 8 },
        parts: {
          'root': {
            'role': 'group',
            'data-resizing': null,
            'data-disabled': null,
            'data-edge': null,
          },
          // 第 0 个是北边：它推的是竖轴，分隔条自身因此是横的
          'handle[0]': {
            'role': 'separator',
            'aria-orientation': 'horizontal',
            'aria-valuenow': '100',
            'aria-disabled': 'false',
            'tabindex': '0',
            'data-edge': 'n',
          },
          // 第 2 个是东边：推横轴，分隔条自身是竖的
          'handle[2]': {
            'aria-orientation': 'vertical',
            'aria-valuenow': '200',
            'data-edge': 'e',
          },
        },
      },
    },
    {
      name: '方向键按屏幕方向推一步；Shift 走大步',
      spec: { apg: APG_KBD },
      covers: ['resizable.kbd.push', 'resizable.kbd.pull', 'resizable.kbd.large'],
      props: { defaultDimensions: { width: 200, height: 100 } },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        { kind: 'focus', part: 'handle[2]' },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { 'handle[2]': { 'aria-valuenow': '208' } } } },
        { kind: 'key', key: 'ArrowLeft', expect: { parts: { 'handle[2]': { 'aria-valuenow': '200' } } } },
        {
          kind: 'key',
          key: 'ArrowRight',
          modifiers: ['Shift'],
          expect: { parts: { 'handle[2]': { 'aria-valuenow': '240' } } },
        },
      ],
    },
    {
      name: 'Home / End 推到这条边能到的两端，且不越过约束',
      spec: { apg: APG_KBD },
      covers: ['resizable.kbd.min', 'resizable.kbd.max'],
      props: { defaultDimensions: { width: 200, height: 100 }, minWidth: 120, maxWidth: 400 },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        { kind: 'focus', part: 'handle[2]' },
        { kind: 'key', key: 'End', expect: { parts: { 'handle[2]': { 'aria-valuenow': '400' } } } },
        { kind: 'key', key: 'Home', expect: { parts: { 'handle[2]': { 'aria-valuenow': '120' } } } },
        // 已经贴着下界还按：不该越过去，更不该回绕
        { kind: 'key', key: 'Home', expect: { parts: { 'handle[2]': { 'aria-valuenow': '120' } } } },
      ],
    },
    {
      name: '拖东边只变宽；系统收走指针时退回按下那一刻',
      spec: { apg: APG },
      props: { defaultDimensions: { width: 200, height: 100 } },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        { kind: 'raw', why: '指针按下要带真实坐标，按键步骤造不出', run: press('e', 300) },
        {
          kind: 'raw',
          why: '往右拖 60px',
          run: move(360),
          expect: { parts: { 'root': { 'data-resizing': '', 'data-edge': 'e' }, 'handle[2]': { 'aria-valuenow': '260' } } },
        },
        {
          kind: 'raw',
          why: '系统收走指针',
          run: ({ doc }) => { doc.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true })) },
          expect: { parts: { 'root': { 'data-resizing': null }, 'handle[2]': { 'aria-valuenow': '200' } } },
        },
      ],
    },
    {
      name: '只开放部分边时，其余把手退出 Tab 序列',
      spec: { apg: APG },
      props: { defaultDimensions: { width: 200, height: 100 }, edges: ['e', 's', 'se'] },
      initial: {
        parts: {
          'handle[0]': { 'aria-disabled': 'true', 'tabindex': '-1', 'data-disabled': '' },
          'handle[2]': { 'aria-disabled': 'false', 'tabindex': '0', 'data-disabled': null },
        },
      },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        { kind: 'raw', why: '没开放的边按下也不该进调整', run: press('n', 0, 50) },
        { kind: 'raw', why: '拖也不动', run: move(0, 10), expect: { parts: { root: { 'data-resizing': null } } } },
        { kind: 'raw', why: '抬手收尾', run: release },
      ],
    },
    {
      name: 'disabled：把手全部退出 Tab 序列，按下也不进调整',
      spec: { apg: APG },
      props: { defaultDimensions: { width: 200, height: 100 }, disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'handle[2]': { 'aria-disabled': 'true', 'tabindex': '-1' },
        },
      },
      steps: [
        { kind: 'raw', why: LAYOUT_WHY, run: layout },
        { kind: 'raw', why: '指针按下要带真实坐标，按键步骤造不出', run: press('e', 300) },
        { kind: 'raw', why: '拖也不动', run: move(360), expect: { parts: { root: { 'data-resizing': null } } } },
        { kind: 'raw', why: '抬手收尾', run: release },
      ],
    },
  ],
}
