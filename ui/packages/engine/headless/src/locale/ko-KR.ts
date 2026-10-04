/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 韩语语言包。

import type { ChartDatumDetails } from '../shared/chart'
import type { KeyTextTable } from './key-text'
import type { XhLocale, XhLocaleTranslations } from './types'
import { keyText } from './key-text'

/** 读屏念的键名：修饰键在 Mac 与其余平台上叫法不同。 */
const KEY_NAME: KeyTextTable = {
  'Alt': { mac: 'Option 키', other: 'Alt 키' },
  'Control': { mac: 'Control 키', other: 'Ctrl 키' },
  'Meta': { mac: 'Command 키', other: 'Windows 키' },
  'Shift': 'Shift 키',
  ' ': '스페이스 바',
  'ArrowDown': '아래쪽 화살표 키',
  'ArrowLeft': '왼쪽 화살표 키',
  'ArrowRight': '오른쪽 화살표 키',
  'ArrowUp': '위쪽 화살표 키',
  'Backspace': '백스페이스 키',
  'Delete': 'Delete 키',
  'Enter': 'Enter 키',
  'Escape': 'Esc 키',
  'Tab': 'Tab 키',
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
  n: '위쪽 가장자리',
  s: '아래쪽 가장자리',
  e: '오른쪽 가장자리',
  w: '왼쪽 가장자리',
  ne: '오른쪽 위 모서리',
  nw: '왼쪽 위 모서리',
  se: '오른쪽 아래 모서리',
  sw: '왼쪽 아래 모서리',
} as const

const COLOR_CHANNEL = {
  hue: '색조',
  saturation: '채도',
  brightness: '밝기',
  alpha: '알파',
  red: '빨간색',
  green: '녹색',
  blue: '파란색',
} as const

const COLOR_UNIT = { hue: '°', saturation: '%', brightness: '%', alpha: '%', red: '', green: '', blue: '' } as const

const tagged = {
  deleteItem: (label: string) => `${label} 삭제`,
  overflowTag: (count: number) => `+${count}`,
}

const segments = { hour: '시', minute: '분', second: '초', dayPeriod: '오전/오후' }

const calendar = { todayDate: (date: string) => `오늘, ${date}` }

const rangeCalendar = {
  ...calendar,
  startRangeSelectionPrompt: '날짜 범위 선택을 시작하려면 클릭하세요',
  finishRangeSelectionPrompt: '날짜 범위 선택을 완료하려면 클릭하세요',
  selectedRange: (start: string, end: string) => `선택한 범위: ${start} ~ ${end}`,
}

const drag = {
  moved: (name: string, position: number, total: number) => `${name} 항목을 총 ${total}개 중 ${position}번째 위치로 이동했습니다.`,
  dropped: (name: string, position: number) => `${name} 항목을 ${position}번째 위치에 놓았습니다.`,
  canceled: (name: string, position: number) => `이동을 취소했습니다. ${name} 항목이 ${position}번째 위치로 돌아갔습니다.`,
  rejected: (name: string) => `${name} 항목은 여기에 놓을 수 없습니다.`,
  movedInto: (name: string, into: string, position: number, total: number) => `${name} 항목을 ${into} 내 총 ${total}개 중 ${position}번째 위치로 이동했습니다.`,
  droppedInto: (name: string, into: string, position: number) => `${name} 항목을 ${into}의 ${position}번째 위치에 놓았습니다.`,
  canceledInto: (name: string, into: string, position: number) => `이동을 취소했습니다. ${name} 항목이 ${into}의 ${position}번째 위치로 돌아갔습니다.`,
  rootLevel: '최상위 수준',
}

const chart = {
  chartRoleDescription: '차트',
  seriesRoleDescription: '계열',
  legendLabel: '범례',
  missingValue: '값 없음',
  emptyText: '데이터 없음',
  loadingText: '로드 중…',
  otherLabel: '기타',
  tableCaption: '데이터 표',
  datumLabel: (details: ChartDatumDetails) =>
    `${details.formatted.key ?? String(details.key)}, ${details.seriesName} ${details.formatted.value ?? ''}`,
}

const NO_DATA = '데이터가 없습니다.'

const translations = {
  'alert': { close: '닫기' },
  'anchor': { root: '페이지 내 탐색' },
  'approval': {
    scopes: '권한',
    note: '메모',
    reason: '거부 사유',
    pending: '결정을 기다리는 중',
    approved: '승인됨',
    denied: '거부됨',
    expired: '만료되어 거부로 처리됨',
  },
  'back-top': { trigger: '맨 위로' },
  'breadcrumb': { root: '이동 경로', ellipsis: '전체 경로 표시' },
  'calendar-picker': calendar,
  'calendar-range-picker': rangeCalendar,
  'carousel': {
    root: '캐러셀',
    rootRoleDescription: '캐러셀',
    itemRoleDescription: '슬라이드',
    prevTrigger: '이전 슬라이드',
    nextTrigger: '다음 슬라이드',
    autoplayTriggerPlay: '슬라이드 자동 재생 시작',
    autoplayTriggerPause: '슬라이드 자동 재생 중지',
    indicatorGroup: '표시할 슬라이드 선택',
    indicator: page => `${page}번 슬라이드로 이동`,
    item: (index, count) => `총 ${count}개 중 ${index}번째`,
  },
  'cartesian-chart': {
    ...chart,
    keyLabel: '범주',
    seriesLabel: '계열',
    valueLabel: '값',
    sizeLabel: '크기',
    colorLabel: '색상',
    referenceLabel: '기준',
    averageLabel: '평균',
    ohlcLabel: ({ open, high, low, close }) => `시가 ${open}, 고가 ${high}, 저가 ${low}, 종가 ${close}`,
    ohlcColumns: { open: '시가', high: '고가', low: '저가', close: '종가' },
    boxLabel: ({ min, q1, median, q3, max }) => `최솟값 ${min}, 제1사분위수 ${q1}, 중앙값 ${median}, 제3사분위수 ${q3}, 최댓값 ${max}`,
    boxColumns: { min: '최솟값', q1: '제1사분위수', median: '중앙값', q3: '제3사분위수', max: '최댓값', outliers: '이상값' },
    zoomLabel: '확대/축소',
    zoomStartLabel: '범위 시작',
    zoomEndLabel: '범위 끝',
    aggregatedCaption: ({ caption, rows, ranges }) => `${caption}(${rows}행, ${ranges}개 구간으로 집계)`,
    annotationSummary: items => items.map(item => `${item.label}${item.series ? `(${item.series})` : ''}: ${item.value}.`).join(' '),
    summary: (model) => {
      if (!model.range || model.series.every(s => s.count === 0))
        return NO_DATA
      const { first, last, count } = model.range
      const head = `계열 ${model.seriesCount}개, 데이터 요소 ${count}개, ${first}부터 ${last}까지.`
      const lines = model.series.flatMap((s) => {
        if (!s.min || !s.max)
          return []
        if (s.min.key === s.max.key && s.min.value === s.max.value)
          return `${s.name}: ${s.max.value}(${s.max.key}).`
        return `${s.name}: 최저 ${s.min.value}(${s.min.key}), 최고 ${s.max.value}(${s.max.key}).`
      })
      return [head, ...lines].join(' ')
    },
  },
  'cascader': {
    ...tagged,
    empty: '데이터 없음',
    noMatch: '일치하는 항목 없음',
    loading: '로드 중',
    branchError: '하위 항목을 로드하지 못했습니다',
    retry: '다시 시도',
    column: '옵션',
    searchInput: '검색',
    searchList: '검색 결과',
    clearTrigger: '지우기',
  },
  'citation': {
    sources: '출처',
    preview: '출처 미리 보기',
    closePreview: '출처 미리 보기 닫기',
    openSource: title => `${title} 열기`,
    citation: (index, title) => `출처 ${index}: ${title}`,
    citations: indexes => `출처 ${indexes.join(', ')}`,
    previousSource: '이전 출처',
    nextSource: '다음 출처',
    source: (index, title) => `출처 ${index}: ${title}`,
    document: '문서',
    previewLinkSource: '출처 열기',
    previewLinkDocument: '문서 열기',
  },
  'clipboard': { copied: '복사됨' },
  'code-view': {
    code: '코드',
    expand: '코드 펼치기',
    collapse: '코드 접기',
    foldBlock: (first, last) => (first === last ? `줄 ${first}` : `줄 ${first}–${last}`),
  },
  'color-field': { clearTrigger: '지우기' },
  'color-picker': {
    ...tagged,
    area: '채도 및 밝기',
    areaValueText: (saturation, brightness) => `채도 ${saturation}%, 밝기 ${brightness}%`,
    channel: channel => COLOR_CHANNEL[channel],
    channelValueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
    input: channel => ({ hex: '16진수', r: '빨간색', g: '녹색', b: '파란색', a: '알파' })[channel],
    swatch: value => `색상 ${value}`,
    swatchGroup: '색상 견본',
    recentSwatchGroup: '최근 사용한 색상',
    eyeDropperTrigger: '화면에서 색상 선택',
  },
  'color-slider': {
    label: channel => COLOR_CHANNEL[channel],
    valueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
  },
  'color-swatch-picker': { group: '색상 견본', swatch: value => `색상 ${value}` },
  'combobox': { ...tagged, trigger: '제안 표시', clearTrigger: '지우기' },
  'command': { title: '명령 팔레트', input: '명령 검색', list: '명령' },
  'context-menu': { content: '상황에 맞는 메뉴' },
  'date-field': {
    ...segments,
    year: '년',
    quarter: '분기',
    month: '월',
    week: '주차',
    day: '일',
    clearTrigger: '지우기',
  },
  'date-picker': { ...tagged, ...segments, ...calendar, presets: '바로 가기', clearTrigger: '지우기' },
  'date-range-picker': {
    ...segments,
    ...rangeCalendar,
    startDate: '시작 날짜',
    endDate: '종료 날짜',
    startTime: '시작 시간',
    endTime: '종료 시간',
    presets: '바로 가기',
    clearTrigger: '지우기',
  },
  'dialog': {
    close: '닫기',
    dragTrigger: '대화 상자 이동',
    ok: '확인',
    cancel: '취소',
    actionError: '작업에 실패했습니다. 다시 시도하세요.',
  },
  'diff-view': {
    added: '추가됨',
    removed: '삭제됨',
    unchanged: '변경 안 됨',
    expandGap: count => `숨겨진 줄 ${count}개 표시`,
    diff: '차이점',
    noChanges: '변경 사항 없음',
    truncated: count => `${count}개 줄이 더 있지만 잘려서 표시되지 않습니다`,
    commentOn: (line, side) => `${side === 'old' ? '이전' : '새'} 버전 줄 ${line}에 댓글 달기`,
  },
  'drawer': { close: '닫기', resizeTrigger: '드로어 크기 조정' },
  'field-array': {
    deleteItem: (index, count) => `총 ${count}개 행 중 ${index}번째 행 삭제`,
    moveUpTrigger: (index, count) => `총 ${count}개 행 중 ${index}번째 행 위로 이동`,
    moveDownTrigger: (index, count) => `총 ${count}개 행 중 ${index}번째 행 아래로 이동`,
  },
  'file-upload': {
    dropzone: '파일을 여기에 놓으세요',
    deleteItem: file => `${file.name} 삭제`,
    clearTrigger: '모든 파일 지우기',
  },
  'float-button': { trigger: '작업' },
  'floating-panel': {
    dragTrigger: '패널 이동',
    resizeTrigger: edge => `${EDGE[edge]}에서 크기 조정`,
    resizeValueText: size => `너비 ${Math.round(size.width)}, 높이 ${Math.round(size.height)}`,
    windowStateTrigger: state => ({ default: '패널 복원', maximized: '패널 최대화', minimized: '패널 최소화' })[state],
    close: '닫기',
  },
  'form': {
    required: '{name} 항목은 필수입니다',
    type: {
      string: '{name} 항목은 문자열이어야 합니다',
      number: '{name} 항목은 숫자여야 합니다',
      integer: '{name} 항목은 정수여야 합니다',
      email: '{name} 항목에 올바른 이메일 주소를 입력하세요',
      url: '{name} 항목에 올바른 URL을 입력하세요',
      array: '{name} 항목은 배열이어야 합니다',
    },
    minLength: '{name} 항목은 {min}자 이상이어야 합니다',
    maxLength: '{name} 항목은 {max}자를 넘을 수 없습니다',
    minNumber: '{name} 항목은 {min} 이상이어야 합니다',
    maxNumber: '{name} 항목은 {max} 이하여야 합니다',
    pattern: '{name} 항목의 형식이 올바르지 않습니다',
  },
  'funnel-chart': {
    ...chart,
    datumLabel: (details) => {
      const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
      return details.formatted.previous ? `${head}, 이전 단계 대비 ${details.formatted.previous}` : head
    },
    nameLabel: '단계',
    valueLabel: '값',
    previousLabel: '이전 단계 대비',
    firstLabel: '첫 단계 대비',
    summary: (model) => {
      if (model.stageCount === 0 || !model.first || !model.last)
        return NO_DATA
      if (model.stageCount === 1)
        return `1개 단계: ${model.first.name} ${model.first.value}.`
      const parts = [`${model.stageCount}개 단계, ${model.first.name}(${model.first.value})부터 ${model.last.name}(${model.last.value})까지.`]
      if (model.overall)
        parts.push(`전체 전환율 ${model.overall}.`)
      if (model.steepest)
        parts.push(`이탈이 가장 큰 구간: ${model.steepest.from}에서 ${model.steepest.to}까지, ${model.steepest.rate} 유지.`)
      return parts.join(' ')
    },
  },
  'graph-chart': {
    ...chart,
    datumLabel: (details) => {
      const parts = [details.seriesName]
      if (details.formatted.value)
        parts.push(details.formatted.value)
      parts.push(`연결 ${details.formatted.links ?? '0'}개`)
      return parts.join(', ')
    },
    sourceLabel: '소스',
    targetLabel: '대상',
    valueLabel: '값',
    linkLabel: '레이블',
    linksLabel: '연결',
    incomingLabel: '들어오는 연결',
    outgoingLabel: '나가는 연결',
    summary: (model) => {
      if (model.nodeCount === 0)
        return NO_DATA
      const head = `노드 ${model.nodeCount}개, 연결 ${model.linkCount}개.`
      return model.hub ? `${head} 연결이 가장 많은 노드: ${model.hub.name}(연결 ${model.hub.degree}개).` : head
    },
  },
  'grid-list': { root: '항목' },
  'heatmap': {
    gridLabel: '활동 히트맵',
    cellLabel: details => `${details.date}: ${details.count}`,
    matrixCellLabel: details => `${details.row} ${details.column}: ${details.count}`,
    legendLabel: '활동 수준',
    legendLow: '적음',
    legendHigh: '많음',
  },
  'hierarchy-chart': {
    ...chart,
    datumLabel: (details) => {
      const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
      return details.formatted.parentShare ? `${head}, ${details.formatted.parent ?? ''}의 ${details.formatted.parentShare}` : head
    },
    rootLabel: '전체',
    pathLabel: '경로',
    nameLabel: '경로',
    valueLabel: '값',
    levelLabel: level => `수준 ${level}`,
    parentShareLabel: '상위 대비 비율',
    rootShareLabel: '전체 대비 비율',
    summary: (model) => {
      if (model.childCount === 0)
        return NO_DATA
      const head = `${model.root}: 항목 ${model.childCount}개, 합계 ${model.total}.`
      return model.largest ? `${head} 가장 큰 항목: ${model.largest.name} ${model.largest.value}(${model.largest.share}).` : head
    },
  },
  'image-cropper': {
    cropArea: '자르기 영역',
    valueText: rect => `X ${rect.x}, Y ${rect.y}, 너비 ${rect.width}, 높이 ${rect.height}`,
    handleTopLeft: '왼쪽 위 모서리 핸들',
    handleTop: '위쪽 가장자리 핸들',
    handleTopRight: '오른쪽 위 모서리 핸들',
    handleRight: '오른쪽 가장자리 핸들',
    handleBottomRight: '오른쪽 아래 모서리 핸들',
    handleBottom: '아래쪽 가장자리 핸들',
    handleBottomLeft: '왼쪽 아래 모서리 핸들',
    handleLeft: '왼쪽 가장자리 핸들',
    zoomSlider: '확대/축소',
    rotateSlider: '회전',
    flipHorizontal: '좌우 반전',
    flipVertical: '상하 반전',
  },
  'image-viewer': {
    content: '이미지 미리 보기',
    toolbar: '이미지 도구',
    close: '닫기',
    zoomIn: '확대',
    zoomOut: '축소',
    rotateLeft: '왼쪽으로 회전',
    rotateRight: '오른쪽으로 회전',
    flipHorizontal: '좌우 반전',
    flipVertical: '상하 반전',
    reset: '재설정',
    prev: '이전 이미지',
    next: '다음 이미지',
    counter: (index, count) => `${index} / ${count}`,
  },
  'json-viewer': {
    text: 'JSON 소스',
    tree: 'JSON',
    root: '루트',
    objectPreview: count => `{…} ${count}`,
    arrayPreview: count => `[…] ${count}`,
    collapsedBranchLabel: (name, count) => `${name}, 항목 ${count}개`,
    moreItems: count => `… 외 ${count}개`,
    empty: '데이터 없음',
  },
  'kbd': {
    keyName: (key, platform) => keyText(KEY_NAME, key, platform),
    keyLabel: (key, platform) => keyText(KEY_LABEL, key, platform),
    hotkey: names => names.join(' + '),
  },
  'loading-bar': { root: '로드 중' },
  'log': { log: '로그', scrollToBottom: '맨 아래로 스크롤' },
  'markdown-stream': { completed: '응답 완료' },
  'marquee': { autoplayTriggerPause: '스크롤 일시 중지', autoplayTriggerPlay: '스크롤 재개' },
  'mention': { content: '멘션', empty: '일치하는 항목 없음' },
  'menubar': { root: '메뉴 모음' },
  'message-feed': {
    feed: '대화',
    scrollToBottom: '맨 아래로 스크롤',
    scrollToBottomUnread: count => `맨 아래로 스크롤, 새 메시지 ${count}개`,
    item: (position, size, role) => {
      const who = role == null ? '' : `, ${({ user: '사용자', assistant: '어시스턴트', system: '시스템' })[role]}`
      return size > 0 ? `총 ${size}개 중 ${position}번째 메시지${who}` : `${position}번째 메시지${who}`
    },
  },
  'navigation-menu': { root: '주 탐색' },
  'notification': { region: '알림', close: '닫기' },
  'pagination': {
    root: '페이지 탐색',
    firstTrigger: '첫 페이지',
    prevTrigger: '이전 페이지',
    nextTrigger: '다음 페이지',
    lastTrigger: '마지막 페이지',
    item: page => `${page}페이지`,
    ellipsis: count => `페이지 ${count}개 더 있음`,
    pageSizeSelect: '페이지당 항목 수',
    pageSizeOption: size => `${size}개/페이지`,
    summary: (start, end, count) => `${start}-${end} / 총 ${count}개`,
    jumper: '페이지 이동',
  },
  'password-input': {
    visibilityTriggerShow: '비밀번호 표시',
    visibilityTriggerHide: '비밀번호 숨기기',
    capsLockOn: 'Caps Lock이 켜져 있습니다',
    strengthMeter: '비밀번호 강도',
  },
  'pie-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}, ${details.formatted.value ?? ''}, ${details.formatted.share ?? ''}`,
    centerLabel: '합계',
    nameLabel: '이름',
    valueLabel: '값',
    shareLabel: '비율',
    summary: (model) => {
      const first = model.slices[0]
      const last = model.slices.at(-1)
      if (model.sliceCount === 0 || !first || !last)
        return NO_DATA
      const head = `조각 ${model.sliceCount}개, 합계 ${model.total}.`
      if (model.sliceCount === 1)
        return `${head} ${first.name}: ${first.share}.`
      return `${head} 최대: ${first.name} ${first.share}. 최소: ${last.name} ${last.share}.`
    },
  },
  'pin-input': { input: (index, length) => `총 ${length}자리 중 ${index}번째 자리` },
  'popover': { close: '닫기' },
  'progress': { segmentValueText: ({ value, label }) => `${value}, ${label}` },
  'prompt-input': { send: '보내기', stop: '생성 중지' },
  'question-flow': {
    prompt: '질문',
    options: '옵션',
    note: '기타 답변',
    prev: '이전 질문',
    next: '다음 질문',
    progress: (current, total) => `총 ${total}개 중 ${current}번째 질문`,
    submitted: '답변을 보냈습니다',
    selectionRange: (min, max) => {
      if (max === undefined)
        return `${min}개 이상 선택`
      if (min === max)
        return `${min}개 선택`
      return min > 1 ? `${min}~${max}개 선택` : `최대 ${max}개 선택`
    },
  },
  'radar-chart': {
    ...chart,
    nameLabel: '이름',
    summary: (model) => {
      if (model.seriesCount === 0)
        return NO_DATA
      const head = `계열 ${model.seriesCount}개, 지표 ${model.indicatorCount}개.`
      const parts = model.series.map((s) => {
        if (!s.highest)
          return `${s.name}: 값 없음.`
        return s.lowest
          ? `${s.name}: 최고 ${s.highest.indicator} ${s.highest.value}, 최저 ${s.lowest.indicator} ${s.lowest.value}.`
          : `${s.name}: ${s.highest.indicator} ${s.highest.value}.`
      })
      return [head, ...parts].join(' ')
    },
  },
  'reasoning': {
    label: '사고 과정',
    thinking: '생각 중…',
    thinkingFor: '{seconds}초째 생각 중',
    thoughtFor: '{seconds}초 동안 생각함',
  },
  'resizable': { root: '크기 조정 가능 영역', handle: edge => `${EDGE[edge]}에서 크기 조정` },
  'sankey-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}, ${details.formatted.value ?? ''}`,
    sourceLabel: '소스',
    targetLabel: '대상',
    valueLabel: '값',
    inflowLabel: '유입',
    outflowLabel: '유출',
    summary: (model) => {
      if (model.linkCount === 0)
        return NO_DATA
      const head = `노드 ${model.nodeCount}개, 흐름 ${model.linkCount}개, 합계 ${model.total}.`
      return model.largest ? `${head} 가장 큰 흐름: ${model.largest.source}에서 ${model.largest.target}까지, ${model.largest.value}.` : head
    },
  },
  'scrollbar': { thumb: '스크롤 막대' },
  'select': { ...tagged, clearTrigger: '지우기', content: '옵션' },
  'side-nav': { root: '사이드바', input: '탐색 필터', noMatch: '일치하는 항목 없음' },
  'signature-pad': {
    label: '서명',
    clearTrigger: '서명 지우기',
    undoTrigger: '마지막 획 실행 취소',
    redoTrigger: '획 다시 실행',
    statusEmpty: '아직 서명하지 않음',
    statusSigned: '서명됨',
  },
  'sortable': {
    root: '정렬 가능한 목록',
    itemDragTrigger: name => `${name} 순서 변경`,
    itemDragTriggerRoleDescription: '정렬 가능한 항목',
    picked: (name, position, total) => `${name} 항목을 들어 올렸습니다. 총 ${total}개 중 ${position}번째 위치입니다. 화살표 키로 이동하고 Space 키로 놓거나 Esc 키로 취소하세요.`,
    moved: (_name, position, total) => `총 ${total}개 중 ${position}번째 위치로 이동했습니다.`,
    dropped: (name, position) => `${name} 항목을 ${position}번째 위치에 놓았습니다.`,
    canceled: (name, position) => `정렬을 취소했습니다. ${name} 항목이 ${position}번째 위치로 돌아갔습니다.`,
    movedToList: (listName, listPosition, listTotal, position, total) =>
      `${listName} 목록으로 이동했습니다. 총 ${listTotal}개 목록 중 ${listPosition}번째, 총 ${total}개 중 ${position}번째 위치입니다.`,
    droppedInList: (name, listName, listPosition, position) => `${name} 항목을 ${listName} 목록(${listPosition}번째 목록)의 ${position}번째 위치에 놓았습니다.`,
  },
  'sparkline': {
    summary: (model) => {
      if (model.count === 0)
        return NO_DATA
      if (model.variant === 'win-loss') {
        const parts = [`${model.wins}승`, `${model.losses}패`]
        if (model.ties > 0)
          parts.push(`${model.ties}무`)
        return `결과 ${model.count}개: ${parts.join(' ')}.`
      }
      const reference = model.reference == null ? '' : ` 기준값 ${model.reference}.`
      if (model.count === 1)
        return `데이터 요소 1개: ${model.last}.${reference}`
      const range = model.min === model.max ? `모두 ${model.max}` : `범위 ${model.min}~${model.max}`
      const head = `데이터 요소 ${model.count}개, ${range}.${reference}`
      if (model.direction === 'flat')
        return `${head} 마지막 값 ${model.last}, 첫 값과 같음.`
      if (model.change == null)
        return `${head} 마지막 값 ${model.last}.`
      return `${head} 마지막 값 ${model.last}, 첫 값 대비 ${model.change} ${model.direction === 'up' ? '상승' : '하락'}.`
    },
  },
  'spinner': { label: '로드 중' },
  'splitter': { root: '분할 패널', resizeTrigger: index => `${index + 1}번째 패널 크기 조정` },
  'steps': { progressLabel: '단계 진행률', progressValueText: percent => `${percent}% 완료` },
  'table': {
    ...drag,
    sort: column => `${column} 기준 정렬`,
    columnResize: column => `${column} 열 크기 조정`,
    columnDrag: column => `${column} 열 순서 변경`,
    columnDragRoleDescription: '드래그 가능한 열',
    selectAll: '모든 행 선택',
    toolbar: '표 도구 모음',
    columnList: '열 설정',
    columnVisibility: column => `${column} 열 표시`,
  },
  'tabs': { ...drag, overflowTrigger: '탭 더 보기' },
  'tag': { close: '삭제' },
  'tag-group': { deleteItem: label => `${label} 삭제`, list: '태그' },
  'tags-input': { deleteItem: value => `${value} 삭제`, editTagInput: value => `${value} 편집`, clearTrigger: '지우기' },
  'text-field': { clearTrigger: '지우기' },
  'time-field': { ...segments, clearTrigger: '지우기' },
  'time-picker': { ...tagged, ...segments, presets: '바로 가기', clearTrigger: '지우기' },
  'time-range-picker': { ...segments, startTime: '시작 시간', endTime: '종료 시간', presets: '바로 가기', clearTrigger: '지우기' },
  'timer': {
    time: ({ days, hours, minutes, seconds }) => `${days > 0 ? `${days}일 ` : ''}${hours}시간 ${minutes}분 ${seconds}초`,
    start: '시작',
    pause: '일시 중지',
    resume: '재개',
    reset: '재설정',
  },
  'tool-call': {
    inputStreaming: '준비 중…',
    inputAvailable: '실행 중…',
    awaitingApproval: '승인 대기 중',
    outputAvailable: '완료됨',
    outputError: '실패',
  },
  'toolbar': { overflowTrigger: '더 보기' },
  'tour': { close: '닫기', progress: (step, count) => `총 ${count}단계 중 ${step}단계` },
  'transfer': { toTarget: '대상 목록으로 이동', toSource: '원본 목록으로 이동' },
  'tree': drag,
  'tree-select': {
    ...tagged,
    tree: '트리 옵션',
    clearTrigger: '지우기',
    empty: '데이터 없음',
    loading: '로드 중',
    branchError: '하위 항목을 로드하지 못했습니다',
    retry: '다시 시도',
    branchEmpty: '하위 항목 없음',
    searchInput: '검색',
    noMatch: '일치하는 항목 없음',
  },
  'truncate': { expand: '더 보기', collapse: '접기' },
} satisfies XhLocaleTranslations

/** 한국어。 */
export const koKR: XhLocale = { locale: 'ko-KR', translations }
