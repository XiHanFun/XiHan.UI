/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器零件的巴西葡萄牙语文案。

import type { XhConfig } from '@xihan-ui/web-components'
import type { DesignerShellLocaleTranslations } from './types'

const translations: DesignerShellLocaleTranslations = {
  'xh-designer-properties': {
    title: 'Propriedades',
    empty: 'Nenhuma propriedade para editar',
    mixed: 'Vários valores',
    invalidJson: 'JSON inválido',
    notInteger: 'Deve ser um número inteiro',
    belowMinimum: min => `Deve ser no mínimo ${min}`,
    aboveMaximum: max => `Deve ser no máximo ${max}`,
    notAboveMinimum: min => `Deve ser maior que ${min}`,
    invalidDataField: 'Caminho de campo inválido',
    sidesLinked: 'Igual nos quatro lados',
    sides: { all: 'Quatro lados', top: 'Superior', right: 'Direita', bottom: 'Inferior', left: 'Esquerda' },
    sidesIncomplete: 'Preencha os quatro lados',
    customColor: 'Cor personalizada',
  },
  'xh-designer-issues': {
    title: 'Problemas',
    empty: 'Nenhum problema',
    errors: count => `${count} ${count === 1 ? 'erro' : 'erros'}`,
    warnings: count => `${count} ${count === 1 ? 'aviso' : 'avisos'}`,
    severityError: 'Erro',
    severityWarning: 'Aviso',
    filter: 'Mostrar problemas por gravidade',
    noTarget: 'Geral',
  },
  'xh-designer-palette': {
    title: 'Elementos',
    search: 'Pesquisar elementos',
    noMatches: 'Nenhum elemento correspondente',
    empty: 'Nenhum elemento',
  },
  'xh-designer-ruler': {
    horizontalGuide: value => `Guia horizontal em ${value}`,
    verticalGuide: value => `Guia vertical em ${value}`,
  },
  'xh-designer-frame': {
    layout: 'Layout do designer',
    resize: label => `Redimensionar ${label}`,
    closePanel: label => `Fechar ${label}`,
    panelHelp: label => `Sobre ${label}`,
  },
  'xh-designer-settings': {
    title: 'Configurações',
    sections: 'Seções de configurações',
    locked: 'Gerenciado pelo aplicativo host',
    general: 'Geral',
    theme: 'Tema',
    themeHint: 'Vale apenas para este designer, não para o restante da página.',
    themeFollow: 'Seguir a página',
    themeSystem: 'Seguir o sistema',
    themeLight: 'Claro',
    themeDark: 'Escuro',
    brand: 'Cor de destaque',
    brandHint: 'A cor dos botões, da seleção e dos destaques neste designer.',
    statusBar: 'Barra de status',
    statusBarHint: 'Mostrar a barra de status na parte inferior do designer.',
    language: 'Idioma',
    languageHint: 'Deixe vazio para seguir a página.',
  },
  'xh-designer-commands': {
    toolbar: 'Ações do designer',
    undo: 'Desfazer',
    redo: 'Refazer',
    cut: 'Recortar',
    copy: 'Copiar',
    paste: 'Colar',
    duplicate: 'Duplicar',
    delete: 'Excluir',
    selectAll: 'Selecionar tudo',
    alignLeft: 'Alinhar à esquerda',
    alignCenter: 'Centralizar horizontalmente',
    alignRight: 'Alinhar à direita',
    alignTop: 'Alinhar na parte superior',
    alignMiddle: 'Centralizar verticalmente',
    alignBottom: 'Alinhar na parte inferior',
    distributeHorizontal: 'Distribuir horizontalmente',
    distributeVertical: 'Distribuir verticalmente',
    bringToFront: 'Trazer para a frente',
    bringForward: 'Avançar uma camada',
    sendBackward: 'Recuar uma camada',
    sendToBack: 'Enviar para trás',
    zoomIn: 'Ampliar',
    zoomOut: 'Reduzir',
    zoomToFit: 'Ajustar à janela',
    zoomToActual: 'Tamanho real',
    design: 'Design',
    preview: 'Visualização',
  },
}

/** 巴西葡萄牙语。 */
export const designerShellPtBR: XhConfig = { translations }
