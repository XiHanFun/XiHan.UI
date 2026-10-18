import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { tooltipAnatomy, tooltipKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/'

const TRIGGER_SELECTOR = '[data-scope="tooltip"][data-part="trigger"]'

/** apply-step 只有 click/key/focus，指针进出与按下只能直接派发。 */
function dispatchOnTrigger(type: string): (ctx: RawStepContext) => void {
  return ({ doc }) => {
    const trigger = doc.querySelector(TRIGGER_SELECTOR)
    if (!trigger)
      throw new Error('fixture 里没有 trigger')
    trigger.dispatchEvent(new Event(type))
  }
}

/**
 * 委托模式的夹具：trigger 是装着两个锚点的容器。撤销有快捷键、文字就是名字；
 * 删除写了 data-xh-tooltip，提示文字与名字不同。
 */
function delegateFixture(): FixtureNode {
  return {
    children: [
      {
        part: 'trigger',
        tag: 'div',
        children: [
          { tag: 'button', attrs: { 'type': 'button', 'data-anchor': 'undo', 'aria-label': '撤销', 'aria-keyshortcuts': 'Control+Z' } },
          { tag: 'button', attrs: { 'type': 'button', 'data-anchor': 'delete', 'aria-label': '删除', 'data-xh-tooltip': '删除选中的对象' } },
        ],
      },
      { part: 'positioner', children: [{ part: 'content', children: [{ part: 'arrow' }] }] },
    ],
  }
}

/** 在锚点上派发一个冒泡的事件；进出与失焦的 relatedTarget 落在容器外（没有）。 */
function dispatchOnAnchor(anchor: string, type: 'pointerover' | 'pointerout' | 'pointerdown' | 'focusin' | 'focusout'): (ctx: RawStepContext) => void {
  return ({ doc }) => {
    const el = doc.querySelector(`[data-anchor="${anchor}"]`)
    if (!el)
      throw new Error(`fixture 里没有锚点 ${anchor}`)
    const view = doc.defaultView!
    el.dispatchEvent(type.startsWith('focus')
      ? new view.FocusEvent(type, { bubbles: true, relatedTarget: null })
      : new view.MouseEvent(type, { bubbles: true, relatedTarget: null }))
  }
}

/** 委托模式下直接读 DOM 核对：text 与 shortcut 部件里的字，以及哪几个锚点的 aria-describedby 引用了 text。 */
function expectDelegated(want: { readonly text?: string, readonly shortcut?: string | null, readonly described: readonly string[] }): (ctx: RawStepContext) => void {
  return ({ doc, adapterName }) => {
    const text = doc.querySelector('[data-scope="tooltip"][data-part="text"]')
    if (want.text !== undefined && text?.textContent !== want.text)
      throw new Error(`${adapterName}: text 部件写的是「${text?.textContent}」，期望「${want.text}」`)
    if (want.shortcut !== undefined) {
      const shortcut = doc.querySelector('[data-scope="tooltip"][data-part="shortcut"]')?.textContent ?? null
      if (shortcut !== want.shortcut)
        throw new Error(`${adapterName}: shortcut 部件写的是「${shortcut}」，期望「${want.shortcut}」`)
    }
    const described = Array.from(doc.querySelectorAll('[data-anchor][aria-describedby]'), (el) => {
      if (!text?.id || el.getAttribute('aria-describedby') !== text.id)
        throw new Error(`${adapterName}: 锚点 ${el.getAttribute('data-anchor')} 的 aria-describedby 是「${el.getAttribute('aria-describedby')}」，应只引用 text 部件`)
      return el.getAttribute('data-anchor')
    })
    if (described.join(',') !== want.described.join(','))
      throw new Error(`${adapterName}: 引用 text 的锚点是 [${described.join(', ')}]，期望 [${want.described.join(', ')}]`)
  }
}

// content 始终在 DOM，靠 hidden 显隐；positioner 留在原地不 portal。
export const tooltipSuite: ConformanceSuite = {
  component: 'tooltip',
  anatomy: tooltipAnatomy,
  keyboard: tooltipKeyboard,
  fixture: {
    children: [
      { part: 'trigger', tag: 'button', text: '保存' },
      {
        part: 'positioner',
        children: [
          {
            part: 'content',
            children: [
              { text: '保存当前草稿' },
              { part: 'arrow' },
            ],
          },
        ],
      },
    ],
  },
  // 同页的提示共用一个接替窗口：会打开提示的用例都把 skipDelayDuration 写成 0，
  // 前一个用例（或对拍里先跑的另一端）刚收起的提示才不会让这一个直接接替、多投影出 data-instant
  cases: [
    {
      name: '初始收起：content 常挂但带 hidden，trigger 不指向隐藏节点',
      spec: { apg: APG, zag: 'tooltip.machine#initialState' },
      initial: {
        order: ['trigger', 'positioner', 'content', 'arrow'],
        counts: { trigger: 1, positioner: 1, content: 1, arrow: 1 },
        parts: {
          trigger: {
            'type': 'button',
            'aria-describedby': null,
            'data-state': 'closed',
            'data-disabled': null,
          },
          content: {
            'role': 'tooltip',
            'data-state': 'closed',
            'hidden': '',
          },
          arrow: { 'aria-hidden': 'true' },
        },
      },
    },
    {
      name: '聚焦 trigger 立即展开：不等 openDelay，并派发 open-change',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tooltip.kbd.tab'],
      // 延时若被误用在聚焦路径上，本用例会因 content 仍 hidden 而失败
      props: { openDelay: 5000, skipDelayDuration: 0 },
      steps: [
        {
          kind: 'focus',
          part: 'trigger',
          expect: {
            parts: {
              trigger: { 'data-state': 'open' },
              content: { 'data-state': 'open', 'hidden': null },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: 'aria-describedby 指向 content：tooltip 是描述不是名字',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { skipDelayDuration: 0 },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'open' } },
          expect: {
            parts: {
              trigger: { 'aria-describedby': '@part(content)', 'aria-labelledby': null },
              content: { id: '@self', role: 'tooltip' },
            },
          },
        },
      ],
    },
    {
      name: '悬停进入：等到 openDelay 到点才展开',
      spec: { apg: APG, zag: 'tooltip.machine#opening' },
      // 关掉接替：这条守的是等待本身，前一个用例刚收起的提示会让这一个不等就接替
      props: { openDelay: 50, skipDelayDuration: 0 },
      steps: [
        {
          kind: 'raw',
          why: 'apply-step 无 hover 步骤类型，悬停延时只能直接派发指针事件',
          run: dispatchOnTrigger('pointerenter'),
          expect: {
            parts: { content: { 'data-state': 'closed', 'hidden': '' } },
            events: [],
          },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'open' } },
          expect: {
            parts: { content: { 'data-state': 'open', 'hidden': null } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: 'followCursor：定位层带跟随标记；指针进入照样按 openDelay 展开',
      spec: { apg: APG },
      props: { followCursor: true, openDelay: 50, skipDelayDuration: 0 },
      initial: {
        parts: { positioner: { 'data-follow-cursor': '' } },
      },
      steps: [
        {
          kind: 'raw',
          why: 'apply-step 无 hover 步骤类型，悬停只能直接派发指针事件；没有落点的进入锚回 trigger',
          run: dispatchOnTrigger('pointerenter'),
          expect: {
            parts: { content: { 'data-state': 'closed', 'hidden': '' } },
            events: [],
          },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'open' } },
          expect: {
            parts: { content: { 'data-state': 'open', 'hidden': null }, positioner: { 'data-follow-cursor': '' } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: 'Escape 立即收起：不等 closeDelay',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tooltip.kbd.escape'],
      props: { closeDelay: 5000, skipDelayDuration: 0 },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: {
              trigger: { 'aria-describedby': null, 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '指针按下：立即收起给真正的操作让位',
      spec: { apg: APG },
      props: { closeDelay: 5000, skipDelayDuration: 0 },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'raw',
          why: 'apply-step 的 click 不派发 pointerdown，按下路径只能直接派发',
          run: dispatchOnTrigger('pointerdown'),
          expect: {
            parts: { content: { 'data-state': 'closed', 'hidden': '' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      // 焦点停在 trigger 上时，鼠标路过再移开不收走描述，收起由 BLUR 负责
      name: '聚焦打开后，指针移出不收起（收起归 BLUR 管）',
      spec: { apg: APG },
      props: { closeDelay: 20, skipDelayDuration: 0 },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'raw',
          why: 'apply-step 无 hover 步骤类型，指针进出只能直接派发',
          run: dispatchOnTrigger('pointerleave'),
        },
        {
          kind: 'raw',
          // 必须等过 closeDelay 才有判别力：收起等待期内 content 仍是 data-state=open
          why: '等过 closeDelay，越过收起等待期再断言',
          run: () => new Promise<void>(resolve => setTimeout(resolve, 80)),
          expect: {
            parts: { content: { 'data-state': 'open', 'hidden': null } },
            events: [],
          },
        },
      ],
    },
    {
      // 守的是悬停等待期内的命令式展开（opening 态收 OPEN）
      name: '悬停等待期内命令式展开：立即展开，不等 openDelay',
      spec: { apg: APG },
      // 关掉接替：先得真的进到等待态，前一个用例刚收起的提示会让悬停不等就接替
      props: { openDelay: 5000, skipDelayDuration: 0 },
      steps: [
        {
          kind: 'raw',
          why: '先进入 opening 等待态',
          run: dispatchOnTrigger('pointerenter'),
          expect: { parts: { content: { 'data-state': 'closed' } }, events: [] },
        },
        {
          kind: 'raw',
          why: '命令式展开走 api.setOpen，apply-step 没有对应步骤类型',
          run: ({ doc }) => {
            const trigger = doc.querySelector(TRIGGER_SELECTOR)
            trigger?.dispatchEvent(new Event('focus'))
          },
          expect: {
            parts: { content: { 'data-state': 'open', 'hidden': null } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: 'disabled：聚焦不展开、不派发',
      spec: { apg: APG },
      props: { disabled: true },
      steps: [
        {
          kind: 'focus',
          part: 'trigger',
          expect: {
            parts: {
              trigger: { 'data-disabled': '', 'aria-describedby': null, 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '受控 open：聚焦只发 open-change 不自改 DOM，父写回 open 后才展开',
      spec: { adr: 'controlled-uncontrolled' },
      props: { open: false, skipDelayDuration: 0 },
      steps: [
        {
          kind: 'focus',
          part: 'trigger',
          expect: {
            parts: { content: { 'data-state': 'closed', 'hidden': '' } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'setProps', props: { open: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: null } },
          expect: {
            parts: { content: { 'data-state': 'open', 'hidden': null } },
          },
        },
      ],
    },
    {
      name: '委托：trigger 是容器、不当按钮；content 里铺 text，还没有锚点时没有 shortcut',
      spec: { apg: APG },
      fixture: delegateFixture,
      props: { delegate: '[data-anchor]', platform: 'other' },
      initial: {
        order: ['trigger', 'positioner', 'content', 'arrow', 'text'],
        counts: { trigger: 1, positioner: 1, content: 1, text: 1, shortcut: 0, arrow: 1 },
        parts: {
          trigger: { 'type': null, 'aria-describedby': null, 'data-delegate': '', 'data-state': 'closed' },
          content: { 'role': 'tooltip', 'data-state': 'closed', 'hidden': '' },
        },
      },
    },
    {
      name: '委托：悬停锚点等 openDelay 打开，文字取可及名、快捷键取 aria-keyshortcuts；文字与名字相同不挂 aria-describedby',
      spec: { apg: `${APG}#roles_states_properties` },
      fixture: delegateFixture,
      props: { delegate: '[data-anchor]', platform: 'other', openDelay: 50, skipDelayDuration: 0 },
      steps: [
        {
          kind: 'raw',
          why: 'apply-step 无 hover 步骤类型，指针进入锚点只能直接派发冒泡的 pointerover',
          run: dispatchOnAnchor('undo', 'pointerover'),
          expect: { parts: { content: { 'data-state': 'closed', 'hidden': '' } }, events: [] },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'open' } },
          expect: {
            counts: { text: 1, shortcut: 1 },
            parts: {
              content: { 'data-state': 'open', 'hidden': null },
              shortcut: { 'aria-hidden': 'true' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'raw',
          why: '部件里的文字与锚点上的 aria-describedby 不进属性快照，只能直接读 DOM',
          run: expectDelegated({ text: '撤销', shortcut: 'Ctrl+Z', described: [] }),
        },
      ],
    },
    {
      name: '委托：指针挪到另一个锚点直接换过去、不收起；写了 data-xh-tooltip 的锚点用 aria-describedby 引用 text',
      spec: { apg: `${APG}#roles_states_properties` },
      fixture: delegateFixture,
      props: { delegate: '[data-anchor]', platform: 'other', openDelay: 50, skipDelayDuration: 0 },
      steps: [
        { kind: 'raw', why: '先悬停第一个锚点', run: dispatchOnAnchor('undo', 'pointerover') },
        { kind: 'settle', until: { attr: { part: 'content', name: 'data-state', value: 'open' } } },
        {
          kind: 'raw',
          why: '指针从一个锚点挪到另一个：派发冒泡的 pointerover',
          run: dispatchOnAnchor('delete', 'pointerover'),
          expect: {
            counts: { text: 1, shortcut: 0 },
            parts: { content: { 'data-state': 'open', 'hidden': null } },
            events: [],
          },
        },
        {
          kind: 'raw',
          why: '部件里的文字与锚点上的 aria-describedby 不进属性快照，只能直接读 DOM',
          run: expectDelegated({ text: '删除选中的对象', shortcut: null, described: ['delete'] }),
        },
      ],
    },
    {
      name: '委托：指针移出容器收起，锚点上的 aria-describedby 随之撤掉',
      spec: { apg: APG },
      fixture: delegateFixture,
      props: { delegate: '[data-anchor]', platform: 'other', openDelay: 50, closeDelay: 0, skipDelayDuration: 0 },
      steps: [
        { kind: 'raw', why: '悬停写了 data-xh-tooltip 的锚点', run: dispatchOnAnchor('delete', 'pointerover') },
        { kind: 'settle', until: { attr: { part: 'content', name: 'data-state', value: 'open' } } },
        {
          kind: 'raw',
          why: '指针离开容器：派发 relatedTarget 落在容器外的冒泡 pointerout',
          run: dispatchOnAnchor('delete', 'pointerout'),
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'closed' } },
          expect: { parts: { content: { 'data-state': 'closed' } } },
        },
        {
          kind: 'raw',
          why: '锚点上的 aria-describedby 不进属性快照，只能直接读 DOM',
          run: expectDelegated({ described: [] }),
        },
      ],
    },
    {
      name: '委托：键盘聚焦锚点立即打开、不等 openDelay，焦点离开容器即收起',
      spec: { apg: `${APG}#keyboardinteraction` },
      fixture: delegateFixture,
      props: { delegate: '[data-anchor]', platform: 'other', openDelay: 5000, skipDelayDuration: 0 },
      steps: [
        {
          kind: 'raw',
          why: '焦点落到容器里的锚点：派发冒泡的 focusin',
          run: dispatchOnAnchor('undo', 'focusin'),
          expect: {
            parts: { content: { 'data-state': 'open', 'hidden': null } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'raw',
          why: '焦点离开容器：派发 relatedTarget 落在容器外的冒泡 focusout',
          run: dispatchOnAnchor('undo', 'focusout'),
          expect: {
            parts: { content: { 'data-state': 'closed' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '委托：按下锚点收起，随按下而来的聚焦不再打开',
      spec: { apg: APG },
      fixture: delegateFixture,
      props: { delegate: '[data-anchor]', platform: 'other', openDelay: 50, skipDelayDuration: 0 },
      steps: [
        { kind: 'raw', why: '先悬停锚点', run: dispatchOnAnchor('undo', 'pointerover') },
        { kind: 'settle', until: { attr: { part: 'content', name: 'data-state', value: 'open' } } },
        {
          kind: 'raw',
          why: 'apply-step 的 click 不派发 pointerdown，按下与随后的聚焦只能直接派发',
          run: (ctx) => {
            dispatchOnAnchor('undo', 'pointerdown')(ctx)
            dispatchOnAnchor('undo', 'focusin')(ctx)
          },
          expect: {
            parts: { content: { 'data-state': 'closed' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
  ],
}
