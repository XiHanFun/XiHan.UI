import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { PopoverSchema } from '../popover'
import type { PopconfirmApi, PopconfirmIntents } from './popconfirm.types'
import { dataAttr } from '@xihan-ui/kernel'
import { popconfirmAnatomy } from './popconfirm.anatomy'

const parts = popconfirmAnatomy.build()

// 在途的异步确认批次号：取消或新一轮确认把它顶掉，晚到的兑现整批作废
const confirmSeq = new WeakMap<object, number>()

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

  const pending = !!props.pending
  const bumpSeq = (): number => {
    const next = (confirmSeq.get(service) ?? 0) + 1
    confirmSeq.set(service, next)
    return next
  }

  // 先把意图交出去再请求收起：受控时收起要等宿主写回 open，两件事的先后不能反过来。
  // CLOSE 不带 src——src 的取值域属于 popover 机器，气泡确认按下按钮这件事它认不出来。
  // 回调返回 Promise 即挂起确认门：兑现才收起，落空留在原地；挂起中再点无效
  const confirm = (): void => {
    if (pending)
      return
    const outcome = props.onConfirm?.()
    if (outcome instanceof Promise) {
      const seq = bumpSeq()
      props.onPendingChange?.(true)
      outcome.then(
        () => {
          if (confirmSeq.get(service) !== seq)
            return
          props.onPendingChange?.(false)
          send({ type: 'CLOSE' })
        },
        () => {
          if (confirmSeq.get(service) === seq)
            props.onPendingChange?.(false)
        },
      )
      return
    }
    // 点的是确认按钮，不是代码调的
    send({ type: 'CLOSE', src: 'close-trigger' })
  }

  const cancel = (): void => {
    // 挂起中的确认结果随取消作废
    bumpSeq()
    if (pending)
      props.onPendingChange?.(false)
    props.onCancel?.()
    send({ type: 'CLOSE', src: 'close-trigger' })
  }

  return {
    open,
    pending,
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
        left: `${position?.x ?? 0}px`,
        top: `${position?.y ?? 0}px`,
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
      'type': 'button',
      // 挂起不算禁用：仍可聚焦，读屏经 aria-busy 知道在忙
      'aria-busy': pending ? 'true' : undefined,
      'data-loading': dataAttr(pending),
      'onClick': confirm,
    }),
    getCancelTriggerProps: () => normalize.button({
      ...parts['cancel-trigger'].attrs,
      type: 'button',
      onClick: cancel,
    }),
  }
}
