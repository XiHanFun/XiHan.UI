import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { TagsInputApi, TagsInputBlurBehavior, TagsInputSchema, TagsInputTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { contains } from '@xihan-ui/core'
import { useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { TagsInputItemProvider, TagsInputProvider, useTagsInputContext, useTagsInputItemContext } from './context'
import { useTagsInput } from './use-tags-input'

type TagsInputProps = TagsInputSchema['props']

/** 服务端没有提交这一步，layout effect 换成永不执行的 useEffect，避开 React 的警告。 */

function noop(): void {}

/** 计数部件函数式 children 的载荷：当前个数、上限与顶到上限、越界两个标志。 */
export type TagsInputCountSlotProps = Pick<TagsInputApi, 'count' | 'max' | 'atMax' | 'overflow'>

/** 函数式 children 的载荷：标签集合与输入文本、数量与越界标志、光标与编辑锚点，以及增删改与清空的动作。 */
export type TagsInputRootSlotProps = Pick<
  TagsInputApi,
  | 'value'
  | 'count'
  | 'inputValue'
  | 'empty'
  | 'atMax'
  | 'overflow'
  | 'highlightedValue'
  | 'editedValue'
  | 'canClear'
  | 'setValue'
  | 'addValue'
  | 'deleteValue'
  | 'clear'
  | 'setInputValue'
  | 'highlight'
  | 'edit'
>

export interface XhTagsInputRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  value?: string[]
  defaultValue?: string[]
  inputValue?: string
  defaultInputValue?: string
  max?: number
  allowOverflow?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  showCount?: boolean
  /** 表单字段名；给了隐藏输入才带 name 并参与提交。 */
  name?: string
  placeholder?: string
  delimiter?: string
  addOnPaste?: boolean
  /** 允许双击标签就地改写。 */
  editable?: boolean
  blurBehavior?: TagsInputBlurBehavior | null
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: Partial<TagsInputTranslations>
  onValueChange?: TagsInputProps['onValueChange']
  onInputValueChange?: TagsInputProps['onInputValueChange']
  children?: SlotChildren<TagsInputRootSlotProps>
}

export function XhTagsInputRoot({
  value,
  defaultValue,
  inputValue,
  defaultInputValue,
  max,
  allowOverflow,
  disabled,
  readOnly,
  required,
  invalid,
  showCount,
  name,
  placeholder,
  delimiter,
  addOnPaste,
  editable,
  blurBehavior,
  variant,
  tone,
  size,
  translations,
  onValueChange,
  onInputValueChange,
  children,
  ...rest
}: XhTagsInputRootProps): ReactNode {
  const ctx = useTagsInput(withXhConfig('tags-input', {
    value,
    defaultValue,
    inputValue,
    defaultInputValue,
    max,
    allowOverflow,
    disabled,
    readOnly,
    required,
    invalid,
    showCount,
    name,
    placeholder,
    delimiter,
    addOnPaste,
    editable,
    blurBehavior,
    variant,
    tone,
    size,
    translations,
    onValueChange,
    onInputValueChange,
  }) as TagsInputProps)
  const api = ctx.api
  return (
    <TagsInputProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {renderSlot(children, {
          value: api.value,
          count: api.count,
          inputValue: api.inputValue,
          empty: api.empty,
          atMax: api.atMax,
          overflow: api.overflow,
          highlightedValue: api.highlightedValue,
          editedValue: api.editedValue,
          canClear: api.canClear,
          setValue: api.setValue,
          addValue: api.addValue,
          deleteValue: api.deleteValue,
          clear: api.clear,
          setInputValue: api.setInputValue,
          highlight: api.highlight,
          edit: api.edit,
        })}
      </div>
    </TagsInputProvider>
  )
}

XhTagsInputRoot.xhEvents = ['value-change', 'input-value-change'] as const

export interface XhTagsInputLabelProps extends ComponentPropsWithRef<'label'> {}
/** 用原生 label，getLabelProps 的 for 指向输入框。 */
export function XhTagsInputLabel({ children, ...rest }: XhTagsInputLabelProps): ReactNode {
  const ctx = useTagsInputContext()
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </label>
  )
}

export interface XhTagsInputControlProps extends ComponentPropsWithRef<'div'> {}
/** 一排标签加一个输入框的容器，读屏把它当一个整体。 */
export function XhTagsInputControl({ children, ...rest }: XhTagsInputControlProps): ReactNode {
  const ctx = useTagsInputContext()
  return (
    <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhTagsInputInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
export function XhTagsInputInput({ ...rest }: XhTagsInputInputProps): ReactNode {
  // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
  const fieldWiring = useFieldStateWiring()
  // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
  const fieldLabel = useFieldLabelWiring()
  const ctx = useTagsInputContext()
  return (
    <input
      {...mergeReactProps(
        fieldLabel({ ...ctx.api.getInputProps() as Record<string, unknown>, ...fieldWiring }),
        rest as Record<string, unknown>,
      )}
    />
  )
}

export interface XhTagsInputItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}

/** 一枚标签：预览与就地编辑框都挂在它里面，靠 hidden 互斥。 */
export function XhTagsInputItem({ value, children, ...rest }: XhTagsInputItemProps): ReactNode {
  const ctx = useTagsInputContext()
  const item = useMemo(() => ({ value }), [value])
  const itemEl = useRef<HTMLElement | null>(null)

  // 本标签持有焦点时，value 变更或节点离场都上报焦点离场以终止就地编辑会话。
  // 用 layout effect：节点从文档里摘掉之前它的清理就跑完了，此刻焦点还在里面
  const service = ctx.service
  const holdsFocus = (): boolean => {
    if (service.getStatus() !== 'Started')
      return false
    const active = service.scope.getActiveElement()
    return !!itemEl.current && !!active && contains(itemEl.current, active)
  }
  const seen = useRef(value)
  useIsomorphicLayoutEffect(() => {
    if (seen.current === value)
      return
    seen.current = value
    if (holdsFocus())
      service.send({ type: 'ITEM.FOCUS_LOST' })
  })
  useIsomorphicLayoutEffect(() => () => {
    if (holdsFocus())
      service.send({ type: 'ITEM.FOCUS_LOST' })
  }, [service])

  return (
    <TagsInputItemProvider value={item}>
      <div
        {...mergeReactProps(
          ctx.api.getItemProps(item) as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { itemEl.current = el } },
        )}
      >
        {children}
      </div>
    </TagsInputItemProvider>
  )
}

export interface XhTagsInputItemPreviewProps extends ComponentPropsWithRef<'span'> {}
/** 标签的预览：渲的是库里 tag 的 root（data-scope="tag"），就地编辑时由 tag 收起。 */
export function XhTagsInputItemPreview({ children, ...rest }: XhTagsInputItemPreviewProps): ReactNode {
  const ctx = useTagsInputContext()
  const item = useTagsInputItemContext()
  return (
    <span {...mergeReactProps(ctx.api.getItemPreviewProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhTagsInputItemTextProps extends ComponentPropsWithRef<'span'> {}
/** 标签文字：渲的是 tag 的 label，截断落在这一层。 */
export function XhTagsInputItemText({ children, ...rest }: XhTagsInputItemTextProps): ReactNode {
  const ctx = useTagsInputContext()
  const item = useTagsInputItemContext()
  return (
    <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhTagsInputItemDeleteTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 删除钮：渲的是所在标签那份 tag 的 close-trigger，不占 Tab 位；禁用与只读时留位、原生 disabled。 */
export function XhTagsInputItemDeleteTrigger({ children, ...rest }: XhTagsInputItemDeleteTriggerProps): ReactNode {
  const ctx = useTagsInputContext()
  const item = useTagsInputItemContext()
  return (
    <button {...mergeReactProps(ctx.api.getItemDeleteTriggerProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhTagsInputItemInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
/** 就地编辑框：不编辑本标签时收起而不是卸载，与 item-preview 互斥。 */
export function XhTagsInputItemInput({ ...rest }: XhTagsInputItemInputProps): ReactNode {
  const ctx = useTagsInputContext()
  const item = useTagsInputItemContext()
  return (
    <input {...mergeReactProps(ctx.api.getItemInputProps(item) as Record<string, unknown>, rest as Record<string, unknown>)} />
  )
}

export interface XhTagsInputClearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTagsInputClearTrigger({ children, ...rest }: XhTagsInputClearTriggerProps): ReactNode {
  const ctx = useTagsInputContext()
  return (
    <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhTagsInputCountProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  children?: SlotChildren<TagsInputCountSlotProps>
}

/** 计数：不写内容时渲「已用 / 上限」，没设上限就只渲已用。 */
export function XhTagsInputCount({ children, ...rest }: XhTagsInputCountProps): ReactNode {
  const ctx = useTagsInputContext()
  const api = ctx.api
  const fallback = api.max === undefined ? `${api.count}` : `${api.count} / ${api.max}`
  const body = children == null
    ? fallback
    : renderSlot(children, { count: api.count, max: api.max, atMax: api.atMax, overflow: api.overflow })
  return (
    <span {...mergeReactProps(api.getCountProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {body}
    </span>
  )
}

export interface XhTagsInputHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
/** 整份标签集合的表单出口，按断词符拼成一串。 */
export function XhTagsInputHiddenInput({ ...rest }: XhTagsInputHiddenInputProps): ReactNode {
  const ctx = useTagsInputContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getHiddenInputProps() as Record<string, unknown>,
        // 值攥在机器里，这份影子输入没有自己的变更出口。React 要求带 value 的输入
        // 交出一个出口，否则在开发构建里逐帧告警；节点是 hidden，这个出口不会被调用
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}
