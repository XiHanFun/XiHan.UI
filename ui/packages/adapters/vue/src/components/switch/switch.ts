import type { SwitchSchema } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { useSwitch } from './use-switch'

type SwitchProps = SwitchSchema['props']

export const XhSwitch = defineComponent({
  name: 'XhSwitch',
  props: {
    checked: { type: Boolean, default: undefined },
    defaultChecked: Boolean,
    disabled: Boolean,
    /** 表单字段名；给了 hidden-input 才带 name 并参与提交 */
    name: { type: String, default: undefined },
    value: { type: String, default: undefined },
    tone: String as PropType<Tone>,
    size: String as PropType<Size>,
  },
  // checked-change 携带 { checked }，update:checked 携带裸布尔
  emits: {
    'checked-change': (_details: PayloadOf<SwitchProps, 'onCheckedChange'>) => true,
    'update:checked': (_checked: PayloadOf<SwitchProps, 'onCheckedChange'>['checked']) => true,
  },
  setup(props, { emit }) {
    const notify: SwitchProps['onCheckedChange'] = (details) => {
      emit('checked-change', details)
      emit('update:checked', details.checked)
    }
    const { api } = useSwitch(props as SwitchProps, notify)
    // 表单影子由组件自己渲染：单体控件没有子部件插槽，作者递不进来。
    // 给了 name 才有这个节点——type=hidden 不是交互内容，放进 button 里是合法的
    return () => h('button', api.value.getRootProps() as Record<string, unknown>, [
      h('span', api.value.getThumbProps() as Record<string, unknown>),
      props.name === undefined ? null : h('input', api.value.getHiddenInputProps() as Record<string, unknown>),
    ])
  },
})
