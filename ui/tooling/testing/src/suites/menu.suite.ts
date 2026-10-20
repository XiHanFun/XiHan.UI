import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { menuAnatomy, menuKeyboard } from '@xihan-ui/headless'
import { clickExternalAnchor, externalAnchorAria, focusReturnsToExternalAnchor, mountExternalAnchor, removeExternalAnchor, withoutTrigger } from './shared/external-anchor'
import { focusByValue, nestedChoiceItem, nestedChoiceState } from './shared/nested-choice'
import { heldPress, heldPressIgnored } from './shared/press-channel'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/'

const VALUES = ['copy', 'paste', 'delete'] as const

/**
 * 三个条目 + 一条分隔线：content 常挂，靠 hidden 显隐。
 * 分隔线夹在末两个条目之间——它带 data-scope 却不入集合，End 落到它后面的条目即为证。
 * disabled 落在哪个条目由用例指定；禁用条目仍在 DOM 里，只是方向键跳过它。
 */
function menuTree(disabled?: string): FixtureNode {
  const item = (value: string, text: string): FixtureNode => {
    const attrs: Record<string, string> = { value }
    if (value === disabled)
      attrs.disabled = ''
    return { part: 'item', text, attrs }
  }
  return {
    children: [
      // 必须是 button：WC 侧由 fixture 的 tag 决定，div 不可聚焦
      { part: 'trigger', tag: 'button', text: '操作' },
      {
        part: 'positioner',
        children: [
          {
            part: 'content',
            children: [
              { part: 'arrow' },
              item(VALUES[0], '复制'),
              item(VALUES[1], '粘贴'),
              { part: 'separator' },
              item(VALUES[2], '删除'),
            ],
          },
        ],
      },
    ],
  }
}

/** 条目上的图标：一枚只有一条横线的记录，够看出 item-icon 铺没铺、里面有没有 svg。 */
const ITEM_ICON = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path', attrs: { d: 'M4 12h16' } }] }

/**
 * 标准结构场景的数据：带快捷键的条目、带说明的条目、带标题的勾选分组。
 * 子菜单的定位层在三端落进 portal 的时机不同，文档序对不齐，子菜单另在各端单测里断言。
 */
const STRUCTURE_COLLECTION = [
  { value: 'open', label: '打开', shortcut: 'Ctrl+O', icon: ITEM_ICON },
  { value: 'rename', label: '重命名', description: '改文件名' },
  { value: 'bold', label: '粗体', kind: 'checkbox', icon: ITEM_ICON, group: 'format', groupLabel: '格式', separatorBefore: true },
  { value: 'italic', label: '斜体', kind: 'checkbox', group: 'format' },
]

// content 始终在 DOM，展开态靠 hidden 属性显隐，不卸载作者节点。
// 位置由引擎异步回填，快照不采集 style，因此这里只在收起态断言 data-placement 这类语义属性。
export const menuSuite: ConformanceSuite = {
  component: 'menu',
  anatomy: menuAnatomy,
  keyboard: menuKeyboard,
  fixture: menuTree(),
  cases: [
    {
      name: '初始收起：trigger aria-expanded=false，content 带 hidden，条目全部退出 Tab 序列',
      spec: { apg: APG },
      initial: {
        order: ['trigger', 'positioner', 'content', 'arrow', 'item[0]', 'item[1]', 'separator', 'item[2]'],
        counts: { trigger: 1, positioner: 1, content: 1, arrow: 1, item: 3, separator: 1 },
        parts: {
          'trigger': {
            'type': 'button',
            'aria-haspopup': 'menu',
            'aria-expanded': 'false',
            'aria-controls': '@part(content)',
            'data-state': 'closed',
          },
          'content': {
            'role': 'menu',
            'tabindex': '-1',
            'aria-labelledby': '@part(trigger)',
            'hidden': '',
            'data-state': 'closed',
          },
          'positioner': {
            'data-state': 'closed',
            'data-placement': 'bottom-start',
          },
          // 收起态没有锚点：条目连同 content 一起 hidden。条目走 Collection Item 的 overlay 语境，不报 aria-selected
          'item[0]': {
            'data-xh-collection-item': '',
            'data-xh-collection-size': 'md',
            'data-xh-collection-context': 'overlay',
            'aria-selected': null,
            'role': 'menuitem',
            'aria-disabled': 'false',
            'disabled': null,
            'data-disabled': null,
            'data-value': 'copy',
            'tabindex': '-1',
          },
          'item[2]': { 'data-value': 'delete', 'tabindex': '-1' },
          'separator': { 'role': 'separator', 'aria-orientation': 'horizontal', 'data-xh-collection-separator': '' },
        },
      },
    },
    {
      name: '点击 trigger 展开：content 去掉 hidden，三处 ARIA 互指，锚点落到首个条目，派发 open-change',
      spec: { apg: `${APG}#roles_states_properties` },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              'trigger': {
                'aria-expanded': 'true',
                'aria-controls': '@part(content)',
                'data-state': 'open',
              },
              'content': {
                'role': 'menu',
                'aria-labelledby': '@part(trigger)',
                'hidden': null,
                'data-state': 'open',
              },
              // roving tabindex：整组只有锚点条目留在 Tab 序列内
              'item[0]': { tabindex: '0' },
              'item[1]': { tabindex: '-1' },
              'item[2]': { tabindex: '-1' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
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
      name: 'ArrowDown 从 trigger 展开并把焦点落到首个条目',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.open-first'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'true', 'data-state': 'open' },
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
      name: 'Enter 从 trigger 展开：不被按钮默认激活合成的 click 反手关掉',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.open-first'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true' },
              content: { hidden: null },
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
      name: 'ArrowUp 从 trigger 展开并把焦点落到末个条目',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.open-last'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'true' },
              'item[0]': { tabindex: '-1' },
              'item[2]': { tabindex: '0' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
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
      name: '菜单内方向键跳过禁用条目并在尽头回绕；禁用条目用 aria-disabled 而非原生 disabled',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.next', 'menu.kbd.prev'],
      fixture: () => menuTree('paste'),
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
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
      name: 'Home/End 跳到首尾条目：End 越过分隔线落在其后的条目，分隔线不入集合',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.first', 'menu.kbd.last'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
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
      name: '点击条目：派发 item-select 后关闭，锚点清空，焦点归还 trigger',
      spec: { apg: APG },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        {
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'false', 'data-state': 'closed' },
              'content': { 'hidden': '', 'data-state': 'closed' },
              'item[1]': { tabindex: '-1' },
            },
            // 先选中详情、后开合意图
            events: [
              { type: 'item-select', detail: { value: 'paste' } },
              { type: 'open-change', detail: { open: false, reason: 'selection' } },
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
      name: 'CheckboxItem 切换受控集合语义，默认保持菜单展开',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/examples/menu-button-actions/' },
      props: {
        defaultCheckboxValue: ['copy'],
        collection: [
          { value: 'copy', label: '复制', kind: 'checkbox' },
          { value: 'paste', label: '粘贴' },
          { value: 'delete', label: '删除' },
        ],
      },
      initial: {
        parts: {
          'item[0]': { 'role': 'menuitemcheckbox', 'aria-checked': 'true', 'data-state': 'checked' },
        },
      },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'true' },
              'content': { 'hidden': null, 'data-state': 'open' },
              'item[0]': { 'aria-checked': 'false', 'data-state': 'unchecked' },
            },
            events: [{ type: 'checkbox-value-change', detail: { value: [] } }],
          },
        },
      ],
    },
    {
      name: 'Enter 选中焦点所在条目：与点击同一条出口',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.select'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false' },
              content: { 'hidden': '', 'data-state': 'closed' },
            },
            events: [
              { type: 'item-select', detail: { value: 'copy' } },
              { type: 'open-change', detail: { open: false, reason: 'selection' } },
            ],
          },
        },
      ],
    },
    {
      name: '点击禁用条目：不选中、不关闭、一个事件也不发',
      spec: { apg: APG },
      fixture: () => menuTree('paste'),
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        {
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { 'hidden': null, 'data-state': 'open' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: 'Escape 关闭：content 复位 hidden 且焦点归还 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.escape'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'Escape',
          expect: { events: [{ type: 'open-change', detail: { open: false, reason: 'esc' } }] },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed' },
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
      name: 'Tab 关闭：焦点不被抢回 trigger，按 Tab 序列自然离开',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.tab'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'Tab',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'open-change', detail: { open: false, reason: 'tab' } }],
          },
        },
        // Tab 的默认动作把焦点按文档序带出浮层：夹具里浮层之后没有别的停靠点，落到 body
        {
          kind: 'raw',
          why: '焦点归还排在焦点域拆除后的下一帧；等过这两帧焦点仍在 body 才证得了 Tab 关闭没把焦点抢回 trigger',
          run: () => new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          }),
          expect: { activeElement: null, parts: { content: { hidden: '' } }, events: [] },
        },
      ],
    },
    {
      name: '受控 open：点击只发 open-change 不自改 DOM，父写回 open 后才展开',
      spec: { adr: 'controlled-uncontrolled' },
      props: { open: false },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed' },
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
              'trigger': { 'aria-expanded': 'true', 'data-state': 'open' },
              'content': { 'data-state': 'open', 'hidden': null },
              // 受控回写走影子事件，落焦端仍取自当初那次点击
              'item[0]': { tabindex: '0' },
            },
          },
        },
      ],
    },
    {
      name: 'Space / Enter 按住与触屏按下：条目投影 data-pressed，抬起、失焦或指针取消撤下',
      spec: { adr: 'press-channel' },
      covers: ['menu.kbd.press'],
      // 受控展开：Enter / Space 按下即选中并发关闭意图，宿主不写回就仍开着，按住的中间帧才看得见
      props: { open: true },
      steps: [heldPress('menu', 'item')],
    },
    {
      name: '禁用条目按住不进入按压面',
      spec: { adr: 'press-channel' },
      fixture: () => menuTree('copy'),
      props: { open: true },
      steps: [heldPressIgnored('menu', 'item', '禁用条目不接受按压')],
    },
    {
      name: '作者不写结构：三端都照 menuStructure 铺出触发按钮、定位层与条目（快捷键、说明、带标题的勾选分组）；勾选可多选，换数据按值复用条目',
      spec: { apg: `${APG}#roles_states_properties` },
      fixture: (): FixtureNode => ({ defaultStructure: true }),
      props: { collection: STRUCTURE_COLLECTION, label: '文件' },
      initial: {
        order: [
          'trigger',
          'positioner',
          'content',
          'item[0]',
          'item-icon[0]',
          'item-text[0]',
          'item-shortcut',
          'item[1]',
          'item-text[1]',
          'item-description',
          'separator',
          'group',
          'group-label',
          'item[2]',
          'item-indicator[0]',
          'item-icon[1]',
          'item-text[2]',
          'item[3]',
          'item-indicator[1]',
          'item-text[3]',
        ],
        parts: {
          'trigger': { 'type': 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false' },
          'item[0]': { 'role': 'menuitem', 'data-value': 'open' },
          'item-icon[0]': { 'aria-hidden': 'true', 'data-xh-collection-slot': 'icon' },
          'item[2]': { 'role': 'menuitemcheckbox', 'aria-checked': 'false' },
          'group': { 'role': 'group', 'aria-labelledby': '@part(group-label)' },
        },
      },
      steps: [
        { kind: 'click', part: 'trigger', expect: { parts: { trigger: { 'aria-expanded': 'true' } } } },
        { kind: 'click', part: 'item[2]', expect: { parts: { 'item[2]': { 'aria-checked': 'true' } } } },
        { kind: 'click', part: 'item[3]', expect: { parts: { 'item[2]': { 'aria-checked': 'true' }, 'item[3]': { 'aria-checked': 'true' } } } },
        { kind: 'click', part: 'item[0]', expect: { parts: { trigger: { 'aria-expanded': 'false' } } } },
        {
          kind: 'setProps',
          props: { collection: [STRUCTURE_COLLECTION[1], { value: 'delete', label: '删除' }] },
          expect: {
            order: ['trigger', 'positioner', 'content', 'item[0]', 'item-text[0]', 'item-description', 'item[1]', 'item-text[1]'],
            parts: { 'item[0]': { 'data-value': 'rename' }, 'item[1]': { 'data-value': 'delete' } },
          },
        },
      ],
    },
    {
      name: 'anchor：外部锚点顶替 trigger，展开期间带 aria-haspopup="menu" / aria-expanded / aria-controls，Escape 收起后还原并把焦点还给它',
      spec: { apg: `${APG}#keyboardinteraction`, adr: 'menu-anchor' },
      fixture: () => withoutTrigger(menuTree()),
      // 先写上 anchor：元素要等挂载后才造得出来。没有触发器替菜单命名，名字写在 translations.content 上
      props: { open: false, anchor: null, translations: { content: '操作' } },
      initial: { parts: { content: { 'aria-label': '操作', 'aria-labelledby': null } } },
      steps: [
        mountExternalAnchor(),
        externalAnchorAria('menu', { haspopup: null, expanded: null, controlsContent: false }),
        { kind: 'setProps', props: { open: true } },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        externalAnchorAria('menu', { haspopup: 'menu', expanded: 'true', controlsContent: true }),
        // 受控：Escape 只发收起意图，宿主写回才收
        { kind: 'key', key: 'Escape', expect: { events: [{ type: 'open-change', detail: { open: false, reason: 'esc' } }] } },
        { kind: 'setProps', props: { open: false } },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: '' } } },
        externalAnchorAria('menu', { haspopup: null, expanded: null, controlsContent: false }),
        focusReturnsToExternalAnchor,
        removeExternalAnchor,
      ],
    },
    {
      name: 'anchor：点外部锚点算层内交互，不发收起意图——开合交给打开它的那条命令',
      spec: { adr: 'menu-anchor' },
      fixture: () => withoutTrigger(menuTree()),
      props: { open: true, anchor: null, translations: { content: '操作' } },
      steps: [
        mountExternalAnchor(),
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        clickExternalAnchor({ events: [], parts: { content: { hidden: null } } }),
        // 对照：层外的点击照常发收起意图
        { kind: 'outside', action: 'click', expect: { events: [{ type: 'open-change', detail: { open: false, reason: 'interact-outside' } }] } },
        removeExternalAnchor,
      ],
    },
    {
      name: 'anchor：作者不写结构时，交给外部锚点后不再铺触发按钮，定位层与条目照旧',
      spec: { adr: 'menu-anchor' },
      fixture: (): FixtureNode => ({ defaultStructure: true }),
      props: { collection: STRUCTURE_COLLECTION, label: '文件', translations: { content: '文件' } },
      initial: { counts: { trigger: 1, positioner: 1, content: 1, item: 4 } },
      steps: [
        mountExternalAnchor({ counts: { trigger: 0, positioner: 1, content: 1, item: 4 } }),
        removeExternalAnchor,
      ],
    },
    {
      name: '作者不写结构：带 children 的条目写着子层的勾选与单选值，子层按它显示，换数据跟着变',
      spec: { apg: `${APG}#roles_states_properties` },
      fixture: (): FixtureNode => ({ defaultStructure: true }),
      // 一开始就展开：子层与本层同为 menu，部件下标会落到子层的条目上，入口按 value 找
      props: { collection: [{ value: 'zoom', label: '缩放' }, nestedChoiceItem(['outline'], 'compact')], label: '视图', open: true },
      skipParity: '子层的定位层搬进 portal 的时机三端不同，同为 menu 的部件文档序对不齐，逐帧比对没有意义',
      steps: [
        focusByValue('menu', 'panels'),
        { kind: 'key', key: 'ArrowRight' },
        nestedChoiceState({ outline: 'true', history: 'false', comfortable: 'false', compact: 'true' }),
        { kind: 'setProps', props: { collection: [{ value: 'zoom', label: '缩放' }, nestedChoiceItem(['history'], 'comfortable')], label: '视图', open: true } },
        nestedChoiceState({ outline: 'false', history: 'true', comfortable: 'true', compact: 'false' }),
      ],
    },
  ],
}
