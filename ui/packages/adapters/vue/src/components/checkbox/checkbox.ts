import type { CheckboxCheckedState, CheckboxSchema } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { slotPaints } from '../../runtime/slot-content'
import { useCheckbox } from './use-checkbox'

type CheckboxProps = CheckboxSchema['props']

export const XhCheckbox = defineComponent({
  name: 'XhCheckbox',
  props: {
    // 三态：true / false / 'indeterminate'。半选只能由外部给，点击不会切进去
    checked: { type: [Boolean, String] as PropType<CheckboxCheckedState>, default: undefined },
    defaultChecked: { type: [Boolean, String] as PropType<CheckboxCheckedState>, default: undefined },
    disabled: Boolean,
    /** 表单字段名；给了 hidden-input 才带 name 并参与提交 */
    name: { type: String, default: undefined },
    value: { type: String, default: undefined },
    tone: String as PropType<Tone>,
    size: String as PropType<Size>,
  },
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
    // 表单影子由组件自己渲染：单体控件的方框里没有子部件插槽，作者递不进来。
    // 给了 name 才有这个节点——type=hidden 不是交互内容，放进 button 里是合法的
    return () => {
      const box = h('button', api.value.getRootProps() as Record<string, unknown>, [
        h('span', api.value.getIndicatorProps() as Record<string, unknown>),
        props.name === undefined ? null : h('input', api.value.getHiddenInputProps() as Record<string, unknown>),
      ])
      // 默认插槽是方框旁的文字：<label> 包住两者，点文字即切换。没给文字就只有方框
      const text = slots.default?.()
      if (!slotPaints(text))
        return box
      return h('label', api.value.getLabelProps() as Record<string, unknown>, [
        box,
        h('span', api.value.getTextProps() as Record<string, unknown>, text),
      ])
    }
  },
})
