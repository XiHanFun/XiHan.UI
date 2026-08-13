import type { ConformanceSuite } from '../conformance/types'
import { progressAnatomy, progressKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/meter/'

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
  ],
}
