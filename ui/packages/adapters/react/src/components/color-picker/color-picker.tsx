/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color picker 相关实现。

import type { ControlVariant, Direction, Placement, Size } from '@xihan-ui/core'
import type { ColorFormat } from '@xihan-ui/core/color'
import type {
  ColorPickerApi,
  ColorPickerInputChannel,
  ColorPickerSchema,
  ColorPickerSelectionMode,
  ColorPickerTranslations,
  StructureChild,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { colorPickerStructure, colorPickerToInputChannel } from '@xihan-ui/headless'
import { useEffect } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot, slotIsPlainText } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { XhColorSliderControl, XhColorSliderThumb, XhColorSliderTrack } from '../color-slider/color-slider'
import { ColorSliderProvider } from '../color-slider/context'
import { XhColorSwatchPickerItem } from '../color-swatch-picker/color-swatch-picker'
import { ColorSwatchPickerProvider } from '../color-swatch-picker/context'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { ColorPickerProvider, ColorPickerTagProvider, useColorPickerContext, useColorPickerTagContext } from './context'
import { useColorPicker } from './use-color-picker'

type ColorPickerProps = ColorPickerSchema['props']

function noop(): void {}

/** 函数式 children 的载荷：展开态、当前颜色的各种表示、预设色板、屏幕取色状态，以及修改展开与修改值两个动作。 */
export type ColorPickerRootSlotProps = Pick<
  ColorPickerApi,
  'open' | 'value' | 'color' | 'canAdd' | 'rgba' | 'hsva' | 'swatches' | 'recentColors' | 'picking' | 'eyeDropperSupported' | 'errors' | 'setOpen' | 'setValue' | 'add' | 'clearError' | 'clearRecentColors'
>

/** 根上自有的取值；dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'dir' | 'children' | 'color'>

export interface XhColorPickerRootProps extends RootElementProps {
  /** 标题。不给 children 时铺 label 部件。 */
  label?: ReactNode
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  /** 受控的选中颜色，值串数组；给定即受控。单选可写裸串。 */
  value?: string | string[]
  /** 非受控初值。 */
  defaultValue?: string | string[]
  /** 选择模式，默认 single；multiple 时工作色是草稿、按「添加」收进值，色块点一下切换，输入行里排成标签。 */
  selectionMode?: ColorPickerSelectionMode
  /** multiple 下最多选几个颜色。 */
  maxSelected?: number
  /** 多选时输入行最多摆几枚标签，其余折进 +N 那一枚；默认 3。 */
  maxTagCount?: number
  /** 值串的写法，默认 hex。修改它只改变对外的序列化，工作色恒为 HSVA。 */
  format?: ColorFormat
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  /** 只读：浮层照常展开（可查看当前颜色），但任何改值的动作都不发生。 */
  readOnly?: boolean
  /** 校验失败标注。 */
  invalid?: boolean
  /** 必填：表单影子写原生 required。 */
  required?: boolean
  /** 带透明度，默认关闭。 */
  alpha?: boolean
  /** 预设色板：交给内嵌的色块选择器铺设格子，选中的格子按颜色比较。 */
  swatches?: string[]
  /** 常驻形态：取色面直接铺在页面里，不经触发钮与浮层。 */
  inline?: boolean
  /** 受控的最近使用色，最新的在最前；给定即受控。 */
  recentColors?: string[]
  defaultRecentColors?: string[]
  /** 最近使用色最多留几个，默认 8；写 0 即不记。 */
  maxRecentColors?: number
  /** 表单字段名；提供后表单影子才带 name 并参与提交。 */
  name?: string
  /** 单选未选（值为空数组）时值文字显示的提示；缺省取 translations.placeholder。 */
  placeholder?: string
  size?: Size
  /** 盒的形态：outline / subtle / ghost，默认 outline。 */
  variant?: ControlVariant
  /** 文字方向，默认 ltr。 */
  dir?: Direction
  placement?: Placement
  offset?: number
  translations?: Partial<ColorPickerTranslations>
  onValueChange?: ColorPickerProps['onValueChange']
  onOpenChange?: ColorPickerProps['onOpenChange']
  onColorError?: ColorPickerProps['onColorError']
  onRecentColorsChange?: ColorPickerProps['onRecentColorsChange']
  /** 用户按清空钮清掉了值：先发 onValueChange，再发它。 */
  onClear?: ColorPickerProps['onClear']
  children?: SlotChildren<ColorPickerRootSlotProps>
}

export function XhColorPickerRoot({
  label,
  ariaLabel,
  value,
  defaultValue,
  selectionMode,
  maxSelected,
  maxTagCount,
  format,
  open,
  defaultOpen,
  disabled,
  readOnly,
  invalid,
  required,
  alpha,
  swatches,
  inline,
  recentColors,
  defaultRecentColors,
  maxRecentColors,
  name,
  placeholder,
  size,
  variant,
  dir,
  placement,
  offset,
  translations,
  onValueChange,
  onOpenChange,
  onColorError,
  onRecentColorsChange,
  onClear,
  children,
  ...rest
}: XhColorPickerRootProps): ReactNode {
  const ctx = useColorPicker(withXhConfig('color-picker', useFormControlProps({
    ariaLabel,
    value,
    defaultValue,
    selectionMode,
    maxSelected,
    maxTagCount,
    format,
    open,
    defaultOpen,
    disabled,
    readOnly,
    invalid,
    required,
    alpha,
    swatches,
    inline,
    recentColors,
    defaultRecentColors,
    maxRecentColors,
    name,
    placeholder,
    size,
    variant,
    dir,
    placement,
    offset,
    translations,
    onValueChange,
    onOpenChange,
    onColorError,
    onRecentColorsChange,
    onClear,
  })) as ColorPickerProps)
  const api = ctx.api

  return (
    <ColorPickerProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps(),
          rest,
          { ref: ctx.rootRef },
        )}
      >
        {children != null
          ? renderSlot(children, {
              open: api.open,
              value: api.value,
              color: api.color,
              canAdd: api.canAdd,
              rgba: api.rgba,
              hsva: api.hsva,
              swatches: api.swatches,
              recentColors: api.recentColors,
              picking: api.picking,
              eyeDropperSupported: api.eyeDropperSupported,
              errors: api.errors,
              setOpen: api.setOpen,
              setValue: api.setValue,
              add: api.add,
              clearError: api.clearError,
              clearRecentColors: api.clearRecentColors,
            })
          : renderDefaultStructure(api, label, name !== undefined)}
      </div>
    </ColorPickerProvider>
  )
}

XhColorPickerRoot.xhEvents = ['clear', 'value-change', 'open-change', 'color-error', 'recent-colors-change'] as const

export interface XhColorPickerLabelProps extends ComponentPropsWithRef<'label'> {}

export function XhColorPickerLabel({ children, ...rest }: XhColorPickerLabelProps): ReactNode {
  const ctx = useColorPickerContext()
  // 渲出来了才登记：可聚焦部件的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
  return (
    <label {...mergeReactProps(ctx.api.getLabelProps(), rest)}>
      {children}
    </label>
  )
}

export interface XhColorPickerControlProps extends ComponentPropsWithRef<'div'> {}

/** 描边、底色与聚焦环所在的层，触发按钮与尾部动作按钮在其中并排。 */
export function XhColorPickerControl({ children, ...rest }: XhColorPickerControlProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <div {...mergeReactProps(ctx.api.getControlProps(), rest)}>
      {children}
    </div>
  )
}

export interface XhColorPickerTriggerProps extends ComponentPropsWithRef<'button'> {}

/** 原生 button，激活交给平台；同时是浮层的定位锚点。 */
export function XhColorPickerTrigger({ children, ...rest }: XhColorPickerTriggerProps): ReactNode {
  // 放进字段时字段的说明与错误文案接到触发钮上；按钮不收 aria-required / aria-readonly，只取描述链，
  // aria-invalid 由组件自己按字段状态投影
  const fieldWiring = useFieldGroupWiring()
  // 字段的标签并进名字链，排在当前值前面
  const fieldLabel = useFieldLabelWiring()
  const ctx = useColorPickerContext()
  return (
    <button
      {...mergeReactProps(
        fieldLabel({ ...fieldWiring, ...ctx.api.getTriggerProps() }),
        rest,
        { ref: (el: HTMLButtonElement | null) => { ctx.triggerRef.current = el } },
      )}
    >
      {children}
    </button>
  )
}

export interface XhColorPickerClearTriggerProps extends ComponentPropsWithRef<'button'> {}

/** 触发钮的兄弟节点：单选有值时才显示，按下清回未选。 */
export function XhColorPickerClearTrigger({ children, ...rest }: XhColorPickerClearTriggerProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <button {...mergeReactProps(ctx.api.getClearTriggerProps(), rest)}>
      {children}
    </button>
  )
}

export interface XhColorPickerValueTextProps extends ComponentPropsWithRef<'span'> {}

/** 未提供内容时显示当前值串；单选未选时是占位提示。 */
export function XhColorPickerValueText({ children, ...rest }: XhColorPickerValueTextProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <span {...mergeReactProps(ctx.api.getValueTextProps(), rest)}>
      {children ?? ctx.api.valueText}
    </span>
  )
}

export interface XhColorPickerSwatchProps extends ComponentPropsWithRef<'span'> {}

export function XhColorPickerSwatch({ children, ...rest }: XhColorPickerSwatchProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <span {...mergeReactProps(ctx.api.getSwatchProps(), rest)}>
      {children}
    </span>
  )
}

export interface XhColorPickerPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}

/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhColorPickerPositioner({ children, container, ...rest }: XhColorPickerPositionerProps): ReactNode {
  const ctx = useColorPickerContext()
  // 面板的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner；条子走浮层 4px 档
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current, props: () => ({ size: 'sm' }) })
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.triggerRef} present={ctx.rendered}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps(),
          rest,
          { ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el } },
        )}
      >
        {children}
        {bars.render()}
      </div>
    </XhPortal>
  )
}

export interface XhColorPickerContentProps extends ComponentPropsWithRef<'div'> {}

export function XhColorPickerContent({ children, ...rest }: XhColorPickerContentProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps(),
        rest,
        {
          // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
          // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
          style: ctx.rendered ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {children}
    </div>
  )
}

export interface XhColorPickerSaturationAreaProps extends ComponentPropsWithRef<'div'> {}

/** 区域节点交给状态机，矩形在指针事件中现测。 */
export function XhColorPickerSaturationArea({ children, ...rest }: XhColorPickerSaturationAreaProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getSaturationAreaProps(),
        rest,
        { ref: (el: HTMLDivElement | null) => { ctx.areaRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhColorPickerAreaThumbProps extends ComponentPropsWithRef<'div'> {}

export function XhColorPickerAreaThumb({ children, ...rest }: XhColorPickerAreaThumbProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <div {...mergeReactProps(ctx.api.getAreaThumbProps(), rest)}>
      {children}
    </div>
  )
}

export interface XhColorPickerHueSliderProps extends ComponentPropsWithRef<'div'> {}

/**
 * 色相滑块的挂载点，同时充当该滑块的根节点：其中放置的是 XhColorSlider* 普通部件
 * （control / track / thumb / label / value-text），DOM 带 data-scope="color-slider"。
 * 未写 children 时铺开最简结构：一条轨道加一个拇指。
 */
export function XhColorPickerHueSlider({ children, ...rest }: XhColorPickerHueSliderProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <ColorSliderProvider value={ctx.hueSlider}>
      <div {...mergeReactProps(ctx.api.getHueSliderProps(), rest)}>
        {children ?? <SliderTree />}
      </div>
    </ColorSliderProvider>
  )
}

export interface XhColorPickerAlphaSliderProps extends ComponentPropsWithRef<'div'> {}

/** 透明度滑块的挂载点，同上；alpha 关闭时整条禁用。 */
export function XhColorPickerAlphaSlider({ children, ...rest }: XhColorPickerAlphaSliderProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <ColorSliderProvider value={ctx.alphaSlider}>
      <div {...mergeReactProps(ctx.api.getAlphaSliderProps(), rest)}>
        {children ?? <SliderTree />}
      </div>
    </ColorSliderProvider>
  )
}

/** 未写 children 时的滑块内部：control 中一条 track 与一个 thumb，与手写部件产出的 DOM 一致。 */
function SliderTree(): ReactNode {
  return (
    <XhColorSliderControl>
      <XhColorSliderTrack />
      <XhColorSliderThumb />
    </XhColorSliderControl>
  )
}

export interface XhColorPickerChannelInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue'> {
  /** 该输入框编辑的通道：hex 是整串，r/g/b 是分量，a 是透明度百分数；默认或无法识别时按 hex 处理。 */
  channel?: ColorPickerInputChannel
}

/** 通道身份由本部件自行声明，不必嵌在通道滑杆内。 */
export function XhColorPickerChannelInput({ channel, ...rest }: XhColorPickerChannelInputProps): ReactNode {
  const ctx = useColorPickerContext()
  const resolved = colorPickerToInputChannel(channel)
  return (
    <input
      {...mergeReactProps(
        ctx.api.getChannelInputProps({ channel: resolved }),
        // 草稿攥在机器里，写回走连接层的 onInput。React 要求带 value 的输入交出一个 onChange，
        // 否则在开发构建里逐帧告警；真正的写回不经它
        { onChange: noop },
        rest,
      )}
    />
  )
}

export interface XhColorPickerEyeDropperTriggerProps extends ComponentPropsWithRef<'button'> {}

export function XhColorPickerEyeDropperTrigger({ children, ...rest }: XhColorPickerEyeDropperTriggerProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <button {...mergeReactProps(ctx.api.getEyeDropperTriggerProps(), rest)}>
      {children}
    </button>
  )
}

export interface XhColorPickerSwatchPickerProps extends ComponentPropsWithRef<'div'> {}

/**
 * 预设色板的挂载点，同时充当色板的根节点（role=radiogroup、方向键与 roving tabindex 都在它上面）：
 * 其中放置的是 XhColorSwatchPickerItem，DOM 带 data-scope="color-swatch-picker"。
 * 未写 children 时按 swatches 自动铺开格子。
 */
export function XhColorPickerSwatchPicker({ children, ...rest }: XhColorPickerSwatchPickerProps): ReactNode {
  const ctx = useColorPickerContext()
  // 挂载点的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，格子得焦也会把它叫起来，那一下会把焦点从格子抢回锚点上——
  // 装成原生监听器，到达路径才与另外两家一致
  const bind = useNativeEvents(ctx.api.getSwatchPickerProps(), ['onFocus'])
  return (
    <ColorSwatchPickerProvider value={ctx.swatchPicker}>
      <div {...mergeReactProps(bind.attrs, rest, { ref: bind.ref })}>
        {children ?? ctx.api.swatchPicker.swatches.map(node => <XhColorSwatchPickerItem key={node.value} value={node.value} />)}
      </div>
    </ColorSwatchPickerProvider>
  )
}

export interface XhColorPickerRecentSwatchPickerProps extends ComponentPropsWithRef<'div'> {}

/**
 * 最近使用色的挂载点，与预设色板同一套：其中放置的是 XhColorSwatchPickerItem。
 * 未写 children 时按 recentColors 自动铺开格子；还没有最近使用色时挂载点收起。
 */
export function XhColorPickerRecentSwatchPicker({ children, ...rest }: XhColorPickerRecentSwatchPickerProps): ReactNode {
  const ctx = useColorPickerContext()
  // 与预设色板同理：挂载点的 onFocus 装成原生监听器，格子得焦不把焦点抢回锚点
  const bind = useNativeEvents(ctx.api.getRecentSwatchPickerProps(), ['onFocus'])
  return (
    <ColorSwatchPickerProvider value={ctx.recentSwatchPicker}>
      <div {...mergeReactProps(bind.attrs, rest, { ref: bind.ref })}>
        {children ?? ctx.api.recentSwatchPicker.swatches.map(node => <XhColorSwatchPickerItem key={node.value} value={node.value} />)}
      </div>
    </ColorSwatchPickerProvider>
  )
}

export interface XhColorPickerTagLabelProps extends ComponentPropsWithRef<'span'> {}
/** 标签文字所在的块（tag 的 label）。 */
export function XhColorPickerTagLabel({ children, ...rest }: XhColorPickerTagLabelProps): ReactNode {
  const ctx = useColorPickerContext()
  return <span {...mergeReactProps(ctx.api.getTagLabelProps(), rest)}>{children}</span>
}

/** 标签内容：只有文字时替它包一层 label；作者自己写了节点则原样放行。库自身填入的文字（+N）恒包 label。 */
function tagChildren(children: ReactNode): ReactNode {
  return typeof children === 'string' || slotIsPlainText(children) ? <XhColorPickerTagLabel>{children}</XhColorPickerTagLabel> : children
}

export interface XhColorPickerItemDeleteTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 标签中的删除按钮：即所在标签那份 tag 的 close-trigger，可及名使用 translations.deleteItem；点按摘掉所在标签的颜色，焦点不动。 */
export function XhColorPickerItemDeleteTrigger({ children, ...rest }: XhColorPickerItemDeleteTriggerProps): ReactNode {
  const ctx = useColorPickerContext()
  const value = useColorPickerTagContext()
  return <button {...mergeReactProps(ctx.api.getItemDeleteTriggerProps({ value }), rest)}>{children}</button>
}

export interface XhColorPickerTagProps extends ComponentPropsWithRef<'span'> {
  /** 它代表哪个选中颜色。 */
  value: string
}
/** 多选时一个选中颜色一个标签，即库内 tag 的 root（data-scope="tag"），标签前由皮肤画一个色点。 */
export function XhColorPickerTag({ value, children, ...rest }: XhColorPickerTagProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <ColorPickerTagProvider value={value}>
      <span {...mergeReactProps(ctx.api.getTagProps({ value }), rest)}>{tagChildren(children)}</span>
    </ColorPickerTagProvider>
  )
}

export interface XhColorPickerOverflowTagProps extends ComponentPropsWithRef<'span'> {}
/** 折叠的标签合成的一个标签：有内容时使用内容，否则显示 +N。没有折叠的标签时连接层写 hidden。 */
export function XhColorPickerOverflowTag({ children, ...rest }: XhColorPickerOverflowTagProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <span {...mergeReactProps(ctx.api.getOverflowTagProps(), rest)}>
      {tagChildren(children ?? ctx.api.overflowText)}
    </span>
  )
}

export interface XhColorPickerTagListProps extends ComponentPropsWithRef<'span'> {}
/**
 * 标签行：多选时放在盒里、触发钮之前；单选时连接层写 hidden。
 * 不写 children 即按 tags 铺出带删除钮的标签与 +N 那一枚，写了由作者自己铺。
 */
export function XhColorPickerTagList({ children, ...rest }: XhColorPickerTagListProps): ReactNode {
  const ctx = useColorPickerContext()
  return (
    <span {...mergeReactProps(ctx.api.getTagListProps(), rest)}>
      {children ?? (
        <>
          {ctx.api.tags.map(tag => (
            <XhColorPickerTag key={tag.value} value={tag.value}>
              <XhColorPickerTagLabel>{tag.label}</XhColorPickerTagLabel>
              <XhColorPickerItemDeleteTrigger />
            </XhColorPickerTag>
          ))}
          <XhColorPickerOverflowTag />
        </>
      )}
    </span>
  )
}

export interface XhColorPickerConfirmTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 「添加」：多选时把工作色收进值，浮层不收；单选时连接层写 hidden。文字由作者写。 */
export function XhColorPickerConfirmTrigger({ children, ...rest }: XhColorPickerConfirmTriggerProps): ReactNode {
  const ctx = useColorPickerContext()
  return <button {...mergeReactProps(ctx.api.getConfirmTriggerProps(), rest)}>{children}</button>
}

export interface XhColorPickerHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}

/** 表单出口：颜色随该原生输入提交，对键盘与读屏不可见；多选时一个选中值一份同名输入。 */
export function XhColorPickerHiddenInput({ ...rest }: XhColorPickerHiddenInputProps): ReactNode {
  const ctx = useColorPickerContext()
  if (ctx.api.selectionMode === 'multiple') {
    return ctx.api.value.map(value => (
      <input
        key={value}
        {...mergeReactProps(
          ctx.api.getHiddenInputProps({ value }),
          { onChange: noop },
          rest,
        )}
      />
    ))
  }
  return (
    <input
      {...mergeReactProps(
        ctx.api.getHiddenInputProps(),
        // 值攥在机器里，这份影子输入没有自己的变更出口。React 要求带 value 的输入
        // 交出一个出口，否则在开发构建里逐帧告警；节点是 hidden，这个出口不会被调用
        { onChange: noop },
        rest,
      )}
    />
  )
}

/** 标准结构里各部件对应的组件；委派部件按「组件名/部件名」查，色板的每一格自己铺表单影子、色块与选中标记。 */
const COLOR_PICKER_PARTS = {
  'label': XhColorPickerLabel,
  'control': XhColorPickerControl,
  'tag-list': XhColorPickerTagList,
  'trigger': XhColorPickerTrigger,
  'clear-trigger': XhColorPickerClearTrigger,
  'value-text': XhColorPickerValueText,
  'swatch': XhColorPickerSwatch,
  'positioner': XhColorPickerPositioner,
  'content': XhColorPickerContent,
  'saturation-area': XhColorPickerSaturationArea,
  'area-thumb': XhColorPickerAreaThumb,
  'hue-slider': XhColorPickerHueSlider,
  'alpha-slider': XhColorPickerAlphaSlider,
  'channel-input': XhColorPickerChannelInput,
  'swatch-picker': XhColorPickerSwatchPicker,
  'recent-swatch-picker': XhColorPickerRecentSwatchPicker,
  'confirm-trigger': XhColorPickerConfirmTrigger,
  'hidden-input': XhColorPickerHiddenInput,
  'color-slider/control': XhColorSliderControl,
  'color-slider/track': XhColorSliderTrack,
  'color-slider/thumb': XhColorSliderThumb,
  'color-swatch-picker/item': XhColorSwatchPickerItem,
  'tag/tag': XhColorPickerTag,
  'tag/tag-label': XhColorPickerTagLabel,
  'tag/item-delete-trigger': XhColorPickerItemDeleteTrigger,
  'tag/overflow-tag': XhColorPickerOverflowTag,
}

/** 色板的每一格自己铺表单影子、色块与选中标记，铺结构时去掉这几格。 */
function withoutSelfAssembled(nodes: readonly StructureChild[]): StructureChild[] {
  return nodes.map((node): StructureChild => {
    if (!('part' in node) || !node.children)
      return node
    if (node.component === 'color-swatch-picker' && node.part === 'item')
      return { ...node, children: [] }
    return { ...node, children: withoutSelfAssembled(node.children) }
  })
}

/**
 * 未写 children 时铺开的整套结构：照 headless 的 colorPickerStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。文字以外的标题内容交给 label 部件。
 */
function renderDefaultStructure(api: ColorPickerApi, label: ReactNode, hiddenInput: boolean): ReactNode[] {
  const slotted = label != null && typeof label !== 'string'
  const nodes = colorPickerStructure(api, { label: typeof label === 'string' ? label : undefined, hiddenInput, slotted: name => name === 'label' && slotted })
  return renderStructure(withoutSelfAssembled(nodes), COLOR_PICKER_PARTS, node => (node.slot ? label : undefined))
}
