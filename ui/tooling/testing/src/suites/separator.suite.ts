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
      name: '装饰性：role=none，退出无障碍树',
      spec: { apg: APG },
      props: { decorative: true },
      initial: {
        parts: {
          root: {
            'role': 'none',
            'aria-orientation': null,
          },
        },
      },
    },
  ],
}
