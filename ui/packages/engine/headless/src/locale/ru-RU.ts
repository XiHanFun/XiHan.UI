/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 俄语语言包。

import type { ChartDatumDetails } from '../shared/chart'
import type { KeyTextTable } from './key-text'
import type { XhLocale, XhLocaleTranslations } from './types'
import { keyText } from './key-text'

/** 读屏念的键名：修饰键在 Mac 与其余平台上叫法不同。 */
const KEY_NAME: KeyTextTable = {
  'Alt': { mac: 'Option', other: 'Alt' },
  'Control': { mac: 'Control', other: 'Ctrl' },
  'Meta': { mac: 'Command', other: 'Windows' },
  'Shift': 'Shift',
  ' ': 'Пробел',
  'ArrowDown': 'Стрелка вниз',
  'ArrowLeft': 'Стрелка влево',
  'ArrowRight': 'Стрелка вправо',
  'ArrowUp': 'Стрелка вверх',
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
  ' ': 'Пробел',
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
  n: 'верхний край',
  s: 'нижний край',
  e: 'правый край',
  w: 'левый край',
  ne: 'правый верхний угол',
  nw: 'левый верхний угол',
  se: 'правый нижний угол',
  sw: 'левый нижний угол',
} as const

const COLOR_CHANNEL = {
  hue: 'Оттенок',
  saturation: 'Насыщенность',
  brightness: 'Яркость',
  alpha: 'Альфа-канал',
  red: 'Красный',
  green: 'Зелёный',
  blue: 'Синий',
} as const

const COLOR_UNIT = { hue: '°', saturation: '%', brightness: '%', alpha: '%', red: '', green: '', blue: '' } as const

// 名词随数量取形：个位 1（11 除外）取单数，个位 2–4（12–14 除外）取少数，其余取多数。
function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11)
    return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return few
  return many
}

const tagged = {
  deleteItem: (label: string) => `Удалить: ${label}`,
  overflowTag: (count: number) => `+${count}`,
}

const segments = { hour: 'час', minute: 'минута', second: 'секунда', dayPeriod: 'AM/PM' }

const calendar = { todayDate: (date: string) => `Сегодня, ${date}` }

const rangeCalendar = {
  ...calendar,
  startRangeSelectionPrompt: 'Нажмите, чтобы начать выбор диапазона дат',
  finishRangeSelectionPrompt: 'Нажмите, чтобы завершить выбор диапазона дат',
  selectedRange: (start: string, end: string) => `Выбранный диапазон: ${start} – ${end}`,
}

const drag = {
  moved: (name: string, position: number, total: number) => `Элемент «${name}» перемещён на позицию ${position} из ${total}.`,
  dropped: (name: string, position: number) => `Элемент «${name}» помещён на позицию ${position}.`,
  canceled: (name: string, position: number) => `Перемещение отменено. Элемент «${name}» возвращён на позицию ${position}.`,
  rejected: (name: string) => `Элемент «${name}» нельзя поместить сюда.`,
  movedInto: (name: string, into: string, position: number, total: number) =>
    `Элемент «${name}» перемещён. Расположение: ${into}, позиция ${position} из ${total}.`,
  droppedInto: (name: string, into: string, position: number) => `Элемент «${name}» помещён. Расположение: ${into}, позиция ${position}.`,
  canceledInto: (name: string, into: string, position: number) =>
    `Перемещение отменено. Элемент «${name}» возвращён. Расположение: ${into}, позиция ${position}.`,
  rootLevel: 'верхний уровень',
}

const chart = {
  chartRoleDescription: 'диаграмма',
  seriesRoleDescription: 'ряд',
  legendLabel: 'Легенда',
  missingValue: 'Нет значения',
  emptyText: 'Нет данных',
  loadingText: 'Загрузка…',
  otherLabel: 'Прочее',
  tableCaption: 'Таблица данных',
  datumLabel: (details: ChartDatumDetails) =>
    `${details.formatted.key ?? String(details.key)}, ${details.seriesName} ${details.formatted.value ?? ''}`,
}

const NO_DATA = 'Нет данных.'

const translations = {
  'alert': { close: 'Закрыть' },
  'anchor': { root: 'Навигация по разделам' },
  'approval': {
    scopes: 'Разрешения',
    note: 'Примечание',
    reason: 'Причина отказа',
    pending: 'Ожидает вашего решения',
    approved: 'Одобрено',
    denied: 'Отклонено',
    expired: 'Срок истёк, запрос отклонён',
  },
  'back-top': { trigger: 'Наверх' },
  'breadcrumb': { root: 'Навигационная цепочка', ellipsis: 'Показать полный путь' },
  'calendar-picker': calendar,
  'calendar-range-picker': rangeCalendar,
  'carousel': {
    root: 'Карусель',
    rootRoleDescription: 'карусель',
    itemRoleDescription: 'слайд',
    prevTrigger: 'Предыдущий слайд',
    nextTrigger: 'Следующий слайд',
    autoplayTriggerPlay: 'Запустить автоматический показ слайдов',
    autoplayTriggerPause: 'Остановить автоматический показ слайдов',
    indicatorGroup: 'Выберите слайд для показа',
    indicator: page => `Перейти к слайду ${page}`,
    item: (index, count) => `${index} из ${count}`,
  },
  'cartesian-chart': {
    ...chart,
    keyLabel: 'Категория',
    seriesLabel: 'Ряд',
    valueLabel: 'Значение',
    sizeLabel: 'Размер',
    colorLabel: 'Цвет',
    referenceLabel: 'Ориентир',
    averageLabel: 'Среднее',
    ohlcLabel: ({ open, high, low, close }) => `Открытие ${open}, максимум ${high}, минимум ${low}, закрытие ${close}`,
    ohlcColumns: { open: 'Открытие', high: 'Максимум', low: 'Минимум', close: 'Закрытие' },
    boxLabel: ({ min, q1, median, q3, max }) =>
      `Минимум ${min}, первый квартиль ${q1}, медиана ${median}, третий квартиль ${q3}, максимум ${max}`,
    boxColumns: { min: 'Минимум', q1: 'Первый квартиль', median: 'Медиана', q3: 'Третий квартиль', max: 'Максимум', outliers: 'Выбросы' },
    zoomLabel: 'Масштаб',
    zoomStartLabel: 'Начало окна',
    zoomEndLabel: 'Конец окна',
    aggregatedCaption: ({ caption, rows, ranges }) => `${caption} (строк: ${rows}, диапазонов: ${ranges})`,
    annotationSummary: items => items.map(item => `${item.label}${item.series ? ` (${item.series})` : ''}: ${item.value}.`).join(' '),
    summary: (model) => {
      if (!model.range || model.series.every(s => s.count === 0))
        return NO_DATA
      const { first, last, count } = model.range
      const head = `${model.seriesCount} ${plural(model.seriesCount, 'ряд', 'ряда', 'рядов')}, ${count} ${plural(count, 'точка', 'точки', 'точек')}, диапазон: ${first} – ${last}.`
      const lines = model.series.flatMap((s) => {
        if (!s.min || !s.max)
          return []
        if (s.min.key === s.max.key && s.min.value === s.max.value)
          return `${s.name}: ${s.max.value} (${s.max.key}).`
        return `${s.name}: минимум ${s.min.value} (${s.min.key}), максимум ${s.max.value} (${s.max.key}).`
      })
      return [head, ...lines].join(' ')
    },
  },
  'cascader': {
    ...tagged,
    empty: 'Нет данных',
    noMatch: 'Нет совпадений',
    loading: 'Загрузка',
    branchError: 'Не удалось загрузить вложенные элементы',
    retry: 'Повторить',
    column: 'Варианты',
    searchInput: 'Поиск',
    searchList: 'Результаты поиска',
    clearTrigger: 'Очистить',
  },
  'citation': {
    sources: 'Источники',
    preview: 'Предпросмотр источника',
    closePreview: 'Закрыть предпросмотр источника',
    openSource: title => `Открыть: ${title}`,
    citation: (index, title) => `Источник ${index}: ${title}`,
    citations: indexes => `Источники ${indexes.join(', ')}`,
    previousSource: 'Предыдущий источник',
    nextSource: 'Следующий источник',
    source: (index, title) => `Источник ${index}: ${title}`,
    document: 'Документ',
    previewLinkSource: 'Открыть источник',
    previewLinkDocument: 'Открыть документ',
  },
  'clipboard': { copied: 'Скопировано' },
  'code-view': {
    code: 'Код',
    expand: 'Развернуть код',
    collapse: 'Свернуть код',
    foldBlock: (first, last) => (first === last ? `Строка ${first}` : `Строки ${first}–${last}`),
  },
  'color-field': { clearTrigger: 'Очистить' },
  'color-picker': {
    ...tagged,
    area: 'Насыщенность и яркость',
    areaValueText: (saturation, brightness) => `Насыщенность ${saturation}%, яркость ${brightness}%`,
    channel: channel => COLOR_CHANNEL[channel],
    channelValueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
    input: channel => ({ hex: 'HEX-код', r: 'Красный', g: 'Зелёный', b: 'Синий', a: 'Альфа-канал' })[channel],
    swatch: value => `Цвет ${value}`,
    swatchGroup: 'Образцы цветов',
    recentSwatchGroup: 'Недавние цвета',
    eyeDropperTrigger: 'Выбрать цвет на экране',
  },
  'color-slider': {
    label: channel => COLOR_CHANNEL[channel],
    valueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
  },
  'color-swatch-picker': { group: 'Образцы цветов', swatch: value => `Цвет ${value}` },
  'combobox': { ...tagged, trigger: 'Показать варианты', clearTrigger: 'Очистить' },
  'command': { title: 'Палитра команд', input: 'Поиск команд', list: 'Команды' },
  'context-menu': { content: 'Контекстное меню' },
  'date-field': {
    ...segments,
    year: 'год',
    quarter: 'квартал',
    month: 'месяц',
    week: 'неделя года',
    day: 'день',
    clearTrigger: 'Очистить',
  },
  'date-picker': { ...tagged, ...segments, ...calendar, presets: 'Быстрый выбор', clearTrigger: 'Очистить' },
  'date-range-picker': {
    ...segments,
    ...rangeCalendar,
    startDate: 'Дата начала',
    endDate: 'Дата окончания',
    startTime: 'Время начала',
    endTime: 'Время окончания',
    presets: 'Быстрый выбор',
    clearTrigger: 'Очистить',
  },
  'dialog': {
    close: 'Закрыть',
    dragTrigger: 'Переместить диалоговое окно',
    ok: 'ОК',
    cancel: 'Отмена',
    actionError: 'Не удалось выполнить действие. Повторите попытку.',
  },
  'diff-view': {
    added: 'Добавлено',
    removed: 'Удалено',
    unchanged: 'Без изменений',
    expandGap: count => `Показать ${count} ${plural(count, 'скрытую строку', 'скрытые строки', 'скрытых строк')}`,
    diff: 'Различия',
    noChanges: 'Нет изменений',
    truncated: count => `Обрезано и не показано строк: ${count}`,
    commentOn: (line, side) => `Комментировать строку ${line} ${side === 'old' ? 'старой' : 'новой'} версии`,
  },
  'drawer': { close: 'Закрыть', resizeTrigger: 'Изменить размер выдвижной панели' },
  'field-array': {
    deleteItem: (index, count) => `Удалить строку ${index} из ${count}`,
    moveUpTrigger: (index, count) => `Переместить строку ${index} из ${count} вверх`,
    moveDownTrigger: (index, count) => `Переместить строку ${index} из ${count} вниз`,
  },
  'file-upload': {
    dropzone: 'Перетащите файлы сюда',
    deleteItem: file => `Удалить: ${file.name}`,
    clearTrigger: 'Удалить все файлы',
  },
  'float-button': { trigger: 'Действия' },
  'floating-panel': {
    dragTrigger: 'Переместить панель',
    resizeTrigger: edge => `Изменить размер: ${EDGE[edge]}`,
    resizeValueText: size => `Ширина ${Math.round(size.width)}, высота ${Math.round(size.height)}`,
    windowStateTrigger: state => ({ default: 'Восстановить панель', maximized: 'Развернуть панель', minimized: 'Свернуть панель' })[state],
    close: 'Закрыть',
  },
  'form': {
    required: 'Поле «{name}» обязательно для заполнения',
    type: {
      string: 'Поле «{name}» должно быть строкой',
      number: 'Поле «{name}» должно быть числом',
      integer: 'Поле «{name}» должно быть целым числом',
      email: 'Поле «{name}» должно содержать корректный адрес электронной почты',
      url: 'Поле «{name}» должно содержать корректный URL',
      array: 'Поле «{name}» должно быть списком',
    },
    minLength: 'Поле «{name}» должно содержать не менее {min} симв.',
    maxLength: 'Поле «{name}» должно содержать не более {max} симв.',
    minNumber: 'Значение поля «{name}» должно быть не меньше {min}',
    maxNumber: 'Значение поля «{name}» должно быть не больше {max}',
    pattern: 'Поле «{name}» не соответствует требуемому формату',
  },
  'funnel-chart': {
    ...chart,
    datumLabel: (details) => {
      const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
      return details.formatted.previous ? `${head}, ${details.formatted.previous} от предыдущего этапа` : head
    },
    nameLabel: 'Этап',
    valueLabel: 'Значение',
    previousLabel: 'От предыдущего',
    firstLabel: 'От первого',
    summary: (model) => {
      if (model.stageCount === 0 || !model.first || !model.last)
        return NO_DATA
      if (model.stageCount === 1)
        return `1 этап: ${model.first.name} ${model.first.value}.`
      const parts = [
        `${model.stageCount} ${plural(model.stageCount, 'этап', 'этапа', 'этапов')}. Первый: ${model.first.name} (${model.first.value}), последний: ${model.last.name} (${model.last.value}).`,
      ]
      if (model.overall)
        parts.push(`Общая конверсия: ${model.overall}.`)
      if (model.steepest)
        parts.push(`Наибольшее падение: ${model.steepest.from} – ${model.steepest.to}, осталось ${model.steepest.rate}.`)
      return parts.join(' ')
    },
  },
  'graph-chart': {
    ...chart,
    datumLabel: (details) => {
      const parts = [details.seriesName]
      if (details.formatted.value)
        parts.push(details.formatted.value)
      parts.push(`связей: ${details.formatted.links ?? '0'}`)
      return parts.join(', ')
    },
    sourceLabel: 'Источник',
    targetLabel: 'Цель',
    valueLabel: 'Значение',
    linkLabel: 'Подпись',
    linksLabel: 'Связи',
    incomingLabel: 'Входящие',
    outgoingLabel: 'Исходящие',
    summary: (model) => {
      if (model.nodeCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} ${plural(model.nodeCount, 'узел', 'узла', 'узлов')}, ${model.linkCount} ${plural(model.linkCount, 'связь', 'связи', 'связей')}.`
      return model.hub
        ? `${head} Больше всего связей: ${model.hub.name} (${model.hub.degree} ${plural(model.hub.degree, 'связь', 'связи', 'связей')}).`
        : head
    },
  },
  'grid-list': { root: 'Элементы' },
  'heatmap': {
    gridLabel: 'Тепловая карта активности',
    cellLabel: details => `${details.date}: ${details.count}`,
    matrixCellLabel: details => `${details.row} ${details.column}: ${details.count}`,
    legendLabel: 'Уровень активности',
    legendLow: 'Меньше',
    legendHigh: 'Больше',
  },
  'hierarchy-chart': {
    ...chart,
    datumLabel: (details) => {
      const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
      return details.formatted.parentShare ? `${head}, ${details.formatted.parentShare} от группы «${details.formatted.parent ?? ''}»` : head
    },
    rootLabel: 'Все',
    pathLabel: 'Путь',
    nameLabel: 'Путь',
    valueLabel: 'Значение',
    levelLabel: level => `Уровень ${level}`,
    parentShareLabel: 'Доля от группы',
    rootShareLabel: 'Доля от итога',
    summary: (model) => {
      if (model.childCount === 0)
        return NO_DATA
      const head = `${model.root}: ${model.childCount} ${plural(model.childCount, 'элемент', 'элемента', 'элементов')}, итого ${model.total}.`
      return model.largest ? `${head} Наибольший: ${model.largest.name} ${model.largest.value} (${model.largest.share}).` : head
    },
  },
  'image-cropper': {
    cropArea: 'Область обрезки',
    valueText: rect => `X ${rect.x}, Y ${rect.y}, ширина ${rect.width}, высота ${rect.height}`,
    handleTopLeft: 'Маркер левого верхнего угла',
    handleTop: 'Маркер верхнего края',
    handleTopRight: 'Маркер правого верхнего угла',
    handleRight: 'Маркер правого края',
    handleBottomRight: 'Маркер правого нижнего угла',
    handleBottom: 'Маркер нижнего края',
    handleBottomLeft: 'Маркер левого нижнего угла',
    handleLeft: 'Маркер левого края',
    zoomSlider: 'Масштаб',
    rotateSlider: 'Поворот',
    flipHorizontal: 'Отразить по горизонтали',
    flipVertical: 'Отразить по вертикали',
  },
  'image-viewer': {
    content: 'Просмотр изображения',
    toolbar: 'Инструменты изображения',
    close: 'Закрыть',
    zoomIn: 'Увеличить',
    zoomOut: 'Уменьшить',
    rotateLeft: 'Повернуть влево',
    rotateRight: 'Повернуть вправо',
    flipHorizontal: 'Отразить по горизонтали',
    flipVertical: 'Отразить по вертикали',
    reset: 'Сбросить',
    prev: 'Предыдущее изображение',
    next: 'Следующее изображение',
    counter: (index, count) => `${index} / ${count}`,
  },
  'json-viewer': {
    text: 'Исходный код JSON',
    tree: 'JSON',
    root: 'корень',
    objectPreview: count => `{…} ${count}`,
    arrayPreview: count => `[…] ${count}`,
    collapsedBranchLabel: (name, count) => `${name}, ${count} ${plural(count, 'элемент', 'элемента', 'элементов')}`,
    moreItems: count => `… ещё ${count}`,
    empty: 'Нет данных',
  },
  'kbd': {
    keyName: (key, platform) => keyText(KEY_NAME, key, platform),
    keyLabel: (key, platform) => keyText(KEY_LABEL, key, platform),
    hotkey: names => names.join(' + '),
  },
  'loading-bar': { root: 'Загрузка' },
  'log': { log: 'Журнал', scrollToBottom: 'Прокрутить в конец' },
  'markdown-stream': { completed: 'Ответ готов' },
  'marquee': { autoplayTriggerPause: 'Приостановить прокрутку', autoplayTriggerPlay: 'Возобновить прокрутку' },
  'mention': { content: 'Упоминания', empty: 'Нет совпадений' },
  'menubar': { root: 'Строка меню' },
  'message-feed': {
    feed: 'Беседа',
    scrollToBottom: 'Прокрутить в конец',
    scrollToBottomUnread: count => `Прокрутить в конец, ${count} ${plural(count, 'новое сообщение', 'новых сообщения', 'новых сообщений')}`,
    item: (position, size, role) => {
      const who = role == null ? '' : `, ${({ user: 'пользователь', assistant: 'ассистент', system: 'система' })[role]}`
      return size > 0 ? `Сообщение ${position} из ${size}${who}` : `Сообщение ${position}${who}`
    },
  },
  'navigation-menu': { root: 'Основная навигация' },
  'notification': { region: 'Уведомления', close: 'Закрыть' },
  'pagination': {
    root: 'Навигация по страницам',
    firstTrigger: 'Первая страница',
    prevTrigger: 'Предыдущая страница',
    nextTrigger: 'Следующая страница',
    lastTrigger: 'Последняя страница',
    item: page => `Страница ${page}`,
    ellipsis: count => `Ещё ${count} ${plural(count, 'страница', 'страницы', 'страниц')}`,
    pageSizeSelect: 'Элементов на странице',
    pageSizeOption: size => `${size} / стр.`,
    summary: (start, end, count) => `${start}–${end} из ${count}`,
    jumper: 'Перейти к странице',
  },
  'password-input': {
    visibilityTriggerShow: 'Показать пароль',
    visibilityTriggerHide: 'Скрыть пароль',
    capsLockOn: 'Включён Caps Lock',
    strengthMeter: 'Надёжность пароля',
  },
  'pie-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}, ${details.formatted.value ?? ''}, ${details.formatted.share ?? ''}`,
    centerLabel: 'Итого',
    nameLabel: 'Название',
    valueLabel: 'Значение',
    shareLabel: 'Доля',
    summary: (model) => {
      const first = model.slices[0]
      const last = model.slices.at(-1)
      if (model.sliceCount === 0 || !first || !last)
        return NO_DATA
      const head = `${model.sliceCount} ${plural(model.sliceCount, 'сектор', 'сектора', 'секторов')}, итого ${model.total}.`
      if (model.sliceCount === 1)
        return `${head} ${first.name}: ${first.share}.`
      return `${head} Наибольший: ${first.name} ${first.share}. Наименьший: ${last.name} ${last.share}.`
    },
  },
  'pin-input': { input: (index, length) => `Символ ${index} из ${length}` },
  'popover': { close: 'Закрыть' },
  'progress': { segmentValueText: ({ value, label }) => `${value}, ${label}` },
  'prompt-input': { send: 'Отправить', stop: 'Остановить генерацию' },
  'question-flow': {
    prompt: 'Вопрос',
    options: 'Варианты',
    note: 'Другой ответ',
    prev: 'Предыдущий вопрос',
    next: 'Следующий вопрос',
    progress: (current, total) => `Вопрос ${current} из ${total}`,
    submitted: 'Ответы отправлены',
    selectionRange: (min, max) => {
      if (max === undefined)
        return `Выберите не менее ${min} ${plural(min, 'варианта', 'вариантов', 'вариантов')}`
      if (min === max)
        return `Выберите ${min} ${plural(min, 'вариант', 'варианта', 'вариантов')}`
      return min > 1
        ? `Выберите от ${min} до ${max} ${plural(max, 'варианта', 'вариантов', 'вариантов')}`
        : `Выберите не более ${max} ${plural(max, 'варианта', 'вариантов', 'вариантов')}`
    },
  },
  'radar-chart': {
    ...chart,
    nameLabel: 'Название',
    summary: (model) => {
      if (model.seriesCount === 0)
        return NO_DATA
      const head = `${model.seriesCount} ${plural(model.seriesCount, 'ряд', 'ряда', 'рядов')}, ${model.indicatorCount} ${plural(model.indicatorCount, 'показатель', 'показателя', 'показателей')}.`
      const parts = model.series.map((s) => {
        if (!s.highest)
          return `${s.name}: нет значений.`
        return s.lowest
          ? `${s.name}: максимум — ${s.highest.indicator} ${s.highest.value}, минимум — ${s.lowest.indicator} ${s.lowest.value}.`
          : `${s.name}: ${s.highest.indicator} ${s.highest.value}.`
      })
      return [head, ...parts].join(' ')
    },
  },
  'reasoning': {
    label: 'Ход размышлений',
    thinking: 'Размышление…',
    thinkingFor: 'Размышление: {seconds} с',
    thoughtFor: 'Размышление заняло {seconds} с',
  },
  'resizable': { root: 'Область с изменяемым размером', handle: edge => `Изменить размер: ${EDGE[edge]}` },
  'sankey-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}, ${details.formatted.value ?? ''}`,
    sourceLabel: 'Источник',
    targetLabel: 'Цель',
    valueLabel: 'Объём',
    inflowLabel: 'Приток:',
    outflowLabel: 'Отток:',
    summary: (model) => {
      if (model.linkCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} ${plural(model.nodeCount, 'узел', 'узла', 'узлов')}, ${model.linkCount} ${plural(model.linkCount, 'поток', 'потока', 'потоков')}, итого ${model.total}.`
      return model.largest ? `${head} Крупнейший поток: ${model.largest.source} – ${model.largest.target}, ${model.largest.value}.` : head
    },
  },
  'scrollbar': { thumb: 'Полоса прокрутки' },
  'select': { ...tagged, clearTrigger: 'Очистить', content: 'Варианты' },
  'side-nav': { root: 'Боковая панель', input: 'Фильтр навигации', noMatch: 'Нет совпадений' },
  'signature-pad': {
    label: 'Подпись',
    clearTrigger: 'Очистить подпись',
    undoTrigger: 'Отменить последний штрих',
    redoTrigger: 'Повторить штрих',
    statusEmpty: 'Подписи пока нет',
    statusSigned: 'Подписано',
  },
  'sortable': {
    root: 'Сортируемый список',
    itemDragTrigger: name => `Изменить порядок: ${name}`,
    itemDragTriggerRoleDescription: 'сортируемый элемент',
    picked: (name, position, total) =>
      `Элемент «${name}» взят. Позиция ${position} из ${total}. Используйте клавиши со стрелками для перемещения, пробел — чтобы поместить, Escape — чтобы отменить.`,
    moved: (_name, position, total) => `Перемещено на позицию ${position} из ${total}.`,
    dropped: (name, position) => `Элемент «${name}» помещён на позицию ${position}.`,
    canceled: (name, position) => `Сортировка отменена. Элемент «${name}» возвращён на позицию ${position}.`,
    movedToList: (listName, listPosition, listTotal, position, total) =>
      `Перемещено в список «${listName}» (${listPosition} из ${listTotal}). Позиция ${position} из ${total}.`,
    droppedInList: (name, listName, listPosition, position) =>
      `Элемент «${name}» помещён в список «${listName}» (список ${listPosition}), позиция ${position}.`,
  },
  'sparkline': {
    summary: (model) => {
      if (model.count === 0)
        return NO_DATA
      if (model.variant === 'win-loss') {
        const parts = [
          `${model.wins} ${plural(model.wins, 'победа', 'победы', 'побед')}`,
          `${model.losses} ${plural(model.losses, 'поражение', 'поражения', 'поражений')}`,
        ]
        if (model.ties > 0)
          parts.push(`${model.ties} ${plural(model.ties, 'ничья', 'ничьи', 'ничьих')}`)
        return `${model.count} ${plural(model.count, 'результат', 'результата', 'результатов')}: ${parts.join(', ')}.`
      }
      const reference = model.reference == null ? '' : ` Опорное значение: ${model.reference}.`
      if (model.count === 1)
        return `1 точка: ${model.last}.${reference}`
      const range = model.min === model.max ? `все значения равны ${model.max}` : `значения от ${model.min} до ${model.max}`
      const head = `${model.count} ${plural(model.count, 'точка', 'точки', 'точек')}, ${range}.${reference}`
      if (model.direction === 'flat')
        return `${head} Последнее значение: ${model.last}, без изменений относительно первого.`
      if (model.change == null)
        return `${head} Последнее значение: ${model.last}.`
      return `${head} Последнее значение: ${model.last}, ${model.direction === 'up' ? 'рост' : 'снижение'} на ${model.change} относительно первого.`
    },
  },
  'spinner': { label: 'Загрузка' },
  'splitter': { root: 'Разделённые панели', resizeTrigger: index => `Изменить размер панели ${index + 1}` },
  'steps': { progressLabel: 'Ход выполнения шагов', progressValueText: percent => `Выполнено ${percent}%` },
  'table': {
    ...drag,
    sort: column => `Сортировать по столбцу «${column}»`,
    columnResize: column => `Изменить ширину столбца «${column}»`,
    columnDrag: column => `Переместить столбец «${column}»`,
    columnDragRoleDescription: 'перетаскиваемый столбец',
    selectAll: 'Выбрать все строки',
    toolbar: 'Панель инструментов таблицы',
    columnList: 'Настройка столбцов',
    columnVisibility: column => `Показать столбец «${column}»`,
  },
  'tabs': { ...drag, overflowTrigger: 'Другие вкладки' },
  'tag': { close: 'Удалить' },
  'tag-group': { deleteItem: label => `Удалить: ${label}`, list: 'Теги' },
  'tags-input': { deleteItem: value => `Удалить: ${value}`, editTagInput: value => `Изменить: ${value}`, clearTrigger: 'Очистить' },
  'text-field': { clearTrigger: 'Очистить' },
  'time-field': { ...segments, clearTrigger: 'Очистить' },
  'time-picker': { ...tagged, ...segments, presets: 'Быстрый выбор', clearTrigger: 'Очистить' },
  'time-range-picker': { ...segments, startTime: 'Время начала', endTime: 'Время окончания', presets: 'Быстрый выбор', clearTrigger: 'Очистить' },
  'timer': {
    time: ({ days, hours, minutes, seconds }) =>
      `${days > 0 ? `${days} ${plural(days, 'день', 'дня', 'дней')} ` : ''}${hours} ${plural(hours, 'час', 'часа', 'часов')} ${minutes} ${plural(minutes, 'минута', 'минуты', 'минут')} ${seconds} ${plural(seconds, 'секунда', 'секунды', 'секунд')}`,
    start: 'Запустить',
    pause: 'Приостановить',
    resume: 'Продолжить',
    reset: 'Сбросить',
  },
  'tool-call': {
    inputStreaming: 'Подготовка…',
    inputAvailable: 'Выполнение…',
    awaitingApproval: 'Ожидает подтверждения',
    outputAvailable: 'Завершено',
    outputError: 'Ошибка',
  },
  'toolbar': { overflowTrigger: 'Ещё' },
  'tour': { close: 'Закрыть', progress: (step, count) => `Шаг ${step} из ${count}` },
  'transfer': { toTarget: 'Переместить в целевой список', toSource: 'Переместить в исходный список' },
  'tree': drag,
  'tree-select': {
    ...tagged,
    tree: 'Дерево вариантов',
    clearTrigger: 'Очистить',
    empty: 'Нет данных',
    loading: 'Загрузка',
    branchError: 'Не удалось загрузить вложенные элементы',
    retry: 'Повторить',
    branchEmpty: 'Нет вложенных элементов',
    searchInput: 'Поиск',
    noMatch: 'Нет совпадений',
  },
  'truncate': { expand: 'Показать больше', collapse: 'Свернуть' },
} satisfies XhLocaleTranslations

/** Русский。 */
export const ruRU: XhLocale = { locale: 'ru-RU', translations }
