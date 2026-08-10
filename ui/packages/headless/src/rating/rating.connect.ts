import type { ItemQuery } from '@xihan-ui/behavior'
import type { Direction, NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { RatingApi, RatingItemProps, RatingItemState, RatingSchema } from './rating.types'
import { focusItem, ITEM_VALUE_ATTR, itemValue, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/kernel'
import { ratingAnatomy } from './rating.anatomy'
import { clampRating, ratingMax } from './rating.machine'

const parts = ratingAnatomy.build()

// 条目查询描述符，事件处理器据此查活 DOM
const ITEM_QUERY: ItemQuery = { scope: ratingAnatomy.name, part: 'item' }

// 视觉隐藏但保留在布局与表单里，不能 display:none——原生校验提示需要一个可定位的框
const HIDDEN_INPUT_STYLE = {
  position: 'absolute',
  inlineSize: '1px',
  blockSize: '1px',
  margin: '-1px',
  padding: '0',
  border: '0',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
}

/** 键盘意图：走一档、取下界、取上界。 */
export type RatingKeyIntent
  = | { kind: 'step', direction: 1 | -1 }
    | { kind: 'min' }
    | { kind: 'max' }

/** 只需要读按键与修饰键，形状放宽以便直接传 KeyboardEvent。 */
export interface RatingKeyEventLike {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
}

/**
 * 按键 → 意图，返回 null 表示该键不归评分管。
 *
 * 上/右加一档、下/左减一档，dir 只对调左右。带修饰键的组合一律不接。
 * 不能换成集合导航的 navIntentFromKey：那套把 ArrowUp 翻成"上一项"，落到评分上就是按上键分数变低。
 */
export function ratingIntentFromKey(e: RatingKeyEventLike, dir?: Direction): RatingKeyIntent | null {
  if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)
    return null
  const rtl = dir === 'rtl'
  switch (e.key) {
    case 'ArrowUp':
      return { kind: 'step', direction: 1 }
    case 'ArrowDown':
      return { kind: 'step', direction: -1 }
    case 'ArrowRight':
      return { kind: 'step', direction: rtl ? -1 : 1 }
    case 'ArrowLeft':
      return { kind: 'step', direction: rtl ? 1 : -1 }
    case 'Home':
      return { kind: 'min' }
    case 'End':
      return { kind: 'max' }
    default:
      return null
  }
}

/**
 * 指针落在这颗星的哪半边：左半边（rtl 下是右半边）算半颗。
 *
 * 宽度量不到时按整颗。
 */
export function ratingValueAtPointer(
  index: number,
  offsetX: number,
  width: number,
  allowHalf?: boolean,
  dir?: Direction,
): number {
  if (!allowHalf || !(width > 0) || !Number.isFinite(offsetX))
    return index
  const ratio = dir === 'rtl' ? 1 - offsetX / width : offsetX / width
  return ratio <= 0.5 ? index - 0.5 : index
}

export function connectRating<T extends PropTypes>(
  service: Service<RatingSchema>,
  normalize: NormalizeProps<T>,
): RatingApi<T> {
  const { context, prop, send, scope } = service
  const count = ratingMax(prop('count'))
  const allowHalf = !!prop('allowHalf')
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const required = !!prop('required')
  const dir = prop('dir') ?? 'ltr'
  // 能否改值；能否聚焦另见 tabindex
  const interactive = !disabled && !readOnly
  const ids = scope.ids('rating', 'label')

  const value = clampRating(context.get('value'), count, allowHalf)
  // 不可交互时不认预览
  const hoveredValue = interactive ? (context.get('hoveredValue') ?? null) : null
  const focusedValue = context.get('focusedValue') ?? null
  const highlightedValue = hoveredValue ?? value
  const empty = value <= 0

  const items = Array.from({ length: count }, (_, i) => i + 1)

  // roving tabindex 锚点：优先焦点值，否则当前值；都没有时由 control 兜底进 Tab 序列
  const anchor = focusedValue ?? (value > 0 ? Math.min(Math.ceil(value), count) : null)

  /** 承载某个值的那颗星：半档挂在它右边那颗上（2.5 挂第 3 颗）。 */
  const starOf = (v: number): number => (v > 0 ? Math.min(Math.ceil(v), count) : 1)

  const getItemState = (item: RatingItemProps): RatingItemState => {
    // 这颗星正好是预览值的落点（含半档）
    const atEdge = highlightedValue > 0 && Math.ceil(highlightedValue) === item.value
    return {
      value: item.value,
      // aria-checked 只认真实值，不认悬停预览
      checked: value > 0 && Math.ceil(value) === item.value,
      // 半档那颗星不满足 value <= highlightedValue，靠 atEdge 补上
      highlighted: highlightedValue > 0 && (item.value <= highlightedValue || atEdge),
      half: allowHalf && atEdge && !Number.isInteger(highlightedValue),
    }
  }

  /** 现查条目，按值找到那颗星并聚焦；找不到就不动。 */
  const focusStar = (container: HTMLElement, star: number): void => {
    const found = queryItems(container, ITEM_QUERY).find(el => itemValue(el) === String(star))
    focusItem(found ?? null)
  }

  /** 指针事件落在这颗星的哪一档，宽度与 offsetX 在事件那一刻现量。 */
  const pointerValue = (index: number, e: MouseEvent): number => {
    const el = e.currentTarget as HTMLElement | null
    return ratingValueAtPointer(index, e.offsetX, el?.clientWidth ?? 0, allowHalf, dir)
  }

  return {
    value,
    hoveredValue,
    highlightedValue,
    count,
    empty,
    disabled,
    readOnly,
    items,
    getItemState,
    setValue: next => send({ type: 'VALUE.SET', value: next }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-empty': dataAttr(empty),
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'id': ids.label,
      'data-disabled': dataAttr(disabled),
    }),

    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'role': 'radiogroup',
      'aria-labelledby': ids.label,
      'aria-orientation': 'horizontal',
      // 三个 aria 布尔显式写 true/false：省略是"没说"，显式 false 是"明确说了不是"
      'aria-disabled': disabled ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'aria-required': required ? 'true' : 'false',
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      // 禁用时整条带子退出 Tab 序列；否则焦点在带外时容器兜底进 Tab 序列。
      // 判据只能用 focusedValue：anchor 可能指向一个已被删掉的条目，那时没有条目认领 tabindex=0
      'tabindex': disabled ? undefined : (focusedValue == null ? 0 : -1),
      // focus 不冒泡，只在容器自己被聚焦时跑
      'onFocus': (e: FocusEvent) => {
        if (disabled)
          return
        const container = e.currentTarget as HTMLElement
        // 只接管从带外进来的焦点
        if (contains(container, e.relatedTarget as Node | null))
          return
        focusStar(container, anchor ?? 1)
      },
      'onFocusOut': (e: FocusEvent) => {
        const container = e.currentTarget as HTMLElement
        if (contains(container, e.relatedTarget as Node | null))
          return
        send({ type: 'CONTROL.BLUR' })
      },
      // 指针离开与指针被系统抢走都要收起预览
      'onPointerLeave': () => send({ type: 'HOVER.CLEAR' }),
      'onPointerCancel': () => send({ type: 'HOVER.CLEAR' }),
      'onKeyDown': (e: KeyboardEvent) => {
        if (!interactive)
          return
        const intent = ratingIntentFromKey(e, dir)
        // 非评分键不拦截
        if (!intent)
          return
        e.preventDefault()
        if (intent.kind === 'step')
          send({ type: 'VALUE.STEP', direction: intent.direction })
        else if (intent.kind === 'min')
          send({ type: 'VALUE.TO_MIN' })
        else
          send({ type: 'VALUE.TO_MAX' })
        // 焦点跟着新值走；受控且宿主未写回时读到旧值，焦点原地不动
        const next = clampRating(context.get('value'), count, allowHalf)
        focusStar(e.currentTarget as HTMLElement, starOf(next))
      },
    }),

    getItemProps: (item) => {
      const s = getItemState(item)
      return normalize.element({
        ...parts.item.attrs,
        'role': 'radio',
        'aria-posinset': item.value,
        'aria-setsize': count,
        'aria-checked': s.checked ? 'true' : 'false',
        // 用 aria-disabled 而非原生 disabled，保持可聚焦
        'aria-disabled': disabled ? 'true' : 'false',
        // 导航与聚焦都以此为条目身份
        [ITEM_VALUE_ATTR]: String(item.value),
        'data-state': s.checked ? 'checked' : 'unchecked',
        'data-highlighted': dataAttr(s.highlighted),
        'data-half': dataAttr(s.half),
        'data-disabled': dataAttr(disabled),
        'data-readonly': dataAttr(readOnly),
        // 锚点条目独占 Tab 位；整体禁用时节点彻底不可聚焦
        'tabindex': disabled ? undefined : (anchor === item.value ? 0 : -1),
        'onClick': (e: MouseEvent) => {
          if (!interactive)
            return
          send({ type: 'ITEM.SELECT', value: pointerValue(item.value, e) })
        },
        // 只读时也记焦点，方向键据此起步
        'onFocus': () => send({ type: 'ITEM.FOCUS', index: item.value }),
        'onPointerMove': (e: PointerEvent) => {
          if (!interactive)
            return
          send({ type: 'ITEM.HOVER', value: pointerValue(item.value, e) })
        },
      })
    },

    // 表单出口：评分随这份原生输入提交，对键盘与读屏不可见
    getHiddenInputProps: () => normalize.input({
      ...parts['hidden-input'].attrs,
      'type': 'text',
      // 缺省时不产出该属性，输入不参与提交
      'name': prop('name'),
      // 还没评时提交空串而不是 "0"，让 required 能拦住提交
      'value': empty ? '' : String(value),
      'required': required || undefined,
      // 原生 disabled，禁用时不提交值
      'disabled': disabled || undefined,
      // 只读随 prop 走，恒真会让 required 不生效
      'readonly': readOnly || undefined,
      'tabindex': -1,
      'aria-hidden': 'true',
      'data-disabled': dataAttr(disabled),
      'style': HIDDEN_INPUT_STYLE,
    }),
  }
}
