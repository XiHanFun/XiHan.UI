/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 表单字段组与录入控件之间的值通道：控件放进字段组、自己又没给值时，按字段名读写表单的值。
//
// 三个适配器都在跑机器的那一处（Vue / React 的 useMachine、WC 的 MachineController）把字段的值端口
// 交给 bindFormModel，与全局配置的并入同一个位置，组件不必逐个接线。哪台机器认哪条值通道只在这里登记。

import type { Service } from '@xihan-ui/core'
import type { FormPath } from './form.path'
import type { FormSchema } from './form.types'
import { getFormPathValue } from './form.path'

/** 控件的值通道：值落在哪个 prop、初值写在哪个 prop、改动经哪个回调报出、回调细节里哪一项是新值。 */
export interface FormModel {
  readonly prop: string
  readonly defaultProp: string
  readonly onChange: string
  readonly detail: string
}

const VALUE: FormModel = { prop: 'value', defaultProp: 'defaultValue', onChange: 'onValueChange', detail: 'value' }
const CHECKED: FormModel = { prop: 'checked', defaultProp: 'defaultChecked', onChange: 'onCheckedChange', detail: 'checked' }
const FILES: FormModel = { prop: 'files', defaultProp: 'defaultFiles', onChange: 'onFilesChange', detail: 'files' }

/**
 * 按机器名登记的值通道。不在表里的机器不接字段的值：字段本身、字段数组（它自己按路径读写表单）、
 * 以及没有「一个值」可交给表单的组件。
 */
const FORM_MODELS: Readonly<Record<string, FormModel>> = {
  'cascader': VALUE,
  'checkbox': CHECKED,
  'checkbox-group': VALUE,
  'color-field': VALUE,
  'color-picker': VALUE,
  'color-slider': VALUE,
  'color-swatch-picker': VALUE,
  'combobox': VALUE,
  'date-field': VALUE,
  'date-picker': VALUE,
  'date-range-picker': VALUE,
  'editable': VALUE,
  'expression-input': VALUE,
  'file-upload': FILES,
  'filter-builder': VALUE,
  'format-input': VALUE,
  'image-cropper': VALUE,
  'listbox': VALUE,
  'mention': VALUE,
  'number-field': VALUE,
  'password-input': VALUE,
  'pin-input': VALUE,
  'radio-group': VALUE,
  'rating': VALUE,
  'select': VALUE,
  'signature-pad': VALUE,
  'slider': VALUE,
  'switch': CHECKED,
  'tag-group': VALUE,
  'tags-input': VALUE,
  'text-field': VALUE,
  'time-field': VALUE,
  'time-picker': VALUE,
  'time-range-picker': VALUE,
  'toggle-group': VALUE,
  'transfer': VALUE,
  'tree-select': VALUE,
}

/** 这台机器的值通道；不接字段值的机器为 undefined。 */
export function formModelOf(machineName: string): FormModel | undefined {
  return Object.hasOwn(FORM_MODELS, machineName) ? FORM_MODELS[machineName] : undefined
}

/** 字段组交给控件的值端口：现读现写，读到的总是表单此刻的值。 */
export interface FormFieldModel {
  readonly value: () => unknown
  readonly setValue: (next: unknown) => void
}

/** 某个字段的值端口。name 取现值：字段组换了名字，端口跟着换字段。 */
export function formFieldModel(service: Service<FormSchema>, name: () => FormPath): FormFieldModel {
  return {
    value: () => getFormPathValue(service.context.get('values'), name()),
    setValue: next => service.send({ type: 'FIELD.SET', name: name(), value: next }),
  }
}

/**
 * 把字段的值并进控件的机器 props。
 *
 * - 实例自己给了值（不是 undefined，null 也算给了）：一概不接，手动接法照旧；
 * - 否则字段有值就以它为准，控件成了受控的，控件自己的初值 prop 一并收起：初值与重置都归表单，
 *   控件认的原生表单重置照「受控且没声明初值」不动手，不会把它自己的初值报出去盖掉表单刚还原的值；
 * - 字段还没有值时控件照旧非受控（自己的初值照用），等第一次改动写进表单；
 * - 改动先写回字段，再交给控件自己的回调，`update:value` 之类的事件照常发出。
 */
export function bindFormModel<P extends object>(
  props: P,
  model: FormModel | undefined,
  field: FormFieldModel | null | undefined,
): P {
  if (!model || !field)
    return props
  const own = props as Record<string, unknown>
  if (own[model.prop] !== undefined)
    return props
  const onChange = own[model.onChange] as ((details: Record<string, unknown>) => void) | undefined
  const bound: Record<string, unknown> = {
    ...own,
    [model.onChange]: (details: Record<string, unknown>) => {
      field.setValue(details[model.detail])
      onChange?.(details)
    },
  }
  const value = field.value()
  if (value !== undefined) {
    bound[model.prop] = value
    bound[model.defaultProp] = undefined
  }
  return bound as P
}
