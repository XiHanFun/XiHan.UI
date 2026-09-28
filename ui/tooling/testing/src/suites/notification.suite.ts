import type { ConformanceSuite } from '../conformance/types'
import { NOTIFICATION_PRESETS, notificationAnatomy, notificationKeyboard } from '@xihan-ui/headless'

const NOTIFICATION_MAX = NOTIFICATION_PRESETS.card.max

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/'

function groupEl(doc: Document, index = 0): HTMLElement {
  const els = doc.querySelectorAll<HTMLElement>('[data-scope="notification"][data-part="group"]')
  const el = els[index]
  if (!el)
    throw new Error(`fixture 里没有第 ${index} 个 group 部件`)
  return el
}

// 队列条目是纯数据：这里只关心它落在哪个位置、算不算进计数，文案一律省略。
const TOP = { id: 'a', placement: 'top' } as const
const FALLBACK = { id: 'b' } as const
const BOTTOM = { id: 'c', placement: 'bottom-end' } as const

export const notificationSuite: ConformanceSuite = {
  component: 'notification',
  anatomy: notificationAnatomy,
  // 键盘表里叠摞的 Escape 归这份套件，卡片那几行归卡片那份（notification-item.suite.ts）
  keyboard: { ...notificationKeyboard, rows: notificationKeyboard.rows.filter(row => row.id === 'notification.kbd.collapse') },
  // 两个位各一摞，卡片不在这份 fixture 里，也塞不进来：
  // 卡片在 WC 侧是另一个自定义元素（<xh-notification-item>），而一致性夹具只挂一个宿主，
  // item 起的那几个角色节点在这棵树里永远接不到线；Vue 侧的 group 又是按队列渲染子节点的，
  // 空队列一张不出，与 WC 的静态树逐帧比对当场分叉。
  // 卡片另有一份套件（notification-item.suite.ts），计时、暂停、按压与退场都在那里
  fixture: {
    part: 'root',
    children: [
      { part: 'group', attrs: { placement: 'top' } },
      { part: 'group', attrs: { placement: 'bottom-end' } },
    ],
  },
  cases: [
    {
      name: '空队列：那一摞是地标不是 live region，两摞都报空',
      spec: { apg: `${APG}#roles_states_properties` },
      initial: {
        counts: { root: 1, group: 2 },
        parts: {
          // root 是 display:contents 的作用域包装，量出来 0×0，地标挂在它身上跳过去落不到地方
          'root': { 'role': null, 'data-count': '0', 'data-empty': '' },
          // 每条通知自己就是 status / alert，外面再套一层 live region 会让读屏念两遍
          'group[0]': {
            'role': 'region',
            'aria-label': 'Notifications',
            'data-placement': 'top',
            // 缺省是卡片：逐条排开，不叠
            'data-preset': 'card',
            'data-stacked': null,
            'data-expanded': null,
            'data-count': '0',
            'data-empty': '',
          },
          'group[1]': { 'role': 'region', 'data-placement': 'bottom-end', 'data-count': '0', 'data-empty': '' },
        },
      },
    },
    {
      name: '按 placement 分组：没写位置的条目落到队列的默认位',
      spec: { apg: APG },
      props: { defaultItems: [TOP, FALLBACK, BOTTOM] },
      initial: {
        parts: {
          'root': { 'data-count': '3', 'data-empty': null },
          'group[0]': { 'data-count': '1', 'data-empty': null },
          // b 没写 placement，跟着队列的缺省落位 bottom-end 落在这一摞
          'group[1]': { 'data-count': '2', 'data-empty': null },
        },
      },
    },
    {
      name: 'placement 改写默认落位：没写位置的条目跟着一起搬家',
      spec: { apg: APG },
      props: { placement: 'top', defaultItems: [FALLBACK] },
      initial: {
        parts: {
          'root': { 'data-count': '1' },
          'group[0]': { 'data-count': '1', 'data-empty': null },
          'group[1]': { 'data-count': '0', 'data-empty': '' },
        },
      },
    },
    {
      name: 'group 不写 placement 时用队列的位，data-placement 报的就是它',
      spec: { apg: APG },
      // 只留一摞、且不声明位置：缺省值的唯一事实源在 connect，两侧都不该在自己那边再兜一份
      fixture: () => ({ part: 'root', children: [{ part: 'group' }] }),
      props: { placement: 'top-start', defaultItems: [FALLBACK] },
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
        defaultItems: [
          { id: 'a', placement: 'bottom-end' },
          { id: 'b', placement: 'bottom-end' },
          { id: 'c', placement: 'bottom-end' },
        ],
      },
      initial: {
        parts: {
          // 三条进队、只留两条
          'root': { 'data-count': '2' },
          'group[1]': { 'data-count': '2' },
        },
      },
    },
    {
      name: '不给 max：卡片每个位置默认只留 5 条，多出来的不再渲染',
      spec: { apg: APG },
      props: {
        defaultItems: Array.from({ length: NOTIFICATION_MAX + 2 }, (_, i) => ({ id: `n${i}`, placement: 'bottom-end' as const })),
      },
      initial: {
        parts: {
          'root': { 'data-count': String(NOTIFICATION_MAX) },
          'group[1]': { 'data-count': String(NOTIFICATION_MAX) },
        },
      },
    },
    {
      name: 'max 给 Infinity 即不限：多少条都留',
      spec: { apg: APG },
      props: {
        max: Number.POSITIVE_INFINITY,
        defaultItems: Array.from({ length: NOTIFICATION_MAX + 2 }, (_, i) => ({ id: `n${i}`, placement: 'bottom-end' as const })),
      },
      initial: {
        parts: {
          'root': { 'data-count': String(NOTIFICATION_MAX + 2) },
          'group[1]': { 'data-count': String(NOTIFICATION_MAX + 2) },
        },
      },
    },
    {
      name: '受控队列：宿主整份换掉，界面跟着走；换回空队列即报空',
      spec: { adr: 'controlled-uncontrolled' },
      props: { items: [] },
      steps: [
        {
          kind: 'setProps',
          props: { items: [TOP, BOTTOM] },
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
          props: { items: [] },
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
        parts: { 'group[0]': { 'aria-label': '通知中心' } },
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
    {
      name: 'preset=toast：没写的几项取轻提示的缺省——落底部居中、叠成一摞、最多 3 条、间距 12',
      spec: { adr: 'notification-preset' },
      fixture: () => ({ part: 'root', children: [{ part: 'group' }] }),
      props: {
        preset: 'toast',
        defaultItems: Array.from({ length: 5 }, (_, i) => ({ id: `t${i}` })),
      },
      initial: {
        parts: {
          root: { 'data-count': '3' },
          group: {
            'data-placement': 'bottom',
            'data-preset': 'toast',
            'data-stacked': '',
            'data-expanded': null,
            'data-count': '3',
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '内联 style 不进归一化快照（快照只收结构与 aria-/data- 属性）',
          run: ({ doc }) => {
            const gap = groupEl(doc).style.gap
            if (gap !== '12px')
              throw new Error(`轻提示那一摞的间距应为 12px，实际 "${gap}"`)
          },
        },
      ],
    },
    {
      name: 'Escape：叠放的一摞被焦点展开后收起，group 撤下 data-expanded',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['notification.kbd.collapse'],
      fixture: () => ({ part: 'root', children: [{ part: 'group' }] }),
      props: { preset: 'toast' },
      steps: [
        {
          kind: 'raw',
          why: '夹具的 group 里没有卡片可落焦（卡片在 WC 侧是另一个元素），焦点进入这一摞改在 group 上直接派 focusin',
          run: async ({ doc }) => {
            // 叠摞的追踪在提交后的微任务里接上
            await new Promise(resolve => setTimeout(resolve, 0))
            groupEl(doc).dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
          },
          expect: { parts: { group: { 'data-stacked': '', 'data-expanded': '' } } },
        },
        {
          kind: 'raw',
          why: 'Escape 派在展开着的那一摞上：卡片不是层，按键不经焦点所在的节点转发',
          run: ({ doc }) => {
            groupEl(doc).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
          },
          expect: { parts: { group: { 'data-expanded': null } } },
        },
      ],
    },
    {
      name: '预设只管没写的那几项：写了 stacked=false 就逐条排开，写了落位就落在那儿',
      spec: { adr: 'notification-preset' },
      fixture: () => ({ part: 'root', children: [{ part: 'group' }] }),
      props: { preset: 'toast', stacked: false, placement: 'top-end', defaultItems: [FALLBACK] },
      initial: {
        parts: {
          group: {
            'data-placement': 'top-end',
            'data-preset': 'toast',
            'data-stacked': null,
            'data-count': '1',
          },
        },
      },
    },
  ],
}
