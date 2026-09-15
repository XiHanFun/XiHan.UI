/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 tags input 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface TagsInputValueChangeDetails {
  /** 变化后的标签集合：已去重、去掉首尾空白，顺序即加入顺序。 */
  value: string[]
}

export interface TagsInputInputValueChangeDetails {
  /** 输入框中尚未成为标签的文本。 */
  inputValue: string
}

/**
 * 焦点离开整个组件时输入框中残留文本的处置方式。
 * 默认（undefined / null）= 原样保留，用户回来后继续输入。
 */
export type TagsInputBlurBehavior = 'add' | 'clear'

/** 读屏文案，默认英文。 */
export interface TagsInputTranslations {
  /** 删除按钮（tag 的 close-trigger）的 aria-label：按钮内通常只有一个叉，读屏无法朗读删除的是哪一个标签。 */
  deleteItem: (value: string) => string
  /** 就地编辑框的 aria-label：它没有可见标题，不提供名字时读屏只会朗读「编辑框」。 */
  editTagInput: (value: string) => string
  clearTrigger: string
}

/**
 * 条目的声明：标签值由作者在部件上声明，connect 据此产出属性。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface TagsInputItemProps {
  value: string
}

export interface TagsInputSchema extends MachineSchema {
  props: {
    /** 受控标签集合；提供后由宿主决定，状态机不自行修改，只发 onValueChange。 */
    value?: string[]
    /** 非受控初始标签集合。 */
    defaultValue?: string[]
    /** 受控输入文本；与 value 各自独立受控。 */
    inputValue?: string
    /** 非受控初始输入文本。 */
    defaultInputValue?: string
    /** 标签数量上限。默认不限；写 0 表示不允许添加任何标签。 */
    max?: number
    /**
     * 允许超过 max。
     * 关闭（默认）：到达上限后本次输入整体不生效，文本原样留在框中，不静默丢弃。
     * 开启：照常添加，只在 root / control 上输出 data-overflowing 供样式与提示使用。
     */
    allowOverflow?: boolean
    disabled?: boolean
    readOnly?: boolean
    /** 必填标注：经 aria-required 上报，星号由外层的字段壳绘制。 */
    required?: boolean
    invalid?: boolean
    /** 显示计数部件：关闭时 count 部件带 hidden 收起。 */
    showCount?: boolean
    /** 表单字段名；提供后 hidden-input 才带 name，此时整份标签按 delimiter 拼接为一串提交。 */
    name?: string
    placeholder?: string
    /**
     * 断词符，默认逗号。输入它即断词为标签，粘贴时也按它拆分。
     * 显式提供空串即关闭断词：此时只有 Enter 能把文本变为标签。
     */
    delimiter?: string
    /** 粘贴时接管：按 delimiter 拆分为多个标签。默认关闭（交给浏览器照常粘贴进框中）。 */
    addOnPaste?: boolean
    /** 允许双击标签就地修改。默认关闭。 */
    editable?: boolean
    /** 焦点离开整个组件时输入框中残留文本的处置方式。 */
    blurBehavior?: TagsInputBlurBehavior | null
    /** 形态：outline / subtle / ghost，决定颜色的使用方式。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    translations?: Partial<TagsInputTranslations>
    onValueChange?: (details: TagsInputValueChangeDetails) => void
    onInputValueChange?: (details: TagsInputInputValueChangeDetails) => void
  }
  context: {
    /** 标签集合。受控（value 提供）时 cell 直读 prop，写入只发 onValueChange 不修改内部值。 */
    value: string[]
    /** 输入框文本，同样是 cell 原生受控。 */
    inputValue: string
    /** 光标停在哪个标签上：navigating 时是高亮项、editing 时是被编辑项，两态共用一个锚点。 */
    focusedValue: string | null
    /** 就地编辑的缓冲；提交前不修改 value，Escape 撤销即丢弃它。 */
    editedValue: string
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /**
   * idle = 焦点在输入框、没有标签被选中；
   * navigating = 光标在标签之间移动（Backspace 第一次、方向键）；
   * editing = 某个标签正被就地改写。
   */
  state: 'idle' | 'navigating' | 'editing'
  event:
    /** 整份替换标签集合（公开 API）；会去重去空白，但不受 max 约束。 */
    | { type: 'VALUE.SET', value: string[] }
    /** 追加一批标签，不修改输入框（粘贴与公开 API 经过它）。 */
    | { type: 'TAG.ADD', values: string[] }
    /** 清空标签与输入框。 */
    | { type: 'VALUE.CLEAR' }
    /** 用户输入或作者调用 setInputValue；文本中含 delimiter 时在这里断词。 */
    | { type: 'INPUT.CHANGE', value: string }
    /** 把输入框中的文本变为标签（Enter）。 */
    | { type: 'INPUT.COMMIT' }
    /** 焦点离开整个组件，按 blurBehavior 处置残留文本。 */
    | { type: 'INPUT.BLUR' }
    /** 把光标移到某个标签上；value 为 null 即交回输入框。 */
    | { type: 'TAG.HIGHLIGHT', value: string | null }
    | { type: 'TAG.DELETE', value: string }
    | { type: 'TAG.EDIT', value: string }
    | { type: 'EDIT.CHANGE', value: string }
    | { type: 'EDIT.SUBMIT' }
    | { type: 'EDIT.CANCEL' }
    /** 适配器补报：承载焦点的标签节点被移出 DOM，浏览器不会为此派发 focusout。 */
    | { type: 'ITEM.FOCUS_LOST' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canEdit' | 'canEditTag' | 'canDeleteWithPrev' | 'hasHighlightTarget'
  action:
    | 'setValue'
    | 'addTags'
    | 'clearAll'
    | 'setInputValue'
    | 'commitInput'
    | 'applyBlurBehavior'
    | 'setFocusedValue'
    | 'clearFocusedValue'
    | 'deleteTag'
    | 'startEdit'
    | 'setEditedValue'
    | 'commitEdit'
    | 'cancelEdit'
    | 'resetToDefault'
  effect: 'focusEditInput'
}

export interface TagsInputApi<T extends PropTypes = PropTypes> {
  value: string[]
  /** 标签个数，等于 value.length；作者常用它做「3 / 5」这类计数提示。 */
  count: number
  inputValue: string
  /** 没有任何标签。 */
  empty: boolean
  disabled: boolean
  readOnly: boolean
  required: boolean
  invalid: boolean
  /** 标签个数的上限；未设 max 时为 undefined，此时只渲染当前个数。 */
  max: number | undefined
  /** 计数部件当前是否显示（开启了 showCount）。 */
  showCount: boolean
  /** 已到达 max：无法再添加（allowOverflow 开启时只是提示，不拦截）。 */
  atMax: boolean
  /** 已超过 max（只有 allowOverflow 开启时才可能为真）。 */
  overflow: boolean
  /** 光标停留的标签；不在标签间移动时为 null。 */
  highlightedValue: string | null
  /** 正被就地改写的标签；不在编辑态时为 null。 */
  editedValue: string | null
  /** 清空按钮当前是否可用（可编辑，且标签或输入文本至少有一项）。 */
  canClear: boolean
  /** 整份替换，去重去空白，不受 max 约束。 */
  setValue: (next: string[]) => void
  /** 追加一个标签，受 max 与 allowOverflow 约束。 */
  addValue: (next: string) => void
  deleteValue: (value: string) => void
  clear: () => void
  setInputValue: (next: string) => void
  /** 把光标移到某个标签上；传 null 即交回输入框。 */
  highlight: (value: string | null) => void
  /** 进入就地编辑；未开启 editable 时被守卫拦截。 */
  edit: (value: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  getInputProps: () => T['input']
  getItemProps: (item: TagsInputItemProps) => T['element']
  /** 标签的预览：即库内 tag 的 root（data-scope="tag"），就地编辑时收起；双击进入编辑态。 */
  getItemPreviewProps: (item: TagsInputItemProps) => T['element']
  /** 标签文字：tag 的 label，截断落在该层。 */
  getItemTextProps: (item: TagsInputItemProps) => T['element']
  /** 删除按钮：所在标签那份 tag 的 close-trigger，不占 Tab 位；禁用与只读时保留位置、原生 disabled。 */
  getItemDeleteTriggerProps: (item: TagsInputItemProps) => T['button']
  getItemInputProps: (item: TagsInputItemProps) => T['input']
  getClearTriggerProps: () => T['button']
  /** 计数部件：承载 count / max 两个数字，未开启 showCount 时带 hidden 收起。 */
  getCountProps: () => T['element']
  getHiddenInputProps: () => T['input']
}
