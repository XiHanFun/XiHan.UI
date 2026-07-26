import type { ConformanceSuite } from '../conformance/types'
import { badgeAnatomy, badgeKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const badgeSuite: ConformanceSuite = {
  component: 'badge',
  anatomy: badgeAnatomy,
  keyboard: badgeKeyboard,
  fixture: { part: 'root', tag: 'span', children: [{ text: 'New' }] },
  cases: [
    {
      name: '默认：单一 root，纯展示无 role，不上 data-variant',
      spec: { apg: APG },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'role': null,
            'data-variant': null,
          },
        },
      },
    },
    {
      name: 'variant solid：接线到 data-variant',
      spec: { apg: APG },
      props: { variant: 'solid' },
      initial: {
        parts: { root: { 'data-variant': 'solid' } },
      },
    },
  ],
}
