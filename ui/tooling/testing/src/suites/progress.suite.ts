import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { progressAnatomy, progressKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/meter/'

// Vue 与 React 由组件自己渲出轨道与环；Web Components 侧作者写外壳，色带、刻度与指针由元素生成进去
function LINE_SHELL(base: FixtureNode): FixtureNode {
  return {
    ...base,
    children: [{ part: 'track', only: ['wc'], children: [{ part: 'range', only: ['wc'] }] }],
  }
}
function RING_SHELL(base: FixtureNode): FixtureNode {
  return {
    ...base,
    children: [{
      part: 'canvas',
      tag: 'svg',
      only: ['wc'],
      children: [{ part: 'track', tag: 'circle', only: ['wc'] }, { part: 'range', tag: 'circle', only: ['wc'] }],
    }],
  }
}

const ZONES = [
  { value: 60, tone: 'success', label: 'Normal' },
  { value: 85, tone: 'warning', label: 'Warning' },
  { value: 100, tone: 'danger', label: 'Overload' },
]

export const progressSuite: ConformanceSuite = {
  component: 'progress',
  anatomy: progressAnatomy,
  keyboard: progressKeyboard,
  // 进度条的名字由作者写在角色节点上：组件不生成文案，也没有承载文案的部件
  fixture: { part: 'root', tag: 'div', attrs: { 'aria-label': '上传进度' } },
  cases: [
    {
      name: '进行中：role=progressbar，aria-valuenow=50、aria-valuemax=100，data-state=loading',
      spec: { apg: APG },
      props: { value: 50 },
      initial: {
        parts: {
          root: {
            'role': 'progressbar',
            'aria-valuemin': '0',
            'aria-valuemax': '100',
            'aria-valuenow': '50',
            'data-state': 'loading',
          },
        },
      },
    },
    {
      name: 'semantics=meter：报的是量不是进度，role 换成 meter，值照常发',
      spec: { apg: APG },
      props: { value: 50, semantics: 'meter' },
      initial: {
        parts: {
          root: {
            'role': 'meter',
            'aria-valuemin': '0',
            'aria-valuemax': '100',
            'aria-valuenow': '50',
          },
        },
      },
    },
    {
      name: 'semantics=meter 不接 indeterminate：量没有未知这一档，值仍要报出去',
      spec: { apg: APG },
      props: { value: 50, semantics: 'meter', indeterminate: true },
      initial: {
        parts: {
          root: {
            'role': 'meter',
            'aria-valuenow': '50',
            'data-state': 'loading',
          },
        },
      },
    },
    {
      name: '满值：value=max=100 时 aria-valuenow=100、data-state=complete',
      spec: { apg: APG },
      props: { value: 100 },
      initial: {
        parts: {
          root: {
            'aria-valuenow': '100',
            'aria-valuemax': '100',
            'data-state': 'complete',
          },
        },
      },
    },
    {
      name: '零值：value=0 时 aria-valuenow=0、data-state=loading',
      spec: { apg: APG },
      props: { value: 0 },
      initial: {
        parts: {
          root: {
            'aria-valuenow': '0',
            'data-state': 'loading',
          },
        },
      },
    },
    {
      name: '环形：形态落在 root 上，值与语义不随形态变',
      spec: { apg: APG },
      props: { value: 50, variant: 'circle' },
      initial: {
        parts: {
          root: { 'data-variant': 'circle', 'aria-valuenow': '50', 'data-state': 'loading' },
        },
      },
    },
    {
      name: 'valueText：进度不是百分比时读屏念作者给的那句话',
      spec: { apg: APG },
      props: { value: 3, max: 8, valueText: '第 3 步，共 8 步' },
      initial: {
        parts: {
          root: { 'aria-valuetext': '第 3 步，共 8 步', 'aria-valuenow': '3', 'aria-valuemax': '8' },
        },
      },
    },
    {
      name: '子弹图：量加上分段、目标与刻度，色带三段、目标一道、刻度从 0 到 100 每 20 一个；读屏补上所在的分段',
      spec: { apg: APG },
      fixture: LINE_SHELL,
      props: { value: 72, semantics: 'meter', thresholds: ZONES, target: 80, scale: true, locale: 'en-US' },
      initial: {
        counts: { 'threshold': 3, 'target': 1, 'scale': 1, 'scale-tick': 6, 'scale-label': 6 },
        parts: {
          root: { 'role': 'meter', 'aria-valuetext': '72%, Warning', 'data-banded': '' },
          range: { 'data-tone': 'warning' },
          threshold: [{ 'data-tone': 'success' }, { 'data-tone': 'warning' }, { 'data-tone': 'danger' }],
        },
      },
    },
    {
      name: '仪表盘 indicator="needle"：指针指出当前值，弧上的填充收起、只留色带',
      spec: { apg: APG },
      fixture: RING_SHELL,
      props: { value: 72, semantics: 'meter', variant: 'dashboard', thresholds: ZONES, indicator: 'needle' },
      initial: {
        counts: { threshold: 3, needle: 1, target: 0, scale: 0 },
        parts: {
          root: { 'data-indicator': 'needle' },
          range: { 'data-indicator': 'needle' },
        },
      },
    },
    {
      name: '进度语义下的分段与目标不生效：一样都不画，根仍是 progressbar',
      spec: { apg: APG },
      fixture: LINE_SHELL,
      props: { value: 50, thresholds: ZONES, target: 80 },
      initial: {
        counts: { threshold: 0, target: 0 },
        parts: { root: { 'role': 'progressbar', 'aria-valuetext': null } },
      },
    },
  ],
}
