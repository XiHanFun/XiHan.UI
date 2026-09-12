import type { Cleanup, Direction, Layer, MachineSchema, OverlayBackdropVariant, OverlayCloseReason, PropTypes, RuntimeConfig, Size } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

export interface CommandTranslations {
  /** 面板本身的无障碍名，落在 content 上。 */
  title: string
  /** 检索框的无障碍名。 */
  input: string
  /** 结果列表的无障碍名。 */
  list: string
}

// 适配器在挂载前填入 DOM 环境与元素 getter；纯逻辑测试下保持缺省（副作用不挂）。
export interface CommandRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与全部模态行为资源共享的 Presence；缺省时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 展开期间 modal 改值时同步焦点约束、滚动锁与背景失活。 */
  syncModalResources: (() => void) | null
  getContentEl: () => HTMLElement | null
  getListEl: () => HTMLElement | null
  /** 私有接线：List 提交或释放后通知当前可见性效应重新绑定。 */
  syncListVisibility: (() => void) | null
  getInputEl: () => HTMLInputElement | null
}

/** 一条命令。 */
export interface CommandNode {
  value: string
  /** 展示文本，也是检索取字处；缺省退回 value。 */
  label?: string
  /** 标题之外一并参与检索的别名，例如英文名、拼音、旧称。 */
  keywords?: readonly string[]
  /** 归到哪一组；不写即不归组，渲染时不套分组外壳。 */
  group?: string
  /** 条目禁用：方向键跳过它，点击与确认键都不选中。 */
  disabled?: boolean
}

/** 单条命令的元信息，由清单推出，不含高亮态。 */
export interface CommandNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  /** 恒为数组。 */
  keywords: readonly string[]
  /** 没归组时是空串。 */
  group: string
  disabled: boolean
}

/** 分组声明：只给组名与显示文本，成员由条目自己认领。 */
export interface CommandGroup {
  value: string
  /** 分组标题；缺省退回 value。 */
  label?: string
}

/** 过滤归组之后的一组命令；空组不出现在结果里。 */
export interface CommandGroupMeta {
  value: string
  label: string
  items: readonly CommandNodeMeta[]
}

export interface CommandOpenChangeDetails {
  open: boolean
  /**
   * 这一次是怎么关的；展开时不带。
   * 用它区分「选中命令后收起」与「用户取消」。
   */
  reason?: OverlayCloseReason
}

export interface CommandInputValueChangeDetails {
  inputValue: string
}

export interface CommandSelectDetails {
  /** 选中命令的 value。 */
  value: string
  /** 选中那一刻的显示文本。 */
  label: string
}

export interface CommandSchema extends MachineSchema {
  props: {
    /** 命令清单，标题、别名、归组与禁用的事实源。 */
    collection?: readonly CommandNode[]
    /** 分组声明，决定组名与组序；清单里出现而这里没声明的组排在后面。 */
    groups?: readonly CommandGroup[]
    open?: boolean
    defaultOpen?: boolean
    inputValue?: string
    defaultInputValue?: string
    /** 内置过滤，默认开。关掉即由调用方自己筛，交进来的 collection 就是此刻该显示的那几条。 */
    filter?: boolean
    /** 过滤区分大小写，缺省不区分。 */
    caseSensitive?: boolean
    /** 选中一条命令后收起面板，默认 true。 */
    closeOnSelect?: boolean
    /** 模态（陷焦点、锁滚动、遮罩交互外关闭），默认 true。 */
    modal?: boolean
    closeOnEscape?: boolean
    closeOnInteractOutside?: boolean
    restoreFocus?: boolean
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 命令还在取：列表报 aria-busy，在途占位顶上来，空态占位让位。 */
    loading?: boolean
    /** 检索框的占位文字。 */
    placeholder?: string
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /** 尺寸：sm / md / lg。只换面板宽度与条目的几何档位。 */
    size?: Size
    /** 遮罩形态：opaque / blur / transparent。落在 backdrop 上，只换那一层的底色与模糊。 */
    variant?: OverlayBackdropVariant
    translations?: Partial<CommandTranslations>
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: CommandOpenChangeDetails) => void
    /** 检索串变化意图回调。 */
    onInputValueChange?: (details: CommandInputValueChangeDetails) => void
    /** 选中一条命令：库不执行任何动作，做什么全归这里。 */
    onSelect?: (details: CommandSelectDetails) => void
  }
  context: {
    /** 检索串；给定 inputValue 即受控。 */
    inputValue: string
    /** 键盘锚点，不承载焦点，只经 aria-activedescendant 上报；收起时为 null。 */
    highlightedValue: string | null
    /** 已挂载条目的显式 hidden 镜像；未挂载的虚拟候选不在其中。 */
    hiddenValues: string[]
  }
  computed: Record<string, never>
  refs: CommandRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'TOGGLE' }
    | { type: 'CLOSE', src?: 'esc' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    | { type: 'INPUT.CHANGE', value: string }
    | { type: 'INPUT.SET', value: string }
    | { type: 'ITEM.HIGHLIGHT', value: string }
    | { type: 'HIGHLIGHT.CLEAR' }
    | { type: 'ITEM.SELECT', value: string, label: string }
  tag: never
  guard: 'isOpenControlled' | 'keepsOpenOnSelect'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'setInputValue'
    | 'resetInputValue'
    | 'setHighlightedValue'
    | 'clearHighlightedValue'
    | 'highlightFirst'
    | 'highlightIfDangling'
    | 'highlightVisibleIfDangling'
    | 'invokeOnSelect'
    | 'syncModalResources'
  effect: 'trackOverlay' | 'trackItemVisibility'
}

export interface CommandItemProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

export interface CommandGroupProps {
  value: string
}

export interface CommandApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 当前检索串。 */
  inputValue: string
  /** 过滤归组之后此刻该显示的命令，空组已经丢掉。 */
  groups: readonly CommandGroupMeta[]
  /** 上面那份分组视图摊平的结果，次序即方向键走的次序。 */
  results: readonly CommandNodeMeta[]
  /** 键盘锚点；收起时为 null。 */
  highlightedValue: string | null
  /** 一条都没剩下。 */
  empty: boolean
  loading: boolean
  setOpen: (next: boolean) => void
  setInputValue: (next: string) => void
  /** 直接选中某条命令，等同于在它上面按回车。 */
  select: (value: string) => void
  getTriggerProps: () => T['button']
  getBackdropProps: () => T['element']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getInputProps: () => T['input']
  getListProps: () => T['element']
  getGroupProps: (props: CommandGroupProps) => T['element']
  getGroupLabelProps: (props: CommandGroupProps) => T['element']
  getItemProps: (props: CommandItemProps) => T['element']
  getItemTextProps: (props: CommandItemProps) => T['element']
  /**
   * 空态占位：放在 content 里、list 的兄弟。
   * 给了 collection 时由连接层按条数收放；条目手写时不写 hidden，露不露面归作者。
   */
  getEmptyProps: () => T['element']
  /** 在途占位：与空态占位同一个位置，两者不同屏。 */
  getLoadingProps: () => T['element']
  /** 面板底部的提示条：作者放什么由作者定，这里只给位置与观感。 */
  getFooterProps: () => T['element']
}
