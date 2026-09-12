import type { ActionVariant, Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { ToggleGroupNode, ToggleGroupNodeMeta, ToggleGroupSchema, ToggleGroupValue } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { Comment, defineComponent, Fragment, h, onBeforeUnmount, ref, Text, watch } from 'vue'
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

export const XhToggleGroupRoot = defineComponent({
  name: 'XhToggleGroupRoot',
  // 缺省值由 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    collection: { type: Array as PropType<ToggleGroupNode[]> },
    value: { type: [String, Array] as PropType<ToggleGroupValue> },
    defaultValue: { type: [String, Array] as PropType<ToggleGroupValue> },
    multiple: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
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
  // value-change 携带 { value }，update:value 携带裸值；裸值形态跟随 multiple，单选为字符串、多选为数组
  emits: {
    'value-change': (_details: PayloadOf<ToggleGroupProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<ToggleGroupProps, 'onValueChange'>['value']) => true,
  },
  setup(props, { slots, emit }) {
    const notify: ToggleGroupProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useToggleGroup(useFormControlProps(props) as ToggleGroupProps, notify)
    provideToggleGroup(ctx)
    return () => {
      const children = slots.default
        ? slots.default()
        : props.collection
          ? renderDefaultTree(ctx.api.value.collection, slots.item)
          : []
      return h(
        'div',
        ctx.api.value.getRootProps() as Record<string, unknown>,
        renderChildren(children, ctx.api.value),
      )
    }
  },
})

export const XhToggleGroupItem = defineComponent({
  name: 'XhToggleGroupItem',
  props: {
    value: { type: String, required: true },
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
        service.send({ type: 'ITEM.FOCUS', value: next })
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

/** 表单出口：整组只有一份，给了 name 才参与提交。 */
export const XhToggleGroupHiddenInput = defineComponent({
  name: 'XhToggleGroupHiddenInput',
  setup() {
    const ctx = useToggleGroupContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 * 条目底下没有文本部件，文字直接落在条目里。
 */
function renderDefaultTree(
  collection: readonly ToggleGroupNodeMeta[],
  itemSlot?: (node: ToggleGroupNodeMeta) => VNode[],
): VNode[] {
  return collection.map(node => h(
    XhToggleGroupItem,
    { key: node.value, value: node.value },
    () => itemSlot?.(node) ?? node.label,
  ))
}
