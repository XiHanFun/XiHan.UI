import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { buildMonthGrid, buildWeekDays, datePickerAnatomy, datePickerKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/'

/**
 * 固定挑 2024 年 2 月：闰年，zh-CN 下从 1 月 29 日起算，首尾两行带邻月的日子。
 * 用例一律显式给 defaultValue 与 timeZone，断言不随运行日期改口。
 * fixture 是静态的，本套件不做翻月操作；翻月与网格内键盘导航由 calendar 套件覆盖。
 */
const ANCHOR = '2024-02-15'
const LOCALE = 'zh-CN'
const BASE_PROPS = { defaultValue: ANCHOR, locale: LOCALE, timeZone: 'UTC' } as const

const GRID = buildMonthGrid(ANCHOR, { locale: LOCALE })
const WEEK_DAYS = buildWeekDays({ reference: GRID.monthStart, locale: LOCALE, timeZone: 'UTC' })

/** 作者写足六个段位节点，用不上的由连接层收起、不卸载。 */
const SEGMENT_NODES = 6

/** 快捷选项写死在锚点月里，断言不随运行日期改口。 */
const PRESETS = [
  { value: '2024-02-01', label: '月初' },
  { value: '2024-02-15', label: '锚点日' },
  { value: '2024-02-29', label: '月末' },
] as const

const CALENDAR = '[data-scope="calendar"]'
const FIELD = '[data-scope="date-field"]'
/** 分段容器；区间模式下有两组，文档序即起止序。 */
const SEGMENT_GROUP = '[data-scope="date-picker"][data-part="segment-group"]'

function cellTrigger(doc: Document, value: string): HTMLElement {
  const el = doc.querySelector<HTMLElement>(`${CALENDAR}[data-part="cell-trigger"][data-value="${value}"]`)
  if (!el)
    throw new Error(`网格里没有 ${value} 这一格`)
  return el
}

/** 某一天的 gridcell，选中态报在这一层。 */
function gridCell(doc: Document, value: string): HTMLElement {
  const el = doc.querySelector<HTMLElement>(`${CALENDAR}[data-part="cell"][data-value="${value}"]`)
  if (!el)
    throw new Error(`网格里没有 ${value} 这一格`)
  return el
}

/** 第 group 组分段容器：0 是起点，1 是终点（只有区间模式有第二组）。 */
function segmentGroupAt(doc: Document, group: number): HTMLElement {
  const el = doc.querySelectorAll<HTMLElement>(SEGMENT_GROUP)[group]
  if (!el)
    throw new Error(`没有第 ${group} 组分段容器`)
  return el
}

/** 某一组内部的段位，文档序。段位戴的是分段输入那份 scope。 */
function segments(doc: Document, group = 0): HTMLElement[] {
  return [...segmentGroupAt(doc, group).querySelectorAll<HTMLElement>(`${FIELD}[data-part="segment"]`)]
}

function segmentTexts(doc: Document, group = 0): string[] {
  return segments(doc, group).map(el => el.textContent ?? '')
}

function expectTexts(doc: Document, want: readonly string[], why: string, group = 0): void {
  const got = segmentTexts(doc, group).slice(0, want.length)
  if (got.join('|') !== want.join('|'))
    throw new Error(`${why}：期望 [${want.join(',')}]，实际 [${got.join(',')}]`)
}

/** 第 group 份隐藏输入；两组各有一份，文档序即起止序。 */
function expectHidden(doc: Document, want: string, why: string, group = 0): void {
  const el = doc.querySelectorAll<HTMLInputElement>(`${FIELD}[data-part="hidden-input"]`)[group]
  const got = el?.value ?? ''
  if (got !== want)
    throw new Error(`${why}：第 ${group} 份隐藏输入期望 "${want}"，实际 "${got}"`)
}

/** 点某一天；格子属于内嵌日历那份解剖。 */
async function pickDay(ctx: RawStepContext, value: string): Promise<void> {
  cellTrigger(ctx.doc, value).click()
  await ctx.flush()
}

/** 快捷选项条目，文档序。 */
function presetItems(doc: Document): HTMLElement[] {
  return [...doc.querySelectorAll<HTMLElement>('[data-scope="date-picker"][data-part="preset"]')]
}

/** 往某一条快捷选项上直接派按键；处理器挂在 presets 那一层，靠冒泡收。 */
async function pressOnPreset(ctx: RawStepContext, el: HTMLElement, key: string): Promise<void> {
  // 显式 cancelable，否则 preventDefault 是空操作
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  await ctx.flush()
}

/** 往某一组的某一段上直接派按键。 */
async function pressOnSegment(
  ctx: RawStepContext,
  index: number,
  keys: readonly string[],
  group = 0,
): Promise<void> {
  const el = segments(ctx.doc, group)[index]
  if (!el)
    throw new Error(`第 ${group} 组里找不到第 ${index} 段`)
  el.focus()
  for (const key of keys)
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  await ctx.flush()
}

function expectFocusedSegment(doc: Document, index: number, why: string, group = 0): void {
  const nodes = segments(doc, group)
  if (doc.activeElement !== nodes[index]) {
    const at = nodes.indexOf(doc.activeElement as HTMLElement)
    throw new Error(`${why}：期望焦点在第 ${group} 组第 ${index} 段，实际在同组第 ${at} 段`)
  }
}

/**
 * 网格由作者按 weeks 渲染，日期身份写在 cell 上，cell-trigger 跟着所在的 cell 走。
 * 段位与格子分别落在 segment-group / calendar 两个挂载点里，戴内嵌那两份解剖的 scope。
 */
const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    // 用 span 不用 label：段位是 div，不是 <label for> 能标注的控件
    { part: 'label', tag: 'span', text: '截止日期' },
    {
      part: 'control',
      children: [
        {
          part: 'segment-group',
          children: Array.from({ length: SEGMENT_NODES }, (_, i) => ({
            part: 'segment',
            tag: 'div',
            attrs: { index: String(i) },
          })),
        },
        { part: 'clear-trigger', tag: 'button', text: '清空' },
        { part: 'trigger', tag: 'button', text: '选择日期' },
      ],
    },
    { part: 'hidden-input', tag: 'input' },
    {
      part: 'positioner',
      children: [{
        part: 'content',
        children: [{
          part: 'calendar',
          children: [
            {
              part: 'header',
              children: [
                { part: 'prev-trigger', tag: 'button', text: '上个月' },
                { part: 'heading', text: '2024年2月' },
                { part: 'next-trigger', tag: 'button', text: '下个月' },
              ],
            },
            {
              part: 'grid',
              children: [
                {
                  part: 'grid-head',
                  children: [{
                    // 列头包一层行：columnheader 不直接挂在 rowgroup 下
                    part: 'week-row',
                    children: WEEK_DAYS.map(d => ({
                      part: 'week-day',
                      tag: 'span',
                      attrs: { value: String(d.value) },
                      text: d.label,
                    })),
                  }],
                },
                {
                  part: 'grid-body',
                  children: GRID.weeks.map(week => ({
                    part: 'week-row',
                    children: week.map(day => ({
                      part: 'cell',
                      attrs: { value: day.value },
                      children: [{ part: 'cell-trigger', text: String(day.day) }],
                    })),
                  })),
                },
              ],
            },
          ],
        }],
      }],
    },
  ],
}

/**
 * 区间模式的标记：控件里两组段位、表单出口两份，靠 index 属性认起止。
 * 默认 fixture 保持单组，只有区间用例派生成这一份。
 */
function rangeFixture(base: FixtureNode): FixtureNode {
  const pair = (node: FixtureNode): FixtureNode[] =>
    [0, 1].map(index => ({ ...node, attrs: { ...node.attrs, index: String(index) } }))
  return {
    ...base,
    children: base.children?.flatMap((node) => {
      if (node.part === 'hidden-input')
        return pair(node)
      if (node.part !== 'control')
        return [node]
      return [{
        ...node,
        children: node.children?.flatMap(kid => (kid.part === 'segment-group' ? pair(kid) : [kid])),
      }]
    }),
  }
}

/** 末一条禁用、中间一条与模式不配（单选给了区间）：两者都该停得上去、按不下去。 */
const PRESETS_MIXED = [
  { value: '2024-02-01', label: '月初' },
  { value: '2024-02-01/2024-02-29', label: '整月' },
  { value: '2024-02-15', label: '锚点日' },
  { value: '2024-02-29', label: '月末', disabled: true },
] as const

/** 快捷选项列排在日历前面，只有用到它的那条用例派生这一份。 */
function presetsFixture(base: FixtureNode, presets: readonly { value: string, label: string }[] = PRESETS): FixtureNode {
  const list: FixtureNode = {
    part: 'presets',
    children: presets.map(preset => ({
      part: 'preset',
      attrs: { value: preset.value },
      text: preset.label,
    })),
  }
  return {
    ...base,
    children: base.children?.map((node) => {
      if (node.part !== 'positioner')
        return node
      return {
        ...node,
        children: node.children?.map(content => ({
          ...content,
          children: [list, ...(content.children ?? [])],
        })),
      }
    }),
  }
}

const RANGE_PROPS = { locale: LOCALE, timeZone: 'UTC', selectionMode: 'range' } as const

export const datePickerSuite: ConformanceSuite = {
  component: 'date-picker',
  anatomy: datePickerAnatomy,
  keyboard: datePickerKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '段上 Enter 收起：段位敲出来的值不触发「选完即收」，这是那条路的收口手势',
      spec: { apg: APG },
      covers: ['date-picker.kbd.segment-close'],
      props: { ...BASE_PROPS, defaultOpen: true },
      steps: [
        {
          kind: 'raw',
          why: '要把键派在真正可聚焦的段位上，而 key 步骤只往 activeElement 上派',
          run: async (ctx) => {
            const seg = ctx.doc.querySelector('[data-scope="date-field"][data-part="segment"]')
            if (!(seg instanceof HTMLElement))
              throw new Error('找不到段位节点')
            seg.focus()
            seg.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
            await ctx.flush()
            const content = ctx.doc.querySelector('[data-scope="date-picker"][data-part="content"]')
            if (!content?.hasAttribute('hidden'))
              throw new Error('段上按 Enter 没能把浮层收起')
          },
        },
      ],
    },
    {
      name: '段上 Alt+ArrowDown 展开：触发钮是可选部件，键盘那条入口不能只挂在它身上',
      spec: { apg: APG },
      covers: ['date-picker.kbd.segment-open'],
      props: BASE_PROPS,
      steps: [
        {
          kind: 'raw',
          // 段位属于分段输入那份解剖（data-scope=date-field），不在本组件的 part 表里，
          // 寻址不到；而 key 步骤只往 activeElement 上派，所以这一步只能直接取真节点
          why: '要把键派在真正可聚焦的段位上，而段位不是本组件的 part',
          run: async (ctx) => {
            const segment = ctx.doc.querySelector<HTMLElement>('[data-scope="date-field"][data-part="segment"]')
            if (!segment)
              throw new Error('找不到段位节点')
            segment.focus()
            segment.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true, cancelable: true }))
            await ctx.flush()
            const content = ctx.doc.querySelector<HTMLElement>('[data-scope="date-picker"][data-part="content"]')
            if (content?.hasAttribute('hidden'))
              throw new Error('段上按 Alt+ArrowDown 没能把浮层展开')
          },
        },
      ],
    },
    {
      name: '三轴接线到 root 的 data-*：只落一处，输入行与浮层都从它继承',
      spec: { apg: APG },
      props: { variant: 'subtle', tone: 'success', size: 'lg' },
      initial: {
        parts: { root: { 'data-variant': 'subtle', 'data-tone': 'success', 'data-size': 'lg' } },
      },
    },
    {
      name: '三轴都不给时一个属性都不写出来，皮肤据此走缺省档',
      spec: { apg: APG },
      initial: {
        parts: { root: { 'data-variant': null, 'data-tone': null, 'data-size': null } },
      },
    },
    {
      name: '初始收起：trigger 自报浮层是对话框，content 带 hidden，分段容器由标题命名',
      spec: { apg: APG },
      props: BASE_PROPS,
      initial: {
        order: [
          'root',
          'label',
          'control',
          'segment-group',
          'clear-trigger',
          'trigger',
          'positioner',
          'content',
          'calendar',
        ],
        counts: { 'root': 1, 'segment-group': 1, 'content': 1, 'calendar': 1 },
        parts: {
          'root': {
            'data-state': 'closed',
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
          },
          'segment-group': {
            'role': 'group',
            'data-index': '0',
            // 单值只有一组：名字借标题，不另报 aria-label
            'aria-labelledby': '@part(label)',
            'aria-label': null,
            'aria-disabled': 'false',
            'data-complete': '',
            'data-empty': null,
          },
          'trigger': {
            'type': 'button',
            'aria-haspopup': 'dialog',
            'aria-expanded': 'false',
            'aria-controls': '@part(content)',
            'aria-labelledby': '@part(label)',
            'data-state': 'closed',
            'disabled': null,
          },
          'clear-trigger': {
            // 有值时可按；不占 Tab 位但带名字
            'type': 'button',
            'tabindex': '-1',
            'aria-hidden': null,
            'aria-label': 'Clear',
            'hidden': null,
            'disabled': null,
          },
          'content': {
            'role': 'dialog',
            'aria-modal': 'false',
            'aria-labelledby': '@part(label)',
            'tabindex': '-1',
            'hidden': '',
            'data-state': 'closed',
          },
          'positioner': { 'data-state': 'closed', 'data-placement': 'bottom-start' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '段位与隐藏输入是内嵌解剖的部件，按本组件的 scope 采不进快照',
          run: ({ doc }) => {
            expectTexts(doc, ['2024', '02', '15'], '默认值逐段补零显示')
            expectHidden(doc, ANCHOR, '默认值应落到隐藏输入')
          },
        },
      ],
    },
    {
      name: 'Enter / Space 开合：trigger 是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['date-picker.kbd.open', 'date-picker.kbd.toggle'],
      props: BASE_PROPS,
      steps: [nativeActivation('date-picker', 'trigger')],
    },
    {
      name: '点 trigger 展开：content 摘掉 hidden，aria-expanded 翻面并派发 open-change',
      spec: { apg: APG },
      props: BASE_PROPS,
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { 'hidden': null, 'data-state': 'open' },
              root: { 'data-state': 'open' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: { content: { hidden: '' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '展开后焦点落到聚焦日那一格，不是浮层里第一个可聚焦元素',
      spec: { apg: `${APG}#kbd_label` },
      props: BASE_PROPS,
      steps: [
        { kind: 'click', part: 'trigger' },
        // 快照的 activeElement 只认本组件 scope，落点交给下面那条 raw 比对
        { kind: 'settle', until: { activeElement: 'calendar' } },
        {
          kind: 'raw',
          why: '落点是哪一格只有格子自己知道（它戴的是日历那份 scope）',
          run: ({ doc }) => {
            if (doc.activeElement !== cellTrigger(doc, ANCHOR))
              throw new Error('焦点应落在当前选中日那一格')
          },
        },
      ],
    },
    {
      name: '快捷选项列自成一套键盘：上下键在条目间走，Enter 整份写进去并收起',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction' },
      covers: ['date-picker.kbd.preset-move', 'date-picker.kbd.preset-pick'],
      fixture: presetsFixture,
      props: { ...BASE_PROPS, presets: [...PRESETS] },
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'calendar' } },
        {
          kind: 'raw',
          why: '这一列的键盘处理器挂在 presets 自己身上，按键要从条目上派；条目按 data-value 认，不进快照',
          run: async (ctx) => {
            const items = presetItems(ctx.doc)
            // 锚点是命中当前值的那一条（BASE_PROPS 选中 2024-02-15，即第 1 条）
            if (items[1]?.getAttribute('tabindex') !== '0')
              throw new Error('Tab 落点应停在命中当前值的那一条上')
            items[1]!.focus()
            await pressOnPreset(ctx, items[1]!, 'ArrowDown')
            if (ctx.doc.activeElement !== items[2])
              throw new Error('下键应把焦点移到下一条快捷选项')
            await pressOnPreset(ctx, items[2]!, 'Enter')
            expectHidden(ctx.doc, '2024-02-29', 'Enter 应把这一条整份写进选中值')
          },
          expect: {
            parts: { content: { hidden: '' } },
            events: [
              { type: 'value-change', detail: { value: ['2024-02-29'] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
      ],
    },
    {
      name: '按不下去的快捷选项：方向键停得上去，Enter 与点按都不写值；命中当前值的那条报 aria-selected',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction' },
      covers: ['date-picker.kbd.preset-move', 'date-picker.kbd.preset-pick'],
      fixture: base => presetsFixture(base, PRESETS_MIXED),
      props: { ...BASE_PROPS, presets: [...PRESETS_MIXED] },
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'calendar' } },
        {
          kind: 'raw',
          why: '条目按 data-value 认，不进快照；禁用与模式不配两种「按不下去」要逐条看属性',
          run: async (ctx) => {
            const items = presetItems(ctx.doc)
            const states = items.map(el => [el.getAttribute('aria-selected'), el.getAttribute('aria-disabled'), el.getAttribute('tabindex')].join('|'))
            const want = ['false|false|-1', 'false|true|-1', 'true|false|0', 'false|true|-1']
            if (states.join(',') !== want.join(','))
              throw new Error(`快捷选项的状态应为 ${want.join(' ')}，实际 ${states.join(' ')}`)
            items[2]!.focus()
            await pressOnPreset(ctx, items[2]!, 'ArrowDown')
            if (ctx.doc.activeElement !== items[3])
              throw new Error('下键应能停到禁用的那一条上')
            await pressOnPreset(ctx, items[3]!, 'Enter')
            expectHidden(ctx.doc, ANCHOR, 'Enter 按在禁用那条上不该写值')
            items[1]!.click()
            await ctx.flush()
            expectHidden(ctx.doc, ANCHOR, '点与模式不配的那条不该写值')
          },
          expect: {
            parts: { content: { hidden: null } },
            events: [],
          },
        },
      ],
    },
    {
      name: 'Escape 收起并把焦点还给 trigger，选中值不变',
      spec: { apg: `${APG}#kbd_label` },
      covers: ['date-picker.kbd.escape'],
      props: BASE_PROPS,
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'calendar' } },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { content: { hidden: '' }, trigger: { 'aria-expanded': 'false' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'trigger' },
          expect: { activeElement: { part: 'trigger', exact: true } },
        },
        {
          kind: 'raw',
          why: '值没动这件事要看隐藏输入的 value（property，进不了快照）',
          run: ({ doc }) => expectHidden(doc, ANCHOR, 'Escape 只收起浮层，不该动值'),
        },
      ],
    },
    {
      // jsdom 不移动 Tab 焦点，用例手动把焦点挪到层外的下一站
      name: 'Tab 不拦按键：焦点走出浮层后随即收起，且不抢回焦点',
      spec: { apg: `${APG}#kbd_label` },
      covers: ['date-picker.kbd.tab'],
      props: BASE_PROPS,
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'calendar' } },
        {
          kind: 'raw',
          why: 'jsdom 按 Tab 不移动焦点，「走出浮层」这一下只能手动补；且「焦点没被抢回」是否定断言，只能直读 activeElement',
          run: async (ctx) => {
            // 显式 cancelable，否则 preventDefault 是空操作
            const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
            cellTrigger(ctx.doc, ANCHOR).dispatchEvent(tab)
            await ctx.flush()
            if (tab.defaultPrevented)
              throw new Error('Tab 被拦下了，焦点走不出浮层')

            // 模拟 Tab 的下一站，取一个层外的节点
            const next = ctx.doc.createElement('button')
            ctx.doc.body.append(next)
            try {
              next.focus()
              await ctx.flush()
              // 焦点归还排在收起之后的一帧，等过那一拍再断言
              await new Promise(r => setTimeout(r, 50))
              if (ctx.doc.activeElement !== next)
                throw new Error('让位式关闭不该把焦点从用户刚 Tab 过去的控件上抢回来')
            }
            finally {
              // 移除后焦点落回 body，不影响下一个用例
              next.remove()
            }
          },
          expect: {
            parts: { content: { hidden: '' }, trigger: { 'aria-expanded': 'false' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '点日历里的一天：值同步到分段输入，closeOnSelect 默认即收起',
      spec: { apg: APG },
      covers: ['date-picker.kbd.select'],
      props: BASE_PROPS,
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'raw',
          why: '格子是内嵌日历的部件，声明式步骤按本组件的 scope 找不到它',
          run: async (ctx) => {
            await pickDay(ctx, '2024-02-20')
            expectTexts(ctx.doc, ['2024', '02', '20'], '选中日期应立刻同步进段位')
            expectHidden(ctx.doc, '2024-02-20', '选中日期应落到隐藏输入')
          },
          expect: {
            parts: { content: { hidden: '' } },
            events: [
              { type: 'value-change', detail: { value: ['2024-02-20'] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
      ],
    },
    {
      name: 'closeOnSelect=false：选完留在展开态，接着挑',
      spec: { apg: APG },
      props: { ...BASE_PROPS, closeOnSelect: false },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'raw',
          why: '格子是内嵌日历的部件',
          run: ctx => pickDay(ctx, '2024-02-20'),
          expect: {
            parts: { content: { hidden: null } },
            events: [{ type: 'value-change', detail: { value: ['2024-02-20'] } }],
          },
        },
      ],
    },
    {
      name: '区间：只落起点不收起，两端都落定才收起',
      spec: { apg: APG },
      fixture: rangeFixture,
      props: { ...RANGE_PROPS, defaultValue: [] },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'raw',
          why: '格子是内嵌日历的部件，段位是内嵌分段输入的部件',
          run: async (ctx) => {
            await pickDay(ctx, '2024-02-10')
            expectTexts(ctx.doc, ['2024', '02', '10'], '日历落的起点进第一组', 0)
            expectTexts(ctx.doc, ['yyyy', 'mm', 'dd'], '终点还没落定，第二组留占位串', 1)
          },
          expect: {
            parts: { content: { hidden: null } },
            // 区间只落了起点，closeOnSelect 不起跳，没有 open-change
            events: [{ type: 'value-change', detail: { value: ['2024-02-10'] } }],
          },
        },
        {
          kind: 'raw',
          why: '同上',
          run: async (ctx) => {
            await pickDay(ctx, '2024-02-20')
            expectTexts(ctx.doc, ['2024', '02', '10'], '起点留在第一组', 0)
            expectTexts(ctx.doc, ['2024', '02', '20'], '终点落进第二组', 1)
            expectHidden(ctx.doc, '2024-02-10', '起点那份表单出口', 0)
            expectHidden(ctx.doc, '2024-02-20', '终点那份表单出口', 1)
          },
          expect: {
            parts: { content: { hidden: '' } },
            // 落终点凑满区间，closeOnSelect（缺省 true）随即收起：先值后开合
            events: [
              { type: 'value-change', detail: { value: ['2024-02-10', '2024-02-20'] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
      ],
    },
    {
      name: '区间：终点那组段位自己能敲，按位只改终点，起点原封不动',
      spec: { apg: APG },
      fixture: rangeFixture,
      props: { ...RANGE_PROPS, defaultValue: ['2024-02-10', '2024-02-20'] },
      steps: [
        {
          kind: 'raw',
          why: '段位与隐藏输入是内嵌分段输入的部件，按本组件的 scope 找不到',
          run: async (ctx) => {
            // 第三段是日：上键把终点的 20 推成 21
            await pressOnSegment(ctx, 2, ['ArrowUp'], 1)
            expectTexts(ctx.doc, ['2024', '02', '10'], '起点那组一个字都不该动', 0)
            expectTexts(ctx.doc, ['2024', '02', '21'], '上键把终点推进一天', 1)
            expectHidden(ctx.doc, '2024-02-10', '起点那份表单出口不动', 0)
            expectHidden(ctx.doc, '2024-02-21', '终点那份表单出口跟着改口', 1)
          },
          expect: {
            // 段位那一路不收起浮层，也不排序：终点还是排在起点后面
            events: [{ type: 'value-change', detail: { value: ['2024-02-10', '2024-02-21'] } }],
          },
        },
      ],
    },
    {
      name: '区间：清空一次抹掉两端，焦点回起点那组的首段',
      spec: { apg: APG },
      fixture: rangeFixture,
      props: { ...RANGE_PROPS, defaultValue: ['2024-02-10', '2024-02-20'] },
      steps: [
        {
          kind: 'click',
          part: 'clear-trigger',
          expect: {
            parts: {
              'clear-trigger': { 'hidden': '', 'disabled': null, 'data-disabled': null },
              'segment-group[0]': { 'data-empty': '', 'data-complete': null },
              'segment-group[1]': { 'data-empty': '', 'data-complete': null },
            },
            events: [{ type: 'value-change', detail: { value: [] } }],
          },
        },
        {
          kind: 'raw',
          why: '段位与隐藏输入是内嵌解剖的部件',
          run: ({ doc }) => {
            expectTexts(doc, ['yyyy', 'mm', 'dd'], '起点那组退回占位串', 0)
            expectTexts(doc, ['yyyy', 'mm', 'dd'], '终点那组一并退回占位串', 1)
            expectHidden(doc, '', '起点没有值可提交', 0)
            expectHidden(doc, '', '终点没有值可提交', 1)
            expectFocusedSegment(doc, 0, '清空后焦点该回到起点那组的首段', 0)
          },
        },
      ],
    },
    {
      name: '区间：两组各是一个 group，各报各的名字，不共用标题',
      spec: { apg: APG },
      fixture: rangeFixture,
      props: { ...RANGE_PROPS, defaultValue: [] },
      initial: {
        order: [
          'root',
          'label',
          'control',
          'segment-group[0]',
          'segment-group[1]',
          'clear-trigger',
          'trigger',
          'positioner',
          'content',
          'calendar',
        ],
        counts: { 'segment-group': 2 },
        parts: {
          // 两组都指向同一个标题的话，读屏念出来是同一个名字，分不出敲的是哪一端
          'segment-group[0]': {
            'role': 'group',
            'data-index': '0',
            'aria-label': 'Start date',
            'aria-labelledby': null,
          },
          'segment-group[1]': {
            'role': 'group',
            'data-index': '1',
            'aria-label': 'End date',
            'aria-labelledby': null,
          },
        },
      },
      steps: [
        {
          kind: 'setProps',
          props: { translations: { startDate: '开始日期', endDate: '结束日期' } },
          expect: {
            parts: {
              'segment-group[0]': { 'aria-label': '开始日期' },
              'segment-group[1]': { 'aria-label': '结束日期' },
            },
          },
        },
      ],
    },
    {
      name: '清空按钮：无值不可按；点了值清空、焦点回首段',
      spec: { apg: APG },
      props: BASE_PROPS,
      steps: [
        {
          kind: 'click',
          part: 'clear-trigger',
          expect: {
            parts: {
              'clear-trigger': { 'hidden': '', 'disabled': null, 'data-disabled': null },
              'segment-group': { 'data-empty': '', 'data-complete': null },
            },
            events: [{ type: 'value-change', detail: { value: [] } }],
          },
        },
        {
          kind: 'raw',
          why: '段位与隐藏输入是内嵌解剖的部件',
          run: ({ doc }) => {
            expectTexts(doc, ['yyyy', 'mm', 'dd'], '清空后逐段退回占位串')
            expectHidden(doc, '', '清空后没有值可提交')
            expectFocusedSegment(doc, 0, '清空后焦点该回到首段')
          },
        },
      ],
    },
    {
      name: '在段位里敲日期：值回到编排机，隐藏输入与选中格跟着改口',
      spec: { apg: APG },
      props: BASE_PROPS,
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'raw',
          why: '段位是内嵌分段输入的部件，按本组件的 scope 找不到',
          run: async (ctx) => {
            // 第三段是日：上键把 15 推成 16
            await pressOnSegment(ctx, 2, ['ArrowUp'])
            expectTexts(ctx.doc, ['2024', '02', '16'], '上键应把日推进一天')
            expectHidden(ctx.doc, '2024-02-16', '段位改完值要同步出去')
            if (gridCell(ctx.doc, '2024-02-16').getAttribute('aria-selected') !== 'true')
              throw new Error('日历应把新值那一格标成选中')
            if (gridCell(ctx.doc, ANCHOR).getAttribute('aria-selected') !== 'false')
              throw new Error('旧值那一格该让出选中态')
          },
          expect: {
            // 段位里敲日期不收起浮层
            parts: { content: { hidden: null } },
            events: [{ type: 'value-change', detail: { value: ['2024-02-16'] } }],
          },
        },
      ],
    },
    {
      name: '左右键与 Home/End 在段位之间移动，两端停住不回绕',
      spec: { apg: APG },
      props: BASE_PROPS,
      steps: [
        {
          kind: 'raw',
          why: '段位是内嵌分段输入的部件，焦点落点也只有它自己知道',
          run: async (ctx) => {
            await pressOnSegment(ctx, 0, ['ArrowLeft'])
            expectFocusedSegment(ctx.doc, 0, '首段再往左没有段可去')
            await pressOnSegment(ctx, 0, ['ArrowRight'])
            expectFocusedSegment(ctx.doc, 1, '右键换到下一段')
            await pressOnSegment(ctx, 1, ['End'])
            expectFocusedSegment(ctx.doc, 2, 'End 到末段')
            await pressOnSegment(ctx, 2, ['ArrowRight'])
            expectFocusedSegment(ctx.doc, 2, '末段再往右也不许绕到收起的第四段上')
            await pressOnSegment(ctx, 2, ['Home'])
            expectFocusedSegment(ctx.doc, 0, 'Home 回首段')
          },
        },
      ],
    },
    {
      name: '点标题把焦点送进首段',
      spec: { apg: APG },
      props: BASE_PROPS,
      steps: [
        {
          kind: 'click',
          part: 'label',
        },
        {
          kind: 'raw',
          why: '焦点落点是内嵌分段输入的部件',
          run: ({ doc }) => expectFocusedSegment(doc, 0, '点标题该把焦点送进首段'),
        },
      ],
    },
    {
      name: 'disabled：trigger 转原生 disabled，浮层展不开，段位退出 Tab 序、值也推不动',
      spec: { apg: APG },
      props: { ...BASE_PROPS, disabled: true, name: 'due' },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'segment-group': { 'aria-disabled': 'true', 'data-disabled': '' },
          'trigger': { disabled: '' },
          'clear-trigger': { hidden: '', disabled: null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '禁用时点击与按键都到不了守卫，只有直接派发才碰得到',
          run: async (ctx) => {
            const seg = segments(ctx.doc)[2]!
            if (seg.getAttribute('tabindex') !== null)
              throw new Error('禁用时段位该退出 Tab 序')
            seg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }))
            await ctx.flush()
            expectHidden(ctx.doc, ANCHOR, 'disabled 下值不该动')
          },
          expect: { parts: { content: { hidden: '' } }, events: [] },
        },
      ],
    },
    {
      name: '只读：浮层照常展开、日历照常浏览，但选中值改不动',
      spec: { apg: APG },
      props: { ...BASE_PROPS, readOnly: true },
      initial: { parts: { root: { 'data-readonly': '' }, trigger: { disabled: null } } },
      steps: [
        { kind: 'click', part: 'trigger', expect: { parts: { content: { hidden: null } } } },
        {
          kind: 'raw',
          why: '格子与段位都是内嵌解剖的部件',
          run: async (ctx) => {
            await pickDay(ctx, '2024-02-20')
            expectHidden(ctx.doc, ANCHOR, '只读时点日期不该改值')
            await pressOnSegment(ctx, 2, ['ArrowUp'])
            expectHidden(ctx.doc, ANCHOR, '只读时段位也改不动')
          },
          expect: { events: [] },
        },
      ],
    },
    {
      name: 'invalid / required：一路传到段位',
      spec: { apg: APG },
      props: { ...BASE_PROPS, invalid: true, required: true },
      initial: { parts: { 'root': { 'data-invalid': '' }, 'segment-group': { 'data-invalid': '' } } },
      steps: [
        {
          kind: 'raw',
          why: '段位是内嵌分段输入的部件',
          run: ({ doc }) => {
            const first = segments(doc)[0]!
            if (first.getAttribute('aria-invalid') !== 'true' || first.getAttribute('aria-required') !== 'true')
              throw new Error('invalid / required 该逐段标注')
          },
        },
      ],
    },
    {
      name: 'name 给了隐藏输入才参与提交',
      spec: { apg: APG },
      props: { ...BASE_PROPS, name: 'due' },
      steps: [
        {
          kind: 'raw',
          why: '隐藏输入是内嵌分段输入的部件，value 还是 property',
          run: ({ doc }) => {
            const el = doc.querySelector<HTMLInputElement>(`${FIELD}[data-part="hidden-input"]`)
            if (el?.getAttribute('name') !== 'due')
              throw new Error('name 该落到隐藏输入上')
            if (el.getAttribute('type') !== 'hidden')
              throw new Error('表单出口必须是 type=hidden')
            expectHidden(doc, ANCHOR, '隐藏输入应拿到 ISO 串')
          },
        },
      ],
    },
    {
      // 开局给展开态、写回走「收起」这一向：布尔属性真→假两个适配器都表达得出来
      name: '受控 open：点 trigger 只发意图不自改状态，宿主写回后才跟着走',
      spec: { apg: APG },
      props: { ...BASE_PROPS, open: true },
      steps: [
        // 焦点域过一拍才把焦点送进聚焦日那一格，先等它落定
        { kind: 'settle', until: { activeElement: 'calendar' } },
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            // 展开态点一下 = 收起意图；受控，所以只发不改
            parts: { content: { hidden: null }, trigger: { 'aria-expanded': 'true' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
        {
          kind: 'setProps',
          props: { open: false },
          expect: {
            parts: { content: { hidden: '' }, trigger: { 'aria-expanded': 'false' } },
            // 宿主写回不是新的用户意图，不再发一次
            events: [],
          },
        },
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            // 收起态点一下 = 展开意图；同样只发不改
            parts: { content: { hidden: '' }, trigger: { 'aria-expanded': 'false' } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: '受控 value：宿主不写回则两侧都纹丝不动，回调照发；写回才跟着走',
      spec: { apg: APG },
      props: { locale: LOCALE, timeZone: 'UTC', value: ANCHOR, defaultOpen: true },
      steps: [
        {
          kind: 'raw',
          why: '格子与段位都是内嵌解剖的部件',
          run: async (ctx) => {
            await pickDay(ctx, '2024-02-20')
            expectTexts(ctx.doc, ['2024', '02', '15'], '受控且宿主未写回：段位不该自作主张')
            expectHidden(ctx.doc, ANCHOR, '受控且宿主未写回：值不该动')
          },
          expect: {
            // 只有值受控；开合走 defaultOpen，closeOnSelect 照常收起并发 open-change
            parts: { content: { hidden: '' } },
            events: [
              { type: 'value-change', detail: { value: ['2024-02-20'] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
        {
          kind: 'setProps',
          props: { value: '2024-02-20' },
        },
        {
          kind: 'raw',
          why: '同上',
          run: ({ doc }) => {
            expectTexts(doc, ['2024', '02', '20'], '宿主写回后段位跟着走')
            expectHidden(doc, '2024-02-20', '宿主写回后值跟着走')
          },
        },
      ],
    },
    {
      name: 'locale 同时决定周首日与段序：同一份标记换个 locale 就换一副面孔',
      spec: { apg: APG },
      props: { ...BASE_PROPS, locale: 'en-US' },
      steps: [
        {
          kind: 'raw',
          why: '段位是内嵌分段输入的部件',
          run: ({ doc }) => {
            const [first, second, third] = segments(doc)
            if (first?.getAttribute('data-segment') !== 'month'
              || second?.getAttribute('data-segment') !== 'day'
              || third?.getAttribute('data-segment') !== 'year') {
              throw new Error('en-US 的段序应是月、日、年')
            }
            expectTexts(doc, ['02', '15', '2024'], 'en-US 下逐段按月日年显示')
          },
        },
      ],
    },
    {
      name: 'min / max 转给日历：界外的日子转 aria-disabled 且点不动',
      spec: { apg: APG },
      props: { ...BASE_PROPS, min: '2024-02-10' },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'raw',
          why: '格子是内嵌日历的部件',
          run: async (ctx) => {
            if (cellTrigger(ctx.doc, '2024-02-09').getAttribute('aria-disabled') !== 'true')
              throw new Error('min 之前的日子该转 aria-disabled')
            if (cellTrigger(ctx.doc, '2024-02-11').getAttribute('aria-disabled') !== 'false')
              throw new Error('界内的日子不该被禁用')
            await pickDay(ctx, '2024-02-09')
            expectHidden(ctx.doc, ANCHOR, '界外的日子点不动值')
          },
          expect: { events: [] },
        },
      ],
    },
  ],
}
