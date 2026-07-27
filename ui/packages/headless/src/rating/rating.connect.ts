import type { ItemQuery } from '@xihan-ui/behavior'
import type { Direction, NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { RatingApi, RatingItemProps, RatingItemState, RatingSchema } from './rating.types'
import { focusItem, ITEM_VALUE_ATTR, itemValue, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/core'
import { ratingAnatomy } from './rating.anatomy'
import { clampRating, ratingMax } from './rating.machine'

const parts = ratingAnatomy.build()

// 条目集合只在事件处理器里查活 DOM：那一刻两个适配器看到的是同一份文档，顺序即文档序。
const ITEM_QUERY: ItemQuery = { scope: ratingAnatomy.name, part: 'item' }

// 隐藏输入要留在布局与表单里，不能 display:none——原生校验提示需要一个可定位的框。
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
 * 按键 → 意图。返回 null 表示这个键不归评分管，调用方**不得** preventDefault。
 *
 * 上/右加一档、下/左减一档，与滑块同一套约定（视觉上往上、往右就是变大）。
 * 这刻意不走集合导航的 navIntentFromKey：那套把 ArrowUp 翻成"上一项"，
 * 落到评分上就成了"按上键分数变低"，与用户对一条标尺的直觉正好相反。
 * dir 只对调左右，上下与文字方向无关。
 *
 * 带修饰键的组合一律不接：Ctrl+Home（跳到文档顶部）之类的浏览器/读屏组合不该被吞掉。
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
 * 量不到宽度时一律按整颗，不猜——宽度为 0 意味着这一帧还没布局（或运行在没有布局引擎的环境里），
 * 此时用 offsetX/width 算出来的比例只是个巧合，宁可给整颗也不要给一个随机的半颗。
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
  // 只读与禁用在"能不能改"上是一回事，在"能不能聚焦"上不是；后者见 tabindex
  const interactive = !disabled && !readOnly
  const ids = scope.ids('rating', 'label')

  const value = clampRating(context.get('value'), count, allowHalf)
  // 不可交互时不认预览：预览等于在说"点这儿就能改"，而此刻改不动。
  // 收在这里而不是靠事件守卫，是因为悬停途中才被禁用的那一帧，机器里还留着上一次的预览值。
  const hoveredValue = interactive ? (context.get('hoveredValue') ?? null) : null
  const focusedValue = context.get('focusedValue') ?? null
  const highlightedValue = hoveredValue ?? value
  const empty = value <= 0

  const items = Array.from({ length: count }, (_, i) => i + 1)

  // roving tabindex 的唯一锚点：焦点在带内跟焦点走，否则跟当前值走。
  // 一颗星都没评又没焦点时无人认领，此时由 control 兜底进 Tab 序列（见 getControlProps）。
  const anchor = focusedValue ?? (value > 0 ? Math.min(Math.ceil(value), count) : null)

  /** 承载某个值的那颗星：半档挂在它右边那颗上（2.5 挂第 3 颗）。 */
  const starOf = (v: number): number => (v > 0 ? Math.min(Math.ceil(v), count) : 1)

  const getItemState = (item: RatingItemProps): RatingItemState => {
    // 这颗星正好是预览值的落点（含半档）
    const atEdge = highlightedValue > 0 && Math.ceil(highlightedValue) === item.value
    return {
      value: item.value,
      // aria-checked 只认真实值：悬停是预览，读屏不该跟着念出一个用户还没选的分数
      checked: value > 0 && Math.ceil(value) === item.value,
      // 半档那颗星不满足 value <= highlightedValue（3 <= 2.5 为假），得靠 atEdge 补上
      highlighted: highlightedValue > 0 && (item.value <= highlightedValue || atEdge),
      half: allowHalf && atEdge && !Number.isInteger(highlightedValue),
    }
  }

  /** 事件发生的那一刻现查条目，按值找到那颗星并聚焦；找不到就不动。 */
  const focusStar = (container: HTMLElement, star: number): void => {
    const found = queryItems(container, ITEM_QUERY).find(el => itemValue(el) === String(star))
    focusItem(found ?? null)
  }

  /** 指针事件落在这颗星的哪一档。宽度与 offsetX 都得在事件那一刻现量。 */
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
      // 星星恒为一条横排，据此声明；上下键照样接（见 ratingIntentFromKey）
      'aria-orientation': 'horizontal',
      // 三个 aria 布尔显式写 true/false：省略是"没说"，显式 false 是"明确说了不是"
      'aria-disabled': disabled ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'aria-required': required ? 'true' : 'false',
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      // 禁用就整条带子退出 Tab 序列（原生 disabled 控件即如此），这正是它与 readOnly 的分界：
      // readOnly 仍留一个 Tab 位，用户进得来、读得到、只是改不动。
      // 焦点在带外时容器兜底，判据是 focusedValue 而非 anchor——anchor 可能指向一个
      // 已被删掉的条目（count 调小、作者少写了几颗星），那时没有条目认领得了 tabindex=0，
      // 若容器也退出 Tab 序列，整条评分带对键盘用户永久不可达。
      'tabindex': disabled ? undefined : (focusedValue == null ? 0 : -1),
      // focus 不冒泡，这个处理器只在容器自己被聚焦时跑；条目获得焦点走的是条目上的 onFocus
      'onFocus': (e: FocusEvent) => {
        if (disabled)
          return
        const container = e.currentTarget as HTMLElement
        // 只接管从带外进来的焦点：带内 Shift+Tab 往外退时转投会把人困住
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
      // 指针离开与指针被系统抢走（滑动手势）都要收起预览：
      // 少一条就会留下一片"手已经走了还亮着"的星
      'onPointerLeave': () => send({ type: 'HOVER.CLEAR' }),
      'onPointerCancel': () => send({ type: 'HOVER.CLEAR' }),
      'onKeyDown': (e: KeyboardEvent) => {
        if (!interactive)
          return
        const intent = ratingIntentFromKey(e, dir)
        // 不归评分管的键绝不 preventDefault（页面滚动与读屏要用）
        if (!intent)
          return
        e.preventDefault()
        if (intent.kind === 'step')
          send({ type: 'VALUE.STEP', direction: intent.direction })
        else if (intent.kind === 'min')
          send({ type: 'VALUE.TO_MIN' })
        else
          send({ type: 'VALUE.TO_MAX' })
        // 值动了焦点也得跟过去，否则下一次方向键从旧的那颗星起步，Tab 位也留在原地。
        // 受控且宿主没写回时这里读到的还是旧值，焦点因此原地不动——DOM 说的正是实情。
        const next = clampRating(context.get('value'), count, allowHalf)
        focusStar(e.currentTarget as HTMLElement, starOf(next))
      },
    }),

    getItemProps: (item) => {
      const s = getItemState(item)
      return normalize.element({
        ...parts.item.attrs,
        'role': 'radio',
        // 星星是作者一颗颗写出来的，读屏得知道这是第几颗、一共几颗
        'aria-posinset': item.value,
        'aria-setsize': count,
        'aria-checked': s.checked ? 'true' : 'false',
        // 集合条目一律 aria-disabled，绝不输出原生 disabled（与 Switch/Checkbox 相反）：
        // 原生 disabled 不可聚焦也不派发 click，会让禁用策略与样式分裂
        'aria-disabled': disabled ? 'true' : 'false',
        // 导航与聚焦都以此为条目身份
        [ITEM_VALUE_ATTR]: String(item.value),
        'data-state': s.checked ? 'checked' : 'unchecked',
        'data-highlighted': dataAttr(s.highlighted),
        'data-half': dataAttr(s.half),
        'data-disabled': dataAttr(disabled),
        'data-readonly': dataAttr(readOnly),
        // 锚点条目独占 Tab 位；整体禁用时连 -1 都不给，节点彻底不可聚焦
        'tabindex': disabled ? undefined : (anchor === item.value ? 0 : -1),
        'onClick': (e: MouseEvent) => {
          if (!interactive)
            return
          send({ type: 'ITEM.SELECT', value: pointerValue(item.value, e) })
        },
        // 焦点是事实不是许可：只读时也照记，方向键才知道从哪儿起步
        'onFocus': () => send({ type: 'ITEM.FOCUS', index: item.value }),
        'onPointerMove': (e: PointerEvent) => {
          if (!interactive)
            return
          send({ type: 'ITEM.HOVER', value: pointerValue(item.value, e) })
        },
      })
    },

    // 表单出口：评分靠这份原生输入随表单提交。它对键盘与读屏都不存在
    // （tabindex=-1 + aria-hidden），交互全部由 item 承担，两者不会各说各话。
    getHiddenInputProps: () => normalize.input({
      ...parts['hidden-input'].attrs,
      'type': 'text',
      // name 缺省即不产出该属性，此时这份输入不参与提交
      'name': prop('name'),
      // 还没评时提交空串而不是 "0"：required 要能在"一颗都没点"时真的拦住提交，
      // 而 "0" 在原生校验眼里是有值的
      'value': empty ? '' : String(value),
      'required': required || undefined,
      // 单体输入用原生 disabled（与 item 的 aria-disabled 相反）：禁用的评分不该提交出值
      'disabled': disabled || undefined,
      // 只读随 prop 走，不恒为真：readonly 的字段会被原生校验跳过，
      // 恒真会让 required 永远不生效
      'readonly': readOnly || undefined,
      'tabindex': -1,
      'aria-hidden': 'true',
      'data-disabled': dataAttr(disabled),
      'style': HIDDEN_INPUT_STYLE,
    }),
  }
}
