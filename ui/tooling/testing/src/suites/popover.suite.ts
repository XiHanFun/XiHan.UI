import type { ConformanceSuite, FixtureNode, RawStepContext, StepWithExpect } from '../conformance/types'
import { popoverAnatomy, popoverKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'
import { settled } from './shared/overflow-menu'
import { heldPress } from './shared/press-channel'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'

/** 外部锚点：组件之外的一颗按钮，用例在运行时造出来交给 anchor。 */
const EXTERNAL_ANCHOR = 'xh-popover-external-anchor'

function externalAnchor(doc: Document): HTMLElement {
  const el = doc.getElementById(EXTERNAL_ANCHOR)
  if (!el)
    throw new Error('外部锚点还没造出来')
  return el
}

/** 不写 trigger 的结构：锚点全交给 anchor。 */
function withoutTrigger(base: FixtureNode): FixtureNode {
  return { ...base, children: base.children?.filter(child => child.part !== 'trigger') }
}

/** 造出外部锚点并交给 anchor。 */
const mountExternalAnchor: StepWithExpect = {
  kind: 'raw',
  why: '外部锚点不是部件，只能在运行时造出来、经宿主交给 anchor',
  run: async ({ doc, setProps }: RawStepContext) => {
    const el = doc.createElement('button')
    el.id = EXTERNAL_ANCHOR
    el.type = 'button'
    el.textContent = '页面设置'
    doc.body.append(el)
    await setProps({ anchor: el })
  },
}

/** 断言外部锚点上的三条读屏属性；null 即该属性不在场。 */
function anchorAria(expected: { haspopup: string | null, expanded: string | null, controlsContent: boolean }): StepWithExpect {
  return {
    kind: 'raw',
    why: '外部锚点在组件之外，部件快照采不到它',
    run: ({ doc }: RawStepContext) => {
      const el = externalAnchor(doc)
      const content = doc.querySelector('[data-scope="popover"][data-part="content"]')
      const actual = {
        haspopup: el.getAttribute('aria-haspopup'),
        expanded: el.getAttribute('aria-expanded'),
        controls: el.getAttribute('aria-controls'),
      }
      const controls = expected.controlsContent ? (content?.id ?? '(content 没有 id)') : null
      if (actual.haspopup !== expected.haspopup || actual.expanded !== expected.expanded || actual.controls !== controls)
        throw new Error(`外部锚点的读屏属性不对：${JSON.stringify(actual)}`)
    },
  }
}

const removeExternalAnchor: StepWithExpect = {
  kind: 'raw',
  why: '外部锚点挂在文档上，用例结束时摘掉',
  run: ({ doc }: RawStepContext) => externalAnchor(doc).remove(),
}

// content 始终在 DOM，展开态靠 hidden 属性显隐，不卸载作者节点。
// 位置由引擎异步回填，快照不采集 style，因此这里只断言 data-placement 这类语义属性。
export const popoverSuite: ConformanceSuite = {
  component: 'popover',
  anatomy: popoverAnatomy,
  keyboard: popoverKeyboard,
  fixture: {
    children: [
      // 必须是 button：WC 侧由 fixture 的 tag 决定，div 不可聚焦
      { part: 'trigger', tag: 'button', text: '打开' },
      {
        part: 'positioner',
        children: [
          {
            part: 'content',
            children: [
              { part: 'arrow' },
              { part: 'title', text: '标题' },
              { part: 'description', text: '描述' },
              { tag: 'button', text: '确认', attrs: { 'data-testid': 'confirm' } },
              // 单图标钮照文档留空：字形由皮肤画，名字由 translations 给；塞进与缺省英文名字对不上的字就是 2.5.3 违规
              { part: 'close-trigger', tag: 'button' },
            ],
          },
        ],
      },
    ],
  },
  cases: [
    {
      // Enter / Space 由平台的按钮激活行为翻成 click，我们不自己接这两个键；
      // "click 后开合并把焦点移入 content"由本套件其它用例验
      name: 'Enter / Space 开合：trigger 是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['popover.kbd.toggle-on-trigger'],
      steps: [nativeActivation('popover', 'trigger')],
    },
    {
      name: '初始收起：trigger aria-expanded=false，content 带 hidden 属性',
      spec: { apg: APG },
      initial: {
        order: ['trigger', 'positioner', 'content', 'arrow', 'title', 'description', 'close-trigger'],
        counts: { trigger: 1, positioner: 1, content: 1, arrow: 1 },
        parts: {
          'trigger': {
            'type': 'button',
            'aria-haspopup': 'dialog',
            'aria-expanded': 'false',
            'aria-controls': '@part(content)',
            'data-state': 'closed',
            // 页面上的独立文字按钮：Action Control text 档 md，缺省中性描边
            'data-xh-action-control': '',
            'data-xh-action-profile': 'text',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'md',
            'data-xh-action-variant': 'outline',
            'data-pressed': null,
          },
          'content': {
            'role': 'dialog',
            'tabindex': '-1',
            'aria-modal': 'false',
            'hidden': '',
            'data-state': 'closed',
          },
          // 浮层角落的叉：Action Control icon 档 sm、ghost 面
          'close-trigger': {
            'type': 'button',
            'data-xh-action-control': '',
            'data-xh-action-profile': 'icon',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'sm',
            'data-xh-action-variant': 'ghost',
            'data-pressed': null,
          },
          'positioner': {
            'data-state': 'closed',
            'data-placement': 'bottom',
          },
        },
      },
    },
    {
      name: '点击 trigger 展开：content 去掉 hidden，四处 ARIA 互指，派发 open-change',
      spec: { apg: `${APG}#roles_states_properties` },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              trigger: {
                'aria-expanded': 'true',
                'aria-controls': '@part(content)',
                'data-state': 'open',
              },
              content: {
                'role': 'dialog',
                'hidden': null,
                'data-state': 'open',
                'aria-labelledby': '@part(title)',
                'aria-describedby': '@part(description)',
              },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: 'disabled：触发器转原生 disabled，点了不展开也不派 open-change',
      spec: { adr: 'popover-disabled' },
      props: { disabled: true },
      initial: { parts: { trigger: { 'disabled': '', 'data-disabled': '', 'aria-expanded': 'false' } } },
      steps: [
        dispatchClickOnDisabled('popover', 'trigger', {
          parts: { trigger: { 'aria-expanded': 'false' }, content: { hidden: '' } },
          events: [],
        }),
      ],
    },
    {
      name: 'defaultOpen 展开途中转为禁用：收起并派发 open-change',
      spec: { adr: 'popover-disabled' },
      props: { defaultOpen: true },
      steps: [
        { kind: 'setProps', props: { defaultOpen: true, disabled: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: { parts: { trigger: { 'aria-expanded': 'false', 'disabled': '' } } },
        },
      ],
    },
    {
      name: '展开后焦点进入 content（落在内部首个可聚焦元素）',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'content' },
          expect: { activeElement: { part: 'content', exact: false } },
        },
      ],
    },
    {
      name: 'Escape 关闭：content 复位 hidden 且焦点归还 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['popover.kbd.escape'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' } },
        { kind: 'key', key: 'Escape' },
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
      name: '点击 close-trigger 关闭：content 复位 hidden，trigger 归位',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        { kind: 'click', part: 'trigger' },
        // 等到焦点真进了 content 再点关闭。只等 hidden 消失是不够的——
        // 那一帧焦点可能还没搬进去，后面的「归位」就成了从没离开过的假阳性
        { kind: 'settle', until: { activeElement: 'content' } },
        { kind: 'click', part: 'close-trigger' },
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
        // 用例名承诺「trigger 归位」，就得真断言焦点回没回去
        {
          kind: 'settle',
          until: { activeElement: 'trigger' },
          expect: { activeElement: 'trigger' },
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
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { 'data-state': 'open', 'hidden': null },
            },
          },
        },
      ],
    },
    {
      name: 'anchor：外部锚点顶替 trigger，展开期间带 aria-haspopup / aria-expanded / aria-controls，Escape 收起后还原并把焦点还给它',
      spec: { apg: `${APG}#keyboardinteraction`, adr: 'popover-anchor' },
      fixture: withoutTrigger,
      // 先写上 anchor：元素要等挂载后才造得出来，写了 anchor 就不再找 trigger 取视觉环境
      props: { open: false, anchor: null },
      steps: [
        mountExternalAnchor,
        anchorAria({ haspopup: null, expanded: null, controlsContent: false }),
        { kind: 'setProps', props: { open: true } },
        { kind: 'settle', until: { activeElement: 'content' } },
        anchorAria({ haspopup: 'dialog', expanded: 'true', controlsContent: true }),
        // 受控：Escape 只发收起意图，宿主写回才收
        { kind: 'key', key: 'Escape', expect: { events: [{ type: 'open-change', detail: { open: false, reason: 'esc' } }] } },
        { kind: 'setProps', props: { open: false } },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: '' } } },
        anchorAria({ haspopup: null, expanded: null, controlsContent: false }),
        {
          kind: 'raw',
          why: '焦点归还的落点是组件之外的外部锚点，settle 只认部件',
          run: async ({ doc, flush }) => {
            const anchor = externalAnchor(doc)
            if (!await settled(doc, flush, () => doc.activeElement === anchor))
              throw new Error(`焦点没有归还外部锚点，落在 ${doc.activeElement?.tagName ?? 'null'}`)
          },
        },
        removeExternalAnchor,
      ],
    },
    {
      name: 'anchor：点外部锚点算层内交互，不发收起意图——开合交给打开它的那条命令',
      spec: { adr: 'popover-anchor' },
      fixture: withoutTrigger,
      props: { open: true, anchor: null },
      steps: [
        mountExternalAnchor,
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        {
          kind: 'raw',
          why: '外部锚点不是部件，click 步骤够不着它',
          run: async ({ doc, flush }) => {
            const anchor = externalAnchor(doc)
            anchor.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
            anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
            await flush()
          },
          expect: { events: [], parts: { content: { hidden: null } } },
        },
        // 对照：层外的点击照常发收起意图
        { kind: 'outside', action: 'click', expect: { events: [{ type: 'open-change', detail: { open: false, reason: 'interact-outside' } }] } },
        removeExternalAnchor,
      ],
    },
    {
      name: 'Space / Enter 按住与触屏按下：触发器与关闭钮各自投影 data-pressed，抬起、失焦或指针取消撤下',
      spec: { adr: 'press-channel' },
      covers: ['popover.kbd.press'],
      props: { defaultOpen: true },
      steps: [heldPress('popover', 'trigger'), heldPress('popover', 'close-trigger')],
    },
  ],
}
