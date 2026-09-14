import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { toggleGroupAnatomy, toggleGroupKeyboard } from '@xihan-ui/headless'
import { nativeActivation, singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'

/** 三个条目全部放开：默认 fixture 的中间那个禁用，左右键各走哪边就分不出来了。 */
function allEnabled(base: FixtureNode): FixtureNode {
  return {
    ...base,
    children: base.children?.map(node =>
      node.part === 'item' && node.attrs?.value === 'center' ? { ...node, attrs: { value: 'center' } } : node,
    ),
  }
}

// 条目是原生 <button>：Enter/Space 的激活由平台负责，组件不自己实现这一路。
// 中间那个用 disabled 声明禁用（WC 侧的 conformance 会改写成 aria-disabled），
// 导航时被跳过，但仍可聚焦、仍能当方向键起点。
export const toggleGroupSuite: ConformanceSuite = {
  component: 'toggle-group',
  anatomy: toggleGroupAnatomy,
  keyboard: toggleGroupKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'item', tag: 'button', attrs: { value: 'left' }, text: '左对齐' },
      { part: 'item', tag: 'button', attrs: { value: 'center', disabled: '' }, text: '居中' },
      { part: 'item', tag: 'button', attrs: { value: 'right' }, text: '右对齐' },
    ],
  },
  cases: [
    {
      // 整组只占一个 Tab 位；无锚点时须由容器兜底
      name: 'roving tabindex：整组只有一个 Tab 停靠点，无选中时容器兜底',
      spec: { apg: APG },
      covers: ['toggle-group.kbd.tab'],
      steps: [singleTabStop('toggle-group', 'item', 'root')],
    },
    {
      name: '单选默认：root=radiogroup，条目 role=radio 且 aria-checked 显式 false',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/#roles_states_properties' },
      initial: {
        order: ['root', 'item[0]', 'item[1]', 'item[2]'],
        counts: { root: 1, item: 3 },
        parts: {
          root: {
            'role': 'radiogroup',
            'aria-orientation': 'horizontal',
            'data-orientation': 'horizontal',
            'data-disabled': null,
            'tabindex': '0',
          },
          item: [
            {
              'type': 'button',
              'role': 'radio',
              'aria-checked': 'false',
              // 单选模式绝不出现 aria-pressed：radiogroup 里的按下态是自相矛盾的
              'aria-pressed': null,
              'aria-disabled': 'false',
              'data-value': 'left',
              'data-state': 'off',
              'data-disabled': null,
              'tabindex': '-1',
              // 集合条目绝不输出原生 disabled
              'disabled': null,
            },
            {
              'role': 'radio',
              'aria-checked': 'false',
              'aria-disabled': 'true',
              'data-value': 'center',
              'data-state': 'off',
              'data-disabled': '',
              'tabindex': '-1',
              'disabled': null,
            },
            {
              'role': 'radio',
              'aria-checked': 'false',
              'aria-disabled': 'false',
              'data-value': 'right',
              'tabindex': '-1',
              'disabled': null,
            },
          ],
        },
        activeElement: null,
      },
    },
    {
      name: '单选点击：aria-checked 翻真、锚点随焦点迁移，回调给单值不是数组',
      spec: { apg: APG },
      steps: [
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: {
              root: { tabindex: '-1' },
              item: [
                { 'aria-checked': 'true', 'data-state': 'on', 'tabindex': '0' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
                { 'aria-checked': 'false', 'tabindex': '-1' },
              ],
            },
            activeElement: { part: 'item[0]', exact: true },
            // 单选给裸值：给 ['left'] 会把作者绑的字符串变量改成数组
            events: [{ type: 'value-change', detail: { value: 'left' } }],
          },
        },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false', 'data-state': 'off', 'tabindex': '-1' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true', 'data-state': 'on', 'tabindex': '0' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: 'right' } }],
          },
        },
      ],
    },
    {
      name: '单选再点同一项即取消，回调给 null',
      spec: { apg: APG },
      props: { defaultValue: 'left' },
      steps: [
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: { item: [{ 'aria-checked': 'false', 'data-state': 'off' }] },
            events: [{ type: 'value-change', detail: { value: null } }],
          },
        },
      ],
    },
    {
      name: 'disallowEmpty：最后一个选中项点不掉，也不发回调',
      spec: { apg: APG },
      props: { defaultValue: 'left', disallowEmpty: true },
      steps: [
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: { item: [{ 'aria-checked': 'true', 'data-state': 'on' }] },
            events: [],
          },
        },
        // 拦的是"清空"不是"改动"：换一项照样换得动
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: 'right' } }],
          },
        },
      ],
    },
    {
      name: '多选：root=group、条目退回原生按钮 + aria-pressed，两套 ARIA 不混用',
      spec: { apg: APG },
      props: { multiple: true },
      initial: {
        parts: {
          root: {
            'role': 'group',
            // role=group 不收 aria-orientation（不在它的支持列表里），排布信息只走 data-*
            'aria-orientation': null,
            'data-orientation': 'horizontal',
          },
          item: [
            { 'type': 'button', 'role': null, 'aria-pressed': 'false', 'aria-checked': null, 'aria-disabled': 'false' },
            { 'role': null, 'aria-pressed': 'false', 'aria-checked': null, 'aria-disabled': 'true' },
            { 'role': null, 'aria-pressed': 'false', 'aria-checked': null },
          ],
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: { item: [{ 'aria-pressed': 'true', 'data-state': 'on' }] },
            events: [{ type: 'value-change', detail: { value: ['left'] } }],
          },
        },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              item: [
                { 'aria-pressed': 'true' },
                { 'aria-pressed': 'false' },
                { 'aria-pressed': 'true' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: ['left', 'right'] } }],
          },
        },
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: { item: [{ 'aria-pressed': 'false' }, { 'aria-pressed': 'false' }, { 'aria-pressed': 'true' }] },
            events: [{ type: 'value-change', detail: { value: ['right'] } }],
          },
        },
      ],
    },
    {
      name: '多选有多项选中时锚点取第一个：Tab 位仍只有一个',
      spec: { apg: APG },
      props: { multiple: true, defaultValue: ['left', 'right'] },
      initial: {
        parts: {
          // 容器的 tabindex 只看焦点在不在组内：没有条目认领 0 时由容器兜底
          root: { tabindex: '0' },
          item: [
            { 'aria-pressed': 'true', 'tabindex': '0' },
            { 'aria-pressed': 'false', 'tabindex': '-1' },
            // 后选中的那个不再占 Tab 位
            { 'aria-pressed': 'true', 'tabindex': '-1' },
          ],
        },
      },
    },
    {
      name: '方向键四个都走：跳过禁用条目、尽头回绕，且只搬焦点不改选中',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['toggle-group.kbd.next', 'toggle-group.kbd.prev'],
      props: { defaultValue: 'left' },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true', 'tabindex': '-1' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false', 'tabindex': '0' },
              ],
            },
            activeElement: { part: 'item[2]', exact: true },
            // 路过不改值
            events: [],
          },
        },
        // 尽头回绕
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
        // 横排组里上下键同样要走：orientation 只描述视觉排布
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: { activeElement: { part: 'item[2]', exact: true }, events: [] },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { activeElement: { part: 'item[2]', exact: true }, events: [] },
        },
      ],
    },
    {
      name: 'Home / End 到端点，禁用条目不当端点',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['toggle-group.kbd.first', 'toggle-group.kbd.last'],
      steps: [
        { kind: 'focus', part: 'item[0]' },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'item[2]', exact: true }, events: [] } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'item[0]', exact: true }, events: [] } },
      ],
    },
    {
      name: 'Enter / Space 靠原生按钮的激活行为，条目必须是 <button type="button">',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction' },
      covers: ['toggle-group.kbd.toggle'],
      steps: [nativeActivation('toggle-group', 'item')],
    },
    {
      name: '不归导航管的键一律放行：容器不吞 Space，页面滚动与读屏才不受影响',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'raw',
          why: '归一化快照没有 defaultPrevented 通道，只能直接看事件对象',
          run: ({ doc }) => {
            const item = doc.querySelector<HTMLElement>('[data-scope="toggle-group"][data-part="item"]')!
            const e = new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true })
            item.dispatchEvent(e)
            if (e.defaultPrevented)
              throw new Error('容器把 Space 吞掉了：页面滚动会跟着一起没')
          },
        },
      ],
    },
    {
      name: '禁用条目：点不动，但焦点落得上去、仍是方向键的起点',
      spec: { apg: `${APG}#roles_states_properties` },
      steps: [
        {
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false' },
                { 'aria-checked': 'false', 'aria-disabled': 'true', 'data-state': 'off', 'tabindex': '0' },
                { 'aria-checked': 'false' },
              ],
            },
            activeElement: { part: 'item[1]', exact: true },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: 'item[2]', exact: true }, events: [] },
        },
      ],
    },
    {
      name: '整组 disabled：条目全部 aria-disabled，点击与方向键都不改选中',
      spec: { apg: APG },
      props: { disabled: true },
      steps: [
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: {
              root: { 'data-disabled': '' },
              item: [
                { 'aria-checked': 'false', 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null },
                { 'aria-checked': 'false', 'aria-disabled': 'true', 'data-disabled': '' },
                { 'aria-checked': 'false', 'aria-disabled': 'true', 'data-disabled': '' },
              ],
            },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
      ],
    },
    {
      name: '焦点从组外落到容器：转投锚点条目，兑现 tabindex=0 的承诺',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { defaultValue: 'right' },
      steps: [
        {
          kind: 'focus',
          part: 'root',
          expect: {
            parts: {
              root: { tabindex: '-1' },
              item: [{ tabindex: '-1' }, { tabindex: '-1' }, { 'aria-checked': 'true', 'tabindex': '0' }],
            },
            activeElement: { part: 'item[2]', exact: true },
            events: [],
          },
        },
      ],
    },
    {
      name: 'orientation=vertical：aria-orientation 跟着变，四个方向键照走',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { orientation: 'vertical' },
      initial: {
        parts: { root: { 'aria-orientation': 'vertical', 'data-orientation': 'vertical' } },
      },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        // 竖排组里左右键同样要走
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[2]', exact: true } } },
      ],
    },
    {
      name: 'dir=rtl：左右键语义对调，上下键不受影响',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['toggle-group.kbd.next', 'toggle-group.kbd.prev'],
      fixture: allEnabled,
      props: { dir: 'rtl' },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'item[1]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[0]', exact: true } } },
        // 竖轴不参与 rtl：ArrowDown 仍是下一项
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[1]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'item[0]', exact: true } } },
      ],
    },
    {
      name: '受控 value：点击只发意图不自改 DOM，父写回后才切选中',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: 'left' },
      steps: [
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'true', 'data-state': 'on', 'tabindex': '-1' },
                { 'aria-checked': 'false' },
                // 焦点锚点已迁到 item[2]，但选中值仍由父持有
                { 'aria-checked': 'false', 'data-state': 'off', 'tabindex': '0' },
              ],
            },
            events: [{ type: 'value-change', detail: { value: 'right' } }],
          },
        },
        { kind: 'setProps', props: { value: 'right' } },
        {
          kind: 'settle',
          until: { attr: { part: 'item[2]', name: 'aria-checked', value: 'true' } },
          expect: {
            parts: {
              item: [
                { 'aria-checked': 'false', 'data-state': 'off' },
                { 'aria-checked': 'false' },
                { 'aria-checked': 'true', 'data-state': 'on' },
              ],
            },
          },
        },
      ],
    },
  ],
}
