import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { BackTopApi, BackTopSchema } from './back-top.types'
import { dataAttr } from '@xihan-ui/kernel'
import { backTopAnatomy } from './back-top.anatomy'

const parts = backTopAnatomy.build()

export function connectBackTop<T extends PropTypes>(
  service: Service<BackTopSchema>,
  normalize: NormalizeProps<T>,
): BackTopApi<T> {
  const { state, prop, send } = service

  const visible = state.matches('visible')

  return {
    visible,
    scrollToTop: () => send({ type: 'TRIGGER.CLICK' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-visible': dataAttr(visible),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      // 收起时留着节点，只加 hidden：靠不透明度藏起来的按钮仍然可聚焦、仍然被读屏念到
      'hidden': !visible || undefined,
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      // 写死 button：不写的话放在表单里会当成提交按钮
      'type': 'button',
      // 按钮里通常只有一个图标，可及名字只能由这里给
      'aria-label': prop('translations')?.trigger ?? 'Back to top',
      'data-visible': dataAttr(visible),
      'onClick': () => send({ type: 'TRIGGER.CLICK' }),
    }),
  }
}
