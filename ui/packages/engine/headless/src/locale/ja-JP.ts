/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 日语语言包。

import type { ChartDatumDetails } from '../shared/chart'
import type { KeyTextTable } from './key-text'
import type { XhLocale, XhLocaleTranslations } from './types'
import { keyText } from './key-text'

/** 读屏念的键名：修饰键在 Mac 与其余平台上叫法不同。 */
const KEY_NAME: KeyTextTable = {
  'Alt': { mac: 'Option キー', other: 'Alt キー' },
  'Control': { mac: 'Control キー', other: 'Ctrl キー' },
  'Meta': { mac: 'Command キー', other: 'Windows キー' },
  'Shift': 'Shift キー',
  ' ': 'スペースキー',
  'ArrowDown': '下矢印キー',
  'ArrowLeft': '左矢印キー',
  'ArrowRight': '右矢印キー',
  'ArrowUp': '上矢印キー',
  'Backspace': 'Backspace キー',
  'Delete': 'Delete キー',
  'Enter': 'Enter キー',
  'Escape': 'Esc キー',
  'Tab': 'Tab キー',
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
  n: '上端',
  s: '下端',
  e: '右端',
  w: '左端',
  ne: '右上隅',
  nw: '左上隅',
  se: '右下隅',
  sw: '左下隅',
} as const

const COLOR_CHANNEL = {
  hue: '色相',
  saturation: '彩度',
  brightness: '明度',
  alpha: '不透明度',
  red: '赤',
  green: '緑',
  blue: '青',
} as const

const COLOR_UNIT = { hue: '°', saturation: '%', brightness: '%', alpha: '%', red: '', green: '', blue: '' } as const

const tagged = {
  deleteItem: (label: string) => `${label} を削除`,
  overflowTag: (count: number) => `+${count}`,
}

const segments = { hour: '時', minute: '分', second: '秒', dayPeriod: '午前/午後' }

const calendar = { todayDate: (date: string) => `今日、${date}` }

const rangeCalendar = {
  ...calendar,
  startRangeSelectionPrompt: 'クリックして日付範囲の選択を開始',
  finishRangeSelectionPrompt: 'クリックして日付範囲の選択を終了',
  selectedRange: (start: string, end: string) => `選択範囲：${start} から ${end}`,
}

const drag = {
  moved: (name: string, position: number, total: number) => `${name} を ${total} 個中 ${position} 番目に移動しました。`,
  dropped: (name: string, position: number) => `${name} を ${position} 番目にドロップしました。`,
  canceled: (name: string, position: number) => `移動をキャンセルしました。${name} は ${position} 番目に戻りました。`,
  rejected: (name: string) => `${name} はここにドロップできません。`,
  movedInto: (name: string, into: string, position: number, total: number) => `${name} を ${into} に移動しました。${total} 個中 ${position} 番目です。`,
  droppedInto: (name: string, into: string, position: number) => `${name} を ${into} の ${position} 番目にドロップしました。`,
  canceledInto: (name: string, into: string, position: number) => `移動をキャンセルしました。${name} は ${into} の ${position} 番目に戻りました。`,
  rootLevel: 'トップレベル',
}

const chart = {
  chartRoleDescription: 'グラフ',
  seriesRoleDescription: '系列',
  legendLabel: '凡例',
  missingValue: '値なし',
  emptyText: 'データがありません',
  loadingText: '読み込み中…',
  otherLabel: 'その他',
  tableCaption: 'データテーブル',
  datumLabel: (details: ChartDatumDetails) =>
    `${details.formatted.key ?? String(details.key)}、${details.seriesName} ${details.formatted.value ?? ''}`,
}

const NO_DATA = 'データがありません。'

const translations = {
  'alert': { close: '閉じる' },
  'anchor': { root: 'ページ内ナビゲーション' },
  'approval': {
    scopes: '権限',
    note: 'メモ',
    reason: '拒否の理由',
    pending: '判断待ち',
    approved: '承認済み',
    denied: '拒否済み',
    expired: '期限切れ（拒否として扱われます）',
  },
  'back-top': { trigger: 'トップへ戻る' },
  'breadcrumb': { root: 'パンくずリスト', ellipsis: 'パス全体を表示' },
  'calendar-picker': calendar,
  'calendar-range-picker': rangeCalendar,
  'carousel': {
    root: 'カルーセル',
    rootRoleDescription: 'カルーセル',
    itemRoleDescription: 'スライド',
    prevTrigger: '前のスライド',
    nextTrigger: '次のスライド',
    autoplayTriggerPlay: 'スライドショーの自動再生を開始',
    autoplayTriggerPause: 'スライドショーの自動再生を停止',
    indicatorGroup: '表示するスライドを選択',
    indicator: page => `スライド ${page} へ移動`,
    item: (index, count) => `${count} 枚中 ${index} 枚目`,
  },
  'cartesian-chart': {
    ...chart,
    keyLabel: 'カテゴリ',
    seriesLabel: '系列',
    valueLabel: '値',
    sizeLabel: 'サイズ',
    colorLabel: '色',
    referenceLabel: '基準',
    averageLabel: '平均',
    ohlcLabel: ({ open, high, low, close }) => `始値 ${open}、高値 ${high}、安値 ${low}、終値 ${close}`,
    ohlcColumns: { open: '始値', high: '高値', low: '安値', close: '終値' },
    boxLabel: ({ min, q1, median, q3, max }) => `最小値 ${min}、第 1 四分位数 ${q1}、中央値 ${median}、第 3 四分位数 ${q3}、最大値 ${max}`,
    boxColumns: { min: '最小値', q1: '第 1 四分位数', median: '中央値', q3: '第 3 四分位数', max: '最大値', outliers: '外れ値' },
    zoomLabel: 'ズーム',
    zoomStartLabel: '表示範囲の開始',
    zoomEndLabel: '表示範囲の終了',
    aggregatedCaption: ({ caption, rows, ranges }) => `${caption}（${rows} 行を ${ranges} 区間に集計）`,
    annotationSummary: items => items.map(item => `${item.label}${item.series ? `（${item.series}）` : ''}：${item.value}。`).join(''),
    summary: (model) => {
      if (!model.range || model.series.every(s => s.count === 0))
        return NO_DATA
      const { first, last, count } = model.range
      const head = `${model.seriesCount} 系列、${first} から ${last} までの ${count} 個のデータポイント。`
      const lines = model.series.flatMap((s) => {
        if (!s.min || !s.max)
          return []
        if (s.min.key === s.max.key && s.min.value === s.max.value)
          return `${s.name}：${s.max.key} で ${s.max.value}。`
        return `${s.name}：最低 ${s.min.value}（${s.min.key}）、最高 ${s.max.value}（${s.max.key}）。`
      })
      return [head, ...lines].join('')
    },
  },
  'cascader': {
    ...tagged,
    empty: 'データがありません',
    noMatch: '一致する項目がありません',
    loading: '読み込み中',
    branchError: '下位の項目を読み込めませんでした',
    retry: '再試行',
    column: '選択肢',
    searchInput: '検索',
    searchList: '検索結果',
    clearTrigger: 'クリア',
  },
  'citation': {
    sources: '出典',
    preview: '出典のプレビュー',
    closePreview: '出典のプレビューを閉じる',
    openSource: title => `${title} を開く`,
    citation: (index, title) => `出典 ${index}：${title}`,
    citations: indexes => `出典 ${indexes.join('、')}`,
    previousSource: '前の出典',
    nextSource: '次の出典',
    source: (index, title) => `出典 ${index}：${title}`,
    document: 'ドキュメント',
    previewLinkSource: '出典を開く',
    previewLinkDocument: 'ドキュメントを開く',
  },
  'clipboard': { copied: 'コピーしました' },
  'code-view': {
    code: 'コード',
    expand: 'コードを展開',
    collapse: 'コードを折りたたむ',
    foldBlock: (first, last) => (first === last ? `${first} 行目` : `${first}–${last} 行目`),
  },
  'color-field': { clearTrigger: 'クリア' },
  'color-picker': {
    ...tagged,
    area: '彩度と明度',
    areaValueText: (saturation, brightness) => `彩度 ${saturation}%、明度 ${brightness}%`,
    channel: channel => COLOR_CHANNEL[channel],
    channelValueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
    input: channel => ({ hex: '16 進数', r: '赤', g: '緑', b: '青', a: '不透明度' })[channel],
    swatch: value => `色 ${value}`,
    swatchGroup: 'カラースウォッチ',
    recentSwatchGroup: '最近使用した色',
    eyeDropperTrigger: '画面から色を選択',
  },
  'color-slider': {
    label: channel => COLOR_CHANNEL[channel],
    valueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
  },
  'color-swatch-picker': { group: 'カラースウォッチ', swatch: value => `色 ${value}` },
  'combobox': { ...tagged, trigger: '候補を表示', clearTrigger: 'クリア' },
  'command': { title: 'コマンドパレット', input: 'コマンドを検索', list: 'コマンド' },
  'context-menu': { content: 'コンテキストメニュー' },
  'date-field': {
    ...segments,
    year: '年',
    quarter: '四半期',
    month: '月',
    week: '週番号',
    day: '日',
    clearTrigger: 'クリア',
  },
  'date-picker': { ...tagged, ...segments, ...calendar, presets: 'ショートカット', clearTrigger: 'クリア' },
  'date-range-picker': {
    ...segments,
    ...rangeCalendar,
    startDate: '開始日',
    endDate: '終了日',
    startTime: '開始時刻',
    endTime: '終了時刻',
    presets: 'ショートカット',
    clearTrigger: 'クリア',
  },
  'dialog': {
    close: '閉じる',
    dragTrigger: 'ダイアログを移動',
    ok: 'OK',
    cancel: 'キャンセル',
    actionError: '操作に失敗しました。もう一度お試しください。',
  },
  'diff-view': {
    added: '追加',
    removed: '削除',
    unchanged: '変更なし',
    expandGap: count => `非表示の ${count} 行を表示`,
    diff: '差分',
    noChanges: '変更はありません',
    truncated: count => `残りの ${count} 行は省略され、表示されていません`,
    commentOn: (line, side) => `${side === 'old' ? '変更前' : '変更後'}の ${line} 行目にコメント`,
  },
  'drawer': { close: '閉じる', resizeTrigger: 'ドロワーのサイズを変更' },
  'field-array': {
    deleteItem: (index, count) => `${count} 行中 ${index} 行目を削除`,
    moveUpTrigger: (index, count) => `${count} 行中 ${index} 行目を上へ移動`,
    moveDownTrigger: (index, count) => `${count} 行中 ${index} 行目を下へ移動`,
  },
  'file-upload': {
    dropzone: 'ここにファイルをドロップ',
    deleteItem: file => `${file.name} を削除`,
    clearTrigger: 'すべてのファイルをクリア',
  },
  'float-button': { trigger: 'アクション' },
  'floating-panel': {
    dragTrigger: 'パネルを移動',
    resizeTrigger: edge => `${EDGE[edge]}でサイズを変更`,
    resizeValueText: size => `幅 ${Math.round(size.width)}、高さ ${Math.round(size.height)}`,
    windowStateTrigger: state => ({ default: 'パネルを元のサイズに戻す', maximized: 'パネルを最大化', minimized: 'パネルを最小化' })[state],
    close: '閉じる',
  },
  'form': {
    required: '{name} は必須です',
    type: {
      string: '{name} は文字列で入力してください',
      number: '{name} は数値で入力してください',
      integer: '{name} は整数で入力してください',
      email: '{name} は有効なメールアドレスではありません',
      url: '{name} は有効な URL ではありません',
      array: '{name} は配列である必要があります',
    },
    minLength: '{name} は {min} 文字以上で入力してください',
    maxLength: '{name} は {max} 文字以内で入力してください',
    minNumber: '{name} は {min} 以上で入力してください',
    maxNumber: '{name} は {max} 以下で入力してください',
    pattern: '{name} の形式が正しくありません',
  },
  'funnel-chart': {
    ...chart,
    datumLabel: (details) => {
      const head = `${details.seriesName}、${details.formatted.value ?? ''}`
      return details.formatted.previous ? `${head}、前ステージ比 ${details.formatted.previous}` : head
    },
    nameLabel: 'ステージ',
    valueLabel: '値',
    previousLabel: '前ステージ比',
    firstLabel: '初ステージ比',
    summary: (model) => {
      if (model.stageCount === 0 || !model.first || !model.last)
        return NO_DATA
      if (model.stageCount === 1)
        return `1 ステージ：${model.first.name} ${model.first.value}。`
      const parts = [`${model.stageCount} ステージ：${model.first.name}（${model.first.value}）から ${model.last.name}（${model.last.value}）まで。`]
      if (model.overall)
        parts.push(`全体のコンバージョン率 ${model.overall}。`)
      if (model.steepest)
        parts.push(`最大の減少：${model.steepest.from} から ${model.steepest.to}、維持率 ${model.steepest.rate}。`)
      return parts.join('')
    },
  },
  'graph-chart': {
    ...chart,
    datumLabel: (details) => {
      const parts = [details.seriesName]
      if (details.formatted.value)
        parts.push(details.formatted.value)
      parts.push(`リンク ${details.formatted.links ?? '0'} 本`)
      return parts.join('、')
    },
    sourceLabel: 'ソース',
    targetLabel: 'ターゲット',
    valueLabel: '値',
    linkLabel: 'ラベル',
    linksLabel: 'リンク',
    incomingLabel: '入方向',
    outgoingLabel: '出方向',
    summary: (model) => {
      if (model.nodeCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} 個のノード、${model.linkCount} 本のリンク。`
      return model.hub ? `${head}最も接続が多いノード：${model.hub.name}（${model.hub.degree} 本）。` : head
    },
  },
  'grid-list': { root: '項目' },
  'heatmap': {
    gridLabel: 'アクティビティのヒートマップ',
    cellLabel: details => `${details.date}：${details.count}`,
    matrixCellLabel: details => `${details.row} ${details.column}：${details.count}`,
    legendLabel: 'アクティビティレベル',
    legendLow: '少',
    legendHigh: '多',
  },
  'hierarchy-chart': {
    ...chart,
    chartRoleDescription: 'ツリーグラフ',
    datumLabel: (details) => {
      const head = `${details.seriesName}、${details.formatted.value ?? ''}`
      return details.formatted.parentShare ? `${head}、${details.formatted.parent ?? ''} の ${details.formatted.parentShare}` : head
    },
    rootLabel: 'すべて',
    pathLabel: 'パス',
    nameLabel: 'パス',
    valueLabel: '値',
    levelLabel: level => `レベル ${level}`,
    parentShareLabel: '親に占める割合',
    rootShareLabel: '全体に占める割合',
    summary: (model) => {
      if (model.childCount === 0)
        return NO_DATA
      const head = `${model.root}：${model.childCount} 項目、合計 ${model.total}。`
      return model.largest ? `${head}最大：${model.largest.name} ${model.largest.value}（${model.largest.share}）。` : head
    },
  },
  'image-cropper': {
    cropArea: 'トリミング範囲',
    valueText: rect => `X ${rect.x}、Y ${rect.y}、幅 ${rect.width}、高さ ${rect.height}`,
    handleTopLeft: '左上のハンドル',
    handleTop: '上端のハンドル',
    handleTopRight: '右上のハンドル',
    handleRight: '右端のハンドル',
    handleBottomRight: '右下のハンドル',
    handleBottom: '下端のハンドル',
    handleBottomLeft: '左下のハンドル',
    handleLeft: '左端のハンドル',
    zoomSlider: 'ズーム',
    rotateSlider: '回転',
    flipHorizontal: '左右反転',
    flipVertical: '上下反転',
  },
  'image-viewer': {
    content: '画像プレビュー',
    toolbar: '画像ツール',
    close: '閉じる',
    zoomIn: '拡大',
    zoomOut: '縮小',
    rotateLeft: '左に回転',
    rotateRight: '右に回転',
    flipHorizontal: '左右反転',
    flipVertical: '上下反転',
    reset: 'リセット',
    prev: '前の画像',
    next: '次の画像',
    counter: (index, count) => `${index} / ${count}`,
  },
  'json-viewer': {
    text: 'JSON ソース',
    tree: 'JSON',
    root: 'ルート',
    objectPreview: count => `{…} ${count}`,
    arrayPreview: count => `[…] ${count}`,
    collapsedBranchLabel: (name, count) => `${name}、${count} 項目`,
    moreItems: count => `… 他 ${count} 項目`,
    empty: 'データがありません',
  },
  'kbd': {
    keyName: (key, platform) => keyText(KEY_NAME, key, platform),
    keyLabel: (key, platform) => keyText(KEY_LABEL, key, platform),
    hotkey: names => names.join(' + '),
  },
  'loading-bar': { root: '読み込み中' },
  'log': { log: 'ログ', scrollToBottom: '最下部へスクロール' },
  'markdown-stream': { completed: '応答が完了しました' },
  'marquee': { autoplayTriggerPause: 'スクロールを一時停止', autoplayTriggerPlay: 'スクロールを再開' },
  'mention': { content: 'メンション', empty: '一致する項目がありません' },
  'menubar': { root: 'メニューバー' },
  'message-feed': {
    feed: '会話',
    scrollToBottom: '最下部へスクロール',
    scrollToBottomUnread: count => `最下部へスクロール、新着メッセージ ${count} 件`,
    item: (position, size, role) => {
      const who = role == null ? '' : `、${({ user: 'ユーザー', assistant: 'アシスタント', system: 'システム' })[role]}`
      return size > 0 ? `${size} 件中 ${position} 件目のメッセージ${who}` : `${position} 件目のメッセージ${who}`
    },
  },
  'navigation-menu': { root: 'メインナビゲーション' },
  'notification': { region: '通知', close: '閉じる' },
  'pagination': {
    root: 'ページネーション',
    firstTrigger: '最初のページ',
    prevTrigger: '前のページ',
    nextTrigger: '次のページ',
    lastTrigger: '最後のページ',
    item: page => `${page} ページ`,
    ellipsis: count => `さらに ${count} ページ`,
    pageSizeSelect: '1 ページあたりの件数',
    pageSizeOption: size => `${size} 件/ページ`,
    summary: (start, end, count) => `${start}–${end} 件 / 全 ${count} 件`,
    jumper: 'ページへ移動',
  },
  'password-input': {
    visibilityTriggerShow: 'パスワードを表示',
    visibilityTriggerHide: 'パスワードを非表示',
    capsLockOn: 'Caps Lock がオンです',
    strengthMeter: 'パスワードの強度',
  },
  'pie-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}、${details.formatted.value ?? ''}、${details.formatted.share ?? ''}`,
    centerLabel: '合計',
    nameLabel: '名前',
    valueLabel: '値',
    shareLabel: '割合',
    summary: (model) => {
      const first = model.slices[0]
      const last = model.slices.at(-1)
      if (model.sliceCount === 0 || !first || !last)
        return NO_DATA
      const head = `${model.sliceCount} 個のスライス、合計 ${model.total}。`
      if (model.sliceCount === 1)
        return `${head}${first.name}：${first.share}。`
      return `${head}最大：${first.name} ${first.share}。最小：${last.name} ${last.share}。`
    },
  },
  'pin-input': { input: (index, length) => `${length} 文字中 ${index} 文字目` },
  'popover': { close: '閉じる' },
  'progress': { segmentValueText: ({ value, label }) => `${value}、${label}` },
  'prompt-input': { send: '送信', stop: '生成を停止' },
  'question-flow': {
    prompt: '質問',
    options: '選択肢',
    note: 'その他の回答',
    prev: '前の質問',
    next: '次の質問',
    progress: (current, total) => `${total} 問中 ${current} 問目`,
    submitted: '回答を送信しました',
    selectionRange: (min, max) => {
      if (max === undefined)
        return `${min} 個以上選択してください`
      if (min === max)
        return `${min} 個選択してください`
      return min > 1 ? `${min} 個から ${max} 個まで選択してください` : `最大 ${max} 個まで選択できます`
    },
  },
  'radar-chart': {
    ...chart,
    nameLabel: '名前',
    summary: (model) => {
      if (model.seriesCount === 0)
        return NO_DATA
      const head = `${model.seriesCount} 系列、${model.indicatorCount} 指標。`
      const parts = model.series.map((s) => {
        if (!s.highest)
          return `${s.name}：値なし。`
        return s.lowest
          ? `${s.name}：最高は ${s.highest.indicator} ${s.highest.value}、最低は ${s.lowest.indicator} ${s.lowest.value}。`
          : `${s.name}：${s.highest.indicator} ${s.highest.value}。`
      })
      return [head, ...parts].join('')
    },
  },
  'reasoning': {
    label: '思考プロセス',
    thinking: '思考中…',
    thinkingFor: '{seconds} 秒間思考中',
    thoughtFor: '{seconds} 秒間思考しました',
  },
  'resizable': { root: 'サイズ変更可能な領域', handle: edge => `${EDGE[edge]}でサイズを変更` },
  'sankey-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}、${details.formatted.value ?? ''}`,
    sourceLabel: 'ソース',
    targetLabel: 'ターゲット',
    valueLabel: '流量',
    inflowLabel: '流入元',
    outflowLabel: '流出先',
    summary: (model) => {
      if (model.linkCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} 個のノード、${model.linkCount} 本のフロー、合計 ${model.total}。`
      return model.largest ? `${head}最大のフロー：${model.largest.source} から ${model.largest.target} へ、${model.largest.value}。` : head
    },
  },
  'scrollbar': { thumb: 'スクロールバー' },
  'select': { ...tagged, clearTrigger: 'クリア', content: '選択肢' },
  'side-nav': { root: 'サイドバー', input: 'ナビゲーションを絞り込み', noMatch: '一致する項目がありません' },
  'signature-pad': {
    label: '署名',
    clearTrigger: '署名をクリア',
    undoTrigger: '最後のストロークを元に戻す',
    redoTrigger: 'ストロークをやり直す',
    statusEmpty: 'まだ署名されていません',
    statusSigned: '署名済み',
  },
  'sortable': {
    root: '並べ替え可能なリスト',
    itemDragTrigger: name => `${name} を並べ替え`,
    itemDragTriggerRoleDescription: '並べ替え可能な項目',
    picked: (name, position, total) => `${name} の移動を開始しました。${total} 個中 ${position} 番目です。矢印キーで移動、Space キーでドロップ、Esc キーでキャンセルします。`,
    moved: (_name, position, total) => `${total} 個中 ${position} 番目に移動しました。`,
    dropped: (name, position) => `${name} を ${position} 番目にドロップしました。`,
    canceled: (name, position) => `並べ替えをキャンセルしました。${name} は ${position} 番目に戻りました。`,
    movedToList: (listName, listPosition, listTotal, position, total) =>
      `${listName}（${listTotal} 個中 ${listPosition} 番目のリスト）に移動しました。${total} 個中 ${position} 番目です。`,
    droppedInList: (name, listName, listPosition, position) => `${name} を ${listName}（${listPosition} 番目のリスト）の ${position} 番目にドロップしました。`,
  },
  'sparkline': {
    summary: (model) => {
      if (model.count === 0)
        return NO_DATA
      if (model.variant === 'win-loss') {
        const parts = [`${model.wins} 勝`, `${model.losses} 敗`]
        if (model.ties > 0)
          parts.push(`${model.ties} 引き分け`)
        return `${model.count} 件の結果：${parts.join('、')}。`
      }
      const reference = model.reference == null ? '' : `基準値 ${model.reference}。`
      if (model.count === 1)
        return `1 個のデータポイント：${model.last}。${reference}`
      const range = model.min === model.max ? `すべて ${model.max}` : `${model.min} から ${model.max} の範囲`
      const head = `${model.count} 個のデータポイント、${range}。${reference}`
      if (model.direction === 'flat')
        return `${head}最終値 ${model.last}、最初の値から変化なし。`
      if (model.change == null)
        return `${head}最終値 ${model.last}。`
      return `${head}最終値 ${model.last}、最初の値から ${model.change} ${model.direction === 'up' ? '上昇' : '下降'}。`
    },
  },
  'spinner': { label: '読み込み中' },
  'splitter': { root: '分割パネル', resizeTrigger: index => `パネル ${index + 1} のサイズを変更` },
  'steps': { progressLabel: 'ステップの進捗', progressValueText: percent => `${percent}% 完了` },
  'table': {
    ...drag,
    sort: column => `${column} で並べ替え`,
    columnResize: column => `${column} 列の幅を変更`,
    columnDrag: column => `${column} 列の位置を変更`,
    columnDragRoleDescription: 'ドラッグ可能な列',
    selectAll: 'すべての行を選択',
    toolbar: 'テーブルのツールバー',
    columnList: '列の設定',
    columnVisibility: column => `${column} 列を表示`,
  },
  'tabs': { ...drag, overflowTrigger: 'その他のタブ' },
  'tag': { close: '削除' },
  'tag-group': { deleteItem: label => `${label} を削除`, list: 'タグ' },
  'tags-input': { deleteItem: value => `${value} を削除`, editTagInput: value => `${value} を編集`, clearTrigger: 'クリア' },
  'text-field': { clearTrigger: 'クリア' },
  'time-field': { ...segments, clearTrigger: 'クリア' },
  'time-picker': { ...tagged, ...segments, presets: 'ショートカット', clearTrigger: 'クリア' },
  'time-range-picker': { ...segments, startTime: '開始時刻', endTime: '終了時刻', presets: 'ショートカット', clearTrigger: 'クリア' },
  'timer': {
    time: ({ days, hours, minutes, seconds }) => `${days > 0 ? `${days} 日 ` : ''}${hours} 時間 ${minutes} 分 ${seconds} 秒`,
    start: '開始',
    pause: '一時停止',
    resume: '再開',
    reset: 'リセット',
  },
  'tool-call': {
    inputStreaming: '準備中…',
    inputAvailable: '実行中…',
    awaitingApproval: '承認待ち',
    outputAvailable: '完了',
    outputError: '失敗',
  },
  'toolbar': { overflowTrigger: 'その他' },
  'tour': { close: '閉じる', progress: (step, count) => `${count} ステップ中 ${step} ステップ目` },
  'transfer': { toTarget: '移動先のリストへ移動', toSource: '移動元のリストへ戻す' },
  'tree': drag,
  'tree-select': {
    ...tagged,
    tree: 'ツリーの選択肢',
    clearTrigger: 'クリア',
    empty: 'データがありません',
    loading: '読み込み中',
    branchError: '下位の項目を読み込めませんでした',
    retry: '再試行',
    branchEmpty: '下位の項目はありません',
    searchInput: '検索',
    noMatch: '一致する項目がありません',
  },
  'truncate': { expand: 'もっと見る', collapse: '一部を表示' },
} satisfies XhLocaleTranslations

/** 日本語。 */
export const jaJP: XhLocale = { locale: 'ja-JP', translations }
