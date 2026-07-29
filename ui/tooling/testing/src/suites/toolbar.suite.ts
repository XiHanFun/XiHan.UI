import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { toolbarAnatomy, toolbarKeyboard } from '@xihan-ui/headless'
import { singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'
const KBD = `${APG}#keyboardinteraction`
const ARIA = `${APG}#roles_states_properties`

// 两种禁用声明都要摘：WC 侧 conformance 会先把 fixture 里的 disabled 改写成 aria-disabled，
// 只摘 disabled 的话，改写过的那条会原样留下。
function stripDisabled(node: FixtureNode): FixtureNode {
  const attrs = node.attrs ? { ...node.attrs } : undefined
  if (attrs) {
    delete attrs.disabled
    delete attrs['aria-disabled']
  }
  return { ...node, attrs, children: node.children?.map(stripDisabled) }
}

/** 条目全部放开：默认 fixture 的第二个禁用，条目一被跳过，左右各走哪边就分不出来了。 */
function allEnabled(base: FixtureNode): FixtureNode {
  return stripDisabled(base)
}

/**
 * 工具条只管导航与 ARIA：条目是原生 `<button>`，它们各自的激活行为归自己，
 * 因此这里没有"按 Enter 会怎样"的用例——那不是工具条承诺的事。
 *
 * fixture 刻意把四个条目摆成"两个裸条目 + 一条分隔线 + 一个分组里两个条目"：
 * 导航必须跨过分隔线、穿进分组，Home/End 也不能把端点算到分隔线头上。
 * 第二个条目用 disabled 声明禁用（WC 侧的 conformance 会改写成 aria-disabled），
 * 导航时被跳过，但仍可聚焦、仍能当方向键起点。
 */
export const toolbarSuite: ConformanceSuite = {
  component: 'toolbar',
  anatomy: toolbarAnatomy,
  keyboard: toolbarKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'item', tag: 'button', attrs: { value: 'bold' }, text: '粗体' },
      { part: 'item', tag: 'button', attrs: { value: 'italic', disabled: '' }, text: '斜体' },
      { part: 'separator' },
      {
        part: 'group',
        children: [
          { part: 'item', tag: 'button', attrs: { value: 'left' }, text: '左对齐' },
          { part: 'item', tag: 'button', attrs: { value: 'right' }, text: '右对齐' },
        ],
      },
    ],
  },
  cases: [
    {
      // 整组只占一个 Tab 位；无锚点时须由容器兜底
      name: 'roving tabindex：整条只占一个 Tab 位，无锚点时容器兜底',
      spec: { apg: APG },
      covers: ['toolbar.kbd.tab'],
      steps: [singleTabStop('toolbar', 'item', 'root')],
    },
    {
      name: 'ARIA 骨架：root=toolbar 带朝向，group=group 不带朝向，separator 与主轴垂直',
      spec: { apg: ARIA },
      initial: {
        order: ['root', 'item[0]', 'item[1]', 'separator', 'group', 'item[2]', 'item[3]'],
        counts: { root: 1, item: 4, separator: 1, group: 1 },
        parts: {
          root: {
            'role': 'toolbar',
            'aria-orientation': 'horizontal',
            // 显式 false 是"明确说了没禁用"，省略只是"没说"
            'aria-disabled': 'false',
            'data-orientation': 'horizontal',
            'data-disabled': null,
            'tabindex': '0',
          },
          group: {
            // role=group 不收 aria-orientation（不在它的支持列表里），给了就是无效 ARIA
            'role': 'group',
            'aria-orientation': null,
            'data-orientation': 'horizontal',
            // 分组不是可停留点，绝不占 Tab 位
            'tabindex': null,
          },
          separator: {
            'role': 'separator',
            // 横排工具条里的分隔线是竖线
            'aria-orientation': 'vertical',
            'data-orientation': 'vertical',
            // 分隔线既不入导航也不进 Tab 序列，更不该带身份标记
            'tabindex': null,
            'data-value': null,
          },
          item: [
            {
              // 工具条绝不覆盖条目的角色：条目是按钮/切换钮/下拉触发器，语义归它自己
              'role': null,
              'aria-disabled': 'false',
              'data-value': 'bold',
              'data-disabled': null,
              'tabindex': '-1',
              // 集合条目绝不输出原生 disabled
              'disabled': null,
            },
            {
              'role': null,
              'aria-disabled': 'true',
              'data-value': 'italic',
              'data-disabled': '',
              // 禁用条目照样留在导航里，只是没被锚点选中
              'tabindex': '-1',
              'disabled': null,
            },
            { 'aria-disabled': 'false', 'data-value': 'left', 'tabindex': '-1', 'disabled': null },
            { 'aria-disabled': 'false', 'data-value': 'right', 'tabindex': '-1', 'disabled': null },
          ],
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '横排方向键走左右：跳过禁用条目、跨过分隔线走进分组、尽头回绕',
      spec: { apg: KBD },
      covers: ['toolbar.kbd.next', 'toolbar.kbd.prev'],
      steps: [
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: {
              root: { tabindex: '-1' },
              item: [
                { tabindex: '-1' },
                // 禁用的 italic 被跳过
                { tabindex: '-1' },
                { tabindex: '0' },
                { tabindex: '-1' },
              ],
            },
            activeElement: { part: 'item[2]', exact: true },
            // 工具条自己不派任何对外事件：条目要说什么由条目自己说
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: 'item[3]', exact: true }, events: [] },
        },
        // 尽头回绕：从分组内的末项绕回分组外的首项
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
        // 往回走同样跨结构、同样跳过禁用项
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { activeElement: { part: 'item[3]', exact: true }, events: [] },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { activeElement: { part: 'item[2]', exact: true }, events: [] },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
      ],
    },
    {
      name: '横排里的上下键不归工具条管：原样放行给页面滚动与读屏',
      spec: { apg: KBD },
      covers: ['toolbar.kbd.cross-axis'],
      steps: [
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'raw',
          why: '归一化快照没有 defaultPrevented 通道，只能直接看事件对象',
          run: ({ doc }) => {
            const item = doc.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="item"]')!
            for (const key of ['ArrowDown', 'ArrowUp']) {
              const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
              item.dispatchEvent(e)
              if (e.defaultPrevented)
                throw new Error(`横排工具条把 ${key} 吞掉了：页面滚动会跟着一起没`)
            }
          },
          // 交叉轴的键连焦点都不该动
          expect: { activeElement: { part: 'item[0]', exact: true } },
        },
      ],
    },
    {
      name: 'Home / End 到端点：禁用条目不当端点，分隔线与分组更不算',
      spec: { apg: KBD },
      covers: ['toolbar.kbd.first', 'toolbar.kbd.last'],
      steps: [
        { kind: 'focus', part: 'item[2]' },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'item[3]', exact: true }, events: [] } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'item[0]', exact: true }, events: [] } },
      ],
    },
    {
      name: 'orientation=vertical：朝向翻面，分隔线跟着转横，方向键换到上下',
      spec: { apg: KBD },
      covers: ['toolbar.kbd.next', 'toolbar.kbd.prev', 'toolbar.kbd.cross-axis'],
      props: { orientation: 'vertical' },
      initial: {
        parts: {
          root: { 'aria-orientation': 'vertical', 'data-orientation': 'vertical' },
          group: { 'data-orientation': 'vertical' },
          // 竖排工具条里的分隔线是横线
          separator: { 'aria-orientation': 'horizontal', 'data-orientation': 'horizontal' },
        },
      },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[2]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'item[0]', exact: true } } },
        // 竖排里的左右键换成了交叉轴，焦点一步都不动
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[0]', exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'item[0]', exact: true } } },
      ],
    },
    {
      name: 'dir=rtl：水平主轴上左右键语义对调',
      spec: { apg: KBD },
      covers: ['toolbar.kbd.next', 'toolbar.kbd.prev'],
      fixture: allEnabled,
      props: { dir: 'rtl' },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'item[1]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[0]', exact: true } } },
      ],
    },
    {
      name: 'loop=false：撞到尽头停在原地，不回绕',
      spec: { apg: KBD },
      props: { loop: false },
      steps: [
        { kind: 'focus', part: 'item[3]' },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[3]', exact: true } } },
        { kind: 'focus', part: 'item[0]' },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'item[0]', exact: true } } },
      ],
    },
    {
      name: '禁用条目：焦点落得上去，还能当方向键的起点',
      spec: { apg: ARIA },
      steps: [
        {
          kind: 'focus',
          part: 'item[1]',
          expect: {
            parts: {
              root: { tabindex: '-1' },
              // 禁用条目照样认领锚点与 Tab 位
              item: [{ tabindex: '-1' }, { 'aria-disabled': 'true', 'tabindex': '0' }, { tabindex: '-1' }],
            },
            activeElement: { part: 'item[1]', exact: true },
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: 'item[2]', exact: true } },
        },
      ],
    },
    {
      name: '整条 disabled：条目全部 aria-disabled，方向键不再接管',
      spec: { apg: ARIA },
      props: { disabled: true },
      initial: {
        parts: {
          root: { 'aria-disabled': 'true', 'data-disabled': '' },
          group: { 'data-disabled': '' },
          item: [
            { 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null },
            { 'aria-disabled': 'true', 'data-disabled': '' },
            { 'aria-disabled': 'true', 'data-disabled': '' },
            { 'aria-disabled': 'true', 'data-disabled': '' },
          ],
        },
      },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
      ],
    },
    {
      name: '焦点从条外落到容器：转投第一个可停留条目，兑现 tabindex=0 的承诺',
      spec: { apg: KBD },
      steps: [
        {
          kind: 'focus',
          part: 'root',
          expect: {
            parts: {
              root: { tabindex: '-1' },
              item: [{ tabindex: '0' }, { tabindex: '-1' }, { tabindex: '-1' }, { tabindex: '-1' }],
            },
            activeElement: { part: 'item[0]', exact: true },
            events: [],
          },
        },
      ],
    },
  ],
}
