import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { layoutAnatomy, layoutKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

// 骨架本身没有 APG 模式；能按的只有折叠把手，它照披露模式接线。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/'

/**
 * 把遮罩插到侧栏之前：覆盖档才用得上它，默认结构里不摆。
 * 顺序就是契约的一半——两层同一个层号，先渲染的那层在下面。
 */
function withBackdrop(base: FixtureNode): FixtureNode {
  const children = base.children ?? []
  const at = children.findIndex(node => node.part === 'sider')
  return {
    ...base,
    children: [...children.slice(0, at), { part: 'sider-backdrop' }, ...children.slice(at)],
  }
}

export const layoutSuite: ConformanceSuite = {
  component: 'layout',
  anatomy: layoutAnatomy,
  keyboard: layoutKeyboard,
  // 把手摆在头部：它开合的是侧栏，位置由作者定，与它指向谁无关
  fixture: {
    part: 'root',
    children: [
      {
        part: 'header',
        children: [{ part: 'sider-trigger', tag: 'button', text: '折叠侧栏' }],
      },
      { part: 'sider', text: '导航' },
      { part: 'content', text: '正文' },
      { part: 'footer', text: '页脚' },
    ],
  },
  cases: [
    {
      name: '缺省：侧栏展开、侧栏挂在行首，根上不写 role，折叠与固定标记一个都不落',
      spec: { apg: APG },
      initial: {
        order: ['root', 'header', 'sider-trigger', 'sider', 'content', 'footer'],
        counts: { 'root': 1, 'header': 1, 'sider-trigger': 1, 'sider': 1, 'content': 1, 'footer': 1 },
        parts: {
          'root': {
            'role': null,
            'data-sider-placement': 'start',
            'data-sider-breakpoint': null,
            'data-collapsed': null,
            'data-header-fixed': null,
            'data-sider-fixed': null,
            'data-bordered': null,
          },
          'header': {
            'data-fixed': null,
          },
          'sider': {
            'id': '@self',
            'data-collapsed': null,
            'data-placement': 'start',
            'data-fixed': null,
          },
          'sider-trigger': {
            'type': 'button',
            'aria-expanded': 'true',
            'aria-controls': '@part(sider)',
            'data-collapsed': null,
          },
        },
      },
    },
    {
      name: 'Space / Enter 折叠：把手是原生 <button type="button">，激活交给平台',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['layout.kbd.toggle-sider'],
      steps: [nativeActivation('layout', 'sider-trigger')],
    },
    {
      name: '点击把手折叠：aria-expanded=false，根、侧栏与把手一并落 data-collapsed',
      spec: { apg: APG },
      steps: [
        {
          kind: 'click',
          part: 'sider-trigger',
          expect: {
            parts: {
              'root': { 'data-collapsed': '' },
              'sider': { 'data-collapsed': '' },
              'sider-trigger': { 'aria-expanded': 'false', 'data-collapsed': '' },
            },
          },
        },
        {
          kind: 'click',
          part: 'sider-trigger',
          expect: {
            parts: {
              'root': { 'data-collapsed': null },
              'sider': { 'data-collapsed': null },
              'sider-trigger': { 'aria-expanded': 'true' },
            },
          },
        },
      ],
    },
    {
      name: '非受控初始折叠：defaultSiderCollapsed 只决定初始态',
      spec: { adr: 'controlled-uncontrolled' },
      props: { defaultSiderCollapsed: true },
      initial: {
        parts: {
          'root': { 'data-collapsed': '' },
          'sider': { 'data-collapsed': '' },
          'sider-trigger': { 'aria-expanded': 'false' },
        },
      },
    },
    {
      name: '受控 siderCollapsed：点击不自改 DOM，父写回后侧栏才折起来',
      spec: { adr: 'controlled-uncontrolled' },
      props: { siderCollapsed: false },
      steps: [
        {
          kind: 'click',
          part: 'sider-trigger',
          expect: {
            parts: {
              'sider': { 'data-collapsed': null },
              'sider-trigger': { 'aria-expanded': 'true' },
            },
          },
        },
        { kind: 'setProps', props: { siderCollapsed: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'sider', name: 'data-collapsed', value: '' } },
          expect: {
            parts: {
              'root': { 'data-collapsed': '' },
              'sider-trigger': { 'aria-expanded': 'false' },
            },
          },
        },
      ],
    },
    {
      name: '侧栏断点：档位如实落到根上，折叠态不受它牵连',
      spec: { apg: APG },
      props: { siderBreakpoint: 'md' },
      initial: {
        parts: {
          root: { 'data-sider-breakpoint': 'md', 'data-collapsed': null },
          sider: { 'data-collapsed': null },
        },
      },
    },
    {
      name: '缺省呈现形态：占位档，侧栏与根都落 inline',
      spec: { apg: APG },
      initial: {
        parts: {
          root: { 'data-sider-presentation': 'inline' },
          sider: { 'data-presentation': 'inline' },
        },
      },
    },
    {
      name: '覆盖档：根与侧栏落 sheet，遮罩露出来；点遮罩收起侧栏',
      spec: { apg: APG },
      fixture: withBackdrop,
      props: { siderPresentation: 'sheet' },
      initial: {
        parts: {
          'root': { 'data-sider-presentation': 'sheet', 'data-collapsed': null },
          'sider': { 'data-presentation': 'sheet', 'data-collapsed': null },
          'sider-backdrop': { 'aria-hidden': 'true', 'hidden': null, 'data-collapsed': null },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'sider-backdrop',
          expect: {
            parts: {
              'root': { 'data-collapsed': '' },
              'sider': { 'data-collapsed': '' },
              'sider-backdrop': { 'data-collapsed': '' },
              'sider-trigger': { 'aria-expanded': 'false' },
            },
          },
        },
      ],
    },
    {
      name: '占位档的遮罩带 hidden：不占位也不吃指针',
      spec: { apg: APG },
      fixture: withBackdrop,
      initial: {
        parts: {
          'sider-backdrop': { hidden: '' },
        },
      },
    },
    {
      name: '覆盖档按 Escape 收起侧栏；占位档下 Escape 与侧栏无关',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['layout.kbd.dismiss-sider-sheet'],
      props: { siderPresentation: 'sheet' },
      steps: [
        { kind: 'focus', part: 'sider-trigger' },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: {
              'root': { 'data-collapsed': '' },
              'sider': { 'data-collapsed': '' },
              'sider-trigger': { 'aria-expanded': 'false' },
            },
          },
        },
      ],
    },
    {
      name: '占位档不认 Escape：侧栏照旧展开',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        { kind: 'focus', part: 'sider-trigger' },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: {
              root: { 'data-collapsed': null },
              sider: { 'data-collapsed': null },
            },
          },
        },
      ],
    },
    {
      name: '侧栏挂到行尾：根与侧栏都如实落成 end',
      spec: { apg: APG },
      props: { siderPlacement: 'end' },
      initial: {
        parts: {
          root: { 'data-sider-placement': 'end' },
          sider: { 'data-placement': 'end' },
        },
      },
    },
    {
      name: '头吸顶：标记落在根与头上，侧栏不受牵连',
      spec: { apg: APG },
      props: { headerFixed: true },
      initial: {
        parts: {
          root: { 'data-header-fixed': '', 'data-sider-fixed': null },
          header: { 'data-fixed': '' },
          sider: { 'data-fixed': null },
        },
      },
    },
    {
      name: '侧栏吸附：标记落在根与侧栏上，头不受牵连',
      spec: { apg: APG },
      props: { siderFixed: true },
      initial: {
        parts: {
          root: { 'data-sider-fixed': '', 'data-header-fixed': null },
          sider: { 'data-fixed': '' },
          header: { 'data-fixed': null },
        },
      },
    },
    {
      name: '两个开关一起开：根上两个标记都在，头与侧栏各自带 data-fixed',
      spec: { apg: APG },
      props: { headerFixed: true, siderFixed: true },
      initial: {
        parts: {
          root: { 'data-header-fixed': '', 'data-sider-fixed': '' },
          header: { 'data-fixed': '' },
          sider: { 'data-fixed': '' },
        },
      },
    },
    {
      name: '固定标记与折叠态互不相干：折起来后两个 data-fixed 照旧在',
      spec: { apg: APG },
      props: { headerFixed: true, siderFixed: true },
      steps: [
        {
          kind: 'click',
          part: 'sider-trigger',
          expect: {
            parts: {
              root: { 'data-collapsed': '', 'data-header-fixed': '', 'data-sider-fixed': '' },
              header: { 'data-fixed': '' },
              sider: { 'data-collapsed': '', 'data-fixed': '' },
            },
          },
        },
      ],
    },
    {
      name: 'bordered 落成 data-bordered，关掉时不留空属性',
      spec: { apg: APG },
      props: { bordered: true },
      initial: {
        parts: {
          root: { 'data-bordered': '' },
        },
      },
    },
  ],
}
