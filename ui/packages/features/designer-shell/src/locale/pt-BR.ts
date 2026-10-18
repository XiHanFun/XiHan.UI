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
  },
}

/** 巴西葡萄牙语。 */
export const designerShellPtBR: XhConfig = { translations }
