import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { CollapsibleSchema } from '../collapsible'
import type { FloatButtonApi, FloatButtonAppearance, FloatButtonPlacement, FloatButtonShape } from './float-button.types'
import { dataAttr } from '@xihan-ui/core'
import { floatButtonAnatomy } from './float-button.anatomy'

const parts = floatButtonAnatomy.build()

/** 不给落位时钉在尾下角。 */
export const FLOAT_BUTTON_DEFAULT_PLACEMENT: FloatButtonPlacement = 'bottom-end'

/** 不给外形时是圆的。 */
export const FLOAT_BUTTON_DEFAULT_SHAPE: FloatButtonShape = 'circle'

/** 不给距离时距那两条边 24px。 */
export const FLOAT_BUTTON_DEFAULT_OFFSET = 24

/** 贴边距离归一：夹到非负，非有限数退回缺省。 */
export function resolveFloatButtonOffset(offset: number | undefined): number {
  if (offset == null || !Number.isFinite(offset))
    return FLOAT_BUTTON_DEFAULT_OFFSET
  return Math.max(0, offset)
}

/**
 * 悬浮按钮跑 collapsible 机器：一颗触发器管着一组内容的开合，受控回写与通知全在那里。
 * 落位、外形与展开方式不入机器——它们不改开合，只决定接哪几个监听、往根上写哪几个 data-*。
 */
export function connectFloatButton<T extends PropTypes>(
  service: Service<CollapsibleSchema>,
  props: FloatButtonAppearance,
  normalize: NormalizeProps<T>,
): FloatButtonApi<T> {
  const { state, prop, send, scope } = service

  const open = state.get() === 'open'
  const disabled = !!prop('disabled')
  const ids = scope.ids('float-button', 'trigger', 'list')
  const stateAttr = open ? 'open' : 'closed'
  const placement = props.placement ?? FLOAT_BUTTON_DEFAULT_PLACEMENT
  const shape = props.shape ?? FLOAT_BUTTON_DEFAULT_SHAPE
  const offset = resolveFloatButtonOffset(props.offset)
  const hover = props.expandTrigger === 'hover'

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    setOpen,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-placement': placement,
      'data-shape': shape,
      'data-disabled': dataAttr(disabled),
      // 贴边距离写成内联自定义属性：贴的是哪两条边由皮肤按 data-placement 决定，这里只给数
      'style': `--xh-_float-button-offset: ${offset}px`,
      // 展开着按 Escape 收起来。悬停展开时指针一走就收，键盘上就只剩这一条路
      'onKeydown': (event: KeyboardEvent) => {
        if (event.key === 'Escape' && open)
          send({ type: 'CLOSE' })
      },
      // 悬停展开：进出整个壳才算数，不是只进出触发器——指针得能走到展开的那一组上去
      ...(hover
        ? {
            onPointerEnter: () => {
              if (!disabled)
                send({ type: 'OPEN' })
            },
            onPointerLeave: () => send({ type: 'CLOSE' }),
          }
        : {}),
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      // 写死 button：不写的话放在表单里会当成提交按钮
      'type': 'button',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.list,
      // 里面通常只有一个图标，可及名字只能由这里给
      'aria-label': props.translations?.trigger ?? 'Actions',
      // 单体控件用原生 disabled，只留 data-disabled 的话禁用态只是样式
      'disabled': disabled || undefined,
      'data-state': stateAttr,
      'data-shape': shape,
      'data-disabled': dataAttr(disabled),
      // 点一下恒能开合：悬停只是多给一条路，触摸与键盘还得靠它
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
    }),

    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'id': ids.list,
      // 一组并列的动作；名字借触发器的，不另起一个
      'role': 'group',
      'aria-labelledby': ids.trigger,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留着节点只隐藏：靠不透明度藏起来的按钮仍然可聚焦、仍然被读屏念到
      'hidden': !open || undefined,
    }),
  }
}
