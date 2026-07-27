import type { ConformanceSuite } from '../conformance/types'
import { toasterAnatomy, toasterKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/'

function groupEl(doc: Document, index = 0): HTMLElement {
  const els = doc.querySelectorAll<HTMLElement>('[data-scope="toaster"][data-part="group"]')
  const el = els[index]
  if (!el)
    throw new Error(`fixture 里没有第 ${index} 个 group 部件`)
  return el
}

// 队列条目是纯数据：这里只关心它落在哪个位置、算不算进计数，文案一律省略。
const TOP = { id: 'a', placement: 'top' } as const
const FALLBACK = { id: 'b' } as const
const BOTTOM = { id: 'c', placement: 'bottom-end' } as const

export const toasterSuite: ConformanceSuite = {
  component: 'toaster',
  anatomy: toasterAnatomy,
  keyboard: toasterKeyboard,
  // 两个位各一摞。单条通知不在这份 fixture 里——它是 toast 组件自己的 scope，
  // 由作者按队列渲染进对应的那一摞
  fixture: {
    part: 'root',
    children: [
      { part: 'group', attrs: { placement: 'top' } },
      { part: 'group', attrs: { placement: 'bottom-end' } },
    ],
  },
  cases: [
    {
      name: '空队列：root 是地标不是 live region，两摞都报空',
      spec: { apg: `${APG}#roles_states_properties` },
      initial: {
        order: ['root', 'group[0]', 'group[1]'],
        counts: { root: 1, group: 2 },
        parts: {
          // 每条通知自己就是 status / alert，外面再套一层 live region 会让读屏念两遍
          'root': {
            'role': 'region',
            'aria-label': 'Notifications',
            'data-count': '0',
            'data-empty': '',
          },
          'group[0]': { 'data-placement': 'top', 'data-count': '0', 'data-empty': '' },
          'group[1]': { 'data-placement': 'bottom-end', 'data-count': '0', 'data-empty': '' },
        },
      },
    },
    {
      name: '按 placement 分组：没写位置的条目落到 toaster 的默认位',
      spec: { apg: APG },
      props: { defaultToasts: [TOP, FALLBACK, BOTTOM] },
      initial: {
        parts: {
          'root': { 'data-count': '3', 'data-empty': null },
          'group[0]': { 'data-count': '1', 'data-empty': null },
          // b 没写 placement，跟着 toaster 的缺省落位 bottom-end 落在这一摞
          'group[1]': { 'data-count': '2', 'data-empty': null },
        },
      },
    },
    {
      name: 'placement 改写默认落位：没写位置的条目跟着一起搬家',
      spec: { apg: APG },
      props: { placement: 'top', defaultToasts: [FALLBACK] },
      initial: {
        parts: {
          'root': { 'data-count': '1' },
          'group[0]': { 'data-count': '1', 'data-empty': null },
          'group[1]': { 'data-count': '0', 'data-empty': '' },
        },
      },
    },
    {
      name: 'group 不写 placement 时用 toaster 的位，data-placement 报的就是它',
      spec: { apg: APG },
      // 只留一摞、且不声明位置：缺省值的唯一事实源在 connect，两侧都不该在自己那边再兜一份
      fixture: () => ({ part: 'root', children: [{ part: 'group' }] }),
      props: { placement: 'top-start', defaultToasts: [FALLBACK] },
      initial: {
        parts: {
          group: { 'data-placement': 'top-start', 'data-count': '1', 'data-empty': null },
        },
      },
    },
    {
      name: 'max：每个位置只留窗口内的几条，其余不再渲染',
      spec: { apg: APG },
      props: {
        max: 2,
        defaultToasts: [
          { id: 'a', placement: 'bottom-end' },
          { id: 'b', placement: 'bottom-end' },
          { id: 'c', placement: 'bottom-end' },
        ],
      },
      initial: {
        parts: {
          // 三条进队、只留两条：不落这一刀的话超窗的条目永远等不到自己的计时器把它带走
          'root': { 'data-count': '2' },
          'group[1]': { 'data-count': '2' },
        },
      },
    },
    {
      name: '受控队列：宿主整份换掉，界面跟着走；换回空队列即报空',
      spec: { adr: 'controlled-uncontrolled' },
      props: { toasts: [] },
      steps: [
        {
          kind: 'setProps',
          props: { toasts: [TOP, BOTTOM] },
          expect: {
            parts: {
              'root': { 'data-count': '2', 'data-empty': null },
              'group[0]': { 'data-count': '1' },
              'group[1]': { 'data-count': '1' },
            },
          },
        },
        {
          kind: 'setProps',
          props: { toasts: [] },
          expect: {
            parts: {
              'root': { 'data-count': '0', 'data-empty': '' },
              'group[0]': { 'data-count': '0', 'data-empty': '' },
              'group[1]': { 'data-count': '0', 'data-empty': '' },
            },
          },
        },
      ],
    },
    {
      name: 'translations.region 改写地标的名字',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { translations: { region: '通知中心' } },
      initial: {
        parts: { root: { 'aria-label': '通知中心' } },
      },
    },
    {
      name: 'gap 落成摞内间距：只交间距，怎么贴边堆叠归样式层',
      spec: { apg: APG },
      props: { gap: 24 },
      steps: [
        {
          kind: 'raw',
          why: '内联 style 不进归一化快照（快照只收结构与 aria-/data- 属性）',
          run: ({ doc }) => {
            const gap = groupEl(doc).style.gap
            if (gap !== '24px')
              throw new Error(`group 的摞内间距应为 24px，实际 "${gap}"`)
          },
        },
      ],
    },
  ],
}
