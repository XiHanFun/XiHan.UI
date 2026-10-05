/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 葡萄牙语（巴西）语言包。

import type { ChartDatumDetails } from '../shared/chart/types'
import type { KeyTextTable } from './key-text'
import type { XhLocale, XhLocaleTranslations } from './types'
import { keyText } from './key-text'

/** 读屏念的键名：修饰键在 Mac 与其余平台上叫法不同。 */
const KEY_NAME: KeyTextTable = {
  'Alt': { mac: 'Option', other: 'Alt' },
  'Control': { mac: 'Control', other: 'Ctrl' },
  'Meta': { mac: 'Command', other: 'Windows' },
  'Shift': 'Shift',
  ' ': 'Espaço',
  'ArrowDown': 'Seta para baixo',
  'ArrowLeft': 'Seta para a esquerda',
  'ArrowRight': 'Seta para a direita',
  'ArrowUp': 'Seta para cima',
  'Backspace': 'Backspace',
  'Delete': 'Delete',
  'Enter': 'Enter',
  'Escape': 'Esc',
  'Tab': 'Tab',
}

/** 键帽上写的字：Mac 用系统符号。 */
const KEY_LABEL: KeyTextTable = {
  'Alt': { mac: '⌥', other: 'Alt' },
  'Control': { mac: '⌃', other: 'Ctrl' },
  'Meta': { mac: '⌘', other: 'Win' },
  'Shift': { mac: '⇧', other: 'Shift' },
  ' ': 'Espaço',
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
  n: 'borda superior',
  s: 'borda inferior',
  e: 'borda direita',
  w: 'borda esquerda',
  ne: 'canto superior direito',
  nw: 'canto superior esquerdo',
  se: 'canto inferior direito',
  sw: 'canto inferior esquerdo',
} as const

const COLOR_CHANNEL = {
  hue: 'Matiz',
  saturation: 'Saturação',
  brightness: 'Brilho',
  alpha: 'Opacidade',
  red: 'Vermelho',
  green: 'Verde',
  blue: 'Azul',
} as const

const COLOR_UNIT = { hue: '°', saturation: '%', brightness: '%', alpha: '%', red: '', green: '', blue: '' } as const

const tagged = {
  deleteItem: (label: string) => `Remover ${label}`,
  overflowTag: (count: number) => `+${count}`,
}

const segments = { hour: 'hora', minute: 'minuto', second: 'segundo', dayPeriod: 'manhã/tarde' }

const calendar = { todayDate: (date: string) => `Hoje, ${date}` }

const rangeCalendar = {
  ...calendar,
  startRangeSelectionPrompt: 'Clique para começar a selecionar o intervalo de datas',
  finishRangeSelectionPrompt: 'Clique para concluir a seleção do intervalo de datas',
  selectedRange: (start: string, end: string) => `Intervalo selecionado: ${start} a ${end}`,
}

const drag = {
  moved: (name: string, position: number, total: number) => `${name} agora está na posição ${position} de ${total}.`,
  dropped: (name: string, position: number) => `${name} ficou na posição ${position}.`,
  canceled: (name: string, position: number) => `Movimentação cancelada. ${name} voltou à posição ${position}.`,
  rejected: (name: string) => `Não é possível soltar ${name} aqui.`,
  movedInto: (name: string, into: string, position: number, total: number) => `${name} agora está em ${into}, na posição ${position} de ${total}.`,
  droppedInto: (name: string, into: string, position: number) => `${name} ficou em ${into}, na posição ${position}.`,
  canceledInto: (name: string, into: string, position: number) => `Movimentação cancelada. ${name} voltou à posição ${position} em ${into}.`,
  rootLevel: 'primeiro nível',
}

const chart = {
  chartRoleDescription: 'gráfico',
  seriesRoleDescription: 'série',
  legendLabel: 'Legenda',
  missingValue: 'Sem valor',
  emptyText: 'Nenhum dado',
  loadingText: 'Carregando…',
  otherLabel: 'Outros',
  tableCaption: 'Tabela de dados',
  datumLabel: (details: ChartDatumDetails) =>
    `${details.formatted.key ?? String(details.key)}, ${details.seriesName} ${details.formatted.value ?? ''}`,
}

const NO_DATA = 'Nenhum dado.'

const translations = {
  'alert': { close: 'Fechar' },
  'anchor': { root: 'Navegação por âncoras' },
  'approval': {
    scopes: 'Permissões',
    note: 'Observação',
    reason: 'Motivo da recusa',
    pending: 'Aguardando sua decisão',
    approved: 'Aprovado',
    denied: 'Recusado',
    expired: 'Expirado, considerado recusado',
  },
  'back-top': { trigger: 'Voltar ao topo' },
  'breadcrumb': { root: 'Trilha de navegação', ellipsis: 'Mostrar caminho completo' },
  'calendar-picker': calendar,
  'calendar-range-picker': rangeCalendar,
  'carousel': {
    root: 'Carrossel',
    rootRoleDescription: 'carrossel',
    itemRoleDescription: 'slide',
    prevTrigger: 'Slide anterior',
    nextTrigger: 'Próximo slide',
    autoplayTriggerPlay: 'Iniciar reprodução automática dos slides',
    autoplayTriggerPause: 'Parar reprodução automática dos slides',
    indicatorGroup: 'Escolher o slide a exibir',
    indicator: page => `Ir para o slide ${page}`,
    item: (index, count) => `${index} de ${count}`,
  },
  'cartesian-chart': {
    ...chart,
    keyLabel: 'Categoria',
    seriesLabel: 'Série',
    valueLabel: 'Valor',
    sizeLabel: 'Tamanho',
    colorLabel: 'Cor',
    referenceLabel: 'Referência',
    averageLabel: 'Média',
    ohlcLabel: ({ open, high, low, close }) => `Abertura ${open}, Máxima ${high}, Mínima ${low}, Fechamento ${close}`,
    ohlcColumns: { open: 'Abertura', high: 'Máxima', low: 'Mínima', close: 'Fechamento' },
    boxLabel: ({ min, q1, median, q3, max }) => `Mínimo ${min}, Q1 ${q1}, Mediana ${median}, Q3 ${q3}, Máximo ${max}`,
    boxColumns: { min: 'Mínimo', q1: 'Q1', median: 'Mediana', q3: 'Q3', max: 'Máximo', outliers: 'Valores atípicos' },
    zoomLabel: 'Zoom',
    zoomStartLabel: 'Início da janela',
    zoomEndLabel: 'Fim da janela',
    aggregatedCaption: ({ caption, rows, ranges }) => `${caption} (${rows} linhas em ${ranges} intervalos)`,
    annotationSummary: items => items.map(item => `${item.label}${item.series ? ` (${item.series})` : ''}: ${item.value}.`).join(' '),
    summary: (model) => {
      if (!model.range || model.series.every(s => s.count === 0))
        return NO_DATA
      const { first, last, count } = model.range
      const head = `${model.seriesCount} ${model.seriesCount === 1 ? 'série' : 'séries'}, ${count} ${count === 1 ? 'ponto' : 'pontos'} de ${first} a ${last}.`
      const lines = model.series.flatMap((s) => {
        if (!s.min || !s.max)
          return []
        if (s.min.key === s.max.key && s.min.value === s.max.value)
          return `${s.name}: ${s.max.value} em ${s.max.key}.`
        return `${s.name}: mínimo de ${s.min.value} em ${s.min.key}, máximo de ${s.max.value} em ${s.max.key}.`
      })
      return [head, ...lines].join(' ')
    },
  },
  'cascader': {
    ...tagged,
    empty: 'Nenhum dado',
    noMatch: 'Nenhum resultado',
    loading: 'Carregando',
    branchError: 'Não foi possível carregar os subitens',
    retry: 'Tentar novamente',
    column: 'Opções',
    searchInput: 'Pesquisar',
    searchList: 'Resultados da pesquisa',
    clearTrigger: 'Limpar',
  },
  'citation': {
    sources: 'Fontes',
    preview: 'Visualização da fonte',
    closePreview: 'Fechar visualização da fonte',
    openSource: title => `Abrir ${title}`,
    citation: (index, title) => `Fonte ${index}: ${title}`,
    citations: indexes => `Fontes ${indexes.join(', ')}`,
    previousSource: 'Fonte anterior',
    nextSource: 'Próxima fonte',
    source: (index, title) => `Fonte ${index}: ${title}`,
    document: 'Documento',
    previewLinkSource: 'Abrir fonte',
    previewLinkDocument: 'Abrir documento',
  },
  'clipboard': { copied: 'Copiado' },
  'code-view': {
    code: 'Código',
    expand: 'Expandir código',
    collapse: 'Recolher código',
    foldBlock: (first, last) => (first === last ? `Linha ${first}` : `Linhas ${first}–${last}`),
  },
  'color-field': { clearTrigger: 'Limpar' },
  'color-picker': {
    ...tagged,
    area: 'Saturação e brilho',
    areaValueText: (saturation, brightness) => `Saturação ${saturation}%, brilho ${brightness}%`,
    channel: channel => COLOR_CHANNEL[channel],
    channelValueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
    input: channel => ({ hex: 'Hex', r: 'Vermelho', g: 'Verde', b: 'Azul', a: 'Opacidade' })[channel],
    swatch: value => `Cor ${value}`,
    swatchGroup: 'Amostras de cores',
    recentSwatchGroup: 'Cores recentes',
    eyeDropperTrigger: 'Selecionar uma cor da tela',
  },
  'color-slider': {
    label: channel => COLOR_CHANNEL[channel],
    valueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
  },
  'color-swatch-picker': { group: 'Amostras de cores', swatch: value => `Cor ${value}` },
  'combobox': { ...tagged, trigger: 'Mostrar sugestões', clearTrigger: 'Limpar' },
  'command': { title: 'Paleta de comandos', input: 'Pesquisar comandos', list: 'Comandos' },
  'context-menu': { content: 'Menu de contexto' },
  'date-field': {
    ...segments,
    year: 'ano',
    quarter: 'trimestre',
    month: 'mês',
    week: 'semana do ano',
    day: 'dia',
    clearTrigger: 'Limpar',
  },
  'date-picker': { ...tagged, ...segments, ...calendar, presets: 'Atalhos', clearTrigger: 'Limpar' },
  'date-range-picker': {
    ...segments,
    ...rangeCalendar,
    startDate: 'Data de início',
    endDate: 'Data de término',
    startTime: 'Hora de início',
    endTime: 'Hora de término',
    presets: 'Atalhos',
    clearTrigger: 'Limpar',
  },
  'dialog': {
    close: 'Fechar',
    dragTrigger: 'Mover caixa de diálogo',
    ok: 'OK',
    cancel: 'Cancelar',
    actionError: 'A ação falhou. Tente novamente.',
  },
  'diff-view': {
    added: 'Adicionado',
    removed: 'Removido',
    unchanged: 'Inalterado',
    expandGap: count => (count === 1 ? 'Mostrar 1 linha oculta' : `Mostrar ${count} linhas ocultas`),
    diff: 'Diferenças',
    noChanges: 'Nenhuma alteração',
    truncated: count =>
      count === 1
        ? 'Mais 1 linha foi truncada e não é exibida'
        : `Mais ${count} linhas foram truncadas e não são exibidas`,
    commentOn: (line, side) => `Comentar na linha ${line} da versão ${side === 'old' ? 'antiga' : 'nova'}`,
  },
  'drawer': { close: 'Fechar', resizeTrigger: 'Redimensionar gaveta' },
  'field-array': {
    deleteItem: (index, count) => `Remover linha ${index} de ${count}`,
    moveUpTrigger: (index, count) => `Mover linha ${index} de ${count} para cima`,
    moveDownTrigger: (index, count) => `Mover linha ${index} de ${count} para baixo`,
  },
  'file-upload': {
    dropzone: 'Solte os arquivos aqui',
    deleteItem: file => `Remover ${file.name}`,
    clearTrigger: 'Limpar todos os arquivos',
  },
  'float-button': { trigger: 'Ações' },
  'floating-panel': {
    dragTrigger: 'Mover painel',
    resizeTrigger: edge => `Redimensionar ${EDGE[edge]}`,
    resizeValueText: size => `Largura ${Math.round(size.width)}, altura ${Math.round(size.height)}`,
    windowStateTrigger: state => ({ default: 'Restaurar painel', maximized: 'Maximizar painel', minimized: 'Minimizar painel' })[state],
    close: 'Fechar',
  },
  'form': {
    required: '{name} é obrigatório',
    type: {
      string: '{name} deve ser um texto',
      number: '{name} deve ser um número',
      integer: '{name} deve ser um número inteiro',
      email: '{name} não é um e-mail válido',
      url: '{name} não é uma URL válida',
      array: '{name} deve ser uma lista',
    },
    minLength: '{name} deve ter pelo menos {min} caracteres',
    maxLength: '{name} não pode ter mais de {max} caracteres',
    minNumber: '{name} deve ser no mínimo {min}',
    maxNumber: '{name} deve ser no máximo {max}',
    pattern: '{name} não corresponde ao formato exigido',
  },
  'funnel-chart': {
    ...chart,
    datumLabel: (details) => {
      const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
      return details.formatted.previous ? `${head}, ${details.formatted.previous} da etapa anterior` : head
    },
    nameLabel: 'Etapa',
    valueLabel: 'Valor',
    previousLabel: 'Da etapa anterior',
    firstLabel: 'Da primeira etapa',
    summary: (model) => {
      if (model.stageCount === 0 || !model.first || !model.last)
        return NO_DATA
      if (model.stageCount === 1)
        return `1 etapa: ${model.first.name} ${model.first.value}.`
      const parts = [`${model.stageCount} etapas, de ${model.first.name} (${model.first.value}) a ${model.last.name} (${model.last.value}).`]
      if (model.overall)
        parts.push(`Conversão geral de ${model.overall}.`)
      if (model.steepest)
        parts.push(`Maior queda: de ${model.steepest.from} para ${model.steepest.to}, com retenção de ${model.steepest.rate}.`)
      return parts.join(' ')
    },
  },
  'graph-chart': {
    ...chart,
    datumLabel: (details) => {
      const parts = [details.seriesName]
      if (details.formatted.value)
        parts.push(details.formatted.value)
      parts.push(`${details.formatted.links ?? '0'} ${details.values.links === 1 ? 'conexão' : 'conexões'}`)
      return parts.join(', ')
    },
    sourceLabel: 'Origem',
    targetLabel: 'Destino',
    valueLabel: 'Valor',
    linkLabel: 'Rótulo',
    linksLabel: 'Conexões',
    incomingLabel: 'Entrada',
    outgoingLabel: 'Saída',
    summary: (model) => {
      if (model.nodeCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} ${model.nodeCount === 1 ? 'nó' : 'nós'}, ${model.linkCount} ${model.linkCount === 1 ? 'conexão' : 'conexões'}.`
      return model.hub ? `${head} Nó mais conectado: ${model.hub.name} (${model.hub.degree} ${model.hub.degree === 1 ? 'conexão' : 'conexões'}).` : head
    },
  },
  'grid-list': { root: 'Itens' },
  'heatmap': {
    gridLabel: 'Mapa de calor de atividade',
    cellLabel: details => `${details.date}: ${details.count}`,
    matrixCellLabel: details => `${details.row} ${details.column}: ${details.count}`,
    legendLabel: 'Nível de atividade',
    legendLow: 'Menos',
    legendHigh: 'Mais',
  },
  'hierarchy-chart': {
    ...chart,
    chartRoleDescription: 'gráfico em árvore',
    datumLabel: (details) => {
      const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
      return details.formatted.parentShare ? `${head}, ${details.formatted.parentShare} de ${details.formatted.parent ?? ''}` : head
    },
    rootLabel: 'Tudo',
    pathLabel: 'Caminho',
    nameLabel: 'Caminho',
    valueLabel: 'Valor',
    levelLabel: level => `Nível ${level}`,
    parentShareLabel: '% do pai',
    rootShareLabel: '% do total',
    summary: (model) => {
      if (model.childCount === 0)
        return NO_DATA
      const head = `${model.root}: ${model.childCount} ${model.childCount === 1 ? 'item' : 'itens'}, total de ${model.total}.`
      return model.largest ? `${head} Maior: ${model.largest.name} ${model.largest.value} (${model.largest.share}).` : head
    },
  },
  'image-cropper': {
    cropArea: 'Área de corte',
    valueText: rect => `X ${rect.x}, Y ${rect.y}, largura ${rect.width}, altura ${rect.height}`,
    handleTopLeft: 'Alça do canto superior esquerdo',
    handleTop: 'Alça da borda superior',
    handleTopRight: 'Alça do canto superior direito',
    handleRight: 'Alça da borda direita',
    handleBottomRight: 'Alça do canto inferior direito',
    handleBottom: 'Alça da borda inferior',
    handleBottomLeft: 'Alça do canto inferior esquerdo',
    handleLeft: 'Alça da borda esquerda',
    zoomSlider: 'Zoom',
    rotateSlider: 'Girar',
    flipHorizontal: 'Inverter horizontalmente',
    flipVertical: 'Inverter verticalmente',
  },
  'image-viewer': {
    content: 'Visualização da imagem',
    toolbar: 'Ferramentas de imagem',
    close: 'Fechar',
    zoomIn: 'Ampliar',
    zoomOut: 'Reduzir',
    rotateLeft: 'Girar para a esquerda',
    rotateRight: 'Girar para a direita',
    flipHorizontal: 'Inverter horizontalmente',
    flipVertical: 'Inverter verticalmente',
    reset: 'Redefinir',
    prev: 'Imagem anterior',
    next: 'Próxima imagem',
    counter: (index, count) => `${index} / ${count}`,
  },
  'json-viewer': {
    text: 'Código-fonte JSON',
    tree: 'JSON',
    root: 'raiz',
    objectPreview: count => `{…} ${count}`,
    arrayPreview: count => `[…] ${count}`,
    collapsedBranchLabel: (name, count) => `${name}, ${count === 1 ? '1 item' : `${count} itens`}`,
    moreItems: count => `… mais ${count}`,
    empty: 'Nenhum dado',
  },
  'kbd': {
    keyName: (key, platform) => keyText(KEY_NAME, key, platform),
    keyLabel: (key, platform) => keyText(KEY_LABEL, key, platform),
    hotkey: names => names.join(' + '),
  },
  'loading-bar': { root: 'Carregando' },
  'log': { log: 'Log', scrollToBottom: 'Rolar até o fim' },
  'markdown-stream': { completed: 'Resposta concluída' },
  'marquee': { autoplayTriggerPause: 'Pausar rolagem', autoplayTriggerPlay: 'Retomar rolagem' },
  'mention': { content: 'Menções', empty: 'Nenhum resultado' },
  'menubar': { root: 'Barra de menus' },
  'message-feed': {
    feed: 'Conversa',
    scrollToBottom: 'Rolar até o fim',
    scrollToBottomUnread: count => (count === 1 ? 'Rolar até o fim, 1 nova mensagem' : `Rolar até o fim, ${count} novas mensagens`),
    item: (position, size, role) => {
      const who = role == null ? '' : `, ${({ user: 'usuário', assistant: 'assistente', system: 'sistema' })[role]}`
      return size > 0 ? `Mensagem ${position} de ${size}${who}` : `Mensagem ${position}${who}`
    },
  },
  'navigation-menu': { root: 'Navegação principal' },
  'notification': { region: 'Notificações', close: 'Fechar' },
  'pagination': {
    root: 'Paginação',
    firstTrigger: 'Primeira página',
    prevTrigger: 'Página anterior',
    nextTrigger: 'Próxima página',
    lastTrigger: 'Última página',
    item: page => `Página ${page}`,
    ellipsis: count => (count === 1 ? 'Mais 1 página' : `Mais ${count} páginas`),
    pageSizeSelect: 'Itens por página',
    pageSizeOption: size => `${size} / página`,
    summary: (start, end, count) => `${start}-${end} de ${count}`,
    jumper: 'Ir para a página',
  },
  'password-input': {
    visibilityTriggerShow: 'Mostrar senha',
    visibilityTriggerHide: 'Ocultar senha',
    capsLockOn: 'Caps Lock ativado',
    strengthMeter: 'Força da senha',
  },
  'pie-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}, ${details.formatted.value ?? ''}, ${details.formatted.share ?? ''}`,
    centerLabel: 'Total',
    nameLabel: 'Nome',
    valueLabel: 'Valor',
    shareLabel: 'Proporção',
    summary: (model) => {
      const first = model.slices[0]
      const last = model.slices.at(-1)
      if (model.sliceCount === 0 || !first || !last)
        return NO_DATA
      const head = `${model.sliceCount} ${model.sliceCount === 1 ? 'fatia' : 'fatias'}, total de ${model.total}.`
      if (model.sliceCount === 1)
        return `${head} ${first.name}: ${first.share}.`
      return `${head} Maior: ${first.name} ${first.share}. Menor: ${last.name} ${last.share}.`
    },
  },
  'pin-input': { input: (index, length) => `Caractere ${index} de ${length}` },
  'popover': { close: 'Fechar' },
  'progress': { segmentValueText: ({ value, label }) => `${value}, ${label}` },
  'prompt-input': { send: 'Enviar', stop: 'Parar geração' },
  'question-flow': {
    prompt: 'Pergunta',
    options: 'Opções',
    note: 'Outra resposta',
    prev: 'Pergunta anterior',
    next: 'Próxima pergunta',
    progress: (current, total) => `Pergunta ${current} de ${total}`,
    submitted: 'Respostas enviadas',
    selectionRange: (min, max) => {
      if (max === undefined)
        return `Escolha pelo menos ${min}`
      if (min === max)
        return `Escolha ${min}`
      return min > 1 ? `Escolha de ${min} a ${max}` : `Escolha até ${max}`
    },
  },
  'radar-chart': {
    ...chart,
    nameLabel: 'Nome',
    summary: (model) => {
      if (model.seriesCount === 0)
        return NO_DATA
      const head = `${model.seriesCount} ${model.seriesCount === 1 ? 'série' : 'séries'} em ${model.indicatorCount} ${model.indicatorCount === 1 ? 'indicador' : 'indicadores'}.`
      const parts = model.series.map((s) => {
        if (!s.highest)
          return `${s.name}: sem valores.`
        return s.lowest
          ? `${s.name}: máximo em ${s.highest.indicator} (${s.highest.value}), mínimo em ${s.lowest.indicator} (${s.lowest.value}).`
          : `${s.name}: ${s.highest.indicator} ${s.highest.value}.`
      })
      return [head, ...parts].join(' ')
    },
  },
  'reasoning': {
    label: 'Raciocínio',
    thinking: 'Pensando…',
    thinkingFor: 'Pensando há {seconds}s',
    thoughtFor: 'Pensou por {seconds}s',
  },
  'resizable': { root: 'Área redimensionável', handle: edge => `Redimensionar ${EDGE[edge]}` },
  'sankey-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}, ${details.formatted.value ?? ''}`,
    sourceLabel: 'Origem',
    targetLabel: 'Destino',
    valueLabel: 'Valor',
    inflowLabel: 'De',
    outflowLabel: 'Para',
    summary: (model) => {
      if (model.linkCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} ${model.nodeCount === 1 ? 'nó' : 'nós'}, ${model.linkCount} ${model.linkCount === 1 ? 'fluxo' : 'fluxos'}, total de ${model.total}.`
      return model.largest ? `${head} Maior fluxo: de ${model.largest.source} para ${model.largest.target}, ${model.largest.value}.` : head
    },
  },
  'scrollbar': { thumb: 'Barra de rolagem' },
  'select': { ...tagged, clearTrigger: 'Limpar', content: 'Opções' },
  'side-nav': { root: 'Barra lateral', input: 'Filtrar navegação', noMatch: 'Nenhum resultado' },
  'signature-pad': {
    label: 'Assinatura',
    clearTrigger: 'Limpar assinatura',
    undoTrigger: 'Desfazer último traço',
    redoTrigger: 'Refazer traço',
    statusEmpty: 'Nenhuma assinatura ainda',
    statusSigned: 'Assinado',
  },
  'sortable': {
    root: 'Lista ordenável',
    itemDragTrigger: name => `Reordenar ${name}`,
    itemDragTriggerRoleDescription: 'item ordenável',
    picked: (name, position, total) =>
      `Arrastando ${name}. Posição ${position} de ${total}. Use as teclas de seta para mover, Espaço para soltar e Esc para cancelar.`,
    moved: (_name, position, total) => `Agora na posição ${position} de ${total}.`,
    dropped: (name, position) => `${name} ficou na posição ${position}.`,
    canceled: (name, position) => `Ordenação cancelada. ${name} voltou à posição ${position}.`,
    movedToList: (listName, listPosition, listTotal, position, total) =>
      `Agora em ${listName}, lista ${listPosition} de ${listTotal}. Posição ${position} de ${total}.`,
    droppedInList: (name, listName, listPosition, position) => `${name} ficou em ${listName}, lista ${listPosition}, na posição ${position}.`,
  },
  'sparkline': {
    summary: (model) => {
      if (model.count === 0)
        return NO_DATA
      if (model.variant === 'win-loss') {
        const parts = [`${model.wins} ${model.wins === 1 ? 'vitória' : 'vitórias'}`, `${model.losses} ${model.losses === 1 ? 'derrota' : 'derrotas'}`]
        if (model.ties > 0)
          parts.push(`${model.ties} ${model.ties === 1 ? 'empate' : 'empates'}`)
        return `${model.count} ${model.count === 1 ? 'resultado' : 'resultados'}: ${parts.join(', ')}.`
      }
      const reference = model.reference == null ? '' : ` Referência: ${model.reference}.`
      if (model.count === 1)
        return `1 ponto: ${model.last}.${reference}`
      const range = model.min === model.max ? `todos iguais a ${model.max}` : `variando de ${model.min} a ${model.max}`
      const head = `${model.count} pontos, ${range}.${reference}`
      if (model.direction === 'flat')
        return `${head} Último: ${model.last}, igual ao primeiro.`
      if (model.change == null)
        return `${head} Último: ${model.last}.`
      return `${head} Último: ${model.last}, ${model.direction === 'up' ? 'alta' : 'queda'} de ${model.change} em relação ao primeiro.`
    },
  },
  'spinner': { label: 'Carregando' },
  'splitter': { root: 'Painéis divididos', resizeTrigger: index => `Redimensionar painel ${index + 1}` },
  'steps': { progressLabel: 'Progresso das etapas', progressValueText: percent => `${percent}% concluído` },
  'table': {
    ...drag,
    sort: column => `Ordenar por ${column}`,
    columnResize: column => `Redimensionar coluna ${column}`,
    columnDrag: column => `Reordenar coluna ${column}`,
    columnDragRoleDescription: 'coluna arrastável',
    selectAll: 'Selecionar todas as linhas',
    toolbar: 'Barra de ferramentas da tabela',
    columnList: 'Configurações de colunas',
    columnVisibility: column => `Mostrar coluna ${column}`,
  },
  'tabs': { ...drag, overflowTrigger: 'Mais guias' },
  'tag': { close: 'Remover' },
  'tag-group': { deleteItem: label => `Remover ${label}`, list: 'Tags' },
  'tags-input': { deleteItem: value => `Remover ${value}`, editTagInput: value => `Editar ${value}`, clearTrigger: 'Limpar' },
  'text-field': { clearTrigger: 'Limpar' },
  'time-field': { ...segments, clearTrigger: 'Limpar' },
  'time-picker': { ...tagged, ...segments, presets: 'Atalhos', clearTrigger: 'Limpar' },
  'time-range-picker': { ...segments, startTime: 'Hora de início', endTime: 'Hora de término', presets: 'Atalhos', clearTrigger: 'Limpar' },
  'timer': {
    time: ({ days, hours, minutes, seconds }) => {
      const unit = (value: number, one: string, many: string): string => `${value} ${value === 1 ? one : many}`
      return `${days > 0 ? `${unit(days, 'dia', 'dias')} ` : ''}${unit(hours, 'hora', 'horas')} ${unit(minutes, 'minuto', 'minutos')} ${unit(seconds, 'segundo', 'segundos')}`
    },
    start: 'Iniciar',
    pause: 'Pausar',
    resume: 'Retomar',
    reset: 'Redefinir',
  },
  'tool-call': {
    inputStreaming: 'Preparando…',
    inputAvailable: 'Executando…',
    awaitingApproval: 'Aguardando aprovação',
    outputAvailable: 'Concluído',
    outputError: 'Falhou',
  },
  'toolbar': { overflowTrigger: 'Mais' },
  'tour': { close: 'Fechar', progress: (step, count) => `Etapa ${step} de ${count}` },
  'transfer': { toTarget: 'Mover para a lista de destino', toSource: 'Mover para a lista de origem' },
  'tree': drag,
  'tree-select': {
    ...tagged,
    tree: 'Opções em árvore',
    clearTrigger: 'Limpar',
    empty: 'Nenhum dado',
    loading: 'Carregando',
    branchError: 'Não foi possível carregar os subitens',
    retry: 'Tentar novamente',
    branchEmpty: 'Nenhum subitem',
    searchInput: 'Pesquisar',
    noMatch: 'Nenhum resultado',
  },
  'truncate': { expand: 'Mostrar mais', collapse: 'Mostrar menos' },
} satisfies XhLocaleTranslations

/** Português (Brasil)。 */
export const ptBR: XhLocale = { locale: 'pt-BR', translations }
