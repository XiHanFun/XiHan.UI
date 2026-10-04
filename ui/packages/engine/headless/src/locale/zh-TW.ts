/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 繁體中文（台灣）語言包。

import type { ChartDatumDetails } from '../shared/chart'
import type { KeyTextTable } from './key-text'
import type { XhLocale, XhLocaleTranslations } from './types'
import { keyText } from './key-text'

/** 读屏念的键名：修饰键在 Mac 与其余平台上叫法不同。 */
const KEY_NAME: KeyTextTable = {
  'Alt': { mac: 'Option 鍵', other: 'Alt 鍵' },
  'Control': 'Control 鍵',
  'Meta': { mac: 'Command 鍵', other: 'Windows 鍵' },
  'Shift': 'Shift 鍵',
  ' ': '空白鍵',
  'ArrowDown': '下方向鍵',
  'ArrowLeft': '左方向鍵',
  'ArrowRight': '右方向鍵',
  'ArrowUp': '上方向鍵',
  'Backspace': '退格鍵',
  'Delete': '刪除鍵',
  'Enter': 'Enter 鍵',
  'Escape': 'Esc 鍵',
  'Tab': 'Tab 鍵',
}

/** 键帽上写的字：Mac 用系统符号。 */
const KEY_LABEL: KeyTextTable = {
  'Alt': { mac: '⌥', other: 'Alt' },
  'Control': { mac: '⌃', other: 'Ctrl' },
  'Meta': { mac: '⌘', other: 'Win' },
  'Shift': { mac: '⇧', other: 'Shift' },
  ' ': '空白鍵',
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
  n: '上邊緣',
  s: '下邊緣',
  e: '右邊緣',
  w: '左邊緣',
  ne: '右上角',
  nw: '左上角',
  se: '右下角',
  sw: '左下角',
} as const

const COLOR_CHANNEL = {
  hue: '色相',
  saturation: '飽和度',
  brightness: '亮度',
  alpha: '透明度',
  red: '紅色',
  green: '綠色',
  blue: '藍色',
} as const

const COLOR_UNIT = { hue: '°', saturation: '%', brightness: '%', alpha: '%', red: '', green: '', blue: '' } as const

const tagged = {
  deleteItem: (label: string) => `刪除 ${label}`,
  overflowTag: (count: number) => `+${count}`,
}

const segments = { hour: '小時', minute: '分鐘', second: '秒', dayPeriod: '上午/下午' }

const calendar = { todayDate: (date: string) => `今天，${date}` }

const rangeCalendar = {
  ...calendar,
  startRangeSelectionPrompt: '按一下以開始選取日期範圍',
  finishRangeSelectionPrompt: '按一下以完成選取日期範圍',
  selectedRange: (start: string, end: string) => `已選取範圍：${start} 至 ${end}`,
}

const drag = {
  moved: (name: string, position: number, total: number) => `已將 ${name} 移至第 ${position} 位，共 ${total} 位。`,
  dropped: (name: string, position: number) => `${name} 已放在第 ${position} 位。`,
  canceled: (name: string, position: number) => `已取消移動，${name} 回到第 ${position} 位。`,
  rejected: (name: string) => `${name} 無法放在這裡。`,
  movedInto: (name: string, into: string, position: number, total: number) => `已將 ${name} 移入 ${into}，位於第 ${position} 位，共 ${total} 位。`,
  droppedInto: (name: string, into: string, position: number) => `${name} 已放入 ${into} 的第 ${position} 位。`,
  canceledInto: (name: string, into: string, position: number) => `已取消移動，${name} 回到 ${into} 的第 ${position} 位。`,
  rootLevel: '最上層',
}

const chart = {
  chartRoleDescription: '圖表',
  seriesRoleDescription: '數列',
  legendLabel: '圖例',
  missingValue: '無數值',
  emptyText: '沒有資料',
  loadingText: '載入中…',
  otherLabel: '其他',
  tableCaption: '資料表',
  datumLabel: (details: ChartDatumDetails) =>
    `${details.formatted.key ?? String(details.key)}，${details.seriesName} ${details.formatted.value ?? ''}`,
}

const NO_DATA = '沒有資料。'

const translations = {
  'alert': { close: '關閉' },
  'anchor': { root: '錨點導覽' },
  'approval': {
    scopes: '權限',
    note: '備註',
    reason: '拒絕原因',
    pending: '等待您的決定',
    approved: '已核准',
    denied: '已拒絕',
    expired: '已逾期，視為拒絕',
  },
  'back-top': { trigger: '回到頂端' },
  'breadcrumb': { root: '階層連結', ellipsis: '顯示完整路徑' },
  'calendar-picker': calendar,
  'calendar-range-picker': rangeCalendar,
  'carousel': {
    root: '輪播',
    rootRoleDescription: '輪播',
    itemRoleDescription: '投影片',
    prevTrigger: '上一張',
    nextTrigger: '下一張',
    autoplayTriggerPlay: '開始自動播放',
    autoplayTriggerPause: '停止自動播放',
    indicatorGroup: '選擇要顯示的項目',
    indicator: page => `前往第 ${page} 張`,
    item: (index, count) => `第 ${index} 張，共 ${count} 張`,
  },
  'cartesian-chart': {
    ...chart,
    keyLabel: '類別',
    seriesLabel: '數列',
    valueLabel: '數值',
    sizeLabel: '大小',
    colorLabel: '顏色',
    referenceLabel: '參考',
    averageLabel: '平均值',
    ohlcLabel: ({ open, high, low, close }) => `開盤 ${open}，最高 ${high}，最低 ${low}，收盤 ${close}`,
    ohlcColumns: { open: '開盤', high: '最高', low: '最低', close: '收盤' },
    boxLabel: ({ min, q1, median, q3, max }) => `最小值 ${min}，第一四分位數 ${q1}，中位數 ${median}，第三四分位數 ${q3}，最大值 ${max}`,
    boxColumns: { min: '最小值', q1: '第一四分位數', median: '中位數', q3: '第三四分位數', max: '最大值', outliers: '離群值' },
    zoomLabel: '縮放',
    zoomStartLabel: '範圍起點',
    zoomEndLabel: '範圍終點',
    aggregatedCaption: ({ caption, rows, ranges }) => `${caption}（${rows} 列，彙總為 ${ranges} 個區間）`,
    annotationSummary: items => items.map(item => `${item.label}${item.series ? `（${item.series}）` : ''}：${item.value}。`).join(''),
    summary: (model) => {
      if (!model.range || model.series.every(s => s.count === 0))
        return NO_DATA
      const { first, last, count } = model.range
      const head = `${model.seriesCount} 個數列，${count} 個資料點，從 ${first} 到 ${last}。`
      const lines = model.series.flatMap((s) => {
        if (!s.min || !s.max)
          return []
        if (s.min.key === s.max.key && s.min.value === s.max.value)
          return `${s.name}：${s.max.key} 為 ${s.max.value}。`
        return `${s.name}：最低 ${s.min.value}（${s.min.key}），最高 ${s.max.value}（${s.max.key}）。`
      })
      return [head, ...lines].join('')
    },
  },
  'cascader': {
    ...tagged,
    empty: '沒有資料',
    noMatch: '沒有相符的結果',
    loading: '載入中',
    branchError: '無法載入下層選項',
    retry: '重試',
    column: '選項',
    searchInput: '搜尋',
    searchList: '搜尋結果',
    clearTrigger: '清除',
  },
  'citation': {
    sources: '來源',
    preview: '來源預覽',
    closePreview: '關閉來源預覽',
    openSource: title => `開啟 ${title}`,
    citation: (index, title) => `來源 ${index}：${title}`,
    citations: indexes => `來源 ${indexes.join('、')}`,
    previousSource: '上一個來源',
    nextSource: '下一個來源',
    source: (index, title) => `來源 ${index}：${title}`,
    document: '文件',
    previewLinkSource: '開啟來源',
    previewLinkDocument: '開啟文件',
  },
  'clipboard': { copied: '已複製' },
  'code-view': {
    code: '程式碼',
    expand: '展開程式碼',
    collapse: '收合程式碼',
    foldBlock: (first, last) => (first === last ? `第 ${first} 行` : `第 ${first}–${last} 行`),
  },
  'color-field': { clearTrigger: '清除' },
  'color-picker': {
    ...tagged,
    area: '飽和度與亮度',
    areaValueText: (saturation, brightness) => `飽和度 ${saturation}%，亮度 ${brightness}%`,
    channel: channel => COLOR_CHANNEL[channel],
    channelValueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
    input: channel => ({ hex: '十六進位', r: '紅色', g: '綠色', b: '藍色', a: '透明度' })[channel],
    swatch: value => `顏色 ${value}`,
    swatchGroup: '色票',
    recentSwatchGroup: '最近使用的顏色',
    eyeDropperTrigger: '從螢幕上選取顏色',
  },
  'color-slider': {
    label: channel => COLOR_CHANNEL[channel],
    valueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
  },
  'color-swatch-picker': { group: '色票', swatch: value => `顏色 ${value}` },
  'combobox': { ...tagged, trigger: '顯示建議', clearTrigger: '清除' },
  'command': { title: '命令選擇區', input: '搜尋命令', list: '命令' },
  'context-menu': { content: '右鍵選單' },
  'date-field': {
    ...segments,
    year: '年',
    quarter: '季',
    month: '月',
    week: '週',
    day: '日',
    clearTrigger: '清除',
  },
  'date-picker': { ...tagged, ...segments, ...calendar, presets: '快速選項', clearTrigger: '清除' },
  'date-range-picker': {
    ...segments,
    ...rangeCalendar,
    startDate: '開始日期',
    endDate: '結束日期',
    startTime: '開始時間',
    endTime: '結束時間',
    presets: '快速選項',
    clearTrigger: '清除',
  },
  'dialog': {
    close: '關閉',
    dragTrigger: '移動對話方塊',
    ok: '確定',
    cancel: '取消',
    actionError: '操作失敗，請再試一次。',
  },
  'diff-view': {
    added: '新增',
    removed: '移除',
    unchanged: '未變更',
    expandGap: count => `顯示隱藏的 ${count} 行`,
    diff: '差異',
    noChanges: '沒有變更',
    truncated: count => `另有 ${count} 行已截斷，未顯示`,
    commentOn: (line, side) => `對${side === 'old' ? '舊' : '新'}版本第 ${line} 行留言`,
  },
  'drawer': { close: '關閉', resizeTrigger: '調整抽屜大小' },
  'field-array': {
    deleteItem: (index, count) => `移除第 ${index} 列，共 ${count} 列`,
    moveUpTrigger: (index, count) => `上移第 ${index} 列，共 ${count} 列`,
    moveDownTrigger: (index, count) => `下移第 ${index} 列，共 ${count} 列`,
  },
  'file-upload': {
    dropzone: '將檔案拖放到這裡',
    deleteItem: file => `刪除 ${file.name}`,
    clearTrigger: '清除所有檔案',
  },
  'float-button': { trigger: '動作' },
  'floating-panel': {
    dragTrigger: '移動面板',
    resizeTrigger: edge => `從${EDGE[edge]}調整大小`,
    resizeValueText: size => `寬 ${Math.round(size.width)}，高 ${Math.round(size.height)}`,
    windowStateTrigger: state => ({ default: '還原面板', maximized: '最大化面板', minimized: '最小化面板' })[state],
    close: '關閉',
  },
  'form': {
    required: '{name} 為必填欄位',
    type: {
      string: '{name} 必須是字串',
      number: '{name} 必須是數字',
      integer: '{name} 必須是整數',
      email: '{name} 不是有效的電子郵件地址',
      url: '{name} 不是有效的網址',
      array: '{name} 必須是陣列',
    },
    minLength: '{name} 至少需要 {min} 個字元',
    maxLength: '{name} 不能超過 {max} 個字元',
    minNumber: '{name} 不能小於 {min}',
    maxNumber: '{name} 不能大於 {max}',
    pattern: '{name} 格式不正確',
  },
  'funnel-chart': {
    ...chart,
    datumLabel: (details) => {
      const head = `${details.seriesName}，${details.formatted.value ?? ''}`
      return details.formatted.previous ? `${head}，為上一階段的 ${details.formatted.previous}` : head
    },
    nameLabel: '階段',
    valueLabel: '數值',
    previousLabel: '佔上一階段',
    firstLabel: '佔第一階段',
    summary: (model) => {
      if (model.stageCount === 0 || !model.first || !model.last)
        return NO_DATA
      if (model.stageCount === 1)
        return `1 個階段：${model.first.name} ${model.first.value}。`
      const parts = [`${model.stageCount} 個階段，從 ${model.first.name}（${model.first.value}）到 ${model.last.name}（${model.last.value}）。`]
      if (model.overall)
        parts.push(`整體轉換率 ${model.overall}。`)
      if (model.steepest)
        parts.push(`流失最多的一步：${model.steepest.from} 到 ${model.steepest.to}，保留 ${model.steepest.rate}。`)
      return parts.join('')
    },
  },
  'graph-chart': {
    ...chart,
    datumLabel: (details) => {
      const parts = [details.seriesName]
      if (details.formatted.value)
        parts.push(details.formatted.value)
      parts.push(`${details.formatted.links ?? '0'} 條連線`)
      return parts.join('，')
    },
    sourceLabel: '來源',
    targetLabel: '目標',
    valueLabel: '數值',
    linkLabel: '標籤',
    linksLabel: '連線',
    incomingLabel: '入邊',
    outgoingLabel: '出邊',
    summary: (model) => {
      if (model.nodeCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} 個節點，${model.linkCount} 條連線。`
      return model.hub ? `${head}連線最多的是 ${model.hub.name}（${model.hub.degree} 條）。` : head
    },
  },
  'grid-list': { root: '項目' },
  'heatmap': {
    gridLabel: '活動熱度圖',
    cellLabel: details => `${details.date}：${details.count}`,
    matrixCellLabel: details => `${details.row} ${details.column}：${details.count}`,
    legendLabel: '活動程度',
    legendLow: '少',
    legendHigh: '多',
  },
  'hierarchy-chart': {
    ...chart,
    chartRoleDescription: '樹狀圖表',
    datumLabel: (details) => {
      const head = `${details.seriesName}，${details.formatted.value ?? ''}`
      return details.formatted.parentShare ? `${head}，佔 ${details.formatted.parent ?? ''} 的 ${details.formatted.parentShare}` : head
    },
    rootLabel: '全部',
    pathLabel: '路徑',
    nameLabel: '路徑',
    valueLabel: '數值',
    levelLabel: level => `第 ${level} 層`,
    parentShareLabel: '佔上層',
    rootShareLabel: '佔總計',
    summary: (model) => {
      if (model.childCount === 0)
        return NO_DATA
      const head = `${model.root}：${model.childCount} 項，合計 ${model.total}。`
      return model.largest ? `${head}最大的是 ${model.largest.name} ${model.largest.value}（${model.largest.share}）。` : head
    },
  },
  'image-cropper': {
    cropArea: '裁切區域',
    valueText: rect => `X ${rect.x}，Y ${rect.y}，寬 ${rect.width}，高 ${rect.height}`,
    handleTopLeft: '左上角控點',
    handleTop: '上邊緣控點',
    handleTopRight: '右上角控點',
    handleRight: '右邊緣控點',
    handleBottomRight: '右下角控點',
    handleBottom: '下邊緣控點',
    handleBottomLeft: '左下角控點',
    handleLeft: '左邊緣控點',
    zoomSlider: '縮放',
    rotateSlider: '旋轉',
    flipHorizontal: '水平翻轉',
    flipVertical: '垂直翻轉',
  },
  'image-viewer': {
    content: '圖片預覽',
    toolbar: '圖片工具',
    close: '關閉',
    zoomIn: '放大',
    zoomOut: '縮小',
    rotateLeft: '向左旋轉',
    rotateRight: '向右旋轉',
    flipHorizontal: '水平翻轉',
    flipVertical: '垂直翻轉',
    reset: '重設',
    prev: '上一張',
    next: '下一張',
    counter: (index, count) => `${index} / ${count}`,
  },
  'json-viewer': {
    text: 'JSON 原始碼',
    tree: 'JSON',
    root: '根',
    objectPreview: count => `{…} ${count}`,
    arrayPreview: count => `[…] ${count}`,
    collapsedBranchLabel: (name, count) => `${name}，${count} 項`,
    moreItems: count => `… 還有 ${count} 項`,
    empty: '沒有資料',
  },
  'kbd': {
    keyName: (key, platform) => keyText(KEY_NAME, key, platform),
    keyLabel: (key, platform) => keyText(KEY_LABEL, key, platform),
    hotkey: names => names.join(' + '),
  },
  'loading-bar': { root: '載入中' },
  'log': { log: '記錄', scrollToBottom: '捲動到底部' },
  'markdown-stream': { completed: '回應已完成' },
  'marquee': { autoplayTriggerPause: '暫停捲動', autoplayTriggerPlay: '繼續捲動' },
  'mention': { content: '提及', empty: '沒有相符的結果' },
  'menubar': { root: '選單列' },
  'message-feed': {
    feed: '對話',
    scrollToBottom: '捲動到底部',
    scrollToBottomUnread: count => `捲動到底部，${count} 則新訊息`,
    item: (position, size, role) => {
      const who = role == null ? '' : `，${({ user: '使用者', assistant: '助理', system: '系統' })[role]}`
      return size > 0 ? `第 ${position} 則訊息，共 ${size} 則${who}` : `第 ${position} 則訊息${who}`
    },
  },
  'navigation-menu': { root: '主要導覽' },
  'notification': { region: '通知', close: '關閉' },
  'pagination': {
    root: '分頁',
    firstTrigger: '第一頁',
    prevTrigger: '上一頁',
    nextTrigger: '下一頁',
    lastTrigger: '最後一頁',
    item: page => `第 ${page} 頁`,
    ellipsis: count => `還有 ${count} 頁`,
    pageSizeSelect: '每頁筆數',
    pageSizeOption: size => `${size} 筆/頁`,
    summary: (start, end, count) => `第 ${start}-${end} 筆，共 ${count} 筆`,
    jumper: '前往頁碼',
  },
  'password-input': {
    visibilityTriggerShow: '顯示密碼',
    visibilityTriggerHide: '隱藏密碼',
    capsLockOn: 'Caps Lock 已開啟',
    strengthMeter: '密碼強度',
  },
  'pie-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}，${details.formatted.value ?? ''}，${details.formatted.share ?? ''}`,
    centerLabel: '總計',
    nameLabel: '名稱',
    valueLabel: '數值',
    shareLabel: '佔比',
    summary: (model) => {
      const first = model.slices[0]
      const last = model.slices.at(-1)
      if (model.sliceCount === 0 || !first || !last)
        return NO_DATA
      const head = `${model.sliceCount} 個扇區，合計 ${model.total}。`
      if (model.sliceCount === 1)
        return `${head}${first.name}：${first.share}。`
      return `${head}最大：${first.name} ${first.share}。最小：${last.name} ${last.share}。`
    },
  },
  'pin-input': { input: (index, length) => `第 ${index} 個字元，共 ${length} 個` },
  'popover': { close: '關閉' },
  'progress': { segmentValueText: ({ value, label }) => `${value}，${label}` },
  'prompt-input': { send: '傳送', stop: '停止產生' },
  'question-flow': {
    prompt: '問題',
    options: '選項',
    note: '其他答案',
    prev: '上一題',
    next: '下一題',
    progress: (current, total) => `第 ${current} 題，共 ${total} 題`,
    submitted: '答案已送出',
    selectionRange: (min, max) => {
      if (max === undefined)
        return `至少選擇 ${min} 項`
      if (min === max)
        return `選擇 ${min} 項`
      return min > 1 ? `選擇 ${min} 到 ${max} 項` : `最多選擇 ${max} 項`
    },
  },
  'radar-chart': {
    ...chart,
    nameLabel: '名稱',
    summary: (model) => {
      if (model.seriesCount === 0)
        return NO_DATA
      const head = `${model.seriesCount} 個數列，${model.indicatorCount} 個指標。`
      const parts = model.series.map((s) => {
        if (!s.highest)
          return `${s.name}：沒有數值。`
        return s.lowest
          ? `${s.name}：最高為 ${s.highest.indicator} ${s.highest.value}，最低為 ${s.lowest.indicator} ${s.lowest.value}。`
          : `${s.name}：${s.highest.indicator} ${s.highest.value}。`
      })
      return [head, ...parts].join('')
    },
  },
  'reasoning': {
    label: '思考過程',
    thinking: '思考中…',
    thinkingFor: '思考中，已經過 {seconds} 秒',
    thoughtFor: '已思考 {seconds} 秒',
  },
  'resizable': { root: '可調整大小的區域', handle: edge => `從${EDGE[edge]}調整大小` },
  'sankey-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}，${details.formatted.value ?? ''}`,
    sourceLabel: '來源',
    targetLabel: '目標',
    valueLabel: '流量',
    inflowLabel: '來自',
    outflowLabel: '流向',
    summary: (model) => {
      if (model.linkCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} 個節點，${model.linkCount} 條流，合計 ${model.total}。`
      return model.largest ? `${head}最大流量：${model.largest.source} 到 ${model.largest.target}，${model.largest.value}。` : head
    },
  },
  'scrollbar': { thumb: '捲軸' },
  'select': { ...tagged, clearTrigger: '清除', content: '選項' },
  'side-nav': { root: '側邊欄', input: '篩選導覽', noMatch: '沒有相符的結果' },
  'signature-pad': {
    label: '簽名',
    clearTrigger: '清除簽名',
    undoTrigger: '復原上一筆',
    redoTrigger: '重做一筆',
    statusEmpty: '尚未簽名',
    statusSigned: '已簽名',
  },
  'sortable': {
    root: '可排序清單',
    itemDragTrigger: name => `調整 ${name} 的順序`,
    itemDragTriggerRoleDescription: '可排序項目',
    picked: (name, position, total) => `已拿起 ${name}，位於第 ${position} 位，共 ${total} 位。使用方向鍵移動，空白鍵放下，Esc 鍵取消。`,
    moved: (_name, position, total) => `已移至第 ${position} 位，共 ${total} 位。`,
    dropped: (name, position) => `${name} 已放在第 ${position} 位。`,
    canceled: (name, position) => `已取消排序，${name} 回到第 ${position} 位。`,
    movedToList: (listName, listPosition, listTotal, position, total) =>
      `已移入 ${listName}，第 ${listPosition} 個清單，共 ${listTotal} 個；位於第 ${position} 位，共 ${total} 位。`,
    droppedInList: (name, listName, listPosition, position) => `${name} 已放入 ${listName}（第 ${listPosition} 個清單）的第 ${position} 位。`,
  },
  'sparkline': {
    summary: (model) => {
      if (model.count === 0)
        return NO_DATA
      if (model.variant === 'win-loss') {
        const parts = [`${model.wins} 勝`, `${model.losses} 敗`]
        if (model.ties > 0)
          parts.push(`${model.ties} 和`)
        return `${model.count} 個結果：${parts.join('，')}。`
      }
      const reference = model.reference == null ? '' : `參考值 ${model.reference}。`
      if (model.count === 1)
        return `1 個資料點：${model.last}。${reference}`
      const range = model.min === model.max ? `全部為 ${model.max}` : `範圍 ${model.min} 至 ${model.max}`
      const head = `${model.count} 個資料點，${range}。${reference}`
      if (model.direction === 'flat')
        return `${head}最後一個值 ${model.last}，與第一個值持平。`
      if (model.change == null)
        return `${head}最後一個值 ${model.last}。`
      return `${head}最後一個值 ${model.last}，較第一個值${model.direction === 'up' ? '上升' : '下降'} ${model.change}。`
    },
  },
  'spinner': { label: '載入中' },
  'splitter': { root: '分割面板', resizeTrigger: index => `調整第 ${index + 1} 個面板的大小` },
  'steps': { progressLabel: '步驟進度', progressValueText: percent => `已完成 ${percent}%` },
  'table': {
    ...drag,
    sort: column => `依 ${column} 排序`,
    columnResize: column => `調整 ${column} 欄寬`,
    columnDrag: column => `調整 ${column} 欄的位置`,
    columnDragRoleDescription: '可拖曳的欄',
    selectAll: '選取所有列',
    toolbar: '表格工具列',
    columnList: '欄設定',
    columnVisibility: column => `顯示 ${column} 欄`,
  },
  'tabs': { ...drag, overflowTrigger: '更多索引標籤' },
  'tag': { close: '刪除' },
  'tag-group': { deleteItem: label => `刪除 ${label}`, list: '標籤' },
  'tags-input': { deleteItem: value => `刪除 ${value}`, editTagInput: value => `編輯 ${value}`, clearTrigger: '清除' },
  'text-field': { clearTrigger: '清除' },
  'time-field': { ...segments, clearTrigger: '清除' },
  'time-picker': { ...tagged, ...segments, presets: '快速選項', clearTrigger: '清除' },
  'time-range-picker': { ...segments, startTime: '開始時間', endTime: '結束時間', presets: '快速選項', clearTrigger: '清除' },
  'timer': {
    time: ({ days, hours, minutes, seconds }) => `${days > 0 ? `${days} 天 ` : ''}${hours} 小時 ${minutes} 分鐘 ${seconds} 秒`,
    start: '開始',
    pause: '暫停',
    resume: '繼續',
    reset: '重設',
  },
  'tool-call': {
    inputStreaming: '準備中…',
    inputAvailable: '執行中…',
    awaitingApproval: '等待核准',
    outputAvailable: '已完成',
    outputError: '失敗',
  },
  'toolbar': { overflowTrigger: '更多' },
  'tour': { close: '關閉', progress: (step, count) => `第 ${step} 步，共 ${count} 步` },
  'transfer': { toTarget: '移至目標清單', toSource: '移回來源清單' },
  'tree': drag,
  'tree-select': {
    ...tagged,
    tree: '樹狀選項',
    clearTrigger: '清除',
    empty: '沒有資料',
    loading: '載入中',
    branchError: '無法載入下層選項',
    retry: '重試',
    branchEmpty: '沒有下層選項',
    searchInput: '搜尋',
    noMatch: '沒有相符的結果',
  },
  'truncate': { expand: '展開', collapse: '收合' },
} satisfies XhLocaleTranslations

/** 繁體中文（台灣）。 */
export const zhTW: XhLocale = { locale: 'zh-TW', translations }
