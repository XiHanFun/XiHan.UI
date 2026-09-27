import type { ConformanceSuite } from '../conformance/types'
import { timeZoneSelectAnatomy, timeZoneSelectKeyboard } from '@xihan-ui/headless'

export const timeZoneSelectSuite: ConformanceSuite = {
  component: 'time-zone-select',
  anatomy: timeZoneSelectAnatomy,
  keyboard: timeZoneSelectKeyboard,
  defaultProps: {
    timeZones: ['UTC', 'Asia/Shanghai'],
    referenceTime: Date.UTC(2026, 0, 1),
  },
  fixture: {
    part: 'root',
    children: [{ tag: 'span', text: 'Combobox composition' }],
  },
  cases: [
    {
      name: '组合根只声明自身边界，输入与列表语义交给内部 Combobox',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/' },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: { root: { role: null } },
      },
    },
  ],
}
