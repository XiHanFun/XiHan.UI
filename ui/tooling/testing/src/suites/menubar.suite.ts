import type { ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { menubarAnatomy, menubarKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/'

const TRIGGER = '[data-scope="menubar"][data-part="trigger"]'

interface MenuDecl {
  value: string
  text: string
  items: ReadonlyArray<{ value: string, text: string }>
}

/**
 * 三张菜单，条目文本刻意排成能验连打检索的样子（New / Open / Save）。
 * 首张菜单多带一层结构：前两条住在 group 里、末一条直接挂在 content 下，中间夹一条分隔线——
 * 分隔线同样带 data-scope 却不入集合，方向键越过它落到后面那条即为证。
 */
const MENUS: readonly MenuDecl[] = [
  { value: 'file', text: '文件', items: [{ value: 'new', text: 'New' }, { value: 'open', text: 'Open' }, { value: 'save', text: 'Save' }] },
  { value: 'edit', text: '编辑', items: [{ value: 'cut', text: 'Cut' }, { value: 'copy', text: 'Copy' }, { value: 'paste', text: 'Paste' }] },
  { value: 'view', text: '视图', items: [{ value: 'zoom', text: 'Zoom' }, { value: 'full', text: 'Fullscreen' }, { value: 'zen', text: 'Zen' }] },
]

interface TreeOptions {
  /** 被禁用的 trigger（对应 MENUS 里的 value）。 */
  disabledMenu?: string
  /** 被禁用的条目。 */
  disabledItem?: string
}

/**
 * 禁用一律用 `disabled` 属性声明（Vue 侧它是组件 prop、不落 DOM）；
 * WC 侧接线时须经 authorDisabled 改写成 aria-disabled——集合条目绝不输出原生 disabled，
 * 原生禁用的按钮不可聚焦，"禁用项仍是方向键起点"这条规格在 WC 上会直接不成立。
 */
function menubarTree(options: TreeOptions = {}): FixtureNode {
  const { disabledMenu, disabledItem } = options

  const item = (decl: { value: string, text: string }, withIndicator = false): FixtureNode => {
    const attrs: Record<string, string> = { value: decl.value }
    if (decl.value === disabledItem)
      attrs.disabled = ''
    // 标签必须写死：Vue 侧渲染成 span，WC 侧由 fixture 的 tag 决定，不写就默认 div
    const children: FixtureNode[] = [{ part: 'item-text', tag: 'span', text: decl.text }]
    if (withIndicator)
      children.push({ part: 'item-indicator', tag: 'span', text: '✓' })
    return { part: 'item', attrs, children }
  }

  const menuNodes = MENUS.flatMap((menu, index): FixtureNode[] => {
    const triggerAttrs: Record<string, string> = { value: menu.value }
    if (menu.value === disabledMenu)
      triggerAttrs.disabled = ''
    // 首张菜单带分组与分隔线，其余两张是扁平三条
    const body: FixtureNode[] = index === 0
      ? [
          {
            part: 'group',
            attrs: { value: `${menu.value}-basic` },
            children: [
              { part: 'group-label', tag: 'span', text: '基础' },
              item(menu.items[0]!),
              item(menu.items[1]!),
            ],
          },
          { part: 'separator' },
          item(menu.items[2]!, true),
        ]
      : menu.items.map(i => item(i))
    return [
      // 必须是 button：WC 侧由 fixture 的 tag 决定，div 不可聚焦
      { part: 'trigger', tag: 'button', text: menu.text, attrs: triggerAttrs },
      {
        part: 'positioner',
        attrs: { value: menu.value },
        children: [{ part: 'content', attrs: { value: menu.value }, children: body }],
      },
    ]
  })

  return { part: 'root', children: menuNodes }
}

/** 指针掠过某个 trigger。Step 里没有"悬停"这一档，只能自己派事件。 */
function hover(index: number): StepWithExpect {
  return {
    kind: 'raw',
    why: 'Step 没有悬停这一档；"打开态传染"是本组件的核心行为，绕不过去',
    run: async ({ doc, flush }) => {
      const el = doc.querySelectorAll<HTMLElement>(TRIGGER)[index]
      if (!el)
        throw new Error(`找不到第 ${index} 个 trigger`)
      // 派裸事件而不是 PointerEvent：无头 DOM 里指针事件没有默认构造语义，连接层只看事件类型
      el.dispatchEvent(new Event('pointerenter'))
      await flush()
    },
  }
}

export const menubarSuite: ConformanceSuite = {
  component: 'menubar',
  anatomy: menubarAnatomy,
  keyboard: menubarKeyboard,
  fixture: menubarTree(),
  cases: [
    {
      name: '初始全部收起：root 是 menubar，菜单常挂带 hidden，整条只有 root 一个 Tab 位',
      spec: { apg: APG },
      initial: {
        order: [
          'root',
          'trigger[0]',
          'positioner[0]',
          'content[0]',
          'group',
          'group-label',
          'item[0]',
          'item-text[0]',
          'item[1]',
          'item-text[1]',
          'separator',
          'item[2]',
          'item-text[2]',
          'item-indicator',
          'trigger[1]',
          'positioner[1]',
          'content[1]',
          'item[3]',
          'item-text[3]',
          'item[4]',
          'item-text[4]',
          'item[5]',
          'item-text[5]',
          'trigger[2]',
          'positioner[2]',
          'content[2]',
          'item[6]',
          'item-text[6]',
          'item[7]',
          'item-text[7]',
          'item[8]',
          'item-text[8]',
        ],
        counts: {
          'root': 1,
          'trigger': 3,
          'positioner': 3,
          'content': 3,
          'item': 9,
          'item-text': 9,
          'item-indicator': 1,
          'group': 1,
          'group-label': 1,
          'separator': 1,
        },
        parts: {
          // 写死 ltr 会切断从 RTL 祖先继承来的方向，作者没给就不该出现 dir
          'root': {
            'role': 'menubar',
            'aria-orientation': 'horizontal',
            'aria-disabled': 'false',
            'data-orientation': 'horizontal',
            'data-state': 'closed',
            'data-disabled': null,
            'dir': null,
            // 焦点在菜单栏外：容器兜底进 Tab 序列，全部 trigger 让位
            'tabindex': '0',
          },
          'trigger[0]': {
            'type': 'button',
            'role': 'menuitem',
            'aria-haspopup': 'menu',
            'aria-expanded': 'false',
            'aria-disabled': 'false',
            'aria-controls': '@part(content[0])',
            'data-state': 'closed',
            'data-value': 'file',
            'data-disabled': null,
            'disabled': null,
            'tabindex': '-1',
          },
          'trigger[1]': { 'tabindex': '-1', 'data-value': 'edit' },
          'trigger[2]': { 'tabindex': '-1', 'data-value': 'view' },
          'content[0]': {
            'role': 'menu',
            'aria-labelledby': '@part(trigger[0])',
            'hidden': '',
            'data-state': 'closed',
            'tabindex': '-1',
            'data-value': 'file',
          },
          'content[2]': { hidden: '' },
          'positioner[0]': { 'data-state': 'closed', 'data-placement': null },
          'item[0]': {
            'role': 'menuitem',
            'aria-disabled': 'false',
            'disabled': null,
            'data-disabled': null,
            'data-value': 'new',
            'data-highlighted': null,
            'tabindex': '-1',
          },
          'separator': { 'role': 'separator', 'aria-orientation': 'horizontal' },
          'item-indicator': { 'aria-hidden': 'true' },
        },
      },
    },
    {
      name: 'trigger / content 按 value 逐对互指，分组标题被同组 group 指着',
      spec: { apg: `${APG}#wai-aria-roles-states-and-properties` },
      initial: {
        parts: {
          'trigger[0]': { 'id': '@self', 'aria-controls': '@part(content[0])' },
          'trigger[1]': { 'id': '@self', 'aria-controls': '@part(content[1])' },
          'trigger[2]': { 'id': '@self', 'aria-controls': '@part(content[2])' },
          'content[0]': { 'id': '@self', 'aria-labelledby': '@part(trigger[0])' },
          'content[2]': { 'id': '@self', 'aria-labelledby': '@part(trigger[2])' },
          'group': { 'role': 'group', 'aria-labelledby': '@part(group-label)' },
          'group-label': { id: '@self' },
        },
      },
    },
    {
      name: 'defaultValue：只有那一项展开，其余仍 hidden',
      spec: { apg: APG },
      props: { defaultValue: 'edit' },
      initial: {
        parts: {
          'root': { 'data-state': 'open' },
          'trigger[0]': { 'aria-expanded': 'false', 'data-state': 'closed' },
          'trigger[1]': { 'aria-expanded': 'true', 'data-state': 'open' },
          'content[0]': { hidden: '' },
          'content[1]': { 'hidden': null, 'data-state': 'open' },
          'content[2]': { hidden: '' },
        },
      },
    },
    {
      name: '点 trigger 展开、再点收起；点别项直接换过去',
      spec: { apg: APG },
      steps: [
        {
          kind: 'click',
          part: 'trigger[0]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'true', 'data-state': 'open' },
              // 没有条目锚点时由 content 兜底进 Tab 序列，键盘才进得去
              'content[0]': { hidden: null, tabindex: '0' },
              // 点开的那一刻焦点留在 trigger 上，一个条目都不预先高亮
              'item[0]': { 'tabindex': '-1', 'data-highlighted': null },
            },
            events: [{ type: 'value-change', detail: { value: 'file' } }],
          },
        },
        {
          kind: 'click',
          part: 'trigger[0]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'false' },
              'content[0]': { hidden: '' },
            },
            events: [{ type: 'value-change', detail: { value: null } }],
          },
        },
        {
          kind: 'click',
          part: 'trigger[1]',
          expect: {
            parts: {
              'trigger[1]': { 'aria-expanded': 'true' },
              'content[1]': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: 'edit' } }],
          },
        },
        {
          kind: 'click',
          part: 'trigger[2]',
          expect: {
            parts: {
              'trigger[1]': { 'aria-expanded': 'false' },
              'trigger[2]': { 'aria-expanded': 'true' },
              'content[1]': { hidden: '' },
              'content[2]': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: 'view' } }],
          },
        },
      ],
    },
    {
      name: '一个都没展开时掠过 trigger：什么也不发生',
      spec: { apg: APG },
      steps: [
        {
          ...hover(1),
          expect: {
            parts: {
              'trigger[1]': { 'aria-expanded': 'false' },
              'content[1]': { hidden: '' },
              'root': { 'data-state': 'closed' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '打开态传染：已经展开着，掠过别的 trigger 就当场换过去（不用点、也不等延时）',
      spec: { apg: APG },
      steps: [
        { kind: 'click', part: 'trigger[0]' },
        {
          ...hover(2),
          expect: {
            parts: {
              // 焦点跟着搬到被掠过的那一项：不搬的话焦点会随旧菜单一起被 hidden 收走
              'trigger[0]': { 'aria-expanded': 'false', 'tabindex': '-1' },
              'trigger[2]': { 'aria-expanded': 'true', 'tabindex': '0' },
              'content[0]': { hidden: '' },
              'content[2]': { hidden: null },
            },
            activeElement: { part: 'trigger[2]', exact: true },
            events: [{ type: 'value-change', detail: { value: 'view' } }],
          },
        },
      ],
    },
    {
      name: '掠过禁用的 trigger：不换菜单',
      spec: { apg: APG },
      fixture: () => menubarTree({ disabledMenu: 'edit' }),
      steps: [
        { kind: 'click', part: 'trigger[0]' },
        {
          ...hover(1),
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'true' },
              'trigger[1]': { 'aria-expanded': 'false', 'aria-disabled': 'true', 'disabled': null, 'data-disabled': '' },
              'content[1]': { hidden: '' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: 'root 拿到焦点即转投给首个可用 trigger，自己随后让位——整条只有一个 Tab 位',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        {
          kind: 'focus',
          part: 'root',
          expect: {
            activeElement: { part: 'trigger[0]', exact: true },
            parts: {
              'root': { tabindex: '-1' },
              'trigger[0]': { tabindex: '0' },
              'trigger[1]': { tabindex: '-1' },
              'trigger[2]': { tabindex: '-1' },
            },
          },
        },
      ],
    },
    {
      name: 'ArrowRight / ArrowLeft 在 trigger 之间走，尽头回绕；Tab 位跟着搬',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.next', 'menubar.kbd.prev'],
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            parts: { 'trigger[0]': { tabindex: '-1' }, 'trigger[1]': { tabindex: '0' } },
            events: [],
          },
        },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'trigger[0]', exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'trigger[2]', exact: true } } },
      ],
    },
    {
      name: 'Home / End 跳到首尾 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.first', 'menubar.kbd.last'],
      steps: [
        { kind: 'focus', part: 'trigger[1]' },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'trigger[2]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'trigger[0]', exact: true } } },
      ],
    },
    {
      name: '方向键跳过禁用的 trigger（它仍可聚焦、仍是起点）',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.next'],
      fixture: () => menubarTree({ disabledMenu: 'edit' }),
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'trigger[2]', exact: true } } },
        // 焦点强行落在禁用项上时，方向键仍从它起步
        { kind: 'focus', part: 'trigger[1]', expect: { activeElement: { part: 'trigger[1]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'trigger[2]', exact: true } } },
      ],
    },
    {
      name: 'dir=rtl：水平轴镜像，ArrowRight 走上一个',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.prev'],
      props: { dir: 'rtl' },
      steps: [
        { kind: 'focus', part: 'trigger[1]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'trigger[0]', exact: true },
            parts: { root: { dir: 'rtl' } },
          },
        },
      ],
    },
    {
      name: 'orientation=vertical：上下键在 trigger 之间走，ArrowRight 才是"进这张菜单"',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { orientation: 'vertical' },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            parts: {
              root: { 'aria-orientation': 'vertical', 'data-orientation': 'vertical' },
            },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: {
              'trigger[1]': { 'aria-expanded': 'true' },
              'content[1]': { hidden: null },
              'item[3]': { tabindex: '0' },
            },
            events: [{ type: 'value-change', detail: { value: 'edit' } }],
          },
        },
      ],
    },
    {
      name: 'ArrowDown 从 trigger 展开并把焦点落到首个条目',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.open-first'],
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'true', 'data-state': 'open' },
              'content[0]': { hidden: null },
              'item[0]': { 'tabindex': '0', 'data-highlighted': '' },
              'item[1]': { tabindex: '-1' },
            },
            events: [{ type: 'value-change', detail: { value: 'file' } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'item[0]' },
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
      ],
    },
    {
      name: 'ArrowUp 从 trigger 展开并把焦点落到末个条目',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.open-last'],
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: { 'item[0]': { tabindex: '-1' }, 'item[2]': { tabindex: '0' } },
            events: [{ type: 'value-change', detail: { value: 'file' } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'item[2]' },
          expect: { activeElement: { part: 'item[2]', exact: true } },
        },
      ],
    },
    {
      name: 'Enter 展开但焦点留在 trigger：菜单栏不该在点开那一刻就把人拽进浮层',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.open-first'],
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            // 吞掉默认激活，不会被随后合成的 click 反手关掉
            activeElement: { part: 'trigger[0]', exact: true },
            parts: {
              'trigger[0]': { 'aria-expanded': 'true' },
              'content[0]': { hidden: null },
              'item[0]': { tabindex: '-1' },
            },
            events: [{ type: 'value-change', detail: { value: 'file' } }],
          },
        },
      ],
    },
    {
      name: '菜单内上下键在条目之间走：越过分隔线、尽头回绕',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.item-next', 'menubar.kbd.item-prev'],
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { activeElement: { part: 'item[1]', exact: true }, events: [] },
        },
        {
          // 分隔线带 data-scope 却不入集合：下一站是它后面那条
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: { 'item[2]': { 'tabindex': '0', 'data-highlighted': '' }, 'item-indicator': { 'data-highlighted': '' } },
          },
        },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[0]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'item[2]', exact: true } } },
      ],
    },
    {
      name: '菜单内 Home / End 跳到本张菜单的首尾条目（不会跨到隔壁菜单）',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.item-first', 'menubar.kbd.item-last'],
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'item[2]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'item[0]', exact: true } } },
      ],
    },
    {
      name: '菜单内方向键跳过禁用条目；禁用条目用 aria-disabled 而非原生 disabled',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.item-next'],
      fixture: () => menubarTree({ disabledItem: 'open' }),
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: {
              'item[1]': { 'aria-disabled': 'true', 'disabled': null, 'data-disabled': '', 'tabindex': '-1' },
            },
          },
        },
      ],
    },
    {
      name: '连打检索按首字母搬焦点',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.typeahead'],
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 's',
          expect: { activeElement: { part: 'item[2]', exact: true }, events: [] },
        },
      ],
    },
    {
      name: '菜单内左右键切到相邻菜单并保持展开，焦点落到那一项的 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.across'],
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            parts: {
              'trigger[0]': { 'aria-expanded': 'false' },
              'trigger[1]': { 'aria-expanded': 'true' },
              'content[0]': { hidden: '' },
              'content[1]': { hidden: null },
              // 换菜单后旧菜单的条目锚点必须清掉，否则它还带着 tabindex=0
              'item[0]': { tabindex: '-1' },
            },
            events: [{ type: 'value-change', detail: { value: 'edit' } }],
          },
        },
      ],
    },
    {
      name: '点击条目：派发 select 后收起，焦点归还 trigger',
      spec: { apg: APG },
      steps: [
        { kind: 'click', part: 'trigger[0]' },
        { kind: 'settle', until: { attr: { part: 'content[0]', name: 'hidden', value: null } } },
        {
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'false', 'data-state': 'closed' },
              'content[0]': { 'hidden': '', 'data-state': 'closed' },
            },
            // 先选中详情、后开合意图
            events: [
              { type: 'select', detail: { menu: 'file', value: 'open' } },
              { type: 'value-change', detail: { value: null } },
            ],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'trigger[0]' },
          expect: { activeElement: { part: 'trigger[0]', exact: true } },
        },
      ],
    },
    {
      name: 'Enter 选中焦点所在条目：与点击同一条出口',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.select'],
      steps: [
        { kind: 'focus', part: 'trigger[1]' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[3]' } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              'trigger[1]': { 'aria-expanded': 'false' },
              'content[1]': { hidden: '' },
            },
            events: [
              { type: 'select', detail: { menu: 'edit', value: 'cut' } },
              { type: 'value-change', detail: { value: null } },
            ],
          },
        },
      ],
    },
    {
      name: '点击禁用条目：不选中、不收起、一个事件也不发',
      spec: { apg: APG },
      fixture: () => menubarTree({ disabledItem: 'open' }),
      steps: [
        { kind: 'click', part: 'trigger[0]' },
        { kind: 'settle', until: { attr: { part: 'content[0]', name: 'hidden', value: null } } },
        {
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'true' },
              'content[0]': { hidden: null },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: 'Escape 收起并把焦点留在 trigger 上',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.escape'],
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'Escape',
          expect: { events: [{ type: 'value-change', detail: { value: null } }] },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content[0]', name: 'hidden', value: '' } },
          expect: {
            activeElement: { part: 'trigger[0]', exact: true },
            parts: {
              'trigger[0]': { 'aria-expanded': 'false', 'data-state': 'closed' },
              'content[0]': { 'hidden': '', 'data-state': 'closed' },
            },
          },
        },
      ],
    },
    {
      name: 'Tab 收起：焦点不被抢回 trigger，按 Tab 序列自然离开',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menubar.kbd.tab'],
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'Tab',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'false' },
              'content[0]': { hidden: '' },
            },
            events: [{ type: 'value-change', detail: { value: null } }],
          },
        },
        {
          kind: 'raw',
          why: '焦点归还排在效应拆除后的下一帧；等过这两帧才证得了 Tab 收起没把焦点抢回 trigger',
          run: () => new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          }),
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
      ],
    },
    {
      name: '整条禁用：每个 trigger 都报 aria-disabled，点与按都不展开',
      spec: { apg: APG },
      props: { disabled: true },
      steps: [
        {
          kind: 'click',
          part: 'trigger[0]',
          expect: {
            parts: {
              'root': { 'aria-disabled': 'true', 'data-disabled': '' },
              'trigger[0]': { 'aria-expanded': 'false', 'aria-disabled': 'true', 'disabled': null },
              'content[0]': { hidden: '' },
            },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: { 'content[0]': { hidden: '' } },
            events: [],
          },
        },
      ],
    },
    {
      // 受控初值给一个真实的项而不是 null：属性只有在/不在两态，harness 遇到 null 会整个跳过
      name: '受控 value：点击只发意图不自改 DOM，宿主写回后才换项',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: 'file' },
      steps: [
        {
          kind: 'click',
          part: 'trigger[1]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'true' },
              'trigger[1]': { 'aria-expanded': 'false' },
              'content[1]': { hidden: '' },
            },
            events: [{ type: 'value-change', detail: { value: 'edit' } }],
          },
        },
        { kind: 'setProps', props: { value: 'edit' } },
        {
          kind: 'settle',
          until: { attr: { part: 'content[1]', name: 'hidden', value: null } },
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'false' },
              'trigger[1]': { 'aria-expanded': 'true' },
              'content[0]': { hidden: '' },
            },
            // 宿主写回 value 不再回弹事件
            events: [],
          },
        },
      ],
    },
  ],
}
