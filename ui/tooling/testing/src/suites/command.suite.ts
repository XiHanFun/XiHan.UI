import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { commandAnatomy, commandKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/'

/**
 * 命令清单是过滤与导航的事实源：条目部件只报 value，此刻露不露面由 connect 打的 hidden 说了算。
 * 角色管理禁用（方向键跳过它，点击也不认）——禁用写在清单里，两个适配器同取这一份。
 */
const COLLECTION = [
  { value: 'page-users', label: '用户管理', keywords: ['users'], group: 'nav' },
  { value: 'page-roles', label: '角色管理', group: 'nav', disabled: true },
  { value: 'action-export', label: '导出报表', keywords: ['export'] },
]

const GROUPS = [{ value: 'nav', label: '页面' }]

/** 面板默认展开：收起态下 Vue 不渲染面板子树，多数用例要面板在场才断言得动。 */
const OPEN = { collection: COLLECTION, groups: GROUPS, defaultOpen: true }

function itemNode(value: string, text: string): FixtureNode {
  return {
    part: 'item',
    attrs: { value },
    children: [{ part: 'item-text', tag: 'span', text }],
  }
}

/**
 * empty 与 loading 摆在 content 里当 list 的兄弟，不进列表：
 * role=listbox 内只允许 option 与 group，占位挤进去会把无障碍树弄坏。
 * 没归组的那条排在分组之后，铺开与手写在这一点上一致。
 */
const TREE: FixtureNode = {
  part: 'root',
  children: [
    { part: 'trigger', tag: 'button', text: '打开' },
    {
      part: 'content',
      children: [
        // 必须是 input：WC 侧由 fixture 的 tag 决定，div 既不可聚焦也没有 value
        { part: 'input', tag: 'input' },
        {
          part: 'list',
          children: [
            {
              part: 'group',
              attrs: { value: 'nav' },
              children: [
                { part: 'group-label', tag: 'span', text: '页面' },
                itemNode('page-users', '用户管理'),
                itemNode('page-roles', '角色管理'),
              ],
            },
            itemNode('action-export', '导出报表'),
          ],
        },
        { part: 'empty', text: '无匹配命令' },
        { part: 'loading', text: '加载中' },
        { part: 'footer', tag: 'footer', text: '↑↓ 选择 · ↵ 执行 · Esc 关闭' },
      ],
    },
  ],
}

const INPUT = '[data-scope="command"][data-part="input"]'

/**
 * 打字。conformance 的 type 步骤只派按键、改不动输入框的值，
 * 而检索的入口正是原生 input 事件，只能直接写值再派事件。
 */
async function typeInto(doc: Document, text: string, flush: () => Promise<void>): Promise<void> {
  const input = doc.querySelector<HTMLInputElement>(INPUT)!
  input.focus()
  input.value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await flush()
}

/** 检索框里的文字只落 DOM property，快照只采属性，这一路只能直接读 DOM。 */
function assertInputValue(doc: Document, expected: string): void {
  const actual = doc.querySelector<HTMLInputElement>(INPUT)?.value ?? null
  if (actual !== expected)
    throw new Error(`检索串不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

// 收起态两端形态不同（Vue 卸载面板子树、WC 是 Light DOM 不删作者节点），
// 所以收起相关的断言一律只落在 trigger 上，面板在不在场不作数。
export const commandSuite: ConformanceSuite = {
  component: 'command',
  anatomy: commandAnatomy,
  keyboard: commandKeyboard,
  fixture: TREE,
  cases: [
    {
      // Enter / Space 由平台的按钮激活行为翻成 click，我们不自己接这两个键
      name: 'Enter / Space 打开：trigger 是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['command.kbd.open-on-trigger'],
      steps: [nativeActivation('command', 'trigger')],
    },
    {
      name: '初始收起：trigger 报 aria-haspopup=dialog 且未展开',
      spec: { apg: APG },
      props: { collection: COLLECTION, groups: GROUPS },
      initial: {
        counts: { trigger: 1 },
        parts: {
          trigger: {
            'type': 'button',
            'aria-haspopup': 'dialog',
            'aria-expanded': 'false',
            'data-state': 'closed',
          },
        },
      },
    },
    {
      name: '展开：面板是 role=dialog，检索框是 combobox 且三处 ARIA 互指，锚点落在首条命令上',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...OPEN, placeholder: '搜命令' },
      initial: {
        counts: {
          'content': 1,
          'input': 1,
          'list': 1,
          'group': 1,
          'group-label': 1,
          'item': 3,
          'item-text': 3,
          'empty': 1,
          'loading': 1,
          'footer': 1,
        },
        parts: {
          content: {
            'role': 'dialog',
            'aria-modal': 'true',
            'aria-label': 'Command palette',
            'tabindex': '-1',
            'data-state': 'open',
            'hidden': null,
          },
          input: {
            'id': '@self',
            'type': 'text',
            'role': 'combobox',
            'aria-haspopup': 'listbox',
            'aria-expanded': 'true',
            'aria-controls': '@part(list)',
            'aria-autocomplete': 'list',
            'aria-label': 'Search commands',
            'aria-activedescendant': '@part(item[0])',
            'data-state': 'open',
          },
          list: {
            'role': 'listbox',
            'aria-label': 'Commands',
            'tabindex': '-1',
            'aria-busy': null,
          },
          group: { 'role': 'group', 'aria-labelledby': '@part(group-label)', 'hidden': null },
          item: [
            {
              'role': 'option',
              'aria-selected': 'false',
              'aria-disabled': 'false',
              'id': '@self',
              'data-value': 'page-users',
              'data-highlighted': '',
              'data-disabled': null,
              // 焦点恒在检索框：命令既不进 Tab 序列，也不承载焦点
              'tabindex': null,
              // 集合条目绝不输出原生 disabled：那样连 click 都不派了
              'disabled': null,
              'hidden': null,
            },
            { 'aria-disabled': 'true', 'data-value': 'page-roles', 'data-disabled': '', 'disabled': null, 'hidden': null },
            { 'aria-disabled': 'false', 'data-value': 'action-export', 'data-highlighted': null, 'hidden': null },
          ],
          // 有命令剩下时空态让位，取数不在途时在途占位也让位
          empty: { 'role': 'status', 'hidden': '', 'data-state': 'open' },
          loading: { 'role': 'status', 'hidden': '', 'data-state': 'open' },
        },
      },
    },
    {
      name: '展开后焦点落在检索框：面板一露面就能直接打字',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: OPEN,
      steps: [
        {
          kind: 'settle',
          until: { activeElement: 'input' },
          expect: { activeElement: { part: 'input', exact: true } },
        },
      ],
    },
    {
      name: 'ArrowDown / ArrowUp 移锚点：禁用的那条跳过，焦点仍在检索框',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['command.kbd.next', 'command.kbd.prev'],
      props: OPEN,
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: {
              'input': { 'aria-activedescendant': '@part(item[2])' },
              'item[0]': { 'data-highlighted': null },
              // 禁用的那条永远不落锚点
              'item[1]': { 'data-highlighted': null },
              'item[2]': { 'data-highlighted': '' },
            },
            // 这是命令面板与列表框的分水岭：焦点不搬到条目上
            activeElement: { part: 'input', exact: true },
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: {
              'input': { 'aria-activedescendant': '@part(item[0])' },
              'item[0]': { 'data-highlighted': '' },
              'item[2]': { 'data-highlighted': null },
            },
          },
        },
      ],
    },
    {
      name: 'Home / End 跳到首末两条可用命令',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['command.kbd.first', 'command.kbd.last'],
      props: OPEN,
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'End',
          expect: { parts: { 'input': { 'aria-activedescendant': '@part(item[2])' }, 'item[2]': { 'data-highlighted': '' } } },
        },
        {
          kind: 'key',
          key: 'Home',
          expect: { parts: { 'input': { 'aria-activedescendant': '@part(item[0])' }, 'item[0]': { 'data-highlighted': '' } } },
        },
      ],
    },
    {
      name: 'Enter 执行锚点所在的命令：派发 select，长按连发的重复键不重复执行',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['command.kbd.select'],
      props: { ...OPEN, closeOnSelect: false },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'Enter',
          expect: { events: [{ type: 'select', detail: { value: 'page-users', label: '用户管理' } }] },
        },
        {
          // 按住不放时浏览器连发的 keydown 带 repeat=true，那是同一次按下，不该再执行一遍。
          // conformance 的 key 步骤派的是独立按键（repeat 是「按几次」），只能自己派一发带标记的
          kind: 'raw',
          why: '连发键要 event.repeat=true，key 步骤的 repeat 是「按几次」，表达不出来',
          async run({ doc, flush }) {
            const input = doc.querySelector<HTMLInputElement>(INPUT)!
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', repeat: true, bubbles: true, cancelable: true }))
            await flush()
          },
          expect: { events: [] },
        },
      ],
    },
    {
      name: '点击命令：派发 select 并收起面板',
      spec: { apg: `${APG}#roles_states_properties` },
      props: OPEN,
      steps: [
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            events: [
              { type: 'select', detail: { value: 'action-export', label: '导出报表' } },
              { type: 'open-change', detail: { open: false, reason: 'selection' } },
            ],
          },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'trigger', name: 'data-state', value: 'closed' } },
          expect: { parts: { trigger: { 'aria-expanded': 'false' } } },
        },
      ],
    },
    {
      name: '点击禁用的命令：不派发 select，面板不动',
      spec: { apg: `${APG}#roles_states_properties` },
      props: OPEN,
      steps: [
        {
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: { trigger: { 'data-state': 'open' } },
            events: [],
          },
        },
      ],
    },
    {
      name: '打字过滤：不命中的命令与整组被筛空的分组一并收起，锚点钉回首条命中项',
      spec: { adr: 'command-filter' },
      props: OPEN,
      steps: [
        {
          kind: 'raw',
          why: '检索的入口是原生 input 事件，conformance 的 type 步骤只派按键、改不动输入框的值',
          async run({ doc, flush }) {
            // 别名也参与检索：导出报表登记了 export
            await typeInto(doc, 'export', flush)
            assertInputValue(doc, 'export')
          },
          expect: {
            parts: {
              'item[0]': { hidden: '' },
              'item[1]': { hidden: '' },
              'item[2]': { 'hidden': null, 'data-highlighted': '' },
              // 分组里一条都没剩下，整组收起
              'group': { hidden: '' },
              'input': { 'aria-activedescendant': '@part(item[2])' },
              'empty': { hidden: '' },
            },
          },
        },
      ],
    },
    {
      name: '一条都没命中：空态占位顶上来，锚点摘掉',
      spec: { adr: 'command-filter' },
      props: OPEN,
      steps: [
        {
          kind: 'raw',
          why: '同上：检索串只能直接写进输入框再派原生 input 事件',
          async run({ doc, flush }) {
            await typeInto(doc, '没有这条命令', flush)
          },
          expect: {
            parts: {
              'item[0]': { hidden: '' },
              'item[1]': { hidden: '' },
              'item[2]': { hidden: '' },
              'empty': { hidden: null, role: 'status' },
              'input': { 'aria-activedescendant': null },
            },
          },
        },
      ],
    },
    {
      name: 'filter 关掉：清单原样铺开，打字只发意图不筛',
      spec: { adr: 'command-filter' },
      props: { ...OPEN, filter: false },
      steps: [
        {
          kind: 'raw',
          why: '同上：检索串只能直接写进输入框再派原生 input 事件',
          async run({ doc, flush }) {
            await typeInto(doc, '没有这条命令', flush)
          },
          expect: {
            parts: {
              'item[0]': { hidden: null },
              'item[2]': { hidden: null },
              'empty': { hidden: '' },
            },
          },
        },
      ],
    },
    {
      name: '取数在途：列表报 aria-busy，在途占位顶上来、空态让位',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { collection: [], defaultOpen: true, loading: true },
      initial: {
        parts: {
          list: { 'aria-busy': 'true' },
          loading: { role: 'status', hidden: null },
          // 一条都没有，但在途期间空态让位给在途占位
          empty: { hidden: '' },
        },
      },
    },
    {
      name: 'Escape 关闭并把焦点还给 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['command.kbd.escape'],
      props: OPEN,
      steps: [
        { kind: 'settle', until: { activeElement: 'input' } },
        { kind: 'key', key: 'Escape' },
        {
          kind: 'settle',
          until: { attr: { part: 'trigger', name: 'data-state', value: 'closed' } },
          expect: { parts: { trigger: { 'aria-expanded': 'false' } } },
        },
        // 归还排在拆除后一帧，单独等一步：面板不是点 trigger 打开的，
        // 创建前的持有者是 body，落回 trigger 全靠机器显式交出去的归还落点
        {
          kind: 'settle',
          until: { activeElement: 'trigger' },
          expect: { activeElement: { part: 'trigger', exact: true } },
        },
      ],
    },
    {
      name: '受控 open：点 trigger 只发 open-change 不自改状态，父写回后才展开',
      spec: { adr: 'controlled-uncontrolled' },
      props: { collection: COLLECTION, groups: GROUPS, open: false },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: { trigger: { 'aria-expanded': 'false', 'data-state': 'closed' } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'setProps', props: { open: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'trigger', name: 'data-state', value: 'open' } },
          expect: { parts: { trigger: { 'aria-expanded': 'true' } } },
        },
      ],
    },
  ],
}
