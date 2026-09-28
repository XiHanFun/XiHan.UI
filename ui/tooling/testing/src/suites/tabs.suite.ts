import type { ConformanceCase, ConformanceSuite, FixtureNode } from '../conformance/types'
import { tabsAnatomy, tabsKeyboard } from '@xihan-ui/headless'
import { singleTabStop } from './shared/native-activation'
import { focusSettled, menuExited, overflowMenuItem, settled } from './shared/overflow-menu'
import { heldPress, heldPressIgnored } from './shared/press-channel'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/'

const VALUES = ['one', 'two', 'three'] as const

/** 标签序的真源是 collection：换位报出的新顺序按它算，没有它一次也搬不动。 */
const COLLECTION = VALUES.map(value => ({ value }))

/**
 * 三个 trigger + 三个 content：panel 全部常挂，靠 hidden 显隐。
 * disabled 落在哪个条目由用例指定；禁用条目仍在 DOM 与集合里，只是方向键跳过它。
 *
 * 每个标签里带一个触屏拖动把手，占着标签内的头一格，身份跟着裹着它的那个标签走。
 * 标签文字裹进一个 span，两个适配器建出的节点才一模一样——裸文本子节点在其中一侧
 * 会被建成元素，文档序对不齐。
 *
 * 末尾的播报区与 list 部件平级：root 自己不带角色，role=tablist 在 list 上，
 * 活动区域落不进它的子节点集合。它常挂在这儿，各用例不必各挂一遍。
 *
 * 每个标签后面紧跟一枚关闭钮，与标签平级、自报同一个 value；closable 缺省关，它们在场但收起。
 *
 * 标签带两端各挂一只翻页钮：jsdom 不排版，标签带永远"放得下"，两只钮始终 hidden；
 * 这里钉的是三端把它们建成同一种节点（对读屏隐藏、不占 Tab 位、放得下时收起）。
 */
function tabsTree(disabled?: string): FixtureNode {
  return {
    part: 'root',
    children: [
      {
        part: 'list',
        children: [
          { part: 'prev-trigger', tag: 'button' },
          ...VALUES.flatMap((v): FixtureNode[] => {
            const attrs: Record<string, string> = { value: v }
            if (v === disabled)
              attrs.disabled = ''
            return [
              {
                part: 'trigger',
                tag: 'button',
                attrs,
                children: [
                  // 标签带没有条目级上下文，把手与 trigger / content 一样自报 value
                  { part: 'tab-drag-trigger', tag: 'span', attrs: { value: v } },
                  { tag: 'span', text: `标签 ${v}` },
                ],
              },
              { part: 'close-trigger', tag: 'button', attrs: { value: v } },
            ]
          }),
          { part: 'next-trigger', tag: 'button' },
        ],
      },
      ...VALUES.map(v => ({
        part: 'content',
        attrs: { value: v },
        children: [{ text: `面板 ${v}` }],
      })),
      { part: 'live-region' },
    ],
  }
}

/**
 * root 里、紧跟标签带之后放一颗「更多」钮。只在溢出下拉的用例里出现：作者不写这个部件就没有下拉，
 * 其余用例的 order / counts 因此一条都不用改。
 */
function withOverflowTrigger(base: FixtureNode): FixtureNode {
  const children = [...(base.children ?? [])]
  const at = children.findIndex(node => node.part === 'list')
  children.splice(at + 1, 0, { part: 'overflow-trigger', tag: 'button' })
  return { ...base, children }
}

const TAB_SPAN = 100
const ARROW_SIZE = 36
const MORE_SIZE = 32
const TAB_HEIGHT = 36

/**
 * 溢出下拉要量排布，jsdom 没有排版：把标签带伪造成一排横排的格子。标签宽 100，按在标签带里的次序首尾相接；
 * 两端翻页钮 36、「更多」钮 32，收着（hidden）时两边都是 0，收起的关闭钮同样是 0；标签带的可见长度是 length。
 * 机器在挂载那一刻就量，所以要先于挂载装上、卸载后原样放回。
 */
function tabStrip(length: number): NonNullable<ConformanceCase['environment']> {
  return (win) => {
    const proto = win.HTMLElement.prototype
    const element = win.Element.prototype
    const keys = ['offsetWidth', 'offsetHeight', 'offsetLeft', 'offsetTop'] as const
    const saved = {
      ...Object.fromEntries(keys.map(key => [key, Object.getOwnPropertyDescriptor(proto, key)])),
      clientWidth: Object.getOwnPropertyDescriptor(element, 'clientWidth'),
      clientHeight: Object.getOwnPropertyDescriptor(element, 'clientHeight'),
    } as Record<(typeof keys)[number] | 'clientWidth' | 'clientHeight', PropertyDescriptor | undefined>
    const partOf = (el: Element): string | null => (el.getAttribute('data-scope') === 'tabs' ? el.getAttribute('data-part') : null)
    const square = (el: Element, size: number): { start: number, main: number, cross: number } =>
      (el as HTMLElement).hidden ? { start: 0, main: 0, cross: 0 } : { start: 0, main: size, cross: size }
    /** 伪造的盒：主轴起点、主轴长与交叉轴长；不归这里管的节点返回 null，取原值。 */
    const box = (el: Element): { start: number, main: number, cross: number } | null => {
      switch (partOf(el)) {
        case 'list':
          return { start: 0, main: length, cross: TAB_HEIGHT }
        case 'trigger': {
          const tabs = [...(el.parentElement?.children ?? [])].filter(other => partOf(other) === 'trigger')
          return { start: tabs.indexOf(el) * TAB_SPAN, main: TAB_SPAN, cross: TAB_HEIGHT }
        }
        case 'prev-trigger':
        case 'next-trigger':
          return square(el, ARROW_SIZE)
        case 'overflow-trigger':
          return square(el, MORE_SIZE)
        case 'close-trigger':
          return square(el, 0)
        default:
          return null
      }
    }
    const define = (target: object, key: keyof typeof saved, read: (b: { start: number, main: number, cross: number }) => number): void => {
      const fallback = saved[key]
      Object.defineProperty(target, key, {
        configurable: true,
        get(this: Element) {
          const b = box(this)
          return b ? read(b) : (fallback?.get?.call(this) ?? 0)
        },
      })
    }
    define(proto, 'offsetWidth', b => b.main)
    define(proto, 'offsetHeight', b => b.cross)
    define(proto, 'offsetLeft', b => b.start)
    define(proto, 'offsetTop', () => 0)
    define(element, 'clientWidth', b => b.main)
    define(element, 'clientHeight', b => b.cross)
    return () => {
      for (const key of keys) {
        const descriptor = saved[key]
        if (descriptor)
          Object.defineProperty(proto, key, descriptor)
        else
          delete (proto as unknown as Record<string, unknown>)[key]
      }
      for (const key of ['clientWidth', 'clientHeight'] as const) {
        const descriptor = saved[key]
        if (descriptor)
          Object.defineProperty(element, key, descriptor)
        else
          delete (element as unknown as Record<string, unknown>)[key]
      }
    }
  }
}

export const tabsSuite: ConformanceSuite = {
  component: 'tabs',
  anatomy: tabsAnatomy,
  keyboard: tabsKeyboard,
  fixture: tabsTree(),
  cases: [
    {
      // 整组只占一个 Tab 位；无锚点时须由容器兜底
      name: 'roving tabindex：整组只有一个 Tab 停靠点，无锚点时容器兜底',
      spec: { apg: APG },
      covers: ['tabs.kbd.tab'],
      steps: [singleTabStop('tabs', 'trigger', 'list')],
    },
    {
      name: '初始无选中：panel 常挂且全部 hidden，list 兜底进 Tab 序列',
      spec: { apg: APG },
      initial: {
        order: [
          'root',
          'list',
          'prev-trigger',
          'trigger[0]',
          'tab-drag-trigger[0]',
          'close-trigger[0]',
          'trigger[1]',
          'tab-drag-trigger[1]',
          'close-trigger[1]',
          'trigger[2]',
          'tab-drag-trigger[2]',
          'close-trigger[2]',
          'next-trigger',
          'content[0]',
          'content[1]',
          'content[2]',
          'live-region',
        ],
        counts: { 'root': 1, 'list': 1, 'prev-trigger': 1, 'next-trigger': 1, 'trigger': 3, 'tab-drag-trigger': 3, 'close-trigger': 3, 'content': 3, 'live-region': 1 },
        parts: {
          'root': { 'data-orientation': 'horizontal', 'data-variant': 'line' },
          'list': { 'role': 'tablist', 'aria-orientation': 'horizontal', 'tabindex': '0' },
          // 两端翻页钮：鼠标专用的辅助入口，不进可及树、不占 Tab 位；jsdom 里标签带放得下，收起且禁用
          'prev-trigger': {
            'type': 'button',
            'aria-hidden': 'true',
            'tabindex': '-1',
            'hidden': '',
            'disabled': '',
            'data-disabled': '',
            'data-orientation': 'horizontal',
            'data-xh-action-control': '',
            'data-xh-action-profile': 'icon',
            'data-xh-action-variant': 'ghost',
            'data-xh-action-size': 'md',
          },
          'next-trigger': { 'aria-hidden': 'true', 'tabindex': '-1', 'hidden': '', 'disabled': '', 'data-disabled': '' },
          'trigger[0]': {
            'role': 'tab',
            'type': 'button',
            'aria-selected': 'false',
            'aria-disabled': 'false',
            'tabindex': '-1',
            'data-state': 'inactive',
            'data-current': null,
            'data-value': 'one',
            'data-disabled': null,
            // reorderable 默认关：标签拖不动，这个标记就一个也不该出现
            'data-draggable': null,
            // 缺省 line 档的页签归 Collection Item 导航当前：家族按 nav 语境给面、字与按压时间线
            'data-xh-collection-item': '',
            'data-xh-collection-size': 'md',
            'data-xh-collection-context': 'nav',
          },
          'trigger[2]': { 'aria-selected': 'false', 'tabindex': '-1', 'data-value': 'three' },
          'tab-drag-trigger[0]': {
            // 把手不占 Tab 位、也不进可及树：键盘换位由标签带上的 Alt + 方向键承担
            'aria-hidden': 'true',
            'tabindex': '-1',
            // reorderable 默认关：把手照样在场，只是报自己拖不动
            'data-disabled': '',
            'data-dragging': null,
          },
          // 关闭钮：鼠标与触屏专用，不进可及树、不占 Tab 位；closable 缺省关，整枚收起
          'close-trigger[0]': {
            'type': 'button',
            'aria-hidden': 'true',
            'tabindex': '-1',
            'hidden': '',
            'disabled': null,
            'data-disabled': null,
            'data-xh-action-control': '',
            'data-xh-action-profile': 'icon',
            'data-xh-action-variant': 'ghost',
            'data-xh-action-size': 'xs',
          },
          'content[0]': { 'role': 'tabpanel', 'tabindex': '0', 'hidden': '', 'data-state': 'inactive' },
          'content[2]': { 'hidden': '', 'data-state': 'inactive' },
        },
      },
    },
    {
      name: '可关闭：点关闭钮发 tab-close，带上被关的标签与剩余标签序；库不改 DOM 与选中',
      spec: { apg: APG },
      props: { collection: COLLECTION, closable: true, defaultValue: 'one' },
      initial: {
        parts: {
          'close-trigger[0]': { 'hidden': null, 'aria-hidden': 'true', 'tabindex': '-1' },
          'close-trigger[2]': { hidden: null },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'close-trigger[2]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-selected': 'true' },
              'trigger[2]': { 'aria-selected': 'false' },
            },
            events: [{ type: 'tab-close', detail: { value: 'three', values: ['one', 'two'] } }],
          },
        },
      ],
    },
    {
      name: '可关闭：焦点在标签上按 Delete / Backspace 发同一个 tab-close',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tabs.kbd.close'],
      props: { collection: COLLECTION, closable: true, defaultValue: 'one' },
      steps: [
        { kind: 'focus', part: 'trigger[1]' },
        {
          kind: 'key',
          key: 'Delete',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            events: [{ type: 'tab-close', detail: { value: 'two', values: ['one', 'three'] } }],
          },
        },
        {
          kind: 'key',
          key: 'Backspace',
          expect: { events: [{ type: 'tab-close', detail: { value: 'two', values: ['one', 'three'] } }] },
        },
      ],
    },
    {
      name: '可关闭但标签禁用：关闭钮留在原地、禁用，点了不发事件',
      spec: { apg: APG },
      props: { collection: [{ value: 'one' }, { value: 'two', disabled: true }, { value: 'three' }], closable: true, defaultValue: 'one' },
      initial: {
        parts: {
          'close-trigger[1]': { 'hidden': null, 'disabled': '', 'data-disabled': '' },
          'close-trigger[0]': { 'disabled': null, 'data-disabled': null },
        },
      },
      steps: [
        { kind: 'click', part: 'close-trigger[1]', expect: { events: [] } },
      ],
    },
    {
      name: 'aria-controls / aria-labelledby 按 value 逐对互指',
      spec: { apg: `${APG}#roles_states_properties` },
      initial: {
        parts: {
          'trigger[0]': { 'id': '@self', 'aria-controls': '@part(content[0])' },
          'trigger[1]': { 'id': '@self', 'aria-controls': '@part(content[1])' },
          'trigger[2]': { 'id': '@self', 'aria-controls': '@part(content[2])' },
          'content[0]': { 'id': '@self', 'aria-labelledby': '@part(trigger[0])' },
          'content[1]': { 'id': '@self', 'aria-labelledby': '@part(trigger[1])' },
          'content[2]': { 'id': '@self', 'aria-labelledby': '@part(trigger[2])' },
        },
      },
    },
    {
      // 锚点指向一个不存在的值时没有 trigger 认领 tabindex=0、所有 panel 都 hidden，
      // 容器必须兜底。
      name: '锚点值不存在：无 trigger 认领 tabindex，list 必须仍是 Tab 停靠点（整组不脱序）',
      spec: { apg: APG },
      props: { defaultValue: '不存在的值' },
      initial: {
        parts: {
          'list': { tabindex: '0' },
          'trigger[0]': { 'aria-selected': 'false', 'tabindex': '-1' },
          'trigger[1]': { 'aria-selected': 'false', 'tabindex': '-1' },
          'trigger[2]': { 'aria-selected': 'false', 'tabindex': '-1' },
          'content[0]': { hidden: '' },
          'content[1]': { hidden: '' },
          'content[2]': { hidden: '' },
        },
      },
    },
    {
      name: 'defaultValue 选中：aria-selected / panel hidden / roving tabindex 三处一致；焦点在组外时 list 兜底 0',
      spec: { apg: APG },
      props: { defaultValue: 'two' },
      initial: {
        parts: {
          // list 的 tabindex 只看焦点在不在组内：没有 trigger 认领 0 时由容器兜底
          'list': { tabindex: '0' },
          'trigger[0]': { 'aria-selected': 'false', 'tabindex': '-1', 'data-state': 'inactive', 'data-current': null },
          // 选中页签同时投 data-current：aria-selected 归 activation 族，当前页的面与字由家族按 data-current 给
          'trigger[1]': { 'aria-selected': 'true', 'tabindex': '0', 'data-state': 'active', 'data-current': '' },
          'trigger[2]': { 'aria-selected': 'false', 'tabindex': '-1', 'data-state': 'inactive', 'data-current': null },
          'content[0]': { 'hidden': '', 'data-state': 'inactive' },
          'content[1]': { 'hidden': null, 'data-state': 'active' },
        },
      },
    },
    {
      name: 'card 档不归 Collection Item：三个家族角色都不投影，data-current 照发',
      spec: { apg: APG },
      props: { defaultValue: 'two', variant: 'card' },
      initial: {
        parts: {
          'root': { 'data-variant': 'card' },
          'trigger[0]': { 'data-xh-collection-item': null, 'data-xh-collection-size': null, 'data-xh-collection-context': null, 'data-current': null },
          'trigger[1]': { 'data-xh-collection-item': null, 'data-xh-collection-context': null, 'data-current': '', 'data-state': 'active' },
        },
      },
    },
    {
      name: '点击 trigger 切换选中：panel 随之显隐，焦点锚点跟到被点条目',
      spec: { apg: APG },
      props: { defaultValue: 'one' },
      steps: [
        {
          kind: 'click',
          part: 'trigger[1]',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            parts: {
              'trigger[0]': { 'aria-selected': 'false', 'tabindex': '-1', 'data-state': 'inactive' },
              'trigger[1]': { 'aria-selected': 'true', 'tabindex': '0', 'data-state': 'active' },
              'content[0]': { hidden: '' },
              'content[1]': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: 'two' } }],
          },
        },
      ],
    },
    {
      name: '焦点从组外落到容器：转投首个可停留条目，落焦不等于选中，Enter 才选中',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tabs.kbd.activate'],
      steps: [
        {
          kind: 'focus',
          part: 'list',
          expect: {
            activeElement: { part: 'trigger[0]', exact: true },
            parts: {
              'list': { tabindex: '-1' },
              'trigger[0]': { 'aria-selected': 'false', 'tabindex': '0', 'data-state': 'inactive' },
              'trigger[1]': { tabindex: '-1' },
              'content[0]': { hidden: '' },
            },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            activeElement: { part: 'trigger[0]', exact: true },
            parts: {
              'trigger[0]': { 'aria-selected': 'true', 'data-state': 'active' },
              'content[0]': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: 'one' } }],
          },
        },
      ],
    },
    {
      name: '焦点从组外落到容器：已有选中项时落在选中项上，不是第一个',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { defaultValue: 'three' },
      steps: [
        {
          kind: 'focus',
          part: 'list',
          expect: {
            // APG：焦点进入 tablist 时落在已激活的那个 tab 上。落第一个会让读屏
            // 播报「标签 1，未选中」，与屏幕上高亮的第三个对不上
            activeElement: { part: 'trigger[2]', exact: true },
            parts: {
              'list': { tabindex: '-1' },
              'trigger[0]': { 'aria-selected': 'false', 'tabindex': '-1' },
              'trigger[1]': { 'aria-selected': 'false', 'tabindex': '-1' },
              'trigger[2]': { 'aria-selected': 'true', 'tabindex': '0', 'data-state': 'active' },
            },
            // 落焦不改选中，所以一个事件都不该发
            events: [],
          },
        },
      ],
    },
    {
      name: 'automatic：ArrowRight 移动焦点并顺带切换选中',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tabs.kbd.next'],
      props: { defaultValue: 'one' },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            parts: {
              'trigger[0]': { 'aria-selected': 'false', 'tabindex': '-1' },
              'trigger[1]': { 'aria-selected': 'true', 'tabindex': '0' },
              'content[0]': { hidden: '' },
              'content[1]': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: 'two' } }],
          },
        },
      ],
    },
    {
      name: 'manual：ArrowRight 只搬焦点，tabindex 跟焦点走而非跟选中；Enter 才切换',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tabs.kbd.next', 'tabs.kbd.activate'],
      props: { defaultValue: 'one', activationMode: 'manual' },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            parts: {
              'trigger[0]': { 'aria-selected': 'true', 'tabindex': '-1', 'data-state': 'active' },
              'trigger[1]': { 'aria-selected': 'false', 'tabindex': '0', 'data-state': 'inactive' },
              'content[0]': { hidden: null },
              'content[1]': { hidden: '' },
            },
            // 焦点走了但选中没动，因此一个事件也不发
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            parts: {
              'trigger[0]': { 'aria-selected': 'false', 'data-state': 'inactive' },
              'trigger[1]': { 'aria-selected': 'true', 'tabindex': '0', 'data-state': 'active' },
              'content[0]': { hidden: '' },
              'content[1]': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: 'two' } }],
          },
        },
      ],
    },
    {
      name: '焦点离组：瞬态锚点清空，tabindex 交还选中项，list 重新兜底',
      spec: { apg: APG },
      props: { defaultValue: 'one', activationMode: 'manual' },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        { kind: 'key', key: 'ArrowRight' },
        {
          kind: 'blur',
          expect: {
            activeElement: null,
            parts: {
              'trigger[0]': { 'aria-selected': 'true', 'tabindex': '0' },
              'trigger[1]': { 'aria-selected': 'false', 'tabindex': '-1' },
              // 焦点已在组外，list 重新成为兜底停靠点
              'list': { tabindex: '0' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: 'Home/End 跳到首尾 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tabs.kbd.first', 'tabs.kbd.last'],
      props: { defaultValue: 'two' },
      steps: [
        { kind: 'focus', part: 'trigger[1]' },
        {
          kind: 'key',
          key: 'End',
          expect: {
            activeElement: { part: 'trigger[2]', exact: true },
            parts: { 'trigger[2]': { 'aria-selected': 'true', 'tabindex': '0' }, 'content[2]': { hidden: null } },
            events: [{ type: 'value-change', detail: { value: 'three' } }],
          },
        },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            activeElement: { part: 'trigger[0]', exact: true },
            parts: { 'trigger[0]': { 'aria-selected': 'true', 'tabindex': '0' }, 'content[0]': { hidden: null } },
            events: [{ type: 'value-change', detail: { value: 'one' } }],
          },
        },
      ],
    },
    {
      name: 'ArrowLeft 从首个回绕到末个',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tabs.kbd.prev'],
      props: { defaultValue: 'one' },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            activeElement: { part: 'trigger[2]', exact: true },
            parts: { 'trigger[2]': { 'aria-selected': 'true', 'tabindex': '0' } },
            events: [{ type: 'value-change', detail: { value: 'three' } }],
          },
        },
      ],
    },
    {
      // 水平轴按文字方向镜像：rtl 下视觉上的"右"就是序列上的"前一个"
      name: '横排 + dir=rtl：ArrowRight 走上一个、ArrowLeft 走下一个',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tabs.kbd.prev', 'tabs.kbd.next'],
      props: { defaultValue: 'two', dir: 'rtl' },
      steps: [
        { kind: 'focus', part: 'trigger[1]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'trigger[0]', exact: true },
            parts: {
              'trigger[0]': { 'aria-selected': 'true', 'tabindex': '0', 'data-state': 'active' },
              'trigger[1]': { 'aria-selected': 'false', 'tabindex': '-1', 'data-state': 'inactive' },
              'content[0]': { hidden: null },
              'content[1]': { hidden: '' },
            },
            events: [{ type: 'value-change', detail: { value: 'one' } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            parts: {
              'trigger[0]': { 'aria-selected': 'false', 'tabindex': '-1', 'data-state': 'inactive' },
              'trigger[1]': { 'aria-selected': 'true', 'tabindex': '0', 'data-state': 'active' },
              'content[0]': { hidden: '' },
              'content[1]': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: 'two' } }],
          },
        },
      ],
    },
    {
      name: '横向 tablist 里 ArrowDown 不归导航管：焦点与选中都不动',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { defaultValue: 'one' },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'trigger[0]', exact: true },
            parts: {
              'trigger[0]': { 'aria-selected': 'true', 'tabindex': '0' },
              'trigger[1]': { 'aria-selected': 'false', 'tabindex': '-1' },
              'content[0]': { hidden: null },
              'content[1]': { hidden: '' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: 'orientation=vertical：aria-orientation 跟随，ArrowDown 成为下一个',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tabs.kbd.next'],
      props: { defaultValue: 'one', orientation: 'vertical' },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            parts: {
              'list': { 'aria-orientation': 'vertical' },
              'trigger[1]': { 'aria-selected': 'true', 'tabindex': '0' },
              'content[1]': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: 'two' } }],
          },
        },
      ],
    },
    {
      name: '禁用条目用 aria-disabled 而非原生 disabled，方向键跳过它',
      spec: { apg: APG },
      covers: ['tabs.kbd.next'],
      fixture: () => tabsTree('two'),
      props: { defaultValue: 'one' },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'trigger[2]', exact: true },
            parts: {
              'trigger[1]': { 'aria-disabled': 'true', 'disabled': null, 'data-disabled': '', 'aria-selected': 'false' },
              'trigger[2]': { 'aria-selected': 'true', 'tabindex': '0' },
              'content[2]': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: 'three' } }],
          },
        },
      ],
    },
    {
      name: '受控 value：点击只发意图不自改 DOM，宿主写回 value 后才切换',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: 'one' },
      steps: [
        {
          kind: 'click',
          part: 'trigger[1]',
          expect: {
            parts: {
              // 选中没动，但焦点锚点跟到了被点条目
              'trigger[0]': { 'aria-selected': 'true', 'tabindex': '-1' },
              'trigger[1]': { 'aria-selected': 'false', 'tabindex': '0' },
              'content[1]': { hidden: '' },
            },
            events: [{ type: 'value-change', detail: { value: 'two' } }],
          },
        },
        { kind: 'setProps', props: { value: 'two' } },
        {
          kind: 'settle',
          until: { attr: { part: 'content[1]', name: 'hidden', value: null } },
          expect: {
            parts: {
              'trigger[0]': { 'aria-selected': 'false', 'data-state': 'inactive' },
              'trigger[1]': { 'aria-selected': 'true', 'data-state': 'active' },
              'content[0]': { hidden: '' },
            },
            // 宿主写回 value 不再回弹事件
            events: [],
          },
        },
      ],
    },
    {
      name: '标签换位：Alt + 左右键挪一位，只报事件不动 DOM；到首末不回绕，裸方向键仍是导航',
      spec: { apg: `${APG}#keyboardinteraction` },
      // 键盘那一路不碰把手：整个标签就是拖动源。开关只开在这个用例上
      props: { collection: COLLECTION, reorderable: true, defaultValue: 'one' },
      covers: ['tabs.kbd.tab-move'],
      initial: {
        parts: {
          'trigger[0]': { 'data-draggable': '', 'data-dragging': null, 'data-drop': null },
          'trigger[2]': { 'data-draggable': '' },
          // 开着换位时把手才报得动
          'tab-drag-trigger[0]': { 'data-disabled': null, 'data-dragging': null },
        },
      },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          modifiers: ['Alt'],
          expect: {
            // 按一下就提交完，不进拖动态；焦点锚点留在搬走的那个标签上
            activeElement: { part: 'trigger[0]', exact: true },
            parts: { 'trigger[0]': { 'data-dragging': null, 'data-drop': null } },
            // 标签序是 collection prop，库没有一份自己的顺序可写：DOM 里 one 仍排在最前，
            // 只有这条事件说得出新顺序
            events: [{ type: 'tab-move', detail: { value: 'one', from: 0, to: 1, values: ['two', 'one', 'three'] } }],
          },
        },
        // 宿主没把新顺序写回 collection，one 还在首位：往前挪不动，也不回绕，连事件都不发
        { kind: 'key', key: 'ArrowLeft', modifiers: ['Alt'], expect: { events: [] } },
        // 不带 Alt 的方向键照旧是导航，automatic 下顺带切换选中，一个换位事件都不发
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            events: [{ type: 'value-change', detail: { value: 'two' } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          modifiers: ['Alt'],
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            events: [{ type: 'tab-move', detail: { value: 'two', from: 1, to: 2, values: ['one', 'three', 'two'] } }],
          },
        },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'trigger[2]', exact: true } } },
        // three 是末位：往后挪不动
        { kind: 'key', key: 'ArrowRight', modifiers: ['Alt'], expect: { events: [] } },
      ],
    },
    {
      name: '标签换位跟着轴走：竖排改由 Alt + 上下键挪，横轴那两个键一概不认',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { collection: COLLECTION, reorderable: true, defaultValue: 'one', orientation: 'vertical' },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        // 竖排里左右键既不是导航也不是换位：焦点、选中、顺序三样都不动
        {
          kind: 'key',
          key: 'ArrowRight',
          modifiers: ['Alt'],
          expect: { activeElement: { part: 'trigger[0]', exact: true }, events: [] },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          modifiers: ['Alt'],
          expect: {
            activeElement: { part: 'trigger[0]', exact: true },
            events: [{ type: 'tab-move', detail: { value: 'one', from: 0, to: 1, values: ['two', 'one', 'three'] } }],
          },
        },
        // 上下与阅读方向无关，首位往上挪不动
        { kind: 'key', key: 'ArrowUp', modifiers: ['Alt'], expect: { events: [] } },
      ],
    },
    {
      name: 'dir=rtl 把 Alt + 左右键整体对调：视觉上往哪边挪就往哪边挪',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { collection: COLLECTION, reorderable: true, defaultValue: 'two', dir: 'rtl' },
      steps: [
        { kind: 'focus', part: 'trigger[1]' },
        {
          kind: 'key',
          key: 'ArrowLeft',
          modifiers: ['Alt'],
          expect: { events: [{ type: 'tab-move', detail: { value: 'two', from: 1, to: 2, values: ['one', 'three', 'two'] } }] },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          modifiers: ['Alt'],
          expect: { events: [{ type: 'tab-move', detail: { value: 'two', from: 1, to: 0, values: ['two', 'one', 'three'] } }] },
        },
      ],
    },
    {
      name: 'Space / Enter 按住与触屏按下：trigger 投影 data-pressed，抬起、失焦或指针取消撤下；选中与按压互相独立',
      spec: { adr: 'press-channel' },
      covers: ['tabs.kbd.press'],
      props: { defaultValue: 'one' },
      steps: [
        // 选中的那一条也接按压：确认键在 list 上是幂等的，按住只多一帧按压面
        heldPress('tabs', 'trigger', { value: 'one' }),
        // 未选中的那一条：确认键在 keydown 那一刻就把选中切过来，按压面撤下后选中留在它身上
        heldPress('tabs', 'trigger', { value: 'three' }),
        { kind: 'settle', until: { attr: { part: 'trigger[2]', name: 'data-pressed', value: null } }, expect: { parts: { 'trigger[0]': { 'aria-selected': 'false' }, 'trigger[2]': { 'aria-selected': 'true', 'data-current': '' } } } },
      ],
    },
    {
      name: '禁用条目不进入按压面',
      spec: { adr: 'press-channel' },
      fixture: () => tabsTree('two'),
      props: { defaultValue: 'one' },
      steps: [heldPressIgnored('tabs', 'trigger', '禁用的 trigger 不接受按压', { value: 'two' })],
    },
    {
      name: '标签带放得下：「更多」钮收着，排在标签带之后、面板之前',
      spec: { apg: APG },
      fixture: withOverflowTrigger,
      environment: tabStrip(600),
      props: { defaultValue: 'one' },
      initial: {
        order: [
          'root',
          'list',
          'prev-trigger',
          'trigger[0]',
          'tab-drag-trigger[0]',
          'close-trigger[0]',
          'trigger[1]',
          'tab-drag-trigger[1]',
          'close-trigger[1]',
          'trigger[2]',
          'tab-drag-trigger[2]',
          'close-trigger[2]',
          'next-trigger',
          'overflow-trigger',
          'content[0]',
          'content[1]',
          'content[2]',
          'live-region',
        ],
        parts: {
          'overflow-trigger': { 'hidden': '', 'type': 'button', 'aria-label': 'More tabs', 'aria-expanded': 'false' },
          'prev-trigger': { hidden: '' },
          'next-trigger': { hidden: '' },
        },
      },
    },
    {
      name: '标签带放不下：「更多」钮露面并接上菜单触发器的接线，下拉列出没有整个露在可见区里的标签',
      spec: { apg: APG },
      fixture: withOverflowTrigger,
      // 三枚标签共 300 放不进 200；起头时结束侧让出翻页钮 36，可见区 [0, 164]：one 整个露着，two 半露
      environment: tabStrip(200),
      props: { defaultValue: 'one' },
      initial: {
        parts: {
          'overflow-trigger': {
            'hidden': null,
            'type': 'button',
            'aria-label': 'More tabs',
            'aria-haspopup': 'menu',
            'aria-expanded': 'false',
            'aria-controls': '@extern(menu:*:content)',
            'data-state': 'closed',
            // 在 tablist 之外、自占一个 Tab 位：不写 tabindex、不对读屏隐藏
            'tabindex': null,
            'aria-hidden': null,
            'data-orientation': 'horizontal',
            // 与翻页钮同一身份：Action Control icon 档、ghost 形态，档位随标签页 size 走
            'data-xh-action-control': '',
            'data-xh-action-profile': 'icon',
            'data-xh-action-variant': 'ghost',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'md',
          },
          'next-trigger': { hidden: null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '下拉条目归 menu 的 scope，不进标签页的快照；Web Components 的条目由元素在量完之后的那一轮接线里自建',
          run: async ({ doc, flush }) => {
            await settled(doc, flush, () => overflowMenuItem(doc, 'two') != null)
            const two = overflowMenuItem(doc, 'two')
            const three = overflowMenuItem(doc, 'three')
            if (!two || !three || overflowMenuItem(doc, 'one'))
              throw new Error('「更多」下拉里应当恰好是可见区外的 two 与 three')
            if (two.textContent?.trim() !== '标签 two' || two.getAttribute('role') !== 'menuitem')
              throw new Error('下拉项取标签的文字、角色是 menuitem')
          },
        },
      ],
    },
    {
      name: '「更多」钮不是方向键走位的一站：End 落到末个标签，尽头回绕到首个标签，钮保持自己的 Tab 位',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tabs.kbd.overflow-stop', 'tabs.kbd.last', 'tabs.kbd.next'],
      fixture: withOverflowTrigger,
      environment: tabStrip(200),
      props: { defaultValue: 'one' },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'End',
          expect: {
            activeElement: { part: 'trigger[2]', exact: true },
            parts: { 'overflow-trigger': { 'tabindex': null, 'aria-hidden': null } },
          },
        },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'trigger[0]', exact: true } } },
      ],
    },
    {
      name: '「更多」钮展开下拉、Escape 收起并把焦点还给钮；下拉里选中一项即选中那个标签，焦点回到钮上',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tabs.kbd.overflow-open', 'tabs.kbd.overflow-close'],
      fixture: withOverflowTrigger,
      environment: tabStrip(200),
      props: { defaultValue: 'one' },
      steps: [
        // 钮在量完之后露面，下拉的条目随之建好；没有条目时菜单受控关着，展开不了
        { kind: 'settle', until: { attr: { part: 'overflow-trigger', name: 'hidden', value: null } } },
        { kind: 'focus', part: 'overflow-trigger' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { parts: { 'overflow-trigger': { 'aria-expanded': 'true', 'data-state': 'open' } }, events: [] },
        },
        {
          kind: 'raw',
          why: '焦点落进了 menu 的 scope，标签页的快照里看不到它',
          run: async ({ doc, flush }) => {
            if (!await focusSettled(doc, flush, () => overflowMenuItem(doc, 'two')))
              throw new Error('ArrowDown 展开后焦点应落在下拉首项 two 上')
          },
        },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { 'overflow-trigger': { 'aria-expanded': 'false', 'data-state': 'closed' } },
            activeElement: { part: 'overflow-trigger', exact: true },
            events: [],
          },
        },
        {
          kind: 'raw',
          why: '下拉条目归 menu 的 scope，选中那一下要在它身上按键',
          run: async ({ doc, flush }) => {
            const trigger = doc.querySelector<HTMLElement>('[data-scope="tabs"][data-part="overflow-trigger"]')!
            await menuExited(doc, flush)
            trigger.focus()
            trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }))
            if (!await focusSettled(doc, flush, () => overflowMenuItem(doc, 'three')))
              throw new Error('ArrowUp 展开后焦点应落在下拉末项 three 上')
            overflowMenuItem(doc, 'three')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
            await flush()
            if (trigger.getAttribute('aria-expanded') !== 'false')
              throw new Error('选中后下拉应收起')
            // 收起后焦点回到钮上，下一条断言在它落定之后读
            await focusSettled(doc, flush, () => trigger)
          },
          expect: {
            parts: { 'trigger[0]': { 'aria-selected': 'false' }, 'trigger[2]': { 'aria-selected': 'true' }, 'content[2]': { hidden: null } },
            events: [{ type: 'value-change', detail: { value: 'three' } }],
            activeElement: { part: 'overflow-trigger', exact: true },
          },
        },
      ],
    },
  ],
}
