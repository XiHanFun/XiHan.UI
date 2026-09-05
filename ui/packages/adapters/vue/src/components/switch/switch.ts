import type { Size, Tone } from '@xihan-ui/core'
import type { SwitchSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, useId } from 'vue'
import { slotPaints } from '../../runtime/slot-content'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useSwitch } from './use-switch'

type SwitchProps = SwitchSchema['props']

export const XhSwitch = defineComponent({
  name: 'XhSwitch',
  props: {
    checked: { type: Boolean, default: undefined },
    defaultChecked: Boolean,
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    required: Boolean,
    loading: { type: Boolean, default: undefined },
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
  setup(props, { emit, slots }) {
    const notify: SwitchProps['onCheckedChange'] = (details) => {
      emit('checked-change', details)
      emit('update:checked', details.checked)
    }
    const { api } = useSwitch(props as SwitchProps, notify)
    // 字段的说明与校验状态要落在焦点所在的那颗按钮上：给了文字时封装根是外面那个 <label>，
    // XhFieldControl 把整份接线合在它身上，而读屏只念焦点所在节点的描述
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链，否则按钮的名字里只剩组件自己那段文字
    const fieldLabel = useFieldLabelWiring()
    // 文字那段的 id：按钮按它取名，字段的标签再排到它前面
    const textId = useId()
    // 表单影子由组件自己渲染：单体控件的轨道里没有子部件插槽，作者递不进来。
    // 给了 name 才有这个节点——type=hidden 不是交互内容，放进 button 里是合法的
    return () => {
      // 默认插槽是轨道旁的文字：<label> 包住两者，点文字即切换。没给文字就只有轨道
      const text = slots.default?.()
      const labelled = slotPaints(text)
      const track = h('button', fieldLabel.value({
        ...api.value.getRootProps() as Record<string, unknown>,
        // 有文字时名字改由它承担；没文字时不写，作者写在组件上的 aria-label 照旧生效
        ...(labelled ? { 'aria-labelledby': textId } : null),
        ...fieldWiring.value,
      }), [
        h('span', api.value.getThumbProps() as Record<string, unknown>),
        props.name === undefined ? null : h('input', api.value.getHiddenInputProps() as Record<string, unknown>),
      ])
      if (!labelled)
        return track
      return h('label', api.value.getLabelProps() as Record<string, unknown>, [
        track,
        h('span', { ...api.value.getTextProps() as Record<string, unknown>, id: textId }, text),
      ])
    }
  },
})
