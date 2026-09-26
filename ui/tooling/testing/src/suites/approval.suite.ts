import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { approvalAnatomy, approvalKeyboard } from '@xihan-ui/headless'
import { heldPress, heldPressIgnored } from './shared/press-channel'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/'

const ROOT = '[data-scope="approval"][data-part="root"]'

function scope(value: string, label: string, required?: boolean, disabled?: boolean): FixtureNode {
  const attrs: Record<string, string> = { 'scope-value': value, 'scope-label': label }
  if (required)
    attrs['scope-required'] = ''
  if (disabled)
    attrs['scope-disabled'] = ''
  return {
    part: 'item',
    attrs,
    children: [
      { part: 'item-indicator', attrs: { 'scope-value': value } },
      { part: 'item-text', attrs: { 'scope-value': value }, text: label },
    ],
  }
}

/** 授权项自身的禁用写在作者节点的 scope-disabled 上：把 write 那一项换成禁用的。 */
function withDisabledWrite(base: FixtureNode): FixtureNode {
  return {
    ...base,
    children: base.children?.map(node => (node.part === 'group'
      ? { ...node, children: [scope('read', '读文件'), scope('write', '写文件', false, true)] }
      : node)),
  }
}

/** 授权项的身份写在作者自己的节点上；两侧同一套 scope-* 属性。 */
export const approvalSuite: ConformanceSuite = {
  component: 'approval',
  anatomy: approvalAnatomy,
  keyboard: approvalKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'status-indicator', tag: 'span' },
      { part: 'title', tag: 'h3', text: '要写文件' },
      { part: 'description', tag: 'p', text: '它想改 src/index.ts。' },
      { part: 'live-region' },
      {
        part: 'group',
        children: [scope('read', '读文件', true), scope('write', '写文件')],
      },
      { part: 'timer' },
      { part: 'approve-trigger', tag: 'button', text: '批准' },
      { part: 'deny-trigger', tag: 'button', text: '拒绝' },
    ],
  },
  cases: [
    {
      name: '默认：待决，必选项没勾满时批不了，但拒绝随时可按',
      spec: { apg: APG },
      props: { scopes: [{ value: 'read', required: true }, { value: 'write' }] },
      initial: {
        counts: { 'root': 1, 'approve-trigger': 1, 'deny-trigger': 1, 'item': 2 },
        parts: {
          'root': { 'role': 'group', 'data-state': 'pending', 'data-loading': null },
          // 待决时的呼吸点：装饰，对读屏隐藏
          'status-indicator': { 'aria-hidden': 'true', 'data-state': 'pending', 'hidden': null },
          // 待决时用 aria-disabled 而不是原生 disabled：保住可聚焦、让读屏念得到为什么按不动；
          // 两颗钮接 Action Control text 档（批准 solid / 拒绝 outline），没勾满那档只在批准上投 data-disabled
          'approve-trigger': {
            'type': 'button',
            'aria-disabled': 'true',
            'disabled': null,
            'data-disabled': '',
            'data-xh-action-control': '',
            'data-xh-action-profile': 'text',
            'data-xh-action-variant': 'solid',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'md',
            'data-tone': null,
          },
          'deny-trigger': {
            'type': 'button',
            'disabled': null,
            'data-disabled': null,
            'data-xh-action-control': '',
            'data-xh-action-profile': 'text',
            'data-xh-action-variant': 'outline',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'md',
            'data-tone': null,
          },
          // 授权行接 Action Control row 档：ghost 形态、按下只换面
          'item': [
            { 'role': 'checkbox', 'aria-checked': 'false', 'aria-required': 'true', 'tabindex': '0', 'data-xh-action-control': '', 'data-xh-action-profile': 'row', 'data-xh-action-variant': 'ghost', 'data-xh-action-display': 'always', 'data-xh-action-size': 'md' },
            { 'role': 'checkbox', 'aria-checked': 'false', 'aria-required': 'false', 'tabindex': '0' },
          ],
          // 逐秒变化的数字进活区会不停打断
          'timer': { 'aria-hidden': 'true' },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '形态档落到根上：三档由皮肤按 data-variant 选，连接层只如实转述',
      spec: { apg: APG },
      props: { variant: 'ghost' },
      initial: {
        parts: {
          root: { 'data-variant': 'ghost' },
        },
      },
    },
    {
      // 家族的深色 solid 规则只看触发器自身的 data-tone：语气除了落在根上染描边，
      // 还与 Button 同构地投在批准钮自己身上，暗色下实心面才不会落回品牌色；描边形态的拒绝钮不吃这条
      name: '语气落到根与批准钮上：根染描边、批准钮实心面随语气，拒绝钮不投',
      spec: { apg: APG },
      props: { tone: 'danger' },
      initial: {
        parts: {
          'root': { 'data-tone': 'danger' },
          'approve-trigger': { 'data-tone': 'danger' },
          'deny-trigger': { 'data-tone': null },
        },
      },
    },
    {
      name: '勾满必选项之后才批得动，判定载荷带着批的是哪几项',
      spec: { apg: APG },
      covers: ['approval.kbd.scope-toggle', 'approval.kbd.approve'],
      props: { scopes: [{ value: 'read', required: true }, { value: 'write' }] },
      steps: [
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: {
              'item': [{ 'aria-checked': 'true' }, { 'aria-checked': 'false' }],
              'approve-trigger': { 'aria-disabled': 'false', 'data-disabled': null },
            },
            events: [{ type: 'granted-scopes-change', detail: { value: ['read'] } }],
          },
        },
        {
          kind: 'click',
          part: 'approve-trigger',
          expect: {
            // 判过即收起呼吸点
            parts: { 'root': { 'data-state': 'approved' }, 'status-indicator': { 'data-state': 'approved', 'hidden': '' } },
            events: [{ type: 'decision', detail: { decision: 'approved', source: 'user', scopes: ['read'] } }],
          },
        },
      ],
    },
    {
      name: '授权项只认 Space，Enter 刻意不参与——与原生复选框一致',
      spec: { apg: APG },
      covers: ['approval.kbd.scope-toggle'],
      props: { scopes: [{ value: 'read' }] },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        { kind: 'key', key: 'Enter', expect: { events: [] } },
        {
          kind: 'key',
          key: ' ',
          expect: { events: [{ type: 'granted-scopes-change', detail: { value: ['read'] } }] },
        },
      ],
    },
    {
      name: '拒绝不吃必选项那道闸门：一项都没勾，照样按得动',
      spec: { apg: APG },
      covers: ['approval.kbd.deny'],
      props: { scopes: [{ value: 'read', required: true }] },
      initial: {
        parts: {
          'approve-trigger': { 'aria-disabled': 'true' },
          'deny-trigger': { 'aria-disabled': 'false', 'disabled': null },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'deny-trigger',
          expect: {
            parts: { root: { 'data-state': 'denied' } },
            events: [{ type: 'decision', detail: { decision: 'denied', source: 'user', scopes: [] } }],
          },
        },
      ],
    },
    {
      // 一条判定已经在途、状态机还在等宿主回话，这段空窗里再按一次就是第二条判定，
      // 闸门后面的系统会收到两条相互矛盾的结论。两颗钮同一把尺子
      name: '判定在途：批准与拒绝一起锁住，再点谁都打不出第二条判定',
      spec: { apg: APG },
      props: { loading: true, scopes: [{ value: 'read', required: true }] },
      initial: {
        parts: {
          'approve-trigger': { 'aria-disabled': 'true', 'aria-busy': 'true', 'data-loading': '', 'data-disabled': null },
          // 同样不用原生 disabled：锁住的钮仍留在 Tab 序里，读屏才念得到为什么按不动
          'deny-trigger': { 'aria-disabled': 'true', 'aria-busy': 'true', 'data-loading': '', 'disabled': null, 'data-disabled': null },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'deny-trigger',
          expect: { parts: { root: { 'data-state': 'pending' } }, events: [] },
        },
        {
          kind: 'click',
          part: 'approve-trigger',
          expect: { parts: { root: { 'data-state': 'pending' } }, events: [] },
        },
        // Escape 是拒绝钮的键盘等价物，同一道闸门；只锁住钮的话换只手按 Escape 照样打得出
        { kind: 'focus', part: 'deny-trigger' },
        {
          kind: 'key',
          key: 'Escape',
          expect: { parts: { root: { 'data-state': 'pending' } }, events: [] },
        },
      ],
    },
    {
      name: 'Escape 判为拒绝——它不是「关闭」，本组件不提供不作答的出口',
      spec: { apg: APG },
      covers: ['approval.kbd.escape'],
      steps: [
        { kind: 'focus', part: 'deny-trigger' },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { root: { 'data-state': 'denied' } },
            events: [{ type: 'decision', detail: { decision: 'denied', source: 'escape', scopes: [] } }],
          },
        },
      ],
    },
    {
      name: '判定落定后两颗按钮都收起出口：浮层的关闭由宿主自己做',
      spec: { apg: APG },
      props: { defaultStatus: 'approved' },
      initial: {
        parts: {
          'root': { 'data-state': 'approved' },
          'approve-trigger': { 'disabled': '', 'data-disabled': '' },
          'deny-trigger': { 'disabled': '', 'data-disabled': '' },
        },
      },
    },
    {
      name: '超时按拒绝收口：判定只有批准与拒绝两个取值，expired 只是显示态',
      spec: { apg: APG },
      props: { timeoutMs: 30 },
      steps: [
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'expired' } },
          timeoutMs: 2000,
        },
        {
          kind: 'raw',
          why: '要核对的是判定载荷里写的是拒绝而不是第三种取值，事件断言在这一帧之前已经过去',
          run: ({ doc }: RawStepContext) => {
            const root = doc.querySelector<HTMLElement>(ROOT)
            if (root?.getAttribute('data-state') !== 'expired')
              throw new Error('到点之后应落到 expired 显示态')
          },
        },
      ],
    },
    {
      name: '时长非正数时一个计时器都不起：既不当 0ms 立刻到期，也不当无限期放行',
      spec: { apg: APG },
      props: { timeoutMs: 0 },
      initial: { parts: { root: { 'data-state': 'pending' } } },
    },
    {
      name: 'Space / Enter 按住与触屏按下：批准钮、拒绝钮投影 data-pressed，授权项只认 Space；抬起、失焦或指针取消撤下',
      spec: { adr: 'press-channel' },
      covers: ['approval.kbd.press', 'approval.kbd.item-press'],
      props: { scopes: [{ value: 'read' }, { value: 'write' }] },
      steps: [
        heldPress('approval', 'approve-trigger'),
        heldPress('approval', 'deny-trigger'),
        // 两次 keydown 把勾选翻回起点
        heldPress('approval', 'item', { value: 'read', keys: [' '] }),
        {
          kind: 'raw',
          why: 'role=checkbox 没有 Enter 这条激活键，Enter 按住不进按压面',
          run: async ({ doc, flush }) => {
            const item = doc.querySelector<HTMLElement>('[data-scope="approval"][data-part="item"][data-value="write"]')!
            item.focus()
            item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
            await flush()
            if (item.hasAttribute('data-pressed'))
              throw new Error('Enter 按住授权项不该投影 data-pressed')
            if (item.getAttribute('aria-checked') !== 'false')
              throw new Error('Enter 不该翻转勾选')
          },
        },
      ],
    },
    {
      name: '必选项没勾满：批准钮不进按压面，拒绝钮与授权项照进；勾满后批准钮进',
      spec: { adr: 'press-channel' },
      props: { scopes: [{ value: 'read', required: true }, { value: 'write' }] },
      steps: [
        heldPressIgnored('approval', 'approve-trigger', '必选项没勾满时批准钮 aria-disabled 并投 data-disabled，家族给置灰面'),
        heldPress('approval', 'deny-trigger'),
        { kind: 'click', part: 'item[0]', expect: { parts: { 'approve-trigger': { 'aria-disabled': 'false', 'data-disabled': null } } } },
        heldPress('approval', 'approve-trigger'),
      ],
    },
    {
      name: '判定在途与禁用的授权项：按住不进按压面',
      spec: { adr: 'press-channel' },
      fixture: withDisabledWrite,
      props: { loading: true, scopes: [{ value: 'read' }, { value: 'write', disabled: true }] },
      steps: [
        heldPressIgnored('approval', 'approve-trigger', '判定在途两颗钮一起锁住'),
        heldPressIgnored('approval', 'deny-trigger', '判定在途两颗钮一起锁住'),
        heldPressIgnored('approval', 'item', '判定在途授权项 aria-disabled', { value: 'read' }),
        { kind: 'setProps', props: { loading: false, scopes: [{ value: 'read' }, { value: 'write', disabled: true }] } },
        heldPressIgnored('approval', 'item', '禁用的授权项 aria-disabled', { value: 'write' }),
        heldPress('approval', 'item', { value: 'read', keys: [' '] }),
      ],
    },
    {
      name: '按住途中判定转入在途：三种部件一起锁住、不会再来 keyup，按压面由机器收',
      spec: { adr: 'press-channel' },
      props: { scopes: [{ value: 'read' }] },
      steps: [
        {
          kind: 'raw',
          why: '按住的中间帧要拆开派才看得见',
          run: async ({ doc, flush }) => {
            const deny = doc.querySelector<HTMLElement>('[data-scope="approval"][data-part="deny-trigger"]')!
            deny.focus()
            deny.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
            await flush()
            if (!deny.hasAttribute('data-pressed'))
              throw new Error('按住 Space 时拒绝钮应投影 data-pressed')
          },
        },
        { kind: 'setProps', props: { loading: true, scopes: [{ value: 'read' }] }, expect: { parts: { 'deny-trigger': { 'aria-disabled': 'true', 'data-pressed': null } } } },
      ],
    },
    {
      name: '判定落定即松开：按住 Enter 判掉的那颗钮随即原生 disabled、不会再来 keyup；终态不再进',
      spec: { adr: 'press-channel' },
      props: { scopes: [{ value: 'read' }] },
      steps: [
        {
          kind: 'raw',
          why: '按住的中间帧要拆开派才看得见',
          run: async ({ doc, flush }) => {
            const deny = doc.querySelector<HTMLElement>('[data-scope="approval"][data-part="deny-trigger"]')!
            deny.focus()
            deny.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
            await flush()
            if (!deny.hasAttribute('data-pressed'))
              throw new Error('按住 Enter 时拒绝钮应投影 data-pressed')
          },
        },
        { kind: 'click', part: 'deny-trigger', expect: { parts: { 'root': { 'data-state': 'denied' }, 'deny-trigger': { 'disabled': '', 'data-pressed': null } } } },
        heldPressIgnored('approval', 'approve-trigger', '落定后两颗钮原生 disabled'),
        heldPressIgnored('approval', 'item', '落定后授权项 aria-disabled', { value: 'read' }),
      ],
    },
  ],
}
