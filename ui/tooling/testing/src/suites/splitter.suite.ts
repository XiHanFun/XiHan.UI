import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { splitterAnatomy, splitterKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/'
const APG_KBD = `${APG}#keyboardinteraction`

function findPart(doc: Document, name: string, index = 0): HTMLElement {
  const el = doc.querySelectorAll<HTMLElement>(`[data-scope="splitter"][data-part="${name}"]`)[index]
  if (!el)
    throw new Error(`找不到 ${name}[${index}] 部件`)
  return el
}

/**
 * jsdom 不做布局，getBoundingClientRect 恒是 0×0——机器那边会当成"容器还没就位"原地不动，
 * 拖动因此一步也走不出来。摆一个 200px 宽的容器，像素与百分比才有得换算。
 * 两个适配器都把这份矩形交给同一台机器，桩打在真实节点上、对两侧一视同仁。
 */
function layoutRoot(doc: Document): void {
  const root = findPart(doc, 'root')
  root.getBoundingClientRect = (): DOMRect => ({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    top: 0,
    left: 0,
    right: 200,
    bottom: 200,
    toJSON: () => ({}),
  }) as DOMRect
}

function pressTrigger(doc: Document, clientX: number, index = 0): void {
  findPart(doc, 'resize-trigger', index).dispatchEvent(
    new PointerEvent('pointerdown', { clientX, clientY: clientX, button: 0, bubbles: true, cancelable: true }),
  )
}

// 拖动途中的指针事件挂在文档上（手可以拖出容器甚至拖出窗口），因此派在 document 上
function movePointer(doc: Document, clientX: number): void {
  doc.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY: clientX, bubbles: true }))
}

function releasePointer(doc: Document): void {
  doc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
}

/** 面板与分隔条都要写明自己是第几个：同一份声明喂给两个适配器。 */
function panelNode(index: number, text: string): FixtureNode {
  return { part: 'panel', attrs: { index: String(index) }, text }
}

function triggerNode(index: number): FixtureNode {
  return { part: 'resize-trigger', attrs: { index: String(index) } }
}

/** 三栏变体：两条分隔条，各自坐在自己那一对面板中间。 */
function threePanels(): FixtureNode {
  return {
    part: 'root',
    children: [
      panelNode(0, '左'),
      triggerNode(0),
      panelNode(1, '中'),
      triggerNode(1),
      panelNode(2, '右'),
    ],
  }
}

export const splitterSuite: ConformanceSuite = {
  component: 'splitter',
  anatomy: splitterAnatomy,
  keyboard: splitterKeyboard,
  fixture: {
    part: 'root',
    children: [
      panelNode(0, '侧栏'),
      triggerNode(0),
      panelNode(1, '正文'),
    ],
  },
  cases: [
    {
      name: '默认：root 是 group，分隔条是 separator 且 aria-controls 指向它调整的那块面板',
      spec: { apg: `${APG}#wai-ariaroles,statesandproperties` },
      props: { defaultSize: [40, 60], panels: [{ id: 'side', min: 20, max: 80 }, { id: 'main' }] },
      initial: {
        order: ['root', 'panel[0]', 'resize-trigger', 'panel[1]'],
        counts: { 'root': 1, 'panel': 2, 'resize-trigger': 1 },
        parts: {
          'root': {
            'role': 'group',
            'aria-orientation': 'horizontal',
            'data-orientation': 'horizontal',
            'data-disabled': null,
            'data-dragging': null,
          },
          'panel[0]': { 'id': '@self', 'data-index': '0', 'data-collapsed': null },
          'panel[1]': { 'id': '@self', 'data-index': '1' },
          'resize-trigger': {
            'role': 'separator',
            // 分隔条自身横竖与面板的排布轴垂直：并排的两块之间竖着一条
            'aria-orientation': 'vertical',
            'aria-valuenow': '40',
            // 区间取这块面板眼下真走得到的范围
            'aria-valuemin': '20',
            'aria-valuemax': '80',
            // 指的是前一块，不是后一块
            'aria-controls': '@part(panel[0])',
            // 显式 false：省略是"没说"，读屏对两者的处理并不一样
            'aria-disabled': 'false',
            'tabindex': '0',
            'data-index': '0',
            'data-dragging': null,
          },
        },
      },
    },
    {
      name: '方向键按 step 推动；水平排布只认左右两键',
      spec: { apg: APG_KBD },
      covers: ['splitter.kbd.grow', 'splitter.kbd.shrink'],
      props: { defaultSize: [50, 50], step: 5 },
      steps: [
        { kind: 'focus', part: 'resize-trigger' },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { 'resize-trigger': { 'aria-valuenow': '55' } } } },
        { kind: 'key', key: 'ArrowLeft', expect: { parts: { 'resize-trigger': { 'aria-valuenow': '50' } } } },
        // 另一条轴上的方向键不归它管：布局不动，默认行为也放行给页面滚动
        { kind: 'key', key: 'ArrowDown', expect: { parts: { 'resize-trigger': { 'aria-valuenow': '50' } } } },
      ],
    },
    {
      name: 'Shift + 方向键走 largeStep，未指定时是 10%',
      spec: { apg: APG_KBD },
      covers: ['splitter.kbd.large-grow', 'splitter.kbd.large-shrink'],
      props: { defaultSize: [50, 50] },
      steps: [
        { kind: 'focus', part: 'resize-trigger' },
        { kind: 'key', key: 'ArrowRight', modifiers: ['Shift'], expect: { parts: { 'resize-trigger': { 'aria-valuenow': '60' } } } },
        { kind: 'key', key: 'ArrowLeft', modifiers: ['Shift'], expect: { parts: { 'resize-trigger': { 'aria-valuenow': '50' } } } },
      ],
    },
    {
      name: 'Home / End 推到该面板眼下能到的两端，且不越过约束',
      spec: { apg: APG_KBD },
      covers: ['splitter.kbd.min', 'splitter.kbd.max'],
      props: { defaultSize: [50, 50], panels: [{ id: 'side', min: 20, max: 80 }, { id: 'main', min: 30 }] },
      steps: [
        { kind: 'focus', part: 'resize-trigger' },
        // 正文最少 30，所以侧栏最多只到 70——不是它自己写的 80
        { kind: 'key', key: 'End', expect: { parts: { 'resize-trigger': { 'aria-valuenow': '70' } } } },
        { kind: 'key', key: 'Home', expect: { parts: { 'resize-trigger': { 'aria-valuenow': '20' } } } },
        // 已经贴着下界还按：不该越过去，更不该回绕
        { kind: 'key', key: 'Home', expect: { parts: { 'resize-trigger': { 'aria-valuenow': '20' } } } },
      ],
    },
    {
      name: 'Enter 在可折叠的面板上折叠 / 展开，展开回到折叠前的尺寸',
      spec: { apg: APG },
      covers: ['splitter.kbd.toggle'],
      props: { defaultSize: [30, 70], panels: [{ id: 'side', min: 20, collapsible: true }, { id: 'main' }] },
      steps: [
        { kind: 'focus', part: 'resize-trigger' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              'panel[0]': { 'data-collapsed': '' },
              'resize-trigger': { 'aria-valuenow': '0' },
            },
          },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              'panel[0]': { 'data-collapsed': null },
              'resize-trigger': { 'aria-valuenow': '30' },
            },
          },
        },
      ],
    },
    {
      name: '面板不可折叠时 Enter 不归它管',
      spec: { apg: APG },
      props: { defaultSize: [30, 70] },
      steps: [
        { kind: 'focus', part: 'resize-trigger' },
        { kind: 'key', key: 'Enter', expect: { parts: { 'resize-trigger': { 'aria-valuenow': '30' } } } },
      ],
    },
    {
      name: '竖直排布：分隔条自身变横的，方向键跟着换轴',
      spec: { apg: `${APG}#wai-ariaroles,statesandproperties` },
      props: { defaultSize: [50, 50], orientation: 'vertical' },
      initial: {
        parts: {
          'root': { 'aria-orientation': 'vertical', 'data-orientation': 'vertical' },
          'resize-trigger': { 'aria-orientation': 'horizontal' },
        },
      },
      steps: [
        { kind: 'focus', part: 'resize-trigger' },
        { kind: 'key', key: 'ArrowDown', expect: { parts: { 'resize-trigger': { 'aria-valuenow': '51' } } } },
        { kind: 'key', key: 'ArrowUp', expect: { parts: { 'resize-trigger': { 'aria-valuenow': '50' } } } },
        // 竖直排布下左右两键不归它管
        { kind: 'key', key: 'ArrowRight', expect: { parts: { 'resize-trigger': { 'aria-valuenow': '50' } } } },
      ],
    },
    {
      name: '从右往左排版只对调左右两键：语义恒是"撑大前一块"',
      spec: { apg: APG_KBD },
      props: { defaultSize: [50, 50], dir: 'rtl' },
      steps: [
        { kind: 'focus', part: 'resize-trigger' },
        { kind: 'key', key: 'ArrowLeft', expect: { parts: { 'resize-trigger': { 'aria-valuenow': '51' } } } },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { 'resize-trigger': { 'aria-valuenow': '50' } } } },
      ],
    },
    {
      name: 'disabled：推不动、退出 Tab 序列，且不吞按键',
      spec: { apg: APG },
      props: { defaultSize: [30, 70], disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          // 禁用即不可聚焦，tabindex 整个不写
          'resize-trigger': { 'aria-disabled': 'true', 'tabindex': null, 'data-disabled': '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 照常规写法这一步是空转：focus 落不到没有 tabindex 的节点上，
          // 按键因此派到 body，把守卫整个删掉用例照样绿。只有直接往分隔条上派事件才碰得到。
          why: '禁用的分隔条不可聚焦，focus/key 步骤都会落空，必须直接派发',
          run: ({ doc }) => {
            const trigger = findPart(doc, 'resize-trigger')
            const arrow = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
            trigger.dispatchEvent(arrow)
            // 推不动就不能吞键：这一下该留给页面滚动
            if (arrow.defaultPrevented)
              throw new Error('禁用状态下不该拦截方向键')
            layoutRoot(doc)
            pressTrigger(doc, 180)
            movePointer(doc, 20)
          },
          expect: { parts: { 'resize-trigger': { 'aria-valuenow': '30' } } },
        },
      ],
    },
    {
      name: '受控 size：宿主不写回则布局纹丝不动',
      spec: { apg: APG },
      props: { size: [20, 80] },
      steps: [
        { kind: 'focus', part: 'resize-trigger' },
        {
          kind: 'key',
          key: 'ArrowRight',
          // 受控下"界面没有自作主张"正是要验的东西
          expect: { parts: { 'resize-trigger': { 'aria-valuenow': '20' } } },
        },
        {
          kind: 'setProps',
          props: { size: [70, 30] },
          expect: { parts: { 'resize-trigger': { 'aria-valuenow': '70' } } },
        },
      ],
    },
    {
      name: '三栏：每条分隔条各管自己那一块，前面的面板不受牵连',
      spec: { apg: APG },
      fixture: threePanels,
      props: { defaultSize: [30, 40, 30], step: 10 },
      initial: {
        order: ['root', 'panel[0]', 'resize-trigger[0]', 'panel[1]', 'resize-trigger[1]', 'panel[2]'],
        counts: { 'panel': 3, 'resize-trigger': 2 },
        parts: {
          'resize-trigger': [
            { 'aria-valuenow': '30', 'aria-controls': '@part(panel[0])', 'data-index': '0' },
            { 'aria-valuenow': '40', 'aria-controls': '@part(panel[1])', 'data-index': '1' },
          ],
        },
      },
      steps: [
        { kind: 'focus', part: 'resize-trigger[1]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          // 第 1 条撑大中间那块，右边那块让位；左边那块一动不动（它的分隔条没被碰）
          expect: {
            parts: {
              'resize-trigger': [{ 'aria-valuenow': '30' }, { 'aria-valuenow': '50' }],
            },
          },
        },
      ],
    },
    {
      name: '拖拽：按下不跳、跟着指针走、松手收尾，且松手后再动指针也不跟',
      spec: { apg: APG },
      props: { defaultSize: [50, 50] },
      steps: [
        {
          kind: 'raw',
          why: '拖动是"按下—移动—松手"三件事，harness 的步骤表达不了；容器矩形也要先摆出来',
          run: ({ doc }) => {
            layoutRoot(doc)
            pressTrigger(doc, 100)
            movePointer(doc, 150)
          },
          expect: {
            parts: {
              // 200px 容器里挪了 50px = 25 个百分点
              'resize-trigger': { 'aria-valuenow': '75', 'data-dragging': '' },
              'root': { 'data-dragging': '' },
            },
            // 按下的同时焦点落到分隔条上：松手就能接着用方向键微调
            activeElement: { part: 'resize-trigger', exact: true },
          },
        },
        {
          kind: 'raw',
          why: '松手同样是原始指针事件',
          run: ({ doc }) => releasePointer(doc),
          expect: {
            parts: {
              'resize-trigger': { 'aria-valuenow': '75', 'data-dragging': null },
              'root': { 'data-dragging': null },
            },
          },
        },
        {
          kind: 'raw',
          why: '松手后监听器该撤干净，再动指针布局不能跟',
          run: ({ doc }) => movePointer(doc, 20),
          // 这条期望在本步冲刷之后才比，布局真被拖走了就在这里炸
          expect: { parts: { 'resize-trigger': { 'aria-valuenow': '75' } } },
        },
      ],
    },
  ],
}
