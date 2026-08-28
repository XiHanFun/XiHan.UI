import type { Direction, Orientation, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
import type { MultiPointerSession } from '@xihan-ui/pointer'
import type { DragRect, DragTranslations, DropTarget } from '../shared/drag'

/** 形态。line 是缺省档，皮肤里没有它的选择器，根规则画的就是它。 */
export type TabsVariant = 'line' | 'card' | 'segment'

export interface TabsValueChangeDetails {
  value: string | null
}

/** automatic：方向键移动焦点即切换选中；manual：焦点先走，Enter/Space 才切换。 */
export type TabsActivationMode = 'automatic' | 'manual'

/** 条目数据。给了 collection，标签文本与禁用就以它为准。 */
export interface TabsNode {
  value: string
  /** 标签上的文本；缺省退回 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推出，不含选中态与焦点态。 */
export interface TabsNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 条目自报家门：值必报，禁用可由 collection 代为声明。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface TabsTriggerProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

export interface TabsContentProps {
  value: string
}

export interface TabsSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，标签文本与禁用的事实源。给了它，trigger 部件只需报 value。
     * 缺省即回到「文本与禁用都写在 trigger 上」的老路。
     */
    collection?: TabsNode[]
    /** 选中值。给定即受控：内部不再自改，只发 onValueChange。 */
    value?: string | null
    defaultValue?: string | null
    /** 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 */
    orientation?: Orientation
    /** 文字方向，默认 ltr；只影响水平轴上 ArrowLeft/ArrowRight 的前后语义。 */
    dir?: Direction
    /** 方向键移动焦点时是否顺带切换选中，默认 automatic。 */
    activationMode?: TabsActivationMode
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 形态：line / card / segment，决定选中态怎么画。缺省是 line。 */
    variant?: TabsVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /**
     * 标签可以拖着换位。整个标签都是拖动源，不另出把手。
     *
     * 顺序不进机器：collection 是 prop，库没有一份自己的标签序可写，只发 onTabMove。
     */
    reorderable?: boolean
    onTabMove?: (details: TabsMoveDetails) => void
    translations?: Partial<TabsTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: TabsValueChangeDetails) => void
  }
  context: {
    /** 选中值。受控（value 给定）时 cell 直读 prop，写只发 onValueChange 不改内部值。 */
    value: string | null
    /** 焦点位于组内时的瞬态锚点，焦点离组即清空。 */
    focusedValue: string | null
    /** 正在拖着换位的那个标签；按住但还没走够激活距离时仍是 null。 */
    draggingTab: string | null
    /** 此刻的落点；松手就落在这儿。没落在任何标签上时是 null。 */
    dropTarget: DropTarget | null
    /** 读屏播报文本。写进视觉隐藏的活动区域，不进视觉版面。 */
    announcement: string
  }
  computed: Record<string, never>
  refs: {
    /** 跟手的会话，整个生命周期都在。调用方在按下时把那一根指针交进来。 */
    gesture: MultiPointerSession | null
    /**
     * 正在拖着换位的那个标签。activated 之前只是「按住了」，还不是拖动——
     * 整个标签都是拖动源没有把手表明意图，要走够激活距离才算。
     */
    tabDrag: {
      value: string
      rects: DragRect[]
      origin: number
      activated: boolean
      /** 拖动源节点。拖动中拿它量版面整体挪了多远，见 snapshotDrift。 */
      source: HTMLElement | null
    } | null
  }
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string | null }
    | { type: 'TRIGGER.SELECT', value: string }
    | { type: 'TRIGGER.FOCUS', value: string }
    | { type: 'TRIGGER.NAVIGATE', value: string }
    | { type: 'LIST.BLUR' }
    /** 按在标签上：矩形快照与起点坐标由连接层量好交进来。此刻只是按住，还不算拖。 */
    /**
     * 从专门的拖动把手起手：按下即拖，不再等激活距离。
     * 把手是不占 Tab 位的独立可触区域，意图无歧义，触屏那一路也只走它。
     */
    | { type: 'TAB_DRAG.START', value: string, rects: DragRect[], origin: number, activate?: boolean, source: HTMLElement | null }
    | { type: 'TAB_DRAG.MOVE', point: number }
    | { type: 'TAB_DRAG.END' }
    | { type: 'TAB_DRAG.CANCEL' }
    /** 键盘换位：一按就是一次完整提交，不进拖动态。 */
    | { type: 'TAB.MOVE_BY', value: string, target: DropTarget }
  tag: never
  guard: 'isAutomatic'
  action:
    | 'setValue'
    | 'setFocusedValue'
    | 'clearFocusedValue'
    | 'startTabDrag'
    | 'trackTabDrag'
    | 'endTabDrag'
    | 'cancelTabDrag'
    | 'moveTabBy'
  effect: 'trackPointer'
}

export interface TabsApi<T extends PropTypes = PropTypes> {
  value: string | null
  /** collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly TabsNodeMeta[]
  /** 焦点在组外时为 null。 */
  focusedValue: string | null
  /** 此刻的落点；松手就落在这儿。没落在任何标签上时是 null。 */
  dropTarget: DropTarget | null
  /** 读屏播报文本。渲进 live-region，不进视觉版面。 */
  announcement: string
  /** 传 null 清空选中：context.value 与受控 value 都能表达"无选中"，写入侧同样收得下。 */
  setValue: (next: string | null) => void
  getRootProps: () => T['element']
  getListProps: () => T['element']
  getTriggerProps: (props: TabsTriggerProps) => T['button']
  getContentProps: (props: TabsContentProps) => T['element']
  /**
   * 拖动过程的读屏播报区。视觉隐藏，文本从 announcement 取。
   * 它必须在拖动开始之前就在 DOM 上——读屏不播报后插入的节点。
   */
  /**
   * 标签拖动把手。触屏那一路唯一的入口，不占 Tab 位。
   *
   * 常挂即可：reorderable 关着或这个标签禁用时它自报 data-disabled、也不再让出滚动，
   * 渲了不会错。按拖不拖得动来决定渲不渲，会让 DOM 结构随状态变。
   */
  getTabDragTriggerProps: (props: TabsTriggerProps) => T['element']
  getLiveRegionProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
/** 读屏用的文案，默认英文。拖动过程在视觉上很清楚，在读屏里全靠这几句。 */
export interface TabsTranslations extends Partial<DragTranslations> {}

/** 标签换位：从第几位挪到第几位，以及重排好的整份顺序。 */
export interface TabsMoveDetails {
  value: string
  from: number
  to: number
  /** 已经重排好的整份标签序，可直接拿去写回数据源。 */
  values: string[]
}
