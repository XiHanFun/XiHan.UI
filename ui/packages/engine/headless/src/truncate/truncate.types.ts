import type { MachineSchema, PropTypes } from '@xihan-ui/core'

export interface TruncateOpenChangeDetails {
  /** 此刻是不是铺开了全文。 */
  open: boolean
}

export interface TruncateOverflowChangeDetails {
  /** 夹住的那一版有没有被裁掉内容。 */
  overflowing: boolean
}

/** 判定溢出要的四个实测量，单位 px。 */
export interface TruncateMetrics {
  /** 内容在行内轴上的完整长度。 */
  scrollWidth: number
  /** 盒子在行内轴上看得见的那一段。 */
  clientWidth: number
  /** 内容在块轴上的完整长度。 */
  scrollHeight: number
  /** 盒子在块轴上看得见的那一段。 */
  clientHeight: number
}

/** 适配器在挂载前填入的 DOM 取值口。 */
export interface TruncateRefs {
  /** 夹字的那个盒子：溢出与文字都量它。 */
  getRootEl: () => HTMLElement | null
}

export interface TruncateSchema extends MachineSchema {
  props: {
    /** 夹几行，1 为单行，默认 1。 */
    lines?: number
    /** 点一下铺开全文。 */
    expandable?: boolean
    /** 受控展开；缺省即非受控。 */
    open?: boolean
    /** 非受控时的初始展开态。 */
    defaultOpen?: boolean
    /** 真被裁掉了才把整段文字交给平台的原生提示。 */
    tooltip?: boolean
    /** open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onOpenChange?: (details: TruncateOpenChangeDetails) => void
    /** 量出来的溢出结论翻面时回调。 */
    onOverflowChange?: (details: TruncateOverflowChangeDetails) => void
  }
  context: {
    /** 夹住的那一版有没有被裁掉内容；还没量到为 false。 */
    overflowing: boolean
    /** 盒子里的文字，连续空白已压成一个空格。 */
    text: string
  }
  computed: Record<string, never>
  refs: TruncateRefs
  /** closed 夹着；open 铺开全文。 */
  state: 'closed' | 'open'
  event:
    /** 重量一次。观察器与作者共用这一个入口。 */
    | { type: 'MEASURE' }
    /** 切换展开。 */
    | { type: 'TOGGLE' }
    // 受控回写：宿主改 open 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled'
  action: 'measure' | 'measureSoon' | 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen'
  effect: 'trackOverflow'
}

export interface TruncateApi<T extends PropTypes = PropTypes> {
  /** 此刻是不是铺开了全文。 */
  open: boolean
  /** 夹住的那一版有没有被裁掉内容。作者据此决定要不要套一层提示。 */
  overflowing: boolean
  /** 程序化展开 / 收回，与点一下走同一条路。 */
  setOpen: (next: boolean) => void
  /** 手动重量一次：字体到位、外层换了布局这类观察器看不见的变化，由作者补一枪。 */
  measure: () => void
  getRootProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface TruncateTranslations {}
