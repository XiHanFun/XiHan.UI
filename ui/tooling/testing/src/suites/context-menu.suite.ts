import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { contextMenuAnatomy, contextMenuKeyboard } from '@xihan-ui/headless'

// 右键菜单没有独立的 APG 模式：浮层展开后的行为逐条对齐 menu，差别只在入口与锚点。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/menu/'

const TRIGGER_SELECTOR = '[data-scope="context-menu"][data-part="trigger"]'

/** 触摸端长按用例的时长：够短不拖慢用例，settle 的轮询间隔（10ms）又追得上。 */
const PRESS_DELAY = 30

/**
 * 三个条目分两组 + 一条分隔线：content 常挂，靠 hidden 显隐。
 * paste 禁用（方向键与连打都跳过它，但它仍可聚焦、仍是导航起点）；
 * delete 落在第二组里——分组是集合查询最容易漏掉的一层，条目与 content 之间隔着 group，
 * 归属判据写歪就会一个条目也查不到。分隔线带 data-scope 却不入集合，End 落到它后面的条目即为证。
 * 条目文本用拉丁字母，连打检索按首字母匹配得上。
 */
function item(value: string, text: string, disabled = false): FixtureNode {
  const attrs: Record<string, string> = { value }
  if (disabled)
    attrs.disabled = ''
  return {
    part: 'item',
    attrs,
    children: [
      { part: 'item-text', tag: 'span', text },
      { part: 'item-indicator', tag: 'span' },
    ],
  }
}

const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    // 触发区是一块普通内容区域，不是按钮：两个适配器都渲染成 div，语义全靠 ARIA 属性
    { part: 'trigger', text: '右键这块区域' },
    {
      part: 'positioner',
      children: [
        {
          part: 'content',
          children: [
            { part: 'arrow' },
            {
              part: 'group',
              attrs: { value: 'edit' },
              children: [
                { part: 'group-label', tag: 'span', text: '编辑' },
                item('copy', 'Copy'),
                item('paste', 'Paste', true),
              ],
            },
            { part: 'separator' },
            {
              part: 'group',
              attrs: { value: 'danger' },
              children: [
                { part: 'group-label', tag: 'span', text: '危险' },
                item('delete', 'Delete'),
              ],
            },
          ],
        },
      ],
    },
  ],
}

function requireTrigger(doc: Document): HTMLElement {
  const el = doc.querySelector<HTMLElement>(TRIGGER_SELECTOR)
  if (!el)
    throw new Error('触发区不存在')
  return el
}

/** 在触发区上按指定视口坐标右键。坐标即锚点，所以每一下都得带上。 */
function rightClickAt(x: number, y: number) {
  return ({ doc }: RawStepContext): void => {
    requireTrigger(doc).dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: x, clientY: y }),
    )
  }
}

function pointerOn(type: string, init: PointerEventInit) {
  return ({ doc }: RawStepContext): void => {
    requireTrigger(doc).dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, ...init }))
  }
}

// content 始终在 DOM，展开态靠 hidden 属性显隐，不卸载作者节点。
// 位置由引擎异步回填，快照不采集 style，因此这里只在收起态断言 data-placement 这类语义属性。
export const contextMenuSuite: ConformanceSuite = {
  component: 'context-menu',
  anatomy: contextMenuAnatomy,
  keyboard: contextMenuKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始收起：触发区带全局 ARIA 与 Tab 位，content 带 hidden，条目全部退出 Tab 序列',
      spec: { apg: `${APG}#roles_states_properties` },
      initial: {
        order: [
          'root',
          'trigger',
          'positioner',
          'content',
          'arrow',
          'group[0]',
          'group-label[0]',
          'item[0]',
          'item-text[0]',
          'item-indicator[0]',
          'item[1]',
          'item-text[1]',
          'item-indicator[1]',
          'separator',
          'group[1]',
          'group-label[1]',
          'item[2]',
          'item-text[2]',
          'item-indicator[2]',
        ],
        counts: {
          'root': 1,
          'trigger': 1,
          'positioner': 1,
          'content': 1,
          'arrow': 1,
          'group': 2,
          'group-label': 2,
          'item': 3,
          'item-text': 3,
          'item-indicator': 3,
          'separator': 1,
        },
        parts: {
          'root': { 'data-state': 'closed' },
          'trigger': {
            // 触发区是普通元素：aria-haspopup / aria-controls / aria-keyshortcuts 都是全局属性，
            // 落在这里合法；aria-expanded 只对特定 role 有定义，不输出
            'aria-haspopup': 'menu',
            'aria-controls': '@part(content)',
            'aria-keyshortcuts': 'Shift+F10',
            'aria-expanded': null,
            'tabindex': '0',
            'data-state': 'closed',
            'data-pressing': null,
          },
          'content': {
            'role': 'menu',
            'tabindex': '-1',
            // 名字自己给：触发区是作者的一整块内容且不带 role，指过去会把整块区域的文字算成菜单名
            'aria-labelledby': null,
            'aria-label': 'Context menu',
            'hidden': '',
            'data-state': 'closed',
          },
          'positioner': {
            'data-state': 'closed',
            'data-placement': 'bottom-start',
          },
          // 收起态没有锚点：条目连同 content 一起 hidden
          'item[0]': {
            'role': 'menuitem',
            'aria-disabled': 'false',
            'disabled': null,
            'data-disabled': null,
            'data-highlighted': null,
            'data-value': 'copy',
            'tabindex': '-1',
          },
          'item[1]': {
            'aria-disabled': 'true',
            'disabled': null,
            'data-disabled': '',
            'data-value': 'paste',
          },
          'item[2]': { 'data-value': 'delete', 'tabindex': '-1' },
          'item-text[1]': { 'data-disabled': '' },
          'item-indicator[0]': { 'aria-hidden': 'true' },
          'separator': { 'role': 'separator', 'aria-orientation': 'horizontal' },
          'group[0]': { 'role': 'group', 'aria-labelledby': '@part(group-label[0])' },
          'group[1]': { 'role': 'group', 'aria-labelledby': '@part(group-label[1])' },
        },
      },
    },
    {
      name: '右键展开：content 去掉 hidden，不预落锚点，派发 open-change',
      spec: { apg: `${APG}#roles_states_properties` },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'raw',
          why: '右键是本组件唯一的指针入口，声明式步骤里没有 contextmenu；坐标即锚点，必须由事件带进来',
          run: rightClickAt(120, 80),
          expect: {
            parts: {
              'root': { 'data-state': 'open' },
              'trigger': { 'data-state': 'open' },
              'content': {
                'role': 'menu',
                'hidden': null,
                'data-state': 'open',
                // 没有条目认领 Tab 位时由容器兜底
                'tabindex': '0',
              },
              // 指针打开不预落锚点：菜单弹出那一刻一个条目都不高亮
              'item[0]': { 'tabindex': '-1', 'data-highlighted': null },
              'item[1]': { tabindex: '-1' },
              'item[2]': { tabindex: '-1' },
              'item-text[0]': { 'data-highlighted': null },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'content' },
          expect: { activeElement: 'content', events: [] },
        },
        // 第一按方向键才锚定首个条目，roving tabindex 随之移交
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: {
              'content': { tabindex: '-1' },
              'item[0]': { 'tabindex': '0', 'data-highlighted': '' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '已经展开时在别处再右键：只挪坐标，不先关再开（一个事件都不该发）',
      spec: { apg: APG },
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'raw', why: '同上：contextmenu 只能手写', run: rightClickAt(10, 10) },
        { kind: 'settle', until: { activeElement: 'content' } },
        {
          kind: 'raw',
          why: '第二次右键落在另一处坐标，验的正是"不关不开"——关一次再开一次会在事件流里留下两条记录',
          run: rightClickAt(300, 200),
          expect: {
            parts: {
              trigger: { 'data-state': 'open' },
              content: { 'hidden': null, 'data-state': 'open' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '展开时左键按下即关闭：触发区被登记为本层分支，这条由连接层自己收口',
      spec: { apg: APG },
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'raw', why: '同上：contextmenu 只能手写', run: rightClickAt(10, 10) },
        { kind: 'settle', until: { activeElement: 'content' } },
        {
          kind: 'raw',
          why: '左键按下要带 button=0 与 pointerType=mouse，声明式的 click 步骤给不出这些',
          run: pointerOn('pointerdown', { button: 0, pointerType: 'mouse' }),
          expect: {
            parts: {
              trigger: { 'data-state': 'closed' },
              content: { 'hidden': '', 'data-state': 'closed' },
            },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '触摸端长按展开：按住够久才开，锚点取按下那一刻的坐标',
      spec: { apg: APG },
      props: { longPressDelay: PRESS_DELAY },
      // 计时驱动的用例帧序对不齐：同一次长按在两侧跑的拍数取决于机器调度
      skipParity: '长按由定时器驱动，两侧跑到同一状态所用的帧数不固定',
      steps: [
        {
          kind: 'raw',
          why: '长按只能由 pointerdown 起头，且必须带 pointerType=touch（鼠标按住不动不算长按）',
          run: pointerOn('pointerdown', { pointerType: 'touch', clientX: 30, clientY: 40 }),
          expect: {
            parts: {
              trigger: { 'data-state': 'closed', 'data-pressing': '' },
              content: { hidden: '' },
            },
            events: [],
          },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: null } },
          expect: {
            parts: {
              trigger: { 'data-state': 'open', 'data-pressing': null },
              content: { 'hidden': null, 'data-state': 'open' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: '长按途中抬手：不展开，一个事件也不发',
      spec: { apg: APG },
      props: { longPressDelay: PRESS_DELAY },
      skipParity: '长按由定时器驱动，两侧跑到同一状态所用的帧数不固定',
      steps: [
        { kind: 'raw', why: '同上：长按只能由 pointerdown 起头', run: pointerOn('pointerdown', { pointerType: 'touch', clientX: 30, clientY: 40 }) },
        {
          kind: 'raw',
          why: '抬手要在计时到点前发生，声明式步骤没有 pointerup',
          run: pointerOn('pointerup', { pointerType: 'touch' }),
          expect: {
            parts: { trigger: { 'data-state': 'closed', 'data-pressing': null } },
            events: [],
          },
        },
        {
          kind: 'raw',
          why: '等过整个长按时长，证明计时确实被撤掉了而不是还在后台跑',
          run: () => new Promise<void>(resolve => setTimeout(resolve, PRESS_DELAY * 3)),
          expect: {
            parts: { content: { hidden: '' } },
            events: [],
          },
        },
      ],
    },
    {
      name: '菜单键展开并把焦点落到首个条目',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['context-menu.kbd.open'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'ContextMenu',
          expect: {
            parts: {
              'trigger': { 'data-state': 'open' },
              'content': { hidden: null },
              'item[0]': { tabindex: '0' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'item[0]' },
          expect: { activeElement: { part: 'item[0]', exact: true } },
        },
      ],
    },
    {
      name: 'shift+F10 与菜单键等价；裸 F10 不归菜单管',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['context-menu.kbd.open'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'F10',
          expect: {
            parts: { content: { hidden: '' } },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'F10',
          modifiers: ['Shift'],
          expect: {
            parts: { content: { hidden: null } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: '菜单内方向键跳过禁用条目并在尽头回绕；禁用条目用 aria-disabled 而非原生 disabled',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['context-menu.kbd.next', 'context-menu.kbd.prev'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ContextMenu' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: {
              'item[1]': { 'aria-disabled': 'true', 'disabled': null, 'data-disabled': '', 'tabindex': '-1' },
              'item[2]': { tabindex: '0' },
            },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: { 'item[0]': { tabindex: '0' }, 'item[2]': { tabindex: '-1' } },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: { 'item[2]': { tabindex: '0' } },
            events: [],
          },
        },
      ],
    },
    {
      name: 'home/End 跳到首尾条目：End 越过分隔线与分组落在其后的条目',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['context-menu.kbd.first', 'context-menu.kbd.last'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ContextMenu' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'End',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: { 'item[2]': { tabindex: '0' } },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: { 'item[0]': { tabindex: '0' } },
            events: [],
          },
        },
      ],
    },
    {
      name: '连打检索把焦点移到首字母匹配的条目，不选中它',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['context-menu.kbd.typeahead'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ContextMenu' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'type',
          text: 'd',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: {
              content: { hidden: null },
            },
            // 只搬焦点：不发选中详情，菜单也不关
            events: [],
          },
        },
      ],
    },
    {
      name: '点击条目：派发 select 后关闭，锚点清空，焦点归还触发区',
      spec: { apg: APG },
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'raw', why: '同上：contextmenu 只能手写', run: rightClickAt(10, 10) },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              'trigger': { 'data-state': 'closed' },
              'content': { 'hidden': '', 'data-state': 'closed' },
              'item[2]': { tabindex: '-1' },
            },
            // 先选中详情、后开合意图
            events: [
              { type: 'select', detail: { value: 'delete' } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'trigger' },
          expect: { activeElement: 'trigger' },
        },
      ],
    },
    {
      name: 'enter 选中焦点所在条目：与点击同一条出口',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['context-menu.kbd.select'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ContextMenu' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              trigger: { 'data-state': 'closed' },
              content: { 'hidden': '', 'data-state': 'closed' },
            },
            events: [
              { type: 'select', detail: { value: 'copy' } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
      ],
    },
    {
      name: '点击禁用条目：不选中、不关闭、一个事件也不发',
      spec: { apg: APG },
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'raw', why: '同上：contextmenu 只能手写', run: rightClickAt(10, 10) },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        {
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: {
              trigger: { 'data-state': 'open' },
              content: { 'hidden': null, 'data-state': 'open' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: 'escape 关闭：content 复位 hidden 且焦点归还触发区',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['context-menu.kbd.escape'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ContextMenu' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'Escape',
          expect: { events: [{ type: 'open-change', detail: { open: false } }] },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: {
            parts: {
              trigger: { 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'trigger' },
          expect: { activeElement: 'trigger' },
        },
      ],
    },
    {
      name: 'escape 关闭：右键那一下没把焦点交给触发区，焦点仍归还它',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        {
          kind: 'raw',
          why: '不先 focus 触发区：右键是否落焦各平台不一致，焦点域记下的创建前快照此刻停在 body 上',
          run: rightClickAt(10, 10),
        },
        { kind: 'settle', until: { activeElement: 'content' } },
        {
          kind: 'key',
          key: 'Escape',
          expect: { events: [{ type: 'open-change', detail: { open: false } }] },
        },
        {
          kind: 'settle',
          until: { activeElement: 'trigger' },
          expect: { activeElement: 'trigger' },
        },
      ],
    },
    {
      name: 'tab 关闭：焦点不被抢回触发区，按 Tab 序列自然离开',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['context-menu.kbd.tab'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ContextMenu' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'Tab',
          expect: {
            parts: {
              trigger: { 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
        {
          kind: 'raw',
          why: '焦点归还排在焦点域拆除后的下一帧；等过这两帧才证得了 Tab 关闭没把焦点抢回触发区',
          run: () => new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          }),
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
      ],
    },
    {
      name: '受控 open：右键只发 open-change 不自改 DOM，父写回 open 后才展开',
      spec: { adr: 'controlled-uncontrolled' },
      props: { open: false },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'raw',
          why: '同上：contextmenu 只能手写',
          run: rightClickAt(120, 80),
          expect: {
            parts: {
              trigger: { 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'setProps', props: { open: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: null } },
          expect: {
            parts: {
              'trigger': { 'data-state': 'open' },
              'content': { 'data-state': 'open', 'hidden': null, 'tabindex': '0' },
              // 受控回写走影子事件，落焦端仍取自当初那次右键：指针入口不预落锚点
              'item[0]': { 'tabindex': '-1', 'data-highlighted': null },
            },
          },
        },
      ],
    },
  ],
}
