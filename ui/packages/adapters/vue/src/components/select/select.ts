import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { SelectApi, SelectGroupProps, SelectItemProps, SelectNode, SelectNodeMeta, SelectOpenChangeDetails, SelectSchema, SelectValueChangeDetails } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import { computed, defineComponent, h, mergeProps, onBeforeUnmount, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { XhPortal } from '../../runtime/portal'
import { slotIsPlainText } from '../../runtime/slot-content'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { provideSelect, provideSelectGroup, provideSelectItem, provideSelectTag, useSelectContext, useSelectGroupContext, useSelectItemContext, useSelectTagContext } from './context'
import { useSelect } from './use-select'

type SelectProps = SelectSchema['props']

/** 默认插槽的载荷：展开态、选中集合与显示文字、可见标签与被折起的个数及其文字，以及改展开、改值、清空、摘值四个动作。 */
export type SelectRootSlotProps = Pick<
  SelectApi,
  'open' | 'value' | 'displayText' | 'tags' | 'overflowCount' | 'overflowText' | 'setOpen' | 'setValue' | 'clear' | 'deselect'
>

export const XhSelectRoot = /* @__PURE__ */ defineComponent({
  name: 'XhSelectRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    collection: { type: Array as PropType<SelectNode[]> },
    /** 标题文字。给了它就不必再写 label 部件；要放别的内容改用 label 插槽。 */
    label: { type: String },
    value: { type: [String, Array] as PropType<string | string[] | null> },
    defaultValue: { type: [String, Array] as PropType<string | string[] | null> },
    multiple: Boolean,
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: { type: Boolean, default: undefined },
    /** 只读：浮层照常展开与浏览，但选中值改不动、也清不掉。 */
    readOnly: { type: Boolean, default: undefined },
    /** 自动渲染树里是否带清空按钮；手写部件不看它，写了节点即可清。 */
    clearable: Boolean,
    invalid: { type: Boolean, default: undefined },
    loading: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    name: { type: String },
    translations: { type: Object as PropType<SelectProps['translations']> },
    maxTagCount: { type: Number },
    placeholder: { type: String },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction> },
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
  },
  // *-change 携带 details 对象，update:* 携带裸值。
  // 校验函数恒真，只声明载荷类型：'update:value' 是 string[]，单选也是长度 1 的数组而非裸串。
  emits: {
    'value-change': (_details: SelectValueChangeDetails) => true,
    'open-change': (_details: SelectOpenChangeDetails) => true,
    'update:value': (_value: string[]) => true,
    'update:open': (_open: boolean) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: SelectRootSlotProps) => VNode[]
    label?: () => VNode[]
    item?: (node: SelectNodeMeta) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: SelectProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyOpen: SelectProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useSelect(withXhConfig('select', useFormControlProps(props)) as SelectProps, notifyValue, notifyOpen)
    provideSelect(ctx)

    // 表单影子由根部件装配：空串选项打底，每个选中值一个 selected 选项，供 required 判定。
    // 选中态一律靠选项的 selected 表达，多选下 select.value 表达不了集合。
    const hiddenSelect = (): VNode => {
      const api = ctx.api.value
      const options = [h('option', { value: '' })]
      for (const [i, v] of api.value.entries())
        options.push(h('option', { value: v, selected: true }, api.valueText[i] ?? v))
      return h('select', api.getHiddenSelectProps() as Record<string, unknown>, options)
    }

    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, [
      hiddenSelect(),
      ...(slots.default
        ? slots.default({
          open: ctx.api.value.open,
          value: ctx.api.value.value,
          displayText: ctx.api.value.displayText,
          tags: ctx.api.value.tags,
          overflowCount: ctx.api.value.overflowCount,
          overflowText: ctx.api.value.overflowText,
          setOpen: ctx.api.value.setOpen,
          setValue: ctx.api.value.setValue,
          clear: ctx.api.value.clear,
          deselect: ctx.api.value.deselect,
        }) ?? []
        : props.collection
          ? renderDefaultTree(
              ctx.api.value.collection,
              slots.label?.() ?? (props.label != null ? [props.label] : null),
              props.clearable,
              slots.item,
            )
          : []),
    ])
  },
})

export const XhSelectLabel = /* @__PURE__ */ defineComponent({
  name: 'XhSelectLabel',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectControl = /* @__PURE__ */ defineComponent({
  name: 'XhSelectControl',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    // 盒：触发器与清空按钮在里面并排，描边、底色与聚焦环都长在它上面
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhSelectTrigger',
  setup(_, { slots }) {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
    const ctx = useSelectContext()
    return () => h('button', fieldLabel.value({
      ...fieldWiring.value,
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }), slots.default?.())
  },
})

export const XhSelectValueText = /* @__PURE__ */ defineComponent({
  name: 'XhSelectValueText',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    // 有插槽用插槽，否则显示选中项文本或 placeholder
    return () => h(
      'span',
      ctx.api.value.getValueTextProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.displayText,
    )
  },
})

export const XhSelectIndicator = /* @__PURE__ */ defineComponent({
  name: 'XhSelectIndicator',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h('span', ctx.api.value.getIndicatorProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectClearTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhSelectClearTrigger',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    // 节点常挂，清不了时靠 hidden 藏掉
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectTagList = /* @__PURE__ */ defineComponent({
  name: 'XhSelectTagList',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    // 标签行：可见标签与 +N 那一枚在里面并排；无选中时连接层给 hidden，value-text 回来显示占位文字
    return () => h('span', ctx.api.value.getTagListProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 标签文字所在的块（tag 的 label）：截断规则挂在这一层。 */
export const XhSelectTagLabel = /* @__PURE__ */ defineComponent({
  name: 'XhSelectTagLabel',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h('span', ctx.api.value.getTagLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 标签内容：只有文字时替它包一层 label——截断规则挂在 label 上，直接摊在 root 上的文字过长会把
 * 删除钮挤出去；作者自己写了节点就原样放行。与 XhTagRoot 同一条规矩。
 * 库自己填的文字（+N，没有折起时是空串）恒包 label，三家适配器渲出同一棵树。
 */
function tagChildren(content: VNode[] | string | undefined): VNode[] | string | undefined {
  if (typeof content === 'string')
    return [h(XhSelectTagLabel, null, () => content)]
  return slotIsPlainText(content) ? [h(XhSelectTagLabel, null, () => content)] : content
}

/** 一个选中值一枚，就是库里 tag 的 root（data-scope="tag"）：语气、尺寸与禁用从 select 传下去，形态按控件的面派；触发器里纯展示，触发器外配 XhSelectItemDeleteTrigger 可删。 */
export const XhSelectTag = /* @__PURE__ */ defineComponent({
  name: 'XhSelectTag',
  props: {
    /** 它代表哪个选中值。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useSelectContext()
    provideSelectTag({ value: () => props.value })
    // 标签随文排在触发器那一行里，根用 span
    return () => h('span', ctx.api.value.getTagProps({ value: props.value }) as Record<string, unknown>, tagChildren(slots.default?.()))
  },
})

/** 折起的标签合成的那一枚：同样是 tag 的 root；有插槽用插槽，否则显示 +N。没有折起的标签时连接层给 hidden。 */
export const XhSelectOverflowTag = /* @__PURE__ */ defineComponent({
  name: 'XhSelectOverflowTag',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h(
      'span',
      ctx.api.value.getOverflowTagProps() as Record<string, unknown>,
      tagChildren(slots.default?.() ?? ctx.api.value.overflowText),
    )
  },
})

/** 标签里的删除钮：就是所在标签那份 tag 的 close-trigger（data-scope="tag"），可及名走 translations.deleteItem；点按摘掉所在标签的选中值。 */
export const XhSelectItemDeleteTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhSelectItemDeleteTrigger',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    const tag = useSelectTagContext()
    return () => h('button', ctx.api.value.getItemDeleteTriggerProps({ value: tag.value() }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectPositioner = /* @__PURE__ */ defineComponent({
  name: 'XhSelectPositioner',
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useSelectContext()
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.triggerRef }, () => [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, slots.default?.()),
    ])
  },
})

export const XhSelectContent = /* @__PURE__ */ defineComponent({
  name: 'XhSelectContent',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhSelectList = /* @__PURE__ */ defineComponent({
  name: 'XhSelectList',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    // 列表框本体：条目放这里面。滚动也在这一层，底部操作区因此不随条目滚走
    return () => h('div', ctx.api.value.getListProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectFooter = /* @__PURE__ */ defineComponent({
  name: 'XhSelectFooter',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    // 浮层底部的操作区：是 list 的兄弟，不进列表框的拥有关系，
    // 放在里面的按钮既不违反 listbox 的子节点约束，也不会被方向键与连打检索走到
    return () => h('div', ctx.api.value.getFooterProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectEmpty = /* @__PURE__ */ defineComponent({
  name: 'XhSelectEmpty',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    // 空态占位：写在 content 里、list 的兄弟，不进列表框的拥有关系。
    // 给了 collection 时收放归连接层，条目手写时归作者
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectLoading = /* @__PURE__ */ defineComponent({
  name: 'XhSelectLoading',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    // 在途占位：与空态占位同一个位置，取数期间顶上来
    return () => h('div', ctx.api.value.getLoadingProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectGroup = /* @__PURE__ */ defineComponent({
  name: 'XhSelectGroup',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useSelectContext()
    const group = computed<SelectGroupProps>(() => ({ value: props.value }))
    provideSelectGroup({ group })
    // 分组容器：条目照常挂在它里面，role=group 是列表框允许拥有的两种子节点之一
    return () => h('div', ctx.api.value.getGroupProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectGroupLabel = /* @__PURE__ */ defineComponent({
  name: 'XhSelectGroupLabel',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    const { group } = useSelectGroupContext()
    return () => h('span', ctx.api.value.getGroupLabelProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectItem = /* @__PURE__ */ defineComponent({
  name: 'XhSelectItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useSelectContext()
    const item = computed<SelectItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideSelectItem({ item })
    // 本条目持有焦点时，value 变更重报高亮条目，卸载时上报条目丢失
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const svc = ctx.service
      if (svc.getStatus() !== 'Started')
        return
      if (itemEl.value && svc.scope.getActiveElement() === itemEl.value)
        svc.send({ type: 'ITEM.HIGHLIGHT', value: next })
    })
    onBeforeUnmount(() => {
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按 value 比对
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'ITEM.LOST' })
    })
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhSelectItemText = /* @__PURE__ */ defineComponent({
  name: 'XhSelectItemText',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    const { item } = useSelectItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectItemIndicator = /* @__PURE__ */ defineComponent({
  name: 'XhSelectItemIndicator',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    const { item } = useSelectItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 */
function renderDefaultTree(
  collection: readonly SelectNodeMeta[],
  label: (VNode | string)[] | null,
  clearable: boolean,
  itemSlot?: (node: SelectNodeMeta) => VNode[],
): VNode[] {
  const trigger = h(XhSelectTrigger, null, () => [h(XhSelectValueText), h(XhSelectIndicator)])
  return [
    ...(label ? [h(XhSelectLabel, null, () => label)] : []),
    // control 是盒：描边、底色与聚焦环都长在它上面，触发器与清空钮在里面并排。
    // 清空钮排在触发器之后（按钮不能套按钮），展开箭头是触发器里的指示符，
    // 视觉上仍是「清空在左、箭头在右」
    h(XhSelectControl, null, () => (clearable ? [trigger, h(XhSelectClearTrigger)] : [trigger])),
    h(XhSelectPositioner, null, () => [
      h(XhSelectContent, null, () => h(XhSelectList, null, () => collection.map(node =>
        h(XhSelectItem, { key: node.value, value: node.value }, () => [
          h(XhSelectItemText, null, () => itemSlot?.(node) ?? node.label),
          h(XhSelectItemIndicator),
        ]),
      ))),
    ]),
  ]
}
