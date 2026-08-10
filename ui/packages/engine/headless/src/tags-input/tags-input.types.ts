import type { PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export interface TagsInputValueChangeDetails {
  /** 变化后的标签集合：已去重、去掉首尾空白，顺序即加入顺序。 */
  value: string[]
}

export interface TagsInputInputValueChangeDetails {
  /** 输入框里还没成为标签的那段文本。 */
  inputValue: string
}

/**
 * 焦点离开整个组件时怎么处置输入框里的残留文本。
 * 缺省（undefined / null）= 原样留着，用户回来接着打。
 */
export type TagsInputBlurBehavior = 'add' | 'clear'

/** 读屏用的文案，默认英文。 */
export interface TagsInputTranslations {
  /** 删除按钮的 aria-label：按钮里通常只有一个叉，读屏念不出删的是哪一个标签。 */
  deleteTagTrigger: (value: string) => string
  /** 就地编辑框的 aria-label：它没有可见标题，不给名字读屏只会念"编辑框"。 */
  editTagInput: (value: string) => string
  clearTrigger: string
}

/**
 * 条目自报家门：标签值由作者在部件上声明，connect 据此产出属性。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface TagsInputItemProps {
  value: string
}

export interface TagsInputSchema extends MachineSchema {
  props: {
    /** 受控标签集合；给了就由宿主说了算，机器不自改，只发 onValueChange。 */
    value?: string[]
    /** 非受控初始标签集合。 */
    defaultValue?: string[]
    /** 受控输入文本；与 value 各自独立受控。 */
    inputValue?: string
    /** 非受控初始输入文本。 */
    defaultInputValue?: string
    /** 最多几个标签。缺省不限；写 0 表示一个也不许加。 */
    max?: number
    /**
     * 允许越过 max。
     * 关（默认）：顶到上限后这一次输入整体不生效，文本原样留在框里，绝不悄悄吞掉。
     * 开：照加不误，只在 root / control 上打出 data-overflow 供样式与提示使用。
     */
    allowOverflow?: boolean
    disabled?: boolean
    readOnly?: boolean
    invalid?: boolean
    /** 表单字段名；给了 hidden-input 才带 name，此时整份标签按 delimiter 拼成一串提交。 */
    name?: string
    placeholder?: string
    /**
     * 断词符，默认逗号。打字打出它即断词成标签，粘贴时也按它拆。
     * 显式给空串即关掉断词：此时只有 Enter 能把文本变成标签。
     */
    delimiter?: string
    /** 粘贴时接管：按 delimiter 拆成多个标签。默认关（交给浏览器照常粘进框里）。 */
    addOnPaste?: boolean
    /** 允许双击标签就地改。默认关。 */
    editable?: boolean
    /** 焦点离开整个组件时怎么处置输入框里的残留文本。 */
    blurBehavior?: TagsInputBlurBehavior | null
    /** 形态：outline / subtle / ghost，决定颜色怎么用。 */
    variant?: string
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: string
    /** 尺寸：sm / md / lg。 */
    size?: string
    translations?: Partial<TagsInputTranslations>
    onValueChange?: (details: TagsInputValueChangeDetails) => void
    onInputValueChange?: (details: TagsInputInputValueChangeDetails) => void
  }
  context: {
    /** 标签集合。受控（value 给定）时 cell 直读 prop，写只发 onValueChange 不改内部值。 */
    value: string[]
    /** 输入框文本，同样是 cell 原生受控。 */
    inputValue: string
    /** 光标停在哪个标签上：navigating 时是高亮项、editing 时是被编辑项，两态共用一个锚点。 */
    focusedValue: string | null
    /** 就地编辑的缓冲；提交前不碰 value，Escape 撤销就是把它丢掉。 */
    editedValue: string
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /**
   * idle = 焦点在输入框、没有标签被选中；
   * navigating = 光标在标签之间走（Backspace 第一下、方向键）；
   * editing = 某个标签正被就地改写。
   */
  state: 'idle' | 'navigating' | 'editing'
  event:
    /** 整份替换标签集合（公开 API）；会去重去空白，但不受 max 约束。 */
    | { type: 'VALUE.SET', value: string[] }
    /** 追加一批标签，不动输入框（粘贴与公开 API 走它）。 */
    | { type: 'TAG.ADD', values: string[] }
    /** 清空标签与输入框。 */
    | { type: 'VALUE.CLEAR' }
    /** 用户敲字或作者调 setInputValue；文本里含 delimiter 时在这里断词。 */
    | { type: 'INPUT.CHANGE', value: string }
    /** 把输入框里的文本变成标签（Enter）。 */
    | { type: 'INPUT.COMMIT' }
    /** 焦点离开整个组件，按 blurBehavior 处置残留文本。 */
    | { type: 'INPUT.BLUR' }
    /** 把光标挪到某个标签上；value 为 null 即交回输入框。 */
    | { type: 'TAG.HIGHLIGHT', value: string | null }
    | { type: 'TAG.DELETE', value: string }
    | { type: 'TAG.EDIT', value: string }
    | { type: 'EDIT.CHANGE', value: string }
    | { type: 'EDIT.SUBMIT' }
    | { type: 'EDIT.CANCEL' }
    /** 适配器补报：承载焦点的标签节点被移出 DOM，浏览器不会为此派 focusout。 */
    | { type: 'ITEM.FOCUS_LOST' }
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
  effect: 'focusEditInput'
}

export interface TagsInputApi<T extends PropTypes = PropTypes> {
  value: string[]
  /** 标签个数，等于 value.length；作者常拿它做"3 / 5"这类计数提示。 */
  count: number
  inputValue: string
  /** 一个标签都没有。 */
  empty: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 已顶到 max：再加进不去（allowOverflow 开时只是提示，不拦）。 */
  atMax: boolean
  /** 已经越过 max（只有 allowOverflow 开着才可能为真）。 */
  overflow: boolean
  /** 光标停着的标签；没在标签间走时为 null。 */
  highlightedValue: string | null
  /** 正被就地改写的标签；不在编辑态时为 null。 */
  editedValue: string | null
  /** 清空按钮此刻是否可用（可编辑，且标签或输入文本至少有一样）。 */
  canClear: boolean
  /** 整份替换，去重去空白，不受 max 约束。 */
  setValue: (next: string[]) => void
  /** 追加一个标签，受 max 与 allowOverflow 约束。 */
  addValue: (next: string) => void
  deleteValue: (value: string) => void
  clear: () => void
  setInputValue: (next: string) => void
  /** 把光标挪到某个标签上；传 null 即交回输入框。 */
  highlight: (value: string | null) => void
  /** 进入就地编辑；未开 editable 时被守卫挡下。 */
  edit: (value: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  getInputProps: () => T['input']
  getItemProps: (item: TagsInputItemProps) => T['element']
  getItemPreviewProps: (item: TagsInputItemProps) => T['element']
  getItemTextProps: (item: TagsInputItemProps) => T['element']
  getItemDeleteTriggerProps: (item: TagsInputItemProps) => T['button']
  getItemInputProps: (item: TagsInputItemProps) => T['input']
  getClearTriggerProps: () => T['button']
  getHiddenInputProps: () => T['input']
}
