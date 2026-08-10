import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { tabsAnatomy, tabsKeyboard } from '@xihan-ui/headless'
import { singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/'

const VALUES = ['one', 'two', 'three'] as const

/**
 * 三个 trigger + 三个 content：panel 全部常挂，靠 hidden 显隐。
 * disabled 落在哪个条目由用例指定；禁用条目仍在 DOM 与集合里，只是方向键跳过它。
 */
function tabsTree(disabled?: string): FixtureNode {
  return {
    part: 'root',
    children: [
      {
        part: 'list',
        children: VALUES.map((v): FixtureNode => {
          const attrs: Record<string, string> = { value: v }
          if (v === disabled)
            attrs.disabled = ''
          return { part: 'trigger', tag: 'button', text: `标签 ${v}`, attrs }
        }),
      },
      ...VALUES.map(v => ({
        part: 'content',
        attrs: { value: v },
        children: [{ text: `面板 ${v}` }],
      })),
    ],
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
        order: ['root', 'list', 'trigger[0]', 'trigger[1]', 'trigger[2]', 'content[0]', 'content[1]', 'content[2]'],
        counts: { root: 1, list: 1, trigger: 3, content: 3 },
        parts: {
          'root': { 'data-orientation': 'horizontal' },
          'list': { 'role': 'tablist', 'aria-orientation': 'horizontal', 'tabindex': '0' },
          'trigger[0]': {
            'role': 'tab',
            'type': 'button',
            'aria-selected': 'false',
            'aria-disabled': 'false',
            'tabindex': '-1',
            'data-state': 'inactive',
            'data-value': 'one',
            'data-disabled': null,
          },
          'trigger[2]': { 'aria-selected': 'false', 'tabindex': '-1', 'data-value': 'three' },
          'content[0]': { 'role': 'tabpanel', 'tabindex': '0', 'hidden': '', 'data-state': 'inactive' },
          'content[2]': { 'hidden': '', 'data-state': 'inactive' },
        },
      },
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
          'trigger[0]': { 'aria-selected': 'false', 'tabindex': '-1', 'data-state': 'inactive' },
          'trigger[1]': { 'aria-selected': 'true', 'tabindex': '0', 'data-state': 'active' },
          'trigger[2]': { 'aria-selected': 'false', 'tabindex': '-1', 'data-state': 'inactive' },
          'content[0]': { 'hidden': '', 'data-state': 'inactive' },
          'content[1]': { 'hidden': null, 'data-state': 'active' },
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
  ],
}
