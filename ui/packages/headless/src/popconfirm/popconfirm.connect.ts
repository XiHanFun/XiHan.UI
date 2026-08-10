import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { PopoverSchema } from '../popover'
import type { PopconfirmApi, PopconfirmIntents } from './popconfirm.types'
import { dataAttr } from '@xihan-ui/core'
import { popconfirmAnatomy } from './popconfirm.anatomy'

const parts = popconfirmAnatomy.build()

/**
 * 气泡确认跑 popover 机器：开合、定位、消解层与焦点域全在那里，本组件只贴自己的解剖与角色属性。
 * 确认与取消这两个意图不入机器——它们除了收起浮层不改任何状态，由这里转给回调后再请求收起。
 */
export function connectPopconfirm<T extends PropTypes>(
  service: Service<PopoverSchema>,
  props: PopconfirmIntents,
  normalize: NormalizeProps<T>,
): PopconfirmApi<T> {
  const { state, prop, send, context, scope } = service
  const open = state.get() === 'open'
  const ids = scope.ids('popconfirm', 'trigger', 'content', 'title', 'description')
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context，这里只读结果，不量 DOM、不调引擎
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? 'bottom'

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  // 先把意图交出去再请求收起：受控时收起要等宿主写回 open，两件事的先后不能反过来。
  // CLOSE 不带 src——src 的取值域属于 popover 机器，气泡确认按下按钮这件事它认不出来
  const confirm = (): void => {
    props.onConfirm?.()
    send({ type: 'CLOSE' })
  }

  const cancel = (): void => {
    props.onCancel?.()
    send({ type: 'CLOSE' })
  }

  return {
    open,
    setOpen,
    confirm,
    cancel,
    // 根只框住触发器，浮层树靠 positioner 的固定定位飞出去；状态落在根上供整组样式取用
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
    }),
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      'onClick': () => send({ type: 'TOGGLE' }),
    }),
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      'style': {
        position: 'fixed',
        insetInlineStart: `${position?.x ?? 0}px`,
        insetBlockStart: `${position?.y ?? 0}px`,
      },
    }),
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      // 等一个答复的浮层用 alertdialog：屏幕阅读器进来就把 description 当消息念出来
      'role': 'alertdialog',
      'tabindex': -1,
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-state': stateAttr,
      'data-placement': placement,
      // 尺寸落在浮层树最外层的 content 上：positioner 是定位空壳，root 留在触发器那边
      'data-size': prop('size'),
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
    }),
    getTitleProps: () => normalize.element({ ...parts.title.attrs, id: ids.title }),
    getDescriptionProps: () => normalize.element({ ...parts.description.attrs, id: ids.description }),
    getConfirmTriggerProps: () => normalize.button({
      ...parts['confirm-trigger'].attrs,
      type: 'button',
      onClick: confirm,
    }),
    getCancelTriggerProps: () => normalize.button({
      ...parts['cancel-trigger'].attrs,
      type: 'button',
      onClick: cancel,
    }),
  }
}
