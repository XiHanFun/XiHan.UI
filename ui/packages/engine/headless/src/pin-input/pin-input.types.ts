/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 pin input 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/** 每格接受的字符类别：决定字符过滤规则与移动端键盘类型。 */
export type PinInputType = 'numeric' | 'alphanumeric' | 'alphabetic'

/** 读屏文案，默认英文。 */
export interface PinInputTranslations {
  /** 单格的可及名，入参为 1 基格号与总格数。 */
  input: (index: number, length: number) => string
}

export interface PinInputValueChangeDetails {
  /** 逐格的值。长度恒等于 length，未填的格为空串，每格至多一个字符。 */
  value: string[]
  /** 同一份值拼成的串；表单提交与是否填满的判断都使用它。 */
  valueAsString: string
}

/**
 * 格子的声明：下标由作者在部件上声明，connect 据此产出属性。
 * connect 在 render 期求值，此时 DOM 尚不存在，不得读取 DOM。
 */
export interface PinInputInputProps {
  index: number
}

export interface PinInputSchema extends MachineSchema {
  props: {
    /** 逐格的值。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 */
    value?: string[]
    defaultValue?: string[]
    /** 格数，默认 6。值的长度恒归一到它。 */
    length?: number
    /** 接受的字符类别，默认 numeric。同时决定移动端弹出的键盘类型。 */
    type?: PinInputType
    /**
     * 自定义准入：一段正则源码，逐个字符整格匹配（内部自动加首尾锚与 u 标志，
     * 因此写 `[0-9A-Fa-f]` 即可，不必自行写 `^...$`）。提供后覆盖 type 的准入表。
     *
     * 弹出的键盘类型仍由 type 决定：准入放宽到字母时需要把 type 一并修改，
     * 否则移动端弹出的仍是数字键盘，用户无法输入这些字符。
     *
     * 无法编译为正则时回退为 type 的准入表，不抛错。
     */
    pattern?: string
    /** 遮蔽显示：输入框改为 type=password。 */
    mask?: boolean
    /** 一次性验证码：补充 autocomplete=one-time-code，短信验证码才能被系统自动填入。 */
    otp?: boolean
    /** 空格子的占位字符。 */
    placeholder?: string
    /** 禁用：每格都带原生 disabled（不可聚焦、不可输入），隐藏输入不参与提交。 */
    disabled?: boolean
    /** 只读：每格仍可聚焦、可复制，不可写入；隐藏输入照常参与提交。 */
    readOnly?: boolean
    /** 必填标注：每格都带原生 required。 */
    required?: boolean
    /** 校验失败标注。 */
    invalid?: boolean
    /** 填满即移走焦点，常用于填满后自动提交的表单。 */
    blurOnComplete?: boolean
    /** 表单字段名；提供后隐藏输入才带 name，整串值随表单一并提交。 */
    name?: string
    /** 形态：outline / subtle / ghost，决定底色与描边的绘制方式。默认 outline。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    translations?: Partial<PinInputTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: PinInputValueChangeDetails) => void
    /** 每格都填满时触发；值未实际变化时不重复触发。 */
    onValueComplete?: (details: PinInputValueChangeDetails) => void
  }
  context: {
    /** 逐格的值。受控（value 提供）时 cell 直读 prop。 */
    value: string[]
    /**
     * 焦点应落在哪一格；焦点离开整组时为 -1。不参与值的计算。
     *
     * 存放的是裁定后的下标而不是作者点击的格：按顺序录入时它不会越过第一个空格，
     * 连接层据此把焦点交到应到的格子上。
     *
     * 值的写入顺带挪它：铺字后落到铺完的下一格（`blurOnComplete` 且填满时为 -1），清格后停在
     * 清掉的那一格。这一步只按刚写下的值裁，不回读 context——受控值要等宿主重渲才写回，
     * 回读到的仍是旧值。
     */
    focusedIndex: number
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    /** 整份替换（外部 setValue）。 */
    | { type: 'VALUE.SET', value: string[] }
    /**
     * 从 index 起把 value 逐字符铺开，超出末格的部分截断。单字符输入与整串粘贴走同一路径。
     * 铺完把锚点挪到紧接着的下一格。
     */
    | { type: 'VALUE.FILL', index: number, value: string }
    /** 清除某一格，锚点停在这一格上。 */
    | { type: 'VALUE.CLEAR_AT', index: number }
    /** 清空整组。 */
    | { type: 'VALUE.CLEAR' }
    /**
     * 焦点要落到某一格：DOM 焦点已落上去，或连接层准备把焦点搬过去。机器裁定锚点，
     * 连接层再照锚点搬。锚点已在这一格上时不再裁。
     */
    | { type: 'INPUT.FOCUS', index: number }
    | { type: 'INPUT.BLUR' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canEdit'
  action: 'setValue' | 'fillValue' | 'clearValueAt' | 'clearValue' | 'setFocusedIndex' | 'clearFocusedIndex' | 'resetToDefault'
  effect: never
}

export interface PinInputApi<T extends PropTypes = PropTypes> {
  /** 逐格的值，长度恒等于 length。 */
  value: string[]
  valueAsString: string
  /** 每格都已填满。作者据此启用提交按钮。 */
  complete: boolean
  length: number
  /** 焦点应落在哪一格；焦点在组外时为 -1。按顺序录入时它不会越过第一个空格。 */
  focusedIndex: number
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  setValue: (next: string[]) => void
  clear: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  /** 相邻的几格划为一段（123-456 这类分段写法）；纯排版，不参与下标计算。 */
  getGroupProps: () => T['element']
  getInputProps: (props: PinInputInputProps) => T['input']
  /** 段与段之间的分隔；对读屏隐藏，朗读只会打断验证码。 */
  getSeparatorProps: () => T['element']
  /** 整份验证码的表单出口：一份 type=hidden 的原生输入，随表单提交拼接后的串。 */
  getHiddenInputProps: () => T['input']
}
