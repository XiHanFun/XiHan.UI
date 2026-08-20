import type { ConformanceSuite } from '../conformance/types'
import { floatingPanelAnatomy, floatingPanelKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'
const APG_SPLITTER = 'https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/#keyboardinteraction'

/** 落位与尺寸只落在内联样式上，归一化快照不采集 style，只能直接读节点。 */
function rectOf(doc: Document): { left: string, top: string, width: string, height: string } {
  const el = doc.querySelector<HTMLElement>('[data-scope="floating-panel"][data-part="positioner"]')
  if (!el)
    throw new Error('positioner 不在文档里')
  return { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height }
}

function expectRect(doc: Document, want: Partial<Record<'left' | 'top' | 'width' | 'height', string>>): void {
  const rect = rectOf(doc)
  for (const [key, value] of Object.entries(want)) {
    const actual = rect[key as keyof typeof rect]
    if (actual !== value)
      throw new Error(`positioner 的 ${key} 是 ${actual}，期望 ${value}`)
  }
}

export const floatingPanelSuite: ConformanceSuite = {
  component: 'floating-panel',
  anatomy: floatingPanelAnatomy,
  keyboard: floatingPanelKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'trigger', tag: 'button', text: '打开面板' },
      {
        part: 'positioner',
        children: [
          {
            part: 'content',
            children: [
              {
                part: 'header',
                children: [
                  { part: 'title', tag: 'h2', text: '调试面板' },
                  { part: 'drag-trigger', tag: 'button' },
                  { part: 'stage-trigger', tag: 'button', attrs: { stage: 'minimized' } },
                  { part: 'stage-trigger', tag: 'button', attrs: { stage: 'maximized' } },
                  { part: 'close-trigger', tag: 'button', text: '✕' },
                ],
              },
              { part: 'body', text: '面板正文' },
              // 把手是 role=separator 的元素，不是按钮
              { part: 'resize-trigger', attrs: { edge: 'n' } },
              { part: 'resize-trigger', attrs: { edge: 'e' } },
              { part: 'resize-trigger', attrs: { edge: 'se' } },
            ],
          },
        ],
      },
    ],
  },
  cases: [
    {
      name: '默认收起：positioner 带 hidden，触发器报未展开，面板是非模态 dialog',
      spec: { apg: APG },
      initial: {
        order: [
          'root',
          'trigger',
          'positioner',
          'content',
          'header',
          'title',
          'drag-trigger',
          'stage-trigger[0]',
          'stage-trigger[1]',
          'close-trigger',
          'body',
          'resize-trigger[0]',
          'resize-trigger[1]',
          'resize-trigger[2]',
        ],
        counts: { 'root': 1, 'positioner': 1, 'content': 1, 'stage-trigger': 2, 'resize-trigger': 3 },
        parts: {
          'root': { 'data-state': 'closed', 'data-stage': 'default', 'data-disabled': null },
          'trigger': {
            'type': 'button',
            'aria-haspopup': 'dialog',
            'aria-expanded': 'false',
            'aria-controls': '@part(content)',
            'data-state': 'closed',
          },
          'positioner': { 'hidden': '', 'data-state': 'closed' },
          'content': {
            'role': 'dialog',
            'aria-modal': 'false',
            'aria-labelledby': '@part(title)',
            'tabindex': '-1',
            'data-state': 'closed',
          },
          // 常规形态下正文不收起
          'body': { hidden: null },
          // 拖拽把手是原生按钮，推不动时只报 aria-disabled，绝不上原生 disabled
          'drag-trigger': { 'type': 'button', 'aria-disabled': 'false', 'disabled': null },
          // 改尺把手是能被方向键推的分隔条：报它推的那根轴的像素值，且恒留在 Tab 序列里
          'resize-trigger': [
            {
              'role': 'separator',
              'aria-orientation': 'horizontal',
              'aria-valuenow': '240',
              'aria-valuemin': '120',
              'aria-valuemax': null,
              'aria-valuetext': 'Width 360, height 240',
              'aria-controls': '@part(content)',
              'aria-disabled': 'false',
              'tabindex': '0',
              'data-edge': 'n',
              'disabled': null,
            },
            { 'role': 'separator', 'aria-orientation': 'vertical', 'aria-valuenow': '360', 'aria-valuemin': '160', 'data-edge': 'e' },
            { 'aria-orientation': 'vertical', 'aria-valuenow': '360', 'data-edge': 'se' },
          ],
          'stage-trigger': [
            { 'type': 'button', 'aria-pressed': 'false', 'data-target-stage': 'minimized', 'data-state': 'off' },
            { 'aria-pressed': 'false', 'data-target-stage': 'maximized' },
          ],
        },
        activeElement: null,
      },
    },
    {
      name: '点触发器展开：hidden 撤掉、aria-expanded 跟上，并报出一次意图',
      spec: { apg: APG },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              positioner: { 'hidden': null, 'data-state': 'open' },
              trigger: { 'aria-expanded': 'true' },
              content: { 'data-state': 'open' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: 'Esc 在面板内关闭；面板不是模态的，页面别处的 Esc 不归它管',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['floating-panel.kbd.escape'],
      props: { defaultOpen: true },
      steps: [
        // 焦点在页面别处时这一键不该关它
        { kind: 'outside', action: 'key', key: 'Escape', expect: { parts: { positioner: { hidden: null } }, events: [] } },
        { kind: 'focus', part: 'content' },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { positioner: { hidden: '' }, content: { 'data-state': 'closed' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '形态：按收拢钮收起正文，再按一次回到常规',
      spec: { apg: APG },
      props: { defaultOpen: true },
      steps: [
        {
          kind: 'click',
          part: 'stage-trigger[0]',
          expect: {
            parts: {
              'content': { 'data-stage': 'minimized' },
              // 正文连同其中的可聚焦元素一起退出：只压高度的话读屏与 Tab 照样进得去
              'body': { hidden: '' },
              'stage-trigger': [{ 'aria-pressed': 'true', 'data-state': 'on' }, { 'aria-pressed': 'false' }],
            },
          },
        },
        {
          kind: 'click',
          part: 'stage-trigger[0]',
          expect: {
            parts: {
              'content': { 'data-stage': 'default' },
              'body': { hidden: null },
              'stage-trigger': [{ 'aria-pressed': 'false', 'data-state': 'off' }],
            },
          },
        },
      ],
    },
    {
      name: '铺满：把手改报推不动，矩形贴满视口',
      spec: { apg: APG },
      props: { defaultOpen: true, defaultStage: 'maximized' },
      steps: [
        {
          kind: 'raw',
          why: '落位只落在内联样式上，归一化快照不采集 style',
          run: ({ doc }) => expectRect(doc, { left: '0px', top: '0px', width: '100%', height: '100%' }),
        },
      ],
      expect: {
        parts: {
          'content': { 'data-stage': 'maximized' },
          'drag-trigger': { 'aria-disabled': 'true', 'data-disabled': '' },
          'resize-trigger': [{ 'aria-disabled': 'true' }],
        },
      },
    },
    {
      name: '整组禁用：三类按钮一律报禁用，且点了也不改形态',
      spec: { apg: APG },
      props: { defaultOpen: true, disabled: true },
      steps: [
        {
          kind: 'click',
          part: 'stage-trigger[1]',
          expect: {
            parts: {
              'content': { 'data-stage': 'default', 'data-disabled': '' },
              'drag-trigger': { 'aria-disabled': 'true' },
              'stage-trigger': [{ 'aria-disabled': 'true' }, { 'aria-pressed': 'false' }],
            },
            // 不写这一条就只验了"形态没变"，没验"没往外报"
            events: [],
          },
        },
      ],
    },
    {
      name: '拖拽把手：方向键平移 10px，Shift 一下走 50px',
      spec: { apg: APG_SPLITTER },
      covers: ['floating-panel.kbd.move', 'floating-panel.kbd.move-large'],
      props: { defaultOpen: true, defaultPosition: { x: 100, y: 100 } },
      steps: [
        { kind: 'focus', part: 'drag-trigger' },
        { kind: 'key', key: 'ArrowRight' },
        {
          kind: 'raw',
          why: '落位只落在内联样式上，归一化快照不采集 style',
          run: ({ doc }) => expectRect(doc, { left: '110px', top: '100px' }),
        },
        { kind: 'key', key: 'ArrowDown', modifiers: ['Shift'] },
        {
          kind: 'raw',
          why: '同上',
          run: ({ doc }) => expectRect(doc, { left: '110px', top: '150px' }),
        },
      ],
    },
    {
      name: '拖拽把手：Enter 把面板送回初始落点，被拖出视口后靠这一键收回来',
      spec: { apg: APG_SPLITTER },
      covers: ['floating-panel.kbd.recenter'],
      props: { defaultOpen: true, defaultPosition: { x: 120, y: 90 } },
      steps: [
        { kind: 'focus', part: 'drag-trigger' },
        { kind: 'key', key: 'ArrowRight', modifiers: ['Shift'] },
        {
          kind: 'raw',
          why: '落位只落在内联样式上，归一化快照不采集 style',
          run: ({ doc }) => expectRect(doc, { left: '170px', top: '90px' }),
        },
        { kind: 'key', key: 'Enter' },
        {
          kind: 'raw',
          why: '同上',
          run: ({ doc }) => expectRect(doc, { left: '120px', top: '90px' }),
        },
        // Space 与 Enter 同义
        { kind: 'key', key: 'ArrowLeft' },
        { kind: 'key', key: 'Space' },
        {
          kind: 'raw',
          why: '同上',
          run: ({ doc }) => expectRect(doc, { left: '120px', top: '90px' }),
        },
      ],
    },
    {
      name: '改尺把手：东边把手只改宽度，北边把手同时改起点',
      spec: { apg: APG_SPLITTER },
      covers: ['floating-panel.kbd.resize', 'floating-panel.kbd.resize-large'],
      props: {
        defaultOpen: true,
        defaultPosition: { x: 100, y: 100 },
        defaultSize: { width: 300, height: 200 },
      },
      steps: [
        { kind: 'focus', part: 'resize-trigger[1]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          // 分隔条报的值跟着尺寸走，读屏才知道推到哪儿了
          expect: {
            parts: {
              'resize-trigger': [
                {},
                { 'aria-valuenow': '310', 'aria-valuetext': 'Width 310, height 200' },
              ],
            },
          },
        },
        {
          kind: 'raw',
          why: '尺寸只落在内联样式上，归一化快照不采集 style',
          run: ({ doc }) => expectRect(doc, { left: '100px', width: '310px', height: '200px' }),
        },
        { kind: 'focus', part: 'resize-trigger[0]' },
        { kind: 'key', key: 'ArrowDown', modifiers: ['Shift'] },
        {
          kind: 'raw',
          why: '北边的把手推的是矩形的起点，位置与尺寸要一起动',
          run: ({ doc }) => expectRect(doc, { top: '150px', height: '150px' }),
        },
      ],
    },
    {
      name: '受控 open：点击只发意图不自改 DOM，父写回后才展开',
      spec: { adr: 'controlled-uncontrolled' },
      props: { open: false },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: { positioner: { hidden: '' }, trigger: { 'aria-expanded': 'false' } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'setProps', props: { open: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'positioner', name: 'hidden', value: null } },
          expect: {
            parts: { positioner: { hidden: null }, trigger: { 'aria-expanded': 'true' } },
          },
        },
      ],
    },
  ],
}
