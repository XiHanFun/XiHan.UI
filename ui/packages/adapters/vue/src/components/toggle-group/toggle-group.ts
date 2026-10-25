/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toggle group 相关实现。

import type { ActionVariant, Direction, Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { SelectionValueKey, ToggleGroupApi, ToggleGroupModel, ToggleGroupNode, ToggleGroupNodeMeta, ToggleGroupSchema, ToggleGroupSelection, ToggleGroupValueChangeDetails } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import type { BivariantCallback } from '../../runtime/bivariant'
import { toggleGroupStructure, valueKeyOf } from '@xihan-ui/headless'
import { Comment, defineComponent, Fragment, h, onBeforeUnmount, ref, Text, watch } from 'vue'
import { renderStructure } from '../../runtime/structure'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { provideToggleGroup, useToggleGroupContext } from './context'
import { useToggleGroup } from './use-toggle-group'

type ToggleGroupProps = ToggleGroupSchema['props']

function flattenChildren(children: readonly VNode[]): VNode[] {
  const result: VNode[] = []
  for (const child of children) {
    if (child.type === Comment || child.type === Text)
      continue
    if (child.type === Fragment && Array.isArray(child.children)) {
      result.push(...flattenChildren(child.children.filter(value => typeof value === 'object') as VNode[]))
      continue
    }
    result.push(child)
  }
  return result
}

// 运行时的根组件按 unknown 收值；对外导出的 XhToggleGroupRoot 在它上面套一层按值类型与 multiple 收窄的类型，见文件后面
const XhToggleGroupRootImpl = defineComponent({
  name: 'XhToggleGroupRoot',
  // 缺省值由 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    collection: { type: Array as PropType<ToggleGroupNode<unknown>[]> },
    /** 对象值怎样取键：字段名或取值函数；同一个选项每次都是新对象时给它，不给按对象身份认。 */
    valueKey: { type: [String, Function] as PropType<string | ((value: never) => string)> },
    // 值可以是字符串、数字或对象：运行时不查类型，类型由对外导出的 XhToggleGroupRoot 按值类型与 multiple 收窄
    value: { type: null as unknown as PropType<unknown> },
    defaultValue: { type: null as unknown as PropType<unknown> },
    multiple: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    disallowEmpty: { type: Boolean, default: undefined },
    variant: { type: String as PropType<ActionVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    fullWidth: { type: Boolean, default: undefined },
    separators: { type: Boolean, default: undefined },
    name: { type: String },
    orientation: { type: String as PropType<Orientation> },
    dir: { type: String as PropType<Direction> },
    loop: { type: Boolean, default: undefined },
    rovingFocus: { type: Boolean, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸值；裸值形态跟随 multiple，单选为一个值、多选为数组
  emits: {
    'value-change': (_details: ToggleGroupValueChangeDetails<unknown>) => true,
    'update:value': (_value: unknown) => true,
  },
  setup(props, { slots, emit }) {
    const notify: ToggleGroupProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useToggleGroup(useFormControlProps(props) as unknown as ToggleGroupProps, notify)
    provideToggleGroup(ctx)
    // 放进表单字段时，字段的标题与说明接到组上：读屏进组时念组名与说明
    const fieldWiring = useFieldGroupWiring()
    const fieldLabel = useFieldLabelWiring()
    return () => {
      const children = slots.default ? slots.default() : renderDefaultStructure(ctx.api.value, slots.item)
      return h(
        'div',
        fieldLabel.value({ ...fieldWiring.value, ...ctx.api.value.getRootProps() as Record<string, unknown> }),
        renderChildren(children, ctx.api.value),
      )
    }
  },
})

/** 根组件里随值类型与 multiple 收窄的那几项 prop：多选时选中值是数组，单选时是一个值或 null。 */
export interface XhToggleGroupRootValueProps<V, M extends boolean> {
  'multiple'?: M
  'value'?: ToggleGroupModel<V, M>
  'defaultValue'?: ToggleGroupModel<V, M>
  'collection'?: ToggleGroupNode<V>[]
  'valueKey'?: SelectionValueKey<V>
  'onUpdate:value'?: BivariantCallback<[value: ToggleGroupSelection<V, M>]>
  'onValueChange'?: BivariantCallback<[details: { value: ToggleGroupSelection<V, M> }]>
}

type XhToggleGroupRootInstance = InstanceType<typeof XhToggleGroupRootImpl>

/**
 * 按值类型与 multiple 收窄的根组件类型。模板里由 Volar 照 value / collection 推断 V、照 multiple 推断形状：
 * 写了 multiple 时 v-model:value 绑数组，没写时绑一个值或 null，数字、对象都不必断言。`h()` 推断不了泛型，那里按 unknown 收。
 */
export type XhToggleGroupRootComponent = Omit<typeof XhToggleGroupRootImpl, never> & {
  new<V = string, M extends boolean = false>(props?: Omit<XhToggleGroupRootInstance['$props'], keyof XhToggleGroupRootValueProps<V, M>> & XhToggleGroupRootValueProps<V, M>): Omit<XhToggleGroupRootInstance, '$props' | '$slots'> & {
    $props: Omit<XhToggleGroupRootInstance['$props'], keyof XhToggleGroupRootValueProps<V, M>> & XhToggleGroupRootValueProps<V, M>
    $slots: Omit<XhToggleGroupRootInstance['$slots'], 'item'> & {
      item?: (node: ToggleGroupNodeMeta<V>) => VNode[]
    }
  }
}

export const XhToggleGroupRoot = XhToggleGroupRootImpl as unknown as XhToggleGroupRootComponent

export const XhToggleGroupItem = defineComponent({
  name: 'XhToggleGroupItem',
  props: {
    /** 条目代表的值，与根上的值同类型：字符串、数字或对象。 */
    value: { type: null as unknown as PropType<unknown>, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useToggleGroupContext()
    // 本条目持有焦点时，value 变更重报焦点条目，卸载时上报整组失焦
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        // 机器只认键
        service.send({ type: 'ITEM.FOCUS', value: valueKeyOf(service.scope, next) })
    })
    onBeforeUnmount(() => {
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按 value 比对
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'GROUP.BLUR' })
    })
    // 用原生 button，激活交给平台
    return () => h(
      'button',
      { ...ctx.api.value.getItemProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

// 分隔线按条目计数插在相邻条目之间；要认 XhToggleGroupItem 这个组件对象，所以放在它的定义之后
function renderChildren(children: readonly VNode[], props: {
  disabled: boolean
  orientation: Orientation
  separators: boolean
}): VNode[] {
  const result: VNode[] = []
  let itemCount = 0
  for (const child of flattenChildren(children)) {
    if (child.type === XhToggleGroupItem) {
      if (props.separators && itemCount > 0) {
        result.push(h('span', {
          'key': `separator-${itemCount}`,
          'aria-hidden': true,
          'data-xh-toggle-group-separator': '',
          'data-orientation': props.orientation === 'horizontal' ? 'vertical' : 'horizontal',
          'data-disabled': props.disabled ? '' : undefined,
        }))
      }
      itemCount += 1
    }
    result.push(child)
  }
  return result
}

/** 表单出口：整组只有一份，提供 name 后才参与提交。 */
export const XhToggleGroupHiddenInput = defineComponent({
  name: 'XhToggleGroupHiddenInput',
  setup() {
    const ctx = useToggleGroupContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})

/** 标准结构里各部件对应的组件。 */
const TOGGLE_GROUP_PARTS = {
  'item': XhToggleGroupItem,
  'hidden-input': XhToggleGroupHiddenInput,
}

/**
 * 未写默认插槽时铺开的整套结构，作者只提供数据：照 headless 的 toggleGroupStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。条目的内容由 item 插槽接管。
 */
function renderDefaultStructure(api: ToggleGroupApi<PropTypes, unknown>, itemSlot?: (node: ToggleGroupNodeMeta<unknown>) => VNode[]): VNode[] {
  const nodes = toggleGroupStructure(api, { slotted: name => name === 'item' && itemSlot != null })
  return renderStructure(nodes, TOGGLE_GROUP_PARTS, (node) => {
    if (node.slot?.name !== 'item')
      return undefined
    const meta = node.data as ToggleGroupNodeMeta<unknown>
    return itemSlot?.(meta) ?? meta.label
  })
}
