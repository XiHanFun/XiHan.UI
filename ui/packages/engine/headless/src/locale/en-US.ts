/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 英文语言包，也是没配语言包时各组件的缺省文案：组件里不再写英文兜底，一律从这里取自己那一桶。
//
// 与其他语言包同一形状，只多一层拆分：每个组件一桶，各自是顶层具名导出。组件只引用自己那一桶，
// 打包器按引用摇树，单个组件不会把整张英文表带进产物；enUS 这一整份只在作者引用它时才进包。

import type { ChartDatumDetails } from '../shared/chart'
import type { KeyTextTable } from './key-text'
import type { XhLocale, XhLocaleBucket, XhLocaleTranslations } from './types'
import { keyText } from './key-text'

/** 读屏念的键名：修饰键在 Mac 与其余平台上叫法不同。 */
const KEY_NAME: KeyTextTable = {
  'Alt': { mac: 'Option', other: 'Alt' },
  'Control': 'Control',
  'Meta': { mac: 'Command', other: 'Windows' },
  'Shift': 'Shift',
  ' ': 'Space',
  'ArrowDown': 'Arrow Down',
  'ArrowLeft': 'Arrow Left',
  'ArrowRight': 'Arrow Right',
  'ArrowUp': 'Arrow Up',
  'Backspace': 'Backspace',
  'Delete': 'Delete',
  'Enter': 'Enter',
  'Escape': 'Escape',
  'Tab': 'Tab',
}

/** 键帽上写的字：Mac 用系统符号。 */
const KEY_LABEL: KeyTextTable = {
  'Alt': { mac: '⌥', other: 'Alt' },
  'Control': { mac: '⌃', other: 'Ctrl' },
  'Meta': { mac: '⌘', other: 'Win' },
  'Shift': { mac: '⇧', other: 'Shift' },
  ' ': 'Space',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→',
  'ArrowUp': '↑',
  'Backspace': { mac: '⌫', other: 'Backspace' },
  'Delete': { mac: '⌦', other: 'Del' },
  'Enter': { mac: '⏎', other: 'Enter' },
  'Escape': { mac: '⎋', other: 'Esc' },
  'Tab': { mac: '⇥', other: 'Tab' },
}

const EDGE = {
  n: 'top edge',
  s: 'bottom edge',
  e: 'right edge',
  w: 'left edge',
  ne: 'top right corner',
  nw: 'top left corner',
  se: 'bottom right corner',
  sw: 'bottom left corner',
} as const

const COLOR_CHANNEL = {
  hue: 'Hue',
  saturation: 'Saturation',
  brightness: 'Brightness',
  alpha: 'Alpha',
  red: 'Red',
  green: 'Green',
  blue: 'Blue',
} as const

const COLOR_UNIT = { hue: '°', saturation: '%', brightness: '%', alpha: '%', red: '', green: '', blue: '' } as const

/** 一个数配它的英文单位，1 用单数其余用复数。 */
function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`
}

// 几个组件共用的片段拆成具名常量，各桶逐键引用：顶层不写对象展开，
// 展开在打包器眼里可能触发 getter，会让整张表摇不掉。

const deleteItem = (label: string): string => `Delete ${label}`
const overflowTag = (count: number): string => `+${count}`

const todayDate = (date: string): string => `Today, ${date}`
const startRangeSelectionPrompt = 'Click to start selecting date range'
const finishRangeSelectionPrompt = 'Click to finish selecting date range'
const selectedRange = (start: string, end: string): string => `Selected Range: ${start} to ${end}`

const moved = (name: string, position: number, total: number): string => `Moved ${name} to position ${position} of ${total}.`
const dropped = (name: string, position: number): string => `${name} dropped at position ${position}.`
const canceled = (name: string, position: number): string => `Move canceled. ${name} returned to position ${position}.`
const rejected = (name: string): string => `${name} cannot be dropped here.`
const movedInto = (name: string, into: string, position: number, total: number): string => `Moved ${name} into ${into}, position ${position} of ${total}.`
const droppedInto = (name: string, into: string, position: number): string => `${name} dropped into ${into} at position ${position}.`
const canceledInto = (name: string, into: string, position: number): string => `Move canceled. ${name} returned to ${into}, position ${position}.`
const rootLevel = 'the top level'

/** 拖拽重排的播报：表格的列、标签页、树共用。 */
export const DRAG_EN_US = { moved, dropped, canceled, rejected, movedInto, droppedInto, canceledInto, rootLevel }

const chartRoleDescription = 'chart'
const seriesRoleDescription = 'series'
const legendLabel = 'Legend'
const missingValue = 'No value'
const emptyText = 'No data'
const loadingText = 'Loading…'
const otherLabel = 'Other'
const tableCaption = 'Data table'
function datumLabel(details: ChartDatumDetails): string {
  return `${details.formatted.key ?? String(details.key)}, ${details.seriesName} ${details.formatted.value ?? ''}`
}

/** 图表共有的那几条：七种图表各自的桶都带着它们。 */
export const CHART_EN_US = {
  chartRoleDescription,
  seriesRoleDescription,
  legendLabel,
  missingValue,
  emptyText,
  loadingText,
  otherLabel,
  tableCaption,
  datumLabel,
}

const NO_DATA = 'No data.'

export const ALERT_EN_US: XhLocaleBucket<'alert'> = { close: 'Close' }

export const ANCHOR_EN_US: XhLocaleBucket<'anchor'> = { root: 'Anchor navigation' }

export const APPROVAL_EN_US: XhLocaleBucket<'approval'> = {
  scopes: 'Permissions',
  note: 'Note',
  reason: 'Reason for denial',
  pending: 'Waiting for your decision',
  approved: 'Approved',
  denied: 'Denied',
  expired: 'Expired, treated as denied',
}

export const BACK_TOP_EN_US: XhLocaleBucket<'back-top'> = { trigger: 'Back to top' }

export const BREADCRUMB_EN_US: XhLocaleBucket<'breadcrumb'> = { root: 'Breadcrumb', ellipsis: 'Show full path' }

export const CALENDAR_PICKER_EN_US: XhLocaleBucket<'calendar-picker'> = { todayDate }

export const CALENDAR_RANGE_PICKER_EN_US: XhLocaleBucket<'calendar-range-picker'> = {
  todayDate,
  startRangeSelectionPrompt,
  finishRangeSelectionPrompt,
  selectedRange,
}

export const CAROUSEL_EN_US: XhLocaleBucket<'carousel'> = {
  root: 'Carousel',
  rootRoleDescription: 'carousel',
  itemRoleDescription: 'slide',
  prevTrigger: 'Previous slide',
  nextTrigger: 'Next slide',
  autoplayTriggerPlay: 'Start automatic slide show',
  autoplayTriggerPause: 'Stop automatic slide show',
  indicatorGroup: 'Choose slide to display',
  indicator: page => `Go to slide ${page}`,
  item: (index, count) => `${index} of ${count}`,
}

export const CARTESIAN_CHART_EN_US: XhLocaleBucket<'cartesian-chart'> = {
  chartRoleDescription,
  seriesRoleDescription,
  legendLabel,
  missingValue,
  emptyText,
  loadingText,
  otherLabel,
  tableCaption,
  datumLabel,
  keyLabel: 'Category',
  seriesLabel: 'Series',
  valueLabel: 'Value',
  sizeLabel: 'Size',
  colorLabel: 'Color',
  referenceLabel: 'Reference',
  averageLabel: 'Average',
  ohlcLabel: ({ open, high, low, close }) => `Open ${open}, High ${high}, Low ${low}, Close ${close}`,
  ohlcColumns: { open: 'Open', high: 'High', low: 'Low', close: 'Close' },
  boxLabel: ({ min, q1, median, q3, max }) => `Min ${min}, Q1 ${q1}, Median ${median}, Q3 ${q3}, Max ${max}`,
  boxColumns: { min: 'Min', q1: 'Q1', median: 'Median', q3: 'Q3', max: 'Max', outliers: 'Outliers' },
  zoomLabel: 'Zoom',
  zoomStartLabel: 'Window start',
  zoomEndLabel: 'Window end',
  aggregatedCaption: ({ caption, rows, ranges }) => `${caption} (${rows} rows in ${ranges} ranges)`,
  annotationSummary: items => items.map(item => `${item.label}${item.series ? ` (${item.series})` : ''}: ${item.value}.`).join(' '),
  summary: (model) => {
    if (!model.range || model.series.every(s => s.count === 0))
      return NO_DATA
    const { first, last, count } = model.range
    // series 单复数同形
    const head = `${model.seriesCount} series, ${plural(count, 'point')} from ${first} to ${last}.`
    const lines = model.series.flatMap((s) => {
      if (!s.min || !s.max)
        return []
      if (s.min.key === s.max.key && s.min.value === s.max.value)
        return `${s.name}: ${s.max.value} at ${s.max.key}.`
      return `${s.name}: lowest ${s.min.value} at ${s.min.key}, highest ${s.max.value} at ${s.max.key}.`
    })
    return [head, ...lines].join(' ')
  },
}

export const CASCADER_EN_US: XhLocaleBucket<'cascader'> = {
  deleteItem,
  overflowTag,
  empty: 'No data',
  noMatch: 'No matches',
  loading: 'Loading',
  branchError: 'Could not load children',
  retry: 'Retry',
  column: 'Options',
  searchInput: 'Search',
  searchList: 'Search results',
  clearTrigger: 'Clear',
}

export const CITATION_EN_US: XhLocaleBucket<'citation'> = {
  sources: 'Sources',
  preview: 'Source preview',
  closePreview: 'Close source preview',
  openSource: title => `Open ${title}`,
  citation: (index, title) => `Source ${index}: ${title}`,
  citations: indexes => `Sources ${indexes.join(', ')}`,
  previousSource: 'Previous source',
  nextSource: 'Next source',
  source: (index, title) => `Source ${index}: ${title}`,
  document: 'Document',
  previewLinkSource: 'Open source',
  previewLinkDocument: 'Open document',
}

export const CLIPBOARD_EN_US: XhLocaleBucket<'clipboard'> = { copied: 'Copied' }

export const CODE_VIEW_EN_US: XhLocaleBucket<'code-view'> = {
  code: 'Code',
  expand: 'Expand code',
  collapse: 'Collapse code',
  foldBlock: (first, last) => (first === last ? `Line ${first}` : `Lines ${first}–${last}`),
}

export const COLOR_FIELD_EN_US: XhLocaleBucket<'color-field'> = { clearTrigger: 'Clear' }

export const COLOR_PICKER_EN_US: XhLocaleBucket<'color-picker'> = {
  deleteItem,
  overflowTag,
  area: 'Saturation and brightness',
  areaValueText: (saturation, brightness) => `Saturation ${saturation}%, brightness ${brightness}%`,
  channel: channel => COLOR_CHANNEL[channel],
  channelValueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
  input: channel => ({ hex: 'Hex', r: 'Red', g: 'Green', b: 'Blue', a: 'Alpha' })[channel],
  swatch: value => `Color ${value}`,
  swatchGroup: 'Color swatches',
  recentSwatchGroup: 'Recent colors',
  eyeDropperTrigger: 'Pick a color from the screen',
}

export const COLOR_SLIDER_EN_US: XhLocaleBucket<'color-slider'> = {
  label: channel => COLOR_CHANNEL[channel],
  valueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
}

export const COLOR_SWATCH_PICKER_EN_US: XhLocaleBucket<'color-swatch-picker'> = {
  group: 'Color swatches',
  swatch: value => `Color ${value}`,
}

export const COMBOBOX_EN_US: XhLocaleBucket<'combobox'> = { deleteItem, overflowTag, trigger: 'Show suggestions', clearTrigger: 'Clear' }

export const COMMAND_EN_US: XhLocaleBucket<'command'> = { title: 'Command palette', input: 'Search commands', list: 'Commands' }

export const CONTEXT_MENU_EN_US: XhLocaleBucket<'context-menu'> = { content: 'Context menu' }

export const DATE_FIELD_EN_US: XhLocaleBucket<'date-field'> = {
  hour: 'hour',
  minute: 'minute',
  second: 'second',
  dayPeriod: 'AM/PM',
  year: 'year',
  quarter: 'quarter',
  month: 'month',
  week: 'week of year',
  day: 'day',
  clearTrigger: 'Clear',
}

export const DATE_PICKER_EN_US: XhLocaleBucket<'date-picker'> = {
  deleteItem,
  overflowTag,
  hour: 'hour',
  minute: 'minute',
  second: 'second',
  dayPeriod: 'AM/PM',
  todayDate,
  presets: 'Shortcuts',
  clearTrigger: 'Clear',
}

export const DATE_RANGE_PICKER_EN_US: XhLocaleBucket<'date-range-picker'> = {
  hour: 'hour',
  minute: 'minute',
  second: 'second',
  dayPeriod: 'AM/PM',
  todayDate,
  startRangeSelectionPrompt,
  finishRangeSelectionPrompt,
  selectedRange,
  startDate: 'Start date',
  endDate: 'End date',
  startTime: 'Start time',
  endTime: 'End time',
  presets: 'Shortcuts',
  clearTrigger: 'Clear',
}

export const DIALOG_EN_US: XhLocaleBucket<'dialog'> = {
  close: 'Close',
  dragTrigger: 'Move dialog',
  ok: 'OK',
  cancel: 'Cancel',
  actionError: 'Action failed. Please try again.',
}

export const DIFF_VIEW_EN_US: XhLocaleBucket<'diff-view'> = {
  added: 'Added',
  removed: 'Removed',
  unchanged: 'Unchanged',
  expandGap: count => `Show ${count} hidden lines`,
  diff: 'Diff',
  noChanges: 'No changes',
  truncated: count => `${count} more lines were cut off and are not shown`,
  commentOn: (line, side) => `Comment on ${side === 'old' ? 'old' : 'new'} line ${line}`,
}

export const DRAWER_EN_US: XhLocaleBucket<'drawer'> = { close: 'Close', resizeTrigger: 'Resize drawer' }

export const FIELD_ARRAY_EN_US: XhLocaleBucket<'field-array'> = {
  deleteItem: (index, count) => `Remove row ${index} of ${count}`,
  moveUpTrigger: (index, count) => `Move row ${index} of ${count} up`,
  moveDownTrigger: (index, count) => `Move row ${index} of ${count} down`,
}

export const FILE_UPLOAD_EN_US: XhLocaleBucket<'file-upload'> = {
  dropzone: 'Drop files here',
  deleteItem: file => `Delete ${file.name}`,
  clearTrigger: 'Clear all files',
}

export const FLOAT_BUTTON_EN_US: XhLocaleBucket<'float-button'> = { trigger: 'Actions' }

export const FLOATING_PANEL_EN_US: XhLocaleBucket<'floating-panel'> = {
  dragTrigger: 'Move panel',
  resizeTrigger: edge => `Resize ${EDGE[edge]}`,
  resizeValueText: size => `Width ${Math.round(size.width)}, height ${Math.round(size.height)}`,
  windowStateTrigger: state => ({ default: 'Restore panel', maximized: 'Maximize panel', minimized: 'Minimize panel' })[state],
  close: 'Close',
}

/** 表单校验报错的模板：{name} 换成字段名，{min} / {max} 换成规则的界限。 */
export const FORM_EN_US: XhLocaleBucket<'form'> = {
  required: '{name} is required',
  type: {
    string: '{name} must be a string',
    number: '{name} must be a number',
    integer: '{name} must be an integer',
    email: '{name} is not a valid email',
    url: '{name} is not a valid URL',
    array: '{name} must be an array',
  },
  minLength: '{name} must be at least {min} characters',
  maxLength: '{name} cannot exceed {max} characters',
  minNumber: '{name} must be at least {min}',
  maxNumber: '{name} cannot exceed {max}',
  pattern: '{name} does not match the required pattern',
}

export const FUNNEL_CHART_EN_US: XhLocaleBucket<'funnel-chart'> = {
  chartRoleDescription,
  seriesRoleDescription,
  legendLabel,
  missingValue,
  emptyText,
  loadingText,
  otherLabel,
  tableCaption,
  datumLabel: (details) => {
    const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
    return details.formatted.previous ? `${head}, ${details.formatted.previous} of previous` : head
  },
  nameLabel: 'Stage',
  valueLabel: 'Value',
  previousLabel: 'From previous',
  firstLabel: 'From first',
  summary: (model) => {
    if (model.stageCount === 0 || !model.first || !model.last)
      return NO_DATA
    if (model.stageCount === 1)
      return `1 stage: ${model.first.name} ${model.first.value}.`
    const parts = [`${model.stageCount} stages from ${model.first.name} (${model.first.value}) to ${model.last.name} (${model.last.value}).`]
    if (model.overall)
      parts.push(`Overall conversion ${model.overall}.`)
    if (model.steepest)
      parts.push(`Largest drop: ${model.steepest.from} to ${model.steepest.to}, ${model.steepest.rate} kept.`)
    return parts.join(' ')
  },
}

export const GRAPH_CHART_EN_US: XhLocaleBucket<'graph-chart'> = {
  chartRoleDescription,
  seriesRoleDescription,
  legendLabel,
  missingValue,
  emptyText,
  loadingText,
  otherLabel,
  tableCaption,
  datumLabel: (details) => {
    const parts = [details.seriesName]
    if (details.formatted.value)
      parts.push(details.formatted.value)
    parts.push(`${details.formatted.links ?? '0'} ${details.values.links === 1 ? 'link' : 'links'}`)
    return parts.join(', ')
  },
  sourceLabel: 'Source',
  targetLabel: 'Target',
  valueLabel: 'Value',
  linkLabel: 'Label',
  linksLabel: 'Links',
  incomingLabel: 'Incoming',
  outgoingLabel: 'Outgoing',
  summary: (model) => {
    if (model.nodeCount === 0)
      return NO_DATA
    const head = `${plural(model.nodeCount, 'node')}, ${plural(model.linkCount, 'link')}.`
    return model.hub ? `${head} Most connected: ${model.hub.name} (${plural(model.hub.degree, 'link')}).` : head
  },
}

export const GRID_LIST_EN_US: XhLocaleBucket<'grid-list'> = { root: 'Items' }

export const HEATMAP_EN_US: XhLocaleBucket<'heatmap'> = {
  gridLabel: 'Activity heatmap',
  cellLabel: details => `${details.count} on ${details.date}`,
  matrixCellLabel: details => `${details.count} at ${details.row} ${details.column}`,
  legendLabel: 'Activity level',
  legendLow: 'Less',
  legendHigh: 'More',
}

export const HIERARCHY_CHART_EN_US: XhLocaleBucket<'hierarchy-chart'> = {
  chartRoleDescription,
  seriesRoleDescription,
  legendLabel,
  missingValue,
  emptyText,
  loadingText,
  otherLabel,
  tableCaption,
  datumLabel: (details) => {
    const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
    return details.formatted.parentShare ? `${head}, ${details.formatted.parentShare} of ${details.formatted.parent ?? ''}` : head
  },
  rootLabel: 'All',
  pathLabel: 'Path',
  nameLabel: 'Path',
  valueLabel: 'Value',
  levelLabel: level => `Level ${level}`,
  parentShareLabel: 'Share of parent',
  rootShareLabel: 'Share of total',
  summary: (model) => {
    if (model.childCount === 0)
      return NO_DATA
    const head = `${model.root}: ${plural(model.childCount, 'item')}, total ${model.total}.`
    return model.largest ? `${head} Largest: ${model.largest.name} ${model.largest.value} (${model.largest.share}).` : head
  },
}

export const IMAGE_CROPPER_EN_US: XhLocaleBucket<'image-cropper'> = {
  cropArea: 'Crop area',
  valueText: rect => `X ${rect.x}, Y ${rect.y}, width ${rect.width}, height ${rect.height}`,
  handleTopLeft: 'Top left handle',
  handleTop: 'Top edge handle',
  handleTopRight: 'Top right handle',
  handleRight: 'Right edge handle',
  handleBottomRight: 'Bottom right handle',
  handleBottom: 'Bottom edge handle',
  handleBottomLeft: 'Bottom left handle',
  handleLeft: 'Left edge handle',
  zoomSlider: 'Zoom',
  rotateSlider: 'Rotate',
  flipHorizontal: 'Flip horizontally',
  flipVertical: 'Flip vertically',
}

export const IMAGE_VIEWER_EN_US: XhLocaleBucket<'image-viewer'> = {
  content: 'Image preview',
  toolbar: 'Image tools',
  close: 'Close',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  rotateLeft: 'Rotate left',
  rotateRight: 'Rotate right',
  flipHorizontal: 'Flip horizontal',
  flipVertical: 'Flip vertical',
  reset: 'Reset',
  prev: 'Previous image',
  next: 'Next image',
  counter: (index, count) => `${index} / ${count}`,
}

export const JSON_VIEWER_EN_US: XhLocaleBucket<'json-viewer'> = {
  text: 'JSON source',
  tree: 'JSON',
  root: 'root',
  objectPreview: count => `{…} ${count}`,
  arrayPreview: count => `[…] ${count}`,
  collapsedBranchLabel: (name, count) => `${name}, ${plural(count, 'item')}`,
  moreItems: count => `… ${count} more`,
  empty: 'No data',
}

export const KBD_EN_US: XhLocaleBucket<'kbd'> = {
  keyName: (key, platform) => keyText(KEY_NAME, key, platform),
  keyLabel: (key, platform) => keyText(KEY_LABEL, key, platform),
  hotkey: names => names.join(' + '),
}

export const LOADING_BAR_EN_US: XhLocaleBucket<'loading-bar'> = { root: 'Loading' }

export const LOG_EN_US: XhLocaleBucket<'log'> = { log: 'Log', scrollToBottom: 'Scroll to bottom' }

export const MARKDOWN_STREAM_EN_US: XhLocaleBucket<'markdown-stream'> = { completed: 'Response complete' }

export const MARQUEE_EN_US: XhLocaleBucket<'marquee'> = { autoplayTriggerPause: 'Pause scrolling', autoplayTriggerPlay: 'Resume scrolling' }

export const MENTION_EN_US: XhLocaleBucket<'mention'> = { content: 'Mentions', empty: 'No results' }

export const MENUBAR_EN_US: XhLocaleBucket<'menubar'> = { root: 'Menu bar' }

export const MESSAGE_FEED_EN_US: XhLocaleBucket<'message-feed'> = {
  feed: 'Conversation',
  scrollToBottom: 'Scroll to bottom',
  scrollToBottomUnread: count => `Scroll to bottom, ${count} new messages`,
  item: (position, size, role) => {
    const who = role == null ? '' : `, ${role}`
    // size 为 -1 是 ARIA 的「总数未知」，念出来只会让人以为倒数
    return size > 0 ? `Message ${position} of ${size}${who}` : `Message ${position}${who}`
  },
}

export const NAVIGATION_MENU_EN_US: XhLocaleBucket<'navigation-menu'> = { root: 'Main navigation' }

export const NOTIFICATION_EN_US: XhLocaleBucket<'notification'> = { region: 'Notifications', close: 'Close' }

export const PAGINATION_EN_US: XhLocaleBucket<'pagination'> = {
  root: 'Pagination',
  firstTrigger: 'First page',
  prevTrigger: 'Previous page',
  nextTrigger: 'Next page',
  lastTrigger: 'Last page',
  item: page => `Page ${page}`,
  ellipsis: count => `${count} more pages`,
  pageSizeSelect: 'Items per page',
  pageSizeOption: size => `${size} / page`,
  summary: (start, end, count) => `${start}-${end} of ${count}`,
  jumper: 'Go to page',
}

export const PASSWORD_INPUT_EN_US: XhLocaleBucket<'password-input'> = {
  visibilityTriggerShow: 'Show password',
  visibilityTriggerHide: 'Hide password',
  capsLockOn: 'Caps Lock is on',
  strengthMeter: 'Password strength',
}

export const PIE_CHART_EN_US: XhLocaleBucket<'pie-chart'> = {
  chartRoleDescription,
  seriesRoleDescription,
  legendLabel,
  missingValue,
  emptyText,
  loadingText,
  otherLabel,
  tableCaption,
  datumLabel: details => `${details.seriesName}, ${details.formatted.value ?? ''}, ${details.formatted.share ?? ''}`,
  centerLabel: 'Total',
  nameLabel: 'Name',
  valueLabel: 'Value',
  shareLabel: 'Share',
  summary: (model) => {
    const first = model.slices[0]
    const last = model.slices.at(-1)
    if (model.sliceCount === 0 || !first || !last)
      return NO_DATA
    const head = `${plural(model.sliceCount, 'slice')}, total ${model.total}.`
    if (model.sliceCount === 1)
      return `${head} ${first.name}: ${first.share}.`
    return `${head} Largest: ${first.name} ${first.share}. Smallest: ${last.name} ${last.share}.`
  },
}

export const PIN_INPUT_EN_US: XhLocaleBucket<'pin-input'> = { input: (index, length) => `Character ${index} of ${length}` }

export const POPOVER_EN_US: XhLocaleBucket<'popover'> = { close: 'Close' }

export const PROGRESS_EN_US: XhLocaleBucket<'progress'> = { segmentValueText: ({ value, label }) => `${value}, ${label}` }

export const PROMPT_INPUT_EN_US: XhLocaleBucket<'prompt-input'> = { send: 'Send', stop: 'Stop generating' }

export const QUESTION_FLOW_EN_US: XhLocaleBucket<'question-flow'> = {
  prompt: 'Question',
  options: 'Options',
  note: 'Other answer',
  prev: 'Previous question',
  next: 'Next question',
  progress: (current, total) => `Question ${current} of ${total}`,
  submitted: 'Answers sent',
  selectionRange: (min, max) => {
    if (max === undefined)
      return `Choose at least ${min}`
    if (min === max)
      return `Choose ${min}`
    return min > 1 ? `Choose ${min} to ${max}` : `Choose up to ${max}`
  },
}

export const RADAR_CHART_EN_US: XhLocaleBucket<'radar-chart'> = {
  chartRoleDescription,
  seriesRoleDescription,
  legendLabel,
  missingValue,
  emptyText,
  loadingText,
  otherLabel,
  tableCaption,
  datumLabel,
  nameLabel: 'Name',
  summary: (model) => {
    if (model.seriesCount === 0)
      return NO_DATA
    // series 单复数同形
    const head = `${model.seriesCount} series across ${model.indicatorCount} indicators.`
    const parts = model.series.map((s) => {
      if (!s.highest)
        return `${s.name}: no values.`
      return s.lowest
        ? `${s.name}: highest ${s.highest.indicator} ${s.highest.value}, lowest ${s.lowest.indicator} ${s.lowest.value}.`
        : `${s.name}: ${s.highest.indicator} ${s.highest.value}.`
    })
    return [head, ...parts].join(' ')
  },
}

export const REASONING_EN_US: XhLocaleBucket<'reasoning'> = {
  label: 'Thought process',
  thinking: 'Thinking…',
  thinkingFor: 'Thinking for {seconds}s',
  thoughtFor: 'Thought for {seconds}s',
}

export const RESIZABLE_EN_US: XhLocaleBucket<'resizable'> = { root: 'Resizable', handle: edge => `Resize ${EDGE[edge]}` }

export const SANKEY_CHART_EN_US: XhLocaleBucket<'sankey-chart'> = {
  chartRoleDescription,
  seriesRoleDescription,
  legendLabel,
  missingValue,
  emptyText,
  loadingText,
  otherLabel,
  tableCaption,
  datumLabel: details => `${details.seriesName}, ${details.formatted.value ?? ''}`,
  sourceLabel: 'Source',
  targetLabel: 'Target',
  valueLabel: 'Value',
  inflowLabel: 'From',
  outflowLabel: 'To',
  summary: (model) => {
    if (model.linkCount === 0)
      return NO_DATA
    const head = `${model.nodeCount} nodes, ${plural(model.linkCount, 'flow')}, total ${model.total}.`
    return model.largest ? `${head} Largest flow: ${model.largest.source} to ${model.largest.target}, ${model.largest.value}.` : head
  },
}

export const SCROLLBAR_EN_US: XhLocaleBucket<'scrollbar'> = { thumb: 'Scrollbar' }

export const SELECT_EN_US: XhLocaleBucket<'select'> = { deleteItem, overflowTag, clearTrigger: 'Clear', content: 'Options' }

export const SIDE_NAV_EN_US: XhLocaleBucket<'side-nav'> = { root: 'Sidebar', input: 'Filter navigation', noMatch: 'No matches' }

export const SIGNATURE_PAD_EN_US: XhLocaleBucket<'signature-pad'> = {
  label: 'Signature',
  clearTrigger: 'Clear signature',
  undoTrigger: 'Undo last stroke',
  redoTrigger: 'Redo stroke',
  statusEmpty: 'No signature yet',
  statusSigned: 'Signed',
}

export const SORTABLE_EN_US: XhLocaleBucket<'sortable'> = {
  root: 'Sortable list',
  itemDragTrigger: name => `Reorder ${name}`,
  itemDragTriggerRoleDescription: 'sortable',
  // 拾起那句要把「接下来能按什么」一并说清：这一步之后所有按键都被拦截，听不到说明只能猜
  picked: (name, position, total) => `Picked up ${name}. Position ${position} of ${total}. Use arrow keys to move, space to drop, escape to cancel.`,
  moved: (_name, position, total) => `Moved to position ${position} of ${total}.`,
  dropped: (name, position) => `${name} dropped at position ${position}.`,
  canceled: (name, position) => `Sorting canceled. ${name} returned to position ${position}.`,
  movedToList: (listName, listPosition, listTotal, position, total) =>
    `Moved to ${listName}, list ${listPosition} of ${listTotal}. Position ${position} of ${total}.`,
  droppedInList: (name, listName, listPosition, position) => `${name} dropped into ${listName}, list ${listPosition}, at position ${position}.`,
}

export const SPARKLINE_EN_US: XhLocaleBucket<'sparkline'> = {
  summary: (model) => {
    if (model.count === 0)
      return NO_DATA
    if (model.variant === 'win-loss') {
      const parts = [plural(model.wins, 'win'), plural(model.losses, 'loss', 'losses')]
      if (model.ties > 0)
        parts.push(plural(model.ties, 'tie'))
      return `${plural(model.count, 'result')}: ${parts.join(', ')}.`
    }
    const reference = model.reference == null ? '' : ` Reference ${model.reference}.`
    if (model.count === 1)
      return `1 point: ${model.last}.${reference}`
    const range = model.min === model.max ? `all ${model.max}` : `ranging from ${model.min} to ${model.max}`
    const head = `${model.count} points, ${range}.${reference}`
    if (model.direction === 'flat')
      return `${head} Last ${model.last}, unchanged from the first.`
    if (model.change == null)
      return `${head} Last ${model.last}.`
    return `${head} Last ${model.last}, ${model.direction} ${model.change} from the first.`
  },
}

export const SPINNER_EN_US: XhLocaleBucket<'spinner'> = { label: 'Loading' }

export const SPLITTER_EN_US: XhLocaleBucket<'splitter'> = { root: 'Split panels', resizeTrigger: index => `Resize panel ${index + 1}` }

export const STEPS_EN_US: XhLocaleBucket<'steps'> = { progressLabel: 'Step progress', progressValueText: percent => `${percent}% complete` }

export const TABLE_EN_US: XhLocaleBucket<'table'> = {
  moved,
  dropped,
  canceled,
  rejected,
  movedInto,
  droppedInto,
  canceledInto,
  rootLevel,
  sort: column => `Sort by ${column}`,
  columnResize: column => `Resize column ${column}`,
  columnDrag: column => `Reorder column ${column}`,
  columnDragRoleDescription: 'draggable column',
  selectAll: 'Select all rows',
  toolbar: 'Table toolbar',
  columnList: 'Column settings',
  columnVisibility: column => `Show column ${column}`,
}

export const TABS_EN_US: XhLocaleBucket<'tabs'> = {
  moved,
  dropped,
  canceled,
  rejected,
  movedInto,
  droppedInto,
  canceledInto,
  rootLevel,
  overflowTrigger: 'More tabs',
}

export const TAG_EN_US: XhLocaleBucket<'tag'> = { close: 'Delete' }

export const TAG_GROUP_EN_US: XhLocaleBucket<'tag-group'> = { deleteItem, list: 'Tags' }

export const TAGS_INPUT_EN_US: XhLocaleBucket<'tags-input'> = {
  deleteItem: value => `Delete ${value}`,
  editTagInput: value => `Edit ${value}`,
  clearTrigger: 'Clear',
}

export const TEXT_FIELD_EN_US: XhLocaleBucket<'text-field'> = { clearTrigger: 'Clear' }

export const TIME_FIELD_EN_US: XhLocaleBucket<'time-field'> = { hour: 'hour', minute: 'minute', second: 'second', dayPeriod: 'AM/PM', clearTrigger: 'Clear' }

export const TIME_PICKER_EN_US: XhLocaleBucket<'time-picker'> = {
  deleteItem,
  overflowTag,
  hour: 'hour',
  minute: 'minute',
  second: 'second',
  dayPeriod: 'AM/PM',
  presets: 'Shortcuts',
  clearTrigger: 'Clear',
}

export const TIME_RANGE_PICKER_EN_US: XhLocaleBucket<'time-range-picker'> = {
  hour: 'hour',
  minute: 'minute',
  second: 'second',
  dayPeriod: 'AM/PM',
  startTime: 'Start time',
  endTime: 'End time',
  presets: 'Shortcuts',
  clearTrigger: 'Clear',
}

export const TIMER_EN_US: XhLocaleBucket<'timer'> = {
  // 恒按时、分、秒念；天数为 0 时不念它，读屏不必每次都听一句「0 天」
  time: ({ days, hours, minutes, seconds }) => {
    const words = [plural(hours, 'hour'), plural(minutes, 'minute'), plural(seconds, 'second')]
    return days > 0 ? [plural(days, 'day'), ...words].join(' ') : words.join(' ')
  },
  start: 'Start',
  pause: 'Pause',
  resume: 'Resume',
  reset: 'Reset',
}

export const TOOL_CALL_EN_US: XhLocaleBucket<'tool-call'> = {
  inputStreaming: 'Preparing…',
  inputAvailable: 'Running…',
  awaitingApproval: 'Waiting for approval',
  outputAvailable: 'Completed',
  outputError: 'Failed',
}

export const TOOLBAR_EN_US: XhLocaleBucket<'toolbar'> = { overflowTrigger: 'More' }

export const TOUR_EN_US: XhLocaleBucket<'tour'> = { close: 'Close', progress: (step, count) => `Step ${step} of ${count}` }

export const TRANSFER_EN_US: XhLocaleBucket<'transfer'> = { toTarget: 'Move to target list', toSource: 'Move to source list' }

export const TREE_EN_US: XhLocaleBucket<'tree'> = DRAG_EN_US

export const TREE_SELECT_EN_US: XhLocaleBucket<'tree-select'> = {
  deleteItem,
  overflowTag,
  tree: 'Tree options',
  clearTrigger: 'Clear',
  empty: 'No data',
  loading: 'Loading',
  branchError: 'Could not load children',
  retry: 'Retry',
  branchEmpty: 'No children',
  searchInput: 'Search',
  noMatch: 'No matches',
}

export const TRUNCATE_EN_US: XhLocaleBucket<'truncate'> = { expand: 'Show more', collapse: 'Show less' }

const translations = {
  'alert': ALERT_EN_US,
  'anchor': ANCHOR_EN_US,
  'approval': APPROVAL_EN_US,
  'back-top': BACK_TOP_EN_US,
  'breadcrumb': BREADCRUMB_EN_US,
  'calendar-picker': CALENDAR_PICKER_EN_US,
  'calendar-range-picker': CALENDAR_RANGE_PICKER_EN_US,
  'carousel': CAROUSEL_EN_US,
  'cartesian-chart': CARTESIAN_CHART_EN_US,
  'cascader': CASCADER_EN_US,
  'citation': CITATION_EN_US,
  'clipboard': CLIPBOARD_EN_US,
  'code-view': CODE_VIEW_EN_US,
  'color-field': COLOR_FIELD_EN_US,
  'color-picker': COLOR_PICKER_EN_US,
  'color-slider': COLOR_SLIDER_EN_US,
  'color-swatch-picker': COLOR_SWATCH_PICKER_EN_US,
  'combobox': COMBOBOX_EN_US,
  'command': COMMAND_EN_US,
  'context-menu': CONTEXT_MENU_EN_US,
  'date-field': DATE_FIELD_EN_US,
  'date-picker': DATE_PICKER_EN_US,
  'date-range-picker': DATE_RANGE_PICKER_EN_US,
  'dialog': DIALOG_EN_US,
  'diff-view': DIFF_VIEW_EN_US,
  'drawer': DRAWER_EN_US,
  'field-array': FIELD_ARRAY_EN_US,
  'file-upload': FILE_UPLOAD_EN_US,
  'float-button': FLOAT_BUTTON_EN_US,
  'floating-panel': FLOATING_PANEL_EN_US,
  'form': FORM_EN_US,
  'funnel-chart': FUNNEL_CHART_EN_US,
  'graph-chart': GRAPH_CHART_EN_US,
  'grid-list': GRID_LIST_EN_US,
  'heatmap': HEATMAP_EN_US,
  'hierarchy-chart': HIERARCHY_CHART_EN_US,
  'image-cropper': IMAGE_CROPPER_EN_US,
  'image-viewer': IMAGE_VIEWER_EN_US,
  'json-viewer': JSON_VIEWER_EN_US,
  'kbd': KBD_EN_US,
  'loading-bar': LOADING_BAR_EN_US,
  'log': LOG_EN_US,
  'markdown-stream': MARKDOWN_STREAM_EN_US,
  'marquee': MARQUEE_EN_US,
  'mention': MENTION_EN_US,
  'menubar': MENUBAR_EN_US,
  'message-feed': MESSAGE_FEED_EN_US,
  'navigation-menu': NAVIGATION_MENU_EN_US,
  'notification': NOTIFICATION_EN_US,
  'pagination': PAGINATION_EN_US,
  'password-input': PASSWORD_INPUT_EN_US,
  'pie-chart': PIE_CHART_EN_US,
  'pin-input': PIN_INPUT_EN_US,
  'popover': POPOVER_EN_US,
  'progress': PROGRESS_EN_US,
  'prompt-input': PROMPT_INPUT_EN_US,
  'question-flow': QUESTION_FLOW_EN_US,
  'radar-chart': RADAR_CHART_EN_US,
  'reasoning': REASONING_EN_US,
  'resizable': RESIZABLE_EN_US,
  'sankey-chart': SANKEY_CHART_EN_US,
  'scrollbar': SCROLLBAR_EN_US,
  'select': SELECT_EN_US,
  'side-nav': SIDE_NAV_EN_US,
  'signature-pad': SIGNATURE_PAD_EN_US,
  'sortable': SORTABLE_EN_US,
  'sparkline': SPARKLINE_EN_US,
  'spinner': SPINNER_EN_US,
  'splitter': SPLITTER_EN_US,
  'steps': STEPS_EN_US,
  'table': TABLE_EN_US,
  'tabs': TABS_EN_US,
  'tag': TAG_EN_US,
  'tag-group': TAG_GROUP_EN_US,
  'tags-input': TAGS_INPUT_EN_US,
  'text-field': TEXT_FIELD_EN_US,
  'time-field': TIME_FIELD_EN_US,
  'time-picker': TIME_PICKER_EN_US,
  'time-range-picker': TIME_RANGE_PICKER_EN_US,
  'timer': TIMER_EN_US,
  'tool-call': TOOL_CALL_EN_US,
  'toolbar': TOOLBAR_EN_US,
  'tour': TOUR_EN_US,
  'transfer': TRANSFER_EN_US,
  'tree': TREE_EN_US,
  'tree-select': TREE_SELECT_EN_US,
  'truncate': TRUNCATE_EN_US,
} satisfies XhLocaleTranslations

/** 英文。没配语言包时各组件用的就是这一份。 */
export const enUS: XhLocale = { locale: 'en-US', translations }
