import type { ConformanceSuite } from '../conformance/types'
import { separatorAnatomy, separatorKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/separator/'

export const separatorSuite: ConformanceSuite = {
  component: 'separator',
  anatomy: separatorAnatomy,
  keyboard: separatorKeyboard,
  fixture: { part: 'root', tag: 'div' },
  cases: [
    {
      name: '默认：水平朝向，role=separator，不上 aria-orientation',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': 'separator',
            'data-orientation': 'horizontal',
            'aria-orientation': null,
            'aria-hidden': null,
          },
        },
      },
    },
    {
      name: '垂直：aria-orientation=vertical + data-orientation=vertical',
      spec: { apg: APG },
      props: { orientation: 'vertical' },
      initial: {
        parts: {
          root: {
            'role': 'separator',
            'aria-orientation': 'vertical',
            'data-orientation': 'vertical',
          },
        },
      },
    },
    {
      name: '装饰性垂直线：role=none + aria-hidden，整段退出无障碍树且不泄漏朝向',
      spec: { apg: APG },
      props: { decorative: true, orientation: 'vertical' },
      initial: {
        parts: {
          root: {
            'role': 'none',
            'aria-hidden': 'true',
            'aria-orientation': null,
            'data-orientation': 'vertical',
          },
        },
      },
    },
    {
      name: '带文字强虚线：三段结构共享朝向，端线纯装饰，start 对齐逐字下发',
      spec: { apg: APG },
      fixture: () => ({
        part: 'root',
        tag: 'div',
        children: [
          { part: 'line', tag: 'div' },
          { part: 'content', tag: 'span', text: '范围' },
          { part: 'line', tag: 'div' },
        ],
      }),
      props: { align: 'start', dashed: true, variant: 'strong' },
      initial: {
        counts: { root: 1, line: 2, content: 1 },
        order: ['root', 'line[0]', 'content', 'line[1]'],
        parts: {
          'root': {
            'role': 'separator',
            'aria-hidden': null,
            'data-orientation': 'horizontal',
            'data-align': 'start',
            'data-dashed': '',
            'data-variant': 'strong',
          },
          'line[0]': { 'role': 'none', 'data-orientation': 'horizontal' },
          'line[1]': { 'role': 'none', 'data-orientation': 'horizontal' },
        },
      },
    },
  ],
}
