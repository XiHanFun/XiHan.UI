import type { ConformanceSuite, FixtureNode, RawStepContext, StepWithExpect } from '../conformance/types'
import { floatButtonAnatomy, floatButtonKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'

// 一颗触发器管着一组动作的开合，走的是披露那套；list 始终在 DOM，收起态靠 hidden 显隐，不卸载。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/'

const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    { part: 'trigger', tag: 'button', text: '＋' },
    {
      part: 'list',
      children: [
        { tag: 'button', text: '编辑' },
        { tag: 'button', text: '分享' },
      ],
    },
  ],
}

function partEl(doc: Document, part: string): HTMLElement {
  const el = doc.querySelector<HTMLElement>(`[data-scope="float-button"][data-part="${part}"]`)
  if (!el)
    throw new Error(`fixture 里没有 ${part} 部件`)
  return el
}

/** 指针进出定位壳。没有现成的指针步骤，只能直接派发；这两个事件本就不冒泡，派在壳上正好。 */
function pointerStep(type: 'pointerenter' | 'pointerleave', expect: StepWithExpect['expect']): StepWithExpect {
  return {
    kind: 'raw',
    why: '步骤集里没有指针进出，悬停展开只能直接往定位壳上派这两个事件',
    run: async ({ doc, flush }: RawStepContext) => {
      partEl(doc, 'root').dispatchEvent(new Event(type))
      await flush()
    },
    expect,
  }
}

export const floatButtonSuite: ConformanceSuite = {
  component: 'float-button',
  anatomy: floatButtonAnatomy,
  keyboard: floatButtonKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '起点收起：list 带 hidden，触发器自带名字并指向 list',
      spec: { apg: APG },
      initial: {
        order: ['root', 'trigger', 'list'],
        counts: { root: 1, trigger: 1, list: 1 },
        parts: {
          root: {
            'data-state': 'closed',
            'data-placement': 'bottom-end',
            'data-shape': 'circle',
            'data-disabled': null,
            // 壳只管落位，语义都在 trigger 与 list 上
            'role': null,
          },
          trigger: {
            // 不写死 type 的话，放在表单里会被当成提交按钮
            'type': 'button',
            'aria-expanded': 'false',
            'aria-controls': '@part(list)',
            // 里面通常只有一个图标，名字只能由组件给
            'aria-label': 'Actions',
            'data-state': 'closed',
            'data-disabled': null,
            // 原生 button 自带 Tab 停靠，不该套 roving tabindex
            'tabindex': null,
          },
          list: {
            'role': 'group',
            // 名字借触发器的，不另起一个
            'aria-labelledby': '@part(trigger)',
            'data-state': 'closed',
            'hidden': '',
          },
        },
        activeElement: null,
      },
    },
    {
      name: '点触发器展开，再点一下收起，两次都派发 open-change',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['float-button.kbd.toggle', 'float-button.kbd.tab'],
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              list: { 'data-state': 'open', 'hidden': null },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed' },
              list: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '展开着按 Escape 收起',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['float-button.kbd.escape'],
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false' },
              list: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '悬停展开：进出的是整个壳，指针走得到展开的那一组上去',
      spec: { apg: APG },
      props: { expandTrigger: 'hover' },
      steps: [
        pointerStep('pointerenter', {
          parts: {
            trigger: { 'aria-expanded': 'true' },
            list: { 'data-state': 'open', 'hidden': null },
          },
        }),
        pointerStep('pointerleave', {
          parts: {
            trigger: { 'aria-expanded': 'false' },
            list: { 'data-state': 'closed', 'hidden': '' },
          },
        }),
      ],
    },
    {
      name: '悬停展开时点一下照样开合：触摸与键盘只有这一条路',
      spec: { apg: APG },
      props: { expandTrigger: 'hover' },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: { list: { 'data-state': 'open', 'hidden': null } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: '落位与外形如实落到壳上，list 也拿得到落位',
      spec: { apg: APG },
      props: { placement: 'top-start', shape: 'square', offset: 8 },
      initial: {
        parts: {
          root: { 'data-placement': 'top-start', 'data-shape': 'square' },
          trigger: { 'data-shape': 'square' },
          list: { 'data-placement': 'top-start' },
        },
      },
    },
    {
      name: '受控 open：点一下只发 open-change 不自改 DOM，父写回 open 后才展开',
      spec: { adr: 'controlled-uncontrolled' },
      props: { open: false },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: { list: { 'data-state': 'closed', 'hidden': '' } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'setProps', props: { open: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'list', name: 'hidden', value: null } },
          expect: {
            parts: { list: { 'data-state': 'open', 'hidden': null } },
          },
        },
      ],
    },
    {
      name: 'disabled：原生 disabled + data-disabled，点击不展开、不派发',
      spec: { apg: APG },
      props: { disabled: true },
      steps: [
        { kind: 'click', part: 'trigger' },
        dispatchClickOnDisabled('float-button', 'trigger', {
          parts: {
            // 触发器是单体控件：用原生 disabled，data-disabled 只是样式
            trigger: { 'disabled': '', 'data-disabled': '', 'aria-expanded': 'false' },
            list: { 'data-state': 'closed', 'hidden': '' },
          },
          events: [],
        }),
      ],
    },
  ],
}
