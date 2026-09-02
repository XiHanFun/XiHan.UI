import type { PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 形态。取值与 tag.css 的选择器一一对应。 */
export type TagVariant = 'outline' | 'solid' | 'subtle'

export interface TagOpenChangeDetails {
  open: boolean
}

/** 读屏用的文案，默认英文。 */
export interface TagTranslations {
  /**
   * 关闭钮的 aria-label：钮里通常只有一个叉，读屏念不出摘掉的是哪一个标签。
   * 缺省 'Delete'，与 select、tags-input 里同一个动作用同一个词。
   */
  close: string
}

export interface TagSchema extends MachineSchema {
  props: {
    /** 形态：solid / subtle / outline，决定颜色怎么用。 */
    variant?: TagVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** 是否给出关闭钮，默认 false。false 时该钮同时被禁用与收起。 */
    closable?: boolean
    /** 标签禁用：关闭钮不可用，点击不改显隐。 */
    disabled?: boolean
    /** 受控显隐；缺省该 prop 即非受控。 */
    open?: boolean
    /** 非受控初始显隐，默认显示。 */
    defaultOpen?: boolean
    /** open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onOpenChange?: (details: TagOpenChangeDetails) => void
    translations?: Partial<TagTranslations>
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    // 受控回写：宿主改 open 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSED' }
  tag: never
  guard: 'isOpenControlled'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen'
  effect: never
}

export interface TagApi<T extends PropTypes = PropTypes> {
  open: boolean
  closable: boolean
  disabled: boolean
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getCloseTriggerProps: () => T['button']
}
