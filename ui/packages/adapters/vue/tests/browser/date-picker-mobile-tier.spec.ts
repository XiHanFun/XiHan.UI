// date-picker 浮层的手机档排布：面板放不下并排的那几块时，它们改成上下堆叠。
//
// 宿主视口固定改不动，换宽度只能靠内嵌 iframe：浮层挂进 iframe 的文档，
// 定位引擎按那份文档的视口算可用区，媒体查询也按它求值。
// 皮肤与令牌以 <style> 注入主文档，克隆一份进 iframe 的 head 才生效。
//
// 位置一律读 offsetTop / offsetLeft：面板展开时正播缩放动画，
// getBoundingClientRect 会把那一帧的缩放算进去，布局偏移量不受它影响。
import type { App, VNode } from 'vue'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerConfirmTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerPositioner,
  XhDatePickerPresetGroup,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTimePanel,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from '../../src'
import {
  assertDatePickerRootDocument,
  resolveDatePickerPortalTarget,
  useDatePickerWithRoot,
} from '../../src/components/date-picker/use-date-picker'
import { provideXhConfig } from '../../src/config/config'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 手机 / 平板 / 电脑三档各取一个宽度。 */
const PHONE = 375
const TABLET = 768
const DESKTOP = 1280

let frame: HTMLIFrameElement | null = null
let app: App | null = null

type PortalMode = 'same-document' | 'default'

/** 在给定宽度的 iframe 里挂一个展开着的日期选择器，返回它的文档。 */
function mountAt(width: number, render: () => VNode, portal: PortalMode = 'same-document'): Document {
  frame = document.createElement('iframe')
  frame.style.cssText = `width: ${width}px; height: 900px; border: 0`
  document.body.append(frame)

  const doc = frame.contentDocument
  if (!doc)
    throw new Error('iframe 没有文档')
  for (const node of document.querySelectorAll('style, link[rel="stylesheet"]'))
    doc.head.append(node.cloneNode(true))
  doc.body.style.margin = '0'
  const host = doc.createElement('div')
  doc.body.append(host)

  app = createApp({
    setup() {
      const portalRef = ref<HTMLElement | null>(null)
      if (portal === 'default')
        return () => render()

      // 目标是 DatePicker 的同级节点，而且在它之后提交 ref。Scope 初始化不得提前读取这个 getter。
      provideXhConfig({
        portalContainer: () => {
          const target = portalRef.value
          if (!target)
            throw new Error('portalContainer 在兄弟目标 ref 就绪前被读取')
          return target
        },
      })
      return () => h('div', [
        render(),
        h('div', { 'ref': portalRef, 'data-date-picker-portal-target': '' }),
      ])
    },
  })
  try {
    app.mount(host)
  }
  catch (error) {
    // 挂载期明确拒绝的配置没有形成可卸载应用；保留 iframe 给 afterEach 清理。
    app = null
    throw error
  }
  return doc
}

afterEach(() => {
  app?.unmount()
  app = null
  frame?.remove()
  frame = null
})

/** 等浮层落位：可用宽度要等引擎算完才写到 positioner 上，皮肤的夹取在那之后才成立。 */
async function contentAt(doc: Document): Promise<HTMLElement> {
  const win = doc.defaultView
  if (!win)
    throw new Error('iframe 没有窗口')
  for (let i = 0; i < 180; i += 1) {
    const positioner = doc.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='positioner']`)
    const content = doc.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='content']`)
    if (positioner?.style.getPropertyValue('--xh-_date-picker-available-w') && content)
      return content
    await new Promise(resolve => win.requestAnimationFrame(() => resolve(null)))
  }
  throw new Error('可用宽度一直没下发')
}

function part(doc: Document, name: string, extra = ''): HTMLElement {
  const hit = doc.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='${name}']${extra}`)
  if (!hit)
    throw new Error(`面板里没有 ${name}${extra}`)
  return hit
}

function parts(doc: Document, name: string): HTMLElement[] {
  return [...doc.querySelectorAll<HTMLElement>(`[data-scope='date-picker'][data-part='${name}']:not([hidden])`)]
}

/** 一张月历的内容：标题、星期行、日期矩阵。 */
function calendarBody(panel: any, weekDays: any): VNode[] {
  return [
    h(XhDatePickerHeader, null, () => [h(XhDatePickerHeading)]),
    h(XhDatePickerGrid, null, () => [
      h(XhDatePickerGridHead, null, () => [
        h(XhDatePickerWeekRow, null, () => (weekDays ?? []).map((d: any) =>
          h(XhDatePickerWeekDay, { key: d.value, value: d.value }))),
      ]),
      h(XhDatePickerGridBody, null, () => (panel.weeks ?? []).map((week: any) =>
        h(XhDatePickerWeekRow, { key: week[0].value }, () => week.map((day: any) =>
          h(XhDatePickerCell, { key: day.value, value: day.value }, () => [
            h(XhDatePickerCellTrigger, null, () => String(day.day)),
          ]))))),
    ]),
  ]
}

function control(): VNode {
  return h(XhDatePickerControl, null, () => [
    h(XhDatePickerSegmentGroup, { index: 0 }, () => [h(XhDatePickerSegment, { index: 0 })]),
  ])
}

/** 区间选择：两端跨月时并排两张月历。 */
function rangeShape(): VNode {
  return h(XhDatePickerRoot, { open: true, selectionMode: 'range', locale: 'zh-CN' } as any, {
    default: ({ panels, weekDays }: any) => [
      control(),
      h(XhDatePickerPositioner, null, () => [
        h(XhDatePickerContent, null, () => (panels ?? []).map((panel: any) =>
          h(XhDatePickerCalendar, { key: panel.index, index: panel.index }, () => calendarBody(panel, weekDays)))),
      ]),
    ],
  })
}

/** 带时间：日历之外多出时/分两列与一颗确认按钮。 */
function showTimeShape(): VNode {
  return h(XhDatePickerRoot, { open: true, showTime: true, locale: 'zh-CN' } as any, {
    default: ({ panels, weekDays }: any) => [
      control(),
      h(XhDatePickerPositioner, null, () => [
        h(XhDatePickerContent, null, () => [
          ...(panels ?? []).map((panel: any) =>
            h(XhDatePickerCalendar, { key: panel.index, index: panel.index }, () => calendarBody(panel, weekDays))),
          h(XhDatePickerTimePanel),
          h(XhDatePickerConfirmTrigger, null, () => '确定'),
        ]),
      ]),
    ],
  })
}

const PRESETS = [
  { value: '2026-01-01', label: '今天' },
  { value: '2026-01-02', label: '昨天' },
  { value: '2026-01-03', label: '近 7 天' },
  { value: '2026-01-04', label: '近 30 天' },
]

/** 带快捷选项：面板里多出一条「今天 / 昨天 / 近 7 天」。 */
function presetShape(): VNode {
  return h(XhDatePickerRoot, { open: true, locale: 'zh-CN', presets: PRESETS } as any, {
    default: ({ panels, weekDays }: any) => [
      control(),
      h(XhDatePickerPositioner, null, () => [
        h(XhDatePickerContent, null, () => [
          h(XhDatePickerPresetGroup),
          ...(panels ?? []).map((panel: any) =>
            h(XhDatePickerCalendar, { key: panel.index, index: panel.index }, () => calendarBody(panel, weekDays))),
        ]),
      ]),
    ],
  })
}

describe('iframe 运行时 realm', () => {
  it('未配置 portal 时从真实根节点取得 iframe Document，初始 open 正常注册并落位', async () => {
    const doc = mountAt(PHONE, rangeShape, 'default')
    const initialContent = doc.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='content']`)
    expect(initialContent?.ownerDocument).toBe(doc)
    const content = await contentAt(doc)
    expect(content.ownerDocument).toBe(doc)
    expect(part(doc, 'control').ownerDocument).toBe(doc)
    expect(part(doc, 'positioner').closest('[data-xh-portal-shell]')?.ownerDocument).toBe(doc)
  })

  it('显式同 Document portal 保持合法', async () => {
    const doc = mountAt(PHONE, rangeShape, 'same-document')
    const content = await contentAt(doc)
    const target = doc.querySelector<HTMLElement>('[data-date-picker-portal-target]')
    expect(content.ownerDocument).toBe(doc)
    expect(target).not.toBeNull()
    expect(part(doc, 'positioner').parentElement?.parentElement).toBe(target)
  })
})

describe('区间两张月历', () => {
  it(`${PHONE}px 下第二张落到第一张下面`, async () => {
    const doc = mountAt(PHONE, rangeShape)
    const content = await contentAt(doc)
    // Scope 来自真实根节点；显式 portal 只选同一 Document 内的落点，严格 Layer 注册已完成。
    expect(content.ownerDocument).toBe(doc)
    expect(part(doc, 'control').ownerDocument).toBe(doc)
    const calendars = parts(doc, 'calendar')
    const first = calendars[0]!
    const second = calendars[1]!
    expect(second.offsetTop).toBeGreaterThanOrEqual(first.offsetTop + first.offsetHeight)
    expect(second.offsetLeft).toBe(first.offsetLeft)
  })

  it.each([[TABLET], [DESKTOP]])('%ipx 下两张仍并排', async (width) => {
    const doc = mountAt(width, rangeShape)
    await contentAt(doc)
    const calendars = parts(doc, 'calendar')
    const first = calendars[0]!
    const second = calendars[1]!
    expect(second.offsetTop).toBe(first.offsetTop)
    expect(second.offsetLeft).toBeGreaterThanOrEqual(first.offsetLeft + first.offsetWidth)
  })

  it(`${PHONE}px 下堆叠起来就不再靠面内横滚够到第二张`, async () => {
    const doc = mountAt(PHONE, rangeShape)
    const content = await contentAt(doc)
    expect(content.scrollWidth).toBe(content.clientWidth)
  })

  it(`${PHONE}px 下分隔线画在两张之间的块起始边`, async () => {
    const doc = mountAt(PHONE, rangeShape)
    await contentAt(doc)
    const second = parts(doc, 'calendar')[1]!
    const style = doc.defaultView!.getComputedStyle(second)
    expect(Number.parseFloat(style.borderBlockStartWidth)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.borderInlineStartWidth)).toBe(0)
  })

  it.each([[TABLET], [DESKTOP]])('%ipx 下分隔线回到行内起始边', async (width) => {
    const doc = mountAt(width, rangeShape)
    await contentAt(doc)
    const second = parts(doc, 'calendar')[1]!
    const style = doc.defaultView!.getComputedStyle(second)
    expect(Number.parseFloat(style.borderInlineStartWidth)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.borderBlockStartWidth)).toBe(0)
  })

  // 堆叠是靠折行做的，网格轨道一格也没被压窄：日期钮的宽度定死，轨道再窄就会与右邻叠上
  it.each([[PHONE], [TABLET], [DESKTOP]])('%ipx 下日期钮不与右邻重叠、末钮不越出周行', async (width) => {
    const doc = mountAt(width, rangeShape)
    await contentAt(doc)
    const row = doc.querySelector<HTMLElement>(`[data-scope='calendar'][data-part='grid-body'] [data-part='week-row']`)
    if (!row)
      throw new Error('没有铺出周行')
    const cells = [...row.querySelectorAll<HTMLElement>(`[data-part='cell-trigger']`)]
    expect(cells).toHaveLength(7)
    const rects = cells.map(cell => cell.getBoundingClientRect())
    for (let i = 1; i < rects.length; i += 1)
      expect(rects[i]!.left - rects[i - 1]!.right).toBeGreaterThanOrEqual(0)
    expect(rects[6]!.right).toBeLessThanOrEqual(row.getBoundingClientRect().right)
  })
})

describe('带时间的时间列', () => {
  it.each([[PHONE], [TABLET], [DESKTOP]])('%ipx 下时列与分列横着并排，不各占一行', async (width) => {
    const doc = mountAt(width, showTimeShape)
    await contentAt(doc)
    const hour = part(doc, 'time-column', `[data-unit='hour']`)
    const minute = part(doc, 'time-column', `[data-unit='minute']`)
    const marker = doc.defaultView!.getComputedStyle(hour.querySelector<HTMLElement>(`[data-part='time-item']`)!, '::after')
    expect(Number.parseFloat(marker.width)).toBe(width === PHONE ? 12 : 16)
    expect(minute.offsetTop).toBe(hour.offsetTop)
    expect(minute.offsetLeft).toBeGreaterThanOrEqual(hour.offsetLeft + hour.offsetWidth)
  })

  it(`${PHONE}px 下每列只占日历一小截宽，整块面板不再纵向溢出`, async () => {
    const doc = mountAt(PHONE, showTimeShape)
    const content = await contentAt(doc)
    const calendar = parts(doc, 'calendar')[0]!
    const hour = part(doc, 'time-column', `[data-unit='hour']`)
    const hourItem = hour.querySelector<HTMLElement>(`[data-part='time-item']`)
    if (!hourItem)
      throw new Error('时列没有数字项')
    const itemRect = hourItem.getBoundingClientRect()
    const textRange = doc.createRange()
    textRange.selectNodeContents(hourItem)
    const marker = doc.defaultView!.getComputedStyle(hourItem, '::after')
    const markerLeft = itemRect.left + Number.parseFloat(marker.left)
    expect(Number.parseFloat(marker.width)).toBe(12)
    expect(textRange.getBoundingClientRect().right).toBeLessThanOrEqual(markerLeft)
    expect(hour.offsetWidth).toBeLessThan(calendar.offsetWidth / 2)
    expect(content.scrollHeight).toBe(content.clientHeight)
  })

  it.each([[TABLET], [DESKTOP]])('%ipx 下确认按钮沉到日历底边，不吊在顶上', async (width) => {
    const doc = mountAt(width, showTimeShape)
    await contentAt(doc)
    const calendar = parts(doc, 'calendar')[0]!
    const confirm = part(doc, 'confirm-trigger')
    expect(confirm.offsetTop + confirm.offsetHeight).toBe(calendar.offsetTop + calendar.offsetHeight)
    expect(confirm.offsetTop).toBeGreaterThan(calendar.offsetTop)
  })

  it(`${PHONE}px 下确认按钮落在时间列下面`, async () => {
    const doc = mountAt(PHONE, showTimeShape)
    await contentAt(doc)
    const hour = part(doc, 'time-column', `[data-unit='hour']`)
    const confirm = part(doc, 'confirm-trigger')
    expect(confirm.offsetTop).toBeGreaterThanOrEqual(hour.offsetTop + hour.offsetHeight)
  })
})

describe('快捷选项', () => {
  it(`${PHONE}px 下压在面板顶部横着排、自己横滚`, async () => {
    const doc = mountAt(PHONE, presetShape)
    const content = await contentAt(doc)
    const group = part(doc, 'preset-group')
    const calendar = parts(doc, 'calendar')[0]!
    const style = doc.defaultView!.getComputedStyle(group)
    expect(style.flexDirection).toBe('row')
    expect(style.overflowX).toBe('auto')
    // 整条横过来压在日历上方，占满面板这一行
    expect(calendar.offsetTop).toBeGreaterThanOrEqual(group.offsetTop + group.offsetHeight)
    const box = doc.defaultView!.getComputedStyle(content)
    const inner = content.clientWidth - Number.parseFloat(box.paddingLeft) - Number.parseFloat(box.paddingRight)
    expect(group.offsetWidth).toBeCloseTo(inner, 0)
  })

  it(`${PHONE}px 下条目排成一行、不被压扁`, async () => {
    const doc = mountAt(PHONE, presetShape)
    await contentAt(doc)
    const items = parts(doc, 'preset')
    expect(items).toHaveLength(PRESETS.length)
    for (let i = 1; i < items.length; i += 1) {
      expect(items[i]!.offsetTop).toBe(items[0]!.offsetTop)
      expect(items[i]!.offsetLeft).toBeGreaterThanOrEqual(items[i - 1]!.offsetLeft + items[i - 1]!.offsetWidth)
    }
    // 条目按自己那行字的宽度排：被压扁的话文字会折行，高度会比单行高
    expect(items[0]!.offsetHeight).toBeLessThan(items[0]!.offsetWidth)
  })

  it(`${PHONE}px 下选项与日历之间的空当留在块轴`, async () => {
    const doc = mountAt(PHONE, presetShape)
    await contentAt(doc)
    const style = doc.defaultView!.getComputedStyle(parts(doc, 'calendar')[0]!)
    expect(Number.parseFloat(style.paddingBlockStart)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.paddingInlineStart)).toBe(0)
  })

  it.each([[TABLET], [DESKTOP]])('%ipx 下选项与日历之间的空当回到行内轴', async (width) => {
    const doc = mountAt(width, presetShape)
    await contentAt(doc)
    const style = doc.defaultView!.getComputedStyle(parts(doc, 'calendar')[0]!)
    expect(Number.parseFloat(style.paddingInlineStart)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.paddingBlockStart)).toBe(0)
  })

  it.each([[TABLET], [DESKTOP]])('%ipx 下回到日历行内起始一侧的竖列', async (width) => {
    const doc = mountAt(width, presetShape)
    await contentAt(doc)
    const group = part(doc, 'preset-group')
    const calendar = parts(doc, 'calendar')[0]!
    const style = doc.defaultView!.getComputedStyle(group)
    expect(style.flexDirection).toBe('column')
    expect(group.offsetTop).toBe(calendar.offsetTop)
    expect(calendar.offsetLeft).toBeGreaterThanOrEqual(group.offsetLeft + group.offsetWidth)
  })
})

describe('无效 realm 配置的事务清理', () => {
  it('冻结创建时 Document，拒绝 null、伪节点、跨文档与换根；随后正常实例无残留层或迟到异常', async () => {
    const invalidFrame = document.createElement('iframe')
    document.body.append(invalidFrame)
    const invalidDocument = invalidFrame.contentDocument
    if (!invalidDocument)
      throw new Error('无效配置夹具没有 iframe Document')
    for (const node of document.querySelectorAll('style, link[rel="stylesheet"]'))
      invalidDocument.head.append(node.cloneNode(true))
    const invalidRuntime = createRuntimeConfig({
      scope: createScope(invalidDocument.body, createCounterIdGenerator()),
    })

    expect(() => resolveDatePickerPortalTarget(invalidRuntime, () => null))
      .toThrow('[xh] DatePicker 的 portalContainer 必须返回 Element')
    expect(() => resolveDatePickerPortalTarget(invalidRuntime, () => ({}) as Element))
      .toThrow('[xh] DatePicker 的 portalContainer 必须返回 Element')
    expect(() => resolveDatePickerPortalTarget(invalidRuntime, () => document.body))
      .toThrow('[xh] DatePicker 的 portalContainer 必须与组件根属于同一 Document')
    expect(() => assertDatePickerRootDocument(invalidRuntime.layerRegistry.ownerDocument, document.body))
      .toThrow('[xh] DatePicker 根节点不能在运行期切换 Document')
    expect(invalidRuntime.layerRegistry.list()).toHaveLength(0)

    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const failedHost = invalidDocument.createElement('div')
    const recoveredHost = invalidDocument.createElement('div')
    invalidDocument.body.append(failedHost, recoveredHost)
    const portalConfig = ref<{ portalContainer: () => Element | null }>({
      portalContainer: () => invalidDocument.body,
    })
    const captured: unknown[] = []
    const RealmHarness = defineComponent({
      setup() {
        const rootRef = ref<HTMLElement | null>(null)
        const ctx = useDatePickerWithRoot({ open: true, locale: 'zh-CN' } as any, {}, rootRef)
        return () => {
          const target = ctx.portalTarget.value
          return h('div', {
            ...ctx.api.value.getRootProps() as Record<string, unknown>,
            'ref': rootRef,
            'data-resolved-portal': typeof target === 'string' ? target : 'element',
          }, [
            h('div', {
              ...ctx.api.value.getControlProps() as Record<string, unknown>,
              ref: ctx.controlRef,
            }),
            h('div', {
              ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
              ref: ctx.positionerRef,
            }, [
              h('div', {
                ...ctx.api.value.getContentProps() as Record<string, unknown>,
                ref: ctx.contentRef,
              }),
            ]),
          ])
        }
      },
    })
    const failedApp = createApp({
      setup() {
        provideXhConfig(portalConfig)
        return () => h(RealmHarness)
      },
    })
    failedApp.config.errorHandler = cause => captured.push(cause)
    let failedMounted = false
    let recoveredApp: App | null = null
    try {
      failedApp.mount(failedHost)
      failedMounted = true
      await nextTick()
      warning.mockClear()
      expect(invalidRuntime.layerRegistry.list()).toHaveLength(1)

      // 已挂载实例运行期收到跨 Document 目标时明确失败；应用仍可完成自身事务清场。
      portalConfig.value = { portalContainer: () => document.body }
      await nextTick()
      expect(warning).not.toHaveBeenCalled()
      expect(captured).toHaveLength(1)
      expect(captured[0]).toBeInstanceOf(Error)
      expect((captured[0] as Error).message)
        .toBe('[xh] DatePicker 的 portalContainer 必须与组件根属于同一 Document')
      failedApp.unmount()
      failedMounted = false
      expect(warning).not.toHaveBeenCalled()
      expect(invalidRuntime.layerRegistry.list()).toHaveLength(0)
      expect(failedHost.querySelector(`[data-scope='date-picker']`)).toBeNull()

      // 失败清场后在同一 Document 重新挂载，验证共享 registry 没有残留层或迟到任务。
      recoveredApp = createApp({ render: rangeShape })
      recoveredApp.mount(recoveredHost)
      await contentAt(invalidDocument)
      expect(warning).not.toHaveBeenCalled()
      expect(invalidRuntime.layerRegistry.list()).toHaveLength(1)
      await new Promise<void>(resolve => invalidDocument.defaultView!.requestAnimationFrame(() => resolve()))
      recoveredApp.unmount()
      recoveredApp = null
      expect(invalidRuntime.layerRegistry.list()).toHaveLength(0)
      expect(recoveredHost.querySelector(`[data-scope='date-picker']`)).toBeNull()
      expect(invalidDocument.querySelector(`[data-scope='date-picker'][data-part='content']`)).toBeNull()
      await new Promise<void>(resolve => invalidDocument.defaultView!.requestAnimationFrame(() => resolve()))
      expect(captured).toHaveLength(1)
      expect(error).not.toHaveBeenCalled()
    }
    finally {
      recoveredApp?.unmount()
      if (failedMounted)
        failedApp.unmount()
      error.mockRestore()
      warning.mockRestore()
      invalidFrame.remove()
    }
  })
})
