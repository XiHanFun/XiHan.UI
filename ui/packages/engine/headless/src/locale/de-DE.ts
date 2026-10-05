/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 德语语言包。

import type { ChartDatumDetails } from '../shared/chart/types'
import type { KeyTextTable } from './key-text'
import type { XhLocale, XhLocaleTranslations } from './types'
import { keyText } from './key-text'

/** 读屏念的键名：修饰键在 Mac 与其余平台上叫法不同。 */
const KEY_NAME: KeyTextTable = {
  'Alt': { mac: 'Wahltaste', other: 'Alt' },
  'Control': { mac: 'Control', other: 'Strg' },
  'Meta': { mac: 'Befehlstaste', other: 'Windows-Taste' },
  'Shift': 'Umschalttaste',
  ' ': 'Leertaste',
  'ArrowDown': 'Pfeil nach unten',
  'ArrowLeft': 'Pfeil nach links',
  'ArrowRight': 'Pfeil nach rechts',
  'ArrowUp': 'Pfeil nach oben',
  'Backspace': 'Rücktaste',
  'Delete': 'Entf',
  'Enter': 'Eingabetaste',
  'Escape': 'Esc',
  'Tab': 'Tabulator',
}

/** 键帽上写的字：Mac 用系统符号。 */
const KEY_LABEL: KeyTextTable = {
  'Alt': { mac: '⌥', other: 'Alt' },
  'Control': { mac: '⌃', other: 'Strg' },
  'Meta': { mac: '⌘', other: 'Win' },
  'Shift': { mac: '⇧', other: 'Umschalt' },
  ' ': 'Leertaste',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→',
  'ArrowUp': '↑',
  'Backspace': { mac: '⌫', other: 'Rücktaste' },
  'Delete': { mac: '⌦', other: 'Entf' },
  'Enter': { mac: '⏎', other: 'Eingabe' },
  'Escape': { mac: '⎋', other: 'Esc' },
  'Tab': { mac: '⇥', other: 'Tab' },
}

const EDGE = {
  n: 'an der oberen Kante',
  s: 'an der unteren Kante',
  e: 'an der rechten Kante',
  w: 'an der linken Kante',
  ne: 'an der oberen rechten Ecke',
  nw: 'an der oberen linken Ecke',
  se: 'an der unteren rechten Ecke',
  sw: 'an der unteren linken Ecke',
} as const

const COLOR_CHANNEL = {
  hue: 'Farbton',
  saturation: 'Sättigung',
  brightness: 'Helligkeit',
  alpha: 'Deckkraft',
  red: 'Rot',
  green: 'Grün',
  blue: 'Blau',
} as const

const COLOR_UNIT = { hue: '°', saturation: ' %', brightness: ' %', alpha: ' %', red: '', green: '', blue: '' } as const

const tagged = {
  deleteItem: (label: string) => `${label} entfernen`,
  overflowTag: (count: number) => `+${count}`,
}

const segments = { hour: 'Stunde', minute: 'Minute', second: 'Sekunde', dayPeriod: 'Vormittag/Nachmittag' }

const calendar = { todayDate: (date: string) => `Heute, ${date}` }

const rangeCalendar = {
  ...calendar,
  startRangeSelectionPrompt: 'Klicken, um die Auswahl des Datumsbereichs zu beginnen',
  finishRangeSelectionPrompt: 'Klicken, um die Auswahl des Datumsbereichs abzuschließen',
  selectedRange: (start: string, end: string) => `Ausgewählter Bereich: ${start} bis ${end}`,
}

const drag = {
  moved: (name: string, position: number, total: number) => `${name} an Position ${position} von ${total} verschoben.`,
  dropped: (name: string, position: number) => `${name} an Position ${position} abgelegt.`,
  canceled: (name: string, position: number) => `Verschieben abgebrochen. ${name} zurück an Position ${position}.`,
  rejected: (name: string) => `${name} kann hier nicht abgelegt werden.`,
  movedInto: (name: string, into: string, position: number, total: number) => `${name} in ${into} verschoben, Position ${position} von ${total}.`,
  droppedInto: (name: string, into: string, position: number) => `${name} in ${into} an Position ${position} abgelegt.`,
  canceledInto: (name: string, into: string, position: number) => `Verschieben abgebrochen. ${name} zurück in ${into}, Position ${position}.`,
  rootLevel: 'die oberste Ebene',
}

const chart = {
  chartRoleDescription: 'Diagramm',
  seriesRoleDescription: 'Datenreihe',
  legendLabel: 'Legende',
  missingValue: 'Kein Wert',
  emptyText: 'Keine Daten',
  loadingText: 'Wird geladen…',
  otherLabel: 'Sonstige',
  tableCaption: 'Datentabelle',
  datumLabel: (details: ChartDatumDetails) =>
    `${details.formatted.key ?? String(details.key)}, ${details.seriesName} ${details.formatted.value ?? ''}`,
}

const NO_DATA = 'Keine Daten.'

const translations = {
  'alert': { close: 'Schließen' },
  'anchor': { root: 'Ankernavigation' },
  'approval': {
    scopes: 'Berechtigungen',
    note: 'Anmerkung',
    reason: 'Grund für die Ablehnung',
    pending: 'Wartet auf Ihre Entscheidung',
    approved: 'Genehmigt',
    denied: 'Abgelehnt',
    expired: 'Abgelaufen, als abgelehnt gewertet',
  },
  'back-top': { trigger: 'Nach oben' },
  'breadcrumb': { root: 'Brotkrümelnavigation', ellipsis: 'Vollständigen Pfad anzeigen' },
  'calendar-picker': calendar,
  'calendar-range-picker': rangeCalendar,
  'carousel': {
    root: 'Karussell',
    rootRoleDescription: 'Karussell',
    itemRoleDescription: 'Folie',
    prevTrigger: 'Vorherige Folie',
    nextTrigger: 'Nächste Folie',
    autoplayTriggerPlay: 'Automatische Wiedergabe starten',
    autoplayTriggerPause: 'Automatische Wiedergabe stoppen',
    indicatorGroup: 'Anzuzeigende Folie auswählen',
    indicator: page => `Zu Folie ${page} wechseln`,
    item: (index, count) => `${index} von ${count}`,
  },
  'cartesian-chart': {
    ...chart,
    keyLabel: 'Kategorie',
    seriesLabel: 'Datenreihe',
    valueLabel: 'Wert',
    sizeLabel: 'Größe',
    colorLabel: 'Farbe',
    referenceLabel: 'Referenz',
    averageLabel: 'Durchschnitt',
    ohlcLabel: ({ open, high, low, close }) => `Eröffnung ${open}, Hoch ${high}, Tief ${low}, Schluss ${close}`,
    ohlcColumns: { open: 'Eröffnung', high: 'Hoch', low: 'Tief', close: 'Schluss' },
    boxLabel: ({ min, q1, median, q3, max }) => `Minimum ${min}, Q1 ${q1}, Median ${median}, Q3 ${q3}, Maximum ${max}`,
    boxColumns: { min: 'Minimum', q1: 'Q1', median: 'Median', q3: 'Q3', max: 'Maximum', outliers: 'Ausreißer' },
    zoomLabel: 'Zoom',
    zoomStartLabel: 'Fensteranfang',
    zoomEndLabel: 'Fensterende',
    aggregatedCaption: ({ caption, rows, ranges }) => `${caption} (${rows} Zeilen in ${ranges} Bereichen)`,
    annotationSummary: items => items.map(item => `${item.label}${item.series ? ` (${item.series})` : ''}: ${item.value}.`).join(' '),
    summary: (model) => {
      if (!model.range || model.series.every(s => s.count === 0))
        return NO_DATA
      const { first, last, count } = model.range
      const head = `${model.seriesCount} ${model.seriesCount === 1 ? 'Datenreihe' : 'Datenreihen'}, ${count} ${count === 1 ? 'Datenpunkt' : 'Datenpunkte'} von ${first} bis ${last}.`
      const lines = model.series.flatMap((s) => {
        if (!s.min || !s.max)
          return []
        if (s.min.key === s.max.key && s.min.value === s.max.value)
          return `${s.name}: ${s.max.value} bei ${s.max.key}.`
        return `${s.name}: Tiefstwert ${s.min.value} bei ${s.min.key}, Höchstwert ${s.max.value} bei ${s.max.key}.`
      })
      return [head, ...lines].join(' ')
    },
  },
  'cascader': {
    ...tagged,
    empty: 'Keine Daten',
    noMatch: 'Keine Treffer',
    loading: 'Wird geladen',
    branchError: 'Untergeordnete Elemente konnten nicht geladen werden',
    retry: 'Erneut versuchen',
    column: 'Optionen',
    searchInput: 'Suchen',
    searchList: 'Suchergebnisse',
    clearTrigger: 'Leeren',
  },
  'citation': {
    sources: 'Quellen',
    preview: 'Quellenvorschau',
    closePreview: 'Quellenvorschau schließen',
    openSource: title => `${title} öffnen`,
    citation: (index, title) => `Quelle ${index}: ${title}`,
    citations: indexes => `Quellen ${indexes.join(', ')}`,
    previousSource: 'Vorherige Quelle',
    nextSource: 'Nächste Quelle',
    source: (index, title) => `Quelle ${index}: ${title}`,
    document: 'Dokument',
    previewLinkSource: 'Quelle öffnen',
    previewLinkDocument: 'Dokument öffnen',
  },
  'clipboard': { copied: 'Kopiert' },
  'code-view': {
    code: 'Code',
    expand: 'Code ausklappen',
    collapse: 'Code einklappen',
    foldBlock: (first, last) => (first === last ? `Zeile ${first}` : `Zeilen ${first}–${last}`),
  },
  'color-field': { clearTrigger: 'Leeren' },
  'color-picker': {
    ...tagged,
    area: 'Sättigung und Helligkeit',
    areaValueText: (saturation, brightness) => `Sättigung ${saturation} %, Helligkeit ${brightness} %`,
    channel: channel => COLOR_CHANNEL[channel],
    channelValueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
    input: channel => ({ hex: 'Hex', r: 'Rot', g: 'Grün', b: 'Blau', a: 'Deckkraft' })[channel],
    swatch: value => `Farbe ${value}`,
    swatchGroup: 'Farbfelder',
    recentSwatchGroup: 'Zuletzt verwendete Farben',
    eyeDropperTrigger: 'Farbe vom Bildschirm aufnehmen',
  },
  'color-slider': {
    label: channel => COLOR_CHANNEL[channel],
    valueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
  },
  'color-swatch-picker': { group: 'Farbfelder', swatch: value => `Farbe ${value}` },
  'combobox': { ...tagged, trigger: 'Vorschläge anzeigen', clearTrigger: 'Leeren' },
  'command': { title: 'Befehlspalette', input: 'Befehle suchen', list: 'Befehle' },
  'context-menu': { content: 'Kontextmenü' },
  'date-field': {
    ...segments,
    year: 'Jahr',
    quarter: 'Quartal',
    month: 'Monat',
    week: 'Kalenderwoche',
    day: 'Tag',
    clearTrigger: 'Leeren',
  },
  'date-picker': { ...tagged, ...segments, ...calendar, presets: 'Schnellauswahl', clearTrigger: 'Leeren' },
  'date-range-picker': {
    ...segments,
    ...rangeCalendar,
    startDate: 'Startdatum',
    endDate: 'Enddatum',
    startTime: 'Startzeit',
    endTime: 'Endzeit',
    presets: 'Schnellauswahl',
    clearTrigger: 'Leeren',
  },
  'dialog': {
    close: 'Schließen',
    dragTrigger: 'Dialog verschieben',
    ok: 'OK',
    cancel: 'Abbrechen',
    actionError: 'Aktion fehlgeschlagen. Bitte erneut versuchen.',
  },
  'diff-view': {
    added: 'Hinzugefügt',
    removed: 'Entfernt',
    unchanged: 'Unverändert',
    expandGap: count => (count === 1 ? '1 ausgeblendete Zeile anzeigen' : `${count} ausgeblendete Zeilen anzeigen`),
    diff: 'Unterschiede',
    noChanges: 'Keine Änderungen',
    truncated: count => (count === 1
      ? '1 weitere Zeile wurde abgeschnitten und wird nicht angezeigt'
      : `${count} weitere Zeilen wurden abgeschnitten und werden nicht angezeigt`),
    commentOn: (line, side) => `Zeile ${line} der ${side === 'old' ? 'alten' : 'neuen'} Version kommentieren`,
  },
  'drawer': { close: 'Schließen', resizeTrigger: 'Größe des Bereichs ändern' },
  'field-array': {
    deleteItem: (index, count) => `Zeile ${index} von ${count} entfernen`,
    moveUpTrigger: (index, count) => `Zeile ${index} von ${count} nach oben verschieben`,
    moveDownTrigger: (index, count) => `Zeile ${index} von ${count} nach unten verschieben`,
  },
  'file-upload': {
    dropzone: 'Dateien hier ablegen',
    deleteItem: file => `${file.name} entfernen`,
    clearTrigger: 'Alle Dateien entfernen',
  },
  'float-button': { trigger: 'Aktionen' },
  'floating-panel': {
    dragTrigger: 'Bereich verschieben',
    resizeTrigger: edge => `Größe ${EDGE[edge]} ändern`,
    resizeValueText: size => `Breite ${Math.round(size.width)}, Höhe ${Math.round(size.height)}`,
    windowStateTrigger: state => ({ default: 'Bereich wiederherstellen', maximized: 'Bereich maximieren', minimized: 'Bereich minimieren' })[state],
    close: 'Schließen',
  },
  'form': {
    required: '{name} ist erforderlich',
    type: {
      string: '{name} muss eine Zeichenfolge sein',
      number: '{name} muss eine Zahl sein',
      integer: '{name} muss eine ganze Zahl sein',
      email: '{name} ist keine gültige E-Mail-Adresse',
      url: '{name} ist keine gültige URL',
      array: '{name} muss eine Liste sein',
    },
    minLength: '{name} muss mindestens {min} Zeichen lang sein',
    maxLength: '{name} darf höchstens {max} Zeichen lang sein',
    minNumber: '{name} muss mindestens {min} sein',
    maxNumber: '{name} darf höchstens {max} sein',
    pattern: '{name} entspricht nicht dem erforderlichen Format',
  },
  'funnel-chart': {
    ...chart,
    datumLabel: (details) => {
      const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
      return details.formatted.previous ? `${head}, ${details.formatted.previous} der vorherigen Stufe` : head
    },
    nameLabel: 'Stufe',
    valueLabel: 'Wert',
    previousLabel: 'Von vorheriger Stufe',
    firstLabel: 'Von erster Stufe',
    summary: (model) => {
      if (model.stageCount === 0 || !model.first || !model.last)
        return NO_DATA
      if (model.stageCount === 1)
        return `1 Stufe: ${model.first.name} ${model.first.value}.`
      const parts = [`${model.stageCount} Stufen von ${model.first.name} (${model.first.value}) bis ${model.last.name} (${model.last.value}).`]
      if (model.overall)
        parts.push(`Gesamtkonversion ${model.overall}.`)
      if (model.steepest)
        parts.push(`Größter Rückgang: von ${model.steepest.from} zu ${model.steepest.to}, ${model.steepest.rate} verbleiben.`)
      return parts.join(' ')
    },
  },
  'graph-chart': {
    ...chart,
    datumLabel: (details) => {
      const parts = [details.seriesName]
      if (details.formatted.value)
        parts.push(details.formatted.value)
      parts.push(`${details.formatted.links ?? '0'} ${details.values.links === 1 ? 'Verbindung' : 'Verbindungen'}`)
      return parts.join(', ')
    },
    sourceLabel: 'Quelle',
    targetLabel: 'Ziel',
    valueLabel: 'Wert',
    linkLabel: 'Beschriftung',
    linksLabel: 'Verbindungen',
    incomingLabel: 'Eingehend',
    outgoingLabel: 'Ausgehend',
    summary: (model) => {
      if (model.nodeCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} Knoten, ${model.linkCount} ${model.linkCount === 1 ? 'Verbindung' : 'Verbindungen'}.`
      return model.hub ? `${head} Am stärksten verbunden: ${model.hub.name} (${model.hub.degree} ${model.hub.degree === 1 ? 'Verbindung' : 'Verbindungen'}).` : head
    },
  },
  'grid-list': { root: 'Elemente' },
  'heatmap': {
    gridLabel: 'Aktivitäts-Heatmap',
    cellLabel: details => `${details.count} am ${details.date}`,
    matrixCellLabel: details => `${details.row} ${details.column}: ${details.count}`,
    legendLabel: 'Aktivitätsniveau',
    legendLow: 'Weniger',
    legendHigh: 'Mehr',
  },
  'hierarchy-chart': {
    ...chart,
    chartRoleDescription: 'Baumdiagramm',
    datumLabel: (details) => {
      const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
      return details.formatted.parentShare ? `${head}, ${details.formatted.parentShare} von ${details.formatted.parent ?? ''}` : head
    },
    rootLabel: 'Alle',
    pathLabel: 'Pfad',
    nameLabel: 'Pfad',
    valueLabel: 'Wert',
    levelLabel: level => `Ebene ${level}`,
    parentShareLabel: 'Anteil am übergeordneten Element',
    rootShareLabel: 'Anteil am Gesamtwert',
    summary: (model) => {
      if (model.childCount === 0)
        return NO_DATA
      const head = `${model.root}: ${model.childCount} ${model.childCount === 1 ? 'Element' : 'Elemente'}, insgesamt ${model.total}.`
      return model.largest ? `${head} Größtes Element: ${model.largest.name} ${model.largest.value} (${model.largest.share}).` : head
    },
  },
  'image-cropper': {
    cropArea: 'Zuschneidebereich',
    valueText: rect => `X ${rect.x}, Y ${rect.y}, Breite ${rect.width}, Höhe ${rect.height}`,
    handleTopLeft: 'Griff an der oberen linken Ecke',
    handleTop: 'Griff an der oberen Kante',
    handleTopRight: 'Griff an der oberen rechten Ecke',
    handleRight: 'Griff an der rechten Kante',
    handleBottomRight: 'Griff an der unteren rechten Ecke',
    handleBottom: 'Griff an der unteren Kante',
    handleBottomLeft: 'Griff an der unteren linken Ecke',
    handleLeft: 'Griff an der linken Kante',
    zoomSlider: 'Zoom',
    rotateSlider: 'Drehen',
    flipHorizontal: 'Horizontal spiegeln',
    flipVertical: 'Vertikal spiegeln',
  },
  'image-viewer': {
    content: 'Bildvorschau',
    toolbar: 'Bildwerkzeuge',
    close: 'Schließen',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    rotateLeft: 'Nach links drehen',
    rotateRight: 'Nach rechts drehen',
    flipHorizontal: 'Horizontal spiegeln',
    flipVertical: 'Vertikal spiegeln',
    reset: 'Zurücksetzen',
    prev: 'Vorheriges Bild',
    next: 'Nächstes Bild',
    counter: (index, count) => `${index} / ${count}`,
  },
  'json-viewer': {
    text: 'JSON-Quelltext',
    tree: 'JSON',
    root: 'Wurzel',
    objectPreview: count => `{…} ${count}`,
    arrayPreview: count => `[…] ${count}`,
    collapsedBranchLabel: (name, count) => `${name}, ${count === 1 ? '1 Eintrag' : `${count} Einträge`}`,
    moreItems: count => `… ${count} weitere`,
    empty: 'Keine Daten',
  },
  'kbd': {
    keyName: (key, platform) => keyText(KEY_NAME, key, platform),
    keyLabel: (key, platform) => keyText(KEY_LABEL, key, platform),
    hotkey: names => names.join(' + '),
  },
  'loading-bar': { root: 'Wird geladen' },
  'log': { log: 'Protokoll', scrollToBottom: 'Zum Ende scrollen' },
  'markdown-stream': { completed: 'Antwort abgeschlossen' },
  'marquee': { autoplayTriggerPause: 'Scrollen anhalten', autoplayTriggerPlay: 'Scrollen fortsetzen' },
  'mention': { content: 'Erwähnungen', empty: 'Keine Treffer' },
  'menubar': { root: 'Menüleiste' },
  'message-feed': {
    feed: 'Unterhaltung',
    scrollToBottom: 'Zum Ende scrollen',
    scrollToBottomUnread: count => `Zum Ende scrollen, ${count} ${count === 1 ? 'neue Nachricht' : 'neue Nachrichten'}`,
    item: (position, size, role) => {
      const who = role == null ? '' : `, ${({ user: 'Benutzer', assistant: 'Assistent', system: 'System' })[role]}`
      return size > 0 ? `Nachricht ${position} von ${size}${who}` : `Nachricht ${position}${who}`
    },
  },
  'navigation-menu': { root: 'Hauptnavigation' },
  'notification': { region: 'Benachrichtigungen', close: 'Schließen' },
  'pagination': {
    root: 'Seitennavigation',
    firstTrigger: 'Erste Seite',
    prevTrigger: 'Vorherige Seite',
    nextTrigger: 'Nächste Seite',
    lastTrigger: 'Letzte Seite',
    item: page => `Seite ${page}`,
    ellipsis: count => (count === 1 ? '1 weitere Seite' : `${count} weitere Seiten`),
    pageSizeSelect: 'Einträge pro Seite',
    pageSizeOption: size => `${size} / Seite`,
    summary: (start, end, count) => `${start}–${end} von ${count}`,
    jumper: 'Gehe zu Seite',
  },
  'password-input': {
    visibilityTriggerShow: 'Passwort anzeigen',
    visibilityTriggerHide: 'Passwort ausblenden',
    capsLockOn: 'Feststelltaste ist aktiviert',
    strengthMeter: 'Passwortstärke',
  },
  'pie-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}, ${details.formatted.value ?? ''}, ${details.formatted.share ?? ''}`,
    centerLabel: 'Gesamt',
    nameLabel: 'Name',
    valueLabel: 'Wert',
    shareLabel: 'Anteil',
    summary: (model) => {
      const first = model.slices[0]
      const last = model.slices.at(-1)
      if (model.sliceCount === 0 || !first || !last)
        return NO_DATA
      const head = `${model.sliceCount} ${model.sliceCount === 1 ? 'Segment' : 'Segmente'}, insgesamt ${model.total}.`
      if (model.sliceCount === 1)
        return `${head} ${first.name}: ${first.share}.`
      return `${head} Größtes: ${first.name} ${first.share}. Kleinstes: ${last.name} ${last.share}.`
    },
  },
  'pin-input': { input: (index, length) => `Zeichen ${index} von ${length}` },
  'popover': { close: 'Schließen' },
  'progress': { segmentValueText: ({ value, label }) => `${value}, ${label}` },
  'prompt-input': { send: 'Senden', stop: 'Generierung stoppen' },
  'question-flow': {
    prompt: 'Frage',
    options: 'Optionen',
    note: 'Andere Antwort',
    prev: 'Vorherige Frage',
    next: 'Nächste Frage',
    progress: (current, total) => `Frage ${current} von ${total}`,
    submitted: 'Antworten gesendet',
    selectionRange: (min, max) => {
      if (max === undefined)
        return `Mindestens ${min} auswählen`
      if (min === max)
        return `${min} auswählen`
      return min > 1 ? `${min} bis ${max} auswählen` : `Bis zu ${max} auswählen`
    },
  },
  'radar-chart': {
    ...chart,
    nameLabel: 'Name',
    summary: (model) => {
      if (model.seriesCount === 0)
        return NO_DATA
      const head = `${model.seriesCount} ${model.seriesCount === 1 ? 'Datenreihe' : 'Datenreihen'} über ${model.indicatorCount} ${model.indicatorCount === 1 ? 'Indikator' : 'Indikatoren'}.`
      const parts = model.series.map((s) => {
        if (!s.highest)
          return `${s.name}: keine Werte.`
        return s.lowest
          ? `${s.name}: Höchstwert ${s.highest.indicator} ${s.highest.value}, Tiefstwert ${s.lowest.indicator} ${s.lowest.value}.`
          : `${s.name}: ${s.highest.indicator} ${s.highest.value}.`
      })
      return [head, ...parts].join(' ')
    },
  },
  'reasoning': {
    label: 'Gedankengang',
    thinking: 'Denkt nach…',
    thinkingFor: 'Denkt seit {seconds} s nach',
    thoughtFor: '{seconds} s nachgedacht',
  },
  'resizable': { root: 'Größenveränderbarer Bereich', handle: edge => `Größe ${EDGE[edge]} ändern` },
  'sankey-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}, ${details.formatted.value ?? ''}`,
    sourceLabel: 'Quelle',
    targetLabel: 'Ziel',
    valueLabel: 'Wert',
    inflowLabel: 'Von',
    outflowLabel: 'Nach',
    summary: (model) => {
      if (model.linkCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} Knoten, ${model.linkCount} ${model.linkCount === 1 ? 'Fluss' : 'Flüsse'}, insgesamt ${model.total}.`
      return model.largest ? `${head} Größter Fluss: von ${model.largest.source} nach ${model.largest.target}, ${model.largest.value}.` : head
    },
  },
  'scrollbar': { thumb: 'Bildlaufleiste' },
  'select': { ...tagged, clearTrigger: 'Leeren', content: 'Optionen' },
  'side-nav': { root: 'Seitenleiste', input: 'Navigation filtern', noMatch: 'Keine Treffer' },
  'signature-pad': {
    label: 'Unterschrift',
    clearTrigger: 'Unterschrift löschen',
    undoTrigger: 'Letzten Strich rückgängig machen',
    redoTrigger: 'Strich wiederholen',
    statusEmpty: 'Noch keine Unterschrift',
    statusSigned: 'Unterschrieben',
  },
  'sortable': {
    root: 'Sortierbare Liste',
    itemDragTrigger: name => `${name} neu anordnen`,
    itemDragTriggerRoleDescription: 'sortierbares Element',
    picked: (name, position, total) => `${name} aufgenommen. Position ${position} von ${total}. Mit den Pfeiltasten verschieben, mit der Leertaste ablegen, mit Esc abbrechen.`,
    moved: (_name, position, total) => `An Position ${position} von ${total} verschoben.`,
    dropped: (name, position) => `${name} an Position ${position} abgelegt.`,
    canceled: (name, position) => `Sortieren abgebrochen. ${name} zurück an Position ${position}.`,
    movedToList: (listName, listPosition, listTotal, position, total) =>
      `In ${listName} verschoben, Liste ${listPosition} von ${listTotal}. Position ${position} von ${total}.`,
    droppedInList: (name, listName, listPosition, position) => `${name} in ${listName} abgelegt, Liste ${listPosition}, an Position ${position}.`,
  },
  'sparkline': {
    summary: (model) => {
      if (model.count === 0)
        return NO_DATA
      if (model.variant === 'win-loss') {
        const parts = [`${model.wins} ${model.wins === 1 ? 'Sieg' : 'Siege'}`, `${model.losses} ${model.losses === 1 ? 'Niederlage' : 'Niederlagen'}`]
        if (model.ties > 0)
          parts.push(`${model.ties} Unentschieden`)
        return `${model.count} ${model.count === 1 ? 'Ergebnis' : 'Ergebnisse'}: ${parts.join(', ')}.`
      }
      const reference = model.reference == null ? '' : ` Referenz ${model.reference}.`
      if (model.count === 1)
        return `1 Datenpunkt: ${model.last}.${reference}`
      const range = model.min === model.max ? `durchgehend ${model.max}` : `zwischen ${model.min} und ${model.max}`
      const head = `${model.count} Datenpunkte, ${range}.${reference}`
      if (model.direction === 'flat')
        return `${head} Letzter Wert ${model.last}, unverändert gegenüber dem ersten.`
      if (model.change == null)
        return `${head} Letzter Wert ${model.last}.`
      return `${head} Letzter Wert ${model.last}, ${model.change} ${model.direction === 'up' ? 'höher' : 'niedriger'} als der erste.`
    },
  },
  'spinner': { label: 'Wird geladen' },
  'splitter': { root: 'Geteilte Bereiche', resizeTrigger: index => `Größe von Bereich ${index + 1} ändern` },
  'steps': { progressLabel: 'Schrittfortschritt', progressValueText: percent => `${percent} % abgeschlossen` },
  'table': {
    ...drag,
    sort: column => `Nach ${column} sortieren`,
    columnResize: column => `Breite der Spalte ${column} ändern`,
    columnDrag: column => `Spalte ${column} neu anordnen`,
    columnDragRoleDescription: 'verschiebbare Spalte',
    selectAll: 'Alle Zeilen auswählen',
    toolbar: 'Tabellensymbolleiste',
    columnList: 'Spalteneinstellungen',
    columnVisibility: column => `Spalte ${column} anzeigen`,
  },
  'tabs': { ...drag, overflowTrigger: 'Weitere Tabs' },
  'tag': { close: 'Entfernen' },
  'tag-group': { deleteItem: label => `${label} entfernen`, list: 'Tags' },
  'tags-input': { deleteItem: value => `${value} entfernen`, editTagInput: value => `${value} bearbeiten`, clearTrigger: 'Leeren' },
  'text-field': { clearTrigger: 'Leeren' },
  'time-field': { ...segments, clearTrigger: 'Leeren' },
  'time-picker': { ...tagged, ...segments, presets: 'Schnellauswahl', clearTrigger: 'Leeren' },
  'time-range-picker': { ...segments, startTime: 'Startzeit', endTime: 'Endzeit', presets: 'Schnellauswahl', clearTrigger: 'Leeren' },
  'timer': {
    time: ({ days, hours, minutes, seconds }) => {
      const unit = (value: number, one: string, many: string): string => `${value} ${value === 1 ? one : many}`
      const rest = `${unit(hours, 'Stunde', 'Stunden')} ${unit(minutes, 'Minute', 'Minuten')} ${unit(seconds, 'Sekunde', 'Sekunden')}`
      return days > 0 ? `${unit(days, 'Tag', 'Tage')} ${rest}` : rest
    },
    start: 'Starten',
    pause: 'Pausieren',
    resume: 'Fortsetzen',
    reset: 'Zurücksetzen',
  },
  'tool-call': {
    inputStreaming: 'Wird vorbereitet…',
    inputAvailable: 'Wird ausgeführt…',
    awaitingApproval: 'Wartet auf Genehmigung',
    outputAvailable: 'Abgeschlossen',
    outputError: 'Fehlgeschlagen',
  },
  'toolbar': { overflowTrigger: 'Mehr' },
  'tour': { close: 'Schließen', progress: (step, count) => `Schritt ${step} von ${count}` },
  'transfer': { toTarget: 'In Zielliste verschieben', toSource: 'In Quellliste verschieben' },
  'tree': drag,
  'tree-select': {
    ...tagged,
    tree: 'Baumoptionen',
    clearTrigger: 'Leeren',
    empty: 'Keine Daten',
    loading: 'Wird geladen',
    branchError: 'Untergeordnete Elemente konnten nicht geladen werden',
    retry: 'Erneut versuchen',
    branchEmpty: 'Keine untergeordneten Elemente',
    searchInput: 'Suchen',
    noMatch: 'Keine Treffer',
  },
  'truncate': { expand: 'Mehr anzeigen', collapse: 'Weniger anzeigen' },
} satisfies XhLocaleTranslations

/** Deutsch。 */
export const deDE: XhLocale = { locale: 'de-DE', translations }
