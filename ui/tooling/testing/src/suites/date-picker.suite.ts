import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { buildMonthGrid, buildWeekDays, datePickerAnatomy, datePickerKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/'

/**
 * 固定挑 2024 年 2 月：闰年（29 天）、zh-CN 下从 1 月 29 日起算，首尾两行都带着邻月的日子。
 * 用例一律显式给 defaultValue 与 timeZone，「今天」因此永远落在这个月之外，
 * 断言不会随运行日期改口。
 *
 * fixture 是静态的（作者照 weeks 写出来的那一棵树），所以本套件不做任何会翻月的操作——
 * 翻月之后作者该重画网格，而 fixture 重画不了，格子会停在上个月的日期上。
 * 翻月与网格内的键盘导航由 calendar 自己的套件保证。
 */
const ANCHOR = '2024-02-15'
const LOCALE = 'zh-CN'
const BASE_PROPS = { defaultValue: ANCHOR, locale: LOCALE, timeZone: 'UTC' } as const

const GRID = buildMonthGrid(ANCHOR, { locale: LOCALE })
const WEEK_DAYS = buildWeekDays({ reference: GRID.monthStart, locale: LOCALE, timeZone: 'UTC' })

/** 作者写足六个段位节点：精度只到天，用不上的那几个由连接层收起、不卸载。 */
const SEGMENT_NODES = 6

const CALENDAR = '[data-scope="calendar"]'
const FIELD = '[data-scope="date-field"]'

function cellTrigger(doc: Document, value: string): HTMLElement {
  const el = doc.querySelector<HTMLElement>(`${CALENDAR}[data-part="cell-trigger"][data-value="${value}"]`)
  if (!el)
    throw new Error(`网格里没有 ${value} 这一格`)
  return el
}

function segments(doc: Document): HTMLElement[] {
  return [...doc.querySelectorAll<HTMLElement>(`${FIELD}[data-part="segment"]`)]
}

function segmentTexts(doc: Document): string[] {
  return segments(doc).map(el => el.textContent ?? '')
}

function expectTexts(doc: Document, want: readonly string[], why: string): void {
  const got = segmentTexts(doc).slice(0, want.length)
  if (got.join('|') !== want.join('|'))
    throw new Error(`${why}：期望 [${want.join(',')}]，实际 [${got.join(',')}]`)
}

function expectHidden(doc: Document, want: string, why: string): void {
  const got = doc.querySelector<HTMLInputElement>(`${FIELD}[data-part="hidden-input"]`)?.value ?? ''
  if (got !== want)
    throw new Error(`${why}：隐藏输入期望 "${want}"，实际 "${got}"`)
}

/** 点某一天。格子是内嵌日历那一份解剖的部件，声明式步骤按本组件的 scope 找不到它。 */
async function pickDay(ctx: RawStepContext, value: string): Promise<void> {
  cellTrigger(ctx.doc, value).click()
  await ctx.flush()
}

/** 往某一段上直接派按键。禁用时段位没有 tabindex，焦点落不上去，只有直接派发才碰得到守卫。 */
async function pressOnSegment(ctx: RawStepContext, index: number, keys: readonly string[]): Promise<void> {
  const el = segments(ctx.doc)[index]
  if (!el)
    throw new Error(`找不到第 ${index} 段`)
  el.focus()
  for (const key of keys)
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  await ctx.flush()
}

function expectFocusedSegment(doc: Document, index: number, why: string): void {
  const el = segments(doc)[index]
  if (doc.activeElement !== el) {
    const at = segments(doc).indexOf(doc.activeElement as HTMLElement)
    throw new Error(`${why}：期望焦点在第 ${index} 段，实际在第 ${at} 段`)
  }
}

/**
 * 网格由作者渲染（连接层只给数据、不生成节点），fixture 因此就是「作者照 weeks 写出来的那棵树」。
 * 日期身份只写在 cell 上，cell-trigger 跟着它所在的 cell 走。
 * 段位与格子分别落在 input / calendar 两个挂载点里，戴的是内嵌那两份解剖的 scope。
 */
const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    // 刻意是 span 不是 label：段位是 div，不是可被 <label for> 标注的控件
    { part: 'label', tag: 'span', text: '截止日期' },
    {
      part: 'control',
      children: [
        {
          part: 'input',
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
                    // 列头得待在一行里：columnheader 直接挂在 rowgroup 下，grid 的行列语义从表头就断了
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

export const datePickerSuite: ConformanceSuite = {
  component: 'date-picker',
  anatomy: datePickerAnatomy,
  keyboard: datePickerKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始收起：trigger 自报浮层是对话框，content 带 hidden，分段容器由标题命名',
      spec: { apg: APG },
      props: BASE_PROPS,
      initial: {
        order: [
          'root',
          'label',
          'control',
          'input',
          'clear-trigger',
          'trigger',
          'positioner',
          'content',
          'calendar',
        ],
        counts: { root: 1, input: 1, content: 1, calendar: 1 },
        parts: {
          'root': {
            'data-state': 'closed',
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
          },
          'input': {
            'role': 'group',
            'aria-labelledby': '@part(label)',
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
            // 有值时可按；不占 Tab 位也不报给读屏（退格清段是同一个能力）
            'type': 'button',
            'tabindex': '-1',
            'aria-hidden': 'true',
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
        // 快照里的 activeElement 只认本组件 scope 的部件，格子戴的是日历那一份，
        // 因此这里不写快照期望，落点交给下面那条 raw 直接比对节点
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
      /**
       * 这一条同时守三件事，任一件塌了都会红：
       *  ① Tab 不被吞 —— 浮层不陷焦点，按键原样交给平台；
       *  ② 焦点真的走出浮层之后，消解层把浮层收起；
       *  ③ 收起时不把焦点从用户刚 Tab 过去的那个控件上抢回来。
       * jsdom 不实现 Tab 的焦点移动，第二步因此得手动把焦点挪到层外的下一站——
       * 浏览器替我们做的就只有这一下，其余全是组件自己的反应。
       */
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
            // 合成事件默认 cancelable=false，那样 preventDefault 是空操作、拦没拦根本看不出来
            const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
            cellTrigger(ctx.doc, ANCHOR).dispatchEvent(tab)
            await ctx.flush()
            if (tab.defaultPrevented)
              throw new Error('Tab 被拦下了，焦点走不出浮层')

            // 浏览器接着会把焦点送到 Tab 序列的下一站。整个输入行记在本层的分支里
            // （点 trigger、点段位都算层内交互），所以下一站必须取一个层外的节点
            const next = ctx.doc.createElement('button')
            ctx.doc.body.append(next)
            try {
              next.focus()
              await ctx.flush()
              // 焦点归还排在收起之后的一帧里，要等过那一拍才算数
              await new Promise(r => setTimeout(r, 50))
              if (ctx.doc.activeElement !== next)
                throw new Error('让位式关闭不该把焦点从用户刚 Tab 过去的控件上抢回来')
            }
            finally {
              // 留在文档里会把下一个用例的焦点断言带偏；移除后焦点自然落回 body
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
      props: { locale: LOCALE, timeZone: 'UTC', selectionMode: 'range', defaultValue: [] },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'raw',
          why: '格子是内嵌日历的部件',
          run: ctx => pickDay(ctx, '2024-02-10'),
          expect: {
            parts: { content: { hidden: null } },
            // 只有 value-change 一条：区间只落了起点，「选完了」的判据（两端都在）还不成立，
            // closeOnSelect 这一路整个不起跳，自然也没有 open-change
            events: [{ type: 'value-change', detail: { value: ['2024-02-10'] } }],
          },
        },
        {
          kind: 'raw',
          why: '同上',
          run: ctx => pickDay(ctx, '2024-02-20'),
          expect: {
            parts: { content: { hidden: '' } },
            // 这一步两条事件：落终点让区间凑满两端，closeOnSelect（缺省 true）随即把浮层收起。
            // 值与开合是各自独立的两条线，同一次转移里各发各的；顺序照动作次序——先写值，后收起
            events: [
              { type: 'value-change', detail: { value: ['2024-02-10', '2024-02-20'] } },
              { type: 'open-change', detail: { open: false } },
            ],
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
              'clear-trigger': { 'disabled': '', 'data-disabled': '' },
              'input': { 'data-empty': '', 'data-complete': null },
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
            if (cellTrigger(ctx.doc, '2024-02-16').getAttribute('aria-selected') !== 'true')
              throw new Error('日历应把新值那一格标成选中')
            if (cellTrigger(ctx.doc, ANCHOR).getAttribute('aria-selected') !== 'false')
              throw new Error('旧值那一格该让出选中态')
          },
          expect: {
            // 段位里敲日期不该把浮层收起——那时用户还在打字
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
          'input': { 'aria-disabled': 'true', 'data-disabled': '' },
          'trigger': { disabled: '' },
          'clear-trigger': { disabled: '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 照常规写法这几步全是空转：禁用的按钮上 click 被激活行为短路，
          // 禁用的段位没有 tabindex、焦点落不上去。必须直接往节点上派事件
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
      initial: { parts: { root: { 'data-invalid': '' }, input: { 'data-invalid': '' } } },
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
      /**
       * 开局给展开态、写回走「收起」这一向：HTML 的布尔属性只有在场/不在场两档，
       * 一个已经写着 open="false" 的属性再被置真时属性值原地不动，标记那一侧收不到任何变化；
       * 真→假则两个适配器都表达得出来。规格只有一份，得挑两边都演得出的那个方向。
       * 收起态那一侧的守卫由末尾那次点击接着守——两个方向都只发意图、都不自改 DOM。
       */
      name: '受控 open：点 trigger 只发意图不自改状态，宿主写回后才跟着走',
      spec: { apg: APG },
      props: { ...BASE_PROPS, open: true },
      steps: [
        // 焦点域要过一拍才把焦点送进聚焦日那一格，先等它落定，后面每一帧的落点才是确定的
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
            // 这一步两条事件：受控的只有值，开合这边给的是 defaultOpen（非受控），
            // 所以选完一天 closeOnSelect（缺省 true）照常把浮层收起，open-change 跟着发。
            // 「受控」要守的是不自作主张改**值**，不是什么都不做——意图照发、开合照走
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
