import type { ItemQuery } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { RadioGroupApi, RadioGroupItemProps, RadioGroupSchema } from './radio-group.types'
import { focusItem, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/core'
import { radioGroupAnatomy } from './radio-group.anatomy'

const parts = radioGroupAnatomy.build()

// 条目集合只在事件处理器里查活 DOM：那一刻两个适配器看到的是同一份文档，顺序即文档序。
const ITEM_QUERY: ItemQuery = { scope: radioGroupAnatomy.name, part: 'item' }

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

export function connectRadioGroup<T extends PropTypes>(
  service: Service<RadioGroupSchema>,
  normalize: NormalizeProps<T>,
): RadioGroupApi<T> {
  const { context, prop, send, scope } = service
  // value 与 defaultValue 皆缺省时 cell 初值是 undefined，这里归一成 null
  const value = context.get('value') ?? null
  const focusedValue = context.get('focusedValue') ?? null
  const groupDisabled = !!prop('disabled')
  const orientation = prop('orientation') ?? 'vertical'
  const dir = prop('dir') ?? 'ltr'
  const name = prop('name')
  const ids = scope.ids('radio-group', 'label')

  // roving tabindex 的唯一锚点：焦点在组内跟焦点走，否则跟选中值走
  const anchor = focusedValue ?? value

  const isChecked = (item: RadioGroupItemProps): boolean => value === item.value
  // 组禁用向下传导到每个条目；条目也能单独禁用
  const isDisabled = (item: RadioGroupItemProps): boolean => groupDisabled || !!item.disabled

  // item / item-text / indicator / hidden-input 共用同一份状态标记，样式层各处一致
  const stateAttrs = (item: RadioGroupItemProps): Record<string, string | undefined> => ({
    'data-state': isChecked(item) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(isDisabled(item)),
  })

  const select = (item: RadioGroupItemProps): void => {
    if (!isDisabled(item))
      send({ type: 'ITEM.SELECT', value: item.value })
  }

  return {
    value,
    focusedValue,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'radiogroup',
      'aria-labelledby': ids.label,
      // aria-orientation 只描述视觉排布，与方向键接受的轴无关（见 onKeyDown）
      'aria-orientation': orientation,
      'data-orientation': orientation,
      'data-disabled': dataAttr(groupDisabled),
      // 焦点在组外时容器一律兜底进 Tab 序列，由 onFocus 转投给条目。
      // 判据用 focusedValue 而非 anchor：anchor 可能指向一个已不存在的值
      // （受控值不在选项里、或条目被删），那时没有任何条目会认领 tabindex=0，
      // 若容器也退出 Tab 序列，整组对键盘用户永久不可达。
      // 焦点已在组内时容器让位（-1），Tab 才能正常离开本组。
      'tabindex': focusedValue == null ? 0 : -1,
      'onFocus': (e: FocusEvent) => {
        const container = e.currentTarget as HTMLElement
        // 只接管从组外进来的焦点：组内 Shift+Tab 往外退时转投会把人困在组里
        if (contains(container, e.relatedTarget as Node | null))
          return
        const items = queryItems(container, ITEM_QUERY)
        focusItem(navigateItems(items, null, 'first'))
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
        // axis 'both'：四个方向键都要响应，横排组的上下键同样切换；规范未要求 Home/End。
        // dir 只对调左右键，上下键在 rtl 下语义不变
        const intent = navIntentFromKey(e, { axis: 'both', dir, home: false })
        // 返回 null 表示该键不归导航管，此时绝不 preventDefault（页面滚动与读屏要用）
        if (!intent)
          return
        e.preventDefault()
        const items = queryItems(e.currentTarget as HTMLElement, ITEM_QUERY)
        const target = navigateItems(items, anchor, intent, { loop: true })
        const next = itemValue(target)
        if (next == null)
          return
        // 方向键在移动焦点的同时选中，这是 radiogroup 区别于 tablist 的地方
        focusItem(target)
        send({ type: 'ITEM.SELECT', value: next })
      },
    }),
    getLabelProps: () => normalize.element({ ...parts.label.attrs, id: ids.label }),
    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...stateAttrs(item),
      'role': 'radio',
      // 未选中必须显式输出 false：省略会让读屏无从区分"未选中"与"不是单选项"
      'aria-checked': isChecked(item) ? 'true' : 'false',
      // 集合条目一律 aria-disabled，绝不输出原生 disabled（与 Switch/Checkbox 相反）：
      // 原生 disabled 不可聚焦也不派发 click，会让禁用策略与样式分裂
      'aria-disabled': isDisabled(item) ? 'true' : 'false',
      // 导航与选中都以此为条目身份
      [ITEM_VALUE_ATTR]: item.value,
      // 锚点条目独占 Tab 序列位
      'tabindex': anchor === item.value ? 0 : -1,
      'onClick': () => select(item),
      // 焦点是事实不是许可：禁用条目被点到也记锚点，方向键才知道从哪儿起步
      'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
      'onKeyDown': (e: KeyboardEvent) => {
        // 禁用条目不认这个键，因此也不能吞掉它：Space 必须放行给页面滚动
        if (e.key !== ' ' || isDisabled(item))
          return
        e.preventDefault()
        select(item)
      },
    }),
    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...stateAttrs(item),
    }),
    getIndicatorProps: item => normalize.element({
      ...parts.indicator.attrs,
      ...stateAttrs(item),
      'aria-hidden': 'true',
    }),
    // 表单出口：整组的选中值靠这份原生输入随表单提交。它对键盘与读屏都不存在
    // （tabindex=-1 + aria-hidden），交互全部由 item 承担，两者不会各说各话。
    getHiddenInputProps: item => normalize.input({
      ...parts['hidden-input'].attrs,
      ...stateAttrs(item),
      // type 先于 checked 写入：改 type 会重置输入的选中态
      'type': 'radio',
      // name 缺省即不产出该属性，此时这份输入不参与提交
      'name': name,
      'value': item.value,
      'checked': isChecked(item),
      // 单体输入用原生 disabled（与 item 的 aria-disabled 相反）：禁用组不该提交出值
      'disabled': isDisabled(item) || undefined,
      'tabindex': -1,
      'aria-hidden': 'true',
      'style': HIDDEN_INPUT_STYLE,
    }),
  }
}
