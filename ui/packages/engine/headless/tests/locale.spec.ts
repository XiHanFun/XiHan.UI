import type { XhLocale } from '../src/locale'
import { describe, expect, it } from 'vitest'
import { componentTranslations } from '../src/config/config-merge'
import { deDE, enUS, esES, frFR, jaJP, koKR, ptBR, ruRU, zhCN, zhTW } from '../src/locale'
import { paginationLabels } from '../src/pagination'

const PACKS: Record<string, XhLocale> = { deDE, esES, frFR, jaJP, koKR, ptBR, ruRU, zhCN, zhTW }

const EDGES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(edge => [edge])
const COLOR_CHANNELS = ['hue', 'saturation', 'brightness', 'alpha', 'red', 'green', 'blue']

const DATUM = {
  seriesId: 'online',
  seriesName: 'Online',
  slot: 1,
  tone: null,
  index: 0,
  key: 'Jan',
  values: { value: 120, links: 1 },
  formatted: { key: 'Jan', value: '120' },
  datum: {},
  point: { x: 0, y: 0 },
}
function datum(formatted: Record<string, string>, values: Record<string, unknown> = {}): typeof DATUM {
  return { ...DATUM, formatted: { ...DATUM.formatted, ...formatted }, values: { ...DATUM.values, ...values } }
}

const SPARK = { variant: 'line', count: 5, min: '1', max: '9', first: '2', last: '8', change: '300%', direction: 'up', wins: 0, losses: 0, ties: 0, reference: null }

const DRAG = {
  moved: [['Name', 2, 5]],
  dropped: [['Name', 2]],
  canceled: [['Name', 1]],
  rejected: [['Name']],
  movedInto: [['Name', 'Folder', 1, 3]],
  droppedInto: [['Name', 'Folder', 1]],
  canceledInto: [['Name', 'Folder', 2]],
}

const TAGGED = { deleteItem: [['A / B']], overflowTag: [[3]] }

/**
 * 每个函数式文案的样例入参，一条一组，覆盖空数据、单数与多数等分支。
 * 语言包新增函数键而这里没有样例时用例直接报缺，不会静默跳过。
 */
const SAMPLES: Record<string, Record<string, unknown[][]>> = {
  'calendar-picker': { todayDate: [['October 4, 2026']] },
  'calendar-range-picker': { todayDate: [['October 4, 2026']], selectedRange: [['October 1, 2026', 'October 4, 2026']] },
  'carousel': { indicator: [[2]], item: [[1, 6]] },
  'cartesian-chart': {
    datumLabel: [[DATUM]],
    ohlcLabel: [[{ open: '1', high: '3', low: '0.5', close: '2' }]],
    boxLabel: [[{ min: '1', q1: '2', median: '3', q3: '4', max: '5' }]],
    aggregatedCaption: [[{ caption: 'Sales', rows: '10,000', ranges: '200' }]],
    annotationSummary: [[[{ kind: 'line', label: 'Target', series: null, value: '100' }, { kind: 'average', label: 'Average', series: 'Online', value: '42' }]]],
    summary: [
      [{ seriesCount: 0, range: null, series: [] }],
      [{
        seriesCount: 2,
        range: { first: 'Jan', last: 'Mar', count: 3 },
        series: [
          { id: 'a', name: 'A', count: 3, min: { key: 'Jan', value: '1' }, max: { key: 'Feb', value: '5' }, first: null, last: null, change: null },
          { id: 'b', name: 'B', count: 1, min: { key: 'Jan', value: '2' }, max: { key: 'Jan', value: '2' }, first: null, last: null, change: null },
          { id: 'c', name: 'C', count: 0, min: null, max: null, first: null, last: null, change: null },
        ],
      }],
      [{ seriesCount: 1, range: { first: 'Jan', last: 'Jan', count: 1 }, series: [{ id: 'a', name: 'A', count: 1, min: { key: 'Jan', value: '1' }, max: { key: 'Jan', value: '1' }, first: null, last: null, change: null }] }],
    ],
  },
  'cascader': TAGGED,
  'citation': { openSource: [['Doc']], citation: [[1, 'Doc']], citations: [[[1, 2, 3]]], source: [[1, 'Doc']] },
  'code-view': { foldBlock: [[3, 3], [3, 9]] },
  'color-picker': {
    ...TAGGED,
    areaValueText: [[50, 80]],
    channel: [['hue'], ['alpha']],
    channelValueText: [['hue', 120], ['alpha', 50]],
    input: [['hex'], ['r'], ['g'], ['b'], ['a']],
    swatch: [['#ff0000']],
  },
  'color-slider': {
    label: COLOR_CHANNELS.map(channel => [channel]),
    valueText: COLOR_CHANNELS.map(channel => [channel, 10]),
  },
  'color-swatch-picker': { swatch: [['#ff0000']] },
  'combobox': TAGGED,
  'date-picker': { ...TAGGED, todayDate: [['October 4, 2026']] },
  'date-range-picker': { todayDate: [['October 4, 2026']], selectedRange: [['October 1, 2026', 'October 4, 2026']] },
  'diff-view': { expandGap: [[1], [5]], truncated: [[1], [20]], commentOn: [[3, 'old'], [3, 'new']] },
  'field-array': { deleteItem: [[1, 3]], moveUpTrigger: [[2, 3]], moveDownTrigger: [[1, 3]] },
  'file-upload': { deleteItem: [[{ name: 'report.pdf' }]] },
  'floating-panel': {
    resizeTrigger: EDGES,
    resizeValueText: [[{ width: 320.4, height: 200 }]],
    windowStateTrigger: [['default'], ['maximized'], ['minimized']],
  },
  'funnel-chart': {
    datumLabel: [[DATUM], [datum({ previous: '40%' })]],
    summary: [
      [{ stageCount: 0, first: null, last: null, overall: null, steepest: null }],
      [{ stageCount: 1, first: { name: 'Visit', value: '100' }, last: { name: 'Visit', value: '100' }, overall: null, steepest: null }],
      [{ stageCount: 3, first: { name: 'Visit', value: '100' }, last: { name: 'Pay', value: '20' }, overall: '20%', steepest: { from: 'Visit', to: 'Cart', rate: '40%' } }],
    ],
  },
  'graph-chart': {
    datumLabel: [[datum({ links: '1' }, { links: 1 })], [datum({ links: '3', value: '' }, { links: 3 })]],
    summary: [
      [{ nodeCount: 0, linkCount: 0, hub: null }],
      [{ nodeCount: 1, linkCount: 1, hub: { name: 'A', degree: 1 } }],
      [{ nodeCount: 5, linkCount: 7, hub: { name: 'A', degree: 4 } }],
      [{ nodeCount: 2, linkCount: 0, hub: null }],
    ],
  },
  'heatmap': {
    cellLabel: [[{ date: '2026-10-04', row: '', column: '', count: 3, level: 1, polarity: null, percent: 25 }]],
    matrixCellLabel: [[{ date: '', row: 'Mon', column: '09:00', count: 2, level: 1, polarity: null, percent: 25 }]],
  },
  'hierarchy-chart': {
    datumLabel: [[DATUM], [datum({ parentShare: '25%', parent: 'All' })]],
    levelLabel: [[2]],
    summary: [
      [{ root: 'All', total: '0', childCount: 0, largest: null }],
      [{ root: 'All', total: '100', childCount: 1, largest: { name: 'A', value: '100', share: '100%' } }],
      [{ root: 'All', total: '100', childCount: 3, largest: { name: 'A', value: '60', share: '60%' } }],
    ],
  },
  'image-cropper': { valueText: [[{ x: 0, y: 0, width: 100, height: 50 }]] },
  'image-viewer': { counter: [[1, 5]] },
  'json-viewer': { objectPreview: [[3]], arrayPreview: [[1]], collapsedBranchLabel: [['root', 1], ['items', 3]], moreItems: [[1], [10]] },
  'kbd': { hotkey: [[['Ctrl', 'K']]] },
  'message-feed': {
    scrollToBottomUnread: [[1], [3]],
    item: [[1, 5, 'user'], [2, -1, 'assistant'], [3, 5, 'system'], [4, 5, undefined]],
  },
  'pagination': { item: [[2]], ellipsis: [[5]], pageSizeOption: [[20]], summary: [[0, 0, 0], [1, 10, 42]] },
  'pie-chart': {
    datumLabel: [[datum({ share: '40%' })]],
    summary: [
      [{ sliceCount: 0, total: '0', slices: [] }],
      [{ sliceCount: 1, total: '10', slices: [{ name: 'A', value: '10', share: '100%' }] }],
      [{ sliceCount: 3, total: '60', slices: [{ name: 'A', value: '30', share: '50%' }, { name: 'B', value: '20', share: '33%' }, { name: 'C', value: '10', share: '17%' }] }],
    ],
  },
  'pin-input': { input: [[1, 6]] },
  'progress': { segmentValueText: [[{ value: '72%', label: 'Warning' }]] },
  'question-flow': { progress: [[2, 3]], selectionRange: [[2, undefined], [2, 2], [2, 4], [1, 3]] },
  'radar-chart': {
    datumLabel: [[DATUM]],
    summary: [
      [{ seriesCount: 0, indicatorCount: 0, series: [] }],
      [{
        seriesCount: 3,
        indicatorCount: 5,
        series: [
          { name: 'A', highest: { indicator: 'Speed', value: '9' }, lowest: { indicator: 'Cost', value: '2' } },
          { name: 'B', highest: { indicator: 'Speed', value: '5' }, lowest: null },
          { name: 'C', highest: null, lowest: null },
        ],
      }],
    ],
  },
  'resizable': { handle: EDGES },
  'sankey-chart': {
    datumLabel: [[DATUM]],
    summary: [
      [{ nodeCount: 0, linkCount: 0, total: '0', largest: null }],
      [{ nodeCount: 2, linkCount: 1, total: '10', largest: { source: 'A', target: 'B', value: '10' } }],
      [{ nodeCount: 5, linkCount: 4, total: '100', largest: { source: 'A', target: 'C', value: '60' } }],
    ],
  },
  'select': TAGGED,
  'sortable': {
    itemDragTrigger: [['Item A']],
    picked: [['Item A', 1, 5]],
    moved: [['Item A', 2, 5]],
    dropped: [['Item A', 2]],
    canceled: [['Item A', 1]],
    movedToList: [['Done', 2, 3, 1, 4]],
    droppedInList: [['Item A', 'Done', 2, 1]],
  },
  'sparkline': {
    summary: [
      [{ ...SPARK, count: 0, min: null, max: null, first: null, last: null, change: null, direction: null }],
      [{ ...SPARK, variant: 'win-loss', count: 6, wins: 3, losses: 2, ties: 1 }],
      [{ ...SPARK, variant: 'win-loss', count: 2, wins: 1, losses: 1, ties: 0 }],
      [{ ...SPARK, count: 1, min: '4', max: '4', first: '4', last: '4', change: null, direction: null, reference: '5' }],
      [{ ...SPARK, min: '3', max: '3', direction: 'flat', change: '0%' }],
      [{ ...SPARK, change: null }],
      [SPARK],
      [{ ...SPARK, direction: 'down', change: '50%', reference: '5' }],
    ],
  },
  'splitter': { resizeTrigger: [[0, 2], [1, 2]] },
  'steps': { progressValueText: [[60]] },
  'table': { ...DRAG, sort: [['Name']], columnResize: [['Name']], columnDrag: [['Name']], columnVisibility: [['Name']] },
  'tabs': DRAG,
  'tag-group': { deleteItem: [['Tag']] },
  'tags-input': { deleteItem: [['Tag']], editTagInput: [['Tag']] },
  'time-picker': TAGGED,
  'timer': {
    time: [
      [{ days: 0, hours: 1, minutes: 1, seconds: 1, milliseconds: 0 }],
      [{ days: 2, hours: 0, minutes: 5, seconds: 30, milliseconds: 0 }],
      [{ days: 1, hours: 21, minutes: 22, seconds: 0, milliseconds: 0 }],
    ],
  },
  'tour': { progress: [[1, 4]] },
  'tree': DRAG,
  'tree-select': TAGGED,
}

/** 一句文案里不该漏出来的东西：没取到的值、算坏的数、对象的默认串、没去掉的首尾空白。 */
function expectText(text: unknown, where: string): void {
  expect(typeof text, where).toBe('string')
  const s = text as string
  expect(s.trim(), where).not.toBe('')
  expect(s, where).toBe(s.trim())
  expect(s, where).not.toMatch(/undefined|NaN|null|\[object/)
}

describe('内建语言包', () => {
  it('每份语言包的组件与键都与简体中文一一对应', () => {
    const shape = (pack: XhLocale) => Object.fromEntries(
      Object.entries(pack.translations).map(([component, bucket]) => [component, Object.keys(bucket as object).sort()]),
    )
    const reference = shape(zhCN)
    for (const [name, pack] of Object.entries(PACKS))
      expect(shape(pack), name).toEqual(reference)
  })

  it('locale 是规范的 BCP 47 语言标记', () => {
    for (const [name, pack] of Object.entries({ ...PACKS, enUS }))
      expect(Intl.getCanonicalLocales(pack.locale)[0], name).toBe(pack.locale)
  })

  it('英文只带 locale：内建文案本身就是英文', () => {
    expect(enUS).toEqual({ locale: 'en-US', translations: {} })
  })

  for (const [name, pack] of Object.entries(PACKS)) {
    it(`${name}：每条文案非空，每个函数按各分支的样例都写出完整的句子`, () => {
      for (const [component, bucket] of Object.entries(pack.translations)) {
        for (const [key, value] of Object.entries(bucket as Record<string, unknown>)) {
          const where = `${name} ${component}.${key}`
          if (typeof value === 'function') {
            const samples = SAMPLES[component]?.[key]
            expect(samples, `${where} 缺样例`).toBeDefined()
            for (const args of samples!)
              expectText((value as (...a: unknown[]) => unknown)(...args), `${where}(${JSON.stringify(args)})`)
          }
          else if (typeof value === 'object' && value !== null) {
            for (const [column, text] of Object.entries(value))
              expectText(text, `${where}.${column}`)
          }
          else {
            expectText(value, where)
          }
        }
      }
    })

    it(`${name}：思考时长的模板留着 {seconds} 占位符`, () => {
      const reasoning = pack.translations.reasoning!
      expect(reasoning.thinkingFor).toContain('{seconds}')
      expect(reasoning.thoughtFor).toContain('{seconds}')
    })
  }

  it('语言包当作全局配置：组件按名字取到自己那一桶，实例上写的键照旧压在上面', () => {
    expect(componentTranslations('dialog', undefined, zhCN)).toEqual({ close: '关闭', dragTrigger: '移动对话框' })
    expect(componentTranslations('dialog', { close: '关掉' }, zhCN)).toEqual({ close: '关掉', dragTrigger: '移动对话框' })
    const labels = paginationLabels(key => (key === 'translations' ? zhCN.translations.pagination : undefined) as never)
    expect(labels.summary(1, 10, 42)).toBe('第 1-10 条，共 42 条')
    expect(labels.pageSizeOption(20)).toBe('20 条/页')
  })
})
