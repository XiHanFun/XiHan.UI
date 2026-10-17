/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 组合节点的类型帮手：按组件名取那个组件的 headless props，结构函数里经它写组合节点，属性名拼错了编译期就报。

import type { ComboboxSchema } from '../combobox/combobox.types'
import type { DateFieldSchema } from '../date-field/date-field.types'
import type { NumberFieldSchema } from '../number-field/number-field.types'
import type { SelectSchema } from '../select/select.types'
import type { SwitchSchema } from '../switch/switch.types'
import type { TagsInputSchema } from '../tags-input/tags-input.types'
import type { TextFieldSchema } from '../text-field/text-field.types'
import type { ToggleGroupSchema } from '../toggle-group/toggle-group.types'
import type { StructureInstanceNode } from './structure'

/** 能组合进别的组件结构里的组件 → 它的 props；按需要补。 */
export interface StructureInstanceProps {
  'combobox': ComboboxSchema['props']
  'date-field': DateFieldSchema['props']
  'number-field': NumberFieldSchema['props']
  'select': SelectSchema['props']
  'switch': SwitchSchema['props']
  'tags-input': TagsInputSchema['props']
  'text-field': TextFieldSchema['props']
  'toggle-group': ToggleGroupSchema['props']
}

/** 建一个组合节点：组件名与 props 按 StructureInstanceProps 对上。 */
export function structureInstance<C extends keyof StructureInstanceProps>(key: string, instance: C, props: Partial<StructureInstanceProps[C]> = {}): StructureInstanceNode {
  return { key, instance, props }
}
