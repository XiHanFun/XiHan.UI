/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器零件的俄语文案。

import type { XhConfig } from '@xihan-ui/web-components'
import type { DesignerShellLocaleTranslations } from './types'

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

const translations: DesignerShellLocaleTranslations = {
  'xh-designer-properties': {
    title: 'Свойства',
    empty: 'Нет свойств для редактирования',
    mixed: 'Несколько значений',
    invalidJson: 'Недопустимый JSON',
    notInteger: 'Должно быть целым числом',
    belowMinimum: min => `Должно быть не меньше ${min}`,
    aboveMaximum: max => `Должно быть не больше ${max}`,
    notAboveMinimum: min => `Должно быть больше ${min}`,
    invalidDataField: 'Недопустимый путь к полю',
    sidesLinked: 'Одинаково со всех сторон',
    sides: { all: 'Все стороны', top: 'Сверху', right: 'Справа', bottom: 'Снизу', left: 'Слева' },
    sidesIncomplete: 'Заполните все четыре стороны',
    customColor: 'Свой цвет',
  },
  'xh-designer-issues': {
    title: 'Проблемы',
    empty: 'Проблем нет',
    errors: count => `${count} ${plural(count, 'ошибка', 'ошибки', 'ошибок')}`,
    warnings: count => `${count} ${plural(count, 'предупреждение', 'предупреждения', 'предупреждений')}`,
    severityError: 'Ошибка',
    severityWarning: 'Предупреждение',
    filter: 'Показывать проблемы по важности',
    noTarget: 'Общие',
  },
  'xh-designer-palette': {
    title: 'Элементы',
    search: 'Поиск элементов',
    noMatches: 'Нет подходящих элементов',
    empty: 'Нет элементов',
  },
  'xh-designer-ruler': {
    horizontalGuide: value => `Горизонтальная направляющая: ${value}`,
    verticalGuide: value => `Вертикальная направляющая: ${value}`,
  },
  'xh-designer-frame': {
    layout: 'Макет конструктора',
    resize: label => `Изменить размер: ${label}`,
  },
}

/** 俄语。 */
export const designerShellRuRU: XhConfig = { translations }
