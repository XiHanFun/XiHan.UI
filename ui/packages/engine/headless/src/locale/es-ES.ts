/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 西班牙语语言包。

import type { ChartDatumDetails } from '../shared/chart'
import type { XhLocale, XhLocaleTranslations } from './types'

const EDGE = {
  n: 'el borde superior',
  s: 'el borde inferior',
  e: 'el borde derecho',
  w: 'el borde izquierdo',
  ne: 'la esquina superior derecha',
  nw: 'la esquina superior izquierda',
  se: 'la esquina inferior derecha',
  sw: 'la esquina inferior izquierda',
} as const

const COLOR_CHANNEL = {
  hue: 'Tono',
  saturation: 'Saturación',
  brightness: 'Brillo',
  alpha: 'Alfa',
  red: 'Rojo',
  green: 'Verde',
  blue: 'Azul',
} as const

const COLOR_UNIT = { hue: '°', saturation: '%', brightness: '%', alpha: '%', red: '', green: '', blue: '' } as const

const tagged = {
  deleteItem: (label: string) => `Eliminar ${label}`,
  overflowTag: (count: number) => `+${count}`,
}

const segments = { hour: 'hora', minute: 'minuto', second: 'segundo', dayPeriod: 'a. m./p. m.' }

const calendar = { todayDate: (date: string) => `Hoy, ${date}` }

const rangeCalendar = {
  ...calendar,
  startRangeSelectionPrompt: 'Haz clic para empezar a seleccionar el intervalo de fechas',
  finishRangeSelectionPrompt: 'Haz clic para terminar de seleccionar el intervalo de fechas',
  selectedRange: (start: string, end: string) => `Intervalo seleccionado: de ${start} a ${end}`,
}

const drag = {
  moved: (name: string, position: number, total: number) => `Se ha movido ${name} a la posición ${position} de ${total}.`,
  dropped: (name: string, position: number) => `Se ha soltado ${name} en la posición ${position}.`,
  canceled: (name: string, position: number) => `Movimiento cancelado. ${name} ha vuelto a la posición ${position}.`,
  rejected: (name: string) => `${name} no se puede soltar aquí.`,
  movedInto: (name: string, into: string, position: number, total: number) => `Se ha movido ${name} a ${into}, posición ${position} de ${total}.`,
  droppedInto: (name: string, into: string, position: number) => `Se ha soltado ${name} en ${into}, en la posición ${position}.`,
  canceledInto: (name: string, into: string, position: number) => `Movimiento cancelado. ${name} ha vuelto a ${into}, posición ${position}.`,
  rootLevel: 'la raíz',
}

const chart = {
  chartRoleDescription: 'gráfico',
  seriesRoleDescription: 'serie',
  legendLabel: 'Leyenda',
  missingValue: 'Sin valor',
  emptyText: 'Sin datos',
  loadingText: 'Cargando…',
  otherLabel: 'Otros',
  tableCaption: 'Tabla de datos',
  datumLabel: (details: ChartDatumDetails) =>
    `${details.formatted.key ?? String(details.key)}, ${details.seriesName} ${details.formatted.value ?? ''}`,
}

const NO_DATA = 'Sin datos.'

const translations = {
  'alert': { close: 'Cerrar' },
  'anchor': { root: 'Navegación por anclas' },
  'approval': {
    scopes: 'Permisos',
    note: 'Nota',
    reason: 'Motivo del rechazo',
    pending: 'Esperando tu decisión',
    approved: 'Aprobado',
    denied: 'Denegado',
    expired: 'Caducado, se considera denegado',
  },
  'back-top': { trigger: 'Volver arriba' },
  'breadcrumb': { root: 'Ruta de navegación', ellipsis: 'Mostrar la ruta completa' },
  'calendar-picker': calendar,
  'calendar-range-picker': rangeCalendar,
  'carousel': {
    root: 'Carrusel',
    prevTrigger: 'Diapositiva anterior',
    nextTrigger: 'Diapositiva siguiente',
    autoplayTriggerPlay: 'Iniciar la presentación automática',
    autoplayTriggerPause: 'Detener la presentación automática',
    indicatorGroup: 'Elegir la diapositiva que se muestra',
    indicator: page => `Ir a la diapositiva ${page}`,
    item: (index, count) => `${index} de ${count}`,
  },
  'cartesian-chart': {
    ...chart,
    keyLabel: 'Categoría',
    seriesLabel: 'Serie',
    valueLabel: 'Valor',
    sizeLabel: 'Tamaño',
    colorLabel: 'Color',
    referenceLabel: 'Referencia',
    averageLabel: 'Media',
    ohlcLabel: ({ open, high, low, close }) => `Apertura ${open}, máximo ${high}, mínimo ${low}, cierre ${close}`,
    ohlcColumns: { open: 'Apertura', high: 'Máximo', low: 'Mínimo', close: 'Cierre' },
    boxLabel: ({ min, q1, median, q3, max }) => `Mínimo ${min}, Q1 ${q1}, mediana ${median}, Q3 ${q3}, máximo ${max}`,
    boxColumns: { min: 'Mínimo', q1: 'Q1', median: 'Mediana', q3: 'Q3', max: 'Máximo', outliers: 'Valores atípicos' },
    zoomLabel: 'Zoom',
    zoomStartLabel: 'Inicio de la ventana',
    zoomEndLabel: 'Fin de la ventana',
    aggregatedCaption: ({ caption, rows, ranges }) => `${caption} (${rows} filas en ${ranges} intervalos)`,
    annotationSummary: items => items.map(item => `${item.label}${item.series ? ` (${item.series})` : ''}: ${item.value}.`).join(' '),
    summary: (model) => {
      if (!model.range || model.series.every(s => s.count === 0))
        return NO_DATA
      const { first, last, count } = model.range
      const head = `${model.seriesCount} ${model.seriesCount === 1 ? 'serie' : 'series'}, ${count} ${count === 1 ? 'punto' : 'puntos'} de ${first} a ${last}.`
      const lines = model.series.flatMap((s) => {
        if (!s.min || !s.max)
          return []
        if (s.min.key === s.max.key && s.min.value === s.max.value)
          return `${s.name}: ${s.max.value} en ${s.max.key}.`
        return `${s.name}: mínimo ${s.min.value} en ${s.min.key}, máximo ${s.max.value} en ${s.max.key}.`
      })
      return [head, ...lines].join(' ')
    },
  },
  'cascader': {
    ...tagged,
    empty: 'Sin datos',
    noMatch: 'Sin resultados',
    loading: 'Cargando',
    branchError: 'No se pudieron cargar los elementos secundarios',
    retry: 'Reintentar',
    column: 'Opciones',
    searchInput: 'Buscar',
    searchList: 'Resultados de la búsqueda',
    clearTrigger: 'Borrar',
  },
  'citation': {
    sources: 'Fuentes',
    preview: 'Vista previa de la fuente',
    closePreview: 'Cerrar la vista previa de la fuente',
    openSource: title => `Abrir ${title}`,
    citation: (index, title) => `Fuente ${index}: ${title}`,
    citations: indexes => `Fuentes ${indexes.join(', ')}`,
    previousSource: 'Fuente anterior',
    nextSource: 'Fuente siguiente',
    source: (index, title) => `Fuente ${index}: ${title}`,
    document: 'Documento',
  },
  'clipboard': { copied: 'Copiado' },
  'code-view': {
    code: 'Código',
    expand: 'Expandir código',
    collapse: 'Contraer código',
    foldBlock: (first, last) => (first === last ? `Línea ${first}` : `Líneas ${first}–${last}`),
  },
  'color-field': { clearTrigger: 'Borrar' },
  'color-picker': {
    ...tagged,
    area: 'Saturación y brillo',
    areaValueText: (saturation, brightness) => `Saturación ${saturation}%, brillo ${brightness}%`,
    channel: channel => COLOR_CHANNEL[channel],
    channelValueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
    input: channel => ({ hex: 'Hexadecimal', r: 'Rojo', g: 'Verde', b: 'Azul', a: 'Alfa' })[channel],
    swatch: value => `Color ${value}`,
    swatchGroup: 'Muestras de color',
    recentSwatchGroup: 'Colores recientes',
    eyeDropperTrigger: 'Seleccionar un color de la pantalla',
  },
  'color-slider': {
    label: channel => COLOR_CHANNEL[channel],
    valueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
  },
  'color-swatch-picker': { group: 'Muestras de color', swatch: value => `Color ${value}` },
  'combobox': { ...tagged, trigger: 'Mostrar sugerencias', clearTrigger: 'Borrar' },
  'command': { title: 'Paleta de comandos', input: 'Buscar comandos', list: 'Comandos' },
  'context-menu': { content: 'Menú contextual' },
  'date-field': {
    ...segments,
    year: 'año',
    quarter: 'trimestre',
    month: 'mes',
    week: 'semana del año',
    day: 'día',
    clearTrigger: 'Borrar',
  },
  'date-picker': { ...tagged, ...segments, ...calendar, presets: 'Accesos directos', clearTrigger: 'Borrar' },
  'date-range-picker': {
    ...segments,
    ...rangeCalendar,
    startDate: 'Fecha de inicio',
    endDate: 'Fecha de fin',
    startTime: 'Hora de inicio',
    endTime: 'Hora de fin',
    presets: 'Accesos directos',
    clearTrigger: 'Borrar',
  },
  'dialog': { close: 'Cerrar', dragTrigger: 'Mover el cuadro de diálogo' },
  'diff-view': {
    added: 'Añadido',
    removed: 'Eliminado',
    unchanged: 'Sin modificar',
    expandGap: count => (count === 1 ? 'Mostrar 1 línea oculta' : `Mostrar ${count} líneas ocultas`),
    diff: 'Diferencias',
    noChanges: 'Sin cambios',
    truncated: count => (count === 1 ? 'Hay 1 línea más recortada que no se muestra' : `Hay ${count} líneas más recortadas que no se muestran`),
    commentOn: (line, side) => `Comentar la línea ${line} de la versión ${side === 'old' ? 'anterior' : 'nueva'}`,
  },
  'drawer': { close: 'Cerrar', resizeTrigger: 'Cambiar el tamaño del panel lateral' },
  'field-array': {
    deleteItem: (index, count) => `Quitar la fila ${index} de ${count}`,
    moveUpTrigger: (index, count) => `Subir la fila ${index} de ${count}`,
    moveDownTrigger: (index, count) => `Bajar la fila ${index} de ${count}`,
  },
  'file-upload': {
    dropzone: 'Suelta los archivos aquí',
    deleteItem: file => `Eliminar ${file.name}`,
    clearTrigger: 'Quitar todos los archivos',
  },
  'float-button': { trigger: 'Acciones' },
  'floating-panel': {
    dragTrigger: 'Mover el panel',
    resizeTrigger: edge => `Cambiar el tamaño desde ${EDGE[edge]}`,
    resizeValueText: size => `Ancho ${Math.round(size.width)}, alto ${Math.round(size.height)}`,
    windowStateTrigger: state => ({ default: 'Restaurar el panel', maximized: 'Maximizar el panel', minimized: 'Minimizar el panel' })[state],
    close: 'Cerrar',
  },
  'funnel-chart': {
    ...chart,
    datumLabel: (details) => {
      const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
      return details.formatted.previous ? `${head}, ${details.formatted.previous} de la etapa anterior` : head
    },
    nameLabel: 'Etapa',
    valueLabel: 'Valor',
    previousLabel: 'Respecto a la anterior',
    firstLabel: 'Respecto a la primera',
    summary: (model) => {
      if (model.stageCount === 0 || !model.first || !model.last)
        return NO_DATA
      if (model.stageCount === 1)
        return `1 etapa: ${model.first.name} ${model.first.value}.`
      const parts = [`${model.stageCount} etapas, de ${model.first.name} (${model.first.value}) a ${model.last.name} (${model.last.value}).`]
      if (model.overall)
        parts.push(`Conversión global: ${model.overall}.`)
      if (model.steepest)
        parts.push(`Mayor caída: de ${model.steepest.from} a ${model.steepest.to}, se conserva el ${model.steepest.rate}.`)
      return parts.join(' ')
    },
  },
  'graph-chart': {
    ...chart,
    datumLabel: (details) => {
      const parts = [details.seriesName]
      if (details.formatted.value)
        parts.push(details.formatted.value)
      parts.push(`${details.formatted.links ?? '0'} ${details.values.links === 1 ? 'enlace' : 'enlaces'}`)
      return parts.join(', ')
    },
    sourceLabel: 'Origen',
    targetLabel: 'Destino',
    valueLabel: 'Valor',
    linkLabel: 'Etiqueta',
    linksLabel: 'Enlaces',
    incomingLabel: 'Entrantes',
    outgoingLabel: 'Salientes',
    summary: (model) => {
      if (model.nodeCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} ${model.nodeCount === 1 ? 'nodo' : 'nodos'}, ${model.linkCount} ${model.linkCount === 1 ? 'enlace' : 'enlaces'}.`
      return model.hub ? `${head} Nodo más conectado: ${model.hub.name} (${model.hub.degree} ${model.hub.degree === 1 ? 'enlace' : 'enlaces'}).` : head
    },
  },
  'grid-list': { root: 'Elementos' },
  'heatmap': {
    gridLabel: 'Mapa de calor de actividad',
    cellLabel: details => `${details.date}: ${details.count}`,
    matrixCellLabel: details => `${details.row} ${details.column}: ${details.count}`,
    legendLabel: 'Nivel de actividad',
    legendLow: 'Menos',
    legendHigh: 'Más',
  },
  'hierarchy-chart': {
    ...chart,
    datumLabel: (details) => {
      const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
      return details.formatted.parentShare ? `${head}, ${details.formatted.parentShare} de ${details.formatted.parent ?? ''}` : head
    },
    rootLabel: 'Todo',
    pathLabel: 'Ruta',
    nameLabel: 'Ruta',
    valueLabel: 'Valor',
    levelLabel: level => `Nivel ${level}`,
    parentShareLabel: 'Porcentaje del nivel superior',
    rootShareLabel: 'Porcentaje del total',
    summary: (model) => {
      if (model.childCount === 0)
        return NO_DATA
      const head = `${model.root}: ${model.childCount} ${model.childCount === 1 ? 'elemento' : 'elementos'}, total ${model.total}.`
      return model.largest ? `${head} Mayor: ${model.largest.name} ${model.largest.value} (${model.largest.share}).` : head
    },
  },
  'image-cropper': {
    cropArea: 'Área de recorte',
    valueText: rect => `X ${rect.x}, Y ${rect.y}, ancho ${rect.width}, alto ${rect.height}`,
    handleTopLeft: 'Controlador de la esquina superior izquierda',
    handleTop: 'Controlador del borde superior',
    handleTopRight: 'Controlador de la esquina superior derecha',
    handleRight: 'Controlador del borde derecho',
    handleBottomRight: 'Controlador de la esquina inferior derecha',
    handleBottom: 'Controlador del borde inferior',
    handleBottomLeft: 'Controlador de la esquina inferior izquierda',
    handleLeft: 'Controlador del borde izquierdo',
    zoomSlider: 'Zoom',
    rotateSlider: 'Girar',
    flipHorizontal: 'Voltear horizontalmente',
    flipVertical: 'Voltear verticalmente',
  },
  'image-viewer': {
    content: 'Vista previa de la imagen',
    toolbar: 'Herramientas de imagen',
    close: 'Cerrar',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    rotateLeft: 'Girar a la izquierda',
    rotateRight: 'Girar a la derecha',
    flipHorizontal: 'Voltear horizontalmente',
    flipVertical: 'Voltear verticalmente',
    reset: 'Restablecer',
    prev: 'Imagen anterior',
    next: 'Imagen siguiente',
    counter: (index, count) => `${index} / ${count}`,
  },
  'json-viewer': {
    text: 'Código fuente JSON',
    tree: 'JSON',
    root: 'raíz',
    objectPreview: count => `{…} ${count}`,
    arrayPreview: count => `[…] ${count}`,
    collapsedBranchLabel: (name, count) => `${name}, ${count === 1 ? '1 elemento' : `${count} elementos`}`,
    moreItems: count => `… ${count} más`,
    empty: 'Sin datos',
  },
  'kbd': { hotkey: names => names.join(' + ') },
  'loading-bar': { root: 'Cargando' },
  'log': { log: 'Registro', scrollToBottom: 'Desplazarse al final' },
  'markdown-stream': { completed: 'Respuesta completada' },
  'marquee': { autoplayTriggerPause: 'Pausar el desplazamiento', autoplayTriggerPlay: 'Reanudar el desplazamiento' },
  'mention': { content: 'Menciones' },
  'menubar': { root: 'Barra de menús' },
  'message-feed': {
    feed: 'Conversación',
    scrollToBottom: 'Desplazarse al final',
    scrollToBottomUnread: count => (count === 1 ? 'Desplazarse al final, 1 mensaje nuevo' : `Desplazarse al final, ${count} mensajes nuevos`),
    item: (position, size, role) => {
      const who = role == null ? '' : `, ${({ user: 'usuario', assistant: 'asistente', system: 'sistema' })[role]}`
      return size > 0 ? `Mensaje ${position} de ${size}${who}` : `Mensaje ${position}${who}`
    },
  },
  'navigation-menu': { root: 'Navegación principal' },
  'notification': { region: 'Notificaciones', close: 'Cerrar' },
  'pagination': {
    root: 'Paginación',
    firstTrigger: 'Primera página',
    prevTrigger: 'Página anterior',
    nextTrigger: 'Página siguiente',
    lastTrigger: 'Última página',
    item: page => `Página ${page}`,
    ellipsis: count => (count === 1 ? '1 página más' : `${count} páginas más`),
    pageSizeSelect: 'Elementos por página',
    pageSizeOption: size => `${size} / página`,
    summary: (start, end, count) => `${start}-${end} de ${count}`,
    jumper: 'Ir a la página',
  },
  'password-input': {
    visibilityTriggerShow: 'Mostrar contraseña',
    visibilityTriggerHide: 'Ocultar contraseña',
    capsLockOn: 'Bloq Mayús está activado',
    strengthMeter: 'Seguridad de la contraseña',
  },
  'pie-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}, ${details.formatted.value ?? ''}, ${details.formatted.share ?? ''}`,
    centerLabel: 'Total',
    nameLabel: 'Nombre',
    valueLabel: 'Valor',
    shareLabel: 'Porcentaje',
    summary: (model) => {
      const first = model.slices[0]
      const last = model.slices.at(-1)
      if (model.sliceCount === 0 || !first || !last)
        return NO_DATA
      const head = `${model.sliceCount} ${model.sliceCount === 1 ? 'sector' : 'sectores'}, total ${model.total}.`
      if (model.sliceCount === 1)
        return `${head} ${first.name}: ${first.share}.`
      return `${head} Mayor: ${first.name} ${first.share}. Menor: ${last.name} ${last.share}.`
    },
  },
  'pin-input': { input: (index, length) => `Carácter ${index} de ${length}` },
  'popover': { close: 'Cerrar' },
  'progress': { segmentValueText: ({ value, label }) => `${value}, ${label}` },
  'prompt-input': { send: 'Enviar', stop: 'Detener la generación' },
  'question-flow': {
    prompt: 'Pregunta',
    options: 'Opciones',
    note: 'Otra respuesta',
    prev: 'Pregunta anterior',
    next: 'Pregunta siguiente',
    progress: (current, total) => `Pregunta ${current} de ${total}`,
    submitted: 'Respuestas enviadas',
    selectionRange: (min, max) => {
      if (max === undefined)
        return `Elige al menos ${min}`
      if (min === max)
        return `Elige ${min}`
      return min > 1 ? `Elige de ${min} a ${max}` : `Elige hasta ${max}`
    },
  },
  'radar-chart': {
    ...chart,
    nameLabel: 'Nombre',
    summary: (model) => {
      if (model.seriesCount === 0)
        return NO_DATA
      const head = `${model.seriesCount} ${model.seriesCount === 1 ? 'serie' : 'series'} en ${model.indicatorCount} ${model.indicatorCount === 1 ? 'indicador' : 'indicadores'}.`
      const parts = model.series.map((s) => {
        if (!s.highest)
          return `${s.name}: sin valores.`
        return s.lowest
          ? `${s.name}: máximo en ${s.highest.indicator} (${s.highest.value}), mínimo en ${s.lowest.indicator} (${s.lowest.value}).`
          : `${s.name}: ${s.highest.indicator} ${s.highest.value}.`
      })
      return [head, ...parts].join(' ')
    },
  },
  'reasoning': {
    label: 'Proceso de razonamiento',
    thinking: 'Pensando…',
    thinkingFor: 'Pensando durante {seconds} s',
    thoughtFor: 'Ha pensado durante {seconds} s',
  },
  'resizable': { root: 'Área redimensionable', handle: edge => `Cambiar el tamaño desde ${EDGE[edge]}` },
  'sankey-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}, ${details.formatted.value ?? ''}`,
    sourceLabel: 'Origen',
    targetLabel: 'Destino',
    valueLabel: 'Valor',
    inflowLabel: 'Desde',
    outflowLabel: 'Hacia',
    summary: (model) => {
      if (model.linkCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} ${model.nodeCount === 1 ? 'nodo' : 'nodos'}, ${model.linkCount} ${model.linkCount === 1 ? 'flujo' : 'flujos'}, total ${model.total}.`
      return model.largest ? `${head} Mayor flujo: de ${model.largest.source} a ${model.largest.target}, ${model.largest.value}.` : head
    },
  },
  'scrollbar': { thumb: 'Barra de desplazamiento' },
  'select': { ...tagged, clearTrigger: 'Borrar', content: 'Opciones' },
  'side-nav': { root: 'Barra lateral', input: 'Filtrar la navegación', noMatch: 'Sin resultados' },
  'signature-pad': {
    label: 'Firma',
    clearTrigger: 'Borrar la firma',
    undoTrigger: 'Deshacer el último trazo',
    redoTrigger: 'Rehacer el trazo',
    statusEmpty: 'Aún no hay firma',
    statusSigned: 'Firmado',
  },
  'sortable': {
    root: 'Lista ordenable',
    itemDragTrigger: name => `Reordenar ${name}`,
    picked: (name, position, total) => `Se ha levantado ${name}. Posición ${position} de ${total}. Usa las teclas de flecha para mover, Espacio para soltar y Escape para cancelar.`,
    moved: (_name, position, total) => `Se ha movido a la posición ${position} de ${total}.`,
    dropped: (name, position) => `Se ha soltado ${name} en la posición ${position}.`,
    canceled: (name, position) => `Ordenación cancelada. ${name} ha vuelto a la posición ${position}.`,
    movedToList: (listName, listPosition, listTotal, position, total) =>
      `Se ha movido a ${listName}, lista ${listPosition} de ${listTotal}. Posición ${position} de ${total}.`,
    droppedInList: (name, listName, listPosition, position) => `Se ha soltado ${name} en ${listName}, lista ${listPosition}, en la posición ${position}.`,
  },
  'sparkline': {
    summary: (model) => {
      if (model.count === 0)
        return NO_DATA
      if (model.variant === 'win-loss') {
        const parts = [`${model.wins} ${model.wins === 1 ? 'victoria' : 'victorias'}`, `${model.losses} ${model.losses === 1 ? 'derrota' : 'derrotas'}`]
        if (model.ties > 0)
          parts.push(`${model.ties} ${model.ties === 1 ? 'empate' : 'empates'}`)
        return `${model.count} ${model.count === 1 ? 'resultado' : 'resultados'}: ${parts.join(', ')}.`
      }
      const reference = model.reference == null ? '' : ` Referencia: ${model.reference}.`
      if (model.count === 1)
        return `1 punto: ${model.last}.${reference}`
      const range = model.min === model.max ? `todos con valor ${model.max}` : `entre ${model.min} y ${model.max}`
      const head = `${model.count} puntos, ${range}.${reference}`
      if (model.direction === 'flat')
        return `${head} Último valor: ${model.last}, sin cambios respecto al primero.`
      if (model.change == null)
        return `${head} Último valor: ${model.last}.`
      return `${head} Último valor: ${model.last}, ${model.direction === 'up' ? 'un aumento' : 'un descenso'} del ${model.change} respecto al primero.`
    },
  },
  'spinner': { label: 'Cargando' },
  'splitter': { root: 'Paneles divididos', resizeTrigger: index => `Cambiar el tamaño del panel ${index + 1}` },
  'steps': { progressLabel: 'Progreso de los pasos', progressValueText: percent => `${percent}% completado` },
  'table': {
    ...drag,
    sort: column => `Ordenar por ${column}`,
    columnResize: column => `Cambiar el tamaño de la columna ${column}`,
    columnDrag: column => `Reordenar la columna ${column}`,
    selectAll: 'Seleccionar todas las filas',
    toolbar: 'Barra de herramientas de la tabla',
    columnList: 'Configuración de columnas',
    columnVisibility: column => `Mostrar la columna ${column}`,
  },
  'tabs': { ...drag, overflowTrigger: 'Más pestañas' },
  'tag': { close: 'Eliminar' },
  'tag-group': { deleteItem: label => `Eliminar ${label}`, list: 'Etiquetas' },
  'tags-input': { deleteItem: value => `Eliminar ${value}`, editTagInput: value => `Editar ${value}`, clearTrigger: 'Borrar' },
  'text-field': { clearTrigger: 'Borrar' },
  'time-field': { ...segments, clearTrigger: 'Borrar' },
  'time-picker': { ...tagged, ...segments, presets: 'Accesos directos', clearTrigger: 'Borrar' },
  'time-range-picker': { ...segments, startTime: 'Hora de inicio', endTime: 'Hora de fin', presets: 'Accesos directos', clearTrigger: 'Borrar' },
  'timer': {
    time: ({ days, hours, minutes, seconds }) =>
      `${days > 0 ? `${days} ${days === 1 ? 'día' : 'días'} ` : ''}${hours} ${hours === 1 ? 'hora' : 'horas'} ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} ${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`,
    start: 'Iniciar',
    pause: 'Pausar',
    resume: 'Reanudar',
    reset: 'Restablecer',
  },
  'tool-call': {
    inputStreaming: 'Preparando…',
    inputAvailable: 'Ejecutando…',
    awaitingApproval: 'Esperando aprobación',
    outputAvailable: 'Completado',
    outputError: 'Error',
  },
  'toolbar': { overflowTrigger: 'Más' },
  'tour': { close: 'Cerrar', progress: (step, count) => `Paso ${step} de ${count}` },
  'transfer': { toTarget: 'Mover a la lista de destino', toSource: 'Mover a la lista de origen' },
  'tree': drag,
  'tree-select': {
    ...tagged,
    tree: 'Opciones en árbol',
    clearTrigger: 'Borrar',
    empty: 'Sin datos',
    loading: 'Cargando',
    branchError: 'No se pudieron cargar los elementos secundarios',
    retry: 'Reintentar',
    branchEmpty: 'Sin elementos secundarios',
    searchInput: 'Buscar',
    noMatch: 'Sin resultados',
  },
  'truncate': { expand: 'Mostrar más', collapse: 'Mostrar menos' },
} satisfies XhLocaleTranslations

/** Español。 */
export const esES: XhLocale = { locale: 'es-ES', translations }
