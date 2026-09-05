import type { Size, Tone } from '@xihan-ui/core'
import type { CheckboxCheckedState, CheckboxSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, useId } from 'vue'
import { slotPaints } from '../../runtime/slot-content'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useCheckbox } from './use-checkbox'

type CheckboxProps = CheckboxSchema['props']

export const XhCheckbox = defineComponent({
  name: 'XhCheckbox',
  props: {
    // 三态：true / false / 'indeterminate'。半选只能由外部给，点击不会切进去
    checked: { type: [Boolean, String] as PropType<CheckboxCheckedState>, default: undefined },
    defaultChecked: { type: [Boolean, String] as PropType<CheckboxCheckedState>, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    required: Boolean,
    /** 表单字段名；给了 hidden-input 才带 name 并参与提交 */
    name: { type: String, default: undefined },
    value: { type: String, default: undefined },
    tone: String as PropType<Tone>,
    size: String as PropType<Size>,
  },
  slots: Object as SlotsType<{
    /** 方框旁的文字；不写就只有一个方框。 */
    default?: () => VNode[]
    /** 方框里的图形；不写由皮肤画勾。 */
    indicator?: () => VNode[]
  }>,
  // checked-change 携带 { checked }，update:checked 携带裸布尔
  emits: {
    'checked-change': (_details: PayloadOf<CheckboxProps, 'onCheckedChange'>) => true,
    'update:checked': (_checked: PayloadOf<CheckboxProps, 'onCheckedChange'>['checked']) => true,
  },
  setup(props, { emit, slots }) {
    const notify: CheckboxProps['onCheckedChange'] = (details) => {
      emit('checked-change', details)
      emit('update:checked', details.checked)
    }
    const { api } = useCheckbox(props as CheckboxProps, notify)
    // 字段的说明与校验状态要落在焦点所在的那颗按钮上：给了文字时封装根是外面那个 <label>，
    // XhFieldControl 把整份接线合在它身上，而读屏只念焦点所在节点的描述
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链，否则按钮的名字里只剩组件自己那段文字
    const fieldLabel = useFieldLabelWiring()
    // 文字那段的 id：按钮按它取名，字段的标签再排到它前面
    const textId = useId()
    // 表单影子由组件自己渲染，给了 name 才有这个节点——type=hidden 不是交互内容，放进 button 里是合法的
    return () => {
      // 默认插槽是方框旁的文字：<label> 包住两者，点文字即切换。没给文字就只有方框
      const text = slots.default?.()
      const labelled = slotPaints(text)
      const box = h('button', fieldLabel.value({
        ...api.value.getRootProps() as Record<string, unknown>,
        // 有文字时名字改由它承担；没文字时不写，作者写在组件上的 aria-label 照旧生效
        ...(labelled ? { 'aria-labelledby': textId } : null),
        ...fieldWiring.value,
      }), [
        h('span', api.value.getIndicatorProps() as Record<string, unknown>, slots.indicator?.()),
        props.name === undefined ? null : h('input', api.value.getHiddenInputProps() as Record<string, unknown>),
      ])
      if (!labelled)
        return box
      return h('label', api.value.getLabelProps() as Record<string, unknown>, [
        box,
        h('span', { ...api.value.getTextProps() as Record<string, unknown>, id: textId }, text),
      ])
    }
  },
})
