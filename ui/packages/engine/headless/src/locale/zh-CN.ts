/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 简体中文语言包。

import type { ChartDatumDetails } from '../shared/chart'
import type { XhLocale, XhLocaleTranslations } from './types'

const EDGE = {
  n: '上边缘',
  s: '下边缘',
  e: '右边缘',
  w: '左边缘',
  ne: '右上角',
  nw: '左上角',
  se: '右下角',
  sw: '左下角',
} as const

const COLOR_CHANNEL = {
  hue: '色相',
  saturation: '饱和度',
  brightness: '亮度',
  alpha: '透明度',
  red: '红色',
  green: '绿色',
  blue: '蓝色',
} as const

const COLOR_UNIT = { hue: '°', saturation: '%', brightness: '%', alpha: '%', red: '', green: '', blue: '' } as const

const tagged = {
  deleteItem: (label: string) => `删除 ${label}`,
  overflowTag: (count: number) => `+${count}`,
}

const segments = { hour: '小时', minute: '分钟', second: '秒', dayPeriod: '上午/下午' }

const calendar = { todayDate: (date: string) => `今天，${date}` }

const rangeCalendar = {
  ...calendar,
  startRangeSelectionPrompt: '点击开始选择日期范围',
  finishRangeSelectionPrompt: '点击完成日期范围选择',
  selectedRange: (start: string, end: string) => `已选范围：${start} 至 ${end}`,
}

const drag = {
  moved: (name: string, position: number, total: number) => `已将 ${name} 移到第 ${position} 位，共 ${total} 位。`,
  dropped: (name: string, position: number) => `${name} 已放在第 ${position} 位。`,
  canceled: (name: string, position: number) => `已取消移动，${name} 回到第 ${position} 位。`,
  rejected: (name: string) => `${name} 不能放在这里。`,
  movedInto: (name: string, into: string, position: number, total: number) => `已将 ${name} 移入 ${into}，位于第 ${position} 位，共 ${total} 位。`,
  droppedInto: (name: string, into: string, position: number) => `${name} 已放入 ${into} 的第 ${position} 位。`,
  canceledInto: (name: string, into: string, position: number) => `已取消移动，${name} 回到 ${into} 的第 ${position} 位。`,
  rootLevel: '顶层',
}

const chart = {
  chartRoleDescription: '图表',
  seriesRoleDescription: '系列',
  legendLabel: '图例',
  missingValue: '无数值',
  emptyText: '暂无数据',
  loadingText: '加载中…',
  otherLabel: '其他',
  tableCaption: '数据表',
  datumLabel: (details: ChartDatumDetails) =>
    `${details.formatted.key ?? String(details.key)}，${details.seriesName} ${details.formatted.value ?? ''}`,
}

const NO_DATA = '暂无数据。'

const translations = {
  'alert': { close: '关闭' },
  'anchor': { root: '锚点导航' },
  'approval': {
    scopes: '权限',
    note: '备注',
    reason: '拒绝理由',
    pending: '等待你的决定',
    approved: '已批准',
    denied: '已拒绝',
    expired: '已过期，按拒绝处理',
  },
  'back-top': { trigger: '回到顶部' },
  'breadcrumb': { root: '面包屑', ellipsis: '显示完整路径' },
  'calendar-picker': calendar,
  'calendar-range-picker': rangeCalendar,
  'carousel': {
    root: '轮播',
    rootRoleDescription: '轮播',
    itemRoleDescription: '幻灯片',
    prevTrigger: '上一张',
    nextTrigger: '下一张',
    autoplayTriggerPlay: '开始自动播放',
    autoplayTriggerPause: '停止自动播放',
    indicatorGroup: '选择要显示的轮播项',
    indicator: page => `转到第 ${page} 张`,
    item: (index, count) => `第 ${index} 张，共 ${count} 张`,
  },
  'cartesian-chart': {
    ...chart,
    keyLabel: '类别',
    seriesLabel: '系列',
    valueLabel: '数值',
    sizeLabel: '大小',
    colorLabel: '颜色',
    referenceLabel: '参考',
    averageLabel: '平均值',
    ohlcLabel: ({ open, high, low, close }) => `开盘 ${open}，最高 ${high}，最低 ${low}，收盘 ${close}`,
    ohlcColumns: { open: '开盘', high: '最高', low: '最低', close: '收盘' },
    boxLabel: ({ min, q1, median, q3, max }) => `最小值 ${min}，下四分位数 ${q1}，中位数 ${median}，上四分位数 ${q3}，最大值 ${max}`,
    boxColumns: { min: '最小值', q1: '下四分位数', median: '中位数', q3: '上四分位数', max: '最大值', outliers: '离群值' },
    zoomLabel: '缩放',
    zoomStartLabel: '范围起点',
    zoomEndLabel: '范围终点',
    aggregatedCaption: ({ caption, rows, ranges }) => `${caption}（${rows} 行，聚合为 ${ranges} 个区间）`,
    annotationSummary: items => items.map(item => `${item.label}${item.series ? `（${item.series}）` : ''}：${item.value}。`).join(''),
    summary: (model) => {
      if (!model.range || model.series.every(s => s.count === 0))
        return NO_DATA
      const { first, last, count } = model.range
      const head = `${model.seriesCount} 个系列，${count} 个数据点，从 ${first} 到 ${last}。`
      const lines = model.series.flatMap((s) => {
        if (!s.min || !s.max)
          return []
        if (s.min.key === s.max.key && s.min.value === s.max.value)
          return `${s.name}：${s.max.key} 为 ${s.max.value}。`
        return `${s.name}：最低 ${s.min.value}（${s.min.key}），最高 ${s.max.value}（${s.max.key}）。`
      })
      return [head, ...lines].join('')
    },
  },
  'cascader': {
    ...tagged,
    empty: '暂无数据',
    noMatch: '无匹配结果',
    loading: '加载中',
    branchError: '无法加载下级选项',
    retry: '重试',
    column: '选项',
    searchInput: '搜索',
    searchList: '搜索结果',
    clearTrigger: '清空',
  },
  'citation': {
    sources: '来源',
    preview: '来源预览',
    closePreview: '关闭来源预览',
    openSource: title => `打开 ${title}`,
    citation: (index, title) => `来源 ${index}：${title}`,
    citations: indexes => `来源 ${indexes.join('、')}`,
    previousSource: '上一个来源',
    nextSource: '下一个来源',
    source: (index, title) => `来源 ${index}：${title}`,
    document: '文档',
  },
  'clipboard': { copied: '已复制' },
  'code-view': {
    code: '代码',
    expand: '展开代码',
    collapse: '收起代码',
    foldBlock: (first, last) => (first === last ? `第 ${first} 行` : `第 ${first}–${last} 行`),
  },
  'color-field': { clearTrigger: '清空' },
  'color-picker': {
    ...tagged,
    area: '饱和度与亮度',
    areaValueText: (saturation, brightness) => `饱和度 ${saturation}%，亮度 ${brightness}%`,
    channel: channel => COLOR_CHANNEL[channel],
    channelValueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
    input: channel => ({ hex: '十六进制', r: '红色', g: '绿色', b: '蓝色', a: '透明度' })[channel],
    swatch: value => `颜色 ${value}`,
    swatchGroup: '色板',
    recentSwatchGroup: '最近使用的颜色',
    eyeDropperTrigger: '从屏幕取色',
  },
  'color-slider': {
    label: channel => COLOR_CHANNEL[channel],
    valueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
  },
  'color-swatch-picker': { group: '色板', swatch: value => `颜色 ${value}` },
  'combobox': { ...tagged, trigger: '显示建议', clearTrigger: '清空' },
  'command': { title: '命令面板', input: '搜索命令', list: '命令' },
  'context-menu': { content: '右键菜单' },
  'date-field': {
    ...segments,
    year: '年',
    quarter: '季度',
    month: '月',
    week: '周',
    day: '日',
    clearTrigger: '清空',
  },
  'date-picker': { ...tagged, ...segments, ...calendar, presets: '快捷选项', clearTrigger: '清空' },
  'date-range-picker': {
    ...segments,
    ...rangeCalendar,
    startDate: '开始日期',
    endDate: '结束日期',
    startTime: '开始时间',
    endTime: '结束时间',
    presets: '快捷选项',
    clearTrigger: '清空',
  },
  'dialog': { close: '关闭', dragTrigger: '移动对话框' },
  'diff-view': {
    added: '新增',
    removed: '删除',
    unchanged: '未改动',
    expandGap: count => `显示隐藏的 ${count} 行`,
    diff: '差异',
    noChanges: '没有变更',
    truncated: count => `另有 ${count} 行已截断，未显示`,
    commentOn: (line, side) => `评论${side === 'old' ? '旧' : '新'}版本第 ${line} 行`,
  },
  'drawer': { close: '关闭', resizeTrigger: '调整抽屉大小' },
  'field-array': {
    deleteItem: (index, count) => `删除第 ${index} 行，共 ${count} 行`,
    moveUpTrigger: (index, count) => `上移第 ${index} 行，共 ${count} 行`,
    moveDownTrigger: (index, count) => `下移第 ${index} 行，共 ${count} 行`,
  },
  'file-upload': {
    dropzone: '将文件拖放到此处',
    deleteItem: file => `删除 ${file.name}`,
    clearTrigger: '清空所有文件',
  },
  'float-button': { trigger: '操作' },
  'floating-panel': {
    dragTrigger: '移动面板',
    resizeTrigger: edge => `从${EDGE[edge]}调整大小`,
    resizeValueText: size => `宽 ${Math.round(size.width)}，高 ${Math.round(size.height)}`,
    windowStateTrigger: state => ({ default: '还原面板', maximized: '最大化面板', minimized: '最小化面板' })[state],
    close: '关闭',
  },
  'funnel-chart': {
    ...chart,
    datumLabel: (details) => {
      const head = `${details.seriesName}，${details.formatted.value ?? ''}`
      return details.formatted.previous ? `${head}，为上一阶段的 ${details.formatted.previous}` : head
    },
    nameLabel: '阶段',
    valueLabel: '数值',
    previousLabel: '占上一阶段',
    firstLabel: '占第一阶段',
    summary: (model) => {
      if (model.stageCount === 0 || !model.first || !model.last)
        return NO_DATA
      if (model.stageCount === 1)
        return `1 个阶段：${model.first.name} ${model.first.value}。`
      const parts = [`${model.stageCount} 个阶段，从 ${model.first.name}（${model.first.value}）到 ${model.last.name}（${model.last.value}）。`]
      if (model.overall)
        parts.push(`整体转化率 ${model.overall}。`)
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
      parts.push(`${details.formatted.links ?? '0'} 条连线`)
      return parts.join('，')
    },
    sourceLabel: '源',
    targetLabel: '目标',
    valueLabel: '数值',
    linkLabel: '标签',
    linksLabel: '连线',
    incomingLabel: '入边',
    outgoingLabel: '出边',
    summary: (model) => {
      if (model.nodeCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} 个节点，${model.linkCount} 条连线。`
      return model.hub ? `${head}连线最多的是 ${model.hub.name}（${model.hub.degree} 条）。` : head
    },
  },
  'grid-list': { root: '项目' },
  'heatmap': {
    gridLabel: '活跃度热力图',
    cellLabel: details => `${details.date}：${details.count}`,
    matrixCellLabel: details => `${details.row} ${details.column}：${details.count}`,
    legendLabel: '活跃度',
    legendLow: '少',
    legendHigh: '多',
  },
  'hierarchy-chart': {
    ...chart,
    datumLabel: (details) => {
      const head = `${details.seriesName}，${details.formatted.value ?? ''}`
      return details.formatted.parentShare ? `${head}，占 ${details.formatted.parent ?? ''} 的 ${details.formatted.parentShare}` : head
    },
    rootLabel: '全部',
    pathLabel: '路径',
    nameLabel: '路径',
    valueLabel: '数值',
    levelLabel: level => `第 ${level} 层`,
    parentShareLabel: '占上级',
    rootShareLabel: '占总计',
    summary: (model) => {
      if (model.childCount === 0)
        return NO_DATA
      const head = `${model.root}：${model.childCount} 项，合计 ${model.total}。`
      return model.largest ? `${head}最大的是 ${model.largest.name} ${model.largest.value}（${model.largest.share}）。` : head
    },
  },
  'image-cropper': {
    cropArea: '裁剪区域',
    valueText: rect => `X ${rect.x}，Y ${rect.y}，宽 ${rect.width}，高 ${rect.height}`,
    handleTopLeft: '左上角把手',
    handleTop: '上边缘把手',
    handleTopRight: '右上角把手',
    handleRight: '右边缘把手',
    handleBottomRight: '右下角把手',
    handleBottom: '下边缘把手',
    handleBottomLeft: '左下角把手',
    handleLeft: '左边缘把手',
    zoomSlider: '缩放',
    rotateSlider: '旋转',
    flipHorizontal: '水平翻转',
    flipVertical: '垂直翻转',
  },
  'image-viewer': {
    content: '图片预览',
    toolbar: '图片工具',
    close: '关闭',
    zoomIn: '放大',
    zoomOut: '缩小',
    rotateLeft: '向左旋转',
    rotateRight: '向右旋转',
    flipHorizontal: '水平翻转',
    flipVertical: '垂直翻转',
    reset: '重置',
    prev: '上一张',
    next: '下一张',
    counter: (index, count) => `${index} / ${count}`,
  },
  'json-viewer': {
    text: 'JSON 源码',
    tree: 'JSON',
    root: '根',
    objectPreview: count => `{…} ${count}`,
    arrayPreview: count => `[…] ${count}`,
    collapsedBranchLabel: (name, count) => `${name}，${count} 项`,
    moreItems: count => `… 另有 ${count} 项`,
    empty: '暂无数据',
  },
  'kbd': { hotkey: names => names.join(' + ') },
  'loading-bar': { root: '加载中' },
  'log': { log: '日志', scrollToBottom: '滚动到底部' },
  'markdown-stream': { completed: '回复已完成' },
  'marquee': { autoplayTriggerPause: '暂停滚动', autoplayTriggerPlay: '继续滚动' },
  'mention': { content: '提及' },
  'menubar': { root: '菜单栏' },
  'message-feed': {
    feed: '对话',
    scrollToBottom: '滚动到底部',
    scrollToBottomUnread: count => `滚动到底部，${count} 条新消息`,
    item: (position, size, role) => {
      const who = role == null ? '' : `，${({ user: '用户', assistant: '助手', system: '系统' })[role]}`
      return size > 0 ? `第 ${position} 条消息，共 ${size} 条${who}` : `第 ${position} 条消息${who}`
    },
  },
  'navigation-menu': { root: '主导航' },
  'notification': { region: '通知', close: '关闭' },
  'pagination': {
    root: '分页',
    firstTrigger: '第一页',
    prevTrigger: '上一页',
    nextTrigger: '下一页',
    lastTrigger: '最后一页',
    item: page => `第 ${page} 页`,
    ellipsis: count => `另外 ${count} 页`,
    pageSizeSelect: '每页条数',
    pageSizeOption: size => `${size} 条/页`,
    summary: (start, end, count) => `第 ${start}-${end} 条，共 ${count} 条`,
    jumper: '跳至页码',
  },
  'password-input': {
    visibilityTriggerShow: '显示密码',
    visibilityTriggerHide: '隐藏密码',
    capsLockOn: '大写锁定已开启',
    strengthMeter: '密码强度',
  },
  'pie-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}，${details.formatted.value ?? ''}，${details.formatted.share ?? ''}`,
    centerLabel: '总计',
    nameLabel: '名称',
    valueLabel: '数值',
    shareLabel: '占比',
    summary: (model) => {
      const first = model.slices[0]
      const last = model.slices.at(-1)
      if (model.sliceCount === 0 || !first || !last)
        return NO_DATA
      const head = `${model.sliceCount} 个扇区，合计 ${model.total}。`
      if (model.sliceCount === 1)
        return `${head}${first.name}：${first.share}。`
      return `${head}最大：${first.name} ${first.share}。最小：${last.name} ${last.share}。`
    },
  },
  'pin-input': { input: (index, length) => `第 ${index} 位，共 ${length} 位` },
  'popover': { close: '关闭' },
  'progress': { segmentValueText: ({ value, label }) => `${value}，${label}` },
  'prompt-input': { send: '发送', stop: '停止生成' },
  'question-flow': {
    prompt: '问题',
    options: '选项',
    note: '其他答案',
    prev: '上一题',
    next: '下一题',
    progress: (current, total) => `第 ${current} 题，共 ${total} 题`,
    submitted: '答案已发送',
    selectionRange: (min, max) => {
      if (max === undefined)
        return `至少选择 ${min} 项`
      if (min === max)
        return `选择 ${min} 项`
      return min > 1 ? `选择 ${min} 到 ${max} 项` : `最多选择 ${max} 项`
    },
  },
  'radar-chart': {
    ...chart,
    nameLabel: '名称',
    summary: (model) => {
      if (model.seriesCount === 0)
        return NO_DATA
      const head = `${model.seriesCount} 个系列，${model.indicatorCount} 个指标。`
      const parts = model.series.map((s) => {
        if (!s.highest)
          return `${s.name}：无数值。`
        return s.lowest
          ? `${s.name}：最高为 ${s.highest.indicator} ${s.highest.value}，最低为 ${s.lowest.indicator} ${s.lowest.value}。`
          : `${s.name}：${s.highest.indicator} ${s.highest.value}。`
      })
      return [head, ...parts].join('')
    },
  },
  'reasoning': {
    label: '思考过程',
    thinking: '思考中…',
    thinkingFor: '思考中，已用时 {seconds} 秒',
    thoughtFor: '思考用时 {seconds} 秒',
  },
  'resizable': { root: '可调整大小的区域', handle: edge => `从${EDGE[edge]}调整大小` },
  'sankey-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}，${details.formatted.value ?? ''}`,
    sourceLabel: '来源',
    targetLabel: '目标',
    valueLabel: '流量',
    inflowLabel: '来自',
    outflowLabel: '流向',
    summary: (model) => {
      if (model.linkCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} 个节点，${model.linkCount} 条流，合计 ${model.total}。`
      return model.largest ? `${head}最大的流：${model.largest.source} 到 ${model.largest.target}，${model.largest.value}。` : head
    },
  },
  'scrollbar': { thumb: '滚动条' },
  'select': { ...tagged, clearTrigger: '清空', content: '选项' },
  'side-nav': { root: '侧边栏', input: '筛选导航', noMatch: '无匹配结果' },
  'signature-pad': {
    label: '签名',
    clearTrigger: '清除签名',
    undoTrigger: '撤销上一笔',
    redoTrigger: '重做一笔',
    statusEmpty: '尚未签名',
    statusSigned: '已签名',
  },
  'sortable': {
    root: '可排序列表',
    itemDragTrigger: name => `调整 ${name} 的顺序`,
    itemDragTriggerRoleDescription: '可排序项',
    picked: (name, position, total) => `已拿起 ${name}，位于第 ${position} 位，共 ${total} 位。用方向键移动，空格键放下，Esc 键取消。`,
    moved: (_name, position, total) => `已移到第 ${position} 位，共 ${total} 位。`,
    dropped: (name, position) => `${name} 已放在第 ${position} 位。`,
    canceled: (name, position) => `已取消排序，${name} 回到第 ${position} 位。`,
    movedToList: (listName, listPosition, listTotal, position, total) =>
      `已移入 ${listName}，第 ${listPosition} 个列表，共 ${listTotal} 个；位于第 ${position} 位，共 ${total} 位。`,
    droppedInList: (name, listName, listPosition, position) => `${name} 已放入 ${listName}（第 ${listPosition} 个列表）的第 ${position} 位。`,
  },
  'sparkline': {
    summary: (model) => {
      if (model.count === 0)
        return NO_DATA
      if (model.variant === 'win-loss') {
        const parts = [`${model.wins} 胜`, `${model.losses} 负`]
        if (model.ties > 0)
          parts.push(`${model.ties} 平`)
        return `${model.count} 个结果：${parts.join('，')}。`
      }
      const reference = model.reference == null ? '' : `参考值 ${model.reference}。`
      if (model.count === 1)
        return `1 个数据点：${model.last}。${reference}`
      const range = model.min === model.max ? `全部为 ${model.max}` : `范围 ${model.min} 至 ${model.max}`
      const head = `${model.count} 个数据点，${range}。${reference}`
      if (model.direction === 'flat')
        return `${head}末值 ${model.last}，与首值持平。`
      if (model.change == null)
        return `${head}末值 ${model.last}。`
      return `${head}末值 ${model.last}，较首值${model.direction === 'up' ? '上升' : '下降'} ${model.change}。`
    },
  },
  'spinner': { label: '加载中' },
  'splitter': { root: '分隔面板', resizeTrigger: index => `调整第 ${index + 1} 个面板的大小` },
  'steps': { progressLabel: '步骤进度', progressValueText: percent => `已完成 ${percent}%` },
  'table': {
    ...drag,
    sort: column => `按 ${column} 排序`,
    columnResize: column => `调整 ${column} 列宽`,
    columnDrag: column => `调整 ${column} 列的位置`,
    columnDragRoleDescription: '可拖动的列',
    selectAll: '选择所有行',
    toolbar: '表格工具栏',
    columnList: '列设置',
    columnVisibility: column => `显示 ${column} 列`,
  },
  'tabs': { ...drag, overflowTrigger: '更多标签页' },
  'tag': { close: '删除' },
  'tag-group': { deleteItem: label => `删除 ${label}`, list: '标签' },
  'tags-input': { deleteItem: value => `删除 ${value}`, editTagInput: value => `编辑 ${value}`, clearTrigger: '清空' },
  'text-field': { clearTrigger: '清空' },
  'time-field': { ...segments, clearTrigger: '清空' },
  'time-picker': { ...tagged, ...segments, presets: '快捷选项', clearTrigger: '清空' },
  'time-range-picker': { ...segments, startTime: '开始时间', endTime: '结束时间', presets: '快捷选项', clearTrigger: '清空' },
  'timer': {
    time: ({ days, hours, minutes, seconds }) => `${days > 0 ? `${days} 天 ` : ''}${hours} 小时 ${minutes} 分钟 ${seconds} 秒`,
    start: '开始',
    pause: '暂停',
    resume: '继续',
    reset: '重置',
  },
  'tool-call': {
    inputStreaming: '准备中…',
    inputAvailable: '运行中…',
    awaitingApproval: '等待批准',
    outputAvailable: '已完成',
    outputError: '失败',
  },
  'toolbar': { overflowTrigger: '更多' },
  'tour': { close: '关闭', progress: (step, count) => `第 ${step} 步，共 ${count} 步` },
  'transfer': { toTarget: '移到目标列表', toSource: '移回源列表' },
  'tree': drag,
  'tree-select': {
    ...tagged,
    tree: '树形选项',
    clearTrigger: '清空',
    empty: '暂无数据',
    loading: '加载中',
    branchError: '无法加载下级选项',
    retry: '重试',
    branchEmpty: '没有下级选项',
    searchInput: '搜索',
    noMatch: '无匹配结果',
  },
  'truncate': { expand: '展开', collapse: '收起' },
} satisfies XhLocaleTranslations

/** 简体中文。 */
export const zhCN: XhLocale = { locale: 'zh-CN', translations }
