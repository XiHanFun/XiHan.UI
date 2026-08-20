import type { Direction, Orientation, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export interface SegmentedValueChangeDetails {
  /** 当前选中值；一个都没选中时为 null。 */
  value: string | null
}

/** 条目数据。给了 collection，显示文本与禁用就以它为准。 */
export interface SegmentedNode {
  value: string
  /** 展示文本；缺省退回 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推出，不含选中态与焦点态。 */
export interface SegmentedNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 条目自报家门：值必报，禁用可由 collection 代为声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface SegmentedItemProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

/** 指示器相对 root 内边距盒的位置与尺寸（px），起始缘按逻辑方向算。 */
export interface SegmentedIndicatorRect {
  blockStart: number
  blockSize: number
  inlineStart: number
  inlineSize: number
}

/** 一只量好的盒子：相对视口的起始坐标与尺寸（px）。 */
export interface SegmentedBox {
  left: number
  top: number
  width: number
  height: number
}

/** 适配器在挂载前填入的 DOM 取值口。 */
export interface SegmentedRefs {
  /** 条目集合的查询容器，同时是指示器定位的参照系。 */
  getRootEl: () => HTMLElement | null
}

export interface SegmentedSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。
     * 缺省即回到「文本与禁用都写在条目部件上」的老路。
     */
    collection?: SegmentedNode[]
    /** 选中值。给定即受控：内部不再自改，只发 onValueChange。 */
    value?: string | null
    defaultValue?: string | null
    /** 整组禁用：条目全部 aria-disabled，点击与方向键都不生效。 */
    disabled?: boolean
    /** 只读：选不动，但仍可聚焦、方向键照常移焦点，对比度不降。 */
    readOnly?: boolean
    /** 校验失败：只改呈现，不挡交互。 */
    invalid?: boolean
    /** 必填：随表单校验一起用，只发无障碍属性，不自行拦提交。 */
    required?: boolean
    /** 表单字段名。给定后隐藏输入才带 name 并参与提交。 */
    name?: string
    /** 视觉排布，默认 horizontal。方向键接受的轴与它无关（四个方向键恒响应）。 */
    orientation?: Orientation
    /**
     * 文字方向，只改写左右方向键的语义与指示器的起始缘，上下键与之无关。
     * 不给即从根节点的计算样式现读（祖先链上的 dir 与 CSS direction 都算），给了就以它为准。
     */
    dir?: Direction
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 撑满行宽，各段等分剩余空间。 */
    block?: boolean
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: SegmentedValueChangeDetails) => void
  }
  context: {
    /** 选中值。受控（value 给定）时 cell 直读 prop，写只发 onValueChange 不改内部值。 */
    value: string | null
    /** 焦点位于组内时的瞬态锚点，焦点离组即清空。 */
    focusedValue: string | null
    /** 指示器的量测结果；没有选中项或量不到时为 null。 */
    indicator: SegmentedIndicatorRect | null
  }
  computed: Record<string, never>
  refs: SegmentedRefs
  /** 选中值不编码进状态，机器因此只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string | null }
    | { type: 'ITEM.SELECT', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'GROUP.BLUR' }
    /** 重量指示器：尺寸观察器与使用者的 measure() 都发它。 */
    | { type: 'INDICATOR.MEASURE' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: never
  action: 'setValue' | 'setFocusedValue' | 'clearFocusedValue' | 'resetToDefault' | 'measureIndicator'
  effect: 'trackIndicatorSize'
}

export interface SegmentedApi<T extends PropTypes = PropTypes> {
  /** 当前选中值；一个都没选中时为 null。 */
  value: string | null
  /** collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly SegmentedNodeMeta[]
  /** 焦点在组外时为 null。 */
  focusedValue: string | null
  disabled: boolean
  readOnly: boolean
  isSelected: (value: string) => boolean
  setValue: (next: string | null) => void
  /**
   * 重量一遍指示器。选中值变化与 collection 增删改名都会自动重量，根的尺寸变化由尺寸观察器接住；
   * 剩下这一类要手动叫：段的文字由部件手写（没走 collection）而后改动，或字体加载完把段撑宽了。
   */
  measure: () => void
  getRootProps: () => T['element']
  getItemProps: (props: SegmentedItemProps) => T['button']
  getItemTextProps: (props: SegmentedItemProps) => T['element']
  getIndicatorProps: () => T['element']
  /** 选中值随这份原生输入提交。 */
  getHiddenInputProps: () => T['input']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface SegmentedTranslations {}
