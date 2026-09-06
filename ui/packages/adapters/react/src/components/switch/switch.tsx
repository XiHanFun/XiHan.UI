import type { Size, Tone } from '@xihan-ui/core'
import type { SwitchSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { useId, useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { mergeReactProps } from '../../runtime/merge-props'
import { slotPaints } from '../../runtime/slot-content'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useSwitch } from './use-switch'

type SwitchProps = SwitchSchema['props']

/** value 与 defaultChecked 在原生 button 上另有含义，这里由机器接管。 */
type ButtonProps = Omit<ComponentPropsWithRef<'button'>, 'value' | 'defaultChecked' | 'onChange'>

export interface XhSwitchProps extends ButtonProps {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  required?: boolean
  loading?: boolean
  /** 表单字段名；给了 hidden-input 才带 name 并参与提交 */
  name?: string
  value?: string
  tone?: Tone
  size?: Size
  onCheckedChange?: SwitchProps['onCheckedChange']
  children?: ReactNode
}

export function XhSwitch({
  checked,
  defaultChecked,
  disabled,
  readOnly,
  invalid,
  required,
  loading,
  name,
  value,
  tone,
  size,
  onCheckedChange,
  children,
  ...rest
}: XhSwitchProps): ReactNode {
  const { api, service } = useSwitch({
    checked,
    defaultChecked,
    disabled,
    readOnly,
    invalid,
    required,
    loading,
    name,
    value,
    tone,
    size,
    onCheckedChange,
  } as SwitchProps)

  // 字段的说明与校验状态要落在焦点所在的那颗按钮上：给了文字时封装根是外面那个 <label>，
  // 而读屏只念焦点所在节点的描述
  const fieldWiring = useFieldStateWiring()
  // 字段的标签也得并进名字链，否则按钮的名字里只剩组件自己那段文字
  const fieldLabel = useFieldLabelWiring()
  // 文字那段的 id：按钮按它取名，字段的标签再排到它前面
  const textId = useId()

  // 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生。
  // 锚点取组件渲出来的最外层节点：给了文字时是 <label>，没给时就是那颗按钮
  const rootRef = useRef<HTMLElement | null>(null)
  useFormReset(service, rootRef)

  // children 是轨道旁的文字：<label> 包住两者，点文字即切换。没给文字就只有轨道
  const labelled = slotPaints(children)

  const track = (
    <button
      {...mergeReactProps(
        fieldLabel({
          ...api.getRootProps() as Record<string, unknown>,
          // 有文字时名字改由它承担；没文字时不写，作者写在组件上的 aria-label 照旧生效
          ...(labelled ? { 'aria-labelledby': textId } : null),
          ...fieldWiring,
        }),
        rest as Record<string, unknown>,
        labelled ? {} : { ref: rootRef },
      )}
    >
      <span {...api.getThumbProps() as Record<string, unknown>} />
      {/* 表单影子由组件自己渲染：单体控件的轨道里没有子部件插槽，作者递不进来。
          给了 name 才有这个节点——type=hidden 不是交互内容，放进 button 里是合法的 */}
      {name === undefined ? null : <input {...api.getHiddenInputProps() as Record<string, unknown>} />}
    </button>
  )

  if (!labelled)
    return track

  return (
    <label {...api.getLabelProps() as Record<string, unknown>} ref={rootRef as React.RefObject<HTMLLabelElement>}>
      {track}
      <span {...api.getTextProps() as Record<string, unknown>} id={textId}>{children}</span>
    </label>
  )
}

XhSwitch.xhEvents = ['checked-change'] as const
