/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radio group 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { RadioGroupApi, RadioGroupItemProps, RadioGroupNodeMeta, RadioGroupSchema } from './radio-group.types'
import { anchorItem, contains, createPressTracker, dataAttr, focusItem, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems, readDirection } from '@xihan-ui/core'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { radioGroupAnatomy, radioGroupItemQuery } from './radio-group.anatomy'
import { resolveRadioGroupOrientation } from './radio-group.orientation'

const parts = radioGroupAnatomy.build()

// 条目查询描述符；只在事件处理器里查活 DOM，渲染期不得调用
const ITEM_QUERY = radioGroupItemQuery

export function connectRadioGroup<T extends PropTypes>(
  service: Service<RadioGroupSchema>,
  normalize: NormalizeProps<T>,
): RadioGroupApi<T> {
  const { context, prop, send, scope } = service
  const value = context.get('value') ?? null
  const focusedValue = context.get('focusedValue') ?? null
  const thumb = context.get('thumb')
  const thumbStretch = context.get('thumbStretch')
  const groupDisabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const required = !!prop('required')
  const variant = prop('variant') ?? 'list'
  // 没传 orientation 时随形态取缺省（list / card 竖排、segmented 横排），与机器量滑块同一处结算
  const orientation: 'horizontal' | 'vertical' = resolveRadioGroupOrientation(prop('orientation'), variant)
  const loop = prop('loop') ?? true
  const name = prop('name')
  const card = variant === 'card'
  // segmented 形态的段不归 Action Control 家族：面、字色与按下面由皮肤写在段自己身上（与 Tabs segment 同），
  // 选中身份交给滑块，不再投影行级配方
  const segmented = variant === 'segmented'
  const ids = scope.ids('radio-group', 'label')

  // collection 推出的条目元信息：显示文本、说明、图标与禁用都在这里定案，条目部件只报 value
  const collection: RadioGroupNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    description: node.description ?? null,
    icon: node.icon ?? null,
    disabled: !!node.disabled,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  /** 条目禁用：部件上写的优先，没写就回 collection 里查。 */
  const itemDisabled = (item: RadioGroupItemProps): boolean =>
    item.disabled ?? metaOf.get(item.value)?.disabled ?? false

  // roving tabindex 锚点：焦点值优先，否则选中值
  const anchor = focusedValue ?? value

  const isChecked = (item: RadioGroupItemProps): boolean => value === item.value
  const isDisabled = (item: RadioGroupItemProps): boolean => groupDisabled || itemDisabled(item)

  // item / item-icon / item-text / indicator / hidden-input 共用的状态标记
  const stateAttrs = (item: RadioGroupItemProps): Record<string, string | undefined> => ({
    'data-state': isChecked(item) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(isDisabled(item)),
    'data-readonly': dataAttr(readOnly),
    'data-invalid': dataAttr(invalid),
  })

  const select = (item: RadioGroupItemProps): void => {
    if (!isDisabled(item) && !readOnly)
      send({ type: 'ITEM.SELECT', value: item.value })
  }

  // 按压通道：真源是机器 context 里「正被按住的那一个」（按 value 记），每个条目各自合成一份跟踪器；
  // Space 与触屏按住投影 data-pressed，指针按住由 :active 表出，皮肤两者同一档（data-pressed 投在条目上，
  // 换面落在行与圆圈、或段自己）。选中与按压互相独立；条目自身的禁用只有 connect 知道，随 PRESS.START 带给机器的守卫
  const pressedValue = context.get('pressedValue')
  const press = (item: RadioGroupItemProps): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressedValue') === item.value,
    onChange: down => send(down
      ? { type: 'PRESS.START', value: item.value, disabled: isDisabled(item) }
      : { type: 'PRESS.END', value: item.value }),
  })

  return {
    value,
    collection,
    focusedValue,
    variant,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    measure: () => send({ type: 'THUMB.MEASURE' }),
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 只在作者显式给了时才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': prop('dir'),
      'role': 'radiogroup',
      'aria-labelledby': ids.label,
      // 只描述视觉排布，与方向键接受的轴无关（见 onKeyDown 的 axis: 'both'）
      'aria-orientation': orientation,
      'data-orientation': orientation,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-variant': variant,
      'data-block': dataAttr(!!prop('block')),
      'data-disabled': dataAttr(groupDisabled),
      // role=radiogroup 本身接受这三条，不必像 role=group 那样下放到条目
      'aria-readonly': readOnly ? 'true' : 'false',
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-required': required ? 'true' : 'false',
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-required': dataAttr(required),
      // 焦点在组外时容器可 Tab，进入后让位给条目。
      // 判据只能用 focusedValue：anchor 可能指向一个已不存在的值，那时没有条目认领 tabindex=0
      'tabindex': focusedValue == null ? 0 : -1,
      'onFocus': (e: FocusEvent) => {
        const container = e.currentTarget as HTMLElement
        // 只接管从组外进来的焦点：组内 Shift+Tab 往外退时转投会把人困在组里
        if (contains(container, e.relatedTarget as Node | null))
          return
        // 落在锚点上：APG 要求焦点进组时落在已选中的那个，没有选中项才落第一个
        const items = queryItems(container, ITEM_QUERY)
        focusItem(anchorItem(items, anchor) ?? navigateItems(items, null, 'first'))
      },
      'onFocusOut': (e: FocusEvent) => {
        const container = e.currentTarget as HTMLElement
        if (contains(container, e.relatedTarget as Node | null))
          return
        send({ type: 'GROUP.BLUR' })
      },
      'onKeyDown': (e: KeyboardEvent) => {
        if (groupDisabled)
          return
        // 四个方向键都响应，不接 Home/End：APG 的单选组只有方向键在组内移动。
        // 方向只对调左右键，上下键在 rtl 下语义不变。方向从容器现读：整页 rtl 而作者没传 dir 时，
        // 左右键也该跟着视觉顺序翻转；按键发生在事件时刻，DOM 一定在场。prop('dir') 仍然优先
        const dir = prop('dir') ?? readDirection(e.currentTarget as Element)
        const intent = navIntentFromKey(e, { axis: 'both', dir, home: false })
        // 返回 null 表示该键不归导航管，此时绝不 preventDefault
        if (!intent)
          return
        e.preventDefault()
        const items = queryItems(e.currentTarget as HTMLElement, ITEM_QUERY)
        const target = navigateItems(items, anchor, intent, { loop })
        const next = itemValue(target)
        if (next == null)
          return
        // 方向键移动焦点的同时选中；只读时焦点照走，只是不落值
        focusItem(target)
        if (!readOnly)
          send({ type: 'ITEM.SELECT', value: next })
      },
    }),
    getLabelProps: () => normalize.element({ ...parts.label.attrs, id: ids.label }),
    getItemProps: (item) => {
      const handlers = press(item)
      return normalize.element({
        ...parts.item.attrs,
        ...stateAttrs(item),
        'role': 'radio',
        // list / card：整行是「圆圈 + 文案」的行级命中区：接 Action Control row 档，row 档允许标签折行、
        // 按下只换面不缩放；xs 的 24px 是命中地板，圆圈 12 / 16 / 20px 居中其间，字号与间距由皮肤按组档位映射，
        // 与 checkbox-group 的条目同形。圆圈是行内 aria-hidden 的标记，随行读宿主的 host 槽换面。
        // card 形态换成 outline 描边卡，卡面（形状、内衬、选中面）由选择卡片家族配方给。
        // segmented 形态不投影配方：段是轨道里的一格，面与字由皮肤按轨道承载面自己写
        'data-xh-action-control': segmented ? undefined : '',
        'data-xh-action-profile': segmented ? undefined : 'row',
        'data-xh-action-variant': segmented ? undefined : card ? 'outline' : 'ghost',
        'data-xh-action-display': segmented ? undefined : 'always',
        'data-xh-action-size': segmented ? undefined : 'xs',
        'data-xh-choice-card': dataAttr(card),
        // 未选中也显式输出 false：省略会让读屏无从区分"未选中"与"不是单选项"
        'aria-checked': isChecked(item) ? 'true' : 'false',
        // 用 aria-disabled 保持禁用条目可聚焦
        'aria-disabled': isDisabled(item) ? 'true' : 'false',
        [ITEM_VALUE_ATTR]: item.value,
        // 锚点条目独占 Tab 序列位
        'tabindex': anchor === item.value ? 0 : -1,
        // Space 与触屏按住投影 data-pressed，皮肤的按下面同时认它与指针 :active；与选中互相独立
        'data-pressed': dataAttr(pressedValue === item.value),
        'onClick': () => select(item),
        // 禁用条目被聚焦也记锚点
        'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
        'onKeyDown': (e: KeyboardEvent) => {
          // role=radio 只有 Space 是激活键：Enter 在这里什么都不做，也就没有按压面可言
          if (e.key !== 'Enter')
            handlers.onKeyDown(e)
          // 禁用条目不认这个键，因此也不能吞掉它：Space 必须放行给页面滚动
          if (e.key !== ' ' || isDisabled(item))
            return
          e.preventDefault()
          select(item)
        },
        'onKeyUp': handlers.onKeyUp,
        'onBlur': handlers.onBlur,
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
      })
    },
    // 图标只是文字的陪衬，可及名全在文字上
    getItemIconProps: item => normalize.element({
      ...parts['item-icon'].attrs,
      'aria-hidden': true,
      ...stateAttrs(item),
    }),
    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...stateAttrs(item),
    }),
    // 说明行在条目之内，与文案一起构成条目的可及名，不另挂 aria-describedby
    getItemDescriptionProps: item => normalize.element({
      ...parts['item-description'].attrs,
      ...stateAttrs(item),
    }),
    getIndicatorProps: item => normalize.element({
      ...parts.indicator.attrs,
      ...stateAttrs(item),
      'aria-hidden': true,
    }),
    // 位置与尺寸由机器量好，铺成内联样式里的私有槽，皮肤照着摆。
    // 不发 data-orientation：滑块的盒子横竖两向都由这四个槽定死，没有按排布分支的规则；
    // 要按排布挑选它，从根上的 data-orientation 往下选
    getThumbProps: () => normalize.element({
      ...parts.thumb.attrs,
      'aria-hidden': true,
      // 首次落位与同一项的重量直接到位：皮肤在它身上撤掉几何过渡，只有换项才滑
      'data-instant': dataAttr(context.get('thumbInstant')),
      'data-value': value ?? undefined,
      'hidden': thumb == null || undefined,
      'style': thumb
        ? {
            '--xh-_radio-group-thumb-x': `${thumb.inlineStart}px`,
            '--xh-_radio-group-thumb-y': `${thumb.blockStart}px`,
            '--xh-_radio-group-thumb-w': `${thumb.inlineSize}px`,
            '--xh-_radio-group-thumb-h': `${thumb.blockSize}px`,
            // 液态档下两沿走弹簧时被拉长的比例，皮肤据它压扁；标准档恒为 0
            '--xh-_radio-group-thumb-stretch': String(thumbStretch),
          }
        : undefined,
    }),
    // 表单出口：选中值随这份原生输入提交
    getHiddenInputProps: item => normalize.input({
      ...parts['hidden-input'].attrs,
      ...stateAttrs(item),
      // type 须先于 checked 写入
      'type': 'radio',
      // 未给 name 时不产出该属性，不参与提交
      'name': name,
      'value': item.value,
      'checked': isChecked(item),
      // 禁用时不提交值
      'disabled': isDisabled(item) || undefined,
      // inert 把这份输入从焦点与无障碍树里整个摘掉：条目那层是 role=radio，
      // 它的后代里不能留下可聚焦的控件（负 tabindex 与 aria-hidden 都拦不住读屏的虚拟光标）
      'inert': true,
      'tabindex': -1,
      'aria-hidden': true,
      'style': VISUALLY_HIDDEN_STYLE,
    }),
  }
}
