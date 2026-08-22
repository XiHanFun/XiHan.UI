import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { TagApi, TagSchema } from './tag.types'
import { dataAttr } from '@xihan-ui/kernel'
import { tagAnatomy } from './tag.anatomy'

const parts = tagAnatomy.build()

export function connectTag<T extends PropTypes>(
  service: Service<TagSchema>,
  normalize: NormalizeProps<T>,
): TagApi<T> {
  const { state, prop, send } = service
  const open = state.get() === 'open'
  // 标签默认不给关闭钮：多数标签只是身份标记，摘不摘得掉由作者说了算
  const closable = prop('closable') ?? false
  const disabled = !!prop('disabled')
  // 禁用的标签摘不掉：关闭钮仍在位置上，但按不动
  const canClose = closable && !disabled

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    closable,
    disabled,
    setOpen,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 三轴只落在 root 上，子部件靠继承拿到语气槽；缺省档由皮肤承担，这里不补默认值
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': open ? 'open' : 'closed',
      'data-disabled': dataAttr(disabled),
      'hidden': !open || undefined,
    }),

    // 标签文字所在的块，横向空间不够时由皮肤截断
    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
    }),

    getCloseTriggerProps: () => normalize.button({
      ...parts['close-trigger'].attrs,
      'type': 'button',
      'aria-label': prop('translations')?.close ?? 'Remove',
      // 单体控件用原生 disabled：不可聚焦、也不占 Tab 位
      'disabled': !canClose || undefined,
      'data-disabled': dataAttr(!canClose),
      // 不开放关闭时连按钮一起收起，不留一个按不动的叉；
      // 只是禁用（closable 仍为真）时按钮留在原地，标签的宽度不会因禁用而跳变
      'hidden': !closable || undefined,
      'onClick': () => {
        // 作者把这份 props 摊到非按钮节点上时原生 disabled 不生效，守卫得自己带
        if (!canClose)
          return
        send({ type: 'CLOSE' })
      },
    }),
  }
}
