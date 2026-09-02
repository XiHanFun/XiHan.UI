import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { TagApi, TagSchema } from './tag.types'
import { dataAttr } from '@xihan-ui/kernel'
import { tagAnatomy } from './tag.anatomy'

const parts = tagAnatomy.build()

/** 标签的 props：机器路从 service 读，快路直接收一份。 */
type TagProps = TagSchema['props']

/** 展开态住在哪儿：机器路读状态、快路读一个本地格子。 */
interface TagOpenPort {
  get: () => boolean
  set: (open: boolean) => void
}

function buildTagApi<T extends PropTypes>(
  prop: <K extends keyof TagProps>(key: K) => TagProps[K],
  port: TagOpenPort,
  normalize: NormalizeProps<T>,
): TagApi<T> {
  const open = port.get()
  // 标签默认不给关闭钮：多数标签只是身份标记，摘不摘得掉由作者说了算
  const closable = prop('closable') ?? false
  const disabled = !!prop('disabled')
  // 禁用的标签摘不掉：关闭钮仍在位置上，但按不动
  const canClose = closable && !disabled

  const setOpen = (next: boolean): void => {
    if (next !== open)
      port.set(next)
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
      // 摘掉一枚标签这个动作在 select 与 tags-input 里念的是 Delete，三处用同一个词
      'aria-label': prop('translations')?.close ?? 'Delete',
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
        port.set(false)
      },
    }),
  }
}

export function connectTag<T extends PropTypes>(
  service: Service<TagSchema>,
  normalize: NormalizeProps<T>,
): TagApi<T> {
  const { state, prop, send } = service
  return buildTagApi(
    prop as never,
    {
      get: () => state.get() === 'open',
      set: next => send({ type: next ? 'OPEN' : 'CLOSE' }),
    },
    normalize,
  )
}

/**
 * 不建机器的连接层：给「这一枚标签不可能改状态」的场合用。
 *
 * 标签的事件只有 OPEN / CLOSE 两个，都从关闭钮或 setOpen 来。不给关闭钮时
 * 这两条路都走不到，状态恒等于 `open ?? defaultOpen ?? true`——一台机器
 * 在这里纯属开销，而表格一页几十行、每行几个状态药丸就是几百台。
 *
 * 受控（open 给定）时 `store` 只管发意图，展开态每次都从 prop 现读；
 * 非受控时 `store` 是宿主自己的一个格子。两种语义与机器路逐条一致。
 */
export function connectStaticTag<T extends PropTypes>(
  props: TagProps,
  store: TagOpenPort,
  normalize: NormalizeProps<T>,
): TagApi<T> {
  const controlled = props.open !== undefined
  return buildTagApi(
    (<K extends keyof TagProps>(key: K) => props[key]) as never,
    {
      get: store.get,
      set: (next) => {
        // 受控时不落内部值，只发意图——与机器路的 isOpenControlled 守卫同一条规矩
        if (!controlled)
          store.set(next)
        props.onOpenChange?.({ open: next })
      },
    },
    normalize,
  )
}
