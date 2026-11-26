/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 number field 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface NumberFieldValueChangeDetails {
  /** 原始输入串，也是提交进 FormData 的值；给了 formatOptions 时也是这一串，不是失焦后显示的格式化文字。 */
  value: string
  /** 同一个值的数值形态；空串或非法输入时是 NaN。 */
  valueAsNumber: number
}

/** 接了按压通道的两颗钮，按 part 键记住正被按住的那颗。 */
export type NumberFieldPressedPart = 'increment' | 'decrement'

export interface NumberFieldSchema extends MachineSchema {
  props: {
    /**
     * 作者渲染了 label 部件时置真，由适配器统计而不是判断标题文字是否有值。
     * 为假时可聚焦部件不把 label 的 id 写进 aria-labelledby：指向未渲染的 id 是无效引用，作者写在控件上的 aria-label 也会被它压住。
     */
    labelled?: boolean
    /**
     * 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上。
     * 放进字段（字段接线）或渲染了 label 部件时名字以它们为准，aria-labelledby 盖过它。
     */
    ariaLabel?: string
    value?: string
    defaultValue?: string
    min?: number
    max?: number
    /** 方向键与加减按钮的步长，默认 1。给了 precision 时它的小数位不应多于 precision，否则每一步都会被取整吃掉。 */
    step?: number
    /** PageUp / PageDown 的步长，默认 10 倍 step。 */
    largeStep?: number
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    invalid?: boolean
    /** 表单字段名；提供后才参与提交。 */
    name?: string
    /** 值为空时输入框显示的提示文字。 */
    placeholder?: string
    /** 按住加减按钮多久开始连发，默认 300ms。 */
    changeDelay?: number
    /** 连发开始时的间隔，默认 50ms；按住越久间隔越短，逐次收到 minChangeInterval。 */
    changeInterval?: number
    /**
     * 连发加速后的最短间隔，默认 10ms：按住越久步进越快，每连发一次间隔缩到上一次的 0.85，缩到这里为止。
     * 写成与 changeInterval 相同的数即关掉加速，按固定节奏连发。
     */
    minChangeInterval?: number
    /**
     * 失焦时把越界的值夹回 [min, max]，默认开启。关掉后越界值原样留在框里（仍按 format 规范显示），
     * 由 outOfRange 与 data-out-of-range 报出来，交给表单层提示；步进照旧不会越界。
     */
    clampValueOnBlur?: boolean
    /** 形态：outline / subtle / ghost，决定底色与描边的绘制方式。默认 outline。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦强调使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定输入框与加减按钮的几何档位。 */
    size?: Size
    /**
     * 显示串 → 数。默认按 `Number()` 读取（'12abc' 判为非法），提供后替换为它：
     * 千位分隔符、单位后缀、百分号等都依靠它读回。无法读出数时返回 `NaN`。
     *
     * 与 `format` 必须互逆：`format` 输出的串要能被 `parse` 读回同一个数，
     * 否则按一次加号值会漂移。
     */
    parse?: (text: string) => number
    /**
     * 数 → 显示串。默认 `String(n)`。只在组件自行改写显示时使用：步进、取端点、
     * 失焦规范化三处；用户正在输入时一律不触碰，否则光标会被打断。
     */
    format?: (value: number) => string
    /**
     * 提交时保留几位小数：失焦规范化、步进与取端点写回的值四舍五入到这么多位并补齐（12.5 写成 12.50），
     * 一半时远离零进位。整数，夹进 [0, 20]；不给时不取整，步进后的小数位跟着 step 与当前值走。
     * 用户正在输入时不动；与 format 同在时先取整再交给 format。
     */
    precision?: number
    /**
     * 交给 Intl.NumberFormat 的选项：分组、货币、百分比、单位、紧凑记数等，与统计数值的同名选项同一口径。
     * 给了它，输入框失焦时按格式显示，聚焦编辑时换回可编辑的原值（即 value 这一串）；value、onValueChange 与表单提交
     * 始终是原值，提交经 hidden-input 部件走。值为空或读不出数时原样显示。
     * 给了 precision 而选项里没写任何小数位或有效位时，显示的小数位跟 precision 走。选项不合法时格式化当场报错。
     */
    formatOptions?: Intl.NumberFormatOptions
    /**
     * BCP 47 语言标记，决定 formatOptions 显示时的小数点、分组符、数字系统与货币写法；不影响编辑与提交的原值。
     * 未提供时取全局配置的 locale，再没有按宿主语言，宿主也没有时按 en-US。
     */
    locale?: string
    onValueChange?: (details: NumberFieldValueChangeDetails) => void
  }
  context: {
    value: string
    pressDirection: 1 | -1
    /** 按压通道：被 Space / Enter 或触屏按住的那颗钮；抬起、失焦、指针取消或按不了时即撤下。 */
    pressed: NumberFieldPressedPart | null
    /** 焦点在输入框里：给了 formatOptions 时据此在格式化文字与可编辑的原值之间切换。 */
    focused: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** spinning = 加减按钮被按住，松开或指针移出即回到 idle。 */
  state: 'idle' | 'spinning'
  event:
    | { type: 'VALUE.SET', value: string }
    | { type: 'VALUE.STEP', direction: 1 | -1, large?: boolean }
    | { type: 'VALUE.TO_MIN' }
    | { type: 'VALUE.TO_MAX' }
    /** 输入框得焦：给了 formatOptions 时显示换回可编辑的原值。 */
    | { type: 'INPUT.FOCUS' }
    /** 失焦时把显示串规范化并夹回区间；输入途中不打断用户。 */
    | { type: 'INPUT.BLUR' }
    /** 指针按住加减钮：先走一步，随后进入 spinning 连发。 */
    | { type: 'PRESS.START', direction: 1 | -1 }
    /** 松开、移出或取消指针：停止连发。 */
    | { type: 'PRESS.END' }
    | { type: 'after.changeInterval' }
    | { type: 'FORM.RESET' }
    /** 加减钮被 Space / Enter 或触屏按住：只投影按压面，不改步进；禁用、只读或该侧已贴住端点时被守卫拦截。 */
    | { type: 'TRIGGER.PRESS.START', part: NumberFieldPressedPart }
    /** 按住的加减钮抬起、失焦或指针取消。 */
    | { type: 'TRIGGER.PRESS.END', part: NumberFieldPressedPart }
  tag: never
  guard: 'canStep' | 'canPressTrigger'
  action: 'setValue' | 'stepValue' | 'toMin' | 'toMax' | 'normalize' | 'markFocused' | 'markBlurred' | 'setDirection' | 'resetToDefault' | 'startTriggerPress' | 'endTriggerPress' | 'releaseWhenInert'
  effect: 'spin'
}

export interface NumberFieldApi<T extends PropTypes = PropTypes> {
  value: string
  valueAsNumber: number
  /** 值为空或非法。 */
  empty: boolean
  /**
   * 输入框此刻显示的文字：给了 formatOptions、值读得出数且焦点不在输入框里时是格式化后的文字，其余时候就是 value。
   */
  displayValue: string
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  canIncrement: boolean
  canDecrement: boolean
  /** 值是合法数字但落在 [min, max] 之外。只有关掉 clampValueOnBlur 或受控写入时才会在失焦后仍为真。 */
  outOfRange: boolean
  setValue: (next: string) => void
  increment: () => void
  decrement: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  /** 必需的唯一输入壳：皮肤把视觉盒绘制在它身上，输入在左，减、加动作依次收在右侧。 */
  getControlProps: () => T['element']
  /** 输入框前的装饰段（货币符、单位、图标）；对读屏隐藏，不参与名字链。 */
  getPrefixProps: () => T['element']
  getInputProps: () => T['input']
  /** 输入框后的装饰段；对读屏隐藏，不参与名字链。 */
  getSuffixProps: () => T['element']
  getIncrementTriggerProps: () => T['button']
  getDecrementTriggerProps: () => T['button']
  /**
   * 表单出口：给了 formatOptions 时 name 从输入框挪到这里，提交的是原值而不是失焦后显示的格式化文字；
   * 没给 formatOptions 时它不带 name，提交照旧走输入框。
   */
  getHiddenInputProps: () => T['input']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface NumberFieldTranslations {}
