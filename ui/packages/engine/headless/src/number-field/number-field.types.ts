/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 number field 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface NumberFieldValueChangeDetails {
  /** 原始输入串，也是提交进 FormData 的值。 */
  value: string
  /** 同一个值的数值形态；空串或非法输入时是 NaN。 */
  valueAsNumber: number
}

/** 接了按压通道的两颗钮，按 part 键记住正被按住的那颗。 */
export type NumberFieldPressedPart = 'increment' | 'decrement'

export interface NumberFieldSchema extends MachineSchema {
  props: {
    value?: string
    defaultValue?: string
    min?: number
    max?: number
    /** 方向键与加减按钮的步长，默认 1。 */
    step?: number
    /** PageUp / PageDown 的步长，默认 10 倍 step。 */
    largeStep?: number
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    invalid?: boolean
    /** 表单字段名；提供后才参与提交。 */
    name?: string
    /** 按住加减按钮多久开始连发，默认 300ms。 */
    changeDelay?: number
    /** 连发间隔，默认 50ms。 */
    changeInterval?: number
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
    onValueChange?: (details: NumberFieldValueChangeDetails) => void
  }
  context: {
    value: string
    pressDirection: 1 | -1
    /** 按压通道：被 Space / Enter 或触屏按住的那颗钮；抬起、失焦、指针取消或按不了时即撤下。 */
    pressed: NumberFieldPressedPart | null
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
  action: 'setValue' | 'stepValue' | 'toMin' | 'toMax' | 'normalize' | 'setDirection' | 'resetToDefault' | 'startTriggerPress' | 'endTriggerPress' | 'releaseWhenInert'
  effect: 'spin'
}

export interface NumberFieldApi<T extends PropTypes = PropTypes> {
  value: string
  valueAsNumber: number
  /** 值为空或非法。 */
  empty: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  canIncrement: boolean
  canDecrement: boolean
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
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface NumberFieldTranslations {}
