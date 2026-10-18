/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 组合节点的类型帮手：按组件名取那个组件的 headless props 加上它的结构选项，结构函数里经它写组合节点，
// 属性名拼错了编译期就报。

import type { ComboboxStructureOptions } from '../combobox/combobox.structure'
import type { ComboboxSchema } from '../combobox/combobox.types'
import type { DateFieldStructureOptions } from '../date-field/date-field.structure'
import type { DateFieldSchema } from '../date-field/date-field.types'
import type { IconProps } from '../icon/icon.types'
import type { MenuSchema, MenuStructureOptions } from '../menu/menu.types'
import type { NumberFieldStructureOptions } from '../number-field/number-field.structure'
import type { NumberFieldSchema } from '../number-field/number-field.types'
import type { SelectStructureOptions } from '../select/select.structure'
import type { SelectSchema } from '../select/select.types'
import type { SwitchStructureOptions } from '../switch/switch.structure'
import type { SwitchSchema } from '../switch/switch.types'
import type { TagsInputStructureOptions } from '../tags-input/tags-input.structure'
import type { TagsInputSchema } from '../tags-input/tags-input.types'
import type { TextFieldStructureOptions } from '../text-field/text-field.structure'
import type { TextFieldSchema } from '../text-field/text-field.types'
import type { ToggleGroupStructureOptions } from '../toggle-group/toggle-group.structure'
import type { ToggleGroupSchema } from '../toggle-group/toggle-group.types'
import type { StructureInstanceNode } from './structure'

/** 结构选项里由组件自己推导、不经组合节点传的：插槽看宿主给了什么内容，开关的表单影子随 name。 */
type DerivedOption = 'slotted' | 'hiddenInput'

/** 组合节点能传的：组件的 headless props，加上它的结构选项（标题、清空钮、空态文字等）。 */
type InstanceProps<Schema extends { props: object }, Options> = Schema['props'] & Omit<Options, DerivedOption>

/** 能组合进别的组件结构里的组件 → 组合节点能传的属性；按需要补。 */
export interface StructureInstanceProps {
  'combobox': InstanceProps<ComboboxSchema, ComboboxStructureOptions>
  'date-field': InstanceProps<DateFieldSchema, DateFieldStructureOptions>
  'icon': IconProps
  'menu': InstanceProps<MenuSchema, MenuStructureOptions>
  'number-field': InstanceProps<NumberFieldSchema, NumberFieldStructureOptions>
  'select': InstanceProps<SelectSchema, SelectStructureOptions>
  'switch': InstanceProps<SwitchSchema, SwitchStructureOptions>
  'tags-input': InstanceProps<TagsInputSchema, TagsInputStructureOptions>
  'text-field': InstanceProps<TextFieldSchema, TextFieldStructureOptions>
  'toggle-group': InstanceProps<ToggleGroupSchema, ToggleGroupStructureOptions>
}

/** 建一个组合节点：组件名与属性按 StructureInstanceProps 对上。 */
export function structureInstance<C extends keyof StructureInstanceProps>(key: string, instance: C, props: Partial<StructureInstanceProps[C]> = {}): StructureInstanceNode {
  return { key, instance, props }
}
